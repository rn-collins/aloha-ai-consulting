# Aloha AI Consulting

Canonical public application for Aloha AI Consulting. It includes the public service catalog, Opportunity Studio, learning products, local-first decision tools, procurement information, machine-readable catalog/feed routes, and an offline recovery shell.

## Local validation

Use Node 24, then run `npm ci`, `npm test`, `npm run lint`, and `npm run build`.

## Production authority

GitHub `main` is the source for the Vercel project `aloha-ai-consulting`. The canonical public origin is `https://aloha-ai-consulting.vercel.app`.

The Clinic inquiry form fails closed unless its Resend and Cloudflare Turnstile environment variables are configured. Public decision tools store working data in the visitor's browser and disclose their non-certifying boundaries. Do not commit `.env` files, `.next`, or `.vercel` project metadata.
