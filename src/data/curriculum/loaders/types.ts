/**
 * Curriculum Data Loader Types
 *
 * Defines the structure for curriculum data sources.
 * Data can come from:
 * - JSON files (static seed data)
 * - External APIs (government education portals)
 * - Crawled sources (tutor communities)
 * - Admin input (through CMS)
 */

import type {
  Topic,
  Prerequisite,
  CommonStruggle,
  TutorTip,
  DiagnosticQuestion,
  Country,
  Subject,
  GradeLevel,
} from '../schema';

// ============================================
// DATA SOURCE TYPES
// ============================================

export type DataSourceType =
  | 'SEED_FILE' // Built-in JSON/TS files
  | 'GOVERNMENT_API' // Official education API
  | 'CRAWLED' // Scraped from tutor communities
  | 'USER_CONTRIBUTED' // Tutor-submitted
  | 'ADMIN_CURATED'; // Manual curation

export interface DataSource {
  id: string;
  type: DataSourceType;
  name: string;
  url?: string;
  lastSyncedAt?: string;
  syncFrequency?: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'MANUAL';
}

// ============================================
// SEED DATA FORMAT
// ============================================

/**
 * Seed file format for curriculum data
 * This is the expected structure for JSON/TypeScript seed files
 */
export interface CurriculumSeedData {
  meta: {
    curriculumId: string;
    country: Country;
    subject: Subject;
    version: string;
    lastUpdated: string;
    source: string;
  };

  topics: TopicSeed[];
}

/**
 * Simplified topic structure for seed files
 * Includes prerequisites inline for easier authoring
 */
export interface TopicSeed {
  // Required
  code: string;
  name: string;
  grade: GradeLevel;

  // Optional identification
  nameEn?: string;
  chapter?: string;
  unit?: string;
  order?: number;

  // Learning metadata
  hours?: number;
  difficulty?: 1 | 2 | 3 | 4 | 5;
  description?: string;
  objectives?: string[];
  keyTerms?: string[];

  // Prerequisites (by code reference)
  prerequisites?: {
    code: string;
    strength?: 'REQUIRED' | 'RECOMMENDED' | 'HELPFUL';
    reason?: string;
  }[];

  // Common struggles (inline for easy authoring)
  struggles?: {
    description: string;
    frequency?: 'VERY_COMMON' | 'COMMON' | 'OCCASIONAL' | 'RARE';
    symptom?: string;
    rootCause?: string;
    remediation?: string;
    prerequisiteGap?: string; // Code of prerequisite topic
  }[];

  // Tutor tips (inline)
  tips?: {
    tip: string;
    context?: string;
    source?: string;
  }[];

  // Diagnostic questions (inline)
  diagnostics?: {
    question: string;
    answer: string;
    wrongPatterns?: {
      pattern: string;
      indicatesGap: string; // Topic code
      explanation: string;
    }[];
  }[];
}

// ============================================
// LOADER INTERFACE
// ============================================

export interface ICurriculumLoader {
  /**
   * Load and transform seed data into database-ready format
   */
  loadSeedData(data: CurriculumSeedData): Promise<{
    topics: Omit<Topic, 'id' | 'createdAt' | 'updatedAt'>[];
    prerequisites: Omit<Prerequisite, 'id'>[];
    struggles: Omit<CommonStruggle, 'id'>[];
    tips: Omit<TutorTip, 'id' | 'createdAt'>[];
    diagnostics: Omit<DiagnosticQuestion, 'id'>[];
  }>;

  /**
   * Validate prerequisite references (no circular dependencies)
   */
  validatePrerequisites(data: CurriculumSeedData): {
    valid: boolean;
    errors: string[];
  };

  /**
   * Generate topic codes if not provided
   */
  generateMissingCodes(data: CurriculumSeedData): CurriculumSeedData;
}

// ============================================
// CRAWLED DATA FORMAT
// ============================================

/**
 * Structure for data crawled from tutor communities
 */
export interface CrawledTutorInsight {
  source: 'ORBI' | 'GAMSAGYO' | 'NAVER_CAFE' | 'SUNEUNG_GALLERY' | 'OTHER';
  sourceUrl: string;
  crawledAt: string;

  // Content
  topicMention: string; // What topic this is about (needs mapping)
  insightType: 'STRUGGLE' | 'TIP' | 'DIAGNOSTIC' | 'GENERAL';
  content: string;

  // Engagement metrics (for credibility scoring)
  upvotes?: number;
  comments?: number;
  views?: number;

  // Processing status
  processed: boolean;
  mappedToTopicCode?: string;
  confidence?: number; // AI confidence in topic mapping
}

/**
 * Batch of crawled insights awaiting processing
 */
export interface CrawledInsightBatch {
  source: DataSource;
  crawledAt: string;
  insights: CrawledTutorInsight[];
}
