import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getMyTeacherProfile } from "@/lib/actions/teachers";
import Sidebar from "@/components/layout/Sidebar";
import { ProfileClient } from "./ProfileClient";

export default async function ProfilePage() {
    let user = null;
    try {
        const supabase = await createServerSupabaseClient();
        const { data } = await supabase.auth.getUser();
        user = data.user;
    } catch (e) {
        console.error("[Profile] Error fetching user:", e);
    }

    if (!user) {
        redirect("/login");
    }

    const teacherProfile = await getMyTeacherProfile();

    return (
        <div className="min-h-screen bg-[#09090b] text-white">
            <Sidebar />

            <main className="ml-64 p-8">
                <div className="max-w-3xl mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-2xl font-bold">Teacher Profile</h1>
                        <p className="text-[#71717a] text-sm">Set up your public profile to share curricula and connect with students</p>
                    </div>

                    <ProfileClient
                        userId={user.id}
                        userEmail={user.email || ""}
                        userName={user.user_metadata?.full_name || user.email?.split("@")[0] || "Teacher"}
                        teacherProfile={teacherProfile}
                    />
                </div>
            </main>
        </div>
    );
}
