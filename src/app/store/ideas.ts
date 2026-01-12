"use client";

import { create } from "zustand";
import { Idea, IdeaStatus, Evaluation, calculateAverageScore } from "../types";

interface IdeasState {
  ideas: Idea[];
  addIdea: (title: string, description: string, tags?: string[]) => void;
  updateIdeaStatus: (id: string, status: IdeaStatus) => void;
  addEvaluation: (ideaId: string, evaluation: Omit<Evaluation, "id" | "createdAt">) => void;
  deleteIdea: (id: string) => void;
}

const generateId = () => Math.random().toString(36).substring(2, 9);

// Sample data
const sampleIdeas: Idea[] = [
  {
    id: "1",
    title: "AI-powered search",
    description: "Add semantic search to help users find content faster using AI embeddings",
    tags: ["AI", "Search", "UX"],
    status: "inbox",
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    createdBy: "Alex",
    evaluations: [],
  },
  {
    id: "2",
    title: "Mobile app v2",
    description: "Complete redesign of the mobile app with new navigation and offline support",
    tags: ["Mobile", "Design"],
    status: "inbox",
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    createdBy: "Jordan",
    evaluations: [],
  },
  {
    id: "3",
    title: "Dashboard redesign",
    description: "Modernize the analytics dashboard with better visualizations",
    tags: ["Design", "Analytics"],
    status: "evaluating",
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    createdBy: "Sam",
    evaluations: [
      {
        id: "e1",
        evaluatorId: "u1",
        evaluatorName: "Alex",
        scores: { market: 4, revenue: 3, effort: 3, teamFit: 5, learning: 3 },
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      },
    ],
    avgScore: 72,
  },
  {
    id: "4",
    title: "Slack integration",
    description: "Allow users to receive notifications and interact via Slack",
    tags: ["Integration", "Slack"],
    status: "evaluating",
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    createdBy: "Chris",
    evaluations: [
      {
        id: "e2",
        evaluatorId: "u1",
        evaluatorName: "Alex",
        scores: { market: 5, revenue: 4, effort: 2, teamFit: 4, learning: 2 },
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      },
      {
        id: "e3",
        evaluatorId: "u2",
        evaluatorName: "Jordan",
        scores: { market: 4, revenue: 4, effort: 3, teamFit: 5, learning: 3 },
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      },
    ],
    avgScore: 78,
  },
  {
    id: "5",
    title: "Onboarding flow",
    description: "Improve first-time user experience with interactive tutorials",
    tags: ["UX", "Growth"],
    status: "experiment",
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    createdBy: "Sam",
    evaluations: [],
    avgScore: 85,
  },
  {
    id: "6",
    title: "Dark mode",
    description: "System-wide dark mode support",
    tags: ["Design", "UX"],
    status: "launched",
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    createdBy: "Jordan",
    evaluations: [],
    avgScore: 90,
  },
];

export const useIdeasStore = create<IdeasState>((set) => ({
  ideas: sampleIdeas,
  
  addIdea: (title, description, tags = []) => {
    const newIdea: Idea = {
      id: generateId(),
      title,
      description,
      tags,
      status: "inbox",
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: "You",
      evaluations: [],
    };
    set((state) => ({ ideas: [newIdea, ...state.ideas] }));
  },
  
  updateIdeaStatus: (id, status) => {
    set((state) => ({
      ideas: state.ideas.map((idea) =>
        idea.id === id ? { ...idea, status, updatedAt: new Date() } : idea
      ),
    }));
  },
  
  addEvaluation: (ideaId, evaluation) => {
    set((state) => ({
      ideas: state.ideas.map((idea) => {
        if (idea.id !== ideaId) return idea;
        
        const newEvaluation: Evaluation = {
          ...evaluation,
          id: generateId(),
          createdAt: new Date(),
        };
        
        const updatedEvaluations = [...idea.evaluations, newEvaluation];
        
        return {
          ...idea,
          evaluations: updatedEvaluations,
          avgScore: calculateAverageScore(updatedEvaluations),
          updatedAt: new Date(),
        };
      }),
    }));
  },
  
  deleteIdea: (id) => {
    set((state) => ({
      ideas: state.ideas.filter((idea) => idea.id !== id),
    }));
  },
}));

