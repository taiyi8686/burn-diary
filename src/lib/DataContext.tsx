"use client";

import React, { createContext, useContext, useRef, useEffect, useCallback, useState } from "react";
import { DataService } from "@/types";
import { LocalDataService } from "./localStorage";
import { pullFromCloud, pushToCloud } from "./sync";

const DataContext = createContext<DataService | null>(null);
const SyncContext = createContext<{ lastSync: number; syncStatus: string }>({ lastSync: 0, syncStatus: "" });

export function DataProvider({ children }: { children: React.ReactNode }) {
  const serviceRef = useRef<DataService>(new LocalDataService());
  const [lastSync, setLastSync] = useState(0);
  const [syncStatus, setSyncStatus] = useState("");
  const initialPushDone = useRef(false);

  const doSync = useCallback(async () => {
    try {
      if (!initialPushDone.current) {
        setSyncStatus("上传中...");
        await pushToCloud();
        initialPushDone.current = true;
      }
      setSyncStatus("同步中...");
      const updated = await pullFromCloud();
      if (updated) {
        setLastSync(Date.now());
        setSyncStatus("已同步 ✓");
      } else {
        setSyncStatus("已同步 ✓");
      }
    } catch {
      setSyncStatus("同步失败 ✗");
    }
  }, []);

  useEffect(() => {
    doSync();
    const interval = setInterval(doSync, 10000);
    const onFocus = () => doSync();
    window.addEventListener("focus", onFocus);
    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", onFocus);
    };
  }, [doSync]);

  return (
    <DataContext.Provider value={serviceRef.current}>
      <SyncContext.Provider value={{ lastSync, syncStatus }}>
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

export function useSyncTrigger(): number {
  return useContext(SyncContext).lastSync;
}

export function useSyncStatus(): string {
  return useContext(SyncContext).syncStatus;
}
