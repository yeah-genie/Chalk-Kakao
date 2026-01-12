import React, { useEffect, useState, useCallback } from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    RefreshControl,
    Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, radius } from '../constants/theme';
import { useStore } from '../lib/store';
import { router } from 'expo-router';
import { Target, ChartBar, FileText, Users, Settings } from '../components/Icons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Demo data for empty state
const DEMO_STATS = {
    examsTaken: 3,
    avgAccuracy: 72,
    scoreGain: 28,
};

// ===================================
// ESIP Dashboard - Dark Premium Design
// ===================================

export default function ESIPDashboard() {
    const { students, isLoading, fetchStudents } = useStore();
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        fetchStudents();
    }, []);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await fetchStudents();
        setRefreshing(false);
    }, []);

    const hasData = students && students.length > 0;

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor={colors.accent.primary}
                    />
                }
            >
                {/* Header */}
                <View style={styles.header}>
                    <View>
                        <Text style={styles.logo}>Chalk</Text>
                        <View style={styles.taglineRow}>
                            <View style={styles.statusDot} />
                            <Text style={styles.tagline}>EXAM STRATEGY PROFILER</Text>
                        </View>
                    </View>
                    <TouchableOpacity
                        style={styles.settingsBtn}
                        onPress={() => router.push('/settings')}
                        testID="settings-button"
                    >
                        <Settings size={20} color={colors.text.muted} />
                    </TouchableOpacity>
                </View>

                {/* Hero CTA - Problem-focused messaging */}
                <TouchableOpacity
                    style={styles.heroCta}
                    onPress={() => router.push('/exam/practice-1')}
                    activeOpacity={0.9}
                    testID="start-practice-exam"
                >
                    <View style={styles.heroGlow} />
                    <View style={styles.heroContent}>
                        <View style={styles.heroIconContainer}>
                            <Target size={28} color={colors.accent.primary} />
                        </View>
                        <View style={styles.heroText}>
                            <Text style={styles.heroTitle}>FIND OUT WHY YOU LOSE POINTS</Text>
                            <Text style={styles.heroSubtitle}>Take a practice test & get your strategy</Text>
                        </View>
                    </View>
                </TouchableOpacity>

                {/* Quick Actions */}
                <View style={styles.quickActions}>
                    <TouchableOpacity
                        style={styles.actionCard}
                        onPress={() => router.push('/report/strategy')}
                        testID="view-strategy-button"
                    >
                        <ChartBar size={24} color={colors.accent.primary} />
                        <Text style={styles.actionLabel}>STRATEGY</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.actionCard}
                        onPress={() => router.push('/parent-report/demo')}
                        testID="parent-report-button"
                    >
                        <FileText size={24} color={colors.accent.primary} />
                        <Text style={styles.actionLabel}>REPORTS</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.actionCard}
                        onPress={() => router.push('/students')}
                        testID="students-button"
                    >
                        <Users size={24} color={colors.accent.primary} />
                        <Text style={styles.actionLabel}>STUDENTS</Text>
                    </TouchableOpacity>
                </View>

                {/* Stats Grid - Shows demo data if empty */}
                <View style={styles.statsGrid}>
                    <View style={styles.statCard}>
                        <Text style={styles.statLabel}>EXAMS TAKEN</Text>
                        <Text style={styles.statValue}>{hasData ? DEMO_STATS.examsTaken : '—'}</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Text style={styles.statLabel}>AVG ACCURACY</Text>
                        <Text style={[styles.statValue, styles.accentText]}>
                            {hasData ? `${DEMO_STATS.avgAccuracy}%` : '—'}
                        </Text>
                    </View>
                    <View style={styles.statCard}>
                        <Text style={styles.statLabel}>SCORE GAIN</Text>
                        <Text style={[styles.statValue, styles.successText]}>
                            {hasData ? `+${DEMO_STATS.scoreGain}` : '—'}
                        </Text>
                    </View>
                </View>

                {/* Value Proposition - Why use this */}
                <Text style={styles.sectionTitle}>WHY CHALK?</Text>
                <View style={styles.valueCard}>
                    <Text style={styles.valueQuestion}>
                        "Which questions should I skip on the real test?"
                    </Text>
                    <Text style={styles.valueAnswer}>
                        We track your behavior during practice tests and tell you exactly which topics to avoid on test day.
                    </Text>
                </View>

                {/* How It Works */}
                <Text style={styles.sectionTitle}>3 STEPS TO +50 POINTS</Text>
                <View style={styles.stepsContainer}>
                    <View style={styles.step}>
                        <View style={styles.stepNumber}>
                            <Text style={styles.stepNumberText}>1</Text>
                        </View>
                        <View style={styles.stepContent}>
                            <Text style={styles.stepTitle}>Take Practice Test</Text>
                            <Text style={styles.stepDesc}>We watch how you solve each problem</Text>
                        </View>
                    </View>

                    <View style={styles.stepConnector} />

                    <View style={styles.step}>
                        <View style={styles.stepNumber}>
                            <Text style={styles.stepNumberText}>2</Text>
                        </View>
                        <View style={styles.stepContent}>
                            <Text style={styles.stepTitle}>Get Your Exam DNA</Text>
                            <Text style={styles.stepDesc}>Find time traps & weakness patterns</Text>
                        </View>
                    </View>

                    <View style={styles.stepConnector} />

                    <View style={styles.step}>
                        <View style={styles.stepNumber}>
                            <Text style={styles.stepNumberText}>3</Text>
                        </View>
                        <View style={styles.stepContent}>
                            <Text style={styles.stepTitle}>Apply Kill/Keep Strategy</Text>
                            <Text style={styles.stepDesc}>Skip hard ones, nail the easy wins</Text>
                        </View>
                    </View>
                </View>

                {/* Students or Empty State */}
                {students && students.length > 0 ? (
                    <>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>YOUR STUDENTS</Text>
                            <TouchableOpacity onPress={() => router.push('/students')}>
                                <Text style={styles.viewAllText}>View All →</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={styles.studentsContainer}>
                            {students.slice(0, 3).map((student) => (
                                <TouchableOpacity
                                    key={student.id}
                                    style={styles.studentCard}
                                    onPress={() => router.push(`/students/${student.id}`)}
                                >
                                    <View style={styles.studentAvatar}>
                                        <Text style={styles.avatarText}>{student.name[0]}</Text>
                                    </View>
                                    <Text style={styles.studentName} numberOfLines={1}>{student.name}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </>
                ) : (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyTitle}>Ready to start?</Text>
                        <Text style={styles.emptyText}>
                            Take your first practice exam to discover your Exam DNA
                        </Text>
                        <TouchableOpacity
                            style={styles.emptyButton}
                            onPress={() => router.push('/exam/practice-1')}
                        >
                            <Text style={styles.emptyButtonText}>Start Practice Exam</Text>
                        </TouchableOpacity>
                    </View>
                )}

                <View style={styles.bottomSpacer} />
            </ScrollView>
        </SafeAreaView>
    );
}

// ===================================
// STYLES
// ===================================

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.bg.base,
    },
    content: {
        padding: spacing.lg,
        paddingBottom: 100,
    },

    // Header
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: spacing.xl,
    },
    logo: {
        fontSize: 32,
        fontWeight: '900',
        color: colors.text.primary,
        letterSpacing: -1,
    },
    taglineRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
    },
    statusDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: colors.accent.primary,
        marginRight: 8,
    },
    tagline: {
        fontSize: 10,
        fontWeight: '800',
        color: colors.accent.primary,
        letterSpacing: 2,
    },
    settingsBtn: {
        padding: spacing.sm,
        backgroundColor: colors.bg.card,
        borderRadius: radius.full,
        borderWidth: 1,
        borderColor: colors.border.default,
    },

    // Hero CTA
    heroCta: {
        backgroundColor: colors.bg.card,
        borderRadius: radius.xl,
        padding: spacing.lg,
        marginBottom: spacing.xl,
        borderWidth: 1,
        borderColor: colors.accent.primary,
        overflow: 'hidden',
        position: 'relative',
    },
    heroGlow: {
        position: 'absolute',
        top: -50,
        left: -50,
        width: 150,
        height: 150,
        borderRadius: 75,
        backgroundColor: colors.accent.glow,
    },
    heroContent: {
        flexDirection: 'row',
        alignItems: 'center',
        zIndex: 1,
    },
    heroIconContainer: {
        width: 52,
        height: 52,
        borderRadius: 26,
        backgroundColor: colors.accent.muted,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.md,
    },
    heroText: {
        flex: 1,
    },
    heroTitle: {
        fontSize: 14,
        fontWeight: '900',
        color: colors.text.primary,
        letterSpacing: 0.5,
    },
    heroSubtitle: {
        fontSize: 13,
        color: colors.text.muted,
        marginTop: 4,
    },

    // Quick Actions
    quickActions: {
        flexDirection: 'row',
        gap: spacing.md,
        marginBottom: spacing.xl,
    },
    actionCard: {
        flex: 1,
        backgroundColor: colors.bg.card,
        borderRadius: radius.lg,
        padding: spacing.lg,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.border.default,
        gap: spacing.sm,
    },
    actionLabel: {
        fontSize: 9,
        fontWeight: '900',
        color: colors.text.muted,
        letterSpacing: 1,
    },

    // Stats Grid
    statsGrid: {
        flexDirection: 'row',
        gap: spacing.md,
        marginBottom: spacing.xl,
    },
    statCard: {
        flex: 1,
        backgroundColor: colors.bg.card,
        borderRadius: radius.lg,
        padding: spacing.md,
        borderWidth: 1,
        borderColor: colors.border.default,
    },
    statLabel: {
        fontSize: 8,
        fontWeight: '900',
        color: colors.text.muted,
        letterSpacing: 0.5,
        marginBottom: 4,
    },
    statValue: {
        fontSize: 22,
        fontWeight: '800',
        color: colors.text.primary,
    },
    accentText: {
        color: colors.accent.primary,
    },
    successText: {
        color: colors.status.success,
    },

    // Value Proposition
    valueCard: {
        backgroundColor: colors.accent.muted,
        borderRadius: radius.lg,
        padding: spacing.lg,
        marginBottom: spacing.xl,
        borderWidth: 1,
        borderColor: colors.accent.primary,
    },
    valueQuestion: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.text.primary,
        fontStyle: 'italic',
        marginBottom: spacing.sm,
    },
    valueAnswer: {
        fontSize: 14,
        color: colors.accent.secondary,
        lineHeight: 20,
    },

    // Section
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    sectionTitle: {
        fontSize: 10,
        fontWeight: '900',
        color: colors.text.muted,
        letterSpacing: 1.5,
        marginBottom: spacing.md,
    },
    viewAllText: {
        fontSize: 12,
        fontWeight: '600',
        color: colors.accent.primary,
    },

    // Steps
    stepsContainer: {
        backgroundColor: colors.bg.card,
        borderRadius: radius.xl,
        padding: spacing.lg,
        marginBottom: spacing.xl,
        borderWidth: 1,
        borderColor: colors.border.default,
    },
    step: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    stepNumber: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: colors.accent.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.md,
    },
    stepNumberText: {
        fontSize: 12,
        fontWeight: '800',
        color: '#000',
    },
    stepContent: {
        flex: 1,
    },
    stepTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.text.primary,
        marginBottom: 2,
    },
    stepDesc: {
        fontSize: 12,
        color: colors.text.muted,
    },
    stepConnector: {
        width: 2,
        height: 16,
        backgroundColor: colors.border.default,
        marginLeft: 13,
        marginVertical: 6,
    },

    // Students
    studentsContainer: {
        flexDirection: 'row',
        gap: spacing.sm,
    },
    studentCard: {
        flex: 1,
        backgroundColor: colors.bg.card,
        borderRadius: radius.lg,
        padding: spacing.md,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.border.default,
    },
    studentAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.accent.muted,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.sm,
    },
    avatarText: {
        fontSize: 14,
        fontWeight: '700',
        color: colors.accent.primary,
    },
    studentName: {
        fontSize: 11,
        fontWeight: '600',
        color: colors.text.primary,
        textAlign: 'center',
    },

    // Empty State
    emptyState: {
        backgroundColor: colors.bg.card,
        borderRadius: radius.xl,
        padding: spacing.xl,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.border.default,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: colors.text.primary,
        marginBottom: spacing.sm,
    },
    emptyText: {
        fontSize: 14,
        color: colors.text.muted,
        textAlign: 'center',
        marginBottom: spacing.lg,
    },
    emptyButton: {
        backgroundColor: colors.accent.primary,
        paddingHorizontal: spacing.xl,
        paddingVertical: spacing.md,
        borderRadius: radius.lg,
    },
    emptyButtonText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#000',
    },

    bottomSpacer: {
        height: 40,
    },
});
