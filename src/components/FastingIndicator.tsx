"use client";

import React from "react";
import { getFastingStatus } from "@/lib/utils";

export function FastingIndicator() {
  const { status, text, nextTime } = getFastingStatus();
  const isEating = status === "eating";

  return (
    <div className={`mt-3 card flex items-center gap-3 p-3 ${
      isEating ? "border-primary/20" : "border-orange-500/20"
    }`}>
      <div className={`w-3 h-3 rounded-full ${
        isEating ? "bg-primary animate-pulse-green" : "bg-orange-500"
      }`} />
      <div className="flex-1">
        <span className={`text-sm font-medium ${isEating ? "text-primary" : "text-orange-400"}`}>
          16:8 · {text}
        </span>
        <span className="text-xs text-white/40 ml-2">进食窗口 11:00-19:00</span>
      </div>
      <span className="text-xs text-white/30">{nextTime}</span>
    </div>
  );
}
