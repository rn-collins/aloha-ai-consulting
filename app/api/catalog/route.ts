import {publicCatalog} from "../../public-catalog";
export const dynamic="force-static";
export function GET(){return Response.json({schema:"https://aloha-ai-consulting.vercel.app/api/catalog/schema/1/",version:"1.0.0",updated:"2026-08-17",count:publicCatalog.length,records:publicCatalog},{headers:{"Access-Control-Allow-Origin":"*","Cache-Control":"public, max-age=0, s-maxage=3600, stale-while-revalidate=86400"}})}
