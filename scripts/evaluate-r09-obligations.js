import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (file) => JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
const register = read('content/governance/r09-obligation-register.json');
const resources = read('api/resources.json').resources;
const manifest = read('program/promise-delivery/remediation/r01/s0-occurrence-manifest.json');
const findings = [];
const acquisition = register.acquisitionObligations || [];
const sourcePurchase = manifest.occurrences.filter((record) => record.s0Class === 'R01-S0-PURCHASE');
const resourceById = new Map(resources.map((resource) => [resource.id, resource]));
const pageFor = (route) => path.join(root, route.replace(/^\//, '') + '.html');
const unavailableText = 'No checkout, purchase, license, or download is currently available.';

if (register.schema !== 'aloha-ai-r09-obligation-register/1.0') findings.push('Unsupported R09 obligation-register schema.');
if (!register.version || !register.reviewedAt || !register.reviewedBy || !register.scope || !register.boundary) findings.push('Register provenance or boundary is incomplete.');
if (sourcePurchase.length !== 6) findings.push(`Frozen R01 purchase denominator is ${sourcePurchase.length}, expected 6.`);
if (acquisition.length !== 6) findings.push(`R09 acquisition register contains ${acquisition.length} records, expected 6.`);
if (new Set(acquisition.map((record) => record.resourceId)).size !== acquisition.length) findings.push('R09 acquisition register contains duplicate resource IDs.');
if (new Set(acquisition.map((record) => record.sourcePromiseId)).size !== acquisition.length) findings.push('R09 acquisition register contains duplicate source promise IDs.');

for (const record of acquisition) {
  const source = sourcePurchase.find((candidate) => candidate.promiseId === record.sourcePromiseId);
  const resource = resourceById.get(record.resourceId);
  if (!source) findings.push(`${record.resourceId} does not reconcile to the frozen R01 purchase manifest.`);
  if (!resource || resource.pathname !== record.route) findings.push(`${record.resourceId} does not resolve to its canonical route.`);
  if (!record.artifactName || !['tool-artifact', 'product-artifact'].includes(record.artifactClass) || record.currentState !== 'unavailable') findings.push(`${record.resourceId} lacks a valid acquisition obligation contract.`);
  const page = pageFor(record.route);
  if (!fs.existsSync(page)) { findings.push(`${record.route} has no generated page.`); continue; }
  const html = fs.readFileSync(page, 'utf8');
  if (!html.includes(record.artifactName) || !html.includes(unavailableText)) findings.push(`${record.route} does not visibly preserve its named unavailable-artifact state.`);
  if (/gumroad|buy now|add to cart|checkout is handled/i.test(html)) findings.push(`${record.route} exposes prohibited acquisition language.`);
}

const workspace = register.workspaceObligation || {};
const workspaceResource = resourceById.get(workspace.resourceId);
const workspacePage = pageFor(workspace.route || '/workspace');
const workspaceHtml = fs.existsSync(workspacePage) ? fs.readFileSync(workspacePage, 'utf8') : '';
const capabilityFamilies = ['authentication','persistence','permissions','collaboration','review','audit','monitoring','personalization'];
if (!workspaceResource || workspaceResource.pathname !== '/workspace') findings.push('Workspace obligation does not resolve to the canonical Workspace resource.');
if (workspace.currentState !== 'research-architecture-no-access') findings.push('Workspace current state is not fail-closed.');
if (JSON.stringify(workspace.requiredCapabilityFamilies) !== JSON.stringify(capabilityFamilies)) findings.push('Workspace capability-family denominator is incomplete or reordered.');
if (!/No public sign-in, account creation, provisioned client workspace, or production access/i.test(workspaceResource?.implementationStatus || '')) findings.push('Workspace canonical implementation status does not preserve the no-access boundary.');
if (!/Public sign-in, account creation, and workspace provisioning are not available/i.test(workspaceHtml)) findings.push('Workspace page does not visibly preserve the no-access boundary.');
if (/<form[^>]+(?:login|sign-in|signup|register)|href="[^"]*(?:login|sign-in|signup|register)/i.test(workspaceHtml)) findings.push('Workspace page exposes an authentication or account-creation control.');
if (!register.reconsiderationTriggers?.acquisition || !register.reconsiderationTriggers?.workspace || !workspace.releaseRule) findings.push('R09 dependencies or reconsideration triggers are incomplete.');

const checks = {
  registerSchema: register.schema === 'aloha-ai-r09-obligation-register/1.0',
  exactFrozenPurchaseDenominator: sourcePurchase.length === 6,
  exactAcquisitionCoverage: acquisition.length === 6,
  uniqueAcquisitionRecords: new Set(acquisition.map((record) => record.resourceId)).size === 6,
  canonicalArtifactRoutes: acquisition.every((record) => resourceById.get(record.resourceId)?.pathname === record.route && fs.existsSync(pageFor(record.route))),
  visibleUnavailableArtifactStates: acquisition.every((record) => { const html = fs.readFileSync(pageFor(record.route), 'utf8'); return html.includes(record.artifactName) && html.includes(unavailableText); }),
  noEnabledPurchaseLanguage: acquisition.every((record) => !/gumroad|buy now|add to cart|checkout is handled/i.test(fs.readFileSync(pageFor(record.route), 'utf8'))),
  workspaceCanonicalBoundary: workspaceResource?.pathname === '/workspace' && workspace.currentState === 'research-architecture-no-access',
  exactWorkspaceCapabilityFamilies: JSON.stringify(workspace.requiredCapabilityFamilies) === JSON.stringify(capabilityFamilies),
  visibleWorkspaceNoAccessState: /Public sign-in, account creation, and workspace provisioning are not available/i.test(workspaceHtml),
  noWorkspaceAuthControl: !/<form[^>]+(?:login|sign-in|signup|register)|href="[^"]*(?:login|sign-in|signup|register)/i.test(workspaceHtml),
  dependenciesAndTriggers: Boolean(register.reconsiderationTriggers?.acquisition && register.reconsiderationTriggers?.workspace && workspace.releaseRule),
  noFindings: findings.length === 0
};
const report = {
  schema: 'aloha-ai-r09-obligation-evaluation/1.0',
  evaluatedAt: '2026-08-03',
  scope: register.scope,
  boundary: register.boundary,
  counts: { acquisitionPromises: acquisition.length, toolArtifacts: acquisition.filter((r) => r.artifactClass === 'tool-artifact').length, productArtifacts: acquisition.filter((r) => r.artifactClass === 'product-artifact').length, workspaceCapabilityFamilies: capabilityFamilies.length },
  checks,
  findings
};
for (const [file, data] of [['artifacts/r09-obligation-evaluation.json', report], ['api/r09-obligation-register.json', register]]) {
  const target = path.join(root, file); fs.mkdirSync(path.dirname(target), { recursive: true }); fs.writeFileSync(target, `${JSON.stringify(data, null, 2)}\n`);
}
console.log(`R09 obligations: ${Object.values(checks).filter(Boolean).length}/${Object.keys(checks).length} checks; ${acquisition.length} acquisition promises (${report.counts.toolArtifacts} tool + ${report.counts.productArtifacts} product); ${capabilityFamilies.length} Workspace capability families; ${findings.length} findings.`);
if (findings.length) { for (const finding of findings) console.error(`- ${finding}`); process.exit(1); }
