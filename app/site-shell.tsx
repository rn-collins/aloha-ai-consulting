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
        <Link className="nav-action" href="/contact">Contact RN <span aria-hidden="true">↗</span></Link>
      </div>
    </header>
    {children}
    {!immersive && <footer><div className="wrap footer-grid"><div><strong>ALOHA AI</strong><p>RN Collins researches complex work, makes its gaps visible, and builds what the situation requires.</p></div><div><p className="section-label">Work</p><Link href="/work">Work with RN</Link><Link href="/contact">Contact RN</Link><Link href="/about#selected-work">Selected work</Link><Link href="/organizations">For organizations</Link></div><div><p className="section-label">Use</p><Link href="/learning">Courses & masterclasses</Link><Link href="/learning/decision-desk">Decision Desk</Link><Link href="/tools">Free tools</Link><Link href="/insights">Source Desk</Link></div><div><p className="section-label">Standards</p><Link href="/policies">Policies</Link><Link href="/support">Support & accessibility</Link><Link href="/procurement">Procurement</Link><p>Honolulu, Hawaiʻi</p></div></div></footer>}
  </>;
}
