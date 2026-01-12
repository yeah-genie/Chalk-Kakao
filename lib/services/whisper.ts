"use server";

/**
 * OpenAI Whisper STT Service
 * 음성 파일 → 텍스트 변환
 */

const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';
const WHISPER_API_URL = 'https://api.openai.com/v1/audio/transcriptions';

export interface TranscriptionResult {
    success: boolean;
    transcript?: string;
    segments?: any[];
    language?: string;
    duration?: number;
    error?: string;
}

/**
 * Transcribe audio using OpenAI Whisper API
 * Supports: webm, mp3, mp4, m4a, wav, mpeg
 */
export async function transcribeAudio(audioBlob: Blob): Promise<TranscriptionResult> {
    // Check for API key
    if (!OPENAI_API_KEY) {
        console.warn('[Whisper] No OPENAI_API_KEY - using demo mode');
        return getDemoTranscription();
    }

    try {
        // Convert Blob to File for FormData
        const audioFile = new File([audioBlob], 'recording.webm', {
            type: audioBlob.type || 'audio/webm'
        });

        const formData = new FormData();
        formData.append('file', audioFile);
        formData.append('model', 'whisper-1');
        formData.append('response_format', 'verbose_json');
        formData.append('language', 'ko'); // Optimized for Korean tutoringcontext

        const response = await fetch(WHISPER_API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${OPENAI_API_KEY}`,
            },
            body: formData,
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(
                `Whisper API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`
            );
        }

        const data = await response.json();

        return {
            success: true,
            transcript: data.text || '',
            segments: data.segments,
            language: data.language,
            duration: data.duration,
        };
    } catch (error) {
        console.error('[Whisper] Transcription error:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Transcription failed',
        };
    }
}

/**
 * Demo transcription for development/testing
 */
function getDemoTranscription(): TranscriptionResult {
    const demoTranscripts = [
        "선생님, 오늘 배운 극한값이 무한대로 발산할 때랑 특정 값으로 수렴할 때의 차이가 아직 조금 헷갈려요. 그래프로 그릴 때는 알겠는데 수식으로 풀면 자꾸 실수하게 되네요.",
        "SAT Math에서 이차함수 그래프의 꼭짓점 찾는 공식을 다시 복습했어요. 표준형으로 바꾸는 과정에서 부호 실수가 있었지만 이제는 확실히 이해한 것 같습니다.",
        "AP Calculus의 연쇄법칙(Chain Rule)을 삼각함수에 적용하는 문제를 풀었습니다. 합성함수의 미분을 할 때 겉함수와 속함수를 구분하는 연습이 더 필요할 것 같아요."
    ];

    // Randomly select a demo transcript
    const transcript = demoTranscripts[Math.floor(Math.random() * demoTranscripts.length)];

    return {
        success: true,
        transcript,
        language: 'ko',
        duration: 180, // ~3 minutes simulated
    };
}
