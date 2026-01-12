'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Play, Pause, Trash2, CheckCircle, Loader2, AlertCircle, Share2, ExternalLink, Camera, Image as ImageIcon, Plus, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { processSessionAudio } from '@/lib/actions/analysis';
import Link from 'next/link';

import type { Student } from '@/lib/types/database';

interface VoiceRecorderProps {
    studentId?: string;
    subjectId?: string;
    students?: Student[];
    onRecordingComplete?: (blob: Blob) => void;
    className?: string;
}

export default function VoiceRecorder({
    studentId: initialStudentId,
    subjectId: initialSubjectId,
    students = [],
    onRecordingComplete,
    className
}: VoiceRecorderProps) {
    const [selectedStudentId, setSelectedStudentId] = useState(initialStudentId || (students.length > 0 ? students[0].id : ''));
    const [selectedSubjectId, setSelectedSubjectId] = useState(initialSubjectId || (students.length > 0 ? students[0].subject_id : ''));

    const [isRecording, setIsRecording] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [isCopied, setIsCopied] = useState(false);
    const [duration, setDuration] = useState(0);
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const [images, setImages] = useState<File[]>([]);
    const [imageUrls, setImageUrls] = useState<string[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);

    // Cleanup URLs
    useEffect(() => {
        return () => {
            if (audioUrl) URL.revokeObjectURL(audioUrl);
            imageUrls.forEach(url => URL.revokeObjectURL(url));
        };
    }, [audioUrl, imageUrls]);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        const newImages = [...images, ...files].slice(0, 3); // Max 3 images
        const newUrls = newImages.map(file => URL.createObjectURL(file));

        setImages(newImages);
        setImageUrls(newUrls);
    };

    const removeImage = (index: number) => {
        const newImages = [...images];
        newImages.splice(index, 1);
        setImages(newImages);

        const newUrls = [...imageUrls];
        URL.revokeObjectURL(newUrls[index]);
        newUrls.splice(index, 1);
        setImageUrls(newUrls);
    };

    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = () => {
                const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                const url = URL.createObjectURL(blob);
                setAudioBlob(blob);
                setAudioUrl(url);
                stream.getTracks().forEach(track => track.stop());

                // Note: Removed auto-submit for "Trust-First" UX. 
                // User must now choose to Commit or Trash.
            };

            mediaRecorder.start();
            setIsRecording(true);
            setIsPaused(false);
            setDuration(0);
            setAudioBlob(null);
            setSuccess(false);
            setError(null);

            timerRef.current = setInterval(() => {
                setDuration(prev => prev + 1);
            }, 1000);
        } catch (err) {
            console.error("Failed to start recording:", err);
            alert("Microphone access is required for AI Scribing.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            if (timerRef.current) clearInterval(timerRef.current);
        }
    };

    const togglePause = () => {
        if (mediaRecorderRef.current) {
            if (isPaused) {
                mediaRecorderRef.current.resume();
                timerRef.current = setInterval(() => {
                    setDuration(prev => prev + 1);
                }, 1000);
            } else {
                mediaRecorderRef.current.pause();
                if (timerRef.current) clearInterval(timerRef.current);
            }
            setIsPaused(!isPaused);
        }
    };

    const discardRecording = () => {
        // Visual feedback for purging
        const confirmTrash = window.confirm("Are you sure? This session data will be permanently purged from this device and never reach the server.");
        if (!confirmTrash) return;

        setAudioBlob(null);
        setAudioUrl(null);
        setDuration(0);
        setError(null);
        setSuccess(false);
        setSessionId(null);
        setIsCopied(false);
        setImages([]);
        setImageUrls([]);
    };

    const copyReportLink = () => {
        if (!sessionId) return;
        const url = `${window.location.origin}/report/${sessionId}`;
        navigator.clipboard.writeText(url);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    const submitRecording = async (passedBlob?: Blob) => {
        const targetBlob = passedBlob || audioBlob;
        if (!targetBlob || isAnalyzing) return;

        setIsAnalyzing(true);
        setError(null);

        try {
            const formData = new FormData();
            formData.append('audio', targetBlob, 'session.webm');
            formData.append('studentId', selectedStudentId);
            formData.append('subjectId', selectedSubjectId);

            images.forEach((img, i) => {
                formData.append(`image_${i}`, img);
            });
            formData.append('imageCount', images.length.toString());

            const result = await processSessionAudio(formData);

            if (result.success) {
                setSuccess(true);
                setSessionId(result.sessionId);
                if (onRecordingComplete) onRecordingComplete(targetBlob);

                // Auto-cleanup audio URL after successful commit to save memory & enhance trust
                if (audioUrl) {
                    URL.revokeObjectURL(audioUrl);
                    setAudioUrl(null);
                }
            } else {
                setError(result.error || "Failed to analyze session");
            }
        } catch (err: any) {
            console.error("Analysis Error:", err);
            setError(err.message || "An unexpected error occurred");
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <div className={cn("bg-white/[0.02] border border-white/[0.05] rounded-3xl p-6 md:p-8 transition-all hover:bg-white/[0.03]", className)}>
            {!isRecording && !audioBlob ? (
                <div className="flex flex-col items-center justify-center space-y-8 py-6">
                    {/* Student Selector */}
                    {students.length > 0 && (
                        <div className="w-full max-w-sm">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#10b981] mb-3 block ml-1">
                                Assign Scribe to Student
                            </label>
                            <div className="relative group">
                                <select
                                    value={selectedStudentId}
                                    onChange={(e) => {
                                        const s = students.find(std => std.id === e.target.value);
                                        if (s) {
                                            setSelectedStudentId(s.id);
                                            setSelectedSubjectId(s.subject_id);
                                        }
                                    }}
                                    className="w-full bg-black/40 border border-white/5 rounded-2xl px-5 py-3.5 text-sm text-white focus:outline-none focus:border-[#10b981]/50 transition-all cursor-pointer appearance-none group-hover:bg-black/60"
                                >
                                    {students.map(s => (
                                        <option key={s.id} value={s.id} className="bg-[#09090b]">
                                            {s.name} — {s.subject_id}
                                        </option>
                                    ))}
                                </select>
                                <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-[#71717a]">
                                    <Plus size={16} className="rotate-45" />
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="w-full max-w-sm space-y-6 text-center">
                        <div className="flex flex-col items-center gap-6">
                            <button
                                onClick={startRecording}
                                className="w-24 h-24 bg-[#10b981] text-black rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-[0_20px_50px_rgba(16,185,129,0.3)] ring-4 ring-[#10b981]/10"
                            >
                                <Mic size={36} strokeWidth={2.5} />
                            </button>
                            <div>
                                <h3 className="text-xl font-black tracking-tight text-white mb-2">Summon AI Scribe</h3>
                                <p className="text-xs text-[#71717a] leading-relaxed">
                                    Start teaching normally. Our AI will capture everything <br />
                                    and prepare a draft report for your review.
                                </p>
                            </div>
                        </div>

                        {/* Visual Evidence (P1.3) */}
                        <div className="pt-4 border-t border-white/[0.05]">
                            <div className="flex items-center justify-between mb-4 px-2">
                                <span className="text-[10px] font-black uppercase tracking-widest text-[#52525b]">Visual Artifacts</span>
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="text-[10px] font-black uppercase tracking-widest text-[#10b981] hover:text-emerald-400 transition-colors"
                                >
                                    + Add Evidence
                                </button>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept="image/*"
                                    multiple
                                    onChange={handleImageUpload}
                                />
                            </div>

                            {imageUrls.length > 0 ? (
                                <div className="flex justify-center gap-3">
                                    {imageUrls.map((url, i) => (
                                        <div key={i} className="relative group w-16 h-16">
                                            <img src={url} className="w-full h-full object-cover rounded-xl border border-white/10 shadow-lg" />
                                            <button
                                                onClick={() => removeImage(i)}
                                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <X size={10} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-[10px] text-[#3f3f46] italic uppercase tracking-widest">No images attached</p>
                            )}
                        </div>
                    </div>
                </div>
            ) : isRecording ? (
                <div className="space-y-8 py-6">
                    <div className="flex items-center justify-between px-4">
                        <div className="flex items-center gap-3">
                            <div className="relative flex items-center justify-center">
                                <span className="absolute w-4 h-4 bg-[#10b981]/20 rounded-full animate-ping" />
                                <span className="relative w-2 h-2 bg-[#10b981] rounded-full" />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-[#10b981]">AI Scribe Listening...</span>
                        </div>
                        <span className="text-3xl font-black text-white font-mono tracking-tighter">{formatDuration(duration)}</span>
                    </div>

                    {/* Minimal Waveform */}
                    <div className="h-24 flex items-center justify-center gap-1.5 px-4">
                        {[...Array(30)].map((_, i) => (
                            <div
                                key={i}
                                className={cn(
                                    "w-1 bg-[#10b981] rounded-full transition-all duration-300",
                                    isPaused ? "h-1 opacity-20" : "animate-pulse"
                                )}
                                style={{
                                    height: isPaused ? '4px' : `${Math.random() * 60 + 10}px`,
                                    animationDelay: `${i * 0.03}s`,
                                    opacity: isPaused ? 0.2 : (0.4 + (i % 10) / 20)
                                }}
                            />
                        ))}
                    </div>

                    <div className="flex items-center justify-center gap-6">
                        <button
                            onClick={togglePause}
                            className="w-14 h-14 bg-white/5 hover:bg-white/10 rounded-full text-white transition-all flex items-center justify-center border border-white/5"
                        >
                            {isPaused ? <Play size={24} fill="currentColor" /> : <Pause size={24} fill="currentColor" />}
                        </button>
                        <button
                            onClick={stopRecording}
                            className="w-18 h-18 px-8 py-4 bg-red-500 hover:bg-red-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-red-500/20 active:scale-95"
                        >
                            Complete
                        </button>
                    </div>
                </div>
            ) : (
                <div className="space-y-8 py-6">
                    <div className="flex items-center justify-between px-2">
                        <div className="flex items-center gap-2">
                            {success ? (
                                <div className="flex items-center gap-2 px-3 py-1 bg-[#10b981]/10 border border-[#10b981]/20 rounded-full">
                                    <CheckCircle size={12} className="text-[#10b981]" />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-[#10b981]">Growth Recorded</span>
                                </div>
                            ) : error ? (
                                <div className="flex items-center gap-2 px-3 py-1 bg-red-500/10 border border-red-500/20 rounded-full">
                                    <AlertCircle size={12} className="text-red-400" />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-red-400">Processing Failed</span>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full">
                                    <Loader2 size={12} className="text-white/40 animate-spin" />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Scribe Draft Ready</span>
                                </div>
                            )}
                        </div>
                        <span className="text-sm font-bold text-[#71717a] font-mono">{formatDuration(duration)}</span>
                    </div>

                    {success ? (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                            <div className="bg-[#10b981]/5 rounded-3xl p-6 border border-[#10b981]/10 text-center">
                                <h4 className="text-lg font-bold text-white mb-2">Evidence Successfully Locked</h4>
                                <p className="text-xs text-[#a1a1aa] leading-relaxed">
                                    Analysis complete. Student mastery has been updated. <br />
                                    A shareable growth report is now available for parents.
                                </p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    onClick={copyReportLink}
                                    className={cn(
                                        "py-4 px-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 border",
                                        isCopied
                                            ? "bg-[#10b981] border-[#10b981] text-black"
                                            : "bg-white/5 border-white/10 text-[#71717a] hover:text-white hover:bg-white/10"
                                    )}
                                >
                                    {isCopied ? <CheckCircle size={16} /> : <Share2 size={16} />}
                                    {isCopied ? "Copied" : "Copy Link"}
                                </button>
                                <Link
                                    href={`/report/${sessionId}`}
                                    target="_blank"
                                    className="py-4 px-4 bg-white text-black rounded-2xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 hover:opacity-90 active:scale-95"
                                >
                                    <ExternalLink size={16} />
                                    Review
                                </Link>
                            </div>
                            <button
                                onClick={discardRecording}
                                className="w-full py-4 text-[10px] font-black uppercase tracking-[0.2em] text-[#3f3f46] hover:text-white transition-colors"
                            >
                                Start New Session
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-8">
                            <div className="bg-white/[0.03] rounded-3xl p-8 border border-white/[0.05] text-center">
                                <h4 className="text-xl font-black text-white mb-3 tracking-tight">The Decision Port</h4>
                                <p className="text-xs text-[#71717a] leading-relaxed mb-6">
                                    Your session is scribed locally. Choosing **Commit** will update student growth data. Choosing **Trash** will permanently erase this session forever.
                                </p>

                                <div className="flex flex-col gap-3">
                                    <button
                                        onClick={() => submitRecording()}
                                        disabled={isAnalyzing}
                                        className="w-full py-5 bg-[#10b981] hover:bg-emerald-400 text-black rounded-2xl font-black text-sm uppercase tracking-widest transition-all disabled:opacity-50 shadow-[0_10px_30px_rgba(16,185,129,0.2)] flex items-center justify-center gap-3"
                                    >
                                        {isAnalyzing ? (
                                            <>
                                                <Loader2 size={18} className="animate-spin" />
                                                Analyzing Draft...
                                            </>
                                        ) : (
                                            <>
                                                <CheckCircle size={18} strokeWidth={3} />
                                                Commit to Mastery
                                            </>
                                        )}
                                    </button>
                                    <button
                                        onClick={discardRecording}
                                        disabled={isAnalyzing}
                                        className="w-full py-5 bg-white/5 hover:bg-red-500/10 border border-white/5 hover:border-red-500/20 text-[#71717a] hover:text-red-400 rounded-2xl font-black text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-3"
                                    >
                                        <Trash2 size={18} strokeWidth={2.5} />
                                        Purge & Trash
                                    </button>
                                </div>
                            </div>

                            {error && (
                                <div className="bg-red-500/10 rounded-2xl p-4 border border-red-500/20 animate-in fade-in zoom-in-95">
                                    <p className="text-xs text-red-400 leading-relaxed font-medium flex items-center gap-2">
                                        <AlertCircle size={14} />
                                        {error}
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
