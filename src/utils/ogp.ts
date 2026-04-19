export interface OgpData {
  url: string;
  title?: string;
  description?: string;
  image?: string;
  siteName?: string;
}

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function normalizeText(text?: string): string | undefined {
  if (!text) return undefined;
  const normalized = decodeHtmlEntities(text).replace(/\s+/g, " ").trim();
  return normalized.length > 0 ? normalized : undefined;
}

function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function pickMeta(
  html: string,
  key: string,
  attr: "property" | "name" = "property",
): string | undefined {
  const escaped = escapeRegExp(key);

  const patterns = [
    new RegExp(
      `<meta[^>]*${attr}\\s*=\\s*["']${escaped}["'][^>]*content\\s*=\\s*["']([^"']+)["'][^>]*>`,
      "i",
    ),
    new RegExp(
      `<meta[^>]*content\\s*=\\s*["']([^"']+)["'][^>]*${attr}\\s*=\\s*["']${escaped}["'][^>]*>`,
      "i",
    ),
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match?.[1]) {
      return normalizeText(match[1]);
    }
  }

  return undefined;
}

function pickTitle(html: string): string | undefined {
  const match = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return normalizeText(match?.[1]);
}

function toAbsoluteUrl(baseUrl: string, maybeRelativeUrl?: string): string | undefined {
  if (!maybeRelativeUrl) return undefined;

  try {
    return new URL(maybeRelativeUrl, baseUrl).toString();
  } catch {
    return maybeRelativeUrl;
  }
}

export async function fetchOgp(url: string): Promise<OgpData | null> {
  try {
    const response = await fetch(url, {
      redirect: "follow",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        "Accept":
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
        "Accept-Language": "ja,en-US;q=0.9,en;q=0.8",
        "Cache-Control": "no-cache",
        "Pragma": "no-cache",
      },
    });

    // console.log("[fetchOgp] url =", url);
    // console.log("[fetchOgp] status =", response.status);
    // console.log("[fetchOgp] content-type =", response.headers.get("content-type"));

    if (!response.ok) {
      console.log("[fetchOgp] response not ok");
      return null;
    }

    const html = await response.text();

    // console.log("[fetchOgp] html length =", html.length);
    // console.log("[fetchOgp] html preview =", html.slice(0, 300));

    const title =
      pickMeta(html, "og:title") ??
      pickMeta(html, "twitter:title", "name") ??
      pickTitle(html);

    const description =
      pickMeta(html, "og:description") ??
      pickMeta(html, "description", "name") ??
      pickMeta(html, "twitter:description", "name");

    const rawImage =
      pickMeta(html, "og:image") ??
      pickMeta(html, "twitter:image", "name");

    const image = toAbsoluteUrl(url, rawImage);

    const siteName =
      pickMeta(html, "og:site_name") ??
      new URL(url).hostname.replace(/^www\./, "");

    // console.log("[fetchOgp] parsed =", {
    //   title,
    //   description,
    //   rawImage,
    //   image,
    //   siteName,
    // });

    if (!title && !description && !image) {
      console.log("[fetchOgp] no ogp-like fields found");
      return null;
    }

    return {
      url,
      title,
      description,
      image,
      siteName,
    };
  } catch (error) {
    console.error("[fetchOgp] failed =", error);
    return null;
  }
}
