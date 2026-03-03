import { Recipe, Gender, ShoppingItem, ShoppingDuration } from "@/types";

// 根据选中的菜谱 + 性别 + 采购时长 → 生成采购清单
export function generateShoppingList(
  recipes: Recipe[],
  gender: Gender,
  duration: ShoppingDuration
): ShoppingItem[] {
  // 确定倍数
  const multiplier = duration === "one-meal" ? 1 : duration === "one-day" ? 1 : 2;
  // one-meal 模式：食材不合并，每个菜单独列
  // one-day / two-days：所有菜合并食材

  // 收集所有食材并按名称合并
  const ingredientMap = new Map<string, { amount: string; category: string; count: number }>();

  for (const recipe of recipes) {
    for (const ing of recipe.ingredients) {
      const amount = gender === "he" ? ing.amountHe : ing.amountShe;
      const key = ing.name;

      if (ingredientMap.has(key)) {
        const existing = ingredientMap.get(key)!;
        // 尝试合并数量
        existing.amount = mergeAmounts(existing.amount, amount, multiplier > 1 ? multiplier : 1);
        existing.count++;
      } else {
        ingredientMap.set(key, {
          amount: multiplyAmount(amount, multiplier),
          category: ing.category,
          count: 1,
        });
      }
    }
  }

  // 转成 ShoppingItem 数组
  const items: ShoppingItem[] = [];
  let idx = 0;
  ingredientMap.forEach((val, name) => {
    // 跳过"适量""少许"等调料
    if (isSkippable(val.amount)) return;
    items.push({
      id: `shop-${idx++}`,
      name,
      amount: val.amount,
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

// 简单的数量翻倍（处理 "200g" → "400g", "1个" → "2个" 等）
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

// 合并两个食材用量（简化处理：同单位相加，不同单位列出两个）
function mergeAmounts(a: string, b: string, multiplier: number): string {
  const matchA = a.match(/^(\d+\.?\d*)(g|ml|个|根|片|颗|把|碗|张|瓣|罐)/);
  const matchB = b.match(/^(\d+\.?\d*)(g|ml|个|根|片|颗|把|碗|张|瓣|罐)/);

  if (matchA && matchB && matchA[2] === matchB[2]) {
    const total = (parseFloat(matchA[1]) + parseFloat(matchB[1])) * (multiplier > 1 ? multiplier / 2 : 1);
    return `${total % 1 === 0 ? total : total.toFixed(1)}${matchA[2]}`;
  }

  // 无法合并，直接返回 a（首个的量）
  return a;
}
