import React from 'react';
import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import {
    getStudents,
    getStudentMastery,
    getSessions,
    getLatestStudentSessionNotes,
    getStudentMasteryHistory
} from '@/lib/actions/crud';
import { fetchSubjectData } from "@/lib/knowledge-graph-server";
import StudentDetailClient from './StudentDetailClient';
import Sidebar from '@/components/layout/Sidebar';
import { getStudentPredictions } from '@/lib/services/prediction';

export default async function StudentDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    // 1. Fetch Student Info
    const students = await getStudents();
    const student = students.find(s => s.id === id);

    if (!student) {
        return (
            <div className="flex min-h-screen bg-[#09090b] text-white">
                <Sidebar />
                <div className="flex-1 flex items-center justify-center p-4 md:p-8 md:ml-20 lg:ml-64 pb-24 md:pb-10">
                    <div className="text-center space-y-4">
                        <h1 className="text-xl md:text-2xl font-bold">Student Not Found</h1>
                        <p className="text-[#71717a] text-sm">The student you are looking for does not exist or has been removed.</p>
                    </div>
                </div>
            </div>
        );
    }

    // 2. Fetch Relevant Data
    const initialMastery = await getStudentMastery(id);
    const subject = await fetchSubjectData(student.subject_id);
    const sessions = await getSessions();
    const studentSessions = sessions.filter(s => s.student_id === id);

    // 3. Fetch Prediction Data and Insights
    const predictions = await getStudentPredictions(id, student.subject_id);
    const latestNotes = await getLatestStudentSessionNotes(id);
    const masteryHistory = await getStudentMasteryHistory(id);

    if (!subject) {
        return (
            <div className="flex min-h-screen bg-[#09090b] text-white">
                <Sidebar />
                <div className="flex-1 flex items-center justify-center p-4 md:p-8 md:ml-20 lg:ml-64 pb-24 md:pb-10">
                    <div className="text-center space-y-4">
                        <h1 className="text-xl md:text-2xl font-bold">Subject Data Missing</h1>
                        <p className="text-[#71717a] text-sm">Curriculum data for "{student.subject_id}" is not available.</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <StudentDetailClient
            student={student}
            initialMastery={initialMastery}
            subject={subject}
            sessions={studentSessions}
            predictions={predictions}
            latestNotes={latestNotes}
            masteryHistory={masteryHistory}
        />
    );
}
