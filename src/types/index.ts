// ===== 用户相关 =====
export type Gender = "he" | "she";

export interface UserProfile {
  gender: Gender;
  createdAt: string; // ISO date
}

// ===== 饮食相关 =====
export interface MealItem {
  name: string;
  amount: { he: string; she: string };
  calories: { he: number; she: number };
  unit?: string;
}

export interface Meal {
  id: string;
  type: "breakfast" | "lunch" | "dinner" | "snack";
  label: string;
  time: string; // 如 "11:00"
  items: MealItem[];
}

export interface DayMenu {
  day: 1 | 2;
  label: string;
  meals: Meal[];
  totalCalories: { he: number; she: number };
}

// ===== 餐次完成状态 =====
export interface MealCompletion {
  date: string; // YYYY-MM-DD
  mealId: string;
  completed: boolean;
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
  lastReset: string; // ISO date
}

// ===== 运动相关 =====
export interface Exercise {
  id: string;
  name: string;
  duration: number; // 分钟
  time: string; // 建议时间
  description: string;
  icon: string;
}

export interface ExerciseCompletion {
  date: string; // YYYY-MM-DD
  exerciseId: string;
  completed: boolean;
  actualDuration?: number; // 实际完成秒数
}

// ===== 打卡相关 =====
export interface WeightRecord {
  date: string; // YYYY-MM-DD
  weight: number; // 斤
  gender: Gender;
}

export interface PhotoRecord {
  date: string; // YYYY-MM-DD
  dataUrl: string; // base64 图片
  gender: Gender;
}

export interface CheckInRecord {
  date: string; // YYYY-MM-DD
  gender: Gender;
  checkedIn: boolean;
}

// ===== 数据服务接口 =====
export interface DataService {
  // 用户
  getUser(): UserProfile | null;
  setUser(user: UserProfile): void;

  // 餐次完成
  getMealCompletions(date: string): MealCompletion[];
  setMealCompletion(completion: MealCompletion): void;

  // 采购清单（共享）
  getShoppingList(): ShoppingList;
  setShoppingList(list: ShoppingList): void;
  toggleShoppingItem(itemId: string): void;
  resetShoppingList(): void;

  // 运动完成
  getExerciseCompletions(date: string, gender: Gender): ExerciseCompletion[];
  setExerciseCompletion(completion: ExerciseCompletion & { gender: Gender }): void;

  // 体重
  getWeightRecords(gender: Gender): WeightRecord[];
  addWeightRecord(record: WeightRecord): void;

  // 照片
  getPhotoRecords(gender: Gender): PhotoRecord[];
  addPhotoRecord(record: PhotoRecord): void;

  // 打卡
  getCheckInRecords(gender: Gender): CheckInRecord[];
  checkIn(record: CheckInRecord): void;
  getStreak(gender: Gender): number;
}
