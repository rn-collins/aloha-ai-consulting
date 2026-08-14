import Link from "next/link";
import type {Metadata} from "next";
import {SiteShell} from "../../../site-shell";
import {ContinuationRetirementRecord} from "./continuation-retirement-record";

export const metadata:Metadata={title:"Is It Time to Stop Using This AI? · Decision Desk 12",description:"A complete public course and AI Continuation and Retirement Decision Record for deciding whether to continue, pause, repair, roll back, replace, or retire one exact AI use."};

const lessons=[
 ["01","Reopen the decision","Treat deployment as a reversible decision, not a permanent achievement. Restate the exact use, purpose, people, owner, authoritative record, boundaries, approval conditions, and what has changed since the last review."],
 ["02","Test whether the purpose still exists","Ask whether the original problem remains, whether the AI use still addresses it, whether a safer non-AI route now exists, and whether continuation serves affected people rather than merely preserving sunk cost or organizational habit."],
 ["03","Rebuild the current evidence record","Use dated outcome, quality, error, override, complaint, incident, subgroup, workload, cost, and disconfirming evidence. A successful pilot, old benchmark, vendor claim, or absence of reported complaints does not prove present performance."],
 ["04","Recheck authority and affected-party conditions","Verify current law, policy, contract, consent, notice, meaningful choice, access, challenge, records, privacy, security, accessibility, labor, sector, and decision-owner authority for the exact use. Prior permission may expire or stop fitting."],
 ["05","Freeze the system that actually exists","Identify the current provider, model, version, prompts, tools, integrations, data flow, retention, training or reuse, subprocessors, permissions, human review, output path, and configuration. If the system cannot be frozen, record the uncertainty."],
 ["06","Look for accumulated harm and dependence","Examine automation bias, deskilling, inaccessible alternatives, quiet scope expansion, workarounds, shadow systems, unequal burdens, suppressed dissent, downstream record errors, vendor lock-in, and whether people can still operate without the tool."],
 ["07","Separate repairable defects from stop signals","A bounded defect may support controlled repair. Missing authority, severe or repeated harm, inability to inspect or correct consequential output, loss of meaningful human control, unsafe data handling, or no executable fallback may require pause or exit."],
 ["08","Design rollback before it is needed","Define the last known safe state, manual fallback, trigger, stop owner, access changes, communications, records preservation, data export and deletion, continuity plan, verification, and maximum tolerable interruption. A rollback plan that has never been tested is an assumption."],
 ["09","Evaluate replacement without resetting the evidence burden","A new vendor or model does not erase the decision history. Reassess purpose, authority, data, affected people, configuration, tests, human review, challenge, exit, cost, dependency, and transition risk before treating replacement as improvement."],
 ["10","Retire the use without erasing accountability","Stop processing, remove access and integrations, preserve required decision and incident records, export or return data, request and verify deletion where appropriate, communicate the change, correct downstream records, support affected people, and document residual obligations."],
 ["11","Choose a bounded disposition","Choose continuation with conditions, pause and repair, controlled rollback or replacement, or retirement. State the exact scope, owners, evidence, dissent, conditions, monitoring, stop rules, next review, and what the disposition does not authorize."],
 ["12","Keep the decision alive","Monitor the conditions that justified the disposition. Reopen review after an incident, complaint pattern, material provider or model change, authority change, performance drift, new affected group, scope expansion, failed control, ownership change, or missed review date."]
];

const stops=[
 "the current AI use, purpose, owner, affected people, authoritative record, or boundaries cannot be stated",
 "the original justification no longer exists or a safer workable non-AI route is available",
 "outcome, error, harm, complaint, override, subgroup, cost, or workload evidence is missing or stale",
 "law, policy, contract, consent, notice, privacy, security, accessibility, labor, records, or sector authority is unresolved",
 "the deployed provider, model, version, prompts, integrations, permissions, or data flow cannot be frozen",
 "people cannot meaningfully challenge, correct, opt out where required, or reach accountable human support",
 "the organization has lost the human capability or records needed to detect and correct failure",
 "a rollback, continuity, data export or deletion, vendor exit, and verification path does not exist",
 "serious or repeated harm, uncontrolled scope expansion, or consequential output without meaningful human control is present",
 "the approval owner, stop owner, monitoring cadence, or next review date is absent"
];

const dispositions=[
 ["Continue with conditions","Only for the exact reviewed use, with current evidence and authority, named owners, monitoring, challenge, exit readiness, and a dated review."],
 ["Pause and repair","Freeze expansion or use as required while resolving bounded evidence, control, access, configuration, or operational defects."],
 ["Roll back or replace","Return to a known safer state or transition through a separately reviewed replacement plan with continuity and verification."],
 ["Retire and archive","Stop the use, close access and integrations, preserve required records, complete data and vendor exit, support affected people, and verify residual obligations."]
];

export default function Issue12(){return <SiteShell><main id="main">
 <section className="page-hero wrap"><p className="kicker">Decision Desk · Issue 12 · complete public learning edition</p><h1>Is It Time to Stop <em>Using This AI?</em></h1><p className="lede">Decide whether one exact AI use should continue, pause for repair, roll back, be replaced, or retire—and build the evidence, ownership, continuity, and exit record needed to act responsibly.</p><div className="actions"><a className="button primary" href="#curriculum">Begin the issue</a><a className="button" href="#instrument">Open the decision record</a></div></section>
 <section className="event-status"><div className="wrap event-status-grid"><div><span>Learning time</span><strong>90 minutes</strong></div><div><span>Teaching</span><strong>12 cumulative lessons</strong></div><div><span>Instrument</span><strong>Continuation + retirement record</strong></div><div><span>Boundary</span><strong>No automatic continuation</strong></div></div></section>
 <section className="wrap pathways"><div className="section-head"><div><p className="section-label">Four bounded dispositions</p><h2>Continuation is one option—not the default.</h2></div><p>The appropriate outcome depends on current evidence, current authority, accumulated effects, human control, and an executable exit—not on sunk cost, familiarity, or a past approval.</p></div><div className="path-list">{dispositions.map((x,i)=><article className="path-row" key={x[0]}><span className="path-num">{String(i+1).padStart(2,"0")}</span><div><h3>{x[0]}</h3><p>{x[1]}</p></div><span className="event-result">Disposition</span></article>)}</div></section>
 <section className="wrap masterclass-reader" id="curriculum"><div className="section-head"><div><p className="section-label">Complete issue curriculum</p><h2>Twelve cumulative lessons.</h2></div><p>Use a fictional or nonsensitive system description. Never enter credentials, personal data, incident details, contracts, privileged material, confidential records, or security information.</p></div>{lessons.map(x=><details className="masterclass-chapter" key={x[0]} open={x[0]==="01"}><summary><span>{x[0]}</span><div><small>Issue 12</small><h3>{x[1]}</h3></div><strong>Open</strong></summary><div className="chapter-body"><div className="chapter-teaching"><p>{x[2]}</p></div><aside><p className="section-label">Evidence output</p><p>Record the current system, dated evidence, changes, dependencies, exit conditions, owners, disposition, dissent, monitoring, and next review. Missing evidence remains visible.</p></aside></div></details>)}</section>
 <section className="offer-grid wrap"><article className="offer-card"><p className="section-label">Critical review triggers</p><h2>Past approval cannot carry the whole burden.</h2><ul className="scope-list">{stops.map(x=><li key={x}>{x}</li>)}</ul></article><aside><p className="section-label">Retirement boundary</p><h2>Turning off a feature is not a complete exit.</h2><p>Responsible retirement may require access removal, integration shutdown, service continuity, data return or deletion, records preservation, downstream correction, notice, support, vendor closure, residual-risk review, and verification.</p><p>The exact requirements depend on the organization, system, people, agreements, law, and records involved.</p></aside></section>
 <ContinuationRetirementRecord/>
 <section className="wrap boundary"><p className="section-label">Completion boundary</p><div><h2>The public course and reusable decision record are complete.</h2><p>This edition helps structure a decision; it does not inspect a real system, validate evidence, provide professional advice, execute a rollback, delete vendor data, preserve required records, authorize continuation, or retire anything. Real action requires current domain-specific review, affected-party participation, accountable owners, tested continuity and exit procedures, and organizational approval.</p><div className="actions"><Link className="button primary" href="/learning/decision-desk">Return to the 12-month program</Link><Link className="button" href="/learning/decision-desk/issue-11">Previous issue</Link></div></div></section>
 </main></SiteShell>}
