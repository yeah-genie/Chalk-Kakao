import React, { ReactNode } from 'react';
import { Users, Calendar, FileText, Plus, AlertTriangle, RefreshCw } from 'lucide-react';
import Link from 'next/link';

interface EmptyStateProps {
    icon?: ReactNode;
    title: string;
    description: string;
    action?: {
        label: string;
        href?: string;
        onClick?: () => void;
    };
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className="w-16 h-16 bg-white/[0.03] border border-white/[0.05] rounded-2xl flex items-center justify-center mb-6">
                {icon || <FileText className="w-8 h-8 text-[#71717a]" />}
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
            <p className="text-[#71717a] max-w-sm mb-6">{description}</p>
            {action && (
                action.href ? (
                    <Link
                        href={action.href}
                        className="flex items-center gap-2 px-5 py-2.5 bg-[#10b981] text-black rounded-xl font-medium hover:bg-[#0d9668] transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        {action.label}
                    </Link>
                ) : (
                    <button
                        onClick={action.onClick}
                        className="flex items-center gap-2 px-5 py-2.5 bg-[#10b981] text-black rounded-xl font-medium hover:bg-[#0d9668] transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        {action.label}
                    </button>
                )
            )}
        </div>
    );
}

// Preset empty states
export function NoStudentsEmpty({ onAdd }: { onAdd?: () => void }) {
    return (
        <EmptyState
            icon={<Users className="w-8 h-8 text-[#71717a]" />}
            title="No students yet"
            description="Add your first student to start tracking their learning journey."
            action={{ label: 'Add Student', onClick: onAdd }}
        />
    );
}

export function NoSessionsEmpty({ onAdd }: { onAdd?: () => void }) {
    return (
        <EmptyState
            icon={<Calendar className="w-8 h-8 text-[#71717a]" />}
            title="No sessions recorded"
            description="Start a tutoring session to begin capturing learning insights."
            action={{ label: 'New Session', onClick: onAdd }}
        />
    );
}

// Error state component
interface ErrorStateProps {
    title?: string;
    message?: string;
    onRetry?: () => void;
}

export function ErrorState({
    title = "Something went wrong",
    message = "We couldn't load this content. Please try again.",
    onRetry
}: ErrorStateProps) {
    return (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className="w-16 h-16 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center justify-center mb-6">
                <AlertTriangle className="w-8 h-8 text-red-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
            <p className="text-[#71717a] max-w-sm mb-6">{message}</p>
            {onRetry && (
                <button
                    onClick={onRetry}
                    className="flex items-center gap-2 px-5 py-2.5 bg-white/[0.05] border border-white/[0.1] rounded-xl font-medium hover:bg-white/[0.1] transition-colors"
                >
                    <RefreshCw className="w-4 h-4" />
                    Try Again
                </button>
            )}
        </div>
    );
}
