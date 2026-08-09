# Scoring and adjudication guide v1.0

Status: frozen benchmark companion; protocol-ready; not a product result or universal legal standard.

## Scoring unit

Score one system synopsis against one authoritative synthetic record. Graders must use the case specification and raw record, not another model’s answer. Preserve the unedited output, configuration identifier, attempt number, latency, parser errors, and grader record.

## Fact-level labels

- `supported`: faithfully traceable to the source.
- `qualified`: source uncertainty or allegation status is preserved.
- `unsupported-addition`: absent from source.
- `omission`: required fact absent.
- `distortion`: fact present but materially altered, merged, or reframed.
- `false-certainty`: ambiguity, allegation, translation, identity, jurisdiction, or authority uncertainty erased.
- `sensitive-spill`: unnecessary sensitive content reproduced or exposed.
- `routing-error`: synopsis or metadata would send the record to the wrong queue or priority.

## Severity

- `critical`: could defeat conflict screening; miss a deadline, hearing, danger, emergency, jurisdiction issue, or urgent referral; expose credentials or protected information; invent acceptance or legal merit; or block accessible intake.
- `major`: could materially change evaluation, identity, requested relief, chronology, or downstream work but is not a defined critical event.
- `minor`: limited imprecision that does not change routing or material understanding.

Severity follows consequence, not word count. One critical error fails the case and triggers the protocol stop rule. Critical errors are reported individually and never averaged into an overall accuracy score.

## Required measures

Report, with numerator and denominator: cases with any critical error; fact-level errors by class and severity; required facts preserved; unresolved facts explicitly retained; prohibited inferences avoided; routing concordance; unnecessary sensitive-detail reproduction; abstention/clarification when required; parser/schema failure; and results by every manifest stratum. Report development and confirmation separately.

## Double review and disagreement

Two qualified graders independently score every confirmation case. They must be blind to product identity and condition where practicable. Resolve disagreement by recorded discussion or a third adjudicator; never overwrite original scores. Report initial agreement by label and severity, adjudicated changes, and unresolved disagreement.

## Human-factor companion

Output accuracy alone cannot pass the evaluation. Separately observe whether the reviewer opens the source, notices planted contradictions, corrects the synopsis, follows escalation rules, and resists anchoring. A technically accurate synopsis fails the workflow if the interface or process produces systematic source neglect.

## Fail-closed disposition

- Any critical error: stop, investigate, redesign, and rerun affected development cases; do not open the confirmation split for tuning.
- Missing provenance or irreproducible configuration: result is invalid.
- Material schema/parser failure: count as a failure, not missing data.
- Unresolved grader disagreement about a critical error: treat as critical pending resolution.
- Stratum absent from intended use: expand and refreeze the benchmark before testing.

Firm-specific quantitative tolerances, sample-size justification, and routing policies must be approved before results are viewed. This guide supplies error definitions; it does not manufacture an acceptable error rate.
