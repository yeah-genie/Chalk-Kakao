import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    })

    // Wrap entire middleware in try-catch to prevent 500 errors
    try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

        // Skip middleware if Supabase is not configured or URL is invalid
        if (!supabaseUrl || !supabaseKey) {
            console.warn('Supabase not configured, skipping auth middleware')
            return response
        }

        // Validate URL format before creating client
        try {
            new URL(supabaseUrl)
        } catch {
            console.warn('Invalid Supabase URL, skipping auth middleware')
            return response
        }

        const supabase = createServerClient(
            supabaseUrl,
            supabaseKey,
            {
                cookies: {
                    get(name: string) {
                        return request.cookies.get(name)?.value
                    },
                    set(name: string, value: string, options: CookieOptions) {
                        request.cookies.set({
                            name,
                            value,
                            ...options,
                        })
                        response = NextResponse.next({
                            request: {
                                headers: request.headers,
                            },
                        })
                        response.cookies.set({
                            name,
                            value,
                            ...options,
                        })
                    },
                    remove(name: string, options: CookieOptions) {
                        request.cookies.set({
                            name,
                            value: '',
                            ...options,
                        })
                        response = NextResponse.next({
                            request: {
                                headers: request.headers,
                            },
                        })
                        response.cookies.set({
                            name,
                            value: '',
                            ...options,
                        })
                    },
                },
            }
        )

        // Refresh session if needed
        const { data: { user } } = await supabase.auth.getUser()

        // Auth Redirect Logic
        // Protect /dashboard routes
        if (!user && request.nextUrl.pathname.startsWith('/dashboard')) {
            return NextResponse.redirect(new URL('/login', request.url))
        }

        // Redirect logged-in users away from /login or /signup
        if (user && (request.nextUrl.pathname.startsWith('/login') || request.nextUrl.pathname.startsWith('/signup'))) {
            return NextResponse.redirect(new URL('/dashboard', request.url))
        }

        return response
    } catch (error) {
        // If any error occurs, just continue without auth check
        console.error('Middleware error:', error)
        return response
    }
}

export const config = {
    matcher: ['/dashboard/:path*', '/login', '/signup'],
}
