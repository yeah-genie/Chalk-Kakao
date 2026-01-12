import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius } from '../../constants/theme';
import { useStore } from '../../lib/store';

// ===================================
// ESIP: 시험 선택 화면
// ===================================

type ExamType = 'SAT' | 'ACT' | 'AMC' | 'Custom';

interface ExamOption {
    type: ExamType;
    name: string;
    description: string;
    icon: keyof typeof Ionicons.glyphMap;
    color: string;
    sections: string[];
}

const EXAM_OPTIONS: ExamOption[] = [
    {
        type: 'SAT',
        name: 'SAT',
        description: 'College Board 대학입학시험',
        icon: 'school-outline',
        color: '#3B82F6',
        sections: ['Math', 'Reading & Writing'],
    },
    {
        type: 'ACT',
        name: 'ACT',
        description: 'American College Testing',
        icon: 'document-text-outline',
        color: '#10B981',
        sections: ['Math', 'English', 'Reading', 'Science'],
    },
    {
        type: 'AMC',
        name: 'AMC',
        description: 'American Mathematics Competition',
        icon: 'calculator-outline',
        color: '#8B5CF6',
        sections: ['AMC 8', 'AMC 10', 'AMC 12'],
    },
    {
        type: 'Custom',
        name: 'Custom Test',
        description: '직접 문제 구성',
        icon: 'create-outline',
        color: '#F59E0B',
        sections: ['All Topics'],
    },
];

export default function TestSelectionScreen() {
    const [selectedExam, setSelectedExam] = useState<ExamType | null>(null);
    const [selectedSection, setSelectedSection] = useState<string | null>(null);
    const [questionCount, setQuestionCount] = useState(10);
    const { selectedStudent } = useStore();

    const selectedExamOption = EXAM_OPTIONS.find(e => e.type === selectedExam);

    const handleStartTest = () => {
        if (!selectedStudent) {
            Alert.alert('Select Student', 'Please select a student first from the dashboard.');
            return;
        }

        if (!selectedExam) {
            Alert.alert('Select Exam', 'Please select an exam type.');
            return;
        }

        // 테스트 세션 생성 후 문제 풀이 화면으로 이동
        const sessionId = `test_${Date.now()}`;
        router.push({
            pathname: '/test/[sessionId]',
            params: {
                sessionId,
                examType: selectedExam,
                section: selectedSection || 'All',
                questionCount: questionCount.toString(),
            },
        });
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* 헤더 */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>ESIP Test</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* 학생 정보 */}
                <View style={styles.studentCard}>
                    <Ionicons name="person-circle" size={40} color={colors.accent.primary} />
                    <View style={styles.studentInfo}>
                        <Text style={styles.studentName}>
                            {selectedStudent?.name || 'No student selected'}
                        </Text>
                        <Text style={styles.studentSubject}>
                            {selectedStudent?.subject || 'Select from dashboard'}
                        </Text>
                    </View>
                </View>

                {/* 시험 유형 선택 */}
                <Text style={styles.sectionTitle}>Select Exam Type</Text>
                <View style={styles.examGrid}>
                    {EXAM_OPTIONS.map((exam) => (
                        <TouchableOpacity
                            key={exam.type}
                            style={[
                                styles.examCard,
                                selectedExam === exam.type && styles.examCardSelected,
                                { borderColor: selectedExam === exam.type ? exam.color : colors.border.default }
                            ]}
                            onPress={() => {
                                setSelectedExam(exam.type);
                                setSelectedSection(null);
                            }}
                        >
                            <View style={[styles.examIcon, { backgroundColor: exam.color + '20' }]}>
                                <Ionicons name={exam.icon} size={28} color={exam.color} />
                            </View>
                            <Text style={styles.examName}>{exam.name}</Text>
                            <Text style={styles.examDescription}>{exam.description}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* 섹션 선택 */}
                {selectedExamOption && (
                    <>
                        <Text style={styles.sectionTitle}>Select Section</Text>
                        <View style={styles.sectionGrid}>
                            <TouchableOpacity
                                style={[
                                    styles.sectionButton,
                                    !selectedSection && styles.sectionButtonSelected
                                ]}
                                onPress={() => setSelectedSection(null)}
                            >
                                <Text style={[
                                    styles.sectionButtonText,
                                    !selectedSection && styles.sectionButtonTextSelected
                                ]}>
                                    All Sections
                                </Text>
                            </TouchableOpacity>
                            {selectedExamOption.sections.map((section) => (
                                <TouchableOpacity
                                    key={section}
                                    style={[
                                        styles.sectionButton,
                                        selectedSection === section && styles.sectionButtonSelected
                                    ]}
                                    onPress={() => setSelectedSection(section)}
                                >
                                    <Text style={[
                                        styles.sectionButtonText,
                                        selectedSection === section && styles.sectionButtonTextSelected
                                    ]}>
                                        {section}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </>
                )}

                {/* 문제 수 선택 */}
                {selectedExam && (
                    <>
                        <Text style={styles.sectionTitle}>Number of Questions</Text>
                        <View style={styles.countGrid}>
                            {[5, 10, 15, 20].map((count) => (
                                <TouchableOpacity
                                    key={count}
                                    style={[
                                        styles.countButton,
                                        questionCount === count && styles.countButtonSelected
                                    ]}
                                    onPress={() => setQuestionCount(count)}
                                >
                                    <Text style={[
                                        styles.countButtonText,
                                        questionCount === count && styles.countButtonTextSelected
                                    ]}>
                                        {count}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </>
                )}

                {/* 요약 */}
                {selectedExam && (
                    <View style={styles.summaryCard}>
                        <Text style={styles.summaryTitle}>Test Summary</Text>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Exam</Text>
                            <Text style={styles.summaryValue}>{selectedExam}</Text>
                        </View>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Section</Text>
                            <Text style={styles.summaryValue}>{selectedSection || 'All'}</Text>
                        </View>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Questions</Text>
                            <Text style={styles.summaryValue}>{questionCount}</Text>
                        </View>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Est. Time</Text>
                            <Text style={styles.summaryValue}>~{Math.round(questionCount * 1.5)} min</Text>
                        </View>
                    </View>
                )}
            </ScrollView>

            {/* 시작 버튼 */}
            <View style={styles.footer}>
                <TouchableOpacity
                    style={[
                        styles.startButton,
                        (!selectedExam || !selectedStudent) && styles.startButtonDisabled
                    ]}
                    onPress={handleStartTest}
                    disabled={!selectedExam || !selectedStudent}
                >
                    <Ionicons name="play" size={20} color="#000" />
                    <Text style={styles.startButtonText}>Start Test</Text>
                </TouchableOpacity>
            </View>
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
        fontSize: 18,
        fontWeight: '700',
        color: colors.text.primary,
    },
    content: {
        flex: 1,
        paddingHorizontal: spacing.lg,
    },
    studentCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.bg.card,
        padding: spacing.lg,
        borderRadius: radius.lg,
        borderWidth: 1,
        borderColor: colors.border.default,
        marginBottom: spacing.xl,
    },
    studentInfo: {
        marginLeft: spacing.md,
    },
    studentName: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.text.primary,
    },
    studentSubject: {
        fontSize: 14,
        color: colors.text.muted,
        marginTop: 2,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: colors.text.muted,
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: spacing.md,
        marginTop: spacing.lg,
    },
    examGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.md,
    },
    examCard: {
        width: '47%',
        backgroundColor: colors.bg.card,
        padding: spacing.lg,
        borderRadius: radius.lg,
        borderWidth: 2,
        borderColor: colors.border.default,
    },
    examCardSelected: {
        borderWidth: 2,
    },
    examIcon: {
        width: 48,
        height: 48,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.sm,
    },
    examName: {
        fontSize: 16,
        fontWeight: '700',
        color: colors.text.primary,
        marginBottom: 4,
    },
    examDescription: {
        fontSize: 12,
        color: colors.text.muted,
    },
    sectionGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.sm,
    },
    sectionButton: {
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        borderRadius: radius.full,
        backgroundColor: colors.bg.card,
        borderWidth: 1,
        borderColor: colors.border.default,
    },
    sectionButtonSelected: {
        backgroundColor: colors.accent.primary,
        borderColor: colors.accent.primary,
    },
    sectionButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.text.secondary,
    },
    sectionButtonTextSelected: {
        color: '#000',
    },
    countGrid: {
        flexDirection: 'row',
        gap: spacing.sm,
    },
    countButton: {
        flex: 1,
        paddingVertical: spacing.lg,
        borderRadius: radius.md,
        backgroundColor: colors.bg.card,
        borderWidth: 1,
        borderColor: colors.border.default,
        alignItems: 'center',
    },
    countButtonSelected: {
        backgroundColor: colors.accent.primary,
        borderColor: colors.accent.primary,
    },
    countButtonText: {
        fontSize: 18,
        fontWeight: '700',
        color: colors.text.secondary,
    },
    countButtonTextSelected: {
        color: '#000',
    },
    summaryCard: {
        backgroundColor: colors.bg.card,
        padding: spacing.lg,
        borderRadius: radius.lg,
        borderWidth: 1,
        borderColor: colors.border.default,
        marginTop: spacing.xl,
        marginBottom: spacing.xxl,
    },
    summaryTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: colors.text.muted,
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: spacing.md,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: spacing.sm,
    },
    summaryLabel: {
        fontSize: 14,
        color: colors.text.muted,
    },
    summaryValue: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.text.primary,
    },
    footer: {
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.lg,
        borderTopWidth: 1,
        borderTopColor: colors.border.default,
    },
    startButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.accent.primary,
        paddingVertical: spacing.lg,
        borderRadius: radius.xl,
        gap: spacing.sm,
    },
    startButtonDisabled: {
        opacity: 0.5,
    },
    startButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#000',
    },
});
