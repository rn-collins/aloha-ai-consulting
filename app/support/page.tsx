import Link from "next/link";
import type {Metadata} from "next";
import {SiteShell} from "../site-shell";
export const metadata:Metadata={title:"Support and accessibility",description:"Understand Aloha AI’s keyboard, zoom, motion, browser-local privacy, record-recovery, and public-feedback boundaries."};
const access=[
  ["Keyboard", "A skip link appears on focus. Native links, buttons, fieldsets, labels, and progress elements support keyboard navigation."],
  ["Reading and zoom", "Pages reflow for smaller screens and browser zoom. Tools use text labels rather than color alone to communicate status."],
  ["Motion", "Reduced-motion preferences disable animated interface movement."],
  ["Privacy", "Interactive tools and learning workspaces identified on their pages keep entries and progress in this browser. They do not submit those browser-local entries to Aloha AI through the tool itself. Export records you need; clearing site data or changing devices can remove them."],
];

const implemented=[
 ["A skip link that is really there","The first focusable element on every page moves focus to the main region. It is positioned off-screen until it receives focus, then becomes visible at the top left.","Press Tab once on any page before touching anything else."],
 ["A focus indicator designed for both backgrounds","Focused controls get a white outline with an offset, wrapped in a dark outer ring, so the indicator survives on cream page backgrounds and on the dark header and status bands alike.","Tab through the header, a tool's form fields, and the footer, and watch the ring stay visible across all three."],
 ["Reduced motion is honoured globally","With the system reduced-motion preference set, animation durations collapse, transitions stop, and smooth scrolling reverts to instant jumps across every element on the site, not only decorative ones.","Turn the preference on in your operating system and reload."],
 ["Increased contrast strengthens the interface","With the increased-contrast preference set, focus outlines thicken to four pixels in the current text colour and controls take a two-pixel border.","Turn on “increase contrast” in your system settings."],
 ["Forced-colours mode is not fought","In forced-colours mode, decorative shadows are dropped, controls take a border in the system button colour, and background art is removed rather than being pinned in place underneath system colours.","Enable a high-contrast or forced-colours theme."],
 ["Touch targets grow on small screens","Below 760 pixels wide, buttons, inputs, selects, menu links and disclosure summaries take a 48-pixel minimum height, and checkboxes in the courses and checklists grow to 24 pixels.","Open a course or a builder on a phone."],
 ["Status is stated in words","Progress, saved state, gate results and readiness are labelled in text. Colour reinforces those labels; it never carries the meaning alone, and live status messages are announced politely rather than interrupting.","Read any tool with colour ignored — the meaning survives."],
 ["Printing produces a record, not a screenshot","The print stylesheet hides navigation, footers and controls, forces collapsed disclosure sections open so nothing is silently omitted, preserves tables and text areas, keeps records from breaking across pages, and prints the destination of every external link after its text.","Print any Decision Desk issue or a completed builder to PDF."],
];

const storage=[
 ["What is stored","Seventeen workspaces on this site — the Opportunity Studio, three decision builders, both courses and eleven Decision Desk instruments — write to your browser's local storage under keys beginning aloha-ai. Nothing else is written, and nothing is sent."],
 ["Where it is not","Not on a server, not in an account, not on your other devices, and not in a backup. There is no copy of your work anywhere except the browser profile you typed it into."],
 ["What destroys it","Clearing site data or cookies for this domain, browsing in a private or incognito window, a browser setting that discards site data on close, switching browsers or devices, and some “clean-up” utilities. Any of these removes the record with no warning and no recovery."],
 ["What to do about it","Every workspace has an export control that writes a Markdown, JSON or plain-text file to your device. Use it at the end of a session rather than at the end of a project. An exported file is the only durable copy, and it is yours."],
];

export default function Support(){return <SiteShell><main id="main">
  <section className="page-hero wrap"><p className="kicker">Support & accessibility</p><h1>Know what works, what stays private, <em>and where the limits are.</em></h1><p className="lede">This page documents the support the current public site can truthfully provide. For a general nonconfidential project conversation or public-site feedback, use the Contact RN route. There is no active account, checkout, event-registration, or confidential-support system.</p><div className="actions"><Link className="button primary" href="/contact">Contact RN</Link><Link className="button" href="/policies">Read site boundaries</Link></div></section>

  <section className="trust-section wrap"><div className="section-head"><p className="section-label">Built-in access</p><h2>Use the site in the way that works for you.</h2></div><div className="trust-grid">{access.map(item=><article key={item[0]}><h3>{item[0]}</h3><p>{item[1]}</p></article>)}</div></section>

  <section className="ledger-section wrap"><div className="section-head"><p className="section-label">What is actually implemented</p><div><h2>Eight behaviours, and how to confirm each one.</h2><p className="ledger-lede">This is a description of what the interface does, not a conformance claim about what it achieves. No accessibility audit, VPAT, or conformance report has been produced for this site, and the difference between those two statements matters: the list below can be checked in a few minutes, and a conformance claim cannot be checked at all without the report that does not exist.</p></div></div>
   <div className="ledger">{implemented.map((item,i)=><article className="ledger-row" key={item[0]}><span className="ledger-index">{String(i+1).padStart(2,"0")}</span><div className="ledger-body"><h3>{item[0]}</h3><div className="ledger-pair"><div><b>What it does</b><p>{item[1]}</p></div><div><b>Confirm it yourself</b><p>{item[2]}</p></div></div></div></article>)}</div>
  </section>

  <section className="ledger-section wrap"><div className="section-head"><p className="section-label">Your work, and where it lives</p><div><h2>Browser-local means genuinely local, with the consequence that implies.</h2><p className="ledger-lede">The privacy property and the fragility are the same property. Storing nothing on a server means there is nothing to request, subpoena, or lose in a breach — and nothing to restore when the record is gone.</p></div></div>
   <div className="ledger">{storage.map((s,i)=><article className="ledger-row" key={s[0]}><span className="ledger-index">{String(i+1).padStart(2,"0")}</span><div className="ledger-body"><h3>{s[0]}</h3><p>{s[1]}</p></div></article>)}</div>
   <div className="figure-strip"><div><strong>17</strong><span>Workspaces that save locally</span></div><div><strong>0</strong><span>Server-side copies</span></div><div><strong>0</strong><span>Accounts required</span></div><div><strong>1</strong><span>Export control per workspace</span></div></div>
  </section>

  <section className="boundary wrap"><p className="section-label">If something breaks</p><div><h2>Protect your information first.</h2><p>Do not place confidential, privileged, patient, student, client, employer-restricted, payment, or security-sensitive information into a site tool or an unverified message. If a browser-local record becomes inaccessible, use its download controls before clearing browser data when possible; Aloha AI cannot recover local records.</p><p>When the Clinic inquiry is open, select its access follow-up option without entering medical details. A response is normally sent within five business days, but that timing is not guaranteed. If the form is closed, no separate Clinic accommodation route is active.</p><p>For non-sensitive public-site feedback only, you can contact RN through the public <a href="https://www.linkedin.com/in/rn-collins" target="_blank" rel="noreferrer">LinkedIn profile</a>. LinkedIn is not an emergency, security-incident, accommodation, legal, or customer-support channel.</p><div className="actions"><Link className="button primary" href="/work/ai-opportunity-clinic#clinic-inquiry">Clinic inquiry</Link><Link className="button" href="/policies">Read site boundaries</Link></div></div></section>

  <section className="boundary wrap"><p className="section-label">Emergency boundary</p><div><h2>The public site is not an emergency service.</h2><p>Urgent safety, medical, legal, financial, security, or crisis matters require the appropriate qualified or emergency channel.</p></div></section>
</main></SiteShell>}
