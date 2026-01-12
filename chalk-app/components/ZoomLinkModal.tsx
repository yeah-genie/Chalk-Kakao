import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    Modal,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { colors, typography, spacing, radius } from '../constants/theme';
import { isValidZoomUrl, createBot } from '../lib/recallService';
import { supabase } from '../lib/supabase';

// ===================================
// ZOOM LINK INPUT MODAL
// Zoom 링크를 입력받아 봇 참가 요청
// ===================================

interface ZoomLinkModalProps {
    visible: boolean;
    onClose: () => void;
    sessionId?: string;
    studentName?: string;
    onBotJoined?: (botId: string) => void;
}

export default function ZoomLinkModal({
    visible,
    onClose,
    sessionId,
    studentName,
    onBotJoined,
}: ZoomLinkModalProps) {
    const [zoomUrl, setZoomUrl] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async () => {
        setError(null);

        if (!zoomUrl.trim()) {
            setError('Zoom 링크를 입력해주세요');
            return;
        }

        if (!isValidZoomUrl(zoomUrl)) {
            setError('올바른 Zoom 링크 형식이 아닙니다\n예: https://zoom.us/j/123456789');
            return;
        }

        setIsLoading(true);

        try {
            // Edge Function 호출
            const { data, error: funcError } = await supabase.functions.invoke('recall-bot', {
                body: {
                    meetingUrl: zoomUrl,
                    sessionId,
                    studentName,
                },
            });

            if (funcError) throw funcError;

            if (data?.botId) {
                Alert.alert(
                    '봇 참가 완료! 🎉',
                    `Chalk 봇이 Zoom 미팅에 참가했습니다.\n\n수업이 끝나면 자동으로 리포트가 생성됩니다.`,
                    [{ text: '확인', onPress: onClose }]
                );
                onBotJoined?.(data.botId);
            }
        } catch (err: any) {
            console.error('[ZoomLink] Error:', err);
            setError(err.message || '봇 참가에 실패했습니다');
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        setZoomUrl('');
        setError(null);
        onClose();
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={handleClose}
        >
            <View style={styles.overlay}>
                <View style={styles.modal}>
                    <Text style={styles.title}>Zoom 수업 연결 🎥</Text>
                    <Text style={styles.subtitle}>
                        Zoom 링크를 입력하면 Chalk 봇이{'\n'}
                        수업에 참가하여 자동으로 기록합니다
                    </Text>

                    <TextInput
                        style={[styles.input, error && styles.inputError]}
                        placeholder="https://zoom.us/j/123456789"
                        placeholderTextColor={colors.text.muted}
                        value={zoomUrl}
                        onChangeText={(text) => {
                            setZoomUrl(text);
                            setError(null);
                        }}
                        autoCapitalize="none"
                        autoCorrect={false}
                        keyboardType="url"
                    />

                    {error && (
                        <Text style={styles.errorText}>{error}</Text>
                    )}

                    <View style={styles.buttons}>
                        <TouchableOpacity
                            style={styles.cancelButton}
                            onPress={handleClose}
                            disabled={isLoading}
                        >
                            <Text style={styles.cancelText}>취소</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
                            onPress={handleSubmit}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <ActivityIndicator color="#000" size="small" />
                            ) : (
                                <Text style={styles.submitText}>봇 참가시키기</Text>
                            )}
                        </TouchableOpacity>
                    </View>

                    <Text style={styles.helpText}>
                        💡 Zoom에서 "참가자 초대" 버튼을 눌러{'\n'}
                        링크를 복사해오세요
                    </Text>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacing.lg,
    },
    modal: {
        backgroundColor: colors.bg.card,
        borderRadius: radius.xl,
        padding: spacing.xl,
        width: '100%',
        maxWidth: 400,
        borderWidth: 1,
        borderColor: colors.border.default,
    },
    title: {
        ...typography.h2,
        textAlign: 'center',
        marginBottom: spacing.sm,
    },
    subtitle: {
        ...typography.body,
        color: colors.text.secondary,
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: spacing.xl,
    },
    input: {
        backgroundColor: colors.bg.base,
        borderRadius: radius.md,
        padding: spacing.lg,
        ...typography.body,
        color: colors.text.primary,
        borderWidth: 1,
        borderColor: colors.border.default,
    },
    inputError: {
        borderColor: colors.status.error,
    },
    errorText: {
        ...typography.caption,
        color: colors.status.error,
        marginTop: spacing.sm,
        textAlign: 'center',
    },
    buttons: {
        flexDirection: 'row',
        gap: spacing.md,
        marginTop: spacing.xl,
    },
    cancelButton: {
        flex: 1,
        backgroundColor: colors.bg.elevated,
        borderRadius: radius.md,
        padding: spacing.lg,
        alignItems: 'center',
    },
    cancelText: {
        ...typography.body,
        color: colors.text.muted,
    },
    submitButton: {
        flex: 2,
        backgroundColor: colors.accent.primary,
        borderRadius: radius.md,
        padding: spacing.lg,
        alignItems: 'center',
    },
    submitButtonDisabled: {
        opacity: 0.6,
    },
    submitText: {
        ...typography.body,
        fontWeight: '600',
        color: '#000',
    },
    helpText: {
        ...typography.caption,
        color: colors.text.muted,
        textAlign: 'center',
        marginTop: spacing.xl,
        lineHeight: 18,
    },
});
