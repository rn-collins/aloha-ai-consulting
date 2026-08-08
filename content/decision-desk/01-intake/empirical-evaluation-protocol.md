# Preregistered empirical evaluation protocol

Status: protocol complete for owner and qualified-reviewer approval; no product tested; no outcome claim authorized.

## Decision question

For a frozen product and configuration, does AI-assisted summarization improve the whole intake process relative to the current human-led workflow without increasing material factual error, urgency or deadline misses, privacy exposure, inequitable performance, source neglect, or downstream rework?

## Units and conditions

- Unit: one intake record and its authoritative source packet.
- Conditions: current human-led baseline; AI synopsis shown before source; AI synopsis shown after required source review. Randomize or counterbalance order where feasible.
- Data: synthetic cases first. Governed historical data requires separate legal, privacy, security, records, and authorization approval.
- Blinding: output graders should not know product or condition when practicable.
- Versioning: freeze the test set, scoring guide, product dossier, prompts, schema, and analysis code before scoring.

## Test-set strata

Include intended matter classes, narrative length, multiple parties and aliases, conflicting dates, buried deadlines, urgency and safety signals, jurisdiction ambiguity, missing attachments, contradictions, irrelevant sensitive detail, adversarial instructions, multilingual content, disability/access needs, and low digital literacy. Record sampling, exclusions, and unsupported populations.

## Primary safety outcomes

1. Unsupported additions and material omissions.
2. Entity, relationship, date, deadline, sequence, urgency, safety, and jurisdiction errors.
3. False certainty where the source is ambiguous.
4. Unnecessary sensitive-data reproduction or disclosure.
5. Routing decisions that differ from the authoritative-source decision.

Predefine severity and routing consequences. A critical deadline, urgency, safety, conflict-party, or jurisdiction miss is non-compensable: speed elsewhere cannot cancel it.

## Human and process outcomes

Measure whether reviewers open and compare the source, correction and override behavior, reliance despite disagreement, time on source and synopsis, total cycle time, rework, repeat contacts, workload, accessibility burden, language performance, downstream routing errors, incidents, and total cost including remediation.

## Analysis plan

- Report counts and rates with denominators and uncertainty; preserve per-stratum results.
- Do not substitute similarity, readability, ROUGE, or vendor scores for fact-level adjudication.
- Analyze critical errors separately; do not average them into a benign composite.
- Compare whole-process outcomes with baseline, not only generation speed.
- Document missing data, exclusions, disagreements, deviations, and product changes.
- Review errors before retesting; do not tune on the held-out confirmation set.

## Predetermined decision logic

The firm sets sample size and quantitative tolerances before seeing results. Universal stop conditions are: untraceable output; irreproducible configuration; live-data use before vendor/privacy clearance; material source facts hidden from the reviewer; a critical error attributable to the assistive path; reviewer source-neglect the workflow cannot prevent; an uncontained privacy/security incident; or material system change during testing.

A passed synthetic evaluation authorizes, at most, consideration of a separately approved bounded pilot. It does not establish legal compliance or suitability for another firm, jurisdiction, matter class, language, population, version, or configuration.

## Required record

Preserve preregistration date, owners and qualified reviewers, test-set manifest, dossier version, randomization, scoring guide, adjudicator agreement, observations, analysis code, deviations, incidents, stop decisions, counterevidence, and disposition.
