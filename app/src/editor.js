// Neon Coast editor — wires the cover engine to the page: photo uploads, layout
// and grade pickers, caption fields, per-panel crop and position, undo/redo and
// PNG export in all three post sizes. Photos never leave the machine: uploads
// are read with FileReader and drawn straight to canvas.

import { GRADES, LAYOUTS, SIZES, drawCover, layoutRects, renderCoverCanvas } from './cover.js';

export const SAMPLE_PHOTOS = [
  { id: 'pier', name: 'Pier — golden hour', src: 'samples/pier.jpg' },
  { id: 'boulevard', name: 'Boulevard — convertible', src: 'samples/boulevard.jpg' },
];

const PANEL_COUNT = 9;
const HISTORY_LIMIT = 60;

export function defaultPanels() {
  return Array.from({ length: PANEL_COUNT }, (_, i) => ({
    photo: i % 2, zoom: 1.15, cx: 0.5, cy: 0.45,
  }));
}

export function defaultState() {
  return {
    title: 'SUNSET HEIST',
    subtitle: 'Vice City nights',
    badge: 'Neon Coast',
    layout: 'hero-three',
    grade: 'vice-sunset',
    size: '1920x1080',
    effects: { grain: true, vignette: true, halftone: true, frame: true },
    panels: defaultPanels(),
    photos: [],
    selectedPanel: 0,
  };
}

/** A JSON-safe copy of the state for the undo stack (photos hold Image objects). */
function snapshotState(state) {
  return JSON.stringify({
    title: state.title,
    subtitle: state.subtitle,
    badge: state.badge,
    layout: state.layout,
    grade: state.grade,
    size: state.size,
    effects: state.effects,
    panels: state.panels,
    selectedPanel: state.selectedPanel,
    photoIds: state.photos.map((p) => p.id),
  });
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`could not load ${src}`));
    img.src = src;
  });
}

export async function addPhotoFromSrc(state, src, name) {
  const img = await loadImage(src);
  const id = `photo-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
  const photo = { id, name: name || id, src, img };
  state.photos.push(photo);
  return photo;
}

export async function addPhotoFromFile(state, file) {
  const dataUrl = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('could not read file'));
    reader.readAsDataURL(file);
  });
  return addPhotoFromSrc(state, dataUrl, file.name);
}

export async function loadSamples(state) {
  for (const sample of SAMPLE_PHOTOS) {
    if (!state.photos.some((p) => p.id === sample.id)) {
      const img = await loadImage(sample.src);
      state.photos.push({ id: sample.id, name: sample.name, src: sample.src, img });
    }
  }
}

export function panelPhoto(state, index) {
  const panel = state.panels[index];
  if (!panel) return null;
  return state.photos[panel.photo] || null;
}

/** Cycle the selected panel through the loaded photos. */
export function cyclePanelPhoto(state, index) {
  if (state.photos.length < 2) return false;
  const panel = state.panels[index];
  panel.photo = (panel.photo + 1) % state.photos.length;
  return true;
}

/** Clamp a panel's crop so the photo always covers its rect. */
function clampPanel(panel) {
  panel.zoom = Math.min(4, Math.max(1, panel.zoom || 1));
  panel.cx = Math.min(1, Math.max(0, panel.cx == null ? 0.5 : panel.cx));
  panel.cy = Math.min(1, Math.max(0, panel.cy == null ? 0.5 : panel.cy));
}

export class CoverEditor {
  constructor(root, initialState) {
    this.root = root;
    this.state = initialState || defaultState();
    this.history = [];
    this.future = [];
    this.drag = null;
    this.onchange = null;
    this.buildDom();
    this.bindEvents();
    this.refreshAll();
  }

  commit(label) {
    this.history.push(snapshotState(this.state));
    if (this.history.length > HISTORY_LIMIT) this.history.shift();
    this.future = [];
    this.updateUndoButtons();
    if (label) this.note(label);
  }

  undo() {
    if (!this.history.length) return;
    this.future.push(snapshotState(this.state));
    this.restore(this.history.pop());
    this.updateUndoButtons();
  }

  redo() {
    if (!this.future.length) return;
    this.history.push(snapshotState(this.state));
    this.restore(this.future.pop());
    this.updateUndoButtons();
  }

  restore(json) {
    const data = JSON.parse(json);
    const keepPhotos = this.state.photos;
    Object.assign(this.state, data);
    this.state.photos = keepPhotos;
    this.refreshAll();
  }

  updateUndoButtons() {
    this.undoBtn.disabled = !this.history.length;
    this.redoBtn.disabled = !this.future.length;
  }

  note(text) {
    if (this.statusEl) this.statusEl.textContent = text;
  }

  buildDom() {
    this.root.innerHTML = '';
    const shell = document.createElement('div');
    shell.className = 'nc-shell';
    shell.innerHTML = `
      <header class="nc-header">
        <div class="nc-brand">
          <span class="nc-logo">NEON COAST</span>
          <span class="nc-tag">Cover Studio — GTA-style poster maker, 100% offline</span>
        </div>
        <div class="nc-header-actions">
          <button type="button" id="nc-undo" title="Undo (Ctrl+Z)">↩ Undo</button>
          <button type="button" id="nc-redo" title="Redo (Ctrl+Shift+Z)">↪ Redo</button>
          <button type="button" id="nc-export" class="nc-primary">⬇ Export PNG</button>
        </div>
      </header>
      <div class="nc-body">
        <aside class="nc-panel">
          <section>
            <h2>1 · Photos</h2>
            <label class="nc-upload">+ Add your photos
              <input type="file" id="nc-file" accept="image/*" multiple hidden>
            </label>
            <div class="nc-samples">
              <button type="button" data-sample="pier">Sample · Pier</button>
              <button type="button" data-sample="boulevard">Sample · Boulevard</button>
            </div>
            <div id="nc-thumbs" class="nc-thumbs"></div>
            <p class="nc-hint">Photos stay on your machine — never uploaded.</p>
          </section>
          <section>
            <h2>2 · Layout</h2>
            <div id="nc-layouts" class="nc-choices"></div>
          </section>
          <section>
            <h2>3 · Colour grade</h2>
            <div id="nc-grades" class="nc-choices"></div>
          </section>
          <section>
            <h2>4 · Caption</h2>
            <label>Title<input id="nc-title" type="text" maxlength="24" value="SUNSET HEIST"></label>
            <label>Subtitle<input id="nc-subtitle" type="text" maxlength="48" value="Vice City nights"></label>
            <label>Badge<input id="nc-badge" type="text" maxlength="20" value="Neon Coast"></label>
          </section>
          <section>
            <h2>5 · Effects</h2>
            <label class="nc-check"><input type="checkbox" id="nc-fx-grain" checked> Film grain</label>
            <label class="nc-check"><input type="checkbox" id="nc-fx-vignette" checked> Vignette</label>
            <label class="nc-check"><input type="checkbox" id="nc-fx-halftone" checked> Halftone title block</label>
            <label class="nc-check"><input type="checkbox" id="nc-fx-frame" checked> White poster frame</label>
          </section>
          <section>
            <h2>6 · Post size</h2>
            <div id="nc-sizes" class="nc-choices"></div>
            <button type="button" id="nc-export-all" class="nc-secondary">Export all three sizes</button>
          </section>
        </aside>
        <main class="nc-stage">
          <div class="nc-canvas-wrap">
            <canvas id="nc-preview"></canvas>
            <div id="nc-panel-tag" class="nc-panel-tag" hidden></div>
          </div>
          <div class="nc-stage-bar">
            <span id="nc-status">Pick a layout, drop in a photo, export.</span>
            <span class="nc-keys">Click a panel to select it · drag to reposition · scroll to zoom · double-click swaps its photo</span>
          </div>
          <div class="nc-panel-strip">
            <span>Selected panel:</span>
            <button type="button" id="nc-cycle">⇄ Swap photo</button>
            <button type="button" id="nc-zoom-out">− Zoom</button>
            <button type="button" id="nc-zoom-in">+ Zoom</button>
            <button type="button" id="nc-recenter">Recentre</button>
            <span id="nc-panel-name" class="nc-panel-name"></span>
          </div>
        </main>
      </div>`;
    this.root.appendChild(shell);
    this.canvas = shell.querySelector('#nc-preview');
    this.ctx = this.canvas.getContext('2d');
    this.statusEl = shell.querySelector('#nc-status');
    this.undoBtn = shell.querySelector('#nc-undo');
    this.redoBtn = shell.querySelector('#nc-redo');
    this.panelTag = shell.querySelector('#nc-panel-tag');
    this.panelName = shell.querySelector('#nc-panel-name');
    this.thumbsEl = shell.querySelector('#nc-thumbs');

    const layoutBox = shell.querySelector('#nc-layouts');
    for (const [id, layout] of Object.entries(LAYOUTS)) {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'nc-choice';
      b.dataset.layout = id;
      b.title = layout.hint;
      b.innerHTML = `<strong>${layout.label}</strong><span>${layout.slots.length} panel${layout.slots.length > 1 ? 's' : ''}</span>`;
      layoutBox.appendChild(b);
    }
    const gradeBox = shell.querySelector('#nc-grades');
    for (const [id, grade] of Object.entries(GRADES)) {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'nc-choice nc-grade';
      b.dataset.grade = id;
      b.title = grade.label;
      b.innerHTML = `<span class="nc-swatch" style="background:linear-gradient(90deg, ${grade.swatch.join(', ')})"></span><strong>${grade.label}</strong>`;
      gradeBox.appendChild(b);
    }
    const sizeBox = shell.querySelector('#nc-sizes');
    for (const [id, size] of Object.entries(SIZES)) {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'nc-choice';
      b.dataset.size = id;
      b.innerHTML = `<strong>${size.label}</strong>`;
      sizeBox.appendChild(b);
    }
  }

  bindEvents() {
    const q = (s) => this.root.querySelector(s);
    q('#nc-file').addEventListener('change', async (e) => {
      const files = [...e.target.files];
      if (!files.length) return;
      this.commit();
      for (const file of files) {
        try { await addPhotoFromFile(this.state, file); } catch { /* skip unreadable file */ }
      }
      this.refreshAll();
      this.note(`${files.length} photo${files.length > 1 ? 's' : ''} added — pick a layout and export.`);
      e.target.value = '';
    });
    this.root.querySelectorAll('[data-sample]').forEach((b) => {
      b.addEventListener('click', async () => {
        const sample = SAMPLE_PHOTOS.find((s) => s.id === b.dataset.sample);
        if (!sample) return;
        this.commit();
        await loadSamples(this.state);
        this.refreshAll();
        this.note(`Sample “${sample.name}” loaded.`);
      });
    });
    this.root.querySelectorAll('[data-layout]').forEach((b) => {
      b.addEventListener('click', () => {
        if (this.state.layout === b.dataset.layout) return;
        this.commit();
        this.state.layout = b.dataset.layout;
        this.state.selectedPanel = 0;
        this.refreshAll();
        this.note(`Layout: ${LAYOUTS[b.dataset.layout].label}.`);
      });
    });
    this.root.querySelectorAll('[data-grade]').forEach((b) => {
      b.addEventListener('click', () => {
        if (this.state.grade === b.dataset.grade) return;
        this.commit();
        this.state.grade = b.dataset.grade;
        this.refreshAll();
        this.note(`Grade: ${GRADES[b.dataset.grade].label}.`);
      });
    });
    this.root.querySelectorAll('[data-size]').forEach((b) => {
      b.addEventListener('click', () => {
        this.state.size = b.dataset.size;
        this.refreshAll();
      });
    });
    const titleInput = q('#nc-title');
    const subtitleInput = q('#nc-subtitle');
    const badgeInput = q('#nc-badge');
    titleInput.addEventListener('input', () => { this.state.title = titleInput.value; this.renderPreview(); });
    subtitleInput.addEventListener('input', () => { this.state.subtitle = subtitleInput.value; this.renderPreview(); });
    badgeInput.addEventListener('input', () => { this.state.badge = badgeInput.value; this.renderPreview(); });
    titleInput.addEventListener('change', () => this.commit('Caption updated.'));
    subtitleInput.addEventListener('change', () => this.commit('Caption updated.'));
    badgeInput.addEventListener('change', () => this.commit('Caption updated.'));
    for (const [key, id] of [['grain', '#nc-fx-grain'], ['vignette', '#nc-fx-vignette'], ['halftone', '#nc-fx-halftone'], ['frame', '#nc-fx-frame']]) {
      q(id).addEventListener('change', (e) => {
        this.commit();
        this.state.effects[key] = e.target.checked;
        this.renderPreview();
      });
    }
    this.undoBtn.addEventListener('click', () => this.undo());
    this.redoBtn.addEventListener('click', () => this.redo());
    q('#nc-export').addEventListener('click', () => this.exportCurrent());
    q('#nc-export-all').addEventListener('click', () => this.exportAll());
    q('#nc-cycle').addEventListener('click', () => {
      if (cyclePanelPhoto(this.state, this.state.selectedPanel)) {
        this.commit();
        this.refreshAll();
      }
    });
    q('#nc-zoom-in').addEventListener('click', () => this.zoomSelected(1.2));
    q('#nc-zoom-out').addEventListener('click', () => this.zoomSelected(1 / 1.2));
    q('#nc-recenter').addEventListener('click', () => {
      const panel = this.state.panels[this.state.selectedPanel];
      this.commit();
      panel.zoom = 1.15; panel.cx = 0.5; panel.cy = 0.45;
      this.renderPreview();
    });
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z' && !e.shiftKey) { e.preventDefault(); this.undo(); }
      if ((e.ctrlKey || e.metaKey) && (e.key.toLowerCase() === 'y' || (e.key.toLowerCase() === 'z' && e.shiftKey))) { e.preventDefault(); this.redo(); }
    });
    this.canvas.addEventListener('pointerdown', (e) => this.onPointerDown(e));
    this.canvas.addEventListener('pointermove', (e) => this.onPointerMove(e));
    this.canvas.addEventListener('pointerup', () => this.onPointerUp());
    this.canvas.addEventListener('pointerleave', () => this.onPointerUp());
    this.canvas.addEventListener('dblclick', (e) => {
      const index = this.panelAtEvent(e);
      if (index == null) return;
      if (cyclePanelPhoto(this.state, index)) { this.commit(); this.refreshAll(); }
    });
    this.canvas.addEventListener('wheel', (e) => {
      e.preventDefault();
      const index = this.panelAtEvent(e);
      if (index == null) return;
      const panel = this.state.panels[index];
      panel.zoom = Math.min(4, Math.max(1, panel.zoom * (e.deltaY < 0 ? 1.08 : 1 / 1.08)));
      clampPanel(panel);
      this.renderPreview();
    }, { passive: false });
    window.addEventListener('resize', () => this.renderPreview());
  }

  zoomSelected(factor) {
    const panel = this.state.panels[this.state.selectedPanel];
    panel.zoom = Math.min(4, Math.max(1, panel.zoom * factor));
    clampPanel(panel);
    this.commit();
    this.renderPreview();
  }

  /** Which layout slot (if any) sits under a pointer event on the preview. */
  panelAtEvent(e) {
    const size = SIZES[this.state.size];
    const rect = this.canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * size.w;
    const y = ((e.clientY - rect.top) / rect.height) * size.h;
    const rects = layoutRects(this.state.layout, size.w, size.h);
    for (let i = rects.length - 1; i >= 0; i--) {
      const r = rects[i];
      if (x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h) return i;
    }
    return null;
  }

  onPointerDown(e) {
    const index = this.panelAtEvent(e);
    if (index == null) return;
    this.canvas.setPointerCapture(e.pointerId);
    this.state.selectedPanel = index;
    const panel = this.state.panels[index];
    this.drag = { index, startX: e.clientX, startY: e.clientY, cx: panel.cx, cy: panel.cy, moved: false };
    this.refreshPanelTag();
  }

  onPointerMove(e) {
    if (!this.drag) return;
    const panel = this.state.panels[this.drag.index];
    const rect = this.canvas.getBoundingClientRect();
    const dx = (e.clientX - this.drag.startX) / rect.width;
    const dy = (e.clientY - this.drag.startY) / rect.height;
    if (Math.abs(dx) + Math.abs(dy) > 0.002) this.drag.moved = true;
    panel.cx = this.drag.cx - dx * (1 / (panel.zoom || 1));
    panel.cy = this.drag.cy - dy * (1 / (panel.zoom || 1));
    clampPanel(panel);
    this.renderPreview();
  }

  onPointerUp() {
    if (this.drag && this.drag.moved) this.commit('Panel repositioned.');
    this.drag = null;
  }

  refreshPanelTag() {
    const photo = panelPhoto(this.state, this.state.selectedPanel);
    this.panelTag.hidden = false;
    this.panelTag.textContent = `Panel ${this.state.selectedPanel + 1} · ${photo ? photo.name : 'no photo'}`;
    this.panelName.textContent = photo ? photo.name : 'No photo yet — add one above.';
  }

  refreshThumbs() {
    this.thumbsEl.innerHTML = '';
    this.state.photos.forEach((photo, i) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'nc-thumb';
      b.title = photo.name;
      const img = document.createElement('img');
      img.src = photo.src;
      img.alt = photo.name;
      b.appendChild(img);
      b.addEventListener('click', () => {
        this.commit();
        this.state.panels[this.state.selectedPanel].photo = i;
        this.refreshAll();
      });
      this.thumbsEl.appendChild(b);
    });
    if (!this.state.photos.length) {
      this.thumbsEl.innerHTML = '<p class="nc-hint">No photos yet — add yours or load a sample.</p>';
    }
  }

  refreshChoices() {
    this.root.querySelectorAll('[data-layout]').forEach((b) => b.classList.toggle('active', b.dataset.layout === this.state.layout));
    this.root.querySelectorAll('[data-grade]').forEach((b) => b.classList.toggle('active', b.dataset.grade === this.state.grade));
    this.root.querySelectorAll('[data-size]').forEach((b) => b.classList.toggle('active', b.dataset.size === this.state.size));
    this.root.querySelector('#nc-title').value = this.state.title;
    this.root.querySelector('#nc-subtitle').value = this.state.subtitle;
    this.root.querySelector('#nc-badge').value = this.state.badge;
    this.root.querySelector('#nc-fx-grain').checked = !!this.state.effects.grain;
    this.root.querySelector('#nc-fx-vignette').checked = !!this.state.effects.vignette;
    this.root.querySelector('#nc-fx-halftone').checked = !!this.state.effects.halftone;
    this.root.querySelector('#nc-fx-frame').checked = !!this.state.effects.frame;
  }

  renderPreview() {
    const size = SIZES[this.state.size];
    const wrap = this.canvas.parentElement;
    const availW = Math.min(wrap.clientWidth || 900, 1100);
    const availH = Math.max(320, (window.innerHeight || 800) - 260);
    const scale = Math.min(availW / size.w, availH / size.h, 1);
    const w = Math.max(320, Math.round(size.w * scale));
    const h = Math.round(size.h * scale);
    if (this.canvas.width !== w || this.canvas.height !== h) {
      this.canvas.width = w;
      this.canvas.height = h;
    }
    drawCover(this.ctx, this.state, w, h);
    this.refreshPanelTag();
  }

  refreshAll() {
    this.refreshChoices();
    this.refreshThumbs();
    this.renderPreview();
    this.updateUndoButtons();
    if (this.onchange) this.onchange(this.state);
  }

  downloadCanvas(canvas, filename) {
    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 5000);
    }, 'image/png');
  }

  exportCurrent() {
    const canvas = renderCoverCanvas(this.state, this.state.size);
    const size = SIZES[this.state.size];
    this.downloadCanvas(canvas, `neon-coast-${size.w}x${size.h}.png`);
    this.note(`Exported ${size.label} PNG — check your downloads.`);
  }

  exportAll() {
    Object.keys(SIZES).forEach((id, i) => {
      setTimeout(() => {
        const canvas = renderCoverCanvas(this.state, id);
        const size = SIZES[id];
        this.downloadCanvas(canvas, `neon-coast-${size.w}x${size.h}.png`);
      }, i * 250);
    });
    this.note('Exporting all three sizes — three PNGs are downloading.');
  }
}
