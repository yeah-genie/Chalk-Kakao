"use client";

import { useState } from "react";

const scoreLabels = {
  market: { label: "Market Potential", desc: "How big is the opportunity?" },
  revenue: { label: "Revenue Impact", desc: "Will it drive revenue?" },
  effort: { label: "Effort Required", desc: "How hard to build? (1 = easy)" },
  teamFit: { label: "Team Fit", desc: "Do we have the skills?" },
  learning: { label: "Learning Value", desc: "What will we learn?" },
};

type ScoreKey = keyof typeof scoreLabels;

interface Props {
  onSubmit: (scores: Record<ScoreKey, number>) => void;
}

export default function EvaluationSlider({ onSubmit }: Props) {
  const [scores, setScores] = useState<Record<ScoreKey, number>>({
    market: 3,
    revenue: 3,
    effort: 3,
    teamFit: 3,
    learning: 3,
  });
  
  const handleChange = (key: ScoreKey, value: number) => {
    setScores((prev) => ({ ...prev, [key]: value }));
  };
  
  const handleSubmit = () => {
    onSubmit(scores);
    setScores({
      market: 3,
      revenue: 3,
      effort: 3,
      teamFit: 3,
      learning: 3,
    });
  };
  
  const getScoreColor = (value: number) => {
    if (value <= 2) return "var(--red)";
    if (value === 3) return "var(--yellow)";
    return "var(--green)";
  };
  
  return (
    <div className="space-y-5">
      <h4 className="text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wide">
        Your evaluation
      </h4>
      
      {(Object.keys(scoreLabels) as ScoreKey[]).map((key) => (
        <div key={key}>
          <div className="flex items-center justify-between mb-2">
            <div>
              <span className="text-sm font-medium text-[var(--text-primary)]">
                {scoreLabels[key].label}
              </span>
              <p className="text-xs text-[var(--text-tertiary)]">
                {scoreLabels[key].desc}
              </p>
            </div>
            <span
              className="text-lg font-semibold w-8 text-center"
              style={{ color: getScoreColor(scores[key]) }}
            >
              {scores[key]}
            </span>
          </div>
          
          <div className="relative">
            <input
              type="range"
              min="1"
              max="5"
              value={scores[key]}
              onChange={(e) => handleChange(key, parseInt(e.target.value))}
              className="w-full h-1.5 bg-[var(--bg-surface)] rounded-full appearance-none cursor-pointer
                [&::-webkit-slider-thumb]:appearance-none
                [&::-webkit-slider-thumb]:w-4
                [&::-webkit-slider-thumb]:h-4
                [&::-webkit-slider-thumb]:rounded-full
                [&::-webkit-slider-thumb]:bg-[var(--accent)]
                [&::-webkit-slider-thumb]:cursor-pointer
                [&::-webkit-slider-thumb]:transition-transform
                [&::-webkit-slider-thumb]:hover:scale-110
                [&::-moz-range-thumb]:w-4
                [&::-moz-range-thumb]:h-4
                [&::-moz-range-thumb]:rounded-full
                [&::-moz-range-thumb]:bg-[var(--accent)]
                [&::-moz-range-thumb]:border-none
                [&::-moz-range-thumb]:cursor-pointer"
            />
            
            {/* Score markers */}
            <div className="flex justify-between mt-1 px-1">
              {[1, 2, 3, 4, 5].map((num) => (
                <span
                  key={num}
                  className={`text-[10px] ${
                    scores[key] === num
                      ? "text-[var(--accent)]"
                      : "text-[var(--text-tertiary)]"
                  }`}
                >
                  {num}
                </span>
              ))}
            </div>
          </div>
        </div>
      ))}
      
      {/* Summary */}
      <div className="pt-4 border-t border-[var(--border)]">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-[var(--text-secondary)]">Total score</span>
          <span className="text-lg font-semibold text-[var(--accent)]">
            {Math.round(
              ((Object.values(scores).reduce((a, b) => a + b, 0) - scores.effort + (6 - scores.effort)) /
                25) *
                100
            )}%
          </span>
        </div>
        
        <button onClick={handleSubmit} className="btn-primary w-full">
          Submit evaluation
        </button>
      </div>
    </div>
  );
}

