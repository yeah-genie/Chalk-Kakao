import { createClient } from '@supabase/supabase-js';

// Note: Database types will be generated after connecting to Supabase
// npx supabase gen types typescript --project-id YOUR_PROJECT_ID > lib/database.types.ts

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Only create client if credentials exist
export const supabase = supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

// Check if Supabase is configured
export function isSupabaseConfigured(): boolean {
    return supabase !== null;
}

// ============================================
// TYPE DEFINITIONS
// ============================================

export interface DbStudent {
    id: string;
    tutor_id: string | null;
    name: string;
    grade: string | null;
    parent_email: string | null;
    notes: string | null;
    created_at: string;
}

export interface DbSubmission {
    id: string;
    student_id: string | null;
    image_url: string;
    problem_text: string | null;
    correct_answer: string | null;
    status: string;
    created_at: string;
}

export interface DbAnalysis {
    id: string;
    submission_id: string | null;
    recognized_text: string | null;
    steps: unknown;
    error_step: number | null;
    misconception_code: string | null;
    misconception_name: string | null;
    error_type: string | null;
    description: string | null;
    recommendation: string | null;
    overall_feedback: string | null;
    confidence: number | null;
    created_at: string;
}

// ============================================
// HELPER FUNCTIONS
// ============================================

// Get all students for a tutor
export async function getStudents(tutorId: string): Promise<DbStudent[]> {
    if (!supabase) throw new Error('Supabase not configured');

    const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('tutor_id', tutorId)
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data as DbStudent[];
}

// Get student with their submissions
export async function getStudentWithSubmissions(studentId: string) {
    if (!supabase) throw new Error('Supabase not configured');

    const { data, error } = await supabase
        .from('students')
        .select(`
      *,
      submissions (
        *,
        analyses (*)
      )
    `)
        .eq('id', studentId)
        .single();

    if (error) throw error;
    return data;
}

// Create a new submission
export async function createSubmission(
    studentId: string,
    imageUrl: string,
    problemText?: string,
    correctAnswer?: string
): Promise<DbSubmission> {
    if (!supabase) throw new Error('Supabase not configured');

    const { data, error } = await supabase
        .from('submissions')
        .insert({
            student_id: studentId,
            image_url: imageUrl,
            problem_text: problemText || null,
            correct_answer: correctAnswer || null,
            status: 'pending'
        } as never) // Type assertion for Supabase generics
        .select()
        .single();

    if (error) throw error;
    return data as DbSubmission;
}

// Save analysis result
export async function saveAnalysis(
    submissionId: string,
    analysis: {
        recognizedText: string;
        steps: Array<{
            stepNumber: number;
            content: string;
            isCorrect: boolean;
            expected?: string;
        }>;
        errorStep: number | null;
        misconceptionCode?: string;
        misconceptionName?: string;
        errorType?: 'conceptual' | 'procedural' | 'factual' | 'careless';
        description?: string;
        recommendation?: string;
        overallFeedback: string;
        confidence: number;
    }
): Promise<DbAnalysis> {
    if (!supabase) throw new Error('Supabase not configured');

    // Update submission status
    await supabase
        .from('submissions')
        .update({ status: 'completed' } as never)
        .eq('id', submissionId);

    // Insert analysis
    const { data, error } = await supabase
        .from('analyses')
        .insert({
            submission_id: submissionId,
            recognized_text: analysis.recognizedText,
            steps: analysis.steps,
            error_step: analysis.errorStep,
            misconception_code: analysis.misconceptionCode || null,
            misconception_name: analysis.misconceptionName || null,
            error_type: analysis.errorType || null,
            description: analysis.description || null,
            recommendation: analysis.recommendation || null,
            overall_feedback: analysis.overallFeedback,
            confidence: analysis.confidence
        } as never)
        .select()
        .single();

    if (error) throw error;
    return data as DbAnalysis;
}

// Get error statistics for a student
export async function getStudentErrorStats(studentId: string) {
    if (!supabase) throw new Error('Supabase not configured');

    // Get all analyses for this student's submissions
    const { data: submissions, error: subError } = await supabase
        .from('submissions')
        .select('id')
        .eq('student_id', studentId);

    if (subError) throw subError;

    const submissionIds = (submissions as { id: string }[]).map(s => s.id);

    if (submissionIds.length === 0) {
        return {
            total: 0,
            byType: { conceptual: 0, procedural: 0, factual: 0, careless: 0 },
            topMisconceptions: {}
        };
    }

    const { data, error } = await supabase
        .from('analyses')
        .select('error_type, misconception_code, misconception_name')
        .in('submission_id', submissionIds);

    if (error) throw error;

    // Aggregate stats
    const stats = {
        total: (data as DbAnalysis[]).length,
        byType: {
            conceptual: 0,
            procedural: 0,
            factual: 0,
            careless: 0
        },
        topMisconceptions: {} as Record<string, { name: string; count: number }>
    };

    for (const item of data as DbAnalysis[]) {
        if (item.error_type && item.error_type in stats.byType) {
            stats.byType[item.error_type as keyof typeof stats.byType]++;
        }
        if (item.misconception_code) {
            if (!stats.topMisconceptions[item.misconception_code]) {
                stats.topMisconceptions[item.misconception_code] = {
                    name: item.misconception_name || item.misconception_code,
                    count: 0
                };
            }
            stats.topMisconceptions[item.misconception_code].count++;
        }
    }

    return stats;
}

// Upload image to Supabase Storage
export async function uploadHomeworkImage(file: File, studentId: string): Promise<string> {
    if (!supabase) throw new Error('Supabase not configured');

    const fileName = `${studentId}/${Date.now()}_${file.name}`;

    const { error } = await supabase.storage
        .from('homework-images')
        .upload(fileName, file);

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
        .from('homework-images')
        .getPublicUrl(fileName);

    return publicUrl;
}
