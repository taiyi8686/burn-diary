// ===== 用户相关 =====
export type Gender = "he" | "she";

export interface UserProfile {
  gender: Gender;
  createdAt: string;
}

// ===== 日食谱 =====
export interface PlanItem {
  name: string;
  amountHe: string;
  amountShe: string;
  category: string; // 采购分类 "🥩 肉类" "🍚 主食" "🥬 蔬菜" "🍎 水果" "🧈 调料"
}

export interface PlanMeal {
  name: string;
  icon: string;
  time: string;
  caloriesHe: number;
  caloriesShe: number;
  proteinHe: number;
  proteinShe: number;
  items: PlanItem[];
  steps: string;
}

export interface DayPlan {
  id: string;
  name: string;
  icon: string;
  tags: string[];
  lunch: PlanMeal;
  dinner: PlanMeal;
  snack: PlanMeal;
  totalCaloriesHe: number;
  totalCaloriesShe: number;
  totalProteinHe: number;
  totalProteinShe: number;
}

// ===== 今日选择 =====
export interface DaySelection {
  date: string;
  planId: string;
  servings: 1 | 2; // 1人份 or 2人份
}

// ===== 采购清单 =====
export interface ShoppingItem {
  id: string;
  name: string;
  amount: string;
  category: string;
  checked: boolean;
}

export interface ShoppingList {
  items: ShoppingItem[];
  planId: string;
  servings: number;
  lastGenerated: string;
}

// ===== 运动相关 =====
export interface Exercise {
  id: string;
  name: string;
  duration: number;
  time: string;
  description: string;
  icon: string;
}

export interface ExerciseCompletion {
  date: string;
  exerciseId: string;
  completed: boolean;
  actualDuration?: number;
}

// ===== 打卡相关 =====
export interface WeightRecord {
  date: string;
  weight: number;
  gender: Gender;
}

export interface PhotoRecord {
  date: string;
  dataUrl: string;
  gender: Gender;
}

export interface CheckInRecord {
  date: string;
  gender: Gender;
  checkedIn: boolean;
}

// ===== 数据服务 =====
export interface DataService {
  getUser(): UserProfile | null;
  setUser(user: UserProfile): void;

  getDaySelection(date: string): DaySelection | null;
  setDaySelection(sel: DaySelection): void;

  getShoppingList(): ShoppingList | null;
  setShoppingList(list: ShoppingList): void;
  toggleShoppingItem(itemId: string): void;

  getExerciseCompletions(date: string, gender: Gender): ExerciseCompletion[];
  setExerciseCompletion(c: ExerciseCompletion & { gender: Gender }): void;

  getWeightRecords(gender: Gender): WeightRecord[];
  addWeightRecord(r: WeightRecord): void;

  getPhotoRecords(gender: Gender): PhotoRecord[];
  addPhotoRecord(r: PhotoRecord): void;

  getCheckInRecords(gender: Gender): CheckInRecord[];
  checkIn(r: CheckInRecord): void;
  getStreak(gender: Gender): number;
}
