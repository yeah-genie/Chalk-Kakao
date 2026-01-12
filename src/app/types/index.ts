export type IdeaStatus = 'inbox' | 'evaluating' | 'experiment' | 'launched' | 'killed';

export interface Evaluation {
  id: string;
  evaluatorId: string;
  evaluatorName: string;
  scores: {
    market: number;
    revenue: number;
    effort: number;
    teamFit: number;
    learning: number;
  };
  comment?: string;
  createdAt: Date;
}

export interface PostMortem {
  reason: string;
  learnings: string;
  wouldReconsiderWhen?: string;
  createdAt: Date;
  createdBy: string;
}

export interface Idea {
  id: string;
  title: string;
  description: string;
  tags: string[];
  status: IdeaStatus;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  evaluations: Evaluation[];
  avgScore?: number;
  postMortem?: PostMortem;
  linkedIssueUrl?: string;
}

export function calculateAverageScore(evaluations: Evaluation[]): number {
  if (evaluations.length === 0) return 0;
  
  const totalScores = evaluations.reduce((acc, evaluation) => {
    const { market, revenue, effort, teamFit, learning } = evaluation.scores;
    const effortNormalized = 6 - effort;
    return acc + market + revenue + effortNormalized + teamFit + learning;
  }, 0);
  
  const maxPossible = 5 * 5 * evaluations.length;
  return Math.round((totalScores / maxPossible) * 100);
}

export const scoreLabels: Record<string, string> = {
  market: 'Market Potential',
  revenue: 'Revenue Impact',
  effort: 'Effort Required',
  teamFit: 'Team Fit',
  learning: 'Learning Value',
};

export const statusConfig: Record<IdeaStatus, { label: string; color: string }> = {
  inbox: { label: 'Inbox', color: '#6b6b6b' },
  evaluating: { label: 'Evaluating', color: '#facc15' },
  experiment: { label: 'Experiment', color: '#5e6ad2' },
  launched: { label: 'Launched', color: '#4ade80' },
  killed: { label: 'Killed', color: '#f87171' },
};

