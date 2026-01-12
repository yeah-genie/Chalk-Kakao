import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { colors, typography, spacing, radius } from '../../constants/theme';
import {
    ChevronRight,
    CheckCircle,
    Calendar,
    Video
} from '../../components/Icons';
import { useGoogleCalendar } from '../../lib/useGoogleCalendar';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ===================================
// CALENDAR & AUTO-JOIN ONBOARDING
// Zero-Action: 연결만 하면 수업 자동 녹음
// ===================================

const AUTO_JOIN_KEY = '@chalk_auto_join_enabled';

export default function CalendarOnboardingScreen() {
    const { isConnected, connect, isLoading, events, fetchEvents } = useGoogleCalendar();
    const [autoJoinEnabled, setAutoJoinEnabled] = useState(false);
    const [upcomingLessons, setUpcomingLessons] = useState<any[]>([]);
    const [isLoadingLessons, setIsLoadingLessons] = useState(false);

    // 캘린더 연동 후 수업 일정 가져오기
    useEffect(() => {
        if (isConnected) {
            loadUpcomingLessons();
        }
    }, [isConnected]);

    const loadUpcomingLessons = async () => {
        setIsLoadingLessons(true);
        try {
            await fetchEvents();
            // Demo 데이터 (실제로는 캘린더에서 수업 관련 일정만 필터링)
            const demoLessons = [
                { id: '1', title: 'AP Calculus - Emily', time: 'Tomorrow, 4:00 PM', type: 'zoom' },
                { id: '2', title: 'SAT Math - Michael', time: 'Wed, 5:30 PM', type: 'meet' },
                { id: '3', title: 'AP Physics - Sarah', time: 'Thu, 3:00 PM', type: 'zoom' },
            ];
            setUpcomingLessons(demoLessons);
        } catch (error) {
            console.error('[Calendar] Failed to load lessons:', error);
        } finally {
            setIsLoadingLessons(false);
        }
    };

    const toggleAutoJoin = async () => {
        const newValue = !autoJoinEnabled;
        setAutoJoinEnabled(newValue);
        await AsyncStorage.setItem(AUTO_JOIN_KEY, JSON.stringify(newValue));
    };

    const handleContinue = () => {
        // 다음 단계 (완료 화면)으로 이동
        router.push('/onboarding/complete');
    };

    const handleSkip = () => {
        router.push('/onboarding/complete');
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.stepIndicator}>Step 3 of 4</Text>
                    <Text style={styles.title}>Auto-Record Your Lessons</Text>
                    <Text style={styles.subtitle}>
                        Connect your calendar and Chalk will automatically{'\n'}
                        join and record your Zoom/Meet lessons.
                    </Text>
                </View>

                {/* Value Proposition */}
                <View style={styles.valueCard}>
                    <View style={styles.valueIconContainer}>
                        <Text style={styles.valueIcon}>🎯</Text>
                    </View>
                    <Text style={styles.valueTitle}>Zero-Effort Recording</Text>
                    <Text style={styles.valueDesc}>
                        Like Otter.ai for tutors — just teach, we handle the rest.
                    </Text>
                </View>

                {/* Google Calendar Connection */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Connect Calendar</Text>

                    <TouchableOpacity
                        style={[
                            styles.connectCard,
                            isConnected && styles.connectCardActive
                        ]}
                        onPress={connect}
                        disabled={isLoading || isConnected}
                    >
                        <View style={styles.connectLeft}>
                            <View style={[styles.iconBox, { backgroundColor: '#4285F420' }]}>
                                <Calendar size={24} color="#4285F4" />
                            </View>
                            <View>
                                <Text style={styles.connectTitle}>Google Calendar</Text>
                                <Text style={styles.connectDesc}>
                                    {isConnected
                                        ? 'Connected — syncing your lessons'
                                        : 'Detect lessons automatically'}
                                </Text>
                            </View>
                        </View>
                        {isLoading ? (
                            <ActivityIndicator size="small" color={colors.accent.primary} />
                        ) : isConnected ? (
                            <CheckCircle size={24} color={colors.accent.primary} />
                        ) : (
                            <ChevronRight size={20} color={colors.text.muted} />
                        )}
                    </TouchableOpacity>
                </View>

                {/* Upcoming Lessons Preview (shown after connection) */}
                {isConnected && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Upcoming Lessons</Text>

                        {isLoadingLessons ? (
                            <View style={styles.loadingContainer}>
                                <ActivityIndicator size="small" color={colors.accent.primary} />
                                <Text style={styles.loadingText}>Finding your lessons...</Text>
                            </View>
                        ) : (
                            <>
                                {upcomingLessons.map((lesson) => (
                                    <View key={lesson.id} style={styles.lessonCard}>
                                        <View style={[
                                            styles.lessonIcon,
                                            { backgroundColor: lesson.type === 'zoom' ? '#2D8CFF20' : '#00A55920' }
                                        ]}>
                                            <Video
                                                size={16}
                                                color={lesson.type === 'zoom' ? '#2D8CFF' : '#00A559'}
                                            />
                                        </View>
                                        <View style={styles.lessonInfo}>
                                            <Text style={styles.lessonTitle}>{lesson.title}</Text>
                                            <Text style={styles.lessonTime}>{lesson.time}</Text>
                                        </View>
                                        <CheckCircle size={16} color={colors.accent.primary} />
                                    </View>
                                ))}

                                <Text style={styles.lessonHint}>
                                    ✓ Chalk bot will auto-join these lessons
                                </Text>
                            </>
                        )}
                    </View>
                )}

                {/* Auto-Join Toggle */}
                {isConnected && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Auto-Join Settings</Text>

                        <TouchableOpacity
                            style={styles.toggleCard}
                            onPress={toggleAutoJoin}
                        >
                            <View style={styles.toggleLeft}>
                                <View style={styles.iconBox}>
                                    <Video size={24} color={colors.accent.primary} />
                                </View>
                                <View style={styles.toggleInfo}>
                                    <Text style={styles.toggleTitle}>Auto-Join Meetings</Text>
                                    <Text style={styles.toggleDesc}>
                                        Bot joins 1 min before lesson starts
                                    </Text>
                                </View>
                            </View>
                            <View style={[
                                styles.toggle,
                                autoJoinEnabled && styles.toggleActive
                            ]}>
                                <View style={[
                                    styles.toggleKnob,
                                    autoJoinEnabled && styles.toggleKnobActive
                                ]} />
                            </View>
                        </TouchableOpacity>
                    </View>
                )}

                {/* How It Works */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>How It Works</Text>
                    <View style={styles.stepsContainer}>
                        <View style={styles.stepItem}>
                            <View style={styles.stepNumber}><Text style={styles.stepNumberText}>1</Text></View>
                            <Text style={styles.stepText}>Calendar detects lesson start</Text>
                        </View>
                        <View style={styles.stepConnector} />
                        <View style={styles.stepItem}>
                            <View style={styles.stepNumber}><Text style={styles.stepNumberText}>2</Text></View>
                            <Text style={styles.stepText}>Bot joins meeting automatically</Text>
                        </View>
                        <View style={styles.stepConnector} />
                        <View style={styles.stepItem}>
                            <View style={styles.stepNumber}><Text style={styles.stepNumberText}>3</Text></View>
                            <Text style={styles.stepText}>AI generates report after class</Text>
                        </View>
                    </View>
                </View>
            </ScrollView>

            {/* Footer */}
            <View style={styles.footer}>
                <TouchableOpacity
                    style={[
                        styles.continueButton,
                        !isConnected && styles.continueButtonSecondary
                    ]}
                    onPress={handleContinue}
                >
                    <Text style={[
                        styles.continueButtonText,
                        !isConnected && styles.continueButtonTextSecondary
                    ]}>
                        {isConnected ? 'Continue' : 'Skip for Now'}
                    </Text>
                </TouchableOpacity>

                {!isConnected && (
                    <Text style={styles.skipHint}>
                        You can set this up later in Settings
                    </Text>
                )}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.bg.base,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: spacing.xl,
        paddingBottom: spacing.xxl,
    },

    // Header
    header: {
        marginBottom: spacing.xl,
    },
    stepIndicator: {
        ...typography.caption,
        color: colors.accent.primary,
        marginBottom: spacing.sm,
    },
    title: {
        ...typography.h1,
        marginBottom: spacing.sm,
    },
    subtitle: {
        ...typography.body,
        color: colors.text.secondary,
        lineHeight: 22,
    },

    // Value Card
    valueCard: {
        backgroundColor: colors.accent.primary + '15',
        borderRadius: radius.lg,
        padding: spacing.xl,
        alignItems: 'center',
        marginBottom: spacing.xl,
        borderWidth: 1,
        borderColor: colors.accent.primary + '30',
    },
    valueIconContainer: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: colors.accent.primary + '20',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    valueIcon: {
        fontSize: 28,
    },
    valueTitle: {
        ...typography.h3,
        textAlign: 'center',
        marginBottom: spacing.xs,
    },
    valueDesc: {
        ...typography.body,
        color: colors.text.secondary,
        textAlign: 'center',
    },

    // Section
    section: {
        marginBottom: spacing.xl,
    },
    sectionTitle: {
        ...typography.label,
        color: colors.text.muted,
        marginBottom: spacing.md,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },

    // Connect Card
    connectCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: colors.bg.card,
        borderRadius: radius.lg,
        padding: spacing.lg,
        borderWidth: 1,
        borderColor: colors.border.default,
    },
    connectCardActive: {
        borderColor: colors.accent.primary,
        backgroundColor: colors.accent.primary + '08',
    },
    connectLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        flex: 1,
    },
    iconBox: {
        width: 48,
        height: 48,
        borderRadius: radius.md,
        backgroundColor: colors.accent.primary + '20',
        justifyContent: 'center',
        alignItems: 'center',
    },
    connectTitle: {
        ...typography.body,
        fontWeight: '600',
    },
    connectDesc: {
        ...typography.caption,
        color: colors.text.muted,
        marginTop: 2,
    },

    // Upcoming Lessons
    loadingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.sm,
        paddingVertical: spacing.xl,
    },
    loadingText: {
        ...typography.body,
        color: colors.text.muted,
    },
    lessonCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.bg.card,
        borderRadius: radius.md,
        padding: spacing.md,
        marginBottom: spacing.sm,
        gap: spacing.md,
    },
    lessonIcon: {
        width: 32,
        height: 32,
        borderRadius: radius.sm,
        justifyContent: 'center',
        alignItems: 'center',
    },
    lessonInfo: {
        flex: 1,
    },
    lessonTitle: {
        ...typography.body,
        fontWeight: '500',
    },
    lessonTime: {
        ...typography.caption,
        color: colors.text.muted,
    },
    lessonHint: {
        ...typography.caption,
        color: colors.accent.primary,
        textAlign: 'center',
        marginTop: spacing.md,
    },

    // Toggle Card
    toggleCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: colors.bg.card,
        borderRadius: radius.lg,
        padding: spacing.lg,
        borderWidth: 1,
        borderColor: colors.border.default,
    },
    toggleLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        flex: 1,
    },
    toggleInfo: {
        flex: 1,
    },
    toggleTitle: {
        ...typography.body,
        fontWeight: '600',
    },
    toggleDesc: {
        ...typography.caption,
        color: colors.text.muted,
        marginTop: 2,
    },
    toggle: {
        width: 50,
        height: 28,
        borderRadius: 14,
        backgroundColor: colors.border.default,
        padding: 2,
    },
    toggleActive: {
        backgroundColor: colors.accent.primary,
    },
    toggleKnob: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: colors.bg.base,
    },
    toggleKnobActive: {
        transform: [{ translateX: 22 }],
    },

    // Steps
    stepsContainer: {
        backgroundColor: colors.bg.card,
        borderRadius: radius.lg,
        padding: spacing.lg,
    },
    stepItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
    },
    stepNumber: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: colors.accent.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    stepNumberText: {
        ...typography.caption,
        fontWeight: '700',
        color: '#000',
    },
    stepText: {
        ...typography.body,
        flex: 1,
    },
    stepConnector: {
        width: 2,
        height: 20,
        backgroundColor: colors.accent.primary + '40',
        marginLeft: 13,
        marginVertical: spacing.xs,
    },

    // Footer
    footer: {
        padding: spacing.xl,
        paddingTop: spacing.md,
        borderTopWidth: 1,
        borderTopColor: colors.border.default,
    },
    continueButton: {
        backgroundColor: colors.accent.primary,
        borderRadius: radius.lg,
        padding: spacing.lg,
        alignItems: 'center',
    },
    continueButtonSecondary: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: colors.border.default,
    },
    continueButtonText: {
        ...typography.body,
        fontWeight: '600',
        color: '#000',
    },
    continueButtonTextSecondary: {
        color: colors.text.primary,
    },
    skipHint: {
        ...typography.caption,
        color: colors.text.muted,
        textAlign: 'center',
        marginTop: spacing.md,
    },
});
