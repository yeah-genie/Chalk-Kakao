import { createBrowserClient } from "@supabase/ssr";

// ===================================
// SUPABASE CLIENT (Browser)
// ===================================

// Valid placeholder values for build time (same as server.ts)
const PLACEHOLDER_URL = 'https://placeholder.supabase.co';
const PLACEHOLDER_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsYWNlaG9sZGVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE2MjMxNjgwMDAsImV4cCI6MTk1MDQxNjAwMH0.placeholder';

// Helper to get env vars at runtime (not build time)
function getSupabaseConfig() {
    let url = (process.env.NEXT_PUBLIC_SUPABASE_URL || "").trim();
    let key = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "").trim();

    // Strict validation: must start with http and look like a URL
    const isValidUrl = url.startsWith('http') && url.includes('.');
    const isValidKey = key.length > 20;

    if (!isValidUrl || url === "undefined" || url === "null") url = "";
    if (!isValidKey || key === "undefined" || key === "null") key = "";

    return {
        url: url || PLACEHOLDER_URL,
        key: key || PLACEHOLDER_KEY,
        isConfigured: !!(url && key)
    };
}

// Demo mode when using placeholder
export function isDemoMode(): boolean {
    const config = getSupabaseConfig();
    return !config.isConfigured;
}

// Main client creator for browser-side
export function createBrowserSupabaseClient() {
    const config = getSupabaseConfig();

    if (!config.isConfigured && typeof window !== 'undefined') {
        console.warn('[Supabase Client] Running with placeholder configuration. API calls will fail.');
    }

    return createBrowserClient(config.url, config.key);
}

export function createClient() {
    return createBrowserSupabaseClient();
}

// Singleton client for client components
let browserClient: ReturnType<typeof createBrowserClient> | null = null;

export function getSupabaseClient() {
    if (!browserClient) {
        browserClient = createClient();
    }
    return browserClient;
}
