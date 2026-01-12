import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { colors, typography, spacing, radius } from '../../constants/theme';
import { CheckCircle, Clock, TrendingUp } from '../../components/Icons';

// ===================================
// 학부모 리포트 열람 페이지
// 토큰 기반 공개 접근
// ===================================

interface ReportData {
    id: string;
    content: {
        summary: string;
        topics: string[];
        strengths: string[];
        improvements: string[];
        homework?: string;
        nextPlan?: string;
    };
    session: {
        student_name: string;
        subject: string;
        scheduled_time: string;
        duration_minutes: number;
    };
    tutor: {
        name: string;
    };
    created_at: string;
}

export default function ReportViewPage() {
    const { token } = useLocalSearchParams<{ token: string }>();
    const [report, setReport] = useState<ReportData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchReport();
    }, [token]);

    const fetchReport = async () => {
        if (!token) {
            setError('잘못된 링크입니다');
            setLoading(false);
            return;
        }

        try {
            // 리포트 조회 및 조회수 증가
            const { data, error: fetchError } = await supabase
                .from('reports')
                .select(`
                    id, content, created_at,
                    session:sessions(student_name, subject, scheduled_time, duration_minutes),
                    tutor:tutors(name)
                `)
                .eq('view_token', token)
                .single();

            if (fetchError || !data) {
                setError('리포트를 찾을 수 없습니다');
                return;
            }

            // 조회수 증가
            await supabase.rpc('increment_report_view', { token });

            setReport({
                ...data,
                content: typeof data.content === 'string'
                    ? JSON.parse(data.content)
                    : data.content,
                session: data.session as any,
                tutor: data.tutor as any,
            });
        } catch (err) {
            console.error('[Report] Fetch failed:', err);
            setError('리포트를 불러오는데 실패했습니다');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            weekday: 'long',
        });
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.accent.primary} />
                    <Text style={styles.loadingText}>리포트 불러오는 중...</Text>
                </View>
            </SafeAreaView>
        );
    }

    if (error || !report) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.errorContainer}>
                    <Text style={styles.errorEmoji}>😔</Text>
                    <Text style={styles.errorTitle}>오류 발생</Text>
                    <Text style={styles.errorMessage}>{error || '알 수 없는 오류'}</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.content}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.logo}>Chalk</Text>
                    <Text style={styles.headerSubtitle}>수업 리포트</Text>
                </View>

                {/* Session Info Card */}
                <View style={styles.infoCard}>
                    <Text style={styles.studentName}>{report.session.student_name}</Text>
                    <Text style={styles.sessionMeta}>
                        {report.session.subject} · {report.session.duration_minutes}분 수업
                    </Text>
                    <Text style={styles.sessionDate}>{formatDate(report.session.scheduled_time)}</Text>
                    <Text style={styles.tutorName}>담당 선생님: {report.tutor.name}</Text>
                </View>

                {/* Summary */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>📝 수업 요약</Text>
                    <Text style={styles.summaryText}>{report.content.summary}</Text>
                </View>

                {/* Topics */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>📚 오늘 배운 내용</Text>
                    {report.content.topics.map((topic, index) => (
                        <View key={index} style={styles.listItem}>
                            <CheckCircle size={16} color={colors.accent.primary} />
                            <Text style={styles.listText}>{topic}</Text>
                        </View>
                    ))}
                </View>

                {/* Strengths */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>⭐ 잘한 점</Text>
                    {report.content.strengths.map((strength, index) => (
                        <View key={index} style={styles.listItem}>
                            <TrendingUp size={16} color={colors.status.success} />
                            <Text style={styles.listText}>{strength}</Text>
                        </View>
                    ))}
                </View>

                {/* Improvements */}
                {report.content.improvements.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>💡 개선할 점</Text>
                        {report.content.improvements.map((item, index) => (
                            <View key={index} style={styles.listItem}>
                                <Clock size={16} color={colors.status.warning} />
                                <Text style={styles.listText}>{item}</Text>
                            </View>
                        ))}
                    </View>
                )}

                {/* Homework */}
                {report.content.homework && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>📋 과제</Text>
                        <View style={styles.homeworkCard}>
                            <Text style={styles.homeworkText}>{report.content.homework}</Text>
                        </View>
                    </View>
                )}

                {/* Next Plan */}
                {report.content.nextPlan && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>🎯 다음 수업 계획</Text>
                        <Text style={styles.summaryText}>{report.content.nextPlan}</Text>
                    </View>
                )}

                {/* Footer */}
                <View style={styles.footer}>
                    <Text style={styles.footerText}>Chalk - 스마트 과외 관리</Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.bg.base,
    },
    content: {
        padding: spacing.lg,
        paddingBottom: 50,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: spacing.md,
    },
    loadingText: {
        ...typography.body,
        color: colors.text.muted,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacing.xl,
    },
    errorEmoji: {
        fontSize: 48,
        marginBottom: spacing.md,
    },
    errorTitle: {
        ...typography.h2,
        marginBottom: spacing.sm,
    },
    errorMessage: {
        ...typography.body,
        color: colors.text.muted,
        textAlign: 'center',
    },

    header: {
        alignItems: 'center',
        marginBottom: spacing.xl,
    },
    logo: {
        ...typography.h1,
        color: colors.accent.primary,
    },
    headerSubtitle: {
        ...typography.caption,
        color: colors.text.muted,
        marginTop: spacing.xs,
    },

    infoCard: {
        backgroundColor: colors.bg.card,
        borderRadius: radius.lg,
        padding: spacing.lg,
        marginBottom: spacing.xl,
        borderWidth: 1,
        borderColor: colors.accent.primary,
        alignItems: 'center',
    },
    studentName: {
        ...typography.h2,
        marginBottom: spacing.xs,
    },
    sessionMeta: {
        ...typography.body,
        color: colors.text.secondary,
    },
    sessionDate: {
        ...typography.caption,
        color: colors.text.muted,
        marginTop: spacing.sm,
    },
    tutorName: {
        ...typography.caption,
        color: colors.accent.primary,
        marginTop: spacing.md,
    },

    section: {
        marginBottom: spacing.xl,
    },
    sectionTitle: {
        ...typography.h3,
        marginBottom: spacing.md,
    },
    summaryText: {
        ...typography.body,
        lineHeight: 24,
    },

    listItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: spacing.sm,
        marginBottom: spacing.sm,
    },
    listText: {
        ...typography.body,
        flex: 1,
    },

    homeworkCard: {
        backgroundColor: colors.bg.elevated,
        borderRadius: radius.md,
        padding: spacing.lg,
        borderLeftWidth: 3,
        borderLeftColor: colors.accent.primary,
    },
    homeworkText: {
        ...typography.body,
    },

    footer: {
        alignItems: 'center',
        paddingTop: spacing.xl,
        borderTopWidth: 1,
        borderTopColor: colors.border.default,
    },
    footerText: {
        ...typography.caption,
        color: colors.text.muted,
    },
});
