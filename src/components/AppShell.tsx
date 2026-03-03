"use client";

import React, { useEffect, useState } from "react";
import { useUserStore } from "@/lib/store";
import { useData } from "@/lib/DataContext";
import { UserSelect } from "./UserSelect";
import { BottomNav } from "./BottomNav";

export function AppShell({ children }: { children: React.ReactNode }) {
  const { gender, setGender, initialized, setInitialized } = useUserStore();
  const data = useData();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const user = data.getUser();
    if (user) {
      setGender(user.gender);
    }
    setInitialized(true);
  }, [data, setGender, setInitialized]);

  if (!mounted || !initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-dark">
        <div className="text-gradient text-2xl font-bold">燃脂日记</div>
      </div>
    );
  }

  if (!gender) {
    return <UserSelect />;
  }

  return (
    <div className="min-h-screen bg-surface-dark">
      <div className="max-w-app mx-auto relative min-h-screen pb-24">
        {children}
      </div>
      <BottomNav />
    </div>
  );
}
