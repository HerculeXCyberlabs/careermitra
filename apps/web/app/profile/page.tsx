import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { getSectors } from '@/lib/db';

export const dynamic = 'force-dynamic';

interface Prefs {
  sector?: string;
  skill?: string;
}

async function savePrefs(formData: FormData): Promise<void> {
  'use server';
  const sector = String(formData.get('sector') ?? '');
  const skill = String(formData.get('skill') ?? '').trim();
  cookies().set('cm_prefs', JSON.stringify({ sector, skill }), {
    path: '/',
    maxAge: 60 * 60 * 24 * 90,
  });
  redirect('/jobs');
}

export default async function ProfilePage() {
  const sectors = await getSectors();
  const raw = cookies().get('cm_prefs')?.value;
  let prefs: Prefs = {};
  try {
    prefs = raw ? (JSON.parse(raw) as Prefs) : {};
  } catch {
    prefs = {};
  }

  return (
    <main className="container">
      <header className="page-head">
        <h1>Your profile</h1>
        <p className="tagline">Tell us your interests to personalize discovery.</p>
      </header>

      <form action={savePrefs} className="profile-form">
        <label className="field">
          <span>Interested sector</span>
          <select name="sector" defaultValue={prefs.sector ?? ''}>
            <option value="">Any sector</option>
            {sectors.map((s) => (
              <option key={s.sector} value={s.sector}>
                {s.sector} ({s.count})
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span>Skill / qualification keyword</span>
          <input
            type="text"
            name="skill"
            placeholder="e.g. cyber, engineer, manager, scientist"
            defaultValue={prefs.skill ?? ''}
          />
        </label>

        <button type="submit" className="btn-primary">
          Save &amp; see my jobs
        </button>
      </form>

      <p className="disclaimer">
        This personalizes what you see based on your interests. It is <b>not</b> an eligibility check
        — full eligibility matching (age, category, qualification rules) is coming.
      </p>
    </main>
  );
}
