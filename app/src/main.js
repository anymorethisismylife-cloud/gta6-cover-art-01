// Neon Coast boot: ?shot=cover|portrait|square draws one deterministic exported
// cover full-frame; ?shot=editor opens the editor with the sample photos loaded;
// any other URL opens the plain editor for the user.

import { CoverEditor, defaultState, loadSamples } from './editor.js';
import { runCoverShot, runEditorShot } from './shots.js';

async function bootEditor() {
  const editor = new CoverEditor(document.getElementById('app'), defaultState());
  await loadSamples(editor.state);
  editor.refreshAll();
  editor.note('Sample photos loaded — add your own, or export right away.');
  return editor;
}

async function boot() {
  const params = new URLSearchParams(window.location.search);
  const shot = params.get('shot');
  try {
    if (shot === 'cover' || shot === 'portrait' || shot === 'square') {
      await runCoverShot(shot);
    } else if (shot === 'editor') {
      await runEditorShot();
    } else {
      await bootEditor();
    }
  } catch (err) {
    document.getElementById('app').innerHTML =
      `<p style="color:#fff;padding:24px;font:16px system-ui">Neon Coast could not start: ${err.message}</p>`;
  }
}

boot();
