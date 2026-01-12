"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type {
    Class,
    ClassInsert,
    ClassMember,
    ClassMemberInsert,
    ClassWithMembers,
    ClassCurriculum,
} from "@/lib/types/database";

// ===================================
// CLASS CRUD
// ===================================

export async function getMyClasses(): Promise<ClassWithMembers[]> {
    try {
        const supabase = await createServerSupabaseClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) return [];

        const { data, error } = await supabase
            .from("classes")
            .select(`
                *,
                members:class_members(*),
                curriculum:curricula(*),
                teacher:teacher_profiles(*)
            `)
            .eq("teacher_id", user.id)
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Error fetching classes:", error);
            return [];
        }

        return (data || []) as ClassWithMembers[];
    } catch (e) {
        console.error("Error fetching classes:", e);
        return [];
    }
}

export async function getClass(id: string): Promise<ClassWithMembers | null> {
    try {
        const supabase = await createServerSupabaseClient();

        const { data, error } = await supabase
            .from("classes")
            .select(`
                *,
                members:class_members(
                    *,
                    user:profiles(*),
                    student:students(*)
                ),
                curriculum:curricula(*),
                teacher:teacher_profiles(*),
                curricula:class_curricula(
                    *,
                    curriculum:curricula(*)
                )
            `)
            .eq("id", id)
            .single();

        if (error) {
            console.error("Error fetching class:", error);
            return null;
        }

        return data as ClassWithMembers;
    } catch (e) {
        console.error("Error fetching class:", e);
        return null;
    }
}

export async function getClassByCode(code: string): Promise<Class | null> {
    try {
        const supabase = await createServerSupabaseClient();

        const { data, error } = await supabase
            .from("classes")
            .select("*")
            .eq("class_code", code.toUpperCase())
            .eq("is_active", true)
            .single();

        if (error) {
            console.error("Error fetching class by code:", error);
            return null;
        }

        return data;
    } catch (e) {
        console.error("Error fetching class by code:", e);
        return null;
    }
}

export async function createClass(classData: Omit<ClassInsert, 'teacher_id'>) {
    try {
        const supabase = await createServerSupabaseClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return { success: false, error: "Authentication required" };
        }

        // Generate unique class code
        const { data: codeData } = await supabase.rpc("generate_class_code");
        const classCode = codeData || generateLocalCode();

        const { data, error } = await supabase
            .from("classes")
            .insert({
                ...classData,
                teacher_id: user.id,
                class_code: classCode,
            })
            .select()
            .single();

        if (error) {
            console.error("Error creating class:", error);
            return { success: false, error: error.message };
        }

        revalidatePath("/dashboard/classes");
        return { success: true, data };
    } catch (e: any) {
        console.error("Error creating class:", e);
        return { success: false, error: e.message };
    }
}

function generateLocalCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

export async function updateClass(id: string, updates: Partial<ClassInsert>) {
    try {
        const supabase = await createServerSupabaseClient();

        const { error } = await supabase
            .from("classes")
            .update(updates)
            .eq("id", id);

        if (error) {
            console.error("Error updating class:", error);
            return { success: false, error: error.message };
        }

        revalidatePath("/dashboard/classes");
        revalidatePath(`/dashboard/classes/${id}`);
        return { success: true };
    } catch (e: any) {
        console.error("Error updating class:", e);
        return { success: false, error: e.message };
    }
}

export async function deleteClass(id: string) {
    try {
        const supabase = await createServerSupabaseClient();

        const { error } = await supabase
            .from("classes")
            .delete()
            .eq("id", id);

        if (error) {
            console.error("Error deleting class:", error);
            return { success: false, error: error.message };
        }

        revalidatePath("/dashboard/classes");
        return { success: true };
    } catch (e: any) {
        console.error("Error deleting class:", e);
        return { success: false, error: e.message };
    }
}

export async function regenerateClassCode(classId: string) {
    try {
        const supabase = await createServerSupabaseClient();

        const { data: codeData } = await supabase.rpc("generate_class_code");
        const newCode = codeData || generateLocalCode();

        const { error } = await supabase
            .from("classes")
            .update({ class_code: newCode })
            .eq("id", classId);

        if (error) {
            console.error("Error regenerating class code:", error);
            return { success: false, error: error.message };
        }

        revalidatePath(`/dashboard/classes/${classId}`);
        return { success: true, code: newCode };
    } catch (e: any) {
        console.error("Error regenerating class code:", e);
        return { success: false, error: e.message };
    }
}

// ===================================
// CLASS MEMBERS
// ===================================

export async function joinClass(classCode: string, nickname?: string) {
    try {
        const supabase = await createServerSupabaseClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return { success: false, error: "Authentication required" };
        }

        // Find class by code
        const classData = await getClassByCode(classCode);
        if (!classData) {
            return { success: false, error: "Class not found or inactive" };
        }

        // Check if already a member
        const { data: existing } = await supabase
            .from("class_members")
            .select("id, status")
            .eq("class_id", classData.id)
            .eq("user_id", user.id)
            .single();

        if (existing) {
            if (existing.status === 'approved') {
                return { success: false, error: "Already a member of this class" };
            }
            if (existing.status === 'pending') {
                return { success: false, error: "Join request already pending" };
            }
        }

        // Join class
        const status = classData.join_approval_required ? 'pending' : 'approved';

        const { data, error } = await supabase
            .from("class_members")
            .insert({
                class_id: classData.id,
                user_id: user.id,
                role: 'student',
                status,
                nickname,
            })
            .select()
            .single();

        if (error) {
            console.error("Error joining class:", error);
            return { success: false, error: error.message };
        }

        revalidatePath("/dashboard/classes");
        return {
            success: true,
            data,
            message: status === 'pending' ? "Join request sent. Waiting for approval." : "Successfully joined the class!",
        };
    } catch (e: any) {
        console.error("Error joining class:", e);
        return { success: false, error: e.message };
    }
}

export async function addStudentToClass(classId: string, studentId: string) {
    try {
        const supabase = await createServerSupabaseClient();

        const { data, error } = await supabase
            .from("class_members")
            .insert({
                class_id: classId,
                student_id: studentId,
                role: 'student',
                status: 'approved',
            })
            .select()
            .single();

        if (error) {
            console.error("Error adding student to class:", error);
            return { success: false, error: error.message };
        }

        revalidatePath(`/dashboard/classes/${classId}`);
        return { success: true, data };
    } catch (e: any) {
        console.error("Error adding student to class:", e);
        return { success: false, error: e.message };
    }
}

export async function approveMember(memberId: string) {
    try {
        const supabase = await createServerSupabaseClient();

        const { error } = await supabase
            .from("class_members")
            .update({ status: 'approved' })
            .eq("id", memberId);

        if (error) {
            console.error("Error approving member:", error);
            return { success: false, error: error.message };
        }

        revalidatePath("/dashboard/classes");
        return { success: true };
    } catch (e: any) {
        console.error("Error approving member:", e);
        return { success: false, error: e.message };
    }
}

export async function rejectMember(memberId: string) {
    try {
        const supabase = await createServerSupabaseClient();

        const { error } = await supabase
            .from("class_members")
            .update({ status: 'rejected' })
            .eq("id", memberId);

        if (error) {
            console.error("Error rejecting member:", error);
            return { success: false, error: error.message };
        }

        revalidatePath("/dashboard/classes");
        return { success: true };
    } catch (e: any) {
        console.error("Error rejecting member:", e);
        return { success: false, error: e.message };
    }
}

export async function removeMember(memberId: string) {
    try {
        const supabase = await createServerSupabaseClient();

        const { error } = await supabase
            .from("class_members")
            .delete()
            .eq("id", memberId);

        if (error) {
            console.error("Error removing member:", error);
            return { success: false, error: error.message };
        }

        revalidatePath("/dashboard/classes");
        return { success: true };
    } catch (e: any) {
        console.error("Error removing member:", e);
        return { success: false, error: e.message };
    }
}

export async function getMyJoinedClasses(): Promise<ClassWithMembers[]> {
    try {
        const supabase = await createServerSupabaseClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) return [];

        const { data, error } = await supabase
            .from("class_members")
            .select(`
                class:classes(
                    *,
                    teacher:teacher_profiles(*),
                    curriculum:curricula(*)
                )
            `)
            .eq("user_id", user.id)
            .eq("status", "approved");

        if (error) {
            console.error("Error fetching joined classes:", error);
            return [];
        }

        return (data || []).map((m: any) => m.class).filter(Boolean);
    } catch (e) {
        console.error("Error fetching joined classes:", e);
        return [];
    }
}

// ===================================
// CLASS CURRICULA
// ===================================

export async function shareCurriculumWithClass(classId: string, curriculumId: string, options?: {
    isRequired?: boolean;
    dueDate?: string;
}) {
    try {
        const supabase = await createServerSupabaseClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return { success: false, error: "Authentication required" };
        }

        const { data, error } = await supabase
            .from("class_curricula")
            .insert({
                class_id: classId,
                curriculum_id: curriculumId,
                shared_by: user.id,
                is_required: options?.isRequired ?? false,
                due_date: options?.dueDate,
            })
            .select()
            .single();

        if (error) {
            if (error.code === '23505') {
                return { success: false, error: "Curriculum already shared with this class" };
            }
            console.error("Error sharing curriculum:", error);
            return { success: false, error: error.message };
        }

        revalidatePath(`/dashboard/classes/${classId}`);
        return { success: true, data };
    } catch (e: any) {
        console.error("Error sharing curriculum:", e);
        return { success: false, error: e.message };
    }
}

export async function removeCurriculumFromClass(classId: string, curriculumId: string) {
    try {
        const supabase = await createServerSupabaseClient();

        const { error } = await supabase
            .from("class_curricula")
            .delete()
            .eq("class_id", classId)
            .eq("curriculum_id", curriculumId);

        if (error) {
            console.error("Error removing curriculum from class:", error);
            return { success: false, error: error.message };
        }

        revalidatePath(`/dashboard/classes/${classId}`);
        return { success: true };
    } catch (e: any) {
        console.error("Error removing curriculum from class:", e);
        return { success: false, error: e.message };
    }
}

export async function getClassCurricula(classId: string): Promise<ClassCurriculum[]> {
    try {
        const supabase = await createServerSupabaseClient();

        const { data, error } = await supabase
            .from("class_curricula")
            .select(`
                *,
                curriculum:curricula(*)
            `)
            .eq("class_id", classId)
            .order("shared_at", { ascending: false });

        if (error) {
            console.error("Error fetching class curricula:", error);
            return [];
        }

        return data || [];
    } catch (e) {
        console.error("Error fetching class curricula:", e);
        return [];
    }
}

// ===================================
// BULK SHARE
// ===================================

export async function shareCurriculaWithClass(classId: string, curriculumIds: string[]) {
    try {
        const supabase = await createServerSupabaseClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return { success: false, error: "Authentication required" };
        }

        const inserts = curriculumIds.map(curriculumId => ({
            class_id: classId,
            curriculum_id: curriculumId,
            shared_by: user.id,
            is_required: false,
        }));

        const { data, error } = await supabase
            .from("class_curricula")
            .upsert(inserts, { onConflict: 'class_id,curriculum_id' })
            .select();

        if (error) {
            console.error("Error bulk sharing curricula:", error);
            return { success: false, error: error.message };
        }

        revalidatePath(`/dashboard/classes/${classId}`);
        return { success: true, data };
    } catch (e: any) {
        console.error("Error bulk sharing curricula:", e);
        return { success: false, error: e.message };
    }
}
