import { createServerSupabaseClient } from './supabase/server';
import { type Subject, type Topic } from './knowledge-graph';

export async function fetchSubjectData(subjectId: string): Promise<Subject | null> {
    try {
        const supabase = await createServerSupabaseClient();

        // 1. Fetch Subject Info
        const { data: subject, error: sError } = await supabase
            .from('kb_subjects')
            .select('*')
            .eq('id', subjectId)
            .single();

        if (sError || !subject) return null;

        // 2. Fetch Units (via Modules for now, simplified to all units in subject)
        const { data: units, error: uError } = await supabase
            .from('kb_units')
            .select('*, kb_modules!inner(subject_id)')
            .eq('kb_modules.subject_id', subjectId);

        if (uError) {
            console.error("Error fetching units (DB):", uError);
            return null;
        }

        // 3. Fetch Topics for these units
        const unitIds = units.map(u => u.id);
        const { data: topics, error: tError } = await supabase
            .from('kb_topics')
            .select('*')
            .in('unit_id', unitIds);

        if (tError) {
            console.error("Error fetching topics (DB):", tError);
            return null;
        }

        // 4. Transform into legacy Subject/Topic format for compatibility
        const allTopics: Topic[] = [
            ...units.map(u => ({
                id: u.id,
                code: u.id,
                name: u.name,
                importance: 'core' as const,
                examWeight: u.weight
            })),
            ...topics.map(t => ({
                id: t.id,
                code: t.id,
                name: t.name,
                parentId: t.unit_id,
                importance: 'core' as const,
                dependencies: t.dependencies
            }))
        ];

        return {
            id: subject.id,
            code: subject.id.toUpperCase().replace(/-/g, '_'),
            name: subject.name,
            topics: allTopics
        };
    } catch (e) {
        console.error("Error fetching subject data (System):", e);
        return null;
    }
}
