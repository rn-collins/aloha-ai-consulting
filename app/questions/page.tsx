import Link from "next/link"; import type {Metadata} from "next"; import {SiteShell} from "../site-shell";
import {issueTitles} from "../public-catalog";

export const metadata:Metadata={title:"Questions",description:"Why Aloha AI publishes no open Q&A archive yet, and the permission, de-identification, sourcing, and review conditions a public answer would have to meet first."};

const conditions=[
 ["Separate permission to publish","A person asking a question in a paid or private setting has consented to being helped, not to being published. Permission to publish is asked for afterwards, separately, in plain terms, and a refusal is the default rather than the exception."],
 ["De-identification that actually holds","Removing a name is not de-identification when the situation itself identifies the organization. A question about “our three-person intake team in a specialty practice in a small market” names its author to anyone in that market. Either the question generalizes without losing its point, or it does not get published."],
 ["A bounded question","“Should we use AI?” has no answer. “Should an unsupervised model draft the first reply to an intake message, and who is accountable if it is wrong?” has one. A question that cannot be narrowed to something answerable produces an answer that sounds wise and helps nobody."],
 ["A source route","An answer that rests on nothing is an opinion with formatting. Anything published here would have to name the record it relies on and say where that record stops — the standard the Source Desk already applies to every method claim on this site."],
 ["A visible date","Guidance moves. An undated answer to a question about AI is a liability with a long tail, and the withdrawal of one federal guidance document in 2025 — disclosed on the Source Desk rather than quietly patched — is the local proof of that."],
 ["Separation from individualized advice","A published answer is educational material about a class of situation. It is not advice about yours, it cannot be, and any format that blurs the two would be doing the exact thing this practice exists to argue against."],
];

export default function Questions(){return <SiteShell><main id="main">
 <section className="page-hero wrap"><p className="kicker">Questions</p><h1>Public answers require a real question, <em>permission, evidence, and review.</em></h1><p className="lede">There is no generic unlimited Q&amp;A channel, and private Clinic contributions do not become public material.</p></section>

 <section className="boundary wrap"><p className="section-label">Publication rule</p><div><h2>No public answer records exist yet.</h2><p>A future answer may appear only when a participant separately permits general publication and the answer has been de-identified, bounded, sourced, dated, reviewed, and separated from individualized advice.</p><p>Private Clinic contributions, customer materials, and participant identities do not become public content by default.</p><Link className="text-link" href="/work/ai-opportunity-clinic">See the paid Clinic boundaries →</Link></div></section>

 <section className="ledger-section wrap"><div className="section-head"><p className="section-label">The six conditions</p><div><h2>What it would take for an answer to appear here.</h2><p className="ledger-lede">This page is empty by construction rather than by neglect. Each condition below is a reason a real question that was really asked has not been published, and any one of them failing is enough on its own. They are written out so the emptiness is legible: a Q&amp;A archive is cheap to fill and expensive to fill honestly.</p></div></div>
  <div className="ledger">{conditions.map((c,i)=><article className="ledger-row" key={c[0]}><span className="ledger-index">{String(i+1).padStart(2,"0")}</span><div className="ledger-body"><h3>{c[0]}</h3><p>{c[1]}</p></div></article>)}</div>
 </section>

 <section className="ledger-section wrap"><div className="section-head"><p className="section-label">Answered already</p><div><h2>Twelve questions that did clear that bar.</h2><p className="ledger-lede">Every condition above has been met — for twelve questions, built as public learning records rather than as an archive of correspondence. Each one takes a single consequential AI decision, names the official records that bear on it, states what those records cannot settle, and hands over an instrument you can complete for your own situation. Eleven are complete and open now; Issue 01 is release-gated and says so on its own page.</p><p className="ledger-lede">If your question resembles one of these, the answer is already written and is longer, better sourced, and more useful than a reply to a message would be.</p></div></div>
  <div className="ledger">{issueTitles.map((title,i)=><article className="ledger-row" key={title}><span className="ledger-index">{String(i+1).padStart(2,"0")}</span><div className="ledger-body"><h3>{title}</h3><Link className="text-link" href={`/learning/decision-desk/issue-${String(i+1).padStart(2,"0")}`}>Open the record →</Link></div></article>)}</div>
 </section>

 <section className="ledger-section wrap"><div className="section-head"><p className="section-label">Where a question can go</p><div><h2>Three routes, and what each one is for.</h2></div></div>
  <ol className="step-ledger">
   <li><div><h3>Answer it yourself with the instruments</h3><p>The four browser-local tools exist precisely so a specific question can be worked through without waiting for anyone. They run in your browser, transmit nothing, and export a record you can circulate. For most questions this is faster and produces something more durable than an answer would.</p><Link className="text-link" href="/tools">Open the tools →</Link></div></li>
   <li><div><h3>Check the source before asking about it</h3><p>If the question is really about what an official record says, the Source Desk names seventeen of them, what each is used for, and the limit each one carries. Opening the source is a better use of an afternoon than reading a summary of it.</p><Link className="text-link" href="/insights">Open the Source Desk →</Link></div></li>
   <li><div><h3>Bring the situation as a conversation</h3><p>Where the question belongs to a named piece of work inside an organization, it is not a Q&amp;A item at all. Send a short nonconfidential description instead, and expect either a scope, a redirection, or an honest no.</p><Link className="text-link" href="/contact">Start a nonconfidential conversation →</Link></div></li>
  </ol>
 </section>
</main></SiteShell>}
