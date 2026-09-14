# temp/

Scratch folder for debugging. Everything in here except this file is ignored by git.

- `logs/` — one `.txt` process log per conversion run, written automatically by the
  Vite dev server while you use the tool under `npm run dev`. File names look like
  `2026-09-14T09-47-28-950Z_<first-source>_process-log.txt`.

Each log lists, per `source → target` job, every pipeline step that ran (detection,
which script blocks were stripped, what was externalized, what the target layer
injected, packaging), with timestamps and any warnings/errors — so if a converted
playable misbehaves you can see exactly what the kit did to it.

The hosted GitHub Pages build has no server to write to; there the same log is
available via **Download log (.txt)** and is bundled as `conversion-log.txt` inside
multi-package downloads.
