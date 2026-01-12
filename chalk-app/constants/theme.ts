// Chalk Theme - ESIP Dark Mode
// #09090b base, #3B82F6 blue accent, #18181b card

export const colors = {
    // Backgrounds
    bg: {
        base: '#09090b',
        card: '#18181b',
        elevated: '#1f1f23',
        input: '#09090b',
    },
    // Text
    text: {
        primary: '#fafafa',
        secondary: '#a1a1aa',
        muted: '#71717a',
    },
    // Accent - Blue
    accent: {
        primary: '#3B82F6',
        secondary: '#60A5FA',
        muted: 'rgba(59, 130, 246, 0.15)',
        glow: 'rgba(59, 130, 246, 0.3)',
    },
    // Borders
    border: {
        default: '#27272a',
        subtle: 'rgba(255, 255, 255, 0.05)',
    },
    // Status
    status: {
        success: '#22c55e',
        warning: '#f59e0b',
        error: '#ef4444',
        live: '#ef4444',
    },
};

export const typography = {
    h1: {
        fontSize: 28,
        fontWeight: '800' as const,
        letterSpacing: -0.5,
        color: colors.text.primary,
    },
    h2: {
        fontSize: 22,
        fontWeight: '700' as const,
        color: colors.text.primary,
    },
    h3: {
        fontSize: 18,
        fontWeight: '600' as const,
        color: colors.text.primary,
    },
    body: {
        fontSize: 15,
        color: colors.text.secondary,
    },
    caption: {
        fontSize: 13,
        color: colors.text.muted,
    },
    label: {
        fontSize: 10,
        fontWeight: '900' as const,
        textTransform: 'uppercase' as const,
        letterSpacing: 1.5,
        color: colors.text.muted,
    },
};

export const spacing = {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    xxl: 32,
};

export const radius = {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    xxl: 32,
    full: 999,
};
