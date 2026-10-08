# Paras Infotech website + MAKEEN review standalone

Two separate apps in one Vercel project.

- `react-app/` — Paras Infotech site at `/`
- `makeen_reports/` — MAKEEN finance standalone at `/makeen_reports`
- `bricks&bytes/` — Bricks & Bytes Consulting site at `/bricks&bytes`

After client review, delete `makeen_reports/`, remove the three `/makeen_reports` rewrites in `vercel.json`, and drop that folder from the root `build` script.

Contact forms need these Vercel env vars if mail should send: `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM_NAME`, `CONTACT_EMAIL`.
