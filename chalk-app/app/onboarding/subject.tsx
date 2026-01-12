import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, radius } from '../../constants/theme';
import { router } from 'expo-router';
import { ChevronRight } from '../../components/Icons';
import { getSubjects, getTotalTopics } from '../../lib/curriculum';
import { useStore } from '../../lib/store';

// ===================================
// SUBJECT SELECTION ONBOARDING
// ===================================

export default function SubjectSelectionScreen() {
    const subjects = getSubjects();
    const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
    const { setSelectedSubjectId } = useStore();

    const handleContinue = () => {
        if (selectedSubject) {
            setSelectedSubjectId(selectedSubject);
            router.push('/onboarding/calendar');
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Text style={{ fontSize: 24, color: colors.text.primary }}>←</Text>
                </TouchableOpacity>
                <View style={styles.progressBar}>
                    <View style={[styles.progressFill, { width: '33%' }]} />
                </View>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                {/* Title */}
                <View style={styles.titleSection}>
                    <Text style={styles.title}>What do you teach?</Text>
                    <Text style={styles.subtitle}>
                        Select your primary subject. Chalk will track mastery across all topics.
                    </Text>
                </View>

                {/* Subject Cards */}
                <View style={styles.subjectGrid}>
                    {subjects.map((subject) => {
                        const isSelected = selectedSubject === subject.id;
                        const topicCount = getTotalTopics(subject.id);

                        return (
                            <TouchableOpacity
                                key={subject.id}
                                style={[
                                    styles.subjectCard,
                                    isSelected && styles.subjectCardSelected,
                                ]}
                                onPress={() => setSelectedSubject(subject.id)}
                            >
                                <View style={styles.subjectHeader}>
                                    <View style={[
                                        styles.radioOuter,
                                        isSelected && styles.radioOuterSelected,
                                    ]}>
                                        {isSelected && <View style={styles.radioInner} />}
                                    </View>
                                    <View style={styles.subjectInfo}>
                                        <Text style={[
                                            styles.subjectName,
                                            isSelected && styles.subjectNameSelected,
                                        ]}>
                                            {subject.name}
                                        </Text>
                                        <Text style={styles.subjectMeta}>
                                            {subject.units.length} units · {topicCount} topics
                                        </Text>
                                    </View>
                                </View>
                                {isSelected && (
                                    <View style={styles.unitsPreview}>
                                        {subject.units.slice(0, 3).map((unit, index) => (
                                            <Text key={unit.id} style={styles.unitPreviewText}>
                                                {index + 1}. {unit.name}
                                            </Text>
                                        ))}
                                        {subject.units.length > 3 && (
                                            <Text style={styles.unitPreviewMore}>
                                                +{subject.units.length - 3} more units
                                            </Text>
                                        )}
                                    </View>
                                )}
                            </TouchableOpacity>
                        );
                    })}

                    {/* Other Option */}
                    <TouchableOpacity
                        style={[
                            styles.subjectCard,
                            selectedSubject === 'other' && styles.subjectCardSelected,
                        ]}
                        onPress={() => setSelectedSubject('other')}
                    >
                        <View style={styles.subjectHeader}>
                            <View style={[
                                styles.radioOuter,
                                selectedSubject === 'other' && styles.radioOuterSelected,
                            ]}>
                                {selectedSubject === 'other' && <View style={styles.radioInner} />}
                            </View>
                            <View style={styles.subjectInfo}>
                                <Text style={[
                                    styles.subjectName,
                                    selectedSubject === 'other' && styles.subjectNameSelected,
                                ]}>
                                    Other
                                </Text>
                                <Text style={styles.subjectMeta}>
                                    Create custom curriculum later
                                </Text>
                            </View>
                        </View>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            {/* Continue Button */}
            <View style={styles.footer}>
                <TouchableOpacity
                    style={[
                        styles.continueButton,
                        !selectedSubject && styles.continueButtonDisabled,
                    ]}
                    onPress={handleContinue}
                    disabled={!selectedSubject}
                >
                    <Text style={styles.continueText}>Continue</Text>
                    <ChevronRight size={20} color="#000" />
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
        alignItems: 'center',
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        gap: spacing.md,
    },
    progressBar: {
        flex: 1,
        height: 4,
        backgroundColor: colors.border.default,
        borderRadius: 2,
    },
    progressFill: {
        height: 4,
        backgroundColor: colors.accent.primary,
        borderRadius: 2,
    },
    content: {
        padding: spacing.lg,
        paddingBottom: 100,
    },
    titleSection: {
        marginBottom: spacing.xl,
    },
    title: {
        fontSize: 28,
        fontWeight: '800',
        color: colors.text.primary,
        marginBottom: spacing.sm,
    },
    subtitle: {
        fontSize: 16,
        color: colors.text.muted,
        lineHeight: 24,
    },
    subjectGrid: {
        gap: spacing.md,
    },
    subjectCard: {
        backgroundColor: colors.bg.card,
        borderRadius: radius.xl,
        padding: spacing.lg,
        borderWidth: 2,
        borderColor: colors.border.subtle,
    },
    subjectCardSelected: {
        borderColor: colors.accent.primary,
        backgroundColor: colors.accent.muted,
    },
    subjectHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: spacing.md,
    },
    radioOuter: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: colors.border.default,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 2,
    },
    radioOuterSelected: {
        borderColor: colors.accent.primary,
    },
    radioInner: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: colors.accent.primary,
    },
    subjectInfo: {
        flex: 1,
    },
    subjectName: {
        fontSize: 17,
        fontWeight: '600',
        color: colors.text.primary,
    },
    subjectNameSelected: {
        color: colors.accent.primary,
    },
    subjectMeta: {
        fontSize: 13,
        color: colors.text.muted,
        marginTop: 2,
    },
    unitsPreview: {
        marginTop: spacing.md,
        paddingTop: spacing.md,
        borderTopWidth: 1,
        borderTopColor: colors.border.subtle,
    },
    unitPreviewText: {
        fontSize: 13,
        color: colors.text.secondary,
        marginBottom: 4,
    },
    unitPreviewMore: {
        fontSize: 12,
        color: colors.text.muted,
        marginTop: 4,
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: spacing.lg,
        backgroundColor: colors.bg.base,
        borderTopWidth: 1,
        borderTopColor: colors.border.subtle,
    },
    continueButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.accent.primary,
        borderRadius: radius.xl,
        paddingVertical: spacing.lg,
        gap: spacing.sm,
    },
    continueButtonDisabled: {
        backgroundColor: colors.border.default,
    },
    continueText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#000',
    },
});
