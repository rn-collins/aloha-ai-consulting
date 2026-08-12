import type { MetadataRoute } from "next";

export const dynamic = "force-static";

const base = "https://aloha-ai-consulting.vercel.app";
const paths = [
  "/",
  "/start",
  "/about",
  "/studio",
  "/work",
  "/work/ai-opportunity-clinic",
  "/work/ai-decision-review",
  "/work/workflow-diagnostic-redesign",
  "/work/ai-tool-vendor-decision",
  "/work/prototype-pilot-sprint",
  "/work/ai-operating-partnership",
  "/work/custom-organizational-program",
  "/organizations",
  "/sponsor",
  "/learning",
  "/learning/masterclass",
  "/learning/decision-desk",
    "/learning/decision-desk/issue-01",
    "/learning/decision-desk/issue-02",
    "/learning/decision-desk/issue-03",
    "/learning/decision-desk/issue-04",
    "/learning/decision-desk/issue-05",
    "/learning/decision-desk/issue-06",
  "/learning/citation-verifier",
  "/tools",
  "/tools/decision-record",
  "/tools/vendor-comparison",
  "/tools/pilot-design",
  "/insights",
  "/questions",
  "/procurement",
  "/policies",
  "/support",
  "/search",
];

export default function sitemap(): MetadataRoute.Sitemap {
  return paths.map((path) => ({
    url: `${base}${path}`,
    lastModified: new Date("2026-08-12"),
    changeFrequency: path === "/" ? "weekly" : "monthly",
    priority: path === "/" ? 1 : path === "/studio" || path === "/learning/citation-verifier" ? 0.9 : 0.7,
  }));
}
