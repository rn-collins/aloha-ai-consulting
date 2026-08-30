import Link from "next/link";
import { SiteShell } from "../site-shell";
import { Studio } from "./studio";
export const metadata={title:"Opportunity Studio",description:"A browser-local 23-prompt prototype for examining whether AI belongs in one bounded piece of work, and which conditions control the next move."};

const groups=[
 ["01–04","Is there a real problem here?","Work signal, one bounded example, how often it recurs, and the clearest current cost. A workflow nobody can name an example of, and nobody can price the friction on, is not yet a candidate for anything."],
 ["05–09","Who and what would this touch?","Whether the process is documented end to end, where human judgment carries the work, whether trust or dignity is at stake, what happens if an output is wrong, and whether an affected person could contest it."],
 ["10–12","Can the information carry it?","Whether the necessary data is lawful, appropriate and available; how sensitive it is; and whether a person can tell an accurate output from an inaccurate one."],
 ["13–18","Does anyone have capacity to run it?","Baseline, a measurable definition of better, a named reviewer with protected time, an owner after the experiment ends, absorbable upkeep, and equitable access for the people who do the work."],
 ["19–23","Could it be stopped safely?","The information boundary no external tool may cross, a working non-AI fallback, a stop condition defined in advance, the smallest reversible test, and one honest statement about present readiness."],
];

const conditions=[
 "A wrong output could affect safety, rights, livelihood, or legal interests.",
 "The necessary information is not currently lawful, appropriate, and available.",
 "A person cannot currently verify the output against a trusted source.",
 "No capable person currently has authority and time to review the output.",
 "The people doing the work would not have equitable access or usable accommodations.",
];

const outcomes=[
 ["Stop and repair","Any controlling condition selected","At least one non-negotiable condition is missing. Positive answers elsewhere cannot cancel it out."],
 ["Test carefully","Score 21 or above","Enough clarity, review capacity and reversibility to define a small test — not a recommendation for a particular tool."],
 ["Prepare first","Score 7 to 20","A plausible opportunity with incomplete operating conditions. Repair those before selecting technology."],
 ["Repair first","Score −5 to 6","The uncertainty matters more than the tool. Map the work, evidence, ownership and review path first."],
 ["Human-led","Score below −5","Consequences, relationship value, information boundaries or missing review outweigh the case for a test."],
];

export default function StudioPage(){return <SiteShell><main id="main">
 <section className="page-hero wrap"><p className="kicker">Opportunity Studio · private by default</p><h1>Understand the work<br/><em>before selecting a tool.</em></h1><p className="lede">This guided decision aid helps you identify one responsible next move. Your answers stay in this browser during this prototype and are not transmitted.</p><a className="workspace-jump" href="#workspace">Skip the briefing and start question 01</a></section>

 <section className="ledger-section wrap"><div className="section-head"><p className="section-label">What this is</p><div><h2>Twenty-three questions, in the order the answers actually matter.</h2><p className="ledger-lede">Most readiness quizzes ask whether you are excited about AI. This one asks whether the work is understood, whether the information is permitted, whether anyone can tell a good output from a bad one, and whether a named human has the authority and the time to stop it. The questions run in five groups, and later groups cannot rescue an earlier failure.</p></div></div>
  <div className="figure-strip"><div><strong>23</strong><span>Questions, one per screen</span></div><div><strong>5</strong><span>Answers that override the score</span></div><div><strong>0</strong><span>Answers transmitted anywhere</span></div><div><strong>Free</strong><span>No account, no email, no payment</span></div></div>
  <div className="ledger">{groups.map(g=><article className="ledger-row" key={g[0]}><span className="ledger-index">{g[0]}</span><div className="ledger-body"><h3>{g[1]}</h3><p>{g[2]}</p></div></article>)}</div>
 </section>

 <section className="ledger-section wrap"><div className="section-head"><p className="section-label">How the result is reached</p><div><h2>The arithmetic is published, because a hidden score is not a reason.</h2><p className="ledger-lede">Every answer carries a weight between −3 and +3. The weights are added. Then five specific answers are checked separately: if any one of them is selected, the sum is disregarded entirely and the result is <em>stop and repair</em>. This is the whole mechanism. You can confirm it by running the Studio and watching a single answer change the finding while the score stays high.</p></div></div>
  <div className="ledger">
   <article className="ledger-row"><span className="ledger-index">A</span><div className="ledger-body"><span className="ledger-flag">Overrides the score</span><h3>Five answers that end the assessment on their own.</h3><ul className="scope-list">{conditions.map(c=><li key={c}>{c}</li>)}</ul><p>Repairing one of these should trigger a fresh review. It does not, by itself, make a tool appropriate.</p></div></article>
   <article className="ledger-row"><span className="ledger-index">B</span><div className="ledger-body"><span className="ledger-flag quiet">Otherwise, the bands</span><h3>Five findings, and the score range that produces each.</h3><ul className="state-ledger">{outcomes.map(o=><li key={o[0]}><p><strong>{o[0]}.</strong> {o[2]}</p><span className="state no">{o[1]}</span></li>)}</ul></div></article>
  </div>
 </section>

 <section className="ledger-section wrap"><div className="section-head"><p className="section-label">What you leave with</p><div><h2>A dated working record you can hand to someone else.</h2></div></div>
  <ol className="step-ledger">
   <li><div><h3>The Private Opportunity Record</h3><p>A plain-text brief containing the finding, any controlling conditions, and all twenty-three answers with the question each one answered — so a colleague can see why the result came out the way it did rather than being asked to trust it. Copy it, or download it as <code>aloha-ai-private-opportunity-record.txt</code>.</p></div></li>
   <li><div><h3>The Monday Plan</h3><p>Seven fields: one action, an owner, a safe or approved input, a measure of usefulness, a reviewer with authority, a stop condition, and unresolved questions. Anything you leave blank prints as “Not yet defined” in the exported record instead of disappearing.</p></div></li>
   <li><div><h3>An optional bounded team handoff</h3><p>A separate short block containing only the assigned task, owner, reviewer, acceptance measure and stop condition. It exists so you can give a team its duties without circulating every private answer you gave.</p></div></li>
   <li><div><h3>One onward route, matched to the finding</h3><p>A <em>test carefully</em> result routes to the <Link href="/tools/pilot-design">Pilot Design Kit</Link>; <em>prepare first</em> to the <Link href="/tools/decision-record">Decision Record Builder</Link>; <em>stop and repair</em> to the <Link href="/learning">learning materials</Link>; <em>human-led</em> to the <Link href="/insights">Source Desk</Link>. The route follows the finding and never changes it, and nothing on it is for sale.</p></div></li>
  </ol>
 </section>

 <section className="ledger-section wrap"><div className="section-head"><p className="section-label">Boundaries</p><div><h2>What this prototype does not do.</h2></div></div>
  <div className="ledger">
   <article className="ledger-row"><span className="ledger-index">01</span><div className="ledger-body"><h3>It does not send anything.</h3><div className="ledger-pair"><div><b>What holds</b><p>Answers and the Monday Plan are written to this browser under the key <code>aloha-ai-opportunity-record-v1</code> and read back when you return to the page.</p></div><div><b>What that means for you</b><p>Clearing site data, using private browsing, or switching device removes the record. Download the brief before you leave if you need to keep it. Aloha AI cannot recover it for you.</p></div></div></div></article>
   <article className="ledger-row"><span className="ledger-index">02</span><div className="ledger-body"><h3>It does not name a tool.</h3><div className="ledger-pair"><div><b>What holds</b><p>The finding describes the state of the work: whether it can be tested, prepared, repaired, or should stay human-led.</p></div><div><b>What it is not</b><p>No vendor is scored, ranked, recommended or excluded, and no result should be read as approval to buy anything.</p></div></div></div></article>
   <article className="ledger-row"><span className="ledger-index">03</span><div className="ledger-body"><h3>It does not certify anything.</h3><div className="ledger-pair"><div><b>What holds</b><p>It organises your own answers into a defensible next step and shows the reasoning that produced it.</p></div><div><b>What it is not</b><p>Not a compliance finding, safety assurance, accessibility conformance statement, legal advice, or a guarantee of savings. A person still decides.</p></div></div></div></article>
   <article className="ledger-row"><span className="ledger-index">04</span><div className="ledger-body"><h3>Submission is deliberately switched off.</h3><p>There is no route on this page for sending your answers to Aloha AI, and that is not an oversight. A submission route would first have to let you preview the exact subset being sent, say what assistance you are asking for, and consent before anything left the browser. Until that exists, nothing is sent. If you want a human to look at a situation, bring it through <Link href="/contact">a nonconfidential conversation</Link> instead.</p></div></article>
  </div>
 </section>

 <div id="workspace"><Studio/></div>
</main></SiteShell>}
