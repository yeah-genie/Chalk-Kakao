import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { HomeworkAnalysis, Misconception, SolutionStep, ErrorType } from '@/lib/types';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { image, problemText, correctAnswer } = body;

        if (!image) {
            return NextResponse.json({ error: 'Image is required' }, { status: 400 });
        }

        // Prepare the prompt for Gemini Vision
        const prompt = buildPrompt(problemText, correctAnswer);

        // Call Gemini Vision API
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const imageParts = [
            {
                inlineData: {
                    data: image.replace(/^data:image\/\w+;base64,/, ''),
                    mimeType: 'image/png',
                },
            },
        ];

        const result = await model.generateContent([prompt, ...imageParts]);
        const response = await result.response;
        const text = response.text();

        // Parse the AI response
        const analysis = parseAnalysisResponse(text);

        return NextResponse.json({
            success: true,
            analysis,
            rawResponse: text,
        });

    } catch (error) {
        console.error('Analysis error:', error);
        return NextResponse.json(
            { error: 'Failed to analyze homework', details: String(error) },
            { status: 500 }
        );
    }
}

function buildPrompt(problemText?: string, correctAnswer?: string): string {
    let prompt = `You are a math tutor analyzing a student's handwritten solution.

TASK:
1. Recognize and transcribe the handwritten math work
2. Break it into numbered steps
3. Identify if/where an error occurred
4. Classify the error type and explain why it happened

`;

    if (problemText) {
        prompt += `PROBLEM: ${problemText}\n`;
    }

    if (correctAnswer) {
        prompt += `CORRECT ANSWER: ${correctAnswer}\n`;
    }

    prompt += `
ERROR TYPES (classify the error as ONE of these):
- conceptual: Student doesn't understand the underlying concept
- procedural: Student knows the concept but applied wrong method/steps
- factual: Simple memorization error (e.g., 7×8=54 instead of 56)
- careless: Silly mistake, sign error, copying error

RESPOND IN THIS EXACT JSON FORMAT:
{
  "recognizedText": "Full text of the student's work, line by line",
  "steps": [
    {"stepNumber": 1, "content": "step content", "isCorrect": true},
    {"stepNumber": 2, "content": "step content", "isCorrect": false, "expected": "what it should be"}
  ],
  "errorStep": 2,
  "misconception": {
    "code": "ERROR_CODE",
    "name": "Short name of the misconception",
    "type": "conceptual|procedural|factual|careless",
    "description": "Detailed explanation of why this error happened",
    "recommendation": "What the student should practice to fix this"
  },
  "overallFeedback": "Summary feedback for the student",
  "confidence": 85
}

If the solution is COMPLETELY CORRECT, set errorStep to null and misconception to null.

IMPORTANT:
- Be specific about WHERE the error occurred
- Explain WHY the student likely made this mistake
- Give actionable advice to prevent it

Analyze the handwritten work in the image:`;

    return prompt;
}

function parseAnalysisResponse(text: string): HomeworkAnalysis {
    try {
        // Try to extract JSON from the response
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);

            // Validate and transform the response
            return {
                recognizedText: parsed.recognizedText || '',
                steps: (parsed.steps || []).map((s: { stepNumber?: number; content?: string; isCorrect?: boolean; expected?: string }, i: number) => ({
                    stepNumber: s.stepNumber || i + 1,
                    content: s.content || '',
                    isCorrect: s.isCorrect !== false,
                    expected: s.expected,
                })),
                errorStep: parsed.errorStep || null,
                misconception: parsed.misconception ? {
                    code: parsed.misconception.code || 'UNKNOWN',
                    name: parsed.misconception.name || 'Error',
                    type: validateErrorType(parsed.misconception.type),
                    description: parsed.misconception.description || '',
                    recommendation: parsed.misconception.recommendation || '',
                } : null,
                overallFeedback: parsed.overallFeedback || '',
                confidence: parsed.confidence || 70,
            };
        }
    } catch (e) {
        console.error('Failed to parse response:', e);
    }

    // Fallback if parsing fails
    return {
        recognizedText: text,
        steps: [],
        errorStep: null,
        misconception: null,
        overallFeedback: 'Could not parse the solution. Please try again with a clearer image.',
        confidence: 0,
    };
}

function validateErrorType(type: string): ErrorType {
    const validTypes: ErrorType[] = ['conceptual', 'procedural', 'factual', 'careless'];
    return validTypes.includes(type as ErrorType) ? (type as ErrorType) : 'careless';
}
