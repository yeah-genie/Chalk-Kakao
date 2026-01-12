"use client";

import { useState } from "react";
import { AP_SUBJECTS } from "@/lib/knowledge-graph";

// ===================================
// ADD STUDENT MODAL COMPONENT
// ===================================

interface AddStudentModalProps {
    isOpen: boolean;
    subjects: { id: string; name: string }[];
    onClose: () => void;
    onSubmit: (data: {
        name: string;
        subject_id: string;
        custom_subject_name?: string;
        parent_email?: string;
        notes?: string;
    }) => void;
}

export function AddStudentModal({ isOpen, subjects, onClose, onSubmit }: AddStudentModalProps) {
    const [name, setName] = useState("");
    const [subjectId, setSubjectId] = useState(subjects[0]?.id || "");
    const [isCustomSubject, setIsCustomSubject] = useState(false);
    const [customSubjectName, setCustomSubjectName] = useState("");
    const [parentEmail, setParentEmail] = useState("");
    const [notes, setNotes] = useState("");
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;
        if (isCustomSubject && !customSubjectName.trim()) return;

        setLoading(true);
        try {
            const res: any = await onSubmit({
                name: name.trim(),
                subject_id: isCustomSubject ? "custom" : subjectId,
                custom_subject_name: isCustomSubject ? customSubjectName.trim() : undefined,
                parent_email: parentEmail.trim() || undefined,
                notes: notes.trim() || undefined,
            });

            // Handle server action result if provided
            if (res && !res.success) {
                alert(res.error || "Failed to add student.");
                setLoading(false);
                return;
            }

            // Reset form
            setName("");
            setSubjectId(subjects[0]?.id || "");
            setIsCustomSubject(false);
            setCustomSubjectName("");
            setParentEmail("");
            setNotes("");
            onClose();
        } catch (err: any) {
            console.error("Submission error:", err);
            alert(err.message || "Failed to add student. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-[#18181b] border border-[#27272a] rounded-2xl w-full max-w-lg p-8 shadow-2xl animate-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-black text-white tracking-tight">Add Student</h2>
                    <button onClick={onClose} className="text-white/20 hover:text-white transition-colors">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Name */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-[#10b981] uppercase tracking-[0.2em] ml-1">
                            Student Identity
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Alex Kim"
                            className="w-full px-5 py-4 bg-white/5 border border-white/5 rounded-2xl text-white placeholder:text-white/20 focus:border-[#10b981]/50 focus:bg-white/10 focus:outline-none transition-all"
                            required
                        />
                    </div>

                    {/* Subject Selection */}
                    <div className="space-y-3">
                        <div className="flex justify-between items-center ml-1">
                            <label className="text-[10px] font-black text-[#10b981] uppercase tracking-[0.2em]">
                                Curriculum Board
                            </label>
                            <button
                                type="button"
                                onClick={() => setIsCustomSubject(!isCustomSubject)}
                                className={`text-[10px] font-black tracking-widest uppercase transition-all flex items-center gap-1.5 ${isCustomSubject ? "text-[#10b981]" : "text-white/40 hover:text-white"
                                    }`}
                            >
                                {isCustomSubject && (
                                    <span className="w-1.5 h-1.5 bg-[#10b981] rounded-full animate-pulse" />
                                )}
                                {isCustomSubject ? "← Use Template" : "+ New Subject"}
                            </button>
                        </div>

                        <div className="relative">
                            {isCustomSubject ? (
                                <div key="custom-input" className="animate-in fade-in slide-in-from-top-1 duration-200">
                                    <input
                                        type="text"
                                        value={customSubjectName}
                                        onChange={(e) => setCustomSubjectName(e.target.value)}
                                        placeholder="e.g. IB Physics HL, SAT Math 2025"
                                        className="w-full px-5 py-4 bg-[#10b981]/5 border border-[#10b981]/20 rounded-2xl text-white placeholder:text-[#10b981]/20 focus:border-[#10b981]/50 focus:outline-none transition-all shadow-[0_0_20px_rgba(16,185,129,0.05)]"
                                        autoFocus
                                        required
                                    />
                                    <p className="text-[10px] text-[#10b981]/60 font-medium italic mt-2 ml-1">
                                        AI will build the knowledge graph based on your first sessions.
                                    </p>
                                </div>
                            ) : (
                                <div key="select-input" className="relative group animate-in fade-in slide-in-from-top-1 duration-200">
                                    <select
                                        value={subjectId}
                                        onChange={(e) => setSubjectId(e.target.value)}
                                        className="w-full px-5 py-4 bg-white/5 border border-white/5 rounded-2xl text-white focus:border-[#10b981]/50 focus:bg-white/10 focus:outline-none transition-all appearance-none cursor-pointer"
                                        required
                                    >
                                        {subjects.length > 0 ? (
                                            subjects.map((subject) => (
                                                <option key={subject.id} value={subject.id} className="bg-[#18181b]">
                                                    {subject.name}
                                                </option>
                                            ))
                                        ) : (
                                            <option value="" disabled>No subjects available</option>
                                        )}
                                    </select>
                                    <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-white/20 group-hover:text-white/40 transition-colors">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Parent Intel */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-[#10b981] uppercase tracking-[0.2em] ml-1">
                            Communication (Optional)
                        </label>
                        <input
                            type="email"
                            value={parentEmail}
                            onChange={(e) => setParentEmail(e.target.value)}
                            placeholder="parent@email.com"
                            className="w-full px-5 py-4 bg-white/5 border border-white/5 rounded-2xl text-white placeholder:text-white/20 focus:border-[#10b981]/50 focus:bg-white/10 focus:outline-none transition-all"
                        />
                    </div>

                    <div className="flex gap-4 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-6 py-4 bg-white/5 text-white/60 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white/10 hover:text-white transition-all border border-white/5"
                        >
                            Back
                        </button>
                        <button
                            type="submit"
                            disabled={loading || !name.trim()}
                            className="flex-1 px-6 py-4 bg-[#10b981] text-[#050510] rounded-2xl font-black text-xs uppercase tracking-widest hover:opacity-90 disabled:opacity-50 transition-all shadow-[0_8px_24px_rgba(16,185,129,0.2)]"
                        >
                            {loading ? "Initializing..." : "Register Student"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ===================================
// ADD SESSION MODAL COMPONENT
// ===================================

interface AddSessionModalProps {
    isOpen: boolean;
    onClose: () => void;
    studentId?: string;
    students: { id: string; name: string; subject_id: string }[];
    onSubmit: (data: {
        student_id: string;
        subject_id: string;
        scheduled_at: string;
        duration_minutes?: number;
        notes?: string;
    }) => void;
}

export function AddSessionModal({ isOpen, onClose, studentId, students, onSubmit }: AddSessionModalProps) {
    const [selectedStudentId, setSelectedStudentId] = useState(studentId || students[0]?.id || "");
    const [scheduledAt, setScheduledAt] = useState("");
    const [duration, setDuration] = useState("60");
    const [notes, setNotes] = useState("");
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const selectedStudent = students.find(s => s.id === selectedStudentId);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedStudentId || !scheduledAt) return;

        setLoading(true);
        try {
            await onSubmit({
                student_id: selectedStudentId,
                subject_id: selectedStudent?.subject_id || "",
                scheduled_at: new Date(scheduledAt).toISOString(),
                duration_minutes: parseInt(duration) || undefined,
                notes: notes.trim() || undefined,
            });
            onClose();
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-[#18181b] border border-[#27272a] rounded-2xl w-full max-w-md p-6 shadow-xl">
                <h2 className="text-xl font-semibold mb-6">Schedule New Session</h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Student */}
                    <div>
                        <label className="block text-sm text-[#a1a1aa] mb-1.5">
                            Student *
                        </label>
                        <select
                            value={selectedStudentId}
                            onChange={(e) => setSelectedStudentId(e.target.value)}
                            className="w-full px-4 py-2.5 bg-[#0f0f12] border border-[#27272a] rounded-lg text-white focus:border-[#10b981] focus:outline-none transition"
                        >
                            {students.map((student) => (
                                <option key={student.id} value={student.id}>
                                    {student.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Date/Time */}
                    <div>
                        <label className="block text-sm text-[#a1a1aa] mb-1.5">
                            Date & Time *
                        </label>
                        <input
                            type="datetime-local"
                            value={scheduledAt}
                            onChange={(e) => setScheduledAt(e.target.value)}
                            className="w-full px-4 py-2.5 bg-[#0f0f12] border border-[#27272a] rounded-lg text-white focus:border-[#10b981] focus:outline-none transition"
                            required
                        />
                    </div>

                    {/* Duration */}
                    <div>
                        <label className="block text-sm text-[#a1a1aa] mb-1.5">
                            Duration (minutes)
                        </label>
                        <select
                            value={duration}
                            onChange={(e) => setDuration(e.target.value)}
                            className="w-full px-4 py-2.5 bg-[#0f0f12] border border-[#27272a] rounded-lg text-white focus:border-[#10b981] focus:outline-none transition"
                        >
                            <option value="30">30 min</option>
                            <option value="45">45 min</option>
                            <option value="60">60 min</option>
                            <option value="90">90 min</option>
                            <option value="120">120 min</option>
                        </select>
                    </div>

                    {/* Notes */}
                    <div>
                        <label className="block text-sm text-[#a1a1aa] mb-1.5">
                            Notes (optional)
                        </label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Topics to cover, homework review, etc."
                            rows={2}
                            className="w-full px-4 py-2.5 bg-[#0f0f12] border border-[#27272a] rounded-lg text-white placeholder:text-[#52525b] focus:border-[#10b981] focus:outline-none transition resize-none"
                        />
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2.5 bg-[#27272a] text-white rounded-lg font-medium hover:bg-[#3f3f46] transition"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading || !selectedStudentId || !scheduledAt}
                            className="flex-1 px-4 py-2.5 bg-[#10b981] text-black rounded-lg font-medium hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? "Scheduling..." : "Schedule"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
