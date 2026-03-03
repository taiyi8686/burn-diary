"use client";

import React, { useState, useMemo } from "react";
import { Recipe, Gender, MealSlot, DayMealSelection, CALORIE_TARGETS } from "@/types";
import { LUNCH_RECIPES, DINNER_RECIPES, SNACK_RECIPES, getRecipeById } from "@/data/meals";

interface RecipePickerProps {
  slot: MealSlot;
  gender: Gender;
  currentSelection: DayMealSelection;
  onSelect: (recipeId: string) => void;
  onClose: () => void;
}

export function RecipePicker({ slot, gender, currentSelection, onSelect, onClose }: RecipePickerProps) {
  const [filter, setFilter] = useState<string>("全部");

  const recipes = slot === "lunch" ? LUNCH_RECIPES : slot === "dinner" ? DINNER_RECIPES : SNACK_RECIPES;
  const targets = CALORIE_TARGETS[gender];

  // 计算已用热量（排除当前 slot）
  const usedCal = useMemo(() => {
    let cal = 0;
    if (slot !== "lunch" && currentSelection.lunchId) {
      const r = getRecipeById(currentSelection.lunchId);
      if (r) cal += gender === "he" ? r.caloriesHe : r.caloriesShe;
    }
    if (slot !== "dinner" && currentSelection.dinnerId) {
      const r = getRecipeById(currentSelection.dinnerId);
      if (r) cal += gender === "he" ? r.caloriesHe : r.caloriesShe;
    }
    if (slot !== "snack" && currentSelection.snackId) {
      const r = getRecipeById(currentSelection.snackId);
      if (r) cal += gender === "he" ? r.caloriesHe : r.caloriesShe;
    }
    return cal;
  }, [slot, currentSelection, gender]);

  const remainingBudget = targets.max - usedCal;

  // 分类列表
  const categories = useMemo(() => {
    const cats = new Set(recipes.map((r) => r.category));
    return ["全部", ...Array.from(cats)];
  }, [recipes]);

  // 过滤
  const filtered = useMemo(() => {
    let list = recipes;
    if (filter !== "全部") {
      list = list.filter((r) => r.category === filter);
    }
    return list;
  }, [recipes, filter]);

  const getCal = (r: Recipe) => gender === "he" ? r.caloriesHe : r.caloriesShe;

  const slotLabel = slot === "lunch" ? "午餐" : slot === "dinner" ? "晚餐" : "加餐";

  return (
    <div className="fixed inset-0 z-[100] bg-surface-dark flex flex-col">
      {/* 顶部栏 */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <button onClick={onClose} className="text-white/60 text-sm min-h-touch flex items-center">
          ← 返回
        </button>
        <h2 className="text-base font-semibold text-white">选择{slotLabel}</h2>
        <div className="text-xs text-white/40 w-16 text-right">
          余 {remainingBudget} 卡
        </div>
      </div>

      {/* 分类过滤 */}
      <div className="flex gap-2 px-4 py-2 overflow-x-auto scrollbar-hide">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors min-h-touch flex items-center ${
              filter === cat
                ? "bg-primary/20 text-primary"
                : "bg-white/5 text-white/40"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* 菜谱列表 */}
      <div className="flex-1 overflow-y-auto px-4 pb-6">
        <div className="space-y-2 mt-2">
          {filtered.map((recipe) => {
            const cal = getCal(recipe);
            const fits = cal <= remainingBudget;
            const protein = gender === "he" ? recipe.proteinHe : recipe.proteinShe;

            return (
              <button
                key={recipe.id}
                onClick={() => onSelect(recipe.id)}
                className={`w-full card card-hover p-4 flex items-center gap-3 text-left min-h-touch ${
                  !fits ? "opacity-40" : ""
                }`}
              >
                <div className="w-11 h-11 rounded-xl bg-white/5 flex items-center justify-center text-xl flex-shrink-0">
                  {recipe.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-white truncate">{recipe.name}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-primary/70">{cal} 卡</span>
                    <span className="text-xs text-blue-400/60">蛋白 {protein}g</span>
                    {recipe.tags.slice(0, 2).map((tag) => (
                      <span key={tag} className="text-[10px] text-white/25 bg-white/5 px-1.5 py-0.5 rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                {!fits && (
                  <span className="text-[10px] text-red-400 flex-shrink-0">超标</span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
