import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Alert,
    Animated,
    Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius } from '../../constants/theme';
import { useStore } from '../../lib/store';

// 문제 데이터 import
import satProblems from '../../assets/data/sat_problems.json';

// ===================================
// ESIP: 문제 풀이 화면
// ===================================

interface Problem {
    id: string;
    exam_type: string;
    section: string;
    topic: string;
    subtopic: string;
    difficulty: number;
    cognitive_level: string;
    question_text: string;
    choices: string[];
    correct_answer: string;
    explanation: string;
    avg_time_seconds: number;
}

interface Response {
    problemId: string;
    questionOrder: number;
    studentAnswer: string | null;
    isCorrect: boolean;
    timeSpentSeconds: number;
    flagged: boolean;
}

const { width } = Dimensions.get('window');

export default function TestSessionScreen() {
    const params = useLocalSearchParams<{
        sessionId: string;
        examType: string;
        section: string;
        questionCount: string;
    }>();

    const { selectedStudent } = useStore();
    const questionCount = parseInt(params.questionCount || '10');

    // 문제 목록 생성 (랜덤 셔플)
    const [problems] = useState<Problem[]>(() => {
        const shuffled = [...satProblems].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, questionCount);
    });

    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [responses, setResponses] = useState<Response[]>([]);
    const [flagged, setFlagged] = useState(false);
    const [timeOnQuestion, setTimeOnQuestion] = useState(0);
    const [isComplete, setIsComplete] = useState(false);

    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const questionStartTime = useRef(Date.now());
    const progressAnim = useRef(new Animated.Value(0)).current;

    const currentProblem = problems[currentIndex];

    // 문제별 타이머
    useEffect(() => {
        questionStartTime.current = Date.now();
        setTimeOnQuestion(0);

        timerRef.current = setInterval(() => {
            setTimeOnQuestion(Math.floor((Date.now() - questionStartTime.current) / 1000));
        }, 1000);

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [currentIndex]);

    // 진행률 애니메이션
    useEffect(() => {
        Animated.timing(progressAnim, {
            toValue: (currentIndex + 1) / problems.length,
            duration: 300,
            useNativeDriver: false,
        }).start();
    }, [currentIndex]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const saveResponse = () => {
        const timeSpent = Math.floor((Date.now() - questionStartTime.current) / 1000);
        const isCorrect = selectedAnswer === currentProblem.correct_answer;

        const response: Response = {
            problemId: currentProblem.id,
            questionOrder: currentIndex + 1,
            studentAnswer: selectedAnswer,
            isCorrect,
            timeSpentSeconds: timeSpent,
            flagged,
        };

        setResponses(prev => {
            const existing = prev.findIndex(r => r.problemId === currentProblem.id);
            if (existing >= 0) {
                const updated = [...prev];
                updated[existing] = response;
                return updated;
            }
            return [...prev, response];
        });

        return response;
    };

    const handleNext = () => {
        saveResponse();
        setSelectedAnswer(null);
        setFlagged(false);

        if (currentIndex < problems.length - 1) {
            setCurrentIndex(currentIndex + 1);
        } else {
            handleComplete();
        }
    };

    const handlePrev = () => {
        if (currentIndex > 0) {
            saveResponse();
            setCurrentIndex(currentIndex - 1);

            // 이전 답변 복원
            const prevResponse = responses.find(r => r.problemId === problems[currentIndex - 1].id);
            if (prevResponse) {
                setSelectedAnswer(prevResponse.studentAnswer);
                setFlagged(prevResponse.flagged);
            } else {
                setSelectedAnswer(null);
                setFlagged(false);
            }
        }
    };

    const handleComplete = () => {
        saveResponse();

        // 모든 응답 수집
        const allResponses = [...responses];
        const lastResponse = {
            problemId: currentProblem.id,
            questionOrder: currentIndex + 1,
            studentAnswer: selectedAnswer,
            isCorrect: selectedAnswer === currentProblem.correct_answer,
            timeSpentSeconds: Math.floor((Date.now() - questionStartTime.current) / 1000),
            flagged,
        };

        // 마지막 응답 추가/업데이트
        const existingIdx = allResponses.findIndex(r => r.problemId === currentProblem.id);
        if (existingIdx >= 0) {
            allResponses[existingIdx] = lastResponse;
        } else {
            allResponses.push(lastResponse);
        }

        // 결과 화면으로 이동
        router.replace({
            pathname: '/test/report',
            params: {
                sessionId: params.sessionId,
                examType: params.examType,
                responses: JSON.stringify(allResponses),
                problems: JSON.stringify(problems),
                studentName: selectedStudent?.name || 'Student',
            },
        });
    };

    const handleExit = () => {
        Alert.alert(
            'Exit Test?',
            'Your progress will be lost. Are you sure you want to exit?',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Exit', style: 'destructive', onPress: () => router.back() },
            ]
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* 헤더 */}
            <View style={styles.header}>
                <TouchableOpacity onPress={handleExit}>
                    <Ionicons name="close" size={24} color={colors.text.primary} />
                </TouchableOpacity>
                <View style={styles.headerCenter}>
                    <Text style={styles.questionNumber}>
                        Q. {currentIndex + 1}/{problems.length}
                    </Text>
                    <View style={styles.timerContainer}>
                        <Ionicons name="time-outline" size={14} color={colors.text.muted} />
                        <Text style={styles.timerText}>{formatTime(timeOnQuestion)}</Text>
                    </View>
                </View>
                <TouchableOpacity
                    style={[styles.flagButton, flagged && styles.flagButtonActive]}
                    onPress={() => setFlagged(!flagged)}
                >
                    <Ionicons
                        name={flagged ? 'flag' : 'flag-outline'}
                        size={20}
                        color={flagged ? colors.status.error : colors.text.muted}
                    />
                </TouchableOpacity>
            </View>

            {/* 진행률 바 */}
            <View style={styles.progressContainer}>
                <Animated.View
                    style={[
                        styles.progressBar,
                        {
                            width: progressAnim.interpolate({
                                inputRange: [0, 1],
                                outputRange: ['0%', '100%'],
                            }),
                        },
                    ]}
                />
            </View>

            {/* 문제 */}
            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* 토픽 태그 */}
                <View style={styles.topicTags}>
                    <View style={styles.topicTag}>
                        <Text style={styles.topicTagText}>{currentProblem.topic}</Text>
                    </View>
                    <View style={[styles.difficultyTag, getDifficultyStyle(currentProblem.difficulty)]}>
                        <Text style={styles.difficultyText}>
                            {'★'.repeat(currentProblem.difficulty)}
                        </Text>
                    </View>
                </View>

                {/* 문제 텍스트 */}
                <Text style={styles.questionText}>{currentProblem.question_text}</Text>

                {/* 선택지 */}
                <View style={styles.choicesContainer}>
                    {currentProblem.choices.map((choice, index) => {
                        const letter = choice.charAt(0);
                        const isSelected = selectedAnswer === letter;

                        return (
                            <TouchableOpacity
                                key={index}
                                style={[
                                    styles.choiceButton,
                                    isSelected && styles.choiceButtonSelected,
                                ]}
                                onPress={() => setSelectedAnswer(letter)}
                            >
                                <View style={[
                                    styles.choiceLetter,
                                    isSelected && styles.choiceLetterSelected,
                                ]}>
                                    <Text style={[
                                        styles.choiceLetterText,
                                        isSelected && styles.choiceLetterTextSelected,
                                    ]}>
                                        {letter}
                                    </Text>
                                </View>
                                <Text style={[
                                    styles.choiceText,
                                    isSelected && styles.choiceTextSelected,
                                ]}>
                                    {choice.substring(3)}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </ScrollView>

            {/* 네비게이션 */}
            <View style={styles.navigation}>
                <TouchableOpacity
                    style={[styles.navButton, currentIndex === 0 && styles.navButtonDisabled]}
                    onPress={handlePrev}
                    disabled={currentIndex === 0}
                >
                    <Ionicons name="chevron-back" size={20} color={currentIndex === 0 ? colors.text.muted : colors.text.primary} />
                    <Text style={[styles.navButtonText, currentIndex === 0 && styles.navButtonTextDisabled]}>
                        Prev
                    </Text>
                </TouchableOpacity>

                {/* 문제 점프 인디케이터 */}
                <View style={styles.dotIndicator}>
                    {problems.slice(
                        Math.max(0, currentIndex - 2),
                        Math.min(problems.length, currentIndex + 3)
                    ).map((_, idx) => {
                        const actualIdx = Math.max(0, currentIndex - 2) + idx;
                        const response = responses.find(r => r.problemId === problems[actualIdx]?.id);
                        return (
                            <View
                                key={actualIdx}
                                style={[
                                    styles.dot,
                                    actualIdx === currentIndex && styles.dotActive,
                                    response?.studentAnswer && styles.dotAnswered,
                                    response?.flagged && styles.dotFlagged,
                                ]}
                            />
                        );
                    })}
                </View>

                <TouchableOpacity
                    style={[styles.navButton, styles.navButtonPrimary]}
                    onPress={handleNext}
                >
                    <Text style={styles.navButtonTextPrimary}>
                        {currentIndex === problems.length - 1 ? 'Finish' : 'Next'}
                    </Text>
                    <Ionicons
                        name={currentIndex === problems.length - 1 ? 'checkmark' : 'chevron-forward'}
                        size={20}
                        color="#000"
                    />
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const getDifficultyStyle = (difficulty: number) => {
    const colors_map: Record<number, string> = {
        1: '#22C55E',
        2: '#84CC16',
        3: '#EAB308',
        4: '#F97316',
        5: '#EF4444',
    };
    return { backgroundColor: colors_map[difficulty] + '20' };
};

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
    headerCenter: {
        alignItems: 'center',
    },
    questionNumber: {
        fontSize: 16,
        fontWeight: '700',
        color: colors.text.primary,
    },
    timerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginTop: 2,
    },
    timerText: {
        fontSize: 12,
        color: colors.text.muted,
        fontVariant: ['tabular-nums'],
    },
    flagButton: {
        padding: spacing.sm,
        borderRadius: radius.md,
    },
    flagButtonActive: {
        backgroundColor: colors.status.error + '20',
    },
    progressContainer: {
        height: 3,
        backgroundColor: colors.bg.card,
        marginHorizontal: spacing.lg,
        borderRadius: 2,
        overflow: 'hidden',
    },
    progressBar: {
        height: '100%',
        backgroundColor: colors.accent.primary,
    },
    content: {
        flex: 1,
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.xl,
    },
    topicTags: {
        flexDirection: 'row',
        gap: spacing.sm,
        marginBottom: spacing.lg,
    },
    topicTag: {
        backgroundColor: colors.accent.muted,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs,
        borderRadius: radius.full,
    },
    topicTagText: {
        fontSize: 12,
        fontWeight: '600',
        color: colors.accent.primary,
    },
    difficultyTag: {
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs,
        borderRadius: radius.full,
    },
    difficultyText: {
        fontSize: 10,
    },
    questionText: {
        fontSize: 18,
        fontWeight: '500',
        color: colors.text.primary,
        lineHeight: 28,
        marginBottom: spacing.xl,
    },
    choicesContainer: {
        gap: spacing.md,
        paddingBottom: spacing.xxl,
    },
    choiceButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.bg.card,
        padding: spacing.lg,
        borderRadius: radius.lg,
        borderWidth: 2,
        borderColor: colors.border.default,
    },
    choiceButtonSelected: {
        borderColor: colors.accent.primary,
        backgroundColor: colors.accent.muted,
    },
    choiceLetter: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: colors.bg.base,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.md,
    },
    choiceLetterSelected: {
        backgroundColor: colors.accent.primary,
    },
    choiceLetterText: {
        fontSize: 14,
        fontWeight: '700',
        color: colors.text.secondary,
    },
    choiceLetterTextSelected: {
        color: '#000',
    },
    choiceText: {
        flex: 1,
        fontSize: 16,
        color: colors.text.primary,
    },
    choiceTextSelected: {
        fontWeight: '600',
    },
    navigation: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.lg,
        borderTopWidth: 1,
        borderTopColor: colors.border.default,
    },
    navButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        borderRadius: radius.md,
        gap: spacing.xs,
    },
    navButtonDisabled: {
        opacity: 0.5,
    },
    navButtonPrimary: {
        backgroundColor: colors.accent.primary,
    },
    navButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.text.primary,
    },
    navButtonTextDisabled: {
        color: colors.text.muted,
    },
    navButtonTextPrimary: {
        fontSize: 14,
        fontWeight: '700',
        color: '#000',
    },
    dotIndicator: {
        flexDirection: 'row',
        gap: 6,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: colors.border.default,
    },
    dotActive: {
        backgroundColor: colors.accent.primary,
        transform: [{ scale: 1.3 }],
    },
    dotAnswered: {
        backgroundColor: colors.status.success,
    },
    dotFlagged: {
        backgroundColor: colors.status.error,
    },
});
