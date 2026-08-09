import { SiteShell } from "../site-shell";
import { Studio } from "./studio";
export const metadata={title:"Opportunity Studio"};
export default function StudioPage(){return <SiteShell><main id="main"><section className="page-hero wrap"><p className="kicker">Opportunity Studio · private by default</p><h1>Understand the work<br/><em>before selecting a tool.</em></h1><p className="lede">This guided decision aid helps you identify one responsible next move. Your answers stay in this browser during this prototype and are not transmitted.</p></section><Studio/></main></SiteShell>}
