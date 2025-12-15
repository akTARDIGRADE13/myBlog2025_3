import { getCollection } from "astro:content";
import type { UnifiedPost } from "../types/post";
import { fetchZennPosts, type ZennPostRaw } from "./zenn";

function toDate(v: unknown): Date {
    if (v instanceof Date) return v;
    const d = new Date(String(v ?? ""));
    return Number.isNaN(d.getTime()) ? new Date(0) : d;
}

export async function getMergedPosts(): Promise<UnifiedPost[]> {
    const all = await getCollection("blog");

    const localSource = import.meta.env.DEV
        ? all
        : all.filter(p => !p.slug.includes("test_") && !p.slug.includes("wip_"));

    const local: UnifiedPost[] = localSource.map(post => ({
        id: post.id,
        title: post.data.title,
        date: toDate(post.data.date),
        updated: post.data.updated ? toDate(post.data.updated) : undefined,
        tags: post.data.tags ?? [],
        href: `/blog/${post.slug}`,
        source: "local",
        description: "",
        eyecatch: post.data.eyecatch,
    }));

    const enableZenn = import.meta.env.PUBLIC_ENABLE_ZENN_FEED !== "0";
    const zennUser = import.meta.env.PUBLIC_ZENN_USERNAME ?? "aktardigrade13";

    const zennRaw = enableZenn ? await fetchZennPosts(zennUser) : [];

    console.log(`[zenn] ${zennRaw.length}`);

    const zenn: UnifiedPost[] = zennRaw.map((p: ZennPostRaw) => ({
        id: p.id,
        title: p.title,
        date: toDate(p.date),
        updated: p.updated ? toDate(p.updated) : undefined,
        tags: p.tags,
        href: p.href,
        source: "zenn",
        description: p.description ?? "",
        topic: p.topic,
    }));

    const merged = [...local, ...zenn];
    merged.sort((a, b) => b.date.getTime() - a.date.getTime());
    return merged;
}
