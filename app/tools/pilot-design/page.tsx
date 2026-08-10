import type {Metadata} from "next";
import Link from "next/link";
import {SiteShell} from "../../site-shell";
import {PilotDesignKit} from "./pilot-design-kit";

export const metadata:Metadata={title:"Pilot Design Kit",description:"Design one bounded AI pilot with explicit evidence, authority, stop, rollback, and end-of-pilot decision conditions."};

const sources=[
  ["NIST AI Risk Management Framework 1.0","https://nvlpubs.nist.gov/nistpubs/ai/nist.ai.100-1.pdf"],
  ["NIST AI RMF Playbook","https://airc.nist.gov/airmf-resources/playbook/"],
  ["GAO AI Accountability Framework","https://www.gao.gov/products/gao-21-519sp"],
] as const;

export default function PilotDesignPage(){return <SiteShell><main id="main">
  <section className="page-hero wrap"><p className="kicker">Pilot Design Kit · governed release 04</p><h1>Make the pilot earn the right to continue—<em>before it starts.</em></h1><p className="lede">Define one bounded hypothesis, the current baseline, affected-party input, measures, authority, incident handling, and precommitted stop and rollback conditions. Then preserve an explicit end-of-pilot decision instead of allowing a test to drift into deployment.</p><a className="workspace-jump" href="#workspace">Go directly to the builder ↓</a></section>
  <PilotDesignKit/>
  <section className="wrap offer-grid"><article><p className="section-label">Primary framework desk</p><h2>Why the kit separates learning from permission</h2><p>NIST organizes AI risk work across Govern, Map, Measure, and Manage and supports documented go/no-go decisions. GAO emphasizes governance, data, performance, and monitoring over time. The kit translates those themes into a self-authored pilot record; it does not establish conformity.</p><ul className="plain-list">{sources.map(([label,href])=><li key={href}><a href={href} rel="noreferrer">{label} ↗</a></li>)}</ul></article><aside><p className="section-label">Boundary</p><h2>A design record—not authorization.</h2><p>A completed form does not approve a pilot, replace legal or specialist review, verify evidence, or authorize deployment. A failed or unresolved readiness gate means do not start.</p><Link className="text-link" href="/policies">Review Aloha AI’s boundaries →</Link></aside></section>
</main></SiteShell>}
