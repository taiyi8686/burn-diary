import { DayPlan, Gender, ShoppingItem } from "@/types";

// 根据选中的日计划 + 性别 + 人数 → 生成采购清单
export function generateShoppingList(
  plan: DayPlan,
  gender: Gender,
  servings: 1 | 2
): ShoppingItem[] {
  // 收集三餐所有食材并按名称合并
  const ingredientMap = new Map<string, { amount: string; category: string }>();
  const meals = [plan.lunch, plan.dinner, plan.snack];

  for (const meal of meals) {
    for (const item of meal.items) {
      const baseAmount = gender === "he" ? item.amountHe : item.amountShe;
      const key = item.name;

      if (ingredientMap.has(key)) {
        const existing = ingredientMap.get(key)!;
        existing.amount = mergeAmounts(existing.amount, baseAmount);
      } else {
        ingredientMap.set(key, {
          amount: baseAmount,
          category: item.category,
        });
      }
    }
  }

  // 转成 ShoppingItem 数组
  const items: ShoppingItem[] = [];
  let idx = 0;
  ingredientMap.forEach((val, name) => {
    if (isSkippable(val.amount)) return;
    const finalAmount = servings === 2 ? multiplyAmount(val.amount, 2) : val.amount;
    items.push({
      id: `shop-${idx++}`,
      name,
      amount: finalAmount,
      category: val.category,
      checked: false,
    });
  });

  return items;
}

// 按分类分组
export function groupByCategory(items: ShoppingItem[]): Record<string, ShoppingItem[]> {
  return items.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, ShoppingItem[]>);
}

// ===== 辅助函数 =====

function isSkippable(amount: string): boolean {
  return ["适量", "少许"].includes(amount.trim());
}

// 数量翻倍（处理 "200g" → "400g", "1个" → "2个" 等）
function multiplyAmount(amount: string, multiplier: number): string {
  if (multiplier === 1) return amount;
  const match = amount.match(/^(\d+\.?\d*)(.*)/);
  if (match) {
    const num = parseFloat(match[1]) * multiplier;
    const unit = match[2];
    return `${num % 1 === 0 ? num : num.toFixed(1)}${unit}`;
  }
  return `${amount} ×${multiplier}`;
}

// 合并两个同名食材用量
function mergeAmounts(a: string, b: string): string {
  const matchA = a.match(/^(\d+\.?\d*)(g|ml|个|根|片|颗|把|碗|张|瓣|罐)/);
  const matchB = b.match(/^(\d+\.?\d*)(g|ml|个|根|片|颗|把|碗|张|瓣|罐)/);

  if (matchA && matchB && matchA[2] === matchB[2]) {
    const total = parseFloat(matchA[1]) + parseFloat(matchB[1]);
    return `${total % 1 === 0 ? total : total.toFixed(1)}${matchA[2]}`;
  }

  // 单位不同无法合并，返回合计描述
  return `${a}+${b}`;
}
