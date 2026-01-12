import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getStudents, getSubjects } from "@/lib/actions/crud";
import { AP_SUBJECTS } from "@/lib/knowledge-graph";
import Sidebar from "@/components/layout/Sidebar";
import { StudentList } from "./student-list";

// ===================================
// STUDENTS PAGE (Server Component)
// ===================================

export default async function StudentsPage() {
    let user = null;
    try {
        const supabase = await createServerSupabaseClient();
        const { data } = await supabase.auth.getUser();
        user = data.user;
    } catch (e) {
        console.error("[StudentsPage] Error fetching user:", e);
    }

    if (!user) {
        redirect("/login");
    }

    // Fetch data
    const [students, dbSubjects] = await Promise.all([
        getStudents(),
        getSubjects()
    ]);

    // Use AP_SUBJECTS as fallback if no subjects in DB
    const subjects = dbSubjects.length > 0
        ? dbSubjects
        : AP_SUBJECTS.map(s => ({ id: s.id, name: s.name }));

    return (
        <div className="min-h-screen bg-[#09090b] text-white">
            <Sidebar />

            {/* Main Content (Client Component below handles interactivity) */}
            <main className="md:ml-20 lg:ml-64 p-4 md:p-6 lg:p-8 pb-24 md:pb-10">
                <StudentList initialStudents={students} subjects={subjects} />
            </main>
        </div>
    );
}

