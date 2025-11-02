# Agentic Job Scraper

- Configurable sources in `config/sources.json`
- API route `GET /api/scrape` scrapes all sources and returns aggregated jobs
- Optional `WEBHOOK_URL` env to POST results to a webhook (e.g., Slack/Discord)
- Vercel Cron configured to hit `/api/scrape` hourly (top of every hour)

## Development

```bash
npm install
npm run build
npm start
```

## Deploy to Vercel

```bash
vercel deploy --prod --yes --token $VERCEL_TOKEN --name agentic-988884c1
```

Verify:

```bash
curl https://agentic-988884c1.vercel.app/api/scrape
```
