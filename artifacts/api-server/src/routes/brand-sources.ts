import { Router, type IRouter } from "express";
import { InspectBrandSourceBody, InspectBrandSourceResponse } from "@workspace/api-zod";

const router: IRouter = Router();
// The studio's two public brand sources only: no arbitrary server-side fetches.
const hosts = new Set(["rayanacoffees.com", "www.rayanacoffees.com", "rayanaroast.com", "www.rayanaroast.com"]);
const cache = new Map<string, { expires: number; data: object }>();
function validUrl(value: string): URL {
  const url = new URL(value.includes("://") ? value : `https://${value}`);
  if (url.protocol !== "https:" || !hosts.has(url.hostname) || url.username || url.password || (url.port && url.port !== "443")) {
    throw new Error("Automatic inspection supports HTTPS Rayana Coffees and Rayana Roast sources only. Other URLs can be kept with manual notes.");
  }
  return url;
}
function plain(value: string) {
  return value.replace(/<[^>]+>/g, " ").replace(/&amp;/g, "&").replace(/&(?:quot|#34);/g, '"').replace(/&#39;/g, "'").replace(/&[^;]+;/g, " ").replace(/\s+/g, " ").trim();
}
router.post("/brand-sources/inspect", async (req, res): Promise<void> => {
  const parsed = InspectBrandSourceBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Please enter a valid source URL." });
    return;
  }
  let url: URL;
  try { url = validUrl(parsed.data.url); }
  catch (error) {
    res.status(400).json({ error: (error as Error).message });
    return;
  }
  const existing = cache.get(url.href);
  if (existing && existing.expires > Date.now()) {
    res.json(existing.data);
    return;
  }
  try {
    const original = url.href;
    let response: globalThis.Response | undefined;
    const signal = AbortSignal.timeout(12000);
    for (let hop = 0; hop < 4; hop++) {
      response = await fetch(url.href, { redirect: "manual", signal, headers: { "User-Agent": "DeckBuilder/1.0" } });
      if (response.status < 300 || response.status >= 400) break;
      const location = response.headers.get("location");
      await response.body?.cancel();
      if (!location) throw new Error("Source returned a redirect without a destination.");
      url = validUrl(new URL(location, url).href);
    }
    if (!response) throw new Error("No response from source.");
    const reader = response.body?.getReader();
    const chunks: Buffer[] = [];
    let length = 0;
    if (reader) {
      try {
        while (length < 1_000_000) {
          const chunk = await reader.read();
          if (chunk.done) break;
          chunks.push(Buffer.from(chunk.value));
          length += chunk.value.length;
        }
      } finally { await reader.cancel(); }
    }
    const html = Buffer.concat(chunks).toString("utf8");
    const title = plain(html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] || url.hostname);
    const text = plain(html.replace(/<(script|style|nav|footer)\b[^>]*>[\s\S]*?<\/\1>/gi, ""));
    const data = InspectBrandSourceResponse.parse({
      url: original, status: response.status, title,
      summary: response.ok ? text.slice(0, 1200) : `Website returned HTTP ${response.status}. Add context manually if it is unavailable.`,
    });
    cache.set(original, { expires: Date.now() + 300000, data });
    res.json(data);
  } catch (error) {
    req.log.warn({ err: error }, "Brand source inspection failed");
    res.status(502).json({ error: "Could not reach this website. Your URL is retained; you can add context notes manually." });
  }
});
export default router;
