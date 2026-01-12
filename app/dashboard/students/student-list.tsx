"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AP_SUBJECTS } from "@/lib/knowledge-graph";
import { AddStudentModal } from "@/components/modals";
import { registerStudentWithSubject, deleteStudent } from "@/lib/actions/crud";
import type { Student } from "@/lib/types/database";

interface StudentListProps {
    initialStudents: Student[];
    subjects: { id: string; name: string }[];
}

export function StudentList({ initialStudents, subjects }: StudentListProps) {
    const router = useRouter();
    const [students, setStudents] = useState(initialStudents);
    const [showAddModal, setShowAddModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    const getSubjectName = (subjectId: string): string => {
        return subjects.find(s => s.id === subjectId)?.name ||
            AP_SUBJECTS.find(s => s.id === subjectId)?.name ||
            subjectId;
    }

    const filteredStudents = students.filter(s =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase())
    );


    const handleAddStudent = async (data: any) => {
        const result = await registerStudentWithSubject(data);

        if (result.success && result.data) {
            setStudents([result.data, ...students]);
            router.refresh();
        }
        return result;
    };

    const handleDelete = async (id: string, name: string) => {
        if (confirm(`Are you sure you want to delete ${name}?`)) {
            const success = await deleteStudent(id);
            if (success) {
                setStudents(students.filter(s => s.id !== id));
            }
        }
    };

    return (
        <>
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 md:mb-8 gap-4">
                <div>
                    <h1 className="text-xl md:text-2xl font-bold">Students</h1>
                    <p className="text-[#71717a] text-xs md:text-sm">Manage students and track progress</p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="px-4 py-3 md:py-2.5 bg-[#10b981] text-black rounded-xl md:rounded-lg font-bold text-sm hover:opacity-90 transition flex items-center justify-center gap-2 w-full sm:w-auto"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add Student
                </button>
            </div>

            {/* Search */}
            <div className="mb-6">
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search students..."
                    className="w-full px-4 py-3 md:py-2.5 bg-white/[0.02] md:bg-[#18181b] border border-white/[0.05] md:border-[#27272a] rounded-xl md:rounded-lg text-white text-sm placeholder:text-[#52525b] focus:border-[#10b981] focus:outline-none transition"
                />
            </div>

            {/* Students Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                {filteredStudents.map((student) => (
                    <div
                        key={student.id}
                        className="p-4 md:p-5 rounded-2xl md:rounded-xl bg-white/[0.02] md:bg-[#18181b] border border-white/[0.05] md:border-[#27272a] hover:border-[#10b981]/30 transition"
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 md:w-12 md:h-12 bg-[#27272a] rounded-full flex items-center justify-center">
                                    <span className="text-sm md:text-lg font-medium">{student.name[0]}</span>
                                </div>
                                <div>
                                    <h3 className="font-bold text-sm md:text-base">{student.name}</h3>
                                    <p className="text-xs md:text-sm text-[#71717a]">{getSubjectName(student.subject_id)}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => handleDelete(student.id, student.name)}
                                className="p-2 text-[#71717a] hover:text-[#ef4444] transition active:scale-95"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            </button>
                        </div>

                        <div className="grid grid-cols-2 gap-3 md:gap-4 mb-4">
                            <div className="p-3 bg-white/[0.02] md:bg-[#27272a]/50 rounded-xl">
                                <p className="text-[10px] text-[#71717a] mb-1 font-bold uppercase tracking-widest">Mastery</p>
                                <p className={`text-lg md:text-xl font-black ${getScoreColor(0)}`}>
                                    0%
                                </p>
                            </div>
                            <div className="p-3 bg-white/[0.02] md:bg-[#27272a]/50 rounded-xl">
                                <p className="text-[10px] text-[#71717a] mb-1 font-bold uppercase tracking-widest">Sessions</p>
                                <p className="text-lg md:text-xl font-black">—</p>
                            </div>
                        </div>

                        <Link
                            href={`/dashboard/students/${student.id}`}
                            className="block w-full text-center py-3 md:py-2 bg-[#10b981]/10 hover:bg-[#10b981]/20 border border-[#10b981]/20 text-[#10b981] rounded-xl md:rounded-lg text-xs md:text-sm font-bold uppercase tracking-widest transition active:scale-[0.98]"
                        >
                            View Details
                        </Link>
                    </div>
                ))}

                {filteredStudents.length === 0 && (
                    <div className="col-span-full text-center py-12 text-[#71717a] text-sm">
                        {searchQuery ? "No students found" : "No students yet. Add your first student!"}
                    </div>
                )}
            </div>



            {/* Add Student Modal */}
            <AddStudentModal
                isOpen={showAddModal}
                subjects={subjects}
                onClose={() => setShowAddModal(false)}
                onSubmit={handleAddStudent}
            />
        </>
    );
}

function getScoreColor(score: number): string {
    if (score >= 80) return "text-[#22c55e]";
    if (score >= 60) return "text-[#10b981]";
    if (score >= 40) return "text-[#f59e0b]";
    if (score >= 20) return "text-[#ef4444]";
    return "text-[#71717a]";
}
