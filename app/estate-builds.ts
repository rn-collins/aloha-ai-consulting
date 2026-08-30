// Public builds by RN Collins that anyone can open and inspect.
//
// Every figure below was read off the live page on the verification date, and
// every "stops" line is the build's own stated limit, not a softening added
// here. These are self-published works: opening one verifies that it exists
// and says what this page says it says. It does not make an outside party
// vouch for it. The independently indexed record is on /about.

export type Build = {
  kind: string;
  name: string;
  href: string;
  what: string;
  measure: string;
  stops: string;
};

export const estateVerifiedOn = "August 29, 2026";

export const builds: Build[] = [
  {
    kind: "Index · generated from live data",
    name: "Build index",
    href: "https://rn-selected-work.vercel.app/builds",
    what: "The complete estate, generated rather than curated: a script asks GitHub what repositories exist and Vercel what is deployed, cross-references the two, checks that each production URL answers, and writes the data file the page renders from. Each entry keeps its own status in its own words — retired prototype, paused with the back end off, research preview — instead of being flattened into a uniform present tense.",
    measure: "66 builds · regenerated 29 August 2026",
    stops: "It replaced a hand-kept list that had drifted to 32 entries while the estate held more than twice that. Presence in the index means a repository and a deployment exist and the URL answered; it is not a claim that a build is finished, maintained, or in use.",
  },
  {
    kind: "Monitor · read by hand",
    name: "Legal AI Guidance Monitor",
    href: "https://aloha-legal-ai-monitor.vercel.app",
    what: "Primary authorities on lawyers' use of AI. Each record separates what the document holds from how far it can be stretched, and distinguishes advisory ethics opinions from a standing order that binds one courtroom and a published sanctions order.",
    measure: "8 authorities · 7 opened and read · 1 flagged unread",
    stops: "The eighth authority could not be retrieved and is listed as unread rather than quietly dropped. Ethics opinions interpret rules of professional conduct; they do not enact them.",
  },
  {
    kind: "Monitor · automated, unreviewed",
    name: "AI Governance Tracker",
    href: "https://aloha-ai-governance.vercel.app",
    what: "The deliberate contrast to the monitor above: five saved searches run once a week across the open web, published newest first without human review, and labelled as such at the top of the page.",
    measure: "5 saved searches · weekly · 0 reviewed before publication",
    stops: "Results mix commentary, law-firm client alerts and vendor material with official documents. It is a place to start research, not a record of what an agency has done.",
  },
  {
    kind: "Register · source accounting",
    name: "Psych Ops Source Watch",
    href: "https://psychops-intel.vercel.app",
    what: "A regulatory monitor that publishes its own blind spots: what each watched body actually controls, what a change there would mean, and the five different things an empty sweep can mean — only one of which is reassuring.",
    measure: "6 source profiles · 5 failure modes behind a quiet sweep",
    stops: "Discovered items stay unreviewed candidates until a person confirms the document, its date, its jurisdiction and its operational consequence. Silence is reported as unknown, never as all-clear.",
  },
  {
    kind: "Register · evidence lab",
    name: "Platform Moderation Evidence Lab",
    href: "https://aloha-suppression-sweep.vercel.app",
    what: "Five public records about platform moderation of drug-policy content, each paired on the same card with the claim it is routinely asked to support and cannot.",
    measure: "5 records · 5 reading rules · 1 dead source kept and marked",
    stops: "Oversight Board decisions reach the Board by appeal or referral, never by sampling, so they cannot carry a claim about how often anything happens. A published policy is a ceiling, not a measurement.",
  },
  {
    kind: "Register · read-only index",
    name: "Psychedelic Operations Directory",
    href: "https://psych-ops-directory.vercel.app",
    what: "A field survey recorded once and published unchanged. It publishes only what can be stated without a per-claim source: name, category, a scope descriptor that makes no claim, and a destination link where one answered.",
    measure: "177 recorded · 175 after de-duplication · 23 categories",
    stops: "Inclusion is not vetting, endorsement, licensure verification, or a finding about quality, safety, solvency or compliance. Pricing, credentials and rankings are withheld because no source was recorded for them.",
  },
  {
    kind: "Decision tool · cost model",
    name: "AI Build Cost Workbench",
    href: "https://ai-budget-calc-red.vercel.app",
    what: "Turns an early AI idea into a reviewable cost scenario across labor, model usage, infrastructure, vendors, operations and risk — with every rate exposed as an editable assumption rather than a project-type price sticker.",
    measure: "7 steps · dated provider rate catalog · scenario comparison",
    stops: "The rate catalog is a hand-typed, versioned snapshot of published list prices. It is not a live feed, not a quote, and it does not know your contract.",
  },
  {
    kind: "Decision tool · evidence record",
    name: "Drug Market Transition Evidence Lab",
    href: "https://transform-observatory.vercel.app",
    what: "Builds a source-anchored record of one policy, rule, court decision or market event, then makes six judgements inspectable — each requiring an evidence note, with \"unknown\" a permitted result.",
    measure: "6 judgement dimensions · 1 primary source required per record",
    stops: "It does not claim live monitoring, automatic refresh, or independent verification of any outcome. A policy announcement is not a market outcome.",
  },
  {
    kind: "Atlas · research reference",
    name: "Entheogen Atlas",
    href: "https://entheogen-atlas.vercel.app",
    what: "Maps the archaeology, neuroscience, case law and phenomenology of ten substances across the span from the oldest chemically confirmed psychedelic use to the present.",
    measure: "10 substances · 57 centuries of confirmed use",
    stops: "Dosing, interaction clearance, individualised legal-risk scoring and live-law tracking were deliberately removed from the edition, and the page says why.",
  },
  {
    kind: "Atlas · archive analysis",
    name: "Fadiman Knowledge Atlas",
    href: "https://fadiman-atlas.vercel.app",
    what: "A catalogue of 58 years of one researcher's recorded public output, with a link check on every entry — which is how the finding emerged that a large share of the record is no longer retrievable.",
    measure: "132 entries · 1968–2026 · 58 dead or missing URLs",
    stops: "It is a proposal for knowledge infrastructure, not a commissioned archive. Cataloguing a paper does not validate it; the atlas says so on the microdosing study it lists.",
  },
  {
    kind: "Learning · open curriculum",
    name: "Zero → Frontier",
    href: "https://zero-to-frontier.vercel.app",
    what: "A source-forward AI literacy guide with a route builder that shapes a reading path around purpose, stakes and available time, with no account and no email.",
    measure: "11 sections · 237 curated resources · 0 sign-ups",
    stops: "Educational reference only. Every resource carries a named source and a visible freshness limit rather than an implied currency.",
  },
  {
    kind: "Learning · applied courses",
    name: "Myelin Learning Lab",
    href: "https://myelin-ce.vercel.app",
    what: "Four applied courses built around the decisions responsible AI work actually requires — verify the claim, classify the data, define the human control, leave an evidence record — plus printable field briefs and three builders.",
    measure: "4 courses · 6 field briefs · 3 builders",
    stops: "Non-credit education only. No account, identity verification, accredited certificate, CE credit, or licensing-board reporting.",
  },
];
