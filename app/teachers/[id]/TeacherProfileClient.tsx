"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { UserPlus, UserMinus, Loader2 } from "lucide-react";
import { followTeacher, unfollowTeacher } from "@/lib/actions/teachers";

interface TeacherProfileClientProps {
    teacherId: string;
    initialFollowing: boolean;
}

export function TeacherProfileClient({ teacherId, initialFollowing }: TeacherProfileClientProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [isFollowing, setIsFollowing] = useState(initialFollowing);

    const handleToggleFollow = () => {
        startTransition(async () => {
            if (isFollowing) {
                const result = await unfollowTeacher(teacherId);
                if (result.success) {
                    setIsFollowing(false);
                    router.refresh();
                }
            } else {
                const result = await followTeacher(teacherId);
                if (result.success) {
                    setIsFollowing(true);
                    router.refresh();
                }
            }
        });
    };

    return (
        <button
            onClick={handleToggleFollow}
            disabled={isPending}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition flex items-center gap-2 disabled:opacity-50 ${
                isFollowing
                    ? "bg-[#27272a] text-white hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/50 border border-transparent"
                    : "bg-[#10b981] text-black hover:opacity-90"
            }`}
        >
            {isPending ? (
                <Loader2 size={16} className="animate-spin" />
            ) : isFollowing ? (
                <>
                    <UserMinus size={16} />
                    Unfollow
                </>
            ) : (
                <>
                    <UserPlus size={16} />
                    Follow
                </>
            )}
        </button>
    );
}
