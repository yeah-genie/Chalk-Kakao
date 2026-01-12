'use client';

import { useState } from 'react';

interface FeedbackModalProps {
    isOpen: boolean;
    onClose: () => void;
    problemId?: string;
    examType?: string;
}

const FEEDBACK_OPTIONS = [
    { id: 'ui_confusing', label: 'UI is confusing', emoji: '😕' },
    { id: 'ai_wrong', label: 'AI grading was wrong', emoji: '🤖' },
    { id: 'problem_error', label: 'Problem has an error', emoji: '📝' },
    { id: 'canvas_issue', label: 'Canvas/drawing issues', emoji: '🖊️' },
    { id: 'love_it', label: 'I love this tool!', emoji: '❤️' },
    { id: 'feature_request', label: 'Feature request', emoji: '💡' },
];

export default function FeedbackModal({ isOpen, onClose, problemId, examType }: FeedbackModalProps) {
    const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
    const [comment, setComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const toggleOption = (id: string) => {
        setSelectedOptions(prev =>
            prev.includes(id) ? prev.filter(o => o !== id) : [...prev, id]
        );
    };

    const handleSubmit = async () => {
        if (selectedOptions.length === 0 && !comment.trim()) return;

        setIsSubmitting(true);
        try {
            await fetch('/api/feedback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    options: selectedOptions,
                    comment: comment.trim(),
                    problemId,
                    examType,
                    timestamp: new Date().toISOString(),
                    userAgent: navigator.userAgent,
                }),
            });
            setSubmitted(true);
            setTimeout(() => {
                onClose();
                setSubmitted(false);
                setSelectedOptions([]);
                setComment('');
            }, 1500);
        } catch (error) {
            console.error('Feedback error:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="w-full max-w-md mx-4 bg-[#0c0c0c] border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-white/5">
                    <div className="flex items-center gap-2">
                        <span className="text-lg">💬</span>
                        <h2 className="text-lg font-semibold">Send Feedback</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-lg hover:bg-white/5 flex items-center justify-center text-white/40 hover:text-white transition-all"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div className="p-4 space-y-4">
                    {submitted ? (
                        <div className="text-center py-8">
                            <span className="text-4xl mb-4 block">🎉</span>
                            <p className="text-lg font-medium text-green-400">Thanks for your feedback!</p>
                            <p className="text-sm text-white/50 mt-1">It helps us improve Chalk.</p>
                        </div>
                    ) : (
                        <>
                            {/* Checkbox Options */}
                            <div className="space-y-2">
                                <p className="text-xs text-white/40 uppercase tracking-wider">What's on your mind?</p>
                                <div className="grid grid-cols-2 gap-2">
                                    {FEEDBACK_OPTIONS.map(option => (
                                        <button
                                            key={option.id}
                                            onClick={() => toggleOption(option.id)}
                                            className={`p-3 rounded-xl border text-left transition-all ${selectedOptions.includes(option.id)
                                                    ? 'bg-accent/10 border-accent/50 text-white'
                                                    : 'bg-white/[0.02] border-white/5 text-white/60 hover:bg-white/[0.04]'
                                                }`}
                                        >
                                            <span className="text-lg mr-2">{option.emoji}</span>
                                            <span className="text-xs">{option.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Comment Box */}
                            <div className="space-y-2">
                                <p className="text-xs text-white/40 uppercase tracking-wider">Additional comments</p>
                                <textarea
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    placeholder="Tell us more... (optional)"
                                    className="w-full h-24 p-3 rounded-xl bg-white/[0.02] border border-white/5 text-sm text-white placeholder:text-white/30 resize-none focus:outline-none focus:border-accent/50"
                                />
                            </div>

                            {/* Submit Button */}
                            <button
                                onClick={handleSubmit}
                                disabled={isSubmitting || (selectedOptions.length === 0 && !comment.trim())}
                                className="w-full py-3 rounded-xl bg-gradient-to-r from-accent to-purple-500 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:shadow-lg hover:shadow-accent/25"
                            >
                                {isSubmitting ? 'Sending...' : 'Send Feedback'}
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
