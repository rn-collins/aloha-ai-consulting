import type { Metadata } from "next";
import { SiteShell } from "../site-shell";
import { PublicSearch } from "./public-search";

export const metadata:Metadata={title:"Search active records",description:"Search Aloha AI’s current public tools, learning, services, evidence, policies, and support routes."};

export default function Search(){return <SiteShell><main id="main"><section className="page-hero wrap"><p className="kicker">Search · governed index</p><h1>Find active public records <em>in plain language.</em></h1><p className="lede">Search only the current canonical pages. Drafts, private Studio records, deferred tools, and superseded content are excluded.</p></section><PublicSearch/></main></SiteShell>}
