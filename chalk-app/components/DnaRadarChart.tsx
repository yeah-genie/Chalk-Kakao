import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, Animated } from 'react-native';
// Skia imports removed for Lite version

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CHART_SIZE = SCREEN_WIDTH - 64;
const CENTER = CHART_SIZE / 2;
const RADIUS = (CHART_SIZE / 2) - 40;

// ===================================
// TYPES
// ===================================

export interface DnaScores {
    accuracy: number;       // 정확도 (0-100)
    timeManagement: number; // 시간관리 (0-100)
    consistency: number;    // 기복 (0-100, 높을수록 일정)
    focus: number;          // 집중력 (0-100)
}

interface DnaRadarChartProps {
    scores: DnaScores;
    animated?: boolean;
}

// ===================================
// CONSTANTS
// ===================================

const AXES = [
    { key: 'accuracy', label: 'Accuracy', angle: -90 },
    { key: 'timeManagement', label: 'Time Mgmt', angle: 0 },
    { key: 'consistency', label: 'Consistency', angle: 90 },
    { key: 'focus', label: 'Focus', angle: 180 },
] as const;

const GRID_LEVELS = [25, 50, 75, 100];

// ===================================
// UTILITY FUNCTIONS
// ===================================

export function DnaRadarChart({ scores }: DnaRadarChartProps) {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Exam DNA (Lite)</Text>

            {/* Fallback View: Simple Bar Charts instead of Radar Chart */}
            <View style={styles.breakdown}>
                {AXES.map((axis) => (
                    <View key={axis.key} style={styles.breakdownItem}>
                        <View style={styles.breakdownHeader}>
                            <Text style={styles.breakdownLabel}>{axis.label}</Text>
                            <Text style={styles.breakdownScore}>
                                {Math.round(scores[axis.key as keyof DnaScores])}%
                            </Text>
                        </View>
                        <View style={styles.progressBar}>
                            <View
                                style={[
                                    styles.progressFill,
                                    { width: `${scores[axis.key as keyof DnaScores]}%` },
                                ]}
                            />
                        </View>
                    </View>
                ))}
            </View>
        </View>
    );
}

// Remove Skia/Reanimated utility functions

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
        textAlign: 'center',
    },
    chartContainer: {
        width: CHART_SIZE,
        height: CHART_SIZE,
        alignSelf: 'center',
        position: 'relative',
    },
    canvas: {
        width: CHART_SIZE,
        height: CHART_SIZE,
    },
    labelContainer: {
        position: 'absolute',
        width: 80,
        alignItems: 'center',
    },
    labelText: {
        fontSize: 11,
        fontWeight: '600',
        color: '#6B7280',
    },
    scoreText: {
        fontSize: 13,
        fontWeight: '700',
        color: '#1F2937',
    },
    breakdown: {
        marginTop: 24,
    },
    breakdownItem: {
        marginBottom: 12,
    },
    breakdownHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    breakdownLabel: {
        fontSize: 13,
        color: '#6B7280',
    },
    breakdownScore: {
        fontSize: 13,
        fontWeight: '600',
        color: '#1F2937',
    },
    progressBar: {
        height: 6,
        backgroundColor: '#E5E7EB',
        borderRadius: 3,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        backgroundColor: '#3B82F6',
        borderRadius: 3,
    },
});

export default DnaRadarChart;
