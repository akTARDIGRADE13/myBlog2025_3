import type { OgpData } from "./ogp";
import { fetchOgp } from "./ogp";
import { getCachedOgp } from "./ogp-cache";

let booklogFetchQueue: Promise<void> = Promise.resolve();

function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

function isBooklogUrl(url: string): boolean {
    try {
        return new URL(url).hostname.replace(/^www\./, "") === "booklog.jp";
    } catch {
        return false;
    }
}

async function waitBooklogTurn(): Promise<void> {
    const previous = booklogFetchQueue;

    let release!: () => void;
    booklogFetchQueue = new Promise<void>((resolve) => {
        release = resolve;
    });

    await previous;
    await sleep(900);

    release();
}

export async function fetchBooklogOgp(url: string): Promise<OgpData | null> {
    if (!isBooklogUrl(url)) {
        console.warn("[fetchBooklogOgp] non-booklog url", {
            url,
        });

        return null;
    }

    const cached = getCachedOgp(url);

    if (cached) {
        return cached;
    }

    const shouldFetchMissing = process.env.BOOKLOG_FETCH_MISSING !== "false";

    if (!shouldFetchMissing) {
        console.warn("[fetchBooklogOgp] cache miss and fetch disabled", {
            url,
        });

        return null;
    }

    await waitBooklogTurn();

    return await fetchOgp(url);
}
