import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, radius } from '../../constants/theme';
import { useStore } from '../../lib/store';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

// ===================================
// STUDENT DETAIL SCREEN
// ===================================

function getScoreColor(score: number): string {
    if (score >= 80) return colors.status.success;
    if (score >= 60) return colors.accent.primary;
    if (score >= 40) return colors.status.warning;
    return colors.text.muted;
}

export default function StudentDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const { students, sessions } = useStore();
    const [student, setStudent] = useState<any>(null);

    useEffect(() => {
        const found = students?.find(s => s.id === id);
        setStudent(found);
    }, [id, students]);

    if (!student) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()}>
                        <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Student</Text>
                    <View style={{ width: 24 }} />
                </View>
                <View style={styles.emptyState}>
                    <Text style={styles.emptyText}>Student not found</Text>
                </View>
            </SafeAreaView>
        );
    }

    // Get student sessions
    const studentSessions = sessions?.filter(s => s.student_id === id) || [];
    const totalSessions = studentSessions.length;
    const totalHours = studentSessions.reduce((sum, s) => sum + (s.duration_minutes || 60), 0) / 60;

    // Mock mastery data
    const masteryData = [
        { topic: 'Derivatives', score: 85 },
        { topic: 'Integration', score: 72 },
        { topic: 'Limits', score: 90 },
        { topic: 'Chain Rule', score: 65 },
    ];

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{student.name}</Text>
                <TouchableOpacity>
                    <Ionicons name="ellipsis-horizontal" size={24} color={colors.text.muted} />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                {/* Profile Card */}
                <View style={styles.profileCard}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>{student.name[0]}</Text>
                    </View>
                    <Text style={styles.studentName}>{student.name}</Text>
                    <Text style={styles.studentSubject}>{student.subject}</Text>
                </View>

                {/* Stats */}
                <View style={styles.statsRow}>
                    <View style={styles.statCard}>
                        <Text style={styles.statValue}>{totalSessions}</Text>
                        <Text style={styles.statLabel}>Sessions</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Text style={styles.statValue}>{totalHours.toFixed(1)}h</Text>
                        <Text style={styles.statLabel}>Total</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Text style={[styles.statValue, { color: colors.accent.primary }]}>72%</Text>
                        <Text style={styles.statLabel}>Mastery</Text>
                    </View>
                </View>

                {/* Mastery Matrix */}
                <Text style={styles.sectionLabel}>MASTERY MATRIX</Text>
                <View style={styles.card}>
                    {masteryData.map((item, index) => (
                        <View key={index} style={styles.masteryRow}>
                            <Text style={styles.topicName}>{item.topic}</Text>
                            <View style={styles.progressContainer}>
                                <View
                                    style={[
                                        styles.progressBar,
                                        {
                                            width: `${item.score}%`,
                                            backgroundColor: getScoreColor(item.score),
                                        },
                                    ]}
                                />
                            </View>
                            <Text style={[styles.scoreText, { color: getScoreColor(item.score) }]}>
                                {item.score}%
                            </Text>
                        </View>
                    ))}
                </View>

                {/* Recent Sessions */}
                <Text style={styles.sectionLabel}>RECENT SESSIONS</Text>
                <View style={styles.card}>
                    {studentSessions.length === 0 ? (
                        <View style={styles.emptyCard}>
                            <Text style={styles.emptyCardText}>No sessions yet</Text>
                        </View>
                    ) : (
                        studentSessions.slice(0, 5).map((session, index) => (
                            <View
                                key={session.id}
                                style={[
                                    styles.sessionRow,
                                    index < studentSessions.length - 1 && styles.sessionRowBorder,
                                ]}
                            >
                                <View>
                                    <Text style={styles.sessionDate}>
                                        {new Date(session.scheduled_time).toLocaleDateString()}
                                    </Text>
                                    <Text style={styles.sessionDuration}>
                                        {session.duration_minutes || 60} minutes
                                    </Text>
                                </View>
                                <View style={[
                                    styles.statusBadge,
                                    session.status === 'completed' && styles.statusCompleted,
                                ]}>
                                    <Text style={[
                                        styles.statusText,
                                        session.status === 'completed' && styles.statusTextCompleted,
                                    ]}>
                                        {session.status}
                                    </Text>
                                </View>
                            </View>
                        ))
                    )}
                </View>

                {/* Actions */}
                <TouchableOpacity
                    style={styles.recordButton}
                    onPress={() => {
                        useStore.getState().setSelectedStudent(student);
                        router.push('/recording');
                    }}
                >
                    <Ionicons name="mic" size={20} color="#000" />
                    <Text style={styles.recordButtonText}>Start Session</Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.bg.base,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
    },
    headerTitle: {
        fontSize: 17,
        fontWeight: '600',
        color: colors.text.primary,
    },
    content: {
        padding: spacing.lg,
    },
    profileCard: {
        alignItems: 'center',
        marginBottom: spacing.xl,
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: colors.accent.muted,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    avatarText: {
        fontSize: 32,
        fontWeight: '600',
        color: colors.accent.primary,
    },
    studentName: {
        fontSize: 24,
        fontWeight: '700',
        color: colors.text.primary,
    },
    studentSubject: {
        fontSize: 15,
        color: colors.text.muted,
        marginTop: 4,
    },
    statsRow: {
        flexDirection: 'row',
        gap: spacing.md,
        marginBottom: spacing.xl,
    },
    statCard: {
        flex: 1,
        backgroundColor: colors.bg.card,
        borderRadius: radius.xl,
        padding: spacing.lg,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.border.subtle,
    },
    statValue: {
        fontSize: 24,
        fontWeight: '700',
        color: colors.text.primary,
    },
    statLabel: {
        fontSize: 11,
        color: colors.text.muted,
        marginTop: 4,
    },
    sectionLabel: {
        fontSize: 10,
        fontWeight: '900',
        letterSpacing: 1.5,
        color: colors.text.muted,
        marginBottom: spacing.md,
    },
    card: {
        backgroundColor: colors.bg.card,
        borderRadius: radius.xl,
        borderWidth: 1,
        borderColor: colors.border.subtle,
        overflow: 'hidden',
        marginBottom: spacing.xl,
    },
    masteryRow: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.lg,
        borderBottomWidth: 1,
        borderBottomColor: colors.border.subtle,
    },
    topicName: {
        fontSize: 14,
        color: colors.text.primary,
        width: 100,
    },
    progressContainer: {
        flex: 1,
        height: 8,
        backgroundColor: colors.border.default,
        borderRadius: 4,
        marginHorizontal: spacing.md,
    },
    progressBar: {
        height: 8,
        borderRadius: 4,
    },
    scoreText: {
        fontSize: 14,
        fontWeight: '600',
        width: 40,
        textAlign: 'right',
    },
    sessionRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: spacing.lg,
    },
    sessionRowBorder: {
        borderBottomWidth: 1,
        borderBottomColor: colors.border.subtle,
    },
    sessionDate: {
        fontSize: 15,
        color: colors.text.primary,
    },
    sessionDuration: {
        fontSize: 13,
        color: colors.text.muted,
        marginTop: 2,
    },
    statusBadge: {
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
        borderRadius: radius.sm,
        backgroundColor: colors.border.default,
    },
    statusCompleted: {
        backgroundColor: colors.accent.muted,
    },
    statusText: {
        fontSize: 11,
        fontWeight: '600',
        color: colors.text.muted,
    },
    statusTextCompleted: {
        color: colors.accent.primary,
    },
    emptyCard: {
        padding: spacing.xl,
        alignItems: 'center',
    },
    emptyCardText: {
        fontSize: 14,
        color: colors.text.muted,
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 16,
        color: colors.text.muted,
    },
    recordButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.accent.primary,
        borderRadius: radius.xl,
        paddingVertical: spacing.lg,
        gap: spacing.sm,
    },
    recordButtonText: {
        fontSize: 15,
        fontWeight: '700',
        color: '#000',
    },
});
