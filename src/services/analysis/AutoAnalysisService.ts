/**
 * AutoAnalysisService
 * AI 기반 수업 자동 분석 - 화자 분리, PDS 추출, 인사이트 생성
 */

import { createClient } from '@/lib/supabase/client';
import type {
  Recording,
  RecordingAnalysis,
  SpeakerSegment,
  DifficultyMoment,
} from '@/lib/supabase/types';

// PDS 태그 사전
const PROBLEM_KEYWORDS = {
  '계산실수': ['틀렸', '실수', '계산', '답이 다른'],
  '개념이해': ['이해가 안', '무슨 말', '왜 그런', '모르겠'],
  '문제해석': ['문제가', '뭘 구하는', '어떻게 시작'],
  '시간부족': ['시간', '빨리', '늦', '못 풀었'],
  '공식암기': ['공식', '외워', '기억이'],
  '응용력': ['응용', '변형', '새로운 유형'],
};

const DIAGNOSIS_KEYWORDS = {
  '기초부족': ['기초', '처음부터', '기본'],
  '부주의': ['조심', '꼼꼼', '실수'],
  '연습부족': ['연습', '익숙하지', '처음'],
  '개념혼동': ['헷갈', '비슷', '섞여'],
  '자신감부족': ['자신', '어려워', '못 하겠'],
  '집중력': ['집중', '딴 생각', '멍'],
};

const SOLUTION_KEYWORDS = {
  '반복연습': ['다시', '반복', '여러 번'],
  '개념정리': ['정리', '개념', '설명'],
  '유사문제': ['비슷한', '유형', '문제를 더'],
  '시각화': ['그림', '그래프', '보여'],
  '오답노트': ['오답', '정리', '복습'],
  '격려': ['잘했', '괜찮', '할 수 있'],
};

interface TranscriptionResult {
  text: string;
  segments: Array<{
    start: number;
    end: number;
    text: string;
  }>;
}

interface DiarizationResult {
  speakers: SpeakerSegment[];
  tutorRatio: number;
  studentRatio: number;
}

class AutoAnalysisService {
  private apiKey: string | null = null;

  constructor() {
    this.apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY || null;
  }

  /**
   * 녹음 분석 실행
   */
  async analyzeRecording(recordingId: string): Promise<RecordingAnalysis | null> {
    const supabase = createClient();

    try {
      // Get recording info
      const { data: recording, error: fetchError } = await supabase
        .from('recordings')
        .select('*')
        .eq('id', recordingId)
        .single();

      if (fetchError || !recording) {
        throw new Error('Recording not found');
      }

      // Update status to processing
      await supabase
        .from('recordings')
        .update({ status: 'processing' })
        .eq('id', recordingId);

      // Step 1: Transcribe audio
      const transcription = await this.transcribeAudio(recording.audio_url!);

      // Step 2: Speaker diarization (simplified)
      const diarization = await this.performDiarization(transcription);

      // Step 3: Extract PDS tags
      const pdsTags = this.extractPDSTags(transcription.text);

      // Step 4: Generate summary and insights
      const insights = await this.generateInsights(transcription.text, diarization);

      // Step 5: Identify difficulty moments
      const difficultyMoments = this.identifyDifficultyMoments(
        transcription.segments,
        diarization.speakers
      );

      // Create analysis record
      const analysis: Omit<RecordingAnalysis, 'id' | 'created_at'> = {
        recording_id: recordingId,
        full_transcript: transcription.text,
        speakers: diarization.speakers,
        tutor_speaking_ratio: diarization.tutorRatio,
        student_speaking_ratio: diarization.studentRatio,
        summary: insights.summary,
        key_topics: insights.topics,
        problem_tags: pdsTags.problem,
        diagnosis_tags: pdsTags.diagnosis,
        solution_tags: pdsTags.solution,
        understanding_score: insights.understandingScore,
        engagement_score: insights.engagementScore,
        difficulty_moments: difficultyMoments,
      };

      // Save to database
      const { data: savedAnalysis, error: saveError } = await supabase
        .from('recording_analyses')
        .insert(analysis)
        .select()
        .single();

      if (saveError) {
        throw saveError;
      }

      // Update recording status
      await supabase
        .from('recordings')
        .update({ status: 'analyzed' })
        .eq('id', recordingId);

      // Auto-generate lesson log
      await this.autoGenerateLessonLog(recording, savedAnalysis);

      return savedAnalysis;
    } catch (error) {
      console.error('Analysis failed:', error);

      // Update status to error
      await supabase
        .from('recordings')
        .update({ status: 'error' })
        .eq('id', recordingId);

      return null;
    }
  }

  /**
   * 오디오 전사 (Whisper API)
   */
  private async transcribeAudio(audioUrl: string): Promise<TranscriptionResult> {
    // In production, use OpenAI Whisper API
    // For now, return mock data for development
    if (!this.apiKey) {
      return this.mockTranscription();
    }

    try {
      // Fetch audio file
      const audioResponse = await fetch(audioUrl);
      const audioBlob = await audioResponse.blob();

      // Create form data for Whisper API
      const formData = new FormData();
      formData.append('file', audioBlob, 'audio.webm');
      formData.append('model', 'whisper-1');
      formData.append('language', 'ko');
      formData.append('response_format', 'verbose_json');

      const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Transcription failed');
      }

      const data = await response.json();

      return {
        text: data.text,
        segments: data.segments?.map((seg: { start: number; end: number; text: string }) => ({
          start: seg.start,
          end: seg.end,
          text: seg.text,
        })) || [],
      };
    } catch (error) {
      console.error('Transcription error:', error);
      return this.mockTranscription();
    }
  }

  /**
   * 화자 분리 (간단한 휴리스틱 사용)
   * 실제 프로덕션에서는 pyannote.audio 같은 전문 도구 사용 권장
   */
  private async performDiarization(
    transcription: TranscriptionResult
  ): Promise<DiarizationResult> {
    const speakers: SpeakerSegment[] = [];
    let tutorDuration = 0;
    let studentDuration = 0;

    // Simple heuristic: longer segments are likely from tutor
    // Questions and short responses are likely from student
    const questionPatterns = /[?？]|네|아|음|몰라|어려워/;
    const tutorPatterns = /그래서|왜냐하면|이 부분은|자, |한번|해볼까|설명하면/;

    for (const segment of transcription.segments) {
      const duration = segment.end - segment.start;
      const text = segment.text.trim();

      let speaker: 'tutor' | 'student';

      if (text.length < 20 && questionPatterns.test(text)) {
        speaker = 'student';
      } else if (tutorPatterns.test(text) || duration > 10) {
        speaker = 'tutor';
      } else if (text.length < 30) {
        speaker = 'student';
      } else {
        speaker = 'tutor';
      }

      speakers.push({
        speaker,
        start_time: segment.start,
        end_time: segment.end,
        text,
      });

      if (speaker === 'tutor') {
        tutorDuration += duration;
      } else {
        studentDuration += duration;
      }
    }

    const totalDuration = tutorDuration + studentDuration;

    return {
      speakers,
      tutorRatio: totalDuration > 0 ? tutorDuration / totalDuration : 0.7,
      studentRatio: totalDuration > 0 ? studentDuration / totalDuration : 0.3,
    };
  }

  /**
   * PDS 태그 추출
   */
  private extractPDSTags(text: string): {
    problem: string[];
    diagnosis: string[];
    solution: string[];
  } {
    const extractTags = (keywords: Record<string, string[]>): string[] => {
      const tags: string[] = [];
      for (const [tag, patterns] of Object.entries(keywords)) {
        if (patterns.some((pattern) => text.includes(pattern))) {
          tags.push(tag);
        }
      }
      return tags;
    };

    return {
      problem: extractTags(PROBLEM_KEYWORDS),
      diagnosis: extractTags(DIAGNOSIS_KEYWORDS),
      solution: extractTags(SOLUTION_KEYWORDS),
    };
  }

  /**
   * AI 인사이트 생성
   */
  private async generateInsights(
    transcript: string,
    diarization: DiarizationResult
  ): Promise<{
    summary: string;
    topics: string[];
    understandingScore: number;
    engagementScore: number;
  }> {
    // In production, use GPT-4 for better insights
    if (this.apiKey) {
      return this.generateAIInsights(transcript, diarization);
    }

    // Mock insights for development
    return this.generateMockInsights(transcript, diarization);
  }

  /**
   * GPT-4를 사용한 인사이트 생성
   */
  private async generateAIInsights(
    transcript: string,
    diarization: DiarizationResult
  ): Promise<{
    summary: string;
    topics: string[];
    understandingScore: number;
    engagementScore: number;
  }> {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: `당신은 과외 수업 분석 전문가입니다. 수업 녹취록을 분석하여 다음 정보를 JSON으로 반환해주세요:
              - summary: 수업 요약 (2-3문장)
              - topics: 다룬 주요 토픽 배열 (최대 5개)
              - understandingScore: 학생의 이해도 점수 (0-100)
              - engagementScore: 학생의 참여도 점수 (0-100)`,
            },
            {
              role: 'user',
              content: `다음 수업 녹취록을 분석해주세요:\n\n${transcript.slice(0, 3000)}`,
            },
          ],
          temperature: 0.3,
        }),
      });

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content || '';

      try {
        const parsed = JSON.parse(content);
        return {
          summary: parsed.summary || '수업 요약을 생성할 수 없습니다.',
          topics: parsed.topics || [],
          understandingScore: parsed.understandingScore || 70,
          engagementScore: parsed.engagementScore || 70,
        };
      } catch {
        return this.generateMockInsights(transcript, diarization);
      }
    } catch (error) {
      console.error('AI insights error:', error);
      return this.generateMockInsights(transcript, diarization);
    }
  }

  /**
   * 목 인사이트 생성 (개발용)
   */
  private generateMockInsights(
    transcript: string,
    diarization: DiarizationResult
  ): {
    summary: string;
    topics: string[];
    understandingScore: number;
    engagementScore: number;
  } {
    // Calculate engagement based on student speaking ratio
    const engagementScore = Math.round(diarization.studentRatio * 150);
    const clampedEngagement = Math.min(100, Math.max(30, engagementScore));

    // Extract potential topics from transcript
    const topicPatterns = ['이차방정식', '함수', '미분', '적분', '영단어', '문법', '독해'];
    const topics = topicPatterns.filter((topic) => transcript.includes(topic)).slice(0, 5);

    if (topics.length === 0) {
      topics.push('오늘 학습 내용');
    }

    return {
      summary: '학생이 개념을 이해하려고 노력했으며, 몇 가지 어려운 부분에 대해 추가 설명이 진행되었습니다.',
      topics,
      understandingScore: 75,
      engagementScore: clampedEngagement,
    };
  }

  /**
   * 어려움 구간 식별
   */
  private identifyDifficultyMoments(
    segments: Array<{ start: number; end: number; text: string }>,
    speakers: SpeakerSegment[]
  ): DifficultyMoment[] {
    const difficulties: DifficultyMoment[] = [];
    const difficultyPatterns = [
      '모르겠',
      '어려워',
      '헷갈',
      '이해가 안',
      '다시 한번',
      '왜요',
    ];

    for (const segment of segments) {
      for (const pattern of difficultyPatterns) {
        if (segment.text.includes(pattern)) {
          difficulties.push({
            timestamp: segment.start,
            topic: this.extractTopicFromContext(segment.text),
            indicator: pattern,
          });
          break;
        }
      }
    }

    return difficulties.slice(0, 10); // Max 10 difficulty moments
  }

  /**
   * 문맥에서 토픽 추출
   */
  private extractTopicFromContext(text: string): string {
    const topicPatterns = [
      { pattern: /방정식/, topic: '방정식' },
      { pattern: /함수/, topic: '함수' },
      { pattern: /미분/, topic: '미분' },
      { pattern: /적분/, topic: '적분' },
      { pattern: /문법/, topic: '문법' },
      { pattern: /단어/, topic: '어휘' },
    ];

    for (const { pattern, topic } of topicPatterns) {
      if (pattern.test(text)) {
        return topic;
      }
    }

    return '일반 학습';
  }

  /**
   * 수업 로그 자동 생성
   */
  private async autoGenerateLessonLog(
    recording: Recording,
    analysis: RecordingAnalysis
  ): Promise<void> {
    const supabase = createClient();

    const { error } = await supabase.from('logs').insert({
      user_id: recording.user_id,
      student_id: recording.student_id,
      lesson_date: recording.lesson_date,
      duration_minutes: Math.round(recording.duration_seconds / 60),
      problem_tags: analysis.problem_tags,
      problem_detail: null,
      diagnosis_tags: analysis.diagnosis_tags,
      diagnosis_detail: null,
      solution_tags: analysis.solution_tags,
      solution_detail: analysis.summary,
      recording_id: recording.id,
      auto_generated: true,
    });

    if (error) {
      console.error('Failed to auto-generate lesson log:', error);
    }
  }

  /**
   * 목 전사 데이터 (개발용)
   */
  private mockTranscription(): TranscriptionResult {
    return {
      text: '자, 오늘은 이차방정식을 배워볼게요. 네, 알겠어요. 이차방정식의 기본 형태는 ax^2 + bx + c = 0이에요. 아, 그렇군요. 잘 이해가 안돼요. 다시 설명해드릴게요. 왜 제곱인 거예요? 좋은 질문이에요. 그래서...',
      segments: [
        { start: 0, end: 5, text: '자, 오늘은 이차방정식을 배워볼게요.' },
        { start: 5, end: 7, text: '네, 알겠어요.' },
        { start: 7, end: 15, text: '이차방정식의 기본 형태는 ax^2 + bx + c = 0이에요.' },
        { start: 15, end: 18, text: '아, 그렇군요. 잘 이해가 안돼요.' },
        { start: 18, end: 22, text: '다시 설명해드릴게요.' },
        { start: 22, end: 25, text: '왜 제곱인 거예요?' },
        { start: 25, end: 30, text: '좋은 질문이에요. 그래서...' },
      ],
    };
  }
}

export const autoAnalysisService = new AutoAnalysisService();
export default AutoAnalysisService;
