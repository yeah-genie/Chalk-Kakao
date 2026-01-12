'use client';

import React, { useMemo, useRef, useEffect, useState } from 'react';
import ForceGraph2D, { ForceGraphMethods } from 'react-force-graph-2d';
import { AP_SUBJECTS, Topic } from '@/lib/knowledge-graph';

interface MasteryData {
    topicCode: string;
    level: number;
}

interface MasterySkillTreeProps {
    subjectCode: string;
    mastery: MasteryData[];
    onTopicClick: (topic: Topic) => void;
}

export default function MasterySkillTree({ subjectCode, mastery, onTopicClick }: MasterySkillTreeProps) {
    const graphRef = useRef<ForceGraphMethods | undefined>(undefined);
    const containerRef = useRef<HTMLDivElement>(null);
    const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
    const [hoverNode, setHoverNode] = useState<any>(null);

    useEffect(() => {
        const updateDimensions = () => {
            if (containerRef.current) {
                const rect = containerRef.current.getBoundingClientRect();
                setDimensions({ width: rect.width, height: rect.height });
            }
        };
        window.addEventListener('resize', updateDimensions);
        updateDimensions();

        const timer = setTimeout(() => {
            graphRef.current?.zoomToFit(400, 50);
        }, 800);

        return () => window.removeEventListener('resize', updateDimensions);
    }, []);

    const data = useMemo(() => {
        const subject = AP_SUBJECTS.find(s => s.code === subjectCode) || AP_SUBJECTS[0];

        const nodes = subject.topics.map((topic) => {
            const masteryInfo = mastery.find(m => m.topicCode === topic.code);
            const level = masteryInfo?.level || 0;

            // Logic to determine if "Unlocked" based on dependency mastery
            const deps = topic.dependencies || [];
            const isUnlocked = deps.length === 0 || deps.every(depCode => {
                const m = mastery.find(item => item.topicCode === depCode);
                return (m?.level || 0) >= 70;
            });

            return {
                ...topic,
                id: topic.id,
                mastery: level,
                isUnlocked,
                isMastered: level >= 80,
                // Color based on level or state
                color: level >= 80 ? '#4ade80' : level >= 40 ? '#facc15' : isUnlocked ? '#3b82f6' : '#27272a'
            };
        });

        const links: any[] = [];
        subject.topics.forEach(topic => {
            // In a skill tree, we primarily show Dependency links as the main paths
            if (topic.dependencies) {
                topic.dependencies.forEach(depCode => {
                    const depTopic = subject.topics.find(t => t.code === depCode);
                    if (depTopic) {
                        links.push({
                            source: depTopic.id,
                            target: topic.id,
                            type: 'dependency'
                        });
                    }
                });
            } else if (topic.parentId) {
                // If no deep dependency, link to parent as default flow
                links.push({
                    source: topic.parentId,
                    target: topic.id,
                    type: 'structural'
                });
            }
        });

        return { nodes, links };
    }, [subjectCode, mastery]);

    const drawSkillNode = (ctx: CanvasRenderingContext2D, node: any, globalScale: number) => {
        const isHovered = hoverNode === node;
        const w = 110 / globalScale;
        const h = 45 / globalScale;
        const r = 8 / globalScale;
        const x = node.x - w / 2;
        const y = node.y - h / 2;

        ctx.save();

        // Shadow for premium feel
        if (node.isUnlocked) {
            ctx.shadowColor = node.color + '44';
            ctx.shadowBlur = (isHovered ? 20 : 10) / globalScale;
        }

        // Background
        ctx.beginPath();
        ctx.roundRect(x, y, w, h, r);
        ctx.fillStyle = node.isUnlocked ? '#0f0f1a' : '#0a0a0f';
        ctx.fill();

        // Border
        ctx.strokeStyle = isHovered ? '#fff' : (node.isUnlocked ? node.color + '88' : '#1f1f23');
        ctx.lineWidth = (isHovered ? 2 : 1) / globalScale;
        ctx.stroke();

        // Mastery Indicator (Left bar)
        ctx.fillStyle = node.color;
        ctx.beginPath();
        ctx.roundRect(x, y, 6 / globalScale, h, [r, 0, 0, r]);
        ctx.fill();

        // Text
        const fontSize = 10 / globalScale;
        ctx.font = `${isHovered ? '700' : '600'} ${fontSize}px "Inter", sans-serif`;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = node.isUnlocked ? (isHovered ? '#fff' : 'rgba(255,255,255,0.8)') : 'rgba(255,255,255,0.15)';

        const labelText = node.name;
        const maxWidth = w - 20 / globalScale;

        // Simple ellipsis if text too long
        let displayTitle = labelText;
        if (ctx.measureText(labelText).width > maxWidth) {
            displayTitle = labelText.substring(0, 15) + '...';
        }

        ctx.fillText(displayTitle, x + 15 / globalScale, y + h / 2);

        // Progress Pill
        if (node.isUnlocked && globalScale > 0.6) {
            ctx.fillStyle = 'rgba(255,255,255,0.05)';
            const pillW = 25 / globalScale;
            const pillH = 12 / globalScale;
            ctx.beginPath();
            ctx.roundRect(x + w - pillW - 10 / globalScale, y + h / 2 - pillH / 2, pillW, pillH, 4 / globalScale);
            ctx.fill();

            ctx.fillStyle = node.color;
            ctx.font = `bold ${7 / globalScale}px "Inter", sans-serif`;
            ctx.textAlign = 'center';
            ctx.fillText(`${node.mastery}%`, x + w - pillW / 2 - 10 / globalScale, y + h / 2);
        }

        ctx.restore();
    };

    return (
        <div ref={containerRef} className="w-full h-full bg-[#050510] relative overflow-hidden border border-white/5 rounded-3xl shadow-2xl">
            {/* Grid Pattern */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
                style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

            <div className="absolute top-8 left-8 z-10 pointer-events-none">
                <h3 className="text-white/40 text-[10px] font-black tracking-[0.4em] uppercase">Curriculum Skill Tree</h3>
                <p className="text-white/20 text-xs mt-3 font-semibold tracking-tight">Master prerequisites to unlock advanced topics</p>
            </div>

            <ForceGraph2D
                ref={graphRef}
                graphData={data}
                width={dimensions.width}
                height={dimensions.height}
                backgroundColor="transparent"
                dagMode="td" // Top-Down DAG mode for Skill Tree
                dagLevelDistance={140}
                nodeRelSize={1}
                linkColor={(link: any) => {
                    const isMastered = link.source.isMastered;
                    return isMastered ? '#4ade8055' : 'rgba(255, 255, 255, 0.05)';
                }}
                linkWidth={2}
                linkDirectionalParticles={2}
                linkDirectionalParticleSpeed={(link: any) => link.source.isMastered ? 0.01 : 0} // Flows only if mastered
                linkDirectionalParticleWidth={1.5}
                linkDirectionalParticleColor={() => '#4ade80'}
                nodeCanvasObject={(node, ctx, globalScale) => drawSkillNode(ctx, node, globalScale)}
                onNodeClick={(node: any) => node.isUnlocked && onTopicClick(node)}
                onNodeHover={(node: any) => setHoverNode(node)}
                cooldownTicks={50}
            />

            {/* Legend */}
            <div className="absolute bottom-8 left-8 flex items-center space-x-6 z-10 px-5 py-2.5 bg-black/40 backdrop-blur-xl rounded-2xl border border-white/5 shadow-2xl">
                <div className="flex items-center space-x-2.5">
                    <div className="w-2 h-2 rounded-full bg-[#4ade80]" />
                    <span className="text-white/40 text-[9px] font-black uppercase tracking-widest">Mastered</span>
                </div>
                <div className="flex items-center space-x-2.5">
                    <div className="w-2 h-2 rounded-full bg-[#3b82f6]" />
                    <span className="text-white/40 text-[9px] font-black uppercase tracking-widest">Unlocked</span>
                </div>
                <div className="flex items-center space-x-2.5">
                    <div className="w-2 h-2 rounded-full bg-[#27272a]" />
                    <span className="text-white/40 text-[9px] font-black uppercase tracking-widest">Locked</span>
                </div>
            </div>
        </div>
    );
}
