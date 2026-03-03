"use client";

import { create } from "zustand";
import { Gender } from "@/types";

interface UserStore {
  gender: Gender | null;
  setGender: (gender: Gender) => void;
  initialized: boolean;
  setInitialized: (v: boolean) => void;
}

export const useUserStore = create<UserStore>((set) => ({
  gender: null,
  setGender: (gender) => set({ gender }),
  initialized: false,
  setInitialized: (v) => set({ initialized: v }),
}));
