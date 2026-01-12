/**
 * Curriculum Auto-Sync System
 *
 * Automatically updates curriculum data from:
 * 1. Official education ministry sources (crawling)
 * 2. AI parsing of curriculum documents
 * 3. Web search for tutor community insights
 *
 * No manual monitoring required - system self-updates.
 */

// ============================================
// DATA SOURCES
// ============================================

export type Country = 'KR' | 'US' | 'UK' | 'SG' | 'JP' | 'CN';

export interface CurriculumSource {
  country: Country;
  name: string;
  type: 'OFFICIAL' | 'COMMUNITY' | 'RESEARCH';

  // Crawling config
  urls: string[];
  crawlFrequency: 'DAILY' | 'WEEKLY' | 'MONTHLY';

  // Parsing config
  documentTypes: ('HTML' | 'PDF' | 'DOCX')[];
  language: string;

  // AI parsing instructions
  parsingPrompt: string;
}

/**
 * Official curriculum sources by country
 */
export const CURRICULUM_SOURCES: CurriculumSource[] = [
  {
    country: 'KR',
    name: '국가교육과정정보센터 (NCIC)',
    type: 'OFFICIAL',
    urls: [
      'https://ncic.re.kr/mobile.dwn.ogf.inventoryList.do',
      'https://www.moe.go.kr/boardCnts/listRenew.do?boardID=141',
    ],
    crawlFrequency: 'WEEKLY',
    documentTypes: ['HTML', 'PDF'],
    language: 'ko',
    parsingPrompt: `Extract curriculum topics from Korean education documents.
For each topic, identify:
- Grade level (초1-6, 중1-3, 고1-3)
- Subject
- Topic name and code
- Prerequisites (which topics must be learned first)
- Learning objectives
- Estimated hours`,
  },
  {
    country: 'US',
    name: 'Common Core State Standards',
    type: 'OFFICIAL',
    urls: [
      'http://www.corestandards.org/Math/',
      'http://www.corestandards.org/ELA-Literacy/',
    ],
    crawlFrequency: 'MONTHLY',
    documentTypes: ['HTML'],
    language: 'en',
    parsingPrompt: `Extract Common Core standards.
For each standard, identify:
- Grade level (K-12)
- Domain/Subject
- Standard code and description
- Prerequisites
- Related standards`,
  },
  {
    country: 'UK',
    name: 'National Curriculum',
    type: 'OFFICIAL',
    urls: ['https://www.gov.uk/government/collections/national-curriculum'],
    crawlFrequency: 'MONTHLY',
    documentTypes: ['HTML', 'PDF'],
    language: 'en',
    parsingPrompt: `Extract UK National Curriculum topics.
For each topic, identify:
- Key Stage (KS1-4)
- Subject
- Topic name
- Prerequisites
- Attainment targets`,
  },
  {
    country: 'SG',
    name: 'MOE Singapore Syllabus',
    type: 'OFFICIAL',
    urls: ['https://www.moe.gov.sg/education/syllabuses'],
    crawlFrequency: 'MONTHLY',
    documentTypes: ['PDF'],
    language: 'en',
    parsingPrompt: `Extract Singapore MOE syllabus topics.
For each topic, identify:
- Level (Primary 1-6, Secondary 1-4, JC)
- Subject
- Topic name
- Prerequisites
- Learning outcomes`,
  },
];

// ============================================
// TUTOR COMMUNITY SOURCES
// ============================================

export interface TutorCommunitySource {
  name: string;
  country: Country;
  type: 'FORUM' | 'CAFE' | 'COMMUNITY' | 'SEARCH';

  // For direct crawling
  baseUrl?: string;
  searchPatterns?: string[];

  // For web search
  searchQueries?: string[];

  // Parsing
  language: string;
  insightPrompt: string;
}

export const TUTOR_COMMUNITY_SOURCES: TutorCommunitySource[] = [
  {
    name: '오르비',
    country: 'KR',
    type: 'FORUM',
    baseUrl: 'https://orbi.kr',
    searchPatterns: ['/board/tutor', '/board/math'],
    language: 'ko',
    insightPrompt: `Extract tutor insights about student struggles.
Look for:
- Common mistakes students make
- Prerequisites that are often missing
- Effective teaching strategies
- Diagnostic questions tutors use`,
  },
  {
    name: '김과외/숨고',
    country: 'KR',
    type: 'COMMUNITY',
    language: 'ko',
    searchQueries: [
      '수학 과외 학생 어려워하는 부분 site:soomgo.com OR site:kimgwagoe.com',
      '과외 선생님 팁 수학 site:cafe.naver.com',
    ],
    insightPrompt: `Extract practical tutor advice.
Look for:
- Real teaching experiences
- Student difficulty patterns
- Remediation strategies`,
  },
  {
    name: 'Web Search - Korean Tutor Tips',
    country: 'KR',
    type: 'SEARCH',
    language: 'ko',
    searchQueries: [
      '{topic} 학생들이 어려워하는 이유',
      '{topic} 과외 지도 팁',
      '{topic} 선수학습 부족 증상',
      '중학교 {subject} 결손 패턴',
    ],
    insightPrompt: `From web search results about tutoring, extract:
- Why students struggle with this topic
- Common prerequisite gaps
- Effective teaching approaches
- Warning signs of misunderstanding`,
  },
  {
    name: 'Web Search - US Tutor Tips',
    country: 'US',
    type: 'SEARCH',
    language: 'en',
    searchQueries: [
      '{topic} common student mistakes',
      '{topic} tutoring tips',
      '{topic} prerequisite gaps',
      'why students struggle with {topic}',
    ],
    insightPrompt: `From web search results about tutoring, extract:
- Common misconceptions
- Prerequisite knowledge gaps
- Effective explanations
- Diagnostic questions`,
  },
];

// ============================================
// SYNC JOB TYPES
// ============================================

export type SyncJobType = 'CURRICULUM_CRAWL' | 'COMMUNITY_CRAWL' | 'WEB_SEARCH';

export type SyncJobStatus =
  | 'PENDING'
  | 'RUNNING'
  | 'COMPLETED'
  | 'FAILED'
  | 'PARTIAL';

export interface SyncJob {
  id: string;
  type: SyncJobType;
  source: string;
  country: Country;

  // Scheduling
  scheduledAt: string;
  startedAt?: string;
  completedAt?: string;

  // Status
  status: SyncJobStatus;
  progress: number; // 0-100
  error?: string;

  // Results
  itemsFound: number;
  itemsAdded: number;
  itemsUpdated: number;

  // Raw data (for debugging)
  rawData?: unknown;
}

// ============================================
// PARSED RESULTS
// ============================================

export interface ParsedCurriculumTopic {
  // Source info
  sourceCountry: Country;
  sourceName: string;
  sourceUrl: string;
  parsedAt: string;

  // Topic data
  code: string;
  name: string;
  nameEn?: string;
  gradeLevel: string;
  subject: string;

  // Relationships
  prerequisites: string[]; // Topic codes or names
  learningObjectives: string[];

  // Metadata
  estimatedHours?: number;
  difficulty?: number;

  // AI confidence
  confidence: number; // 0-1
}

export interface ParsedTutorInsight {
  // Source info
  source: string;
  sourceUrl: string;
  parsedAt: string;

  // Topic mapping
  relatedTopics: string[]; // Topic codes or keywords
  confidence: number;

  // Insight content
  insightType: 'STRUGGLE' | 'TIP' | 'DIAGNOSTIC' | 'PATTERN';
  content: string;

  // For struggles
  symptom?: string;
  rootCause?: string;
  remediation?: string;

  // Engagement (if from forum)
  upvotes?: number;
  comments?: number;
}

// ============================================
// SERVICE INTERFACE
// ============================================

export interface ICurriculumSyncService {
  // Manual triggers
  syncCurriculumSource(source: CurriculumSource): Promise<SyncJob>;
  syncTutorCommunity(source: TutorCommunitySource): Promise<SyncJob>;
  searchTutorInsights(topic: string, country: Country): Promise<ParsedTutorInsight[]>;

  // Scheduled jobs
  scheduleAllSyncs(): Promise<void>;
  getScheduledJobs(): Promise<SyncJob[]>;
  cancelJob(jobId: string): Promise<void>;

  // Results
  getParsedTopics(country: Country): Promise<ParsedCurriculumTopic[]>;
  getParsedInsights(topicCode: string): Promise<ParsedTutorInsight[]>;

  // Merge with main curriculum
  mergeToMainCurriculum(parsedTopics: ParsedCurriculumTopic[]): Promise<{
    added: number;
    updated: number;
    conflicts: string[];
  }>;
}
