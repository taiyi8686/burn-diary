// 同域名 API，不再访问 workers.dev（在中国被封）
const API_BASE = "";

// 不需要同步的 key 前缀（user 各自独立，photos 太大）
const SKIP_SYNC_PREFIXES = ["user", "photos:"];

function shouldSync(key: string): boolean {
  return !SKIP_SYNC_PREFIXES.some((p) => key.startsWith(p));
}

// 带超时的 fetch，防止请求卡住
function fetchWithTimeout(url: string, options: RequestInit = {}, timeoutMs = 8000): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  return fetch(url, { ...options, signal: controller.signal }).finally(() => clearTimeout(timer));
}

async function apiSet(key: string, value: unknown): Promise<void> {
  try {
    await fetchWithTimeout(`${API_BASE}/api/set`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key, value }),
    });
  } catch {
    // 离线时静默失败，数据仍在 localStorage
  }
}

async function apiList(prefix: string): Promise<{ key: string; value: unknown }[]> {
  try {
    const res = await fetchWithTimeout(`${API_BASE}/api/list?prefix=${encodeURIComponent(prefix)}`);
    const data = await res.json();
    return data.items || [];
  } catch {
    return [];
  }
}

// ===== 同步管理 =====
const PREFIX = "burn-diary:";

function localGet(key: string): unknown | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(`${PREFIX}${key}`);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function localSet(key: string, value: unknown): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(`${PREFIX}${key}`, JSON.stringify(value));
}

// 写入：同时写 localStorage 和云端（跳过不需要同步的数据）
export async function syncSet(key: string, value: unknown): Promise<void> {
  localSet(key, value);
  if (shouldSync(key)) {
    await apiSet(key, value);
  }
}

// 从云端拉取共享数据到本地
export async function pullFromCloud(): Promise<boolean> {
  try {
    const items = await apiList("");
    if (items.length === 0) return false;
    let updated = false;
    for (const item of items) {
      const localVal = localGet(item.key);
      const remoteVal = item.value;
      if (JSON.stringify(localVal) !== JSON.stringify(remoteVal)) {
        localSet(item.key, remoteVal);
        updated = true;
      }
    }
    return updated;
  } catch {
    return false;
  }
}

// 把本地共享数据推到云端（跳过 user 和 photos）
export async function pushToCloud(): Promise<void> {
  if (typeof window === "undefined") return;
  const items: { key: string; value: unknown }[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const fullKey = localStorage.key(i);
    if (fullKey && fullKey.startsWith(PREFIX)) {
      const key = fullKey.slice(PREFIX.length);
      if (!shouldSync(key)) continue;
      const raw = localStorage.getItem(fullKey);
      if (raw) {
        try {
          items.push({ key, value: JSON.parse(raw) });
        } catch {
          // skip
        }
      }
    }
  }
  if (items.length === 0) return;
  try {
    await fetchWithTimeout(`${API_BASE}/api/batch`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items }),
    });
  } catch {
    // offline
  }
}
