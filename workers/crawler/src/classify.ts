// S024 — opportunity-type classification.
// A recruitment page mixes open jobs with results, admit cards, answer keys, and empanelment/tender
// notices. This classifies each notice title into a canonical type so the review queue and the
// platform can show *open jobs* as jobs — and route the rest to their proper module (Results,
// Admit Cards, Answer Keys per Master PRD §9.4). Title-based for now; the detail page (S027) can
// refine it later. Rules are ordered most-specific first: a "Recruitment Result" is a result.

import type { OpportunityType } from './types.js';

const RULES: Array<{ type: OpportunityType; re: RegExp }> = [
  {
    type: 'result',
    re: /\b(results?|merit list|selected candidates?|provisionally selected|list of (selected|provisional|qualified|recommended|shortlisted)|shortlist|cut.?off|score ?card|marks of)\b/i,
  },
  {
    type: 'admit_card',
    re: /\b(admit card|call letter|hall ticket|e-?admit|intimation slip|admission certificate|exam (schedule|date|city|centre|center))\b/i,
  },
  {
    type: 'answer_key',
    re: /\b(answer.?keys?|question papers?|objection (window|tracker|link)?)\b/i,
  },
  {
    type: 'empanelment',
    re: /\b(empanel(led|ed|ment)?|panel of|business (partner|associate)|tenders?|expression of interest|\beoi\b|vendors?|quotations?)\b/i,
  },
  {
    type: 'job',
    re: /\b(recruit(ment)?|vacan(cy|cies)|advertisements?|advt|walk.?in|engagement|apprentice(ship)?|internship|fellowship|\bjrf\b|\bsrf\b|notifications?|posts?|appointment|hiring|career)\b/i,
  },
];

export function classifyType(title: string): OpportunityType {
  for (const { type, re } of RULES) if (re.test(title)) return type;
  return 'other';
}
