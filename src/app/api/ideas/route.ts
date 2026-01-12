import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/ideas - 아이디어 목록 조회
export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const teamId = searchParams.get("teamId");

    if (!teamId) {
      return NextResponse.json(
        { error: "Team ID is required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("ideas")
      .select(`
        *,
        created_by_profile:profiles!ideas_created_by_fkey(email, full_name, avatar_url),
        assigned_to_profile:profiles!ideas_assigned_to_fkey(email, full_name, avatar_url),
        evaluations(id, market_fit, effort, team_fit, user_id)
      `)
      .eq("team_id", teamId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    // Calculate average scores
    const ideasWithScores = data?.map((idea) => {
      const evals = idea.evaluations || [];
      if (evals.length === 0) return { ...idea, avgScore: null };

      const totalScore = evals.reduce((sum: number, e: { market_fit?: number; effort?: number; team_fit?: number }) => {
        const marketFit = e.market_fit || 0;
        const effort = e.effort || 0;
        const teamFit = e.team_fit || 0;
        // Higher market fit + lower effort + higher team fit = better score
        return sum + ((marketFit + (11 - effort) + teamFit) / 3);
      }, 0);

      return {
        ...idea,
        avgScore: Math.round((totalScore / evals.length) * 10),
      };
    });

    return NextResponse.json({ ideas: ideasWithScores }, { status: 200 });
  } catch (error) {
    console.error("Get ideas error:", error);
    return NextResponse.json(
      { error: "Failed to fetch ideas" },
      { status: 500 }
    );
  }
}

// POST /api/ideas - 새 아이디어 생성
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const body = await request.json();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { title, description, teamId, tags, priority } = body;

    if (!title || !teamId) {
      return NextResponse.json(
        { error: "Title and team ID are required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("ideas")
      .insert({
        title,
        description,
        team_id: teamId,
        created_by: user.id,
        tags: tags || [],
        priority: priority || "medium",
        status: "inbox",
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ idea: data }, { status: 201 });
  } catch (error) {
    console.error("Create idea error:", error);
    return NextResponse.json(
      { error: "Failed to create idea" },
      { status: 500 }
    );
  }
}

