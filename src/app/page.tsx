"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useUserStore } from "@/lib/store";
import { useData } from "@/lib/DataContext";
import { getBeijingDateStr, getDayType } from "@/lib/utils";
import { MENU_DATA } from "@/data/meals";
import { MealCompletion } from "@/types";
import { DatePicker } from "@/components/DatePicker";
import { FastingIndicator } from "@/components/FastingIndicator";
import { MealCard } from "@/components/MealCard";

export default function DietPage() {
  const gender = useUserStore((s) => s.gender);
  const data = useData();
  const [selectedDate, setSelectedDate] = useState(getBeijingDateStr());
  const [completions, setCompletions] = useState<MealCompletion[]>([]);
  const [, setTick] = useState(0);

  const dayType = getDayType(selectedDate);
  const menu = MENU_DATA.find((m) => m.day === dayType)!;

  const loadCompletions = useCallback(() => {
    setCompletions(data.getMealCompletions(selectedDate));
  }, [data, selectedDate]);

  useEffect(() => {
    loadCompletions();
  }, [loadCompletions]);

  // 每分钟刷新断食状态
  useEffect(() => {
    const timer = setInterval(() => setTick((t) => t + 1), 60000);
    return () => clearInterval(timer);
  }, []);

  const toggleMeal = (mealId: string) => {
    const existing = completions.find((c) => c.mealId === mealId);
    const newCompletion: MealCompletion = {
      date: selectedDate,
      mealId,
      completed: !existing?.completed,
    };
    data.setMealCompletion(newCompletion);
    loadCompletions();
  };

  const completedCount = completions.filter((c) => c.completed).length;

  if (!gender) return null;

  return (
    <div className="px-4 pt-4">
      {/* 头部 */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold text-white">饮食计划</h1>
          <p className="text-xs text-white/40 mt-0.5">
            {menu.label} · 目标 {menu.totalCalories[gender]} 千卡
          </p>
        </div>
        <div className="text-right">
          <div className="text-sm text-white/60">已完成</div>
          <div className="text-lg font-bold text-primary">
            {completedCount}/{menu.meals.length}
          </div>
        </div>
      </div>

      {/* 日期选择器 */}
      <DatePicker selected={selectedDate} onSelect={setSelectedDate} />

      {/* 断食状态 */}
      <FastingIndicator />

      {/* 餐食卡片列表 */}
      <div className="space-y-3 mt-4 pb-4">
        {menu.meals.map((meal) => {
          const isCompleted = completions.find(
            (c) => c.mealId === meal.id
          )?.completed;
          return (
            <MealCard
              key={meal.id}
              meal={meal}
              gender={gender}
              completed={!!isCompleted}
              onToggle={() => toggleMeal(meal.id)}
            />
          );
        })}
      </div>
    </div>
  );
}
