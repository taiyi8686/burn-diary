"use client";

import React from "react";
import { useUserStore } from "@/lib/store";
import { useData } from "@/lib/DataContext";
import { Gender } from "@/types";

export function UserSelect() {
  const { setGender } = useUserStore();
  const data = useData();

  const handleSelect = (gender: Gender) => {
    data.setUser({ gender, createdAt: new Date().toISOString() });
    setGender(gender);
  };

  return (
    <div className="min-h-screen bg-surface-dark flex flex-col items-center justify-center px-6">
      <div className="text-center mb-12 animate-fadeIn">
        <h1 className="text-4xl font-bold text-gradient mb-3">燃脂日记</h1>
        <p className="text-white/50 text-sm">一起变更好的自己</p>
      </div>

      <div className="w-full max-w-[320px] space-y-4 animate-fadeIn" style={{ animationDelay: "0.1s" }}>
        <p className="text-center text-white/70 text-sm mb-6">你是哪位？</p>

        <button
          onClick={() => handleSelect("he")}
          className="w-full card card-hover flex items-center gap-4 p-5 min-h-touch"
        >
          <div className="w-14 h-14 rounded-full bg-blue-500/20 flex items-center justify-center text-2xl">
            👨
          </div>
          <div className="text-left">
            <div className="text-lg font-semibold text-white">瑞文</div>
            <div className="text-sm text-white/40">瑞文的饮食运动计划</div>
          </div>
        </button>

        <button
          onClick={() => handleSelect("she")}
          className="w-full card card-hover flex items-center gap-4 p-5 min-h-touch"
        >
          <div className="w-14 h-14 rounded-full bg-pink-500/20 flex items-center justify-center text-2xl">
            👩
          </div>
          <div className="text-left">
            <div className="text-lg font-semibold text-white">发发</div>
            <div className="text-sm text-white/40">发发的饮食运动计划</div>
          </div>
        </button>
      </div>

      <p className="text-white/30 text-xs mt-8">之后可在设置中切换</p>
    </div>
  );
}
