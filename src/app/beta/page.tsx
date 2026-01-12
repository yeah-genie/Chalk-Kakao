"use client";

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

type AnalysisStatus = "idle" | "uploading" | "transcribing" | "analyzing" | "complete" | "error";

interface AnalysisResult {
  talkRatio: { tutor: number; student: number };
  keyMoments: Array<{
    timestamp: string;
    type: "breakthrough" | "attention_drop" | "effective";
    quote: string;
    insight: string;
  }>;
  comparison: {
    effective: { quote: string; engagement: number };
    lessEffective: { quote: string; engagement: number };
  };
  suggestion: string;
  summary: string;
}

export default function BetaPage() {
  const [email, setEmail] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [status, setStatus] = useState<AnalysisStatus>("idle");
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const inputRef = useRef<HTMLInputElement>(null);

  // File validation
  const validateFile = (file: File): string | null => {
    const maxSize = 500 * 1024 * 1024; // 500MB
    const allowedTypes = ["audio/mpeg", "audio/mp3", "audio/wav", "audio/webm", "video/mp4", "video/webm"];
    
    if (!allowedTypes.includes(file.type)) {
      return "Please upload an MP3, MP4, WAV, or WebM file";
    }
    if (file.size > maxSize) {
      return "File size must be under 500MB";
    }
    return null;
  };

  // Handle file selection
  const handleFile = (selectedFile: File) => {
    const error = validateFile(selectedFile);
    if (error) {
      setError(error);
      return;
    }
    setFile(selectedFile);
    setError(null);
  };

  // Drag handlers
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, []);

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Format duration
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Submit for analysis
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !file) return;
    if (!email.includes("@")) {
      setError("Please enter a valid email");
      return;
    }

    setStatus("uploading");
    setProgress(0);
    setError(null);

    try {
      // Create FormData
      const formData = new FormData();
      formData.append("file", file);
      formData.append("email", email);

      // Upload and analyze
      const response = await fetch("/api/beta/analyze", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Analysis failed");
      }

      // Stream progress updates
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const text = decoder.decode(value);
          const lines = text.split("\n").filter(Boolean);

          for (const line of lines) {
            try {
              const data = JSON.parse(line);
              if (data.status) setStatus(data.status);
              if (data.progress) setProgress(data.progress);
              if (data.result) setResult(data.result);
            } catch {
              // Skip non-JSON lines
            }
          }
        }
      }

      setStatus("complete");
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");
      setStatus("error");
    }
  };

  // Progress steps
  const steps = [
    { key: "uploading", label: "Uploading file" },
    { key: "transcribing", label: "Transcribing audio" },
    { key: "analyzing", label: "Analyzing teaching patterns" },
  ];

  const currentStepIndex = steps.findIndex(s => s.key === status);

  return (
    <div className="min-h-screen bg-[#09090b] text-white">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-gradient-to-b from-cyan-500/[0.07] to-transparent rounded-full blur-[100px]" />
      </div>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#09090b]/80 backdrop-blur-lg border-b border-white/[0.04]">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="font-semibold text-white">Chalk</Link>
          <span className="text-xs text-amber-400 bg-amber-500/10 px-2 py-1 rounded">Beta</span>
        </div>
      </header>

      <main className="pt-28 pb-20 px-6">
        <div className="max-w-xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold mb-3">Analyze your session</h1>
            <p className="text-zinc-500">
              Upload a tutoring recording and get insights in minutes
            </p>
          </div>

          <AnimatePresence mode="wait">
            {status === "idle" || status === "error" ? (
              /* Upload Form */
              <motion.form
                key="form"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                onSubmit={handleSubmit}
                className="space-y-6"
              >
                {/* Email Input */}
                <div>
                  <label className="block text-sm text-zinc-400 mb-2">
                    Email for report
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-700 transition-colors"
                  />
                </div>

                {/* File Upload */}
                <div>
                  <label className="block text-sm text-zinc-400 mb-2">
                    Session recording
                  </label>
                  <div
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => inputRef.current?.click()}
                    className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                      dragActive
                        ? "border-cyan-500 bg-cyan-500/5"
                        : file
                        ? "border-emerald-500/50 bg-emerald-500/5"
                        : "border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/50"
                    }`}
                  >
                    <input
                      ref={inputRef}
                      type="file"
                      accept=".mp3,.mp4,.wav,.webm,audio/*,video/*"
                      onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                      className="hidden"
                    />

                    {file ? (
                      <div className="space-y-2">
                        <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center mx-auto">
                          <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <p className="text-white font-medium">{file.name}</p>
                        <p className="text-sm text-zinc-500">{formatFileSize(file.size)}</p>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setFile(null);
                          }}
                          className="text-xs text-zinc-500 hover:text-zinc-300"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="w-12 h-12 rounded-xl bg-zinc-800 flex items-center justify-center mx-auto">
                          <svg className="w-6 h-6 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-white">Drop your file here or click to browse</p>
                          <p className="text-sm text-zinc-600 mt-1">MP3, MP4, WAV, WebM · Up to 120 minutes</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Error Message */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm"
                  >
                    {error}
                  </motion.div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={!email || !file}
                  className="w-full bg-white text-black font-medium py-3 rounded-xl hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Analyze session
                </button>

                {/* Privacy note */}
                <p className="text-xs text-zinc-600 text-center">
                  Your recording will be processed and deleted within 24 hours.
                  We only keep text insights.
                </p>
              </motion.form>
            ) : status === "complete" && result ? (
              /* Results */
              <motion.div
                key="results"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {/* Success header */}
                <div className="text-center p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-3">
                    <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="text-emerald-400 font-medium">Analysis complete!</p>
                  <p className="text-sm text-zinc-500 mt-1">Report also sent to {email}</p>
                </div>

                {/* Summary */}
                <div className="p-5 bg-zinc-900/50 border border-zinc-800 rounded-xl">
                  <h3 className="text-sm text-zinc-400 mb-2">Summary</h3>
                  <p className="text-white">{result.summary}</p>
                </div>

                {/* Talk Ratio */}
                <div className="p-5 bg-zinc-900/50 border border-zinc-800 rounded-xl">
                  <h3 className="text-sm text-zinc-400 mb-3">Talk ratio</h3>
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <div className="h-3 bg-zinc-800 rounded-full overflow-hidden flex">
                        <div 
                          className="bg-cyan-500 rounded-full" 
                          style={{ width: `${result.talkRatio.tutor}%` }}
                        />
                        <div 
                          className="bg-emerald-500/60 rounded-full" 
                          style={{ width: `${result.talkRatio.student}%` }}
                        />
                      </div>
                    </div>
                    <div className="text-sm text-zinc-400">
                      {result.talkRatio.tutor}% / {result.talkRatio.student}%
                    </div>
                  </div>
                </div>

                {/* Key Moments */}
                <div className="p-5 bg-zinc-900/50 border border-zinc-800 rounded-xl">
                  <h3 className="text-sm text-zinc-400 mb-3">Key moments</h3>
                  <div className="space-y-3">
                    {result.keyMoments.map((moment, i) => (
                      <div 
                        key={i}
                        className={`p-3 rounded-lg border ${
                          moment.type === "breakthrough" || moment.type === "effective"
                            ? "bg-emerald-500/5 border-emerald-500/20"
                            : "bg-amber-500/5 border-amber-500/20"
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-xs px-2 py-0.5 rounded ${
                            moment.type === "breakthrough" || moment.type === "effective"
                              ? "bg-emerald-500/20 text-emerald-400"
                              : "bg-amber-500/20 text-amber-400"
                          }`}>
                            {moment.timestamp}
                          </span>
                          <span className={`text-sm ${
                            moment.type === "breakthrough" || moment.type === "effective"
                              ? "text-emerald-300"
                              : "text-amber-300"
                          }`}>
                            {moment.type === "breakthrough" ? "Breakthrough" : 
                             moment.type === "effective" ? "Effective" : "Attention drop"}
                          </span>
                        </div>
                        <p className="text-sm text-white">"{moment.quote}"</p>
                        <p className="text-xs text-zinc-500 mt-1">{moment.insight}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Before/After Comparison */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl">
                    <p className="text-xs text-emerald-400 mb-2">What worked</p>
                    <p className="text-sm text-white mb-2">"{result.comparison.effective.quote}"</p>
                    <p className="text-xl font-bold text-emerald-400">
                      {result.comparison.effective.engagement}%
                    </p>
                  </div>
                  <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl">
                    <p className="text-xs text-zinc-500 mb-2">Less effective</p>
                    <p className="text-sm text-zinc-400 mb-2">"{result.comparison.lessEffective.quote}"</p>
                    <p className="text-xl font-bold text-zinc-500">
                      {result.comparison.lessEffective.engagement}%
                    </p>
                  </div>
                </div>

                {/* Suggestion */}
                <div className="p-4 bg-cyan-500/5 border border-cyan-500/20 rounded-xl">
                  <p className="text-xs text-cyan-400 mb-1">Try next time</p>
                  <p className="text-sm text-zinc-300">{result.suggestion}</p>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setStatus("idle");
                      setFile(null);
                      setResult(null);
                    }}
                    className="flex-1 bg-zinc-900 border border-zinc-800 text-white font-medium py-3 rounded-xl hover:bg-zinc-800 transition-colors"
                  >
                    Analyze another
                  </button>
                  <Link
                    href="/"
                    className="flex-1 bg-white text-black font-medium py-3 rounded-xl hover:bg-zinc-200 transition-colors text-center"
                  >
                    Back to home
                  </Link>
                </div>
              </motion.div>
            ) : (
              /* Progress */
              <motion.div
                key="progress"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-12"
              >
                {/* Spinner */}
                <div className="w-16 h-16 rounded-full border-2 border-zinc-800 border-t-cyan-500 animate-spin mx-auto mb-6" />

                {/* Status text */}
                <p className="text-white font-medium mb-2">
                  {status === "uploading" && "Uploading your file..."}
                  {status === "transcribing" && "Transcribing audio..."}
                  {status === "analyzing" && "Analyzing teaching patterns..."}
                </p>

                {/* Progress steps */}
                <div className="flex items-center justify-center gap-2 mt-6">
                  {steps.map((step, i) => (
                    <div key={step.key} className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${
                        i < currentStepIndex 
                          ? "bg-emerald-500" 
                          : i === currentStepIndex 
                          ? "bg-cyan-500 animate-pulse" 
                          : "bg-zinc-700"
                      }`} />
                      {i < steps.length - 1 && (
                        <div className={`w-8 h-0.5 ${
                          i < currentStepIndex ? "bg-emerald-500" : "bg-zinc-800"
                        }`} />
                      )}
                    </div>
                  ))}
                </div>
                <div className="flex justify-between text-xs text-zinc-600 mt-2 max-w-xs mx-auto">
                  {steps.map(step => (
                    <span key={step.key}>{step.label.split(" ")[0]}</span>
                  ))}
                </div>

                {/* File info */}
                {file && (
                  <p className="text-sm text-zinc-600 mt-6">
                    {file.name} · {formatFileSize(file.size)}
                  </p>
                )}

                <p className="text-xs text-zinc-700 mt-4">
                  This may take a few minutes for longer recordings
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

