"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
    Search,
    BookOpen,
    Users,
    Flame,
    BadgeCheck,
    Heart,
    Copy,
    ExternalLink,
    Filter,
    X,
} from "lucide-react";
import type { Textbook, CurriculumWithCreator, TeacherProfile } from "@/lib/types/database";

interface ExploreClientProps {
    initialTextbooks: Textbook[];
    popularTextbooks: Textbook[];
    filters: { subjects: string[]; publishers: string[]; grades: string[] };
    popularCurricula: CurriculumWithCreator[];
    verifiedCurricula: CurriculumWithCreator[];
    popularTeachers: TeacherProfile[];
    searchParams: { q?: string; tab?: string; subject?: string; publisher?: string; grade?: string };
}

type Tab = "all" | "textbooks" | "curricula" | "teachers";

export function ExploreClient({
    initialTextbooks,
    popularTextbooks,
    filters,
    popularCurricula,
    verifiedCurricula,
    popularTeachers,
    searchParams,
}: ExploreClientProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [searchQuery, setSearchQuery] = useState(searchParams.q || "");
    const [activeTab, setActiveTab] = useState<Tab>((searchParams.tab as Tab) || "all");
    const [showFilters, setShowFilters] = useState(false);

    const [selectedSubject, setSelectedSubject] = useState(searchParams.subject || "");
    const [selectedPublisher, setSelectedPublisher] = useState(searchParams.publisher || "");
    const [selectedGrade, setSelectedGrade] = useState(searchParams.grade || "");

    const handleSearch = () => {
        const params = new URLSearchParams();
        if (searchQuery) params.set("q", searchQuery);
        if (activeTab !== "all") params.set("tab", activeTab);
        if (selectedSubject) params.set("subject", selectedSubject);
        if (selectedPublisher) params.set("publisher", selectedPublisher);
        if (selectedGrade) params.set("grade", selectedGrade);

        startTransition(() => {
            router.push(`/dashboard/explore?${params.toString()}`);
        });
    };

    const clearFilters = () => {
        setSelectedSubject("");
        setSelectedPublisher("");
        setSelectedGrade("");
        setSearchQuery("");
        startTransition(() => {
            router.push("/dashboard/explore");
        });
    };

    const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
        { id: "all", label: "All", icon: <Search size={16} /> },
        { id: "textbooks", label: "Textbooks", icon: <BookOpen size={16} /> },
        { id: "curricula", label: "Curricula", icon: <Flame size={16} /> },
        { id: "teachers", label: "Teachers", icon: <Users size={16} /> },
    ];

    const hasActiveFilters = selectedSubject || selectedPublisher || selectedGrade;

    return (
        <div className="space-y-6">
            {/* Search Bar */}
            <div className="flex gap-3">
                <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#71717a]" size={18} />
                    <input
                        type="text"
                        placeholder="Search textbooks, curricula, or teachers..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                        className="w-full pl-11 pr-4 py-3 bg-[#18181b] border border-[#27272a] rounded-xl text-white placeholder-[#71717a] focus:outline-none focus:ring-2 focus:ring-[#10b981]/50"
                    />
                </div>
                <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`px-4 py-3 rounded-xl border transition flex items-center gap-2 ${
                        hasActiveFilters
                            ? "bg-[#10b981]/10 border-[#10b981]/50 text-[#10b981]"
                            : "bg-[#18181b] border-[#27272a] text-[#71717a] hover:text-white"
                    }`}
                >
                    <Filter size={18} />
                    {hasActiveFilters && <span className="text-sm">Filtered</span>}
                </button>
                <button
                    onClick={handleSearch}
                    disabled={isPending}
                    className="px-6 py-3 bg-[#10b981] text-black rounded-xl font-medium hover:opacity-90 transition disabled:opacity-50"
                >
                    {isPending ? "Searching..." : "Search"}
                </button>
            </div>

            {/* Filters Panel */}
            {showFilters && (
                <div className="p-4 bg-[#18181b] border border-[#27272a] rounded-xl">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-medium">Filters</h3>
                        {hasActiveFilters && (
                            <button onClick={clearFilters} className="text-sm text-[#10b981] hover:underline flex items-center gap-1">
                                <X size={14} /> Clear all
                            </button>
                        )}
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="block text-xs text-[#71717a] mb-1.5">Subject</label>
                            <select
                                value={selectedSubject}
                                onChange={(e) => setSelectedSubject(e.target.value)}
                                className="w-full px-3 py-2 bg-[#09090b] border border-[#27272a] rounded-lg text-sm"
                            >
                                <option value="">All Subjects</option>
                                {filters.subjects.map((s) => (
                                    <option key={s} value={s}>{s}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs text-[#71717a] mb-1.5">Publisher</label>
                            <select
                                value={selectedPublisher}
                                onChange={(e) => setSelectedPublisher(e.target.value)}
                                className="w-full px-3 py-2 bg-[#09090b] border border-[#27272a] rounded-lg text-sm"
                            >
                                <option value="">All Publishers</option>
                                {filters.publishers.map((p) => (
                                    <option key={p} value={p}>{p}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs text-[#71717a] mb-1.5">Grade</label>
                            <select
                                value={selectedGrade}
                                onChange={(e) => setSelectedGrade(e.target.value)}
                                className="w-full px-3 py-2 bg-[#09090b] border border-[#27272a] rounded-lg text-sm"
                            >
                                <option value="">All Grades</option>
                                {filters.grades.map((g) => (
                                    <option key={g} value={g}>{g}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
            )}

            {/* Tabs */}
            <div className="flex gap-2 border-b border-[#27272a] pb-2">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => {
                            setActiveTab(tab.id);
                            if (searchQuery) handleSearch();
                        }}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2 ${
                            activeTab === tab.id
                                ? "bg-[#10b981]/10 text-[#10b981]"
                                : "text-[#71717a] hover:text-white hover:bg-[#18181b]"
                        }`}
                    >
                        {tab.icon}
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Search Results */}
            {searchParams.q && initialTextbooks.length > 0 && (
                <div className="space-y-4">
                    <h2 className="text-lg font-semibold">Search Results for "{searchParams.q}"</h2>
                    <div className="grid grid-cols-2 gap-4">
                        {initialTextbooks.map((textbook) => (
                            <TextbookCard key={textbook.id} textbook={textbook} />
                        ))}
                    </div>
                </div>
            )}

            {/* Default Content */}
            {!searchParams.q && (
                <>
                    {/* Popular Textbooks */}
                    {(activeTab === "all" || activeTab === "textbooks") && popularTextbooks.length > 0 && (
                        <Section title="Popular Textbooks" icon={<BookOpen size={18} />} href="/dashboard/explore?tab=textbooks">
                            <div className="grid grid-cols-3 gap-4">
                                {popularTextbooks.map((textbook) => (
                                    <TextbookCard key={textbook.id} textbook={textbook} />
                                ))}
                            </div>
                        </Section>
                    )}

                    {/* Verified Curricula */}
                    {(activeTab === "all" || activeTab === "curricula") && verifiedCurricula.length > 0 && (
                        <Section title="Verified Curricula" icon={<BadgeCheck size={18} className="text-[#3b82f6]" />} href="/dashboard/explore?tab=curricula">
                            <div className="grid grid-cols-3 gap-4">
                                {verifiedCurricula.map((curriculum) => (
                                    <CurriculumCard key={curriculum.id} curriculum={curriculum} />
                                ))}
                            </div>
                        </Section>
                    )}

                    {/* Popular Curricula */}
                    {(activeTab === "all" || activeTab === "curricula") && popularCurricula.length > 0 && (
                        <Section title="Trending Curricula" icon={<Flame size={18} className="text-orange-500" />}>
                            <div className="grid grid-cols-3 gap-4">
                                {popularCurricula.map((curriculum) => (
                                    <CurriculumCard key={curriculum.id} curriculum={curriculum} />
                                ))}
                            </div>
                        </Section>
                    )}

                    {/* Popular Teachers */}
                    {(activeTab === "all" || activeTab === "teachers") && popularTeachers.length > 0 && (
                        <Section title="Top Teachers" icon={<Users size={18} />} href="/dashboard/explore?tab=teachers">
                            <div className="grid grid-cols-3 gap-4">
                                {popularTeachers.map((teacher) => (
                                    <TeacherCard key={teacher.id} teacher={teacher} />
                                ))}
                            </div>
                        </Section>
                    )}

                    {/* Empty State */}
                    {popularTextbooks.length === 0 && popularCurricula.length === 0 && popularTeachers.length === 0 && (
                        <div className="text-center py-20">
                            <Search size={48} className="mx-auto text-[#3f3f46] mb-4" />
                            <h3 className="text-lg font-medium mb-2">No content yet</h3>
                            <p className="text-[#71717a]">Be the first to share textbooks and curricula!</p>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

function Section({ title, icon, href, children }: { title: string; icon: React.ReactNode; href?: string; children: React.ReactNode }) {
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                    {icon}
                    {title}
                </h2>
                {href && (
                    <Link href={href} className="text-sm text-[#10b981] hover:underline flex items-center gap-1">
                        View all <ExternalLink size={14} />
                    </Link>
                )}
            </div>
            {children}
        </div>
    );
}

function TextbookCard({ textbook }: { textbook: Textbook }) {
    return (
        <Link
            href={`/dashboard/explore/textbooks/${textbook.id}`}
            className="p-4 bg-[#18181b] border border-[#27272a] rounded-xl hover:border-[#10b981]/50 transition group"
        >
            <div className="flex items-start gap-3">
                <div className="w-12 h-16 bg-[#27272a] rounded flex items-center justify-center flex-shrink-0">
                    <BookOpen size={20} className="text-[#52525b]" />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                        <h3 className="font-medium text-sm truncate group-hover:text-[#10b981] transition">{textbook.title}</h3>
                        {textbook.is_verified && <BadgeCheck size={16} className="text-[#3b82f6] flex-shrink-0" />}
                    </div>
                    <p className="text-xs text-[#71717a] mt-0.5">{textbook.publisher}</p>
                    <div className="flex items-center gap-2 mt-2 text-xs text-[#52525b]">
                        <span className="px-1.5 py-0.5 bg-[#27272a] rounded">{textbook.grade}</span>
                        <span className="px-1.5 py-0.5 bg-[#27272a] rounded">{textbook.subject}</span>
                    </div>
                </div>
            </div>
        </Link>
    );
}

function CurriculumCard({ curriculum }: { curriculum: CurriculumWithCreator }) {
    return (
        <Link
            href={`/dashboard/explore/curricula/${curriculum.id}`}
            className="p-4 bg-[#18181b] border border-[#27272a] rounded-xl hover:border-[#10b981]/50 transition group"
        >
            <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="font-medium text-sm truncate group-hover:text-[#10b981] transition">{curriculum.title}</h3>
                {curriculum.is_verified && <BadgeCheck size={16} className="text-[#3b82f6] flex-shrink-0" />}
            </div>
            {curriculum.description && (
                <p className="text-xs text-[#71717a] line-clamp-2 mb-3">{curriculum.description}</p>
            )}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    {curriculum.creator && (
                        <span className="text-xs text-[#52525b]">by {curriculum.creator.display_name}</span>
                    )}
                </div>
                <div className="flex items-center gap-3 text-xs text-[#52525b]">
                    <span className="flex items-center gap-1">
                        <Heart size={12} /> {curriculum.like_count}
                    </span>
                    <span className="flex items-center gap-1">
                        <Copy size={12} /> {curriculum.clone_count}
                    </span>
                </div>
            </div>
            {curriculum.tags && curriculum.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                    {curriculum.tags.slice(0, 3).map((tag) => (
                        <span key={tag} className="px-1.5 py-0.5 bg-[#27272a] rounded text-[10px] text-[#71717a]">
                            {tag}
                        </span>
                    ))}
                </div>
            )}
        </Link>
    );
}

function TeacherCard({ teacher }: { teacher: TeacherProfile }) {
    return (
        <Link
            href={`/teachers/${teacher.id}`}
            className="p-4 bg-[#18181b] border border-[#27272a] rounded-xl hover:border-[#10b981]/50 transition group"
        >
            <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-[#27272a] rounded-full flex items-center justify-center flex-shrink-0">
                    {teacher.avatar_url ? (
                        <img src={teacher.avatar_url} alt={teacher.display_name} className="w-full h-full rounded-full object-cover" />
                    ) : (
                        <span className="text-lg font-medium">{teacher.display_name[0]}</span>
                    )}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                        <h3 className="font-medium text-sm truncate group-hover:text-[#10b981] transition">{teacher.display_name}</h3>
                        {teacher.verified_at && <BadgeCheck size={14} className="text-[#3b82f6] flex-shrink-0" />}
                    </div>
                    {teacher.institution && (
                        <p className="text-xs text-[#71717a] truncate">{teacher.institution}</p>
                    )}
                    <div className="flex items-center gap-3 mt-1 text-xs text-[#52525b]">
                        <span>{teacher.follower_count} followers</span>
                        <span>{teacher.total_curricula} curricula</span>
                    </div>
                </div>
            </div>
            {teacher.subjects && teacher.subjects.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-3">
                    {teacher.subjects.slice(0, 3).map((subject) => (
                        <span key={subject} className="px-1.5 py-0.5 bg-[#10b981]/10 text-[#10b981] rounded text-[10px]">
                            {subject}
                        </span>
                    ))}
                </div>
            )}
        </Link>
    );
}
