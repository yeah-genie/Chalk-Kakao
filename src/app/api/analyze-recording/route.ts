import { NextResponse } from 'next/server';
import { autoAnalysisService } from '@/services/analysis';
import { studentAnalyticsService } from '@/services/analytics/StudentAnalyticsService';
import { createClient } from '@/lib/supabase/server';

// POST: Start analysis
export async function POST(request: Request) {
  try {
    const { recordingId } = await request.json();

    if (!recordingId) {
      return NextResponse.json(
        { error: 'Recording ID is required' },
        { status: 400 }
      );
    }

    // Start analysis
    const analysis = await autoAnalysisService.analyzeRecording(recordingId);

    if (!analysis) {
      return NextResponse.json(
        { error: 'Analysis failed' },
        { status: 500 }
      );
    }

    // Auto-trigger StudentAnalytics update if student is linked
    const supabase = await createClient();
    const { data: recording } = await supabase
      .from('recordings')
      .select('student_id')
      .eq('id', recordingId)
      .single();

    if (recording?.student_id) {
      // Update analytics in background
      studentAnalyticsService.updateStudentAnalytics(recording.student_id).catch(console.error);
    }

    return NextResponse.json({
      success: true,
      analysis,
    });
  } catch (error) {
    console.error('Analysis API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET: Check analysis status
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const recordingId = searchParams.get('recordingId');

    if (!recordingId) {
      return NextResponse.json(
        { error: 'Recording ID is required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Check recording status
    const { data: recording } = await supabase
      .from('recordings')
      .select('id, status, student_id')
      .eq('id', recordingId)
      .single();

    if (!recording) {
      return NextResponse.json(
        { error: 'Recording not found' },
        { status: 404 }
      );
    }

    // Check if analysis exists
    const { data: analysis } = await supabase
      .from('recording_analyses')
      .select('id, understanding_score, engagement_score, summary')
      .eq('recording_id', recordingId)
      .single();

    // Check if log was created
    const { data: log } = await supabase
      .from('logs')
      .select('id')
      .eq('recording_id', recordingId)
      .single();

    const status = analysis && log ? 'completed' : recording.status;

    return NextResponse.json({
      status,
      hasAnalysis: !!analysis,
      hasLog: !!log,
      analysis: analysis ? {
        understandingScore: analysis.understanding_score,
        engagementScore: analysis.engagement_score,
        summary: analysis.summary,
      } : null,
    });
  } catch (error) {
    console.error('Analysis status check error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
