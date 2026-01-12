export type IdeaStatus = 'inbox' | 'evaluating' | 'experiment' | 'launched' | 'killed';

// ==========================================
// Chalk Core Types
// ==========================================

export interface Profile {
  id: string;
  email: string;
  name: string | null;
  school: string | null;
  subject: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Student {
  id: string;
  tutor_id: string;
  name: string;
  grade: string | null;          // 학년 (예: "고1", "중2")
  subject: string | null;        // 과목
  goal: string | null;           // 학습 목표
  parent_contact: string | null; // 학부모 연락처
  notes: string | null;          // 메모
  color: string | null;          // 프로필 색상
  status: 'active' | 'paused' | 'completed';
  created_at: string;
  updated_at: string;
}

export interface LessonLog {
  id: string;
  user_id: string;
  student_id: string | null;
  lesson_date: string;
  duration_minutes: number | null;

  // PDS Framework
  problem_tags: string[];
  problem_detail: string | null;
  diagnosis_tags: string[];
  diagnosis_detail: string | null;
  solution_tags: string[];
  solution_detail: string | null;

  // Recording & Analysis
  recording_id: string | null;
  auto_generated: boolean;  // AI가 자동 생성했는지

  created_at: string;
}

export interface Recording {
  id: string;
  user_id: string;
  student_id: string | null;
  lesson_date: string;

  // Audio info
  audio_url: string | null;
  duration_seconds: number;
  file_size_bytes: number | null;

  // Processing status
  status: 'recording' | 'processing' | 'analyzed' | 'error';

  // Timestamps
  started_at: string;
  ended_at: string | null;
  created_at: string;
}

export interface RecordingAnalysis {
  id: string;
  recording_id: string;

  // Transcript
  full_transcript: string | null;

  // Speaker diarization
  speakers: SpeakerSegment[];
  tutor_speaking_ratio: number;   // 0-1
  student_speaking_ratio: number; // 0-1

  // AI Analysis
  summary: string | null;
  key_topics: string[];
  problem_tags: string[];      // AI가 추출한 PDS
  diagnosis_tags: string[];
  solution_tags: string[];

  // Learning insights
  understanding_score: number | null;  // 0-100
  engagement_score: number | null;     // 0-100
  difficulty_moments: DifficultyMoment[];

  created_at: string;
}

export interface SpeakerSegment {
  speaker: 'tutor' | 'student';
  start_time: number;  // seconds
  end_time: number;
  text: string;
}

export interface DifficultyMoment {
  timestamp: number;     // seconds
  topic: string;
  indicator: string;     // 어떤 이유로 어려웠는지
}

// Student Analytics - 성장 추적
export interface StudentAnalytics {
  id: string;
  student_id: string;

  // Aggregate stats
  total_lessons: number;
  total_hours: number;

  // Growth metrics
  understanding_trend: number[];      // 최근 10회 이해도 추세
  engagement_trend: number[];         // 최근 10회 참여도 추세
  improvement_rate: number;           // 성장률 (%)

  // Pattern analysis
  common_struggles: TagCount[];       // 자주 어려워하는 부분
  effective_solutions: TagCount[];    // 효과적인 해결 방법
  peak_performance_time: string | null; // 최적 학습 시간대

  // Learning profile
  learning_style: LearningStyle | null;
  strengths: string[];
  areas_to_improve: string[];

  // Recommendations
  next_focus_areas: string[];
  suggested_approach: string | null;

  updated_at: string;
}

export interface TagCount {
  tag: string;
  count: number;
}

export interface LearningStyle {
  visual: number;      // 0-100
  auditory: number;    // 0-100
  kinesthetic: number; // 0-100
  reading: number;     // 0-100
  primary: 'visual' | 'auditory' | 'kinesthetic' | 'reading';
}

export interface Workspace {
  id: string;
  name: string;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface WorkspaceMember {
  workspace_id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'member';
  joined_at: string;
}

export interface Idea {
  id: string;
  workspace_id: string;
  title: string;
  description: string | null;
  tags: string[];
  status: IdeaStatus;
  avg_score: number | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  linked_issue_url: string | null;
}

export interface Evaluation {
  id: string;
  idea_id: string;
  evaluator_id: string | null;
  market_score: number;
  revenue_score: number;
  effort_score: number;
  team_fit_score: number;
  learning_score: number;
  comment: string | null;
  created_at: string;
}

export interface PostMortem {
  id: string;
  idea_id: string;
  reason: string;
  learnings: string | null;
  would_reconsider_when: string | null;
  created_by: string | null;
  created_at: string;
}

export interface Waitlist {
  id: string;
  email: string;
  created_at: string;
}

// Database schema type for Supabase client
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Profile, 'id' | 'created_at'>>;
      };
      students: {
        Row: Student;
        Insert: Omit<Student, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Student, 'id' | 'tutor_id' | 'created_at'>>;
      };
      logs: {
        Row: LessonLog;
        Insert: Omit<LessonLog, 'id' | 'created_at'>;
        Update: Partial<Omit<LessonLog, 'id' | 'user_id' | 'created_at'>>;
      };
      recordings: {
        Row: Recording;
        Insert: Omit<Recording, 'id' | 'created_at'>;
        Update: Partial<Omit<Recording, 'id' | 'user_id' | 'created_at'>>;
      };
      recording_analyses: {
        Row: RecordingAnalysis;
        Insert: Omit<RecordingAnalysis, 'id' | 'created_at'>;
        Update: Partial<Omit<RecordingAnalysis, 'id' | 'recording_id' | 'created_at'>>;
      };
      student_analytics: {
        Row: StudentAnalytics;
        Insert: Omit<StudentAnalytics, 'id' | 'updated_at'>;
        Update: Partial<Omit<StudentAnalytics, 'id' | 'student_id'>>;
      };
      workspaces: {
        Row: Workspace;
        Insert: Omit<Workspace, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Workspace, 'id' | 'created_at'>>;
      };
      workspace_members: {
        Row: WorkspaceMember;
        Insert: Omit<WorkspaceMember, 'joined_at'>;
        Update: Partial<Omit<WorkspaceMember, 'workspace_id' | 'user_id'>>;
      };
      ideas: {
        Row: Idea;
        Insert: Omit<Idea, 'id' | 'created_at' | 'updated_at' | 'avg_score'>;
        Update: Partial<Omit<Idea, 'id' | 'workspace_id' | 'created_at'>>;
      };
      evaluations: {
        Row: Evaluation;
        Insert: Omit<Evaluation, 'id' | 'created_at'>;
        Update: Partial<Omit<Evaluation, 'id' | 'idea_id' | 'created_at'>>;
      };
      post_mortems: {
        Row: PostMortem;
        Insert: Omit<PostMortem, 'id' | 'created_at'>;
        Update: Partial<Omit<PostMortem, 'id' | 'idea_id' | 'created_at'>>;
      };
      waitlist: {
        Row: Waitlist;
        Insert: { email: string };
        Update: never;
      };
    };
  };
}

