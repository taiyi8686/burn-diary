"use client";

import React, { createContext, useContext, useRef, useEffect, useCallback, useState } from "react";
import { DataService } from "@/types";
import { LocalDataService } from "./localStorage";
import { pullFromCloud, pushToCloud } from "./sync";

const DataContext = createContext<DataService | null>(null);
const SyncContext = createContext<{ lastSync: number }>({ lastSync: 0 });

export function DataProvider({ children }: { children: React.ReactNode }) {
  const serviceRef = useRef<DataService>(new LocalDataService());
  const [lastSync, setLastSync] = useState(0);
  const initialPushDone = useRef(false);

  const doSync = useCallback(async () => {
    // 首次同步：先把本地数据推上去（防止已有数据丢失）
    if (!initialPushDone.current) {
      await pushToCloud();
      initialPushDone.current = true;
    }
    // 从云端拉取最新数据
    const updated = await pullFromCloud();
    if (updated) {
      setLastSync(Date.now()); // 触发子组件刷新
    }
  }, []);

  useEffect(() => {
    // 进入页面时立即同步
    doSync();
    // 每 10 秒同步一次
    const interval = setInterval(doSync, 10000);
    // 页面获得焦点时也同步（从后台切回来）
    const onFocus = () => doSync();
    window.addEventListener("focus", onFocus);
    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", onFocus);
    };
  }, [doSync]);

  return (
    <DataContext.Provider value={serviceRef.current}>
      <SyncContext.Provider value={{ lastSync }}>
        {children}
      </SyncContext.Provider>
    </DataContext.Provider>
  );
}

export function useData(): DataService {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used within DataProvider");
  return ctx;
}

// 用于触发组件刷新的 hook
export function useSyncTrigger(): number {
  return useContext(SyncContext).lastSync;
}
