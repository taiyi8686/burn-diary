"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useUserStore } from "@/lib/store";
import { useData } from "@/lib/DataContext";
import { getBeijingDateStr } from "@/lib/utils";
import { DAY_PLANS, getPlanById } from "@/data/dayplans";
import { DayPlan, DaySelection } from "@/types";
import { FastingIndicator } from "@/components/FastingIndicator";

export default function DietPage() {
  const gender = useUserStore((s) => s.gender);
  const data = useData();
  const today = getBeijingDateStr();

  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [servings, setServings] = useState<1 | 2>(2);
  const [browsing, setBrowsing] = useState(false);
  const [filterTag, setFilterTag] = useState<string>("全部");

  const loadSelection = useCallback(() => {
    const saved = data.getDaySelection(today);
    if (saved) {
      setSelectedPlanId(saved.planId);
      setServings(saved.servings);
    }
  }, [data, today]);

  useEffect(() => {
    loadSelection();
  }, [loadSelection]);

  if (!gender) return null;

  const selectedPlan = selectedPlanId ? getPlanById(selectedPlanId) ?? null : null;

  const selectPlan = (planId: string) => {
    const sel: DaySelection = { date: today, planId, servings };
    setSelectedPlanId(planId);
    data.setDaySelection(sel);
    setBrowsing(false);
  };

  const updateServings = (s: 1 | 2) => {
    setServings(s);
    if (selectedPlanId) {
      data.setDaySelection({ date: today, planId: selectedPlanId, servings: s });
    }
  };

  const randomPlan = () => {
    const shuffled = [...DAY_PLANS].sort(() => Math.random() - 0.5);
    selectPlan(shuffled[0].id);
  };

  const getCal = (plan: DayPlan) =>
    gender === "he" ? plan.totalCaloriesHe : plan.totalCaloriesShe;
  const getProtein = (plan: DayPlan) =>
    gender === "he" ? plan.totalProteinHe : plan.totalProteinShe;

  // 所有标签
  const allTags = ["全部", ...Array.from(new Set(DAY_PLANS.flatMap((p) => p.tags)))];

  const filteredPlans =
    filterTag === "全部"
      ? DAY_PLANS
      : DAY_PLANS.filter((p) => p.tags.includes(filterTag));

  // ===== 浏览列表 =====
  if (browsing) {
    return (
      <div className="fixed inset-0 z-[100] bg-surface-dark flex flex-col">
        <div className="flex items-center justify-between px-4 pt-4 pb-2">
          <button
            onClick={() => setBrowsing(false)}
            className="text-white/60 text-sm min-h-touch flex items-center"
          >
            ← 返回
          </button>
          <h2 className="text-base font-semibold text-white">选择日食谱</h2>
          <div className="w-16" />
        </div>

        {/* 标签过滤 */}
        <div className="flex gap-2 px-4 py-2 overflow-x-auto scrollbar-hide">
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setFilterTag(tag)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors min-h-touch flex items-center ${
                filterTag === tag
                  ? "bg-primary/20 text-primary"
                  : "bg-white/5 text-white/40"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>

        {/* 计划列表 */}
        <div className="flex-1 overflow-y-auto px-4 pb-6">
          <div className="space-y-2 mt-2">
            {filteredPlans.map((plan) => {
              const cal = getCal(plan);
              const protein = getProtein(plan);
              const isSelected = plan.id === selectedPlanId;

              return (
                <button
                  key={plan.id}
                  onClick={() => selectPlan(plan.id)}
                  className={`w-full card card-hover p-4 text-left min-h-touch ${
                    isSelected ? "ring-1 ring-primary/50" : ""
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-white/5 flex items-center justify-center text-xl flex-shrink-0">
                      {plan.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-white truncate">
                        {plan.name}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-primary/70">{cal} 千卡</span>
                        <span className="text-xs text-blue-400/60">
                          蛋白质 {protein}g
                        </span>
                      </div>
                    </div>
                    {isSelected && (
                      <span className="text-xs text-primary flex-shrink-0">已选</span>
                    )}
                  </div>
                  {/* 三餐预览 */}
                  <div className="flex gap-2 mt-2">
                    {[
                      { label: "午", meal: plan.lunch },
                      { label: "晚", meal: plan.dinner },
                      { label: "加", meal: plan.snack },
                    ].map((m) => (
                      <span
                        key={m.label}
                        className="text-[10px] text-white/30 bg-white/5 px-2 py-0.5 rounded flex-1 text-center truncate"
                      >
                        {m.label}: {m.meal.name.split("+")[0].trim()}
                      </span>
                    ))}
                  </div>
                  {/* 标签 */}
                  <div className="flex gap-1 mt-1.5">
                    {plan.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] text-white/25 bg-white/5 px-1.5 py-0.5 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // ===== 主页面 =====
  return (
    <div className="px-4 pt-4">
      {/* 头部 */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h1 className="text-xl font-bold text-white">今日饮食</h1>
          <p className="text-xs text-white/40 mt-0.5">16:8 轻断食 · 选择日食谱</p>
        </div>
        <button
          onClick={randomPlan}
          className="text-xs bg-primary/10 text-primary px-3 py-1.5 rounded-lg active:bg-primary/20 min-h-touch flex items-center gap-1"
        >
          🎲 随机推荐
        </button>
      </div>

      {/* 断食状态 */}
      <FastingIndicator />

      {/* 人数选择 */}
      <div className="flex gap-2 mt-3 mb-4">
        {([1, 2] as const).map((s) => (
          <button
            key={s}
            onClick={() => updateServings(s)}
            className={`flex-1 py-2.5 rounded-xl text-sm font-medium min-h-touch transition-all ${
              servings === s
                ? "bg-primary/15 text-primary border border-primary/30"
                : "card text-white/50"
            }`}
          >
            {s === 1 ? "👤 一人份" : "👥 两人份"}
          </button>
        ))}
      </div>

      {/* 未选择状态 */}
      {!selectedPlan && (
        <button
          onClick={() => setBrowsing(true)}
          className="w-full card card-hover p-8 flex flex-col items-center text-center"
        >
          <span className="text-4xl mb-4">🍱</span>
          <h3 className="text-base font-semibold text-white mb-2">选择今日食谱</h3>
          <p className="text-sm text-white/40 leading-relaxed">
            我们准备了 {DAY_PLANS.length} 套均衡食谱
            <br />
            点击选择一套适合今天的菜单
          </p>
          <div className="mt-4 text-xs bg-primary/10 text-primary px-4 py-2 rounded-lg">
            浏览全部食谱 →
          </div>
        </button>
      )}

      {/* 已选择 - 显示详情 */}
      {selectedPlan && (
        <>
          {/* 热量总览 */}
          <div className="card p-4 mb-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-xl">{selectedPlan.icon}</span>
                <div>
                  <h3 className="text-sm font-semibold text-white">{selectedPlan.name}</h3>
                  <div className="flex gap-1 mt-0.5">
                    {selectedPlan.tags.map((tag) => (
                      <span key={tag} className="text-[10px] text-white/25 bg-white/5 px-1.5 py-0.5 rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setBrowsing(true)}
                className="text-xs text-primary/70 bg-primary/10 px-3 py-1.5 rounded-lg min-h-touch"
              >
                换一套
              </button>
            </div>

            {/* 营养素 */}
            <div className="flex gap-3 mt-3 pt-3 border-t border-white/5">
              <div className="flex-1 text-center">
                <div className="text-sm font-semibold text-primary">
                  {getCal(selectedPlan)}
                </div>
                <div className="text-[10px] text-white/30">千卡</div>
              </div>
              <div className="flex-1 text-center">
                <div className="text-sm font-semibold text-blue-400">
                  {getProtein(selectedPlan)}g
                </div>
                <div className="text-[10px] text-white/30">蛋白质</div>
              </div>
              <div className="flex-1 text-center">
                <div className="text-sm font-semibold text-white/60">
                  {servings === 1 ? "1人" : "2人"}
                </div>
                <div className="text-[10px] text-white/30">份量</div>
              </div>
            </div>
          </div>

          {/* 三餐详情 */}
          <div className="space-y-3 pb-4">
            {[
              { label: "午餐", meal: selectedPlan.lunch },
              { label: "晚餐", meal: selectedPlan.dinner },
              { label: "加餐", meal: selectedPlan.snack },
            ].map(({ label, meal }) => {
              const mealCal = gender === "he" ? meal.caloriesHe : meal.caloriesShe;
              const mealProtein = gender === "he" ? meal.proteinHe : meal.proteinShe;

              return (
                <div key={label} className="card overflow-hidden">
                  <div className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-2xl flex-shrink-0">
                        {meal.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-xs text-white/40">
                          {label} · {meal.time}
                        </span>
                        <h3 className="font-semibold text-white text-sm mt-0.5">
                          {meal.name}
                        </h3>
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className="text-xs text-primary/70 bg-primary/10 px-2 py-0.5 rounded-full">
                            {mealCal} 千卡
                          </span>
                          <span className="text-xs text-blue-400/70 bg-blue-400/10 px-2 py-0.5 rounded-full">
                            蛋白质 {mealProtein}g
                          </span>
                        </div>
                        <p className="text-xs text-white/40 mt-2 leading-relaxed">
                          {meal.steps}
                        </p>
                      </div>
                    </div>

                    {/* 食材列表 */}
                    <div className="mt-3 space-y-1">
                      {meal.items.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex justify-between text-xs py-0.5 border-t border-white/5 first:border-0"
                        >
                          <span className="text-white/60">{item.name}</span>
                          <span className="text-white/30">
                            {gender === "he" ? item.amountHe : item.amountShe}
                            {servings === 2 && " ×2"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
