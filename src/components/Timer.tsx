"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Exercise } from "@/types";
import { formatTime } from "@/lib/utils";

interface TimerProps {
  exercise: Exercise;
  onClose: () => void;
  onComplete: () => void;
}

export function Timer({ exercise, onClose, onComplete }: TimerProps) {
  const totalSeconds = exercise.duration * 60;
  const [elapsed, setElapsed] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const remaining = Math.max(0, totalSeconds - elapsed);
  const progress = totalSeconds > 0 ? elapsed / totalSeconds : 0;

  // 圆形进度参数
  const radius = 90;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress);

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setElapsed((prev) => {
          if (prev + 1 >= totalSeconds) {
            clearTimer();
            setIsRunning(false);
            return totalSeconds;
          }
          return prev + 1;
        });
      }, 1000);
    } else {
      clearTimer();
    }

    return clearTimer;
  }, [isRunning, totalSeconds, clearTimer]);

  const handleStartPause = () => {
    setIsRunning(!isRunning);
  };

  const handleStop = () => {
    setIsRunning(false);
    setElapsed(0);
  };

  const isFinished = elapsed >= totalSeconds;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80" onClick={onClose}>
      <div
        className="card bg-surface p-8 mx-6 max-w-[360px] w-full flex flex-col items-center"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-semibold text-white mb-1">{exercise.icon} {exercise.name}</h3>
        <p className="text-xs text-white/40 mb-6">{exercise.duration} 分钟</p>

        {/* 圆形进度 */}
        <div className="relative w-[220px] h-[220px] mb-6">
          <svg className="w-full h-full" viewBox="0 0 200 200">
            {/* 背景圆 */}
            <circle
              cx="100" cy="100" r={radius}
              fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8"
            />
            {/* 进度圆 */}
            <circle
              cx="100" cy="100" r={radius}
              fill="none"
              stroke="url(#gradient)"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className="progress-ring-circle"
            />
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#63d297" />
                <stop offset="100%" stopColor="#4ecdc4" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl font-bold text-white font-mono">
              {formatTime(remaining)}
            </span>
            <span className="text-xs text-white/40 mt-1">
              {isFinished ? "完成！" : isRunning ? "进行中" : elapsed > 0 ? "已暂停" : "准备开始"}
            </span>
          </div>
        </div>

        {/* 控制按钮 */}
        <div className="flex gap-3 w-full">
          {isFinished ? (
            <button onClick={onComplete} className="flex-1 btn-primary py-3 text-sm min-h-touch">
              🎉 完成运动
            </button>
          ) : (
            <>
              <button
                onClick={handleStop}
                className="w-14 h-14 rounded-full bg-white/5 text-white/60 flex items-center justify-center active:bg-white/10"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <rect x="6" y="6" width="12" height="12" rx="2" />
                </svg>
              </button>
              <button
                onClick={handleStartPause}
                className="flex-1 btn-primary py-3 text-sm min-h-touch flex items-center justify-center gap-2"
              >
                {isRunning ? (
                  <>
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <rect x="6" y="5" width="4" height="14" rx="1" />
                      <rect x="14" y="5" width="4" height="14" rx="1" />
                    </svg>
                    暂停
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <polygon points="8,5 20,12 8,19" />
                    </svg>
                    {elapsed > 0 ? "继续" : "开始"}
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
