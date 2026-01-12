"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
    User,
    Globe,
    Lock,
    BadgeCheck,
    ExternalLink,
    Save,
    Eye,
    Building,
    Briefcase,
    Link as LinkIcon,
} from "lucide-react";
import { upsertTeacherProfile, updateTeacherProfile } from "@/lib/actions/teachers";
import type { TeacherProfile } from "@/lib/types/database";

interface ProfileClientProps {
    userId: string;
    userEmail: string;
    userName: string;
    teacherProfile: TeacherProfile | null;
}

export function ProfileClient({ userId, userEmail, userName, teacherProfile }: ProfileClientProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    const [displayName, setDisplayName] = useState(teacherProfile?.display_name || userName);
    const [bio, setBio] = useState(teacherProfile?.bio || "");
    const [institution, setInstitution] = useState(teacherProfile?.institution || "");
    const [experienceYears, setExperienceYears] = useState(teacherProfile?.experience_years || 0);
    const [websiteUrl, setWebsiteUrl] = useState(teacherProfile?.website_url || "");
    const [subjects, setSubjects] = useState<string[]>(teacherProfile?.subjects || []);
    const [isPublic, setIsPublic] = useState(teacherProfile?.is_public || false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const availableSubjects = [
        { id: "ap-calc-ab", name: "AP Calculus AB" },
        { id: "ap-calc-bc", name: "AP Calculus BC" },
        { id: "ap-physics-1", name: "AP Physics 1" },
        { id: "ap-physics-2", name: "AP Physics 2" },
        { id: "ap-chemistry", name: "AP Chemistry" },
        { id: "ap-biology", name: "AP Biology" },
        { id: "ap-statistics", name: "AP Statistics" },
        { id: "ap-cs-a", name: "AP Computer Science A" },
    ];

    const toggleSubject = (subjectId: string) => {
        setSubjects((prev) =>
            prev.includes(subjectId)
                ? prev.filter((s) => s !== subjectId)
                : [...prev, subjectId]
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (!displayName.trim()) {
            setError("Display name is required");
            return;
        }

        startTransition(async () => {
            const result = await upsertTeacherProfile({
                display_name: displayName.trim(),
                bio: bio.trim() || undefined,
                institution: institution.trim() || undefined,
                experience_years: experienceYears,
                website_url: websiteUrl.trim() || undefined,
                subjects,
                is_public: isPublic,
                total_students: teacherProfile?.total_students || 0,
                total_curricula: teacherProfile?.total_curricula || 0,
            });

            if (result.success) {
                setSuccess("Profile saved successfully!");
                router.refresh();
            } else {
                setError(result.error || "Failed to save profile");
            }
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-xl text-red-400">
                    {error}
                </div>
            )}

            {success && (
                <div className="p-4 bg-[#10b981]/10 border border-[#10b981]/50 rounded-xl text-[#10b981]">
                    {success}
                </div>
            )}

            {/* Profile Preview Card */}
            <div className="p-6 bg-[#18181b] border border-[#27272a] rounded-xl">
                <div className="flex items-start gap-4">
                    <div className="w-20 h-20 bg-[#27272a] rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-3xl font-bold">{displayName[0]?.toUpperCase()}</span>
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                            <h2 className="text-xl font-bold">{displayName || "Your Name"}</h2>
                            {teacherProfile?.verified_at && (
                                <BadgeCheck size={20} className="text-[#3b82f6]" />
                            )}
                        </div>
                        <p className="text-sm text-[#71717a] mb-2">{bio || "Add a bio to tell others about yourself..."}</p>
                        <div className="flex items-center gap-4 text-xs text-[#52525b]">
                            {institution && (
                                <span className="flex items-center gap-1">
                                    <Building size={12} /> {institution}
                                </span>
                            )}
                            {experienceYears > 0 && (
                                <span className="flex items-center gap-1">
                                    <Briefcase size={12} /> {experienceYears} years
                                </span>
                            )}
                            <span className="flex items-center gap-1">
                                {isPublic ? (
                                    <>
                                        <Globe size={12} /> Public
                                    </>
                                ) : (
                                    <>
                                        <Lock size={12} /> Private
                                    </>
                                )}
                            </span>
                        </div>
                    </div>
                    {teacherProfile && isPublic && (
                        <Link
                            href={`/teachers/${userId}`}
                            target="_blank"
                            className="px-3 py-1.5 bg-[#27272a] rounded-lg text-xs flex items-center gap-1 hover:bg-[#3f3f46] transition"
                        >
                            <ExternalLink size={12} /> View Public Profile
                        </Link>
                    )}
                </div>
            </div>

            {/* Basic Info */}
            <div className="p-6 bg-[#18181b] border border-[#27272a] rounded-xl space-y-4">
                <h3 className="font-semibold flex items-center gap-2">
                    <User size={18} className="text-[#10b981]" />
                    Basic Information
                </h3>

                <div>
                    <label className="block text-sm font-medium mb-1.5">Display Name *</label>
                    <input
                        type="text"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder="How students will see you"
                        className="w-full px-4 py-2.5 bg-[#09090b] border border-[#27272a] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10b981]/50"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1.5">Bio</label>
                    <textarea
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        placeholder="Tell others about your teaching experience and expertise..."
                        rows={3}
                        className="w-full px-4 py-2.5 bg-[#09090b] border border-[#27272a] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10b981]/50 resize-none"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1.5">Institution</label>
                        <input
                            type="text"
                            value={institution}
                            onChange={(e) => setInstitution(e.target.value)}
                            placeholder="School or organization"
                            className="w-full px-4 py-2.5 bg-[#09090b] border border-[#27272a] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10b981]/50"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1.5">Years of Experience</label>
                        <input
                            type="number"
                            value={experienceYears}
                            onChange={(e) => setExperienceYears(parseInt(e.target.value) || 0)}
                            min={0}
                            max={50}
                            className="w-full px-4 py-2.5 bg-[#09090b] border border-[#27272a] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10b981]/50"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1.5">Website URL</label>
                    <div className="relative">
                        <LinkIcon size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#52525b]" />
                        <input
                            type="url"
                            value={websiteUrl}
                            onChange={(e) => setWebsiteUrl(e.target.value)}
                            placeholder="https://your-website.com"
                            className="w-full pl-10 pr-4 py-2.5 bg-[#09090b] border border-[#27272a] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10b981]/50"
                        />
                    </div>
                </div>
            </div>

            {/* Subjects */}
            <div className="p-6 bg-[#18181b] border border-[#27272a] rounded-xl space-y-4">
                <h3 className="font-semibold">Subjects You Teach</h3>
                <p className="text-sm text-[#71717a]">Select the subjects you specialize in</p>

                <div className="flex flex-wrap gap-2">
                    {availableSubjects.map((subject) => (
                        <button
                            key={subject.id}
                            type="button"
                            onClick={() => toggleSubject(subject.id)}
                            className={`px-3 py-1.5 rounded-lg text-sm transition ${
                                subjects.includes(subject.id)
                                    ? "bg-[#10b981] text-black"
                                    : "bg-[#27272a] text-[#71717a] hover:text-white"
                            }`}
                        >
                            {subject.name}
                        </button>
                    ))}
                </div>
            </div>

            {/* Visibility */}
            <div className="p-6 bg-[#18181b] border border-[#27272a] rounded-xl">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="font-semibold flex items-center gap-2">
                            {isPublic ? (
                                <>
                                    <Globe size={18} className="text-[#10b981]" />
                                    Public Profile
                                </>
                            ) : (
                                <>
                                    <Lock size={18} className="text-[#71717a]" />
                                    Private Profile
                                </>
                            )}
                        </h3>
                        <p className="text-sm text-[#71717a] mt-1">
                            {isPublic
                                ? "Your profile is visible to everyone. Students can find and follow you."
                                : "Your profile is hidden. Only you can see it."}
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={() => setIsPublic(!isPublic)}
                        className={`relative w-14 h-7 rounded-full transition ${
                            isPublic ? "bg-[#10b981]" : "bg-[#27272a]"
                        }`}
                    >
                        <div
                            className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all ${
                                isPublic ? "left-8" : "left-1"
                            }`}
                        />
                    </button>
                </div>
            </div>

            {/* Stats (if profile exists) */}
            {teacherProfile && (
                <div className="grid grid-cols-4 gap-4">
                    <div className="p-4 bg-[#18181b] border border-[#27272a] rounded-xl text-center">
                        <p className="text-2xl font-bold">{teacherProfile.follower_count}</p>
                        <p className="text-xs text-[#71717a]">Followers</p>
                    </div>
                    <div className="p-4 bg-[#18181b] border border-[#27272a] rounded-xl text-center">
                        <p className="text-2xl font-bold">{teacherProfile.following_count}</p>
                        <p className="text-xs text-[#71717a]">Following</p>
                    </div>
                    <div className="p-4 bg-[#18181b] border border-[#27272a] rounded-xl text-center">
                        <p className="text-2xl font-bold">{teacherProfile.total_curricula}</p>
                        <p className="text-xs text-[#71717a]">Curricula</p>
                    </div>
                    <div className="p-4 bg-[#18181b] border border-[#27272a] rounded-xl text-center">
                        <p className="text-2xl font-bold">{teacherProfile.total_students}</p>
                        <p className="text-xs text-[#71717a]">Students</p>
                    </div>
                </div>
            )}

            {/* Submit */}
            <div className="flex justify-end">
                <button
                    type="submit"
                    disabled={isPending}
                    className="px-6 py-2.5 bg-[#10b981] text-black rounded-lg font-medium hover:opacity-90 transition disabled:opacity-50 flex items-center gap-2"
                >
                    <Save size={18} />
                    {isPending ? "Saving..." : "Save Profile"}
                </button>
            </div>
        </form>
    );
}
