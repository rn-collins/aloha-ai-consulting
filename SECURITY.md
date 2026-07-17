# Security Policy

## Reporting

Do not open a public issue containing a credential, personal information, confidential material, or an exploitable vulnerability. Contact the repository owner privately through the contact method published on the Aloha AI website.

## Secret handling

Production credentials must never be committed. Environment-specific values belong in the deployment provider's encrypted environment settings. `.env.example` documents variable names only and must contain no real values.

If a credential is exposed:

1. revoke or rotate it immediately;
2. determine the affected systems and time period;
3. remove it from the current tree;
4. rewrite Git history when necessary;
5. invalidate caches and redeploy;
6. document the incident and preventive control privately.

Deleting the current file alone is not sufficient because the value may remain in Git history.

## Automated scanning

The repository uses Gitleaks with full Git history (`fetch-depth: 0`) on pull requests, pushes to `main`, and a schedule. A successful run is evidence of the scanner's result, not an absolute guarantee that no sensitive value exists.

## Personal and regulated data

Do not commit client information, consultation notes, user-submitted form data, health information, student information, legal matter details, or identifiable research data. Demonstrations must use synthetic or explicitly cleared material.

## Supported surface

Security support covers files and workflows in this repository. Separately deployed monitoring systems, booking services, email providers, and Vercel account configuration must be reviewed under their own access and incident controls.