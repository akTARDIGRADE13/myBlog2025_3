import type { BookCardData, CoverSource, BiblioSource } from "../types/book";

const OPENBD_ENDPOINT = "https://api.openbd.jp/v1/get";
const NDL_OPENSEARCH_ENDPOINT = "https://iss.ndl.go.jp/api/opensearch";

interface OpenBDBiblio {
    title?: string;
    authors: string[];
    publisher?: string;
    pubdate?: string;
    coverUrl?: string;
    raw: any;
}

interface NDLBiblio {
    title?: string;
    authors: string[];
    ndc?: string;
    ndlLink?: string;
    raw: any;
}

/* ============================
   文字整形ユーティリティ
============================ */

// "辻村,深月,1980-" → "辻村 深月"
// "Rowling, J.K." → "Rowling J.K."（カンマをスペースに）
function normalizeAuthorName(raw: string): string {
    let s = raw.trim();
    if (!s) return s;

    const parts = s.split(/[,，]/).map(p => p.trim()).filter(Boolean);

    if (parts.length >= 2) {
        const last = parts[parts.length - 1];
        if (/^\d{4}-?$/.test(last)) {
            parts.pop(); // 生年情報を落とす
        }
        return parts.join(" ");
    }

    return s;
}

// 出版日を整形: 202209 → 2022-09, 20220930 → 2022-09-30
function formatPubdate(pubdate?: string): string | undefined {
    if (!pubdate) return undefined;
    const s = pubdate.trim();

    if (/^\d{8}$/.test(s)) {
        return `${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6, 8)}`;
    }
    if (/^\d{6}$/.test(s)) {
        return `${s.slice(0, 4)}-${s.slice(4, 6)}`;
    }
    if (/^\d{4}$/.test(s)) {
        return s;
    }
    return s;
}

/* ============================
   データ取得
============================ */

export async function fetchFromOpenBD(isbn: string): Promise<OpenBDBiblio | null> {
    const res = await fetch(`${OPENBD_ENDPOINT}?isbn=${isbn}`);
    if (!res.ok) return null;
    const json = await res.json();
    const item = json?.[0];
    if (!item) return null;

    const summary = item.summary ?? {};
    const rawAuthor = (summary.author as string | undefined) ?? "";

    const authors = rawAuthor
        .split("／")
        .map(a => a.trim())
        .filter(Boolean)
        .map(normalizeAuthorName);

    return {
        title: summary.title,
        authors,
        publisher: summary.publisher,
        pubdate: summary.pubdate,
        coverUrl: summary.cover,
        raw: item,
    };
}

export async function fetchFromNDL(isbn: string): Promise<NDLBiblio | null> {
    const url = `${NDL_OPENSEARCH_ENDPOINT}?isbn=${encodeURIComponent(isbn)}`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const xmlText = await res.text();

    const titleMatch = xmlText.match(/<title>([^<]+)<\/title>/);
    const creatorMatch = xmlText.match(/<dc:creator>([^<]+)<\/dc:creator>/);

    const ndcMatch = xmlText.match(
        /<dc:subject[^>]*dcndl:(?:NDC10|NDC9|NDC8|NDC)[^>]*>([^<]+)<\/dc:subject>/
    );
    const ndlcMatch = xmlText.match(
        /<dc:subject[^>]*dcndl:NDLC[^>]*>([^<]+)<\/dc:subject>/
    );

    const linkMatch = xmlText.match(/<link[^>]*rel="alternate"[^>]*href="([^"]+)"/);

    return {
        title: titleMatch?.[1],
        authors: creatorMatch ? [normalizeAuthorName(creatorMatch[1])] : [],
        ndc: ndcMatch?.[1] ?? ndlcMatch?.[1],
        ndlLink: linkMatch?.[1],
        raw: xmlText,
    };
}

/* ============================
   書影URL生成
============================ */

function buildNdlCoverUrl(isbn: string): string | undefined {
    const digits = isbn.replace(/[^0-9Xx]/g, "");
    if (digits.length === 13) {
        return `https://ndlsearch.ndl.go.jp/thumbnail/${digits}.jpg`;
    }
    return undefined;
}

interface GetBookCardOptions {
    coverSource?: CoverSource;
    biblioSource?: BiblioSource;
}

/* ============================
   統合データ生成
============================ */

export async function getBookCardData(
    isbn: string,
    options: GetBookCardOptions = {}
): Promise<BookCardData | null> {
    const coverSource = options.coverSource ?? "auto";
    const biblioSource = options.biblioSource ?? "openbd";

    const [openbd, ndl] = await Promise.all([
        fetchFromOpenBD(isbn),
        fetchFromNDL(isbn),
    ]);

    if (!openbd && !ndl) return null;

    const base = biblioSource === "openbd" ? (openbd ?? ndl) : (ndl ?? openbd);
    const alt = biblioSource === "openbd" ? ndl : openbd;

    const title = base?.title ?? alt?.title ?? "タイトル不明";
    const authors = base?.authors?.length ? base.authors : (alt?.authors ?? []);

    const publisher =
        biblioSource === "openbd"
            ? (base as OpenBDBiblio)?.publisher ?? (alt as OpenBDBiblio)?.publisher
            : undefined;

    const pubdateRaw =
        biblioSource === "openbd"
            ? (base as OpenBDBiblio)?.pubdate ?? (alt as OpenBDBiblio)?.pubdate
            : undefined;

    const pubdate = formatPubdate(pubdateRaw);

    const ndc =
        biblioSource === "ndl"
            ? (base as NDLBiblio)?.ndc ?? (alt as NDLBiblio)?.ndc
            : ndl?.ndc;

    const openbdCover = openbd?.coverUrl?.trim() || undefined;
    const ndlCover = buildNdlCoverUrl(isbn);

    let coverUrl: string | undefined;
    if (coverSource === "openbd") {
        coverUrl = openbdCover || ndlCover;
    } else if (coverSource === "ndl") {
        coverUrl = ndlCover || openbdCover;
    } else {
        coverUrl = openbdCover || ndlCover;
    }

    return {
        isbn,
        title,
        authors,
        publisher,
        pubdate,
        ndc,
        coverUrl,
        ndlLink: ndl?.ndlLink,
        _openbdRaw: openbd?.raw,
        _ndlRaw: ndl?.raw,
    };
}
