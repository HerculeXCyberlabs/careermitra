import Link from 'next/link';
import { getStats } from '@/lib/db';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const stats = await getStats();
  return (
    <main className="container hero-wrap">
      <section className="hero">
        <h1 className="hero-title">
          Every government job in India — <span className="accent">verified</span>.
        </h1>
        <p className="hero-sub">
          CareerMitra collects opportunities from official government sources, verifies each one, and
          puts them in one place. No noise. No scams.
        </p>
        <div className="hero-cta">
          <Link href="/jobs" className="btn-primary">
            Browse verified jobs →
          </Link>
          <Link href="/profile" className="btn-ghost">
            Personalize
          </Link>
        </div>
        <div className="hero-stats">
          <div className="stat">
            <span className="stat-num">{stats.jobs}</span>
            <span className="stat-label">verified jobs</span>
          </div>
          <div className="stat">
            <span className="stat-num">{stats.organizations}</span>
            <span className="stat-label">organizations</span>
          </div>
          <div className="stat">
            <span className="stat-num">{stats.sectors}</span>
            <span className="stat-label">sectors</span>
          </div>
        </div>
      </section>

      <ul className="value">
        <li>
          <b>Official only.</b> We never scrape aggregators — every listing links to a government
          portal.
        </li>
        <li>
          <b>Human-verified.</b> Nothing is published until a reviewer approves it.
        </li>
        <li>
          <b>Current.</b> Old and archived notices are filtered out.
        </li>
      </ul>
    </main>
  );
}
