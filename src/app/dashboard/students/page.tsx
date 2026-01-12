'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import type { Student } from '@/lib/supabase/types';

export default function StudentsPage() {
    const t = useTranslations('students');
    const tCommon = useTranslations('common');

    const [students, setStudents] = useState<Student[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingStudent, setEditingStudent] = useState<Student | null>(null);
    const [userId, setUserId] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        name: '',
        subject: '',
        grade: '',
        goal: '',
        parent_contact: '',
        notes: '',
    });

    const supabase = createClient();

    useEffect(() => {
        initializeUser();
    }, []);

    const initializeUser = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            setUserId(user.id);
            fetchStudents(user.id);
        } else {
            setIsLoading(false);
        }
    };

    const fetchStudents = async (tutorId: string) => {
        setIsLoading(true);
        const { data, error } = await supabase
            .from('students')
            .select('*')
            .eq('tutor_id', tutorId)
            .order('created_at', { ascending: false });

        if (!error && data) {
            setStudents(data);
        }
        setIsLoading(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userId) return;

        if (editingStudent) {
            const { error } = await supabase
                .from('students')
                .update({
                    name: formData.name,
                    subject: formData.subject || null,
                    grade: formData.grade || null,
                    goal: formData.goal || null,
                    parent_contact: formData.parent_contact || null,
                    notes: formData.notes || null,
                })
                .eq('id', editingStudent.id);

            if (!error) {
                fetchStudents(userId);
                closeModal();
            }
        } else {
            const { error } = await supabase
                .from('students')
                .insert({
                    tutor_id: userId,
                    name: formData.name,
                    subject: formData.subject || null,
                    grade: formData.grade || null,
                    goal: formData.goal || null,
                    parent_contact: formData.parent_contact || null,
                    notes: formData.notes || null,
                    status: 'active',
                });

            if (!error) {
                fetchStudents(userId);
                closeModal();
            }
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm(t('actions.confirmDelete'))) return;
        if (!userId) return;

        const { error } = await supabase.from('students').delete().eq('id', id);
        if (!error) {
            fetchStudents(userId);
        }
    };

    const toggleStatus = async (student: Student) => {
        if (!userId) return;
        const newStatus = student.status === 'active' ? 'paused' : 'active';

        const { error } = await supabase
            .from('students')
            .update({ status: newStatus })
            .eq('id', student.id);

        if (!error) {
            fetchStudents(userId);
        }
    };

    const openEditModal = (student: Student) => {
        setEditingStudent(student);
        setFormData({
            name: student.name,
            subject: student.subject || '',
            grade: student.grade || '',
            goal: student.goal || '',
            parent_contact: student.parent_contact || '',
            notes: student.notes || '',
        });
        setShowAddModal(true);
    };

    const closeModal = () => {
        setShowAddModal(false);
        setEditingStudent(null);
        setFormData({ name: '', subject: '', grade: '', goal: '', parent_contact: '', notes: '' });
    };

    return (
        <div className="min-h-screen bg-[#0a0a0b]">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-[#0a0a0b]/95 backdrop-blur-sm border-b border-zinc-800/50">
                <div className="max-w-lg mx-auto px-5 h-14 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link href="/dashboard" className="text-zinc-400 hover:text-white transition-colors">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </Link>
                        <h1 className="text-[15px] font-semibold text-white">{t('title')}</h1>
                    </div>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-sm font-medium text-white transition-colors"
                    >
                        {t('addStudent')}
                    </button>
                </div>
            </header>

            <main className="max-w-lg mx-auto px-5 py-6">
                {isLoading ? (
                    <div className="text-center py-16">
                        <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                        <p className="text-sm text-zinc-500">{tCommon('loading')}</p>
                    </div>
                ) : students.length === 0 ? (
                    <div className="text-center py-16">
                        <p className="text-zinc-500 mb-4">{t('noStudents.title')}</p>
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="px-5 py-2.5 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm text-white transition-colors"
                        >
                            {t('noStudents.action')}
                        </button>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {students.map((student) => (
                            <div
                                key={student.id}
                                className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 group"
                            >
                                <div className="flex items-center justify-between">
                                    <Link href={`/dashboard/students/${student.id}`} className="flex items-center gap-3 flex-1 min-w-0">
                                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm font-semibold text-white flex-shrink-0 ${
                                            student.status === 'active' ? 'bg-emerald-600' : 'bg-zinc-700'
                                        }`}>
                                            {student.name.charAt(0)}
                                        </div>
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2">
                                                <h2 className="text-sm font-medium text-white truncate">{student.name}</h2>
                                                {student.status !== 'active' && (
                                                    <span className="px-1.5 py-0.5 text-[10px] bg-zinc-800 text-zinc-500 rounded">
                                                        {t(`status.${student.status}`)}
                                                    </span>
                                                )}
                                            </div>
                                            {(student.subject || student.grade) && (
                                                <p className="text-xs text-zinc-500 truncate">
                                                    {student.subject}{student.grade && ` · ${student.grade}`}
                                                </p>
                                            )}
                                        </div>
                                    </Link>

                                    {/* Actions */}
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => toggleStatus(student)}
                                            className="p-2 text-zinc-500 hover:text-white transition-colors"
                                            title={student.status === 'active' ? t('actions.pause') : t('actions.activate')}
                                        >
                                            {student.status === 'active' ? (
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                            ) : (
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                            )}
                                        </button>
                                        <button
                                            onClick={() => openEditModal(student)}
                                            className="p-2 text-zinc-500 hover:text-white transition-colors"
                                        >
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                            </svg>
                                        </button>
                                        <button
                                            onClick={() => handleDelete(student.id)}
                                            className="p-2 text-zinc-500 hover:text-red-400 transition-colors"
                                        >
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {/* Add/Edit Modal */}
            <AnimatePresence>
                {showAddModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60"
                        onClick={closeModal}
                    >
                        <motion.div
                            initial={{ y: 100, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 100, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-[#0a0a0b] rounded-t-2xl sm:rounded-2xl p-5 w-full max-w-lg border-t sm:border border-zinc-800"
                        >
                            <div className="flex items-center justify-between mb-5">
                                <h2 className="text-lg font-semibold text-white">
                                    {editingStudent ? t('editStudent') : t('addStudent')}
                                </h2>
                                <button onClick={closeModal} className="text-zinc-500 hover:text-white transition-colors">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-xs text-zinc-500 mb-1.5">{t('form.name')} *</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-3 py-2.5 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-white focus:border-zinc-600 outline-none transition-colors"
                                        required
                                        placeholder={t('form.namePlaceholder')}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs text-zinc-500 mb-1.5">{t('form.subject')}</label>
                                        <input
                                            type="text"
                                            value={formData.subject}
                                            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                            className="w-full px-3 py-2.5 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-white focus:border-zinc-600 outline-none transition-colors"
                                            placeholder={t('form.subjectPlaceholder')}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-zinc-500 mb-1.5">{t('form.grade')}</label>
                                        <input
                                            type="text"
                                            value={formData.grade}
                                            onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                                            className="w-full px-3 py-2.5 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-white focus:border-zinc-600 outline-none transition-colors"
                                            placeholder={t('form.gradePlaceholder')}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs text-zinc-500 mb-1.5">{t('form.parentContact')}</label>
                                    <input
                                        type="text"
                                        value={formData.parent_contact}
                                        onChange={(e) => setFormData({ ...formData, parent_contact: e.target.value })}
                                        className="w-full px-3 py-2.5 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-white focus:border-zinc-600 outline-none transition-colors"
                                        placeholder={t('form.parentContactPlaceholder')}
                                    />
                                </div>

                                <div className="flex gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={closeModal}
                                        className="flex-1 py-2.5 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm text-white transition-colors"
                                    >
                                        {tCommon('cancel')}
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-sm font-medium text-white transition-colors"
                                    >
                                        {editingStudent ? tCommon('save') : tCommon('add')}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
