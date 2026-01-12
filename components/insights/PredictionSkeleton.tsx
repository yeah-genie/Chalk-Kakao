import React from 'react';

export default function PredictionSkeleton() {
    return (
        <div className="space-y-6 animate-pulse">
            {/* 1. Next Session Recommendation Skeleton */}
            <div className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-white/5 rounded-lg" />
                    <div className="space-y-2">
                        <div className="h-2 w-24 bg-white/5 rounded" />
                        <div className="h-2 w-32 bg-white/5 rounded" />
                    </div>
                </div>
                <div className="space-y-3">
                    <div className="h-4 w-3/4 bg-white/10 rounded" />
                    <div className="h-3 w-1/2 bg-white/5 rounded" />
                </div>
            </div>

            {/* 2. Progress Forecast Skeleton */}
            <div className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl">
                <div className="h-3 w-40 bg-white/5 rounded mb-6" />
                <div className="space-y-6">
                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <div className="h-2 w-16 bg-white/5 rounded" />
                            <div className="h-2 w-20 bg-white/5 rounded" />
                        </div>
                        <div className="h-2 w-full bg-white/5 rounded-full" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="h-20 bg-white/5 rounded-xl border border-white/5" />
                        <div className="h-20 bg-white/5 rounded-xl border border-white/5" />
                    </div>
                </div>
            </div>

            {/* 3. Retention Alerts Skeleton */}
            <div className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl">
                <div className="h-3 w-32 bg-white/5 rounded mb-4" />
                <div className="space-y-3">
                    <div className="h-10 bg-white/5 rounded-xl border border-white/5" />
                    <div className="h-10 bg-white/5 rounded-xl border border-white/5" />
                </div>
            </div>
        </div>
    );
}
