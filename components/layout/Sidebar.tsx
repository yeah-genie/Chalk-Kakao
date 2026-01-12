'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, Settings, Sparkles } from 'lucide-react';

export default function Sidebar() {
    const pathname = usePathname();

    const navItems = [
        { name: 'Home', href: '/dashboard', icon: LayoutDashboard },
        { name: 'Students', href: '/dashboard/students', icon: Users },
        { name: 'Settings', href: '/dashboard/settings', icon: Settings },
    ];

    return (
        <>
            {/* Desktop Sidebar - Full width (lg+) */}
            <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-64 bg-[#09090b] border-r border-white/[0.05] p-6 flex-col z-50">
                {/* Logo */}
                <div className="flex items-center gap-3 mb-10 px-2">
                    <div className="w-8 h-8 rounded-lg bg-[#10b981] flex items-center justify-center">
                        <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-bold text-lg tracking-tight">Chalk</span>
                </div>

                {/* Navigation */}
                <nav className="space-y-2 flex-1">
                    <div className="text-[10px] font-black uppercase tracking-[0.2em] text-[#52525b] mb-4 ml-2">Main Menu</div>
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${isActive
                                    ? 'bg-white/[0.03] text-white border border-white/[0.05] shadow-[0_4px_12px_rgba(0,0,0,0.5)]'
                                    : 'text-[#71717a] hover:text-white hover:bg-white/[0.02]'
                                    }`}
                            >
                                <Icon size={18} className={isActive ? 'text-[#10b981]' : 'group-hover:text-white transition-colors'} />
                                <span className="text-sm font-medium tracking-tight">{item.name}</span>
                                {isActive && (
                                    <div className="ml-auto w-1 h-4 bg-[#10b981] rounded-full" />
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* AI Trust Badge (Bottom) */}
                <div className="mt-auto p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05] space-y-3">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-[#10b981] rounded-full animate-pulse" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-[#10b981]">AI Scribe Active</span>
                    </div>
                    <p className="text-[10px] text-[#71717a] leading-relaxed">
                        Local processing active. Your audio is purged after analysis.
                    </p>
                </div>
            </aside>

            {/* Tablet Sidebar - Icon only (md to lg) */}
            <aside className="hidden md:flex lg:hidden fixed left-0 top-0 bottom-0 w-20 bg-[#09090b] border-r border-white/[0.05] py-6 flex-col items-center z-50">
                {/* Logo */}
                <div className="mb-10">
                    <div className="w-10 h-10 rounded-xl bg-[#10b981] flex items-center justify-center">
                        <Sparkles className="w-6 h-6 text-white" />
                    </div>
                </div>

                {/* Navigation */}
                <nav className="space-y-3 flex-1 flex flex-col items-center">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`relative flex items-center justify-center w-12 h-12 rounded-xl transition-all duration-200 group ${isActive
                                    ? 'bg-[#10b981]/10 text-[#10b981]'
                                    : 'text-[#71717a] hover:text-white hover:bg-white/[0.05]'
                                    }`}
                                title={item.name}
                            >
                                <Icon size={22} />
                                {isActive && (
                                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-[#10b981] rounded-l-full" />
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* AI Status Indicator */}
                <div className="mt-auto">
                    <div className="w-10 h-10 rounded-xl bg-white/[0.02] border border-white/[0.05] flex items-center justify-center">
                        <div className="w-2.5 h-2.5 bg-[#10b981] rounded-full animate-pulse" />
                    </div>
                </div>
            </aside>
        </>
    );
}
