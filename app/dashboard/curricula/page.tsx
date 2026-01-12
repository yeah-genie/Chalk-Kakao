import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getMyCurricula } from "@/lib/actions/curricula";
import Sidebar from "@/components/layout/Sidebar";
import { CurriculaClient } from "./CurriculaClient";

export default async function CurriculaPage() {
    let user = null;
    try {
        const supabase = await createServerSupabaseClient();
        const { data } = await supabase.auth.getUser();
        user = data.user;
    } catch (e) {
        console.error("[Curricula] Error fetching user:", e);
    }

    if (!user) {
        redirect("/login");
    }

    const curricula = await getMyCurricula();

    return (
        <div className="min-h-screen bg-[#09090b] text-white">
            <Sidebar />

            <main className="ml-64 p-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-bold">My Curricula</h1>
                        <p className="text-[#71717a] text-sm">Create and manage your learning curricula</p>
                    </div>
                </div>

                <CurriculaClient curricula={curricula} />
            </main>
        </div>
    );
}
