/**
 * Curriculum Auto-Sync System
 *
 * Automatically keeps curriculum data up-to-date:
 *
 * 1. OFFICIAL SOURCES (Weekly)
 *    - Crawls education ministry websites
 *    - Parses curriculum documents with AI
 *    - Detects changes and updates
 *
 * 2. TUTOR COMMUNITY (Daily)
 *    - Web searches for tutor tips and insights
 *    - Parses forum discussions
 *    - Extracts struggle patterns
 *
 * 3. REAL-TIME (On Demand)
 *    - Search for specific topic insights
 *    - Get latest teaching tips
 *
 * No manual monitoring needed - runs automatically.
 *
 * Usage:
 * ```typescript
 * import { CurriculumSyncService } from '@/services/curriculum-sync';
 *
 * const syncService = new CurriculumSyncService(webSearch, aiParser);
 *
 * // Schedule automatic syncs
 * await syncService.scheduleAllSyncs();
 *
 * // Or search on-demand
 * const insights = await syncService.searchTutorInsights('일차방정식', 'KR');
 * ```
 */

// Types
export * from './types';

// Web Search
export * from './web-search';

// Service
export { CurriculumSyncService, DEFAULT_SCHEDULE } from './service';
