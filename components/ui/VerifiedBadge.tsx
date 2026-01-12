"use client";

import { BadgeCheck, Shield, Star, Award } from "lucide-react";

interface VerifiedBadgeProps {
    type?: "verified" | "trusted" | "featured" | "official";
    size?: "sm" | "md" | "lg";
    showLabel?: boolean;
    tooltip?: string;
}

export function VerifiedBadge({
    type = "verified",
    size = "md",
    showLabel = false,
    tooltip,
}: VerifiedBadgeProps) {
    const sizeClasses = {
        sm: "w-3.5 h-3.5",
        md: "w-4 h-4",
        lg: "w-5 h-5",
    };

    const labelSizes = {
        sm: "text-[10px]",
        md: "text-xs",
        lg: "text-sm",
    };

    const configs = {
        verified: {
            icon: BadgeCheck,
            color: "text-[#3b82f6]",
            bgColor: "bg-[#3b82f6]/10",
            label: "Verified",
        },
        trusted: {
            icon: Shield,
            color: "text-[#10b981]",
            bgColor: "bg-[#10b981]/10",
            label: "Trusted",
        },
        featured: {
            icon: Star,
            color: "text-[#f59e0b]",
            bgColor: "bg-[#f59e0b]/10",
            label: "Featured",
        },
        official: {
            icon: Award,
            color: "text-[#8b5cf6]",
            bgColor: "bg-[#8b5cf6]/10",
            label: "Official",
        },
    };

    const config = configs[type];
    const Icon = config.icon;

    if (showLabel) {
        return (
            <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full ${config.bgColor} ${config.color} ${labelSizes[size]} font-medium`}
                title={tooltip}
            >
                <Icon className={sizeClasses[size]} />
                {config.label}
            </span>
        );
    }

    return (
        <span title={tooltip || config.label} className="inline-flex">
            <Icon className={`${sizeClasses[size]} ${config.color} flex-shrink-0`} />
        </span>
    );
}

// Verification status indicator for curricula/textbooks
interface VerificationStatusProps {
    isVerified: boolean;
    verifiedAt?: string;
    usageCount?: number;
    cloneCount?: number;
    showProgress?: boolean;
}

export function VerificationStatus({
    isVerified,
    verifiedAt,
    usageCount = 0,
    cloneCount = 0,
    showProgress = false,
}: VerificationStatusProps) {
    if (isVerified) {
        return (
            <div className="flex items-center gap-2">
                <VerifiedBadge type="verified" showLabel />
                {verifiedAt && (
                    <span className="text-[10px] text-[#52525b]">
                        since {new Date(verifiedAt).toLocaleDateString()}
                    </span>
                )}
            </div>
        );
    }

    if (!showProgress) {
        return (
            <span className="text-xs text-[#52525b]">Not verified</span>
        );
    }

    // Show progress to verification
    const usageProgress = Math.min((usageCount / 10) * 100, 100);
    const cloneProgress = Math.min((cloneCount / 5) * 100, 100);
    const overallProgress = (usageProgress + cloneProgress) / 2;

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
                <span className="text-[#71717a]">Verification Progress</span>
                <span className="text-[#52525b]">{Math.round(overallProgress)}%</span>
            </div>
            <div className="h-1.5 bg-[#27272a] rounded-full overflow-hidden">
                <div
                    className="h-full bg-[#3b82f6] rounded-full transition-all duration-500"
                    style={{ width: `${overallProgress}%` }}
                />
            </div>
            <div className="flex items-center justify-between text-[10px] text-[#52525b]">
                <span>{usageCount}/10 uses</span>
                <span>{cloneCount}/5 clones</span>
            </div>
        </div>
    );
}

// Simple verified text with icon
interface VerifiedTextProps {
    children: React.ReactNode;
    isVerified?: boolean;
    type?: "verified" | "trusted" | "featured" | "official";
    className?: string;
}

export function VerifiedText({
    children,
    isVerified = true,
    type = "verified",
    className = "",
}: VerifiedTextProps) {
    return (
        <span className={`inline-flex items-center gap-1.5 ${className}`}>
            {children}
            {isVerified && <VerifiedBadge type={type} size="sm" />}
        </span>
    );
}
