// ===== 用户相关 =====
export type Gender = "he" | "she";

export interface UserProfile {
  gender: Gender;
  createdAt: string; // ISO date
}

// ===== 菜谱相关 =====
export type MealSlot = "lunch" | "dinner" | "snack";

export interface RecipeIngredient {
  name: string;
  amountHe: string;  // 男生用量
  amountShe: string; // 女生用量
  category: string;  // 采购分类: "肉类", "主食", "蔬菜", "水果", "乳品", "调料"
}

export interface Recipe {
  id: string;
  name: string;
  icon: string;        // emoji
  mealSlot: MealSlot;
  category: string;    // "鸡肉类", "鱼虾类", "牛肉类", "综合", "轻食", "汤类"
  caloriesHe: number;
  caloriesShe: number;
  proteinHe: number;   // 克
  proteinShe: number;
  carbsHe: number;
  carbsShe: number;
  fatHe: number;
  fatShe: number;
  ingredients: RecipeIngredient[];
  steps: string;       // 简要做法
  tags: string[];      // "高蛋白", "低脂", "快手", "不用开火"
}

// ===== 每日选菜 =====
export interface DayMealSelection {
  date: string;           // YYYY-MM-DD
  lunchId: string | null;
  dinnerId: string | null;
  snackId: string | null;
}

// ===== 采购清单 (动态生成) =====
export type ShoppingDuration = "one-meal" | "one-day" | "two-days";

export interface ShoppingItem {
  id: string;
  name: string;
  amount: string;
  category: string;
  checked: boolean;
}

export interface ShoppingList {
  items: ShoppingItem[];
  duration: ShoppingDuration;
  generatedFrom: string[]; // recipe IDs
  lastGenerated: string;   // ISO date
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

// ===== 每日热量目标 =====
export const CALORIE_TARGETS = {
  he: { min: 1500, max: 1700, lunch: { min: 550, max: 750 }, dinner: { min: 400, max: 600 }, snack: { min: 150, max: 250 } },
  she: { min: 1100, max: 1300, lunch: { min: 400, max: 550 }, dinner: { min: 300, max: 450 }, snack: { min: 100, max: 200 } },
} as const;

// ===== 数据服务接口 =====
export interface DataService {
  // 用户
  getUser(): UserProfile | null;
  setUser(user: UserProfile): void;

  // 每日选菜
  getDaySelection(date: string): DayMealSelection | null;
  setDaySelection(selection: DayMealSelection): void;

  // 采购清单（共享）
  getShoppingList(): ShoppingList | null;
  setShoppingList(list: ShoppingList): void;
  toggleShoppingItem(itemId: string): void;

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
