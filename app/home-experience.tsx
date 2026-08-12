"use client";

import Link from "next/link";
import { useState } from "react";

const situations = [
  { label: "We are using AI without a coherent system", route: "/studio", destination: "Opportunity Studio", promise: "Map one bounded workflow and surface the conditions that control whether AI belongs there." },
  { label: "We need to choose a tool or vendor", route: "/tools/vendor-comparison", destination: "Tool & Vendor Comparison Builder", promise: "Compare the current process and two candidates without letting features or price erase unresolved safeguards." },
  { label: "We need a defensible decision record", route: "/tools/decision-record", destination: "Decision Record Builder", promise: "Preserve the owner, alternatives, evidence, affected people, uncertainty, stop conditions, and next review." },
  { label: "We are planning an AI pilot", route: "/tools/pilot-design", destination: "Pilot Design Kit", promise: "Precommit the hypothesis, baseline, evidence plan, authority, stop, rollback, and end-of-pilot decision." },
  { label: "I want to learn before hiring anyone", route: "/learning", destination: "Flagship learning", promise: "Take the 90-minute AI & Your Work masterclass, study the 15-hour Citation Verifier course, or inspect the twelve-month Decision Desk program." },
];

export function HomeExperience() {
  const [selected, setSelected] = useState(0);
  const current = situations[selected];
  return <>
    <section className="decision-hero wrap">
      <div className="decision-copy"><p className="kicker">Aloha AI · Honolulu, Hawaiʻi</p><h1>See the system.<br/><em>Make the decision hold.</em></h1><p className="lede">Free, private decision tools and open learning for people deciding where AI belongs, what it requires, and when to stop.</p><div className="actions"><a className="button primary" href="#choose">Find the right starting point</a><Link className="button" href="/tools">Explore all four tools</Link></div><p className="quiet-note">No account required. Your entries in the tools stay in your browser. Aloha AI does not receive or review them.</p></div>
      <div className="living-field" aria-label="A living decision field showing evidence, people, ownership, and review">
        <div className="field-orbit orbit-one"><span>Evidence</span></div><div className="field-orbit orbit-two"><span>People</span></div><div className="field-orbit orbit-three"><span>Ownership</span></div><div className="field-core"><b>Decision</b><small>bounded · dated · reviewable</small></div>
      </div>
    </section>
    <section className="mess-section"><div className="wrap"><p className="section-label">From mess to decision</p><div className="mess-grid"><article><span>01</span><h2>Define the actual decision</h2><p>Separate a decision from a vague wish to “use AI.” Name the outcome, affected people, owner, constraints, and non-AI alternatives.</p></article><article><span>02</span><h2>Examine the conditions</h2><p>Gather primary evidence, workflow realities, exceptions, uncertainty, competing values, and missing information.</p></article><article><span>03</span><h2>Preserve the reasoning</h2><p>Record assumptions, choices, limits, stop conditions, review triggers, and who is accountable for what happens next.</p></article></div></div></section>
    <section id="choose" className="situation-section wrap"><div><p className="section-label">Choose your situation</p><h2>Start with the problem you recognize.</h2><div className="situation-options" role="list">{situations.map((item, index)=><button key={item.label} type="button" aria-pressed={selected===index} onClick={()=>setSelected(index)}><span>{String(index+1).padStart(2,"0")}</span>{item.label}</button>)}</div></div><aside aria-live="polite"><p className="section-label">Your starting point</p><h3>{current.destination}</h3><p>{current.promise}</p><Link className="button primary" href={current.route}>Start now</Link><small>Free to use · no account · clear limits inside</small></aside></section>
    <section className="evidence-preview wrap"><div><p className="section-label">The evidence desk</p><h2>Every conclusion needs support, limits, and an update trigger.</h2></div><div className="evidence-records"><article><b>Claim</b><p>What the public language says—no more than the evidence and actual capability support.</p></article><article><b>Source</b><p>The primary authority, original research, official documentation, or first-party dataset.</p></article><article><b>Limit</b><p>Where the evidence does not transfer, what conflicts, and what remains unknown.</p></article><article><b>Review</b><p>The date, owner, correction path, update trigger, and retirement condition.</p></article></div><Link className="text-link" href="/insights">Enter the Source Desk →</Link></section>
  </>;
}
