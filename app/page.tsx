"use client";

import useSWR from 'swr';
import { useMemo, useState } from 'react';
import type { JobPosting, SourceConfig } from '@/types';
import sources from '@/config/sources.json';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function HomePage() {
  const [query, setQuery] = useState('');
  const { data, isLoading, error, mutate } = useSWR<{ jobs: JobPosting[]; meta: { scrapedAt: string; sourceCount: number } }>(
    '/api/scrape',
    fetcher,
    { refreshInterval: 0 }
  );

  const filtered = useMemo(() => {
    if (!data?.jobs) return [] as JobPosting[];
    const q = query.trim().toLowerCase();
    if (!q) return data.jobs;
    return data.jobs.filter((j) =>
      [j.title, j.company, j.location, j.source.name].some((f) => f.toLowerCase().includes(q))
    );
  }, [data?.jobs, query]);

  return (
    <div className="container">
      <header className="card" style={{ display: 'flex', gap: 16, alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ margin: 0 }}>Agentic Job Scraper</h1>
          <div className="badge">Configured sources: {((sources as SourceConfig[]) || []).length}</div>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <input
            className="input"
            placeholder="Filter by keyword, company, location..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{ minWidth: 340 }}
          />
          <button className="button" onClick={() => mutate()} disabled={isLoading}>
            {isLoading ? 'Scraping?' : 'Refresh'}
          </button>
        </div>
      </header>

      <section className="card" style={{ display: 'flex', gap: 24, alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div className="mono" style={{ fontSize: 12, opacity: 0.8 }}>Last run</div>
          <div>{data?.meta?.scrapedAt ? new Date(data.meta.scrapedAt).toLocaleString() : '?'}</div>
        </div>
        <div>
          <div className="mono" style={{ fontSize: 12, opacity: 0.8 }}>Total jobs</div>
          <div>{filtered.length}</div>
        </div>
      </section>

      {error && (
        <div className="card" style={{ borderColor: '#a33' }}>
          Failed to scrape: {String(error)}
        </div>
      )}

      <section className="container">
        {filtered.map((job) => (
          <article key={job.id} className="card" style={{ display: 'grid', gap: 8 }}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', justifyContent: 'space-between' }}>
              <a href={job.url} target="_blank" rel="noreferrer">
                <strong>{job.title}</strong>
              </a>
              <span className="badge">{job.source.name}</span>
            </div>
            <div style={{ opacity: 0.9 }}>{job.company}{job.location ? ` ? ${job.location}` : ''}</div>
            {job.postedAt && <div className="mono" style={{ fontSize: 12, opacity: 0.8 }}>Posted: {job.postedAt}</div>}
          </article>
        ))}
        {!isLoading && filtered.length === 0 && (
          <div className="card">No jobs matched your filter.</div>
        )}
      </section>

      <footer style={{ opacity: 0.6, fontSize: 12, textAlign: 'center', padding: 16 }}>
        Configure sources in <code>config/sources.json</code>. An hourly cron hits <code>/api/scrape</code>.
      </footer>
    </div>
  );
}
