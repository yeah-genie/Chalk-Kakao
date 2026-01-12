import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { searchTextbooks, getPopularTextbooks, getTextbookFilters } from "@/lib/actions/textbooks";
import { getPopularCurricula, getVerifiedCurricula } from "@/lib/actions/curricula";
import { getPopularTeachers } from "@/lib/actions/teachers";
import Sidebar from "@/components/layout/Sidebar";
import { ExploreClient } from "./ExploreClient";
import { BadgeCheck, BookOpen, Users, Flame } from "lucide-react";

export default async function ExplorePage({
    searchParams,
}: {
    searchParams: Promise<{ q?: string; tab?: string; subject?: string; publisher?: string; grade?: string }>;
}) {
    const params = await searchParams;
    let user = null;
    try {
        const supabase = await createServerSupabaseClient();
        const { data } = await supabase.auth.getUser();
        user = data.user;
    } catch (e) {
        console.error("[Explore] Error fetching user:", e);
    }

    if (!user) {
        redirect("/login");
    }

    // Fetch data based on current tab/search
    const [
        textbooks,
        popularTextbooks,
        filters,
        popularCurricula,
        verifiedCurricula,
        popularTeachers,
    ] = await Promise.all([
        params.q ? searchTextbooks({ search: params.q, subject: params.subject, publisher: params.publisher, grade: params.grade, limit: 20 }) : [],
        getPopularTextbooks(6),
        getTextbookFilters(),
        getPopularCurricula(6),
        getVerifiedCurricula(6),
        getPopularTeachers(6),
    ]);

    return (
        <div className="min-h-screen bg-[#09090b] text-white">
            <Sidebar />

            <main className="ml-64 p-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-2xl font-bold">Explore</h1>
                    <p className="text-[#71717a] text-sm">Discover textbooks, curricula, and teachers</p>
                </div>

                <Suspense fallback={<div className="animate-pulse h-12 bg-[#18181b] rounded-xl" />}>
                    <ExploreClient
                        initialTextbooks={textbooks}
                        popularTextbooks={popularTextbooks}
                        filters={filters}
                        popularCurricula={popularCurricula}
                        verifiedCurricula={verifiedCurricula}
                        popularTeachers={popularTeachers}
                        searchParams={params}
                    />
                </Suspense>
            </main>
        </div>
    );
}
