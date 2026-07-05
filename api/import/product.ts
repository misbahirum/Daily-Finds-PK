/**
 * Vercel Node.js serverless function — POST /api/import/product
 *
 * Scrapes a product page (Daraz, affiliate redirect, etc.) and returns
 * structured product data. Uses SSRF protection before fetching.
 *
 * Vercel auto-parses JSON request bodies and provides .status()/.json()
 * on the response, so this function has no Express dependency.
 */

import dns from "node:dns/promises";

// ---------------------------------------------------------------------------
// Vercel function config
// ---------------------------------------------------------------------------

export const config = { maxDuration: 30 };

// ---------------------------------------------------------------------------
// SSRF protection
// ---------------------------------------------------------------------------

const BLOCKED_HOSTNAMES = new Set([
  "localhost",
  "metadata.google.internal",
  "169.254.169.254",
]);

function isPrivateIP(ip: string): boolean {
  // Unwrap IPv6-mapped IPv4 addresses (e.g. ::ffff:127.0.0.1)
  if (ip.startsWith("::ffff:")) return isPrivateIP(ip.slice(7));

  // IPv6 loopback, link-local, unique-local
  if (
    ip === "::1" ||
    ip.startsWith("fe80:") ||
    ip.startsWith("fc") ||
    ip.startsWith("fd")
  )
    return true;

  // IPv4 private / special-use ranges
  const parts = ip.split(".").map(Number);
  if (parts.length !== 4 || parts.some((p) => isNaN(p))) return false;
  const [a, b] = parts;
  return (
    a === 10 ||                          // 10.0.0.0/8
    (a === 172 && b >= 16 && b <= 31) || // 172.16.0.0/12
    (a === 192 && b === 168) ||           // 192.168.0.0/16
    a === 127 ||                          // 127.0.0.0/8 loopback
    (a === 169 && b === 254) ||           // 169.254.0.0/16 link-local / metadata
    a === 0                               // 0.0.0.0/8
  );
}

async function assertSafeHost(hostname: string): Promise<void> {
  const h = hostname.toLowerCase();
  if (BLOCKED_HOSTNAMES.has(h)) {
    throw new Error(`Blocked hostname: ${hostname}`);
  }
  let records: { address: string }[];
  try {
    records = await dns.lookup(hostname, { all: true });
  } catch {
    throw new Error(`Cannot resolve hostname: ${hostname}`);
  }
  for (const { address } of records) {
    if (isPrivateIP(address)) {
      throw new Error(`Hostname resolves to a private IP: ${address}`);
    }
  }
}

const FETCH_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  Accept:
    "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
  "Accept-Language": "en-US,en;q=0.9",
  "Cache-Control": "no-cache",
  Pragma: "no-cache",
};

/**
 * Follows redirects manually, validating each hop against the SSRF guard
 * before making the next request. This prevents the redirect-chain bypass
 * where `redirect: "follow"` would silently fetch internal addresses during
 * intermediate hops before a post-fetch check could catch them.
 */
async function fetchWithSafeRedirects(
  initialUrl: string,
  signal: AbortSignal,
  maxRedirects = 10,
): Promise<{ response: Response; finalUrl: string }> {
  let currentUrl = initialUrl;

  for (let hop = 0; hop <= maxRedirects; hop++) {
    const parsed = new URL(currentUrl);
    await assertSafeHost(parsed.hostname); // validate BEFORE each hop

    const response = await fetch(currentUrl, {
      method: "GET",
      redirect: "manual", // never auto-follow; we handle each hop ourselves
      headers: FETCH_HEADERS,
      signal,
    });

    // Not a redirect — this is the final response
    if (response.status < 300 || response.status >= 400) {
      return { response, finalUrl: currentUrl };
    }

    if (hop === maxRedirects) {
      throw new Error("Too many redirects");
    }

    const location = response.headers.get("location");
    if (!location) throw new Error("Redirect with no Location header");

    // Resolve relative Location values against the current URL
    currentUrl = new URL(location, currentUrl).href;
  }

  // Unreachable, but satisfies TypeScript
  throw new Error("Redirect loop exhausted");
}

// ---------------------------------------------------------------------------
// HTML extraction helpers
// ---------------------------------------------------------------------------

type ExtractedProduct = {
  name: string | null;
  price: number | null;
  description: string | null;
  imageUrl: string | null;
  category: string | null;
  affiliateLink: string;
};

const CATEGORY_PATTERNS: Array<[RegExp, string]> = [
  [
    /kitchen|cook|food|cup|mug|kettle|frother|blender|utensil|pan|pot|baking|cutlery|dishes|crockery|spoon|fork/i,
    "Kitchen Gadgets",
  ],
  [
    /furniture|sofa|couch|chair|table|bed|cabinet|wardrobe|shelf|bookcase|rack|mattress|drawer/i,
    "Furniture",
  ],
  [
    /office|desk|organizer|stationery|pen|notebook|whiteboard|stapler|filing|printer/i,
    "Office Setup",
  ],
  [
    /beauty|skin|hair|makeup|cosmetic|serum|moisturizer|face|lip|eyelash|perfume|cream|lotion|mascara|foundation/i,
    "Beauty",
  ],
  [
    /electronic|phone|mobile|tablet|bluetooth|wireless|earbuds|earphone|headphone|speaker|camera|charger|power.?bank|usb|laptop|computer|watch|tv|television/i,
    "Electronics",
  ],
  [
    /home|decor|vase|candle|cushion|curtain|wall|lamp|living|aesthetic|plant|frame|mirror|clock|rug|carpet|mat|pillow|throw/i,
    "Home Decor",
  ],
];

function inferCategory(text: string): string | null {
  for (const [pattern, category] of CATEGORY_PATTERNS) {
    if (pattern.test(text)) return category;
  }
  return null;
}

function decodeHTMLEntities(text: string): string {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)));
}

function extractMeta(html: string, attr: string, value: string): string | null {
  const escaped = value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const patterns = [
    new RegExp(
      `<meta[^>]+${attr}=["']${escaped}["'][^>]+content=["']([^"']+)["']`,
      "i",
    ),
    new RegExp(
      `<meta[^>]+content=["']([^"']+)["'][^>]+${attr}=["']${escaped}["']`,
      "i",
    ),
  ];
  for (const p of patterns) {
    const m = html.match(p);
    if (m?.[1]) return decodeHTMLEntities(m[1].trim());
  }
  return null;
}

function parsePrice(raw: string | null | undefined): number | null {
  if (!raw) return null;
  const cleaned = String(raw).replace(/[^\d.]/g, "");
  const n = parseFloat(cleaned);
  return isNaN(n) ? null : Math.round(n);
}

function extractJsonLd(html: string): Partial<ExtractedProduct> {
  const result: Partial<ExtractedProduct> = {};
  const scriptRe =
    /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let m: RegExpExecArray | null;
  while ((m = scriptRe.exec(html)) !== null) {
    try {
      const data = JSON.parse(m[1]);
      const nodes: unknown[] = Array.isArray(data)
        ? data
        : data?.["@graph"]
          ? data["@graph"]
          : [data];
      for (const node of nodes) {
        if (
          typeof node !== "object" ||
          node === null ||
          !("@type" in node)
        )
          continue;
        const type = (node as Record<string, unknown>)["@type"];
        const isProduct =
          type === "Product" ||
          (Array.isArray(type) && type.includes("Product"));
        if (!isProduct) continue;

        const n = node as Record<string, unknown>;
        if (typeof n.name === "string" && !result.name)
          result.name = decodeHTMLEntities(n.name);
        if (typeof n.description === "string" && !result.description)
          result.description = decodeHTMLEntities(n.description);

        if (!result.imageUrl) {
          if (typeof n.image === "string") result.imageUrl = n.image;
          else if (Array.isArray(n.image) && typeof n.image[0] === "string")
            result.imageUrl = n.image[0];
          else if (
            n.image &&
            typeof n.image === "object" &&
            "url" in (n.image as object)
          )
            result.imageUrl = (n.image as { url: string }).url;
        }

        if (!result.price) {
          const offers = Array.isArray(n.offers) ? n.offers[0] : n.offers;
          if (offers && typeof offers === "object") {
            const o = offers as Record<string, unknown>;
            result.price = parsePrice(String(o.price ?? ""));
          }
        }

        if (result.name) break;
      }
    } catch {
      // ignore invalid JSON-LD blocks
    }
    if (result.name) break;
  }
  return result;
}

function extractDarazData(html: string): Partial<ExtractedProduct> {
  const result: Partial<ExtractedProduct> = {};

  const pdMatch = html.match(
    /window\.pageData\s*=\s*(\{[\s\S]{0,60000}?\})\s*(?:;|<\/script>)/,
  );
  if (pdMatch) {
    try {
      const data = JSON.parse(pdMatch[1]) as Record<string, unknown>;
      const mods = data?.mods as Record<string, unknown> | undefined;
      const titleMod = mods?.title as Record<string, unknown> | undefined;
      if (typeof titleMod?.title === "string")
        result.name = decodeHTMLEntities(titleMod.title);

      const imagesMod = (mods?.images ?? mods?.itemImages) as
        | Record<string, unknown>
        | undefined;
      const imgList = imagesMod?.list as unknown[] | undefined;
      if (Array.isArray(imgList) && imgList.length > 0) {
        const first = imgList[0];
        if (typeof first === "string") result.imageUrl = first;
        else if (first && typeof first === "object") {
          const f = first as Record<string, unknown>;
          result.imageUrl =
            ((f.image ?? f.url ?? f.src) as string | undefined) ?? null;
        }
      }

      const priceMod = mods?.priceBlock as Record<string, unknown> | undefined;
      result.price =
        parsePrice(priceMod?.priceText as string) ??
        parsePrice(priceMod?.price as string) ??
        parsePrice(data?.price as string) ??
        null;
    } catch {
      // ignore
    }
  }

  // __NEXT_DATA__ fallback
  const nextMatch = html.match(
    /<script id=["']__NEXT_DATA__["'][^>]*>([\s\S]*?)<\/script>/i,
  );
  if (nextMatch && !result.name) {
    try {
      const nextData = JSON.parse(nextMatch[1]) as Record<string, unknown>;
      const pageProps = (nextData?.props as Record<string, unknown>)
        ?.pageProps as Record<string, unknown> | undefined;
      const product = (
        pageProps?.product ??
        pageProps?.item ??
        pageProps?.data
      ) as Record<string, unknown> | undefined;
      if (product) {
        if (typeof product.name === "string") result.name = product.name;
        else if (typeof product.title === "string") result.name = product.title;
        if (!result.price)
          result.price = parsePrice(
            String(product.price ?? product.salePrice ?? ""),
          );
        if (typeof product.description === "string")
          result.description = product.description;
      }
    } catch {
      // ignore
    }
  }

  return result;
}

function cleanProductName(raw: string | null | undefined): string | null {
  if (!raw) return null;
  return (
    raw
      .replace(
        /\s*[\|–\-]\s*(daraz|shopify|shop|buy|online|pk\.com|\.pk|\.com|price in pakistan).*$/i,
        "",
      )
      .replace(/\s{2,}/g, " ")
      .trim() || null
  );
}

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------

const MAX_RESPONSE_BYTES = 3 * 1024 * 1024; // 3 MB cap

// Vercel provides req.body (auto-parsed JSON) and res with .status()/.json()
export default async function handler(req: any, res: any): Promise<void> {
  // Only allow POST
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const rawUrl =
    typeof req.body?.url === "string" ? req.body.url.trim() : null;

  if (!rawUrl) {
    res.status(400).json({ error: "A valid URL is required." });
    return;
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(rawUrl);
    if (!["http:", "https:"].includes(parsedUrl.protocol))
      throw new Error("Invalid protocol");
  } catch {
    res
      .status(400)
      .json({ error: "Please provide a valid http or https URL." });
    return;
  }

  // SSRF guard
  try {
    await assertSafeHost(parsedUrl.hostname);
  } catch (err: unknown) {
    const reason = err instanceof Error ? err.message : String(err);
    console.warn("[import] SSRF guard blocked:", parsedUrl.hostname, reason);
    res
      .status(400)
      .json({ error: "This URL cannot be fetched for security reasons." });
    return;
  }

  console.info("[import] Starting product import:", rawUrl);

  let html: string;
  let finalUrl = rawUrl;

  try {
    const { response, finalUrl: resolvedUrl } = await fetchWithSafeRedirects(
      rawUrl,
      AbortSignal.timeout(18000),
    );
    finalUrl = resolvedUrl;

    if (!response.ok) {
      console.warn("[import] Page fetch failed:", response.status, finalUrl);
      res.status(422).json({
        error: `The product page returned an error (HTTP ${response.status}). You can enter details manually.`,
        affiliateLink: rawUrl,
      });
      return;
    }

    const contentType = response.headers.get("content-type") ?? "";
    if (
      !contentType.includes("text/html") &&
      !contentType.includes("text/plain")
    ) {
      res.status(422).json({
        error:
          "The URL does not point to a web page. Please enter details manually.",
        affiliateLink: rawUrl,
      });
      return;
    }

    // Stream with byte cap to avoid memory exhaustion
    const reader = response.body?.getReader();
    if (!reader) {
      html = await response.text();
    } else {
      const chunks: Uint8Array[] = [];
      let totalBytes = 0;
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (value) {
          totalBytes += value.byteLength;
          chunks.push(value);
          if (totalBytes > MAX_RESPONSE_BYTES) break;
        }
      }
      reader.cancel().catch(() => undefined);
      const merged = new Uint8Array(totalBytes);
      let offset = 0;
      for (const chunk of chunks) {
        merged.set(chunk, offset);
        offset += chunk.byteLength;
      }
      html = new TextDecoder().decode(merged);
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn("[import] Fetch failed:", msg);

    if (
      msg.includes("timeout") ||
      msg.includes("abort") ||
      msg.includes("TimeoutError")
    ) {
      res.status(422).json({
        error:
          "The page took too long to load. Please enter details manually.",
        affiliateLink: rawUrl,
      });
      return;
    }

    res.status(422).json({
      error: "Could not reach the URL. Please check the link and try again.",
      affiliateLink: rawUrl,
    });
    return;
  }

  // Multi-strategy extraction
  const jsonLd = extractJsonLd(html);
  const darazData = extractDarazData(html);

  const ogTitle = extractMeta(html, "property", "og:title");
  const ogImage = extractMeta(html, "property", "og:image");
  const ogDescription = extractMeta(html, "property", "og:description");
  const ogPrice =
    extractMeta(html, "property", "product:price:amount") ||
    extractMeta(html, "property", "og:price:amount") ||
    extractMeta(html, "name", "price");

  const titleTagMatch = html.match(/<title[^>]*>([^<]{1,300})<\/title>/i);
  const pageTitle = titleTagMatch
    ? decodeHTMLEntities(titleTagMatch[1].trim())
    : null;

  let fallbackImage: string | null = null;
  const imgRe = /<img[^>]+src=["']([^"']{20,})["'][^>]*>/gi;
  let imgM: RegExpExecArray | null;
  while ((imgM = imgRe.exec(html)) !== null) {
    const src = imgM[1];
    if (
      src.startsWith("http") &&
      !/logo|icon|banner|avatar|sprite|pixel|tracking/i.test(src) &&
      /\.(jpg|jpeg|png|webp)/i.test(src)
    ) {
      fallbackImage = src;
      break;
    }
  }

  const rawName = jsonLd.name || darazData.name || ogTitle || pageTitle;
  const imageUrl =
    jsonLd.imageUrl || darazData.imageUrl || ogImage || fallbackImage;
  const description =
    jsonLd.description || darazData.description || ogDescription;
  const price = jsonLd.price || darazData.price || parsePrice(ogPrice);

  const name = cleanProductName(rawName);
  const categoryText = [name, description, finalUrl].filter(Boolean).join(" ");
  const category = inferCategory(categoryText);

  const extracted: ExtractedProduct = {
    name: name || null,
    price: price || null,
    description: description ? description.substring(0, 600).trim() : null,
    imageUrl: imageUrl || null,
    category,
    affiliateLink: rawUrl,
  };

  console.info("[import] Complete:", {
    name: extracted.name,
    price: extracted.price,
    category: extracted.category,
  });

  res.json(extracted);
}
