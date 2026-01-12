/**
 * Parent Messaging Types
 *
 * Defines the message flow for parent communication:
 * 1. Post-lesson: Text message (auto-generated summary)
 * 2. 3 days later: Image card (visual progress for KakaoTalk)
 * 3. Weekly: Comprehensive report image
 *
 * All messages designed for KakaoTalk sharing (no external links required)
 */

// ============================================
// MESSAGE TYPES
// ============================================

export type MessageType = 'POST_LESSON_TEXT' | 'PROGRESS_CARD' | 'WEEKLY_REPORT';

export type MessageChannel = 'KAKAO' | 'SMS' | 'EMAIL';

export type MessageStatus =
  | 'PENDING' // Scheduled but not sent
  | 'SENT' // Delivered
  | 'FAILED' // Delivery failed
  | 'CANCELLED'; // Cancelled by tutor

// ============================================
// POST-LESSON TEXT MESSAGE (수업 직후)
// ============================================

/**
 * Immediate text message after lesson
 * Auto-generated from lesson notes/recording
 */
export interface PostLessonMessage {
  id: string;
  type: 'POST_LESSON_TEXT';
  lessonId: string;
  studentId: string;
  tutorId: string;

  // Content
  content: {
    greeting: string; // "안녕하세요, 민수 어머님"
    todaysTopic: string; // "오늘은 일차방정식을 배웠습니다"
    whatWeLearned: string[]; // Key points covered
    howStudentDid: string; // Brief assessment
    nextSteps: string; // What to work on / preview
    encouragement?: string; // Optional positive note
  };

  // Metadata
  scheduledFor: string; // ISO timestamp (usually immediately)
  sentAt?: string;
  status: MessageStatus;
  channel: MessageChannel;
}

/**
 * Template for generating post-lesson messages
 */
export interface PostLessonTemplate {
  // Configurable by tutor
  includeHomework: boolean;
  includeNextLesson: boolean;
  formalityLevel: 'FORMAL' | 'CASUAL'; // 존댓말 수준
  signOff: string; // "감사합니다" or custom
}

// ============================================
// PROGRESS CARD (수업 3일 후 - 이미지)
// ============================================

/**
 * Visual progress card for KakaoTalk
 * Designed to be shared as an image (no links needed)
 */
export interface ProgressCard {
  id: string;
  type: 'PROGRESS_CARD';
  lessonId: string;
  studentId: string;
  tutorId: string;

  // Card content (rendered to image)
  content: {
    // Header
    studentName: string; // First name only for privacy
    lessonDate: string; // "12월 20일 수업"
    subject: string; // "수학"

    // Main content
    topicsCovered: {
      name: string;
      status: 'MASTERED' | 'PROGRESSING' | 'NEEDS_REVIEW';
    }[];

    // Visual progress indicator
    confidenceScore: number; // 0-100
    previousScore?: number; // For comparison

    // Highlight
    biggestWin?: string; // "연립방정식 풀이 완벽 이해!"
    focusArea?: string; // "다음 시간: 부등식"

    // Tutor branding
    tutorName: string;
    tutorContact?: string; // Optional
  };

  // Image generation
  imageUrl?: string; // Generated card image URL
  imageGeneratedAt?: string;

  // Delivery
  scheduledFor: string; // 3 days after lesson
  sentAt?: string;
  status: MessageStatus;
  channel: MessageChannel;
}

/**
 * Card design template
 */
export interface CardDesignTemplate {
  id: string;
  name: string;

  // Visual styling
  backgroundColor: string;
  accentColor: string;
  fontFamily: string;

  // Layout
  showConfidenceGraph: boolean;
  showComparisonToPrevious: boolean;
  includeQRCode: boolean; // Links to full report (optional)

  // Branding
  showTutorLogo: boolean;
  customFooterText?: string;
}

// ============================================
// WEEKLY REPORT (주간 종합 리포트 - 이미지)
// ============================================

/**
 * Comprehensive weekly progress report
 * Multiple lessons aggregated into visual summary
 */
export interface WeeklyReport {
  id: string;
  type: 'WEEKLY_REPORT';
  studentId: string;
  tutorId: string;

  // Time period
  weekStart: string; // ISO date
  weekEnd: string;
  lessonsIncluded: string[]; // Lesson IDs

  // Report content
  content: {
    // Summary stats
    totalLessons: number;
    totalHours: number;
    topicsCovered: string[];

    // Progress visualization
    weeklyProgress: {
      topic: string;
      startLevel: number; // 1-5
      endLevel: number;
      improvement: number;
    }[];

    // Highlights
    achievements: string[];
    areasForImprovement: string[];

    // Learning insights
    strongestAreas: string[];
    challengingAreas: string[];

    // Recommendations
    suggestedPractice: string[];
    upcomingTopics: string[];

    // Parent-friendly summary
    overallAssessment: string; // 2-3 sentences
  };

  // Image generation (multi-page/carousel)
  imageUrls: string[];
  imageGeneratedAt?: string;

  // Delivery
  scheduledFor: string; // Every Sunday
  sentAt?: string;
  status: MessageStatus;
  channel: MessageChannel;
}

// ============================================
// MESSAGE SCHEDULING
// ============================================

/**
 * Schedule configuration for message flow
 */
export interface MessageScheduleConfig {
  studentId: string;
  tutorId: string;

  // Post-lesson settings
  postLesson: {
    enabled: boolean;
    delayMinutes: number; // Usually 0-30 minutes after lesson
    channel: MessageChannel;
  };

  // Progress card settings
  progressCard: {
    enabled: boolean;
    delayDays: number; // Usually 3 days
    channel: MessageChannel;
    templateId: string;
  };

  // Weekly report settings
  weeklyReport: {
    enabled: boolean;
    dayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0 = Sunday
    timeOfDay: string; // "10:00" - When to send
    channel: MessageChannel;
    minLessonsRequired: number; // Don't send if fewer lessons
  };

  // Parent preferences
  parentPreferences: {
    language: 'KO' | 'EN';
    preferredChannel: MessageChannel;
    phoneNumber?: string;
    kakaoId?: string;
    email?: string;
  };
}

// ============================================
// MESSAGE GENERATION
// ============================================

/**
 * Input data for generating messages
 */
export interface LessonData {
  id: string;
  studentId: string;
  tutorId: string;

  // Lesson info
  date: string;
  durationMinutes: number;
  subject: string;

  // Content covered
  topics: {
    code: string;
    name: string;
    timeSpentMinutes: number;
  }[];

  // Assessment
  understanding: {
    topicCode: string;
    level: 1 | 2 | 3 | 4 | 5; // 1 = needs work, 5 = mastered
    notes?: string;
  }[];

  // Tutor notes
  notes?: string;
  homework?: string;
  nextLessonPreview?: string;
}

/**
 * Service interface for message generation
 */
export interface IParentMessagingService {
  // Generate messages
  generatePostLessonMessage(
    lessonData: LessonData,
    template: PostLessonTemplate
  ): Promise<PostLessonMessage>;

  generateProgressCard(
    lessonData: LessonData,
    designTemplate: CardDesignTemplate
  ): Promise<ProgressCard>;

  generateWeeklyReport(
    studentId: string,
    weekStart: string,
    weekEnd: string
  ): Promise<WeeklyReport>;

  // Scheduling
  scheduleMessages(
    lessonId: string,
    config: MessageScheduleConfig
  ): Promise<void>;

  cancelScheduledMessage(messageId: string): Promise<void>;

  // Delivery
  sendMessage(
    message: PostLessonMessage | ProgressCard | WeeklyReport
  ): Promise<{ success: boolean; error?: string }>;

  // Image generation
  generateCardImage(card: ProgressCard): Promise<string>; // Returns URL
  generateReportImages(report: WeeklyReport): Promise<string[]>;
}
