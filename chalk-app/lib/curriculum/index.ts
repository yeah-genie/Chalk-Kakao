// Curriculum types and utilities
import subjectsData from './subjects.json';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CURRICULUM_CACHE_KEY = 'chalk_curriculum_cache';

export interface Topic {
    id: string;
    name: string;
}

export interface Unit {
    id: string;
    name: string;
    weight: number;
    topics: Topic[];
}

export interface Subject {
    id: string;
    name: string;
    category: string;
    source: string;
    units: Unit[];
}

export interface CurriculumData {
    subjects: Subject[];
}

// Internal state for loaded curriculum
let activeCurriculum: CurriculumData = subjectsData as CurriculumData;

// Initialize or load from cache
export async function initializeCurriculum(): Promise<void> {
    try {
        const cached = await AsyncStorage.getItem(CURRICULUM_CACHE_KEY);
        if (cached) {
            activeCurriculum = JSON.parse(cached);
            console.log('[Curriculum] Loaded from cache');
        }
    } catch (err) {
        console.error('[Curriculum] Failed to load cache:', err);
    }
}

// Sync with server (Supabase)
export async function syncCurriculum(): Promise<boolean> {
    try {
        console.log('[Curriculum] Syncing with server...');
        // TODO: Actual Supabase fetch
        // const { data, error } = await supabase.from('curriculums').select('*');
        // if (error) throw error;

        // Simulation of update
        await new Promise(resolve => setTimeout(resolve, 1000));

        // For now, we just save the bundled data to cache to simulate a sync
        await AsyncStorage.setItem(CURRICULUM_CACHE_KEY, JSON.stringify(subjectsData));
        activeCurriculum = subjectsData as CurriculumData;

        console.log('[Curriculum] Sync complete');
        return true;
    } catch (err) {
        console.error('[Curriculum] Sync failed:', err);
        return false;
    }
}

// Get all available subjects
export function getSubjects(): Subject[] {
    return activeCurriculum.subjects;
}

// Get a specific subject by ID
export function getSubjectById(id: string): Subject | undefined {
    return getSubjects().find(s => s.id === id);
}

// Get all units for a subject
export function getUnits(subjectId: string): Unit[] {
    const subject = getSubjectById(subjectId);
    return subject?.units || [];
}

// Get all topics for a unit
export function getTopics(subjectId: string, unitId: string): Topic[] {
    const units = getUnits(subjectId);
    const unit = units.find(u => u.id === unitId);
    return unit?.topics || [];
}

// Get total topic count for a subject
export function getTotalTopics(subjectId: string): number {
    const units = getUnits(subjectId);
    return units.reduce((sum, unit) => sum + unit.topics.length, 0);
}

// Create initial mastery map for a subject (all topics at 0%)
export function createInitialMasteryMap(subjectId: string): Map<string, number> {
    const masteryMap = new Map<string, number>();
    const units = getUnits(subjectId);

    units.forEach(unit => {
        unit.topics.forEach(topic => {
            masteryMap.set(topic.id, 0);
        });
    });

    return masteryMap;
}

// Calculate overall mastery percentage for a subject
export function calculateOverallMastery(masteryMap: Map<string, number>): number {
    if (masteryMap.size === 0) return 0;

    let total = 0;
    masteryMap.forEach(value => {
        total += value;
    });

    return Math.round(total / masteryMap.size);
}

// Calculate unit-level mastery
export function calculateUnitMastery(
    subjectId: string,
    unitId: string,
    masteryMap: Map<string, number>
): number {
    const topics = getTopics(subjectId, unitId);
    if (topics.length === 0) return 0;

    let total = 0;
    topics.forEach(topic => {
        total += masteryMap.get(topic.id) || 0;
    });

    return Math.round(total / topics.length);
}
