'use client';

import { Tool, PenColor } from '@/lib/types';

interface ToolbarProps {
    currentTool: Tool;
    currentColor: PenColor;
    onToolChange: (tool: Tool) => void;
    onColorChange: (color: PenColor) => void;
    onUndo: () => void;
    onRedo: () => void;
    onClear: () => void;
    canUndo: boolean;
    canRedo: boolean;
}

const COLORS: { color: PenColor; label: string }[] = [
    { color: '#ffffff', label: 'White' },
    { color: '#3b82f6', label: 'Blue' },
    { color: '#ef4444', label: 'Red' },
];

export default function Toolbar({
    currentTool,
    currentColor,
    onToolChange,
    onColorChange,
    onUndo,
    onRedo,
    onClear,
    canUndo,
    canRedo,
}: ToolbarProps) {
    return (
        <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
            <div className="glass rounded-2xl p-2 flex flex-col gap-2 shadow-xl">
                {/* Pen Tool */}
                <button
                    onClick={() => onToolChange('pen')}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${currentTool === 'pen'
                            ? 'bg-accent/20 text-accent border border-accent/50'
                            : 'hover:bg-white/5 text-white/70'
                        }`}
                    title="Pen"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                </button>

                {/* Eraser Tool - Updated icon to actual eraser */}
                <button
                    onClick={() => onToolChange('eraser')}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${currentTool === 'eraser'
                            ? 'bg-accent/20 text-accent border border-accent/50'
                            : 'hover:bg-white/5 text-white/70'
                        }`}
                    title="Eraser"
                >
                    {/* Eraser icon */}
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 20H7L3 16c-.8-.8-.8-2 0-2.8L13.8 2.4c.8-.8 2-.8 2.8 0L21 6.8c.8.8.8 2 0 2.8L10 20" />
                        <path d="M6 11l5 5" />
                    </svg>
                </button>

                {/* Divider */}
                <div className="h-px bg-white/10 mx-1" />

                {/* Color Palette */}
                {COLORS.map(({ color, label }) => (
                    <button
                        key={color}
                        onClick={() => {
                            onColorChange(color);
                            onToolChange('pen');
                        }}
                        className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${currentColor === color && currentTool === 'pen'
                                ? 'ring-2 ring-white/50 ring-offset-2 ring-offset-surface'
                                : 'hover:scale-110'
                            }`}
                        title={label}
                    >
                        <div
                            className="w-5 h-5 rounded-full border-2 border-white/20"
                            style={{ backgroundColor: color }}
                        />
                    </button>
                ))}

                {/* Divider */}
                <div className="h-px bg-white/10 mx-1" />

                {/* Undo */}
                <button
                    onClick={onUndo}
                    disabled={!canUndo}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${canUndo
                            ? 'hover:bg-white/5 text-white/70'
                            : 'text-white/20 cursor-not-allowed'
                        }`}
                    title="Undo"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                    </svg>
                </button>

                {/* Redo */}
                <button
                    onClick={onRedo}
                    disabled={!canRedo}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${canRedo
                            ? 'hover:bg-white/5 text-white/70'
                            : 'text-white/20 cursor-not-allowed'
                        }`}
                    title="Redo"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10h-10a8 8 0 00-8 8v2M21 10l-6 6m6-6l-6-6" />
                    </svg>
                </button>

                {/* Clear */}
                <button
                    onClick={onClear}
                    className="w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:bg-red-500/20 text-white/70 hover:text-red-400"
                    title="Clear All"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
        </div>
    );
}
