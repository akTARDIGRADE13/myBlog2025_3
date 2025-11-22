export type CoverSource =
    | "openbd"    // OpenBD の書影のみ使う
    | "ndl-isbn"  // NDL の ISBN ベースの書影のみ使う
    | "ndl-jpe";  // NDL の JP-e ベースの書影のみ使う

export type BiblioSource = "openbd" | "ndl";

export interface BookCardData {
    isbn: string;
    title: string;
    authors: string[];
    publisher?: string;
    pubdate?: string;
    ndc?: string;
    coverUrl?: string;
    ndlLink?: string;
    _openbdRaw?: any;
    _ndlRaw?: any;
}
