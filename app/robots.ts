import type {MetadataRoute} from "next";
export const dynamic="force-static";
export default function robots():MetadataRoute.Robots{return {rules:{userAgent:"*",allow:"/",disallow:["/search"]},sitemap:"https://aloha-ai-consulting-rn-collins.vercel.app/sitemap.xml"}}
