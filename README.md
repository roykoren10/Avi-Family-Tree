# Avi Family Tree

Hebrew RTL genealogy archive for the Yarkoni, Banko, Milikovsky and Marmor research. The site contains an interactive family tree, source-qualified person dossiers, a complete document library, timeline and searchable research reports.

## Run locally

```sh
python3 -m http.server 8080 --directory site
```

Open `http://localhost:8080`. The site uses native HTML, CSS and JavaScript with no build dependencies. All paths are relative, and person links use URL fragments so they work under a GitHub Pages project path.

## Data and evidence

Edit `site/data.json` for people, confidence-qualified facts, relationship references, sources and document associations. Edit `site/notes.json` and the matching public Markdown files in `site/assets/documents/` when updating research reports. Historical readings in the journal do not override the current summary or the curated person dossiers.

Primary evidence and family-provided information are distinct. Candidate branches are separate. Similar names never create identity merges. The original evidence in the research workspace is not modified. The public journal omits account and tool operation details while retaining research findings, source links, corrections and coverage limits.

Source access may require an account at the originating archive. Locally preserved scans remain available in the site. The 39 scans of the 1908 marriage volume are a research collection, not 39 identified family records.

## Verify

```sh
python3 validate.py
```

The validator checks all person/document references, source URLs, archived files and key research guardrails. Browser verification covers selection, search, document dialogs, report search, deep links, mobile fallback and both color themes.

## Publish

Publish the contents of `site/` to the `gh-pages` branch and configure GitHub Pages to use that branch at its root. No Actions workflow or additional token scope is required. The deployment URL is `https://roykoren10.github.io/Avi-Family-Tree/`.

## Design

A restrained heritage archive with a single green accent, source scans, native system fonts, consistent 6px corners and light/dark modes. The tree is a functional diagram, not a decorative illustration. Native scrolling, zoom and a list alternative support keyboard and mobile navigation. All motion honors reduced-motion preferences.

## Verification result

Local Chrome verification passed at 1440×1080 and 390×844, including person selection, Hebrew search, candidate branch separation, zoom, document and PDF dialogs, report search, the 58-row JRI report, fragment deep links, mobile list mode and both color themes. No page errors or failed asset requests occurred.

Lighthouse 12.8.2, using the mobile simulated profile against the local server, reported Performance 98, Accessibility 100, Best Practices 100 and SEO 100. Largest Contentful Paint was 2.4 seconds, Total Blocking Time 0 ms and Cumulative Layout Shift 0.003. These are local audit results, not guarantees for every network or device.
