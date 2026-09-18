# Will Sindle — IAM Portfolio

A static portfolio and interactive **Identity Attack Path Analyzer**, published with GitHub Pages.
No build step, no backend, no dependencies to install — just open `index.html` or serve the folder.

## What's here

| Path | Purpose |
| --- | --- |
| `index.html` | Portfolio: summary, skills, experience, education, certifications, projects, contact. |
| `analyzer/index.html` | **Identity Attack Path Analyzer** — interactive identity graph and findings engine. |
| `assets/js/data.js` | Synthetic IAM environment generator + graph/attack-path/finding analysis engine. |
| `assets/js/analyzer.js` | Analyzer UI: D3 force-directed graph, filters, inspector, evidence export. |
| `assets/js/main.js` | Portfolio UI: skills filter, timeline, certifications, live GitHub repo feed. |
| `assets/css/style.css` | Shared dark security-ops theme. |
| `assets/vendor/d3.v7.min.js` | Vendored D3 v7 (keeps the site fully self-hosted). |

## The analyzer

- **Layered identity graph**: identities → groups → roles → entitlements → systems.
- **Attack-path engine**: BFS from any identity to any target system; "Simulate breach" picks a random compromised identity.
- **Findings**: dormant accounts, orphaned accounts, MFA gaps, privilege creep, segregation-of-duties conflicts, direct grants, over-provisioned contractors, stale roles, and short paths to crown jewels.
- **Evidence export**: CSV / JSON, framed for audit use.
- Uses an end-to-end **directed** graph, so "blast radius" is everything an identity can actually reach.

> **All data is fabricated.** No real identities, credentials, systems, or employer data are included.

## Run locally

```bash
# any static server works
python3 -m http.server 8080
# then open http://localhost:8080
```

## Deploy (GitHub Pages)

Push this repository to `arcstel/arcstel.github.io`. GitHub Pages serves the repository root at
`https://arcstel.github.io`. No workflow or build step is required.
