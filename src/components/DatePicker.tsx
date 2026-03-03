"use client";

import React, { useRef, useEffect } from "react";
import { getRecentDays, getDayType } from "@/lib/utils";

interface DatePickerProps {
  selected: string;
  onSelect: (date: string) => void;
}

export function DatePicker({ selected, onSelect }: DatePickerProps) {
  const days = getRecentDays(7);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 自动滚动到今天
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = scrollRef.current.scrollWidth;
    }
  }, []);

  return (
    <div
      ref={scrollRef}
      className="flex gap-2 overflow-x-auto scrollbar-hide py-1 -mx-4 px-4"
    >
      {days.map((day) => {
        const isSelected = day.date === selected;
        const dayType = getDayType(day.date);
        return (
          <button
            key={day.date}
            onClick={() => onSelect(day.date)}
            className={`flex-shrink-0 w-[60px] py-2 rounded-xl flex flex-col items-center gap-0.5 transition-all min-h-touch ${
              isSelected
                ? "bg-primary/20 border border-primary/40"
                : "card"
            }`}
          >
            <span className={`text-[10px] ${isSelected ? "text-primary" : "text-white/40"}`}>
              {day.weekday}
            </span>
            <span className={`text-sm font-semibold ${isSelected ? "text-primary" : "text-white/80"}`}>
              {day.label}
            </span>
            <span className={`text-[9px] ${isSelected ? "text-primary/70" : "text-white/30"}`}>
              D{dayType}
            </span>
          </button>
        );
      })}
    </div>
  );
}
