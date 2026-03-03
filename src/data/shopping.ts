import { ShoppingItem } from "@/types";

export const SHOPPING_DATA: ShoppingItem[] = [
  // 肉类蛋白
  { id: "s1", name: "鸡胸肉", amount: "400g", category: "🥩 肉类蛋白", checked: false },
  { id: "s2", name: "三文鱼", amount: "300g", category: "🥩 肉类蛋白", checked: false },
  { id: "s3", name: "虾仁", amount: "300g", category: "🥩 肉类蛋白", checked: false },
  { id: "s4", name: "牛肉片", amount: "300g", category: "🥩 肉类蛋白", checked: false },

  // 主食
  { id: "s5", name: "糙米", amount: "500g", category: "🍚 主食", checked: false },
  { id: "s6", name: "荞麦面", amount: "200g", category: "🍚 主食", checked: false },
  { id: "s7", name: "全麦吐司", amount: "1袋", category: "🍚 主食", checked: false },
  { id: "s8", name: "紫薯/红薯", amount: "350g", category: "🍚 主食", checked: false },

  // 蔬菜
  { id: "s9", name: "西蓝花", amount: "1颗", category: "🥬 蔬菜", checked: false },
  { id: "s10", name: "菠菜", amount: "200g", category: "🥬 蔬菜", checked: false },
  { id: "s11", name: "芦笋", amount: "200g", category: "🥬 蔬菜", checked: false },
  { id: "s12", name: "番茄", amount: "2个", category: "🥬 蔬菜", checked: false },
  { id: "s13", name: "彩椒", amount: "2个", category: "🥬 蔬菜", checked: false },
  { id: "s14", name: "黄瓜", amount: "2根", category: "🥬 蔬菜", checked: false },
  { id: "s15", name: "混合生菜", amount: "1袋", category: "🥬 蔬菜", checked: false },

  // 水果零食
  { id: "s16", name: "苹果", amount: "2个", category: "🍎 水果零食", checked: false },
  { id: "s17", name: "香蕉", amount: "2根", category: "🍎 水果零食", checked: false },
  { id: "s18", name: "原味坚果", amount: "1小袋", category: "🍎 水果零食", checked: false },

  // 调料乳品
  { id: "s19", name: "无糖酸奶", amount: "2杯", category: "🧈 调料乳品", checked: false },
  { id: "s20", name: "橄榄油", amount: "1瓶(如已有可跳过)", category: "🧈 调料乳品", checked: false },
];

// 按分类分组
export function groupByCategory(items: ShoppingItem[]): Record<string, ShoppingItem[]> {
  return items.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, ShoppingItem[]>);
}
