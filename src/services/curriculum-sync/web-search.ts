/**
 * Web Search Integration for Curriculum Sync
 *
 * Uses web search APIs to find:
 * 1. Latest curriculum updates from education ministries
 * 2. Tutor community insights and tips
 * 3. Student struggle patterns
 *
 * No hardcoding - always fresh data from the web.
 */

import type {
  Country,
  TutorCommunitySource,
  ParsedTutorInsight,
  TUTOR_COMMUNITY_SOURCES,
} from './types';

// ============================================
// SEARCH QUERY TEMPLATES
// ============================================

/**
 * Dynamic search queries for tutor insights
 * {topic} and {subject} are replaced with actual values
 */
export const INSIGHT_SEARCH_QUERIES: Record<Country, string[]> = {
  KR: [
    '{topic} 학생들이 자주 틀리는 문제',
    '{topic} 과외 선생님 팁',
    '{topic} 선수학습 결손 증상',
    '{subject} {grade} 학생 어려워하는 단원',
    '과외 {topic} 가르치는 방법',
    '{topic} 개념 이해 못하는 이유',
  ],
  US: [
    '{topic} common student mistakes',
    '{topic} tutoring strategies',
    '{topic} prerequisite gaps',
    'why students struggle with {topic}',
    'how to teach {topic} effectively',
    '{topic} misconceptions',
  ],
  UK: [
    '{topic} common errors GCSE',
    '{topic} teaching tips A-level',
    '{topic} student difficulties',
    'tutoring {topic} strategies UK',
  ],
  SG: [
    '{topic} common mistakes O-level',
    '{topic} tuition tips Singapore',
    'PSLE {topic} difficult concepts',
  ],
  JP: [
    '{topic} 生徒がよく間違える',
    '{topic} 塾講師 コツ',
    '{topic} 苦手な理由',
  ],
  CN: [
    '{topic} 学生常见错误',
    '{topic} 辅导技巧',
    '{topic} 为什么学不会',
  ],
};

/**
 * Search queries for curriculum updates
 */
export const CURRICULUM_UPDATE_QUERIES: Record<Country, string[]> = {
  KR: [
    '교육과정 개정 {year} {subject}',
    '교육부 {subject} 교육과정 변경사항',
    '{year} 개정 교육과정 {subject} 성취기준',
  ],
  US: [
    'Common Core updates {year} {subject}',
    'state standards changes {subject} {year}',
    'new curriculum requirements {subject}',
  ],
  UK: [
    'National Curriculum changes {year}',
    'GCSE syllabus updates {subject}',
    'A-level specification changes {year}',
  ],
  SG: [
    'MOE syllabus changes {year}',
    'Singapore curriculum update {subject}',
    'PSLE changes {year}',
  ],
  JP: [
    '学習指導要領 改訂 {year}',
    '{subject} カリキュラム 変更',
  ],
  CN: [
    '课程标准 修订 {year}',
    '{subject} 教学大纲 更新',
  ],
};

// ============================================
// SEARCH SERVICE
// ============================================

export interface WebSearchResult {
  title: string;
  url: string;
  snippet: string;
  source: string;
  date?: string;
}

export interface WebSearchService {
  /**
   * Search the web for tutor insights about a topic
   */
  searchTutorInsights(params: {
    topic: string;
    subject: string;
    grade?: string;
    country: Country;
    maxResults?: number;
  }): Promise<WebSearchResult[]>;

  /**
   * Search for curriculum updates
   */
  searchCurriculumUpdates(params: {
    country: Country;
    subject?: string;
    year?: number;
    maxResults?: number;
  }): Promise<WebSearchResult[]>;

  /**
   * Fetch and parse a URL's content
   */
  fetchAndParse(url: string): Promise<string>;
}

// ============================================
// AI PARSING
// ============================================

export interface AIParsingService {
  /**
   * Parse search results into structured tutor insights
   */
  parseInsightsFromSearchResults(
    results: WebSearchResult[],
    context: {
      topic: string;
      subject: string;
      country: Country;
    }
  ): Promise<ParsedTutorInsight[]>;

  /**
   * Parse curriculum document into structured topics
   */
  parseCurriculumDocument(
    content: string,
    context: {
      country: Country;
      source: string;
      documentType: 'HTML' | 'PDF' | 'TEXT';
    }
  ): Promise<{
    topics: {
      code: string;
      name: string;
      grade: string;
      subject: string;
      prerequisites: string[];
      objectives: string[];
    }[];
    confidence: number;
  }>;

  /**
   * Extract prerequisite relationships from curriculum content
   */
  extractPrerequisites(
    topics: { code: string; name: string; grade: string }[],
    curriculumContent: string
  ): Promise<{
    topicCode: string;
    prerequisiteCodes: string[];
    confidence: number;
  }[]>;
}

// ============================================
// PROMPT TEMPLATES FOR AI PARSING
// ============================================

export const AI_PROMPTS = {
  PARSE_TUTOR_INSIGHT: `You are analyzing web content about tutoring and education.

Extract practical insights that tutors can use. For each insight found:

1. Classify the type:
   - STRUGGLE: A common difficulty students have
   - TIP: A teaching strategy or approach
   - DIAGNOSTIC: How to identify if a student has a problem
   - PATTERN: A recurring issue across many students

2. Extract key information:
   - What topic is this about?
   - What's the actual insight?
   - If it's a struggle: What's the symptom? What's the root cause? How to fix it?
   - If it's a tip: When to use it? Why does it work?

3. Rate confidence (0-1) based on:
   - Source credibility
   - Specificity of the advice
   - Whether it's based on experience

Return as JSON array of insights.`,

  PARSE_CURRICULUM: `You are analyzing an official curriculum document.

Extract all topics/units/standards with their relationships.

For each topic:
1. Identify the grade level and subject
2. Extract the topic code/identifier if present
3. Extract the topic name in original language
4. List learning objectives/standards
5. Identify prerequisites (topics that must be learned first)
6. Estimate hours needed if possible

Pay special attention to:
- Progression paths (what leads to what)
- Cross-topic connections
- Grade-appropriate sequencing

Return as structured JSON.`,

  EXTRACT_PREREQUISITES: `Analyze the curriculum content and identify prerequisite relationships.

A prerequisite means: "To learn Topic A, students must first understand Topic B"

Look for:
1. Explicit statements ("builds on", "requires", "assumes knowledge of")
2. Implicit dependencies (same concepts appearing in earlier grades)
3. Logical necessity (can't do X without understanding Y)

For each relationship:
- Required: Cannot proceed without this
- Recommended: Very helpful but not blocking
- Helpful: Nice to have, makes learning easier

Return as JSON with confidence scores.`,
};

// ============================================
// EXAMPLE IMPLEMENTATION
// ============================================

/**
 * Example: How to use web search for Korean math tutoring insights
 */
export async function searchKoreanMathInsights(
  topic: string,
  webSearch: WebSearchService,
  aiParser: AIParsingService
): Promise<ParsedTutorInsight[]> {
  // Build search queries
  const queries = INSIGHT_SEARCH_QUERIES.KR.map((q) =>
    q.replace('{topic}', topic).replace('{subject}', '수학')
  );

  // Execute searches
  const allResults: WebSearchResult[] = [];
  for (const query of queries.slice(0, 3)) {
    // Limit to 3 queries
    const results = await webSearch.searchTutorInsights({
      topic,
      subject: '수학',
      country: 'KR',
      maxResults: 5,
    });
    allResults.push(...results);
  }

  // Deduplicate by URL
  const uniqueResults = allResults.filter(
    (r, i, arr) => arr.findIndex((x) => x.url === r.url) === i
  );

  // Parse with AI
  const insights = await aiParser.parseInsightsFromSearchResults(uniqueResults, {
    topic,
    subject: '수학',
    country: 'KR',
  });

  return insights;
}

/**
 * Example: Scheduled sync job for curriculum updates
 */
export async function checkCurriculumUpdates(
  country: Country,
  webSearch: WebSearchService,
  aiParser: AIParsingService
): Promise<{
  hasUpdates: boolean;
  changes: string[];
}> {
  const currentYear = new Date().getFullYear();

  const queries = CURRICULUM_UPDATE_QUERIES[country].map((q) =>
    q.replace('{year}', currentYear.toString()).replace('{subject}', '')
  );

  const results = await webSearch.searchCurriculumUpdates({
    country,
    year: currentYear,
    maxResults: 10,
  });

  // Check if any results indicate curriculum changes
  const changeIndicators = [
    '개정',
    'revised',
    'updated',
    'new',
    '변경',
    'changes',
    '수정',
  ];

  const relevantResults = results.filter((r) =>
    changeIndicators.some(
      (indicator) =>
        r.title.toLowerCase().includes(indicator) ||
        r.snippet.toLowerCase().includes(indicator)
    )
  );

  return {
    hasUpdates: relevantResults.length > 0,
    changes: relevantResults.map((r) => `${r.title}: ${r.url}`),
  };
}
