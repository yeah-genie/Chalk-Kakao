import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

// ===================================
// TYPES
// ===================================

export type ErrorType =
    | 'careless'
    | 'conceptual_gap'
    | 'time_pressure'
    | 'guessed'
    | 'mental_fatigue';

export interface ErrorPatternData {
    type: ErrorType;
    count: number;
    examples: number[];
    description: string;
}

interface ErrorPatternCardProps {
    patterns: ErrorPatternData[];
    onPatternPress?: (pattern: ErrorPatternData) => void;
}

// ===================================
// CONSTANTS
// ===================================

const PATTERN_CONFIG: Record<ErrorType, {
    icon: string;
    label: string;
    color: string;
    bgColor: string;
    advice: string;
}> = {
    careless: {
        icon: '⚡',
        label: 'Careless Mistakes',
        color: '#F59E0B',
        bgColor: '#FEF3C7',
        advice: 'Slow down and double-check easy questions',
    },
    conceptual_gap: {
        icon: '📚',
        label: 'Concept Gaps',
        color: '#8B5CF6',
        bgColor: '#EDE9FE',
        advice: 'Review these topics before the next test',
    },
    time_pressure: {
        icon: '⏰',
        label: 'Time Traps',
        color: '#EF4444',
        bgColor: '#FEE2E2',
        advice: 'Skip these and come back if time permits',
    },
    guessed: {
        icon: '🎲',
        label: 'Guessed',
        color: '#6B7280',
        bgColor: '#F3F4F6',
        advice: 'Make educated guesses, don\'t leave blank',
    },
    mental_fatigue: {
        icon: '🧠',
        label: 'Mental Fatigue',
        color: '#06B6D4',
        bgColor: '#CFFAFE',
        advice: 'Practice stamina with timed full tests',
    },
};

// ===================================
// COMPONENT
// ===================================

export function ErrorPatternCard({ patterns, onPatternPress }: ErrorPatternCardProps) {
    // Sort by count (most frequent first)
    const sortedPatterns = [...patterns].sort((a, b) => b.count - a.count);
    const primaryPattern = sortedPatterns[0];

    if (patterns.length === 0) {
        return (
            <View style={styles.container}>
                <Text style={styles.title}>Error Analysis</Text>
                <View style={styles.emptyState}>
                    <Text style={styles.emptyIcon}>✨</Text>
                    <Text style={styles.emptyText}>No error patterns detected!</Text>
                    <Text style={styles.emptySubtext}>Keep up the great work</Text>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Error Analysis</Text>

            {/* Primary Pattern Highlight */}
            {primaryPattern && (
                <View style={[styles.primaryCard, { backgroundColor: PATTERN_CONFIG[primaryPattern.type].bgColor }]}>
                    <View style={styles.primaryHeader}>
                        <Text style={styles.primaryIcon}>{PATTERN_CONFIG[primaryPattern.type].icon}</Text>
                        <View style={styles.primaryInfo}>
                            <Text style={[styles.primaryLabel, { color: PATTERN_CONFIG[primaryPattern.type].color }]}>
                                Primary Issue: {PATTERN_CONFIG[primaryPattern.type].label}
                            </Text>
                            <Text style={styles.primaryCount}>
                                {primaryPattern.count} question{primaryPattern.count > 1 ? 's' : ''} affected
                            </Text>
                        </View>
                    </View>
                    <Text style={styles.primaryAdvice}>
                        💡 {PATTERN_CONFIG[primaryPattern.type].advice}
                    </Text>
                </View>
            )}

            {/* All Patterns */}
            <View style={styles.patternList}>
                {sortedPatterns.map((pattern) => {
                    const config = PATTERN_CONFIG[pattern.type];
                    return (
                        <TouchableOpacity
                            key={pattern.type}
                            style={styles.patternItem}
                            onPress={() => onPatternPress?.(pattern)}
                            activeOpacity={0.7}
                        >
                            <View style={[styles.patternIcon, { backgroundColor: config.bgColor }]}>
                                <Text style={styles.iconText}>{config.icon}</Text>
                            </View>

                            <View style={styles.patternInfo}>
                                <Text style={styles.patternLabel}>{config.label}</Text>
                                <Text style={styles.patternDescription} numberOfLines={1}>
                                    {pattern.description}
                                </Text>
                            </View>

                            <View style={styles.patternStats}>
                                <Text style={[styles.statCount, { color: config.color }]}>{pattern.count}</Text>
                                <Text style={styles.statLabel}>errors</Text>
                            </View>
                        </TouchableOpacity>
                    );
                })}
            </View>

            {/* Questions Affected */}
            {primaryPattern && primaryPattern.examples.length > 0 && (
                <View style={styles.questionsSection}>
                    <Text style={styles.questionsTitle}>Questions to Review</Text>
                    <View style={styles.questionPills}>
                        {primaryPattern.examples.slice(0, 8).map((q) => (
                            <View key={q} style={styles.questionPill}>
                                <Text style={styles.questionText}>Q{q}</Text>
                            </View>
                        ))}
                        {primaryPattern.examples.length > 8 && (
                            <View style={[styles.questionPill, styles.morePill]}>
                                <Text style={styles.moreText}>+{primaryPattern.examples.length - 8}</Text>
                            </View>
                        )}
                    </View>
                </View>
            )}
        </View>
    );
}

// ===================================
// STYLES
// ===================================

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 20,
        marginHorizontal: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1F2937',
        marginBottom: 16,
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: 24,
    },
    emptyIcon: {
        fontSize: 40,
        marginBottom: 8,
    },
    emptyText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#059669',
    },
    emptySubtext: {
        fontSize: 14,
        color: '#6B7280',
        marginTop: 4,
    },
    primaryCard: {
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
    },
    primaryHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    primaryIcon: {
        fontSize: 32,
        marginRight: 12,
    },
    primaryInfo: {
        flex: 1,
    },
    primaryLabel: {
        fontSize: 16,
        fontWeight: '700',
    },
    primaryCount: {
        fontSize: 13,
        color: '#6B7280',
        marginTop: 2,
    },
    primaryAdvice: {
        fontSize: 14,
        color: '#374151',
        lineHeight: 20,
    },
    patternList: {
        gap: 8,
    },
    patternItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        backgroundColor: '#F9FAFB',
        borderRadius: 10,
    },
    patternIcon: {
        width: 40,
        height: 40,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    iconText: {
        fontSize: 20,
    },
    patternInfo: {
        flex: 1,
    },
    patternLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1F2937',
    },
    patternDescription: {
        fontSize: 12,
        color: '#6B7280',
        marginTop: 2,
    },
    patternStats: {
        alignItems: 'center',
    },
    statCount: {
        fontSize: 18,
        fontWeight: '700',
    },
    statLabel: {
        fontSize: 10,
        color: '#9CA3AF',
    },
    questionsSection: {
        marginTop: 16,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
    },
    questionsTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 8,
    },
    questionPills: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
    },
    questionPill: {
        backgroundColor: '#E5E7EB',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    questionText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#374151',
    },
    morePill: {
        backgroundColor: '#D1D5DB',
    },
    moreText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#6B7280',
    },
});

export default ErrorPatternCard;
