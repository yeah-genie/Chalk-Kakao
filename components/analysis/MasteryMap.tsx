'use client';

import React, { useMemo, useRef, useEffect, useState } from 'react';
import ForceGraph2D, { ForceGraphMethods } from 'react-force-graph-2d';
import { AP_SUBJECTS, Topic } from '@/lib/knowledge-graph';
import { MoreVertical, BookOpen, Calendar, BarChart2, CheckCircle2 } from 'lucide-react';

interface MasteryData {
    topicCode: string;
    level: number;
}

interface MasteryMapProps {
    subjectCode: string;
    mastery: MasteryData[];
    onTopicClick: (topic: Topic) => void;
}

const UNIT_COLORS = [
    '#a855f7', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899', '#84cc16',
];

export default function MasteryMap({ subjectCode, mastery, onTopicClick }: MasteryMapProps) {
    const graphRef = useRef<ForceGraphMethods | undefined>(undefined);
    const containerRef = useRef<HTMLDivElement>(null);
    const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
    const [hoverNode, setHoverNode] = useState<any>(null);
    const [zoomLevel, setZoomLevel] = useState(1);
    const [contextMenu, setContextMenu] = useState<{ x: number, y: number, node: any } | null>(null);

    useEffect(() => {
        const updateDimensions = () => {
            if (containerRef.current) {
                // Get the actual container size instead of window calculation
                const rect = containerRef.current.getBoundingClientRect();
                setDimensions({
                    width: rect.width,
                    height: rect.height,
                });
            }
        };

        window.addEventListener('resize', updateDimensions);
        updateDimensions();

        const timer = setTimeout(() => {
            graphRef.current?.zoomToFit(400);
            graphRef.current?.d3Force('charge')?.strength(-1200);
            graphRef.current?.d3Force('link')?.distance(160);
            graphRef.current?.d3Force('collide', (window as any).d3.forceCollide(50));
        }, 800);

        return () => {
            window.removeEventListener('resize', updateDimensions);
            clearTimeout(timer);
        };
    }, []);

    const data = useMemo(() => {
        const subject = AP_SUBJECTS.find(s => s.code === subjectCode) || AP_SUBJECTS[0];
        const parentTopics = subject.topics.filter(t => !t.parentId);

        const nodes = subject.topics.map((topic) => {
            const masteryInfo = mastery.find(m => m.topicCode === topic.code);
            const level = masteryInfo?.level || 0;
            const unitIndex = parentTopics.findIndex(p => p.id === (topic.parentId || topic.id));
            const color = UNIT_COLORS[unitIndex % UNIT_COLORS.length] || '#fff';

            return {
                ...topic,
                id: topic.id,
                mastery: level,
                type: topic.parentId ? 'card' : 'unit',
                color
            };
        });

        const centralNode = {
            id: 'subject-center',
            name: subject.name,
            type: 'subject',
            color: 'rgba(255,255,255,0.03)',
            mastery: 0
        };

        const links: any[] = [];
        subject.topics.forEach(topic => {
            if (topic.parentId) {
                links.push({ source: topic.parentId, target: topic.id, type: 'structural' });
            } else {
                links.push({ source: 'subject-center', target: topic.id, type: 'core' });
            }
            if (topic.dependencies) {
                topic.dependencies.forEach(depCode => {
                    const depTopic = subject.topics.find(t => t.code === depCode);
                    if (depTopic) {
                        links.push({ source: depTopic.id, target: topic.id, type: 'dependency' });
                    }
                });
            }
        });

        return { nodes: [centralNode, ...nodes], links };
    }, [subjectCode, mastery]);

    const drawCard = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number, node: any, isHovered: boolean, globalScale: number) => {
        if (globalScale < 0.35 && !isHovered) return;

        ctx.save();
        const isMedium = globalScale < 0.7;

        // Shadow only for hovered/high zoom
        if (isHovered) {
            ctx.shadowColor = 'rgba(0,0,0,0.8)';
            ctx.shadowBlur = 15 / globalScale;
        }

        // Card Body
        ctx.beginPath();
        ctx.roundRect(x, y, w, h, r);
        ctx.fillStyle = isHovered ? '#151525' : '#0c0c14';
        ctx.fill();

        ctx.strokeStyle = isHovered ? node.color : (isMedium ? node.color + '33' : 'rgba(255,255,255,0.05)');
        ctx.lineWidth = (isHovered ? 2 : 1) / globalScale;
        ctx.stroke();

        // Header Tint
        ctx.fillStyle = node.color;
        ctx.beginPath();
        ctx.roundRect(x, y, w, 8 / globalScale, [r, r, 0, 0]);
        ctx.fill();

        // Text Content
        const fontSize = (isMedium ? 11 : 10) / globalScale;
        ctx.font = `${isHovered ? '700' : '600'} ${fontSize}px "Inter", sans-serif`;
        ctx.textAlign = 'left'; ctx.textBaseline = 'top';
        ctx.fillStyle = isHovered ? '#fff' : 'rgba(255,255,255,0.8)';

        const wrapText = (text: string, maxWidth: number) => {
            const words = text.split(' ');
            const lines = [];
            let currentLine = words[0];
            for (let i = 1; i < words.length; i++) {
                const width = ctx.measureText(currentLine + " " + words[i]).width;
                if (width < maxWidth) currentLine += " " + words[i];
                else { lines.push(currentLine); currentLine = words[i]; }
            }
            lines.push(currentLine);
            return lines;
        };

        const lines = wrapText(node.name, w - 24 / globalScale);
        lines.slice(0, 3).forEach((line, i) => {
            ctx.fillText(line, x + 12 / globalScale, y + 28 / globalScale + (i * fontSize * 1.4));
        });

        // Mastery Indicator
        if (globalScale > 0.6 || isHovered) {
            const barY = y + h - 16 / globalScale;
            ctx.fillStyle = 'rgba(255,255,255,0.02)';
            ctx.fillRect(x + 12 / globalScale, barY, w - 24 / globalScale, 4 / globalScale);
            if (node.mastery > 0) {
                ctx.fillStyle = node.mastery >= 80 ? '#4ade80' : node.mastery >= 40 ? '#facc15' : '#ec4899';
                ctx.fillRect(x + 12 / globalScale, barY, (w - 24 / globalScale) * (node.mastery / 100), 4 / globalScale);
            }
        }

        ctx.restore();
    };

    const drawUnitBubble = (ctx: CanvasRenderingContext2D, x: number, y: number, node: any, isHovered: boolean, globalScale: number) => {
        const radius = (isHovered ? 68 : 58) / globalScale;
        ctx.save();

        ctx.beginPath();
        ctx.arc(x, y, radius, 0, 2 * Math.PI);
        ctx.fillStyle = isHovered ? node.color : node.color + 'ee';
        ctx.fill();

        ctx.shadowBlur = 0;
        ctx.fillStyle = '#fff';
        const fontSize = 15 / globalScale;
        ctx.font = `800 ${fontSize}px "Inter", sans-serif`;
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';

        const words = node.name.split(' ');
        words.forEach((word: string, i: number) => {
            const offset = (i - (words.length - 1) / 2) * (fontSize * 1.2);
            ctx.fillText(word, x, y + offset);
        });

        ctx.restore();
    };

    const handleNodeClick = (node: any, event: any) => {
        if (node.type === 'unit') {
            graphRef.current?.centerAt(node.x, node.y, 1000);
            graphRef.current?.zoom(1.4, 1000);
            setContextMenu(null);
        } else if (node.type === 'card') {
            // Show Context Menu for actionability
            setContextMenu({ x: event.clientX, y: event.clientY, node });
        }
    };

    return (
        <div ref={containerRef} className="w-full h-full bg-[#050510] relative overflow-hidden border border-white/5 rounded-3xl shadow-2xl group/map">
            <div className="absolute inset-0 opacity-[0.02] pointer-events-none"
                style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '50px 50px' }} />

            <div className="absolute top-8 left-8 z-10 pointer-events-none">
                <h3 className="text-white/40 text-[10px] font-black tracking-[0.5em] uppercase">Mastery Board</h3>
                <p className="text-white/20 text-xs mt-3 font-semibold tracking-tight">Professional Curriculum Intelligence</p>
            </div>

            <ForceGraph2D
                ref={graphRef}
                graphData={data}
                width={dimensions.width}
                height={dimensions.height}
                backgroundColor="transparent" // Allow container background to show
                nodeRelSize={1}
                linkColor={(link: any) => {
                    const isRelated = hoverNode && (link.source.id === hoverNode.id || link.target.id === hoverNode.id);
                    if (isRelated) return link.type === 'dependency' ? '#818cf8' : 'rgba(255,255,255,0.3)';
                    return link.type === 'dependency' ? 'rgba(129, 140, 248, 0.08)' : 'rgba(255, 255, 255, 0.03)';
                }}
                linkWidth={(link: any) => hoverNode && (link.source.id === hoverNode.id || link.target.id === hoverNode.id) ? 2.5 : 2}
                linkDirectionalArrowLength={6}
                linkDirectionalArrowRelPos={1}
                linkCurvature={0.2}
                onZoom={(zoom) => {
                    setZoomLevel(zoom.k);
                    if (contextMenu) setContextMenu(null);
                }}
                onBackgroundClick={() => setContextMenu(null)}
                nodeCanvasObject={(node: any, ctx, globalScale) => {
                    if (!isFinite(node.x) || !isFinite(node.y)) return;
                    const isHovered = hoverNode === node;

                    if (node.type === 'subject') {
                        ctx.save();
                        ctx.beginPath();
                        ctx.arc(node.x, node.y, 80 / globalScale, 0, 2 * Math.PI);
                        ctx.fillStyle = 'rgba(255,255,255,0.02)';
                        ctx.fill();
                        ctx.strokeStyle = 'rgba(255,255,255,0.03)';
                        ctx.lineWidth = 1 / globalScale;
                        ctx.stroke();
                        ctx.fillStyle = 'rgba(255,255,255,0.3)';
                        ctx.font = `900 ${16 / globalScale}px "Inter", sans-serif`;
                        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
                        ctx.fillText(node.name.toUpperCase(), node.x, node.y);
                        ctx.restore();
                    } else if (node.type === 'unit') {
                        drawUnitBubble(ctx, node.x, node.y, node, isHovered, globalScale);
                    } else {
                        const w = 150 / globalScale;
                        const h = 95 / globalScale;
                        drawCard(ctx, node.x - w / 2, node.y - h / 2, w, h, 12 / globalScale, node, isHovered, globalScale);
                    }
                }}
                onNodeClick={handleNodeClick}
                onNodeHover={(node: any) => setHoverNode(node)}
                cooldownTicks={120}
            />

            {/* Quick Action Context Menu */}
            {contextMenu && (
                <div
                    className="fixed z-[100] bg-[#0c0c14]/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-3xl p-1.5 w-64 animate-in fade-in zoom-in duration-200"
                    style={{ left: contextMenu.x + 20, top: contextMenu.y - 120 }}
                >
                    <div className="px-3 py-2 mb-1 border-b border-white/5">
                        <span className="text-[10px] text-white/30 font-bold uppercase tracking-widest block mb-1">Topic Actions</span>
                        <h4 className="text-white text-xs font-bold truncate">{contextMenu.node.name}</h4>
                    </div>
                    <div className="space-y-0.5">
                        <button
                            onClick={() => { onTopicClick(contextMenu.node); setContextMenu(null); }}
                            className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl hover:bg-white/5 text-white/70 hover:text-white transition-all group"
                        >
                            <BarChart2 size={16} className="text-blue-400" />
                            <span className="text-xs font-medium">Deep AI Insight</span>
                        </button>
                        <button className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl hover:bg-white/5 text-white/70 hover:text-white transition-all group">
                            <BookOpen size={16} className="text-green-400" />
                            <span className="text-xs font-medium">Generate Practice Set</span>
                        </button>
                        <button className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl hover:bg-white/5 text-white/70 hover:text-white transition-all group">
                            <Calendar size={16} className="text-purple-400" />
                            <span className="text-xs font-medium">View Related Sessions</span>
                        </button>
                        <button className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl hover:bg-red-500/10 text-white/70 hover:text-red-400 transition-all group">
                            <BarChart2 size={16} className="text-red-400" />
                            <span className="text-xs font-medium">Mark as Mastered</span>
                        </button>
                    </div>
                </div>
            )}

            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 px-6 py-2 bg-white/[0.02] backdrop-blur-xl rounded-full border border-white/5 shadow-2xl flex items-center space-x-6">
                <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 rounded-full bg-[#ec4899] animate-pulse shadow-[0_0_10px_#ec4899]" />
                    <span className="text-[10px] text-white/50 font-black uppercase tracking-widest">Active learning path</span>
                </div>
                <div className="w-[1px] h-4 bg-white/10" />
                <div className="text-[10px] text-white/50 font-black uppercase tracking-widest">Zoom: {Math.round(zoomLevel * 100)}%</div>
            </div>
        </div>
    );
}
