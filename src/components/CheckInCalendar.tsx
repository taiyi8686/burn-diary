"use client";

import React, { useState } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, subMonths, addMonths } from "date-fns";
import { zhCN } from "date-fns/locale";
import { CheckInRecord } from "@/types";
import { getBeijingDateStr } from "@/lib/utils";

interface CheckInCalendarProps {
  heRecords: CheckInRecord[];
  sheRecords: CheckInRecord[];
}

const WEEKDAYS = ["日", "一", "二", "三", "四", "五", "六"];

export function CheckInCalendar({ heRecords, sheRecords }: CheckInCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startDayOfWeek = getDay(monthStart);
  const today = getBeijingDateStr();

  const heCheckedDates = new Set(
    heRecords.filter((r) => r.checkedIn).map((r) => r.date)
  );
  const sheCheckedDates = new Set(
    sheRecords.filter((r) => r.checkedIn).map((r) => r.date)
  );

  return (
    <div>
      {/* 图例 */}
      <div className="flex items-center gap-4 mb-3">
        <span className="flex items-center gap-1 text-[10px] text-white/40">
          <span className="w-2 h-2 rounded-full bg-[#4ecdc4]" /> 瑞文
        </span>
        <span className="flex items-center gap-1 text-[10px] text-white/40">
          <span className="w-2 h-2 rounded-full bg-[#f472b6]" /> 发发
        </span>
      </div>

      {/* 月份导航 */}
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white/40 active:bg-white/10"
        >
          ‹
        </button>
        <span className="text-sm text-white/70 font-medium">
          {format(currentMonth, "yyyy年M月", { locale: zhCN })}
        </span>
        <button
          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white/40 active:bg-white/10"
        >
          ›
        </button>
      </div>

      {/* 星期头 */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {WEEKDAYS.map((w) => (
          <div key={w} className="text-center text-[10px] text-white/30 py-1">
            {w}
          </div>
        ))}
      </div>

      {/* 日期格子 */}
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: startDayOfWeek }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}

        {days.map((day) => {
          const dateStr = format(day, "yyyy-MM-dd");
          const heChecked = heCheckedDates.has(dateStr);
          const sheChecked = sheCheckedDates.has(dateStr);
          const isToday = dateStr === today;
          const bothChecked = heChecked && sheChecked;

          return (
            <div
              key={dateStr}
              className={`aspect-square flex flex-col items-center justify-center rounded-lg text-xs relative ${
                isToday ? "border border-primary/30" : ""
              }`}
            >
              <span
                className={`${
                  bothChecked
                    ? "text-primary font-semibold"
                    : heChecked || sheChecked
                    ? "text-white/70 font-medium"
                    : "text-white/40"
                }`}
              >
                {day.getDate()}
              </span>
              {/* 打卡点 */}
              {(heChecked || sheChecked) && (
                <div className="flex gap-0.5 mt-0.5">
                  {heChecked && (
                    <div className="w-1.5 h-1.5 rounded-full bg-[#4ecdc4]" />
                  )}
                  {sheChecked && (
                    <div className="w-1.5 h-1.5 rounded-full bg-[#f472b6]" />
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
