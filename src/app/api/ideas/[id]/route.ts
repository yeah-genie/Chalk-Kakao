import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// PATCH /api/ideas/[id] - 아이디어 수정
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const body = await request.json();

    const { title, description, status, priority, tags, assigned_to, kill_reason } = body;

    const updateData: Record<string, unknown> = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (status !== undefined) updateData.status = status;
    if (priority !== undefined) updateData.priority = priority;
    if (tags !== undefined) updateData.tags = tags;
    if (assigned_to !== undefined) updateData.assigned_to = assigned_to;
    if (kill_reason !== undefined) updateData.kill_reason = kill_reason;
    updateData.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from("ideas")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ idea: data }, { status: 200 });
  } catch (error) {
    console.error("Update idea error:", error);
    return NextResponse.json(
      { error: "Failed to update idea" },
      { status: 500 }
    );
  }
}

// DELETE /api/ideas/[id] - 아이디어 삭제
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    const { error } = await supabase.from("ideas").delete().eq("id", id);

    if (error) throw error;

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Delete idea error:", error);
    return NextResponse.json(
      { error: "Failed to delete idea" },
      { status: 500 }
    );
  }
}

