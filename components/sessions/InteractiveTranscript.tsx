'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Play, Pause, Clock, Volume2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TranscriptSegment {
    id: number;
    start: number;
    end: number;
    text: string;
}

interface InteractiveTranscriptProps {
    recordingUrl?: string;
    segments?: TranscriptSegment[];
}

export default function InteractiveTranscript({ recordingUrl, segments = [] }: InteractiveTranscriptProps) {
    const audioRef = useRef<HTMLAudioElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);

    const togglePlay = () => {
        if (!audioRef.current) return;
        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play();
        }
        setIsPlaying(!isPlaying);
    };

    const handleTimeUpdate = () => {
        if (audioRef.current) {
            setCurrentTime(audioRef.current.currentTime);
        }
    };

    const handleLoadedMetadata = () => {
        if (audioRef.current) {
            setDuration(audioRef.current.duration);
        }
    };

    const seekTo = (time: number) => {
        if (audioRef.current) {
            audioRef.current.currentTime = time;
            audioRef.current.play();
            setIsPlaying(true);
        }
    };

    const formatTime = (time: number) => {
        const mins = Math.floor(time / 60);
        const secs = Math.floor(time % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const activeSegmentIndex = segments.findIndex(
        s => currentTime >= s.start && currentTime <= s.end
    );

    if (!recordingUrl || segments.length === 0) {
        return (
            <div className="bg-[#18181b] border border-[#27272a] rounded-3xl p-8 text-center text-white/40 italic text-sm">
                No interactive transcript available for this session.
            </div>
        );
    }

    return (
        <div className="bg-[#18181b] border border-[#27272a] rounded-3xl overflow-hidden">
            {/* Audio Player Control Bar */}
            <div className="bg-black/40 px-6 py-4 border-b border-[#27272a] flex items-center gap-6">
                <button
                    onClick={togglePlay}
                    className="w-10 h-10 rounded-full bg-[#10b981] flex items-center justify-center text-black hover:scale-105 transition-transform shrink-0"
                >
                    {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} className="ml-1" fill="currentColor" />}
                </button>

                <div className="flex-1 space-y-2">
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-white/40">
                        <span>{formatTime(currentTime)}</span>
                        <span>{formatTime(duration)}</span>
                    </div>
                    <div className="relative h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div
                            className="absolute inset-y-0 left-0 bg-[#10b981] transition-all duration-100"
                            style={{ width: `${(currentTime / duration) * 100}%` }}
                        />
                    </div>
                </div>

                <div className="flex items-center gap-2 text-white/40">
                    <Volume2 size={16} />
                </div>
            </div>

            {/* Transcript Area */}
            <div className="p-8 max-h-[400px] overflow-y-auto custom-scrollbar space-y-4">
                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[#10b981] mb-2">
                    <Clock size={14} />
                    Live Transcript
                </div>

                <div className="flex flex-wrap gap-x-2 gap-y-3">
                    {segments.map((segment, idx) => (
                        <span
                            key={segment.id || idx}
                            onClick={() => seekTo(segment.start)}
                            className={cn(
                                "cursor-pointer rounded-lg px-2 py-1 transition-all leading-relaxed",
                                idx === activeSegmentIndex
                                    ? "bg-[#10b981]/20 text-[#10b981] font-bold shadow-[0_0_15px_rgba(16,185,129,0.1)] scale-[1.02]"
                                    : "text-white/60 hover:text-white/90 hover:bg-white/5"
                            )}
                        >
                            {segment.text}
                        </span>
                    ))}
                </div>
            </div>

            <audio
                ref={audioRef}
                src={recordingUrl}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onEnded={() => setIsPlaying(false)}
            />
        </div>
    );
}
