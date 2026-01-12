import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

// ===================================
// SEND NOTIFICATION EDGE FUNCTION
// SMS/이메일 발송 처리
// ===================================

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NotificationRequest {
    to: string;
    message: string;
    method: 'sms' | 'email' | 'kakao';
    reportId?: string;
}

serve(async (req) => {
    // CORS preflight
    if (req.method === 'OPTIONS') {
        return new Response(null, { headers: corsHeaders });
    }

    try {
        const { to, message, method, reportId }: NotificationRequest = await req.json();

        if (!to || !message || !method) {
            return new Response(
                JSON.stringify({ error: 'Missing required fields' }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        let result;

        switch (method) {
            case 'sms':
                result = await sendSMS(to, message);
                break;
            case 'email':
                result = await sendEmail(to, message);
                break;
            case 'kakao':
                result = await sendKakao(to, message);
                break;
            default:
                throw new Error('Unsupported method');
        }

        return new Response(
            JSON.stringify({ success: true, messageId: result.messageId }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    } catch (error: any) {
        console.error('Notification error:', error);
        return new Response(
            JSON.stringify({ error: error.message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
});

// SMS 발송 (알리고 API)
async function sendSMS(to: string, message: string) {
    const ALIGO_API_KEY = Deno.env.get('ALIGO_API_KEY');
    const ALIGO_USER_ID = Deno.env.get('ALIGO_USER_ID');
    const ALIGO_SENDER = Deno.env.get('ALIGO_SENDER');

    if (!ALIGO_API_KEY || !ALIGO_USER_ID || !ALIGO_SENDER) {
        console.log('[SMS] Demo mode - API keys not configured');
        return { messageId: 'demo_' + Date.now() };
    }

    const formData = new FormData();
    formData.append('key', ALIGO_API_KEY);
    formData.append('user_id', ALIGO_USER_ID);
    formData.append('sender', ALIGO_SENDER);
    formData.append('receiver', to.replace(/-/g, ''));
    formData.append('msg', message);
    formData.append('msg_type', 'LMS'); // 장문 메시지

    const response = await fetch('https://apis.aligo.in/send/', {
        method: 'POST',
        body: formData,
    });

    const result = await response.json();

    if (result.result_code !== '1') {
        throw new Error(result.message || 'SMS send failed');
    }

    return { messageId: result.msg_id };
}

// 이메일 발송 (SendGrid API)
async function sendEmail(to: string, message: string) {
    const SENDGRID_API_KEY = Deno.env.get('SENDGRID_API_KEY');
    const FROM_EMAIL = Deno.env.get('FROM_EMAIL') || 'noreply@chalk.app';

    if (!SENDGRID_API_KEY) {
        console.log('[Email] Demo mode - API key not configured');
        return { messageId: 'demo_' + Date.now() };
    }

    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${SENDGRID_API_KEY}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            personalizations: [{ to: [{ email: to }] }],
            from: { email: FROM_EMAIL, name: 'Chalk' },
            subject: '📚 수업 리포트가 도착했습니다',
            content: [
                { type: 'text/plain', value: message },
                { type: 'text/html', value: message.replace(/\n/g, '<br>') },
            ],
        }),
    });

    if (!response.ok) {
        throw new Error('Email send failed');
    }

    return { messageId: response.headers.get('x-message-id') || Date.now().toString() };
}

// 카카오톡 발송 (카카오 알림톡)
async function sendKakao(to: string, message: string) {
    // 카카오 알림톡 API 구현 (비즈니스 계정 필요)
    console.log('[Kakao] Demo mode - not implemented');
    return { messageId: 'demo_kakao_' + Date.now() };
}
