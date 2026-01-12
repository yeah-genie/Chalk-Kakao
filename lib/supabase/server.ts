import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

// ===================================
// SUPABASE CLIENT (Server)
// For Server Components & Route Handlers
// ===================================

const PLACEHOLDER_URL = 'https://placeholder.supabase.co';
const PLACEHOLDER_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsYWNlaG9sZGVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE2MjMxNjgwMDAsImV4cCI6MTk1MDQxNjAwMH0.placeholder';

// Helper for robust URL validation
function getSafeSupabaseConfig() {
    let url = (process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "").trim();
    let key = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || "").trim();

    // Strict validation: must start with http and look like a URL
    const isValidUrl = url.startsWith('http') && url.includes('.');
    const isValidKey = key.length > 20; // Supabase keys are long

    if (!isValidUrl || url === "undefined" || url === "null") url = "";
    if (!isValidKey || key === "undefined" || key === "null") key = "";

    return {
        url: url || PLACEHOLDER_URL,
        key: key || PLACEHOLDER_KEY,
        isConfigured: !!(url && key)
    };
}

export async function createServerSupabaseClient() {
    const cookieStore = await cookies();
    const { url, key, isConfigured } = getSafeSupabaseConfig();

    if (!isConfigured && process.env.NODE_ENV === 'production') {
        console.error("[Supabase Server] No valid configuration found. Using placeholders.");
    }

    return createServerClient(
        url,
        key,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll();
                },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) => {
                            cookieStore.set(name, value, options);
                        });
                    } catch {
                        // Server Component에서는 쿠키 설정 불가
                    }
                },
            },
        }
    );
}

// ===================================
// SUPABASE ADMIN CLIENT (Server)
// Bypasses RLS - Use with caution!
// ===================================

export function createAdminSupabaseClient() {
    const { url } = getSafeSupabaseConfig();
    const serviceKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim();

    // If no service key, fallback to anon key but keep valid URL
    if (!serviceKey || serviceKey === "undefined" || serviceKey === "null") {
        console.warn("[Admin Client] No service key, falling back to anon access");
        const { key: anonKey } = getSafeSupabaseConfig();
        return createClient(url, anonKey);
    }

    return createClient(url, serviceKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    });
}
