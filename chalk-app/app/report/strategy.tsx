import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Platform,
    ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { DnaRadarChart, DnaScores } from '../../components/DnaRadarChart';
import { KillKeepList, StrategyItem } from '../../components/KillKeepList';
import { ErrorPatternCard, ErrorPatternData } from '../../components/ErrorPatternCard';

// ===================================
// TYPES
// ===================================

interface StrategyData {
    studentName: string;
    examName: string;
    date: string;
    dnaScores: DnaScores;
    killList: StrategyItem[];
    keepList: StrategyItem[];
    errorPatterns: ErrorPatternData[];
    currentScore: number;
    potentialScore: number;
    summary: string;
    recommendations: string[];
    timeStrategy: string;
}

// ===================================
// MOCK DATA (will be replaced by real API call)
// ===================================

const MOCK_DATA: StrategyData = {
    studentName: 'Alex Chen',
    examName: 'SAT Practice Test 3',
    date: '2026-01-04',
    dnaScores: {
        accuracy: 75,
        timeManagement: 62,
        consistency: 80,
        focus: 55,
    },
    killList: [
        { topic: 'Advanced Geometry', subtopic: 'Circle Theorems', difficulty: 5, reason: 'Low accuracy, high time cost' },
        { topic: 'Complex Algebra', subtopic: 'Polynomial Division', difficulty: 4, reason: 'Consistent errors in this area' },
    ],
    keepList: [
        { topic: 'Basic Algebra', subtopic: 'Linear Equations', difficulty: 2, reason: 'High accuracy, quick solve time' },
        { topic: 'Data Analysis', subtopic: 'Statistics', difficulty: 3, reason: 'Strong conceptual understanding' },
        { topic: 'Geometry', subtopic: 'Triangles', difficulty: 3, reason: 'Consistent correct answers' },
    ],
    errorPatterns: [
        { type: 'careless', count: 4, examples: [3, 8, 15, 22], description: 'Easy questions answered too quickly' },
        { type: 'time_pressure', count: 3, examples: [28, 30, 32], description: 'Ran out of time on hard problems' },
        { type: 'mental_fatigue', count: 1, examples: [25], description: 'Performance dropped after Q25' },
    ],
    currentScore: 28,
    potentialScore: 35,
    summary: 'Alex shows strong foundational skills but struggles with time management on complex problems. Focus on easy wins first and build confidence before attempting harder questions.',
    recommendations: [
        'Spend max 90 seconds per question - mark and move on',
        'Do Basic Algebra and Data Analysis questions first',
        'Skip Advanced Geometry problems initially',
        'Take 30-second breaks every 10 questions to maintain focus',
    ],
    timeStrategy: 'Allocate 60% of time to easy/medium questions, 40% to hard questions. Don\'t spend more than 2 minutes on any single problem.',
};

// ===================================
// COMPONENT
// ===================================

export default function StrategyReportScreen() {
    const router = useRouter();
    const [data, setData] = useState<StrategyData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Simulate API call
        setTimeout(() => {
            setData(MOCK_DATA);
            setLoading(false);
        }, 1000);
    }, []);

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#3B82F6" />
                <Text style={styles.loadingText}>Analyzing your results...</Text>
            </View>
        );
    }

    if (!data) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>Unable to load strategy report</Text>
                <TouchableOpacity style={styles.retryButton} onPress={() => router.back()}>
                    <Text style={styles.retryText}>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const scoreImprovement = data.potentialScore - data.currentScore;
    const scorePercentage = Math.round((data.currentScore / 40) * 100);

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Text style={styles.backText}>← Back</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Strategy Report</Text>
                <TouchableOpacity style={styles.shareButton}>
                    <Text style={styles.shareText}>Share</Text>
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {/* Student Info */}
                <View style={styles.infoCard}>
                    <Text style={styles.studentName}>{data.studentName}</Text>
                    <Text style={styles.examInfo}>{data.examName} • {data.date}</Text>
                </View>

                {/* Score Summary */}
                <View style={styles.scoreCard}>
                    <View style={styles.scoreItem}>
                        <Text style={styles.scoreLabel}>Current</Text>
                        <Text style={styles.currentScore}>{data.currentScore}/40</Text>
                        <Text style={styles.scorePercent}>{scorePercentage}%</Text>
                    </View>
                    <View style={styles.scoreDivider} />
                    <View style={styles.scoreArrow}>
                        <Text style={styles.arrowIcon}>→</Text>
                    </View>
                    <View style={styles.scoreDivider} />
                    <View style={styles.scoreItem}>
                        <Text style={styles.scoreLabel}>Potential</Text>
                        <Text style={styles.potentialScore}>{data.potentialScore}/40</Text>
                        <Text style={styles.improvementBadge}>+{scoreImprovement} pts</Text>
                    </View>
                </View>

                {/* Summary */}
                <View style={styles.summaryCard}>
                    <Text style={styles.summaryTitle}>📋 Summary</Text>
                    <Text style={styles.summaryText}>{data.summary}</Text>
                </View>

                {/* DNA Chart */}
                <DnaRadarChart scores={data.dnaScores} />

                {/* Error Patterns */}
                <View style={styles.sectionSpacing}>
                    <ErrorPatternCard patterns={data.errorPatterns} />
                </View>

                {/* Kill/Keep List */}
                <View style={styles.sectionSpacing}>
                    <KillKeepList killList={data.killList} keepList={data.keepList} />
                </View>

                {/* Time Strategy */}
                <View style={styles.timeStrategyCard}>
                    <Text style={styles.timeTitle}>⏱️ Time Strategy</Text>
                    <Text style={styles.timeText}>{data.timeStrategy}</Text>
                </View>

                {/* Recommendations */}
                <View style={styles.recommendationsCard}>
                    <Text style={styles.recsTitle}>🎯 Action Plan</Text>
                    {data.recommendations.map((rec, index) => (
                        <View key={index} style={styles.recItem}>
                            <Text style={styles.recNumber}>{index + 1}</Text>
                            <Text style={styles.recText}>{rec}</Text>
                        </View>
                    ))}
                </View>

                {/* Share with Parent */}
                <TouchableOpacity style={styles.parentButton}>
                    <Text style={styles.parentButtonText}>📨 Share with Parent</Text>
                </TouchableOpacity>

                <View style={styles.bottomSpacer} />
            </ScrollView>
        </View>
    );
}

// ===================================
// STYLES
// ===================================

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F3F4F6',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F3F4F6',
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
        color: '#6B7280',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F3F4F6',
        padding: 24,
    },
    errorText: {
        fontSize: 16,
        color: '#EF4444',
        marginBottom: 16,
    },
    retryButton: {
        backgroundColor: '#3B82F6',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    retryText: {
        color: '#fff',
        fontWeight: '600',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingTop: Platform.OS === 'ios' ? 50 : 16,
        paddingBottom: 12,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    backButton: {
        padding: 8,
    },
    backText: {
        fontSize: 16,
        color: '#3B82F6',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1F2937',
    },
    shareButton: {
        padding: 8,
    },
    shareText: {
        fontSize: 16,
        color: '#3B82F6',
    },
    scrollView: {
        flex: 1,
    },
    infoCard: {
        backgroundColor: '#fff',
        padding: 16,
        marginBottom: 8,
    },
    studentName: {
        fontSize: 24,
        fontWeight: '700',
        color: '#1F2937',
    },
    examInfo: {
        fontSize: 14,
        color: '#6B7280',
        marginTop: 4,
    },
    scoreCard: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        padding: 20,
        marginHorizontal: 16,
        marginBottom: 16,
        borderRadius: 16,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    scoreItem: {
        flex: 1,
        alignItems: 'center',
    },
    scoreLabel: {
        fontSize: 13,
        color: '#6B7280',
        marginBottom: 4,
    },
    currentScore: {
        fontSize: 28,
        fontWeight: '700',
        color: '#1F2937',
    },
    potentialScore: {
        fontSize: 28,
        fontWeight: '700',
        color: '#059669',
    },
    scorePercent: {
        fontSize: 12,
        color: '#9CA3AF',
        marginTop: 2,
    },
    improvementBadge: {
        fontSize: 12,
        fontWeight: '600',
        color: '#059669',
        backgroundColor: '#D1FAE5',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 8,
        marginTop: 4,
    },
    scoreDivider: {
        width: 1,
        height: 40,
        backgroundColor: '#E5E7EB',
    },
    scoreArrow: {
        paddingHorizontal: 16,
    },
    arrowIcon: {
        fontSize: 24,
        color: '#9CA3AF',
    },
    summaryCard: {
        backgroundColor: '#fff',
        padding: 16,
        marginHorizontal: 16,
        marginBottom: 16,
        borderRadius: 16,
    },
    summaryTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2937',
        marginBottom: 8,
    },
    summaryText: {
        fontSize: 14,
        color: '#4B5563',
        lineHeight: 22,
    },
    sectionSpacing: {
        marginBottom: 16,
    },
    timeStrategyCard: {
        backgroundColor: '#EFF6FF',
        padding: 16,
        marginHorizontal: 16,
        marginBottom: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#BFDBFE',
    },
    timeTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1E40AF',
        marginBottom: 8,
    },
    timeText: {
        fontSize: 14,
        color: '#1E3A8A',
        lineHeight: 22,
    },
    recommendationsCard: {
        backgroundColor: '#fff',
        padding: 16,
        marginHorizontal: 16,
        marginBottom: 16,
        borderRadius: 16,
    },
    recsTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2937',
        marginBottom: 12,
    },
    recItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 10,
    },
    recNumber: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#3B82F6',
        color: '#fff',
        textAlign: 'center',
        lineHeight: 24,
        fontSize: 12,
        fontWeight: '600',
        marginRight: 10,
    },
    recText: {
        flex: 1,
        fontSize: 14,
        color: '#374151',
        lineHeight: 20,
    },
    parentButton: {
        backgroundColor: '#8B5CF6',
        marginHorizontal: 16,
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    parentButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
    },
    bottomSpacer: {
        height: 32,
    },
});
