import './globals.css';
import type { ReactNode } from 'react';

export const metadata = {
  title: 'Agentic Job Scraper',
  description: 'Scrape configured job sources hourly and view results',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <main style={{ maxWidth: 960, margin: '0 auto', padding: 24 }}>
          {children}
        </main>
      </body>
    </html>
  );
}
