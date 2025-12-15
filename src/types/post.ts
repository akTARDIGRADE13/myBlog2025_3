import type { ImageMetadata } from "astro";

export type UnifiedPost = {
    id: string;
    title: string;

    date: Date;
    updated?: Date;

    tags: string[];

    href: string;
    source: "local" | "zenn";

    description?: string;

    // ローカルのみ（Zennは基本 undefined）
    eyecatch?: ImageMetadata | string;

    // 任意：Zennっぽいピル用
    topic?: string;
};
