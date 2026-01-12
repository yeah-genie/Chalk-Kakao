/**
 * Curriculum Schema
 *
 * Database-agnostic schema for multi-country, multi-subject curriculum mapping.
 * Ready to be adapted to Prisma, Drizzle, or any ORM.
 *
 * Supports:
 * - Multiple countries (Korea, US, UK, Singapore, etc.)
 * - All subjects (Math, Science, English, etc.)
 * - Prerequisite relationships (DAG structure)
 * - Diagnostic patterns from tutor communities
 */

// ============================================
// ENUMS
// ============================================

export type Country = 'KR' | 'US' | 'UK' | 'SG' | 'JP' | 'CN';

export type Subject =
  | 'MATH'
  | 'KOREAN' // 국어
  | 'ENGLISH'
  | 'SCIENCE'
  | 'SOCIAL_STUDIES' // 사회
  | 'HISTORY'
  | 'PHYSICS'
  | 'CHEMISTRY'
  | 'BIOLOGY'
  | 'EARTH_SCIENCE'
  | 'CHINESE' // 중국어
  | 'JAPANESE'; // 일본어

export type GradeLevel =
  | 'ELEMENTARY_1'
  | 'ELEMENTARY_2'
  | 'ELEMENTARY_3'
  | 'ELEMENTARY_4'
  | 'ELEMENTARY_5'
  | 'ELEMENTARY_6'
  | 'MIDDLE_1'
  | 'MIDDLE_2'
  | 'MIDDLE_3'
  | 'HIGH_1'
  | 'HIGH_2'
  | 'HIGH_3';

export type DifficultyLevel = 1 | 2 | 3 | 4 | 5;

export type StruggleFrequency = 'VERY_COMMON' | 'COMMON' | 'OCCASIONAL' | 'RARE';

// ============================================
// CORE ENTITIES
// ============================================

/**
 * Curriculum - Top level container
 * e.g., "2022 개정 교육과정", "Common Core", "National Curriculum"
 */
export interface Curriculum {
  id: string;
  country: Country;
  name: string; // e.g., "2022 개정 교육과정"
  version: string; // e.g., "2022"
  effectiveFrom: string; // ISO date
  effectiveTo?: string; // null if current
  isActive: boolean;
}

/**
 * Topic - A learning unit within a curriculum
 */
export interface Topic {
  id: string;
  curriculumId: string;
  subject: Subject;
  gradeLevel: GradeLevel;

  // Identification
  code: string; // e.g., "KR-MATH-M2-LINEAR-EQ"
  name: string; // e.g., "일차방정식"
  nameEn?: string; // English name for international comparison

  // Hierarchy
  chapter?: string; // e.g., "2. 방정식"
  unit?: string; // e.g., "2-1. 일차방정식"
  orderInGrade: number; // Sequence within grade

  // Learning metadata
  estimatedHours: number; // Typical hours to master
  difficulty: DifficultyLevel;

  // Content
  description?: string;
  learningObjectives: string[];
  keyTerms: string[];

  // Timestamps
  createdAt: string;
  updatedAt: string;
}

/**
 * Prerequisite - Relationship between topics
 * Topic A requires Topic B to be understood first
 */
export interface Prerequisite {
  id: string;
  topicId: string; // The topic that requires prerequisite
  prerequisiteTopicId: string; // The required topic

  strength: 'REQUIRED' | 'RECOMMENDED' | 'HELPFUL';

  // Why this prerequisite matters
  reason?: string; // e.g., "분수 개념 없이 유리수 이해 불가"
}

/**
 * CommonStruggle - Known student difficulties with a topic
 * Sourced from tutor communities, educational research
 */
export interface CommonStruggle {
  id: string;
  topicId: string;

  description: string; // e.g., "등호의 의미를 모름"
  frequency: StruggleFrequency;

  // Diagnostic
  symptom?: string; // How this manifests
  rootCause?: string; // Why students struggle

  // Solution
  remediation?: string; // How tutors typically fix this
  prerequisiteGapTopicId?: string; // Often points to a prerequisite gap

  // Source tracking
  source?: string; // e.g., "orbi", "gamsagyo", "tutor-survey"
  sourceUrl?: string;
  reportCount: number; // How many times reported
}

/**
 * TutorTip - Practical teaching advice from tutor community
 */
export interface TutorTip {
  id: string;
  topicId: string;

  tip: string;
  context?: string; // When to use this tip

  // Credibility
  source: string;
  sourceUrl?: string;
  upvotes: number;

  createdAt: string;
}

/**
 * DiagnosticQuestion - Quick assessment questions
 */
export interface DiagnosticQuestion {
  id: string;
  topicId: string;

  question: string;
  expectedAnswer: string;

  // What wrong answers reveal
  wrongAnswerPatterns: {
    pattern: string;
    indicatesGapIn: string; // Topic code
    explanation: string;
  }[];

  difficulty: DifficultyLevel;
  estimatedSeconds: number; // Time to answer
}

/**
 * TopicEquivalence - Cross-curriculum mapping
 * Maps topics between different countries' curricula
 */
export interface TopicEquivalence {
  id: string;
  topicId1: string;
  topicId2: string;

  equivalenceType: 'EXACT' | 'SIMILAR' | 'PARTIAL' | 'RELATED';

  notes?: string; // e.g., "US covers this topic 1 year earlier"
}

// ============================================
// AGGREGATED TYPES (for queries)
// ============================================

/**
 * Full topic with all relationships loaded
 */
export interface TopicWithRelations extends Topic {
  prerequisites: (Prerequisite & { prerequisiteTopic: Topic })[];
  dependents: (Prerequisite & { topic: Topic })[]; // Topics that depend on this
  commonStruggles: CommonStruggle[];
  tutorTips: TutorTip[];
  diagnosticQuestions: DiagnosticQuestion[];
}

/**
 * Learning path - Ordered sequence of topics
 */
export interface LearningPath {
  id: string;
  name: string;
  description: string;

  targetGrade: GradeLevel;
  targetTopic: Topic;

  // Ordered list of topics to cover
  steps: {
    order: number;
    topicId: string;
    topic: Topic;
    estimatedHours: number;
    isPrerequisite: boolean; // vs target topic content
  }[];

  totalHours: number;
}

/**
 * Gap analysis result
 */
export interface GapAnalysis {
  studentId: string;
  assessedAt: string;

  targetTopic: Topic;

  gaps: {
    topic: Topic;
    severity: 'CRITICAL' | 'MODERATE' | 'MINOR';
    evidence: string; // What indicated this gap
    estimatedHoursToFix: number;
  }[];

  recommendedPath: LearningPath;
}

// ============================================
// SERVICE INTERFACE
// ============================================

/**
 * Curriculum Service - Core operations
 * Implement this with your database of choice
 */
export interface ICurriculumService {
  // Topics
  getTopicById(id: string): Promise<TopicWithRelations | null>;
  getTopicByCode(code: string): Promise<TopicWithRelations | null>;
  getTopicsByGrade(
    curriculumId: string,
    subject: Subject,
    grade: GradeLevel
  ): Promise<Topic[]>;

  // Prerequisites
  getAllPrerequisites(topicId: string): Promise<Topic[]>; // Recursive
  getDependentTopics(topicId: string): Promise<Topic[]>;

  // Diagnosis
  diagnoseGaps(
    targetTopicId: string,
    studentResponses: { questionId: string; answer: string }[]
  ): Promise<GapAnalysis>;

  // Learning path
  generateLearningPath(
    targetTopicId: string,
    knownTopicIds: string[]
  ): Promise<LearningPath>;

  // Cross-curriculum
  findEquivalentTopics(
    topicId: string,
    targetCurriculumId: string
  ): Promise<TopicEquivalence[]>;
}
