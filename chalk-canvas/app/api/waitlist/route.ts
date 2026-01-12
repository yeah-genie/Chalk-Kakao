import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
    try {
        const { email } = await request.json();

        if (!email) {
            return NextResponse.json(
                { error: 'Email is required' },
                { status: 400 }
            );
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json(
                { error: 'Invalid email format' },
                { status: 400 }
            );
        }

        // Check if Supabase is configured
        if (!supabase) {
            // Log to console for debugging
            console.log('New waitlist signup:', email);

            // Return success even without Supabase (for demo purposes)
            return NextResponse.json({
                success: true,
                message: 'Email registered (demo mode)'
            });
        }

        // Insert email into waitlist table
        const { error } = await supabase
            .from('waitlist')
            .insert([{
                email,
                created_at: new Date().toISOString()
            }]);

        if (error) {
            // Check for duplicate email
            if (error.code === '23505') {
                return NextResponse.json(
                    { error: 'Email already registered' },
                    { status: 409 }
                );
            }
            throw error;
        }

        return NextResponse.json({
            success: true,
            message: 'Successfully added to waitlist'
        });

    } catch (error) {
        console.error('Waitlist signup error:', error);
        return NextResponse.json(
            { error: 'Failed to add to waitlist' },
            { status: 500 }
        );
    }
}
