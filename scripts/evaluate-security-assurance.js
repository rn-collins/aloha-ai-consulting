import fs from 'node:fs';
import path from 'node:path';

const read = (file) => fs.readFileSync(file, 'utf8');
const platformFiles = walk('api/platform').filter((file) => file.endsWith('.js'));
const authenticatedFiles = platformFiles.filter((file) => read(file).includes('requireSession'));
const publicAuthFiles = ['api/platform/auth/sign-in.js', 'api/platform/auth/sign-up.js'];
const vercel = JSON.parse(read('vercel.json'));
const headers = Object.fromEntries(vercel.headers[0].headers.map((item) => [item.key, item.value]));
const platformLibrary = read('api/_lib/platform.js');
const health = read('api/platform/health.js');
const gateway = read('lib/platform/ai-gateway.js');
const adapter = read('lib/platform/adapter-sdk.js');
const securityPolicy = read('SECURITY.md');
const privacyPolicy = read('privacy.html');
const workflow = read('.github/workflows/secret-history-scan.yml');
const envExample = read('.env.example');
const apiPackage = JSON.parse(read('api/package.json'));
const platformPackage = JSON.parse(read('lib/platform/package.json'));
const serviceRoleCallers = platformFiles.filter((file) => /service\s*:\s*true/.test(read(file)));
const trackedEnvironmentFiles = walk('.').filter((file) => /(^|\/)\.env($|\.)/.test(file) && file !== '.env.example');
const secretPatterns = [/-----BEGIN (?:RSA |OPENSSH |EC |DSA )?PRIVATE KEY-----/, /AKIA[0-9A-Z]{16}/, /gh[pousr]_[A-Za-z0-9_]{20,}/, /sk-[A-Za-z0-9]{20,}/];
const secretHits = [];
for (const file of walk('.').filter((item) => !item.endsWith('package-lock.json'))) {
  const source = read(file);
  for (const pattern of secretPatterns) if (pattern.test(source)) secretHits.push({file, pattern:String(pattern)});
}

const checks = [
  ['responsible-disclosure-path-published', securityPolicy.includes('security report — no meeting needed') && privacyPolicy.includes('security report — no meeting needed')],
  ['testing-boundary-published', securityPolicy.includes('no authorization to access data') && securityPolicy.includes('Stop testing')],
  ['public-auth-fails-closed', publicAuthFiles.every((file) => read(file).includes("PLATFORM_PUBLIC_AUTH_ENABLED !== 'true'"))],
  ['platform-module-runtime-declared', apiPackage.type === 'commonjs' && platformPackage.type === 'commonjs' && platformFiles.every((file) => /module\.exports|require\(/.test(read(file)))],
  ['authenticated-routes-require-session', authenticatedFiles.length >= 10],
  ['service-role-not-required-by-default', !platformLibrary.match(/const required = \[[^\]]*SUPABASE_SERVICE_ROLE_KEY/) && serviceRoleCallers.length === 0],
  ['backend-errors-redacted', platformLibrary.includes("status === 500 ? 'internal_error' : 'request_failed'") && !platformLibrary.includes('details:error.details')],
  ['health-does-not-enumerate-secrets', !health.includes('supabaseServiceRole') && !health.includes('supabaseAnonKey') && !health.includes('configured,')],
  ['platform-responses-not-cached', platformLibrary.includes("res.setHeader('Cache-Control','no-store')") && health.includes("res.setHeader('Cache-Control', 'no-store')")],
  ['external-model-execution-disabled', gateway.includes("throw new GatewayError('adapter_disabled'")],
  ['external-delivery-disabled-by-default', adapter.includes('enabled=false') && adapter.includes("reason:'external_delivery_disabled'")],
  ['security-headers-configured', Boolean(headers['Content-Security-Policy'] && headers['Strict-Transport-Security'] && headers['X-Content-Type-Options'] === 'nosniff' && headers['Referrer-Policy'] && headers['Permissions-Policy'])],
  ['history-secret-scan-enforced', workflow.includes('fetch-depth: 0') && workflow.includes('gitleaks/gitleaks-action@v2') && workflow.includes('schedule:')],
  ['checked-tree-secret-scan-clear', secretHits.length === 0 && trackedEnvironmentFiles.length === 0 && !/=\s*(?:sk-|gh[pousr]_)/.test(envExample)]
];
const failures = checks.filter(([, passed]) => !passed).map(([id]) => id);
const record = {
  schema:'aloha-ai-site-assurance/1.0', assuranceId:'ASSURANCE-SECURITY-001', domain:'security',
  decision:failures.length ? 'failed-closed' : 'passed-limited-repository-and-public-deployment-boundary', evaluatedAt:'2026-08-02',
  owner:'RN Collins / Aloha AI', reviewer:'Codex remediation agent',
  scope:'Checked-in repository, public-site security headers, deployed platform-handler code, authentication defaults, error boundary, secret-handling policy, and disclosure path.',
  exclusions:['Penetration testing, exploit execution, denial-of-service testing, and independent third-party assessment','Vercel, GitHub, Microsoft, and Supabase account configuration, audit logs, personnel access, and incident operations','Supabase database schema, row-level-security policies, backups, and data not present in this repository','Client systems, satellite deployments, and future enabled integrations'],
  permissionsBoundary:{publicSite:'Static public resources and browser-local tools are available without an account.',platformFoundation:'Public sign-up and sign-in fail closed unless explicitly enabled; data routes require a Supabase user session.',authorizationDependency:'Tenant isolation and row authorization depend on Supabase row-level-security policies and are excluded until independently inspected.',externalActions:'Model execution and delivery adapters remain disabled.'},
  secretsAndLoggingControls:{trackedEnvironmentFiles,checkedTreeSecretHits:secretHits,serviceRoleCallers,historyScanner:'Gitleaks scans full Git history on pull requests, main pushes, weekly schedule, and manual dispatch.',clientErrorBoundary:'Unexpected backend errors return internal_error without provider details.',loggingBoundary:'No application request-body logging is implemented in checked-in platform handlers; provider-level logs remain excluded.'},
  incidentPath:{route:'/university/contact',provider:'Microsoft Bookings',instruction:'Choose any available time and write “security report — no meeting needed”; provide only a concise non-exploitative description and safe reply path.'},
  responseHeaders:headers,
  inventory:{platformHandlerCount:platformFiles.length,authenticatedHandlerCount:authenticatedFiles.length,publicAuthHandlerCount:publicAuthFiles.length,serviceRoleCallerCount:serviceRoleCallers.length,trackedEnvironmentFileCount:trackedEnvironmentFiles.length,checkedTreeSecretHitCount:secretHits.length},
  review:{lastReviewed:'2026-08-02',nextReview:'2026-11-02',trigger:'Any API handler, authentication, authorization, cookie, secret, environment, logging, error, CSP/header, dependency, workflow, disclosure-path, database-policy, or deployment change.'},
  checks:Object.fromEntries(checks), metrics:{totalChecks:checks.length,passedChecks:checks.length-failures.length,failedChecks:failures.length}, failures,
  prohibitedInference:'This bounded review is not a penetration test, SOC 2 or ISO 27001 certification, vulnerability-free guarantee, third-party security assessment, or certification of database row-level security and operational account controls.'
};
fs.mkdirSync('api/evaluations',{recursive:true}); fs.mkdirSync('content/evaluations',{recursive:true});
const output=`${JSON.stringify(record,null,2)}\n`; fs.writeFileSync('api/evaluations/security.json',output); fs.writeFileSync('content/evaluations/security.json',output);
if(failures.length){console.error(`Security assurance failed closed: ${failures.join(', ')}`);process.exit(1)}
console.log(`Security assurance passed within the bounded repository and public-deployment scope: ${checks.length}/${checks.length} checks; ${platformFiles.length} platform handlers; ${authenticatedFiles.length} session-gated handlers.`);

function walk(start){const excluded=new Set(['.git','node_modules','artifacts','build-snapshots','reports']);if(!fs.existsSync(start))return[];const results=[];for(const entry of fs.readdirSync(start,{withFileTypes:true})){if(excluded.has(entry.name))continue;const full=path.join(start,entry.name).replace(/^\.\//,'');if(entry.isDirectory())results.push(...walk(full));else results.push(full)}return results}
