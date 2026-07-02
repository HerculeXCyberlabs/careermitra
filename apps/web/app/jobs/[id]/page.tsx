import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getJobById } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const job = await getJobById(params.id);
  if (!job) return { title: 'Job not found — CareerMitra' };
  const posts = job.vacancyCount != null ? `${job.vacancyCount} post(s). ` : '';
  return {
    title: `${job.title} — ${job.organizationName} | CareerMitra`,
    description: `Verified ${job.sector} government vacancy at ${job.organizationName}. ${posts}Apply via the official notice.`,
  };
}

export default async function JobDetailPage({ params }: { params: { id: string } }) {
  const job = await getJobById(params.id);
  if (!job) notFound();

  return (
    <main className="container">
      <Link href="/jobs" className="back">
        ← All jobs
      </Link>
      <article className="detail">
        <div className="org">
          {job.organizationName} <span className="sector">{job.sector}</span>
        </div>
        <h1 className="detail-title">{job.title}</h1>
        <div className="meta">
          {job.vacancyCount != null && <span className="chip">{job.vacancyCount} post(s)</span>}
          {job.noticeYear != null && <span className="chip">{job.noticeYear}</span>}
          {job.closeDate && <span className="chip">closes {job.closeDate}</span>}
          {job.examName && <span className="chip">{job.examName}</span>}
          <span className="chip verified">✓ verified from official source</span>
        </div>

        <div className="detail-actions">
          <a href={job.officialUrl} target="_blank" rel="noreferrer" className="btn-primary">
            Apply on official portal →
          </a>
        </div>

        <p className="disclaimer">
          CareerMitra links you to the official government notice and never auto-submits an
          application. Always confirm eligibility and details on the official portal.
        </p>
      </article>
    </main>
  );
}
