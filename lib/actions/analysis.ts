"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { transcribeAudio } from "@/lib/services/whisper";
import { extractTopicsFromTranscript, type MultimodalImage } from "@/lib/services/gemini";
import { calculateNewScore } from "@/lib/mastery-utils";
import { revalidatePath } from "next/cache";

/**
 * 전체 세션 분석 파이프라인
 * 1. 오디오 저장
 * 2. STT (Whisper)
 * 3. AI 분석 (Gemini)
 * 4. DB 업데이트 (Mastery & Topics)
 */
export async function processSessionAudio(formData: FormData) {
    const blob = formData.get('audio') as Blob;
    const studentId = formData.get('studentId') as string;
    const subjectId = formData.get('subjectId') as string;

    if (!blob || !studentId) {
        return { success: false, error: "Missing audio or student ID" };
    }

    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Unauthorized" };

    try {
        // 1. 세션 기본 정보 생성 (in_progress)
        const { data: session, error: sessionError } = await supabase
            .from('sessions')
            .insert({
                tutor_id: user.id,
                student_id: studentId,
                subject_id: subjectId,
                scheduled_at: new Date().toISOString(),
                status: 'in_progress'
            })
            .select()
            .single();

        if (sessionError) throw sessionError;

        // 2. 오디오 업로드 (Supabase Storage)
        const fileName = `${user.id}/${session.id}.webm`;
        const { error: uploadError } = await supabase.storage
            .from('recordings')
            .upload(fileName, blob, {
                contentType: 'audio/webm',
                upsert: true
            });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
            .from('recordings')
            .getPublicUrl(fileName);

        // 3. Speech-to-Text via Whisper API
        console.log('[Analysis] Starting transcription...');
        const transcriptionResult = await transcribeAudio(blob);

        if (!transcriptionResult.success || !transcriptionResult.transcript) {
            throw new Error(transcriptionResult.error || 'Transcription failed');
        }

        const transcript = transcriptionResult.transcript;
        console.log(`[Analysis] Transcription complete: ${transcript.length} chars`);

        // 4. AI Analysis via Gemini (Multimodal support added P1.3)
        const { fetchSubjectData } = await import('@/lib/knowledge-graph-server');
        const subject = await fetchSubjectData(subjectId);
        const existingTopics = subject?.topics || [];
        const subjectName = subject?.name || subjectId;

        // Process images for Gemini multimodal analysis
        const imageCount = parseInt(formData.get('imageCount') as string || '0');
        const multimodalImages: MultimodalImage[] = [];
        const evidenceUrls: string[] = [];

        for (let i = 0; i < imageCount; i++) {
            const imageBlob = formData.get(`image_${i}`) as Blob;
            if (imageBlob) {
                // A. Upload to Supabase Storage
                const imageFileName = `${user.id}/evidence/${session.id}_${i}.jpg`;
                await supabase.storage
                    .from('recordings')
                    .upload(imageFileName, imageBlob, {
                        contentType: imageBlob.type || 'image/jpeg',
                        upsert: true
                    });

                const { data: { publicUrl: imgUrl } } = supabase.storage
                    .from('recordings')
                    .getPublicUrl(imageFileName);
                evidenceUrls.push(imgUrl);

                // B. Prepare for Gemini
                const buffer = await imageBlob.arrayBuffer();
                multimodalImages.push({
                    inlineData: {
                        data: Buffer.from(buffer).toString('base64'),
                        mimeType: imageBlob.type || 'image/jpeg'
                    }
                });
            }
        }

        console.log(`[Analysis] Starting Gemini analysis with ${multimodalImages.length} images...`);
        const analysis = await extractTopicsFromTranscript(
            transcript,
            subjectId,
            subjectName,
            existingTopics,
            multimodalImages
        );

        if (!analysis.success) throw new Error(analysis.error);

        // 5. DB 업데이트 (Topics & Mastery)
        for (const topic of analysis.topics) {
            // A. 세션 토픽 기록
            await supabase.from('session_topics').insert({
                session_id: session.id,
                topic_id: topic.topicId,
                status_after: topic.status,
                evidence: topic.evidence,
                future_impact: topic.futureImpact
            });

            // B. 학생 숙련도 업데이트 (개인화된 분석 데이터 반영)
            const { data: currentMastery } = await supabase
                .from('student_mastery')
                .select('score')
                .eq('student_id', studentId)
                .eq('topic_id', topic.topicId)
                .single();

            const oldScore = currentMastery?.score || 0;
            const newScore = calculateNewScore(oldScore, topic.status, topic.confidence);

            await supabase.from('student_mastery').upsert({
                student_id: studentId,
                topic_id: topic.topicId,
                score: newScore,
                status: topic.status,
                updated_at: new Date().toISOString()
            });
        }

        // 6. AI Taxonomy Ingestion
        if (analysis.suggestedNewNodes && analysis.suggestedNewNodes.length > 0) {
            const proposals = analysis.suggestedNewNodes.map(node => ({
                session_id: session.id,
                subject_id: subjectId,
                type: node.type,
                name: node.name,
                description: node.description,
                parent_id: node.parentId,
                status: 'pending'
            }));

            await supabase.from('kb_proposed_taxonomy').insert(proposals);
        }

        // 7. 세션 완료 및 메타데이터 업데이트
        await supabase.from('sessions').update({
            status: 'completed',
            recording_url: publicUrl,
            transcript: transcript,
            transcript_segments: transcriptionResult.segments,
            evidence_urls: evidenceUrls,
            notes: analysis.summary
        }).eq('id', session.id);

        revalidatePath('/dashboard');
        revalidatePath(`/dashboard/students/${studentId}`);
        revalidatePath('/dashboard/analysis');

        return {
            success: true,
            sessionId: session.id,
            topicsFound: analysis.topics.length,
            proposalsFound: analysis.suggestedNewNodes?.length || 0
        };

    } catch (e) {
        const error = e as Error;
        console.error("Error processing session audio:", error);
        return { success: false, error: error.message || 'Analysis failed' };
    }
}
