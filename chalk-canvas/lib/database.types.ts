// Auto-generated types for Supabase
// This should be regenerated using: npx supabase gen types typescript

export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            tutors: {
                Row: {
                    id: string
                    email: string
                    name: string
                    portfolio_slug: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    email: string
                    name: string
                    portfolio_slug?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    email?: string
                    name?: string
                    portfolio_slug?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            students: {
                Row: {
                    id: string
                    tutor_id: string | null
                    name: string
                    grade: string | null
                    parent_email: string | null
                    notes: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    tutor_id?: string | null
                    name: string
                    grade?: string | null
                    parent_email?: string | null
                    notes?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    tutor_id?: string | null
                    name?: string
                    grade?: string | null
                    parent_email?: string | null
                    notes?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            submissions: {
                Row: {
                    id: string
                    student_id: string | null
                    image_url: string
                    problem_text: string | null
                    correct_answer: string | null
                    status: 'pending' | 'analyzing' | 'completed' | 'error'
                    created_at: string
                }
                Insert: {
                    id?: string
                    student_id?: string | null
                    image_url: string
                    problem_text?: string | null
                    correct_answer?: string | null
                    status?: 'pending' | 'analyzing' | 'completed' | 'error'
                    created_at?: string
                }
                Update: {
                    id?: string
                    student_id?: string | null
                    image_url?: string
                    problem_text?: string | null
                    correct_answer?: string | null
                    status?: 'pending' | 'analyzing' | 'completed' | 'error'
                    created_at?: string
                }
            }
            analyses: {
                Row: {
                    id: string
                    submission_id: string | null
                    recognized_text: string | null
                    steps: Json | null
                    error_step: number | null
                    misconception_code: string | null
                    misconception_name: string | null
                    error_type: 'conceptual' | 'procedural' | 'factual' | 'careless' | null
                    description: string | null
                    recommendation: string | null
                    overall_feedback: string | null
                    confidence: number | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    submission_id?: string | null
                    recognized_text?: string | null
                    steps?: Json | null
                    error_step?: number | null
                    misconception_code?: string | null
                    misconception_name?: string | null
                    error_type?: 'conceptual' | 'procedural' | 'factual' | 'careless' | null
                    description?: string | null
                    recommendation?: string | null
                    overall_feedback?: string | null
                    confidence?: number | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    submission_id?: string | null
                    recognized_text?: string | null
                    steps?: Json | null
                    error_step?: number | null
                    misconception_code?: string | null
                    misconception_name?: string | null
                    error_type?: 'conceptual' | 'procedural' | 'factual' | 'careless' | null
                    description?: string | null
                    recommendation?: string | null
                    overall_feedback?: string | null
                    confidence?: number | null
                    created_at?: string
                }
            }
            error_patterns: {
                Row: {
                    id: string
                    student_id: string | null
                    period_start: string
                    period_end: string
                    total_submissions: number
                    conceptual_count: number
                    procedural_count: number
                    factual_count: number
                    careless_count: number
                    top_misconceptions: Json | null
                    habit_diagnosis: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    student_id?: string | null
                    period_start: string
                    period_end: string
                    total_submissions?: number
                    conceptual_count?: number
                    procedural_count?: number
                    factual_count?: number
                    careless_count?: number
                    top_misconceptions?: Json | null
                    habit_diagnosis?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    student_id?: string | null
                    period_start?: string
                    period_end?: string
                    total_submissions?: number
                    conceptual_count?: number
                    procedural_count?: number
                    factual_count?: number
                    careless_count?: number
                    top_misconceptions?: Json | null
                    habit_diagnosis?: string | null
                    created_at?: string
                }
            }
        }
        Views: {
            student_recent_analyses: {
                Row: {
                    student_id: string | null
                    student_name: string | null
                    submission_id: string | null
                    error_type: string | null
                    misconception_code: string | null
                    misconception_name: string | null
                    created_at: string | null
                }
            }
            tutor_error_stats: {
                Row: {
                    tutor_id: string | null
                    tutor_name: string | null
                    student_id: string | null
                    student_name: string | null
                    total_analyses: number | null
                    conceptual_count: number | null
                    procedural_count: number | null
                    factual_count: number | null
                    careless_count: number | null
                }
            }
        }
        Functions: Record<string, never>
        Enums: Record<string, never>
    }
}
