import type { Metadata } from "next";
import { SiteShell } from "../site-shell";
import { PublicSearch } from "./public-search";

export const metadata:Metadata={title:"Search Aloha AI",description:"Find Aloha AI courses, tools, evidence, policies, support, and ways to work with RN Collins."};

export default function Search(){return <SiteShell><main id="main"><section className="page-hero wrap"><p className="kicker">Search Aloha AI</p><h1>Find the course, tool, evidence, or <em>way to work with RN.</em></h1><p className="lede">Search what is publicly available now. Every result states whether it is ready to use, still developing, or unavailable.</p></section><PublicSearch/></main></SiteShell>}
