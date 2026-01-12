// Type definitions for Chalk Homework Analyzer

// ============================================
// Misconception & Error Types
// ============================================

export type ErrorType = 'conceptual' | 'procedural' | 'factual' | 'careless';

export interface Misconception {
    code: string;
    name: string;
    type: ErrorType;
    description: string;
    recommendation: string;
}

// Error type labels for display
export const ERROR_TYPE_INFO: Record<ErrorType, { label: string; color: string; bgColor: string; description: string }> = {
    conceptual: {
        label: 'Concept Gap',
        color: '#ef4444',
        bgColor: 'rgba(239, 68, 68, 0.1)',
        description: 'Fundamental understanding is missing'
    },
    procedural: {
        label: 'Wrong Process',
        color: '#f59e0b',
        bgColor: 'rgba(245, 158, 11, 0.1)',
        description: 'Method or steps are incorrect'
    },
    factual: {
        label: 'Fact Error',
        color: '#8b5cf6',
        bgColor: 'rgba(139, 92, 246, 0.1)',
        description: 'Memorized incorrectly (e.g., times tables)'
    },
    careless: {
        label: 'Careless Mistake',
        color: '#3b82f6',
        bgColor: 'rgba(59, 130, 246, 0.1)',
        description: 'Simple slip, sign error, typo'
    },
};

// ============================================
// Solution Analysis Types
// ============================================

export interface SolutionStep {
    stepNumber: number;
    content: string;
    isCorrect: boolean;
    expected?: string; // What it should be if wrong
}

export interface HomeworkAnalysis {
    recognizedText: string;
    steps: SolutionStep[];
    errorStep: number | null; // null if all correct
    misconception: Misconception | null;
    overallFeedback: string;
    confidence: number; // 0-100, how confident AI is
}

// ============================================
// Submission Types
// ============================================

export interface Submission {
    id: string;
    studentId?: string;
    imageUrl: string;
    problemText?: string;
    correctAnswer?: string;
    analysis?: HomeworkAnalysis;
    status: 'pending' | 'analyzing' | 'completed' | 'error';
    createdAt: string;
    completedAt?: string;
}

// ============================================
// Student & Pattern Types
// ============================================

export interface Student {
    id: string;
    name: string;
    tutorId: string;
    parentEmail?: string;
    createdAt: string;
}

export interface ErrorPattern {
    misconception: Misconception;
    count: number;
    trend: 'increasing' | 'stable' | 'decreasing';
    firstSeen: string;
    lastSeen: string;
}

export interface PatternAnalysis {
    studentId: string;
    period: string; // e.g., "last 4 weeks"
    totalSubmissions: number;
    errorBreakdown: {
        conceptual: number;
        procedural: number;
        factual: number;
        careless: number;
    };
    topErrors: ErrorPattern[];
    habitDiagnosis: string;
    recommendations: string[];
}

// ============================================
// Legacy types (keeping for backward compat)
// ============================================

export type Tool = 'pen' | 'eraser';
export type PenColor = '#ffffff' | '#3b82f6' | '#ef4444';

export interface Point {
    t: number;
    x: number;
    y: number;
    pressure: number;
    type: 'start' | 'move' | 'end';
}

export interface StrokeData {
    stroke_id?: number;
    tool: Tool;
    color: PenColor;
    points: Point[];
}
