"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function getPendingProposals() {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
        .from('kb_proposed_taxonomy')
        .select(`
            *,
            kb_subjects (name),
            sessions (student_id, students (name))
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Error fetching proposals:", error);
        return [];
    }
    return data || [];
}

export async function approveProposal(proposalId: string) {
    const supabase = await createServerSupabaseClient();

    // 1. Fetch proposal detail
    const { data: prop, error: pError } = await supabase
        .from('kb_proposed_taxonomy')
        .select('*')
        .eq('id', proposalId)
        .single();

    if (pError || !prop) return { success: false, error: "Proposal not found" };

    try {
        if (prop.type === 'unit') {
            // Create Unit
            // We need a module_id. For blank slates, we usually have a default module.
            const { data: mod } = await supabase
                .from('kb_modules')
                .select('id')
                .eq('subject_id', prop.subject_id)
                .limit(1)
                .single();

            const moduleId = mod?.id || `${prop.subject_id}-default`;

            await supabase.from('kb_units').insert({
                id: prop.name.toLowerCase().replace(/\s+/g, '-'),
                module_id: moduleId,
                name: prop.name,
                weight: 10 // default weight
            });
        } else if (prop.type === 'topic') {
            // Create Topic
            // parent_id in proposal is the suggested unit name or id.
            // If it's a new unit name, we might need to look it up or wait for unit approval.
            // Simple logic: lookup unit by name or id
            const { data: unit } = await supabase
                .from('kb_units')
                .select('id')
                .or(`id.eq.${prop.parent_id},name.eq.${prop.parent_id}`)
                .limit(1)
                .single();

            if (unit) {
                await supabase.from('kb_topics').insert({
                    id: prop.name.toLowerCase().replace(/\s+/g, '-'),
                    unit_id: unit.id,
                    name: prop.name
                });
            } else {
                return { success: false, error: "Parent Unit not found. Please approve the Unit first." };
            }
        }

        // 2. Mark as approved
        await supabase.from('kb_proposed_taxonomy')
            .update({ status: 'approved' })
            .eq('id', proposalId);

        revalidatePath('/dashboard');
        return { success: true };
    } catch (err: any) {
        console.error("Error approving proposal:", err);
        return { success: false, error: err.message };
    }
}

export async function rejectProposal(proposalId: string) {
    const supabase = await createServerSupabaseClient();
    const { error } = await supabase
        .from('kb_proposed_taxonomy')
        .update({ status: 'rejected' })
        .eq('id', proposalId);

    if (error) return { success: false, error: error.message };

    revalidatePath('/dashboard');
    return { success: true };
}
