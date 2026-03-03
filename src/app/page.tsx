"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useUserStore } from "@/lib/store";
import { useData } from "@/lib/DataContext";
import { getBeijingDateStr } from "@/lib/utils";
import { LUNCH_RECIPES, DINNER_RECIPES, SNACK_RECIPES, getRecipeById } from "@/data/meals";
import { DayMealSelection, Recipe, CALORIE_TARGETS, MealSlot } from "@/types";
import { FastingIndicator } from "@/components/FastingIndicator";
import { RecipePicker } from "@/components/RecipePicker";

export default function DietPage() {
  const gender = useUserStore((s) => s.gender);
  const data = useData();
  const today = getBeijingDateStr();

  const [selection, setSelection] = useState<DayMealSelection>({
    date: today,
    lunchId: null,
    dinnerId: null,
    snackId: null,
  });
  const [pickingSlot, setPickingSlot] = useState<MealSlot | null>(null);

  const loadSelection = useCallback(() => {
    const saved = data.getDaySelection(today);
    if (saved) setSelection(saved);
  }, [data, today]);

  useEffect(() => {
    loadSelection();
  }, [loadSelection]);

  if (!gender) return null;

  const targets = CALORIE_TARGETS[gender];
  const lunchRecipe = selection.lunchId ? getRecipeById(selection.lunchId) ?? null : null;
  const dinnerRecipe = selection.dinnerId ? getRecipeById(selection.dinnerId) ?? null : null;
  const snackRecipe = selection.snackId ? getRecipeById(selection.snackId) ?? null : null;

  const getCal = (r: Recipe | null) => {
    if (!r) return 0;
    return gender === "he" ? r.caloriesHe : r.caloriesShe;
  };

  const totalCal = getCal(lunchRecipe) + getCal(dinnerRecipe) + getCal(snackRecipe);
  const selectRecipe = (slot: MealSlot, recipeId: string) => {
    const updated = {
      ...selection,
      [slot === "lunch" ? "lunchId" : slot === "dinner" ? "dinnerId" : "snackId"]: recipeId,
    };
    setSelection(updated);
    data.setDaySelection(updated);
    setPickingSlot(null);
  };

  const clearRecipe = (slot: MealSlot) => {
    const updated = {
      ...selection,
      [slot === "lunch" ? "lunchId" : slot === "dinner" ? "dinnerId" : "snackId"]: null,
    };
    setSelection(updated);
    data.setDaySelection(updated);
  };

  // 随机推荐：自动选一套合理搭配
  const autoRecommend = () => {
    const shuffle = <T,>(arr: T[]) => [...arr].sort(() => Math.random() - 0.5);
    const lunch = shuffle(LUNCH_RECIPES)[0];
    const lunchCal = getCal(lunch);
    // 选一个让总热量在范围内的晚餐
    const validDinners = DINNER_RECIPES.filter((d) => {
      const dc = getCal(d);
      const total = lunchCal + dc;
      return total >= targets.min - targets.snack.max && total <= targets.max;
    });
    const dinner = shuffle(validDinners.length > 0 ? validDinners : DINNER_RECIPES)[0];
    const dinnerCal = getCal(dinner);
    // 如果还有余量，选加餐
    const remaining = targets.max - lunchCal - dinnerCal;
    let snack: Recipe | undefined;
    if (remaining >= targets.snack.min) {
      const validSnacks = SNACK_RECIPES.filter((s) => getCal(s) <= remaining);
      snack = shuffle(validSnacks)[0];
    }

    const updated: DayMealSelection = {
      date: today,
      lunchId: lunch.id,
      dinnerId: dinner.id,
      snackId: snack?.id || null,
    };
    setSelection(updated);
    data.setDaySelection(updated);
  };

  // 热量状态颜色
  const calStatus = totalCal === 0
    ? "text-white/40"
    : totalCal >= targets.min && totalCal <= targets.max
    ? "text-primary"
    : totalCal < targets.min
    ? "text-yellow-400"
    : "text-red-400";

  const calMessage = totalCal === 0
    ? "选择今日菜谱"
    : totalCal < targets.min
    ? `还差 ${targets.min - totalCal} 千卡`
    : totalCal > targets.max
    ? `超出 ${totalCal - targets.max} 千卡`
    : "热量达标 ✓";

  return (
    <div className="px-4 pt-4">
      {/* 头部 */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h1 className="text-xl font-bold text-white">今日饮食</h1>
          <p className="text-xs text-white/40 mt-0.5">16:8 轻断食 · 选择你的菜谱</p>
        </div>
        <button
          onClick={autoRecommend}
          className="text-xs bg-primary/10 text-primary px-3 py-1.5 rounded-lg active:bg-primary/20 min-h-touch flex items-center gap-1"
        >
          🎲 随机推荐
        </button>
      </div>

      {/* 断食状态 */}
      <FastingIndicator />

      {/* 热量总览 */}
      <div className="card p-4 mt-3 mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-white/60">今日热量</span>
          <span className={`text-sm font-semibold ${calStatus}`}>{calMessage}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${Math.min((totalCal / targets.max) * 100, 100)}%`,
                background:
                  totalCal > targets.max
                    ? "#f87171"
                    : totalCal >= targets.min
                    ? "linear-gradient(90deg, #63d297, #4ecdc4)"
                    : "#facc15",
              }}
            />
          </div>
          <span className="text-xs text-white/40 w-24 text-right">
            {totalCal} / {targets.min}-{targets.max}
          </span>
        </div>
        {/* 营养素摘要 */}
        {totalCal > 0 && (
          <div className="flex gap-4 mt-3">
            {[
              { label: "蛋白质", value: [lunchRecipe, dinnerRecipe, snackRecipe].reduce((s, r) => s + (r ? (gender === "he" ? r.proteinHe : r.proteinShe) : 0), 0), unit: "g", color: "text-blue-400" },
              { label: "碳水", value: [lunchRecipe, dinnerRecipe, snackRecipe].reduce((s, r) => s + (r ? (gender === "he" ? r.carbsHe : r.carbsShe) : 0), 0), unit: "g", color: "text-yellow-400" },
              { label: "脂肪", value: [lunchRecipe, dinnerRecipe, snackRecipe].reduce((s, r) => s + (r ? (gender === "he" ? r.fatHe : r.fatShe) : 0), 0), unit: "g", color: "text-orange-400" },
            ].map((n) => (
              <div key={n.label} className="flex-1 text-center">
                <div className={`text-sm font-semibold ${n.color}`}>{n.value}{n.unit}</div>
                <div className="text-[10px] text-white/30">{n.label}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 三餐选择 */}
      <div className="space-y-3 pb-4">
        {/* 午餐 */}
        <MealSlotCard
          label="午餐"
          time="11:00"
          icon="☀️"
          recipe={lunchRecipe}
          gender={gender}
          onPick={() => setPickingSlot("lunch")}
          onClear={() => clearRecipe("lunch")}
        />
        {/* 晚餐 */}
        <MealSlotCard
          label="晚餐"
          time="18:00"
          icon="🌙"
          recipe={dinnerRecipe}
          gender={gender}
          onPick={() => setPickingSlot("dinner")}
          onClear={() => clearRecipe("dinner")}
        />
        {/* 加餐 */}
        <MealSlotCard
          label="加餐"
          time="15:00"
          icon="🍪"
          recipe={snackRecipe}
          gender={gender}
          onPick={() => setPickingSlot("snack")}
          onClear={() => clearRecipe("snack")}
          optional
        />
      </div>

      {/* 菜谱选择弹窗 */}
      {pickingSlot && (
        <RecipePicker
          slot={pickingSlot}
          gender={gender}
          currentSelection={selection}
          onSelect={(id) => selectRecipe(pickingSlot, id)}
          onClose={() => setPickingSlot(null)}
        />
      )}
    </div>
  );
}

// ===== 单个餐次卡片 =====
function MealSlotCard({
  label,
  time,
  icon,
  recipe,
  gender,
  onPick,
  onClear,
  optional,
}: {
  label: string;
  time: string;
  icon: string;
  recipe: Recipe | null;
  gender: "he" | "she";
  onPick: () => void;
  onClear: () => void;
  optional?: boolean;
}) {
  if (!recipe) {
    return (
      <button
        onClick={onPick}
        className="w-full card card-hover p-4 flex items-center gap-3 min-h-touch"
      >
        <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-xl">
          {icon}
        </div>
        <div className="flex-1 text-left">
          <div className="text-sm font-medium text-white/70">
            {label}
            {optional && <span className="text-white/30 ml-1">(可选)</span>}
          </div>
          <div className="text-xs text-white/30">{time} · 点击选择菜谱</div>
        </div>
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
          <span className="text-primary text-lg">+</span>
        </div>
      </button>
    );
  }

  const cal = gender === "he" ? recipe.caloriesHe : recipe.caloriesShe;
  const protein = gender === "he" ? recipe.proteinHe : recipe.proteinShe;

  return (
    <div className="card overflow-hidden">
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-2xl flex-shrink-0">
            {recipe.icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs text-white/40">{label} · {time}</span>
                <h3 className="font-semibold text-white text-sm mt-0.5">{recipe.name}</h3>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="text-xs text-primary/70 bg-primary/10 px-2 py-0.5 rounded-full">
                {cal} 千卡
              </span>
              <span className="text-xs text-blue-400/70 bg-blue-400/10 px-2 py-0.5 rounded-full">
                蛋白质 {protein}g
              </span>
            </div>
            <p className="text-xs text-white/40 mt-2 leading-relaxed">{recipe.steps}</p>
          </div>
        </div>

        {/* 食材列表 */}
        <div className="mt-3 space-y-1">
          {recipe.ingredients.map((ing, idx) => (
            <div key={idx} className="flex justify-between text-xs py-0.5 border-t border-white/5 first:border-0">
              <span className="text-white/60">{ing.name}</span>
              <span className="text-white/30">{gender === "he" ? ing.amountHe : ing.amountShe}</span>
            </div>
          ))}
        </div>

        {/* 操作按钮 */}
        <div className="flex gap-2 mt-3">
          <button
            onClick={onPick}
            className="flex-1 py-2 rounded-xl bg-white/5 text-white/60 text-xs font-medium min-h-touch active:bg-white/10"
          >
            换一道
          </button>
          <button
            onClick={onClear}
            className="px-4 py-2 rounded-xl bg-white/5 text-white/30 text-xs min-h-touch active:bg-white/10"
          >
            清除
          </button>
        </div>
      </div>
    </div>
  );
}
