import { DayMenu } from "@/types";

export const MENU_DATA: DayMenu[] = [
  {
    day: 1,
    label: "Day 1",
    meals: [
      {
        id: "d1-lunch",
        type: "lunch",
        label: "午餐",
        time: "11:00",
        items: [
          { name: "糙米饭", amount: { he: "150g", she: "100g" }, calories: { he: 170, she: 115 } },
          { name: "鸡胸肉（煎/烤）", amount: { he: "200g", she: "150g" }, calories: { he: 230, she: 170 } },
          { name: "西蓝花", amount: { he: "150g", she: "120g" }, calories: { he: 50, she: 40 } },
          { name: "橄榄油", amount: { he: "10ml", she: "5ml" }, calories: { he: 90, she: 45 } },
        ],
      },
      {
        id: "d1-snack",
        type: "snack",
        label: "加餐",
        time: "15:00",
        items: [
          { name: "苹果", amount: { he: "1个", she: "1个" }, calories: { he: 80, she: 80 } },
          { name: "无糖酸奶", amount: { he: "200g", she: "150g" }, calories: { he: 120, she: 90 } },
        ],
      },
      {
        id: "d1-dinner",
        type: "dinner",
        label: "晚餐",
        time: "18:00",
        items: [
          { name: "荞麦面", amount: { he: "120g(干)", she: "80g(干)" }, calories: { he: 410, she: 275 } },
          { name: "虾仁", amount: { he: "150g", she: "120g" }, calories: { he: 140, she: 110 } },
          { name: "菠菜", amount: { he: "100g", she: "100g" }, calories: { he: 25, she: 25 } },
          { name: "番茄", amount: { he: "1个", she: "1个" }, calories: { he: 20, she: 20 } },
        ],
      },
    ],
    totalCalories: { he: 1335, she: 970 },
  },
  {
    day: 2,
    label: "Day 2",
    meals: [
      {
        id: "d2-lunch",
        type: "lunch",
        label: "午餐",
        time: "11:00",
        items: [
          { name: "紫薯/红薯", amount: { he: "200g", she: "150g" }, calories: { he: 180, she: 135 } },
          { name: "三文鱼（煎）", amount: { he: "150g", she: "120g" }, calories: { he: 310, she: 250 } },
          { name: "芦笋", amount: { he: "100g", she: "100g" }, calories: { he: 25, she: 25 } },
          { name: "混合生菜", amount: { he: "一碗", she: "一碗" }, calories: { he: 15, she: 15 } },
        ],
      },
      {
        id: "d2-snack",
        type: "snack",
        label: "加餐",
        time: "15:00",
        items: [
          { name: "香蕉", amount: { he: "1根", she: "1根" }, calories: { he: 90, she: 90 } },
          { name: "坚果（原味）", amount: { he: "20g", she: "15g" }, calories: { he: 120, she: 90 } },
        ],
      },
      {
        id: "d2-dinner",
        type: "dinner",
        label: "晚餐",
        time: "18:00",
        items: [
          { name: "全麦吐司", amount: { he: "2片", she: "1片" }, calories: { he: 160, she: 80 } },
          { name: "牛肉片", amount: { he: "150g", she: "120g" }, calories: { he: 200, she: 160 } },
          { name: "彩椒", amount: { he: "100g", she: "80g" }, calories: { he: 30, she: 25 } },
          { name: "黄瓜", amount: { he: "1根", she: "1根" }, calories: { he: 15, she: 15 } },
        ],
      },
    ],
    totalCalories: { he: 1145, she: 885 },
  },
];
