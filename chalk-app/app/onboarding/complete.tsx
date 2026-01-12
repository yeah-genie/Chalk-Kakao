import React, { useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { colors, typography, spacing, radius } from '../../constants/theme';
import { CheckCircle } from '../../components/Icons';

// ===================================
// ONBOARDING COMPLETE
// 온보딩 완료 - 가치 요약 및 첫 행동 유도
// ===================================

export default function OnboardingCompleteScreen() {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;
    const scaleAnim = useRef(new Animated.Value(0.8)).current;

    useEffect(() => {
        // 순차적 애니메이션
        Animated.sequence([
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 400,
                    useNativeDriver: true,
                }),
                Animated.timing(scaleAnim, {
                    toValue: 1,
                    duration: 400,
                    useNativeDriver: true,
                }),
            ]),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    const handleGetStarted = () => {
        // 온보딩 완료 - 메인 대시보드로 이동
        router.replace('/');
    };

    const features = [
        { icon: '📅', title: 'Auto-Detect', desc: 'Lessons from your calendar' },
        { icon: '🤖', title: 'Auto-Record', desc: 'Bot joins meetings for you' },
        { icon: '📊', title: 'Auto-Report', desc: 'AI generates progress reports' },
        { icon: '✉️', title: 'Auto-Send', desc: 'Parents receive updates' },
    ];

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                {/* Success Animation */}
                <Animated.View
                    style={[
                        styles.successContainer,
                        {
                            opacity: fadeAnim,
                            transform: [{ scale: scaleAnim }],
                        }
                    ]}
                >
                    <View style={styles.successCircle}>
                        <CheckCircle size={48} color={colors.accent.primary} />
                    </View>
                    <Text style={styles.successEmoji}>🎉</Text>
                </Animated.View>

                {/* Title */}
                <Animated.View
                    style={[
                        styles.titleContainer,
                        {
                            opacity: fadeAnim,
                            transform: [{ translateY: slideAnim }],
                        }
                    ]}
                >
                    <Text style={styles.title}>You're All Set!</Text>
                    <Text style={styles.subtitle}>
                        Chalk will handle the busywork.{'\n'}
                        You just focus on teaching.
                    </Text>
                </Animated.View>

                {/* Features Summary */}
                <Animated.View
                    style={[
                        styles.featuresContainer,
                        {
                            opacity: fadeAnim,
                            transform: [{ translateY: slideAnim }],
                        }
                    ]}
                >
                    {features.map((feature, index) => (
                        <View key={index} style={styles.featureItem}>
                            <Text style={styles.featureIcon}>{feature.icon}</Text>
                            <View style={styles.featureText}>
                                <Text style={styles.featureTitle}>{feature.title}</Text>
                                <Text style={styles.featureDesc}>{feature.desc}</Text>
                            </View>
                        </View>
                    ))}
                </Animated.View>

                {/* Value Statement */}
                <Animated.View
                    style={[
                        styles.valueCard,
                        { opacity: fadeAnim }
                    ]}
                >
                    <Text style={styles.valueEmoji}>💡</Text>
                    <Text style={styles.valueText}>
                        Average tutor saves <Text style={styles.highlight}>3+ hours/week</Text> on admin tasks
                    </Text>
                </Animated.View>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
                <TouchableOpacity
                    style={styles.startButton}
                    onPress={handleGetStarted}
                >
                    <Text style={styles.startButtonText}>Start Teaching</Text>
                </TouchableOpacity>

                <Text style={styles.hint}>
                    Your next lesson will be recorded automatically
                </Text>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.bg.base,
    },
    content: {
        flex: 1,
        padding: spacing.xl,
        alignItems: 'center',
        justifyContent: 'center',
    },

    // Success Animation
    successContainer: {
        alignItems: 'center',
        marginBottom: spacing.xl,
        position: 'relative',
    },
    successCircle: {
        width: 96,
        height: 96,
        borderRadius: 48,
        backgroundColor: colors.accent.primary + '20',
        justifyContent: 'center',
        alignItems: 'center',
    },
    successEmoji: {
        fontSize: 32,
        position: 'absolute',
        top: -10,
        right: -10,
    },

    // Title
    titleContainer: {
        alignItems: 'center',
        marginBottom: spacing.xxl,
    },
    title: {
        ...typography.h1,
        fontSize: 32,
        textAlign: 'center',
        marginBottom: spacing.md,
    },
    subtitle: {
        ...typography.body,
        color: colors.text.secondary,
        textAlign: 'center',
        lineHeight: 24,
    },

    // Features
    featuresContainer: {
        width: '100%',
        gap: spacing.sm,
        marginBottom: spacing.xl,
    },
    featureItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.bg.card,
        borderRadius: radius.md,
        padding: spacing.md,
        gap: spacing.md,
    },
    featureIcon: {
        fontSize: 24,
        width: 40,
        textAlign: 'center',
    },
    featureText: {
        flex: 1,
    },
    featureTitle: {
        ...typography.body,
        fontWeight: '600',
    },
    featureDesc: {
        ...typography.caption,
        color: colors.text.muted,
    },

    // Value Card
    valueCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.accent.primary + '15',
        borderRadius: radius.lg,
        padding: spacing.lg,
        gap: spacing.md,
        borderWidth: 1,
        borderColor: colors.accent.primary + '30',
    },
    valueEmoji: {
        fontSize: 24,
    },
    valueText: {
        ...typography.body,
        flex: 1,
    },
    highlight: {
        color: colors.accent.primary,
        fontWeight: '700',
    },

    // Footer
    footer: {
        padding: spacing.xl,
        paddingTop: spacing.md,
    },
    startButton: {
        backgroundColor: colors.accent.primary,
        borderRadius: radius.lg,
        padding: spacing.lg,
        alignItems: 'center',
    },
    startButtonText: {
        ...typography.body,
        fontWeight: '700',
        color: '#000',
        fontSize: 18,
    },
    hint: {
        ...typography.caption,
        color: colors.text.muted,
        textAlign: 'center',
        marginTop: spacing.md,
    },
});
