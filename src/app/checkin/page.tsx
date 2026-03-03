"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useUserStore } from "@/lib/store";
import { useData } from "@/lib/DataContext";
import { getBeijingDateStr, compressImage } from "@/lib/utils";
import { WeightRecord, CheckInRecord, Gender } from "@/types";
import { WeightChart } from "@/components/WeightChart";
import { CheckInCalendar } from "@/components/CheckInCalendar";

export default function CheckInPage() {
  const gender = useUserStore((s) => s.gender);
  const data = useData();
  const today = getBeijingDateStr();

  // 他的数据
  const [heWeight, setHeWeight] = useState("");
  const [heWeightRecords, setHeWeightRecords] = useState<WeightRecord[]>([]);
  const [heStreak, setHeStreak] = useState(0);
  const [heCheckedIn, setHeCheckedIn] = useState(false);
  const [hePhoto, setHePhoto] = useState<string | null>(null);
  const [heCheckInRecords, setHeCheckInRecords] = useState<CheckInRecord[]>([]);

  // 她的数据
  const [sheWeight, setSheWeight] = useState("");
  const [sheWeightRecords, setSheWeightRecords] = useState<WeightRecord[]>([]);
  const [sheStreak, setSheStreak] = useState(0);
  const [sheCheckedIn, setSheCheckedIn] = useState(false);
  const [shePhoto, setShePhoto] = useState<string | null>(null);
  const [sheCheckInRecords, setSheCheckInRecords] = useState<CheckInRecord[]>([]);

  const [saving, setSaving] = useState(false);
  const heFileRef = useRef<HTMLInputElement>(null);
  const sheFileRef = useRef<HTMLInputElement>(null);

  const load = useCallback(() => {
    // 他
    setHeWeightRecords(data.getWeightRecords("he"));
    setHeStreak(data.getStreak("he"));
    const heCI = data.getCheckInRecords("he");
    setHeCheckInRecords(heCI);
    setHeCheckedIn(heCI.some((c) => c.date === today && c.checkedIn));
    const hp = data.getPhotoRecords("he").find((p) => p.date === today);
    if (hp) setHePhoto(hp.dataUrl);
    const hw = data.getWeightRecords("he").find((r) => r.date === today);
    if (hw) setHeWeight(hw.weight.toString());

    // 她
    setSheWeightRecords(data.getWeightRecords("she"));
    setSheStreak(data.getStreak("she"));
    const sheCI = data.getCheckInRecords("she");
    setSheCheckInRecords(sheCI);
    setSheCheckedIn(sheCI.some((c) => c.date === today && c.checkedIn));
    const sp = data.getPhotoRecords("she").find((p) => p.date === today);
    if (sp) setShePhoto(sp.dataUrl);
    const sw = data.getWeightRecords("she").find((r) => r.date === today);
    if (sw) setSheWeight(sw.weight.toString());
  }, [data, today]);

  useEffect(() => {
    load();
  }, [load]);

  const saveWeight = (g: Gender, value: string) => {
    const w = parseFloat(value);
    if (isNaN(w) || w < 50 || w > 500) return;
    data.addWeightRecord({ date: today, weight: w, gender: g });
    load();
  };

  const handleCheckIn = (g: Gender) => {
    data.checkIn({ date: today, gender: g, checkedIn: true });
    load();
  };

  const handlePhotoUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    g: Gender,
    fileRef: React.RefObject<HTMLInputElement | null>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSaving(true);
    try {
      const dataUrl = await compressImage(file, 200);
      data.addPhotoRecord({ date: today, dataUrl, gender: g });
      load();
    } catch (err) {
      console.error("Photo compression failed:", err);
    }
    setSaving(false);
    if (fileRef.current) fileRef.current.value = "";
  };

  // 体重变化
  const getWeightChange = (records: WeightRecord[]) => {
    if (records.length < 2) return null;
    const latest = records[records.length - 1];
    const prev = records[records.length - 2];
    return latest.weight - prev.weight;
  };

  const heLatest = heWeightRecords.length > 0 ? heWeightRecords[heWeightRecords.length - 1] : null;
  const sheLatest = sheWeightRecords.length > 0 ? sheWeightRecords[sheWeightRecords.length - 1] : null;
  const heChange = getWeightChange(heWeightRecords);
  const sheChange = getWeightChange(sheWeightRecords);

  const hasAnyWeightData = heWeightRecords.length > 1 || sheWeightRecords.length > 1;

  if (!gender) return null;

  return (
    <div className="px-4 pt-4">
      {/* 头部 */}
      <div className="mb-4">
        <h1 className="text-xl font-bold text-white">打卡记录</h1>
        <p className="text-xs text-white/40 mt-0.5">一起坚持，见证改变</p>
      </div>

      {/* 今日签到 - 双人并排 */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {/* 他 */}
        <div className="card p-4 flex flex-col items-center text-center">
          <span className="text-2xl mb-1">👨</span>
          <span className="text-sm font-medium text-white mb-0.5">瑞文</span>
          <span className="text-xs text-[#4ecdc4] mb-3">
            连续 {heStreak} 天
          </span>
          <button
            onClick={() => handleCheckIn("he")}
            disabled={heCheckedIn}
            className={`w-full py-2.5 rounded-xl text-xs font-medium min-h-touch transition-all ${
              heCheckedIn
                ? "bg-[#4ecdc4]/10 text-[#4ecdc4]"
                : "bg-[#4ecdc4]/20 text-[#4ecdc4] active:bg-[#4ecdc4]/30"
            }`}
          >
            {heCheckedIn ? "✓ 已签到" : "签到"}
          </button>
        </div>

        {/* 她 */}
        <div className="card p-4 flex flex-col items-center text-center">
          <span className="text-2xl mb-1">👩</span>
          <span className="text-sm font-medium text-white mb-0.5">发发</span>
          <span className="text-xs text-[#f472b6] mb-3">
            连续 {sheStreak} 天
          </span>
          <button
            onClick={() => handleCheckIn("she")}
            disabled={sheCheckedIn}
            className={`w-full py-2.5 rounded-xl text-xs font-medium min-h-touch transition-all ${
              sheCheckedIn
                ? "bg-[#f472b6]/10 text-[#f472b6]"
                : "bg-[#f472b6]/20 text-[#f472b6] active:bg-[#f472b6]/30"
            }`}
          >
            {sheCheckedIn ? "✓ 已签到" : "签到"}
          </button>
        </div>
      </div>

      {/* 双人打卡状态提示 */}
      {heCheckedIn && sheCheckedIn && (
        <div className="card p-3 mb-4 text-center bg-primary/5 border border-primary/10">
          <span className="text-xs text-primary">🎉 今天两人都完成打卡了！继续加油！</span>
        </div>
      )}

      {/* 体重记录 - 他 */}
      <div className="card p-4 mb-3">
        <div className="flex items-center gap-2 mb-3">
          <span className="w-2 h-2 rounded-full bg-[#4ecdc4]" />
          <h3 className="text-sm font-semibold text-white">瑞文的体重</h3>
        </div>
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <input
              type="number"
              inputMode="decimal"
              step="0.1"
              value={heWeight}
              onChange={(e) => setHeWeight(e.target.value)}
              placeholder="输入今日体重"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/30 outline-none focus:border-[#4ecdc4]/40 min-h-touch"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-white/40">斤</span>
          </div>
          <button
            onClick={() => saveWeight("he", heWeight)}
            className="px-5 rounded-xl text-sm min-h-touch bg-[#4ecdc4]/15 text-[#4ecdc4] font-medium active:bg-[#4ecdc4]/25"
          >
            保存
          </button>
        </div>
        {heLatest && (
          <div className="flex items-center gap-3 mt-2">
            <span className="text-xs text-white/40">最新：{heLatest.weight} 斤</span>
            {heChange !== null && (
              <span className={`text-xs ${heChange < 0 ? "text-primary" : heChange > 0 ? "text-red-400" : "text-white/40"}`}>
                {heChange > 0 ? "+" : ""}{heChange.toFixed(1)} 斤
                {heChange < 0 ? " ↓" : heChange > 0 ? " ↑" : ""}
              </span>
            )}
          </div>
        )}
      </div>

      {/* 体重记录 - 她 */}
      <div className="card p-4 mb-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="w-2 h-2 rounded-full bg-[#f472b6]" />
          <h3 className="text-sm font-semibold text-white">发发的体重</h3>
        </div>
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <input
              type="number"
              inputMode="decimal"
              step="0.1"
              value={sheWeight}
              onChange={(e) => setSheWeight(e.target.value)}
              placeholder="输入今日体重"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/30 outline-none focus:border-[#f472b6]/40 min-h-touch"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-white/40">斤</span>
          </div>
          <button
            onClick={() => saveWeight("she", sheWeight)}
            className="px-5 rounded-xl text-sm min-h-touch bg-[#f472b6]/15 text-[#f472b6] font-medium active:bg-[#f472b6]/25"
          >
            保存
          </button>
        </div>
        {sheLatest && (
          <div className="flex items-center gap-3 mt-2">
            <span className="text-xs text-white/40">最新：{sheLatest.weight} 斤</span>
            {sheChange !== null && (
              <span className={`text-xs ${sheChange < 0 ? "text-primary" : sheChange > 0 ? "text-red-400" : "text-white/40"}`}>
                {sheChange > 0 ? "+" : ""}{sheChange.toFixed(1)} 斤
                {sheChange < 0 ? " ↓" : sheChange > 0 ? " ↑" : ""}
              </span>
            )}
          </div>
        )}
      </div>

      {/* 体重趋势图 - 双线 */}
      {hasAnyWeightData && (
        <div className="card p-4 mb-4">
          <h3 className="text-sm font-semibold text-white mb-3">体重趋势</h3>
          <WeightChart heRecords={heWeightRecords} sheRecords={sheWeightRecords} />
        </div>
      )}

      {/* 照片打卡 - 双人并排 */}
      <div className="card p-4 mb-4">
        <h3 className="text-sm font-semibold text-white mb-3">今日照片</h3>
        <input
          ref={heFileRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={(e) => handlePhotoUpload(e, "he", heFileRef)}
          className="hidden"
        />
        <input
          ref={sheFileRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={(e) => handlePhotoUpload(e, "she", sheFileRef)}
          className="hidden"
        />
        <div className="grid grid-cols-2 gap-3">
          {/* 他的照片 */}
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <span className="w-2 h-2 rounded-full bg-[#4ecdc4]" />
              <span className="text-xs text-white/50">瑞文</span>
            </div>
            {hePhoto ? (
              <div className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={hePhoto}
                  alt="瑞文的打卡照片"
                  className="w-full rounded-xl object-cover aspect-[3/4]"
                />
                <button
                  onClick={() => heFileRef.current?.click()}
                  className="absolute bottom-2 right-2 bg-black/60 text-white/80 text-[10px] px-2 py-1 rounded-lg"
                >
                  重拍
                </button>
              </div>
            ) : (
              <button
                onClick={() => heFileRef.current?.click()}
                disabled={saving}
                className="w-full aspect-[3/4] rounded-xl border-2 border-dashed border-white/10 text-white/40 text-xs flex flex-col items-center justify-center gap-1.5 active:bg-white/3"
              >
                <span className="text-2xl">📸</span>
                <span>拍照</span>
              </button>
            )}
          </div>

          {/* 她的照片 */}
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <span className="w-2 h-2 rounded-full bg-[#f472b6]" />
              <span className="text-xs text-white/50">发发</span>
            </div>
            {shePhoto ? (
              <div className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={shePhoto}
                  alt="发发的打卡照片"
                  className="w-full rounded-xl object-cover aspect-[3/4]"
                />
                <button
                  onClick={() => sheFileRef.current?.click()}
                  className="absolute bottom-2 right-2 bg-black/60 text-white/80 text-[10px] px-2 py-1 rounded-lg"
                >
                  重拍
                </button>
              </div>
            ) : (
              <button
                onClick={() => sheFileRef.current?.click()}
                disabled={saving}
                className="w-full aspect-[3/4] rounded-xl border-2 border-dashed border-white/10 text-white/40 text-xs flex flex-col items-center justify-center gap-1.5 active:bg-white/3"
              >
                <span className="text-2xl">📸</span>
                <span>拍照</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 打卡日历 - 双色 */}
      <div className="card p-4 mb-4">
        <h3 className="text-sm font-semibold text-white mb-3">打卡日历</h3>
        <CheckInCalendar heRecords={heCheckInRecords} sheRecords={sheCheckInRecords} />
      </div>

      {/* 切换视角（影响饮食/运动页面） */}
      <div className="text-center pb-8">
        <p className="text-[10px] text-white/20 mb-1">
          当前饮食/运动页面显示：{gender === "he" ? "👨 瑞文" : "👩 发发"}
        </p>
        <button
          onClick={() => {
            const newGender = gender === "he" ? "she" : "he";
            data.setUser({ gender: newGender, createdAt: new Date().toISOString() });
            useUserStore.getState().setGender(newGender);
          }}
          className="text-xs text-white/30 underline underline-offset-2 min-h-touch"
        >
          切换到{gender === "he" ? "发发" : "瑞文"}的饮食/运动视角
        </button>
      </div>
    </div>
  );
}
