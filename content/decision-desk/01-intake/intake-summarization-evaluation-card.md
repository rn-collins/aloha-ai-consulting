# Intake Summarization Evaluation Card

Status: working subscriber artifact for Decision Desk 01. Not legal advice. Not approved for publication.

## 1. Decision record

- Firm / office:
- Decision owner:
- Evaluation lead:
- Date opened:
- Review date:
- Controlling jurisdiction(s):
- Local ethics authority checked by:
- Proposed outcome: reject / redesign and retest / continue human-led / authorize bounded pilot

## 2. Work before technology

- What problem in the current intake process is evidenced?
- Baseline volume:
- Baseline cycle time:
- Baseline error and rework categories:
- People affected:
- Authoritative source record:
- Structured conflict fields:
- Structured urgency fields:
- Human decision points:
- Existing escalation and incident path:

Gate 1: If the current workflow, owner, source record, and baseline are not documented, stop and redesign.

## 3. Exact system under evaluation

- Vendor:
- Product:
- Model:
- Version / release date:
- Configuration:
- Integrations:
- Enabled features:
- Disabled features:
- Approved user roles:
- Intended matter class:
- Prohibited uses:
- Change-control owner:

Gate 2: If the product or configuration cannot be named and frozen for evaluation, stop.

## 4. Authority and data review

Record the authority, date, pinpoint, reviewer, and disposition for each:

- Prospective-client duties
- Confidentiality and privilege
- Conflicts and imputation
- Competence and supervision
- Communications and nonengagement
- Unauthorized-practice and advertising risk
- Privacy and sensitive-data rules
- Retention and deletion
- Breach and incident duties
- Accessibility and language access

Vendor/data fields:

- Data received
- Retention period
- Training or model-improvement use
- Human/provider access
- Subprocessors
- Storage geography
- Encryption
- Deletion mechanism
- Export and audit logs
- Incident notice
- Contractual remedies
- Material-change notice

Gate 3: Any unresolved high-risk authority, contract, privacy, security, or data-flow question means no live data and no live pilot.

## 5. Representative pre-deployment test set

Use fictional, synthetic, or appropriately governed historical material.

Test-set coverage:

- Matter classes
- Narrative length and complexity
- Multiple parties and aliases
- Conflicting dates
- Buried deadlines
- Safety or emergency signals
- Jurisdiction ambiguity
- Missing attachments
- Contradictory facts
- Non-English or multilingual content
- Disability/accessibility conditions
- Low digital literacy
- Out-of-scope and adversarial submissions

Document sampling method, exclusions, known blind spots, and why the set represents intended use.

Gate 4: If affected users or material failure modes are absent from the set, expand it before evaluation.

## 6. Fact-level evaluation

For every synopsis, compare it directly with the authoritative source.

| Error class | Definition | Count | Severity | Routing consequence |
|---|---|---:|---|---|
| Unsupported addition | Fact absent from source | | | |
| Omission | Material source fact missing | | | |
| Distortion | Source fact altered or reframed | | | |
| Entity error | Person, organization, role, or relationship wrong | | | |
| Date/time error | Date, sequence, deadline, or duration wrong | | | |
| Urgency miss | Safety, emergency, or limitations signal missed | | | |
| Jurisdiction error | Location or governing connection wrong | | | |
| False certainty | Ambiguity removed without support | | | |
| Sensitive-data spill | Unnecessary exposure or reproduction | | | |

Do not substitute ROUGE, similarity, readability, or a vendor quality score for fact-level review.

## 7. Human-factors evaluation

Observe the real review behavior, not only model output.

- Does the reviewer open the source before deciding?
- Time spent on source versus synopsis:
- Corrections missed:
- Overrides made:
- Reliance despite disagreement:
- Anchoring or framing effects observed:
- Accessibility burden:
- Training required:
- Fatigue or workload effects:
- Rework transferred downstream:
- Who can stop the evaluation?

Gate 5: If reviewers routinely rely on the synopsis without source comparison, the control has failed even when model accuracy appears high.

## 8. Whole-process effects

Compare with baseline:

- Total cycle time
- First-pass time
- Rework
- Repeat contacts
- Routing errors
- Missed urgency
- Staff workload
- Prospective-client clarity
- Accessibility and language performance
- Security/privacy incidents
- Cost, including review and remediation

A faster first pass is not success if total work, error, inequity, or risk increases.

## 9. Predetermined decision rules

Before viewing results, record:

- Non-negotiable failures:
- Quantitative thresholds:
- Why each threshold fits the firm's risk tolerance:
- Who approved thresholds:
- Required sample size:
- Retest conditions:
- Stop authority:
- Incident response:
- Rollback method:

Thresholds are firm decisions unless a cited empirical source supports them. Do not present them as universal facts.

## 10. Final disposition

- Reject the system
- Redesign and retest
- Continue human-led intake
- Authorize a separately governed bounded live pilot

Reasoning:
Evidence supporting decision:
Counterevidence:
Remaining uncertainty:
Conditions:
Expiration / change-watch date:
Sign-offs:

## Source and change record

For every authority, study, vendor document, and internal dataset, record title, issuer, date, version, URL/file location, pinpoint, authority level, limitation, and last verification date.

New Mexico requires separate treatment of controlling and advisory authority. Rule 16-118 NMRA governs prospective-client information and conflicts. Formal Ethics Advisory Opinion 2024-004 permits responsible generative-AI use only within existing duties and emphasizes confidentiality, vendor practices, supervision, and independent verification. It does not authorize AI intake summarization as a category or establish that a named tool is accurate, secure, or effective; those questions remain product- and configuration-specific gates.

New York also requires authority-level separation. Statewide Rule 1.18 governs prospective-client information, conflicts, and the circumstances in which invited electronic submissions become consultations, including the effect of clear warnings and the need to limit initial exposure. NYC Bar Opinions 2024-5 and 2025-6 provide persuasive local guidance on generative AI and AI-assisted conversation summaries but are not statewide controlling law. Neither the rule nor those opinions authorizes AI intake summarization as a category or establishes that a named tool, version, or configuration is accurate, secure, accessible, or effective.
