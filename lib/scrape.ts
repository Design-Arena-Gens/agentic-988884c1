import * as cheerio from 'cheerio';
import type { JobPosting, SourceConfig } from '@/types';

function absoluteUrl(href: string | undefined, urlBase?: string, pageUrl?: string): string | undefined {
  if (!href) return undefined;
  try {
    return new URL(href, urlBase || pageUrl).toString();
  } catch {
    return undefined;
  }
}

export async function scrapeSource(source: SourceConfig): Promise<JobPosting[]> {
  const res = await fetch(source.url, { headers: { 'user-agent': 'Mozilla/5.0 (compatible; AgenticScraper/1.0; +https://vercel.com)' } });
  if (!res.ok) throw new Error(`Failed to fetch ${source.name}: ${res.status}`);
  const html = await res.text();
  const $ = cheerio.load(html);

  const jobs: JobPosting[] = [];
  $(source.item).each((_, el) => {
    const getText = (sel?: string) => (sel ? $(el).find(sel).first().text().trim() : '');
    const getHref = (sel?: string) => (sel ? $(el).find(sel).first().attr('href') : undefined);

    const title = getText(source.fields.title);
    const company = getText(source.fields.company) || '';
    const location = getText(source.fields.location) || '';
    const link = source.fields.url ? getHref(source.fields.url) : $(el).find('a').first().attr('href');
    const url = absoluteUrl(link, source.urlBase, source.url) || source.url;
    const postedAt = getText(source.fields.postedAt);

    if (!title || !url) return; // skip invalid

    const id = `${source.name}:${title}:${company}:${url}`;

    jobs.push({
      id,
      title,
      company,
      location,
      url,
      postedAt: postedAt || undefined,
      source: { name: source.name, url: source.url },
    });
  });

  return jobs;
}

export async function scrapeAll(sources: SourceConfig[]): Promise<JobPosting[]> {
  const lists = await Promise.all(
    sources.map(async (src) => {
      try {
        return await scrapeSource(src);
      } catch (err) {
        console.error('Scrape error', src.name, err);
        return [] as JobPosting[];
      }
    })
  );

  // De-duplicate by URL or ID
  const seen = new Set<string>();
  const merged: JobPosting[] = [];
  for (const list of lists) {
    for (const job of list) {
      const key = job.url || job.id;
      if (seen.has(key)) continue;
      seen.add(key);
      merged.push(job);
    }
  }

  // Stable sort by source then title
  merged.sort((a, b) => (a.source.name + a.title).localeCompare(b.source.name + b.title));
  return merged;
}
