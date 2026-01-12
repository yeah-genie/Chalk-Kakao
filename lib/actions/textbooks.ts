"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type {
    Textbook,
    TextbookInsert,
    TextbookChapter,
    TextbookChapterInsert,
    TextbookTopicMapping,
    TextbookWithChapters,
} from "@/lib/types/database";

// ===================================
// TEXTBOOK CRUD
// ===================================

export async function searchTextbooks(query: {
    search?: string;
    subject?: string;
    publisher?: string;
    grade?: string;
    limit?: number;
}): Promise<Textbook[]> {
    try {
        const supabase = await createServerSupabaseClient();
        let dbQuery = supabase
            .from("textbooks")
            .select("*")
            .order("usage_count", { ascending: false });

        if (query.search) {
            dbQuery = dbQuery.or(`title.ilike.%${query.search}%,publisher.ilike.%${query.search}%`);
        }
        if (query.subject) {
            dbQuery = dbQuery.eq("subject", query.subject);
        }
        if (query.publisher) {
            dbQuery = dbQuery.eq("publisher", query.publisher);
        }
        if (query.grade) {
            dbQuery = dbQuery.eq("grade", query.grade);
        }
        if (query.limit) {
            dbQuery = dbQuery.limit(query.limit);
        }

        const { data, error } = await dbQuery;

        if (error) {
            console.error("Error searching textbooks:", error);
            return [];
        }

        return data || [];
    } catch (e) {
        console.error("Error searching textbooks:", e);
        return [];
    }
}

export async function getTextbook(id: string): Promise<TextbookWithChapters | null> {
    try {
        const supabase = await createServerSupabaseClient();

        const { data, error } = await supabase
            .from("textbooks")
            .select(`
                *,
                chapters:textbook_chapters(
                    *,
                    topic_mappings:textbook_topic_mappings(*)
                )
            `)
            .eq("id", id)
            .single();

        if (error) {
            console.error("Error fetching textbook:", error);
            return null;
        }

        return data as TextbookWithChapters;
    } catch (e) {
        console.error("Error fetching textbook:", e);
        return null;
    }
}

export async function createTextbook(textbook: TextbookInsert) {
    try {
        const supabase = await createServerSupabaseClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return { success: false, error: "Authentication required" };
        }

        const { data, error } = await supabase
            .from("textbooks")
            .insert({
                ...textbook,
                created_by: user.id,
            })
            .select()
            .single();

        if (error) {
            console.error("Error creating textbook:", error);
            return { success: false, error: error.message };
        }

        revalidatePath("/dashboard/textbooks");
        return { success: true, data };
    } catch (e: any) {
        console.error("Error creating textbook:", e);
        return { success: false, error: e.message };
    }
}

export async function getTextbookFilters() {
    try {
        const supabase = await createServerSupabaseClient();

        const [subjectsRes, publishersRes, gradesRes] = await Promise.all([
            supabase.from("textbooks").select("subject").order("subject"),
            supabase.from("textbooks").select("publisher").order("publisher"),
            supabase.from("textbooks").select("grade").order("grade"),
        ]);

        const subjects = [...new Set((subjectsRes.data || []).map(t => t.subject))];
        const publishers = [...new Set((publishersRes.data || []).map(t => t.publisher))];
        const grades = [...new Set((gradesRes.data || []).map(t => t.grade))];

        return { subjects, publishers, grades };
    } catch (e) {
        console.error("Error fetching textbook filters:", e);
        return { subjects: [], publishers: [], grades: [] };
    }
}

// ===================================
// TEXTBOOK CHAPTERS
// ===================================

export async function addTextbookChapter(chapter: TextbookChapterInsert) {
    try {
        const supabase = await createServerSupabaseClient();

        const { data, error } = await supabase
            .from("textbook_chapters")
            .insert(chapter)
            .select()
            .single();

        if (error) {
            console.error("Error adding chapter:", error);
            return { success: false, error: error.message };
        }

        revalidatePath("/dashboard/textbooks");
        return { success: true, data };
    } catch (e: any) {
        console.error("Error adding chapter:", e);
        return { success: false, error: e.message };
    }
}

export async function updateTextbookChapter(id: string, updates: Partial<TextbookChapterInsert>) {
    try {
        const supabase = await createServerSupabaseClient();

        const { error } = await supabase
            .from("textbook_chapters")
            .update(updates)
            .eq("id", id);

        if (error) {
            console.error("Error updating chapter:", error);
            return { success: false, error: error.message };
        }

        revalidatePath("/dashboard/textbooks");
        return { success: true };
    } catch (e: any) {
        console.error("Error updating chapter:", e);
        return { success: false, error: e.message };
    }
}

// ===================================
// TOPIC MAPPINGS
// ===================================

export async function addTopicMapping(mapping: {
    textbook_chapter_id: string;
    topic_id: string;
    mapping_confidence?: number;
}) {
    try {
        const supabase = await createServerSupabaseClient();
        const { data: { user } } = await supabase.auth.getUser();

        const { data, error } = await supabase
            .from("textbook_topic_mappings")
            .insert({
                ...mapping,
                mapped_by: user?.id,
            })
            .select()
            .single();

        if (error) {
            console.error("Error adding topic mapping:", error);
            return { success: false, error: error.message };
        }

        revalidatePath("/dashboard/textbooks");
        return { success: true, data };
    } catch (e: any) {
        console.error("Error adding topic mapping:", e);
        return { success: false, error: e.message };
    }
}

export async function getChaptersByTopic(topicId: string): Promise<(TextbookChapter & { textbook: Textbook })[]> {
    try {
        const supabase = await createServerSupabaseClient();

        const { data, error } = await supabase
            .from("textbook_topic_mappings")
            .select(`
                textbook_chapters!inner(
                    *,
                    textbook:textbooks(*)
                )
            `)
            .eq("topic_id", topicId);

        if (error) {
            console.error("Error fetching chapters by topic:", error);
            return [];
        }

        return (data || []).map((m: any) => ({
            ...m.textbook_chapters,
            textbook: m.textbook_chapters.textbook,
        }));
    } catch (e) {
        console.error("Error fetching chapters by topic:", e);
        return [];
    }
}

export async function incrementTextbookUsage(textbookId: string) {
    try {
        const supabase = await createServerSupabaseClient();
        await supabase.rpc("increment_textbook_usage", { textbook_id: textbookId });
        return { success: true };
    } catch (e) {
        console.error("Error incrementing textbook usage:", e);
        return { success: false };
    }
}

// ===================================
// POPULAR & VERIFIED TEXTBOOKS
// ===================================

export async function getPopularTextbooks(limit = 10): Promise<Textbook[]> {
    try {
        const supabase = await createServerSupabaseClient();

        const { data, error } = await supabase
            .from("textbooks")
            .select("*")
            .order("usage_count", { ascending: false })
            .limit(limit);

        if (error) {
            console.error("Error fetching popular textbooks:", error);
            return [];
        }

        return data || [];
    } catch (e) {
        console.error("Error fetching popular textbooks:", e);
        return [];
    }
}

export async function getVerifiedTextbooks(): Promise<Textbook[]> {
    try {
        const supabase = await createServerSupabaseClient();

        const { data, error } = await supabase
            .from("textbooks")
            .select("*")
            .eq("is_verified", true)
            .order("usage_count", { ascending: false });

        if (error) {
            console.error("Error fetching verified textbooks:", error);
            return [];
        }

        return data || [];
    } catch (e) {
        console.error("Error fetching verified textbooks:", e);
        return [];
    }
}
