import { notFound } from "next/navigation";
import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getTeacherProfile, isFollowing } from "@/lib/actions/teachers";
import { getCurricula } from "@/lib/actions/curricula";
import {
    BadgeCheck,
    Building,
    Briefcase,
    Globe,
    Users,
    BookOpen,
    Calendar,
    ExternalLink,
    ArrowLeft,
} from "lucide-react";
import { TeacherProfileClient } from "./TeacherProfileClient";

export default async function TeacherProfilePage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;

    let currentUser = null;
    try {
        const supabase = await createServerSupabaseClient();
        const { data } = await supabase.auth.getUser();
        currentUser = data.user;
    } catch (e) {
        console.error("[TeacherProfile] Error fetching user:", e);
    }

    const teacher = await getTeacherProfile(id);

    if (!teacher || (!teacher.is_public && currentUser?.id !== id)) {
        notFound();
    }

    const curricula = await getCurricula({
        creatorId: id,
        isPublic: true,
        limit: 10,
    });

    const following = currentUser ? await isFollowing(id) : false;
    const isOwnProfile = currentUser?.id === id;

    return (
        <div className="min-h-screen bg-[#09090b] text-white">
            {/* Back Button */}
            <div className="fixed top-6 left-6 z-10">
                <Link
                    href="/dashboard/explore"
                    className="px-3 py-2 bg-[#18181b]/80 backdrop-blur border border-[#27272a] rounded-lg flex items-center gap-2 text-sm hover:bg-[#27272a] transition"
                >
                    <ArrowLeft size={16} /> Back
                </Link>
            </div>

            {/* Hero Section */}
            <div className="relative">
                <div className="h-48 bg-gradient-to-br from-[#10b981]/20 to-[#3b82f6]/20" />

                <div className="max-w-4xl mx-auto px-6 -mt-16 relative">
                    {/* Profile Card */}
                    <div className="bg-[#18181b] border border-[#27272a] rounded-2xl p-6">
                        <div className="flex flex-col md:flex-row items-start gap-6">
                            {/* Avatar */}
                            <div className="w-32 h-32 bg-[#27272a] rounded-2xl flex items-center justify-center flex-shrink-0 border-4 border-[#18181b]">
                                {teacher.avatar_url ? (
                                    <img
                                        src={teacher.avatar_url}
                                        alt={teacher.display_name}
                                        className="w-full h-full rounded-xl object-cover"
                                    />
                                ) : (
                                    <span className="text-5xl font-bold">{teacher.display_name[0]}</span>
                                )}
                            </div>

                            {/* Info */}
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <h1 className="text-2xl font-bold">{teacher.display_name}</h1>
                                    {teacher.verified_at && (
                                        <BadgeCheck size={24} className="text-[#3b82f6]" />
                                    )}
                                </div>

                                {teacher.bio && (
                                    <p className="text-[#a1a1aa] mb-4">{teacher.bio}</p>
                                )}

                                <div className="flex flex-wrap items-center gap-4 text-sm text-[#71717a] mb-4">
                                    {teacher.institution && (
                                        <span className="flex items-center gap-1.5">
                                            <Building size={16} /> {teacher.institution}
                                        </span>
                                    )}
                                    {teacher.experience_years > 0 && (
                                        <span className="flex items-center gap-1.5">
                                            <Briefcase size={16} /> {teacher.experience_years} years experience
                                        </span>
                                    )}
                                    {teacher.website_url && (
                                        <a
                                            href={teacher.website_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-1.5 text-[#10b981] hover:underline"
                                        >
                                            <Globe size={16} /> Website
                                            <ExternalLink size={12} />
                                        </a>
                                    )}
                                    <span className="flex items-center gap-1.5">
                                        <Calendar size={16} /> Joined {new Date(teacher.created_at).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                                    </span>
                                </div>

                                {/* Subjects */}
                                {teacher.subjects && teacher.subjects.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {teacher.subjects.map((subject) => (
                                            <span
                                                key={subject}
                                                className="px-2.5 py-1 bg-[#10b981]/10 text-[#10b981] rounded-lg text-xs font-medium"
                                            >
                                                {subject}
                                            </span>
                                        ))}
                                    </div>
                                )}

                                {/* Stats */}
                                <div className="flex items-center gap-6 text-sm">
                                    <span>
                                        <strong>{teacher.follower_count}</strong>{" "}
                                        <span className="text-[#71717a]">followers</span>
                                    </span>
                                    <span>
                                        <strong>{teacher.following_count}</strong>{" "}
                                        <span className="text-[#71717a]">following</span>
                                    </span>
                                    <span>
                                        <strong>{teacher.total_curricula}</strong>{" "}
                                        <span className="text-[#71717a]">curricula</span>
                                    </span>
                                </div>
                            </div>

                            {/* Follow Button */}
                            {!isOwnProfile && currentUser && (
                                <TeacherProfileClient
                                    teacherId={id}
                                    initialFollowing={following}
                                />
                            )}

                            {isOwnProfile && (
                                <Link
                                    href="/dashboard/profile"
                                    className="px-4 py-2 border border-[#27272a] rounded-lg text-sm hover:bg-[#27272a] transition"
                                >
                                    Edit Profile
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-4xl mx-auto px-6 py-8">
                {/* Curricula */}
                <section>
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-semibold flex items-center gap-2">
                            <BookOpen size={20} className="text-[#10b981]" />
                            Curricula
                        </h2>
                    </div>

                    {curricula.length > 0 ? (
                        <div className="grid grid-cols-2 gap-4">
                            {curricula.map((curriculum) => (
                                <Link
                                    key={curriculum.id}
                                    href={`/dashboard/explore/curricula/${curriculum.id}`}
                                    className="p-5 bg-[#18181b] border border-[#27272a] rounded-xl hover:border-[#10b981]/50 transition group"
                                >
                                    <div className="flex items-start justify-between gap-2 mb-2">
                                        <h3 className="font-medium group-hover:text-[#10b981] transition">
                                            {curriculum.title}
                                        </h3>
                                        {curriculum.is_verified && (
                                            <BadgeCheck size={16} className="text-[#3b82f6] flex-shrink-0" />
                                        )}
                                    </div>
                                    {curriculum.description && (
                                        <p className="text-sm text-[#71717a] line-clamp-2 mb-3">
                                            {curriculum.description}
                                        </p>
                                    )}
                                    <div className="flex items-center gap-4 text-xs text-[#52525b]">
                                        <span>{curriculum.topic_ids?.length || 0} topics</span>
                                        <span>{curriculum.like_count} likes</span>
                                        <span>{curriculum.clone_count} clones</span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 bg-[#18181b] border border-[#27272a] rounded-xl">
                            <BookOpen size={48} className="mx-auto text-[#3f3f46] mb-4" />
                            <p className="text-[#71717a]">No public curricula yet</p>
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}
