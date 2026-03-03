"use client";

import React, { useState, useEffect } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, subMonths, addMonths } from "date-fns";
import { zhCN } from "date-fns/locale";
import { useData } from "@/lib/DataContext";
import { Gender, CheckInRecord } from "@/types";
import { getBeijingDateStr } from "@/lib/utils";

interface CheckInCalendarProps {
  gender: Gender;
}

const WEEKDAYS = ["日", "一", "二", "三", "四", "五", "六"];

export function CheckInCalendar({ gender }: CheckInCalendarProps) {
  const data = useData();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [records, setRecords] = useState<CheckInRecord[]>([]);

  useEffect(() => {
    setRecords(data.getCheckInRecords(gender));
  }, [data, gender]);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startDayOfWeek = getDay(monthStart);
  const today = getBeijingDateStr();

  const checkedDates = new Set(
    records.filter((r) => r.checkedIn).map((r) => r.date)
  );

  return (
    <div>
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
        {/* 空白填充 */}
        {Array.from({ length: startDayOfWeek }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}

        {days.map((day) => {
          const dateStr = format(day, "yyyy-MM-dd");
          const isChecked = checkedDates.has(dateStr);
          const isToday = dateStr === today;

          return (
            <div
              key={dateStr}
              className={`aspect-square flex items-center justify-center rounded-lg text-xs relative ${
                isToday ? "border border-primary/30" : ""
              }`}
            >
              <span className={isChecked ? "text-primary font-semibold" : "text-white/40"}>
                {day.getDate()}
              </span>
              {isChecked && (
                <div className="absolute bottom-0.5 w-1 h-1 rounded-full bg-primary" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
