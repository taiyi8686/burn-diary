interface Env {
  BURN_DIARY: KVNamespace;
}

const CORS_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: CORS_HEADERS });
    }

    const url = new URL(request.url);
    const path = url.pathname;

    try {
      // GET /api/get?key=xxx — 读取单个 key
      if (request.method === "GET" && path === "/api/get") {
        const key = url.searchParams.get("key");
        if (!key) return jsonResponse({ error: "missing key" }, 400);
        const value = await env.BURN_DIARY.get(key);
        return jsonResponse({ key, value: value ? JSON.parse(value) : null });
      }

      // GET /api/list?prefix=xxx — 列出某前缀下所有 key-value（跳过照片等大数据）
      if (request.method === "GET" && path === "/api/list") {
        const prefix = url.searchParams.get("prefix") || "";
        const SKIP_PREFIXES = ["photos:", "user", "test"];
        const list = await env.BURN_DIARY.list({ prefix });
        const results: { key: string; value: unknown }[] = [];
        for (const k of list.keys) {
          if (SKIP_PREFIXES.some((sp) => k.name.startsWith(sp))) continue;
          const val = await env.BURN_DIARY.get(k.name);
          results.push({ key: k.name, value: val ? JSON.parse(val) : null });
        }
        return jsonResponse({ items: results });
      }

      // PUT /api/set — 写入 key-value
      if (request.method === "PUT" && path === "/api/set") {
        const body = (await request.json()) as { key: string; value: unknown };
        if (!body.key) return jsonResponse({ error: "missing key" }, 400);
        await env.BURN_DIARY.put(body.key, JSON.stringify(body.value));
        return jsonResponse({ ok: true });
      }

      // PUT /api/batch — 批量写入
      if (request.method === "PUT" && path === "/api/batch") {
        const body = (await request.json()) as {
          items: { key: string; value: unknown }[];
        };
        for (const item of body.items) {
          await env.BURN_DIARY.put(item.key, JSON.stringify(item.value));
        }
        return jsonResponse({ ok: true, count: body.items.length });
      }

      return jsonResponse({ error: "not found" }, 404);
    } catch (e) {
      return jsonResponse({ error: String(e) }, 500);
    }
  },
};

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ...CORS_HEADERS },
  });
}
