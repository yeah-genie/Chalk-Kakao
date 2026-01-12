import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getMyClasses, getMyJoinedClasses } from "@/lib/actions/classes";
import Sidebar from "@/components/layout/Sidebar";
import { ClassesClient } from "./ClassesClient";

export default async function ClassesPage() {
    let user = null;
    try {
        const supabase = await createServerSupabaseClient();
        const { data } = await supabase.auth.getUser();
        user = data.user;
    } catch (e) {
        console.error("[Classes] Error fetching user:", e);
    }

    if (!user) {
        redirect("/login");
    }

    const [myClasses, joinedClasses] = await Promise.all([
        getMyClasses(),
        getMyJoinedClasses(),
    ]);

    return (
        <div className="min-h-screen bg-[#09090b] text-white">
            <Sidebar />

            <main className="ml-64 p-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-bold">Classes</h1>
                        <p className="text-[#71717a] text-sm">Manage your classes and join others</p>
                    </div>
                </div>

                <ClassesClient myClasses={myClasses} joinedClasses={joinedClasses} />
            </main>
        </div>
    );
}
