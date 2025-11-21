export type CoverSource = "openbd" | "ndl" | "auto";
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
