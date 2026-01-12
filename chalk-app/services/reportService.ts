import { supabase, Session } from '../lib/supabase';

// ===================================
// GEMINI AI REPORT GENERATION
// Zero-Action: 수업 후 리포트 자동 생성
// ===================================

const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || '';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

interface ReportContent {
    summary: string;
    topics: string[];
    strengths: string[];
    improvements: string[];
    homework?: string;
    nextPlan?: string;
}

interface GenerateReportParams {
    session: Session;
    transcript?: string;
    notes?: string;
}

// 리포트 생성
export async function generateReport({ session, transcript, notes }: GenerateReportParams): Promise<ReportContent> {
    // API 키가 없으면 데모 리포트 반환
    if (!GEMINI_API_KEY) {
        console.log('[AI] Demo mode - using sample report');
        return generateDemoReport(session);
    }

    try {
        const prompt = buildPrompt(session, transcript, notes);

        const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: prompt }]
                }],
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 1024,
                },
            }),
        });

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!text) {
            throw new Error('No content in response');
        }

        return parseReportResponse(text);
    } catch (error) {
        console.error('[AI] Report generation failed:', error);
        return generateDemoReport(session);
    }
}

// 프롬프트 생성
function buildPrompt(session: Session, transcript?: string, notes?: string): string {
    return `
당신은 전문 과외 선생님의 수업 리포트를 작성하는 AI 어시스턴트입니다.
학부모가 읽을 수 있도록 친절하고 전문적인 톤으로 작성해주세요.

## 수업 정보
- 학생: ${session.student_name}
- 과목: ${session.subject}
- 수업 시간: ${session.duration_minutes}분
- 날짜: ${new Date(session.scheduled_time).toLocaleDateString('ko-KR')}

${transcript ? `## 수업 내용 (전사)\n${transcript}` : ''}
${notes ? `## 선생님 메모\n${notes}` : ''}

## 요청
다음 JSON 형식으로 수업 리포트를 작성해주세요:

{
    "summary": "수업 전체 내용 요약 (2-3문장)",
    "topics": ["오늘 배운 주제들 (리스트)"],
    "strengths": ["학생이 잘한 점 (리스트)"],
    "improvements": ["개선이 필요한 부분 (리스트)"],
    "homework": "과제 내용 (있는 경우)",
    "nextPlan": "다음 수업 계획"
}

JSON만 반환해주세요.
`.trim();
}

// 응답 파싱
function parseReportResponse(text: string): ReportContent {
    try {
        // JSON 블록 추출
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }
        throw new Error('No JSON found');
    } catch (error) {
        console.error('[AI] Parse error:', error);
        return {
            summary: text.slice(0, 200),
            topics: [],
            strengths: [],
            improvements: [],
        };
    }
}

// 데모 리포트 생성
function generateDemoReport(session: Session): ReportContent {
    const demoReports: Record<string, ReportContent> = {
        'Math': {
            summary: `오늘 ${session.student_name} 학생과 ${session.duration_minutes}분간 수학 수업을 진행했습니다. 이차방정식의 근의 공식을 집중적으로 다루었고, 학생이 빠르게 이해했습니다.`,
            topics: ['이차방정식의 근의 공식', '판별식 활용', '복소수 근'],
            strengths: ['공식 암기가 빠름', '계산 정확도가 높음', '질문을 적극적으로 함'],
            improvements: ['풀이 과정 정리 필요', '응용 문제 연습 더 필요'],
            homework: '교재 p.45-48 연습문제',
            nextPlan: '근과 계수의 관계',
        },
        '영어': {
            summary: `오늘 ${session.student_name} 학생과 영어 수업을 진행했습니다. 리딩 컴프리헨션과 문법을 다루었으며, 특히 관계대명사 부분에서 많은 발전이 있었습니다.`,
            topics: ['관계대명사 (who, which, that)', '리딩 지문 해석', '어휘 학습'],
            strengths: ['발음이 좋아짐', '지문 이해력 향상', '새로운 어휘 습득이 빠름'],
            improvements: ['문법 규칙 정리 필요', '작문 연습 추가 필요'],
            homework: '단어장 Day 15-20 암기',
            nextPlan: '관계부사와 접속사',
        },
        '수학': {
            summary: `오늘 ${session.student_name} 학생과 함께 열심히 수학 공부를 했습니다. 함수의 그래프와 이동에 대해 배웠고, 개념 이해가 빨랐습니다.`,
            topics: ['일차함수 그래프', '평행이동', '대칭이동'],
            strengths: ['그래프 그리기가 정확함', '개념 이해가 빠름'],
            improvements: ['좌표 계산 실수 주의', '문제 풀이 속도 향상 필요'],
            homework: '문제집 3단원 복습',
            nextPlan: '이차함수 그래프 도입',
        },
    };

    return demoReports[session.subject] || {
        summary: `오늘 ${session.student_name} 학생과 ${session.subject} 수업을 ${session.duration_minutes}분간 진행했습니다.`,
        topics: ['오늘의 학습 내용'],
        strengths: ['열심히 참여함'],
        improvements: ['복습이 필요함'],
        homework: '교재 복습',
        nextPlan: '다음 단원 진도',
    };
}

// 리포트를 학부모용 메시지로 포맷팅
export function formatReportForParent(report: ReportContent, session: Session): string {
    const date = new Date(session.scheduled_time).toLocaleDateString('ko-KR', {
        month: 'long',
        day: 'numeric',
        weekday: 'long',
    });

    return `
📚 ${session.student_name} 학생 수업 리포트
━━━━━━━━━━━━━━━━━━━━
📅 ${date} | ${session.subject}

${report.summary}

✅ 오늘 배운 내용
${report.topics.map(t => `• ${t}`).join('\n')}

⭐ 잘한 점
${report.strengths.map(s => `• ${s}`).join('\n')}

📝 과제
${report.homework || '없음'}

💡 다음 수업 계획
${report.nextPlan || '추후 안내 드리겠습니다'}

━━━━━━━━━━━━━━━━━━━━
Chalk 과외 관리 서비스
`.trim();
}

// Supabase에 리포트 저장
export async function saveReport(sessionId: string, report: ReportContent): Promise<void> {
    const { error } = await supabase
        .from('reports')
        .insert({
            session_id: sessionId,
            content: JSON.stringify(report),
            ai_generated: true,
        });

    if (error) {
        console.error('[AI] Failed to save report:', error);
        throw error;
    }
}
