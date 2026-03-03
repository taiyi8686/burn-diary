"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useUserStore } from "@/lib/store";
import { useData } from "@/lib/DataContext";
import { getBeijingDateStr } from "@/lib/utils";
import { getExercises, getTargetTrips } from "@/data/exercises";
import { ExerciseCompletion, Exercise } from "@/types";
import { Timer } from "@/components/Timer";

const TRIPS_KEY_PREFIX = "burn-diary:trips:";

export default function ExercisePage() {
  const gender = useUserStore((s) => s.gender);
  const data = useData();
  const today = getBeijingDateStr();

  const [isRestDay, setIsRestDay] = useState(false);
  const [isPeriod, setIsPeriod] = useState(false);
  const [completions, setCompletions] = useState<ExerciseCompletion[]>([]);
  const [timerExercise, setTimerExercise] = useState<string | null>(null);
  const [trips, setTrips] = useState(0);

  // 加载状态
  const loadState = useCallback(() => {
    if (!gender) return;
    setCompletions(data.getExerciseCompletions(today, gender));

    if (typeof window !== "undefined") {
      const savedTrips = localStorage.getItem(`${TRIPS_KEY_PREFIX}${today}`);
      if (savedTrips) setTrips(parseInt(savedTrips) || 0);

      const savedRestDay = localStorage.getItem(`burn-diary:restday:${today}`);
      if (savedRestDay === "true") setIsRestDay(true);

      if (gender === "she") {
        const savedPeriod = localStorage.getItem("burn-diary:period-mode");
        if (savedPeriod === "true") setIsPeriod(true);
      }
    }
  }, [data, today, gender]);

  useEffect(() => {
    loadState();
  }, [loadState]);

  // 保存趟数
  const updateTrips = (newTrips: number) => {
    setTrips(newTrips);
    if (typeof window !== "undefined") {
      localStorage.setItem(`${TRIPS_KEY_PREFIX}${today}`, String(newTrips));
    }
  };

  // 切换休息日
  const toggleRestDay = (value: boolean) => {
    setIsRestDay(value);
    if (typeof window !== "undefined") {
      localStorage.setItem(`burn-diary:restday:${today}`, String(value));
    }
  };

  // 切换生理期
  const togglePeriod = () => {
    const newVal = !isPeriod;
    setIsPeriod(newVal);
    if (typeof window !== "undefined") {
      localStorage.setItem("burn-diary:period-mode", String(newVal));
    }
  };

  // 标记完成/取消
  const toggleExercise = (exerciseId: string) => {
    if (!gender) return;
    const existing = completions.find((c) => c.exerciseId === exerciseId);
    data.setExerciseCompletion({
      date: today,
      exerciseId,
      completed: !existing?.completed,
      gender,
    });
    setCompletions(data.getExerciseCompletions(today, gender));
  };

  if (!gender) return null;

  const exercises = getExercises(gender, isRestDay, isPeriod);
  const targetTrips = getTargetTrips(isPeriod, gender);
  const completedCount = exercises.filter((e) =>
    completions.find((c) => c.exerciseId === e.id)?.completed
  ).length;
  const totalMinutes = exercises.reduce((s, e) => s + e.duration, 0);
  const activeExercise = exercises.find((e) => e.id === timerExercise);

  const climbExercise = exercises.find((e) => e.id === "climb");
  const climbCompleted = !!completions.find((c) => c.exerciseId === "climb")?.completed;
  const otherExercises = exercises.filter((e) => e.id !== "climb");

  return (
    <div className="px-4 pt-4">
      {/* 头部 */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h1 className="text-xl font-bold text-white">运动计划</h1>
          <p className="text-xs text-white/40 mt-0.5">
            {isRestDay ? "休息日 · 轻松活动" : "工作日 · 每日运动"}
          </p>
        </div>
        <div className="text-right">
          <div className="text-sm text-white/60">今日完成</div>
          <div className="text-lg font-bold text-primary">
            {completedCount}/{exercises.length}
          </div>
        </div>
      </div>

      {/* 工作日/休息日切换 */}
      <div className="flex gap-2 mb-3">
        <button
          onClick={() => toggleRestDay(false)}
          className={`flex-1 py-2.5 rounded-xl text-sm font-medium min-h-touch transition-all ${
            !isRestDay
              ? "bg-primary/15 text-primary border border-primary/30"
              : "card text-white/50"
          }`}
        >
          💼 工作日
        </button>
        <button
          onClick={() => toggleRestDay(true)}
          className={`flex-1 py-2.5 rounded-xl text-sm font-medium min-h-touch transition-all ${
            isRestDay
              ? "bg-primary/15 text-primary border border-primary/30"
              : "card text-white/50"
          }`}
        >
          ☀️ 休息日
        </button>
      </div>

      {/* 生理期模式（仅女生） */}
      {gender === "she" && !isRestDay && (
        <button
          onClick={togglePeriod}
          className={`w-full py-2.5 rounded-xl text-sm font-medium mb-3 min-h-touch transition-all ${
            isPeriod
              ? "bg-pink-500/15 text-pink-400 border border-pink-500/30"
              : "card text-white/40"
          }`}
        >
          {isPeriod ? "🔴 生理期模式已开启（爬楼减半，不做仰卧起坐）" : "🔴 生理期？点击开启减量模式"}
        </button>
      )}

      {/* 进度条 */}
      <div className="card p-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <div className="h-2 bg-white/5 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${exercises.length > 0 ? (completedCount / exercises.length) * 100 : 0}%`,
                  background: "linear-gradient(90deg, #63d297, #4ecdc4)",
                }}
              />
            </div>
          </div>
          {completedCount === exercises.length && exercises.length > 0 && (
            <span className="text-sm">🎉</span>
          )}
        </div>
        <div className="flex justify-between mt-2">
          <span className="text-xs text-white/40">约 {totalMinutes} 分钟</span>
          {completedCount === exercises.length && exercises.length > 0 && (
            <span className="text-xs text-primary">今天全部完成！</span>
          )}
        </div>
      </div>

      {/* 运动卡片 */}
      <div className="space-y-3 pb-4">
        {/* 爬楼梯卡片（特殊） */}
        {climbExercise && (
          <ClimbCard
            exercise={climbExercise}
            completed={climbCompleted}
            trips={trips}
            targetTrips={targetTrips}
            onUpdateTrips={updateTrips}
            onToggle={() => toggleExercise("climb")}
            onStartTimer={() => setTimerExercise("climb")}
          />
        )}

        {/* 其他运动卡片 */}
        {otherExercises.map((exercise) => {
          const isCompleted = !!completions.find(
            (c) => c.exerciseId === exercise.id
          )?.completed;
          return (
            <SetsCard
              key={exercise.id}
              exercise={exercise}
              completed={isCompleted}
              onToggle={() => toggleExercise(exercise.id)}
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

// ===== 爬楼梯专用卡片 =====
function ClimbCard({
  exercise,
  completed,
  trips,
  targetTrips,
  onUpdateTrips,
  onToggle,
  onStartTimer,
}: {
  exercise: Exercise;
  completed: boolean;
  trips: number;
  targetTrips: number;
  onUpdateTrips: (n: number) => void;
  onToggle: () => void;
  onStartTimer: () => void;
}) {
  const floors = trips * 7;
  const targetFloors = targetTrips * 7;
  const progress = targetTrips > 0 ? Math.min(trips / targetTrips, 1) : 0;

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
                {targetTrips} 趟 · {targetFloors} 层
              </span>
              <span className="text-xs text-white/30 bg-white/5 px-2 py-0.5 rounded-full">
                约 {exercise.duration} 分钟
              </span>
            </div>
          </div>
        </div>

        {/* 趟数计数器 */}
        <div className="mt-4 p-4 bg-white/3 rounded-xl">
          {/* 进度条 */}
          <div className="h-1.5 bg-white/5 rounded-full overflow-hidden mb-3">
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: `${progress * 100}%`,
                background: "linear-gradient(90deg, #63d297, #4ecdc4)",
              }}
            />
          </div>

          <div className="flex items-center justify-between">
            <button
              onClick={() => onUpdateTrips(Math.max(0, trips - 1))}
              className="w-12 h-12 rounded-full bg-white/5 text-white/60 text-xl font-bold flex items-center justify-center active:bg-white/10 min-h-touch"
            >
              −
            </button>

            <div className="text-center">
              <div className="text-3xl font-bold text-white">
                <span className="text-primary">{trips}</span>
                <span className="text-white/30"> / {targetTrips}</span>
              </div>
              <div className="text-xs text-white/30 mt-0.5">
                已爬 {floors} 层 / 共 {targetFloors} 层
              </div>
            </div>

            <button
              onClick={() => onUpdateTrips(Math.min(trips + 1, 99))}
              className="w-12 h-12 rounded-full bg-primary/15 text-primary text-xl font-bold flex items-center justify-center active:bg-primary/25 min-h-touch"
            >
              +
            </button>
          </div>

          {trips >= targetTrips && !completed && (
            <p className="text-xs text-primary text-center mt-2">
              目标达成！记得标记完成 👇
            </p>
          )}
        </div>

        {/* 按钮 */}
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

// ===== 力量/组数训练卡片 =====
function SetsCard({
  exercise,
  completed,
  onToggle,
}: {
  exercise: Exercise;
  completed: boolean;
  onToggle: () => void;
}) {
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
              {exercise.sets && exercise.reps && (
                <span className="text-xs text-orange-400/70 bg-orange-400/10 px-2 py-0.5 rounded-full">
                  {exercise.sets} 组 × {exercise.reps}
                </span>
              )}
              <span className="text-xs text-white/30 bg-white/5 px-2 py-0.5 rounded-full">
                约 {exercise.duration} 分钟
              </span>
            </div>
          </div>
        </div>

        {/* 标记完成 */}
        <div className="mt-3">
          <button
            onClick={onToggle}
            className={`w-full py-2.5 rounded-xl text-sm font-medium min-h-touch transition-all flex items-center justify-center gap-1.5 ${
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
