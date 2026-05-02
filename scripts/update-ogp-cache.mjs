import fs from "node:fs/promises";
import path from "node:path";

const rootDir = process.cwd();
const cachePath = path.join(rootDir, "src", "data", "ogp-cache.json");

const scanDirs = [
    "src/content",
    "src/pages",
    "src/components",
];

const targetExtensions = new Set([
    ".md",
    ".mdx",
    ".astro",
    ".ts",
    ".tsx",
]);

const sleepMs = 1200;

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

function decodeHtmlEntities(text) {
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

function normalizeText(text) {
    if (!text) {
        return undefined;
    }

    const normalized = decodeHtmlEntities(text)
        .replace(/\s+/g, " ")
        .trim();

    return normalized.length > 0 ? normalized : undefined;
}

function escapeRegExp(text) {
    return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function normalizeCacheKey(url) {
    try {
        const normalizedUrl = new URL(url);
        normalizedUrl.hash = "";
        return normalizedUrl.toString();
    } catch {
        return url;
    }
}

function pickMetaByAttr(html, key, attr) {
    const escapedKey = escapeRegExp(key);

    const patterns = [
        new RegExp(
            `<meta\\b[^>]*\\b${attr}\\s*=\\s*["']${escapedKey}["'][^>]*\\bcontent\\s*=\\s*["']([^"']*)["'][^>]*>`,
            "i",
        ),
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

function pickMeta(html, keys, attrs = ["property", "name"]) {
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

function pickTitle(html) {
    const match = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    return normalizeText(match?.[1]);
}

function toAbsoluteUrl(baseUrl, maybeRelativeUrl) {
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

function getHostname(url) {
    try {
        return new URL(url).hostname.replace(/^www\./, "");
    } catch {
        return undefined;
    }
}

async function pathExists(filePath) {
    try {
        await fs.access(filePath);
        return true;
    } catch {
        return false;
    }
}

async function collectFiles(dir) {
    const absoluteDir = path.join(rootDir, dir);

    if (!(await pathExists(absoluteDir))) {
        return [];
    }

    const entries = await fs.readdir(absoluteDir, {
        withFileTypes: true,
    });

    const files = [];

    for (const entry of entries) {
        const fullPath = path.join(absoluteDir, entry.name);

        if (entry.isDirectory()) {
            files.push(...await collectFiles(path.relative(rootDir, fullPath)));
            continue;
        }

        if (!entry.isFile()) {
            continue;
        }

        const ext = path.extname(entry.name);

        if (targetExtensions.has(ext)) {
            files.push(fullPath);
        }
    }

    return files;
}

async function extractBooklogUrls() {
    const files = [];

    for (const dir of scanDirs) {
        files.push(...await collectFiles(dir));
    }

    const urls = new Set();

    const urlPattern = /https:\/\/booklog\.jp\/item\/1\/[0-9A-Za-zXx_-]+/g;

    for (const file of files) {
        const text = await fs.readFile(file, "utf8");

        for (const match of text.matchAll(urlPattern)) {
            urls.add(normalizeCacheKey(match[0]));
        }
    }

    return [...urls].sort();
}

async function readCache() {
    if (!(await pathExists(cachePath))) {
        return {};
    }

    const text = await fs.readFile(cachePath, "utf8");

    if (text.trim().length === 0) {
        return {};
    }

    return JSON.parse(text);
}

async function writeCache(cache) {
    await fs.mkdir(path.dirname(cachePath), {
        recursive: true,
    });

    await fs.writeFile(
        cachePath,
        `${JSON.stringify(cache, null, 4)}\n`,
        "utf8",
    );
}

async function fetchOgp(url) {
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
        throw new Error(
            `HTTP ${response.status} ${response.statusText} content-type=${contentType}`,
        );
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
        throw new Error("No OGP-like fields found");
    }

    return {
        url: finalUrl,
        title,
        description,
        image,
        siteName,
        fetchedAt: new Date().toISOString(),
    };
}

async function main() {
    const urls = await extractBooklogUrls();
    const cache = await readCache();

    console.log(`[ogp-cache] found ${urls.length} booklog URL(s)`);

    let updated = 0;
    let skipped = 0;
    let failed = 0;

    for (const url of urls) {
        const cacheKey = normalizeCacheKey(url);

        if (cache[cacheKey]?.image) {
            skipped++;
            console.log(`[ogp-cache] skip: ${cacheKey}`);
            continue;
        }

        console.log(`[ogp-cache] fetch: ${cacheKey}`);

        try {
            await sleep(sleepMs);

            const ogp = await fetchOgp(cacheKey);
            cache[cacheKey] = ogp;

            updated++;
            console.log(`[ogp-cache] ok: ${cacheKey}`);
        } catch (error) {
            failed++;
            console.warn(`[ogp-cache] failed: ${cacheKey}`);
            console.warn(error);
        }
    }

    await writeCache(cache);

    console.log("[ogp-cache] done", {
        updated,
        skipped,
        failed,
        cachePath,
    });
}

main().catch((error) => {
    console.error("[ogp-cache] fatal error");
    console.error(error);
    process.exit(1);
});
