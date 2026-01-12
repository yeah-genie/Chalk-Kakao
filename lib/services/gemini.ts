"use server";

import { AP_SUBJECTS, findTopicByCode, type Topic } from "@/lib/knowledge-graph";

// ===================================
// GEMINI TOPIC EXTRACTION SERVICE
// 전사 → 토픽 추출 + 이해도 평가
// ===================================

import { GoogleGenerativeAI } from "@google/generative-ai";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// Types
export interface MultimodalImage {
    inlineData: {
        data: string;
        mimeType: string;
    }
}
// Types
export interface SuggestedNode {
    type: 'unit' | 'topic';
    name: string;
    description?: string;
    parentId?: string; // unitId for topics
}

export interface ExtractedTopic {
    topicId: string;
    topicName: string;
    status: 'new' | 'learning' | 'reviewed' | 'mastered';
    confidence: number; // 0-100
    evidence: string; // 관련 문장
    futureImpact?: string; // 미래 단원에 미칠 영향 예측
    isNew?: boolean; // AI가 새로 제안한 토픽인지 여부
}

export interface ExtractionResult {
    success: boolean;
    topics: ExtractedTopic[];
    suggestedNewNodes?: SuggestedNode[];
    summary?: string;
    error?: string;
}

// ===================================
// TOPIC EXTRACTION PROMPT
// ===================================

function buildExtractionPrompt(transcript: string, subjectName: string, existingTopics: any[]): string {
    const topicList = existingTopics.length > 0
        ? existingTopics.map(t => `- ${t.id}: ${t.name}`).join('\n')
        : "(No existing topics found for this subject yet. This is a blank slate.)";

    return `You are an expert tutor analyzing a tutoring session transcript. 

SUBJECT: ${subjectName}

EXISTING KNOWLEDGE GRAPH (use these IDs if matching):
${topicList}

TRANSCRIPT:
"""
${transcript}
"""

TASK 1: ANALYZE EXISTING TOPICS
Identify which of the EXISTING topics were covered. For each:
1. Determine the student's understanding level
2. Extract a direct quote as evidence
3. Predict "futureImpact" on other topics.

TASK 2: TAXONOMY INGESTION (Human-in-the-loop suggestion)
If the transcript covers important material that does NOT fit into any EXISTING topics:
1. Suggest a new "topic" (and a "unit" if needed).
2. High-level structure: Subject -> Unit -> Topic.
3. Keep names professional and consistent with general educational standards for ${subjectName}.

UNDERSTANDING LEVELS:
- "new": Introduced but student shows confusion
- "learning": Understands basics but needs hints
- "reviewed": Applies concepts with minor mistakes
- "mastered": Explains correctly and solves independently

RESPOND IN THIS EXACT JSON FORMAT:
{
    "topics": [
        {
            "topicId": "existing-id",
            "status": "learning",
            "confidence": 90,
            "evidence": "...quote...",
            "futureImpact": "...prediction..."
        }
    ],
    "suggestedNewNodes": [
        {
            "type": "unit",
            "name": "Linear Equations",
            "description": "Fundamental algebraic structures"
        },
        {
            "type": "topic",
            "name": "Solving for X",
            "description": "Basic arithmetic operations to isolate variables",
            "parentId": "suggested-unit-name-or-id"
        }
    ],
    "summary": "Brief 1-2 sentence summary"
}

RULES:
- Only include topics actually discussed.
- Taxonomy Ingestion is CRITICAL for 'blank slate' subjects.
- If it's a new subject, suggest a coherent Unit/Topic structure for what was taught today.
`;
}

// ===================================
// CALL GEMINI API
// ===================================

export async function extractTopicsFromTranscript(
    transcript: string,
    subjectId: string,
    subjectName: string,
    existingTopics: Topic[],
    images: MultimodalImage[] = []
): Promise<ExtractionResult> {
    // Check for API key
    if (!GEMINI_API_KEY) {
        console.warn('[Gemini] No API key - returning empty result');
        return { success: true, topics: [] };
    }

    const prompt = buildExtractionPrompt(transcript, subjectName, existingTopics);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    try {
        const result = await model.generateContent([
            prompt,
            ...images
        ]);

        const response = await result.response;
        const textContent = response.text();

        // Parse JSON from response
        const jsonMatch = textContent.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error('No JSON found in response');
        }

        const parsed = JSON.parse(jsonMatch[0]);

        // Validate and enrich topic data
        const validatedTopics: ExtractedTopic[] = [];
        for (const topic of parsed.topics || []) {
            const foundTopic = existingTopics.find(t => t.id === topic.topicId);
            if (foundTopic) {
                validatedTopics.push({
                    topicId: topic.topicId,
                    topicName: foundTopic.name,
                    status: topic.status || 'new',
                    confidence: Math.min(100, Math.max(0, topic.confidence || 50)),
                    evidence: topic.evidence || '',
                    futureImpact: topic.futureImpact || '',
                });
            }
        }

        return {
            success: true,
            topics: validatedTopics,
            suggestedNewNodes: parsed.suggestedNewNodes || [],
            summary: parsed.summary,
        };
    } catch (error) {
        console.error('[Gemini] Extraction error:', error);
        return {
            success: false,
            topics: [],
            error: error instanceof Error ? error.message : 'Unknown error',
        };
    }
}

// ===================================
// DEMO MODE (when no API key)
// ===================================

function getDemoExtractionResult(subjectId: string): ExtractionResult {
    // Return demo topics based on subject
    if (subjectId === 'ap-calc-ab') {
        return {
            success: true,
            topics: [
                {
                    topicId: 'calc-1-2',
                    topicName: 'Defining Limits and Using Limit Notation',
                    status: 'learning',
                    confidence: 80,
                    evidence: 'Student practiced limit notation with several examples',
                },
                {
                    topicId: 'calc-1-8',
                    topicName: 'Continuity',
                    status: 'reviewed',
                    confidence: 70,
                    evidence: 'Reviewed continuity conditions and identified discontinuities',
                },
            ],
            summary: 'Covered limit notation and continuity concepts. Student showing good progress on limits.',
        };
    }

    if (subjectId === 'ap-physics-1') {
        return {
            success: true,
            topics: [
                {
                    topicId: 'phys-1-2',
                    topicName: 'Displacement, Velocity, and Acceleration',
                    status: 'learning',
                    confidence: 75,
                    evidence: 'Practiced velocity and acceleration problems',
                },
            ],
            summary: 'Focused on kinematics fundamentals. Student needs more practice with acceleration.',
        };
    }

    return {
        success: true,
        topics: [],
        summary: 'No specific topics identified in this session.',
    };
}

// Utility functions removed to lib/mastery-utils.ts to fix Server Action async requirement.
