"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useUserStore } from "@/lib/store";
import { useData } from "@/lib/DataContext";
import { getBeijingDateStr, compressImage } from "@/lib/utils";
import { WeightRecord } from "@/types";
import { WeightChart } from "@/components/WeightChart";
import { CheckInCalendar } from "@/components/CheckInCalendar";

export default function CheckInPage() {
  const gender = useUserStore((s) => s.gender);
  const data = useData();
  const today = getBeijingDateStr();

  const [weight, setWeight] = useState("");
  const [weightRecords, setWeightRecords] = useState<WeightRecord[]>([]);
  const [streak, setStreak] = useState(0);
  const [todayCheckedIn, setTodayCheckedIn] = useState(false);
  const [todayPhoto, setTodayPhoto] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const load = useCallback(() => {
    if (!gender) return;
    setWeightRecords(data.getWeightRecords(gender));
    setStreak(data.getStreak(gender));
    const checkIns = data.getCheckInRecords(gender);
    setTodayCheckedIn(checkIns.some((c) => c.date === today && c.checkedIn));
    const photos = data.getPhotoRecords(gender);
    const tp = photos.find((p) => p.date === today);
    if (tp) setTodayPhoto(tp.dataUrl);
    // 填入今天已有的体重
    const todayWeight = data.getWeightRecords(gender).find((r) => r.date === today);
    if (todayWeight) setWeight(todayWeight.weight.toString());
  }, [data, gender, today]);

  useEffect(() => {
    load();
  }, [load]);

  const saveWeight = () => {
    if (!gender || !weight) return;
    const w = parseFloat(weight);
    if (isNaN(w) || w < 50 || w > 500) return;
    data.addWeightRecord({ date: today, weight: w, gender });
    load();
  };

  const handleCheckIn = () => {
    if (!gender) return;
    data.checkIn({ date: today, gender, checkedIn: true });
    load();
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !gender) return;
    setSaving(true);
    try {
      const dataUrl = await compressImage(file, 200);
      data.addPhotoRecord({ date: today, dataUrl, gender });
      setTodayPhoto(dataUrl);
    } catch (err) {
      console.error("Photo compression failed:", err);
    }
    setSaving(false);
    // 清空 input，允许重复上传同一文件
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // 获取最近一条体重记录，用于显示变化
  const latestWeight = weightRecords.length > 0 ? weightRecords[weightRecords.length - 1] : null;
  const prevWeight = weightRecords.length > 1 ? weightRecords[weightRecords.length - 2] : null;
  const weightChange = latestWeight && prevWeight ? latestWeight.weight - prevWeight.weight : null;

  if (!gender) return null;

  return (
    <div className="px-4 pt-4">
      {/* 头部 */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold text-white">打卡记录</h1>
          <p className="text-xs text-white/40 mt-0.5">
            {gender === "he" ? "👨 他" : "👩 她"}的记录
          </p>
        </div>
        <div className="text-right">
          <div className="text-sm text-white/60">连续打卡</div>
          <div className="text-lg font-bold text-primary">{streak} 天</div>
        </div>
      </div>

      {/* 每日签到 */}
      <div className="card p-4 mb-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-white">每日签到</h3>
            <p className="text-xs text-white/40 mt-0.5">坚持打卡，见证改变</p>
          </div>
          <button
            onClick={handleCheckIn}
            disabled={todayCheckedIn}
            className={`px-6 py-2.5 rounded-xl text-sm font-medium min-h-touch transition-all ${
              todayCheckedIn
                ? "bg-primary/10 text-primary"
                : "btn-primary animate-pulse-green"
            }`}
          >
            {todayCheckedIn ? "✓ 已签到" : "签到"}
          </button>
        </div>
      </div>

      {/* 体重记录 */}
      <div className="card p-4 mb-4">
        <h3 className="text-sm font-semibold text-white mb-3">体重记录</h3>
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <input
              type="number"
              inputMode="decimal"
              step="0.1"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="输入今日体重"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/30 outline-none focus:border-primary/40 min-h-touch"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-white/40">斤</span>
          </div>
          <button
            onClick={saveWeight}
            className="px-5 rounded-xl btn-primary text-sm min-h-touch"
          >
            保存
          </button>
        </div>
        {latestWeight && (
          <div className="flex items-center gap-3 mt-3">
            <span className="text-xs text-white/40">
              最新：{latestWeight.weight} 斤
            </span>
            {weightChange !== null && (
              <span className={`text-xs ${weightChange < 0 ? "text-primary" : weightChange > 0 ? "text-red-400" : "text-white/40"}`}>
                {weightChange > 0 ? "+" : ""}{weightChange.toFixed(1)} 斤
                {weightChange < 0 ? " ↓" : weightChange > 0 ? " ↑" : ""}
              </span>
            )}
          </div>
        )}
      </div>

      {/* 体重折线图 */}
      {weightRecords.length > 1 && (
        <div className="card p-4 mb-4">
          <h3 className="text-sm font-semibold text-white mb-3">体重趋势</h3>
          <WeightChart records={weightRecords} />
        </div>
      )}

      {/* 照片打卡 */}
      <div className="card p-4 mb-4">
        <h3 className="text-sm font-semibold text-white mb-3">今日照片</h3>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handlePhotoUpload}
          className="hidden"
        />
        {todayPhoto ? (
          <div className="relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={todayPhoto}
              alt="今日打卡照片"
              className="w-full rounded-xl object-cover max-h-[300px]"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-3 right-3 bg-black/60 text-white/80 text-xs px-3 py-1.5 rounded-lg"
            >
              重新拍照
            </button>
          </div>
        ) : (
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={saving}
            className="w-full py-8 rounded-xl border-2 border-dashed border-white/10 text-white/40 text-sm flex flex-col items-center gap-2 active:bg-white/3 transition-colors"
          >
            {saving ? (
              <span>处理中...</span>
            ) : (
              <>
                <span className="text-3xl">📸</span>
                <span>拍照 / 从相册选择</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* 打卡日历 */}
      <div className="card p-4 mb-4">
        <h3 className="text-sm font-semibold text-white mb-3">打卡日历</h3>
        <CheckInCalendar gender={gender} />
      </div>

      {/* 切换用户 */}
      <div className="text-center pb-8">
        <button
          onClick={() => {
            const newGender = gender === "he" ? "she" : "he";
            data.setUser({ gender: newGender, createdAt: new Date().toISOString() });
            useUserStore.getState().setGender(newGender);
          }}
          className="text-xs text-white/30 underline underline-offset-2 min-h-touch"
        >
          切换到{gender === "he" ? "她" : "他"}的视角
        </button>
      </div>
    </div>
  );
}
