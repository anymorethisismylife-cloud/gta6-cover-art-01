// Neon Coast — entry program for gta6-cover-art-01.
//
// Hands the finished app in: copies this repository's app/ and screenshots/
// into the output directory, then writes dossier.json with the vendored
// make.fun library (vendor/makefun-app.ts, unchanged from the kit).
// Node 22+, standard library only.
//
// Local run:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
// In the grader MAKEFUN_OUTPUT_DIR is unset and /output is used instead.

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-app.ts';

// The repository root is the directory holding this file.
const repoRoot = dirname(fileURLToPath(import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// The scorer's own caps for this bounty (kit reference/gate.json). The text
// cap shapes the dossier bytes; the rest make this program refuse exactly
// where the scorer would refuse the entry.
const dossierCaps = {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
  app_path_max_bytes: 1000,
};

mkdirSync(outputDir, { recursive: true });
cpSync(join(repoRoot, 'app'), join(outputDir, 'app'), { recursive: true });

const shotsOut = join(outputDir, 'screenshots');
mkdirSync(shotsOut, { recursive: true });
if (existsSync(join(repoRoot, 'screenshots'))) {
  cpSync(join(repoRoot, 'screenshots'), shotsOut, { recursive: true });
}

writeFileSync(join(outputDir, 'dossier.json'), buildDossier(outputDir, dossierCaps));
console.log(`Neon Coast entry written to ${outputDir}`);
