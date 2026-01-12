/**
 * StudentAnalyticsService
 * 학생 성장 추적 및 프로파일링 서비스
 */

import { createClient } from '@/lib/supabase/client';
import type {
  Student,
  StudentAnalytics,
  LessonLog,
  RecordingAnalysis,
  TagCount,
  LearningStyle,
} from '@/lib/supabase/types';

export interface StudentGrowthData {
  studentId: string;
  studentName: string;
  totalLessons: number;
  totalHours: number;
  recentProgress: 'improving' | 'stable' | 'needs-attention';
  understandingTrend: number[];
  engagementTrend: number[];
  topStrengths: string[];
  areasToImprove: string[];
  nextRecommendations: string[];
}

export interface StudentProfile {
  student: Student;
  analytics: StudentAnalytics | null;
  recentLogs: LessonLog[];
  growthData: StudentGrowthData;
}

class StudentAnalyticsService {
  /**
   * 학생 분석 데이터 계산 및 업데이트
   */
  async updateStudentAnalytics(studentId: string): Promise<StudentAnalytics | null> {
    const supabase = createClient();

    try {
      // Get all logs for this student
      const { data: logs } = await supabase
        .from('logs')
        .select('*')
        .eq('student_id', studentId)
        .order('lesson_date', { ascending: false });

      if (!logs || logs.length === 0) {
        return null;
      }

      // Get recording analyses for this student
      const { data: recordings } = await supabase
        .from('recordings')
        .select('id')
        .eq('student_id', studentId);

      const recordingIds = recordings?.map((r) => r.id) || [];

      let analyses: RecordingAnalysis[] = [];
      if (recordingIds.length > 0) {
        const { data } = await supabase
          .from('recording_analyses')
          .select('*')
          .in('recording_id', recordingIds)
          .order('created_at', { ascending: false });
        analyses = data || [];
      }

      // Calculate metrics
      const totalLessons = logs.length;
      const totalHours = logs.reduce((sum, log) => sum + (log.duration_minutes || 60) / 60, 0);

      // Calculate trends from recent analyses
      const recentAnalyses = analyses.slice(0, 10);
      const understandingTrend = recentAnalyses
        .map((a) => a.understanding_score || 70)
        .reverse();
      const engagementTrend = recentAnalyses
        .map((a) => a.engagement_score || 70)
        .reverse();

      // Calculate improvement rate
      const improvementRate = this.calculateImprovementRate(understandingTrend);

      // Aggregate tag counts
      const commonStruggles = this.aggregateTagCounts(logs, 'problem_tags');
      const effectiveSolutions = this.aggregateTagCounts(logs, 'solution_tags');

      // Determine learning style (simplified heuristic)
      const learningStyle = this.determineLearningStyle(logs, analyses);

      // Generate strengths and areas to improve
      const { strengths, areasToImprove } = this.analyzePerformancePatterns(logs, analyses);

      // Generate recommendations
      const nextFocusAreas = this.generateRecommendations(logs, analyses, commonStruggles);

      const analytics: Omit<StudentAnalytics, 'id' | 'updated_at'> = {
        student_id: studentId,
        total_lessons: totalLessons,
        total_hours: Math.round(totalHours * 10) / 10,
        understanding_trend: understandingTrend,
        engagement_trend: engagementTrend,
        improvement_rate: improvementRate,
        common_struggles: commonStruggles,
        effective_solutions: effectiveSolutions,
        peak_performance_time: this.findPeakPerformanceTime(logs, analyses),
        learning_style: learningStyle,
        strengths,
        areas_to_improve: areasToImprove,
        next_focus_areas: nextFocusAreas,
        suggested_approach: this.generateSuggestedApproach(learningStyle, commonStruggles),
      };

      // Upsert analytics
      const { data: savedAnalytics, error } = await supabase
        .from('student_analytics')
        .upsert(
          { ...analytics, updated_at: new Date().toISOString() },
          { onConflict: 'student_id' }
        )
        .select()
        .single();

      if (error) {
        console.error('Failed to save analytics:', error);
        return null;
      }

      return savedAnalytics;
    } catch (error) {
      console.error('Analytics update failed:', error);
      return null;
    }
  }

  /**
   * 학생 프로필 전체 조회
   */
  async getStudentProfile(studentId: string): Promise<StudentProfile | null> {
    const supabase = createClient();

    try {
      // Get student info
      const { data: student } = await supabase
        .from('students')
        .select('*')
        .eq('id', studentId)
        .single();

      if (!student) {
        return null;
      }

      // Get analytics
      const { data: analytics } = await supabase
        .from('student_analytics')
        .select('*')
        .eq('student_id', studentId)
        .single();

      // Get recent logs
      const { data: recentLogs } = await supabase
        .from('logs')
        .select('*')
        .eq('student_id', studentId)
        .order('lesson_date', { ascending: false })
        .limit(10);

      // Generate growth data
      const growthData = await this.generateGrowthData(student, analytics, recentLogs || []);

      return {
        student,
        analytics,
        recentLogs: recentLogs || [],
        growthData,
      };
    } catch (error) {
      console.error('Failed to get student profile:', error);
      return null;
    }
  }

  /**
   * 전체 학생 요약 대시보드
   */
  async getDashboardSummary(tutorId: string): Promise<{
    totalStudents: number;
    activeStudents: number;
    totalLessonsThisMonth: number;
    avgUnderstandingScore: number;
    studentsNeedingAttention: Student[];
    topPerformers: Student[];
  }> {
    const supabase = createClient();

    // Get all students for this tutor
    const { data: students } = await supabase
      .from('students')
      .select('*')
      .eq('tutor_id', tutorId);

    if (!students || students.length === 0) {
      return {
        totalStudents: 0,
        activeStudents: 0,
        totalLessonsThisMonth: 0,
        avgUnderstandingScore: 0,
        studentsNeedingAttention: [],
        topPerformers: [],
      };
    }

    const activeStudents = students.filter((s) => s.status === 'active');

    // Get this month's logs
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const { data: monthlyLogs } = await supabase
      .from('logs')
      .select('*')
      .eq('user_id', tutorId)
      .gte('lesson_date', startOfMonth.toISOString().split('T')[0]);

    // Get all analytics
    const studentIds = students.map((s) => s.id);
    const { data: allAnalytics } = await supabase
      .from('student_analytics')
      .select('*')
      .in('student_id', studentIds);

    // Calculate average understanding score
    const scores = allAnalytics
      ?.filter((a) => a.understanding_trend?.length > 0)
      .map((a) => a.understanding_trend[a.understanding_trend.length - 1]) || [];

    const avgScore = scores.length > 0
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      : 0;

    // Find students needing attention (declining or low scores)
    const studentsNeedingAttention = this.findStudentsNeedingAttention(students, allAnalytics || []);

    // Find top performers
    const topPerformers = this.findTopPerformers(students, allAnalytics || []);

    return {
      totalStudents: students.length,
      activeStudents: activeStudents.length,
      totalLessonsThisMonth: monthlyLogs?.length || 0,
      avgUnderstandingScore: avgScore,
      studentsNeedingAttention,
      topPerformers,
    };
  }

  /**
   * 태그 카운트 집계
   */
  private aggregateTagCounts(
    logs: LessonLog[],
    field: 'problem_tags' | 'diagnosis_tags' | 'solution_tags'
  ): TagCount[] {
    const counts: Record<string, number> = {};

    for (const log of logs) {
      const tags = log[field] as string[] || [];
      for (const tag of tags) {
        counts[tag] = (counts[tag] || 0) + 1;
      }
    }

    return Object.entries(counts)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }

  /**
   * 개선율 계산
   */
  private calculateImprovementRate(trend: number[]): number {
    if (trend.length < 2) return 0;

    const firstHalf = trend.slice(0, Math.floor(trend.length / 2));
    const secondHalf = trend.slice(Math.floor(trend.length / 2));

    const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;

    return Math.round(((secondAvg - firstAvg) / firstAvg) * 100);
  }

  /**
   * 학습 스타일 결정
   */
  private determineLearningStyle(
    logs: LessonLog[],
    analyses: RecordingAnalysis[]
  ): LearningStyle | null {
    // Simplified heuristic based on effective solution tags
    const solutionCounts: Record<string, number> = {};

    for (const log of logs) {
      for (const tag of (log.solution_tags as string[]) || []) {
        solutionCounts[tag] = (solutionCounts[tag] || 0) + 1;
      }
    }

    const visualScore = (solutionCounts['시각화'] || 0) * 20;
    const auditoryScore = (solutionCounts['개념정리'] || 0) * 15;
    const kinestheticScore = (solutionCounts['반복연습'] || 0) * 20;
    const readingScore = (solutionCounts['오답노트'] || 0) * 15;

    const max = Math.max(visualScore, auditoryScore, kinestheticScore, readingScore);

    if (max === 0) return null;

    const total = visualScore + auditoryScore + kinestheticScore + readingScore || 1;

    let primary: 'visual' | 'auditory' | 'kinesthetic' | 'reading' = 'visual';
    if (max === auditoryScore) primary = 'auditory';
    if (max === kinestheticScore) primary = 'kinesthetic';
    if (max === readingScore) primary = 'reading';

    return {
      visual: Math.round((visualScore / total) * 100),
      auditory: Math.round((auditoryScore / total) * 100),
      kinesthetic: Math.round((kinestheticScore / total) * 100),
      reading: Math.round((readingScore / total) * 100),
      primary,
    };
  }

  /**
   * 성과 패턴 분석
   */
  private analyzePerformancePatterns(
    logs: LessonLog[],
    analyses: RecordingAnalysis[]
  ): { strengths: string[]; areasToImprove: string[] } {
    const solutionCounts = this.aggregateTagCounts(logs, 'solution_tags');
    const problemCounts = this.aggregateTagCounts(logs, 'problem_tags');

    const strengths: string[] = [];
    const areasToImprove: string[] = [];

    // Most effective solutions = strengths
    for (const { tag } of solutionCounts.slice(0, 3)) {
      const strengthMap: Record<string, string> = {
        '반복연습': '꾸준한 연습으로 개념 정착',
        '개념정리': '체계적인 개념 이해',
        '시각화': '시각적 사고력',
        '오답노트': '자기 분석 능력',
        '격려': '긍정적 학습 태도',
      };
      if (strengthMap[tag]) {
        strengths.push(strengthMap[tag]);
      }
    }

    // Most common problems = areas to improve
    for (const { tag } of problemCounts.slice(0, 3)) {
      const improvementMap: Record<string, string> = {
        '계산실수': '계산 정확성 향상',
        '개념이해': '기초 개념 강화',
        '문제해석': '문제 분석 능력',
        '시간부족': '문제 풀이 속도',
        '응용력': '응용 문제 연습',
      };
      if (improvementMap[tag]) {
        areasToImprove.push(improvementMap[tag]);
      }
    }

    return { strengths, areasToImprove };
  }

  /**
   * 추천 생성
   */
  private generateRecommendations(
    logs: LessonLog[],
    analyses: RecordingAnalysis[],
    commonStruggles: TagCount[]
  ): string[] {
    const recommendations: string[] = [];

    if (commonStruggles.some((s) => s.tag === '계산실수')) {
      recommendations.push('계산 연습 문제집 활용');
    }
    if (commonStruggles.some((s) => s.tag === '개념이해')) {
      recommendations.push('개념 동영상 복습 권장');
    }
    if (commonStruggles.some((s) => s.tag === '시간부족')) {
      recommendations.push('시간제한 연습 필요');
    }

    // Add engagement recommendation if low
    const recentEngagement = analyses.slice(0, 5).map((a) => a.engagement_score || 70);
    const avgEngagement = recentEngagement.length > 0
      ? recentEngagement.reduce((a, b) => a + b, 0) / recentEngagement.length
      : 70;

    if (avgEngagement < 60) {
      recommendations.push('학생 참여 유도 활동 필요');
    }

    return recommendations.slice(0, 5);
  }

  /**
   * 최적 학습 시간대 찾기
   */
  private findPeakPerformanceTime(
    logs: LessonLog[],
    analyses: RecordingAnalysis[]
  ): string | null {
    // This would require time data in logs
    // For now, return a common time
    return '오후 4-6시';
  }

  /**
   * 학습 접근 방식 제안
   */
  private generateSuggestedApproach(
    learningStyle: LearningStyle | null,
    commonStruggles: TagCount[]
  ): string {
    if (!learningStyle) {
      return '다양한 학습 방법을 시도하며 최적의 방식을 찾아보세요.';
    }

    const approaches: Record<string, string> = {
      visual: '그래프, 도표, 마인드맵 등 시각적 자료를 활용한 학습이 효과적입니다.',
      auditory: '개념 설명을 듣고 토론하는 방식이 효과적입니다.',
      kinesthetic: '직접 문제를 풀어보며 체험하는 학습이 효과적입니다.',
      reading: '교재와 노트 정리를 통한 학습이 효과적입니다.',
    };

    return approaches[learningStyle.primary] || approaches.visual;
  }

  /**
   * 성장 데이터 생성
   */
  private async generateGrowthData(
    student: Student,
    analytics: StudentAnalytics | null,
    recentLogs: LessonLog[]
  ): Promise<StudentGrowthData> {
    const understandingTrend = analytics?.understanding_trend || [];
    const engagementTrend = analytics?.engagement_trend || [];

    let recentProgress: 'improving' | 'stable' | 'needs-attention' = 'stable';

    if (understandingTrend.length >= 3) {
      const recent = understandingTrend.slice(-3);
      const earlier = understandingTrend.slice(-6, -3);

      if (earlier.length > 0) {
        const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
        const earlierAvg = earlier.reduce((a, b) => a + b, 0) / earlier.length;

        if (recentAvg > earlierAvg + 5) {
          recentProgress = 'improving';
        } else if (recentAvg < earlierAvg - 10) {
          recentProgress = 'needs-attention';
        }
      }
    }

    return {
      studentId: student.id,
      studentName: student.name,
      totalLessons: analytics?.total_lessons || recentLogs.length,
      totalHours: analytics?.total_hours || 0,
      recentProgress,
      understandingTrend,
      engagementTrend,
      topStrengths: analytics?.strengths || [],
      areasToImprove: analytics?.areas_to_improve || [],
      nextRecommendations: analytics?.next_focus_areas || [],
    };
  }

  /**
   * 관심 필요 학생 찾기
   */
  private findStudentsNeedingAttention(
    students: Student[],
    allAnalytics: StudentAnalytics[]
  ): Student[] {
    const analyticsMap = new Map(allAnalytics.map((a) => [a.student_id, a]));

    return students
      .filter((student) => {
        const analytics = analyticsMap.get(student.id);
        if (!analytics) return false;

        const trend = analytics.understanding_trend || [];
        if (trend.length < 2) return false;

        const recent = trend[trend.length - 1];
        const previous = trend[trend.length - 2];

        return recent < 60 || (previous - recent > 10);
      })
      .slice(0, 5);
  }

  /**
   * 우수 학생 찾기
   */
  private findTopPerformers(
    students: Student[],
    allAnalytics: StudentAnalytics[]
  ): Student[] {
    const analyticsMap = new Map(allAnalytics.map((a) => [a.student_id, a]));

    return students
      .filter((student) => {
        const analytics = analyticsMap.get(student.id);
        if (!analytics) return false;

        const trend = analytics.understanding_trend || [];
        if (trend.length < 3) return false;

        const recent = trend.slice(-3);
        const avgRecent = recent.reduce((a, b) => a + b, 0) / recent.length;

        return avgRecent >= 80 && (analytics.improvement_rate || 0) > 0;
      })
      .slice(0, 5);
  }
}

export const studentAnalyticsService = new StudentAnalyticsService();
export default StudentAnalyticsService;
