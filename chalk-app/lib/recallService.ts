import { supabase, isDemoMode } from './supabase';

// ===================================
// RECALL.AI SERVICE
// Zoom Bot 자동 참가 및 전사
// ===================================

const RECALL_API_URL = 'https://us-east-1.recall.ai/api/v1';
const RECALL_API_KEY = process.env.EXPO_PUBLIC_RECALL_API_KEY || '';

interface BotConfig {
    meetingUrl: string;
    botName?: string;
    sessionId?: string;
    studentName?: string;
}

interface Bot {
    id: string;
    status: 'joining' | 'in_call' | 'done' | 'error';
    meeting_url: string;
    created_at: string;
}

interface TranscriptSegment {
    speaker: string;
    words: string;
    start_time: number;
    end_time: number;
}

// 봇 생성 (미팅 참가 요청)
export async function createBot(config: BotConfig): Promise<Bot | null> {
    if (isDemoMode) {
        console.log('[Recall] Demo mode - creating demo bot');
        return createDemoBot(config);
    }

    try {
        console.log('[Recall] Invoking recall-bot edge function...');
        const { data, error } = await supabase.functions.invoke('recall-bot', {
            body: {
                meetingUrl: config.meetingUrl,
                sessionId: config.sessionId,
                studentName: config.studentName,
                // tutorId: getUserId() // TODO: get current user id
            },
        });

        if (error) throw error;

        console.log('[Recall] Bot created successfully:', data);
        return {
            id: data.botId,
            status: data.status,
            meeting_url: config.meetingUrl,
            created_at: new Date().toISOString(),
        } as Bot;
    } catch (error) {
        console.error('[Recall] Create bot via edge function failed:', error);
        // Fallback to local demo bot for UX if desired, 
        // but since it's Phase 3 we should probably report the error.
        return null;
    }
}

// 봇 상태 조회
export async function getBotStatus(botId: string): Promise<Bot | null> {
    if (!RECALL_API_KEY) {
        return { id: botId, status: 'in_call', meeting_url: '', created_at: new Date().toISOString() };
    }

    try {
        const response = await fetch(`${RECALL_API_URL}/bot/${botId}`, {
            headers: {
                'Authorization': `Token ${RECALL_API_KEY}`,
            },
        });

        if (!response.ok) return null;
        return response.json();
    } catch (error) {
        console.error('[Recall] Get bot status failed:', error);
        return null;
    }
}

// 전사 결과 가져오기
export async function getTranscript(botId: string): Promise<TranscriptSegment[]> {
    if (!RECALL_API_KEY) {
        return getDemoTranscript();
    }

    try {
        const response = await fetch(`${RECALL_API_URL}/bot/${botId}/transcript`, {
            headers: {
                'Authorization': `Token ${RECALL_API_KEY}`,
            },
        });

        if (!response.ok) return [];
        const data = await response.json();
        return data.transcript || [];
    } catch (error) {
        console.error('[Recall] Get transcript failed:', error);
        return [];
    }
}

// 봇 종료 (수동으로 미팅에서 나가기)
export async function leaveBot(botId: string): Promise<boolean> {
    if (!RECALL_API_KEY) return true;

    try {
        const response = await fetch(`${RECALL_API_URL}/bot/${botId}/leave_call`, {
            method: 'POST',
            headers: {
                'Authorization': `Token ${RECALL_API_KEY}`,
            },
        });

        return response.ok;
    } catch (error) {
        console.error('[Recall] Leave bot failed:', error);
        return false;
    }
}

// Zoom URL 유효성 검사
export function isValidZoomUrl(url: string): boolean {
    const zoomPattern = /^https?:\/\/([\w-]+\.)?zoom\.us\/j\/\d+/;
    return zoomPattern.test(url);
}

// 전사 텍스트를 하나의 문자열로 합치기
export function transcriptToText(segments: TranscriptSegment[]): string {
    return segments
        .map(seg => `[${seg.speaker}] ${seg.words}`)
        .join('\n');
}

// ===================================
// DEMO MODE
// ===================================

function createDemoBot(config: BotConfig): Bot {
    return {
        id: `demo_bot_${Date.now()}`,
        status: 'joining',
        meeting_url: config.meetingUrl,
        created_at: new Date().toISOString(),
    };
}

function getDemoTranscript(): TranscriptSegment[] {
    return [
        { speaker: '선생님', words: '오늘은 이차함수의 꼭짓점과 축의 방정식을 배워볼게요.', start_time: 0, end_time: 5 },
        { speaker: '학생', words: '네, 선생님.', start_time: 5, end_time: 7 },
        { speaker: '선생님', words: 'y = ax² + bx + c 형태에서 꼭짓점을 찾는 공식이 뭐였죠?', start_time: 7, end_time: 12 },
        { speaker: '학생', words: '음... -b/2a 인가요?', start_time: 12, end_time: 15 },
        { speaker: '선생님', words: '맞아요! x좌표가 -b/2a이고, y좌표는 그걸 대입하면 돼요. 잘 기억하고 있네요.', start_time: 15, end_time: 22 },
        { speaker: '선생님', words: '자, 이제 연습문제를 풀어볼까요? y = 2x² - 8x + 6의 꼭짓점을 구해보세요.', start_time: 22, end_time: 30 },
        { speaker: '학생', words: 'a=2, b=-8이니까... x = 8/4 = 2... 꼭짓점은 (2, -2)인가요?', start_time: 30, end_time: 45 },
        { speaker: '선생님', words: '정확해요! 아주 잘했어요. 다음 문제도 같은 방식으로 풀어보세요.', start_time: 45, end_time: 52 },
    ];
}
