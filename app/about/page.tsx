import Link from "next/link";
import type {Metadata} from "next";
import {SiteShell} from "../site-shell";
import {builds, estateVerifiedOn} from "../estate-builds";

export const metadata:Metadata={title:"About RN Collins",description:"Meet RN Collins and inspect the research, decision-design, implementation, and education method behind Aloha AI."};

const practice = [
  ["Research", "Read the governing sources, map uncertainty, and separate evidence from assumption."],
  ["Decision design", "Name the people, authority, tradeoffs, stop conditions, and review points before selecting software."],
  ["Implementation", "Build a bounded, reversible path with human review and a record someone else can inspect."],
  ["Education", "Turn the reasoning into tools and learning materials people can use without surrendering their judgment."],
];

const publicWork = [
  ["Disability in Radiology", "Peer-reviewed research indexed by the U.S. National Library of Medicine.", "https://pubmed.ncbi.nlm.nih.gov/37996364/"],
  ["Psychedelics as medicine", "Science-policy analysis published by the MIT Science Policy Review.", "https://doi.org/10.38105/spr.osqbpecncp"],
  ["Caregivers in research funding", "Open-access policy proposal published in Frontiers in Education.", "https://doi.org/10.3389/feduc.2024.1472517"],
  ["NYC Youth Agenda research", "Public civic-research record from the City of New York.", "https://www.nyc.gov/assets/dycd/digital_toolkit/NYCYouth_TownHall/we-the-youth-advisors/index.html"],
];

const method = [
  ["Read the source, not the summary","A framework, an agency record, a court order and a vendor blog post about that court order are four different objects. The practice reads the first three and treats the fourth as an unverified pointer. The Source Desk on this site names all seventeen records it relies on, what each one is used for, and where each one stops."],
  ["Publish the limit next to the claim","Every build carries the thing it cannot establish on the same surface as the thing it can — not in a footer, not in terms of service. When that pairing cannot be written honestly, the claim gets narrowed until it can."],
  ["Make “do not proceed” a real output","A decision aid that can only produce encouragement is a sales tool. Five specific answers in the Opportunity Studio override its own score entirely; the vendor and pilot instruments carry gates that stop the process rather than deducting points."],
  ["Report the gap rather than hide it","A monitor that finds nothing looks identical to a monitor that is broken. Where a source could not be retrieved, a link is dead, or a sweep did not run, the build says so in words — because a quiet page is the most misleading artifact in this kind of work."],
];

export default function About(){return <SiteShell><main id="main">
  <section className="page-hero wrap"><p className="kicker">About RN Collins + Aloha AI</p><h1>Work on questions too messy <em>for one discipline.</em></h1><p className="lede">RN Collins is a researcher, educator, builder, and law student working across neuroscience, policy, technology, and organizational decision-making. She researches an entity and its work, finds the gaps or pressure points, makes them concrete and visible, and creates what the situation requires.</p><div className="actions"><Link className="button primary" href="/contact">Contact RN</Link><Link className="button" href="/insights">Inspect the evidence</Link></div></section>

  <section className="trust-section wrap"><div className="section-head"><p className="section-label">The practice</p><h2>One method, four forms of work.</h2></div><div className="trust-grid">{practice.map((item,i)=><article key={item[0]}><span className="path-num">{String(i+1).padStart(2,"0")}</span><h3>{item[0]}</h3><p>{item[1]}</p></article>)}</div></section>

  <section className="ledger-section wrap"><div className="section-head"><p className="section-label">How the work is actually done</p><div><h2>Four rules that show up in every build.</h2><p className="ledger-lede">These are not values statements. Each one is visible in the artifacts below and on this site, and each one has a cost — it makes the output smaller, later, and less flattering than the version that skips it.</p></div></div>
   <div className="ledger">{method.map((m,i)=><article className="ledger-row" key={m[0]}><span className="ledger-index">{String(i+1).padStart(2,"0")}</span><div className="ledger-body"><h3>{m[0]}</h3><p>{m[1]}</p></div></article>)}</div>
  </section>

  <section className="trust-section wrap" id="selected-work"><div className="section-head"><p className="section-label">Public evidence</p><div><h2>Selected work you can verify.</h2><p>These links go to publishers, a federal index, or a government record—not self-authored claims.</p></div></div><div className="proof-list">{publicWork.map(item=><article key={item[0]}><div><h3>{item[0]}</h3><p>{item[1]}</p></div><a href={item[2]} target="_blank" rel="noreferrer">Open public record <span aria-hidden="true">↗</span></a></article>)}</div></section>

  <section className="ledger-section wrap" id="builds"><div className="section-head"><p className="section-label">Self-published builds</p><div><h2>What the practice produces, open to inspection.</h2><p className="ledger-lede">{builds.length} public builds, each live and each carrying its own stated limit. The figures were read off the pages themselves on {estateVerifiedOn}; the limits are quoted from what each build says about itself. Two of them — a hand-read authority monitor and an unreviewed automated tracker on the same subject — are here specifically because the difference between them is the whole point.</p><p className="ledger-lede">These are self-published. Opening one confirms that it exists and says what is described here. Unlike the four records above, no outside publisher, index or government body has vouched for them, and this section does not ask you to treat them as though one had.</p><p className="ledger-lede">Four kinds of object recur across them. Monitors watch a field that keeps moving and report the date of their last successful collection separately from their last attempt. Registers fix a snapshot, say when it was taken, and refuse to quietly update it. Decision tools make one judgement inspectable and export it as a file the user keeps. Atlases map a body of knowledge and publish the size of the hole in it — which is how a link check across 132 catalogued entries became a headline finding of 58 broken or missing recordings rather than a maintenance chore.</p><p className="ledger-lede">The counts are load-bearing, and each one is a number some other version of the same page would have rounded away: eight authorities of which seven were read and one is flagged unread; 175 organisations surviving from 177 recorded; 66 builds enumerated by a script after a hand-kept list had drifted to 32. Where a figure is smaller or uglier than the round number nearby, that is the figure.</p></div></div>
   <div className="dossier-grid">{builds.map(b=><article className="dossier" key={b.href}><span className="kind">{b.kind}</span><h3><a href={b.href} target="_blank" rel="noreferrer">{b.name} <span aria-hidden="true">↗</span></a></h3><p className="measure">{b.measure}</p><p>{b.what}</p><p className="stops"><b>Where it stops</b>{b.stops}</p></article>)}</div>
  </section>

  <section className="boundary wrap"><p className="section-label">The operating stance</p><div><h2>Evidence before theater. Context before software. A bounded build before transformation claims.</h2><p>Hawaiʻi is the place from which the practice operates and a reminder that technology enters living systems with histories, obligations, and uneven consequences. It is not a claim to speak for all of Hawaiʻi or decorative brand material.</p><p className="quiet-note">This page identifies selected public work; it is not a complete curriculum vitae. Aloha AI does not present RN as a licensed attorney, auditor, certifier, or substitute for regulated professional advice.</p></div></section>
</main></SiteShell>}
