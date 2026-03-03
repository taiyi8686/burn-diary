"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useData } from "@/lib/DataContext";
import { groupByCategory } from "@/data/shopping";
import { ShoppingItem } from "@/types";

export default function ShoppingPage() {
  const data = useData();
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [showReset, setShowReset] = useState(false);

  const loadItems = useCallback(() => {
    const list = data.getShoppingList();
    setItems(list.items);
  }, [data]);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  const toggleItem = (itemId: string) => {
    data.toggleShoppingItem(itemId);
    loadItems();
  };

  const handleReset = () => {
    data.resetShoppingList();
    loadItems();
    setShowReset(false);
  };

  const grouped = groupByCategory(items);
  const checkedCount = items.filter((i) => i.checked).length;
  const totalCount = items.length;
  const progress = totalCount > 0 ? (checkedCount / totalCount) * 100 : 0;

  return (
    <div className="px-4 pt-4">
      {/* 头部 */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold text-white">采购清单</h1>
          <p className="text-xs text-white/40 mt-0.5">两日食材用量</p>
        </div>
        <button
          onClick={() => setShowReset(true)}
          className="text-xs text-white/40 border border-white/10 rounded-lg px-3 py-1.5 active:bg-white/5 min-h-touch flex items-center"
        >
          重置清单
        </button>
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
                    {/* 勾选框 */}
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

      {/* 重置确认弹窗 */}
      {showReset && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60" onClick={() => setShowReset(false)}>
          <div className="card bg-surface p-6 mx-6 max-w-[320px] w-full" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-white mb-2">重置采购清单？</h3>
            <p className="text-sm text-white/50 mb-6">所有勾选状态将被清除</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowReset(false)}
                className="flex-1 py-2.5 rounded-xl bg-white/5 text-white/60 text-sm font-medium min-h-touch"
              >
                取消
              </button>
              <button
                onClick={handleReset}
                className="flex-1 py-2.5 rounded-xl btn-primary text-sm min-h-touch"
              >
                确认重置
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
