"use client";

import React, { useState } from "react";
import { Meal, Gender } from "@/types";

interface MealCardProps {
  meal: Meal;
  gender: Gender;
  completed: boolean;
  onToggle: () => void;
}

export function MealCard({ meal, gender, completed, onToggle }: MealCardProps) {
  const [expanded, setExpanded] = useState(true);

  const totalCal = meal.items.reduce((sum, item) => sum + item.calories[gender], 0);
  const mealIcons: Record<string, string> = {
    breakfast: "🌅",
    lunch: "☀️",
    snack: "🍪",
    dinner: "🌙",
  };

  return (
    <div className={`card overflow-hidden transition-all ${completed ? "opacity-60" : ""}`}>
      {/* 头部 */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 min-h-touch"
      >
        <div className="flex items-center gap-3">
          <span className="text-xl">{mealIcons[meal.type]}</span>
          <div className="text-left">
            <div className="font-semibold text-white text-sm">{meal.label}</div>
            <div className="text-xs text-white/40">{meal.time} · {totalCal} 千卡</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <svg
            className={`w-4 h-4 text-white/30 transition-transform ${expanded ? "rotate-180" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {/* 展开内容 */}
      {expanded && (
        <div className="px-4 pb-4 space-y-2">
          {meal.items.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between py-1.5 border-t border-white/5">
              <div className="flex items-center gap-2">
                <span className="text-sm text-white/80">{item.name}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-white/40">{item.amount[gender]}</span>
                <span className="text-xs text-primary/70 w-14 text-right">{item.calories[gender]}卡</span>
              </div>
            </div>
          ))}

          {/* 完成按钮 */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggle();
            }}
            className={`w-full mt-2 py-2.5 rounded-xl text-sm font-medium transition-all min-h-touch flex items-center justify-center gap-2 ${
              completed
                ? "bg-primary/10 text-primary"
                : "bg-white/5 text-white/60 active:bg-white/10"
            }`}
          >
            {completed ? (
              <>
                <svg className="w-4 h-4 animate-check" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
                已完成
              </>
            ) : (
              "标记已吃"
            )}
          </button>
        </div>
      )}
    </div>
  );
}
