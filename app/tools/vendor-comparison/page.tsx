import type {Metadata} from "next";
import Link from "next/link";
import {SiteShell} from "../../site-shell";
import {VendorComparisonBuilder} from "./vendor-comparison-builder";

export const metadata:Metadata={title:"Tool & Vendor Comparison Builder",description:"Compare a current process and candidate tools without allowing price or features to erase unresolved safeguards."};

const sources=[
  ["NIST AI Risk Management Framework 1.0","https://nvlpubs.nist.gov/nistpubs/ai/nist.ai.100-1.pdf"],
  ["NIST Secure Software Development Framework 1.1","https://csrc.nist.gov/pubs/sp/800/218/final"],
  ["CISA Secure by Design","https://www.cisa.gov/securebydesign"],
  ["U.S. Access Board: Section 508 Standards","https://www.access-board.gov/ict/"],
] as const;

export default function VendorComparisonPage(){return <SiteShell><main id="main">
  <section className="page-hero wrap"><p className="kicker">Tool &amp; Vendor Comparison Builder · governed release 03</p><h1>Compare options without letting the shiny parts <em>erase the hard questions.</em></h1><p className="lede">Frame one bounded decision, compare the current process with two candidates, preserve the evidence behind each judgment, and keep unresolved privacy, security, accessibility, verification, or exit conditions visible.</p></section>
  <VendorComparisonBuilder/>
  <section className="wrap offer-grid"><article><p className="section-label">Primary framework desk</p><h2>Why gates come before ranking</h2><p>NIST separates governance, context, measurement, and management; its AI RMF also calls for documented roles, impacts, and ongoing review. NIST, CISA, and the U.S. Access Board provide official software-security, secure-by-design, and accessibility expectations. This builder turns those themes into questions and an evidence record. It does not certify a product or supplier.</p><ul className="plain-list">{sources.map(([label,href])=><li key={href}><a href={href} rel="noreferrer">{label} ↗</a></li>)}</ul></article><aside><p className="section-label">Boundary</p><h2>A comparison—not due diligence.</h2><p>The builder does not inspect a vendor, validate its claims, negotiate terms, perform legal or security review, or recommend purchase. Scores are user-authored arithmetic summaries; gates and underlying evidence control the next step.</p><Link className="text-link" href="/policies">Review Aloha AI’s boundaries →</Link></aside></section>
</main></SiteShell>}
