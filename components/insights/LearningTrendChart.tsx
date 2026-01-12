'use client';

import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { TrendingUp, AlertTriangle } from 'lucide-react';

interface HistoryPoint {
    date: string;
    score: number;
}

interface LearningTrendChartProps {
    history: HistoryPoint[];
}

export default function LearningTrendChart({ history }: LearningTrendChartProps) {
    const svgRef = useRef<SVGSVGElement>(null);

    useEffect(() => {
        if (!svgRef.current || history.length < 2) return;

        // Clear previous SVG contents
        d3.select(svgRef.current).selectAll("*").remove();

        const margin = { top: 20, right: 30, bottom: 40, left: 40 };
        const width = svgRef.current.clientWidth - margin.left - margin.right;
        const height = 300 - margin.top - margin.bottom;

        const svg = d3.select(svgRef.current)
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        // Parse dates
        const parseDate = d3.isoParse;
        const formattedData = history.map(d => ({
            date: parseDate(d.date) || new Date(),
            score: d.score
        }));

        // Scales
        const x = d3.scaleTime()
            .domain(d3.extent(formattedData, d => d.date) as [Date, Date])
            .range([0, width]);

        const y = d3.scaleLinear()
            .domain([0, 100])
            .range([height, 0]);

        // Line generator
        const line = d3.line<any>()
            .x(d => x(d.date))
            .y(d => y(d.score))
            .curve(d3.curveMonotoneX);

        // Gradient for line
        svg.append("linearGradient")
            .attr("id", "line-gradient")
            .attr("gradientUnits", "userSpaceOnUse")
            .attr("x1", 0).attr("y1", y(0))
            .attr("x2", 0).attr("y2", y(100))
            .selectAll("stop")
            .data([
                { offset: "0%", color: "#ef4444" },
                { offset: "50%", color: "#f59e0b" },
                { offset: "100%", color: "#10b981" }
            ])
            .enter().append("stop")
            .attr("offset", d => d.offset)
            .attr("stop-color", d => d.color);

        // Area under line
        const area = d3.area<any>()
            .x(d => x(d.date))
            .y0(height)
            .y1(d => y(d.score))
            .curve(d3.curveMonotoneX);

        svg.append("path")
            .datum(formattedData)
            .attr("fill", "url(#area-gradient)")
            .attr("d", area);

        svg.append("linearGradient")
            .attr("id", "area-gradient")
            .attr("gradientUnits", "userSpaceOnUse")
            .attr("x1", 0).attr("y1", height)
            .attr("x2", 0).attr("y2", 0)
            .selectAll("stop")
            .data([
                { offset: "0%", color: "rgba(16, 185, 129, 0)" },
                { offset: "100%", color: "rgba(16, 185, 129, 0.1)" }
            ])
            .enter().append("stop")
            .attr("offset", d => d.offset)
            .attr("stop-color", d => d.color);

        // X Axis
        svg.append("g")
            .attr("transform", `translate(0,${height})`)
            .call(d3.axisBottom(x).ticks(5).tickFormat(d3.timeFormat("%b %d") as any))
            .attr("color", "rgba(255,255,255,0.1)")
            .selectAll("text")
            .attr("color", "rgba(255,255,255,0.4)")
            .style("font-size", "10px")
            .style("font-weight", "bold");

        // Y Axis
        svg.append("g")
            .call(d3.axisLeft(y).ticks(5))
            .attr("color", "rgba(255,255,255,0.1)")
            .selectAll("text")
            .attr("color", "rgba(255,255,255,0.4)")
            .style("font-size", "10px")
            .style("font-weight", "bold");

        // The Line
        svg.append("path")
            .datum(formattedData)
            .attr("fill", "none")
            .attr("stroke", "url(#line-gradient)")
            .attr("stroke-width", 3)
            .attr("d", line);

        // Dots
        svg.selectAll(".dot")
            .data(formattedData)
            .enter().append("circle")
            .attr("class", "dot")
            .attr("cx", d => x(d.date))
            .attr("cy", d => y(d.score))
            .attr("r", 4)
            .attr("fill", "#0a0a0c")
            .attr("stroke", d => d.score > 80 ? "#10b981" : d.score > 50 ? "#f59e0b" : "#ef4444")
            .attr("stroke-width", 2);

    }, [history]);

    if (history.length < 2) {
        return (
            <div className="bg-[#18181b] border border-white/5 rounded-[2rem] p-12 text-center">
                <div className="bg-white/5 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                    <TrendingUp className="text-white/20" size={24} />
                </div>
                <h3 className="text-lg font-bold text-white/60">Not enough data to show trend</h3>
                <p className="text-sm text-white/30">Complete more sessions to see learning progress over time.</p>
            </div>
        );
    }

    // Check for "Smart Alert" - drop in mastery
    const lastScore = history[history.length - 1].score;
    const prevScore = history[history.length - 2].score;
    const isDropping = lastScore < prevScore - 15;

    return (
        <div className="bg-[#18181b] border border-white/5 rounded-[2rem] p-8 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-xl font-black tracking-tight">Learning Velocity</h3>
                    <p className="text-xs text-white/40 font-bold uppercase tracking-widest">Historical Mastery Growth</p>
                </div>
                {isDropping && (
                    <div className="flex items-center gap-2 bg-rose-500/10 text-rose-500 px-4 py-2 rounded-xl border border-rose-500/20">
                        <AlertTriangle size={16} />
                        <span className="text-[10px] font-black uppercase tracking-widest">Performance Alert</span>
                    </div>
                )}
            </div>

            <div className="w-full">
                <svg ref={svgRef} className="w-full h-[300px] overflow-visible" />
            </div>

            {isDropping && (
                <div className="p-4 bg-rose-500/5 border border-rose-500/10 rounded-2xl flex gap-4 items-start">
                    <div className="shrink-0 p-2 bg-rose-500/20 rounded-lg">
                        <TrendingUp size={16} className="text-rose-500" />
                    </div>
                    <div className="space-y-1">
                        <p className="text-xs font-bold text-white">Sudden Mastery Drop Detected</p>
                        <p className="text-[10px] text-white/40 leading-relaxed uppercase tracking-widest">
                            AI detected a {prevScore - lastScore}% drop in retention. Consider a review session focusing on recent weak topics.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
