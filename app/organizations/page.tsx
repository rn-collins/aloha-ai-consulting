import Link from "next/link";
import type {Metadata} from "next";
import {SiteShell} from "../site-shell";

export const metadata:Metadata={title:"For organizations",description:"Bring RN Collins a recurring problem, consequential decision, or difficult body of work and determine a useful, bounded response."};
const problems=[["The same work keeps breaking down","A process depends on hidden knowledge, repeated repair, or people compensating for a system that does not hold."],["A consequential decision is stuck","The evidence, authority, tradeoffs, affected people, or next move are unclear."],["Knowledge exists but is not usable","Research, law, policy, science, or institutional memory is not reaching the people who need it in a form they can use."],["AI is already entering the work","A team needs to understand where it belongs, what it requires, who remains accountable, and when to stop."]];

const questions=[
 ["Which single piece of work is this about?","An organization is not a scope. A named, bounded, recurring piece of work is. If the answer is “everything AI”, the first useful task is narrowing it, and that narrowing is itself the conversation."],
 ["Who owns it, and who is affected by it?","Not the sponsor — the person accountable for the outcome after everyone else has moved on, and the people who live with the result whether or not they were consulted."],
 ["What would you have to see to change your mind?","A team that cannot answer this is not evaluating a decision; it is looking for support for one already made. That is legitimate, and it is a different job, done by someone else."],
 ["What has already been tried, and what happened?","Previous attempts are the cheapest evidence available and are almost never written down. They usually contain the constraint that the next attempt will also hit."],
 ["What happens if nothing changes?","If the honest answer is “not much”, that is a finding, and it is worth having before a budget is committed rather than after."],
];

const outcomes=[
 ["A written scope","The problem, the boundaries, the people, the evidence needed, the deliverables, the responsibilities, the timing and the price — agreed before any work begins. Nothing starts on the strength of a good conversation."],
 ["A redirection","The useful answer is often a different specialist, an internal repair, a policy decision, or a procurement question that has to be settled before any tool is relevant. Saying so ends the conversation faster than it would otherwise end, which is the point of having it."],
 ["A documented no","Where there is no useful fit, you get told that, with the reason. This is the most common outcome and the one that costs you the least."],
];

const notThis=[
 ["Staffing or placement","This is not a body shop and does not supply engineers, analysts, or fractional staff to run inside your team."],
 ["Vendor resale or referral fees","No product is resold, and no commission, referral fee, or affiliate arrangement sits behind any tool named on this site. The vendor instruments are built to be usable against vendors this practice has never spoken to."],
 ["Certification or assurance","No audit, VPAT, penetration test, threat model, or compliance attestation is produced. Where a decision needs one, it needs an assessor, and this practice will say so."],
 ["Owning your AI program","Work is handed off with a record someone else can operate. An engagement that ends with the organization more dependent than it started has failed on its own terms."],
];

const runYourself=[
 ["Take one workflow through the Opportunity Studio","Twenty-three questions, in one browser, exporting a dated brief with all twenty-three answers visible. Run it once per candidate workflow and the results become comparable across a team.","/studio"],
 ["Put the shortlist through the Vendor Comparison","The current process is entered as an option alongside the candidates, so “keep doing what we do” competes on the same criteria instead of being assumed away.","/tools/vendor-comparison"],
 ["Precommit the pilot before you run it","Hypothesis, baseline, measures, authority, stop conditions and rollback, written down before the test rather than reconstructed after it.","/tools/pilot-design"],
 ["Preserve the decision itself","Alternatives, evidence, uncertainty, affected people, owner, fallback and a review date — the record that answers “why did we do this” eighteen months later, when nobody involved is still in the role.","/tools/decision-record"],
];

export default function Organizations(){return <SiteShell><main id="main">
 <section className="page-hero wrap"><p className="kicker">For organizations</p><h1>Start with what keeps recurring, <em>not with an AI shopping list.</em></h1><p className="lede">RN researches the organization, the work, the evidence, and the people around it. Together, that inquiry makes the real gap visible and determines whether the useful response is strategy, research, design, a build, facilitation, learning, or no new technology at all.</p><div className="actions"><Link className="button primary" href="/contact">Bring RN the problem</Link><Link className="button" href="/work/ai-opportunity-clinic">Review the defined Clinic</Link></div></section>

 <section className="trust-section wrap"><div className="section-head"><p className="section-label">Problems worth bringing</p><h2>You do not need to diagnose the solution first.</h2></div><div className="trust-grid">{problems.map((item,index)=><article key={item[0]}><span className="path-num">{String(index+1).padStart(2,"0")}</span><h3>{item[0]}</h3><p>{item[1]}</p></article>)}</div></section>

 <section className="ledger-section wrap"><div className="section-head"><p className="section-label">The first conversation</p><div><h2>Five questions, and none of them are about software.</h2><p className="ledger-lede">These are what a first nonconfidential conversation actually consists of. They are published so you can answer them before the conversation, decide from the answers that you do not need it, and lose nothing by having read them.</p></div></div>
  <div className="ledger">{questions.map((q,i)=><article className="ledger-row" key={q[0]}><span className="ledger-index">{String(i+1).padStart(2,"0")}</span><div className="ledger-body"><h3>{q[0]}</h3><p>{q[1]}</p></div></article>)}</div>
 </section>

 <section className="ledger-section wrap"><div className="section-head"><p className="section-label">Three ways it ends</p><div><h2>What comes out of that conversation.</h2></div></div>
  <div className="ledger">{outcomes.map((o,i)=><article className="ledger-row" key={o[0]}><span className="ledger-index">{String(i+1).padStart(2,"0")}</span><div className="ledger-body"><h3>{o[0]}</h3><p>{o[1]}</p></div></article>)}</div>
 </section>

 <section className="ledger-section wrap"><div className="section-head"><p className="section-label">Run it yourself first</p><div><h2>Four things a team can do this week without engaging anyone.</h2><p className="ledger-lede">Each of these runs entirely in a browser, costs nothing, creates no account, and exports a file. A team that works through all four arrives at a conversation with a real record rather than a feeling — and quite often arrives at a decision instead, which is a better outcome for everyone.</p></div></div>
  <ol className="step-ledger">{runYourself.map(r=><li key={r[0]}><div><h3>{r[0]}</h3><p>{r[1]}</p><Link className="text-link" href={r[2]}>Open it →</Link></div></li>)}</ol>
 </section>

 <section className="ledger-section wrap"><div className="section-head"><p className="section-label">Not this practice</p><div><h2>Four things to buy from someone else.</h2></div></div>
  <div className="ledger">{notThis.map((n,i)=><article className="ledger-row" key={n[0]}><span className="ledger-index">{String(i+1).padStart(2,"0")}</span><div className="ledger-body"><h3>{n[0]}</h3><p>{n[1]}</p></div></article>)}</div>
 </section>

 <section className="boundary wrap"><p className="section-label">How an engagement begins</p><div><h2>Understand → frame → scope → deliver → hand off.</h2><p>A first nonconfidential conversation tests whether there is a useful fit. No project begins until the problem, boundaries, people, evidence needs, deliverables, responsibilities, terms, and price are separately defined and accepted.</p><Link className="text-link" href="/procurement">Review current procurement information →</Link></div></section>

 <section className="boundary wrap"><p className="section-label">Current availability</p><div><h2>No unnamed consulting package is silently for sale.</h2><p>The Opportunity Clinic is the only facilitated format with published scope and terms. Other service records remain developing, unavailable, and unpriced. Contacting RN does not reserve a session or create an engagement.</p></div></section>
 </main></SiteShell>}
