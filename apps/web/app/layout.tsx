import type { Metadata } from 'next';
import Link from 'next/link';
import './globals.css';

export const metadata: Metadata = {
  title: 'CareerMitra — Verified Government Jobs',
  description:
    'Verified government job opportunities in India, sourced from official portals with human verification.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <nav className="topnav">
          <Link href="/" className="brand">
            Career<span className="accent">Mitra</span>
          </Link>
          <div className="nav-links">
            <Link href="/jobs">Jobs</Link>
            <Link href="/profile">Profile</Link>
          </div>
        </nav>
        {children}
      </body>
    </html>
  );
}
