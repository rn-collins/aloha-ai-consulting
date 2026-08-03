import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';

const root = process.cwd();
const out = path.join(root, 'artifacts', 'products', 'five-domain-knowledge-base', '2026.08.0');
fs.mkdirSync(out, { recursive: true });
const write = (name, value) => fs.writeFileSync(path.join(out, name), value.endsWith('\n') ? value : `${value}\n`);
const json = (name, value) => write(name, JSON.stringify(value, null, 2));

const handbook = `# Five-Domain Knowledge Base

Version 2026.08.0 · source-review cutoff 2026-08-03 · frozen pre-release package

## What this is

A file-based implementation system for producing evidence-aware content from approved organizational knowledge. It separates source material, bounded claims, voice rules, audience context, and approved examples so a human reviewer can trace what a model used and decide what may be published.

It is not a legal, medical, scientific, security, or compliance assurance system. It does not make a model reliable by itself. Human review remains required for consequential or public output.

## The five domains

1. **Evidence** stores source records, retrieval dates, rights notes, and excerpts or summaries.
2. **Claims** stores the smallest publishable propositions, their authority, status, limitations, and approval.
3. **Voice** stores tone, terminology, structural preferences, prohibited habits, and review rules.
4. **Audience** stores reader context, task, prior knowledge, accessibility needs, and risk of misunderstanding.
5. **Examples** stores approved outputs and counterexamples with annotations explaining why they are safe or unsafe.

Each record has a stable ID. Files use lowercase kebab-case. A claim can be used only when its source IDs resolve, its status is current or explicitly historical, and its approval state permits the intended channel.

## Empty-directory setup

1. Copy \`worked-example/empty-starter\` into a new directory.
2. Add source records first; never begin with an uncited claim.
3. Create atomic claim records and connect each one to at least one source ID.
4. Complete the voice and audience records for the intended output.
5. Select an approved example with a similar task, if one exists.
6. Run \`node validate-example.js\` from the worked-example directory.
7. Use a prompt from \`prompts.txt\`; provide only the required record IDs.
8. Reconcile every drafted sentence against the claim ledger and record the human decision.

## File and provenance rules

- IDs are immutable; corrections create a new version and a changelog entry.
- Direct quotation requires quotation marks, pinpoint location, and rights status.
- Paraphrases must not exceed the source's scope or certainty.
- Unknown, disputed, proposed, superseded, and withdrawn claims remain explicitly labeled.
- The reviewer records approve, revise, reject, or escalate. Silence is not approval.
- Personal or confidential information must not enter the knowledge base unless authorized and minimized.

## Operating workflow

Ingest sources; normalize records; validate schemas; select current approved claims; draft with an indexed prompt; reconcile sentences to claims; perform audience, accessibility, rights, and professional-boundary review; approve or reject; archive the decision record.

## When to hire help

Use the package internally for low-risk, bounded production when your team owns the sources and can review every output. Hire qualified legal, scientific, regulatory, security, accessibility, or implementation help when the output affects rights, safety, regulated conduct, high-stakes decisions, custom integrations, sensitive data, or an authority you cannot independently verify.

## Accessibility

All source formats are text-readable. Tables use descriptive headers. The DOCX template uses heading styles. The PDF is a convenience rendering; use the Markdown source when reflow or assistive-technology behavior is preferable.

## First-use acceptance

The worked example is complete when its schemas validate, every published sentence maps to an approved claim, all five domains are indexed, and the human review record is complete. Passing the example demonstrates package coherence only; it does not validate a user's external sources or final output.
`;
write('README.md', handbook);
write('handbook.md', handbook);

const domains = {
  schema: 'five-domain-specification/1.0', version: '2026.08.0',
  domains: [
    {id:'evidence', required:['sourceId','title','publisher','url','retrievedAt','sourceType','rightsStatus','verificationStatus']},
    {id:'claims', required:['claimId','text','sourceIds','status','confidence','limitations','approval']},
    {id:'voice', required:['voiceId','principles','preferredTerms','avoid','reviewRules']},
    {id:'audience', required:['audienceId','task','priorKnowledge','accessNeeds','misunderstandingRisks']},
    {id:'examples', required:['exampleId','task','claimIds','output','annotations','approval']}
  ],
  naming: {files:'lowercase-kebab-case', ids:'domain-prefix plus stable slug', versions:'calendar version', replacement:'never silently overwrite an approved record'}
};
json('five-domain-specification.json', domains);

const schema = (id, required, properties) => ({$schema:'https://json-schema.org/draft/2020-12/schema',$id:id,type:'object',additionalProperties:false,required,properties});
const schemas = {
  source: schema('https://aloha.ai/schemas/source-record.json',['sourceId','title','publisher','url','retrievedAt','sourceType','rightsStatus','verificationStatus'],{
    sourceId:{type:'string',pattern:'^SRC-'},title:{type:'string',minLength:3},publisher:{type:'string'},url:{type:'string',format:'uri'},retrievedAt:{type:'string',format:'date'},sourceType:{enum:['primary','secondary','internal']},rightsStatus:{enum:['link-only','licensed','public-domain','internal-authorized']},verificationStatus:{enum:['current','historical','unverified','superseded']},notes:{type:'string'}}),
  claim: schema('https://aloha.ai/schemas/claim-record.json',['claimId','text','sourceIds','status','confidence','limitations','approval'],{
    claimId:{type:'string',pattern:'^CLM-'},text:{type:'string',minLength:10},sourceIds:{type:'array',minItems:1,items:{type:'string',pattern:'^SRC-'}},status:{enum:['current','historical','proposed','disputed','superseded','withdrawn']},confidence:{enum:['high','medium','low']},limitations:{type:'string',minLength:3},approval:{enum:['approved','revise','reject','escalate']}}),
  review: schema('https://aloha.ai/schemas/review-record.json',['reviewId','outputId','reviewer','reviewedAt','claimIds','decision'],{
    reviewId:{type:'string',pattern:'^REV-'},outputId:{type:'string'},reviewer:{type:'string'},reviewedAt:{type:'string',format:'date'},claimIds:{type:'array',minItems:1,items:{type:'string',pattern:'^CLM-'}},decision:{enum:['approve','revise','reject','escalate']},notes:{type:'string'}})
};
json('record-schemas.json', schemas);

const promptBodies = [
  ['source-intake','Convert a supplied source into a source record. Do not infer missing publisher, date, rights, or verification fields; mark them for human completion.'],
  ['claim-extraction','Extract atomic claims from the named source records. Preserve scope, modality, dates, jurisdiction, and uncertainty.'],
  ['claim-reconciliation','Compare a draft sentence by sentence with approved claim records. Return supported, overstated, unsupported, or needs escalation.'],
  ['authority-conflict','Identify conflicts among supplied sources and explain hierarchy, date, jurisdiction, and unresolved uncertainty without choosing silently.'],
  ['voice-brief','Translate the named voice record into a short drafting brief; retain all prohibited habits and review rules.'],
  ['audience-brief','Translate the audience record into reading level, context, access, and misunderstanding safeguards without stereotyping.'],
  ['outline','Create an outline using only approved claims; list claim IDs beside every section.'],
  ['first-draft','Draft from the approved outline and claims. Append claim IDs to each paragraph and do not add outside facts.'],
  ['plain-language','Rewrite for clarity without changing legal, scientific, quantitative, or temporal meaning; flag any unavoidable precision loss.'],
  ['accessibility-review','Review headings, link language, table structure, reading order, jargon, and alternatives; do not claim formal conformance.'],
  ['rights-review','List quotations, images, datasets, and third-party material requiring rights confirmation; do not infer permission.'],
  ['citation-review','Check whether each citation resolves to a supplied source and supports the adjacent claim; require human verification.'],
  ['counterexample','Create a deliberately unsafe counterexample from the same records and annotate every failure for training use only.'],
  ['example-annotation','Explain why an approved example works by mapping its sentences to claims, voice rules, and audience needs.'],
  ['update-impact','Given a superseded source, identify dependent claims and outputs that require review; do not update them automatically.'],
  ['change-log','Draft a changelog from approved record differences, distinguishing corrections, source updates, and editorial changes.'],
  ['decision-record','Create a review record capturing evidence used, unresolved issues, reviewer, decision, and next action.'],
  ['high-stakes-escalation','Detect legal, medical, safety, financial, privacy, security, or regulated-conduct implications and route to qualified review.'],
  ['final-preflight','Run the package preflight: sources, claims, voice, audience, examples, rights, accessibility, dates, limitations, and approval.'],
  ['archive-index','Create an index of output, record versions, reviewer decision, and supersession status without modifying source records.']
];
const prompts = promptBodies.map(([id,instruction],i)=>({index:i+1,id:`PRM-${id}`,purpose:id.replaceAll('-',' '),inputs:['named record IDs','intended channel','human reviewer'],instruction,outputContract:'Return structured findings with record IDs, unknowns, and required human decisions.',boundary:'Use only supplied records; no individualized professional advice or assurance.'}));
json('annotated-prompts.json', {schema:'five-domain-prompts/1.0',version:'2026.08.0',count:prompts.length,prompts});
write('prompts.txt', prompts.map(p=>`${p.index}. ${p.id.toUpperCase()}\nPurpose: ${p.purpose}\nInputs: ${p.inputs.join('; ')}\nInstruction: ${p.instruction}\nOutput: ${p.outputContract}\nBoundary: ${p.boundary}`).join('\n\n'));

write('source-ledger.csv', `source_id,title,publisher,url,retrieved_at,source_type,rights_status,verification_status,notes\nSRC-NIST-AIRMF,NIST AI Risk Management Framework,NIST,https://www.nist.gov/itl/ai-risk-management-framework,2026-08-03,primary,link-only,current,Worked-example governance source\nSRC-W3C-WCAG,Web Content Accessibility Guidelines Overview,W3C,https://www.w3.org/WAI/standards-guidelines/wcag/,2026-08-03,primary,link-only,current,Accessibility orientation; conformance not claimed\n`);
write('pricing-ledger.csv', `component,provider,pricing_url,retrieved_at,status,planning_note\nVersion control,GitHub,https://github.com/pricing,2026-08-03,verify-before-purchase,Free and paid plans vary\nDocument storage,Google Workspace,https://workspace.google.com/pricing.html,2026-08-03,verify-before-purchase,Use approved organizational tenant\nModel access,OpenAI API,https://openai.com/api/pricing/,2026-08-03,verify-before-purchase,Usage based; package is provider-neutral\nAutomation,n8n,https://n8n.io/pricing/,2026-08-03,verify-before-purchase,Optional; manual workflow supported\n`);
write('setup-checklist.md', `# Setup checklist\n\n- [ ] Assign accountable owner and human reviewers.\n- [ ] Copy the empty starter; preserve stable IDs and version control.\n- [ ] Approve data classification, privacy, retention, and access rules.\n- [ ] Populate and verify source records before claims.\n- [ ] Validate schemas and resolve every failure.\n- [ ] Configure voice and audience records.\n- [ ] Run the worked example and reconcile every sentence.\n- [ ] Confirm rights, accessibility, professional boundaries, and approvals.\n- [ ] Record source-review cutoff and maintenance state.\n- [ ] Archive the exact records used for every released output.\n`);
write('when-to-hire.md', `# When to hire qualified help\n\nHire a subject-matter professional when authority, safety, rights, regulated conduct, individualized decisions, or technical integrations exceed your review capacity. Hire implementation support for permissions, secrets, production automation, sensitive data, retrieval systems, or audit logging. Hire accessibility expertise before claiming conformance. This package supports internal organization; it does not replace accountable professional judgment.\n`);
write('CHANGELOG.md', `# Changelog\n\n## 2026.08.0 — 2026-08-03\n\n- First frozen pre-release package.\n- Added five-domain specification, three record schemas, twenty annotated prompts, voice template, source and pricing ledgers, setup and hiring guides, and a complete worked example.\n`);
write('LICENSE.md', `# Named-organization internal-use license — pre-release specimen\n\nCopyright 2026 Rayven-Nikkita Collins LLC. No license or purchase is presently offered. When a named-organization license is executed, the licensed organization may use, adapt, train from, and retain its acquired version internally. Resale, public redistribution of source files, removal of notices, and representation as legal, medical, compliance, security, accessibility, or outcome assurance are prohibited. Third-party sources remain under their respective terms. Contracting identity, price, tax, refund, privacy, and support terms must be supplied at acquisition.\n`);
write('RIGHTS-AND-ATTRIBUTION.md', `# Rights and attribution\n\nPackage-authored text and original schemas: Rayven-Nikkita Collins LLC, 2026. External materials are referenced by link and are not redistributed. NIST and W3C entries in the worked example are used as link-only source records. Users must verify third-party rights before copying excerpts, images, datasets, or proprietary material into their implementation.\n`);
write('SUPPORT-AND-MAINTENANCE.md', `# Support and maintenance\n\nState: frozen pre-release; unavailable for acquisition. Source-review cutoff: 2026-08-03. No continuing updates, support response time, refund right, or redelivery entitlement is offered before commercial release. A future release must state the support channel, response target, maintenance window, correction notices, update entitlement, and supersession terms. Material safety, authority, calculation, rights, or security defects require withdrawal or conspicuous correction; silent replacement is prohibited.\n`);
write('ACCESSIBILITY.md', `# Accessibility note\n\nMarkdown, text, CSV, and JSON sources are included for reflow and machine readability. The DOCX uses semantic heading styles; the PDF is secondary. Color is not used as the only signal. This review does not claim WCAG conformance; test the final files with relevant assistive technology and users before making such a claim.\n`);

write('voice-template.md', `# Voice configuration template\n\n## Identity and purpose\nOrganization:\nAudience-facing purpose:\nAccountable owner:\n\n## Principles\n- Sound like:\n- Never sound like:\n- Preferred sentence and paragraph rhythm:\n\n## Terminology\nPreferred terms:\nTerms requiring definition:\nTerms to avoid and why:\n\n## Evidence behavior\nCitation style:\nHow to express uncertainty:\nHow to handle missing or conflicting authority:\n\n## Structural preferences\nOpening pattern:\nHeading pattern:\nCTA boundary:\n\n## Prohibited habits\nNo invented quotations, unsupported certainty, fake consensus, individualized professional advice, guaranteed outcomes, or hidden source substitution.\n\n## Review rules\nRequired reviewer:\nEscalation triggers:\nApproval record location:\n`);

const worked = path.join(out,'worked-example'); fs.mkdirSync(path.join(worked,'empty-starter','evidence'),{recursive:true});
for (const d of ['claims','voice','audience','examples','reviews']) fs.mkdirSync(path.join(worked,'empty-starter',d),{recursive:true});
const exampleRecords = {
  'source-record.json':{sourceId:'SRC-NIST-AIRMF',title:'NIST AI Risk Management Framework',publisher:'NIST',url:'https://www.nist.gov/itl/ai-risk-management-framework',retrievedAt:'2026-08-03',sourceType:'primary',rightsStatus:'link-only',verificationStatus:'current',notes:'Used to support a bounded governance statement.'},
  'claim-record.json':{claimId:'CLM-GOV-001',text:'The NIST AI RMF is a voluntary framework for managing AI risks.',sourceIds:['SRC-NIST-AIRMF'],status:'current',confidence:'high',limitations:'Does not establish legal compliance or certify a particular system.',approval:'approved'},
  'review-record.json':{reviewId:'REV-DEMO-001',outputId:'OUT-DEMO-001',reviewer:'Example human reviewer',reviewedAt:'2026-08-03',claimIds:['CLM-GOV-001'],decision:'approve',notes:'Approved only as a dated worked example.'}
};
for (const [name,data] of Object.entries(exampleRecords)) json(path.join('worked-example',name),data);
json(path.join('worked-example','voice-record.json'),{voiceId:'VOC-ALOHA-001',principles:['plain language','bounded confidence','evidence beside claims'],preferredTerms:['AI system','evidence record'],avoid:['guaranteed','fully compliant'],reviewRules:['human approval before publication']});
json(path.join('worked-example','audience-record.json'),{audienceId:'AUD-OPS-001',task:'Understand why claim records precede drafting',priorKnowledge:'General workplace AI familiarity',accessNeeds:['plain language','descriptive headings'],misunderstandingRisks:['mistaking a voluntary framework for legal compliance']});
json(path.join('worked-example','example-record.json'),{exampleId:'EX-GOV-001',task:'Explain the bounded role of the NIST AI RMF',claimIds:['CLM-GOV-001'],output:'The NIST AI Risk Management Framework is a voluntary framework for managing AI risks. Using it does not by itself establish legal compliance or certify a system.',annotations:['Sentence one maps to CLM-GOV-001.','Sentence two preserves the claim limitation.'],approval:'approved'});
write(path.join('worked-example','INDEX.md'),`# Worked example index\n\nEvidence: SRC-NIST-AIRMF · Claim: CLM-GOV-001 · Voice: VOC-ALOHA-001 · Audience: AUD-OPS-001 · Example: EX-GOV-001 · Review: REV-DEMO-001. The example demonstrates all five domains plus the human review record.\n`);
write(path.join('worked-example','validate-example.js'),`import fs from 'node:fs';\nconst required=['source-record.json','claim-record.json','voice-record.json','audience-record.json','example-record.json','review-record.json'];\nfor(const f of required){JSON.parse(fs.readFileSync(new URL(f,import.meta.url),'utf8'));}\nconst claim=JSON.parse(fs.readFileSync(new URL('claim-record.json',import.meta.url)));\nconst source=JSON.parse(fs.readFileSync(new URL('source-record.json',import.meta.url)));\nif(!claim.sourceIds.includes(source.sourceId)||claim.approval!=='approved') throw new Error('Claim provenance or approval failed');\nconsole.log('Worked example: six records parse; claim provenance and approval pass.');\n`);

execFileSync('pandoc',['handbook.md','-o','five-domain-knowledge-base-handbook.pdf','--metadata','title=Five-Domain Knowledge Base'],{cwd:out});
execFileSync('pandoc',['voice-template.md','-o','voice-configuration-template.docx'],{cwd:out});

const exclude = new Set(['manifest.json','five-domain-knowledge-base-2026.08.0.zip']);
const walk = (dir, prefix='') => fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(dir,e.name),path.join(prefix,e.name)):[path.join(prefix,e.name)]);
const fileNames = walk(out).filter(n=>!exclude.has(n)).sort();
const files = fileNames.map(name=>{const data=fs.readFileSync(path.join(out,name));return {path:name,bytes:data.length,sha256:crypto.createHash('sha256').update(data).digest('hex')};});
const manifest = {schema:'five-domain-release-manifest/1.0',artifactId:'trust-stack-ai-content-system',artifactName:'Five-Domain Knowledge Base',version:'2026.08.0',releaseDate:null,state:'frozen-pre-release',sourceReviewCutoff:'2026-08-03',licenseId:'named-organization-internal-use-pre-release-specimen',maintenanceState:'frozen-version',supportState:'not-offered-before-release',files,contents:['five-domain specification','file and provenance rules','20 annotated prompts','voice template','claim and source records','setup checklist','pricing ledger','when-to-hire guide','worked example'],changelog:'CHANGELOG.md',boundary:'Package completeness does not make acquisition available; checkout and fulfillment remain unimplemented.'};
json('manifest.json',manifest);
execFileSync('zip',['-qr','five-domain-knowledge-base-2026.08.0.zip','.', '-x','five-domain-knowledge-base-2026.08.0.zip'],{cwd:out});
console.log(`Built Five-Domain Knowledge Base ${manifest.version}: ${files.length} checksum-backed files.`);
