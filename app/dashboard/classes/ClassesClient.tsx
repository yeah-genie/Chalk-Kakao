"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    Plus,
    GraduationCap,
    Users,
    Copy,
    Check,
    RefreshCw,
    Trash2,
    Settings,
    LogIn,
    BookOpen,
} from "lucide-react";
import { createClass, deleteClass, joinClass, regenerateClassCode } from "@/lib/actions/classes";
import type { ClassWithMembers } from "@/lib/types/database";

interface ClassesClientProps {
    myClasses: ClassWithMembers[];
    joinedClasses: ClassWithMembers[];
}

export function ClassesClient({ myClasses, joinedClasses }: ClassesClientProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showJoinModal, setShowJoinModal] = useState(false);
    const [copiedCode, setCopiedCode] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<"teaching" | "enrolled">("teaching");

    const handleCopyCode = async (code: string) => {
        await navigator.clipboard.writeText(code);
        setCopiedCode(code);
        setTimeout(() => setCopiedCode(null), 2000);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this class?")) return;

        startTransition(async () => {
            await deleteClass(id);
            router.refresh();
        });
    };

    const handleRegenerateCode = async (classId: string) => {
        startTransition(async () => {
            await regenerateClassCode(classId);
            router.refresh();
        });
    };

    return (
        <div className="space-y-6">
            {/* Actions */}
            <div className="flex justify-between items-center">
                {/* Tabs */}
                <div className="flex gap-2">
                    <button
                        onClick={() => setActiveTab("teaching")}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                            activeTab === "teaching"
                                ? "bg-[#10b981]/10 text-[#10b981]"
                                : "text-[#71717a] hover:text-white hover:bg-[#18181b]"
                        }`}
                    >
                        Teaching ({myClasses.length})
                    </button>
                    <button
                        onClick={() => setActiveTab("enrolled")}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                            activeTab === "enrolled"
                                ? "bg-[#10b981]/10 text-[#10b981]"
                                : "text-[#71717a] hover:text-white hover:bg-[#18181b]"
                        }`}
                    >
                        Enrolled ({joinedClasses.length})
                    </button>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={() => setShowJoinModal(true)}
                        className="px-4 py-2.5 border border-[#27272a] rounded-lg font-medium text-sm hover:bg-[#18181b] transition flex items-center gap-2"
                    >
                        <LogIn size={18} />
                        Join Class
                    </button>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="px-4 py-2.5 bg-[#10b981] text-black rounded-lg font-medium text-sm hover:opacity-90 transition flex items-center gap-2"
                    >
                        <Plus size={18} />
                        Create Class
                    </button>
                </div>
            </div>

            {/* Teaching Classes */}
            {activeTab === "teaching" && (
                <>
                    {myClasses.length > 0 ? (
                        <div className="grid grid-cols-2 gap-4">
                            {myClasses.map((classItem) => (
                                <div
                                    key={classItem.id}
                                    className="p-5 bg-[#18181b] border border-[#27272a] rounded-xl hover:border-[#3f3f46] transition group"
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 bg-[#10b981]/10 rounded-xl flex items-center justify-center">
                                                <GraduationCap size={24} className="text-[#10b981]" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold">{classItem.name}</h3>
                                                <p className="text-xs text-[#71717a]">{classItem.subject_id}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition">
                                            <Link
                                                href={`/dashboard/classes/${classItem.id}`}
                                                className="p-1.5 rounded-lg hover:bg-[#27272a] transition"
                                            >
                                                <Settings size={16} className="text-[#71717a]" />
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(classItem.id)}
                                                className="p-1.5 rounded-lg hover:bg-[#27272a] transition"
                                            >
                                                <Trash2 size={16} className="text-red-400" />
                                            </button>
                                        </div>
                                    </div>

                                    {classItem.description && (
                                        <p className="text-sm text-[#71717a] mb-4 line-clamp-2">{classItem.description}</p>
                                    )}

                                    {/* Class Code */}
                                    <div className="p-3 bg-[#09090b] rounded-lg mb-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-[10px] text-[#52525b] uppercase tracking-widest mb-1">Class Code</p>
                                                <p className="font-mono text-lg font-bold tracking-widest">{classItem.class_code}</p>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <button
                                                    onClick={() => handleCopyCode(classItem.class_code)}
                                                    className="p-2 rounded-lg hover:bg-[#27272a] transition"
                                                    title="Copy code"
                                                >
                                                    {copiedCode === classItem.class_code ? (
                                                        <Check size={16} className="text-[#10b981]" />
                                                    ) : (
                                                        <Copy size={16} className="text-[#71717a]" />
                                                    )}
                                                </button>
                                                <button
                                                    onClick={() => handleRegenerateCode(classItem.id)}
                                                    className="p-2 rounded-lg hover:bg-[#27272a] transition"
                                                    title="Regenerate code"
                                                    disabled={isPending}
                                                >
                                                    <RefreshCw size={16} className={`text-[#71717a] ${isPending ? "animate-spin" : ""}`} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Stats */}
                                    <div className="flex items-center justify-between text-xs text-[#52525b]">
                                        <div className="flex items-center gap-4">
                                            <span className="flex items-center gap-1">
                                                <Users size={14} />
                                                {classItem.members?.filter(m => m.status === 'approved').length || 0} students
                                            </span>
                                            {classItem.curriculum && (
                                                <span className="flex items-center gap-1">
                                                    <BookOpen size={14} />
                                                    Curriculum linked
                                                </span>
                                            )}
                                        </div>
                                        <span className={classItem.is_active ? "text-[#10b981]" : "text-[#71717a]"}>
                                            {classItem.is_active ? "Active" : "Inactive"}
                                        </span>
                                    </div>

                                    {/* Pending Members */}
                                    {classItem.members && classItem.members.filter(m => m.status === 'pending').length > 0 && (
                                        <div className="mt-4 pt-4 border-t border-[#27272a]">
                                            <Link
                                                href={`/dashboard/classes/${classItem.id}?tab=pending`}
                                                className="text-xs text-[#f59e0b] hover:underline"
                                            >
                                                {classItem.members.filter(m => m.status === 'pending').length} pending join requests
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 bg-[#18181b] border border-[#27272a] rounded-xl">
                            <GraduationCap size={48} className="mx-auto text-[#3f3f46] mb-4" />
                            <h3 className="text-lg font-medium mb-2">No classes yet</h3>
                            <p className="text-[#71717a] mb-6">Create your first class to start teaching</p>
                            <button
                                onClick={() => setShowCreateModal(true)}
                                className="px-4 py-2.5 bg-[#10b981] text-black rounded-lg font-medium text-sm hover:opacity-90 transition inline-flex items-center gap-2"
                            >
                                <Plus size={18} />
                                Create Class
                            </button>
                        </div>
                    )}
                </>
            )}

            {/* Enrolled Classes */}
            {activeTab === "enrolled" && (
                <>
                    {joinedClasses.length > 0 ? (
                        <div className="grid grid-cols-2 gap-4">
                            {joinedClasses.map((classItem) => (
                                <Link
                                    key={classItem.id}
                                    href={`/dashboard/classes/${classItem.id}`}
                                    className="p-5 bg-[#18181b] border border-[#27272a] rounded-xl hover:border-[#10b981]/50 transition group"
                                >
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="w-12 h-12 bg-[#27272a] rounded-xl flex items-center justify-center">
                                            <GraduationCap size={24} className="text-[#71717a]" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold group-hover:text-[#10b981] transition">{classItem.name}</h3>
                                            <p className="text-xs text-[#71717a]">{classItem.subject_id}</p>
                                        </div>
                                    </div>

                                    {classItem.teacher && (
                                        <p className="text-sm text-[#71717a] mb-4">
                                            by {classItem.teacher.display_name}
                                        </p>
                                    )}

                                    <div className="flex items-center gap-4 text-xs text-[#52525b]">
                                        <span className="flex items-center gap-1">
                                            <Users size={14} />
                                            {classItem.members?.filter(m => m.status === 'approved').length || 0} students
                                        </span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 bg-[#18181b] border border-[#27272a] rounded-xl">
                            <LogIn size={48} className="mx-auto text-[#3f3f46] mb-4" />
                            <h3 className="text-lg font-medium mb-2">Not enrolled in any class</h3>
                            <p className="text-[#71717a] mb-6">Join a class with a class code</p>
                            <button
                                onClick={() => setShowJoinModal(true)}
                                className="px-4 py-2.5 bg-[#10b981] text-black rounded-lg font-medium text-sm hover:opacity-90 transition inline-flex items-center gap-2"
                            >
                                <LogIn size={18} />
                                Join Class
                            </button>
                        </div>
                    )}
                </>
            )}

            {/* Create Modal */}
            {showCreateModal && (
                <CreateClassModal
                    onClose={() => setShowCreateModal(false)}
                    onSuccess={() => {
                        setShowCreateModal(false);
                        router.refresh();
                    }}
                />
            )}

            {/* Join Modal */}
            {showJoinModal && (
                <JoinClassModal
                    onClose={() => setShowJoinModal(false)}
                    onSuccess={() => {
                        setShowJoinModal(false);
                        setActiveTab("enrolled");
                        router.refresh();
                    }}
                />
            )}
        </div>
    );
}

function CreateClassModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
    const [isPending, startTransition] = useTransition();
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [subjectId, setSubjectId] = useState("ap-calc-ab");
    const [joinApprovalRequired, setJoinApprovalRequired] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!name.trim()) {
            setError("Class name is required");
            return;
        }

        startTransition(async () => {
            const result = await createClass({
                name: name.trim(),
                description: description.trim() || undefined,
                subject_id: subjectId,
                join_approval_required: joinApprovalRequired,
                is_active: true,
                max_students: 50,
            });

            if (result.success) {
                onSuccess();
            } else {
                setError(result.error || "Failed to create class");
            }
        });
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
            <div
                className="bg-[#18181b] border border-[#27272a] rounded-2xl p-6 w-full max-w-lg"
                onClick={(e) => e.stopPropagation()}
            >
                <h2 className="text-xl font-bold mb-6">Create Class</h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                        <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm">
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium mb-1.5">Class Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g., AP Calculus AB - Period 3"
                            className="w-full px-4 py-2.5 bg-[#09090b] border border-[#27272a] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10b981]/50"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1.5">Description (optional)</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Brief description of this class..."
                            rows={3}
                            className="w-full px-4 py-2.5 bg-[#09090b] border border-[#27272a] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10b981]/50 resize-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1.5">Subject</label>
                        <select
                            value={subjectId}
                            onChange={(e) => setSubjectId(e.target.value)}
                            className="w-full px-4 py-2.5 bg-[#09090b] border border-[#27272a] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10b981]/50"
                        >
                            <option value="ap-calc-ab">AP Calculus AB</option>
                            <option value="ap-calc-bc">AP Calculus BC</option>
                            <option value="ap-physics-1">AP Physics 1</option>
                            <option value="ap-physics-2">AP Physics 2</option>
                            <option value="ap-chemistry">AP Chemistry</option>
                            <option value="ap-biology">AP Biology</option>
                        </select>
                    </div>

                    <div className="flex items-center gap-3">
                        <input
                            type="checkbox"
                            id="joinApproval"
                            checked={joinApprovalRequired}
                            onChange={(e) => setJoinApprovalRequired(e.target.checked)}
                            className="w-4 h-4 rounded border-[#27272a] text-[#10b981] focus:ring-[#10b981]"
                        />
                        <label htmlFor="joinApproval" className="text-sm">
                            Require approval for new members
                        </label>
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2.5 text-[#71717a] hover:text-white transition"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isPending}
                            className="px-4 py-2.5 bg-[#10b981] text-black rounded-lg font-medium hover:opacity-90 transition disabled:opacity-50"
                        >
                            {isPending ? "Creating..." : "Create Class"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function JoinClassModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
    const [isPending, startTransition] = useTransition();
    const [classCode, setClassCode] = useState("");
    const [nickname, setNickname] = useState("");
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccessMessage("");

        if (!classCode.trim()) {
            setError("Class code is required");
            return;
        }

        startTransition(async () => {
            const result = await joinClass(classCode.trim().toUpperCase(), nickname.trim() || undefined);

            if (result.success) {
                setSuccessMessage(result.message || "Successfully joined!");
                setTimeout(onSuccess, 1500);
            } else {
                setError(result.error || "Failed to join class");
            }
        });
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
            <div
                className="bg-[#18181b] border border-[#27272a] rounded-2xl p-6 w-full max-w-lg"
                onClick={(e) => e.stopPropagation()}
            >
                <h2 className="text-xl font-bold mb-6">Join Class</h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                        <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm">
                            {error}
                        </div>
                    )}

                    {successMessage && (
                        <div className="p-3 bg-[#10b981]/10 border border-[#10b981]/50 rounded-lg text-[#10b981] text-sm">
                            {successMessage}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium mb-1.5">Class Code</label>
                        <input
                            type="text"
                            value={classCode}
                            onChange={(e) => setClassCode(e.target.value.toUpperCase())}
                            placeholder="Enter 6-character code"
                            maxLength={6}
                            className="w-full px-4 py-3 bg-[#09090b] border border-[#27272a] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10b981]/50 text-center font-mono text-xl tracking-widest uppercase"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1.5">Nickname (optional)</label>
                        <input
                            type="text"
                            value={nickname}
                            onChange={(e) => setNickname(e.target.value)}
                            placeholder="How you want to appear in this class"
                            className="w-full px-4 py-2.5 bg-[#09090b] border border-[#27272a] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10b981]/50"
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2.5 text-[#71717a] hover:text-white transition"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isPending || classCode.length !== 6}
                            className="px-4 py-2.5 bg-[#10b981] text-black rounded-lg font-medium hover:opacity-90 transition disabled:opacity-50"
                        >
                            {isPending ? "Joining..." : "Join Class"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
