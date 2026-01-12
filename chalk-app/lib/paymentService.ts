import { supabase, Session } from './supabase';

// ===================================
// PAYMENT SERVICE
// 결제 및 정산 추적
// ===================================

export interface Payment {
    id: string;
    tutor_id: string;
    student_id: string;
    session_id?: string;
    amount: number;
    currency: string;
    method: 'stripe' | 'bank_transfer' | 'cash' | 'other';
    status: 'pending' | 'completed' | 'refunded' | 'failed';
    paid_at?: string;
    created_at: string;
}

export interface PaymentSummary {
    totalEarnings: number;
    pendingPayments: number;
    completedPayments: number;
    thisMonthEarnings: number;
    lastMonthEarnings: number;
}

// 결제 생성
export async function createPayment(payment: Omit<Payment, 'id' | 'created_at'>): Promise<Payment | null> {
    const { data, error } = await supabase
        .from('payments')
        .insert(payment)
        .select()
        .single();

    if (error) {
        console.error('[Payment] Create failed:', error);
        return null;
    }

    return data;
}

// 결제 상태 업데이트
export async function updatePaymentStatus(
    paymentId: string,
    status: Payment['status'],
    paidAt?: string
): Promise<boolean> {
    const { error } = await supabase
        .from('payments')
        .update({
            status,
            paid_at: paidAt || (status === 'completed' ? new Date().toISOString() : null)
        })
        .eq('id', paymentId);

    if (error) {
        console.error('[Payment] Update failed:', error);
        return false;
    }

    return true;
}

// 수업에 결제 연결
export async function linkPaymentToSession(sessionId: string, amount: number): Promise<void> {
    const { error } = await supabase
        .from('sessions')
        .update({
            amount,
            payment_status: 'pending'
        })
        .eq('id', sessionId);

    if (error) {
        console.error('[Payment] Link to session failed:', error);
    }
}

// 월간 정산 요약 가져오기
export async function getPaymentSummary(tutorId: string): Promise<PaymentSummary> {
    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    try {
        // 전체 완료된 결제
        const { data: completedPayments } = await supabase
            .from('payments')
            .select('amount')
            .eq('tutor_id', tutorId)
            .eq('status', 'completed');

        // 대기 중인 결제
        const { data: pendingPayments } = await supabase
            .from('payments')
            .select('amount')
            .eq('tutor_id', tutorId)
            .eq('status', 'pending');

        // 이번 달 수입
        const { data: thisMonthPayments } = await supabase
            .from('payments')
            .select('amount')
            .eq('tutor_id', tutorId)
            .eq('status', 'completed')
            .gte('paid_at', thisMonthStart.toISOString());

        // 지난 달 수입
        const { data: lastMonthPayments } = await supabase
            .from('payments')
            .select('amount')
            .eq('tutor_id', tutorId)
            .eq('status', 'completed')
            .gte('paid_at', lastMonthStart.toISOString())
            .lte('paid_at', lastMonthEnd.toISOString());

        const sumAmounts = (payments: any[] | null) =>
            (payments || []).reduce((sum, p) => sum + (p.amount || 0), 0);

        return {
            totalEarnings: sumAmounts(completedPayments),
            pendingPayments: sumAmounts(pendingPayments),
            completedPayments: (completedPayments || []).length,
            thisMonthEarnings: sumAmounts(thisMonthPayments),
            lastMonthEarnings: sumAmounts(lastMonthPayments),
        };
    } catch (error) {
        console.error('[Payment] Summary failed:', error);
        return {
            totalEarnings: 0,
            pendingPayments: 0,
            completedPayments: 0,
            thisMonthEarnings: 0,
            lastMonthEarnings: 0,
        };
    }
}

// 학생별 미결제 수업 조회
export async function getUnpaidSessions(tutorId: string): Promise<Session[]> {
    const { data, error } = await supabase
        .from('sessions')
        .select('*')
        .eq('tutor_id', tutorId)
        .eq('status', 'completed')
        .eq('payment_status', 'pending')
        .order('scheduled_time', { ascending: false });

    if (error) {
        console.error('[Payment] Get unpaid sessions failed:', error);
        return [];
    }

    return data || [];
}

// 월간 리포트 생성 (세금 신고용)
export async function generateMonthlyReport(tutorId: string, year: number, month: number): Promise<{
    totalSessions: number;
    totalEarnings: number;
    totalHours: number;
    studentBreakdown: { studentName: string; sessions: number; amount: number }[];
}> {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const { data: sessions } = await supabase
        .from('sessions')
        .select('*, student:students(name)')
        .eq('tutor_id', tutorId)
        .eq('status', 'completed')
        .gte('scheduled_time', startDate.toISOString())
        .lte('scheduled_time', endDate.toISOString());

    if (!sessions) {
        return {
            totalSessions: 0,
            totalEarnings: 0,
            totalHours: 0,
            studentBreakdown: [],
        };
    }

    const studentMap = new Map<string, { sessions: number; amount: number }>();

    for (const session of sessions) {
        const studentName = (session.student as any)?.name || session.student_name;
        const existing = studentMap.get(studentName) || { sessions: 0, amount: 0 };
        studentMap.set(studentName, {
            sessions: existing.sessions + 1,
            amount: existing.amount + (session.amount || 0),
        });
    }

    return {
        totalSessions: sessions.length,
        totalEarnings: sessions.reduce((sum, s) => sum + (s.amount || 0), 0),
        totalHours: sessions.reduce((sum, s) => sum + (s.duration_minutes || 0), 0) / 60,
        studentBreakdown: Array.from(studentMap.entries()).map(([studentName, data]) => ({
            studentName,
            ...data,
        })),
    };
}
