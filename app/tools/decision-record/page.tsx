import type {Metadata} from "next";
import Link from "next/link";
import {SiteShell} from "../../site-shell";
import {DecisionRecordBuilder} from "./record-builder";

export const metadata:Metadata={title:"Decision Record Builder",description:"Create a private, portable record of one AI or workflow decision."};

const sources=[
  ["NIST AI Risk Management Framework 1.0","https://nvlpubs.nist.gov/nistpubs/ai/nist.ai.100-1.pdf"],
  ["NIST AI RMF Playbook","https://airc.nist.gov/airmf-resources/playbook/"],
  ["GAO AI Accountability Framework","https://www.gao.gov/products/gao-21-519sp"],
] as const;

export default function DecisionRecordPage(){return <SiteShell><main id="main">
  <section className="page-hero wrap"><p className="kicker">Decision Record Builder · governed release 02</p><h1>Preserve the reasoning—<em>not just the answer.</em></h1><p className="lede">Create a versioned record of one bounded AI, workflow, pilot, or vendor decision: who owns it, which alternatives were considered, what evidence supports it, who may be affected, what would stop it, and when it must be reviewed again.</p><a className="workspace-jump" href="#workspace">Go directly to the builder ↓</a></section>
  <DecisionRecordBuilder/>
  <section className="wrap offer-grid"><article><p className="section-label">Primary framework desk</p><h2>Why these fields exist</h2><p>NIST organizes AI risk work around govern, map, measure, and manage, emphasizes defined roles and lifecycle documentation, and states that its actions are not a universal checklist. GAO organizes accountability around governance, data, performance, and monitoring. This builder translates those framework themes into a portable working record; it does not certify framework conformance.</p><ul className="plain-list">{sources.map(([label,href])=><li key={href}><a href={href} rel="noreferrer">{label} ↗</a></li>)}</ul></article><aside><p className="section-label">Boundary</p><h2>A record—not an approval engine.</h2><p>The builder does not decide whether AI is appropriate, calculate risk, verify evidence, provide legal advice, or establish compliance. A named person with authority remains responsible for the decision and any specialist review.</p><Link className="text-link" href="/policies">Review Aloha AI’s boundaries →</Link></aside></section>
</main></SiteShell>}
