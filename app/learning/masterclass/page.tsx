import Link from "next/link";
import type {Metadata} from "next";
import {SiteShell} from "../../site-shell";

export const metadata:Metadata={title:"Aloha AI Masterclass",description:"Review the planned free Aloha AI masterclass on deciding where AI belongs before registration opens."};
const outcomes=[
  ["01","Make the work visible","Map the workflow, people, evidence, exceptions, and consequences before evaluating a tool."],
  ["02","Test the operating conditions","Identify authority, review, accessibility, privacy, fallback, measurement, and stop requirements."],
  ["03","Compare more than automation","Keep process repair, human-led work, investigation, and no action available as legitimate outcomes."],
  ["04","Leave with a bounded next step","Define what must be learned or repaired before any pilot, procurement, or deployment decision."],
];
export default function Masterclass(){return <SiteShell><main id="main">
  <section className="page-hero wrap"><p className="kicker">Free Aloha AI Masterclass · preparing for registration</p><h1>What should we <em>actually use AI for?</em></h1><p className="lede">A planned evidence-grounded learning session on examining the work before choosing a tool—and recognizing when redesign, human-led work, or more investigation is the responsible finding.</p><div className="actions"><span className="button primary" aria-disabled="true">Registration preparing</span><Link className="button" href="/insights">Open the Source Desk</Link></div></section>
  <section className="event-status"><div className="wrap event-status-grid"><div><span>Price</span><strong>Free</strong></div><div><span>Cadence</span><strong>Under review</strong></div><div><span>Format</span><strong>Under review</strong></div><div><span>Registration</span><strong>Not yet open</strong></div></div></section>
  <section className="wrap pathways"><div className="section-head"><div><p className="section-label">Planned learning outcomes</p><h2>Decide before deploying.</h2></div><p>“No AI,” “not yet,” and “redesign first” remain valid findings.</p></div><div className="path-list">{outcomes.map(x=><article className="path-row" key={x[0]}><span className="path-num">{x[0]}</span><div><h3>{x[1]}</h3><p>{x[2]}</p></div><span className="event-result">Planned outcome</span></article>)}</div></section>
  <section className="offer-grid wrap"><article className="offer-card"><p className="section-label">Public boundary</p><h2>General education—not individualized advice.</h2><p>The masterclass will use general or fictional examples. It will not diagnose participant work, recommend a vendor, provide legal advice, certify readiness, or promise that AI belongs in a workflow.</p><Link className="text-link" href="/work/ai-opportunity-clinic">Need collaborative application? Review the Clinic →</Link></article><aside><p className="section-label">Before registration opens</p><h2>Operations must support the promise.</h2><p>Cadence, capacity, duration, delivery platform, accessibility and accommodation process, facilitation protocol, privacy, materials, and evaluation must be finalized before registration is activated.</p></aside></section>
</main></SiteShell>}
