/**
 * Chalk Design System - Design Tokens
 *
 * Single source of truth for all design values.
 * Used by both web (Tailwind) and mobile (React Native).
 */

// ===========================================
// COLORS
// ===========================================

export const colors = {
  // Brand - Emerald represents "growth" in education
  brand: {
    primary: '#10B981',      // Main accent
    primaryLight: '#34D399', // Hover states
    primaryDark: '#059669',  // Active states
    primaryMuted: 'rgba(16, 185, 129, 0.15)', // Backgrounds
    primaryGlow: 'rgba(16, 185, 129, 0.25)',  // Glow effects
  },

  // Background hierarchy (dark theme)
  background: {
    base: '#09090B',        // Page background
    elevated: '#111113',    // Slightly raised surfaces
    surface: '#18181B',     // Cards, inputs
    hover: '#1F1F23',       // Hover states
    overlay: 'rgba(0, 0, 0, 0.5)', // Modal overlays
  },

  // Text hierarchy
  text: {
    primary: '#FAFAFA',     // Main text - high contrast
    secondary: '#A1A1AA',   // Secondary text
    muted: '#71717A',       // Least important (WCAG compliant)
    inverse: '#09090B',     // Text on light backgrounds
  },

  // Border colors
  border: {
    default: 'rgba(255, 255, 255, 0.06)',
    hover: 'rgba(255, 255, 255, 0.12)',
    focus: 'rgba(16, 185, 129, 0.5)',
    subtle: 'rgba(255, 255, 255, 0.04)',
  },

  // Status colors
  status: {
    success: '#22C55E',
    successMuted: 'rgba(34, 197, 94, 0.15)',
    warning: '#F59E0B',
    warningMuted: 'rgba(245, 158, 11, 0.15)',
    error: '#EF4444',
    errorMuted: 'rgba(239, 68, 68, 0.15)',
    info: '#3B82F6',
    infoMuted: 'rgba(59, 130, 246, 0.15)',
  },

  // Level indicators (for student progress)
  level: {
    high: '#34D399',        // Emerald - mastery
    mid: '#60A5FA',         // Blue - progress
    low: '#FBBF24',         // Amber - needs work
  },
} as const;

// ===========================================
// TYPOGRAPHY
// ===========================================

export const typography = {
  // Font family
  fontFamily: {
    sans: 'Inter, -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
    mono: 'JetBrains Mono, Menlo, Monaco, monospace',
  },

  // Font sizes with line heights
  fontSize: {
    xs: ['12px', { lineHeight: '16px', letterSpacing: '0' }],
    sm: ['13px', { lineHeight: '20px', letterSpacing: '0' }],
    base: ['15px', { lineHeight: '24px', letterSpacing: '0' }],
    lg: ['18px', { lineHeight: '28px', letterSpacing: '-0.01em' }],
    xl: ['24px', { lineHeight: '32px', letterSpacing: '-0.02em' }],
    '2xl': ['32px', { lineHeight: '40px', letterSpacing: '-0.02em' }],
    '3xl': ['40px', { lineHeight: '48px', letterSpacing: '-0.02em' }],
    '4xl': ['48px', { lineHeight: '56px', letterSpacing: '-0.03em' }],
  },

  // Font weights
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
} as const;

// ===========================================
// SPACING (4px base unit)
// ===========================================

export const spacing = {
  0: '0px',
  0.5: '2px',
  1: '4px',
  1.5: '6px',
  2: '8px',
  2.5: '10px',
  3: '12px',
  4: '16px',
  5: '20px',
  6: '24px',
  8: '32px',
  10: '40px',
  12: '48px',
  16: '64px',
  20: '80px',
  24: '96px',
} as const;

// ===========================================
// BORDER RADIUS
// ===========================================

export const radius = {
  none: '0px',
  sm: '6px',      // Small elements (badges, tags)
  md: '10px',     // Medium elements (buttons, inputs)
  lg: '16px',     // Large elements (cards)
  xl: '24px',     // Extra large (modals, sheets)
  full: '9999px', // Circular (avatars, pills)
} as const;

// ===========================================
// SHADOWS
// ===========================================

export const shadows = {
  sm: '0 1px 2px rgba(0, 0, 0, 0.1)',
  md: '0 4px 8px rgba(0, 0, 0, 0.15)',
  lg: '0 8px 16px rgba(0, 0, 0, 0.2)',
  xl: '0 16px 32px rgba(0, 0, 0, 0.25)',
  glow: '0 0 20px rgba(16, 185, 129, 0.25)',
  glowLg: '0 0 40px rgba(16, 185, 129, 0.3)',
} as const;

// ===========================================
// TRANSITIONS
// ===========================================

export const transitions = {
  fast: '150ms ease',
  normal: '200ms ease',
  slow: '300ms ease',
  spring: '300ms cubic-bezier(0.34, 1.56, 0.64, 1)',
} as const;

// ===========================================
// Z-INDEX
// ===========================================

export const zIndex = {
  base: 0,
  dropdown: 10,
  sticky: 20,
  fixed: 30,
  modal: 40,
  popover: 50,
  tooltip: 60,
} as const;

// ===========================================
// BREAKPOINTS
// ===========================================

export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
} as const;

// ===========================================
// COMPONENT SIZES
// ===========================================

export const componentSizes = {
  button: {
    sm: { height: '32px', padding: '0 12px', fontSize: '13px' },
    md: { height: '40px', padding: '0 16px', fontSize: '14px' },
    lg: { height: '48px', padding: '0 24px', fontSize: '15px' },
  },
  input: {
    sm: { height: '32px', padding: '0 10px', fontSize: '13px' },
    md: { height: '40px', padding: '0 14px', fontSize: '14px' },
    lg: { height: '48px', padding: '0 16px', fontSize: '15px' },
  },
  avatar: {
    xs: '24px',
    sm: '32px',
    md: '40px',
    lg: '48px',
    xl: '64px',
  },
} as const;

// ===========================================
// EXPORTS FOR DIFFERENT CONTEXTS
// ===========================================

// For CSS custom properties
export const cssVariables = {
  // Colors
  '--color-brand': colors.brand.primary,
  '--color-brand-light': colors.brand.primaryLight,
  '--color-brand-dark': colors.brand.primaryDark,
  '--color-brand-muted': colors.brand.primaryMuted,
  '--color-brand-glow': colors.brand.primaryGlow,

  '--color-bg-base': colors.background.base,
  '--color-bg-elevated': colors.background.elevated,
  '--color-bg-surface': colors.background.surface,
  '--color-bg-hover': colors.background.hover,

  '--color-text-primary': colors.text.primary,
  '--color-text-secondary': colors.text.secondary,
  '--color-text-muted': colors.text.muted,

  '--color-border': colors.border.default,
  '--color-border-hover': colors.border.hover,
  '--color-border-focus': colors.border.focus,

  // Radius
  '--radius-sm': radius.sm,
  '--radius-md': radius.md,
  '--radius-lg': radius.lg,
  '--radius-xl': radius.xl,
  '--radius-full': radius.full,

  // Shadows
  '--shadow-sm': shadows.sm,
  '--shadow-md': shadows.md,
  '--shadow-lg': shadows.lg,
  '--shadow-glow': shadows.glow,
} as const;

// Type exports
export type Colors = typeof colors;
export type Typography = typeof typography;
export type Spacing = typeof spacing;
export type Radius = typeof radius;
