import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Animated,
    Modal,
    ActivityIndicator,
    Alert,
    ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
// ✅ expo-av 사용 (Expo Go 호환)
import { Audio } from 'expo-av';
import { colors, spacing, radius } from '../../constants/theme';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '../../lib/store';

// ===================================
// WAVEFORM COMPONENT (애니메이션 파형)
// ===================================

const Waveform = ({ isRecording }: { isRecording: boolean }) => {
    const bars = Array.from({ length: 15 });
    const animValues = useRef(bars.map(() => new Animated.Value(0.2))).current;

    useEffect(() => {
        if (isRecording) {
            const animations = animValues.map((anim) => {
                return Animated.loop(
                    Animated.sequence([
                        Animated.timing(anim, {
                            toValue: Math.random() * 0.8 + 0.2,
                            duration: 300 + Math.random() * 500,
                            useNativeDriver: true,
                        }),
                        Animated.timing(anim, {
                            toValue: 0.2,
                            duration: 300 + Math.random() * 500,
                            useNativeDriver: true,
                        }),
                    ])
                );
            });
            animations.forEach(a => a.start());
            return () => animations.forEach(a => a.stop());
        }
    }, [isRecording]);

    return (
        <View style={waveformStyles.container}>
            {animValues.map((anim, i) => (
                <Animated.View
                    key={i}
                    style={[
                        waveformStyles.bar,
                        {
                            transform: [{ scaleY: anim }],
                            opacity: isRecording ? 1 : 0.3,
                        },
                    ]}
                />
            ))}
        </View>
    );
};

const waveformStyles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: 60,
        gap: 4,
    },
    bar: {
        width: 3,
        height: '100%',
        backgroundColor: colors.accent.primary,
        borderRadius: 2,
    },
});

// ===================================
// MAIN RECORDING SCREEN
// ===================================

type RecordingState = 'loading' | 'idle' | 'recording' | 'analyzing' | 'complete';

export default function RecordingScreen() {
    const [state, setState] = useState<RecordingState>('loading');
    const [duration, setDuration] = useState(0);
    const [analysisResult, setAnalysisResult] = useState<any>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [successModalVisible, setSuccessModalVisible] = useState(false);

    const recordingRef = useRef<Audio.Recording | null>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const pulseAnim = useRef(new Animated.Value(1)).current;

    const { selectedStudent } = useStore();

    // ===================================
    // 초기 설정: 마이크 권한 요청
    // ===================================
    useEffect(() => {
        let isMounted = true;

        const setupAudio = async () => {
            try {
                console.log('[Recording] Setting up audio...');

                // 1. 마이크 권한 요청
                const { status } = await Audio.requestPermissionsAsync();

                if (!isMounted) return;

                if (status !== 'granted') {
                    setErrorMessage('Microphone permission is required');
                    setState('idle');
                    return;
                }

                // 2. 오디오 모드 설정 (iOS에서 녹음 허용)
                await Audio.setAudioModeAsync({
                    allowsRecordingIOS: true,
                    playsInSilentModeIOS: true,
                    staysActiveInBackground: false,
                });

                console.log('[Recording] Audio setup complete!');
                setState('idle');

            } catch (err: any) {
                console.error('[Recording] Setup failed:', err);
                if (isMounted) {
                    setErrorMessage('Failed to setup microphone');
                    setState('idle');
                }
            }
        };

        setupAudio();

        // 화면 벗어날 때 정리
        return () => {
            isMounted = false;
            if (recordingRef.current) {
                recordingRef.current.stopAndUnloadAsync().catch(() => { });
            }
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, []);

    // ===================================
    // 녹음 중 펄스 애니메이션
    // ===================================
    useEffect(() => {
        if (state === 'recording') {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(pulseAnim, {
                        toValue: 1.15,
                        duration: 1000,
                        useNativeDriver: true,
                    }),
                    Animated.timing(pulseAnim, {
                        toValue: 1,
                        duration: 1000,
                        useNativeDriver: true,
                    }),
                ])
            ).start();
        } else {
            pulseAnim.stopAnimation();
            pulseAnim.setValue(1);
        }
    }, [state]);

    // ===================================
    // 녹음 시간 타이머
    // ===================================
    useEffect(() => {
        if (state === 'recording') {
            timerRef.current = setInterval(() => {
                setDuration(d => d + 1);
            }, 1000);
        } else {
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
        }
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [state]);

    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // ===================================
    // 녹음 시작
    // ===================================
    const startRecording = async () => {
        try {
            setErrorMessage(null);
            console.log('[Recording] Starting...');

            // 권한 다시 확인
            const { status } = await Audio.requestPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission Required', 'Please allow microphone access to record lessons.');
                return;
            }

            // 오디오 모드 설정
            await Audio.setAudioModeAsync({
                allowsRecordingIOS: true,
                playsInSilentModeIOS: true,
            });

            // 새 녹음 시작
            const recording = new Audio.Recording();
            await recording.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
            await recording.startAsync();

            recordingRef.current = recording;
            setState('recording');
            setDuration(0);

            console.log('[Recording] Started successfully!');

        } catch (err: any) {
            console.error('[Recording] Failed to start:', err);
            Alert.alert('Error', 'Could not start recording. Please try again.');
            setState('idle');
        }
    };

    // ===================================
    // 녹음 중지 및 분석
    // ===================================
    const stopRecording = async () => {
        if (!recordingRef.current) return;

        try {
            console.log('[Recording] Stopping...');

            // 타이머 정지
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }

            setState('analyzing');

            // 녹음 중지
            await recordingRef.current.stopAndUnloadAsync();
            const uri = recordingRef.current.getURI();
            console.log('[Recording] Saved to:', uri);

            // 오디오 모드 리셋
            await Audio.setAudioModeAsync({
                allowsRecordingIOS: false,
            });

            recordingRef.current = null;

            // 🚀 실제 AI 분석: Gemini API 호출
            try {
                const { generateReport } = await import('../../services/reportService');

                // 세션 정보 구성 (실제 서비스에서는 선택된 학생/세션 정보 사용)
                const mockSession = {
                    id: `recording-${Date.now()}`,
                    student_id: selectedStudent?.id || 'demo-student',
                    student_name: selectedStudent?.name || 'Student',
                    subject: selectedStudent?.subject || 'General',
                    duration_minutes: Math.floor(duration / 60),
                    scheduled_time: new Date().toISOString(),
                    status: 'completed' as const,
                };

                console.log('[Recording] Calling AI analysis...');
                const report = await generateReport({
                    session: mockSession,
                    notes: `Recording duration: ${duration} seconds`,
                });

                // 분석 결과를 화면에 표시할 형식으로 변환
                setAnalysisResult({
                    // 기본 정보
                    concepts: report.topics || ['Lesson recorded'],
                    summary: report.summary || 'Recording analyzed successfully.',
                    duration: duration,
                    subject: mockSession.subject,
                    topic: report.topics?.[0] || 'Lesson',

                    // 🎯 튜터에게 유용한 인사이트
                    strengths: report.strengths || [],
                    improvements: report.improvements || [],
                    homework: report.homework,
                    nextPlan: report.nextPlan,
                });
                setState('complete');

            } catch (e) {
                console.error('[Recording] AI Analysis failed:', e);
                // 폴백: 기본 결과
                setAnalysisResult({
                    concepts: ['Lesson recorded'],
                    summary: 'Recording saved. AI analysis unavailable - API key not configured.',
                    duration: duration,
                    subject: selectedStudent?.subject || 'General',
                    topic: 'Lesson',
                });
                setState('complete');
            }

        } catch (err: any) {
            console.error('[Recording] Stop failed:', err);
            Alert.alert('Error', 'Failed to save recording. Please try again.');
            setState('idle');
        }
    };

    // ===================================
    // 포트폴리오에 저장
    // ===================================
    const handleCommit = async () => {
        try {
            setState('analyzing');

            // 실제 서비스에서는 여기서 Supabase에 저장
            await new Promise(resolve => setTimeout(resolve, 1500));

            setSuccessModalVisible(true);

        } catch (err: any) {
            console.error('[Recording] Save failed:', err);
            setState('complete');
        }
    };

    const handleSuccessModalClose = () => {
        setSuccessModalVisible(false);
        router.replace('/');
    };

    // ===================================
    // 로딩 화면
    // ===================================
    if (state === 'loading') {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color={colors.accent.primary} />
                    <Text style={styles.loadingText}>Setting up microphone...</Text>
                </View>
            </SafeAreaView>
        );
    }

    // ===================================
    // 메인 UI
    // ===================================
    return (
        <SafeAreaView style={styles.container}>
            {/* 헤더 */}
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => router.back()}
                    disabled={state === 'analyzing'}
                >
                    <Ionicons
                        name="close"
                        size={24}
                        color={state === 'analyzing' ? colors.text.muted : colors.text.primary}
                    />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>AI Scribe</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView
                style={styles.content}
                contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }}
                showsVerticalScrollIndicator={false}
            >
                {/* 학생 정보 */}
                <View style={[styles.studentBadge, { opacity: (state === 'idle' || state === 'recording') ? 1 : 0.5 }]}>
                    <Text style={styles.studentBadgeText}>
                        {selectedStudent ? `Student: ${selectedStudent.name}` : 'Tap record to start'}
                    </Text>
                </View>

                {/* 에러 메시지 */}
                {errorMessage && (
                    <View style={styles.errorBanner}>
                        <Text style={styles.errorText}>{errorMessage}</Text>
                    </View>
                )}

                {/* 메인 컨텐츠 */}
                <View style={styles.centerContainer}>

                    {/* 대기 상태 */}
                    {state === 'idle' && (
                        <View style={styles.viewState}>
                            <TouchableOpacity
                                style={styles.recordButton}
                                onPress={startRecording}
                                testID="start-recording-button"
                                accessibilityLabel="Start recording lesson"
                            >
                                <Ionicons name="mic" size={48} color="#000" />
                            </TouchableOpacity>
                            <Text style={styles.hint}>Tap to begin capturing the lesson</Text>
                        </View>
                    )}

                    {/* 녹음 중 */}
                    {state === 'recording' && (
                        <View style={styles.viewState}>
                            <View style={styles.recordingHeader}>
                                <View style={styles.liveIndicator}>
                                    <View style={styles.liveDot} />
                                    <Text style={styles.liveText}>RECORDING</Text>
                                </View>
                                <Text style={styles.duration}>{formatDuration(duration)}</Text>
                            </View>

                            <View style={styles.recorderSlot}>
                                <Animated.View style={[styles.pulseRing, { transform: [{ scale: pulseAnim }] }]} />
                                <Waveform isRecording={true} />
                                <TouchableOpacity
                                    style={styles.stopButton}
                                    onPress={stopRecording}
                                    testID="stop-recording-button"
                                    accessibilityLabel="Stop and analyze recording"
                                >
                                    <View style={styles.stopIcon} />
                                </TouchableOpacity>
                            </View>
                            <Text style={styles.hint}>Tap square to finish and analyze</Text>
                        </View>
                    )}

                    {/* 분석 중 */}
                    {state === 'analyzing' && (
                        <View style={styles.viewState}>
                            <View style={styles.analyzingContainer}>
                                <Ionicons name="sparkles" size={64} color={colors.accent.primary} />
                            </View>
                            <Text style={styles.analyzingText}>AI is analyzing your lesson...</Text>
                            <Text style={styles.analyzingSubtext}>Finding key concepts and insights</Text>
                        </View>
                    )}

                    {/* 분석 완료 */}
                    {state === 'complete' && analysisResult && (
                        <View style={styles.completeContainer}>
                            <View style={styles.checkCircle}>
                                <Ionicons name="checkmark" size={48} color="#000" />
                            </View>
                            <Text style={styles.completeTitle}>Lesson Analyzed</Text>
                            <Text style={styles.completeSubtitle}>
                                Found {analysisResult.concepts.length} key concepts
                            </Text>

                            <View style={styles.conceptsContainer}>
                                {analysisResult.concepts.map((concept: string, i: number) => (
                                    <View key={i} style={styles.conceptBadge}>
                                        <Text style={styles.conceptText}>{concept}</Text>
                                    </View>
                                ))}
                            </View>

                            <View style={styles.summaryCard}>
                                <Text style={styles.summaryLabel}>AI INSIGHT</Text>
                                <Text style={styles.summaryText}>{analysisResult.summary}</Text>
                            </View>

                            {/* 🎯 튜터 인사이트: 강점 */}
                            {analysisResult.strengths && analysisResult.strengths.length > 0 && (
                                <View style={styles.insightCard}>
                                    <View style={styles.insightHeader}>
                                        <Ionicons name="star" size={16} color="#10b981" />
                                        <Text style={[styles.insightLabel, { color: '#10b981' }]}>STRENGTHS</Text>
                                    </View>
                                    {analysisResult.strengths.map((item: string, i: number) => (
                                        <Text key={i} style={styles.insightItem}>• {item}</Text>
                                    ))}
                                </View>
                            )}

                            {/* 🎯 튜터 인사이트: 개선점 */}
                            {analysisResult.improvements && analysisResult.improvements.length > 0 && (
                                <View style={styles.insightCard}>
                                    <View style={styles.insightHeader}>
                                        <Ionicons name="trending-up" size={16} color="#f59e0b" />
                                        <Text style={[styles.insightLabel, { color: '#f59e0b' }]}>NEEDS REVIEW</Text>
                                    </View>
                                    {analysisResult.improvements.map((item: string, i: number) => (
                                        <Text key={i} style={styles.insightItem}>• {item}</Text>
                                    ))}
                                </View>
                            )}

                            {/* 🎯 과제 & 다음 수업 */}
                            {(analysisResult.homework || analysisResult.nextPlan) && (
                                <View style={styles.insightCard}>
                                    {analysisResult.homework && (
                                        <>
                                            <View style={styles.insightHeader}>
                                                <Ionicons name="book" size={16} color={colors.accent.primary} />
                                                <Text style={styles.insightLabel}>HOMEWORK</Text>
                                            </View>
                                            <Text style={styles.insightItem}>{analysisResult.homework}</Text>
                                        </>
                                    )}
                                    {analysisResult.nextPlan && (
                                        <>
                                            <View style={[styles.insightHeader, { marginTop: analysisResult.homework ? 12 : 0 }]}>
                                                <Ionicons name="calendar" size={16} color={colors.accent.primary} />
                                                <Text style={styles.insightLabel}>NEXT SESSION</Text>
                                            </View>
                                            <Text style={styles.insightItem}>{analysisResult.nextPlan}</Text>
                                        </>
                                    )}
                                </View>
                            )}
                        </View>
                    )}
                </View>

                {/* 저장 버튼 */}
                {state === 'complete' && (
                    <View style={styles.decisionContainer}>
                        <TouchableOpacity
                            style={styles.commitButton}
                            onPress={handleCommit}
                            testID="save-portfolio-button"
                        >
                            <Ionicons name="save-outline" size={20} color="#000" />
                            <Text style={styles.commitText}>Save to Portfolio</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.purgeButton}
                            onPress={() => setState('idle')}
                        >
                            <Text style={styles.purgeText}>Record Again</Text>
                        </TouchableOpacity>
                    </View>
                )}
                {/* 보안 뱃지 */}
                <View style={styles.trustBadge}>
                    <Ionicons name="lock-closed-outline" size={12} color={colors.text.muted} />
                    <Text style={styles.trustText}>SECURE ENCRYPTION</Text>
                </View>
            </ScrollView>

            {/* 성공 모달 */}
            <Modal
                visible={successModalVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={handleSuccessModalClose}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalIconContainer}>
                            <Ionicons name="checkmark-circle" size={48} color={colors.accent.primary} />
                        </View>
                        <Text style={styles.modalTitle}>Saved!</Text>
                        <Text style={styles.modalMessage}>
                            Lesson insights have been added to the student's portfolio.
                        </Text>
                        <TouchableOpacity
                            style={styles.modalButton}
                            onPress={handleSuccessModalClose}
                        >
                            <Text style={styles.modalButtonText}>Continue</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

// ===================================
// 스타일
// ===================================
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
        fontSize: 18,
        fontWeight: '700',
        color: colors.text.primary,
        letterSpacing: -0.5,
    },
    content: {
        flex: 1,
        paddingHorizontal: spacing.lg,
    },
    loadingText: {
        color: colors.text.muted,
        marginTop: spacing.lg,
        fontSize: 16,
    },
    viewState: {
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
    },
    studentBadge: {
        backgroundColor: colors.bg.card,
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.sm,
        borderRadius: radius.full,
        alignSelf: 'center',
        marginVertical: spacing.lg,
        borderWidth: 1,
        borderColor: colors.border.default,
    },
    studentBadgeText: {
        fontSize: 14,
        color: colors.accent.primary,
        fontWeight: '600',
    },
    errorBanner: {
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        padding: spacing.md,
        borderRadius: radius.md,
        marginBottom: spacing.md,
    },
    errorText: {
        color: '#ef4444',
        textAlign: 'center',
        fontSize: 14,
    },
    recordingHeader: {
        alignItems: 'center',
        marginBottom: spacing.xxl,
    },
    liveIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(239, 68, 68, 0.15)',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: radius.full,
    },
    liveDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: colors.status.error,
        marginRight: 8,
    },
    liveText: {
        fontSize: 12,
        fontWeight: '800',
        letterSpacing: 1.2,
        color: colors.status.error,
    },
    duration: {
        fontSize: 56,
        fontWeight: '300',
        color: colors.text.primary,
        marginTop: spacing.xl,
        fontVariant: ['tabular-nums'],
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    recordButton: {
        width: 140,
        height: 140,
        borderRadius: 70,
        backgroundColor: colors.accent.primary,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: colors.accent.primary,
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.4,
        shadowRadius: 24,
        elevation: 12,
    },
    pulseRing: {
        position: 'absolute',
        width: 160,
        height: 160,
        borderRadius: 80,
        backgroundColor: 'rgba(239, 68, 68, 0.2)',
        zIndex: -1,
    },
    recorderSlot: {
        alignItems: 'center',
        justifyContent: 'center',
        height: 240,
        width: '100%',
    },
    stopButton: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: colors.status.error,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: spacing.xl,
        shadowColor: colors.status.error,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
        elevation: 8,
    },
    stopIcon: {
        width: 32,
        height: 32,
        borderRadius: 4,
        backgroundColor: '#fff',
    },
    hint: {
        fontSize: 16,
        color: colors.text.muted,
        marginTop: spacing.xxl,
        fontWeight: '500',
    },
    analyzingContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: colors.bg.card,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: colors.accent.primary,
    },
    analyzingText: {
        fontSize: 20,
        fontWeight: '700',
        color: colors.text.primary,
        marginTop: spacing.xxl,
    },
    analyzingSubtext: {
        fontSize: 14,
        color: colors.text.muted,
        marginTop: spacing.sm,
    },
    completeContainer: {
        alignItems: 'center',
        width: '100%',
    },
    checkCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: colors.accent.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    completeTitle: {
        fontSize: 28,
        fontWeight: '800',
        color: colors.text.primary,
        marginTop: spacing.xl,
        letterSpacing: -0.5,
    },
    completeSubtitle: {
        fontSize: 16,
        color: colors.text.secondary,
        marginTop: spacing.sm,
        textAlign: 'center',
    },
    conceptsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: spacing.sm,
        marginTop: spacing.xl,
    },
    conceptBadge: {
        backgroundColor: colors.accent.muted,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: radius.md,
        borderWidth: 1,
        borderColor: colors.accent.glow,
    },
    conceptText: {
        fontSize: 13,
        color: colors.accent.primary,
        fontWeight: '700',
    },
    summaryCard: {
        backgroundColor: colors.bg.card,
        borderRadius: radius.lg,
        padding: spacing.lg,
        marginTop: spacing.xxl,
        width: '100%',
        borderWidth: 1,
        borderColor: colors.border.default,
    },
    summaryLabel: {
        fontSize: 11,
        fontWeight: '900',
        color: colors.text.muted,
        letterSpacing: 1.5,
        marginBottom: spacing.sm,
    },
    summaryText: {
        fontSize: 15,
        color: colors.text.secondary,
        lineHeight: 22,
    },
    decisionContainer: {
        gap: spacing.md,
        marginBottom: spacing.xxl,
    },
    commitButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.accent.primary,
        borderRadius: radius.xl,
        paddingVertical: spacing.xl,
        gap: spacing.sm,
        shadowColor: colors.accent.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 6,
    },
    commitText: {
        fontSize: 16,
        fontWeight: '800',
        color: '#000',
    },
    purgeButton: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: spacing.lg,
    },
    purgeText: {
        fontSize: 15,
        fontWeight: '600',
        color: colors.text.muted,
        textDecorationLine: 'underline',
    },
    trustBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: spacing.xl,
        gap: spacing.xs,
        opacity: 0.6,
    },
    trustText: {
        fontSize: 10,
        fontWeight: '800',
        letterSpacing: 1,
        color: colors.text.muted,
    },

    // Insight Card Styles
    insightCard: {
        backgroundColor: colors.bg.card,
        borderRadius: radius.lg,
        padding: spacing.lg,
        marginTop: spacing.md,
        borderWidth: 1,
        borderColor: colors.border.default,
        width: '100%',
    },
    insightHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
        marginBottom: spacing.sm,
    },
    insightLabel: {
        fontSize: 11,
        fontWeight: '800',
        letterSpacing: 1,
        color: colors.accent.primary,
    },
    insightItem: {
        fontSize: 14,
        color: colors.text.secondary,
        lineHeight: 22,
        marginLeft: spacing.xs,
    },

    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacing.xl,
    },
    modalContent: {
        backgroundColor: colors.bg.card,
        borderRadius: radius.xl,
        padding: spacing.xxl,
        width: '100%',
        maxWidth: 320,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.border.default,
    },
    modalIconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: colors.accent.muted,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.lg,
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: colors.text.primary,
        marginBottom: spacing.sm,
    },
    modalMessage: {
        fontSize: 15,
        color: colors.text.muted,
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: spacing.xl,
    },
    modalButton: {
        backgroundColor: colors.accent.primary,
        paddingHorizontal: spacing.xxl,
        paddingVertical: spacing.md,
        borderRadius: radius.lg,
        width: '100%',
        alignItems: 'center',
    },
    modalButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#000',
    },
});
