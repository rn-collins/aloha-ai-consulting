# Security Policy

## Reporting

Do not open a public issue containing a credential, personal information, confidential material, or an exploitable vulnerability. Use the Microsoft Bookings link on the Aloha AI contact page, choose any available time, and write “security report — no meeting needed.” Include only the affected route or component, approximate time, a concise non-exploitative description, and a safe reply path. Do not include a working exploit, credential, confidential material, or exposed data in the booking note. RN will treat the booking as a private report rather than a meeting.

There is no public bounty program and no authorization to access data, disrupt service, test third-party systems, or exceed ordinary good-faith observation. Stop testing if personal data, credentials, or another person’s account may be affected.

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

Security support covers files and workflows in this repository and the bounded public-site deployment evidence recorded by the assurance process. Separately deployed monitoring systems, Microsoft Bookings, Supabase configuration and row-level-security policies, GitHub and Vercel account controls, client systems, and future integrations require their own access and incident reviews.
