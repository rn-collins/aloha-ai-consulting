import fs from 'node:fs';

const maintainedIds = new Set(['cannabis-rescheduling', 'psychedelic-radar']);
const cannabis = read('content/monitors/cannabis-rescheduling.json');
const intelligence = read('content/monitors/intelligence-monitors.json');
const records = [cannabis, ...intelligence];
const maintained = records.filter((record) => record.lifecycleState === 'maintained-beta-manual-review');
const now = new Date(process.env.MONITOR_AS_OF || new Date().toISOString());
const errors = [];

if (Number.isNaN(now.getTime())) errors.push('MONITOR_AS_OF is not a valid date');
if (new Set(records.map((record) => record.id)).size !== records.length) errors.push('monitor IDs are not unique');
if (maintained.length !== maintainedIds.size) errors.push(`maintained monitor count is ${maintained.length}/${maintainedIds.size}`);

for (const record of records) {
  const authorized = maintainedIds.has(record.id);
  const operations = record.monitorOperations;

  if (!authorized) {
    if (operations) errors.push(`${record.id}: demonstration has monitorOperations`);
    if (/maintained|current/i.test(record.lifecycleState || '')) errors.push(`${record.id}: demonstration has a maintained/current lifecycle`);
    continue;
  }

  if (record.lifecycleState !== 'maintained-beta-manual-review') errors.push(`${record.id}: authorized monitor is not maintained beta`);
  if (!operations) {
    errors.push(`${record.id}: monitorOperations missing`);
    continue;
  }

  for (const field of ['version', 'jurisdiction', 'scope', 'owner', 'reviewer', 'cadence', 'lastSuccessfulReview', 'nextScheduledReview', 'staleAfter', 'staleBehavior', 'failureBehavior', 'correctionPolicy']) {
    if (!operations[field]) errors.push(`${record.id}: ${field} missing`);
  }
  if (!Array.isArray(operations.sourceAuthorities) || !operations.sourceAuthorities.length) errors.push(`${record.id}: source authorities missing`);
  if (!operations.sourceAuthorities?.every((source) => source.required === true && source.name && source.authority && /^https:\/\//.test(source.url))) errors.push(`${record.id}: required source authority is incomplete`);
  if (!Array.isArray(operations.runHistory) || !operations.runHistory.length) errors.push(`${record.id}: run history missing`);
  if (!operations.runHistory?.some((run) => /^pass/.test(run.result) && run.reviewedAt === operations.lastSuccessfulReview && run.runId && run.observedState && run.evidence?.length)) errors.push(`${record.id}: last successful review lacks a matching evidenced run`);
  if (!Array.isArray(operations.corrections)) errors.push(`${record.id}: correction log missing`);

  const reviewed = new Date(`${operations.lastSuccessfulReview}T23:59:59-10:00`);
  const next = new Date(`${operations.nextScheduledReview}T23:59:59-10:00`);
  const stale = new Date(operations.staleAfter);
  if ([reviewed, next, stale].some((date) => Number.isNaN(date.getTime()))) errors.push(`${record.id}: invalid operating date`);
  if (next <= reviewed) errors.push(`${record.id}: next review does not follow last successful review`);
  if (stale <= next) errors.push(`${record.id}: stale deadline must follow the scheduled review date`);
  if (!Number.isNaN(now.getTime()) && now > stale) errors.push(`${record.id}: stale after ${operations.staleAfter}; record a new successful review before release`);
}

const manifest = {
  schema: 'aloha-ai-monitor-operations/1.0',
  asOf: now.toISOString(),
  policy: 'Maintained means manually reviewed only against the named source set and jurisdiction. It does not mean continuous retrieval, automatic alerts, legal advice, or comprehensive coverage.',
  counts: {
    monitorRecords: records.length,
    maintainedBetas: maintained.length,
    datedDemonstrations: records.length - maintained.length,
    errors: errors.length
  },
  maintained: maintained.map((record) => ({
    id: record.id,
    version: record.monitorOperations.version,
    owner: record.monitorOperations.owner,
    reviewer: record.monitorOperations.reviewer,
    jurisdiction: record.monitorOperations.jurisdiction,
    scope: record.monitorOperations.scope,
    cadence: record.monitorOperations.cadence,
    lastSuccessfulReview: record.monitorOperations.lastSuccessfulReview,
    nextScheduledReview: record.monitorOperations.nextScheduledReview,
    staleAfter: record.monitorOperations.staleAfter,
    staleBehavior: record.monitorOperations.staleBehavior,
    failureBehavior: record.monitorOperations.failureBehavior,
    correctionPolicy: record.monitorOperations.correctionPolicy,
    requiredSources: record.monitorOperations.sourceAuthorities.map(({ name, url, authority }) => ({ name, url, authority })),
    runs: record.monitorOperations.runHistory,
    corrections: record.monitorOperations.corrections
  })),
  demonstrationIds: records.filter((record) => !maintainedIds.has(record.id)).map((record) => record.id),
  errors
};

fs.mkdirSync('api', { recursive: true });
fs.writeFileSync('api/monitor-operations.json', `${JSON.stringify(manifest, null, 2)}\n`);

if (errors.length) {
  console.error(`Monitor operations failed with ${errors.length} error(s).`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`Monitor operations passed for ${maintained.length} maintained betas; ${records.length - maintained.length} demonstrations remain unmaintained.`);

function read(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}
