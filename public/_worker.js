export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // CORS preflight
    if (request.method === "OPTIONS" && url.pathname.startsWith("/api/")) {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, PUT, DELETE, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      });
    }

    // API routes
    if (url.pathname.startsWith("/api/")) {
      return handleApi(request, env, url);
    }

    // Everything else -> static assets
    return env.ASSETS.fetch(request);
  },
};

async function handleApi(request, env, url) {
  const path = url.pathname;
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
  };

  try {
    // GET /api/get?key=xxx
    if (request.method === "GET" && path === "/api/get") {
      const key = url.searchParams.get("key");
      if (!key)
        return new Response(JSON.stringify({ error: "missing key" }), {
          status: 400,
          headers,
        });
      const value = await env.BURN_DIARY.get(key);
      return new Response(
        JSON.stringify({ key, value: value ? JSON.parse(value) : null }),
        { headers }
      );
    }

    // GET /api/list?prefix=xxx
    if (request.method === "GET" && path === "/api/list") {
      const prefix = url.searchParams.get("prefix") || "";
      const SKIP_PREFIXES = ["photos:", "user", "test"];
      const list = await env.BURN_DIARY.list({ prefix });
      const results = [];
      for (const k of list.keys) {
        if (SKIP_PREFIXES.some((sp) => k.name.startsWith(sp))) continue;
        const val = await env.BURN_DIARY.get(k.name);
        results.push({ key: k.name, value: val ? JSON.parse(val) : null });
      }
      return new Response(JSON.stringify({ items: results }), { headers });
    }

    // PUT /api/set
    if (request.method === "PUT" && path === "/api/set") {
      const body = await request.json();
      if (!body.key)
        return new Response(JSON.stringify({ error: "missing key" }), {
          status: 400,
          headers,
        });
      await env.BURN_DIARY.put(body.key, JSON.stringify(body.value));
      return new Response(JSON.stringify({ ok: true }), { headers });
    }

    // PUT /api/batch
    if (request.method === "PUT" && path === "/api/batch") {
      const body = await request.json();
      for (const item of body.items) {
        await env.BURN_DIARY.put(item.key, JSON.stringify(item.value));
      }
      return new Response(JSON.stringify({ ok: true, count: body.items.length }), {
        headers,
      });
    }

    return new Response(JSON.stringify({ error: "not found" }), {
      status: 404,
      headers,
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers,
    });
  }
}
