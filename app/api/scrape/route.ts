import { scrapeAll } from '@/lib/scrape';
import type { SourceConfig } from '@/types';
import allSources from '@/config/sources.json';

export const runtime = 'nodejs';
export const revalidate = 0;

async function maybePostToWebhook(body: unknown) {
  const webhook = process.env.WEBHOOK_URL;
  if (!webhook) return;
  try {
    await fetch(webhook, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch (err) {
    console.error('Webhook post failed', err);
  }
}

export async function GET() {
  const sources = (allSources as SourceConfig[]).filter(Boolean);
  const jobs = await scrapeAll(sources);
  const scrapedAt = new Date().toISOString();

  const payload = { jobs, meta: { scrapedAt, sourceCount: sources.length } };
  // Fire-and-forget webhook delivery
  void maybePostToWebhook(payload);

  return new Response(JSON.stringify(payload, null, 2), {
    headers: { 'content-type': 'application/json' },
    status: 200,
  });
}
