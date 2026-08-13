"use client";

import Link from "next/link";
import {useState} from "react";

const situations=[
 {label:"We need a real AI plan—not another list of tools",route:"/contact",destination:"Start with RN",promise:"Bring the recurring work, the pressure point, and what needs to become possible. RN will help determine the useful next step."},
 {label:"We cannot keep up with changing evidence, rules, or markets",route:"/contact",destination:"Make the evidence usable",promise:"Turn a shifting body of information into an inspectable source system, brief, workflow, or decision structure."},
 {label:"Important knowledge is not reaching the people who need it",route:"/contact",destination:"Build the translation layer",promise:"Research what is getting lost, identify the gap, and create the tool, learning experience, or communication system the work requires."},
 {label:"We are considering AI but do not know if it belongs here",route:"/studio",destination:"Use the Opportunity Studio",promise:"Examine one bounded workflow before choosing a product, pilot, or automation strategy."},
 {label:"I want to learn or work through this myself first",route:"/start",destination:"Choose a public starting point",promise:"Use a free decision tool, take a complete self-directed course, or inspect the twelve-month Decision Desk plan."},
];

const practice=[
 ["Research the entity and the work","RN reads across the organization, evidence, context, people, constraints, and the work as it actually happens."],
 ["Find the gaps and pressure points","The recurring friction, hidden dependencies, missing evidence, and consequential decisions become concrete and visible."],
 ["Make what the situation requires","That may be a strategy, brief, system, tool, prototype, curriculum, facilitation, operating plan, or something the original request did not name."],
];

export function HomeExperience(){
 const [selected,setSelected]=useState(0); const current=situations[selected];
 return <>
  <section className="decision-hero wrap"><div className="decision-copy"><p className="kicker">Aloha AI · the practice of RN Collins</p><h1>Bring me the messy<br/><em>AI question.</em></h1><p className="lede">I research the organization and the work, find the gaps and pressure points, make them concrete and visible, and then research, design, draft, build, facilitate, or strategize what the situation requires.</p><div className="actions"><Link className="button primary" href="/work">Work with RN</Link><Link className="button" href="/about#selected-work">See selected work</Link></div><p className="quiet-note">You do not need to arrive with a polished brief—or know which service to request.</p></div><div className="living-field" aria-label="A practice moving from a complex situation to a useful intervention"><div className="field-orbit orbit-one"><span>Research</span></div><div className="field-orbit orbit-two"><span>Expose</span></div><div className="field-orbit orbit-three"><span>Build</span></div><div className="field-core"><b>Useful work</b><small>concrete · visible · usable</small></div></div></section>
  <section className="mess-section"><div className="wrap"><p className="section-label">What the practice does</p><div className="mess-grid">{practice.map((item,index)=><article key={item[0]}><span>{String(index+1).padStart(2,"0")}</span><h2>{item[0]}</h2><p>{item[1]}</p></article>)}</div></div></section>
  <section id="choose" className="situation-section wrap"><div><p className="section-label">What is making the work harder than it should be?</p><h2>Start with the problem you recognize.</h2><div className="situation-options" role="list">{situations.map((item,index)=><button key={item.label} type="button" aria-pressed={selected===index} onClick={()=>setSelected(index)}><span>{String(index+1).padStart(2,"0")}</span>{item.label}</button>)}</div></div><aside aria-live="polite"><p className="section-label">A useful next move</p><h3>{current.destination}</h3><p>{current.promise}</p><Link className="button primary" href={current.route}>Continue</Link><small>Start contained. Expand when the work earns it.</small></aside></section>
  <section className="evidence-preview wrap"><div><p className="section-label">Proof you can inspect</p><h2>The public work is usable—and its limits stay visible.</h2><p>Courses, tools, source records, and selected publications let you examine the thinking before beginning a conversation.</p></div><div className="evidence-records"><article><b>Learn</b><p>Use the complete flagship masterclass, Citation Verifier course, and public Decision Desk editions.</p><Link className="text-link" href="/learning">Explore learning →</Link></article><article><b>Decide</b><p>Use browser-local tools to examine a workflow, preserve a decision, compare options, or design a pilot.</p><div><Link href="/tools/decision-record">Decision record</Link> · <Link href="/tools/vendor-comparison">Vendor comparison</Link> · <Link href="/tools/pilot-design">Pilot design</Link></div></article><article><b>Verify</b><p>Inspect selected work and the sources, limits, and update triggers behind public claims.</p><Link className="text-link" href="/insights">Open the Source Desk →</Link></article><article><b>Talk</b><p>Tell RN what keeps recurring, where judgment matters, and what must become easier to operate.</p><Link className="text-link" href="/contact">Contact RN →</Link></article></div></section>
 </>;
}
