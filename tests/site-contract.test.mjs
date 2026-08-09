import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("declared public routes have source pages", async () => {
  const sitemap = await read("app/sitemap.ts");
  const paths = [...sitemap.matchAll(/^\s+"(\/[^"\n]*)",$/gm)].map((match) => match[1]);
  assert.ok(paths.length >= 25, "expected the complete public route inventory");
  for (const path of paths) {
    const page = path === "/" ? "app/page.tsx" : `app${path}/page.tsx`;
    if (path.startsWith("/work/") && !["/work/ai-opportunity-clinic", "/work/ai-decision-review", "/work/opportunity-review"].includes(path)) {
      assert.match(await read("app/work/[offer]/page.tsx"), /generateStaticParams/);
      continue;
    }
    await assert.doesNotReject(read(page), `missing source page for ${path}`);
  }
});

test("canonical discovery files use the production domain", async () => {
  const expected = "https://aloha-ai-consulting.vercel.app";
  assert.match(await read("app/sitemap.ts"), new RegExp(expected.replaceAll(".", "\\.")));
  assert.match(await read("app/robots.ts"), new RegExp(expected.replaceAll(".", "\\.")));
});

test("Decision Desk remains an inactive program record", async () => {
  const page = await read("app/learning/decision-desk/page.tsx");
  assert.match(page, /Enrollment inactive/);
  assert.match(page, /no-go for public enrollment/i);
  assert.doesNotMatch(page, /href=["'](?:https?:\/\/)?(?:buy|checkout|stripe)/i);
});
