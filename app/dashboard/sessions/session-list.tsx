"use client";

import React, { useState } from "react";
import Link from "next/link";
import { AddSessionModal } from "@/components/modals";
import { createSession } from "@/lib/actions/crud";
import type { Session, Student } from "@/lib/types/database";

interface SessionListProps {
    initialSessions: Session[];
    students: Student[];
    tutorId: string;
}

function formatDate(isoString: string): string {
    const date = new Date(isoString);
    return date.toLocaleDateString("en-US", {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
    });
}

function getStatusBadge(status: string): React.ReactNode {
    switch (status) {
        case "scheduled":
            return <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-[#18181b] text-[#71717a] border border-[#27272a]">Scheduled</span>;
        case "in_progress":
            return <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-[#1e3a8a] text-[#60a5fa] animate-pulse">In Progress</span>;
        case "completed":
            return <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-[#064e3b] text-[#10b981]">Completed</span>;
        case "cancelled":
            return <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-[#7f1d1d] text-[#ef4444]">Cancelled</span>;
        default:
            return <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-[#27272a] text-[#a1a1aa]">{status}</span>;
    }
}

export function SessionList({ initialSessions, students, tutorId }: SessionListProps) {
    const [sessions, setSessions] = useState(initialSessions);
    const [showAddModal, setShowAddModal] = useState(false);
    const [filter, setFilter] = useState("all");

    const filteredSessions = sessions.filter(s =>
        filter === "all" ? true : s.status === filter
    );

    const handleAddSession = async (data: { student_id: string; subject_id: string; scheduled_at: string; duration_minutes?: number; notes?: string }) => {
        const result = await createSession({
            student_id: data.student_id,
            subject_id: data.subject_id,
            scheduled_at: data.scheduled_at,
            duration_minutes: data.duration_minutes,
            status: "scheduled",
            tutor_id: tutorId,
            notes: data.notes
        });

        if (result) {
            setSessions([result, ...sessions]);
        }
    };

    const getStudentName = (id: string) => {
        return students.find(s => s.id === id)?.name || "Unknown Student";
    };

    return (
        <>
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold">Sessions</h1>
                    <p className="text-[#71717a] text-sm">Schedule and monitor your tutoring sessions</p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="px-4 py-2.5 bg-[#10b981] text-black rounded-lg font-medium text-sm hover:opacity-90 transition flex items-center gap-2"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    New Session
                </button>
            </div>

            {/* Filters */}
            <div className="flex gap-2 mb-6">
                {["all", "scheduled", "in_progress", "completed"].map((f) => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-4 py-1.5 rounded-full text-xs font-medium transition ${filter === f ? "bg-[#10b981] text-black" : "bg-[#18181b] text-[#71717a] hover:text-white"
                            }`}
                    >
                        {f.charAt(0).toUpperCase() + f.slice(1).replace("_", " ")}
                    </button>
                ))}
            </div>

            {/* Sessions Table */}
            <div className="rounded-xl bg-[#18181b] border border-[#27272a] overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-[#1c1c21] border-b border-[#27272a]">
                        <tr>
                            <th className="px-6 py-4 text-xs font-semibold text-[#71717a] uppercase tracking-wider">Student</th>
                            <th className="px-6 py-4 text-xs font-semibold text-[#71717a] uppercase tracking-wider">Date & Time</th>
                            <th className="px-6 py-4 text-xs font-semibold text-[#71717a] uppercase tracking-wider">Status</th>
                            <th className="px-6 py-4 text-xs font-semibold text-[#71717a] uppercase tracking-wider">Duration</th>
                            <th className="px-6 py-4 text-xs font-semibold text-[#71717a] uppercase tracking-wider"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#27272a]">
                        {filteredSessions.map((session) => (
                            <tr key={session.id} className="hover:bg-[#1f1f23] transition">
                                <td className="px-6 py-4">
                                    <p className="font-medium">{getStudentName(session.student_id)}</p>
                                    <p className="text-xs text-[#71717a]">{session.subject_id}</p>
                                </td>
                                <td className="px-6 py-4">
                                    <p className="text-sm">{formatDate(session.scheduled_at)}</p>
                                </td>
                                <td className="px-6 py-4">
                                    {getStatusBadge(session.status)}
                                </td>
                                <td className="px-6 py-4 text-sm text-[#71717a]">
                                    {session.duration_minutes} min
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <Link
                                        href={`/dashboard/sessions/${session.id}`}
                                        className="text-sm text-[#10b981] hover:underline"
                                    >
                                        View
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {filteredSessions.length === 0 && (
                    <div className="p-12 text-center text-[#71717a]">
                        No sessions found for this filter.
                    </div>
                )}
            </div>

            <AddSessionModal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                onSubmit={handleAddSession}
                students={students}
            />
        </>
    );
}
