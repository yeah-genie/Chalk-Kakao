"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { Student, StudentInsert, Session, SessionInsert } from "@/lib/types/database";
import { getStudentPredictions as internalGetStudentPredictions } from '@/lib/services/prediction';

// ===================================
// STUDENT CRUD ACTIONS
// ===================================

export async function getStudents(): Promise<Student[]> {
    try {
        const supabase = await createServerSupabaseClient();

        const { data, error } = await supabase
            .from("students")
            .select("*")
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Error fetching students (DB):", error);
            return [];
        }

        return data || [];
    } catch (e) {
        console.error("Error fetching students (System):", e);
        return [];
    }
}

export async function getSubjects() {
    try {
        const supabase = await createServerSupabaseClient();
        const { data, error } = await supabase
            .from('kb_subjects')
            .select('id, name')
            .order('name');

        if (error) {
            console.error("Error fetching subjects (DB):", error);
            return [];
        }
        return data || [];
    } catch (e) {
        console.error("Error fetching subjects (System):", e);
        return [];
    }
}

export async function getStudent(id: string): Promise<Student | null> {
    try {
        const supabase = await createServerSupabaseClient();

        const { data, error } = await supabase
            .from("students")
            .select("*")
            .eq("id", id)
            .single();

        if (error) {
            console.error("Error fetching student (DB):", error);
            return null;
        }

        return data;
    } catch (e) {
        console.error("Error fetching student (System):", e);
        return null;
    }
}

export async function createStudent(student: StudentInsert) {
    try {
        const supabase = await createServerSupabaseClient();

        const { data, error } = await supabase
            .from("students")
            .insert(student)
            .select()
            .single();

        if (error) {
            console.error("Error creating student (DB):", error);
            return { success: false, error: `Student database error: ${error.message}` };
        }

        revalidatePath("/dashboard");
        revalidatePath("/dashboard/students");

        return { success: true, data };
    } catch (e) {
        const error = e as Error;
        console.error("Error creating student (System):", error);
        return { success: false, error: `Critical system error: ${error.message || 'Unknown error'}` };
    }
}

export async function registerStudentWithSubject(data: {
    name: string;
    subject_id: string;
    custom_subject_name?: string;
    parent_email?: string;
    notes?: string;
}) {
    try {
        const supabase = await createServerSupabaseClient();

        // Try to get authenticated user (optional)
        const { data: { user } } = await supabase.auth.getUser();
        const tutorId = user?.id || null;

        console.log(`[Register] Creating student. Tutor ID: ${tutorId || 'null (anonymous)'}`);

        let finalSubjectId = data.subject_id;

        // 1. Handle Custom Subject (skip if errors)
        if (data.subject_id === 'custom' && data.custom_subject_name) {
            console.log(`[Register] Custom subject requested: ${data.custom_subject_name}`);
            finalSubjectId = data.custom_subject_name; // Use the name directly
        }

        // 2. Create Student - tutor_id is NOT NULL per schema
        if (!tutorId) {
            console.error("[Register] Error: tutorId is missing. User must be logged in.");
            return {
                success: false,
                error: "Authentication required: Please sign in again to register a student."
            };
        }

        const { data: studentData, error: studentError } = await supabase
            .from("students")
            .insert({
                name: data.name,
                subject_id: finalSubjectId,
                parent_email: data.parent_email || null,
                notes: data.notes || null,
                tutor_id: tutorId
            })
            .select()
            .single();

        if (studentError) {
            console.error("[Register] Error creating student (DB):", studentError);
            return { success: false, error: `Database error: ${studentError.message}` };
        }

        revalidatePath("/dashboard");
        revalidatePath("/dashboard/students");

        return { success: true, data: studentData };
    } catch (e) {
        const error = e as Error;
        console.error("[Register] Error creating student (System):", error);
        return { success: false, error: `Critical system error: ${error.message || 'Unknown error'}` };
    }
}



export async function updateStudent(id: string, updates: Partial<StudentInsert>): Promise<boolean> {
    const supabase = await createServerSupabaseClient();

    const { error } = await supabase
        .from("students")
        .update(updates)
        .eq("id", id);

    if (error) {
        console.error("Error updating student:", error);
        return false;
    }

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/students");

    return true;
}

export async function deleteStudent(id: string): Promise<boolean> {
    const supabase = await createServerSupabaseClient();

    const { error } = await supabase
        .from("students")
        .delete()
        .eq("id", id);

    if (error) {
        console.error("Error deleting student:", error);
        return false;
    }

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/students");

    return true;
}

// ===================================
// SESSION CRUD ACTIONS
// ===================================

export async function getSessions(studentId?: string): Promise<Session[]> {
    try {
        const supabase = await createServerSupabaseClient();

        let query = supabase
            .from("sessions")
            .select("*")
            .order("scheduled_at", { ascending: false });

        if (studentId) {
            query = query.eq("student_id", studentId);
        }

        const { data, error } = await query;

        if (error) {
            console.error("Error fetching sessions (DB):", error);
            return [];
        }

        return data || [];
    } catch (e) {
        console.error("Error fetching sessions (System):", e);
        return [];
    }
}

export async function getSession(id: string): Promise<Session | null> {
    const supabase = await createServerSupabaseClient();

    const { data, error } = await supabase
        .from("sessions")
        .select("*")
        .eq("id", id)
        .single();

    if (error) {
        console.error("Error fetching session:", error);
        return null;
    }

    return data;
}

export async function createSession(session: SessionInsert): Promise<Session | null> {
    const supabase = await createServerSupabaseClient();

    const { data, error } = await supabase
        .from("sessions")
        .insert(session)
        .select()
        .single();

    if (error) {
        console.error("Error creating session:", error);
        return null;
    }

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/sessions");

    return data;
}

export async function updateSession(id: string, updates: Partial<SessionInsert>): Promise<boolean> {
    const supabase = await createServerSupabaseClient();

    const { error } = await supabase
        .from("sessions")
        .update(updates)
        .eq("id", id);

    if (error) {
        console.error("Error updating session:", error);
        return false;
    }

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/sessions");

    return true;
}

export async function completeSession(id: string, transcript?: string): Promise<boolean> {
    return updateSession(id, {
        status: "completed",
        transcript,
    });
}

// ===================================
// MASTERY & INSIGHT ACTIONS
// ===================================

export async function getStudentMastery(studentId: string) {
    try {
        const supabase = await createServerSupabaseClient();

        const { data, error } = await supabase
            .from("student_mastery")
            .select("topic_id, score, status")
            .eq("student_id", studentId);

        if (error) {
            console.error("Error fetching student mastery (DB):", error);
            return [];
        }

        // Map database topic_id to the UI's topicId
        return (data || []).map(m => ({
            topicId: m.topic_id,
            score: m.score
        }));
    } catch (e) {
        console.error("Error fetching student mastery (System):", e);
        return [];
    }
}

export async function getStudentAverageMastery(studentId: string): Promise<number> {
    try {
        const supabase = await createServerSupabaseClient();
        const { data, error } = await supabase
            .from("student_mastery")
            .select("score")
            .eq("student_id", studentId);

        if (error || !data || data.length === 0) {
            return 0;
        }

        const total = data.reduce((sum, m) => sum + (m.score || 0), 0);
        return Math.round(total / data.length);
    } catch (e) {
        console.error("Error calculating average mastery:", e);
        return 0;
    }
}

export async function getAllStudentsMasteryMap(): Promise<Map<string, number>> {
    try {
        const supabase = await createServerSupabaseClient();
        const { data, error } = await supabase
            .from("student_mastery")
            .select("student_id, score");

        if (error || !data) {
            return new Map();
        }

        // Group by student and calculate averages
        const studentScores = new Map<string, number[]>();
        for (const m of data) {
            const scores = studentScores.get(m.student_id) || [];
            scores.push(m.score || 0);
            studentScores.set(m.student_id, scores);
        }

        const result = new Map<string, number>();
        for (const [studentId, scores] of studentScores) {
            const avg = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
            result.set(studentId, avg);
        }

        return result;
    } catch (e) {
        console.error("Error fetching all students mastery map:", e);
        return new Map();
    }
}



/**
 * Prediction Alias for backward compatibility
 * Provides predictions for a student's main subject
 */
export async function getTopicPredictions(studentId: string) {
    try {
        const supabase = await createServerSupabaseClient();
        const { data: student } = await supabase
            .from('students')
            .select('subject_id')
            .eq('id', studentId)
            .single();

        if (!student) return [];

        const predictions = await internalGetStudentPredictions(studentId, student.subject_id);
        return predictions.retentionAlerts;
    } catch (e) {
        console.error("Error in getTopicPredictions:", e);
        return [];
    }
}

export async function getStudentPredictions(studentId: string, subjectId: string) {
    return internalGetStudentPredictions(studentId, subjectId);
}

export async function getTopicInsights(studentId: string, topicId: string) {
    try {
        const supabase = await createServerSupabaseClient();

        // Fetch the latest completed session that covers this topic
        const { data, error } = await supabase
            .from("session_topics")
            .select(`
                evidence,
                future_impact,
                status_after,
                sessions!inner(
                    notes,
                    transcript,
                    scheduled_at
                )
            `)
            .eq("sessions.student_id", studentId)
            .eq("topic_id", topicId)
            .order("created_at", { ascending: false })
            .limit(1)
            .single();

        if (error) {
            console.error("Error fetching topic insights (DB):", error);
            return null;
        }

        return {
            text: (Array.isArray(data.sessions) ? data.sessions[0]?.notes : (data.sessions as { notes: string } | null)?.notes) || "No recent AI narrative available for this topic.",
            nextSteps: [
                "Review session evidence below",
                "Focus on identified struggle points",
                "Next scheduled session follow-up"
            ],
            evidence: data.evidence ? [data.evidence] : [],
            futureImpact: data.future_impact
        };
    } catch (e) {
        console.error("Error fetching topic insights (System):", e);
        return null;
    }
}

export async function getLatestStudentSessionNotes(studentId: string) {
    try {
        const supabase = await createServerSupabaseClient();
        const { data, error } = await supabase
            .from("sessions")
            .select("notes")
            .eq("student_id", studentId)
            .eq("status", "completed")
            .order("created_at", { ascending: false })
            .limit(1)
            .single();

        if (error || !data) return null;
        return data.notes;
    } catch (e) {
        console.error("Error fetching latest session notes:", e);
        return null;
    }
}

export async function getStudentMasteryHistory(studentId: string) {
    try {
        const supabase = await createServerSupabaseClient();

        // Fetch all session topics with their session dates
        const { data, error } = await supabase
            .from('session_topics')
            .select(`
                status_after,
                created_at,
                sessions!inner (
                    scheduled_at,
                    student_id
                )
            `)
            .eq('sessions.student_id', studentId)
            .order('created_at', { ascending: true });

        if (error) throw error;

        // Group by day and calculate average score (approximate)
        // new: 25, learning: 50, reviewed: 75, mastered: 100
        const statusMap: Record<string, number> = {
            'new': 25,
            'learning': 50,
            'reviewed': 75,
            'mastered': 100
        };

        const history = data.map(item => {
            const session = Array.isArray(item.sessions) ? item.sessions[0] : (item.sessions as { scheduled_at: string } | null);
            return {
                date: session?.scheduled_at || item.created_at,
                score: statusMap[item.status_after || 'new'] || 25
            };
        });

        return history;
    } catch (e) {
        console.error("Error fetching mastery history:", e);
        return [];
    }
}
