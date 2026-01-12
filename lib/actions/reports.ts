"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

/**
 * 학부모 리포트 생성 서버 액션 (P0)
 * 최근 세션 데이터를 바탕으로 AI가 학부모용 요약문을 작성합니다.
 */
export async function generateParentReport(studentId: string) {
    try {
        const supabase = await createServerSupabaseClient();

        // 1. 학생 및 세션 데이터 조회
        const { data: student } = await supabase
            .from('students')
            .select('name, subject_id')
            .eq('id', studentId)
            .single();

        if (!student) throw new Error("Student not found");

        const { data: sessions } = await supabase
            .from('sessions')
            .select('notes, scheduled_at')
            .eq('student_id', studentId)
            .eq('status', 'completed')
            .order('scheduled_at', { ascending: false })
            .limit(3);

        if (!sessions || sessions.length === 0) {
            return {
                success: false,
                error: "No completed sessions found to summarize."
            };
        }

        // 2. AI에게 요약 요청
        const sessionTexts = sessions.map(s => `[${s.scheduled_at}] ${s.notes}`).join('\n');

        const prompt = `
            You are a professional tutor reporting to a parent. 
            Student: ${student.name}
            Subject: ${student.subject_id}
            Recent Session Notes:
            ${sessionTexts}

            Write a warm, professional, and insightful summary (2-3 paragraphs) for the parent.
            Focus on:
            1. Recent achievements and progress.
            2. Areas that need more attention.
            3. A short encouraging closing statement.

            Language: Korean (Professional and polite 'Haeyoche' or 'Hasipsioche' style).
        `;

        const result = await model.generateContent(prompt);
        const reportText = result.response.text();

        return {
            success: true,
            report: reportText,
            studentName: student.name
        };

    } catch (e: any) {
        console.error("Error generating parent report:", e);
        return { success: false, error: e.message };
    }
}
