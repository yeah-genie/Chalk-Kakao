'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';

interface HeroProductPreviewProps {
    imageSrc: string;
}

export function HeroProductPreview({ imageSrc }: HeroProductPreviewProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [rotateX, setRotateX] = useState(0);
    const [rotateY, setRotateY] = useState(0);
    const [isHovering, setIsHovering] = useState(false);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const handleMouseMove = (e: MouseEvent) => {
            const rect = container.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;

            // Calculate rotation based on mouse position relative to center
            const maxRotation = 8;
            const rotateYValue = ((e.clientX - centerX) / (rect.width / 2)) * maxRotation;
            const rotateXValue = -((e.clientY - centerY) / (rect.height / 2)) * maxRotation;

            setRotateX(rotateXValue);
            setRotateY(rotateYValue);
        };

        const handleMouseLeave = () => {
            setRotateX(0);
            setRotateY(0);
            setIsHovering(false);
        };

        const handleMouseEnter = () => {
            setIsHovering(true);
        };

        container.addEventListener('mousemove', handleMouseMove);
        container.addEventListener('mouseleave', handleMouseLeave);
        container.addEventListener('mouseenter', handleMouseEnter);

        return () => {
            container.removeEventListener('mousemove', handleMouseMove);
            container.removeEventListener('mouseleave', handleMouseLeave);
            container.removeEventListener('mouseenter', handleMouseEnter);
        };
    }, []);

    return (
        <div
            ref={containerRef}
            className="relative w-full max-w-5xl mx-auto z-10 px-4"
            style={{ perspective: '1000px' }}
        >
            {/* Animated Glow Background */}
            <div
                className={`absolute inset-0 bg-gradient-to-r from-[#10b981]/30 via-emerald-500/20 to-[#10b981]/30 blur-[100px] rounded-full transition-all duration-700 ${isHovering ? 'scale-110 opacity-100' : 'scale-90 opacity-60'
                    }`}
                style={{
                    animation: 'pulse-glow 4s ease-in-out infinite',
                }}
            />

            {/* 3D Floating Card */}
            <div
                className="relative transition-transform duration-200 ease-out"
                style={{
                    transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(0)`,
                    transformStyle: 'preserve-3d',
                }}
            >
                {/* Outer Glow Ring */}
                <div className={`absolute -inset-1 bg-gradient-to-r from-[#10b981]/50 via-emerald-400/30 to-[#10b981]/50 rounded-[2rem] blur-sm transition-opacity duration-500 ${isHovering ? 'opacity-100' : 'opacity-0'
                    }`} />

                {/* Main Card */}
                <div className="relative rounded-3xl border border-white/[0.15] bg-[#0a0a0c]/80 backdrop-blur-xl overflow-hidden shadow-2xl shadow-black/50">
                    {/* Browser Chrome */}
                    <div className="h-12 border-b border-white/[0.08] bg-gradient-to-b from-white/[0.05] to-transparent flex items-center px-4 gap-2">
                        <div className="flex gap-1.5">
                            <div className="w-3 h-3 rounded-full bg-[#ff5f57] opacity-80" />
                            <div className="w-3 h-3 rounded-full bg-[#febc2e] opacity-80" />
                            <div className="w-3 h-3 rounded-full bg-[#28c840] opacity-80" />
                        </div>
                        <div className="flex-1 flex justify-center">
                            <div className="px-4 py-1 bg-white/[0.05] rounded-md text-[10px] text-white/40 font-mono">
                                chalk-web.vercel.app
                            </div>
                        </div>
                        <div className="text-[10px] text-white/30 font-mono uppercase tracking-widest">
                            Live Preview
                        </div>
                    </div>

                    {/* Product Screenshot */}
                    <div className="p-3 md:p-5">
                        <div className="relative overflow-hidden rounded-xl">
                            <Image
                                src={imageSrc}
                                alt="Chalk Dashboard"
                                width={1200}
                                height={675}
                                className={`w-full h-auto transition-all duration-700 ${isHovering ? 'brightness-100 scale-[1.02]' : 'brightness-[0.85] scale-100'
                                    }`}
                                priority
                            />

                            {/* Shimmer Effect on Hover */}
                            <div
                                className={`absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-1000 ${isHovering ? 'translate-x-full' : '-translate-x-full'
                                    }`}
                            />
                        </div>
                    </div>
                </div>

                {/* Floating Shadow */}
                <div
                    className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-[80%] h-12 bg-[#10b981]/20 blur-2xl rounded-full transition-all duration-300"
                    style={{
                        transform: `translateX(-50%) translateY(${isHovering ? '5px' : '0'})`,
                        opacity: isHovering ? 0.8 : 0.4,
                    }}
                />
            </div>
        </div>
    );
}
