/**
 * Curriculum Constants
 *
 * Metadata for supported curricula, subjects, and grade mappings.
 */

import type { Country, Subject, GradeLevel, Curriculum } from './schema';

// ============================================
// COUNTRY METADATA
// ============================================

export const COUNTRY_INFO: Record<
  Country,
  {
    name: string;
    nameLocal: string;
    gradeSystem: string;
    subjects: Subject[];
  }
> = {
  KR: {
    name: 'South Korea',
    nameLocal: '대한민국',
    gradeSystem: '초등 6년 + 중등 3년 + 고등 3년',
    subjects: [
      'MATH',
      'KOREAN',
      'ENGLISH',
      'SCIENCE',
      'SOCIAL_STUDIES',
      'HISTORY',
    ],
  },
  US: {
    name: 'United States',
    nameLocal: 'United States',
    gradeSystem: 'K-12',
    subjects: ['MATH', 'ENGLISH', 'SCIENCE', 'SOCIAL_STUDIES', 'HISTORY'],
  },
  UK: {
    name: 'United Kingdom',
    nameLocal: 'United Kingdom',
    gradeSystem: 'Key Stages 1-5',
    subjects: ['MATH', 'ENGLISH', 'SCIENCE', 'HISTORY'],
  },
  SG: {
    name: 'Singapore',
    nameLocal: 'Singapore',
    gradeSystem: 'Primary 6 + Secondary 4-5 + JC 2',
    subjects: ['MATH', 'ENGLISH', 'SCIENCE', 'CHINESE'],
  },
  JP: {
    name: 'Japan',
    nameLocal: '日本',
    gradeSystem: '小学校 6年 + 中学校 3年 + 高校 3年',
    subjects: ['MATH', 'JAPANESE', 'ENGLISH', 'SCIENCE', 'SOCIAL_STUDIES'],
  },
  CN: {
    name: 'China',
    nameLocal: '中国',
    gradeSystem: '小学 6年 + 初中 3年 + 高中 3年',
    subjects: ['MATH', 'CHINESE', 'ENGLISH', 'PHYSICS', 'CHEMISTRY', 'BIOLOGY'],
  },
};

// ============================================
// GRADE LEVEL MAPPINGS
// ============================================

export const GRADE_DISPLAY_NAME: Record<Country, Record<GradeLevel, string>> = {
  KR: {
    ELEMENTARY_1: '초등 1학년',
    ELEMENTARY_2: '초등 2학년',
    ELEMENTARY_3: '초등 3학년',
    ELEMENTARY_4: '초등 4학년',
    ELEMENTARY_5: '초등 5학년',
    ELEMENTARY_6: '초등 6학년',
    MIDDLE_1: '중학교 1학년',
    MIDDLE_2: '중학교 2학년',
    MIDDLE_3: '중학교 3학년',
    HIGH_1: '고등학교 1학년',
    HIGH_2: '고등학교 2학년',
    HIGH_3: '고등학교 3학년',
  },
  US: {
    ELEMENTARY_1: '1st Grade',
    ELEMENTARY_2: '2nd Grade',
    ELEMENTARY_3: '3rd Grade',
    ELEMENTARY_4: '4th Grade',
    ELEMENTARY_5: '5th Grade',
    ELEMENTARY_6: '6th Grade',
    MIDDLE_1: '7th Grade',
    MIDDLE_2: '8th Grade',
    MIDDLE_3: '9th Grade',
    HIGH_1: '10th Grade',
    HIGH_2: '11th Grade',
    HIGH_3: '12th Grade',
  },
  UK: {
    ELEMENTARY_1: 'Year 1',
    ELEMENTARY_2: 'Year 2',
    ELEMENTARY_3: 'Year 3',
    ELEMENTARY_4: 'Year 4',
    ELEMENTARY_5: 'Year 5',
    ELEMENTARY_6: 'Year 6',
    MIDDLE_1: 'Year 7',
    MIDDLE_2: 'Year 8',
    MIDDLE_3: 'Year 9',
    HIGH_1: 'Year 10 (GCSE)',
    HIGH_2: 'Year 11 (GCSE)',
    HIGH_3: 'Year 12/13 (A-Level)',
  },
  SG: {
    ELEMENTARY_1: 'Primary 1',
    ELEMENTARY_2: 'Primary 2',
    ELEMENTARY_3: 'Primary 3',
    ELEMENTARY_4: 'Primary 4',
    ELEMENTARY_5: 'Primary 5',
    ELEMENTARY_6: 'Primary 6',
    MIDDLE_1: 'Secondary 1',
    MIDDLE_2: 'Secondary 2',
    MIDDLE_3: 'Secondary 3',
    HIGH_1: 'Secondary 4',
    HIGH_2: 'JC 1',
    HIGH_3: 'JC 2',
  },
  JP: {
    ELEMENTARY_1: '小学1年',
    ELEMENTARY_2: '小学2年',
    ELEMENTARY_3: '小学3年',
    ELEMENTARY_4: '小学4年',
    ELEMENTARY_5: '小学5年',
    ELEMENTARY_6: '小学6年',
    MIDDLE_1: '中学1年',
    MIDDLE_2: '中学2年',
    MIDDLE_3: '中学3年',
    HIGH_1: '高校1年',
    HIGH_2: '高校2年',
    HIGH_3: '高校3年',
  },
  CN: {
    ELEMENTARY_1: '一年级',
    ELEMENTARY_2: '二年级',
    ELEMENTARY_3: '三年级',
    ELEMENTARY_4: '四年级',
    ELEMENTARY_5: '五年级',
    ELEMENTARY_6: '六年级',
    MIDDLE_1: '初一',
    MIDDLE_2: '初二',
    MIDDLE_3: '初三',
    HIGH_1: '高一',
    HIGH_2: '高二',
    HIGH_3: '高三',
  },
};

// ============================================
// SUBJECT METADATA
// ============================================

export const SUBJECT_INFO: Record<
  Subject,
  {
    name: string;
    nameKo: string;
    icon: string;
    color: string;
  }
> = {
  MATH: {
    name: 'Mathematics',
    nameKo: '수학',
    icon: '📐',
    color: '#3B82F6',
  },
  KOREAN: {
    name: 'Korean',
    nameKo: '국어',
    icon: '📚',
    color: '#8B5CF6',
  },
  ENGLISH: {
    name: 'English',
    nameKo: '영어',
    icon: '🔤',
    color: '#EC4899',
  },
  SCIENCE: {
    name: 'Science',
    nameKo: '과학',
    icon: '🔬',
    color: '#10B981',
  },
  SOCIAL_STUDIES: {
    name: 'Social Studies',
    nameKo: '사회',
    icon: '🌍',
    color: '#F59E0B',
  },
  HISTORY: {
    name: 'History',
    nameKo: '역사',
    icon: '📜',
    color: '#6366F1',
  },
  PHYSICS: {
    name: 'Physics',
    nameKo: '물리',
    icon: '⚛️',
    color: '#0EA5E9',
  },
  CHEMISTRY: {
    name: 'Chemistry',
    nameKo: '화학',
    icon: '🧪',
    color: '#14B8A6',
  },
  BIOLOGY: {
    name: 'Biology',
    nameKo: '생물',
    icon: '🧬',
    color: '#22C55E',
  },
  EARTH_SCIENCE: {
    name: 'Earth Science',
    nameKo: '지구과학',
    icon: '🌎',
    color: '#64748B',
  },
  CHINESE: {
    name: 'Chinese',
    nameKo: '중국어',
    icon: '🇨🇳',
    color: '#DC2626',
  },
  JAPANESE: {
    name: 'Japanese',
    nameKo: '일본어',
    icon: '🇯🇵',
    color: '#BE185D',
  },
};

// ============================================
// ACTIVE CURRICULA
// ============================================

export const SUPPORTED_CURRICULA: Curriculum[] = [
  {
    id: 'kr-2022',
    country: 'KR',
    name: '2022 개정 교육과정',
    version: '2022',
    effectiveFrom: '2024-03-01',
    isActive: true,
  },
  {
    id: 'kr-2015',
    country: 'KR',
    name: '2015 개정 교육과정',
    version: '2015',
    effectiveFrom: '2018-03-01',
    effectiveTo: '2024-02-28',
    isActive: false,
  },
  {
    id: 'us-common-core',
    country: 'US',
    name: 'Common Core State Standards',
    version: '2010',
    effectiveFrom: '2010-06-02',
    isActive: true,
  },
  {
    id: 'uk-national',
    country: 'UK',
    name: 'National Curriculum',
    version: '2014',
    effectiveFrom: '2014-09-01',
    isActive: true,
  },
  {
    id: 'sg-moe',
    country: 'SG',
    name: 'MOE Syllabus',
    version: '2021',
    effectiveFrom: '2021-01-01',
    isActive: true,
  },
];

// ============================================
// GRADE EQUIVALENCE (Cross-country mapping)
// ============================================

/**
 * Maps grades across countries for the same approximate age
 * Key: "age in years"
 */
export const GRADE_BY_AGE: Record<number, Partial<Record<Country, GradeLevel>>> = {
  6: { KR: 'ELEMENTARY_1', US: 'ELEMENTARY_1', UK: 'ELEMENTARY_1', SG: 'ELEMENTARY_1' },
  7: { KR: 'ELEMENTARY_2', US: 'ELEMENTARY_2', UK: 'ELEMENTARY_2', SG: 'ELEMENTARY_2' },
  8: { KR: 'ELEMENTARY_3', US: 'ELEMENTARY_3', UK: 'ELEMENTARY_3', SG: 'ELEMENTARY_3' },
  9: { KR: 'ELEMENTARY_4', US: 'ELEMENTARY_4', UK: 'ELEMENTARY_4', SG: 'ELEMENTARY_4' },
  10: { KR: 'ELEMENTARY_5', US: 'ELEMENTARY_5', UK: 'ELEMENTARY_5', SG: 'ELEMENTARY_5' },
  11: { KR: 'ELEMENTARY_6', US: 'ELEMENTARY_6', UK: 'ELEMENTARY_6', SG: 'ELEMENTARY_6' },
  12: { KR: 'MIDDLE_1', US: 'MIDDLE_1', UK: 'MIDDLE_1', SG: 'MIDDLE_1' },
  13: { KR: 'MIDDLE_2', US: 'MIDDLE_2', UK: 'MIDDLE_2', SG: 'MIDDLE_2' },
  14: { KR: 'MIDDLE_3', US: 'MIDDLE_3', UK: 'MIDDLE_3', SG: 'MIDDLE_3' },
  15: { KR: 'HIGH_1', US: 'HIGH_1', UK: 'HIGH_1', SG: 'HIGH_1' },
  16: { KR: 'HIGH_2', US: 'HIGH_2', UK: 'HIGH_2', SG: 'HIGH_2' },
  17: { KR: 'HIGH_3', US: 'HIGH_3', UK: 'HIGH_3', SG: 'HIGH_3' },
};

// ============================================
// TOPIC CODE GENERATION
// ============================================

/**
 * Generate a standardized topic code
 * Format: {COUNTRY}-{SUBJECT}-{GRADE_SHORT}-{TOPIC_SLUG}
 *
 * Example: KR-MATH-M2-LINEAR-EQ
 */
export function generateTopicCode(
  country: Country,
  subject: Subject,
  grade: GradeLevel,
  topicSlug: string
): string {
  const gradeShort = getGradeShortCode(grade);
  return `${country}-${subject}-${gradeShort}-${topicSlug.toUpperCase().replace(/\s+/g, '-')}`;
}

function getGradeShortCode(grade: GradeLevel): string {
  const mapping: Record<GradeLevel, string> = {
    ELEMENTARY_1: 'E1',
    ELEMENTARY_2: 'E2',
    ELEMENTARY_3: 'E3',
    ELEMENTARY_4: 'E4',
    ELEMENTARY_5: 'E5',
    ELEMENTARY_6: 'E6',
    MIDDLE_1: 'M1',
    MIDDLE_2: 'M2',
    MIDDLE_3: 'M3',
    HIGH_1: 'H1',
    HIGH_2: 'H2',
    HIGH_3: 'H3',
  };
  return mapping[grade];
}
