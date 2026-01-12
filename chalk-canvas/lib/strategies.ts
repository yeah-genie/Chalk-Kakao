/**
 * Personalized Strategy Tips System
 * Provides context-aware advice based on diagnosis and topic
 */

// Diagnosis-based tips with SVG icon names
export const DIAGNOSIS_TIPS: Record<string, { icon: string; tips: string[] }> = {
    CONCEPT_GAP: {
        icon: 'book-open',
        tips: [
            'Review the fundamental definitions before solving',
            'Watch topic videos on Khan Academy first',
            'Focus on understanding WHY, not just HOW',
        ],
    },
    HESITATION: {
        icon: 'clock',
        tips: [
            'Spend 30 seconds planning before writing',
            'Draw a diagram to visualize the problem',
            'Identify what formula or theorem applies first',
        ],
    },
    TIME_PRESSURE: {
        icon: 'zap',
        tips: [
            'Practice similar problems to build speed',
            'Skip parts you are stuck on - come back later',
            'Use shortcuts like pattern recognition',
        ],
    },
    CONFIDENT: {
        icon: 'check-circle',
        tips: [
            'Double-check your arithmetic',
            'Verify you answered all parts of the question',
            'Consider edge cases in your solution',
        ],
    },
    STEADY_PROGRESS: {
        icon: 'trending-up',
        tips: [
            'Compare your method with the official solution',
            'Check the Mark Scheme for partial credit points',
            'Keep this pace - it shows solid understanding',
        ],
    },
};

// Topic-specific strategies
export const TOPIC_STRATEGIES: Record<string, { icon: string; tips: string[] }> = {
    'Related Rates': {
        icon: 'link',
        tips: [
            'Draw and label the diagram first',
            'Identify what rates are given vs. asked',
            'Write the relationship equation before differentiating',
            'Use implicit differentiation with respect to time',
        ],
    },
    'Limits': {
        icon: 'arrow-right',
        tips: [
            'Try direct substitution first',
            'Factor and simplify if you get 0/0',
            'Use L\'Hôpital\'s Rule for indeterminate forms',
        ],
    },
    'Derivatives': {
        icon: 'activity',
        tips: [
            'Identify which derivative rule to apply',
            'Chain rule: work from outside in',
            'Don\'t forget to simplify your final answer',
        ],
    },
    'Fundamental Theorem of Calculus': {
        icon: 'git-merge',
        tips: [
            'FTC Part 1: d/dx ∫f(t)dt = f(x)',
            'FTC Part 2: ∫f\'(x)dx = f(b) - f(a)',
            'Watch for chain rule in the upper limit',
        ],
    },
    'Area and Volume': {
        icon: 'box',
        tips: [
            'Sketch the region before setting up the integral',
            'Identify which axis you\'re rotating around',
            'Disk: π∫r²dx, Washer: π∫(R²-r²)dx, Shell: 2π∫rh dx',
        ],
    },
    'Differential Equations': {
        icon: 'shuffle',
        tips: [
            'Check if separable: can you get all y on one side?',
            'Don\'t forget +C for indefinite integrals',
            'Use initial conditions to find C',
        ],
    },
    'Series': {
        icon: 'layers',
        tips: [
            'Check convergence first using appropriate tests',
            'Ratio test is often the fastest approach',
            'For Taylor series, know the common ones (e^x, sin, cos)',
        ],
    },
    'Parametric and Polar': {
        icon: 'compass',
        tips: [
            'dy/dx = (dy/dt)/(dx/dt) for parametric',
            'Area in polar: (1/2)∫r²dθ',
            'Convert between forms when it simplifies the problem',
        ],
    },
};

// Get personalized tips based on results
export function getPersonalizedTips(
    results: { diagnosis: string }[],
    topic?: string
): { icon: string; tip: string }[] {
    const tips: { icon: string; tip: string }[] = [];

    // Find dominant diagnosis
    const diagnosisCounts: Record<string, number> = {};
    results.forEach(r => {
        diagnosisCounts[r.diagnosis] = (diagnosisCounts[r.diagnosis] || 0) + 1;
    });

    const dominantDiagnosis = Object.entries(diagnosisCounts)
        .sort((a, b) => b[1] - a[1])[0]?.[0] || 'STEADY_PROGRESS';

    // Add diagnosis-based tips
    const diagnosisTips = DIAGNOSIS_TIPS[dominantDiagnosis] || DIAGNOSIS_TIPS.STEADY_PROGRESS;
    diagnosisTips.tips.slice(0, 2).forEach(tip => {
        tips.push({ icon: diagnosisTips.icon, tip });
    });

    // Add topic-specific tip if available
    if (topic && TOPIC_STRATEGIES[topic]) {
        const topicTips = TOPIC_STRATEGIES[topic];
        tips.push({ icon: topicTips.icon, tip: topicTips.tips[0] });
    }

    return tips;
}
