"use client";

import React from "react";
import { Exercise } from "@/types";

interface ExerciseCardProps {
  exercise: Exercise;
  completed: boolean;
  onToggle: () => void;
  onStartTimer: () => void;
}

export function ExerciseCard({ exercise, completed, onToggle, onStartTimer }: ExerciseCardProps) {
  return (
    <div className={`card overflow-hidden transition-all ${completed ? "opacity-60" : ""}`}>
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-2xl flex-shrink-0">
            {exercise.icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-white text-sm">{exercise.name}</h3>
              <span className="text-xs text-white/40">{exercise.time}</span>
            </div>
            <p className="text-xs text-white/50 mt-1">{exercise.description}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs text-primary/70 bg-primary/10 px-2 py-0.5 rounded-full">
                {exercise.duration} 分钟
              </span>
            </div>
          </div>
        </div>

        <div className="flex gap-2 mt-3">
          <button
            onClick={onStartTimer}
            className="flex-1 py-2.5 rounded-xl bg-white/5 text-white/60 text-sm font-medium min-h-touch active:bg-white/10 transition-colors flex items-center justify-center gap-1.5"
          >
            ⏱ 计时器
          </button>
          <button
            onClick={onToggle}
            className={`flex-1 py-2.5 rounded-xl text-sm font-medium min-h-touch transition-all flex items-center justify-center gap-1.5 ${
              completed
                ? "bg-primary/10 text-primary"
                : "bg-white/5 text-white/60 active:bg-white/10"
            }`}
          >
            {completed ? (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
                已完成
              </>
            ) : (
              "标记完成"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
