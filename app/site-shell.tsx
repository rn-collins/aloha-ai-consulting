import Link from "next/link";
import {NavLinks} from "./nav-links";

export function SiteShell({ children, immersive = false }: { children: React.ReactNode; immersive?: boolean }) {
  return <>
    <a className="skip" href="#main">Skip to main content</a>
    <header className={`site-header${immersive ? " immersive-header" : ""}`}>
      <div className="wrap nav-wrap">
        <Link className="brand" href="/" aria-label="Aloha AI home"><span className="brand-mark" aria-hidden="true">✳</span>ALOHA AI<small>RN COLLINS / HONOLULU</small></Link>
        <NavLinks/>
        <details className="mobile-menu">
          <summary>Menu</summary>
          <NavLinks mobile/>
        </details>
        <Link className="nav-action" href="/start">Start here <span aria-hidden="true">↗</span></Link>
      </div>
    </header>
    {children}
    {!immersive && <footer><div className="wrap footer-grid"><div><strong>ALOHA AI</strong><p>Better judgment about where AI belongs—and the capacity to build what holds.</p></div><div><p className="section-label">Navigate</p><Link href="/start">Start here</Link><Link href="/studio">Opportunity Studio</Link><Link href="/work">Ways to work together</Link><Link href="/learning">Learning</Link><Link href="/tools">Tools</Link></div><div><p className="section-label">Standards</p><Link href="/policies">Policies</Link><Link href="/support">Support & accessibility</Link><Link href="/procurement">Procurement</Link><Link href="/sponsor">Sponsorships</Link></div><div><p className="section-label">Place</p><p>Built from Honolulu, Hawaiʻi.<br/>Working across places, sectors, and systems.</p></div></div></footer>}
  </>;
}
