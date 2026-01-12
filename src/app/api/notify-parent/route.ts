import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const { studentId, parentContact, message } = await request.json();

    if (!studentId || !parentContact || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Get authenticated user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get student info
    const { data: student } = await supabase
      .from('students')
      .select('name, tutor_id')
      .eq('id', studentId)
      .single();

    if (!student || student.tutor_id !== user.id) {
      return NextResponse.json(
        { error: 'Student not found or unauthorized' },
        { status: 404 }
      );
    }

    // Get tutor profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('name')
      .eq('id', user.id)
      .single();

    const tutorName = profile?.name || '선생님';

    // Format notification message
    const formattedMessage = `[Chalk] ${tutorName} 선생님으로부터 ${student.name} 학생에 대한 알림입니다.\n\n${message}`;

    // Store notification in database (for history)
    await supabase
      .from('parent_notifications')
      .insert({
        student_id: studentId,
        tutor_id: user.id,
        parent_contact: parentContact,
        message: formattedMessage,
        status: 'pending',
      });

    // Here you would integrate with actual SMS/KakaoTalk API
    // For now, we'll simulate sending
    // Examples:
    // - Korea: NHN Cloud Alimtalk, Cafe24 SMS API
    // - International: Twilio SMS API

    // Mock SMS sending (replace with actual implementation)
    const sendResult = await sendNotification(parentContact, formattedMessage);

    if (sendResult.success) {
      // Update notification status
      await supabase
        .from('parent_notifications')
        .update({ status: 'sent', sent_at: new Date().toISOString() })
        .eq('student_id', studentId)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(1);

      return NextResponse.json({
        success: true,
        message: 'Notification sent successfully',
      });
    } else {
      return NextResponse.json(
        { error: 'Failed to send notification' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Notify parent error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Mock notification sender - replace with actual SMS/KakaoTalk API
async function sendNotification(
  contact: string,
  message: string
): Promise<{ success: boolean }> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Log for debugging (in production, actually send SMS)
  console.log('Sending notification to:', contact);
  console.log('Message:', message);

  // Check if it looks like a valid Korean phone number
  const isValidPhone = /^01[0-9]-?[0-9]{3,4}-?[0-9]{4}$/.test(contact.replace(/-/g, ''));

  if (!isValidPhone) {
    console.warn('Invalid phone number format:', contact);
    // Still return success for now (mock mode)
  }

  // In production, integrate with:
  // - NHN Cloud Alimtalk (카카오 알림톡)
  // - Cafe24 SMS API
  // - Twilio for international

  return { success: true };
}

// GET: Retrieve notification history
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');

    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    let query = supabase
      .from('parent_notifications')
      .select('*')
      .eq('tutor_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50);

    if (studentId) {
      query = query.eq('student_id', studentId);
    }

    const { data: notifications, error } = await query;

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch notifications' },
        { status: 500 }
      );
    }

    return NextResponse.json({ notifications });
  } catch (error) {
    console.error('Get notifications error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
