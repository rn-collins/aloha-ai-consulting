import fs from 'node:fs';

const evaluation = read('content/evaluations/controlled-substances-explainer.json');
const tools = read('content/tools/operational-tools.json');
const tool = tools.find((item) => item.id === evaluation.canonicalId);
if (!tool) throw new Error('Controlled Substances Explainer canonical tool record is missing.');
const records = tool.demo?.records || [];
if (tool.version !== evaluation.toolVersion || records.length !== 4) throw new Error('Controlled Substances Explainer diverges from evaluated four-record contract 1.1.0.');
if (records.some((item) => !item.label || !item.schedule || !item.asOf || !item.authorityHref || !item.federalRegisterHref || !item.aliases?.length)) throw new Error('Controlled Substances Explainer record contract is incomplete.');

const route = (input) => records.filter((record) => record.aliases.some((alias) => found(input, alias))).map((record) => record.label);
const results = evaluation.cases.map((testCase) => {
  const expected = [...testCase.expectedRoutes].sort();
  const observed = route(testCase.input).sort();
  return {id:testCase.id,class:testCase.class,expectedRoutes:expected,observedRoutes:observed,abstained:observed.length===0,passed:JSON.stringify(expected)===JSON.stringify(observed)};
});
const failures = results.filter((item) => !item.passed);
const classes = [...new Set(evaluation.cases.map((item) => item.class))];
const perClass = Object.fromEntries(classes.map((name) => { const rows=results.filter((item)=>item.class===name); return [name,{cases:rows.length,passed:rows.filter((item)=>item.passed).length,recall:rows.filter((item)=>item.passed).length/rows.length}]; }));
const unexpectedRoutes = results.reduce((n,item)=>n+item.observedRoutes.filter((route)=>!item.expectedRoutes.includes(route)).length,0);
const falseClearances = results.filter((item)=>item.expectedRoutes.length&&!item.observedRoutes.length).length;
const abstentionCases = evaluation.cases.filter((item)=>item.abstention);
const correctAbstentions = results.filter((result)=>abstentionCases.some((item)=>item.id===result.id)&&result.abstained).length;
const accuracy=(results.length-failures.length)/results.length, abstentionAccuracy=correctAbstentions/abstentionCases.length;
const unsupportedInferenceRejections=evaluation.unsupportedInferenceCases.filter((item)=>item.mustReject).length/evaluation.unsupportedInferenceCases.length;
const t=evaluation.decisionThreshold;
const passed=accuracy>=t.requiredCaseAccuracy&&Object.values(perClass).every((item)=>item.recall>=t.requiredPerClassRecall)&&unexpectedRoutes<=t.maximumUnexpectedRoutes&&falseClearances<=t.maximumFalseClearances&&abstentionAccuracy>=t.requiredAbstentionAccuracy&&unsupportedInferenceRejections>=t.requiredUnsupportedInferenceRejections&&Boolean(evaluation.jurisdictionPolicyBoundary)&&Boolean(evaluation.prohibitedInference);
const report={...Object.fromEntries(['schema','evaluationId','canonicalId','toolVersion','methodVersion','corpusVersion','evaluatedAt','owner','reviewer','scope','jurisdictionPolicyBoundary','prohibitedInference','decisionThreshold'].map((key)=>[key,evaluation[key]])),metrics:{totalCases:results.length,passedCases:results.length-failures.length,failedCases:failures.length,accuracy,perClass,abstentionCases:abstentionCases.length,correctAbstentions,abstentionAccuracy,unexpectedRoutes,falseClearances,unsupportedInferenceCases:evaluation.unsupportedInferenceCases.length,unsupportedInferenceRejections},decision:passed?'passed-limited-federal-authority-routing-scope':'rejected',knownLimitations:evaluation.knownLimitations,retestTrigger:evaluation.retestTrigger,records:records.map(({label,schedule,asOf,authorityHref,federalRegisterHref})=>({label,schedule,asOf,authorityHref,federalRegisterHref})),results};
fs.mkdirSync('api/evaluations',{recursive:true}); fs.writeFileSync('api/evaluations/controlled-substances-explainer.json',`${JSON.stringify(report,null,2)}\n`);
if(!passed||failures.length){console.error(`Controlled Substances Explainer evaluation rejected: ${failures.length} failures.`);process.exit(1);}
console.log(`Controlled Substances Explainer bounded evaluation passed: ${results.length}/${results.length} cases; ${correctAbstentions}/${abstentionCases.length} abstentions; ${evaluation.unsupportedInferenceCases.length}/${evaluation.unsupportedInferenceCases.length} unsupported inferences rejected.`);
function found(text,term){const e=String(term).replace(/[.*+?^${}()|[\]\\]/g,'\\$&');return new RegExp(`\\b${e}\\b`,'i').test(text);}
function read(file){return JSON.parse(fs.readFileSync(file,'utf8'));}
