import Link from 'next/link';
import { cookies } from 'next/headers';
import { getPublishedJobs, getSectors, MIN_NOTICE_YEAR } from '@/lib/db';
import { JobCard } from '@/components/job-card';

export const dynamic = 'force-dynamic';

interface Prefs {
  sector?: string;
  skill?: string;
}

function readPrefs(): Prefs {
  const raw = cookies().get('cm_prefs')?.value;
  if (!raw) return {};
  try {
    return JSON.parse(raw) as Prefs;
  } catch {
    return {};
  }
}

export default async function JobsPage({
  searchParams,
}: {
  searchParams: { q?: string; sector?: string };
}) {
  const prefs = readPrefs();
  const hasQuery = searchParams.q !== undefined || searchParams.sector !== undefined;
  const personalized = !hasQuery && Boolean(prefs.sector || prefs.skill);

  const q = ((hasQuery ? searchParams.q : prefs.skill) ?? '').trim();
  const sector = (hasQuery ? searchParams.sector : prefs.sector) ?? '';

  const [jobs, sectors] = await Promise.all([getPublishedJobs({ q, sector }), getSectors()]);

  const chipHref = (s: string) => {
    const p = new URLSearchParams();
    if (q) p.set('q', q);
    if (s) p.set('sector', s);
    const qs = p.toString();
    return qs ? `/jobs?${qs}` : '/jobs?sector=';
  };

  return (
    <main className="container">
      <header className="page-head">
        <h1>Government Jobs</h1>
        <p className="tagline">Verified · official sources · {MIN_NOTICE_YEAR} onward</p>
      </header>

      {personalized && (
        <div className="banner">
          Personalized for your interests
          {prefs.sector ? ` · ${prefs.sector}` : ''}
          {prefs.skill ? ` · “${prefs.skill}”` : ''}. <a href="/jobs?sector=">Show all</a> ·{' '}
          <Link href="/profile">Edit</Link>
        </div>
      )}

      <form className="search" action="/jobs" method="get">
        {sector && <input type="hidden" name="sector" value={sector} />}
        <input
          className="search-input"
          type="text"
          name="q"
          placeholder="Search title or organization…"
          defaultValue={q}
        />
        <button className="search-btn" type="submit">
          Search
        </button>
      </form>

      <div className="filters">
        <a className={`filter ${!sector ? 'active' : ''}`} href={chipHref('')}>
          All
        </a>
        {sectors.map((s) => (
          <a
            key={s.sector}
            className={`filter ${sector === s.sector ? 'active' : ''}`}
            href={chipHref(s.sector)}
          >
            {s.sector} <span className="filter-count">{s.count}</span>
          </a>
        ))}
      </div>

      <p className="count">
        {jobs.length} job{jobs.length === 1 ? '' : 's'}
        {q ? ` for “${q}”` : ''}
        {sector ? ` in ${sector}` : ''}
      </p>

      {jobs.length === 0 ? (
        <p className="empty">
          No matching jobs. <a href="/jobs?sector=">Clear filters</a>.
        </p>
      ) : (
        <ul className="jobs">
          {jobs.map((j) => (
            <JobCard key={j.id} job={j} />
          ))}
        </ul>
      )}
    </main>
  );
}
