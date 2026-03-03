"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useUserStore } from "@/lib/store";
import { useData } from "@/lib/DataContext";
import { getBeijingDateStr } from "@/lib/utils";
import { EXERCISE_DATA } from "@/data/exercises";
import { ExerciseCompletion } from "@/types";
import { ExerciseCard } from "@/components/ExerciseCard";
import { Timer } from "@/components/Timer";

export default function ExercisePage() {
  const gender = useUserStore((s) => s.gender);
  const data = useData();
  const today = getBeijingDateStr();
  const [completions, setCompletions] = useState<ExerciseCompletion[]>([]);
  const [timerExercise, setTimerExercise] = useState<string | null>(null);

  const loadCompletions = useCallback(() => {
    if (!gender) return;
    setCompletions(data.getExerciseCompletions(today, gender));
  }, [data, today, gender]);

  useEffect(() => {
    loadCompletions();
  }, [loadCompletions]);

  const toggleExercise = (exerciseId: string) => {
    if (!gender) return;
    const existing = completions.find((c) => c.exerciseId === exerciseId);
    data.setExerciseCompletion({
      date: today,
      exerciseId,
      completed: !existing?.completed,
      gender,
    });
    loadCompletions();
  };

  const completedCount = completions.filter((c) => c.completed).length;
  const activeExercise = EXERCISE_DATA.find((e) => e.id === timerExercise);

  if (!gender) return null;

  return (
    <div className="px-4 pt-4">
      {/* 头部 */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold text-white">运动计划</h1>
          <p className="text-xs text-white/40 mt-0.5">每日运动目标</p>
        </div>
        <div className="text-right">
          <div className="text-sm text-white/60">今日完成</div>
          <div className="text-lg font-bold text-primary">
            {completedCount}/{EXERCISE_DATA.length}
          </div>
        </div>
      </div>

      {/* 今日完成度 */}
      <div className="card p-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <div className="h-2 bg-white/5 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${(completedCount / EXERCISE_DATA.length) * 100}%`,
                  background: "linear-gradient(90deg, #63d297, #4ecdc4)",
                }}
              />
            </div>
          </div>
          {completedCount === EXERCISE_DATA.length && (
            <span className="text-sm">🎉</span>
          )}
        </div>
        <div className="flex justify-between mt-2">
          <span className="text-xs text-white/40">
            总时长 {EXERCISE_DATA.reduce((s, e) => s + e.duration, 0)} 分钟
          </span>
          {completedCount === EXERCISE_DATA.length && (
            <span className="text-xs text-primary">今天全部完成！</span>
          )}
        </div>
      </div>

      {/* 运动卡片 */}
      <div className="space-y-3 pb-4">
        {EXERCISE_DATA.map((exercise) => {
          const isCompleted = completions.find(
            (c) => c.exerciseId === exercise.id
          )?.completed;
          return (
            <ExerciseCard
              key={exercise.id}
              exercise={exercise}
              completed={!!isCompleted}
              onToggle={() => toggleExercise(exercise.id)}
              onStartTimer={() => setTimerExercise(exercise.id)}
            />
          );
        })}
      </div>

      {/* 计时器弹窗 */}
      {activeExercise && (
        <Timer
          exercise={activeExercise}
          onClose={() => setTimerExercise(null)}
          onComplete={() => {
            if (!completions.find((c) => c.exerciseId === activeExercise.id)?.completed) {
              toggleExercise(activeExercise.id);
            }
            setTimerExercise(null);
          }}
        />
      )}
    </div>
  );
}
