// ===================================
// DATABASE TYPES
// Supabase 테이블 타입 정의
// ===================================

export interface Student {
    id: string;
    tutor_id: string;
    name: string;
    subject_id: string;
    parent_email?: string;
    parent_phone?: string;
    notes?: string;
    created_at: string;
    updated_at: string;
}

export interface Session {
    id: string;
    tutor_id: string;
    student_id: string;
    subject_id: string;
    scheduled_at: string;
    duration_minutes?: number;
    status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
    transcript?: string;
    transcript_segments?: any[];
    notes?: string;
    recording_url?: string;
    evidence_urls?: string[];
    created_at: string;
    updated_at: string;
}

export interface SessionTopic {
    id: string;
    session_id: string;
    topic_id: string;
    status_before?: 'new' | 'learning' | 'reviewed' | 'mastered';
    status_after?: 'new' | 'learning' | 'reviewed' | 'mastered';
    score_delta?: number;
    evidence?: string;
    created_at: string;
}

export interface StudentMastery {
    id: string;
    student_id: string;
    topic_id: string;
    score: number; // 0-100
    status: 'new' | 'learning' | 'reviewed' | 'mastered';
    last_reviewed_at?: string;
    review_count: number;
    created_at: string;
    updated_at: string;
}

export interface Profile {
    id: string;
    email: string;
    name?: string;
    avatar_url?: string;
    created_at: string;
}

// ===================================
// INSERT TYPES (without auto-generated fields)
// ===================================

export type StudentInsert = Omit<Student, 'id' | 'created_at' | 'updated_at'>;
export type SessionInsert = Omit<Session, 'id' | 'created_at' | 'updated_at'>;
export type StudentMasteryInsert = Omit<StudentMastery, 'id' | 'created_at' | 'updated_at'>;

// ===================================
// WITH RELATIONS
// ===================================

export interface StudentWithMastery extends Student {
    mastery?: StudentMastery[];
    sessions?: Session[];
}

export interface SessionWithTopics extends Session {
    topics?: SessionTopic[];
    student?: Student;
}

// ===================================
// PHASE 3.5: QUIZLET-STYLE FEATURES
// ===================================

export interface TeacherProfile {
    id: string;
    display_name: string;
    bio?: string;
    avatar_url?: string;
    subjects: string[];
    experience_years: number;
    institution?: string;
    website_url?: string;
    is_public: boolean;
    total_students: number;
    total_curricula: number;
    follower_count: number;
    following_count: number;
    verified_at?: string;
    created_at: string;
    updated_at: string;
}

export interface Follow {
    id: string;
    follower_id: string;
    following_id: string;
    created_at: string;
}

export interface Textbook {
    id: string;
    title: string;
    publisher: string;
    subject: string;
    grade: string;
    year?: number;
    isbn?: string;
    cover_image_url?: string;
    subject_id?: string;
    is_verified: boolean;
    usage_count: number;
    created_by?: string;
    created_at: string;
    updated_at: string;
}

export interface TextbookChapter {
    id: string;
    textbook_id: string;
    chapter_number: string;
    title: string;
    page_start?: number;
    page_end?: number;
    parent_chapter_id?: string;
    order_index: number;
    created_at: string;
}

export interface TextbookTopicMapping {
    id: string;
    textbook_chapter_id: string;
    topic_id: string;
    mapping_confidence: number;
    mapped_by?: string;
    is_verified: boolean;
    created_at: string;
}

export interface Curriculum {
    id: string;
    creator_id: string;
    title: string;
    description?: string;
    subject_id: string;
    textbook_id?: string;
    topic_ids: string[];
    is_public: boolean;
    is_verified: boolean;
    verified_at?: string;
    verified_by?: string;
    usage_count: number;
    like_count: number;
    clone_count: number;
    original_curriculum_id?: string;
    tags: string[];
    created_at: string;
    updated_at: string;
}

export interface CurriculumVerification {
    id: string;
    curriculum_id: string;
    verification_type: 'auto' | 'manual' | 'community';
    status: 'pending' | 'approved' | 'rejected';
    verified_by?: string;
    auto_criteria_met?: {
        usage_count?: number;
        clone_count?: number;
    };
    notes?: string;
    created_at: string;
}

export interface CurriculumLike {
    id: string;
    curriculum_id: string;
    user_id: string;
    created_at: string;
}

export interface Class {
    id: string;
    teacher_id: string;
    name: string;
    description?: string;
    class_code: string;
    subject_id: string;
    curriculum_id?: string;
    is_active: boolean;
    max_students: number;
    join_approval_required: boolean;
    created_at: string;
    updated_at: string;
}

export interface ClassMember {
    id: string;
    class_id: string;
    user_id?: string;
    student_id?: string;
    role: 'student' | 'assistant' | 'observer';
    status: 'pending' | 'approved' | 'rejected';
    nickname?: string;
    joined_at: string;
}

export interface ClassCurriculum {
    id: string;
    class_id: string;
    curriculum_id: string;
    shared_by: string;
    shared_at: string;
    is_required: boolean;
    due_date?: string;
}

// ===================================
// INSERT TYPES FOR PHASE 3.5
// ===================================

export type TeacherProfileInsert = Omit<TeacherProfile, 'created_at' | 'updated_at' | 'follower_count' | 'following_count' | 'verified_at'>;
export type TextbookInsert = Omit<Textbook, 'id' | 'created_at' | 'updated_at' | 'is_verified' | 'usage_count'>;
export type TextbookChapterInsert = Omit<TextbookChapter, 'id' | 'created_at'>;
export type CurriculumInsert = Omit<Curriculum, 'id' | 'created_at' | 'updated_at' | 'is_verified' | 'verified_at' | 'verified_by' | 'usage_count' | 'like_count' | 'clone_count'>;
export type ClassInsert = Omit<Class, 'id' | 'created_at' | 'updated_at' | 'class_code'>;
export type ClassMemberInsert = Omit<ClassMember, 'id' | 'joined_at'>;

// ===================================
// WITH RELATIONS FOR PHASE 3.5
// ===================================

export interface TeacherProfileWithCurricula extends TeacherProfile {
    curricula?: Curriculum[];
    classes?: Class[];
}

export interface CurriculumWithCreator extends Curriculum {
    creator?: TeacherProfile;
    textbook?: Textbook;
    liked_by_user?: boolean;
}

export interface ClassWithMembers extends Class {
    members?: ClassMember[];
    teacher?: TeacherProfile;
    curriculum?: Curriculum;
    curricula?: ClassCurriculum[];
}

export interface TextbookWithChapters extends Textbook {
    chapters?: (TextbookChapter & {
        topic_mappings?: TextbookTopicMapping[];
    })[];
}
