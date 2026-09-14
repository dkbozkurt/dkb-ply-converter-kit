# Playable Ads Converter Kit

Browser-based tool that takes a playable ad exported for one ad network and produces
upload-ready packages for other networks. It rewrites only the ad-network integration
layer (SDK bootstrap, lifecycle, CTA, analytics config) — the game code, scaffold and
assets are never touched.

Runs entirely client-side, so it can be hosted as a static site (GitHub Pages).

## How it works

```
source playable ──▶ 01 Analyze ──▶ 02 Strip source layer ──▶ 03 Neutral adapter ──▶ 04 Target layer ──▶ 05 Package ──▶ zip per target
```

| Stage | What happens |
| --- | --- |
| **01 Analyze** | Detects the source network (from the build's own `$environment.targetPlatform`, falling back to marker regexes) and classifies every inline `<script>` block: network integration, startup asset, or game code. |
| **02 Strip source layer** | Deletes the blocks that belong to the source network's integration (viewability watcher, CTA handler, network analytics). |
| **03 Neutral adapter** | Resets the analytics bootstrap to a network-less call, retargets `$environment.targetPlatform`, optionally externalizes the inline startup assets (`assets/scripts.js`, `jsons.js`, `blobs.js`) and installs the `window.PlayableAdapter` seam that every target wires into. |
| **04 Target layer** | The selected target's definition injects its own SDK, lifecycle and CTA (`PlayableAdapter.exit()` → network exit call). |
| **05 Package** | Optionally decodes the base-122 inlined images to loose files under `assets/`, then zips `index.html` + files. |

Each loaded playable is converted to **every selected target**, so N sources × M targets
produce N×M packages.

## Supported networks

Networks are described by small definition files in [`src/networks/`](src/networks/) and
registered in [`src/networks/index.js`](src/networks/index.js). The engine itself has no
network names in it — adding a network means adding a file there (see the
[network README](src/networks/README.md) for the shape).

| Network | As source | As target |
| --- | :-: | :-: |
| AppLovin | ✅ | greyed out (source only for now) |
| Unity | ✅ | greyed out (source only for now) |
| Google | – | ✅ |
| Meta | – | greyed out (coming soon) |
| Liftoff | – | greyed out (coming soon) |
| Mintegral | – | greyed out (coming soon) |
| Moloco | – | greyed out (coming soon) |
| Vungle | – | greyed out (coming soon) |
| TikTok | – | greyed out (coming soon) |
| MRAID (generic) | – | greyed out (coming soon) |
| AdColony | – | greyed out (coming soon) |

Unsupported targets still appear in the UI (disabled) so the picker is ready for them;
flipping `target.supported` to `true` and adding a `patch()` enables one.

## Using it

1. **Source playables** — drop one or more exported `.html` entry points. The chip next to
   each file shows which source network was detected.
2. **Target networks** — tick the networks you want. Disabled cards are not available yet.
3. **Convert** — the pipeline runs per source × target; the result card lists every step,
   the output file layout and sizes.
4. **Download** — one job hands back `<source>_<Target>.zip` directly; more than one gives
   `Converted_Playables.zip` containing `<TargetName>/<source>_<Target>.zip` files plus
   `conversion-log.txt`.

Validate Google output in the Google Playable Ad Testing Tool before launch.

## Debug / process logs

Every run writes a plain-text process log listing, per `source → target` job, each step
that ran with timestamps and any warnings or errors.

- **`npm run dev`** — the dev server writes it to **`temp/logs/<timestamp>_<name>.txt`**
  in the project root automatically (see [`temp/README.md`](temp/README.md)). The result
  card shows the path.
- **Hosted / static build** — there is no server to write to; use **Download log (.txt)**
  or open `conversion-log.txt` inside the bundle.

`temp/` is git-ignored.

## Development

```bash
npm install
npm run dev       # http://localhost:5173  (logs → temp/logs/)
npm run build     # static site in dist/
npm run preview   # serve dist/ locally
```

Stack: [Vite](https://vitejs.dev) + vanilla ES modules + [Sass](https://sass-lang.com)
(`src/styles/`, one partial per UI region) + [JSZip](https://stuk.github.io/jszip/).
No framework, no runtime dependencies beyond JSZip.

```
index.html                 shell markup
src/main.js                UI controller (sources, target picker, pipeline, report)
src/core/converter.js      generic engine: detect → strip → neutral → target → package
src/core/logger.js         process log (UI lines + .txt)
src/core/packager.js       zip naming / nesting / bundle
src/core/images.js         base-122 image extraction + <img> rewrite
src/core/html.js           script scanning, edits, injection helpers
src/networks/*.js          one definition per network + registry
src/ui/logos.js            inline SVG logos per network
src/styles/*.scss          tokens, base, header, pipeline, card, drop, networks, buttons, report
test-playable-builds/      sample AppLovin / Unity exports + a reference Google export
vite.config.js             GitHub Pages base path + dev log sink
```

The `src/core` and `src/networks` modules have no DOM or bundler dependencies, so they can
be imported straight into node for scripted checks.

## Deploying to GitHub Pages

The workflow in [`.github/workflows/deploy-pages.yml`](.github/workflows/deploy-pages.yml)
builds on every push to `main` and publishes `dist/` with the official Pages actions.

One-time setup in the repository: **Settings → Pages → Build and deployment → Source:
GitHub Actions**.

The production base path defaults to `/<repo-name>/`. For a custom domain or a
user/organisation site set `BASE_PATH=/` when building.

## Notes

- Network logos in `src/assets/logos/` are simplified representative glyphs; drop in
  official brand assets with the same file names to replace them.
- Google output keeps images as loose files under `assets/assets/bundles/`, matching the
  layout of a native Google export; the extracted bytes are identical to the reference
  export in `test-playable-builds/`.
