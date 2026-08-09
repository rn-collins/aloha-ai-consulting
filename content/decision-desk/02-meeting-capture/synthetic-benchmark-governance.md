# Frozen synthetic meeting benchmark

Status: vendor-neutral benchmark specification, version `MCB-1.0`. All people, organizations, meetings, and facts are fictional. No participant recording, product approval, or observed result is authorized.

## Purpose and boundary

The benchmark tests whether one frozen product configuration can preserve permissions, speakers, meaning, dissent, decisions, owners, dates, access rules, correction, deletion, and retention across representative synthetic meetings. It is not evidence of legal compliance, meaningful consent, workplace acceptability, product suitability, or performance with real people.

The manifest contains 24 cases: 12 development cases and 12 sealed-confirmation cases. Each split covers the same twelve primary failure strata. Developers may inspect and iterate on the development cases. The sealed-confirmation source packets and expected outputs must remain inaccessible to product operators until the configuration, prompts, templates, and analysis plan are frozen.

## Case packet contract

Each case must have a versioned authoritative source packet containing:

- the fictional meeting class, purpose, participants, roles, power relationships, locations, and permission state;
- a scripted or staged source record with turn boundaries, overlaps, pauses, inaudible spans, late arrivals, and capture-state changes marked independently of any product transcript;
- expected critical facts: decisions, non-decisions, owners, dates, conditions, dissent, uncertainty, negation, and permission changes;
- prohibited inferences and sensitive details that must not appear in the generated summary or decision record;
- the required authoritative disposition for raw media, transcript, generated summary, and human-approved decision record;
- expected access, correction, deletion, export, and retention outcomes; and
- applicable universal-stop flags and the evidence needed to adjudicate them.

Source packets may use only invented facts and staged voices or text-to-speech voices whose use and rights are documented. Do not imitate a real person, reuse a real meeting, or encode a real client, employee, student, patient, or community matter.

## Split and custody rules

- `DEV-01` through `DEV-12` are available for configuration development and error analysis.
- `CONF-01` through `CONF-12` are sealed until the frozen confirmation run.
- A custodian who does not operate or tune the product preserves sealed packets, checksums, release time, and access log.
- No case, voice, wording, or critical-fact key may appear in both splits.
- A materially changed product, model, prompt, template, integration, permission, or retention setting creates a new evaluation and requires a fresh sealed set.
- Any exposure, tuning, selective rerun, undocumented exclusion, or post-result threshold change invalidates the confirmation claim.

## Execution record

For every case and condition, preserve configuration version, input hashes, timestamps, operators, generated artifacts, system notices, access logs, deletion/retention evidence, grader records, disagreements, adjudications, deviations, incidents, and missing data. Compare the complete product-assisted process with the preregistered uncaptured human-led baseline; do not compare output prose alone.

## Completion rule

The benchmark is complete as infrastructure when all 24 source packets, expected-answer keys, checksums, and custody records exist and pass manifest validation. That status does not mean a product has passed. A product passes only under the separate scoring and adjudication rules after one frozen development run and one untouched confirmation run.

