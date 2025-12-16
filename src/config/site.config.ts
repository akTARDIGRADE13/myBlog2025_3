// config/site.config.ts
interface SiteConfig {
    siteName: string;
    description: string;
    url: string;
}

const siteConfig: SiteConfig = {
    siteName: "akTAR.'s Blog",
    description: "A blog built with Astro and Cloudflare Pages",
    url: "https://aktars-blog.com/",
};

export default siteConfig;
