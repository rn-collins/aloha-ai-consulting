import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (file) => JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
const architecture = read('content/governance/r09-delivery-architecture.json');
const obligations = read('content/governance/r09-obligation-register.json');
const findings = [];
const artifacts = architecture.artifacts || [];
const obligationIds = obligations.acquisitionObligations.map((record) => record.resourceId).sort();
const architectureIds = artifacts.map((record) => record.resourceId).sort();
const exact = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const requiredArtifactFields = ['resourceId','artifactName','packageType','contents','formats','artifactAcceptanceTests'];
const workspaceFamilies = ['authentication','persistence','permissions','collaboration','review','audit','monitoring','personalization'];

if (architecture.schema !== 'aloha-ai-r09-delivery-architecture/1.0') findings.push('Unsupported delivery-architecture schema.');
if (!architecture.version || !architecture.reviewedAt || !architecture.reviewedBy || !architecture.scope || !architecture.boundary) findings.push('Architecture provenance or boundary is incomplete.');
if (!exact(obligationIds, architectureIds)) findings.push('Architecture does not exactly cover the six acquisition obligations.');
if (new Set(architectureIds).size !== 6) findings.push('Architecture resource IDs are not six unique records.');

for (const artifact of artifacts) {
  const obligation = obligations.acquisitionObligations.find((record) => record.resourceId === artifact.resourceId);
  if (!requiredArtifactFields.every((field) => artifact[field])) findings.push(`${artifact.resourceId} lacks required architecture fields.`);
  if (!obligation || obligation.artifactName !== artifact.artifactName) findings.push(`${artifact.resourceId} does not preserve the governed artifact name.`);
  if (!Array.isArray(artifact.contents) || artifact.contents.length < 7) findings.push(`${artifact.resourceId} has an incomplete contents contract.`);
  if (!Array.isArray(artifact.formats) || artifact.formats.length < 4 || !artifact.formats.some((format) => /ZIP package/i.test(format))) findings.push(`${artifact.resourceId} has an incomplete format/package contract.`);
  if (!Array.isArray(artifact.artifactAcceptanceTests) || artifact.artifactAcceptanceTests.length < 4) findings.push(`${artifact.resourceId} lacks artifact-specific acceptance depth.`);
}

const acquisition = architecture.acquisitionArchitecture || {};
const license = architecture.licenseArchitecture || {};
const maintenance = architecture.maintenanceArchitecture || {};
const workspace = architecture.workspaceAccessArchitecture || {};
if ((architecture.universalArtifactAcceptanceTests || []).length < 8) findings.push('Universal artifact acceptance suite is incomplete.');
if ((acquisition.states || []).length < 10 || (acquisition.requiredSurfaces || []).length < 10 || (acquisition.productionProof || []).length < 10) findings.push('Acquisition, fulfillment, or production-proof architecture is incomplete.');
if (!acquisition.fulfillmentContract || !acquisition.securityAndPrivacy || !acquisition.failureContract || !acquisition.supportContract) findings.push('Acquisition operational boundaries are incomplete.');
if (!license.defaultLicense || (license.requiredTerms || []).length < 6 || !(license.prohibitedUses || []).includes('resale')) findings.push('License architecture is incomplete.');
if (!architecture.versionPolicy?.scheme || (architecture.versionPolicy?.manifestFields || []).length < 8) findings.push('Version and manifest architecture is incomplete.');
if ((maintenance.states || []).length < 5 || !maintenance.requiredDisclosure || !maintenance.urgentCorrectionRule) findings.push('Maintenance and correction architecture is incomplete.');
if (workspace.currentState !== 'research-architecture-no-access' || !exact(workspace.requiredCapabilityFamilies, workspaceFamilies)) findings.push('Workspace boundary or capability denominator changed.');
if ((workspace.requiredStateMatrix || []).length < 9 || (workspace.releaseTests || []).length < 12 || !/creates no Workspace account or entitlement/i.test(workspace.commercialRelationship || '')) findings.push('Workspace provisioning separation or release architecture is incomplete.');
if ((architecture.buildSequence || []).length < 6 || !/not a release claim/i.test(architecture.boundary || '')) findings.push('Fail-closed sequence or non-release boundary is incomplete.');

const checks = {
  architectureSchema: architecture.schema === 'aloha-ai-r09-delivery-architecture/1.0',
  exactSixArtifactCoverage: exact(obligationIds, architectureIds),
  uniqueArtifactContracts: new Set(architectureIds).size === 6,
  exactArtifactNames: artifacts.every((artifact) => obligations.acquisitionObligations.some((record) => record.resourceId === artifact.resourceId && record.artifactName === artifact.artifactName)),
  substantiveContentsAndFormats: artifacts.every((artifact) => artifact.contents.length >= 7 && artifact.formats.length >= 4 && artifact.formats.some((format) => /ZIP package/i.test(format))),
  artifactSpecificAcceptance: artifacts.every((artifact) => artifact.artifactAcceptanceTests.length >= 4),
  universalArtifactAcceptance: architecture.universalArtifactAcceptanceTests.length >= 8,
  versionManifestContract: Boolean(architecture.versionPolicy?.scheme && architecture.versionPolicy.manifestFields.length >= 8),
  licenseAndRightsContract: Boolean(license.defaultLicense && license.requiredTerms.length >= 6 && license.prohibitedUses.includes('resale')),
  acquisitionAndFulfillmentContract: Boolean(acquisition.states.length >= 10 && acquisition.requiredSurfaces.length >= 10 && acquisition.productionProof.length >= 10 && acquisition.fulfillmentContract && acquisition.failureContract),
  privacySecuritySupportContract: Boolean(acquisition.securityAndPrivacy && acquisition.supportContract),
  maintenanceAndCorrectionContract: Boolean(maintenance.states.length >= 5 && maintenance.requiredDisclosure && maintenance.urgentCorrectionRule),
  separateWorkspaceArchitecture: workspace.currentState === 'research-architecture-no-access' && exact(workspace.requiredCapabilityFamilies, workspaceFamilies) && workspace.requiredStateMatrix.length >= 9 && workspace.releaseTests.length >= 12 && /creates no Workspace account or entitlement/i.test(workspace.commercialRelationship),
  failClosedBuildSequence: architecture.buildSequence.length >= 6 && /not a release claim/i.test(architecture.boundary),
  noFindings: findings.length === 0
};

const report = {
  schema: 'aloha-ai-r09-delivery-architecture-evaluation/1.0',
  evaluatedAt: '2026-08-03',
  scope: architecture.scope,
  boundary: architecture.boundary,
  counts: {
    artifacts: artifacts.length,
    toolArtifacts: obligations.acquisitionObligations.filter((record) => record.artifactClass === 'tool-artifact').length,
    productArtifacts: obligations.acquisitionObligations.filter((record) => record.artifactClass === 'product-artifact').length,
    declaredPackageFilesAndComponents: artifacts.reduce((sum, artifact) => sum + artifact.contents.length, 0),
    declaredFormats: artifacts.reduce((sum, artifact) => sum + artifact.formats.length, 0),
    artifactSpecificAcceptanceTests: artifacts.reduce((sum, artifact) => sum + artifact.artifactAcceptanceTests.length, 0),
    universalArtifactAcceptanceTests: architecture.universalArtifactAcceptanceTests.length,
    workspaceCapabilityFamilies: workspace.requiredCapabilityFamilies.length,
    workspaceReleaseTests: workspace.releaseTests.length
  },
  checks,
  findings
};

for (const [file, data] of [
  ['artifacts/r09-delivery-architecture-evaluation.json', report],
  ['api/r09-delivery-architecture.json', architecture]
]) {
  const target = path.join(root, file);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, `${JSON.stringify(data, null, 2)}\n`);
}

console.log(`R09 delivery architecture: ${Object.values(checks).filter(Boolean).length}/${Object.keys(checks).length} checks; ${artifacts.length} artifacts; ${report.counts.artifactSpecificAcceptanceTests} artifact tests + ${report.counts.universalArtifactAcceptanceTests} universal tests; ${workspace.releaseTests.length} Workspace tests; ${findings.length} findings.`);
if (findings.length) {
  for (const finding of findings) console.error(`- ${finding}`);
  process.exit(1);
}
