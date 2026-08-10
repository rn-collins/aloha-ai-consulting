import Link from "next/link";
import type {Metadata} from "next";
import {SiteShell} from "../site-shell";

export const metadata:Metadata={title:"About RN Collins",description:"Meet RN Collins and inspect the research, decision-design, implementation, and education method behind Aloha AI."};

const practice = [
  ["Research", "Read the governing sources, map uncertainty, and separate evidence from assumption."],
  ["Decision design", "Name the people, authority, tradeoffs, stop conditions, and review points before selecting software."],
  ["Implementation", "Build a bounded, reversible path with human review and a record someone else can inspect."],
  ["Education", "Turn the reasoning into tools and learning materials people can use without surrendering their judgment."],
];

const publicWork = [
  ["Disability in Radiology", "Peer-reviewed research indexed by the U.S. National Library of Medicine.", "https://pubmed.ncbi.nlm.nih.gov/37996364/"],
  ["Psychedelics as medicine", "Science-policy analysis published by the MIT Science Policy Review.", "https://sciencepolicyreview.org/2023/08/mitspr-191618004013/"],
  ["Caregivers in research funding", "Open-access policy proposal published in Frontiers in Education.", "https://doi.org/10.3389/feduc.2024.1472517"],
  ["NYC Youth Agenda research", "Public civic-research record from the City of New York.", "https://www.nyc.gov/assets/dycd/digital_toolkit/NYCYouth_TownHall/we-the-youth-advisors/index.html"],
];

export default function About(){return <SiteShell><main id="main">
  <section className="page-hero wrap"><p className="kicker">About RN Collins + Aloha AI</p><h1>Work on questions too messy <em>for one discipline.</em></h1><p className="lede">RN Collins is a researcher, educator, builder, and law student working across neuroscience, policy, technology, and organizational decision-making. Aloha AI is the public practice through which that range becomes usable: tools, learning, evidence, and bounded advisory work.</p><div className="actions"><Link className="button primary" href="/tools">Use a tool</Link><Link className="button" href="/insights">Inspect the evidence</Link></div></section>
  <section className="trust-section wrap"><div className="section-head"><p className="section-label">The practice</p><h2>One method, four forms of work.</h2></div><div className="trust-grid">{practice.map((item,i)=><article key={item[0]}><span className="path-num">{String(i+1).padStart(2,"0")}</span><h3>{item[0]}</h3><p>{item[1]}</p></article>)}</div></section>
  <section className="trust-section wrap"><div className="section-head"><p className="section-label">Public evidence</p><div><h2>Selected work you can verify.</h2><p>These links go to publishers, a federal index, or a government record—not self-authored claims.</p></div></div><div className="proof-list">{publicWork.map(item=><article key={item[0]}><div><h3>{item[0]}</h3><p>{item[1]}</p></div><a href={item[2]} target="_blank" rel="noreferrer">Open public record <span aria-hidden="true">↗</span></a></article>)}</div></section>
  <section className="boundary wrap"><p className="section-label">The operating stance</p><div><h2>Evidence before theater. Context before software. A bounded build before transformation claims.</h2><p>Hawaiʻi is the place from which the practice operates and a reminder that technology enters living systems with histories, obligations, and uneven consequences. It is not a claim to speak for all of Hawaiʻi or decorative brand material.</p><p className="quiet-note">This page identifies selected public work; it is not a complete curriculum vitae. Aloha AI does not present RN as a licensed attorney, auditor, certifier, or substitute for regulated professional advice.</p></div></section>
</main></SiteShell>}
