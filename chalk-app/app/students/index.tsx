import React, { useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, radius } from '../../constants/theme';
import { useStore } from '../../lib/store';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

// ===================================
// STUDENTS LIST SCREEN
// ===================================

function getScoreColor(score: number): string {
    if (score >= 80) return colors.status.success;
    if (score >= 60) return colors.accent.primary;
    if (score >= 40) return colors.status.warning;
    return colors.text.muted;
}

export default function StudentsScreen() {
    const { students, fetchStudents, isLoading } = useStore();
    const [search, setSearch] = React.useState('');

    useEffect(() => {
        fetchStudents();
    }, []);

    const filteredStudents = students?.filter(s =>
        s.name.toLowerCase().includes(search.toLowerCase())
    ) || [];

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Students</Text>
                <TouchableOpacity onPress={() => router.push('/students/add')}>
                    <Ionicons name="add" size={24} color={colors.accent.primary} />
                </TouchableOpacity>
            </View>

            {/* Search */}
            <View style={styles.searchContainer}>
                <Ionicons name="search" size={18} color={colors.text.muted} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search students..."
                    placeholderTextColor={colors.text.muted}
                    value={search}
                    onChangeText={setSearch}
                />
            </View>

            <ScrollView
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                {filteredStudents.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Ionicons name="people-outline" size={48} color={colors.text.muted} />
                        <Text style={styles.emptyTitle}>No students yet</Text>
                        <Text style={styles.emptySubtitle}>Add your first student to get started</Text>
                        <TouchableOpacity
                            style={styles.addButton}
                            onPress={() => router.push('/students/add')}
                        >
                            <Ionicons name="add" size={20} color="#000" />
                            <Text style={styles.addButtonText}>Add Student</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View style={styles.grid}>
                        {filteredStudents.map((student) => (
                            <TouchableOpacity
                                key={student.id}
                                style={styles.studentCard}
                                onPress={() => router.push(`/students/${student.id}` as any)}
                            >
                                <View style={styles.cardHeader}>
                                    <View style={styles.avatar}>
                                        <Text style={styles.avatarText}>{student.name[0]}</Text>
                                    </View>
                                    <View style={styles.masteryBadge}>
                                        <Text style={[styles.masteryText, { color: getScoreColor(72) }]}>
                                            72%
                                        </Text>
                                    </View>
                                </View>
                                <Text style={styles.studentName}>{student.name}</Text>
                                <Text style={styles.studentMeta}>{student.subject}</Text>
                                <View style={styles.statsRow}>
                                    <View style={styles.statItem}>
                                        <Text style={styles.statValue}>12</Text>
                                        <Text style={styles.statLabel}>Sessions</Text>
                                    </View>
                                    <View style={styles.statItem}>
                                        <Text style={styles.statValue}>8</Text>
                                        <Text style={styles.statLabel}>Topics</Text>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}
            </ScrollView>
        </SafeAreaView >
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
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.bg.card,
        borderRadius: radius.lg,
        marginHorizontal: spacing.lg,
        marginBottom: spacing.lg,
        paddingHorizontal: spacing.md,
        borderWidth: 1,
        borderColor: colors.border.subtle,
    },
    searchInput: {
        flex: 1,
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.sm,
        fontSize: 15,
        color: colors.text.primary,
    },
    content: {
        padding: spacing.lg,
        paddingTop: 0,
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: spacing.xxl * 2,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: colors.text.primary,
        marginTop: spacing.lg,
    },
    emptySubtitle: {
        fontSize: 15,
        color: colors.text.muted,
        marginTop: spacing.sm,
        marginBottom: spacing.xl,
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.accent.primary,
        paddingHorizontal: spacing.xl,
        paddingVertical: spacing.md,
        borderRadius: radius.xl,
        gap: spacing.xs,
    },
    addButtonText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#000',
    },
    grid: {
        gap: spacing.md,
    },
    studentCard: {
        backgroundColor: colors.bg.card,
        borderRadius: radius.xl,
        padding: spacing.lg,
        borderWidth: 1,
        borderColor: colors.border.subtle,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: spacing.md,
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: colors.border.default,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        fontSize: 18,
        fontWeight: '600',
        color: colors.text.primary,
    },
    masteryBadge: {
        backgroundColor: colors.accent.muted,
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
        borderRadius: radius.sm,
    },
    masteryText: {
        fontSize: 12,
        fontWeight: '700',
    },
    studentName: {
        fontSize: 17,
        fontWeight: '600',
        color: colors.text.primary,
    },
    studentMeta: {
        fontSize: 13,
        color: colors.text.muted,
        marginTop: 2,
    },
    statsRow: {
        flexDirection: 'row',
        marginTop: spacing.lg,
        gap: spacing.xl,
    },
    statItem: {
        alignItems: 'center',
    },
    statValue: {
        fontSize: 18,
        fontWeight: '700',
        color: colors.text.primary,
    },
    statLabel: {
        fontSize: 11,
        color: colors.text.muted,
        marginTop: 2,
    },
});
