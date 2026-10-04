# Paras Infotech Solutions (React)

This is the React version of the Paras Infotech Solutions website. It keeps the same pages, copy, and visual design as the ASP.NET MVC site.

## Pages

- Home
- About
- Services
- Contact (enquiry form and careers form with CV upload)
- Privacy policy
- Terms of service

## Run locally

```bash
cd react-app
npm install
npm run dev
```

Open http://localhost:5173

The contact API runs on port 5000. Vite proxies `/api` to it.

## Email

Copy `.env.example` to `.env` and set `SMTP_PASS`. Without SMTP credentials, form submissions are stored in `server/submissions.log` and uploaded CVs are saved under `server/uploads`.

## Production

```bash
npm run build
npm start
```

`npm start` serves the built site and the contact API from port 5000.
