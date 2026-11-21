// Deterministic screenshot scenes for Neon Coast (?shot=...).
// Each scene loads the bundled sample photos and the shipped fonts, renders one
// fixed cover or editor state, then marks the page ready so a screenshot tool
// can capture a stable frame. Nothing here is random: the same URL always
// draws the same picture.

import { drawCover } from './cover.js';
import { CoverEditor, defaultState, loadSamples } from './editor.js';

export const SHOT_SCENES = {
  cover: {
    title: 'SUNSET HEIST',
    subtitle: 'Vice City nights',
    badge: 'Neon Coast',
    layout: 'hero-three',
    grade: 'vice-sunset',
    size: '1920x1080',
    panelPhotos: [0, 1, 0, 1],
    panelZoom: [1.25, 1.3, 1.15, 1.2],
  },
  portrait: {
    title: 'PIER PRESSURE',
    subtitle: 'golden hour crew',
    badge: 'Neon Coast',
    layout: 'grid9',
    grade: 'neon-nights',
    size: '1080x1350',
    panelPhotos: [0, 1, 0, 1, 0, 1, 0, 1, 0],
    panelZoom: [1.3, 1.2, 1.25, 1.2, 1.35, 1.2, 1.25, 1.3, 1.2],
  },
  square: {
    title: 'NEON SHORE',
    subtitle: 'tilted snapshots',
    badge: 'Neon Coast',
    layout: 'tilted',
    grade: 'candy-pop',
    size: '1080x1080',
    panelPhotos: [1, 0, 1],
    panelZoom: [1.2, 1.25, 1.15],
  },
  editor: {
    title: 'BOULEVARD QUEEN',
    subtitle: 'top down, sun out',
    badge: 'Neon Coast',
    layout: 'grid9',
    grade: 'vice-sunset',
    size: '1920x1080',
    panelPhotos: [1, 0, 1, 0, 1, 0, 1, 0, 1],
    panelZoom: [1.2, 1.3, 1.2, 1.25, 1.2, 1.3, 1.2, 1.25, 1.2],
  },
};

async function waitForFonts() {
  try {
    await Promise.all([
      document.fonts.load('400 80px Anton'),
      document.fonts.load('80px Pacifico'),
      document.fonts.ready,
    ]);
  } catch {
    // Fallbacks in the canvas font stacks still draw a clean cover.
  }
}

function applyScene(state, scene) {
  state.title = scene.title;
  state.subtitle = scene.subtitle;
  state.badge = scene.badge;
  state.layout = scene.layout;
  state.grade = scene.grade;
  state.size = scene.size;
  scene.panelPhotos.forEach((photo, i) => {
    if (state.panels[i]) {
      state.panels[i].photo = photo;
      state.panels[i].zoom = scene.panelZoom[i] || 1.2;
      state.panels[i].cx = 0.5;
      state.panels[i].cy = 0.45;
    }
  });
  return state;
}

function markReady() {
  document.documentElement.dataset.ready = '1';
  document.title = `Neon Coast — shot ready`;
}

/** Full-frame exported cover for ?shot=cover | portrait | square. */
export async function runCoverShot(sceneName) {
  const scene = SHOT_SCENES[sceneName] || SHOT_SCENES.cover;
  const state = defaultState();
  await loadSamples(state);
  applyScene(state, scene);
  await waitForFonts();
  const canvas = document.getElementById('shot-canvas');
  const wrap = document.getElementById('shot-wrap');
  wrap.hidden = false;
  const dims = { cover: [1920, 1080], portrait: [1080, 1350], square: [1080, 1080] }[sceneName] || [1920, 1080];
  canvas.width = dims[0];
  canvas.height = dims[1];
  canvas.style.aspectRatio = `${dims[0]} / ${dims[1]}`;
  drawCover(canvas.getContext('2d'), state, dims[0], dims[1]);
  markReady();
}

/** The editor with a photo loaded, for ?shot=editor. */
export async function runEditorShot() {
  const scene = SHOT_SCENES.editor;
  const state = defaultState();
  await loadSamples(state);
  applyScene(state, scene);
  await waitForFonts();
  const editor = new CoverEditor(document.getElementById('app'), state);
  editor.note('Nine-panel grid, Vice Sunset grade — export any size in one click.');
  markReady();
  return editor;
}
