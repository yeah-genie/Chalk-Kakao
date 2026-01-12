'use client';

import { useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import { HomeworkAnalysis, ERROR_TYPE_INFO } from '@/lib/types';

// SVG Icons
const Icons = {
    upload: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
        </svg>
    ),
    camera: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
        </svg>
    ),
    check: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
    ),
    x: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
    ),
    arrow: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
    ),
    loading: (
        <svg className="w-6 h-6 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
    ),
};

export default function UploadPage() {
    const [image, setImage] = useState<string | null>(null);
    const [problemText, setProblemText] = useState('');
    const [correctAnswer, setCorrectAnswer] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysis, setAnalysis] = useState<HomeworkAnalysis | null>(null);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setImage(event.target?.result as string);
                setAnalysis(null);
                setError(null);
            };
            reader.readAsDataURL(file);
        }
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        const file = e.dataTransfer.files?.[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setImage(event.target?.result as string);
                setAnalysis(null);
                setError(null);
            };
            reader.readAsDataURL(file);
        }
    }, []);

    const handleAnalyze = async () => {
        if (!image) return;

        setIsAnalyzing(true);
        setError(null);

        try {
            const response = await fetch('/api/homework', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    image,
                    problemText: problemText || undefined,
                    correctAnswer: correctAnswer || undefined,
                }),
            });

            const data = await response.json();

            if (data.success) {
                setAnalysis(data.analysis);
            } else {
                setError(data.error || 'Analysis failed');
            }
        } catch (err) {
            setError('Failed to analyze. Please try again.');
            console.error(err);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleReset = () => {
        setImage(null);
        setAnalysis(null);
        setError(null);
        setProblemText('');
        setCorrectAnswer('');
    };

    return (
        <main className="min-h-screen bg-[#0a0a0a] text-white">
            {/* Header */}
            <header className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-white/[0.04]">
                <div className="max-w-3xl mx-auto px-6 h-14 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 text-white/60 hover:text-white transition-colors">
                        {Icons.arrow}
                        <span className="text-sm">Back</span>
                    </Link>
                    <span className="text-white/40 text-sm">Homework Analyzer</span>
                </div>
            </header>

            <div className="max-w-3xl mx-auto px-6 pt-24 pb-12">
                {/* Upload Section */}
                {!analysis && (
                    <>
                        <h1 className="text-2xl font-medium text-white mb-2">Upload your homework</h1>
                        <p className="text-white/40 mb-8">Take a photo of your math work and we'll analyze it</p>

                        {/* Drop Zone */}
                        <div
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={handleDrop}
                            onClick={() => fileInputRef.current?.click()}
                            className={`relative border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all
                ${image
                                    ? 'border-white/20 bg-white/[0.02]'
                                    : 'border-white/10 hover:border-white/20 hover:bg-white/[0.02]'
                                }`}
                        >
                            {image ? (
                                <div className="relative">
                                    <img
                                        src={image}
                                        alt="Uploaded homework"
                                        className="max-h-80 mx-auto rounded-lg"
                                    />
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleReset();
                                        }}
                                        className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/50 flex items-center justify-center hover:bg-black/70 transition-colors"
                                    >
                                        {Icons.x}
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <div className="text-white/30 mb-4">{Icons.upload}</div>
                                    <p className="text-white/60 mb-2">Drop an image here or click to upload</p>
                                    <p className="text-white/30 text-sm">PNG, JPG up to 10MB</p>
                                </>
                            )}
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="hidden"
                            />
                        </div>

                        {/* Optional fields */}
                        {image && (
                            <div className="mt-6 space-y-4">
                                <div>
                                    <label className="block text-sm text-white/40 mb-2">Problem (optional)</label>
                                    <input
                                        type="text"
                                        value={problemText}
                                        onChange={(e) => setProblemText(e.target.value)}
                                        placeholder="e.g., Solve for x: 3x + 5 = 14"
                                        className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-white/20"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-white/40 mb-2">Correct answer (optional)</label>
                                    <input
                                        type="text"
                                        value={correctAnswer}
                                        onChange={(e) => setCorrectAnswer(e.target.value)}
                                        placeholder="e.g., x = 3"
                                        className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-white/20"
                                    />
                                </div>

                                {error && (
                                    <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                                        {error}
                                    </div>
                                )}

                                <button
                                    onClick={handleAnalyze}
                                    disabled={isAnalyzing}
                                    className="w-full py-4 rounded-xl bg-white text-[#0a0a0a] font-medium hover:bg-white/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {isAnalyzing ? (
                                        <>
                                            {Icons.loading}
                                            Analyzing...
                                        </>
                                    ) : (
                                        'Analyze Homework'
                                    )}
                                </button>
                            </div>
                        )}
                    </>
                )}

                {/* Results Section */}
                {analysis && (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h1 className="text-2xl font-medium text-white">Analysis Complete</h1>
                            <button
                                onClick={handleReset}
                                className="px-4 py-2 rounded-lg border border-white/10 text-white/60 hover:text-white hover:border-white/20 transition-all text-sm"
                            >
                                Analyze Another
                            </button>
                        </div>

                        {/* Recognized Text */}
                        <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5">
                            <h2 className="text-sm text-white/40 mb-3">Recognized Solution</h2>
                            <pre className="text-white/80 font-mono text-sm whitespace-pre-wrap">
                                {analysis.recognizedText}
                            </pre>
                        </div>

                        {/* Steps Breakdown */}
                        <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5">
                            <h2 className="text-sm text-white/40 mb-4">Step-by-Step Analysis</h2>
                            <div className="space-y-3">
                                {analysis.steps.map((step) => (
                                    <div
                                        key={step.stepNumber}
                                        className={`flex items-start gap-3 p-3 rounded-xl ${step.isCorrect
                                                ? 'bg-green-500/5 border border-green-500/10'
                                                : 'bg-red-500/5 border border-red-500/10'
                                            }`}
                                    >
                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${step.isCorrect ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                                            }`}>
                                            {step.isCorrect ? Icons.check : Icons.x}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <span className="text-white/40 text-xs">Step {step.stepNumber}</span>
                                            </div>
                                            <p className={`font-mono ${step.isCorrect ? 'text-white/80' : 'text-red-400'}`}>
                                                {step.content}
                                            </p>
                                            {!step.isCorrect && step.expected && (
                                                <p className="text-green-400 text-sm mt-1">
                                                    Expected: {step.expected}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Error Analysis */}
                        {analysis.misconception && (
                            <div
                                className="p-6 rounded-2xl border"
                                style={{
                                    backgroundColor: ERROR_TYPE_INFO[analysis.misconception.type].bgColor,
                                    borderColor: `${ERROR_TYPE_INFO[analysis.misconception.type].color}30`
                                }}
                            >
                                <div className="flex items-center gap-2 mb-3">
                                    <span
                                        className="px-2 py-1 rounded text-xs font-medium"
                                        style={{
                                            backgroundColor: ERROR_TYPE_INFO[analysis.misconception.type].color,
                                            color: 'white'
                                        }}
                                    >
                                        {ERROR_TYPE_INFO[analysis.misconception.type].label}
                                    </span>
                                    <span className="text-white font-medium">{analysis.misconception.name}</span>
                                </div>
                                <p className="text-white/60 text-sm mb-4">{analysis.misconception.description}</p>
                                <div className="p-3 rounded-lg bg-white/5">
                                    <p className="text-sm text-white/40 mb-1">Recommendation</p>
                                    <p className="text-white/80">{analysis.misconception.recommendation}</p>
                                </div>
                            </div>
                        )}

                        {/* Overall Feedback */}
                        {!analysis.misconception && (
                            <div className="p-6 rounded-2xl bg-green-500/10 border border-green-500/20">
                                <h2 className="text-green-400 font-medium mb-2">Great work!</h2>
                                <p className="text-white/60">{analysis.overallFeedback || 'Your solution is correct.'}</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </main>
    );
}
