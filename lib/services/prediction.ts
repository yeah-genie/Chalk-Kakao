"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";

/**
 * Prediction Engine for Chalk
 * 망각 곡선 기반 복습 알림 + 약점 예측 + 진도 예측
 */

// ===================================
// TYPES
// ===================================

export interface TopicPrediction {
    topicId: string;
    topicName: string;
    currentScore: number;
    predictedScore: number;
    daysSinceReview: number;
    urgency: 'critical' | 'warning' | 'stable' | 'strong';
    recommendation: string;
    decayRate: number;
    optimalReviewDate: Date;
}

export interface WeaknessAnalysis {
    topicId: string;
    topicName: string;
    score: number;
    pattern: 'stuck' | 'declining' | 'slow_progress' | 'normal';
    sessionCount: number;
    suggestedApproach: string;
}

export interface ProgressPrediction {
    currentMastery: number;
    targetMastery: number;
    targetDate: Date;
    predictedCompletionDate: Date;
    sessionsNeeded: number;
    onTrack: boolean;
    recommendation: string;
}

// Unified interface for UI
export interface PredictionData {
    nextSessionRecommendation: {
        topicId: string;
        topicName: string;
        reason: string;
    };
    retentionAlerts: Array<{
        topicId: string;
        topicName: string;
        urgency: 'critical' | 'warning' | 'stable' | 'strong';
        predictedScore: number;
    }>;
    progressForecast: {
        currentMastery: number;
        targetMastery: number;
        estimatedSessionsNeeded: number;
        velocity: 'increasing' | 'stable' | 'decreasing';
    };
    weaknessPatterns: Array<{
        pattern: 'stuck' | 'declining' | 'slow_progress';
        topicName: string;
        details: string;
    }>;
}

// ===================================
// FORGETTING CURVE (Ebbinghaus)
// ===================================

function calculateRetention(
    initialScore: number,
    daysSinceReview: number,
    personalDecayRate: number = 0.15
): number {
    const stability = 1 + (initialScore / 100) * 6;
    const retention = Math.exp(-daysSinceReview / stability);
    const adjustedRetention = retention * (1 - personalDecayRate * 0.1);
    return Math.max(0, Math.min(1, adjustedRetention));
}

export async function predictScoreAfterDays(
    currentScore: number,
    days: number,
    personalDecayRate: number = 0.15
): Promise<number> {
    const retention = calculateRetention(currentScore, days, personalDecayRate);
    return Math.round(currentScore * retention);
}

// ===================================
// PREDICTION API
// ===================================

export async function getStudentPredictions(studentId: string, subjectId: string): Promise<PredictionData> {
    const supabase = await createServerSupabaseClient();

    // 1. Get current mastery
    const { data: masteryData } = await supabase
        .from('student_mastery')
        .select('topic_id, score, status, updated_at, kb_topics(name)')
        .eq('student_id', studentId);

    const now = new Date();
    const alerts: PredictionData['retentionAlerts'] = [];
    const weakPatterns: PredictionData['weaknessPatterns'] = [];

    for (const m of (masteryData || [])) {
        const lastReview = new Date(m.updated_at);
        const daysPassed = Math.floor((now.getTime() - lastReview.getTime()) / (1000 * 60 * 60 * 24));

        const decayRate = m.score >= 80 ? 0.08 : m.score >= 60 ? 0.12 : 0.20;
        const predictedScore = await predictScoreAfterDays(m.score, 7, decayRate);

        if (predictedScore < 50 && m.score >= 70) {
            alerts.push({
                topicId: m.topic_id,
                topicName: (m.kb_topics as unknown as { name: string })?.name || m.topic_id,
                urgency: 'critical',
                predictedScore
            });
        } else if (predictedScore < 70 && m.score >= 80) {
            alerts.push({
                topicId: m.topic_id,
                topicName: (m.kb_topics as unknown as { name: string })?.name || m.topic_id,
                urgency: 'warning',
                predictedScore
            });
        }

        if (m.score < 40 && daysPassed > 14) {
            weakPatterns.push({
                pattern: 'stuck',
                topicName: (m.kb_topics as unknown as { name: string })?.name || m.topic_id,
                details: 'Static mastery score for over 2 weeks. Suggested alternative approach needed.'
            });
        }
    }

    const avgMastery = masteryData && masteryData.length > 0
        ? Math.round(masteryData.reduce((acc, curr) => acc + curr.score, 0) / masteryData.length)
        : 0;

    return {
        nextSessionRecommendation: alerts[0] ? {
            topicId: alerts[0].topicId,
            topicName: alerts[0].topicName,
            reason: "High decay risk. Immediate review recommended to prevent mastery loss."
        } : {
            topicId: "natural-progress",
            topicName: "Continuity & Discontinuity",
            reason: "Recommended based on the AP Calculus curriculum path."
        },
        retentionAlerts: alerts.slice(0, 3),
        progressForecast: {
            currentMastery: avgMastery,
            targetMastery: 85,
            estimatedSessionsNeeded: Math.max(1, Math.ceil((85 - avgMastery) / 7)),
            velocity: 'stable'
        },
        weaknessPatterns: weakPatterns.slice(0, 2)
    };
}

/**
 * Get topic-level predictions for a student
 * Returns array of TopicPrediction for use in overview/analysis pages
 */
export async function getTopicPredictions(studentId: string): Promise<TopicPrediction[]> {
    const supabase = await createServerSupabaseClient();

    const { data: masteryData } = await supabase
        .from('student_mastery')
        .select('topic_id, score, status, updated_at, kb_topics(name)')
        .eq('student_id', studentId);

    if (!masteryData || masteryData.length === 0) {
        return [];
    }

    const now = new Date();
    const predictions: TopicPrediction[] = await Promise.all(masteryData.map(async m => {
        const lastReview = new Date(m.updated_at);
        const daysSinceReview = Math.floor((now.getTime() - lastReview.getTime()) / (1000 * 60 * 60 * 24));

        const decayRate = m.score >= 80 ? 0.08 : m.score >= 60 ? 0.12 : 0.20;
        const predictedScore = await predictScoreAfterDays(m.score, 7, decayRate);

        let urgency: TopicPrediction['urgency'] = 'stable';
        if (predictedScore < 50 && m.score >= 70) {
            urgency = 'critical';
        } else if (predictedScore < 70 && m.score >= 80) {
            urgency = 'warning';
        } else if (m.score >= 85) {
            urgency = 'strong';
        }

        const targetRetention = 0.7;
        const stability = 1 + (m.score / 100) * 6;
        const daysUntilReview = Math.max(1, Math.round(-stability * Math.log(targetRetention)));
        const optimalReviewDate = new Date(now.getTime() + daysUntilReview * 24 * 60 * 60 * 1000);

        let recommendation = "Continue with regular practice.";
        if (urgency === 'critical') {
            recommendation = "Urgent review needed to prevent significant knowledge decay.";
        } else if (urgency === 'warning') {
            recommendation = "Schedule review within 2-3 days to maintain retention.";
        } else if (urgency === 'strong') {
            recommendation = "Mastery is solid. Consider advancing to new topics.";
        }

        return {
            topicId: m.topic_id,
            topicName: (m.kb_topics as any)?.name || m.topic_id,
            currentScore: m.score,
            predictedScore,
            daysSinceReview,
            urgency,
            recommendation,
            decayRate,
            optimalReviewDate
        };
    }));

    const urgencyOrder = { critical: 0, warning: 1, stable: 2, strong: 3 };
    return predictions.sort((a, b) => urgencyOrder[a.urgency] - urgencyOrder[b.urgency]);
}
