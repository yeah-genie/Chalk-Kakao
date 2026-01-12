/**
 * Curriculum Service - In-Memory Implementation
 *
 * This is a basic in-memory implementation for MVP.
 * Can be replaced with database-backed implementation later.
 */

import type {
  Topic,
  TopicWithRelations,
  Prerequisite,
  CommonStruggle,
  TutorTip,
  GapAnalysis,
  LearningPath,
  ICurriculumService,
  Subject,
  GradeLevel,
} from './schema';
import type { CurriculumSeedData, TopicSeed } from './loaders/types';

// ============================================
// IN-MEMORY STORE
// ============================================

interface CurriculumStore {
  topics: Map<string, Topic>;
  prerequisites: Prerequisite[];
  struggles: Map<string, CommonStruggle[]>;
  tips: Map<string, TutorTip[]>;
}

const store: CurriculumStore = {
  topics: new Map(),
  prerequisites: [],
  struggles: new Map(),
  tips: new Map(),
};

// ============================================
// DATA LOADING
// ============================================

let idCounter = 0;
function generateId(): string {
  return `id_${++idCounter}`;
}

/**
 * Load seed data into in-memory store
 */
export function loadCurriculumData(data: CurriculumSeedData): void {
  const { meta, topics } = data;

  // First pass: create all topics
  for (const topicSeed of topics) {
    const topic = transformTopicSeed(topicSeed, meta.curriculumId);
    store.topics.set(topic.code, topic);

    // Load struggles
    if (topicSeed.struggles) {
      const struggles = topicSeed.struggles.map((s) => ({
        id: generateId(),
        topicId: topic.id,
        description: s.description,
        frequency: s.frequency || 'COMMON',
        symptom: s.symptom,
        rootCause: s.rootCause,
        remediation: s.remediation,
        prerequisiteGapTopicId: s.prerequisiteGap
          ? store.topics.get(s.prerequisiteGap)?.id
          : undefined,
        reportCount: 1,
      } as CommonStruggle));
      store.struggles.set(topic.code, struggles);
    }

    // Load tips
    if (topicSeed.tips) {
      const tips = topicSeed.tips.map((t) => ({
        id: generateId(),
        topicId: topic.id,
        tip: t.tip,
        context: t.context,
        source: t.source || 'unknown',
        upvotes: 0,
        createdAt: new Date().toISOString(),
      } as TutorTip));
      store.tips.set(topic.code, tips);
    }
  }

  // Second pass: create prerequisites (now all topics exist)
  for (const topicSeed of topics) {
    if (topicSeed.prerequisites) {
      const topic = store.topics.get(topicSeed.code);
      if (!topic) continue;

      for (const prereq of topicSeed.prerequisites) {
        const prereqTopic = store.topics.get(prereq.code);
        if (!prereqTopic) {
          console.warn(`Prerequisite not found: ${prereq.code} for ${topicSeed.code}`);
          continue;
        }

        store.prerequisites.push({
          id: generateId(),
          topicId: topic.id,
          prerequisiteTopicId: prereqTopic.id,
          strength: prereq.strength || 'REQUIRED',
          reason: prereq.reason,
        });
      }
    }
  }

  console.log(`Loaded ${store.topics.size} topics, ${store.prerequisites.length} prerequisites`);
}

function transformTopicSeed(seed: TopicSeed, curriculumId: string): Topic {
  return {
    id: generateId(),
    curriculumId,
    subject: 'MATH', // Inferred from context for now
    gradeLevel: seed.grade,
    code: seed.code,
    name: seed.name,
    nameEn: seed.nameEn,
    chapter: seed.chapter,
    unit: seed.unit,
    orderInGrade: seed.order || 0,
    estimatedHours: seed.hours || 8,
    difficulty: seed.difficulty || 3,
    description: seed.description,
    learningObjectives: seed.objectives || [],
    keyTerms: seed.keyTerms || [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

// ============================================
// SERVICE IMPLEMENTATION
// ============================================

class InMemoryCurriculumService implements ICurriculumService {
  async getTopicById(id: string): Promise<TopicWithRelations | null> {
    for (const topic of store.topics.values()) {
      if (topic.id === id) {
        return this.enrichTopic(topic);
      }
    }
    return null;
  }

  async getTopicByCode(code: string): Promise<TopicWithRelations | null> {
    const topic = store.topics.get(code);
    if (!topic) return null;
    return this.enrichTopic(topic);
  }

  async getTopicsByGrade(
    curriculumId: string,
    subject: Subject,
    grade: GradeLevel
  ): Promise<Topic[]> {
    const topics: Topic[] = [];
    for (const topic of store.topics.values()) {
      if (
        topic.curriculumId === curriculumId &&
        topic.subject === subject &&
        topic.gradeLevel === grade
      ) {
        topics.push(topic);
      }
    }
    return topics.sort((a, b) => a.orderInGrade - b.orderInGrade);
  }

  async getAllPrerequisites(topicId: string): Promise<Topic[]> {
    const result: Topic[] = [];
    const visited = new Set<string>();

    const collect = (id: string) => {
      if (visited.has(id)) return;
      visited.add(id);

      const prereqs = store.prerequisites.filter((p) => p.topicId === id);
      for (const prereq of prereqs) {
        const prereqTopic = this.getTopicByIdSync(prereq.prerequisiteTopicId);
        if (prereqTopic) {
          result.push(prereqTopic);
          collect(prereq.prerequisiteTopicId);
        }
      }
    };

    collect(topicId);
    return result;
  }

  async getDependentTopics(topicId: string): Promise<Topic[]> {
    const dependents: Topic[] = [];
    const prereqs = store.prerequisites.filter((p) => p.prerequisiteTopicId === topicId);

    for (const prereq of prereqs) {
      const topic = this.getTopicByIdSync(prereq.topicId);
      if (topic) dependents.push(topic);
    }

    return dependents;
  }

  async diagnoseGaps(
    targetTopicId: string,
    studentResponses: { questionId: string; answer: string }[]
  ): Promise<GapAnalysis> {
    // Simplified implementation - real one would analyze responses
    const targetTopic = await this.getTopicById(targetTopicId);
    if (!targetTopic) throw new Error(`Topic not found: ${targetTopicId}`);

    const prerequisites = await this.getAllPrerequisites(targetTopicId);
    const recommendedPath = await this.generateLearningPath(targetTopicId, []);

    return {
      studentId: 'current',
      assessedAt: new Date().toISOString(),
      targetTopic: targetTopic,
      gaps: prerequisites.slice(0, 3).map((topic) => ({
        topic,
        severity: 'MODERATE' as const,
        evidence: 'Prerequisite not confirmed',
        estimatedHoursToFix: topic.estimatedHours,
      })),
      recommendedPath,
    };
  }

  async generateLearningPath(
    targetTopicId: string,
    knownTopicIds: string[]
  ): Promise<LearningPath> {
    const targetTopic = await this.getTopicById(targetTopicId);
    if (!targetTopic) throw new Error(`Topic not found: ${targetTopicId}`);

    const allPrereqs = await this.getAllPrerequisites(targetTopicId);
    const knownSet = new Set(knownTopicIds);

    // Filter out known topics and sort by grade level
    const neededTopics = allPrereqs.filter((t) => !knownSet.has(t.id));

    const gradeOrder: Record<GradeLevel, number> = {
      ELEMENTARY_1: 1,
      ELEMENTARY_2: 2,
      ELEMENTARY_3: 3,
      ELEMENTARY_4: 4,
      ELEMENTARY_5: 5,
      ELEMENTARY_6: 6,
      MIDDLE_1: 7,
      MIDDLE_2: 8,
      MIDDLE_3: 9,
      HIGH_1: 10,
      HIGH_2: 11,
      HIGH_3: 12,
    };

    neededTopics.sort(
      (a, b) => gradeOrder[a.gradeLevel] - gradeOrder[b.gradeLevel]
    );

    const steps = [
      ...neededTopics.map((topic, i) => ({
        order: i + 1,
        topicId: topic.id,
        topic,
        estimatedHours: topic.estimatedHours,
        isPrerequisite: true,
      })),
      {
        order: neededTopics.length + 1,
        topicId: targetTopic.id,
        topic: targetTopic,
        estimatedHours: targetTopic.estimatedHours,
        isPrerequisite: false,
      },
    ];

    return {
      id: generateId(),
      name: `Path to ${targetTopic.name}`,
      description: `Learning path covering ${steps.length} topics`,
      targetGrade: targetTopic.gradeLevel,
      targetTopic,
      steps,
      totalHours: steps.reduce((sum, s) => sum + s.estimatedHours, 0),
    };
  }

  async findEquivalentTopics(): Promise<never[]> {
    // Not implemented in MVP
    return [];
  }

  // Helper methods
  private getTopicByIdSync(id: string): Topic | undefined {
    for (const topic of store.topics.values()) {
      if (topic.id === id) return topic;
    }
    return undefined;
  }

  private enrichTopic(topic: Topic): TopicWithRelations {
    const prerequisites = store.prerequisites
      .filter((p) => p.topicId === topic.id)
      .map((p) => ({
        ...p,
        prerequisiteTopic: this.getTopicByIdSync(p.prerequisiteTopicId)!,
      }))
      .filter((p) => p.prerequisiteTopic);

    const dependents = store.prerequisites
      .filter((p) => p.prerequisiteTopicId === topic.id)
      .map((p) => ({
        ...p,
        topic: this.getTopicByIdSync(p.topicId)!,
      }))
      .filter((p) => p.topic);

    return {
      ...topic,
      prerequisites,
      dependents,
      commonStruggles: store.struggles.get(topic.code) || [],
      tutorTips: store.tips.get(topic.code) || [],
      diagnosticQuestions: [],
    };
  }
}

// Export singleton instance
export const curriculumService = new InMemoryCurriculumService();

// Auto-load Korean math on import
import { KR_MATH_MIDDLE } from './seeds/kr-math-middle';
loadCurriculumData(KR_MATH_MIDDLE);
