import { create } from 'zustand';
import { supabase, Session, Student, isDemoMode } from './supabase';

// ===================================
// CHALK 2.0 - ZUSTAND STORE
// Zero-Action 철학: 데이터는 자동으로 동기화
// ===================================

interface AppState {
    // 인증 상태
    isAuthenticated: boolean;
    userId: string | null;
    user: any | null;

    // 수업 데이터
    sessions: Session[];
    liveSession: Session | null;
    todaySessions: Session[];

    // 학생 데이터
    students: Student[];
    selectedStudent: Student | null;

    // 온보딩 데이터
    selectedSubjectId: string | null;

    // 주간 통계
    weeklyStats: {
        sessionCount: number;
        totalHours: number;
        totalIncome: number;
    };

    // 로딩 상태
    isLoading: boolean;

    // 액션
    fetchSessions: () => Promise<void>;
    fetchStudents: () => Promise<void>;
    setLiveSession: (session: Session | null) => void;
    setSelectedStudent: (student: Student | null) => void;
    setSelectedSubjectId: (subjectId: string | null) => void;
    addStudent: (student: Student) => void;
    setUser: (user: any) => void;
    refreshAll: () => Promise<void>;
    signOut: () => Promise<void>;
}

// Demo Data (Supabase 연결 전 사용)
const DEMO_SESSIONS: Session[] = [
    {
        id: '1',
        student_id: '1',
        student_name: 'Alex Kim',
        subject: 'Math',
        scheduled_time: new Date().toISOString(),
        duration_minutes: 60,
        status: 'in_progress',
        report_sent: false,
        created_at: new Date().toISOString(),
    },
    {
        id: '2',
        student_id: '2',
        student_name: 'Sarah Lee',
        subject: '영어',
        scheduled_time: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        duration_minutes: 60,
        status: 'completed',
        report_sent: true,
        created_at: new Date().toISOString(),
    },
    {
        id: '3',
        student_id: '3',
        student_name: 'Jake Park',
        subject: '수학',
        scheduled_time: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
        duration_minutes: 60,
        status: 'scheduled',
        report_sent: false,
        created_at: new Date().toISOString(),
    },
];

const DEMO_STUDENTS: Student[] = [
    { id: '1', name: 'Alex Kim', subject: 'Math', created_at: new Date().toISOString() },
    { id: '2', name: 'Sarah Lee', subject: '영어', created_at: new Date().toISOString() },
    { id: '3', name: 'Jake Park', subject: '수학', created_at: new Date().toISOString() },
];

// Helper: 오늘 날짜의 세션만 필터링
const getTodaySessions = (sessions: Session[]): Session[] => {
    const today = new Date().toDateString();
    return sessions.filter(s => new Date(s.scheduled_time).toDateString() === today);
};

// Helper: 진행 중인 세션 찾기
const findLiveSession = (sessions: Session[]): Session | null => {
    return sessions.find(s => s.status === 'in_progress') || null;
};

// Helper: 주간 통계 계산
const calculateWeeklyStats = (sessions: Session[]) => {
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const weekSessions = sessions.filter(s =>
        new Date(s.scheduled_time) >= oneWeekAgo && s.status === 'completed'
    );

    return {
        sessionCount: weekSessions.length,
        totalHours: weekSessions.reduce((sum, s) => sum + s.duration_minutes, 0) / 60,
        totalIncome: weekSessions.length * 45000, // 임시: 시간당 45,000원
    };
};

export const useStore = create<AppState>((set, get) => ({
    // 초기 상태
    isAuthenticated: false,
    userId: null,
    user: null,
    sessions: DEMO_SESSIONS,
    liveSession: findLiveSession(DEMO_SESSIONS),
    todaySessions: getTodaySessions(DEMO_SESSIONS),
    students: DEMO_STUDENTS,
    selectedStudent: null,
    selectedSubjectId: null,
    weeklyStats: calculateWeeklyStats(DEMO_SESSIONS),
    isLoading: false,

    // 세션 데이터 가져오기
    fetchSessions: async () => {
        if (isDemoMode) {
            console.log('[Store] Demo mode: Skipping session fetch');
            return;
        }

        set({ isLoading: true });
        try {
            const { data, error } = await supabase
                .from('sessions')
                .select('*')
                .order('scheduled_time', { ascending: false });

            if (error) throw error;

            const sessions = data || DEMO_SESSIONS;
            set({
                sessions,
                liveSession: findLiveSession(sessions),
                todaySessions: getTodaySessions(sessions),
                weeklyStats: calculateWeeklyStats(sessions),
            });
        } catch (error) {
            console.log('[Store] Error fetching sessions:', error);
        } finally {
            set({ isLoading: false });
        }
    },

    // 학생 데이터 가져오기
    fetchStudents: async () => {
        if (isDemoMode) {
            console.log('[Store] Demo mode: Skipping student fetch');
            return;
        }

        try {
            const { data, error } = await supabase
                .from('students')
                .select('*')
                .order('name');

            if (error) throw error;
            set({ students: data || DEMO_STUDENTS });
        } catch (error) {
            console.log('[Store] Error fetching students:', error);
        }
    },

    // 라이브 세션 설정
    setLiveSession: (session) => {
        set({ liveSession: session });
    },

    // 선택된 학생 설정
    setSelectedStudent: (student) => {
        set({ selectedStudent: student });
    },

    // 선택된 과목 설정 (온보딩)
    setSelectedSubjectId: (subjectId) => {
        set({ selectedSubjectId: subjectId });
    },

    // 학생 추가 (Demo mode용)
    addStudent: (student) => {
        set((state) => ({
            students: [...state.students, student],
        }));
    },

    // 사용자 설정
    setUser: (user) => {
        set({ user, isAuthenticated: !!user, userId: user?.id || null });
    },

    // 전체 새로고침
    refreshAll: async () => {
        const { fetchSessions, fetchStudents } = get();
        await Promise.all([fetchSessions(), fetchStudents()]);
    },

    // 로그아웃
    signOut: async () => {
        await supabase.auth.signOut();
        set({
            isAuthenticated: false,
            userId: null,
            user: null,
        });
    },
}));
