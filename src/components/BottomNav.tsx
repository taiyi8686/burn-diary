"use client";

import React from "react";
import { usePathname, useRouter } from "next/navigation";

const TABS = [
  { path: "/", label: "饮食", icon: "🍱" },
  { path: "/shopping", label: "采购", icon: "🛒" },
  { path: "/exercise", label: "运动", icon: "💪" },
  { path: "/checkin", label: "打卡", icon: "📊" },
];

export function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass border-t border-white/5 safe-bottom">
      <div className="max-w-app mx-auto flex">
        {TABS.map((tab) => {
          const isActive = pathname === tab.path;
          return (
            <button
              key={tab.path}
              onClick={() => router.push(tab.path)}
              className={`flex-1 flex flex-col items-center py-2 pt-3 min-h-touch transition-colors ${
                isActive ? "text-primary" : "text-white/40"
              }`}
            >
              <span className="text-xl mb-0.5">{tab.icon}</span>
              <span className="text-[10px] font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
