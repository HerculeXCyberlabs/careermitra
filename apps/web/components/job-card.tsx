import Link from 'next/link';
import type { JobRow } from '@/lib/db';

export function JobCard({ job }: { job: JobRow }) {
  return (
    <li className="card">
      <div className="org">
        {job.organizationName} <span className="sector">{job.sector}</span>
      </div>
      <h2 className="title">
        <Link href={`/jobs/${job.id}`} className="title-link">
          {job.title}
        </Link>
      </h2>
      <div className="meta">
        {job.vacancyCount != null && <span className="chip">{job.vacancyCount} post(s)</span>}
        {job.noticeYear != null && <span className="chip">{job.noticeYear}</span>}
        {job.closeDate && <span className="chip">closes {job.closeDate}</span>}
        <span className="chip verified">✓ verified</span>
      </div>
      <Link href={`/jobs/${job.id}`} className="link">
        View details →
      </Link>
    </li>
  );
}
