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

test("consumer orientation and time-to-value controls remain available", async () => {
  const shell = await read("app/site-shell.tsx");
  const nav = await read("app/nav-links.tsx");
  const css = await read("app/globals.css");
  assert.match(shell, /<NavLinks\/>/);
  assert.match(nav, /usePathname/);
  assert.match(nav, /aria-current/);
  assert.match(css, /nav a\[aria-current="page"\]/);
  assert.match(css, /@media\(max-width:760px\)[\s\S]*\.nav-action\{display:none\}/);
  for (const path of ["app/tools/decision-record/page.tsx", "app/tools/vendor-comparison/page.tsx", "app/tools/pilot-design/page.tsx"]) {
    assert.match(await read(path), /href="#workspace"/);
  }
  for (const path of ["app/tools/decision-record/record-builder.tsx", "app/tools/vendor-comparison/vendor-comparison-builder.tsx", "app/tools/pilot-design/pilot-design-kit.tsx"]) {
    assert.match(await read(path), /id="workspace"/);
  }
});

test("interactive workspaces expose save, finish, resume, and safe reset states", async () => {
  const builders = [
    await read("app/tools/decision-record/record-builder.tsx"),
    await read("app/tools/vendor-comparison/vendor-comparison-builder.tsx"),
    await read("app/tools/pilot-design/pilot-design-kit.tsx"),
  ];
  for (const builder of builders) {
    assert.match(builder, /Saved automatically on this device/);
    assert.match(builder, /href="#workspace-actions"/);
    assert.match(builder, /id="workspace-actions"/);
    assert.match(builder, /danger-action/);
  }
  const course = await read("app/learning/citation-verifier/course-workspace.tsx");
  const reader = await read("app/learning/citation-verifier/page.tsx");
  assert.match(course, /Next unfinished/);
  assert.match(course, /Resume reading/);
  assert.match(course, /setAttribute\("open"/);
  assert.match(reader, /id={`lesson-/);
  assert.match(course, /Delete local learning record/);
});

test("Opportunity Studio routes finished results only to current destinations", async () => {
  const studio = await read("app/studio/studio.tsx");
  for (const destination of ["/tools/pilot-design", "/tools/decision-record", "/learning", "/insights"]) {
    assert.match(studio, new RegExp(destination.replaceAll("/", "\\/")));
  }
  assert.doesNotMatch(studio, /prototype-pilot-sprint|free monthly masterclass/);
});

test("principal destinations have distinct discovery metadata and a useful recovery route", async () => {
  const destinations = [
    ["app/start/page.tsx", /title:\s*["']Start here/],
    ["app/about/page.tsx", /title:\s*["']About RN Collins/],
    ["app/work/page.tsx", /title:\s*["']Ways to work together/],
    ["app/learning/page.tsx", /title:\s*["']Learning/],
    ["app/learning/citation-verifier/page.tsx", /title:\s*["']Citation Verifier course/],
    ["app/tools/page.tsx", /title:\s*["']Private decision tools/],
    ["app/insights/page.tsx", /title:\s*["']Source Desk/],
    ["app/policies/page.tsx", /title:\s*["']Site policies/],
    ["app/support/page.tsx", /title:\s*["']Support and accessibility/],
    ["app/procurement/page.tsx", /title:\s*["']Procurement readiness/],
  ];
  for (const [path, title] of destinations) {
    const source = await read(path);
    assert.match(source, title, `missing distinct title in ${path}`);
    assert.match(source, /description:\s*["'][^"']{40,}/, `missing useful description in ${path}`);
  }
  const notFound = await read("app/not-found.tsx");
  assert.match(notFound, /href="\/start"/);
  assert.match(notFound, /href="\/search"/);
  assert.match(notFound, /href="\/tools"/);
  assert.match(notFound, /href="\/learning\/citation-verifier"/);
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
  assert.match(support, /normally sent within five business days/i);
  assert.match(support, /timing is not guaranteed/i);
  assert.doesNotMatch(support, /Route inactive during implementation/);
  assert.match(policies, /No active checkout or accounts/);
  assert.match(policies, /Clinic inquiry data/);
  assert.doesNotMatch(policies, /controlled drafts|masterclass|clinic/);
});

test("Decision Desk remains an inactive program record", async () => {
  const page = await read("app/learning/decision-desk/page.tsx");
  assert.match(page, /Enrollment inactive/);
  assert.match(page, /no-go for public enrollment/i);
  assert.doesNotMatch(page, /href=["'](?:https?:\/\/)?(?:buy|checkout|stripe)/i);
});

test("Aloha AI learning remains separate from Hawaii Tech Week", async () => {
  const publicSources = [
    await read("app/learning/page.tsx"),
    await read("app/learning/masterclass/page.tsx"),
    await read("app/start/page.tsx"),
    await read("app/work/ai-opportunity-clinic/page.tsx"),
    await read("app/learning/decision-desk/page.tsx"),
    await read("app/search/public-search.tsx"),
    await read("app/sitemap.ts"),
  ];
  for (const source of publicSources) {
    assert.doesNotMatch(source, /Hawaiʻi Tech Week|Hawaii Tech Week|hawaii-tech-week|\/events\/hawaii/i);
  }
  const masterclass = await read("app/learning/masterclass/page.tsx");
  assert.match(masterclass, /Free Aloha AI Masterclass/);
  assert.match(masterclass, /open now/i);
  assert.match(masterclass, /45–60 minutes/);
  assert.match(masterclass, /aloha-ai-masterclass-working-guide\.md/);
  assert.match(masterclass, /href="\/work\/ai-opportunity-clinic"/);
  for (const source of [publicSources[0], publicSources[2], publicSources[3], publicSources[5], publicSources[6]]) {
    assert.match(source, /\/learning\/masterclass/);
  }
});

test("masterclass and Clinic expose complete, truthful operating states", async () => {
  const masterclass = await read("app/learning/masterclass/page.tsx");
  const guide = await read("public/aloha-ai-masterclass-working-guide.md");
  const clinic = await read("app/work/ai-opportunity-clinic/page.tsx");
  const learning = await read("app/learning/page.tsx");
  const search = await read("app/search/public-search.tsx");
  assert.match(masterclass, /Self-paced text/);
  assert.match(masterclass, /Account<\/span><strong>Not required/);
  assert.match(guide, /Name the decision—not the technology/);
  assert.match(guide, /Test the operating conditions/);
  assert.match(clinic, /90 minutes/);
  assert.match(clinic, /Up to 6/);
  assert.match(clinic, /\$275 \/ person/);
  assert.match(clinic, /An inquiry is not a booking/);
  assert.doesNotMatch(clinic, /booking preparing|unsettled/i);
  assert.match(learning, /No registration or recording required/);
  assert.match(search, /Open now/);
});

test("Clinic inquiry is private, bounded, capacity-limited, and inactive without secure mail configuration", async () => {
  const page = await read("app/work/ai-opportunity-clinic/page.tsx");
  const form = await read("app/work/ai-opportunity-clinic/clinic-inquiry-form.tsx");
  const action = await read("app/work/ai-opportunity-clinic/actions.ts");
  const config = await read("app/work/ai-opportunity-clinic/clinic-config.ts");
  const nextConfig = await read("next.config.ts");
  assert.match(page, /Start a cohort inquiry/);
  assert.match(page, /Payment and Zoom details follow only after written scope/);
  assert.match(form, /Do not describe medical details here/);
  assert.match(form, /nonconfidential and authorize Aloha AI/);
  assert.match(action, /No information was sent/);
  assert.match(action, /participantCount > clinicConfig\.maximumParticipants/);
  assert.match(action, /resend\.batch\.send/);
  assert.match(action, /challenges\.cloudflare\.com\/turnstile\/v0\/siteverify/);
  assert.match(action, /allowedTurnstileHostnames/);
  assert.match(action, /result\.hostname/);
  assert.match(action, /idempotencyKey/);
  assert.match(action, /text:`Aloha AI Opportunity Clinic inquiry/);
  assert.match(action, /text:`Hello \$\{name\}/);
  assert.match(action, /five business days/);
  assert.match(action, /Delete an unaccepted inquiry within 30 days/);
  assert.match(form, /cf-turnstile/);
  assert.match(form, /Unaccepted inquiries are deleted within 30 days/);
  assert.match(config, /maximumParticipants: 6/);
  assert.doesNotMatch(nextConfig, /output:\s*["']export["']/);
  assert.doesNotMatch(action, /console\.(?:log|error).*email/);
});

test("Clinic pre-activation contract documents every credential and keeps payment disabled", async () => {
  const env = await read(".env.example");
  const support = await read("app/support/page.tsx");
  const policies = await read("app/policies/page.tsx");
  for (const key of ["RESEND_API_KEY", "CLINIC_INBOX_EMAIL", "CLINIC_FROM_EMAIL", "TURNSTILE_SECRET_KEY", "NEXT_PUBLIC_TURNSTILE_SITE_KEY"]) {
    assert.match(env, new RegExp(`^${key}=$`, "m"));
  }
  assert.match(env, /^STRIPE_WEBHOOK_SECRET=$/m);
  assert.match(env, /^STRIPE_PRICE_ID=$/m);
  assert.match(support, /private access-conversation option/);
  assert.match(support, /LinkedIn is not an emergency, security-incident, accommodation/);
  assert.match(policies, /Unaccepted inquiries are deleted within 30 days/);
  assert.match(policies, /retained longer when reasonably required/);
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
