export interface OgpData {
    url: string;
    title?: string;
    description?: string;
    image?: string;
    siteName?: string;
}

type MetaAttr = "property" | "name";

function decodeHtmlEntities(text: string): string {
    return text
        .replace(/&amp;/g, "&")
        .replace(/&quot;/g, "\"")
        .replace(/&#34;/g, "\"")
        .replace(/&#x22;/gi, "\"")
        .replace(/&#39;/g, "'")
        .replace(/&#x27;/gi, "'")
        .replace(/&apos;/g, "'")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&nbsp;/g, " ");
}

function normalizeText(text?: string): string | undefined {
    if (!text) {
        return undefined;
    }

    const normalized = decodeHtmlEntities(text)
        .replace(/\s+/g, " ")
        .trim();

    return normalized.length > 0 ? normalized : undefined;
}

function escapeRegExp(text: string): string {
    return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function pickMetaByAttr(
    html: string,
    key: string,
    attr: MetaAttr,
): string | undefined {
    const escapedKey = escapeRegExp(key);

    const patterns = [
        // <meta property="og:image" content="...">
        new RegExp(
            `<meta\\b[^>]*\\b${attr}\\s*=\\s*["']${escapedKey}["'][^>]*\\bcontent\\s*=\\s*["']([^"']*)["'][^>]*>`,
            "i",
        ),

        // <meta content="..." property="og:image">
        new RegExp(
            `<meta\\b[^>]*\\bcontent\\s*=\\s*["']([^"']*)["'][^>]*\\b${attr}\\s*=\\s*["']${escapedKey}["'][^>]*>`,
            "i",
        ),
    ];

    for (const pattern of patterns) {
        const match = html.match(pattern);
        const value = normalizeText(match?.[1]);

        if (value) {
            return value;
        }
    }

    return undefined;
}

function pickMeta(
    html: string,
    keys: string[],
    attrs: MetaAttr[] = ["property", "name"],
): string | undefined {
    for (const key of keys) {
        for (const attr of attrs) {
            const value = pickMetaByAttr(html, key, attr);

            if (value) {
                return value;
            }
        }
    }

    return undefined;
}

function pickTitle(html: string): string | undefined {
    const match = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    return normalizeText(match?.[1]);
}

function toAbsoluteUrl(baseUrl: string, maybeRelativeUrl?: string): string | undefined {
    const normalizedUrl = normalizeText(maybeRelativeUrl);

    if (!normalizedUrl) {
        return undefined;
    }

    try {
        return new URL(normalizedUrl, baseUrl).toString();
    } catch {
        return normalizedUrl;
    }
}

function getHostname(url: string): string | undefined {
    try {
        return new URL(url).hostname.replace(/^www\./, "");
    } catch {
        return undefined;
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
                "Accept-Language":
                    "ja-JP,ja;q=0.9,en-US;q=0.8,en;q=0.7",
                "Cache-Control": "no-cache",
                "Pragma": "no-cache",
            },
        });

        const finalUrl = response.url || url;
        const contentType = response.headers.get("content-type") ?? "";

        if (!response.ok) {
            console.warn("[fetchOgp] response not ok", {
                url,
                finalUrl,
                status: response.status,
                statusText: response.statusText,
                contentType,
            });

            return null;
        }

        if (
            contentType.length > 0 &&
            !contentType.includes("text/html") &&
            !contentType.includes("application/xhtml+xml")
        ) {
            console.warn("[fetchOgp] response is not html", {
                url,
                finalUrl,
                contentType,
            });

            return null;
        }

        const html = await response.text();

        const title =
            pickMeta(html, [
                "og:title",
                "twitter:title",
            ]) ??
            pickTitle(html);

        const description =
            pickMeta(html, [
                "og:description",
                "twitter:description",
                "description",
            ]);

        const rawImage = pickMeta(html, [
            "og:image",
            "og:image:url",
            "og:image:secure_url",
            "twitter:image",
            "twitter:image:src",
        ]);

        const image = toAbsoluteUrl(finalUrl, rawImage);

        const siteName =
            pickMeta(html, [
                "og:site_name",
                "twitter:site",
            ]) ??
            getHostname(finalUrl) ??
            getHostname(url);

        if (!title && !description && !image) {
            console.warn("[fetchOgp] no ogp-like fields found", {
                url,
                finalUrl,
                htmlLength: html.length,
                htmlPreview: html.slice(0, 300),
            });

            return null;
        }

        return {
            url: finalUrl,
            title,
            description,
            image,
            siteName,
        };
    } catch (error) {
        console.error("[fetchOgp] failed", {
            url,
            error,
        });

        return null;
    }
}
