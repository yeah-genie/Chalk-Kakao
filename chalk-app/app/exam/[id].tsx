import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
    ScrollView,
    Alert,
    Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
// Skia imports removed for Lite version
import { examTracker, QuestionEvent } from '../../lib/examTracker';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// ===================================
// TYPES
// ===================================

type Tool = 'pen' | 'eraser' | 'highlighter';

// DrawPath interface removed

interface Question {
    id: number;
    text: string;
    options?: string[];
}

// ===================================
// MOCK DATA (will be replaced by real PDF data)
// ===================================

const MOCK_QUESTIONS: Question[] = [
    { id: 1, text: 'If x + 5 = 12, what is the value of x?', options: ['A) 5', 'B) 7', 'C) 8', 'D) 17'] },
    { id: 2, text: 'What is 2/3 of 45?', options: ['A) 15', 'B) 25', 'C) 30', 'D) 35'] },
    { id: 3, text: 'Solve: 3x - 7 = 14', options: ['A) 3', 'B) 5', 'C) 7', 'D) 21'] },
    { id: 4, text: 'What is the perimeter of a rectangle with length 8 and width 5?', options: ['A) 13', 'B) 26', 'C) 40', 'D) 80'] },
    { id: 5, text: 'If a triangle has sides 3, 4, and 5, what is its area?', options: ['A) 6', 'B) 10', 'C) 12', 'D) 20'] },
];

const TOTAL_TIME_SECONDS = 30 * 60; // 30 minutes

// ===================================
// COMPONENT
// ===================================

export default function ExamViewerScreen() {
    const params = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const examId = params.id || 'practice-1';

    // State
    // State
    const [currentQuestion, setCurrentQuestion] = useState(1);
    const [selectedTool, setSelectedTool] = useState<Tool>('pen');
    // Paths state removed for Lite version
    const [remainingTime, setRemainingTime] = useState(TOTAL_TIME_SECONDS);
    const [flaggedQuestions, setFlaggedQuestions] = useState<Set<number>>(new Set());
    const [answers, setAnswers] = useState<Map<number, string>>(new Map());

    // Tool settings (Visual only for now)
    const toolSettings = {
        pen: { color: '#FF0000', strokeWidth: 3 },
        eraser: { color: 'transparent', strokeWidth: 20 },
        highlighter: { color: 'rgba(255, 255, 0, 0.4)', strokeWidth: 20 },
    };

    // ===================================
    // EFFECTS
    // ===================================

    // Initialize session
    useEffect(() => {
        examTracker.startSession(examId, MOCK_QUESTIONS.length);
        examTracker.onQuestionEnter(1);

        return () => {
            examTracker.endSession();
        };
    }, [examId]);

    // Timer
    useEffect(() => {
        const timer = setInterval(() => {
            setRemainingTime((prev) => {
                if (prev <= 0) {
                    clearInterval(timer);
                    handleSubmit();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    // ===================================
    // HANDLERS
    // ===================================

    const handleQuestionChange = useCallback((newQuestion: number) => {
        if (newQuestion < 1 || newQuestion > MOCK_QUESTIONS.length) return;

        examTracker.onQuestionEnter(newQuestion);
        setCurrentQuestion(newQuestion);
    }, []);

    const handleToolSelect = useCallback((tool: Tool) => {
        setSelectedTool(tool);
    }, []);

    const handleTouchStart = useCallback((event: any) => {
        const { locationX, locationY } = event.nativeEvent;
        const path = Skia.Path.Make();
        path.moveTo(locationX, locationY);
        setCurrentPath(path);

        if (selectedTool === 'eraser') {
            examTracker.onErase();
        } else {
            examTracker.onPenDown();
        }
    }, [selectedTool]);

    const handleTouchMove = useCallback((event: any) => {
        if (!currentPath) return;
        const { locationX, locationY } = event.nativeEvent;
        currentPath.lineTo(locationX, locationY);
        // Force re-render
        setCurrentPath(Skia.Path.MakeFromSVGString(currentPath.toSVGString()) ?? null);
    }, [currentPath]);

    const handleTouchEnd = useCallback(() => {
        if (!currentPath) return;

        examTracker.onPenUp();

        if (selectedTool !== 'eraser') {
            const newPath: DrawPath = {
                path: currentPath,
                color: toolSettings[selectedTool].color,
                strokeWidth: toolSettings[selectedTool].strokeWidth,
            };

            setPaths((prev) => {
                const updated = new Map(prev);
                const questionPaths = updated.get(currentQuestion) || [];
                updated.set(currentQuestion, [...questionPaths, newPath]);
                return updated;
            });
        }

        setCurrentPath(null);
    }, [currentPath, selectedTool, currentQuestion]);

    const handleFlag = useCallback(() => {
        examTracker.onFlag(currentQuestion);
        setFlaggedQuestions((prev) => {
            const updated = new Set(prev);
            if (updated.has(currentQuestion)) {
                updated.delete(currentQuestion);
            } else {
                updated.add(currentQuestion);
            }
            return updated;
        });
    }, [currentQuestion]);

    const handleAnswerSelect = useCallback((option: string) => {
        const previousAnswer = answers.get(currentQuestion);
        if (previousAnswer && previousAnswer !== option) {
            examTracker.onAnswerChanged();
        }
        setAnswers((prev) => new Map(prev).set(currentQuestion, option));
    }, [currentQuestion, answers]);

    const handleClearCanvas = useCallback(() => {
        setPaths((prev) => {
            const updated = new Map(prev);
            updated.set(currentQuestion, []);
            return updated;
        });
    }, [currentQuestion]);

    const handleSubmit = useCallback(() => {
        const session = examTracker.endSession();
        if (session) {
            console.log('[ExamViewer] Session data:', session);
            Alert.alert(
                'Exam Submitted',
                `Completed ${session.questionEvents.size}/${session.totalQuestions} questions`,
                [{ text: 'View Results', onPress: () => router.push('/report/strategy') }]
            );
        }
    }, [router]);

    // ===================================
    // HELPERS
    // ===================================

    const formatTime = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const currentQuestionData = MOCK_QUESTIONS[currentQuestion - 1];
    const questionPaths = paths.get(currentQuestion) || [];

    // ===================================
    // RENDER
    // ===================================

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Text style={styles.backText}>← Back</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Practice Exam</Text>
                <View style={styles.timerContainer}>
                    <Text style={[styles.timerText, remainingTime < 300 && styles.timerWarning]}>
                        {formatTime(remainingTime)}
                    </Text>
                </View>
            </View>

            {/* Question Area */}
            <View style={styles.questionArea}>
                <View style={styles.questionHeader}>
                    <Text style={styles.questionNumber}>Question {currentQuestion}</Text>
                    <TouchableOpacity onPress={handleFlag} style={styles.flagButton}>
                        <Text style={styles.flagText}>{flaggedQuestions.has(currentQuestion) ? '⚑' : '⚐'}</Text>
                    </TouchableOpacity>
                </View>

                <Text style={styles.questionText}>{currentQuestionData.text}</Text>

                {/* Answer Options */}
                {currentQuestionData.options && (
                    <View style={styles.optionsContainer}>
                        {currentQuestionData.options.map((option) => (
                            <TouchableOpacity
                                key={option}
                                style={[
                                    styles.optionButton,
                                    answers.get(currentQuestion) === option && styles.optionSelected,
                                ]}
                                onPress={() => handleAnswerSelect(option)}
                            >
                                <Text style={[
                                    styles.optionText,
                                    answers.get(currentQuestion) === option && styles.optionTextSelected,
                                ]}>
                                    {option}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}
            </View>

            {/* Canvas Area (Lite Version - Placeholder) */}
            <View style={styles.canvasContainer}>
                {/* 
                  [LITE VERSION] 
                  Skia Canvas removed for stability. 
                  Will be replaced with PDF + Canvas in Phase 2.
                */}
                <View style={styles.canvasPlaceholder}>
                    <Text style={styles.placeholderText}>Writing not available in Safe Mode</Text>
                    <Text style={[styles.placeholderText, { fontSize: 12, marginTop: 8 }]}>
                        (Animation Engine Disabled)
                    </Text>
                </View>
            </View>

            {/* Tool Bar */}
            <View style={styles.toolBar}>
                <TouchableOpacity
                    style={[styles.toolButton, selectedTool === 'pen' && styles.toolSelected]}
                    onPress={() => handleToolSelect('pen')}
                >
                    <Text style={styles.toolIcon}>✏️</Text>
                    <Text style={styles.toolLabel}>Pen</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.toolButton, selectedTool === 'eraser' && styles.toolSelected]}
                    onPress={() => handleToolSelect('eraser')}
                >
                    <Text style={styles.toolIcon}>🧽</Text>
                    <Text style={styles.toolLabel}>Eraser</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.toolButton, selectedTool === 'highlighter' && styles.toolSelected]}
                    onPress={() => handleToolSelect('highlighter')}
                >
                    <Text style={styles.toolIcon}>🌟</Text>
                    <Text style={styles.toolLabel}>Highlight</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.toolButton} onPress={handleClearCanvas}>
                    <Text style={styles.toolIcon}>🗑️</Text>
                    <Text style={styles.toolLabel}>Clear</Text>
                </TouchableOpacity>
            </View>

            {/* Navigation */}
            <View style={styles.navigation}>
                <TouchableOpacity
                    style={[styles.navButton, currentQuestion === 1 && styles.navDisabled]}
                    onPress={() => handleQuestionChange(currentQuestion - 1)}
                    disabled={currentQuestion === 1}
                >
                    <Text style={styles.navText}>◀ Previous</Text>
                </TouchableOpacity>

                {/* Question pills */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.questionPills}>
                    {MOCK_QUESTIONS.map((q) => (
                        <TouchableOpacity
                            key={q.id}
                            style={[
                                styles.pill,
                                currentQuestion === q.id && styles.pillActive,
                                flaggedQuestions.has(q.id) && styles.pillFlagged,
                                answers.has(q.id) && styles.pillAnswered,
                            ]}
                            onPress={() => handleQuestionChange(q.id)}
                        >
                            <Text style={[styles.pillText, currentQuestion === q.id && styles.pillTextActive]}>
                                {q.id}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                <TouchableOpacity
                    style={[styles.navButton, currentQuestion === MOCK_QUESTIONS.length && styles.navDisabled]}
                    onPress={() => handleQuestionChange(currentQuestion + 1)}
                    disabled={currentQuestion === MOCK_QUESTIONS.length}
                >
                    <Text style={styles.navText}>Next ▶</Text>
                </TouchableOpacity>
            </View>

            {/* Submit Button */}
            <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                <Text style={styles.submitText}>Submit Exam</Text>
            </TouchableOpacity>
        </View>
    );
}

// ===================================
// STYLES - Dark Theme
// ===================================

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#09090b',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingTop: Platform.OS === 'ios' ? 50 : 16,
        paddingBottom: 12,
        backgroundColor: '#18181b',
        borderBottomWidth: 1,
        borderBottomColor: '#27272a',
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
        color: '#fafafa',
    },
    timerContainer: {
        backgroundColor: '#3B82F6',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
    },
    timerText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#000',
        fontVariant: ['tabular-nums'],
    },
    timerWarning: {
        backgroundColor: '#EF4444',
    },
    questionArea: {
        backgroundColor: '#18181b',
        padding: 16,
        marginBottom: 8,
    },
    questionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    questionNumber: {
        fontSize: 14,
        fontWeight: '600',
        color: '#71717a',
    },
    flagButton: {
        padding: 8,
        backgroundColor: '#27272a',
        borderRadius: 8,
    },
    flagText: {
        fontSize: 20,
    },
    questionText: {
        fontSize: 18,
        color: '#fafafa',
        lineHeight: 26,
    },
    optionsContainer: {
        marginTop: 16,
    },
    optionButton: {
        backgroundColor: '#27272a',
        padding: 14,
        borderRadius: 10,
        marginBottom: 8,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    optionSelected: {
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.15)',
    },
    optionText: {
        fontSize: 16,
        color: '#fafafa',
    },
    optionTextSelected: {
        color: '#3B82F6',
        fontWeight: '600',
    },
    canvasContainer: {
        flex: 1,
        backgroundColor: '#1f1f23',
        marginHorizontal: 16,
        borderRadius: 12,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#27272a',
    },
    canvas: {
        flex: 1,
    },
    canvasPlaceholder: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
    },
    placeholderText: {
        fontSize: 16,
        color: '#71717a',
    },
    toolBar: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingVertical: 12,
        backgroundColor: '#18181b',
        marginTop: 8,
        marginHorizontal: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#27272a',
    },
    toolButton: {
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
    },
    toolSelected: {
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
    },
    toolIcon: {
        fontSize: 24,
    },
    toolLabel: {
        fontSize: 12,
        marginTop: 4,
        color: '#a1a1aa',
    },
    navigation: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
    },
    navButton: {
        paddingHorizontal: 12,
        paddingVertical: 8,
    },
    navDisabled: {
        opacity: 0.3,
    },
    navText: {
        fontSize: 14,
        color: '#3B82F6',
        fontWeight: '500',
    },
    questionPills: {
        flex: 1,
        marginHorizontal: 8,
    },
    pill: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#27272a',
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: 4,
    },
    pillActive: {
        backgroundColor: '#3B82F6',
    },
    pillFlagged: {
        borderWidth: 2,
        borderColor: '#FBBF24',
    },
    pillAnswered: {
        backgroundColor: '#22c55e',
    },
    pillText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#a1a1aa',
    },
    pillTextActive: {
        color: '#000',
    },
    submitButton: {
        backgroundColor: '#3B82F6',
        marginHorizontal: 16,
        marginBottom: Platform.OS === 'ios' ? 34 : 16,
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
    },
    submitText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#000',
    },
});
