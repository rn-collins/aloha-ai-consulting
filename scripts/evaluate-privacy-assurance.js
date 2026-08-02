import fs from 'node:fs';
import path from 'node:path';

const excluded = new Set(['.git', 'node_modules', 'artifacts', 'build-snapshots', 'reports']);
const htmlFiles = walk('.').filter((file) => file.endsWith('.html'));
const jsFiles = walk('.').filter((file) => file.endsWith('.js') && !file.startsWith('scripts/') && !file.startsWith('tests/'));
const read = (file) => fs.readFileSync(file, 'utf8');
const html = htmlFiles.map((file) => [file, read(file)]);
const runtimeJs = jsFiles.map((file) => [file, read(file)]);
const privacy = read('privacy.html');
const contact = read('university/contact.html');
const intake = read('contact-intake.js');
const vercel = read('vercel.json');
const signUp = read('api/platform/auth/sign-up.js');
const signIn = read('api/platform/auth/sign-in.js');
const gateway = read('lib/platform/ai-gateway.js');
const platformFiles = walk('api/platform').filter((file) => file.endsWith('.js'));
const authenticatedPlatformFiles = platformFiles.filter((file) => read(file).includes('requireSession'));

const speedInsightRoutes = html.filter(([, source]) => source.includes('/_vercel/speed-insights/script.js')).map(([file]) => route(file));
const advertisingTrackerPatterns = [
  /googletagmanager\.com|google-analytics\.com|gtag\s*\(/i,
  /connect\.facebook\.net|fbq\s*\(/i,
  /static\.hotjar\.com|hj\s*\(/i,
  /clarity\.ms|clarity\s*\(/i
];
const advertisingTrackerHits = [];
for (const [file, source] of [...html, ...runtimeJs]) {
  for (const pattern of advertisingTrackerPatterns) if (pattern.test(source)) advertisingTrackerHits.push({ file, pattern: String(pattern) });
}

const externalRuntimeRequests = [];
for (const [file, source] of runtimeJs) {
  const matches = source.matchAll(/fetch\(\s*([`'"])(https?:\/\/[^`'"]+)/g);
  for (const match of matches) externalRuntimeRequests.push({ file, destination: new URL(match[2]).origin });
}

const checks = [
  ['privacy-policy-published', privacy.includes('Effective 2026-08-02') && privacy.includes('Vercel Speed Insights')],
  ['speed-insights-inventoried', speedInsightRoutes.length > 0 && privacy.includes('cookieless performance measurement')],
  ['no-advertising-trackers', advertisingTrackerHits.length === 0],
  ['local-scoping-record-disclosed', intake.includes("transmission_state: 'not-submitted'") && privacy.includes('scoping record is not submitted')],
  ['short-lived-session-attribution-disclosed', intake.includes('30 * 60 * 1000') && privacy.includes('no more than thirty minutes')],
  ['booking-path-disclosed', contact.includes('outlook.office.com/bookwithme/') && privacy.includes('Microsoft Outlook Bookings')],
  ['privacy-request-path-published', privacy.includes('privacy request — no meeting needed')],
  ['incident-path-published', privacy.includes('privacy incident — no meeting needed')],
  ['public-auth-fails-closed', signUp.includes("PLATFORM_PUBLIC_AUTH_ENABLED !== 'true'") && signIn.includes("PLATFORM_PUBLIC_AUTH_ENABLED !== 'true'")],
  ['authenticated-platform-routes-gated', authenticatedPlatformFiles.length >= 10],
  ['external-model-delivery-disabled', gateway.includes("throw new GatewayError('adapter_disabled'")],
  ['csp-does-not-permit-ad-trackers', !/google-analytics|googletagmanager|facebook\.com|hotjar|clarity\.ms/i.test(vercel)]
];
const failures = checks.filter(([, passed]) => !passed).map(([id]) => id);

const record = {
  schema: 'aloha-ai-site-assurance/1.0',
  assuranceId: 'ASSURANCE-PRIVACY-001',
  domain: 'privacy',
  decision: failures.length ? 'failed-closed' : 'passed-limited-public-site-boundary',
  evaluatedAt: '2026-08-02',
  owner: 'RN Collins / Aloha AI',
  reviewer: 'Codex remediation agent',
  scope: 'Canonical public-site routes, checked-in browser runtime, Vercel configuration, disclosed Microsoft Bookings path, and deployed-but-unlinked platform API foundations.',
  exclusions: [
    'Microsoft, Northeastern, Vercel, Supabase, and destination-site internal processing not observable from this repository',
    'Client systems and separately governed satellite deployments',
    'A legal determination of jurisdiction-specific privacy compliance'
  ],
  dataFlows: [
    { id: 'first-party-delivery', data: 'HTTP request metadata and requested assets', destination: 'Vercel-hosted Aloha AI site', trigger: 'Page request', retention: 'Controlled by Vercel platform logging; not represented as zero metadata' },
    { id: 'speed-insights', data: 'Cookieless web-performance measurements', destination: 'Vercel Speed Insights', trigger: `${speedInsightRoutes.length} checked-in HTML routes load the Speed Insights script`, retention: 'Controlled by Vercel' },
    { id: 'browser-tools', data: 'Visitor-entered tool inputs and generated results', destination: 'Visitor browser by default', trigger: 'Local interaction', retention: 'Page memory unless the visitor deliberately downloads, copies, or uses disclosed local storage' },
    { id: 'contact-attribution', data: 'Source route, offer ID, inquiry type, timestamps', destination: 'sessionStorage', trigger: 'Contact-page view or action', retention: '30-minute application TTL and browser-session boundary; visitor-clearable' },
    { id: 'microsoft-bookings', data: 'Information the visitor deliberately enters, typically name, email, time, and note', destination: 'Northeastern-associated Microsoft Bookings account', trigger: 'Visitor leaves Aloha AI and submits to Microsoft', retention: 'Controlled by Microsoft and the associated account' },
    { id: 'platform-foundations', data: 'Account and workspace records only if separately enabled and authenticated', destination: 'Configured Supabase project', trigger: 'Unlinked API call plus explicit platform enablement/session', retention: 'Not certified for public use; public authentication fails closed' },
    { id: 'external-navigation', data: 'Ordinary destination request metadata and referrer subject to browser policy', destination: 'Visitor-selected external site', trigger: 'Visitor activates an external link', retention: 'Controlled by destination provider' }
  ],
  deployedNetworkAndScriptInventory: {
    checkedHtmlFiles: htmlFiles.length,
    checkedRuntimeJsFiles: jsFiles.length,
    speedInsightRouteCount: speedInsightRoutes.length,
    speedInsightRoutes,
    advertisingTrackerHits,
    directExternalRuntimeRequests: externalRuntimeRequests,
    platformApiFileCount: platformFiles.length,
    authenticatedPlatformFileCount: authenticatedPlatformFiles.length,
    contentSecurityPolicy: JSON.parse(vercel).headers[0].headers.find((item) => item.key === 'Content-Security-Policy').value
  },
  requestProcess: { route: '/university/contact', provider: 'Microsoft Bookings', instruction: 'Use any available time and write “privacy request — no meeting needed”; do not add sensitive information.' },
  incidentPath: { route: '/university/contact', provider: 'Microsoft Bookings', instruction: 'Write “privacy incident — no meeting needed” and include only route, approximate time, and a safe reply path.' },
  review: { lastReviewed: '2026-08-02', nextReview: '2026-11-02', trigger: 'Any script, form, storage, cookie, analytics, API, authentication, CSP, booking, third-party destination, privacy-copy, or deployment change.' },
  checks: Object.fromEntries(checks),
  metrics: { totalChecks: checks.length, passedChecks: checks.length - failures.length, failedChecks: failures.length },
  failures,
  prohibitedInference: 'This bounded technical and policy review is not a certification of legal compliance, third-party practices, every client system, or future deployments.'
};

fs.mkdirSync('api/evaluations', { recursive: true });
fs.mkdirSync('content/evaluations', { recursive: true });
const output = `${JSON.stringify(record, null, 2)}\n`;
fs.writeFileSync('api/evaluations/privacy.json', output);
fs.writeFileSync('content/evaluations/privacy.json', output);
if (failures.length) {
  console.error(`Privacy assurance failed closed: ${failures.join(', ')}`);
  process.exit(1);
}
console.log(`Privacy assurance passed within the public-site boundary: ${checks.length}/${checks.length} checks; ${htmlFiles.length} HTML files; ${speedInsightRoutes.length} Speed Insights routes; ${platformFiles.length} platform API files inventoried.`);

function walk(start) {
  if (!fs.existsSync(start)) return [];
  const results = [];
  for (const entry of fs.readdirSync(start, { withFileTypes: true })) {
    if (excluded.has(entry.name)) continue;
    const full = path.join(start, entry.name).replace(/^\.\//, '');
    if (entry.isDirectory()) results.push(...walk(full));
    else results.push(full);
  }
  return results;
}

function route(file) {
  const normalized = `/${file.replace(/\\/g, '/').replace(/\.html$/, '')}`;
  return normalized === '/index' ? '/' : normalized;
}
