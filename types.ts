export type SourceConfig = {
  name: string;
  url: string;
  item: string; // CSS selector for each posting container
  fields: {
    title: string; // CSS selector within item
    company?: string;
    location?: string;
    url?: string; // attribute href from anchor selector or relative
    postedAt?: string;
  };
  urlBase?: string; // prefix for relative links
};

export type JobPosting = {
  id: string;
  title: string;
  company: string;
  location: string;
  url: string;
  postedAt?: string;
  source: { name: string; url: string };
};
