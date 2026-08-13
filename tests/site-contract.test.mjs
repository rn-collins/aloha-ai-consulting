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
    ["app/work/page.tsx", /title:\s*["']Work with RN/],
    ["app/learning/page.tsx", /title:\s*["']Learning/],
    ["app/learning/citation-verifier/page.tsx", /title:\s*["']Build a Trust-Safe Citation Verifier/],
    ["app/tools/page.tsx", /title:\s*["']Decision tools/],
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
  assert.match(notFound, /href="\/learning"/);
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

test("Decision Desk preserves the canonical annual plan without activating enrollment", async () => {
  const page = await read("app/learning/decision-desk/page.tsx");
  assert.match(page, /Sep 2026–Aug 2027/);
  assert.match(page, /Program plan—not enrollment/);
  assert.match(page, /The plan is complete\. Most monthly products are not/);
  assert.match(page, /\/learning\/decision-desk\/issue-01/);
  assert.doesNotMatch(page, /href=["'](?:https?:\/\/)?(?:buy|checkout|stripe)/i);
});

test("Decision Desk Issue 02 is a complete public learning product with fail-closed controls", async () => {
  const page=await read("app/learning/decision-desk/issue-02/page.tsx");
  const workspace=await read("app/learning/decision-desk/issue-02/meeting-capture-workspace.tsx");
  for(const term of ["seven authority layers","five records","synthetic meetings","Presumptive no-capture","Zero universal jurisdiction clearance"]) assert.match(page,new RegExp(term,"i"));
  assert.equal((page.match(/\["0\d"/g)||[]).length,9);
  assert.match(workspace,/localStorage/);
  assert.match(workspace,/Meeting Capture Permission and Record Map/);
  assert.match(workspace,/cannot grant legal clearance or permission to record/);
  assert.match(workspace,/Export decision map/);
  assert.match(workspace,/Delete local record/);
});

test("Decision Desk Issue 03 governs support authority by function and message class",async()=>{
  const page=await read("app/learning/decision-desk/issue-03/page.tsx");
  const map=await read("app/learning/decision-desk/issue-03/support-authority-map.tsx");
  for(const term of ["Classify","retrieve","draft","send","act","Critical stop conditions","No production agent access"]) assert.match(page,new RegExp(term,"i"));
  assert.equal((page.match(/\["(?:0\d|10)"/g)||[]).length,10);
  assert.match(map,/localStorage/);assert.match(map,/Support Automation Authority Map/);assert.match(map,/30/);assert.match(map,/Export Authority Map/);assert.match(map,/Delete local map/);
});

test("Decision Desk Issue 04 makes internal answerability source- and permission-dependent",async()=>{
 const page=await read("app/learning/decision-desk/issue-04/page.tsx"),tool=await read("app/learning/decision-desk/issue-04/answerability-test.tsx");
 for(const term of ["source authority","permissions","freshness","conflicting records","citation","abstention","correction","chat with everything"]) assert.match(page,new RegExp(term,"i"));
 assert.equal((page.match(/\["(?:0\d|1[01])"/g)||[]).length,11);assert.match(tool,/localStorage/);assert.match(tool,/30/);assert.match(tool,/Export Answerability Test/);assert.match(tool,/Delete local test/);
});

test("Decision Desk Issue 05 governs one human-opportunity stage without deciding for people",async()=>{
 const page=await read("app/learning/decision-desk/issue-05/page.tsx"),tool=await read("app/learning/decision-desk/issue-05/impact-map.tsx");
 for(const term of ["Eligibility","Screening","Scoring","Ranking","Recommendation","criteria","proxies","accommodation","contest","No candidate evaluation"]) assert.match(page,new RegExp(term,"i"));
 assert.equal((page.match(/\["(?:0\d|1[0-2])"/g)||[]).length,12);assert.match(tool,/localStorage/);assert.match(tool,/28/);assert.match(tool,/Export Impact Map/);assert.match(tool,/Delete local map/);
});

test("Decision Desk Issue 06 requires substantiation before publication",async()=>{
 const page=await read("app/learning/decision-desk/issue-06/page.tsx"),tool=await read("app/learning/decision-desk/issue-06/substantiation-gate.tsx");
 for(const term of ["objective","comparative","performance","scientific","sustainability","endorsement","source fact from inference","version drift","No real claim clearance"]) assert.match(page,new RegExp(term,"i"));
 assert.equal((page.match(/\["(?:0\d|1[0-2])"/g)||[]).length,12);assert.match(tool,/localStorage/);assert.match(tool,/30/);assert.match(tool,/Export Substantiation Gate/);assert.match(tool,/Delete local gate/);
});

test("Decision Desk Issue 07 preserves meaning, access, uncertainty, and advice boundaries",async()=>{
 const page=await read("app/learning/decision-desk/issue-07/page.tsx"),tool=await read("app/learning/decision-desk/issue-07/fidelity-test.tsx");
 for(const term of ["authoritative meaning","conditions and exceptions","uncertainty","comprehension","language access","disability","individualized advice","No individualized explanation"]) assert.match(page,new RegExp(term,"i"));
 assert.equal((page.match(/\["(?:0\d|1[0-2])"/g)||[]).length,12);assert.match(tool,/localStorage/);assert.match(tool,/30/);assert.match(tool,/Export Fidelity Test/);assert.match(tool,/Delete local test/);
});

test("Decision Desk Issue 08 binds synthetic identity permission to provenance and withdrawal",async()=>{
 const page=await read("app/learning/decision-desk/issue-08/page.tsx"),tool=await read("app/learning/decision-desk/issue-08/provenance-record.tsx");
 for(const term of ["identity authority","permission specific","power and vulnerable people","training and source-input rights","provenance","audience disclosure","withdrawal operational","No legal clearance or consent"]) assert.match(page,new RegExp(term,"i"));
 assert.equal((page.match(/\["(?:0\d|1[0-2])"/g)||[]).length,12);assert.match(tool,/localStorage/);assert.match(tool,/30/);assert.match(tool,/Export Provenance Record/);assert.match(tool,/Delete local record/);
 assert.doesNotMatch(tool,/fetch\(|XMLHttpRequest|navigator\.sendBeacon/);
});

test("Decision Desk Issue 09 makes agent authority action-specific, enforceable, and reversible",async()=>{
 const page=await read("app/learning/decision-desk/issue-09/page.tsx"),tool=await read("app/learning/decision-desk/issue-09/authority-matrix.tsx");
 for(const term of ["recommendations from actions","least privilege","human approval before consequence","outside the model","partial failure and duplication","reversibility","kill switch","No production authorization"]) assert.match(page,new RegExp(term,"i"));
 assert.equal((page.match(/\["(?:0\d|1[0-2])"/g)||[]).length,12);assert.match(tool,/localStorage/);assert.match(tool,/30/);assert.match(tool,/Export Authority Matrix/);assert.match(tool,/Delete local matrix/);
 assert.doesNotMatch(tool,/fetch\(|XMLHttpRequest|navigator\.sendBeacon/);
});

test("Decision Desk Issue 10 makes vendor procurement exact, contractual, and exit-ready",async()=>{
 const page=await read("app/learning/decision-desk/issue-10/page.tsx"),tool=await read("app/learning/decision-desk/issue-10/vendor-dossier.tsx");
 for(const term of ["current process","exact vendor and product","data and model terms","accessibility and unequal impact","total cost","operating contract","exit, portability, and continuity","No vendor recommendation or approval"]) assert.match(page,new RegExp(term,"i"));
 assert.equal((page.match(/\["(?:0\d|1[0-2])"/g)||[]).length,12);assert.match(tool,/localStorage/);assert.match(tool,/30/);assert.match(tool,/Export Vendor Dossier/);assert.match(tool,/Delete local dossier/);
 assert.doesNotMatch(tool,/fetch\(|XMLHttpRequest|navigator\.sendBeacon/);
});

test("Decision Desk Issue 11 protects learning purpose, access, educator judgment, and challenge",async()=>{
 const page=await read("app/learning/decision-desk/issue-11/page.tsx"),tool=await read("app/learning/decision-desk/issue-11/learner-review.tsx");
 for(const term of ["learning purpose","student work and educational data","meaningful choice","disability, language, and device access","construct validity","subgroup performance","educator responsible","challenge and correction","No grading or educational approval"]) assert.match(page,new RegExp(term,"i"));
 assert.equal((page.match(/\["(?:0\d|1[0-2])"/g)||[]).length,12);assert.match(tool,/localStorage/);assert.match(tool,/30/);assert.match(tool,/Export Learner Review/);assert.match(tool,/Delete local review/);assert.doesNotMatch(tool,/fetch\(|XMLHttpRequest|navigator\.sendBeacon/);
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
  assert.match(masterclass, /AI &amp; Your Work/);
  assert.match(masterclass, /90 minutes/);
  assert.match(masterclass, /24 cumulative chapters/);
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
  assert.match(masterclass, /complete self-paced edition/);
  assert.match(masterclass, /Define · Examine · Decide · Build/);
  assert.match(guide, /Translate the tool request into a work problem/);
  assert.match(guide, /Friction/);
  assert.match(guide, /Kōkua Studio/);
  assert.match(clinic, /90 minutes/);
  assert.match(clinic, /Up to 6/);
  assert.match(clinic, /\$275 \/ person/);
  assert.match(clinic, /An inquiry is not a booking/);
  assert.doesNotMatch(clinic, /booking preparing|unsettled/i);
  assert.match(learning, /Completed teaching system/);
  assert.match(search, /Complete flagship curriculum/);
});

test("flagship masterclass is a complete self-paced product, not a chapter outline", async () => {
  const page = await read("app/learning/masterclass/page.tsx");
  const data = await read("app/learning/masterclass/course-data.ts");
  const workspace = await read("app/learning/masterclass/masterclass-workspace.tsx");
  assert.equal((data.match(/c\("\d\d"/g)||[]).length,24);
  for(const term of ["Friction","Inputs","Judgment","Risk","Value","Kōkua Studio","bounded experiment","Monday Plan"]) assert.match(data,new RegExp(term));
  assert.match(page,/complete self-paced edition/);
  assert.match(workspace,/localStorage/);
  assert.match(workspace,/24 chapters/);
  assert.match(workspace,/Private working note/);
  assert.match(workspace,/Final knowledge check/);
  assert.match(workspace,/Export learning record/);
  assert.match(workspace,/Delete local course record/);
});

test("Clinic inquiry is private, bounded, capacity-limited, and inactive without secure mail configuration", async () => {
  const page = await read("app/work/ai-opportunity-clinic/page.tsx");
  const form = await read("app/work/ai-opportunity-clinic/clinic-inquiry-form.tsx");
  const action = await read("app/work/ai-opportunity-clinic/actions.ts");
  const config = await read("app/work/ai-opportunity-clinic/clinic-config.ts");
  const nextConfig = await read("next.config.ts");
  assert.match(page, /Check inquiry status/);
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

test("Clinic publishes a dated reservation and complete cancellation contract before checkout activation", async () => {
  const page = await read("app/work/ai-opportunity-clinic/page.tsx");
  const config = await read("app/work/ai-opportunity-clinic/clinic-config.ts");
  assert.match(page, /specific date, start time, time zone, cohort size, and total price/);
  assert.match(page, /held for 48 hours/);
  assert.match(page, /full stated total is paid/);
  assert.match(page, /seven calendar days before the scheduled start for a full refund/);
  assert.match(page, /between 72 hours and seven calendar days[^]*50% refund/);
  assert.match(page, /less than 72 hours[^]*not refundable/);
  assert.match(page, /substitute participants at no charge/);
  assert.match(page, /One reschedule is available without charge/);
  assert.match(page, /replacement date or receive a full refund/);
  assert.match(page, /initiated within five business days/);
  assert.match(page, /docs\.stripe\.com\/refunds/);
  assert.match(page, /Accessibility requests do not reduce refund or rescheduling rights/);
  assert.match(config, /offeredSlotHoldHours: 48/);
  assert.match(config, /partialRefundPercent: 50/);
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
