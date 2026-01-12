/**
 * Mastery Calculation Utilities
 * No "use server" here so these can be used both server and client side.
 */

const STATUS_SCORES: Record<string, number> = {
    'new': 10,
    'learning': 35,
    'reviewed': 65,
    'mastered': 90,
};

const TIME_DECAY_RATE = 0.05; // 5% per week

export function calculateNewScore(
    currentScore: number,
    newStatus: 'new' | 'learning' | 'reviewed' | 'mastered',
    confidence: number,
    daysSinceLastReview?: number
): number {
    // Apply time decay if applicable
    let decayedScore = currentScore;
    if (daysSinceLastReview && daysSinceLastReview > 0) {
        const weeksElapsed = daysSinceLastReview / 7;
        const decay = Math.pow(1 - TIME_DECAY_RATE, weeksElapsed);
        decayedScore = currentScore * decay;
    }

    // Calculate target score from new status
    const targetScore = STATUS_SCORES[newStatus] || 0;

    // Blend with confidence weight
    const confidenceWeight = confidence / 100;
    const newScore = decayedScore + (targetScore - decayedScore) * confidenceWeight * 0.5;

    // Clamp to 0-100
    return Math.round(Math.min(100, Math.max(0, newScore)));
}

export function getStatusFromScore(score: number): 'new' | 'learning' | 'reviewed' | 'mastered' {
    if (score >= 80) return 'mastered';
    if (score >= 55) return 'reviewed';
    if (score >= 25) return 'learning';
    return 'new';
}
