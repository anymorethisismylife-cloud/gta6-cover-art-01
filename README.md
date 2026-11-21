# Neon Coast — GTA-style Cover Studio

Turn any photo and a caption into GTA-style multi-panel cover art, exported as
a PNG to share. Runs entirely offline in a desktop browser: photos never leave
your machine, and the app makes no network request.

## What it does

- **Any photo** — add your own photos, or use the two bundled samples. Click a
  panel to select it, drag to reposition the photo inside it, scroll to zoom,
  double-click (or the Swap button) to cycle its photo. One photo can fill
  several panels, or each panel can hold a different photo.
- **8 layouts** — Hero + Three, Nine-Panel Grid, Tilted Snapshots, Full Bleed,
  Triptych, Diagonal Split, Comic Strip, Magazine.
- **6 colour grades** — Vice Sunset, Neon Nights, Miami Teal, Palm Gold,
  Midnight, Candy Pop. Each is a gradient map over the photos, plus a warm
  sunset glow.
- **Lettering** — big Anton display capitals in a halftone title block, a
  Pacifico script subtitle, and a badge ribbon. Both fonts ship under the SIL
  Open Font License in `app/fonts/`.
- **Effects** — film grain, vignette, halftone title block, white poster frame.
- **Undo / redo** — full history (Ctrl+Z / Ctrl+Shift+Z).
- **Export** — one click exports the current size; "Export all three sizes"
  writes all of them: **1080 × 1080**, **1080 × 1350**, **1920 × 1080** PNG.

## Run it offline

```sh
node serve.ts
```

Then open <http://localhost:8080>. No build step, no install, no network.

## Originality

Everything here is original work. No Rockstar Games logo, wordmark, artwork,
character or font is used. The two sample photos (`app/samples/`) were made
with an image model for make.fun and are free to use. Fonts are Anton and
Pacifico under the SIL Open Font License (see `app/fonts/OFL.txt`).

## Screenshots

Deterministic scenes live behind `?shot=`:

- `?shot=cover` — landscape 1920×1080 exported cover (Hero + Three)
- `?shot=editor` — the editor with sample photos loaded (Nine-Panel Grid)
- `?shot=portrait` — portrait 1080×1350 exported cover (Nine-Panel Grid)
- `?shot=square` — square 1080×1080 exported cover (Tilted Snapshots)

## Entry

Built for the make.fun competition **gta6-cover-art-01** ("Make GTA 6 Cover
Art"). `main.ts` (Node 22, standard library only) copies `app/` and
`screenshots/` to the output directory and writes `dossier.json` with the
vendored make.fun library (`vendor/makefun-app.ts`, unchanged from the kit).

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

## License

MIT — see `LICENSE`.
