import ndcMapJson from "../config/ndc9-map.json";

export const ndcMap = ndcMapJson as Record<string, string>;


export function getNdcLabelFromCode(code: string): string | undefined {
    if (!code) return undefined;

    // "913.6" → "913" / "913.6 A" → "913"
    const main = code.split(/[.\s]/)[0];

    // 3桁そのものを探す
    if (ndcMap[main]) return ndcMap[main];

    // 念のため上位2桁 + "0" も探してみる（例: "91" → "910"）
    if (main.length === 3) {
        const upper2 = main.slice(0, 2) + "0";
        if (ndcMap[upper2]) return ndcMap[upper2];
    }

    return undefined;
}
