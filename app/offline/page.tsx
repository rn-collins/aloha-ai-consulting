import type {Metadata} from "next";import Link from "next/link";import {SiteShell} from "../site-shell";import {ReconnectButton} from "./reconnect-button";
export const metadata:Metadata={title:"Offline",description:"A clear recovery route when Aloha AI cannot reach the network."};

const cached=[
 ["/","The home page"],
 ["/start/","Start here"],
 ["/tools/","The tools index"],
 ["/learning/","The learning index"],
 ["/insights/","The Source Desk"],
 ["/support/","Support and accessibility"],
 ["/policies/","Site policies"],
 ["/offline/","This page"],
];

export default function Offline(){return <SiteShell><main id="main">
 <section className="page-hero wrap"><p className="kicker">Offline · saved shell</p><h1>You are offline—<em>your browser-local work may still be here.</em></h1><p className="lede">Reconnect to open uncached pages or current evidence. Do not clear site data if you need a locally saved course or decision record.</p><div className="actions"><ReconnectButton/><Link className="button" href="/support/">Recovery guidance</Link></div></section>

 <section className="ledger-section wrap"><div className="section-head"><p className="section-label">What is saved</p><div><h2>Eight pages, and nothing pretending to be more.</h2><p className="ledger-lede">A service worker saved a small shell when you first visited. Those eight pages open without a network. Every other address on this site — including the tool and course pages themselves — shows you this page instead, because their content was never stored and there is nothing honest to display in its place.</p></div></div>
  <ul className="state-ledger">{cached.map(c=><li key={c[0]}><p><strong>{c[1]}</strong> <code>{c[0]}</code></p><span className="state yes">Saved</span></li>)}</ul>
 </section>

 <section className="ledger-section wrap"><div className="section-head"><p className="section-label">Your saved work</p><div><h2>Being offline did not touch it. Clearing site data would.</h2></div></div>
  <div className="ledger">
   <article className="ledger-row"><span className="ledger-index">01</span><div className="ledger-body"><h3>The records are still in this browser.</h3><p>Course progress, decision records, comparisons, pilot designs and Studio answers live in this browser&rsquo;s storage, not on a server and not in the page cache. Losing the network does not reach them. They are exactly where you left them, and they will be there when you reconnect.</p></div></article>
   <article className="ledger-row"><span className="ledger-index">02</span><div className="ledger-body"><h3>You need the network to reach the page that reads them.</h3><p>The builders and course workspaces are not among the eight saved pages. Their data survives; the interface that opens it does not load offline. This is a limitation of the cache, not a sign that anything has been lost.</p></div></article>
   <article className="ledger-row"><span className="ledger-index">03</span><div className="ledger-body"><h3>Do not clear site data to fix this.</h3><p>Clearing site data, cookies, or “site storage” for this domain is the one action that genuinely destroys the records, and it cannot be undone by anyone, including Aloha AI. A stubborn offline state is a network problem; treat it as one.</p></div></article>
   <article className="ledger-row"><span className="ledger-index">04</span><div className="ledger-body"><h3>Export as soon as you reconnect.</h3><p>Every workspace writes a Markdown, JSON or plain-text file to your device on request. An exported file is the only copy that survives a cleared browser, a new device, or a private window. Do it at the end of the session rather than the end of the project.</p><Link className="text-link" href="/support/">Read the full recovery guidance →</Link></div></article>
  </div>
 </section>

 <section className="boundary wrap"><p className="section-label">Recovery boundary</p><div><h2>Offline access is deliberately limited.</h2><p>The saved public shell is not proof that evidence, policies, or course materials are current. A cached page is a copy of what this site said at the moment it was stored, and the Source Desk records behind it may have moved, been revised, or been withdrawn since. Export important browser-local records when you reconnect, and re-read anything you intend to rely on.</p></div></section>
</main></SiteShell>}
