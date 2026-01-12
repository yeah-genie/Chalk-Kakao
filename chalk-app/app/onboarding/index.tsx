import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { colors, typography, spacing, radius } from '../../constants/theme';
import { ChevronRight, CheckCircle } from '../../components/Icons';
import { useGoogleCalendar } from '../../lib/useGoogleCalendar';

// ===================================
// 온보딩 - 튜터 정보 입력
// ===================================

export default function OnboardingIndex() {
    const [step, setStep] = useState(1);
    const [tutorName, setTutorName] = useState('');
    const [tutorPhone, setTutorPhone] = useState('');
    const { isConnected, connect, isLoading } = useGoogleCalendar();

    const isValidName = (name: string) => {
        const regex = /^[a-zA-Z가-힣\s]{2,20}$/;
        return regex.test(name);
    };

    const handleNext = () => {
        if (step === 1 && !isValidName(tutorName)) {
            Alert.alert('이름 확인', '이름은 한글 또는 영문 2~20자로 입력해주세요.');
            return;
        }

        if (step < 3) {
            setStep(step + 1);
        } else {
            // 온보딩 완료 - 메인 화면으로
            router.replace('/');
        }
    };

    const canProceed = () => {
        if (step === 1) return tutorName.trim().length >= 2;
        if (step === 2) return true; // 캘린더는 선택
        return true;
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Progress */}
            <View style={styles.progressContainer}>
                {[1, 2, 3].map((s) => (
                    <View
                        key={s}
                        style={[
                            styles.progressDot,
                            s <= step && styles.progressDotActive
                        ]}
                    />
                ))}
            </View>

            {/* Step Content */}
            <View style={styles.content}>
                {step === 1 && (
                    <>
                        <Text style={styles.stepTitle}>반갑습니다! 👋</Text>
                        <Text style={styles.stepSubtitle}>
                            Chalk가 모든 행정 업무를 대신 처리해 드릴게요.{'\n'}
                            먼저 기본 정보를 알려주세요.
                        </Text>

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>이름</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="선생님 성함"
                                placeholderTextColor={colors.text.muted}
                                value={tutorName}
                                onChangeText={setTutorName}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>연락처 (선택)</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="010-0000-0000"
                                placeholderTextColor={colors.text.muted}
                                value={tutorPhone}
                                onChangeText={setTutorPhone}
                                keyboardType="phone-pad"
                            />
                        </View>
                    </>
                )}

                {step === 2 && (
                    <>
                        <Text style={styles.stepTitle}>캘린더 연동 📅</Text>
                        <Text style={styles.stepSubtitle}>
                            Google Calendar를 연동하면{'\n'}
                            수업이 자동으로 감지됩니다.
                        </Text>

                        <TouchableOpacity
                            style={[
                                styles.connectButton,
                                isConnected && styles.connectButtonActive
                            ]}
                            onPress={connect}
                            disabled={isLoading || isConnected}
                        >
                            <View style={styles.connectLeft}>
                                <Text style={styles.connectIcon}>📅</Text>
                                <View>
                                    <Text style={styles.connectTitle}>Google Calendar</Text>
                                    <Text style={styles.connectDesc}>
                                        {isConnected ? '연동 완료' : '수업 일정 자동 동기화'}
                                    </Text>
                                </View>
                            </View>
                            {isConnected ? (
                                <CheckCircle size={24} color={colors.accent.primary} />
                            ) : (
                                <ChevronRight size={20} color={colors.text.muted} />
                            )}
                        </TouchableOpacity>

                        <Text style={styles.skipText}>
                            나중에 설정에서 연동할 수도 있어요
                        </Text>
                    </>
                )}

                {step === 3 && (
                    <>
                        <Text style={styles.stepTitle}>준비 완료! 🎉</Text>
                        <Text style={styles.stepSubtitle}>
                            이제 수업만 진행하세요.{'\n'}
                            리포트 생성과 발송은 Chalk가 알아서 해드릴게요.
                        </Text>

                        <View style={styles.featureList}>
                            <View style={styles.featureItem}>
                                <CheckCircle size={20} color={colors.accent.primary} />
                                <Text style={styles.featureText}>수업 자동 감지</Text>
                            </View>
                            <View style={styles.featureItem}>
                                <CheckCircle size={20} color={colors.accent.primary} />
                                <Text style={styles.featureText}>AI 리포트 자동 생성</Text>
                            </View>
                            <View style={styles.featureItem}>
                                <CheckCircle size={20} color={colors.accent.primary} />
                                <Text style={styles.featureText}>학부모 자동 발송</Text>
                            </View>
                            <View style={styles.featureItem}>
                                <CheckCircle size={20} color={colors.accent.primary} />
                                <Text style={styles.featureText}>정산 자동 관리</Text>
                            </View>
                        </View>
                    </>
                )}
            </View>

            {/* Footer */}
            <View style={styles.footer}>
                <TouchableOpacity
                    style={[
                        styles.nextButton,
                        !canProceed() && styles.nextButtonDisabled
                    ]}
                    onPress={handleNext}
                    disabled={!canProceed()}
                >
                    <Text style={styles.nextButtonText}>
                        {step === 3 ? '시작하기' : '다음'}
                    </Text>
                </TouchableOpacity>

                {step > 1 && (
                    <TouchableOpacity onPress={() => setStep(step - 1)}>
                        <Text style={styles.backText}>이전으로</Text>
                    </TouchableOpacity>
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
    progressContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: spacing.sm,
        paddingVertical: spacing.xl,
    },
    progressDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: colors.border.default,
    },
    progressDotActive: {
        backgroundColor: colors.accent.primary,
        width: 24,
    },

    content: {
        flex: 1,
        padding: spacing.xl,
    },
    stepTitle: {
        ...typography.h1,
        textAlign: 'center',
        marginBottom: spacing.md,
    },
    stepSubtitle: {
        ...typography.body,
        textAlign: 'center',
        color: colors.text.secondary,
        lineHeight: 24,
        marginBottom: spacing.xl,
    },

    inputGroup: {
        marginBottom: spacing.lg,
    },
    inputLabel: {
        ...typography.label,
        marginBottom: spacing.sm,
    },
    input: {
        backgroundColor: colors.bg.card,
        borderRadius: radius.md,
        padding: spacing.lg,
        ...typography.body,
        color: colors.text.primary,
        borderWidth: 1,
        borderColor: colors.border.default,
    },

    connectButton: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: colors.bg.card,
        borderRadius: radius.lg,
        padding: spacing.lg,
        borderWidth: 1,
        borderColor: colors.border.default,
        marginBottom: spacing.lg,
    },
    connectButtonActive: {
        borderColor: colors.accent.primary,
    },
    connectLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
    },
    connectIcon: {
        fontSize: 32,
    },
    connectTitle: {
        ...typography.body,
        fontWeight: '600',
    },
    connectDesc: {
        ...typography.caption,
    },
    skipText: {
        ...typography.caption,
        textAlign: 'center',
        color: colors.text.muted,
    },

    featureList: {
        gap: spacing.md,
        marginTop: spacing.xl,
    },
    featureItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        backgroundColor: colors.bg.card,
        borderRadius: radius.md,
        padding: spacing.lg,
    },
    featureText: {
        ...typography.body,
    },

    footer: {
        padding: spacing.xl,
        gap: spacing.md,
    },
    nextButton: {
        backgroundColor: colors.accent.primary,
        borderRadius: radius.lg,
        padding: spacing.lg,
        alignItems: 'center',
    },
    nextButtonDisabled: {
        opacity: 0.5,
    },
    nextButtonText: {
        ...typography.body,
        fontWeight: '600',
        color: '#000',
    },
    backText: {
        ...typography.body,
        textAlign: 'center',
        color: colors.text.muted,
    },
});
