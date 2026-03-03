"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useUserStore } from "@/lib/store";
import { useData } from "@/lib/DataContext";
import { getBeijingDateStr } from "@/lib/utils";
import { getRecipeById } from "@/data/meals";
import { generateShoppingList, groupByCategory } from "@/data/shopping";
import { ShoppingItem, ShoppingDuration, ShoppingList } from "@/types";

const DURATION_OPTIONS: { value: ShoppingDuration; label: string; desc: string }[] = [
  { value: "one-meal", label: "一顿", desc: "只买一顿的量" },
  { value: "one-day", label: "一天", desc: "买今天全部食材" },
  { value: "two-days", label: "两天", desc: "一次买两天的量" },
];

export default function ShoppingPage() {
  const gender = useUserStore((s) => s.gender);
  const data = useData();
  const today = getBeijingDateStr();

  const [duration, setDuration] = useState<ShoppingDuration>("one-day");
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [hasSelection, setHasSelection] = useState(false);
  const [, setSavedList] = useState<ShoppingList | null>(null);

  // 从今日选菜加载
  const loadFromSelection = useCallback(() => {
    if (!gender) return;
    const sel = data.getDaySelection(today);
    if (!sel || (!sel.lunchId && !sel.dinnerId && !sel.snackId)) {
      setHasSelection(false);
      // 尝试加载已保存的清单
      const saved = data.getShoppingList();
      if (saved && saved.items.length > 0) {
        setSavedList(saved);
        setItems(saved.items);
        setDuration(saved.duration);
      }
      return;
    }
    setHasSelection(true);

    const recipeIds = [sel.lunchId, sel.dinnerId, sel.snackId].filter(Boolean) as string[];
    const recipes = recipeIds.map(getRecipeById).filter(Boolean) as NonNullable<ReturnType<typeof getRecipeById>>[];

    // 检查是否已有保存的清单且菜谱没变
    const saved = data.getShoppingList();
    if (saved && saved.generatedFrom.join(",") === recipeIds.join(",") && saved.duration === duration) {
      setSavedList(saved);
      setItems(saved.items);
      return;
    }

    const newItems = generateShoppingList(recipes, gender, duration);
    const newList: ShoppingList = {
      items: newItems,
      duration,
      generatedFrom: recipeIds,
      lastGenerated: new Date().toISOString(),
    };
    data.setShoppingList(newList);
    setSavedList(newList);
    setItems(newItems);
  }, [data, today, gender, duration]);

  useEffect(() => {
    loadFromSelection();
  }, [loadFromSelection]);

  const toggleItem = (itemId: string) => {
    data.toggleShoppingItem(itemId);
    // 重新读取
    const saved = data.getShoppingList();
    if (saved) setItems(saved.items);
  };

  const regenerate = useCallback((dur: ShoppingDuration) => {
    if (!gender) return;
    const sel = data.getDaySelection(today);
    if (!sel) return;
    const recipeIds = [sel.lunchId, sel.dinnerId, sel.snackId].filter(Boolean) as string[];
    const recipes = recipeIds.map(getRecipeById).filter(Boolean) as NonNullable<ReturnType<typeof getRecipeById>>[];
    const newItems = generateShoppingList(recipes, gender, dur);
    const newList: ShoppingList = {
      items: newItems,
      duration: dur,
      generatedFrom: recipeIds,
      lastGenerated: new Date().toISOString(),
    };
    data.setShoppingList(newList);
    setSavedList(newList);
    setItems(newItems);
  }, [data, today, gender]);

  const grouped = groupByCategory(items);
  const checkedCount = items.filter((i) => i.checked).length;
  const totalCount = items.length;
  const progress = totalCount > 0 ? (checkedCount / totalCount) * 100 : 0;

  if (!gender) return null;

  // 没有选菜也没有已保存清单
  if (!hasSelection && items.length === 0) {
    return (
      <div className="px-4 pt-4">
        <h1 className="text-xl font-bold text-white mb-4">采购清单</h1>
        <div className="card p-8 flex flex-col items-center text-center">
          <span className="text-4xl mb-4">🛒</span>
          <h3 className="text-base font-semibold text-white mb-2">还没有采购清单</h3>
          <p className="text-sm text-white/40 leading-relaxed">
            先去「饮食」页面选好今天的菜谱，<br />
            采购清单会自动生成哦
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 pt-4">
      {/* 头部 */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold text-white">采购清单</h1>
          <p className="text-xs text-white/40 mt-0.5">根据你选的菜谱自动生成</p>
        </div>
      </div>

      {/* 采购时长选择 */}
      <div className="flex gap-2 mb-4">
        {DURATION_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => {
              setDuration(opt.value);
              regenerate(opt.value);
            }}
            className={`flex-1 py-2.5 rounded-xl text-xs font-medium min-h-touch transition-all ${
              duration === opt.value
                ? "bg-primary/15 text-primary border border-primary/30"
                : "card text-white/50"
            }`}
          >
            <div>{opt.label}</div>
            <div className="text-[10px] mt-0.5 opacity-60">{opt.desc}</div>
          </button>
        ))}
      </div>

      {/* 进度条 */}
      <div className="card p-4 mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-white/60">采购进度</span>
          <span className="text-sm font-semibold text-primary">
            {checkedCount}/{totalCount}
          </span>
        </div>
        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${progress}%`,
              background: "linear-gradient(90deg, #63d297, #4ecdc4)",
            }}
          />
        </div>
        {checkedCount === totalCount && totalCount > 0 && (
          <p className="text-xs text-primary mt-2 text-center">🎉 全部买齐了！</p>
        )}
      </div>

      {/* 分类列表 */}
      <div className="space-y-4 pb-4">
        {Object.entries(grouped).map(([category, catItems]) => {
          const catChecked = catItems.filter((i) => i.checked).length;
          return (
            <div key={category} className="card overflow-hidden">
              <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between">
                <span className="text-sm font-medium text-white/80">{category}</span>
                <span className="text-xs text-white/30">
                  {catChecked}/{catItems.length}
                </span>
              </div>
              <div>
                {catItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => toggleItem(item.id)}
                    className="w-full flex items-center gap-3 px-4 py-3 min-h-touch border-b border-white/3 last:border-0 active:bg-white/3 transition-colors"
                  >
                    <div
                      className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all flex-shrink-0 ${
                        item.checked
                          ? "bg-primary border-primary"
                          : "border-white/20"
                      }`}
                    >
                      {item.checked && (
                        <svg className="w-3 h-3 text-surface-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <span
                      className={`flex-1 text-left text-sm transition-all ${
                        item.checked ? "text-white/30 line-through" : "text-white/80"
                      }`}
                    >
                      {item.name}
                    </span>
                    <span
                      className={`text-xs ${
                        item.checked ? "text-white/20" : "text-white/40"
                      }`}
                    >
                      {item.amount}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
