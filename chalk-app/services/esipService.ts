// ===================================
// ESIP: AI 분석 서비스
// Exam Strategy Intelligent Profiler
// ===================================

const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || '';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

// ===================================
// TYPES
// ===================================

export interface Problem {
    id: string;
    topic: string;
    subtopic: string;
    difficulty: number;
    cognitive_level: string;
    avg_time_seconds: number;
    correct_answer: string;
}

export interface Response {
    problemId: string;
    questionOrder: number;
    studentAnswer: string | null;
    isCorrect: boolean;
    timeSpentSeconds: number;
    flagged: boolean;
}

export interface ErrorPattern {
    type: 'careless' | 'conceptual_gap' | 'time_pressure' | 'guessed' | 'mental_fatigue';
    count: number;
    examples: number[];
    description: string;
}

export interface TopicAnalysis {
    topic: string;
    total: number;
    correct: number;
    accuracy: number;
    avgTime: number;
}

export interface StrategyReport {
    // 기본 점수
    rawScore: number;
    totalQuestions: number;
    accuracy: number;
    totalTimeSeconds: number;
    avgTimePerQuestion: number;

    // 오류 패턴
    errorPatterns: ErrorPattern[];
    primaryErrorType: string;

    // 토픽별 분석
    topicAnalysis: TopicAnalysis[];
    strongTopics: string[];
    weakTopics: string[];

    // 전략 추천
    killList: string[];  // 지금은 버려도 될 문제 유형
    keepList: string[];  // 반드시 맞춰야 할 문제 유형

    // 시간 전략
    timeStrategy: string;

    // 점수 예측
    currentScore: number;
    potentialScore: number;

    // AI 인사이트
    summary: string;
    recommendations: string[];
}

// ===================================
// 분석 함수
// ===================================

export async function analyzeTestResults(
    problems: Problem[],
    responses: Response[],
    studentName: string
): Promise<StrategyReport> {
    // 기본 통계 계산
    const basicStats = calculateBasicStats(problems, responses);

    // 토픽별 분석
    const topicAnalysis = analyzeByTopic(problems, responses);

    // 오류 패턴 분석
    const errorPatterns = analyzeErrorPatterns(problems, responses);

    // AI 분석 (Gemini)
    const aiInsights = await getAIInsights(problems, responses, basicStats, topicAnalysis, errorPatterns, studentName);

    return {
        ...basicStats,
        errorPatterns,
        primaryErrorType: errorPatterns[0]?.type || 'none',
        topicAnalysis,
        strongTopics: topicAnalysis.filter(t => t.accuracy >= 80).map(t => t.topic),
        weakTopics: topicAnalysis.filter(t => t.accuracy < 50).map(t => t.topic),
        ...aiInsights,
    };
}

function calculateBasicStats(problems: Problem[], responses: Response[]) {
    const correctCount = responses.filter(r => r.isCorrect).length;
    const totalTime = responses.reduce((sum, r) => sum + r.timeSpentSeconds, 0);

    return {
        rawScore: correctCount,
        totalQuestions: problems.length,
        accuracy: Math.round((correctCount / problems.length) * 100),
        totalTimeSeconds: totalTime,
        avgTimePerQuestion: Math.round(totalTime / problems.length),
    };
}

function analyzeByTopic(problems: Problem[], responses: Response[]): TopicAnalysis[] {
    const topicMap = new Map<string, { total: number; correct: number; totalTime: number }>();

    responses.forEach(response => {
        const problem = problems.find(p => p.id === response.problemId);
        if (!problem) return;

        const topic = problem.topic;
        const current = topicMap.get(topic) || { total: 0, correct: 0, totalTime: 0 };

        topicMap.set(topic, {
            total: current.total + 1,
            correct: current.correct + (response.isCorrect ? 1 : 0),
            totalTime: current.totalTime + response.timeSpentSeconds,
        });
    });

    return Array.from(topicMap.entries()).map(([topic, stats]) => ({
        topic,
        total: stats.total,
        correct: stats.correct,
        accuracy: Math.round((stats.correct / stats.total) * 100),
        avgTime: Math.round(stats.totalTime / stats.total),
    }));
}

function analyzeErrorPatterns(problems: Problem[], responses: Response[]): ErrorPattern[] {
    const patterns: ErrorPattern[] = [];

    // 1. 부주의형 (Careless): 쉬운 문제를 틀림
    const carelessErrors = responses.filter(r => {
        const problem = problems.find(p => p.id === r.problemId);
        return problem && !r.isCorrect && problem.difficulty <= 2 && r.timeSpentSeconds < problem.avg_time_seconds;
    });

    if (carelessErrors.length > 0) {
        patterns.push({
            type: 'careless',
            count: carelessErrors.length,
            examples: carelessErrors.map(r => r.questionOrder),
            description: '쉬운 문제에서 빠르게 답하고 틀림 - 집중력 또는 검토 부족',
        });
    }

    // 2. 개념결핍형 (Conceptual Gap): 특정 토픽 연속 오답
    const conceptualGaps = findConceptualGaps(problems, responses);
    if (conceptualGaps.length > 0) {
        patterns.push({
            type: 'conceptual_gap',
            count: conceptualGaps.length,
            examples: conceptualGaps,
            description: '특정 단원의 개념 이해가 부족함 - 해당 토픽 집중 학습 필요',
        });
    }

    // 3. 시간압박형 (Time Pressure): 평균보다 훨씬 오래 걸림
    const timePressure = responses.filter(r => {
        const problem = problems.find(p => p.id === r.problemId);
        return problem && r.timeSpentSeconds > problem.avg_time_seconds * 2;
    });

    if (timePressure.length > 0) {
        patterns.push({
            type: 'time_pressure',
            count: timePressure.length,
            examples: timePressure.map(r => r.questionOrder),
            description: '특정 문제에 시간을 과도하게 소모 - 시간 배분 전략 필요',
        });
    }

    // 4. 찍음 (Guessed): 매우 빠르게 답하고 틀림
    const guessed = responses.filter(r => {
        const problem = problems.find(p => p.id === r.problemId);
        return problem && !r.isCorrect && r.timeSpentSeconds < 10;
    });

    if (guessed.length > 0) {
        patterns.push({
            type: 'guessed',
            count: guessed.length,
            examples: guessed.map(r => r.questionOrder),
            description: '문제를 거의 읽지 않고 답함 - 포기하거나 찍은 문제',
        });
    }

    // 5. 멘탈붕괴형 (Mental Fatigue): 후반부 정답률 급락
    const mentalFatigue = detectMentalFatigue(responses);
    if (mentalFatigue) {
        patterns.push({
            type: 'mental_fatigue',
            count: 1,
            examples: [mentalFatigue],
            description: `${mentalFatigue}번 문제 이후 정답률이 급격히 하락 - 집중력/체력 관리 필요`,
        });
    }

    // 오류 수 기준 정렬
    return patterns.sort((a, b) => b.count - a.count);
}

function findConceptualGaps(problems: Problem[], responses: Response[]): number[] {
    const topicErrors = new Map<string, number[]>();

    responses.forEach(r => {
        if (r.isCorrect) return;
        const problem = problems.find(p => p.id === r.problemId);
        if (!problem) return;

        const current = topicErrors.get(problem.topic) || [];
        current.push(r.questionOrder);
        topicErrors.set(problem.topic, current);
    });

    // 같은 토픽에서 2개 이상 틀린 경우
    const gaps: number[] = [];
    topicErrors.forEach((errors) => {
        if (errors.length >= 2) {
            gaps.push(...errors);
        }
    });

    return gaps;
}

function detectMentalFatigue(responses: Response[]): number | null {
    if (responses.length < 6) return null;

    const halfPoint = Math.floor(responses.length / 2);
    const firstHalf = responses.slice(0, halfPoint);
    const secondHalf = responses.slice(halfPoint);

    const firstHalfAccuracy = firstHalf.filter(r => r.isCorrect).length / firstHalf.length;
    const secondHalfAccuracy = secondHalf.filter(r => r.isCorrect).length / secondHalf.length;

    // 후반부 정답률이 25% 이상 떨어지면 멘탈붕괴 감지
    if (firstHalfAccuracy - secondHalfAccuracy > 0.25) {
        return halfPoint + 1;
    }

    return null;
}

// ===================================
// AI 분석 (Gemini)
// ===================================

async function getAIInsights(
    problems: Problem[],
    responses: Response[],
    basicStats: ReturnType<typeof calculateBasicStats>,
    topicAnalysis: TopicAnalysis[],
    errorPatterns: ErrorPattern[],
    studentName: string
): Promise<{
    killList: string[];
    keepList: string[];
    timeStrategy: string;
    currentScore: number;
    potentialScore: number;
    summary: string;
    recommendations: string[];
}> {
    // API 키가 없으면 기본 분석 반환
    if (!GEMINI_API_KEY) {
        return generateDefaultInsights(basicStats, topicAnalysis, errorPatterns);
    }

    try {
        const prompt = buildAnalysisPrompt(problems, responses, basicStats, topicAnalysis, errorPatterns, studentName);

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

        if (!response.ok) throw new Error('API error');

        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

        return parseAIResponse(text, basicStats);
    } catch (error) {
        console.error('[ESIP] AI analysis failed:', error);
        return generateDefaultInsights(basicStats, topicAnalysis, errorPatterns);
    }
}

function buildAnalysisPrompt(
    problems: Problem[],
    responses: Response[],
    basicStats: ReturnType<typeof calculateBasicStats>,
    topicAnalysis: TopicAnalysis[],
    errorPatterns: ErrorPattern[],
    studentName: string
): string {
    return `
You are an expert SAT/ACT tutor analyzing a student's test performance.
Your goal is to provide strategic recommendations to maximize their score improvement.

## Student: ${studentName}

## Test Results
- Score: ${basicStats.rawScore}/${basicStats.totalQuestions} (${basicStats.accuracy}%)
- Total Time: ${Math.round(basicStats.totalTimeSeconds / 60)} minutes
- Avg Time per Question: ${basicStats.avgTimePerQuestion} seconds

## Topic Performance
${topicAnalysis.map(t => `- ${t.topic}: ${t.correct}/${t.total} (${t.accuracy}%)`).join('\n')}

## Error Patterns Detected
${errorPatterns.map(e => `- ${e.type}: ${e.count} questions - ${e.description}`).join('\n')}

## Detailed Response Data
${JSON.stringify(responses.map((r, i) => {
        const p = problems.find(pr => pr.id === r.problemId);
        return {
            q: i + 1,
            topic: p?.topic,
            difficulty: p?.difficulty,
            correct: r.isCorrect,
            time: r.timeSpentSeconds,
            avgTime: p?.avg_time_seconds,
            flagged: r.flagged
        };
    }), null, 2)}

## Your Task
Analyze this data and provide strategic recommendations in the following JSON format:

{
    "killList": ["topics to skip for now - too hard relative to current level"],
    "keepList": ["topics to definitely get right - high ROI"],
    "timeStrategy": "specific time management advice",
    "currentScore": ${basicStats.rawScore},
    "potentialScore": estimated_score_after_implementing_strategy,
    "summary": "2-3 sentence executive summary for parents",
    "recommendations": [
        "specific actionable recommendation 1",
        "specific actionable recommendation 2",
        "specific actionable recommendation 3"
    ]
}

Return ONLY valid JSON.
`.trim();
}

function parseAIResponse(text: string, basicStats: ReturnType<typeof calculateBasicStats>) {
    try {
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            return {
                killList: parsed.killList || [],
                keepList: parsed.keepList || [],
                timeStrategy: parsed.timeStrategy || 'Focus on time management',
                currentScore: basicStats.rawScore,
                potentialScore: parsed.potentialScore || Math.round(basicStats.rawScore * 1.2),
                summary: parsed.summary || 'Analysis complete.',
                recommendations: parsed.recommendations || [],
            };
        }
    } catch (e) {
        console.error('[ESIP] Parse error:', e);
    }

    return generateDefaultInsights(basicStats, [], []);
}

function generateDefaultInsights(
    basicStats: ReturnType<typeof calculateBasicStats>,
    topicAnalysis: TopicAnalysis[],
    errorPatterns: ErrorPattern[]
) {
    const weakTopics = topicAnalysis.filter(t => t.accuracy < 50).map(t => t.topic);
    const strongTopics = topicAnalysis.filter(t => t.accuracy >= 80).map(t => t.topic);

    return {
        killList: weakTopics.slice(0, 2),
        keepList: strongTopics.slice(0, 3),
        timeStrategy: basicStats.avgTimePerQuestion > 90
            ? 'Try to spend less time on each question. Skip hard ones and come back.'
            : 'Good time management. Focus on accuracy over speed.',
        currentScore: basicStats.rawScore,
        potentialScore: Math.min(basicStats.totalQuestions, Math.round(basicStats.rawScore * 1.25)),
        summary: `Scored ${basicStats.accuracy}% with ${errorPatterns[0]?.type || 'various'} error patterns. Focus on ${weakTopics[0] || 'weak areas'} for improvement.`,
        recommendations: [
            errorPatterns.find(e => e.type === 'careless')
                ? 'Slow down on easy questions and double-check your work.'
                : 'Continue practicing fundamentals.',
            weakTopics.length > 0
                ? `Focus extra study time on ${weakTopics.join(', ')}.`
                : 'Maintain balanced practice across all topics.',
            errorPatterns.find(e => e.type === 'time_pressure')
                ? 'Practice time-boxing: spend max 90 seconds per question.'
                : 'Keep up the good time management.',
        ],
    };
}

// ===================================
// EXAM TRACKER INTEGRATION
// ===================================

import { QuestionEvent, ExamSession } from '../lib/examTracker';

/**
 * Convert examTracker session data to ESIP Response format
 * This bridges the behavior tracking with the analysis engine
 */
export function convertTrackerToResponses(
    session: ExamSession,
    problems: Problem[],
    answers: Map<number, string>
): Response[] {
    const responses: Response[] = [];

    session.questionEvents.forEach((event: QuestionEvent, questionNum: number) => {
        const problem = problems[questionNum - 1];
        if (!problem) return;

        const studentAnswer = answers.get(questionNum) ?? null;
        const isCorrect = studentAnswer?.toLowerCase().includes(problem.correct_answer.toLowerCase()) ?? false;

        responses.push({
            problemId: problem.id,
            questionOrder: questionNum,
            studentAnswer,
            isCorrect,
            timeSpentSeconds: Math.round(event.timeSpentSeconds),
            flagged: event.flagged,
        });
    });

    return responses.sort((a, b) => a.questionOrder - b.questionOrder);
}

/**
 * Enhanced error pattern analysis using examTracker behavior data
 */
export function analyzeWithBehaviorData(
    problems: Problem[],
    responses: Response[],
    session: ExamSession
): ErrorPattern[] {
    const basePatterns = analyzeErrorPatterns(problems, responses);

    // Enhance with behavior data
    session.questionEvents.forEach((event, questionNum) => {
        const response = responses.find(r => r.questionOrder === questionNum);
        if (!response || response.isCorrect) return;

        // High erase count might indicate confusion/uncertainty
        if (event.eraseCount >= 3) {
            const existingGap = basePatterns.find(p => p.type === 'conceptual_gap');
            if (existingGap && !existingGap.examples.includes(questionNum)) {
                existingGap.count++;
                existingGap.examples.push(questionNum);
            }
        }

        // High hesitation might indicate time pressure or uncertainty
        if (event.hesitationMs > 5000) {
            const existingPressure = basePatterns.find(p => p.type === 'time_pressure');
            if (existingPressure && !existingPressure.examples.includes(questionNum)) {
                existingPressure.count++;
                existingPressure.examples.push(questionNum);
            }
        }
    });

    return basePatterns.sort((a, b) => b.count - a.count);
}
