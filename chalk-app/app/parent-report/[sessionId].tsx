import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Platform,
    Dimensions,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ===================================
// TYPES
// ===================================

interface ParentReportData {
    studentName: string;
    tutorName: string;
    examName: string;
    date: string;
    strengths: string[];
    weaknesses: string[];
    nextExamStrategy: string[];
    tutorComment: string;
    currentScore: number;
    potentialScore: number;
}

// ===================================
// MOCK DATA
// ===================================

const MOCK_DATA: ParentReportData = {
    studentName: 'Alex Chen',
    tutorName: 'Ms. Johnson',
    examName: 'SAT Practice Test 3',
    date: 'January 4, 2026',
    strengths: [
        'Strong in Basic Algebra (Top 25%)',
        'Good Data Analysis skills',
        'Consistent performance on triangles',
    ],
    weaknesses: [
        'Time management on hard problems',
        'Focus drops after 25 questions',
        'Careless mistakes on easy questions',
    ],
    nextExamStrategy: [
        'Skip hard geometry - come back later',
        'Do easy questions first (build confidence)',
        'Take micro-breaks every 10 questions',
    ],
    tutorComment: 'Alex has made excellent progress this month! With better time management, I believe a 7-point improvement is very achievable on the next test. We\'ll focus on stamina training in our next few sessions.',
    currentScore: 28,
    potentialScore: 35,
};

// ===================================
// COMPONENT
// ===================================

export default function ParentReportScreen() {
    const params = useLocalSearchParams<{ sessionId: string }>();
    const router = useRouter();
    const data = MOCK_DATA; // Will be fetched based on sessionId

    const scoreImprovement = data.potentialScore - data.currentScore;

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Text style={styles.backText}>← Back</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.downloadButton}>
                    <Text style={styles.downloadText}>📥 PDF</Text>
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {/* Report Card Design */}
                <View style={styles.reportCard}>
                    {/* Header Section */}
                    <View style={styles.reportHeader}>
                        <Text style={styles.logoText}>📝 Chalk</Text>
                        <Text style={styles.reportType}>Exam DNA Report</Text>
                    </View>

                    {/* Student Info */}
                    <View style={styles.studentSection}>
                        <Text style={styles.studentName}>{data.studentName}</Text>
                        <Text style={styles.examInfo}>{data.examName}</Text>
                        <Text style={styles.dateInfo}>{data.date}</Text>
                    </View>

                    {/* Score Section */}
                    <View style={styles.scoreSection}>
                        <View style={styles.scoreBox}>
                            <Text style={styles.scoreLabel}>Current Score</Text>
                            <Text style={styles.currentScore}>{data.currentScore}/40</Text>
                        </View>
                        <View style={styles.arrowContainer}>
                            <Text style={styles.arrow}>→</Text>
                        </View>
                        <View style={styles.scoreBox}>
                            <Text style={styles.scoreLabel}>Projected</Text>
                            <Text style={styles.potentialScore}>{data.potentialScore}/40</Text>
                        </View>
                    </View>

                    <View style={styles.improvementBadge}>
                        <Text style={styles.improvementText}>
                            📈 +{scoreImprovement} points achievable with strategy
                        </Text>
                    </View>

                    {/* Strengths */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionIcon}>✅</Text>
                            <Text style={styles.sectionTitle}>Strengths</Text>
                        </View>
                        {data.strengths.map((item, index) => (
                            <Text key={index} style={styles.listItem}>• {item}</Text>
                        ))}
                    </View>

                    {/* Areas for Growth */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionIcon}>🎯</Text>
                            <Text style={styles.sectionTitle}>Areas for Growth</Text>
                        </View>
                        {data.weaknesses.map((item, index) => (
                            <Text key={index} style={styles.listItem}>• {item}</Text>
                        ))}
                    </View>

                    {/* Next Exam Strategy */}
                    <View style={[styles.section, styles.strategySection]}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionIcon}>🎮</Text>
                            <Text style={[styles.sectionTitle, styles.strategyTitle]}>Next Exam Strategy</Text>
                        </View>
                        {data.nextExamStrategy.map((item, index) => (
                            <View key={index} style={styles.strategyItem}>
                                <Text style={styles.strategyNumber}>{index + 1}</Text>
                                <Text style={styles.strategyText}>{item}</Text>
                            </View>
                        ))}
                    </View>

                    {/* Tutor Comment */}
                    <View style={styles.commentSection}>
                        <View style={styles.commentHeader}>
                            <Text style={styles.commentIcon}>👨‍🏫</Text>
                            <Text style={styles.commentTitle}>From {data.tutorName}</Text>
                        </View>
                        <Text style={styles.commentText}>"{data.tutorComment}"</Text>
                    </View>

                    {/* Footer */}
                    <View style={styles.footer}>
                        <Text style={styles.footerText}>
                            Generated by Chalk • Unfakeable Portfolio
                        </Text>
                    </View>
                </View>

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
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingTop: Platform.OS === 'ios' ? 50 : 16,
        paddingBottom: 12,
        backgroundColor: '#fff',
    },
    backButton: {
        padding: 8,
    },
    backText: {
        fontSize: 16,
        color: '#3B82F6',
    },
    downloadButton: {
        backgroundColor: '#3B82F6',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
    },
    downloadText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#fff',
    },
    scrollView: {
        flex: 1,
        padding: 16,
    },
    reportCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 8,
    },
    reportHeader: {
        backgroundColor: '#1F2937',
        padding: 20,
        alignItems: 'center',
    },
    logoText: {
        fontSize: 20,
        color: '#fff',
        marginBottom: 4,
    },
    reportType: {
        fontSize: 14,
        color: '#9CA3AF',
    },
    studentSection: {
        alignItems: 'center',
        paddingVertical: 24,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    studentName: {
        fontSize: 28,
        fontWeight: '700',
        color: '#1F2937',
    },
    examInfo: {
        fontSize: 16,
        color: '#6B7280',
        marginTop: 4,
    },
    dateInfo: {
        fontSize: 14,
        color: '#9CA3AF',
        marginTop: 2,
    },
    scoreSection: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    scoreBox: {
        alignItems: 'center',
        flex: 1,
    },
    scoreLabel: {
        fontSize: 12,
        color: '#6B7280',
        marginBottom: 4,
    },
    currentScore: {
        fontSize: 32,
        fontWeight: '700',
        color: '#1F2937',
    },
    potentialScore: {
        fontSize: 32,
        fontWeight: '700',
        color: '#059669',
    },
    arrowContainer: {
        paddingHorizontal: 16,
    },
    arrow: {
        fontSize: 24,
        color: '#9CA3AF',
    },
    improvementBadge: {
        backgroundColor: '#D1FAE5',
        marginHorizontal: 20,
        padding: 12,
        borderRadius: 10,
        alignItems: 'center',
        marginBottom: 20,
    },
    improvementText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#065F46',
    },
    section: {
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    sectionIcon: {
        fontSize: 18,
        marginRight: 8,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1F2937',
    },
    listItem: {
        fontSize: 14,
        color: '#4B5563',
        lineHeight: 24,
        marginLeft: 8,
    },
    strategySection: {
        backgroundColor: '#EFF6FF',
    },
    strategyTitle: {
        color: '#1E40AF',
    },
    strategyItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    strategyNumber: {
        width: 22,
        height: 22,
        borderRadius: 11,
        backgroundColor: '#3B82F6',
        color: '#fff',
        textAlign: 'center',
        lineHeight: 22,
        fontSize: 12,
        fontWeight: '700',
        marginRight: 10,
    },
    strategyText: {
        flex: 1,
        fontSize: 14,
        color: '#1E3A8A',
        lineHeight: 22,
    },
    commentSection: {
        padding: 20,
        backgroundColor: '#FEF3C7',
    },
    commentHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    commentIcon: {
        fontSize: 18,
        marginRight: 8,
    },
    commentTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#92400E',
    },
    commentText: {
        fontSize: 14,
        color: '#78350F',
        fontStyle: 'italic',
        lineHeight: 22,
    },
    footer: {
        backgroundColor: '#1F2937',
        padding: 12,
        alignItems: 'center',
    },
    footerText: {
        fontSize: 11,
        color: '#9CA3AF',
    },
    bottomSpacer: {
        height: 32,
    },
});
