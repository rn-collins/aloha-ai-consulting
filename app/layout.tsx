import type { Metadata } from "next";
import "./globals.css";
import {PwaLifecycle} from "./pwa-lifecycle";

export const metadata: Metadata = {
  metadataBase: new URL("https://aloha-ai-consulting.vercel.app"),
  title: { default: "Aloha AI — Make complex AI work concrete", template: "%s · Aloha AI" },
  description: "RN Collins researches complex organizations and work, finds the gaps, and turns them into useful strategy, systems, tools, learning, and builds.",
  applicationName: "Aloha AI",
  authors: [{name:"RN Collins",url:"/about/"}],
  creator: "RN Collins",
  publisher: "Aloha AI",
  keywords: ["AI strategy","AI governance","workflow design","AI decision tools","responsible AI","RN Collins","Honolulu"],
  alternates: {types:{"application/rss+xml":"/feed.xml"}},
  manifest: "/manifest.webmanifest",
  openGraph: {title:"Aloha AI — Make complex AI work concrete",description:"Research, decision infrastructure, practical tools, and learning for examining consequential AI work before acting.",url:"/",siteName:"Aloha AI",locale:"en_US",type:"website"},
  twitter: {card:"summary_large_image",title:"Aloha AI — Make complex AI work concrete",description:"Research, decision infrastructure, practical tools, and learning for examining consequential AI work before acting."},
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const graph={"@context":"https://schema.org","@graph":[{"@type":"ProfessionalService","@id":"https://aloha-ai-consulting.vercel.app/#organization",name:"Aloha AI",url:"https://aloha-ai-consulting.vercel.app/",founder:{"@id":"https://aloha-ai-consulting.vercel.app/#rn-collins"},areaServed:"Remote"},{"@type":"Person","@id":"https://aloha-ai-consulting.vercel.app/#rn-collins",name:"RN Collins",url:"https://aloha-ai-consulting.vercel.app/about/",sameAs:["https://www.linkedin.com/in/rn-collins"]},{"@type":"WebSite","@id":"https://aloha-ai-consulting.vercel.app/#website",name:"Aloha AI",url:"https://aloha-ai-consulting.vercel.app/",publisher:{"@id":"https://aloha-ai-consulting.vercel.app/#organization"},inLanguage:"en-US"}]};
  return <html lang="en"><body><script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(graph)}}/><PwaLifecycle/>{children}</body></html>;
}
