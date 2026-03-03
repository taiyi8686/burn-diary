"use client";

import React, { createContext, useContext, useRef } from "react";
import { DataService } from "@/types";
import { LocalDataService } from "./localStorage";

const DataContext = createContext<DataService | null>(null);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const serviceRef = useRef<DataService>(new LocalDataService());

  return (
    <DataContext.Provider value={serviceRef.current}>
      {children}
    </DataContext.Provider>
  );
}

export function useData(): DataService {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used within DataProvider");
  return ctx;
}
