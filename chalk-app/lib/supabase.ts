import { createClient, SupabaseClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';

// Supabase 환경 변수
const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl || process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = Constants.expoConfig?.extra?.supabaseAnonKey || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

// 데모 모드: 환경 변수가 없으면 placeholder 사용
const DEMO_MODE = !supabaseUrl || !supabaseAnonKey;
const effectiveUrl = supabaseUrl || 'https://placeholder.supabase.co';
const effectiveKey = supabaseAnonKey || 'placeholder-key';

if (DEMO_MODE) {
    console.warn('[Supabase] Running in DEMO mode - data will not persist');
}

export const supabase: SupabaseClient = createClient(effectiveUrl, effectiveKey, {
    auth: {
        persistSession: !DEMO_MODE,
        autoRefreshToken: !DEMO_MODE,
    },
});

export const isDemoMode = DEMO_MODE;

// Database Types (will be generated from Supabase later)
export interface Session {
    id: string;
    student_id: string;
    student_name: string;
    subject: string;
    scheduled_time: string;
    duration_minutes: number;
    status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
    report_sent: boolean;
    created_at: string;
}

export interface Student {
    id: string;
    name: string;
    subject: string;
    parent_phone?: string;
    parent_email?: string;
    created_at: string;
}

export interface Report {
    id: string;
    session_id: string;
    content: string;
    ai_generated: boolean;
    sent_at?: string;
    created_at: string;
}
