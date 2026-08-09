"use client";

import Link from "next/link";
import { useState } from "react";

const situations = [
  { label: "We are using AI without a coherent system", route: "/organizations", destination: "Organizational work", promise: "See how a bounded engagement would begin. Commercial scope remains under evidence review." },
  { label: "We need to choose a tool or vendor", route: "/work/ai-tool-vendor-decision", destination: "Requirements and evidence", promise: "Examine a decision workspace—not an automatic ranking or recommendation engine." },
  { label: "A recurring workflow is breaking", route: "/work/workflow-diagnostic-redesign", destination: "Workflow conditions", promise: "See the conditions a facilitated inquiry would examine before prescribing technology." },
  { label: "We need a defensible decision", route: "/work/ai-decision-review", destination: "Decision record", promise: "Explore how evidence, assumptions, ownership, and review triggers can be preserved." },
  { label: "I want to learn before hiring anyone", route: "/learning", destination: "Learning", promise: "Start with public learning and sources. Dates, formats, and prices remain inactive until verified." },
];

export function HomeExperience() {
  const [selected, setSelected] = useState(0);
  const current = situations[selected];
  return <>
    <section className="decision-hero wrap">
      <div className="decision-copy"><p className="kicker">Aloha AI · Honolulu, Hawaiʻi</p><h1>See the system.<br/><em>Make the decision hold.</em></h1><p className="lede">Aloha AI examines consequential AI, workflow, and implementation questions through evidence, context, accountable ownership, and explicit uncertainty.</p><div className="actions"><a className="button primary" href="#choose">Choose your situation</a><Link className="button" href="/studio">Use the Opportunity Studio</Link></div><p className="quiet-note">The Opportunity Studio is the only currently usable tool. Other services and product candidates remain unavailable and unpriced while their evidence and operating requirements are adjudicated.</p></div>
      <div className="living-field" aria-label="A living decision field showing evidence, people, ownership, and review">
        <div className="field-orbit orbit-one"><span>Evidence</span></div><div className="field-orbit orbit-two"><span>People</span></div><div className="field-orbit orbit-three"><span>Ownership</span></div><div className="field-core"><b>Decision</b><small>bounded · dated · reviewable</small></div>
      </div>
    </section>
    <section className="mess-section"><div className="wrap"><p className="section-label">From mess to decision</p><div className="mess-grid"><article><span>01</span><h2>Define the actual decision</h2><p>Separate a decision from a vague wish to “use AI.” Name the outcome, affected people, owner, constraints, and non-AI alternatives.</p></article><article><span>02</span><h2>Examine the conditions</h2><p>Gather primary evidence, workflow realities, exceptions, uncertainty, competing values, and missing information.</p></article><article><span>03</span><h2>Preserve the reasoning</h2><p>Record assumptions, choices, limits, stop conditions, review triggers, and who is accountable for what happens next.</p></article></div></div></section>
    <section id="choose" className="situation-section wrap"><div><p className="section-label">Choose your situation</p><h2>Start with the problem you recognize.</h2><div className="situation-options" role="list">{situations.map((item, index)=><button key={item.label} type="button" aria-pressed={selected===index} onClick={()=>setSelected(index)}><span>{String(index+1).padStart(2,"0")}</span>{item.label}</button>)}</div></div><aside aria-live="polite"><p className="section-label">Matching destination</p><h3>{current.destination}</h3><p>{current.promise}</p><Link className="button primary" href={current.route}>Open this route</Link><small>Status: exploration only; no purchase or booking is active.</small></aside></section>
    <section className="evidence-preview wrap"><div><p className="section-label">The evidence desk</p><h2>Every conclusion needs support, limits, and an update trigger.</h2></div><div className="evidence-records"><article><b>Claim</b><p>What the public language says—no more than the evidence and actual capability support.</p></article><article><b>Source</b><p>The primary authority, original research, official documentation, or first-party dataset.</p></article><article><b>Limit</b><p>Where the evidence does not transfer, what conflicts, and what remains unknown.</p></article><article><b>Review</b><p>The date, owner, correction path, update trigger, and retirement condition.</p></article></div><Link className="text-link" href="/insights">Enter the Source Desk →</Link></section>
  </>;
}
