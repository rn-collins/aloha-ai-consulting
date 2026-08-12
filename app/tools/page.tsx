import Link from "next/link";
import type {Metadata} from "next";
import {SiteShell} from "../site-shell";

export const metadata:Metadata={title:"Decision tools",description:"Use four complete browser-local Aloha AI decision tools with autosave, guided records, gates, and portable exports."};

const tools=[
  {release:"01",state:"Complete browser-local v1",name:"Opportunity Studio",description:"Examine whether AI belongs in one bounded piece of work and see which conditions control the next move.",features:["23 guided prompts across the decision path","Transparent rule-based disposition","Private browser session","Copyable working brief","Explicit evidence and review boundary"],href:"/studio",action:"Use the Studio"},
  {release:"02",state:"Complete browser-local v1",name:"Decision Record Builder",description:"Preserve the owner, alternatives, evidence, affected people, stop conditions, fallback, uncertainty, and review triggers for one decision.",features:["Four guided sections and 20 fields","Core-field completeness indicator","Browser-local autosave","Markdown and portable JSON","Verification and approval boundary"],href:"/tools/decision-record",action:"Build a decision record"},
  {release:"03",state:"Complete browser-local v1",name:"Tool & Vendor Comparison Builder",description:"Compare the current process and two candidates without allowing features or price to erase unresolved safeguards.",features:["Current process plus two candidates","Five controlling evidence gates","Evidence required for every score","Markdown and JSON exports","Blocking gates cannot be averaged away"],href:"/tools/vendor-comparison",action:"Compare options"},
  {release:"04",state:"Complete browser-local v1",name:"Pilot Design Kit",description:"Precommit the hypothesis, baseline, affected-party input, evidence plan, authority, stop, rollback, and end-of-pilot decision for one test.",features:["Five controlling readiness gates","Benefit, harm, workload, and equity measures","Stop, incident, rollback, and fallback plans","Markdown and JSON exports","Deployment decision firewall"],href:"/tools/pilot-design",action:"Design a pilot"},
];

export default function Tools(){return <SiteShell><main id="main">
  <section className="page-hero wrap"><p className="kicker">Tools · complete browser-local releases 01–04</p><h1>Make one decision more <em>inspectable.</em></h1><p className="lede">Each public v1 completes its stated job from guided input through an inspectable result and portable export. No account is required, and Aloha AI does not receive what you enter.</p></section>
  <section className="service-cards wrap">{tools.map(tool=><article key={tool.release}><p className="section-label">Release {tool.release} · {tool.state}</p><h2>{tool.name}</h2><p>{tool.description}</p><ul className="scope-list">{tool.features.map(feature=><li key={feature}>{feature}</li>)}</ul><Link className="button primary" href={tool.href}>{tool.action}</Link></article>)}</section>
  <section className="boundary wrap"><p className="section-label">What “complete” means</p><div><h2>Complete for a private, single-user decision record.</h2><p>Every tool supplies its promised prompts, decision logic or gates, local persistence, readable output, portable export, reset control, and consumer boundary. They are not managed enterprise systems: they do not verify evidence, certify compliance, provide professional advice, authorize action, synchronize devices, manage teams, or guarantee a sound decision. Export anything you need to preserve.</p></div></section>
</main></SiteShell>}
