// 1. `astro:content`からユーティリティをインポート
import { z, defineCollection } from 'astro:content';

// 2. コレクションを定義
const updatesCollection = defineCollection({ 
    type: 'content',
    schema: z.object({
        title: z.string(),
        date: z.string(),
    }),
});

const blogCollection = defineCollection({
    schema: z.object({
        id: z.string(),
        title: z.string(),
        date: z.string(),
        updated: z.string(),
        eyecatch: z.string(),
        tags: z.array(z.string()),
    }),
});      

// 3. コレクションを登録するために、単一の`collections`オブジェクトをエクスポート
//    このキーは、"src/content"のコレクションのディレクトリ名と一致する必要があります。
export const collections = {
    'updates': updatesCollection,
    'blog': blogCollection,
};