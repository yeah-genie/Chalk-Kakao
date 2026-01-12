import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// ===================================
// RECALL WEBHOOK EDGE FUNCTION
// 전사 결과 수신 및 AI 요약 생성
// ===================================

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

interface WebhookPayload {
    event: string;
    data: {
        bot_id: string;
        transcript?: TranscriptSegment[];
        metadata?: {
            session_id?: string;
            student_name?: string;
            tutor_id?: string;
            student_id?: string;
            subject_code?: string;
        };
    };
}

interface TranscriptSegment {
    speaker: string;
    words: string;
    start_time: number;
    end_time: number;
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response(null, { headers: corsHeaders });
    }

    try {
        const payload: WebhookPayload = await req.json();
        console.log('[Webhook] Received:', payload.event);

        // 전사 완료 이벤트만 처리
        if (payload.event !== 'bot.transcription.completed') {
            return new Response(JSON.stringify({ received: true }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        const { bot_id, transcript, metadata } = payload.data;
        const sessionId = metadata?.session_id;
        const studentName = metadata?.student_name;

        if (!transcript || transcript.length === 0) {
            console.log('[Webhook] No transcript received');
            return new Response(JSON.stringify({ error: 'No transcript' }), {
                status: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        // 전사 텍스트 합치기
        const fullTranscript = transcript
            .map(seg => `[${seg.speaker}] ${seg.words}`)
            .join('\n');

        // Gemini로 AI 요약 생성
        const report = await generateAIReport(fullTranscript, studentName || '학생');

        // Supabase에 저장
        const supabase = createClient(
            Deno.env.get('SUPABASE_URL') || '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
        );

        // 세션 업데이트
        if (sessionId) {
            await supabase
                .from('sessions')
                .update({
                    transcript: fullTranscript,
                    status: 'completed',
                })
                .eq('id', sessionId);
        }

        // 리포트 저장
        const { data: savedReport } = await supabase
            .from('reports')
            .insert({
                session_id: sessionId,
                tutor_id: metadata?.tutor_id,
                student_id: metadata?.student_id,
                content: report,
                formatted_message: formatReportForParent(report, studentName || '학생'),
                ai_generated: true,
            })
            .select()
            .single();

        // Mastery 데이터 업데이트
        if (report.mastery_updates && report.mastery_updates.length > 0 && metadata?.student_id) {
            for (const update of report.mastery_updates) {
                await supabase
                    .from('topic_mastery')
                    .upsert({
                        student_id: metadata.student_id,
                        tutor_id: metadata?.tutor_id,
                        topic_code: update.topic_code,
                        subject_code: metadata?.subject_code || 'UNKNOWN',
                        level: update.level,
                        evidence: [update.evidence], // 배열로 저장하여 누적 가능케 함 (향후 고도화 시)
                    }, { onConflict: 'student_id, topic_code' });
            }
        }

        // 학부모 발송 (옵션)
        if (savedReport) {
            await sendToParent(supabase, sessionId, savedReport.id);
        }

        return new Response(
            JSON.stringify({
                success: true,
                reportId: savedReport?.id,
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

    } catch (error: any) {
        console.error('[Webhook] Error:', error);
        return new Response(
            JSON.stringify({ error: error.message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
});

// AI 리포트 생성
async function generateAIReport(transcript: string, studentName: string) {
    if (!GEMINI_API_KEY) {
        return getDemoReport(studentName);
    }

    const prompt = `
당신은 전문 과외 선생님입니다. 아래 수업 전사 내용을 분석하여 학부모에게 보낼 수업 리포트를 작성해주세요.

[학생]: ${studentName}
[수업 전사]:
${transcript.slice(0, 8000)}

다음 JSON 형식으로 응답해주세요:
{
    "summary": "수업 전체 요약 (2-3문장)",
    "topics": ["오늘 배운 주제들"],
    "strengths": ["학생이 잘한 점들"],
    "improvements": ["개선이 필요한 부분"],
    "homework": "과제 (있다면)",
    "nextPlan": "다음 수업 계획",
    "mastery_updates": [
        {
            "topic_code": "정확한 토픽 코드 (예: limits.definition)",
            "level": 0-100 사이의 점수,
            "evidence": "해당 점수를 부여한 근거가 되는 학생의 발언이나 행동"
        }
    ]
}
`;

    try {
        const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 1024,
                },
            }),
        });

        const result = await response.json();
        const text = result.candidates?.[0]?.content?.parts?.[0]?.text || '';

        // JSON 파싱
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }
    } catch (error) {
        console.error('[Gemini] Error:', error);
    }

    return getDemoReport(studentName);
}

// 데모 리포트
function getDemoReport(studentName: string) {
    return {
        summary: `${studentName} 학생이 이차함수의 꼭짓점과 축의 방정식에 대해 학습했습니다. 개념 이해가 빠르고 응용 문제도 잘 풀었습니다.`,
        topics: ['이차함수의 꼭짓점', '축의 방정식', '그래프 그리기'],
        strengths: ['개념 이해가 빠름', '계산 정확도가 높음', '질문을 적극적으로 함'],
        improvements: ['응용 문제 연습이 더 필요함'],
        homework: '교과서 p.45-47 연습문제',
        nextPlan: '이차함수의 최댓값과 최솟값',
    };
}

// 학부모용 메시지 포맷
function formatReportForParent(report: any, studentName: string): string {
    return `📚 ${studentName} 수업 리포트

✨ 요약
${report.summary}

📖 오늘 배운 내용
${report.topics.map((t: string) => `• ${t}`).join('\n')}

⭐ 잘한 점
${report.strengths.map((s: string) => `• ${s}`).join('\n')}

💡 개선점
${report.improvements.map((i: string) => `• ${i}`).join('\n')}

📋 과제
${report.homework || '없음'}

🎯 다음 수업
${report.nextPlan || '미정'}

- Chalk 과외 관리`;
}

// 학부모에게 발송
async function sendToParent(supabase: any, sessionId: string | undefined, reportId: string) {
    if (!sessionId) return;

    // 세션에서 학생 정보 가져오기
    const { data: session } = await supabase
        .from('sessions')
        .select('student_id')
        .eq('id', sessionId)
        .single();

    if (!session?.student_id) return;

    // 학생의 학부모 연락처 가져오기
    const { data: student } = await supabase
        .from('students')
        .select('parent_phone, parent_email')
        .eq('id', session.student_id)
        .single();

    if (!student?.parent_phone && !student?.parent_email) {
        console.log('[Webhook] No parent contact info');
        return;
    }

    // 알림 발송 Edge Function 호출
    await supabase.functions.invoke('send-notification', {
        body: {
            to: student.parent_phone || student.parent_email,
            method: student.parent_phone ? 'sms' : 'email',
            reportId,
        },
    });
}
