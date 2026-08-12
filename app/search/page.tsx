import type { Metadata } from "next";
import { SiteShell } from "../site-shell";
import { PublicSearch } from "./public-search";

export const metadata:Metadata={title:"Search public records",description:"Search Aloha AI’s current public tools, learning materials, service records, evidence, policies, and support routes."};

export default function Search(){return <SiteShell><main id="main"><section className="page-hero wrap"><p className="kicker">Search · public index</p><h1>Find current public records <em>in plain language.</em></h1><p className="lede">This hand-maintained directory includes complete open learning, working browser-local tools, available and candidate services, public evidence, and operating boundaries at their stated status. Private records, superseded content, and unpublished drafts are excluded.</p></section><PublicSearch/></main></SiteShell>}
