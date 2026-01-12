'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  lessonRecordingService,
  type RecordingState,
  type RecordingSession,
} from './LessonRecordingService';
import type { Recording } from '@/lib/supabase/types';

interface UseRecordingReturn {
  // State
  state: RecordingState;
  duration: number;
  formattedDuration: string;
  session: RecordingSession | null;
  error: string | null;
  isRecording: boolean;
  isPaused: boolean;

  // Actions
  startRecording: (studentId?: string | null) => Promise<string | null>;
  stopRecording: () => Promise<Recording | null>;
  pauseRecording: () => void;
  resumeRecording: () => void;
  cancelRecording: () => Promise<void>;
}

export function useRecording(): UseRecordingReturn {
  const [state, setState] = useState<RecordingState>('idle');
  const [duration, setDuration] = useState(0);
  const [session, setSession] = useState<RecordingSession | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Set up event handlers
    lessonRecordingService.setEventHandlers({
      onStateChange: (newState) => {
        setState(newState);
        if (newState === 'idle' || newState === 'stopped') {
          setDuration(0);
          setSession(null);
        }
      },
      onDurationUpdate: setDuration,
      onError: (err) => setError(err.message),
    });

    // Cleanup on unmount
    return () => {
      lessonRecordingService.cleanup();
    };
  }, []);

  const startRecording = useCallback(
    async (studentId: string | null = null) => {
      setError(null);
      const sessionId = await lessonRecordingService.startRecording(studentId);
      if (sessionId) {
        setSession(lessonRecordingService.getCurrentSession());
      }
      return sessionId;
    },
    []
  );

  const stopRecording = useCallback(async () => {
    const recording = await lessonRecordingService.stopRecording();
    return recording;
  }, []);

  const pauseRecording = useCallback(() => {
    lessonRecordingService.pauseRecording();
  }, []);

  const resumeRecording = useCallback(() => {
    lessonRecordingService.resumeRecording();
  }, []);

  const cancelRecording = useCallback(async () => {
    await lessonRecordingService.cancelRecording();
    setDuration(0);
    setSession(null);
    setError(null);
  }, []);

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return {
    state,
    duration,
    formattedDuration: formatDuration(duration),
    session,
    error,
    isRecording: state === 'recording',
    isPaused: state === 'paused',
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    cancelRecording,
  };
}
