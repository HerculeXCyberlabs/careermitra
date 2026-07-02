// S027b — extract text from a notice PDF so field extraction (close date, eligibility, fee) can run
// on it. Most government notices are text-based PDFs, which pdf-parse reads directly. Scanned
// (image-only) PDFs return little/no text — those need OCR, a later increment; we simply get a low
// extraction confidence for them, so they route to human review (Data Engine PRD §5) rather than
// being published with missing dates.

// Import the lib entry directly to avoid pdf-parse's index.js debug block (which reads a test file).
import pdfParse from 'pdf-parse/lib/pdf-parse.js';

// Many government PDFs render with a space between every glyph ("l a s t  d a t e"). When a doc is
// heavily glyph-spaced, merge runs of single-character tokens back into words so keyword/date
// regexes can match. Normally-spaced docs (few single-char tokens) are left untouched.
function collapseGlyphSpacing(t: string): string {
  const tokens = t.split(/\s+/).filter(Boolean);
  if (tokens.length < 20) return t;
  const singles = tokens.filter((w) => w.length === 1).length;
  if (singles / tokens.length < 0.5) return t;
  const out: string[] = [];
  let buf = '';
  for (const tok of tokens) {
    if (tok.length === 1) {
      buf += tok;
    } else {
      if (buf) { out.push(buf); buf = ''; }
      out.push(tok);
    }
  }
  if (buf) out.push(buf);
  return out.join(' ');
}

export async function pdfToText(data: Buffer): Promise<string> {
  const res = await pdfParse(data);
  const raw = (res.text ?? '').replace(/[ \t]+/g, ' ').trim();
  return collapseGlyphSpacing(raw).slice(0, 12000);
}
