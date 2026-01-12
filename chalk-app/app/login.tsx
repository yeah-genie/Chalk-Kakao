import React, { useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, radius } from '../constants/theme';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { supabase } from '../lib/supabase';
import { useStore } from '../lib/store';

// ===================================
// LOGIN SCREEN - Google OAuth
// ===================================

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
    const { setUser } = useStore();

    const [request, response, promptAsync] = Google.useAuthRequest({
        iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
        androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
        webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    });

    useEffect(() => {
        if (response?.type === 'success') {
            const { id_token } = response.params;
            handleGoogleLogin(id_token);
        }
    }, [response]);

    const handleGoogleLogin = async (idToken: string) => {
        try {
            const { data, error } = await supabase.auth.signInWithIdToken({
                provider: 'google',
                token: idToken,
            });

            if (error) throw error;

            if (data.user) {
                setUser(data.user);
                router.replace('/');
            }
        } catch (error) {
            console.error('Login error:', error);
        }
    };

    const handleDemoLogin = () => {
        // Skip login for demo
        router.replace('/');
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                {/* Logo */}
                <View style={styles.logoContainer}>
                    <View style={styles.logoIcon}>
                        <Ionicons name="sparkles" size={32} color="#000" />
                    </View>
                    <Text style={styles.logoText}>Chalk</Text>
                </View>

                {/* Tagline */}
                <Text style={styles.tagline}>You teach. AI scribes.</Text>
                <Text style={styles.subtitle}>
                    Turn every tutoring session into proof of mastery.
                </Text>

                {/* Login Buttons */}
                <View style={styles.buttonContainer}>
                    <TouchableOpacity
                        style={styles.googleButton}
                        onPress={() => promptAsync()}
                        disabled={!request}
                    >
                        <View style={styles.googleIcon}>
                            <Text style={styles.googleG}>G</Text>
                        </View>
                        <Text style={styles.googleText}>Continue with Google</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.demoButton}
                        onPress={handleDemoLogin}
                    >
                        <Text style={styles.demoText}>Try Demo Mode</Text>
                    </TouchableOpacity>
                </View>

                {/* Trust Badge */}
                <View style={styles.trustSection}>
                    <View style={styles.trustBadge}>
                        <Ionicons name="shield-checkmark" size={16} color={colors.accent.primary} />
                        <Text style={styles.trustText}>Your data stays private</Text>
                    </View>
                </View>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
                <Text style={styles.footerText}>
                    By continuing, you agree to our Terms and Privacy Policy
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
        justifyContent: 'center',
        paddingHorizontal: spacing.xl,
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: spacing.xl,
    },
    logoIcon: {
        width: 64,
        height: 64,
        borderRadius: 20,
        backgroundColor: colors.accent.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    logoText: {
        fontSize: 36,
        fontWeight: '800',
        color: colors.text.primary,
    },
    tagline: {
        fontSize: 24,
        fontWeight: '700',
        color: colors.text.primary,
        textAlign: 'center',
        marginBottom: spacing.sm,
    },
    subtitle: {
        fontSize: 16,
        color: colors.text.muted,
        textAlign: 'center',
        marginBottom: spacing.xxl * 2,
    },
    buttonContainer: {
        gap: spacing.md,
    },
    googleButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
        borderRadius: radius.xl,
        paddingVertical: spacing.lg,
        gap: spacing.md,
    },
    googleIcon: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
    },
    googleG: {
        fontSize: 18,
        fontWeight: '700',
        color: '#4285F4',
    },
    googleText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#000',
    },
    demoButton: {
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.bg.card,
        borderRadius: radius.xl,
        paddingVertical: spacing.lg,
        borderWidth: 1,
        borderColor: colors.border.default,
    },
    demoText: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.text.secondary,
    },
    trustSection: {
        alignItems: 'center',
        marginTop: spacing.xxl,
    },
    trustBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
        backgroundColor: colors.accent.muted,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: radius.full,
    },
    trustText: {
        fontSize: 13,
        color: colors.accent.primary,
        fontWeight: '500',
    },
    footer: {
        paddingHorizontal: spacing.xl,
        paddingBottom: spacing.xl,
    },
    footerText: {
        fontSize: 12,
        color: colors.text.muted,
        textAlign: 'center',
    },
});
