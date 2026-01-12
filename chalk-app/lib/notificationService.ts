import { supabase } from './supabase';

// ===================================
// NOTIFICATION SERVICE
// 학부모 알림 발송 (SMS/이메일)
// ===================================

interface SendNotificationParams {
    to: string;
    message: string;
    method: 'sms' | 'email' | 'kakao';
    reportId?: string;
}

interface NotificationResult {
    success: boolean;
    messageId?: string;
    error?: string;
}

// 알림 발송 (Supabase Edge Function 호출)
export async function sendNotification(params: SendNotificationParams): Promise<NotificationResult> {
    try {
        const { data, error } = await supabase.functions.invoke('send-notification', {
            body: params,
        });

        if (error) throw error;

        return {
            success: true,
            messageId: data.messageId,
        };
    } catch (error: any) {
        console.error('[Notification] Send failed:', error);
        return {
            success: false,
            error: error.message || 'Failed to send notification',
        };
    }
}

// 리포트 발송 (학부모에게)
export async function sendReportToParent(
    reportId: string,
    parentPhone: string,
    parentEmail: string,
    message: string
): Promise<NotificationResult> {
    // 리포트 뷰 토큰 가져오기
    const { data: report } = await supabase
        .from('reports')
        .select('view_token')
        .eq('id', reportId)
        .single();

    if (!report) {
        return { success: false, error: 'Report not found' };
    }

    const reportUrl = `https://chalk.app/report/${report.view_token}`;
    const fullMessage = `${message}\n\n📄 리포트 보기: ${reportUrl}`;

    // SMS 우선, 실패 시 이메일
    if (parentPhone) {
        const smsResult = await sendNotification({
            to: parentPhone,
            message: fullMessage,
            method: 'sms',
            reportId,
        });

        if (smsResult.success) {
            await updateReportSendStatus(reportId, 'sms');
            return smsResult;
        }
    }

    if (parentEmail) {
        const emailResult = await sendNotification({
            to: parentEmail,
            message: fullMessage,
            method: 'email',
            reportId,
        });

        if (emailResult.success) {
            await updateReportSendStatus(reportId, 'email');
            return emailResult;
        }
    }

    return { success: false, error: 'No valid contact method' };
}

// 리포트 발송 상태 업데이트
async function updateReportSendStatus(reportId: string, method: string): Promise<void> {
    await supabase
        .from('reports')
        .update({
            sent_at: new Date().toISOString(),
            send_method: method,
            send_status: 'sent',
        })
        .eq('id', reportId);
}

// 수업 리마인더 발송
export async function sendLessonReminder(
    studentName: string,
    parentPhone: string,
    lessonTime: string,
    subject: string
): Promise<NotificationResult> {
    const message = `📚 수업 알림\n\n${studentName} 학생의 ${subject} 수업이 30분 후에 시작됩니다.\n\n시간: ${lessonTime}`;

    return sendNotification({
        to: parentPhone,
        message,
        method: 'sms',
    });
}

// 결제 요청 발송
export async function sendPaymentRequest(
    parentPhone: string,
    studentName: string,
    amount: number,
    paymentUrl: string
): Promise<NotificationResult> {
    const message = `💳 수업료 안내\n\n${studentName} 학생의 수업료 ₩${amount.toLocaleString()}원 결제 안내드립니다.\n\n결제하기: ${paymentUrl}`;

    return sendNotification({
        to: parentPhone,
        message,
        method: 'sms',
    });
}
