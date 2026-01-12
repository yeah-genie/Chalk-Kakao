import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// ===================================
// RECALL BOT EDGE FUNCTION
// Zoom 미팅에 봇 참가시키기
// ===================================

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const RECALL_API_URL = 'https://us-east-1.recall.ai/api/v1';
const RECALL_API_KEY = Deno.env.get('RECALL_API_KEY');

interface CreateBotRequest {
    meetingUrl: string;
    sessionId?: string;
    studentName?: string;
    tutorId?: string;
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response(null, { headers: corsHeaders });
    }

    try {
        const { meetingUrl, sessionId, studentName, tutorId }: CreateBotRequest = await req.json();

        if (!meetingUrl) {
            return new Response(
                JSON.stringify({ error: 'Meeting URL is required' }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        // Zoom URL 검증
        const zoomPattern = /^https?:\/\/([\w-]+\.)?zoom\.us\/j\/\d+/;
        if (!zoomPattern.test(meetingUrl)) {
            return new Response(
                JSON.stringify({ error: 'Invalid Zoom URL format' }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        if (!RECALL_API_KEY) {
            // Demo mode
            return new Response(
                JSON.stringify({
                    botId: `demo_${Date.now()}`,
                    status: 'joining',
                    message: 'Demo mode - no Recall API key'
                }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        // Recall.ai 봇 생성
        const response = await fetch(`${RECALL_API_URL}/bot`, {
            method: 'POST',
            headers: {
                'Authorization': `Token ${RECALL_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                meeting_url: meetingUrl,
                bot_name: `Chalk - ${studentName || '수업 기록'}`,
                transcription_options: {
                    provider: 'recall',
                    mode: 'post_call',
                },
                metadata: {
                    session_id: sessionId,
                    student_name: studentName,
                    tutor_id: tutorId,
                },
                // 웹훅 설정
                webhook_url: Deno.env.get('RECALL_WEBHOOK_URL') || '',
            }),
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Recall API error: ${error}`);
        }

        const bot = await response.json();

        // Supabase에 세션 업데이트
        if (sessionId) {
            const supabase = createClient(
                Deno.env.get('SUPABASE_URL') || '',
                Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
            );

            await supabase
                .from('sessions')
                .update({
                    zoom_meeting_id: bot.id,
                    status: 'in_progress',
                    recording_url: null, // 나중에 웹훅에서 업데이트
                })
                .eq('id', sessionId);
        }

        return new Response(
            JSON.stringify({
                botId: bot.id,
                status: bot.status,
                joinUrl: bot.meeting_url,
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

    } catch (error: any) {
        console.error('Recall bot error:', error);
        return new Response(
            JSON.stringify({ error: error.message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
});
