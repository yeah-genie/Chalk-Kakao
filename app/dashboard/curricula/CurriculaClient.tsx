"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    Plus,
    BookOpen,
    BadgeCheck,
    Heart,
    Copy,
    Eye,
    EyeOff,
    Trash2,
    Edit3,
    MoreVertical,
    Share2,
    Globe,
    Lock,
} from "lucide-react";
import { createCurriculum, updateCurriculum, deleteCurriculum } from "@/lib/actions/curricula";
import type { Curriculum } from "@/lib/types/database";

interface CurriculaClientProps {
    curricula: Curriculum[];
}

export function CurriculaClient({ curricula }: CurriculaClientProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingCurriculum, setEditingCurriculum] = useState<Curriculum | null>(null);
    const [menuOpen, setMenuOpen] = useState<string | null>(null);

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this curriculum?")) return;

        startTransition(async () => {
            await deleteCurriculum(id);
            router.refresh();
        });
    };

    const handleTogglePublic = async (curriculum: Curriculum) => {
        startTransition(async () => {
            await updateCurriculum(curriculum.id, { is_public: !curriculum.is_public });
            router.refresh();
        });
    };

    return (
        <div className="space-y-6">
            {/* Actions */}
            <div className="flex justify-end">
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="px-4 py-2.5 bg-[#10b981] text-black rounded-lg font-medium text-sm hover:opacity-90 transition flex items-center gap-2"
                >
                    <Plus size={18} />
                    Create Curriculum
                </button>
            </div>

            {/* Curricula Grid */}
            {curricula.length > 0 ? (
                <div className="grid grid-cols-2 gap-4">
                    {curricula.map((curriculum) => (
                        <div
                            key={curriculum.id}
                            className="p-5 bg-[#18181b] border border-[#27272a] rounded-xl hover:border-[#3f3f46] transition group relative"
                        >
                            {/* Menu Button */}
                            <div className="absolute top-4 right-4">
                                <button
                                    onClick={() => setMenuOpen(menuOpen === curriculum.id ? null : curriculum.id)}
                                    className="p-1.5 rounded-lg hover:bg-[#27272a] transition opacity-0 group-hover:opacity-100"
                                >
                                    <MoreVertical size={16} className="text-[#71717a]" />
                                </button>

                                {/* Dropdown Menu */}
                                {menuOpen === curriculum.id && (
                                    <div className="absolute right-0 top-full mt-1 w-48 bg-[#27272a] border border-[#3f3f46] rounded-lg shadow-xl py-1 z-10">
                                        <button
                                            onClick={() => {
                                                setEditingCurriculum(curriculum);
                                                setShowCreateModal(true);
                                                setMenuOpen(null);
                                            }}
                                            className="w-full px-4 py-2 text-left text-sm hover:bg-[#3f3f46] flex items-center gap-2"
                                        >
                                            <Edit3 size={14} /> Edit
                                        </button>
                                        <button
                                            onClick={() => {
                                                handleTogglePublic(curriculum);
                                                setMenuOpen(null);
                                            }}
                                            className="w-full px-4 py-2 text-left text-sm hover:bg-[#3f3f46] flex items-center gap-2"
                                        >
                                            {curriculum.is_public ? (
                                                <>
                                                    <Lock size={14} /> Make Private
                                                </>
                                            ) : (
                                                <>
                                                    <Globe size={14} /> Make Public
                                                </>
                                            )}
                                        </button>
                                        <Link
                                            href={`/dashboard/curricula/${curriculum.id}/share`}
                                            className="w-full px-4 py-2 text-left text-sm hover:bg-[#3f3f46] flex items-center gap-2"
                                        >
                                            <Share2 size={14} /> Share to Class
                                        </Link>
                                        <hr className="my-1 border-[#3f3f46]" />
                                        <button
                                            onClick={() => {
                                                handleDelete(curriculum.id);
                                                setMenuOpen(null);
                                            }}
                                            className="w-full px-4 py-2 text-left text-sm hover:bg-[#3f3f46] text-red-400 flex items-center gap-2"
                                        >
                                            <Trash2 size={14} /> Delete
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Content */}
                            <Link href={`/dashboard/curricula/${curriculum.id}`}>
                                <div className="flex items-start gap-3 mb-3">
                                    <div className="w-10 h-10 bg-[#27272a] rounded-lg flex items-center justify-center flex-shrink-0">
                                        <BookOpen size={18} className="text-[#10b981]" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-medium truncate">{curriculum.title}</h3>
                                            {curriculum.is_verified && (
                                                <BadgeCheck size={16} className="text-[#3b82f6] flex-shrink-0" />
                                            )}
                                        </div>
                                        <p className="text-xs text-[#71717a]">{curriculum.subject_id}</p>
                                    </div>
                                </div>

                                {curriculum.description && (
                                    <p className="text-sm text-[#71717a] line-clamp-2 mb-3">{curriculum.description}</p>
                                )}

                                {/* Stats */}
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-1 text-xs text-[#52525b]">
                                        {curriculum.is_public ? (
                                            <>
                                                <Globe size={12} />
                                                <span>Public</span>
                                            </>
                                        ) : (
                                            <>
                                                <Lock size={12} />
                                                <span>Private</span>
                                            </>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-4 text-xs text-[#52525b]">
                                        <span className="flex items-center gap-1">
                                            <Heart size={12} /> {curriculum.like_count}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Copy size={12} /> {curriculum.clone_count}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Eye size={12} /> {curriculum.usage_count}
                                        </span>
                                    </div>
                                </div>

                                {/* Topics Count */}
                                <div className="mt-3 pt-3 border-t border-[#27272a]">
                                    <p className="text-xs text-[#52525b]">
                                        {curriculum.topic_ids?.length || 0} topics
                                    </p>
                                </div>
                            </Link>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 bg-[#18181b] border border-[#27272a] rounded-xl">
                    <BookOpen size={48} className="mx-auto text-[#3f3f46] mb-4" />
                    <h3 className="text-lg font-medium mb-2">No curricula yet</h3>
                    <p className="text-[#71717a] mb-6">Create your first curriculum to get started</p>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="px-4 py-2.5 bg-[#10b981] text-black rounded-lg font-medium text-sm hover:opacity-90 transition inline-flex items-center gap-2"
                    >
                        <Plus size={18} />
                        Create Curriculum
                    </button>
                </div>
            )}

            {/* Create/Edit Modal */}
            {showCreateModal && (
                <CreateCurriculumModal
                    curriculum={editingCurriculum}
                    onClose={() => {
                        setShowCreateModal(false);
                        setEditingCurriculum(null);
                    }}
                    onSuccess={() => {
                        setShowCreateModal(false);
                        setEditingCurriculum(null);
                        router.refresh();
                    }}
                />
            )}
        </div>
    );
}

function CreateCurriculumModal({
    curriculum,
    onClose,
    onSuccess,
}: {
    curriculum: Curriculum | null;
    onClose: () => void;
    onSuccess: () => void;
}) {
    const [isPending, startTransition] = useTransition();
    const [title, setTitle] = useState(curriculum?.title || "");
    const [description, setDescription] = useState(curriculum?.description || "");
    const [subjectId, setSubjectId] = useState(curriculum?.subject_id || "ap-calc-ab");
    const [isPublic, setIsPublic] = useState(curriculum?.is_public || false);
    const [tags, setTags] = useState(curriculum?.tags?.join(", ") || "");
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!title.trim()) {
            setError("Title is required");
            return;
        }

        startTransition(async () => {
            const data = {
                title: title.trim(),
                description: description.trim() || undefined,
                subject_id: subjectId,
                is_public: isPublic,
                tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
                topic_ids: curriculum?.topic_ids || [],
            };

            let result;
            if (curriculum) {
                result = await updateCurriculum(curriculum.id, data);
            } else {
                result = await createCurriculum(data);
            }

            if (result.success) {
                onSuccess();
            } else {
                setError(result.error || "Failed to save curriculum");
            }
        });
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
            <div
                className="bg-[#18181b] border border-[#27272a] rounded-2xl p-6 w-full max-w-lg"
                onClick={(e) => e.stopPropagation()}
            >
                <h2 className="text-xl font-bold mb-6">
                    {curriculum ? "Edit Curriculum" : "Create Curriculum"}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                        <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm">
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium mb-1.5">Title</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g., AP Calculus AB Complete Guide"
                            className="w-full px-4 py-2.5 bg-[#09090b] border border-[#27272a] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10b981]/50"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1.5">Description</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Describe what this curriculum covers..."
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

                    <div>
                        <label className="block text-sm font-medium mb-1.5">Tags (comma separated)</label>
                        <input
                            type="text"
                            value={tags}
                            onChange={(e) => setTags(e.target.value)}
                            placeholder="e.g., calculus, derivatives, integrals"
                            className="w-full px-4 py-2.5 bg-[#09090b] border border-[#27272a] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10b981]/50"
                        />
                    </div>

                    <div className="flex items-center gap-3">
                        <input
                            type="checkbox"
                            id="isPublic"
                            checked={isPublic}
                            onChange={(e) => setIsPublic(e.target.checked)}
                            className="w-4 h-4 rounded border-[#27272a] text-[#10b981] focus:ring-[#10b981]"
                        />
                        <label htmlFor="isPublic" className="text-sm">
                            Make this curriculum public (visible to all users)
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
                            {isPending ? "Saving..." : curriculum ? "Save Changes" : "Create"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
