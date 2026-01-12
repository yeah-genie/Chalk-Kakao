/**
 * API Route: /api/feedback
 * Stores user feedback in Vercel KV (Redis)
 */

import { NextResponse } from 'next/server';
import { kv } from '@vercel/kv';

interface FeedbackData {
    options: string[];
    comment: string;
    problemId?: string;
    examType?: string;
    timestamp: string;
    userAgent: string;
}

export async function POST(request: Request) {
    try {
        const data: FeedbackData = await request.json();

        // Generate unique ID
        const feedbackId = `feedback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        // Store in Vercel KV
        await kv.hset(feedbackId, {
            ...data,
            id: feedbackId,
        });

        // Add to feedback list for easy retrieval
        await kv.lpush('feedback_list', feedbackId);

        return NextResponse.json({ success: true, id: feedbackId });
    } catch (error) {
        console.error('Feedback storage error:', error);

        // Fallback: log to console if KV not configured
        console.log('FEEDBACK RECEIVED:', await request.clone().json());

        return NextResponse.json({ success: true, fallback: true });
    }
}

// GET: Retrieve all feedback (for admin view)
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const secret = searchParams.get('secret');

    // Simple auth with secret key
    if (secret !== process.env.FEEDBACK_SECRET) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        // Get all feedback IDs
        const feedbackIds = await kv.lrange('feedback_list', 0, 100);

        // Fetch all feedback data
        const feedbackItems = await Promise.all(
            feedbackIds.map(async (id) => {
                const data = await kv.hgetall(id as string);
                return data;
            })
        );

        return NextResponse.json({ feedback: feedbackItems.filter(Boolean) });
    } catch (error) {
        console.error('Feedback retrieval error:', error);
        return NextResponse.json({ error: 'Failed to retrieve feedback' }, { status: 500 });
    }
}
