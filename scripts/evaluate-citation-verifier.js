import fs from 'node:fs';

const evaluation = JSON.parse(fs.readFileSync('content/evaluations/citation-verifier.json', 'utf8'));
const reporters = new Set(['U.S.', 'S. Ct.', 'L. Ed.', 'F.', 'F.2d', 'F.3d', 'F.4th', 'F. Supp.', 'F. Supp. 2d', 'F. Supp. 3d']);
const citationPattern = /\b(\d{1,4})\s+(U\.S\.|S\. Ct\.|L\. Ed\.|F\.|F\.2d|F\.3d|F\.4th|F\.4d|F\. Supp\.(?:\s+(?:2d|3d|4th|5th))?)\s+(\d{1,5})(?:[^()]{0,80})?\((\d{4})\)/g;
const evaluationYear = new Date(`${evaluation.evaluatedAt}T00:00:00Z`).getUTCFullYear();

const results = evaluation.cases.map((testCase) => {
  const rows = parse(testCase.input);
  const observed = { detected: rows.length, flagged: rows.filter((row) => row.issues.length).length };
  const passed = observed.detected === testCase.expected.detected && observed.flagged === testCase.expected.flagged;
  return { id: testCase.id, class: testCase.class, expected: testCase.expected, observed, passed, rows };
});

const inScope = evaluation.cases.filter((item) => !item.outOfScope);
const inScopeResults = results.filter((result) => inScope.some((item) => item.id === result.id));
const failed = results.filter((result) => !result.passed);
const highConsequenceFalsePasses = results.filter((result) => {
  const source = evaluation.cases.find((item) => item.id === result.id);
  return !result.passed && source.expected.flagged > result.observed.flagged;
}).length;
const inScopeCaseAccuracy = inScopeResults.filter((item) => item.passed).length / inScopeResults.length;
const thresholdPassed = inScopeCaseAccuracy >= evaluation.decisionThreshold.requiredInScopeCaseAccuracy
  && highConsequenceFalsePasses <= evaluation.decisionThreshold.maximumHighConsequenceFalsePasses
  && Boolean(evaluation.prohibitedInference);
const decision = thresholdPassed ? 'passed-limited-structural-scope' : 'rejected';

const report = {
  schema: evaluation.schema,
  evaluationId: evaluation.evaluationId,
  canonicalId: evaluation.canonicalId,
  toolVersion: evaluation.toolVersion,
  methodVersion: evaluation.methodVersion,
  corpusVersion: evaluation.corpusVersion,
  evaluatedAt: evaluation.evaluatedAt,
  reviewer: evaluation.reviewer,
  scope: evaluation.scope,
  prohibitedInference: evaluation.prohibitedInference,
  decisionThreshold: evaluation.decisionThreshold,
  metrics: {
    totalCases: results.length,
    inScopeCases: inScopeResults.length,
    outOfScopeCases: results.length - inScopeResults.length,
    passedCases: results.length - failed.length,
    failedCases: failed.length,
    inScopeCaseAccuracy,
    highConsequenceFalsePasses
  },
  decision,
  knownLimitations: evaluation.knownLimitations,
  retestTrigger: evaluation.retestTrigger,
  results
};

fs.mkdirSync('api/evaluations', { recursive: true });
fs.writeFileSync('api/evaluations/citation-verifier.json', `${JSON.stringify(report, null, 2)}\n`);
if (!thresholdPassed || failed.length) {
  console.error(`Citation Verifier evaluation rejected: ${failed.length} case failures; ${highConsequenceFalsePasses} high-consequence false passes.`);
  process.exit(1);
}
console.log(`Citation Verifier evaluation passed within structural scope: ${results.length}/${results.length} cases; ${highConsequenceFalsePasses} high-consequence false passes.`);

function parse(text) {
  const rows = [];
  citationPattern.lastIndex = 0;
  let match;
  while ((match = citationPattern.exec(text))) {
    const reporter = match[2].replace(/\s+/g, ' ').trim();
    const issues = [];
    if (!reporters.has(reporter)) issues.push('Reporter series is not recognized');
    if (Number(match[1]) < 1 || Number(match[3]) < 1) issues.push('Volume or page is malformed');
    if (Number(match[4]) > evaluationYear) issues.push('Year is in the future');
    rows.push({ citation: match[0].trim(), issues });
  }
  return rows;
}
