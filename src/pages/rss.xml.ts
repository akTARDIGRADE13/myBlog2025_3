import rss from "@astrojs/rss";
import { getCollection } from "astro:content";
import type { APIContext } from 'astro';

export async function GET(context: APIContext) {
    const posts = await getCollection("blog");

    return rss({
        title: "akTAR.'s Blog",
        description: "個人のブログサイトです。勉強したことをまとめたり、好きなことについて語ったりしています。\n サイトの仕様や記事内容について気になる点がございましたら、GitHub リポジトリの Issue、X アカウント、またはMastodon アカウントまでご連絡ください。\n このサイトを作成した際の備忘録はこちらにまとめています。",
        site: context.site!,
        items: posts.map((post) => ({
            title: post.data.title,
            pubDate: new Date(post.data.date),
            description: post.data.tags?.join(", "),
            link: `/blog/${post.slug}/`,
        })),
    });
}
