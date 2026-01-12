"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type {
    Curriculum,
    CurriculumInsert,
    CurriculumWithCreator,
    CurriculumVerification,
} from "@/lib/types/database";

// ===================================
// CURRICULUM CRUD
// ===================================

export async function getCurricula(options?: {
    creatorId?: string;
    subjectId?: string;
    isPublic?: boolean;
    isVerified?: boolean;
    search?: string;
    limit?: number;
    orderBy?: 'usage_count' | 'like_count' | 'created_at';
}): Promise<CurriculumWithCreator[]> {
    try {
        const supabase = await createServerSupabaseClient();
        const { data: { user } } = await supabase.auth.getUser();

        let query = supabase
            .from("curricula")
            .select(`
                *,
                creator:teacher_profiles(*)
            `);

        if (options?.creatorId) {
            query = query.eq("creator_id", options.creatorId);
        }
        if (options?.subjectId) {
            query = query.eq("subject_id", options.subjectId);
        }
        if (options?.isPublic !== undefined) {
            query = query.eq("is_public", options.isPublic);
        }
        if (options?.isVerified !== undefined) {
            query = query.eq("is_verified", options.isVerified);
        }
        if (options?.search) {
            query = query.or(`title.ilike.%${options.search}%,description.ilike.%${options.search}%`);
        }

        const orderColumn = options?.orderBy || 'created_at';
        query = query.order(orderColumn, { ascending: false });

        if (options?.limit) {
            query = query.limit(options.limit);
        }

        const { data, error } = await query;

        if (error) {
            console.error("Error fetching curricula:", error);
            return [];
        }

        // Check if user has liked each curriculum
        if (user && data) {
            const { data: likes } = await supabase
                .from("curriculum_likes")
                .select("curriculum_id")
                .eq("user_id", user.id)
                .in("curriculum_id", data.map(c => c.id));

            const likedIds = new Set((likes || []).map(l => l.curriculum_id));
            return data.map(c => ({
                ...c,
                liked_by_user: likedIds.has(c.id),
            })) as CurriculumWithCreator[];
        }

        return (data || []) as CurriculumWithCreator[];
    } catch (e) {
        console.error("Error fetching curricula:", e);
        return [];
    }
}

export async function getCurriculum(id: string): Promise<CurriculumWithCreator | null> {
    try {
        const supabase = await createServerSupabaseClient();
        const { data: { user } } = await supabase.auth.getUser();

        const { data, error } = await supabase
            .from("curricula")
            .select(`
                *,
                creator:teacher_profiles(*),
                textbook:textbooks(*)
            `)
            .eq("id", id)
            .single();

        if (error) {
            console.error("Error fetching curriculum:", error);
            return null;
        }

        // Check if user has liked
        if (user) {
            const { data: like } = await supabase
                .from("curriculum_likes")
                .select("id")
                .eq("curriculum_id", id)
                .eq("user_id", user.id)
                .single();

            return { ...data, liked_by_user: !!like } as CurriculumWithCreator;
        }

        return data as CurriculumWithCreator;
    } catch (e) {
        console.error("Error fetching curriculum:", e);
        return null;
    }
}

export async function getMyCurricula(): Promise<Curriculum[]> {
    try {
        const supabase = await createServerSupabaseClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) return [];

        const { data, error } = await supabase
            .from("curricula")
            .select("*")
            .eq("creator_id", user.id)
            .order("updated_at", { ascending: false });

        if (error) {
            console.error("Error fetching my curricula:", error);
            return [];
        }

        return data || [];
    } catch (e) {
        console.error("Error fetching my curricula:", e);
        return [];
    }
}

export async function createCurriculum(curriculum: Omit<CurriculumInsert, 'creator_id'>) {
    try {
        const supabase = await createServerSupabaseClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return { success: false, error: "Authentication required" };
        }

        const { data, error } = await supabase
            .from("curricula")
            .insert({
                ...curriculum,
                creator_id: user.id,
            })
            .select()
            .single();

        if (error) {
            console.error("Error creating curriculum:", error);
            return { success: false, error: error.message };
        }

        // Update teacher profile curriculum count
        await supabase.rpc("increment_teacher_curricula_count", { teacher_id: user.id });

        revalidatePath("/dashboard/curricula");
        return { success: true, data };
    } catch (e: any) {
        console.error("Error creating curriculum:", e);
        return { success: false, error: e.message };
    }
}

export async function updateCurriculum(id: string, updates: Partial<CurriculumInsert>) {
    try {
        const supabase = await createServerSupabaseClient();

        const { error } = await supabase
            .from("curricula")
            .update(updates)
            .eq("id", id);

        if (error) {
            console.error("Error updating curriculum:", error);
            return { success: false, error: error.message };
        }

        revalidatePath("/dashboard/curricula");
        return { success: true };
    } catch (e: any) {
        console.error("Error updating curriculum:", e);
        return { success: false, error: e.message };
    }
}

export async function deleteCurriculum(id: string) {
    try {
        const supabase = await createServerSupabaseClient();

        const { error } = await supabase
            .from("curricula")
            .delete()
            .eq("id", id);

        if (error) {
            console.error("Error deleting curriculum:", error);
            return { success: false, error: error.message };
        }

        revalidatePath("/dashboard/curricula");
        return { success: true };
    } catch (e: any) {
        console.error("Error deleting curriculum:", e);
        return { success: false, error: e.message };
    }
}

// ===================================
// CURRICULUM ACTIONS
// ===================================

export async function cloneCurriculum(curriculumId: string, newTitle?: string) {
    try {
        const supabase = await createServerSupabaseClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return { success: false, error: "Authentication required" };
        }

        // Get original curriculum
        const { data: original, error: fetchError } = await supabase
            .from("curricula")
            .select("*")
            .eq("id", curriculumId)
            .single();

        if (fetchError || !original) {
            return { success: false, error: "Curriculum not found" };
        }

        // Create clone
        const { data, error } = await supabase
            .from("curricula")
            .insert({
                creator_id: user.id,
                title: newTitle || `${original.title} (Copy)`,
                description: original.description,
                subject_id: original.subject_id,
                textbook_id: original.textbook_id,
                topic_ids: original.topic_ids,
                is_public: false, // Clone is private by default
                tags: original.tags,
                original_curriculum_id: curriculumId,
            })
            .select()
            .single();

        if (error) {
            console.error("Error cloning curriculum:", error);
            return { success: false, error: error.message };
        }

        // Increment clone count of original
        await supabase
            .from("curricula")
            .update({ clone_count: original.clone_count + 1 })
            .eq("id", curriculumId);

        revalidatePath("/dashboard/curricula");
        return { success: true, data };
    } catch (e: any) {
        console.error("Error cloning curriculum:", e);
        return { success: false, error: e.message };
    }
}

export async function likeCurriculum(curriculumId: string) {
    try {
        const supabase = await createServerSupabaseClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return { success: false, error: "Authentication required" };
        }

        const { error } = await supabase
            .from("curriculum_likes")
            .insert({
                curriculum_id: curriculumId,
                user_id: user.id,
            });

        if (error) {
            // Check if already liked (upsert conflict)
            if (error.code === '23505') {
                return { success: true, message: "Already liked" };
            }
            console.error("Error liking curriculum:", error);
            return { success: false, error: error.message };
        }

        revalidatePath("/dashboard/curricula");
        return { success: true };
    } catch (e: any) {
        console.error("Error liking curriculum:", e);
        return { success: false, error: e.message };
    }
}

export async function unlikeCurriculum(curriculumId: string) {
    try {
        const supabase = await createServerSupabaseClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return { success: false, error: "Authentication required" };
        }

        const { error } = await supabase
            .from("curriculum_likes")
            .delete()
            .eq("curriculum_id", curriculumId)
            .eq("user_id", user.id);

        if (error) {
            console.error("Error unliking curriculum:", error);
            return { success: false, error: error.message };
        }

        revalidatePath("/dashboard/curricula");
        return { success: true };
    } catch (e: any) {
        console.error("Error unliking curriculum:", e);
        return { success: false, error: e.message };
    }
}

// ===================================
// VERIFICATION
// ===================================

export async function getCurriculumVerifications(curriculumId: string): Promise<CurriculumVerification[]> {
    try {
        const supabase = await createServerSupabaseClient();

        const { data, error } = await supabase
            .from("curriculum_verifications")
            .select("*")
            .eq("curriculum_id", curriculumId)
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Error fetching verifications:", error);
            return [];
        }

        return data || [];
    } catch (e) {
        console.error("Error fetching verifications:", e);
        return [];
    }
}

export async function requestVerification(curriculumId: string, notes?: string) {
    try {
        const supabase = await createServerSupabaseClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return { success: false, error: "Authentication required" };
        }

        const { data, error } = await supabase
            .from("curriculum_verifications")
            .insert({
                curriculum_id: curriculumId,
                verification_type: 'manual',
                status: 'pending',
                notes,
            })
            .select()
            .single();

        if (error) {
            console.error("Error requesting verification:", error);
            return { success: false, error: error.message };
        }

        return { success: true, data };
    } catch (e: any) {
        console.error("Error requesting verification:", e);
        return { success: false, error: e.message };
    }
}

// ===================================
// POPULAR & FEATURED
// ===================================

export async function getPopularCurricula(limit = 10): Promise<CurriculumWithCreator[]> {
    return getCurricula({
        isPublic: true,
        orderBy: 'usage_count',
        limit,
    });
}

export async function getVerifiedCurricula(limit = 10): Promise<CurriculumWithCreator[]> {
    return getCurricula({
        isPublic: true,
        isVerified: true,
        orderBy: 'usage_count',
        limit,
    });
}

export async function getRecentCurricula(limit = 10): Promise<CurriculumWithCreator[]> {
    return getCurricula({
        isPublic: true,
        orderBy: 'created_at',
        limit,
    });
}
