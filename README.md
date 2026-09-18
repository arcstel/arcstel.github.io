# Will Sindle — IAM Portfolio

A static portfolio and interactive **Identity Attack Path Analyzer**, published with GitHub Pages.
No build step, no backend, no dependencies to install — just open `index.html` or serve the folder.

## What's here

| Path | Purpose |
| --- | --- |
| `index.html` | Portfolio: summary, skills, experience, education, certifications, projects, contact. |
| `analyzer/index.html` | **Identity Attack Path Analyzer** — interactive identity graph and findings engine. |
| `music/index.html` | **W.P. music catalog** — browser player for the six-track hip hop catalog. |
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

## The music

A self-hosted catalog player for the **W.P.** hip hop catalog by Will Sindle — six tracks
produced by hand in FL Studio, recovered from the original ReverbNation artist page.

- `music/audio/*.mp3` — the six tracks (self-hosted, no third-party player).
- `music/art/cover.jpg` — cover art.
- `music/player.js` — vanilla-JS player: playlist, seek, volume, shuffle, repeat, keyboard
  shortcuts, and MediaSession/lock-screen metadata. No dependencies.
- `music/styles.css` — player theme layered on the shared dark security-ops stylesheet.

All music and artwork are © W.P. / Will Sindle.

## Run locally

```bash
# any static server works
python3 -m http.server 8080
# then open http://localhost:8080
```

## Deploy (GitHub Pages)

Push this repository to `arcstel/arcstel.github.io`. GitHub Pages serves the repository root at
`https://arcstel.github.io`. No workflow or build step is required.
