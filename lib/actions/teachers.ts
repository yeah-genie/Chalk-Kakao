"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type {
    TeacherProfile,
    TeacherProfileInsert,
    TeacherProfileWithCurricula,
    Follow,
} from "@/lib/types/database";

// ===================================
// TEACHER PROFILE CRUD
// ===================================

export async function getMyTeacherProfile(): Promise<TeacherProfile | null> {
    try {
        const supabase = await createServerSupabaseClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) return null;

        const { data, error } = await supabase
            .from("teacher_profiles")
            .select("*")
            .eq("id", user.id)
            .single();

        if (error) {
            // Profile might not exist yet
            if (error.code === 'PGRST116') return null;
            console.error("Error fetching teacher profile:", error);
            return null;
        }

        return data;
    } catch (e) {
        console.error("Error fetching teacher profile:", e);
        return null;
    }
}

export async function getTeacherProfile(userId: string): Promise<TeacherProfileWithCurricula | null> {
    try {
        const supabase = await createServerSupabaseClient();
        const { data: { user: currentUser } } = await supabase.auth.getUser();

        const { data, error } = await supabase
            .from("teacher_profiles")
            .select(`
                *,
                curricula(*)
            `)
            .eq("id", userId)
            .single();

        if (error) {
            console.error("Error fetching teacher profile:", error);
            return null;
        }

        // Check if current user is following this teacher
        let isFollowing = false;
        if (currentUser && currentUser.id !== userId) {
            const { data: follow } = await supabase
                .from("follows")
                .select("id")
                .eq("follower_id", currentUser.id)
                .eq("following_id", userId)
                .single();
            isFollowing = !!follow;
        }

        return { ...data, isFollowing } as TeacherProfileWithCurricula & { isFollowing?: boolean };
    } catch (e) {
        console.error("Error fetching teacher profile:", e);
        return null;
    }
}

export async function createTeacherProfile(profile: Omit<TeacherProfileInsert, 'id'>) {
    try {
        const supabase = await createServerSupabaseClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return { success: false, error: "Authentication required" };
        }

        const { data, error } = await supabase
            .from("teacher_profiles")
            .insert({
                id: user.id,
                ...profile,
            })
            .select()
            .single();

        if (error) {
            console.error("Error creating teacher profile:", error);
            return { success: false, error: error.message };
        }

        revalidatePath("/dashboard/profile");
        return { success: true, data };
    } catch (e: any) {
        console.error("Error creating teacher profile:", e);
        return { success: false, error: e.message };
    }
}

export async function updateTeacherProfile(updates: Partial<TeacherProfileInsert>) {
    try {
        const supabase = await createServerSupabaseClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return { success: false, error: "Authentication required" };
        }

        const { error } = await supabase
            .from("teacher_profiles")
            .update(updates)
            .eq("id", user.id);

        if (error) {
            console.error("Error updating teacher profile:", error);
            return { success: false, error: error.message };
        }

        revalidatePath("/dashboard/profile");
        revalidatePath(`/teachers/${user.id}`);
        return { success: true };
    } catch (e: any) {
        console.error("Error updating teacher profile:", e);
        return { success: false, error: e.message };
    }
}

export async function upsertTeacherProfile(profile: Omit<TeacherProfileInsert, 'id'>) {
    try {
        const supabase = await createServerSupabaseClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return { success: false, error: "Authentication required" };
        }

        const { data, error } = await supabase
            .from("teacher_profiles")
            .upsert({
                id: user.id,
                ...profile,
            })
            .select()
            .single();

        if (error) {
            console.error("Error upserting teacher profile:", error);
            return { success: false, error: error.message };
        }

        revalidatePath("/dashboard/profile");
        return { success: true, data };
    } catch (e: any) {
        console.error("Error upserting teacher profile:", e);
        return { success: false, error: e.message };
    }
}

// ===================================
// FOLLOW / UNFOLLOW
// ===================================

export async function followTeacher(teacherId: string) {
    try {
        const supabase = await createServerSupabaseClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return { success: false, error: "Authentication required" };
        }

        if (user.id === teacherId) {
            return { success: false, error: "Cannot follow yourself" };
        }

        const { error } = await supabase
            .from("follows")
            .insert({
                follower_id: user.id,
                following_id: teacherId,
            });

        if (error) {
            if (error.code === '23505') {
                return { success: true, message: "Already following" };
            }
            console.error("Error following teacher:", error);
            return { success: false, error: error.message };
        }

        revalidatePath(`/teachers/${teacherId}`);
        return { success: true };
    } catch (e: any) {
        console.error("Error following teacher:", e);
        return { success: false, error: e.message };
    }
}

export async function unfollowTeacher(teacherId: string) {
    try {
        const supabase = await createServerSupabaseClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return { success: false, error: "Authentication required" };
        }

        const { error } = await supabase
            .from("follows")
            .delete()
            .eq("follower_id", user.id)
            .eq("following_id", teacherId);

        if (error) {
            console.error("Error unfollowing teacher:", error);
            return { success: false, error: error.message };
        }

        revalidatePath(`/teachers/${teacherId}`);
        return { success: true };
    } catch (e: any) {
        console.error("Error unfollowing teacher:", e);
        return { success: false, error: e.message };
    }
}

export async function getFollowers(teacherId: string): Promise<TeacherProfile[]> {
    try {
        const supabase = await createServerSupabaseClient();

        const { data, error } = await supabase
            .from("follows")
            .select(`
                follower:teacher_profiles!follows_follower_id_fkey(*)
            `)
            .eq("following_id", teacherId);

        if (error) {
            console.error("Error fetching followers:", error);
            return [];
        }

        return (data || []).map((f: any) => f.follower).filter(Boolean);
    } catch (e) {
        console.error("Error fetching followers:", e);
        return [];
    }
}

export async function getFollowing(userId: string): Promise<TeacherProfile[]> {
    try {
        const supabase = await createServerSupabaseClient();

        const { data, error } = await supabase
            .from("follows")
            .select(`
                following:teacher_profiles!follows_following_id_fkey(*)
            `)
            .eq("follower_id", userId);

        if (error) {
            console.error("Error fetching following:", error);
            return [];
        }

        return (data || []).map((f: any) => f.following).filter(Boolean);
    } catch (e) {
        console.error("Error fetching following:", e);
        return [];
    }
}

export async function isFollowing(teacherId: string): Promise<boolean> {
    try {
        const supabase = await createServerSupabaseClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) return false;

        const { data, error } = await supabase
            .from("follows")
            .select("id")
            .eq("follower_id", user.id)
            .eq("following_id", teacherId)
            .single();

        return !!data && !error;
    } catch (e) {
        return false;
    }
}

// ===================================
// DISCOVERY
// ===================================

export async function searchTeachers(query: {
    search?: string;
    subject?: string;
    limit?: number;
}): Promise<TeacherProfile[]> {
    try {
        const supabase = await createServerSupabaseClient();

        let dbQuery = supabase
            .from("teacher_profiles")
            .select("*")
            .eq("is_public", true)
            .order("follower_count", { ascending: false });

        if (query.search) {
            dbQuery = dbQuery.or(`display_name.ilike.%${query.search}%,bio.ilike.%${query.search}%,institution.ilike.%${query.search}%`);
        }
        if (query.subject) {
            dbQuery = dbQuery.contains("subjects", [query.subject]);
        }
        if (query.limit) {
            dbQuery = dbQuery.limit(query.limit);
        }

        const { data, error } = await dbQuery;

        if (error) {
            console.error("Error searching teachers:", error);
            return [];
        }

        return data || [];
    } catch (e) {
        console.error("Error searching teachers:", e);
        return [];
    }
}

export async function getPopularTeachers(limit = 10): Promise<TeacherProfile[]> {
    try {
        const supabase = await createServerSupabaseClient();

        const { data, error } = await supabase
            .from("teacher_profiles")
            .select("*")
            .eq("is_public", true)
            .order("follower_count", { ascending: false })
            .limit(limit);

        if (error) {
            console.error("Error fetching popular teachers:", error);
            return [];
        }

        return data || [];
    } catch (e) {
        console.error("Error fetching popular teachers:", e);
        return [];
    }
}

export async function getVerifiedTeachers(limit = 10): Promise<TeacherProfile[]> {
    try {
        const supabase = await createServerSupabaseClient();

        const { data, error } = await supabase
            .from("teacher_profiles")
            .select("*")
            .eq("is_public", true)
            .not("verified_at", "is", null)
            .order("follower_count", { ascending: false })
            .limit(limit);

        if (error) {
            console.error("Error fetching verified teachers:", error);
            return [];
        }

        return data || [];
    } catch (e) {
        console.error("Error fetching verified teachers:", e);
        return [];
    }
}
