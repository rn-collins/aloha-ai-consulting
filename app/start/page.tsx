import Link from "next/link";
import { SiteShell } from "../site-shell";

const choices=[
 ["01","I have a recurring task that feels costly or fragile","Map the work, handoffs, judgment, and constraints before choosing an intervention.","/studio","Map the opportunity"],
 ["02","I need to make one focused decision","Use a private AI Decision Review and leave with a documented recommendation, reasoning, risks, and next move.","/work/ai-decision-review","Review one decision"],
 ["03","My organization needs a scoped program","Begin with the information needed for fit, procurement, accessibility, and responsible delivery.","/organizations","Explore organizational work"],
 ["04","I want to learn before I pay","Join the free monthly, lecture-based masterclass for evidence, frameworks, and general examples.","/events","View the free masterclass"],
 ["05","I want live help with one real problem","Work through an inside solution, independent outside assessment, and combined next move in a four-person clinic.","/work/ai-opportunity-clinic","View the paid clinic"],
];
export default function Start(){return <SiteShell><main id="main"><section className="page-hero wrap"><p className="kicker">Start here</p><h1>Choose by situation,<br/><em>not by software.</em></h1><p className="lede">You can browse and use the Opportunity Studio without creating an account or surrendering contact information.</p></section><section className="wrap"><div className="choice-grid">{choices.map(c=><article className="choice" key={c[0]}><span className="path-num">{c[0]}</span><h2>{c[1]}</h2><p>{c[2]}</p><Link href={c[3]}>{c[4]} →</Link></article>)}</div><aside className="quiet-note"><h2>“No suitable offer” is a valid destination.</h2><p>If AI is not appropriate, the process needs repair first, or Aloha AI is not the right source of support, the route should say so plainly and point toward the next useful step.</p></aside></section></main></SiteShell>}
