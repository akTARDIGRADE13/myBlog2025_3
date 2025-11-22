import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { Parser } from "n3";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 入力TTLファイル & 出力JSONファイルのパス
const INPUT_TTL = resolve(__dirname, "../data/ndc/ndc9.ttl");
const OUTPUT_JSON = resolve(__dirname, "../src/config/ndc9-map.json");

console.log("Reading:", INPUT_TTL);
const ttlText = readFileSync(INPUT_TTL, "utf8");

const parser = new Parser();

// 一旦「概念ID -> { notation, label }」で集約する
/** @type {Map<string, { notation?: string; labelJa?: string }>} */
const conceptMap = new Map();

function ensureConcept(id) {
    if (!conceptMap.has(id)) {
        conceptMap.set(id, {});
    }
    return conceptMap.get(id);
}

// Turtleをパース
parser.parse(ttlText, (error, quad) => {
    if (error) {
        console.error("Parse error:", error);
        process.exit(1);
    }
    if (!quad) {
        // パース完了
        console.log("Parsing finished. Building map...");

        /** @type {Record<string, string>} */
        const ndcMap = {};

        for (const [, info] of conceptMap) {
            if (info.notation && info.labelJa) {
                ndcMap[info.notation] = info.labelJa;
            }
        }

        const outDir = dirname(OUTPUT_JSON);
        mkdirSync(outDir, { recursive: true });
        writeFileSync(OUTPUT_JSON, JSON.stringify(ndcMap, null, 2), "utf8");

        console.log(
            `Wrote ${Object.keys(ndcMap).length} entries to: ${OUTPUT_JSON}`
        );
        return;
    }

    const s = quad.subject.value;
    const p = quad.predicate.value;
    const o = quad.object;

    // skos:notation -> コード（例: "913"）
    if (p.endsWith("notation")) {
        const concept = ensureConcept(s);
        concept.notation = o.value;
    }

    // skos:prefLabel@ja -> 日本語ラベル
    if (p.endsWith("prefLabel") && o.language === "ja") {
        const concept = ensureConcept(s);
        concept.labelJa = o.value;
    }
});
