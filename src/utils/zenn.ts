import { XMLParser } from "fast-xml-parser";

export type ZennPostRaw = {
    id: string;
    title: string;
    date: string; // pubDate (RFC822)
    updated?: string;
    tags: string[]; // ["zenn"]
    href: string; // link
    description?: string; // plain text
    eyecatch?: string; // enclosure url
    topic?: string; // TECH など
};

export async function fetchZennPosts(username: string): Promise<ZennPostRaw[]> {
    const url = `https://zenn.dev/${username}/feed?all=1`;

    try {
        const res = await fetch(url);
        if (!res.ok) return [];

        const xml = await res.text();

        const parser = new XMLParser({
            ignoreAttributes: false,
            attributeNamePrefix: "@_",
        });
        const obj = parser.parse(xml);

        const items = obj?.rss?.channel?.item;
        if (!items) return [];

        const arr: unknown[] = Array.isArray(items) ? items : [items];

        return arr
            .map((it): ZennPostRaw | null => {
                const item = it as any;

                const title = typeof item.title === "string" ? item.title : "";
                const href = typeof item.link === "string" ? item.link : "";
                const date =
                    typeof item.pubDate === "string" ? item.pubDate : "";

                if (!title || !href || !date) return null;

                const description =
                    typeof item.description === "string"
                        ? stripHtml(item.description)
                        : undefined;

                const eyecatch =
                    typeof item.enclosure?.["@_url"] === "string"
                        ? item.enclosure["@_url"]
                        : undefined;

                return {
                    id: `${date}-${href}`,
                    title,
                    date,
                    tags: ["zenn"], // ← 小文字で統一（UnifiedPost と一致）
                    href,
                    description,
                    eyecatch,
                    topic: "TECH", // 将来 category 対応してもOK
                };
            })
            .filter((p): p is ZennPostRaw => p !== null);
    } catch {
        return [];
    }
}

function stripHtml(html: string): string {
    return html
        .replace(/<[^>]+>/g, "")
        .replace(/\s+/g, " ")
        .trim();
}
