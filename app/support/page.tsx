import Link from "next/link";
import type {Metadata} from "next";
import {SiteShell} from "../site-shell";
export const metadata:Metadata={title:"Support and accessibility",description:"Understand Aloha AI’s keyboard, zoom, motion, browser-local privacy, record-recovery, and public-feedback boundaries."};
const access=[
  ["Keyboard", "A skip link appears on focus. Native links, buttons, fieldsets, labels, and progress elements support keyboard navigation."],
  ["Reading and zoom", "Pages reflow for smaller screens and browser zoom. Tools use text labels rather than color alone to communicate status."],
  ["Motion", "Reduced-motion preferences disable animated interface movement."],
  ["Privacy", "The four interactive tools keep entries in your browser. They do not submit answers to Aloha AI; each tool lets you export or clear its record."],
];
export default function Support(){return <SiteShell><main id="main">
  <section className="page-hero wrap"><p className="kicker">Support & accessibility</p><h1>Know what works, what stays private, <em>and where the limits are.</em></h1><p className="lede">This page documents the support the current public site can truthfully provide. There is no active account, purchasing, event-registration, or confidential-support system.</p></section>
  <section className="trust-section wrap"><div className="section-head"><p className="section-label">Built-in access</p><h2>Use the site in the way that works for you.</h2></div><div className="trust-grid">{access.map(item=><article key={item[0]}><h3>{item[0]}</h3><p>{item[1]}</p></article>)}</div></section>
  <section className="boundary wrap"><p className="section-label">If something breaks</p><div><h2>Protect your information first.</h2><p>Do not place confidential, privileged, patient, student, client, employer-restricted, payment, or security-sensitive information into a site tool or an unverified message. If a browser-local record becomes inaccessible, use its download controls before clearing browser data when possible; Aloha AI cannot recover local records.</p><p>For non-sensitive public-site feedback, you can contact RN through the public <a href="https://www.linkedin.com/in/rn-collins" target="_blank" rel="noreferrer">LinkedIn profile</a>. This is not an emergency, security-incident, accommodation, legal, or customer-support channel, and no response time is promised.</p><div className="actions"><Link className="button primary" href="/tools">Return to tools</Link><Link className="button" href="/policies">Read site boundaries</Link></div></div></section>
  <section className="boundary wrap"><p className="section-label">Emergency boundary</p><div><h2>The public site is not an emergency service.</h2><p>Urgent safety, medical, legal, financial, security, or crisis matters require the appropriate qualified or emergency channel.</p></div></section>
</main></SiteShell>}
