/**
 * API Route: /api/analyze
 * 
 * Two-phase analysis:
 * 1. Behavioral analysis (stroke patterns, timing)
 * 2. AI Vision analysis (handwriting recognition + grading) via Gemini
 */

import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

interface Point {
    t: number;
    x: number;
    y: number;
    pressure: number;
    type: string;
}

interface Stroke {
    stroke_id: number;
    tool: string;
    color: string;
    points: Point[];
}

interface ProblemPart {
    text: string;
    points: number;
    markScheme?: { points: number; criterion: string }[];
}

interface Problem {
    id: string;
    title: string;
    topic: string;
    parts: ProblemPart[];
}

interface SessionData {
    session_id: string;
    problem_id: string;
    exam_type?: string;
    session_start: string;
    total_time_seconds?: number;
    start_latency_seconds?: number;
    strokes: Stroke[];
    canvas_image?: string; // Base64 encoded canvas image
    problem?: Problem; // Problem data for grading
}

interface PartGrade {
    partLabel: string;
    earnedPoints: number;
    maxPoints: number;
    feedback: string;
    recognizedWork: string;
}

interface AnalysisResult {
    diagnosis: string;
    confidence: number;
    details: string;
    recommendations: string[];
    metrics: {
        start_latency: number;
        avg_stroke_speed: number;
        pause_ratio: number;
        erase_count: number;
        total_time: number;
        total_strokes: number;
    };
    // New: AI grading results
    grading?: {
        totalEarned: number;
        totalPossible: number;
        parts: PartGrade[];
        recognizedText: string;
        aiAnalysis: string;
    };
}

export async function POST(request: Request) {
    try {
        const data: SessionData = await request.json();

        // Phase 1: Behavioral analysis (always runs)
        const behaviorResult = analyzeSolvingBehavior(data);

        // Check for minimum work before Vision analysis
        const totalStrokes = data.strokes?.length || 0;
        const isMinimalWork = totalStrokes < 5;

        if (isMinimalWork) {
            behaviorResult.diagnosis = 'INCOMPLETE';
            behaviorResult.confidence = 0.9;
            behaviorResult.details = `Not enough work shown (${totalStrokes} strokes). Please write out your solution completely before submitting.`;
            behaviorResult.recommendations = [
                'Write out your complete solution, including all steps',
                'Show your work for partial credit opportunities',
                'Label each part clearly (a), (b), etc.',
            ];
        }

        // Phase 2: AI Vision analysis (if canvas image provided)
        if (data.canvas_image && data.problem && process.env.GEMINI_API_KEY) {
            try {
                const gradingResult = await analyzeWithVision(data.canvas_image, data.problem);
                behaviorResult.grading = gradingResult;

                // Update diagnosis based on ACTUAL grading (overrides behavioral)
                const scorePercent = gradingResult.totalPossible > 0
                    ? gradingResult.totalEarned / gradingResult.totalPossible
                    : 0;

                if (gradingResult.totalEarned === gradingResult.totalPossible) {
                    behaviorResult.diagnosis = 'PERFECT';
                    behaviorResult.confidence = 0.95;
                    behaviorResult.details = `Excellent! You earned all ${gradingResult.totalPossible} points.`;
                } else if (scorePercent >= 0.7) {
                    behaviorResult.diagnosis = 'CONFIDENT';
                    behaviorResult.confidence = 0.8;
                    behaviorResult.details = `Good work! You earned ${gradingResult.totalEarned}/${gradingResult.totalPossible} points. ${gradingResult.aiAnalysis}`;
                } else if (scorePercent >= 0.4) {
                    behaviorResult.diagnosis = 'STEADY_PROGRESS';
                    behaviorResult.confidence = 0.75;
                    behaviorResult.details = `Partial credit earned: ${gradingResult.totalEarned}/${gradingResult.totalPossible} points. ${gradingResult.aiAnalysis}`;
                } else if (scorePercent > 0) {
                    behaviorResult.diagnosis = 'CONCEPT_GAP';
                    behaviorResult.confidence = 0.7;
                    behaviorResult.details = `You earned ${gradingResult.totalEarned}/${gradingResult.totalPossible} points. Review the mark scheme for improvement areas.`;
                } else {
                    behaviorResult.diagnosis = 'INCOMPLETE';
                    behaviorResult.confidence = 0.85;
                    behaviorResult.details = `No points earned. ${gradingResult.aiAnalysis}`;
                }
            } catch (visionError) {
                console.error('Vision analysis error:', visionError);
                // Continue with behavioral analysis only
            }
        }

        return NextResponse.json(behaviorResult);
    } catch (error) {
        console.error('Analysis error:', error);
        return NextResponse.json(
            { error: 'Analysis failed' },
            { status: 500 }
        );
    }
}

/**
 * Analyze handwriting with Gemini Vision API
 */
async function analyzeWithVision(canvasImage: string, problem: Problem): Promise<{
    totalEarned: number;
    totalPossible: number;
    parts: PartGrade[];
    recognizedText: string;
    aiAnalysis: string;
}> {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // Build the mark scheme context
    const markSchemeContext = problem.parts.map((part, idx) => {
        const label = String.fromCharCode(97 + idx);
        const criteria = part.markScheme?.map(m => `+${m.points}: ${m.criterion}`).join('\n') || '';
        return `Part (${label}) [${part.points} pts]:\n${criteria}`;
    }).join('\n\n');

    const prompt = `You are a STRICT AP Calculus grader. Analyze this student's handwritten work carefully.

PROBLEM: ${problem.title}
Topic: ${problem.topic}

SCORING RUBRIC:
${markSchemeContext}

STRICT GRADING RULES:
1. First, recognize and transcribe the handwritten mathematical work EXACTLY as written
2. If the canvas is mostly empty or has minimal writing, state "No substantial work shown"
3. If handwriting is unclear, explicitly state what you CANNOT read
4. ONLY award points for work that is CLEARLY demonstrated and MATCHES the rubric
5. If a part has no attempt or just a few random marks, award 0 points
6. Distinguish between:
   - No attempt = 0 points
   - Wrong approach = partial credit possible
   - Correct setup but wrong answer = partial credit
   - Complete correct solution = full points
7. Do NOT be generous - grade like a real AP exam grader

Respond in this exact JSON format:
{
  "recognizedText": "exact transcription of the handwritten work, or 'Canvas appears empty/minimal' if insufficient",
  "parts": [
    {
      "partLabel": "a",
      "recognizedWork": "what the student wrote for this part, or 'No work shown'",
      "earnedPoints": number,
      "maxPoints": number,
      "feedback": "specific feedback - explain why points were earned or lost"
    }
  ],
  "aiAnalysis": "critical analysis of the student's work quality and completeness"
}`;

    // Remove data URL prefix if present
    const base64Data = canvasImage.replace(/^data:image\/\w+;base64,/, '');

    const result = await model.generateContent([
        prompt,
        {
            inlineData: {
                mimeType: 'image/png',
                data: base64Data,
            },
        },
    ]);

    const responseText = result.response.text();

    // Extract JSON from response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
        throw new Error('Failed to parse AI response');
    }

    const parsed = JSON.parse(jsonMatch[0]);

    // Calculate totals
    const totalPossible = problem.parts.reduce((sum, p) => sum + p.points, 0);
    const totalEarned = parsed.parts.reduce((sum: number, p: { earnedPoints: number }) => sum + p.earnedPoints, 0);

    return {
        totalEarned,
        totalPossible,
        parts: parsed.parts,
        recognizedText: parsed.recognizedText,
        aiAnalysis: parsed.aiAnalysis,
    };
}

/**
 * Behavioral analysis function (existing logic)
 */
function analyzeSolvingBehavior(data: SessionData): AnalysisResult {
    const { strokes, start_latency_seconds, total_time_seconds } = data;

    if (!strokes || strokes.length === 0) {
        return {
            diagnosis: 'NO_DATA',
            confidence: 0,
            details: 'No strokes detected. Please write your solution on the canvas.',
            recommendations: ['Try solving the problem before submitting.'],
            metrics: {
                start_latency: 0,
                avg_stroke_speed: 0,
                pause_ratio: 0,
                erase_count: 0,
                total_time: 0,
                total_strokes: 0,
            },
        };
    }

    const metrics = calculateMetrics(strokes, start_latency_seconds, total_time_seconds);
    return applyDiagnosticRules(metrics);
}

function calculateMetrics(
    strokes: Stroke[],
    startLatencyFromFrontend?: number,
    totalTimeFromFrontend?: number
) {
    const penStrokes = strokes.filter(s => s.tool === 'pen');
    const eraserStrokes = strokes.filter(s => s.tool === 'eraser');
    const startLatency = startLatencyFromFrontend || 0;

    let totalDistance = 0;
    let totalDrawingTime = 0;
    const strokeSpeeds: number[] = [];

    for (const stroke of penStrokes) {
        const points = stroke.points;
        if (points.length < 2) continue;

        let strokeDistance = 0;
        const strokeTime = points[points.length - 1].t - points[0].t;

        for (let i = 1; i < points.length; i++) {
            const dx = points[i].x - points[i - 1].x;
            const dy = points[i].y - points[i - 1].y;
            strokeDistance += Math.sqrt(dx * dx + dy * dy);
        }

        if (strokeTime > 0) {
            strokeSpeeds.push(strokeDistance / strokeTime);
        }

        totalDistance += strokeDistance;
        totalDrawingTime += strokeTime;
    }

    const avgStrokeSpeed = strokeSpeeds.length > 0
        ? strokeSpeeds.reduce((a, b) => a + b, 0) / strokeSpeeds.length
        : 0;

    let pauseTime = 0;
    if (penStrokes.length > 1) {
        for (let i = 1; i < penStrokes.length; i++) {
            const prevEnd = penStrokes[i - 1].points[penStrokes[i - 1].points.length - 1]?.t || 0;
            const currStart = penStrokes[i].points[0]?.t || 0;
            pauseTime += Math.max(0, currStart - prevEnd);
        }
    }

    const totalTime = totalTimeFromFrontend || (totalDrawingTime + pauseTime);
    const pauseRatio = totalTime > 0 ? pauseTime / totalTime : 0;
    const eraseCount = eraserStrokes.length;

    return {
        start_latency: Math.round(startLatency * 10) / 10,
        avg_stroke_speed: Math.round(avgStrokeSpeed),
        pause_ratio: Math.round(pauseRatio * 100) / 100,
        erase_count: eraseCount,
        total_time: Math.round(totalTime),
        total_strokes: penStrokes.length,
    };
}

function applyDiagnosticRules(metrics: ReturnType<typeof calculateMetrics>): AnalysisResult {
    const { start_latency, avg_stroke_speed, pause_ratio, erase_count, total_strokes, total_time } = metrics;

    // CASE A: Concept Gap - Very long hesitation AND very few strokes
    // Relaxed: Only triggers if BOTH conditions meet (not OR)
    if ((start_latency > 60 && total_strokes < 5) || (pause_ratio > 0.7 && total_strokes < 3)) {
        return {
            diagnosis: 'CONCEPT_GAP',
            confidence: 0.85,
            details: `High hesitation detected (${start_latency}s wait, ${Math.round(pause_ratio * 100)}% paused). This may indicate unfamiliarity with the concept.`,
            recommendations: [
                'Review foundational concepts for this topic',
                'Try easier practice problems first',
            ],
            metrics,
        };
    }

    // CASE B: Confident - Quick start, steady work
    if (start_latency < 15 && pause_ratio < 0.4 && erase_count <= 2 && total_strokes >= 3) {
        return {
            diagnosis: 'CONFIDENT',
            confidence: 0.82,
            details: `Excellent! You started in ${start_latency}s and worked steadily with ${total_strokes} strokes. Shows strong understanding!`,
            recommendations: [
                'Double-check your arithmetic',
                'Make sure you answered all parts',
            ],
            metrics,
        };
    }

    // CASE C: Hesitation - Multiple corrections
    if (erase_count > 3) {
        return {
            diagnosis: 'HESITATION',
            confidence: 0.78,
            details: `You made ${erase_count} corrections, showing careful revision of your approach.`,
            recommendations: [
                'Spend 30 seconds planning before writing',
                'Practice similar problems to build confidence',
            ],
            metrics,
        };
    }

    // CASE D: Time Pressure - Very fast
    if (avg_stroke_speed > 500 && total_time < 30) {
        return {
            diagnosis: 'TIME_PRESSURE',
            confidence: 0.72,
            details: `Fast pace detected (${avg_stroke_speed} px/s). Take your time for accuracy!`,
            recommendations: [
                'Slow down and read carefully',
                'Allocate time per problem',
            ],
            metrics,
        };
    }

    // Default: Steady Progress (most common case now)
    return {
        diagnosis: 'STEADY_PROGRESS',
        confidence: 0.70,
        details: `Good work! Completed in ${total_time}s with ${total_strokes} strokes. Check your answer against the rubric.`,
        recommendations: [
            'Review your solution for errors',
            'Compare with the Mark Scheme tab',
        ],
        metrics,
    };
}
