import {
  DataService,
  UserProfile,
  DaySelection,
  ShoppingList,
  ExerciseCompletion,
  WeightRecord,
  PhotoRecord,
  CheckInRecord,
  Gender,
} from "@/types";
import { getBeijingDateStr } from "./utils";

const PREFIX = "burn-diary:";

function getKey(key: string): string {
  return `${PREFIX}${key}`;
}

function getItem<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(getKey(key));
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function setItem<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(getKey(key), JSON.stringify(value));
}

export class LocalDataService implements DataService {
  // ===== 用户 =====
  getUser(): UserProfile | null {
    return getItem<UserProfile>("user");
  }

  setUser(user: UserProfile): void {
    setItem("user", user);
  }

  // ===== 每日选择 =====
  getDaySelection(date: string): DaySelection | null {
    return getItem<DaySelection>(`selection:${date}`);
  }

  setDaySelection(selection: DaySelection): void {
    setItem(`selection:${selection.date}`, selection);
  }

  // ===== 采购清单（共享）=====
  getShoppingList(): ShoppingList | null {
    return getItem<ShoppingList>("shopping");
  }

  setShoppingList(list: ShoppingList): void {
    setItem("shopping", list);
  }

  toggleShoppingItem(itemId: string): void {
    const list = this.getShoppingList();
    if (!list) return;
    const item = list.items.find((i) => i.id === itemId);
    if (item) {
      item.checked = !item.checked;
      this.setShoppingList(list);
    }
  }

  // ===== 运动完成 =====
  getExerciseCompletions(date: string, gender: Gender): ExerciseCompletion[] {
    return getItem<ExerciseCompletion[]>(`exercise:${gender}:${date}`) || [];
  }

  setExerciseCompletion(completion: ExerciseCompletion & { gender: Gender }): void {
    const { gender, ...rest } = completion;
    const completions = this.getExerciseCompletions(rest.date, gender);
    const idx = completions.findIndex((c) => c.exerciseId === rest.exerciseId);
    if (idx >= 0) {
      completions[idx] = rest;
    } else {
      completions.push(rest);
    }
    setItem(`exercise:${gender}:${rest.date}`, completions);
  }

  // ===== 体重 =====
  getWeightRecords(gender: Gender): WeightRecord[] {
    return getItem<WeightRecord[]>(`weight:${gender}`) || [];
  }

  addWeightRecord(record: WeightRecord): void {
    const records = this.getWeightRecords(record.gender);
    const idx = records.findIndex((r) => r.date === record.date);
    if (idx >= 0) {
      records[idx] = record;
    } else {
      records.push(record);
    }
    records.sort((a, b) => a.date.localeCompare(b.date));
    setItem(`weight:${record.gender}`, records);
  }

  // ===== 照片 =====
  getPhotoRecords(gender: Gender): PhotoRecord[] {
    return getItem<PhotoRecord[]>(`photos:${gender}`) || [];
  }

  addPhotoRecord(record: PhotoRecord): void {
    const records = this.getPhotoRecords(record.gender);
    const idx = records.findIndex((r) => r.date === record.date);
    if (idx >= 0) {
      records[idx] = record;
    } else {
      records.push(record);
    }
    setItem(`photos:${record.gender}`, records);
  }

  // ===== 打卡 =====
  getCheckInRecords(gender: Gender): CheckInRecord[] {
    return getItem<CheckInRecord[]>(`checkin:${gender}`) || [];
  }

  checkIn(record: CheckInRecord): void {
    const records = this.getCheckInRecords(record.gender);
    const idx = records.findIndex((r) => r.date === record.date);
    if (idx >= 0) {
      records[idx] = record;
    } else {
      records.push(record);
    }
    records.sort((a, b) => a.date.localeCompare(b.date));
    setItem(`checkin:${record.gender}`, records);
  }

  getStreak(gender: Gender): number {
    const records = this.getCheckInRecords(gender).filter((r) => r.checkedIn);
    if (records.length === 0) return 0;

    const today = getBeijingDateStr();
    let streak = 0;
    let checkDate = today;

    for (let i = 0; i < 365; i++) {
      const found = records.find((r) => r.date === checkDate);
      if (found) {
        streak++;
        const d = new Date(checkDate);
        d.setDate(d.getDate() - 1);
        checkDate = d.toISOString().split("T")[0];
      } else {
        break;
      }
    }

    return streak;
  }

  // ===== 套餐使用统计 =====
  getPlanUsageCounts(): Record<string, number> {
    const counts: Record<string, number> = {};
    if (typeof window === "undefined") return counts;

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(getKey("selection:"))) {
        const raw = localStorage.getItem(key);
        if (raw) {
          try {
            const sel = JSON.parse(raw);
            if (sel.planId) {
              counts[sel.planId] = (counts[sel.planId] || 0) + 1;
            }
          } catch {
            // skip
          }
        }
      }
    }

    return counts;
  }
}
