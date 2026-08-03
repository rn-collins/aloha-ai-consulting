# Five-Domain Knowledge Base

Version 2026.08.0 · source-review cutoff 2026-08-03 · frozen pre-release package

## What this is

A file-based implementation system for producing evidence-aware content from approved organizational knowledge. It separates source material, bounded claims, voice rules, audience context, and approved examples so a human reviewer can trace what a model used and decide what may be published.

It is not a legal, medical, scientific, security, or compliance assurance system. It does not make a model reliable by itself. Human review remains required for consequential or public output.

## The five domains

1. **Evidence** stores source records, retrieval dates, rights notes, and excerpts or summaries.
2. **Claims** stores the smallest publishable propositions, their authority, status, limitations, and approval.
3. **Voice** stores tone, terminology, structural preferences, prohibited habits, and review rules.
4. **Audience** stores reader context, task, prior knowledge, accessibility needs, and risk of misunderstanding.
5. **Examples** stores approved outputs and counterexamples with annotations explaining why they are safe or unsafe.

Each record has a stable ID. Files use lowercase kebab-case. A claim can be used only when its source IDs resolve, its status is current or explicitly historical, and its approval state permits the intended channel.

## Empty-directory setup

1. Copy `worked-example/empty-starter` into a new directory.
2. Add source records first; never begin with an uncited claim.
3. Create atomic claim records and connect each one to at least one source ID.
4. Complete the voice and audience records for the intended output.
5. Select an approved example with a similar task, if one exists.
6. Run `node validate-example.js` from the worked-example directory.
7. Use a prompt from `prompts.txt`; provide only the required record IDs.
8. Reconcile every drafted sentence against the claim ledger and record the human decision.

## File and provenance rules

- IDs are immutable; corrections create a new version and a changelog entry.
- Direct quotation requires quotation marks, pinpoint location, and rights status.
- Paraphrases must not exceed the source's scope or certainty.
- Unknown, disputed, proposed, superseded, and withdrawn claims remain explicitly labeled.
- The reviewer records approve, revise, reject, or escalate. Silence is not approval.
- Personal or confidential information must not enter the knowledge base unless authorized and minimized.

## Operating workflow

Ingest sources; normalize records; validate schemas; select current approved claims; draft with an indexed prompt; reconcile sentences to claims; perform audience, accessibility, rights, and professional-boundary review; approve or reject; archive the decision record.

## When to hire help

Use the package internally for low-risk, bounded production when your team owns the sources and can review every output. Hire qualified legal, scientific, regulatory, security, accessibility, or implementation help when the output affects rights, safety, regulated conduct, high-stakes decisions, custom integrations, sensitive data, or an authority you cannot independently verify.

## Accessibility

All source formats are text-readable. Tables use descriptive headers. The DOCX template uses heading styles. The PDF is a convenience rendering; use the Markdown source when reflow or assistive-technology behavior is preferable.

## First-use acceptance

The worked example is complete when its schemas validate, every published sentence maps to an approved claim, all five domains are indexed, and the human review record is complete. Passing the example demonstrates package coherence only; it does not validate a user's external sources or final output.
