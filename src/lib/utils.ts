import { format, subDays, differenceInCalendarDays } from "date-fns";
import { zhCN } from "date-fns/locale";

// 获取北京时间的当前日期
export function getBeijingDate(): Date {
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  return new Date(utc + 8 * 3600000);
}

// 获取北京时间格式化日期 YYYY-MM-DD
export function getBeijingDateStr(): string {
  return format(getBeijingDate(), "yyyy-MM-dd");
}

// 获取北京时间的小时数
export function getBeijingHour(): number {
  return getBeijingDate().getHours();
}

// 获取北京时间的分钟数
export function getBeijingMinutes(): number {
  return getBeijingDate().getMinutes();
}

// 判断今天是 Day1 还是 Day2（基于某个起始日的奇偶天数）
// 起始日为 2026-03-03（项目开始日），Day1
export function getDayType(dateStr: string): 1 | 2 {
  const startDate = new Date("2026-03-03");
  const current = new Date(dateStr);
  const diff = differenceInCalendarDays(current, startDate);
  return (Math.abs(diff) % 2 === 0) ? 1 : 2;
}

// 生成最近7天的日期列表
export function getRecentDays(count: number = 7): { date: string; label: string; weekday: string; isToday: boolean }[] {
  const today = getBeijingDateStr();
  const todayDate = getBeijingDate();
  const days = [];

  for (let i = count - 1; i >= 0; i--) {
    const d = subDays(todayDate, i);
    const dateStr = format(d, "yyyy-MM-dd");
    const weekday = format(d, "EEE", { locale: zhCN });
    const label = format(d, "M/d");
    days.push({
      date: dateStr,
      label,
      weekday,
      isToday: dateStr === today,
    });
  }

  return days;
}

// 判断当前是否在断食窗口内（11:00 - 19:00 可以吃）
export function isEatingWindow(): boolean {
  const hour = getBeijingHour();
  return hour >= 11 && hour < 19;
}

// 获取断食状态文案
export function getFastingStatus(): { status: "eating" | "fasting"; text: string; nextTime: string } {
  const hour = getBeijingHour();

  if (hour >= 11 && hour < 19) {
    return {
      status: "eating",
      text: "进食窗口",
      nextTime: "19:00 开始断食",
    };
  } else {
    return {
      status: "fasting",
      text: "断食中",
      nextTime: "11:00 开始进食",
    };
  }
}

// 格式化秒数为 MM:SS
export function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

// 压缩图片到指定大小
export function compressImage(file: File, maxSizeKB: number = 200): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let { width, height } = img;

        // 限制最大尺寸
        const maxDim = 1200;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = (height / width) * maxDim;
            width = maxDim;
          } else {
            width = (width / height) * maxDim;
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0, width, height);

        // 逐步降低质量直到满足大小限制
        let quality = 0.8;
        let dataUrl = canvas.toDataURL("image/jpeg", quality);
        while (dataUrl.length > maxSizeKB * 1024 * 1.37 && quality > 0.1) {
          quality -= 0.1;
          dataUrl = canvas.toDataURL("image/jpeg", quality);
        }

        resolve(dataUrl);
      };
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
