'use client';

import React, { useMemo, useState } from 'react';
import { Topic, Subject, AP_SUBJECTS } from '@/lib/knowledge-graph';
import { CheckCircle2, AlertCircle, Info, ArrowUpRight, Target, ChevronDown, ChevronRight, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MasteryData {
    topicId: string;
    level: number;
}

interface MasteryMatrixProps {
    subject: Subject;
    mastery: MasteryData[];
    onTopicClick: (topic: Topic) => void;
    isCompact?: boolean;
}

export default function MasteryMatrix({ subject, mastery, onTopicClick, isCompact }: MasteryMatrixProps) {
    const [allOpen, setAllOpen] = useState(true);
    const [forceToggle, setForceToggle] = useState(0);

    const units = useMemo(() => {
        const parentTopics = subject.topics.filter(t => !t.parentId);
        return parentTopics.map((unit, index) => {
            const children = subject.topics.filter(t => t.parentId === unit.id);
            const unitMastery = children.length > 0
                ? Math.round(children.reduce((acc, child) => {
                    const m = mastery.find(m => m.topicId === child.id)?.level || 0;
                    return acc + m;
                }, 0) / children.length)
                : 0;

            return {
                ...unit,
                unitNumber: index + 1,
                topics: children,
                averageMastery: unitMastery
            };
        });
    }, [subject, mastery]);

    return (
        <div className="w-full h-full space-y-8 overflow-y-auto pr-4 custom-scrollbar">
            <div className="flex justify-end px-2">
                <button
                    onClick={() => {
                        setAllOpen(!allOpen);
                        setForceToggle(prev => prev + 1);
                    }}
                    className="flex items-center space-x-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-[10px] font-black text-white/40 hover:text-white transition-all uppercase tracking-widest"
                >
                    <ChevronsUpDown size={12} />
                    <span>{allOpen ? 'Collapse All' : 'Expand All'}</span>
                </button>
            </div>

            {units.map((unit) => (
                <UnitSection
                    key={`${unit.id}-${forceToggle}`}
                    unit={unit}
                    mastery={mastery}
                    onTopicClick={onTopicClick}
                    initialOpen={allOpen}
                    isCompact={isCompact}
                />
            ))}
        </div>
    );
}

function UnitSection({ unit, mastery, onTopicClick, initialOpen, isCompact }: {
    unit: any,
    mastery: MasteryData[],
    onTopicClick: (t: Topic) => void,
    initialOpen: boolean,
    isCompact?: boolean
}) {
    const [isOpen, setIsOpen] = useState(initialOpen);

    return (
        <section className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-end justify-between px-2 cursor-pointer group/header"
            >
                <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                        <div className="p-0.5 rounded group-hover/header:bg-white/10 transition-colors">
                            {isOpen ? <ChevronDown size={14} className="text-white/40" /> : <ChevronRight size={14} className="text-white/40" />}
                        </div>
                        <span className="text-[10px] font-black text-[#10b981] uppercase tracking-widest bg-[#10b981]/10 px-2 py-0.5 rounded">
                            Unit {unit.unitNumber}
                        </span>
                        {unit.examWeight && (
                            <span className="text-[10px] font-bold text-white/30 uppercase tracking-tighter">
                                Exam Weight: {unit.examWeight}%
                            </span>
                        )}
                    </div>
                    <h2 className="text-xl font-bold text-white/90 tracking-tight group-hover/header:text-white transition-colors">{unit.name}</h2>
                </div>
                <div className="flex flex-col items-end">
                    <span className="text-[10px] text-white/30 font-bold uppercase tracking-widest mb-1">Unit Mastery</span>
                    <div className="flex items-center space-x-3">
                        <div className="text-2xl font-black text-white">{unit.averageMastery}%</div>
                        <div className="w-24 h-1.5 bg-white/5 rounded-full overflow-hidden">
                            <div
                                className={cn(
                                    "h-full transition-all duration-1000",
                                    unit.averageMastery >= 80 ? "bg-emerald-500" :
                                        unit.averageMastery >= 40 ? "bg-amber-500" : "bg-rose-500"
                                )}
                                style={{ width: `${unit.averageMastery}%` }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {isOpen && (
                <div className={cn(
                    "grid gap-4 animate-in fade-in slide-in-from-top-2 duration-300",
                    isCompact
                        ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3"
                        : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                )}>
                    {unit.topics.map((topic: Topic) => (
                        <TopicCard
                            key={topic.id}
                            topic={topic}
                            level={mastery.find(m => m.topicId === topic.id)?.level || 0}
                            onClick={() => onTopicClick(topic)}
                        />
                    ))}
                </div>
            )}
        </section>
    );
}

function TopicCard({ topic, level, onClick }: { topic: Topic, level: number, onClick: () => void }) {
    const isMastered = level >= 80;
    const isStruggling = level < 40 && level > 0;
    const isUntouched = level === 0;

    return (
        <button
            onClick={onClick}
            className="group relative flex flex-col p-5 bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 hover:border-white/20 rounded-2xl transition-all duration-300 text-left overflow-hidden"
        >
            {/* Background Accent */}
            <div
                className={cn(
                    "absolute top-0 right-0 w-24 h-24 blur-[40px] opacity-0 group-hover:opacity-10 transition-opacity",
                    isMastered ? "bg-emerald-500" : isStruggling ? "bg-rose-500" : "bg-emerald-500"
                )}
            />

            <div className="flex justify-between items-start mb-4">
                <div className={cn(
                    "w-8 h-8 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110",
                    isMastered ? "bg-emerald-500/20 text-emerald-400" :
                        isStruggling ? "bg-rose-500/20 text-rose-400" :
                            "bg-white/5 text-white/40"
                )}>
                    {isMastered ? <CheckCircle2 size={18} /> :
                        isStruggling ? <AlertCircle size={18} /> :
                            <Target size={18} />}
                </div>

                {topic.importance === 'core' && (
                    <div className="flex items-center space-x-1 text-[10px] font-bold text-amber-500/80 bg-amber-500/10 px-2 py-0.5 rounded-full uppercase tracking-tighter shadow-sm">
                        <ArrowUpRight size={10} />
                        <span>High Weight</span>
                    </div>
                )}
            </div>

            <h3 className="text-[13px] font-bold text-white/80 leading-snug mb-4 flex-1 group-hover:text-white transition-colors">
                {topic.name}
            </h3>

            <div className="space-y-2 mt-auto">
                <div className="flex justify-between items-end">
                    <span className="text-[10px] text-white/30 font-black uppercase tracking-widest">Mastery</span>
                    <span className={cn(
                        "text-xs font-black",
                        isMastered ? "text-emerald-400" : isStruggling ? "text-rose-400" : "text-white/60"
                    )}>
                        {level}%
                    </span>
                </div>
                <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                    <div
                        className={cn(
                            "h-full transition-all duration-700",
                            isMastered ? "bg-emerald-500" : isStruggling ? "bg-rose-500" : "bg-emerald-500"
                        )}
                        style={{ width: `${level}%` }}
                    />
                </div>
            </div>

            {/* Hover Action */}
            <div className="absolute top-4 right-4 translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300">
                <div className="p-1.5 bg-white/10 rounded-lg text-white">
                    <ArrowUpRight size={14} />
                </div>
            </div>
        </button>
    );
}
