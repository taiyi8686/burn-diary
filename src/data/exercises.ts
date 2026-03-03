import { Exercise, Gender } from "@/types";

// ===== 工作日运动 =====
export const WORKDAY_EXERCISES: Exercise[] = [
  {
    id: "climb",
    name: "爬楼梯",
    duration: 45,
    time: "晚饭后",
    description: "每趟7层楼，爬上去坐电梯下来。保持匀速，有氧超40分钟高效燃脂。",
    icon: "🏃",
    forGender: "both",
  },
  {
    id: "dumbbell-curl",
    name: "哑铃弯举",
    duration: 5,
    time: "爬楼后",
    description: "双手各持哑铃，大臂贴紧身体，小臂弯举至肩部，缓慢放下。练肱二头肌。",
    icon: "💪",
    forGender: "he",
    sets: 3,
    reps: "12",
  },
  {
    id: "dumbbell-press",
    name: "哑铃推举",
    duration: 5,
    time: "爬楼后",
    description: "双手持哑铃举到肩部两侧，向上推举伸直手臂，缓慢放回。练三角肌和三头肌。",
    icon: "🏋️",
    forGender: "he",
    sets: 3,
    reps: "12",
  },
  {
    id: "pushup",
    name: "俯卧撑",
    duration: 5,
    time: "爬楼后",
    description: "双手撑地与肩同宽，身体保持一条直线，胸口接近地面后推起。练胸肌和核心。",
    icon: "🫸",
    forGender: "he",
    sets: 3,
    reps: "力竭",
  },
  {
    id: "situp",
    name: "仰卧起坐",
    duration: 5,
    time: "爬楼后",
    description: "躺在瑜伽垫上，双脚固定，卷腹起身至肩膀离地，缓慢放下。减肚子赘肉。",
    icon: "🧘",
    forGender: "she",
    sets: 3,
    reps: "20",
  },
];

// ===== 休息日运动 =====
export const RESTDAY_EXERCISES: Exercise[] = [
  {
    id: "walk",
    name: "情侣散步",
    duration: 45,
    time: "自由时间",
    description: "和另一半一起散步30-60分钟，聊聊天放松身心，保持日常活动量。",
    icon: "🚶",
    forGender: "both",
  },
];

// 根据性别、是否休息日、是否生理期 → 返回今天的运动列表
export function getExercises(gender: Gender, isRestDay: boolean, isPeriod: boolean): Exercise[] {
  if (isRestDay) return RESTDAY_EXERCISES;

  let exercises = WORKDAY_EXERCISES.filter(
    (e) => e.forGender === "both" || e.forGender === gender
  );

  // 生理期：去掉仰卧起坐
  if (isPeriod && gender === "she") {
    exercises = exercises.filter((e) => e.id !== "situp");
  }

  return exercises;
}

// 爬楼目标趟数
export function getTargetTrips(isPeriod: boolean, gender: Gender): number {
  if (isPeriod && gender === "she") return 5;
  return 10;
}
