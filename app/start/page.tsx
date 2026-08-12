import Link from "next/link";
import type {Metadata} from "next";
import { SiteShell } from "../site-shell";

export const metadata:Metadata={title:"Start here",description:"Choose the right Aloha AI tool, open course, or work-together record for the decision you need to make."};

const choices=[
 ["01","I am deciding whether AI belongs in a workflow","Map the work, people, evidence, consequences, and constraints before choosing an intervention.","/studio","Use the Opportunity Studio"],
 ["02","I need to document one consequential decision","Preserve the alternatives, evidence, owner, affected people, uncertainty, stop conditions, and review triggers.","/tools/decision-record","Build a decision record"],
 ["03","I need to compare tools or vendors","Compare the current process and two candidates against five non-negotiable gates and your own weighted criteria.","/tools/vendor-comparison","Compare the options"],
 ["04","I am preparing a bounded pilot","Define the hypothesis, baseline, measures, authority, affected-party input, stop, rollback, and final decision before testing.","/tools/pilot-design","Design the pilot"],
 ["05","I want to build and govern a citation-verification system","Take the complete 15-hour open course with eighteen lessons and practices, a lab kit, knowledge checks, capstone, and assessment rubric.","/learning/citation-verifier","Start the course"],
 ["06","I want a concise AI decision guide","Read five decision prompts and download a working guide—free, with no account or recording required.","/learning/masterclass","Open the decision guide"],
 ["07","I may want to work with Aloha AI","See what is available now, what remains under validation, and how to prepare a useful inquiry without encountering a false booking path.","/work","Explore ways to work together"],
];
export default function Start(){return <SiteShell><main id="main"><section className="page-hero wrap"><p className="kicker">Start here</p><h1>Choose by situation,<br/><em>not by software.</em></h1><p className="lede">Four browser-local decision aids and two open learning readers are usable now. Each page states what it can do, what it cannot establish, and which product functions are still absent. No account, email address, or payment is required.</p></section><section className="wrap"><div className="choice-grid">{choices.map(c=><article className="choice" key={c[0]}><span className="path-num">{c[0]}</span><h2>{c[1]}</h2><p>{c[2]}</p><Link href={c[3]}>{c[4]} →</Link></article>)}</div><aside className="quiet-note"><h2>“Do not proceed” is a useful result.</h2><p>These tools are designed to reveal missing evidence, authority, safeguards, or capacity. They do not manufacture a positive recommendation when the conditions do not support one.</p></aside></section></main></SiteShell>}
