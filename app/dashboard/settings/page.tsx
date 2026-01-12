import React from 'react';
import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from "@/lib/supabase/server";
import Sidebar from "@/components/layout/Sidebar";
import { LogoutButton } from "@/components/auth/LogoutButton";

export default async function SettingsPage() {
    let user = null;
    try {
        const supabase = await createServerSupabaseClient();
        const { data } = await supabase.auth.getUser();
        user = data.user;
    } catch (e) {
        console.error("[SettingsPage] Error fetching user:", e);
    }

    if (!user) {
        redirect("/login");
    }

    return (
        <div className="min-h-screen bg-[#09090b] text-white">
            <Sidebar />

            <main className="md:ml-20 lg:ml-64 p-4 md:p-6 lg:p-8 pb-24 md:pb-10">
                <div className="max-w-4xl mx-auto">
                    <header className="mb-6 md:mb-8">
                        <h1 className="text-2xl md:text-3xl font-bold">Settings</h1>
                        <p className="text-[#71717a] mt-1 md:mt-2 text-sm">Manage your account and preferences.</p>
                    </header>

                    <div className="grid gap-6">
                        {/* Profile Section */}
                        <section className="p-6 rounded-2xl bg-[#18181b] border border-[#27272a]">
                            <h2 className="text-xl font-semibold mb-4">Profile</h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-[#71717a] mb-1.5">Display Name</label>
                                    <div className="px-4 py-2.5 bg-[#09090b] border border-[#27272a] rounded-xl text-white">
                                        {user.user_metadata?.full_name || user.email?.split('@')[0] || 'Tutor'}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-[#71717a] mb-1.5">Email Address</label>
                                    <div className="px-4 py-2.5 bg-[#09090b] border border-[#27272a] rounded-xl text-white">
                                        {user.email || 'Not available'}
                                    </div>
                                </div>
                                <div className="pt-4 border-t border-[#27272a]">
                                    <label className="block text-sm font-medium text-[#71717a] mb-3">Account Actions</label>
                                    <LogoutButton />
                                </div>
                            </div>
                        </section>

                        {/* Integration Section */}
                        <section className="p-6 rounded-2xl bg-[#18181b] border border-[#27272a]">
                            <h2 className="text-xl font-semibold mb-4">Integrations</h2>
                            <div className="space-y-4">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-[#09090b] rounded-xl border border-[#27272a]">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center flex-shrink-0">
                                            <svg className="w-5 h-5 text-[#71717a]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                        <div className="min-w-0">
                                            <p className="font-medium text-sm">Google Calendar</p>
                                            <p className="text-xs text-[#71717a] truncate">Sync sessions automatically</p>
                                        </div>
                                    </div>
                                    <span className="px-3 py-1.5 bg-[#27272a] rounded-lg text-xs font-medium text-[#71717a] w-fit flex-shrink-0">
                                        Coming Soon
                                    </span>
                                </div>

                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-[#09090b] rounded-xl border border-[#27272a]">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center flex-shrink-0">
                                            <svg className="w-5 h-5 text-[#71717a]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                                            </svg>
                                        </div>
                                        <div className="min-w-0">
                                            <p className="font-medium text-sm">Speech-to-Text</p>
                                            <p className="text-xs text-[#71717a] truncate">Auto-transcribe recordings</p>
                                        </div>
                                    </div>
                                    <span className="px-3 py-1.5 bg-[#27272a] rounded-lg text-xs font-medium text-[#71717a] w-fit flex-shrink-0">
                                        Coming Soon
                                    </span>
                                </div>
                            </div>
                        </section>

                        {/* Danger Zone */}
                        <section className="p-6 rounded-2xl bg-[#18181b] border border-red-900/30">
                            <h2 className="text-xl font-semibold mb-4 text-red-400">Danger Zone</h2>
                            <p className="text-sm text-[#71717a] mb-4">
                                These actions are irreversible. Please proceed with caution.
                            </p>
                            <button
                                disabled
                                className="px-4 py-2 bg-red-900/20 border border-red-900/50 rounded-lg text-sm text-red-400 opacity-50 cursor-not-allowed"
                            >
                                Delete Account (Coming Soon)
                            </button>
                        </section>
                    </div>
                </div>
            </main>
        </div>
    );
}
