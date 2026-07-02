# Source Registry — how to fill the sheet

Fill **`source-registry-template.csv`** — one row per official source. You can open it in Excel /
Google Sheets, fill your ~2000 rows, then **export/Save As CSV** and import it:

```bash
npx tsx src/cli.ts import-sources data-intake/source-registry-template.csv
```

> **Golden rule:** only **official** government / board / PSU / bank / university sites. **No**
> aggregators (FreeJobAlert, SarkariResult, Testbook) — the whole point is official provenance.

---

## The columns

| Column | Required? | What to put | Allowed values / format |
|---|---|---|---|
| `source_id` | ✅ | short unique id, kebab-case | e.g. `ssc`, `rrb-cdg`, `uppsc`, `sbi` |
| `name` | ✅ | full official name of the body/board | free text |
| `organization_name` | ⬜ | canonical org (defaults to `name`) | free text |
| `sector` | ✅ | category of the body | `central` `state` `psu` `university` `judiciary` `railway` `banking` `defence` `research` `autonomous` |
| `jurisdiction` | ⬜ | `central` / `national` / a state | e.g. `central`, `Uttar Pradesh` |
| `state` | ⬜ | state name if state-level | e.g. `Bihar` (blank for central) |
| `official_domain` | ✅ | root domain only | e.g. `ssc.gov.in` (no `https://`) |
| **`notice_list_url`** | ✅ | **THE PAGE THAT LISTS NOTIFICATIONS** (not the homepage, unless the homepage is the list) | full URL, e.g. `https://www.rrbcdg.gov.in/notice-board` |
| `notice_list_type` | ⬜ | how the list is served (helps us pick the fetch method) | `static_html` `javascript_rendered` `pdf_list` `rss_feed` `unknown` |
| `opportunity_types` | ⬜ | what it publishes | pipe-separated: `jobs\|results\|admit_cards\|answer_keys` |
| `keywords` | ⬜ | words that appear in real notice links (helps filter noise) | pipe-separated: `recruit\|notification\|cen\|group d` |
| `priority` | ⬜ | how important/high-volume (1–5) | `5` = top priority |
| `notes` | ⬜ | anything useful | e.g. "list under Candidate's Corner", "login required" |

**Minimum to be usable:** `source_id`, `name`, `sector`, `official_domain`, `notice_list_url`.
Everything else improves quality but can be blank.

**Formatting rules:** commas inside a cell → wrap the cell in `"double quotes"`. Multi-value cells
(`opportunity_types`, `keywords`) use the pipe `|` as separator, **not** commas.

---

## Answering your Railway question directly

For Railway I need — **per board** — the **`notice_list_url`**: the page that lists that board's
**CENs / notifications**. Railway is **federated**, so it's several rows, not one:

- **~21 RRB regional boards** (Chandigarh `rrbcdg.gov.in`, Prayagraj `rrbald.gov.in`, Bengaluru
  `rrbbnc.gov.in`, Mumbai `rrbmumbai.gov.in`, …) — one row each, each with its own `notice_list_url`.
- **RRC** boards for Level-1 / Group D (zone-wise).
- The **centralised RRB apply portal** (when a CEN is live).

So: give me the **notice/notification-list page URL** for each board (the page where the CENs are
listed) — **not** the homepage, unless that homepage literally shows the notice list. The template
already has `rrb-cdg`, `rrb-ald`, `rrc-ner` as example rows to copy.

The same answer applies to every source: **I need the URL of the page that lists the notifications.**

---

## What I do with each column
- `notice_list_url` → the page the crawler fetches.
- `keywords` → filter real recruitment links from menu/footer noise (blank = sensible defaults).
- `notice_list_type` → tells me if a source needs a JavaScript-rendered fetch (Playwright) vs plain HTML.
- `sector` / `organization_name` → map to canonical `reference.organizations` + `recruitment.sector`.
- `official_domain` → provenance + `robots.txt` politeness.

Fill even 20–50 rows well and we can start ingesting real data immediately; the sheet then grows toward your 2000.
