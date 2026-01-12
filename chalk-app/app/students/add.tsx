import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, radius } from '../../constants/theme';
import { router } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { useStore } from '../../lib/store';

// ===================================
// ADD STUDENT SCREEN
// ===================================

const SUBJECTS = [
    'AP Calculus AB',
    'AP Calculus BC',
    'AP Physics',
    'AP Chemistry',
    'SAT Math',
    'General Math',
    'Other',
];

export default function AddStudentScreen() {
    const [name, setName] = useState('');
    const [subject, setSubject] = useState('');
    const [location, setLocation] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { fetchStudents, addStudent } = useStore();

    const handleSubmit = async () => {
        if (!name.trim()) {
            Alert.alert('Error', 'Please enter student name');
            return;
        }
        if (!subject) {
            Alert.alert('Error', 'Please select a subject');
            return;
        }

        setIsLoading(true);
        try {
            const { error } = await supabase
                .from('students')
                .insert({
                    name: name.trim(),
                    subject: subject,
                });

            if (error) throw error;

            await fetchStudents();
            Alert.alert('Success', 'Student added successfully');
            router.back();
        } catch (error) {
            // Demo mode: 로컬에 학생 추가 (store에 직접)
            console.log('[Demo] Adding student locally');
            const newStudent = {
                id: `demo_${Date.now()}`,
                name: name.trim(),
                subject: subject,
                created_at: new Date().toISOString(),
            };
            addStudent(newStudent);
            // 알림 표시하고 뒤로가기
            Alert.alert('Success', `${name} added! (Demo mode)`);
            router.back();
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Text style={{ fontSize: 24, color: colors.text.primary }}>✕</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Add Student</Text>
                <TouchableOpacity onPress={handleSubmit} disabled={isLoading}>
                    <Text style={[styles.saveText, isLoading && styles.saveTextDisabled]}>
                        {isLoading ? 'Saving...' : 'Save'}
                    </Text>
                </TouchableOpacity>
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={styles.content}>
                    {/* Name Input */}
                    <View style={styles.section}>
                        <Text style={styles.label}>STUDENT NAME</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter student name"
                            placeholderTextColor={colors.text.muted}
                            value={name}
                            onChangeText={setName}
                            autoFocus
                        />
                    </View>

                    {/* Subject Selection */}
                    <View style={styles.section}>
                        <Text style={styles.label}>SUBJECT</Text>
                        <View style={styles.subjectGrid}>
                            {SUBJECTS.map((s) => (
                                <TouchableOpacity
                                    key={s}
                                    style={[
                                        styles.subjectChip,
                                        subject === s && styles.subjectChipActive,
                                    ]}
                                    onPress={() => setSubject(s)}
                                >
                                    <Text
                                        style={[
                                            styles.subjectChipText,
                                            subject === s && styles.subjectChipTextActive,
                                        ]}
                                    >
                                        {s}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* Location (Optional - for Geofencing) */}
                    <View style={styles.section}>
                        <Text style={styles.label}>LESSON LOCATION (OPTIONAL)</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="e.g., Student's home, Library"
                            placeholderTextColor={colors.text.muted}
                            value={location}
                            onChangeText={setLocation}
                        />
                        <Text style={styles.hint}>
                            Used for location-based lesson reminders
                        </Text>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
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
        borderBottomWidth: 1,
        borderBottomColor: colors.border.subtle,
    },
    headerTitle: {
        fontSize: 17,
        fontWeight: '600',
        color: colors.text.primary,
    },
    saveText: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.accent.primary,
    },
    saveTextDisabled: {
        color: colors.text.muted,
    },
    content: {
        padding: spacing.lg,
    },
    section: {
        marginBottom: spacing.xl,
    },
    label: {
        fontSize: 10,
        fontWeight: '900',
        letterSpacing: 1.5,
        color: colors.text.muted,
        marginBottom: spacing.md,
    },
    input: {
        backgroundColor: colors.bg.card,
        borderRadius: radius.lg,
        padding: spacing.lg,
        fontSize: 16,
        color: colors.text.primary,
        borderWidth: 1,
        borderColor: colors.border.subtle,
    },
    subjectGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.sm,
    },
    subjectChip: {
        backgroundColor: colors.bg.card,
        borderRadius: radius.lg,
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        borderWidth: 1,
        borderColor: colors.border.subtle,
    },
    subjectChipActive: {
        backgroundColor: colors.accent.muted,
        borderColor: colors.accent.primary,
    },
    subjectChipText: {
        fontSize: 14,
        color: colors.text.secondary,
    },
    subjectChipTextActive: {
        color: colors.accent.primary,
        fontWeight: '600',
    },
    hint: {
        fontSize: 12,
        color: colors.text.muted,
        marginTop: spacing.sm,
    },
});
