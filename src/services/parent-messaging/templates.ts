/**
 * Parent Message Templates (Korean)
 *
 * Pre-built templates for different message types.
 * Tutor can customize or use as-is.
 */

import type { PostLessonTemplate, CardDesignTemplate } from './types';

// ============================================
// POST-LESSON TEXT TEMPLATES
// ============================================

export const POST_LESSON_TEMPLATES: Record<string, PostLessonTemplate> = {
  formal: {
    includeHomework: true,
    includeNextLesson: true,
    formalityLevel: 'FORMAL',
    signOff: '감사합니다.',
  },
  casual: {
    includeHomework: true,
    includeNextLesson: true,
    formalityLevel: 'CASUAL',
    signOff: '다음 수업에서 뵙겠습니다 :)',
  },
  minimal: {
    includeHomework: false,
    includeNextLesson: false,
    formalityLevel: 'FORMAL',
    signOff: '감사합니다.',
  },
};

// ============================================
// TEXT MESSAGE GENERATION
// ============================================

interface MessageGenerationContext {
  studentName: string;
  parentTitle: string; // "어머님", "아버님", "학부모님"
  tutorName: string;
  lessonDate: string;
  subject: string;
  topics: string[];
  understanding: 'excellent' | 'good' | 'needsWork';
  specificFeedback: string;
  homework?: string;
  nextTopic?: string;
}

/**
 * Generate post-lesson text message
 */
export function generatePostLessonText(
  ctx: MessageGenerationContext,
  template: PostLessonTemplate
): string {
  const lines: string[] = [];

  // Greeting
  if (template.formalityLevel === 'FORMAL') {
    lines.push(`안녕하세요, ${ctx.studentName} ${ctx.parentTitle}.`);
    lines.push(`${ctx.tutorName} 선생님입니다.`);
  } else {
    lines.push(`${ctx.studentName} ${ctx.parentTitle}, 안녕하세요!`);
    lines.push(`${ctx.tutorName}입니다.`);
  }

  lines.push('');

  // Today's topic
  const topicList = ctx.topics.join(', ');
  lines.push(`📚 오늘 ${ctx.subject} 수업에서는 ${topicList}을(를) 다루었습니다.`);

  lines.push('');

  // How student did
  const assessmentText = getAssessmentText(ctx.understanding, ctx.studentName, template.formalityLevel);
  lines.push(assessmentText);

  // Specific feedback
  if (ctx.specificFeedback) {
    lines.push('');
    lines.push(ctx.specificFeedback);
  }

  // Homework
  if (template.includeHomework && ctx.homework) {
    lines.push('');
    lines.push(`📝 과제: ${ctx.homework}`);
  }

  // Next lesson preview
  if (template.includeNextLesson && ctx.nextTopic) {
    lines.push('');
    lines.push(`다음 시간에는 ${ctx.nextTopic}을(를) 배울 예정입니다.`);
  }

  // Sign off
  lines.push('');
  lines.push(template.signOff);
  lines.push(ctx.tutorName);

  return lines.join('\n');
}

function getAssessmentText(
  understanding: 'excellent' | 'good' | 'needsWork',
  studentName: string,
  formality: 'FORMAL' | 'CASUAL'
): string {
  const templates = {
    excellent: {
      FORMAL: [
        `${studentName} 학생이 오늘 내용을 매우 잘 이해했습니다.`,
        `${studentName} 학생의 집중력이 인상적이었습니다.`,
        `오늘 수업에서 ${studentName} 학생이 뛰어난 이해도를 보여주었습니다.`,
      ],
      CASUAL: [
        `${studentName}이(가) 오늘 정말 잘했어요! 👏`,
        `오늘 ${studentName}이(가) 완벽하게 이해했어요.`,
        `${studentName}이(가) 빠르게 개념을 습득했습니다.`,
      ],
    },
    good: {
      FORMAL: [
        `${studentName} 학생이 전반적으로 잘 따라왔습니다.`,
        `오늘 배운 내용을 대체로 잘 이해한 것 같습니다.`,
        `${studentName} 학생이 꾸준히 발전하고 있습니다.`,
      ],
      CASUAL: [
        `${studentName}이(가) 열심히 했어요.`,
        `오늘 수업 잘 따라왔습니다.`,
        `조금만 더 연습하면 완벽해질 거예요.`,
      ],
    },
    needsWork: {
      FORMAL: [
        `오늘 배운 내용 중 일부는 추가 연습이 필요합니다.`,
        `${studentName} 학생이 기초 개념을 다시 한번 복습하면 좋겠습니다.`,
        `조금 어려워했지만, 다음 시간에 보충할 예정입니다.`,
      ],
      CASUAL: [
        `오늘 조금 어려워했지만 괜찮아요. 복습하면 금방 이해할 거예요.`,
        `아직 익숙하지 않은 부분이 있어서 다음에 다시 다룰게요.`,
        `${studentName}이(가) 조금 헷갈려했는데, 연습하면 분명 잘할 수 있어요.`,
      ],
    },
  };

  const options = templates[understanding][formality];
  return options[Math.floor(Math.random() * options.length)];
}

// ============================================
// PROGRESS CARD DESIGN TEMPLATES
// ============================================

export const CARD_DESIGN_TEMPLATES: Record<string, CardDesignTemplate> = {
  default: {
    id: 'default',
    name: '기본',
    backgroundColor: '#1A1A1A',
    accentColor: '#10B981',
    fontFamily: 'Pretendard',
    showConfidenceGraph: true,
    showComparisonToPrevious: true,
    includeQRCode: false,
    showTutorLogo: false,
  },
  bright: {
    id: 'bright',
    name: '밝은',
    backgroundColor: '#FFFFFF',
    accentColor: '#3B82F6',
    fontFamily: 'Pretendard',
    showConfidenceGraph: true,
    showComparisonToPrevious: true,
    includeQRCode: false,
    showTutorLogo: false,
  },
  minimal: {
    id: 'minimal',
    name: '미니멀',
    backgroundColor: '#F5F5F5',
    accentColor: '#6366F1',
    fontFamily: 'Pretendard',
    showConfidenceGraph: false,
    showComparisonToPrevious: false,
    includeQRCode: false,
    showTutorLogo: false,
  },
  professional: {
    id: 'professional',
    name: '프로페셔널',
    backgroundColor: '#0F172A',
    accentColor: '#F59E0B',
    fontFamily: 'Pretendard',
    showConfidenceGraph: true,
    showComparisonToPrevious: true,
    includeQRCode: true,
    showTutorLogo: true,
  },
};

// ============================================
// WEEKLY REPORT TEMPLATES
// ============================================

export interface WeeklyReportSection {
  title: string;
  type: 'stats' | 'progress' | 'achievements' | 'recommendations' | 'summary';
  enabled: boolean;
}

export const WEEKLY_REPORT_SECTIONS: WeeklyReportSection[] = [
  { title: '이번 주 요약', type: 'stats', enabled: true },
  { title: '단원별 성장', type: 'progress', enabled: true },
  { title: '이번 주 성과', type: 'achievements', enabled: true },
  { title: '추천 학습', type: 'recommendations', enabled: true },
  { title: '종합 평가', type: 'summary', enabled: true },
];

/**
 * Generate weekly summary text
 */
export function generateWeeklySummary(data: {
  studentName: string;
  totalLessons: number;
  totalHours: number;
  topicsCount: number;
  overallProgress: 'excellent' | 'good' | 'steady' | 'needsSupport';
}): string {
  const { studentName, totalLessons, totalHours, topicsCount, overallProgress } = data;

  const progressDescriptions = {
    excellent: `이번 주 ${studentName} 학생이 놀라운 성장을 보여주었습니다. 모든 단원에서 높은 이해도를 보였으며, 이 속도라면 학습 목표를 빠르게 달성할 수 있을 것입니다.`,
    good: `${studentName} 학생이 이번 주 수업에 열심히 참여했습니다. 대부분의 개념을 잘 이해했으며, 꾸준한 복습을 통해 더욱 탄탄한 실력을 갖출 수 있을 것입니다.`,
    steady: `${studentName} 학생이 자신의 페이스로 착실히 학습하고 있습니다. 일부 개념은 추가 연습이 필요하지만, 전반적으로 안정적인 진행을 보이고 있습니다.`,
    needsSupport: `${studentName} 학생이 이번 주 일부 개념에서 어려움을 겪었습니다. 기초 개념 보강에 시간을 투자하여 탄탄한 기반을 만들어가겠습니다.`,
  };

  return `📊 이번 주 학습 현황\n\n` +
    `• 수업 횟수: ${totalLessons}회\n` +
    `• 총 학습 시간: ${totalHours}시간\n` +
    `• 다룬 단원: ${topicsCount}개\n\n` +
    progressDescriptions[overallProgress];
}
