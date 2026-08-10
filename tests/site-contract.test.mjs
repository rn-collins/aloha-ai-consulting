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

test("consumer entry points describe the currently usable estate accurately", async () => {
  const home = await read("app/home-experience.tsx");
  const start = await read("app/start/page.tsx");
  const work = await read("app/work/page.tsx");
  const shell = await read("app/site-shell.tsx");
  for (const source of [home, start, work]) {
    assert.match(source, /tools\/decision-record/);
    assert.match(source, /tools\/vendor-comparison/);
    assert.match(source, /tools\/pilot-design/);
  }
  assert.doesNotMatch(home, /only currently usable tool/i);
  assert.doesNotMatch(start, /free monthly|paid clinic/i);
  assert.match(shell, /href="\/tools"/);
  assert.match(shell, /href="\/learning"/);
});

test("trust surfaces provide verifiable proof and truthful operational boundaries", async () => {
  const about = await read("app/about/page.tsx");
  const insights = await read("app/insights/page.tsx");
  const support = await read("app/support/page.tsx");
  const policies = await read("app/policies/page.tsx");
  assert.match(about, /pubmed\.ncbi\.nlm\.nih\.gov/);
  assert.match(about, /doi\.org\/10\.3389/);
  assert.match(insights, /nvlpubs\.nist\.gov/);
  assert.match(insights, /gao\.gov\/products\/gao-21-519sp/);
  assert.match(insights, /w3\.org\/TR\/WCAG22/);
  assert.match(support, /cannot recover local records/i);
  assert.match(support, /no response time is promised/i);
  assert.doesNotMatch(support, /Route inactive during implementation/);
  assert.match(policies, /No active commerce or accounts/);
  assert.doesNotMatch(policies, /controlled drafts|masterclass|clinic/);
});

test("Decision Desk remains an inactive program record", async () => {
  const page = await read("app/learning/decision-desk/page.tsx");
  assert.match(page, /Enrollment inactive/);
  assert.match(page, /no-go for public enrollment/i);
  assert.doesNotMatch(page, /href=["'](?:https?:\/\/)?(?:buy|checkout|stripe)/i);
});

test("Citation Verifier workspace is local, portable, and non-credentialed", async () => {
  const page = await read("app/learning/citation-verifier/page.tsx");
  const workspace = await read("app/learning/citation-verifier/course-workspace.tsx");
  assert.match(page, /CourseWorkspace/);
  assert.match(workspace, /localStorage/);
  assert.match(workspace, /citation-verifier-lab-kit\.md/);
  assert.match(workspace, /citation-verifier-learning-record\.json/);
  assert.match(workspace, /not verified, graded, certified, or credentialed/i);
  assert.doesNotMatch(workspace, /fetch\(|XMLHttpRequest|navigator\.sendBeacon/);
});

test("Decision Record Builder is local, portable, and does not approve decisions", async () => {
  const page = await read("app/tools/decision-record/page.tsx");
  const builder = await read("app/tools/decision-record/record-builder.tsx");
  assert.match(page, /DecisionRecordBuilder/);
  assert.match(builder, /localStorage/);
  assert.match(builder, /decision-record\.md/);
  assert.match(builder, /decision-record\.json/);
  assert.match(builder, /not verified, approved, or certified/i);
  assert.match(builder, /Stop conditions/);
  assert.match(builder, /Affected people/);
  assert.doesNotMatch(builder, /fetch\(|XMLHttpRequest|navigator\.sendBeacon/);
  assert.doesNotMatch(builder, /riskScore|approveDecision|complianceScore/);
});

test("Vendor Comparison Builder is gated, local, portable, and non-certifying", async () => {
  const page = await read("app/tools/vendor-comparison/page.tsx");
  const builder = await read("app/tools/vendor-comparison/vendor-comparison-builder.tsx");
  assert.match(page, /VendorComparisonBuilder/);
  assert.match(builder, /localStorage/);
  assert.match(builder, /tool-vendor-comparison\.md/);
  assert.match(builder, /tool-vendor-comparison\.json/);
  assert.match(builder, /Current process/);
  assert.match(builder, /Do not advance/);
  assert.match(builder, /Privacy, data authority/);
  assert.match(builder, /Accessibility and equitable access/);
  assert.match(builder, /Exit, portability, and continuity/);
  assert.match(builder, /not verified, approved, recommended, or certified/i);
  assert.doesNotMatch(builder, /fetch\(|XMLHttpRequest|navigator\.sendBeacon/);
  assert.doesNotMatch(builder, /approveVendor|certifiedVendor|complianceScore/);
});

test("Pilot Design Kit is gated, local, portable, and blocks deployment drift", async () => {
  const page = await read("app/tools/pilot-design/page.tsx");
  const kit = await read("app/tools/pilot-design/pilot-design-kit.tsx");
  assert.match(page, /PilotDesignKit/);
  assert.match(kit, /localStorage/);
  assert.match(kit, /pilot-design-record\.md/);
  assert.match(kit, /pilot-design-record\.json/);
  assert.match(kit, /Do not start/i);
  assert.match(kit, /Bounded purpose and hypothesis/);
  assert.match(kit, /Baseline, measures, and evidence plan/);
  assert.match(kit, /affected-party input/i);
  assert.match(kit, /Stop conditions/);
  assert.match(kit, /Rollback and fallback/);
  assert.match(kit, /End-of-pilot decision firewall/);
  assert.match(kit, /A pilot is not a quiet path to production/);
  assert.match(kit, /not verified, approved, authorized, certified, or a deployment decision/i);
  assert.doesNotMatch(kit, /fetch\(|XMLHttpRequest|navigator\.sendBeacon/);
  assert.doesNotMatch(kit, /approvePilot|authorizeDeployment|complianceScore/);
});
