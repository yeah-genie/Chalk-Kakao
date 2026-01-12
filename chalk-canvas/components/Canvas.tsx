'use client';

import { useRef, useEffect, useCallback, useState, forwardRef, useImperativeHandle } from 'react';
import { Tool, PenColor, StrokeData, Point } from '@/lib/types';

export interface CanvasRef {
    getCanvasImage: () => string | null;
}

interface CanvasProps {
    tool: Tool;
    color: PenColor;
    strokes: StrokeData[];
    onStrokeComplete: (stroke: StrokeData) => void;
    backgroundImage?: string;
}

// Catmull-Rom spline interpolation for smooth curves
function catmullRomSpline(
    p0: { x: number; y: number },
    p1: { x: number; y: number },
    p2: { x: number; y: number },
    p3: { x: number; y: number },
    t: number
): { x: number; y: number } {
    const t2 = t * t;
    const t3 = t2 * t;

    const x =
        0.5 *
        (2 * p1.x +
            (-p0.x + p2.x) * t +
            (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 +
            (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3);

    const y =
        0.5 *
        (2 * p1.y +
            (-p0.y + p2.y) * t +
            (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 +
            (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3);

    return { x, y };
}

const Canvas = forwardRef<CanvasRef, CanvasProps>(function Canvas({
    tool,
    color,
    strokes,
    onStrokeComplete,
    backgroundImage,
}, ref) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const currentStrokeRef = useRef<Point[]>([]);
    const strokeStartTimeRef = useRef<number>(0);

    // Expose getCanvasImage to parent
    useImperativeHandle(ref, () => ({
        getCanvasImage: () => {
            const canvas = canvasRef.current;
            if (!canvas) return null;
            return canvas.toDataURL('image/png');
        },
    }));

    // Resize canvas to fill container
    useEffect(() => {
        const handleResize = () => {
            const canvas = canvasRef.current;
            const container = containerRef.current;
            if (!canvas || !container) return;

            const rect = container.getBoundingClientRect();
            const dpr = window.devicePixelRatio || 1;

            canvas.width = rect.width * dpr;
            canvas.height = rect.height * dpr;
            canvas.style.width = `${rect.width}px`;
            canvas.style.height = `${rect.height}px`;

            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.scale(dpr, dpr);
            }

            // Redraw after resize
            redrawCanvas();
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [strokes]);

    // Redraw all strokes
    const redrawCanvas = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const dpr = window.devicePixelRatio || 1;
        ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);

        // Draw grid pattern
        drawGrid(ctx, canvas.width / dpr, canvas.height / dpr);

        // Draw all completed strokes
        strokes.forEach((stroke) => {
            drawStroke(ctx, stroke);
        });
    }, [strokes]);

    useEffect(() => {
        redrawCanvas();
    }, [strokes, redrawCanvas]);

    const drawGrid = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
        ctx.lineWidth = 1;

        const gridSize = 40;
        for (let x = 0; x < width; x += gridSize) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, height);
            ctx.stroke();
        }
        for (let y = 0; y < height; y += gridSize) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
        }
    };

    const drawStroke = (ctx: CanvasRenderingContext2D, stroke: StrokeData) => {
        if (stroke.points.length < 2) return;

        ctx.strokeStyle = stroke.tool === 'eraser' ? '#0a0a0a' : stroke.color;
        ctx.lineWidth = stroke.tool === 'eraser' ? 30 : 3;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        const points = stroke.points;

        if (points.length === 2) {
            ctx.beginPath();
            ctx.moveTo(points[0].x, points[0].y);
            ctx.lineTo(points[1].x, points[1].y);
            ctx.stroke();
            return;
        }

        // Use Catmull-Rom spline for smooth curves
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);

        for (let i = 0; i < points.length - 1; i++) {
            const p0 = points[Math.max(i - 1, 0)];
            const p1 = points[i];
            const p2 = points[Math.min(i + 1, points.length - 1)];
            const p3 = points[Math.min(i + 2, points.length - 1)];

            // Interpolate between p1 and p2
            const segments = 8;
            for (let t = 0; t <= 1; t += 1 / segments) {
                const point = catmullRomSpline(p0, p1, p2, p3, t);
                ctx.lineTo(point.x, point.y);
            }
        }

        ctx.stroke();
    };

    const getPointerPosition = (e: React.PointerEvent): { x: number; y: number; pressure: number } => {
        const canvas = canvasRef.current;
        if (!canvas) return { x: 0, y: 0, pressure: 0.5 };

        const rect = canvas.getBoundingClientRect();
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
            pressure: e.pressure || 0.5,
        };
    };

    const handlePointerDown = (e: React.PointerEvent) => {
        e.preventDefault();
        setIsDrawing(true);
        strokeStartTimeRef.current = performance.now();

        const { x, y, pressure } = getPointerPosition(e);
        currentStrokeRef.current = [
            { t: 0, x, y, pressure, type: 'start' },
        ];

        // Draw the starting point
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (ctx) {
            ctx.fillStyle = tool === 'eraser' ? '#0a0a0a' : color;
            ctx.beginPath();
            ctx.arc(x, y, tool === 'eraser' ? 15 : 1.5, 0, Math.PI * 2);
            ctx.fill();
        }
    };

    const handlePointerMove = (e: React.PointerEvent) => {
        if (!isDrawing) return;
        e.preventDefault();

        const { x, y, pressure } = getPointerPosition(e);
        const t = (performance.now() - strokeStartTimeRef.current) / 1000;

        const newPoint: Point = { t, x, y, pressure, type: 'move' };
        currentStrokeRef.current.push(newPoint);

        // Draw incrementally for smooth real-time feedback
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (ctx && currentStrokeRef.current.length >= 2) {
            const points = currentStrokeRef.current;
            const len = points.length;

            ctx.strokeStyle = tool === 'eraser' ? '#0a0a0a' : color;
            ctx.lineWidth = tool === 'eraser' ? 30 : 3;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';

            if (len >= 4) {
                // Use spline for the last segment
                const p0 = points[len - 4];
                const p1 = points[len - 3];
                const p2 = points[len - 2];
                const p3 = points[len - 1];

                ctx.beginPath();
                ctx.moveTo(p1.x, p1.y);
                const segments = 4;
                for (let t = 0; t <= 1; t += 1 / segments) {
                    const point = catmullRomSpline(p0, p1, p2, p3, t);
                    ctx.lineTo(point.x, point.y);
                }
                ctx.stroke();
            } else {
                // Simple line for first few points
                const prev = points[len - 2];
                const curr = points[len - 1];
                ctx.beginPath();
                ctx.moveTo(prev.x, prev.y);
                ctx.lineTo(curr.x, curr.y);
                ctx.stroke();
            }
        }
    };

    const handlePointerUp = (e: React.PointerEvent) => {
        if (!isDrawing) return;
        e.preventDefault();
        setIsDrawing(false);

        const { x, y, pressure } = getPointerPosition(e);
        const t = (performance.now() - strokeStartTimeRef.current) / 1000;

        currentStrokeRef.current.push({ t, x, y, pressure, type: 'end' });

        // Complete the stroke
        if (currentStrokeRef.current.length >= 2) {
            const completedStroke: StrokeData = {
                tool,
                color,
                points: [...currentStrokeRef.current],
            };
            onStrokeComplete(completedStroke);
        }

        currentStrokeRef.current = [];
    };

    const handlePointerLeave = (e: React.PointerEvent) => {
        if (isDrawing) {
            handlePointerUp(e);
        }
    };

    return (
        <div
            ref={containerRef}
            className="w-full h-full relative bg-[#0a0a0a]"
        >
            {backgroundImage && (
                <img
                    src={backgroundImage}
                    alt="Problem"
                    className="absolute inset-0 w-full h-full object-contain opacity-90 pointer-events-none"
                />
            )}
            <canvas
                ref={canvasRef}
                className={`absolute inset-0 touch-none ${tool === 'pen' ? 'cursor-pen' : 'cursor-eraser'
                    }`}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerLeave={handlePointerLeave}
                onPointerCancel={handlePointerUp}
                style={{ touchAction: 'none' }}
            />
        </div>
    );
});

export default Canvas;
