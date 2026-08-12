import Link from "next/link";
import type {Metadata} from "next";
import {SiteShell} from "../site-shell";

export const metadata:Metadata={title:"Decision tools",description:"Use four browser-local Aloha AI decision aids with their current functions and product limits stated plainly."};

const tools=[
  {release:"01",state:"Guided prototype",name:"Opportunity Studio",description:"Examine whether AI belongs in one bounded piece of work and see which conditions control the next move.",features:["23 guided decision prompts","Rule-based directional result","Private browser session","Copyable working brief","No validated scoring model or expert review"],href:"/studio",action:"Use the Studio"},
  {release:"02",state:"Working builder",name:"Decision Record Builder",description:"Preserve the owner, alternatives, evidence, affected people, stop conditions, fallback, uncertainty, and review triggers for one decision.",features:["Browser-local autosave","Readable Markdown download","Portable JSON export","No collaborative review, signatures, or evidence verification"],href:"/tools/decision-record",action:"Build a decision record"},
  {release:"03",state:"Working builder",name:"Tool & Vendor Comparison Builder",description:"Compare the current process and two candidates without allowing features or price to erase unresolved safeguards.",features:["Fixed comparison of three options","Five self-recorded evidence gates","Markdown and JSON exports","No due diligence, sensitivity analysis, or recommendation"],href:"/tools/vendor-comparison",action:"Compare options"},
  {release:"04",state:"Working builder",name:"Pilot Design Kit",description:"Precommit the hypothesis, baseline, affected-party input, evidence plan, authority, stop, rollback, and end-of-pilot decision for one test.",features:["Five self-recorded readiness gates","Stop and rollback precommitments","Markdown and JSON exports","No authorization, project management, or outcome evaluation"],href:"/tools/pilot-design",action:"Design a pilot"},
];

export default function Tools(){return <SiteShell><main id="main">
  <section className="page-hero wrap"><p className="kicker">Tools · public working releases 01–04</p><h1>Make one decision more <em>inspectable.</em></h1><p className="lede">These browser-local worksheets are usable public releases, not validated assessment instruments or full workflow products. No account is required, and Aloha AI does not receive what you enter.</p></section>
  <section className="service-cards wrap">{tools.map(tool=><article key={tool.release}><p className="section-label">Release {tool.release} · {tool.state}</p><h2>{tool.name}</h2><p>{tool.description}</p><ul className="scope-list">{tool.features.map(feature=><li key={feature}>{feature}</li>)}</ul><Link className="button primary" href={tool.href}>{tool.action}</Link></article>)}</section>
  <section className="boundary wrap"><p className="section-label">Current product boundary</p><div><h2>Working records—not managed decision systems.</h2><p>These tools do not verify evidence, certify compliance, provide professional advice, authorize action, synchronize across devices, support team review, or guarantee a sound decision. Export anything you need to preserve.</p></div></section>
</main></SiteShell>}
