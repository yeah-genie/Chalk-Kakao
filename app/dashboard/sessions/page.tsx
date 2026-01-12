import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getSessions, getStudents } from "@/lib/actions/crud";
import Sidebar from "@/components/layout/Sidebar";
import { SessionList } from "./session-list";

// ===================================
// SESSIONS PAGE (Server Component)
// ===================================

export default async function SessionsPage() {
    let user = null;
    try {
        const supabase = await createServerSupabaseClient();
        const { data } = await supabase.auth.getUser();
        user = data.user;
    } catch (e) {
        console.error("[SessionsPage] Error fetching user:", e);
    }

    if (!user) {
        redirect("/login");
    }

    // Fetch data
    const sessions = await getSessions();
    const students = await getStudents();

    return (
        <div className="min-h-screen bg-[#09090b] text-white">
            <Sidebar />

            {/* Main Content */}
            <main className="md:ml-20 lg:ml-64 p-4 md:p-6 lg:p-8 pb-24 md:pb-10">
                <SessionList initialSessions={sessions} students={students} tutorId={user.id} />
            </main>
        </div>
    );
}
