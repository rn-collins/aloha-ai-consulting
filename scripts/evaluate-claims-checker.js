import fs from 'node:fs';

const evaluation = read('content/evaluations/claims-checker.json');
const tools = read('content/tools/operational-tools.json');
const tool = tools.find((item) => item.id === evaluation.canonicalId);
if (!tool) throw new Error('Claims Checker canonical tool record is missing.');
const signals = tool.demo?.signals || [];
if (signals.length !== 5 || signals.some((item) => !item.risk || !item.regulator || !item.question)) throw new Error('Claims Checker rules diverge from evaluated five-category contract 1.1.0.');

const results = evaluation.cases.map((testCase) => {
  const observedCategories = signals.filter((signal) => signal.terms.some((term) => found(testCase.input, term))).map((signal) => signal.label);
  const expected = [...testCase.expectedCategories].sort();
  const observed = [...observedCategories].sort();
  const passed = JSON.stringify(expected) === JSON.stringify(observed);
  return { id: testCase.id, class: testCase.class, expectedCategories: expected, observedCategories: observed, abstained: observed.length === 0, passed };
});
const failures = results.filter((item) => !item.passed);
const classes = [...new Set(evaluation.cases.map((item) => item.class))];
const perClass = Object.fromEntries(classes.map((name) => {
  const rows = results.filter((item) => item.class === name);
  return [name, { cases: rows.length, passed: rows.filter((item) => item.passed).length, recall: rows.filter((item) => item.passed).length / rows.length }];
}));
const unexpectedCategoryFlags = results.reduce((total, result) => total + result.observedCategories.filter((label) => !result.expectedCategories.includes(label)).length, 0);
const falseClearances = results.filter((result) => result.expectedCategories.length && !result.observedCategories.length).length;
const abstentionCases = evaluation.cases.filter((item) => item.abstention);
const correctAbstentions = results.filter((result) => abstentionCases.some((item) => item.id === result.id) && result.abstained).length;
const accuracy = (results.length - failures.length) / results.length;
const abstentionAccuracy = correctAbstentions / abstentionCases.length;
const thresholdPassed = accuracy >= evaluation.decisionThreshold.requiredCaseAccuracy
  && Object.values(perClass).every((item) => item.recall >= evaluation.decisionThreshold.requiredPerClassRecall)
  && unexpectedCategoryFlags <= evaluation.decisionThreshold.maximumUnexpectedCategoryFlags
  && falseClearances <= evaluation.decisionThreshold.maximumFalseClearances
  && abstentionAccuracy >= evaluation.decisionThreshold.requiredAbstentionAccuracy
  && Boolean(evaluation.jurisdictionPolicyBoundary && evaluation.prohibitedInference);
const report = {
  ...Object.fromEntries(['schema','evaluationId','canonicalId','toolVersion','methodVersion','corpusVersion','evaluatedAt','owner','reviewer','scope','jurisdictionPolicyBoundary','prohibitedInference','decisionThreshold','authorityRecord'].map((key) => [key, evaluation[key]])),
  metrics: { totalCases: results.length, passedCases: results.length - failures.length, failedCases: failures.length, accuracy, perClass, abstentionCases: abstentionCases.length, correctAbstentions, abstentionAccuracy, unexpectedCategoryFlags, falseClearances },
  decision: thresholdPassed ? 'passed-limited-lexical-screening-scope' : 'rejected',
  knownLimitations: evaluation.knownLimitations,
  retestTrigger: evaluation.retestTrigger,
  results
};
fs.mkdirSync('api/evaluations', { recursive: true });
fs.writeFileSync('api/evaluations/claims-checker.json', `${JSON.stringify(report, null, 2)}\n`);
if (!thresholdPassed || failures.length) {
  console.error(`Claims Checker evaluation rejected: ${failures.length} case failures; ${falseClearances} false clearances; ${unexpectedCategoryFlags} unexpected category flags.`);
  process.exit(1);
}
console.log(`Claims Checker bounded evaluation passed: ${results.length}/${results.length} cases; ${correctAbstentions}/${abstentionCases.length} abstentions; 0 false clearances.`);

function found(text, term) {
  const escaped = String(term).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const left = /^[a-z0-9]/i.test(term) ? '\\b' : '';
  const right = /[a-z0-9]$/i.test(term) ? '\\b' : '';
  return new RegExp(`${left}${escaped}${right}`, 'i').test(text);
}
function read(file) { return JSON.parse(fs.readFileSync(file, 'utf8')); }
