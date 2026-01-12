/**
 * LessonRecordingService
 * 수업 녹음 서비스 - Web Audio API를 사용한 실시간 녹음
 */

import { createClient } from '@/lib/supabase/client';
import type { Recording } from '@/lib/supabase/types';

export type RecordingState = 'idle' | 'recording' | 'paused' | 'stopped';

export interface RecordingSession {
  id: string;
  studentId: string | null;
  startTime: Date;
  duration: number; // seconds
  state: RecordingState;
}

export interface RecordingEventHandlers {
  onStateChange?: (state: RecordingState) => void;
  onDurationUpdate?: (seconds: number) => void;
  onError?: (error: Error) => void;
  onUploadProgress?: (progress: number) => void;
  onAnalysisReady?: (recordingId: string) => void;
}

class LessonRecordingService {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private stream: MediaStream | null = null;
  private startTime: Date | null = null;
  private durationInterval: NodeJS.Timeout | null = null;
  private currentSession: RecordingSession | null = null;
  private handlers: RecordingEventHandlers = {};

  /**
   * 마이크 권한 요청 및 스트림 초기화
   */
  async initialize(): Promise<boolean> {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
        },
      });
      return true;
    } catch (error) {
      console.error('Failed to access microphone:', error);
      this.handlers.onError?.(new Error('마이크 접근 권한이 필요합니다.'));
      return false;
    }
  }

  /**
   * 이벤트 핸들러 설정
   */
  setEventHandlers(handlers: RecordingEventHandlers): void {
    this.handlers = handlers;
  }

  /**
   * 녹음 시작
   */
  async startRecording(studentId: string | null = null): Promise<string | null> {
    if (!this.stream) {
      const initialized = await this.initialize();
      if (!initialized) return null;
    }

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('로그인이 필요합니다.');
      }

      // Generate session ID
      const sessionId = crypto.randomUUID();
      this.startTime = new Date();

      // Create recording record in DB
      const { error: dbError } = await supabase.from('recordings').insert({
        id: sessionId,
        user_id: user.id,
        student_id: studentId,
        lesson_date: this.startTime.toISOString().split('T')[0],
        duration_seconds: 0,
        status: 'recording',
        started_at: this.startTime.toISOString(),
      });

      if (dbError) {
        console.error('Failed to create recording record:', dbError);
        // Continue anyway - we'll retry on save
      }

      // Initialize MediaRecorder
      this.mediaRecorder = new MediaRecorder(this.stream!, {
        mimeType: this.getSupportedMimeType(),
      });

      this.audioChunks = [];

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.mediaRecorder.onerror = (event) => {
        console.error('MediaRecorder error:', event);
        this.handlers.onError?.(new Error('녹음 중 오류가 발생했습니다.'));
      };

      // Start recording with 1-second timeslices for real-time chunks
      this.mediaRecorder.start(1000);

      // Track session
      this.currentSession = {
        id: sessionId,
        studentId,
        startTime: this.startTime,
        duration: 0,
        state: 'recording',
      };

      // Start duration tracking
      this.startDurationTracking();
      this.handlers.onStateChange?.('recording');

      return sessionId;
    } catch (error) {
      console.error('Failed to start recording:', error);
      this.handlers.onError?.(error as Error);
      return null;
    }
  }

  /**
   * 녹음 일시정지
   */
  pauseRecording(): void {
    if (this.mediaRecorder?.state === 'recording') {
      this.mediaRecorder.pause();
      this.stopDurationTracking();
      if (this.currentSession) {
        this.currentSession.state = 'paused';
      }
      this.handlers.onStateChange?.('paused');
    }
  }

  /**
   * 녹음 재개
   */
  resumeRecording(): void {
    if (this.mediaRecorder?.state === 'paused') {
      this.mediaRecorder.resume();
      this.startDurationTracking();
      if (this.currentSession) {
        this.currentSession.state = 'recording';
      }
      this.handlers.onStateChange?.('recording');
    }
  }

  /**
   * 녹음 중지 및 저장
   */
  async stopRecording(): Promise<Recording | null> {
    if (!this.mediaRecorder || !this.currentSession) {
      return null;
    }

    return new Promise((resolve) => {
      this.mediaRecorder!.onstop = async () => {
        this.stopDurationTracking();

        const audioBlob = new Blob(this.audioChunks, {
          type: this.getSupportedMimeType(),
        });

        const recording = await this.saveRecording(audioBlob);

        this.currentSession!.state = 'stopped';
        this.handlers.onStateChange?.('stopped');

        resolve(recording);
      };

      this.mediaRecorder!.stop();
    });
  }

  /**
   * 녹음 취소 (저장하지 않음)
   */
  async cancelRecording(): Promise<void> {
    if (this.mediaRecorder) {
      this.mediaRecorder.stop();
    }
    this.stopDurationTracking();
    this.audioChunks = [];

    // Delete the recording record if it was created
    if (this.currentSession) {
      const supabase = createClient();
      await supabase
        .from('recordings')
        .delete()
        .eq('id', this.currentSession.id);
    }

    this.currentSession = null;
    this.handlers.onStateChange?.('idle');
  }

  /**
   * 녹음 파일 저장
   */
  private async saveRecording(audioBlob: Blob): Promise<Recording | null> {
    if (!this.currentSession) return null;

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return null;

    try {
      // Upload to Supabase Storage
      const fileName = `${user.id}/${this.currentSession.id}.webm`;

      const { error: uploadError } = await supabase.storage
        .from('recordings')
        .upload(fileName, audioBlob, {
          contentType: this.getSupportedMimeType(),
          upsert: true,
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw uploadError;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('recordings')
        .getPublicUrl(fileName);

      // Update recording record
      const endTime = new Date();
      const durationSeconds = Math.floor(
        (endTime.getTime() - this.currentSession.startTime.getTime()) / 1000
      );

      const { data: recording, error: updateError } = await supabase
        .from('recordings')
        .update({
          audio_url: urlData.publicUrl,
          duration_seconds: durationSeconds,
          file_size_bytes: audioBlob.size,
          status: 'processing',
          ended_at: endTime.toISOString(),
        })
        .eq('id', this.currentSession.id)
        .select()
        .single();

      if (updateError) {
        console.error('Update error:', updateError);
        throw updateError;
      }

      // Trigger analysis (async)
      this.triggerAnalysis(this.currentSession.id);

      return recording;
    } catch (error) {
      console.error('Failed to save recording:', error);
      this.handlers.onError?.(new Error('녹음 저장에 실패했습니다.'));
      return null;
    }
  }

  /**
   * AI 분석 트리거
   */
  private async triggerAnalysis(recordingId: string): Promise<void> {
    try {
      const response = await fetch('/api/analyze-recording', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recordingId }),
      });

      if (response.ok) {
        this.handlers.onAnalysisReady?.(recordingId);
      }
    } catch (error) {
      console.error('Failed to trigger analysis:', error);
    }
  }

  /**
   * 녹음 시간 추적 시작
   */
  private startDurationTracking(): void {
    this.durationInterval = setInterval(() => {
      if (this.startTime && this.currentSession) {
        const now = new Date();
        this.currentSession.duration = Math.floor(
          (now.getTime() - this.startTime.getTime()) / 1000
        );
        this.handlers.onDurationUpdate?.(this.currentSession.duration);
      }
    }, 1000);
  }

  /**
   * 녹음 시간 추적 중지
   */
  private stopDurationTracking(): void {
    if (this.durationInterval) {
      clearInterval(this.durationInterval);
      this.durationInterval = null;
    }
  }

  /**
   * 지원되는 MIME 타입 확인
   */
  private getSupportedMimeType(): string {
    const types = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/ogg;codecs=opus',
      'audio/mp4',
    ];

    for (const type of types) {
      if (MediaRecorder.isTypeSupported(type)) {
        return type;
      }
    }

    return 'audio/webm'; // fallback
  }

  /**
   * 현재 세션 정보 가져오기
   */
  getCurrentSession(): RecordingSession | null {
    return this.currentSession;
  }

  /**
   * 녹음 상태 확인
   */
  isRecording(): boolean {
    return this.mediaRecorder?.state === 'recording';
  }

  /**
   * 리소스 정리
   */
  cleanup(): void {
    this.stopDurationTracking();

    if (this.mediaRecorder) {
      if (this.mediaRecorder.state !== 'inactive') {
        this.mediaRecorder.stop();
      }
      this.mediaRecorder = null;
    }

    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
    }

    this.audioChunks = [];
    this.currentSession = null;
  }

  /**
   * 시간 포맷 헬퍼
   */
  static formatDuration(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
}

// Singleton export
export const lessonRecordingService = new LessonRecordingService();
export default LessonRecordingService;
