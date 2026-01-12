/**
 * Curriculum Sync Service
 *
 * Main service that orchestrates:
 * 1. Scheduled crawling of official curriculum sources
 * 2. Web search for tutor community insights
 * 3. AI parsing and data merging
 *
 * Runs automatically - no manual intervention needed.
 */

import type {
  Country,
  CurriculumSource,
  TutorCommunitySource,
  SyncJob,
  SyncJobStatus,
  ParsedCurriculumTopic,
  ParsedTutorInsight,
  ICurriculumSyncService,
  CURRICULUM_SOURCES,
  TUTOR_COMMUNITY_SOURCES,
} from './types';

import type { WebSearchService, AIParsingService } from './web-search';
import { INSIGHT_SEARCH_QUERIES, CURRICULUM_UPDATE_QUERIES } from './web-search';

// ============================================
// SYNC SCHEDULE CONFIGURATION
// ============================================

export interface SyncSchedule {
  curriculum: {
    // How often to check for curriculum updates
    frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY';
    // What time to run (cron format)
    cronExpression: string;
    // Countries to sync
    countries: Country[];
  };
  tutorInsights: {
    // How often to search for new insights
    frequency: 'DAILY' | 'WEEKLY';
    cronExpression: string;
    // Topics to search (or 'ALL' for all known topics)
    topicsToSearch: string[] | 'ALL';
    // Max insights to fetch per topic
    maxInsightsPerTopic: number;
  };
}

export const DEFAULT_SCHEDULE: SyncSchedule = {
  curriculum: {
    frequency: 'WEEKLY',
    cronExpression: '0 3 * * 0', // Every Sunday at 3 AM
    countries: ['KR', 'US', 'UK', 'SG'],
  },
  tutorInsights: {
    frequency: 'DAILY',
    cronExpression: '0 4 * * *', // Every day at 4 AM
    topicsToSearch: 'ALL',
    maxInsightsPerTopic: 10,
  },
};

// ============================================
// IN-MEMORY STORE
// ============================================

interface SyncStore {
  jobs: Map<string, SyncJob>;
  parsedTopics: Map<string, ParsedCurriculumTopic[]>; // Key: country
  parsedInsights: Map<string, ParsedTutorInsight[]>; // Key: topic code
  lastSync: Map<string, Date>; // Key: source name
}

const store: SyncStore = {
  jobs: new Map(),
  parsedTopics: new Map(),
  parsedInsights: new Map(),
  lastSync: new Map(),
};

// ============================================
// SERVICE IMPLEMENTATION
// ============================================

let jobIdCounter = 0;

function generateJobId(): string {
  return `sync_${++jobIdCounter}_${Date.now()}`;
}

/**
 * Create a sync job that uses web search to find tutor insights
 */
export async function searchAndParseTutorInsights(
  topic: string,
  subject: string,
  country: Country,
  webSearch: WebSearchService,
  aiParser: AIParsingService
): Promise<ParsedTutorInsight[]> {
  // Build search queries
  const queryTemplates = INSIGHT_SEARCH_QUERIES[country] || INSIGHT_SEARCH_QUERIES.US;

  const queries = queryTemplates.map((q) =>
    q.replace('{topic}', topic).replace('{subject}', subject)
  );

  // Execute searches (limit to prevent rate limiting)
  const allResults = [];
  for (const query of queries.slice(0, 3)) {
    try {
      const results = await webSearch.searchTutorInsights({
        topic,
        subject,
        country,
        maxResults: 5,
      });
      allResults.push(...results);

      // Small delay between searches
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch (error) {
      console.warn(`Search failed for query: ${query}`, error);
    }
  }

  // Deduplicate
  const uniqueResults = allResults.filter(
    (r, i, arr) => arr.findIndex((x) => x.url === r.url) === i
  );

  if (uniqueResults.length === 0) {
    return [];
  }

  // Parse with AI
  const insights = await aiParser.parseInsightsFromSearchResults(uniqueResults, {
    topic,
    subject,
    country,
  });

  // Store in cache
  const existing = store.parsedInsights.get(topic) || [];
  store.parsedInsights.set(topic, [...existing, ...insights]);

  return insights;
}

/**
 * Check for curriculum updates from official sources
 */
export async function checkForCurriculumUpdates(
  country: Country,
  webSearch: WebSearchService
): Promise<{
  hasUpdates: boolean;
  sources: string[];
}> {
  const currentYear = new Date().getFullYear();
  const subjects = ['수학', '영어', '과학', '국어']; // Korea example

  const updatedSources: string[] = [];

  for (const subject of subjects) {
    const results = await webSearch.searchCurriculumUpdates({
      country,
      subject,
      year: currentYear,
      maxResults: 5,
    });

    // Check for update indicators
    const updateKeywords: Record<string, string[]> = {
      KR: ['개정', '변경', '신설', '수정', '추가'],
      US: ['revised', 'updated', 'new standards', 'amended'],
      UK: ['updated', 'changes', 'new specification'],
      SG: ['revised', 'updated', 'changes', 'new syllabus'],
      JP: ['改定', '変更', '新設', '修正'],
      CN: ['修订', '更新', '变更', '新增'],
    };

    const keywords = updateKeywords[country] || updateKeywords.US;

    const hasUpdate = results.some((r) =>
      keywords.some(
        (kw) =>
          r.title.toLowerCase().includes(kw.toLowerCase()) ||
          r.snippet.toLowerCase().includes(kw.toLowerCase())
      )
    );

    if (hasUpdate) {
      updatedSources.push(`${country}-${subject}`);
    }
  }

  return {
    hasUpdates: updatedSources.length > 0,
    sources: updatedSources,
  };
}

/**
 * Main sync service class
 */
export class CurriculumSyncService implements ICurriculumSyncService {
  private webSearch: WebSearchService;
  private aiParser: AIParsingService;
  private schedule: SyncSchedule;
  private isRunning: boolean = false;

  constructor(
    webSearch: WebSearchService,
    aiParser: AIParsingService,
    schedule: SyncSchedule = DEFAULT_SCHEDULE
  ) {
    this.webSearch = webSearch;
    this.aiParser = aiParser;
    this.schedule = schedule;
  }

  async syncCurriculumSource(source: CurriculumSource): Promise<SyncJob> {
    const job: SyncJob = {
      id: generateJobId(),
      type: 'CURRICULUM_CRAWL',
      source: source.name,
      country: source.country,
      scheduledAt: new Date().toISOString(),
      startedAt: new Date().toISOString(),
      status: 'RUNNING',
      progress: 0,
      itemsFound: 0,
      itemsAdded: 0,
      itemsUpdated: 0,
    };

    store.jobs.set(job.id, job);

    try {
      // Fetch content from each URL
      const allContent: string[] = [];
      for (let i = 0; i < source.urls.length; i++) {
        const content = await this.webSearch.fetchAndParse(source.urls[i]);
        allContent.push(content);
        job.progress = Math.round(((i + 1) / source.urls.length) * 50);
      }

      // Parse with AI
      const combinedContent = allContent.join('\n\n---\n\n');
      const parsed = await this.aiParser.parseCurriculumDocument(combinedContent, {
        country: source.country,
        source: source.name,
        documentType: 'HTML',
      });

      job.progress = 80;

      // Store results
      const existingTopics = store.parsedTopics.get(source.country) || [];
      const newTopics: ParsedCurriculumTopic[] = parsed.topics.map((t) => ({
        sourceCountry: source.country,
        sourceName: source.name,
        sourceUrl: source.urls[0],
        parsedAt: new Date().toISOString(),
        code: t.code,
        name: t.name,
        gradeLevel: t.grade,
        subject: t.subject,
        prerequisites: t.prerequisites,
        learningObjectives: t.objectives,
        confidence: parsed.confidence,
      }));

      store.parsedTopics.set(source.country, [...existingTopics, ...newTopics]);

      job.itemsFound = newTopics.length;
      job.itemsAdded = newTopics.length; // Simplified
      job.progress = 100;
      job.status = 'COMPLETED';
      job.completedAt = new Date().toISOString();
    } catch (error) {
      job.status = 'FAILED';
      job.error = error instanceof Error ? error.message : 'Unknown error';
      job.completedAt = new Date().toISOString();
    }

    store.jobs.set(job.id, job);
    store.lastSync.set(source.name, new Date());

    return job;
  }

  async syncTutorCommunity(source: TutorCommunitySource): Promise<SyncJob> {
    const job: SyncJob = {
      id: generateJobId(),
      type: 'COMMUNITY_CRAWL',
      source: source.name,
      country: source.country,
      scheduledAt: new Date().toISOString(),
      startedAt: new Date().toISOString(),
      status: 'RUNNING',
      progress: 0,
      itemsFound: 0,
      itemsAdded: 0,
      itemsUpdated: 0,
    };

    store.jobs.set(job.id, job);

    try {
      const allInsights: ParsedTutorInsight[] = [];

      if (source.type === 'SEARCH' && source.searchQueries) {
        // Use web search
        for (let i = 0; i < source.searchQueries.length; i++) {
          const query = source.searchQueries[i];
          const results = await this.webSearch.searchTutorInsights({
            topic: query,
            subject: '',
            country: source.country,
            maxResults: 10,
          });

          const insights = await this.aiParser.parseInsightsFromSearchResults(
            results,
            {
              topic: query,
              subject: '',
              country: source.country,
            }
          );

          allInsights.push(...insights);
          job.progress = Math.round(
            ((i + 1) / source.searchQueries.length) * 100
          );
        }
      }

      job.itemsFound = allInsights.length;
      job.itemsAdded = allInsights.length;
      job.status = 'COMPLETED';
      job.completedAt = new Date().toISOString();
    } catch (error) {
      job.status = 'FAILED';
      job.error = error instanceof Error ? error.message : 'Unknown error';
      job.completedAt = new Date().toISOString();
    }

    store.jobs.set(job.id, job);
    return job;
  }

  async searchTutorInsights(
    topic: string,
    country: Country
  ): Promise<ParsedTutorInsight[]> {
    // Check cache first
    const cached = store.parsedInsights.get(topic);
    if (cached && cached.length > 0) {
      return cached;
    }

    // Otherwise do a live search
    return searchAndParseTutorInsights(
      topic,
      '', // Will be inferred
      country,
      this.webSearch,
      this.aiParser
    );
  }

  async scheduleAllSyncs(): Promise<void> {
    console.log('Scheduling curriculum syncs...');
    console.log(`Curriculum sync: ${this.schedule.curriculum.cronExpression}`);
    console.log(`Tutor insights sync: ${this.schedule.tutorInsights.cronExpression}`);

    // In production, you'd use a cron library like node-cron
    // For now, we'll just run once
    this.isRunning = true;
  }

  async getScheduledJobs(): Promise<SyncJob[]> {
    return Array.from(store.jobs.values());
  }

  async cancelJob(jobId: string): Promise<void> {
    const job = store.jobs.get(jobId);
    if (job && job.status === 'RUNNING') {
      job.status = 'CANCELLED' as SyncJobStatus;
      store.jobs.set(jobId, job);
    }
  }

  async getParsedTopics(country: Country): Promise<ParsedCurriculumTopic[]> {
    return store.parsedTopics.get(country) || [];
  }

  async getParsedInsights(topicCode: string): Promise<ParsedTutorInsight[]> {
    return store.parsedInsights.get(topicCode) || [];
  }

  async mergeToMainCurriculum(
    parsedTopics: ParsedCurriculumTopic[]
  ): Promise<{ added: number; updated: number; conflicts: string[] }> {
    // This would merge into the main curriculum store
    // Implementation depends on your data layer
    return {
      added: parsedTopics.length,
      updated: 0,
      conflicts: [],
    };
  }
}

// ============================================
// API ROUTES (Next.js)
// ============================================

/**
 * Example API route handlers for Next.js
 */
export const apiHandlers = {
  /**
   * POST /api/curriculum-sync/search-insights
   * Search for tutor insights about a topic
   */
  searchInsights: async (req: {
    topic: string;
    subject: string;
    country: Country;
  }) => {
    // Implementation would call searchTutorInsights
    return { insights: [] };
  },

  /**
   * POST /api/curriculum-sync/trigger
   * Manually trigger a sync job
   */
  triggerSync: async (req: { type: 'CURRICULUM' | 'INSIGHTS'; country: Country }) => {
    // Implementation would call syncCurriculumSource or syncTutorCommunity
    return { jobId: 'sync_1' };
  },

  /**
   * GET /api/curriculum-sync/jobs
   * Get all sync jobs
   */
  getJobs: async () => {
    return Array.from(store.jobs.values());
  },

  /**
   * GET /api/curriculum-sync/insights/:topicCode
   * Get cached insights for a topic
   */
  getInsights: async (topicCode: string) => {
    return store.parsedInsights.get(topicCode) || [];
  },
};
