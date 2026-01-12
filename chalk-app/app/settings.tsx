import React from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    Alert,
    TextInput,
} from 'react-native';
import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, radius } from '../constants/theme';
import { useStore } from '../lib/store';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { syncCurriculum } from '../lib/curriculum';

// ===================================
// SETTINGS SCREEN
// ===================================

export default function SettingsScreen() {
    const { user, signOut } = useStore();
    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState(user?.user_metadata?.full_name || '');
    const [isSyncing, setIsSyncing] = useState(false);

    const isValidName = (name: string) => {
        const regex = /^[a-zA-Z가-힣\s]{2,20}$/;
        return regex.test(name);
    };

    const handleSaveName = async () => {
        if (!isValidName(name)) {
            Alert.alert('이름 확인', '이름은 한글 또는 영문 2~20자로 입력해주세요.');
            return;
        }

        // TODO: Update Supabase metadata
        // const { error } = await supabase.auth.updateUser({ data: { full_name: name } });
        // if (error) throw error;

        Alert.alert('변경 완료', '이름이 성공적으로 변경되었습니다.');
        setIsEditing(false);
    };

    const handleSyncCurriculum = async () => {
        setIsSyncing(true);
        const success = await syncCurriculum();
        setIsSyncing(false);
        if (success) {
            Alert.alert('Sync Complete', 'Curriculum has been updated to the latest version.');
        } else {
            Alert.alert('Sync Failed', 'Could not update curriculum. Please try again later.');
        }
    };

    const handleLogout = () => {
        Alert.alert(
            'Sign Out',
            'Are you sure you want to sign out?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Sign Out',
                    style: 'destructive',
                    onPress: async () => {
                        await signOut();
                        router.replace('/login');
                    },
                },
            ]
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Settings</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                {/* Profile Section */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionLabel}>PROFILE</Text>
                        <TouchableOpacity onPress={isEditing ? handleSaveName : () => setIsEditing(true)}>
                            <Text style={styles.editBtnText}>{isEditing ? 'Save' : 'Edit'}</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.card}>
                        <View style={styles.profileRow}>
                            <View style={styles.avatar}>
                                <Text style={styles.avatarText}>
                                    {(isEditing ? name : (user?.user_metadata?.full_name || 'T'))?.[0]?.toUpperCase()}
                                </Text>
                            </View>
                            <View style={styles.profileInfo}>
                                {isEditing ? (
                                    <TextInput
                                        style={styles.nameInput}
                                        value={name}
                                        onChangeText={setName}
                                        autoFocus
                                        placeholder="선생님 성함"
                                        placeholderTextColor={colors.text.muted}
                                    />
                                ) : (
                                    <Text style={styles.profileName}>
                                        {user?.user_metadata?.full_name || 'Tutor'}
                                    </Text>
                                )}
                                <Text style={styles.profileEmail}>
                                    {user?.email || 'Not signed in'}
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Account Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionLabel}>ACCOUNT</Text>
                    <View style={styles.card}>
                        <TouchableOpacity
                            style={styles.menuItem}
                            onPress={handleSyncCurriculum}
                            disabled={isSyncing}
                        >
                            <View style={styles.menuLeft}>
                                <Ionicons
                                    name={isSyncing ? "sync" : "cloud-download-outline"}
                                    size={20}
                                    color={isSyncing ? colors.accent.primary : colors.text.secondary}
                                />
                                <Text style={[styles.menuText, isSyncing && { color: colors.accent.primary }]}>
                                    {isSyncing ? 'Updating Curriculum...' : 'Update Curriculum'}
                                </Text>
                            </View>
                            {!isSyncing && <Ionicons name="chevron-forward" size={18} color={colors.text.muted} />}
                        </TouchableOpacity>
                        <View style={styles.separator} />
                        <TouchableOpacity
                            style={styles.menuItem}
                            onPress={() => router.push('/onboarding')} // Allow re-running calendar sync
                        >
                            <View style={styles.menuLeft}>
                                <Ionicons name="calendar-outline" size={20} color={colors.text.secondary} />
                                <Text style={styles.menuText}>Google Calendar Sync</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={18} color={colors.text.muted} />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Sign Out */}
                <View style={styles.section}>
                    <TouchableOpacity style={styles.signOutBtn} onPress={handleLogout}>
                        <Ionicons name="log-out-outline" size={20} color={colors.status.error} />
                        <Text style={styles.signOutText}>Sign Out</Text>
                    </TouchableOpacity>
                </View>

                {/* Version */}
                <Text style={styles.version}>Chalk v1.0.0</Text>
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
    section: {
        marginBottom: spacing.xl,
    },
    sectionLabel: {
        fontSize: 10,
        fontWeight: '900',
        letterSpacing: 1.5,
        color: colors.text.muted,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    editBtnText: {
        fontSize: 13,
        fontWeight: '600',
        color: colors.accent.primary,
    },
    nameInput: {
        fontSize: 17,
        fontWeight: '600',
        color: colors.text.primary,
        padding: 0,
        margin: 0,
    },
    card: {
        backgroundColor: colors.bg.card,
        borderRadius: radius.xl,
        borderWidth: 1,
        borderColor: colors.border.subtle,
        overflow: 'hidden',
    },
    profileRow: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.lg,
        gap: spacing.md,
    },
    avatar: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: colors.accent.muted,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        fontSize: 22,
        fontWeight: '600',
        color: colors.accent.primary,
    },
    profileInfo: {
        flex: 1,
    },
    profileName: {
        fontSize: 17,
        fontWeight: '600',
        color: colors.text.primary,
    },
    profileEmail: {
        fontSize: 14,
        color: colors.text.muted,
        marginTop: 2,
    },
    menuItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: spacing.lg,
    },
    menuLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
    },
    menuText: {
        fontSize: 15,
        color: colors.text.primary,
    },
    separator: {
        height: 1,
        backgroundColor: colors.border.subtle,
        marginHorizontal: spacing.lg,
    },
    badge: {
        backgroundColor: colors.border.default,
        paddingHorizontal: spacing.sm,
        paddingVertical: 2,
        borderRadius: radius.sm,
    },
    badgeText: {
        fontSize: 11,
        fontWeight: '600',
        color: colors.text.muted,
    },
    signOutBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.bg.card,
        borderRadius: radius.xl,
        padding: spacing.lg,
        borderWidth: 1,
        borderColor: 'rgba(239, 68, 68, 0.2)',
        gap: spacing.sm,
    },
    signOutText: {
        fontSize: 15,
        fontWeight: '600',
        color: colors.status.error,
    },
    version: {
        fontSize: 12,
        color: colors.text.muted,
        textAlign: 'center',
        marginTop: spacing.xl,
    },
});
