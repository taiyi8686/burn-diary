import { Exercise } from "@/types";

export const EXERCISE_DATA: Exercise[] = [
  {
    id: "ex1",
    name: "爬楼梯",
    duration: 15,
    time: "任意时间",
    description: "上下楼梯或台阶，匀速进行，微微出汗即可。可分2-3次完成。",
    icon: "🏃",
  },
  {
    id: "ex2",
    name: "快走/散步",
    duration: 30,
    time: "饭后1小时",
    description: "中等速度步行，保持挺胸抬头，手臂自然摆动。有助消化和燃脂。",
    icon: "🚶",
  },
  {
    id: "ex3",
    name: "拉伸放松",
    duration: 10,
    time: "睡前",
    description: "全身拉伸，包括颈部、肩膀、腰背、腿部。每个动作保持15-30秒。",
    icon: "🧘",
  },
];
