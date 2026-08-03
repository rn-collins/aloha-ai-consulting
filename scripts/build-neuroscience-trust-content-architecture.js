import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';

const root=process.cwd();
const out=path.join(root,'artifacts','products','neuroscience-trust-content-architecture','2026.08.0');
fs.mkdirSync(out,{recursive:true});
const write=(name,value)=>{const target=path.join(out,name);fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,value.endsWith('\n')?value:`${value}\n`);};
const json=(name,value)=>write(name,JSON.stringify(value,null,2));

const boundary=`EDSA is an editorial decision architecture. It cannot diagnose a nervous system, predict an individual's response, establish scientific causation, guarantee trust, guarantee platform distribution, or replace legal, medical, scientific, accessibility, or platform-policy review.`;
const handbook=`# Neuroscience-of-Trust Content Architecture

Version 2026.08.0 · source-review cutoff 2026-08-03 · frozen pre-release

## What this package does

EDSA helps a human editor make two appraisals before publishing: what an audience needs to evaluate a message without coercion, and what a platform may need to classify and distribute it. Those appraisals are related but not interchangeable. The method converts them into four observable editorial moves: Evidence, Discussion, Self-Determination, and Action.

${boundary}

## Dual appraisal

Audience appraisal asks whether the opening creates intelligibility or avoidable threat; whether evidence is inspectable; whether uncertainty is proportionate; whether the audience retains choice; and whether the requested action is reversible and bounded. Platform appraisal asks whether the content is eligible, understandable outside the creator's network, internally coherent across text and media, relevant to likely viewers, and free of policy or quality signals that may limit recommendation. Platform documentation describes inputs and eligibility rules, not a reliable recipe for reach.

## EDSA

1. **Evidence** — name the proposition, show the best available authority beside it, preserve date, scope, and uncertainty, and distinguish observation from inference.
2. **Discussion** — explain competing interpretations, mechanism limits, context, and what would change the conclusion. Do not manufacture balance where evidence is one-sided.
3. **Self-Determination** — return choice to the audience: identify who the content is for, offer a pause or exit, disclose material interests, and avoid shame, urgency, or identity pressure.
4. **Action** — request one proportionate, specific, reversible next step. State what the action cannot establish and who must review consequential decisions.

## Five hard-never rules

1. Never label an emotional response as a diagnosis or claim to regulate a viewer's nervous system.
2. Never convert a neuroscience association into a causal promise about trust, attention, memory, persuasion, or behavior.
3. Never imply that a format, hook, retention tactic, or policy-compliant post is guaranteed distribution.
4. Never hide uncertainty, sponsorship, material interest, eligibility limits, or a consequential professional boundary.
5. Never use fear, shame, manufactured urgency, identity threat, or false scarcity to remove meaningful audience choice.

## Operating sequence

Start with the content brief and claim map. Complete the dual-appraisal crosswalk. Draft the twelve-minute spine or a shorter proportionate variant. Run all four EDSA passes. Check the five hard-never rules. Verify every platform statement against its dated source record. Ask a human reviewer to record approve, revise, reject, or escalate. Archive the exact version used.

## Evaluation, not prediction

Measure observable editorial properties: source resolution, claim fidelity, uncertainty, choice-preserving language, context, accessibility, policy status, and a bounded CTA. Post-publication analytics may describe what happened for that content and audience. They do not prove why it happened, predict an individual response, or validate a neuroscience mechanism.

## When to hire help

Use qualified scientific review for mechanism claims; legal or regulatory review for regulated or consequential statements; accessibility expertise before claiming conformance; clinical review before discussing individual symptoms or treatment; and platform counsel or current first-party policy documentation when eligibility matters. The package is an editorial aid, not professional advice or assurance.
`;
write('README.md',handbook);write('handbook.md',handbook);

const claims=[
 {id:'SCI-001',claim:'People evaluate significance for well-being and available coping in context; this is a theoretical appraisal model, not a diagnostic test.',status:'bounded-theory',sourceIds:['SRC-LAZARUS-1991'],allowedUse:'Explain why context, stakes, and perceived options matter to message evaluation.',prohibitedUse:'Predict an individual emotional or physiological response.'},
 {id:'SCI-002',claim:'Acute stress can affect prefrontal cognitive functions; effects depend on timing, intensity, task, and individual context.',status:'bounded-review',sourceIds:['SRC-ARSTEN-2009'],allowedUse:'Support reducing avoidable cognitive load and coercive urgency.',prohibitedUse:'Claim a particular hook shuts down the prefrontal cortex.'},
 {id:'SCI-003',claim:'Perceived control is associated with stress-related behavioral and neural processes in experimental literature.',status:'bounded-review',sourceIds:['SRC-MAier-SELIGMAN-2016'],allowedUse:'Support choice-preserving editorial design as a humane design principle.',prohibitedUse:'Promise that giving options will regulate or heal a viewer.'},
 {id:'SCI-004',claim:'Trust is multidimensional and context-dependent; no single neurobiological signal measures whether a person should trust a message.',status:'bounded-inference',sourceIds:['SRC-BAUMGARTNER-2008','SRC-BELLUCCI-2020'],allowedUse:'Explain why evidence, incentives, uncertainty, and choice must remain visible.',prohibitedUse:'Use oxytocin, amygdala, or reward language as a trust score.'}
];
json('scientific-claim-map.json',{schema:'edsa-scientific-claim-map/1.0',version:'2026.08.0',sourceReviewCutoff:'2026-08-03',boundary,claims});
write('scientific-references.md',`# Scientific references and use boundary

Source-review cutoff: 2026-08-03. Verification status applies to this package review, not perpetual currency.

- SRC-LAZARUS-1991 — Lazarus, R. S. *Emotion and Adaptation*. Oxford University Press, 1991. Theoretical primary work. Status: verified bibliographic record.
- SRC-ARSTEN-2009 — Arnsten, A. F. T. “Stress signalling pathways that impair prefrontal cortex structure and function.” *Nature Reviews Neuroscience* 10, 410–422 (2009). DOI: 10.1038/nrn2648. Status: verified review.
- SRC-MAier-SELIGMAN-2016 — Maier, S. F., and Seligman, M. E. P. “Learned helplessness at fifty.” *Psychological Review* 123(4), 349–367 (2016). DOI: 10.1037/rev0000033. Status: verified review/theory update.
- SRC-BAUMGARTNER-2008 — Baumgartner et al. “Oxytocin shapes the neural circuitry of trust and trust adaptation in humans.” *Neuron* 58(4), 639–650 (2008). DOI: 10.1016/j.neuron.2008.04.009. Status: verified experimental article; narrow task context.
- SRC-BELLUCCI-2020 — Bellucci et al. “The neuroscience of trust.” *Neuroscience & Biobehavioral Reviews* 109, 121–133 (2020). DOI: 10.1016/j.neubiorev.2019.12.019. Status: verified review.

These sources support bounded background propositions only. They do not validate EDSA as a clinical, psychometric, causal, or distribution-prediction instrument.
`);

const crosswalk=`audience_question,audience_evidence,editorial_move,platform_question,platform_source_id,platform_status,prohibited_inference
Can the audience identify the claim and stakes?,Named proposition plus context,Evidence,Can the system and viewer identify the topic and relevance?,PLAT-LINKEDIN-SUGGESTED,current,Clear context does not guarantee recommendation
Can the audience inspect authority and date?,Resolvable source and retrieval date,Evidence,Is the content eligible under applicable recommendation and safety rules?,PLAT-META-RECOMMEND,current,Eligibility does not guarantee reach
Are alternatives and uncertainty visible?,Competing explanations and limits,Discussion,Do text media and topic cohere for an outside audience?,PLAT-LINKEDIN-SUGGESTED,current,Coherence does not prove quality or reach
Does the audience retain meaningful choice?,Noncoercive language pause and exit,Self-Determination,Can negative feedback and user preferences affect personalization?,PLAT-TIKTOK-FYF,current,No editor can predict a particular user's ranking
Is the next step proportionate and reversible?,One bounded CTA with escalation rule,Action,Are engagement and satisfaction signals among recommendation inputs?,PLAT-YOUTUBE-RECS,current,Engagement tactics do not guarantee distribution
`;
write('dual-appraisal-crosswalk.csv',crosswalk);

const policies=[
 {platform:'YouTube',sourceId:'PLAT-YOUTUBE-RECS',title:'How YouTube recommendations work',url:'https://support.google.com/youtube/answer/16089387',retrievedAt:'2026-08-03',status:'current',boundedStatement:'Recommendations are personalized from multiple signals and context; the documentation does not promise distribution for a particular editorial format.'},
 {platform:'Instagram / Facebook',sourceId:'PLAT-META-RECOMMEND',title:'Recommendation Guidelines',url:'https://transparency.meta.com/policies/community-standards/recommendation-guidelines/',retrievedAt:'2026-08-03',status:'current',boundedStatement:'Content may be allowed yet ineligible for recommendation; eligibility does not guarantee recommendation or reach.'},
 {platform:'TikTok',sourceId:'PLAT-TIKTOK-FYF',title:'How TikTok recommends videos #ForYou',url:'https://newsroom.tiktok.com/en-us/how-tiktok-recommends-videos-for-you',retrievedAt:'2026-08-03',status:'current',boundedStatement:'The For You feed ranks from multiple user-interaction, video-information, and device/account factors; no single factor or format guarantees distribution.'},
 {platform:'LinkedIn',sourceId:'PLAT-LINKEDIN-SUGGESTED',title:'Suggested posts in feed',url:'https://www.linkedin.com/help/linkedin/answer/a1499047',retrievedAt:'2026-08-03',status:'current',boundedStatement:'Suggested content is evaluated for professional relevance, quality, context beyond the poster network, topical coherence, promotion, and feedback; suggestion is not guaranteed.'}
];
json('platform-policy-ledger.json',{schema:'edsa-platform-policy-ledger/1.0',sourceReviewCutoff:'2026-08-03',reviewCadence:'Reverify before each consequential use and at least quarterly.',policies});
write('platform-policy-ledger.md',`# Dated platform-policy ledger\n\n${policies.map(p=>`## ${p.platform}\n\n- Source: [${p.title}](${p.url})\n- Retrieved: ${p.retrievedAt}\n- Status: ${p.status}\n- Bounded statement: ${p.boundedStatement}`).join('\n\n')}\n\nPlatform rules and ranking systems change. Reverify the linked first-party source before use. Never represent this ledger as a distribution formula.\n`);

const examples=[
 {id:'EX-01',title:'AI governance invitation',before:'Your company is already behind on AI. Book a call now before your competitors make you irrelevant.',after:'If your team is deciding where AI belongs, begin with one workflow, its evidence, its owner, and its stop conditions. The linked checklist shows the review sequence; a call is optional.',decisions:['Evidence: replaces an unsupported competitive threat with a defined operating problem.','Discussion: names the four decision dimensions.','Self-Determination: removes shame and makes contact optional.','Action: offers one inspectable, reversible next step.']},
 {id:'EX-02',title:'Health-science explainer',before:'This brain hack calms your nervous system in sixty seconds.',after:'A slower exhale is used in some paced-breathing practices, but responses vary and this is not treatment. If breathing exercises feel uncomfortable, stop; seek qualified care for symptoms or urgent concerns.',decisions:['Evidence: removes an uncited causal guarantee.','Discussion: preserves variability and treatment boundary.','Self-Determination: supplies a stop option.','Action: routes consequential concerns to care.']},
 {id:'EX-03',title:'Platform-content advice',before:'Use this hook and the algorithm will push your video.',after:'This opening states the topic and stakes early, which may help a viewer decide whether to continue. Platform distribution depends on changing, personalized systems and is never guaranteed; test the opening against your own audience data.',decisions:['Evidence: limits the claim to an observable editorial property.','Discussion: distinguishes viewer comprehension from ranking.','Self-Determination: avoids manipulating the viewer.','Action: proposes measurement without a reach promise.']}
];
json('worked-rewrites.json',{schema:'edsa-worked-rewrites/1.0',count:3,examples});
write('worked-rewrites.md',`# Three worked before-and-after rewrites\n\n${examples.map((e,i)=>`## ${i+1}. ${e.title}\n\n**Before:** ${e.before}\n\n**After:** ${e.after}\n\n${e.decisions.map(d=>`- ${d}`).join('\n')}`).join('\n\n')}\n`);

const segments=[
 ['0:00–0:30','Orientation','Name the question, audience, material stake, and what the video will not establish.'],
 ['0:30–1:30','Evidence anchor','State one atomic claim; show source, date, scope, and verification status on screen.'],
 ['1:30–2:30','Why it matters','Connect the claim to a concrete decision without threat inflation or identity pressure.'],
 ['2:30–4:00','Mechanism with limits','Explain the proposed mechanism, competing explanations, boundary conditions, and inference level.'],
 ['4:00–5:30','Example','Walk through a representative case; label constructed or historical material.'],
 ['5:30–7:00','Counterexample','Show where the framework fails, where evidence is absent, and what requires escalation.'],
 ['7:00–8:30','Platform layer','State only dated first-party eligibility or recommendation information; disclaim reach prediction.'],
 ['8:30–10:00','Audience choice','Identify who may use, pause, reject, or seek another source; disclose material interests.'],
 ['10:00–11:15','Bounded action','Offer one proportionate action with owner, inputs, stop condition, and review point.'],
 ['11:15–12:00','Recap and provenance','Repeat claim, uncertainty, sources, date, corrections path, and what the content cannot establish.']
];
json('twelve-minute-script-template.json',{schema:'edsa-script-template/1.0',durationSeconds:720,segments:segments.map(([time,label,instruction],i)=>({index:i+1,time,label,instruction,requiredFields:['spoken copy','visual/source cue','EDSA decision','boundary or reviewer note']}))});
write('twelve-minute-script-template.md',`# Annotated 0:00–12:00 script template\n\nWorking title:\nAudience and task:\nAccountable editor:\nSource-review cutoff:\nPlatform-policy records used:\n\n${segments.map(([time,label,instruction])=>`## ${time} — ${label}\n\nInstruction: ${instruction}\n\nSpoken copy:\n\nVisual/source cue:\n\nEDSA decision:\n\nBoundary or reviewer note:\n`).join('\n')}\n## Final review\n\nDecision: approve / revise / reject / escalate\nReviewer and date:\nUnresolved claims:\nCorrection destination:\n`);

write('unseen-brief-validation.md',`# Unseen brief validation\n\n## Brief\nCreate a short video inviting Hawaiʻi small organizations to assess one AI-enabled intake workflow. No performance data, testimonial, or platform outcome is available.\n\n## Decisions\n- Evidence: state only that the assessment examines purpose, owner, data, evidence, approval, and stop conditions; make no productivity claim.\n- Discussion: distinguish a readiness assessment from implementation, legal review, security testing, or certification.\n- Self-Determination: allow the viewer to use the public checklist without contacting Aloha AI; disclose that paid help may later be offered.\n- Action: ask the viewer to map one workflow and name an accountable owner; stop before entering sensitive data.\n- Platform appraisal: supply topic context and coherent media, but make no claim about recommendation or reach.\n\n## Result\nPass for a draft only. Human review remains required. No distribution, conversion, trust, or individual-response prediction is made.\n`);

write('quick-reference-card.md',`# EDSA quick-reference card\n\n**E — Evidence:** atomic claim · authority · date · scope · uncertainty\n\n**D — Discussion:** context · alternatives · limitations · what changes the answer\n\n**S — Self-Determination:** audience fit · disclosure · pause/exit · no coercion\n\n**A — Action:** one proportionate step · owner · stop condition · review point\n\n**Dual appraisal:** audience intelligibility and choice are not the same as platform eligibility and ranking.\n\n**Hard stop:** diagnosis · causal neuroscience promise · guaranteed trust/reach/outcome · hidden interest/uncertainty · fear/shame/false urgency.\n\n${boundary}\n`);
write('editorial-review-checklist.md',`# Editorial review checklist\n\n- [ ] Each factual proposition maps to a current, dated source or is labeled inference.\n- [ ] Neuroscience language preserves population, task, timing, uncertainty, and causal limits.\n- [ ] Platform statements include platform, first-party URL, retrieval date, and status.\n- [ ] Text, visual, title, and CTA describe the same topic.\n- [ ] The audience can inspect evidence, understand uncertainty, and decline the action.\n- [ ] The action is proportionate, reversible, and assigned to a human owner.\n- [ ] Accessibility, rights, sponsorship, privacy, and professional boundaries were reviewed.\n- [ ] Reviewer recorded approve, revise, reject, or escalate.\n`);
write('CHANGELOG.md','# Changelog\n\n## 2026.08.0 — 2026-08-03\n\n- First frozen pre-release package.\n- Added EDSA handbook, dual-appraisal crosswalk, three rewrites, twelve-minute script, quick-reference card, scientific claim map, dated platform-policy ledger, and unseen-brief validation.\n');
write('LICENSE.md','# Named-organization internal-use license — pre-release specimen\n\nCopyright 2026 Rayven-Nikkita Collins LLC. No license or purchase is presently offered. A future executed license may permit a named organization to use and adapt its acquired version internally. Resale, public redistribution of source files, removal of notices, and representation as clinical, scientific, legal, platform, accessibility, trust, distribution, or outcome assurance are prohibited. Third-party sources remain under their terms.\n');
write('RIGHTS-AND-ATTRIBUTION.md','# Rights and attribution\n\nOriginal package text, templates, crosswalk, and examples: Rayven-Nikkita Collins LLC, 2026. Scientific and platform materials are cited and linked, not redistributed. Users must independently clear third-party quotations, images, data, audio, video, trademarks, and platform assets.\n');
write('ACCESSIBILITY.md','# Accessibility note\n\nMarkdown, CSV, and JSON sources support reflow and machine access. DOCX uses semantic headings. PDFs are convenience renderings; source Markdown remains available. Color is not the sole signal. No WCAG conformance claim is made; test final adaptations with relevant assistive technology and users.\n');
write('SUPPORT-AND-MAINTENANCE.md','# Support and maintenance\n\nState: frozen pre-release and unavailable for acquisition. Source-review cutoff: 2026-08-03. Platform policy must be reverified before consequential use and at least quarterly. No support response time, updates, refund, or redelivery entitlement is offered before commercial release. Material scientific, policy, rights, safety, or security errors require conspicuous correction or withdrawal; silent replacement is prohibited.\n');

execFileSync('pandoc',['handbook.md','-o','neuroscience-trust-content-architecture-handbook.pdf','--metadata','title=Neuroscience-of-Trust Content Architecture'],{cwd:out});
execFileSync('pandoc',['twelve-minute-script-template.md','-o','twelve-minute-script-template.docx'],{cwd:out});
execFileSync('pandoc',['quick-reference-card.md','-o','edsa-quick-reference-card.pdf','--metadata','title=EDSA Quick Reference'],{cwd:out});
try { execFileSync('soffice',['--headless','--convert-to','xlsx','--outdir',out,path.join(out,'dual-appraisal-crosswalk.csv')],{stdio:'pipe'}); } catch { /* CSV remains the governed crosswalk format. */ }

const exclude=new Set(['manifest.json','neuroscience-trust-content-architecture-2026.08.0.zip']);
const walk=(dir,prefix='')=>fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(dir,e.name),path.join(prefix,e.name)):[path.join(prefix,e.name)]);
const names=walk(out).filter(n=>!exclude.has(n)).sort();
const files=names.map(name=>{const data=fs.readFileSync(path.join(out,name));return {path:name,bytes:data.length,sha256:crypto.createHash('sha256').update(data).digest('hex')};});
const manifest={schema:'edsa-release-manifest/1.0',artifactId:'edsa-framework',artifactName:'Neuroscience-of-Trust Content Architecture',version:'2026.08.0',releaseDate:null,state:'frozen-pre-release',sourceReviewCutoff:'2026-08-03',licenseId:'named-organization-internal-use-pre-release-specimen',maintenanceState:'frozen-version-policy-reverification-required',supportState:'not-offered-before-release',contents:['dual-appraisal crosswalk','Evidence-Discussion-Self-Determination-Action framework','three worked before-and-after rewrites','annotated 0:00-12:00 script template','quick-reference card','five hard-never rules','dated platform-policy ledger','scientific references and claim map'],files,changelog:'CHANGELOG.md',boundary:'Package completeness does not make acquisition available; checkout and fulfillment remain unimplemented.'};
json('manifest.json',manifest);
execFileSync('zip',['-qr','neuroscience-trust-content-architecture-2026.08.0.zip','.', '-x','neuroscience-trust-content-architecture-2026.08.0.zip'],{cwd:out});
console.log(`Built ${manifest.artifactName} ${manifest.version}: ${files.length} checksum-backed files.`);
