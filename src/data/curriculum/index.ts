/**
 * Curriculum Module
 *
 * Scalable curriculum data system supporting:
 * - Multiple countries (Korea, US, UK, Singapore, etc.)
 * - All subjects (Math, Science, English, etc.)
 * - Prerequisite relationships
 * - Diagnostic patterns from tutor communities
 */

// Schema types
export * from './schema';

// Constants and metadata
export * from './constants';

// Loader types
export * from './loaders/types';

// Seed data
export { KR_MATH_MIDDLE } from './seeds/kr-math-middle';
