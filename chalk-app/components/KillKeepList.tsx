import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

// ===================================
// TYPES
// ===================================

export interface StrategyItem {
    topic: string;
    subtopic?: string;
    difficulty: number;
    reason: string;
}

interface KillKeepListProps {
    killList: StrategyItem[];
    keepList: StrategyItem[];
    onItemPress?: (item: StrategyItem) => void;
}

// ===================================
// COMPONENT
// ===================================

export function KillKeepList({ killList, keepList, onItemPress }: KillKeepListProps) {
    const renderDifficultyStars = (difficulty: number) => {
        return '⭐'.repeat(Math.min(difficulty, 5));
    };

    const renderItem = (item: StrategyItem, type: 'kill' | 'keep') => (
        <TouchableOpacity
            key={`${type}-${item.topic}-${item.subtopic}`}
            style={[styles.item, type === 'kill' ? styles.killItem : styles.keepItem]}
            onPress={() => onItemPress?.(item)}
            activeOpacity={0.7}
        >
            <View style={styles.itemHeader}>
                <Text style={[styles.itemTopic, type === 'kill' ? styles.killText : styles.keepText]}>
                    {item.topic}
                </Text>
                <Text style={styles.difficulty}>{renderDifficultyStars(item.difficulty)}</Text>
            </View>

            {item.subtopic && (
                <Text style={styles.subtopic}>{item.subtopic}</Text>
            )}

            <Text style={styles.reason}>{item.reason}</Text>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            {/* Kill Section - Skip These */}
            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <View style={styles.iconContainer}>
                        <Text style={styles.killIcon}>✕</Text>
                    </View>
                    <View style={styles.headerText}>
                        <Text style={styles.sectionTitle}>Skip These</Text>
                        <Text style={styles.sectionSubtitle}>Focus on easier wins first</Text>
                    </View>
                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>{killList.length}</Text>
                    </View>
                </View>

                {killList.length > 0 ? (
                    <View style={styles.itemList}>
                        {killList.map((item) => renderItem(item, 'kill'))}
                    </View>
                ) : (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyText}>No topics to skip - great job!</Text>
                    </View>
                )}
            </View>

            {/* Keep Section - Must Get Right */}
            <View style={[styles.section, styles.keepSection]}>
                <View style={styles.sectionHeader}>
                    <View style={[styles.iconContainer, styles.keepIconContainer]}>
                        <Text style={styles.keepIcon}>✓</Text>
                    </View>
                    <View style={styles.headerText}>
                        <Text style={[styles.sectionTitle, styles.keepSectionTitle]}>Must Get Right</Text>
                        <Text style={styles.sectionSubtitle}>High ROI focus areas</Text>
                    </View>
                    <View style={[styles.badge, styles.keepBadge]}>
                        <Text style={[styles.badgeText, styles.keepBadgeText]}>{keepList.length}</Text>
                    </View>
                </View>

                {keepList.length > 0 ? (
                    <View style={styles.itemList}>
                        {keepList.map((item) => renderItem(item, 'keep'))}
                    </View>
                ) : (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyText}>Keep practicing all areas</Text>
                    </View>
                )}
            </View>

            {/* Strategy Tip */}
            <View style={styles.strategyTip}>
                <Text style={styles.tipIcon}>💡</Text>
                <Text style={styles.tipText}>
                    Skip hard topics during practice and focus on "Must Get Right" items for maximum score improvement.
                </Text>
            </View>
        </View>
    );
}

// ===================================
// STYLES
// ===================================

const styles = StyleSheet.create({
    container: {
        marginHorizontal: 16,
    },
    section: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#FEE2E2',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    keepSection: {
        borderColor: '#D1FAE5',
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#FEE2E2',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    keepIconContainer: {
        backgroundColor: '#D1FAE5',
    },
    killIcon: {
        fontSize: 20,
        color: '#DC2626',
        fontWeight: '700',
    },
    keepIcon: {
        fontSize: 20,
        color: '#059669',
        fontWeight: '700',
    },
    headerText: {
        flex: 1,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#DC2626',
    },
    keepSectionTitle: {
        color: '#059669',
    },
    sectionSubtitle: {
        fontSize: 13,
        color: '#6B7280',
        marginTop: 2,
    },
    badge: {
        backgroundColor: '#FEE2E2',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    keepBadge: {
        backgroundColor: '#D1FAE5',
    },
    badgeText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#DC2626',
    },
    keepBadgeText: {
        color: '#059669',
    },
    itemList: {
        gap: 8,
    },
    item: {
        padding: 12,
        borderRadius: 10,
    },
    killItem: {
        backgroundColor: '#FEF2F2',
    },
    keepItem: {
        backgroundColor: '#F0FDF4',
    },
    itemHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    itemTopic: {
        fontSize: 15,
        fontWeight: '600',
    },
    killText: {
        color: '#991B1B',
    },
    keepText: {
        color: '#065F46',
    },
    difficulty: {
        fontSize: 12,
    },
    subtopic: {
        fontSize: 13,
        color: '#6B7280',
        marginBottom: 4,
    },
    reason: {
        fontSize: 13,
        color: '#4B5563',
        fontStyle: 'italic',
    },
    emptyState: {
        paddingVertical: 16,
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 14,
        color: '#9CA3AF',
    },
    strategyTip: {
        flexDirection: 'row',
        backgroundColor: '#FEF3C7',
        padding: 12,
        borderRadius: 12,
        alignItems: 'flex-start',
    },
    tipIcon: {
        fontSize: 18,
        marginRight: 8,
    },
    tipText: {
        flex: 1,
        fontSize: 13,
        color: '#92400E',
        lineHeight: 18,
    },
});

export default KillKeepList;
