import ogpCacheRaw from "../data/ogp-cache.json";
import type { OgpData } from "./ogp";
import { normalizeOgpUrl } from "./ogp";

export type OgpCache = Record<string, OgpData>;

const ogpCache = ogpCacheRaw as OgpCache;

export function getCachedOgp(url: string): OgpData | null {
    const cacheKey = normalizeOgpUrl(url);
    const cached = ogpCache[cacheKey];

    if (!cached) {
        return null;
    }

    return {
        ...cached,
        url: cached.url ?? cacheKey,
    };
}

export function hasCachedOgp(url: string): boolean {
    return getCachedOgp(url) !== null;
}
