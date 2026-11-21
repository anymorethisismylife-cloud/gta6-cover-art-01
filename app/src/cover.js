// Neon Coast cover engine — draws GTA-style multi-panel cover art on a 2D canvas.
// Everything here is original work for this entry: no Rockstar artwork, logo or
// font is used. Lettering is Anton (display) and Pacifico (script), both SIL OFL
// files shipped under app/fonts/.

export const GRADES = {
  'vice-sunset': {
    label: 'Vice Sunset',
    swatch: ['#1a0b2e', '#e84393', '#ffd166'],
    stops: [
      [0.0, 26, 11, 46], [0.22, 94, 32, 110], [0.45, 216, 54, 120],
      [0.68, 255, 123, 61], [0.88, 255, 209, 102], [1.0, 255, 246, 214],
    ],
    accent: '#ff2e88',
  },
  'neon-nights': {
    label: 'Neon Nights',
    swatch: ['#04121f', '#00e5ff', '#ff2e88'],
    stops: [
      [0.0, 4, 18, 31], [0.25, 11, 61, 92], [0.5, 0, 190, 220],
      [0.72, 255, 46, 136], [0.9, 245, 240, 255], [1.0, 255, 255, 255],
    ],
    accent: '#00e5ff',
  },
  'miami-teal': {
    label: 'Miami Teal',
    swatch: ['#062a2a', '#2dd4bf', '#fbbf24'],
    stops: [
      [0.0, 6, 42, 42], [0.28, 15, 118, 110], [0.55, 45, 212, 191],
      [0.78, 251, 191, 36], [1.0, 255, 247, 204],
    ],
    accent: '#2dd4bf',
  },
  'palm-gold': {
    label: 'Palm Gold',
    swatch: ['#241a05', '#d97706', '#fffbeb'],
    stops: [
      [0.0, 36, 26, 5], [0.3, 124, 90, 16], [0.58, 217, 119, 6],
      [0.8, 251, 191, 36], [1.0, 255, 251, 235],
    ],
    accent: '#f59e0b',
  },
  midnight: {
    label: 'Midnight',
    swatch: ['#050510', '#6d28d9', '#e0e7ff'],
    stops: [
      [0.0, 5, 5, 16], [0.3, 30, 27, 75], [0.58, 109, 40, 217],
      [0.82, 167, 139, 250], [1.0, 224, 231, 255],
    ],
    accent: '#a78bfa',
  },
  'candy-pop': {
    label: 'Candy Pop',
    swatch: ['#2b0a3d', '#f472b6', '#fef08a'],
    stops: [
      [0.0, 43, 10, 61], [0.3, 192, 38, 211], [0.58, 244, 114, 182],
      [0.8, 251, 146, 60], [1.0, 254, 240, 138],
    ],
    accent: '#f472b6',
  },
};

export const LAYOUTS = {
  'hero-three': {
    label: 'Hero + Three',
    hint: 'One big hero, three stacked moments',
    slots: [
      { x: 0, y: 0, w: 0.62, h: 1 },
      { x: 0.62, y: 0, w: 0.38, h: 0.34 },
      { x: 0.62, y: 0.34, w: 0.38, h: 0.33 },
      { x: 0.62, y: 0.67, w: 0.38, h: 0.33 },
    ],
  },
  grid9: {
    label: 'Nine-Panel Grid',
    hint: 'The classic poster grid, 3 by 3',
    slots: [
      { x: 0, y: 0, w: 1 / 3, h: 1 / 3 }, { x: 1 / 3, y: 0, w: 1 / 3, h: 1 / 3 }, { x: 2 / 3, y: 0, w: 1 / 3, h: 1 / 3 },
      { x: 0, y: 1 / 3, w: 1 / 3, h: 1 / 3 }, { x: 1 / 3, y: 1 / 3, w: 1 / 3, h: 1 / 3 }, { x: 2 / 3, y: 1 / 3, w: 1 / 3, h: 1 / 3 },
      { x: 0, y: 2 / 3, w: 1 / 3, h: 1 / 3 }, { x: 1 / 3, y: 2 / 3, w: 1 / 3, h: 1 / 3 }, { x: 2 / 3, y: 2 / 3, w: 1 / 3, h: 1 / 3 },
    ],
  },
  tilted: {
    label: 'Tilted Snapshots',
    hint: 'Three polaroids tossed on the table',
    tilted: true,
    slots: [
      { x: 0.03, y: 0.1, w: 0.44, h: 0.72, rot: -6 },
      { x: 0.5, y: 0.04, w: 0.44, h: 0.62, rot: 5 },
      { x: 0.38, y: 0.52, w: 0.5, h: 0.44, rot: -2.5 },
    ],
  },
  fullbleed: {
    label: 'Full Bleed',
    hint: 'One photo, edge to edge',
    slots: [{ x: 0, y: 0, w: 1, h: 1 }],
  },
  triptych: {
    label: 'Triptych',
    hint: 'Three tall columns',
    slots: [
      { x: 0, y: 0, w: 1 / 3, h: 1 },
      { x: 1 / 3, y: 0, w: 1 / 3, h: 1 },
      { x: 2 / 3, y: 0, w: 1 / 3, h: 1 },
    ],
  },
  diagonal: {
    label: 'Diagonal Split',
    hint: 'Two photos cut on the diagonal',
    diagonal: true,
    slots: [
      { x: 0, y: 0, w: 1, h: 1, clip: 'top' },
      { x: 0, y: 0, w: 1, h: 1, clip: 'bottom' },
    ],
  },
  comic: {
    label: 'Comic Strip',
    hint: 'Two up top, one wide below',
    slots: [
      { x: 0, y: 0, w: 0.5, h: 0.52 },
      { x: 0.5, y: 0, w: 0.5, h: 0.52 },
      { x: 0, y: 0.52, w: 1, h: 0.48 },
    ],
  },
  magazine: {
    label: 'Magazine',
    hint: 'Big hero on top, two below',
    slots: [
      { x: 0, y: 0, w: 1, h: 0.62 },
      { x: 0, y: 0.62, w: 0.5, h: 0.38 },
      { x: 0.5, y: 0.62, w: 0.5, h: 0.38 },
    ],
  },
};

export const SIZES = {
  '1920x1080': { w: 1920, h: 1080, label: 'Landscape 1920 × 1080' },
  '1080x1350': { w: 1080, h: 1350, label: 'Portrait 1080 × 1350' },
  '1080x1080': { w: 1080, h: 1080, label: 'Square 1080 × 1080' },
};

// White gutter between panels, in cover pixels at 1080 height.
const GAP = 10;

// How strongly the gradient-map grade replaces the photo's own colour.
const GRADE_MIX = 0.55;

// A tiny seeded generator, so the film grain looks random but renders the
// same pixels on every run — exports stay byte-identical.
function seededRandom(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Build a 256-entry RGB lookup table from a grade's colour stops. */
export function gradeLookup(grade) {
  const table = new Uint8Array(256 * 3);
  const stops = grade.stops;
  for (let i = 0; i < 256; i++) {
    const t = i / 255;
    let a = stops[0];
    let b = stops[stops.length - 1];
    for (let s = 0; s < stops.length - 1; s++) {
      if (t >= stops[s][0] && t <= stops[s + 1][0]) { a = stops[s]; b = stops[s + 1]; break; }
    }
    const span = b[0] - a[0] || 1;
    const f = Math.min(1, Math.max(0, (t - a[0]) / span));
    table[i * 3] = Math.round(a[1] + (b[1] - a[1]) * f);
    table[i * 3 + 1] = Math.round(a[2] + (b[2] - a[2]) * f);
    table[i * 3 + 2] = Math.round(a[3] + (b[3] - a[3]) * f);
  }
  return table;
}

/** One shared film-grain tile, drawn as a repeating pattern. */
let grainTile = null;
export function grainPattern(ctx) {
  if (grainTile) return grainTile;
  const tile = document.createElement('canvas');
  tile.width = 140;
  tile.height = 140;
  const tctx = tile.getContext('2d');
  const img = tctx.createImageData(140, 140);
  const rand = seededRandom(20261120);
  for (let i = 0; i < img.data.length; i += 4) {
    const v = 96 + Math.floor(rand() * 96);
    img.data[i] = v; img.data[i + 1] = v; img.data[i + 2] = v; img.data[i + 3] = 255;
  }
  tctx.putImageData(img, 0, 0);
  grainTile = ctx.createPattern(tile, 'repeat');
  return grainTile;
}

/**
 * Draw one photo into a rectangle with cover-fit, a zoom factor and a focal
 * point (cx, cy in 0..1 of the image). The photo is graded afterwards by the
 * caller over the whole cover, so panels stay consistent.
 */
export function drawPhotoInto(ctx, photo, rect, panel) {
  const img = photo && photo.img;
  if (!img || !img.naturalWidth) {
    ctx.fillStyle = '#241a33';
    ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = `600 ${Math.max(14, rect.h * 0.05)}px system-ui, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('ADD A PHOTO', rect.x + rect.w / 2, rect.y + rect.h / 2);
    return;
  }
  const zoom = panel.zoom || 1;
  const iw = img.naturalWidth;
  const ih = img.naturalHeight;
  const scale = Math.max(rect.w / iw, rect.h / ih) * zoom;
  const dw = iw * scale;
  const dh = ih * scale;
  const cx = panel.cx == null ? 0.5 : panel.cx;
  const cy = panel.cy == null ? 0.5 : panel.cy;
  const dx = rect.x + rect.w / 2 - dw * cx;
  const dy = rect.y + rect.h / 2 - dh * cy;
  ctx.save();
  ctx.beginPath();
  ctx.rect(rect.x, rect.y, rect.w, rect.h);
  ctx.clip();
  ctx.drawImage(img, dx, dy, dw, dh);
  ctx.restore();
}

/** Push a panel rect inward by the white gutter, keeping the outer edge flush. */
function guttered(slot, W, H, gap) {
  const x = slot.x * W + (slot.x > 0 ? gap / 2 : 0);
  const y = slot.y * H + (slot.y > 0 ? gap / 2 : 0);
  const w = slot.w * W - (slot.x > 0 ? gap / 2 : 0) - (slot.x + slot.w < 1 ? gap / 2 : 0);
  const h = slot.h * H - (slot.y > 0 ? gap / 2 : 0) - (slot.y + slot.h < 1 ? gap / 2 : 0);
  return { x, y, w, h };
}

/** Pixel rects for every slot of a layout at cover size W x H. */
export function layoutRects(layoutId, W, H) {
  const layout = LAYOUTS[layoutId] || LAYOUTS['hero-three'];
  const gap = Math.round(GAP * (H / 1080));
  if (layout.tilted) {
    return layout.slots.map((s) => ({
      x: s.x * W, y: s.y * H, w: s.w * W, h: s.h * H, rot: s.rot || 0, tilted: true,
    }));
  }
  return layout.slots.map((s) => ({ ...guttered(s, W, H, gap), clip: s.clip || null }));
}

/** Fit Anton text to a width by shrinking the font until it fits. */
function fitFont(ctx, text, weight, family, startPx, maxWidth) {
  let px = startPx;
  ctx.font = `${weight} ${px}px ${family}`;
  while (px > 18 && ctx.measureText(text).width > maxWidth) {
    px -= 4;
    ctx.font = `${weight} ${px}px ${family}`;
  }
  return px;
}

function drawHalftoneDots(ctx, x, y, w, h, accent) {
  const step = Math.max(14, h / 9);
  ctx.save();
  ctx.fillStyle = accent;
  for (let row = 0; row * step < h; row++) {
    for (let col = 0; col * step < w; col++) {
      const px = x + col * step + (row % 2 ? step / 2 : 0);
      const py = y + row * step;
      const r = Math.max(1.2, step * 0.16 * (1 + 0.5 * Math.sin(col * 0.7 + row)));
      ctx.globalAlpha = 0.16 + 0.1 * ((col + row) % 3);
      ctx.beginPath();
      ctx.arc(px, py, r, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}

/**
 * The title block: a dark band with halftone dots, the big Anton caption with
 * a neon offset shadow, the Pacifico subtitle and a small badge pill.
 */
export function drawTitleBlock(ctx, state, W, H, grade) {
  const bandH = Math.round(H * 0.21);
  const y = H - bandH;
  const pad = Math.round(W * 0.035);
  ctx.save();
  ctx.fillStyle = 'rgba(12, 6, 24, 0.92)';
  ctx.fillRect(0, y, W, bandH);
  if (state.effects.halftone) drawHalftoneDots(ctx, 0, y, W, bandH, grade.accent);
  ctx.fillStyle = grade.accent;
  ctx.fillRect(0, y, W, Math.max(4, H * 0.006));
  const title = (state.title || 'UNTITLED').toUpperCase();
  // Reserve the badge pill's width first, so a long title never runs under it.
  let badgeW = 0;
  let badgePx = 0;
  if (state.badge) {
    badgePx = Math.round(H * 0.021);
    ctx.font = `700 ${badgePx}px system-ui, sans-serif`;
    badgeW = ctx.measureText(`★ ${state.badge.toUpperCase()} ★`).width + badgePx * 1.6;
  }
  const maxW = W - pad * 2 - (badgeW ? badgeW + pad : 0);
  ctx.textBaseline = 'alphabetic';
  const titlePx = fitFont(ctx, title, 400, 'Anton, "Arial Black", sans-serif', Math.round(bandH * 0.52), maxW);
  const titleY = y + bandH * 0.62;
  ctx.textAlign = 'left';
  // Neon offset shadow, then a dark outline, then the white face.
  ctx.fillStyle = grade.accent;
  ctx.globalAlpha = 0.9;
  ctx.fillText(title, pad + Math.round(titlePx * 0.045), titleY + Math.round(titlePx * 0.045));
  ctx.globalAlpha = 1;
  ctx.lineWidth = Math.max(3, titlePx * 0.07);
  ctx.strokeStyle = '#14082b';
  ctx.lineJoin = 'round';
  ctx.strokeText(title, pad, titleY);
  ctx.fillStyle = '#ffffff';
  ctx.fillText(title, pad, titleY);
  if (state.subtitle) {
    const subPx = Math.round(bandH * 0.2);
    ctx.font = `${subPx}px Pacifico, cursive`;
    ctx.fillStyle = grade.accent;
    ctx.fillText(state.subtitle, pad + 2, y + bandH * 0.88);
  }
  if (state.badge) {
    ctx.font = `700 ${badgePx}px system-ui, sans-serif`;
    const label = `★ ${state.badge.toUpperCase()} ★`;
    const tw = ctx.measureText(label).width;
    const bx = W - pad - tw - badgePx * 1.6;
    const by = y + bandH * 0.16;
    const bh = badgePx * 2.1;
    ctx.fillStyle = grade.accent;
    ctx.beginPath();
    ctx.roundRect(bx, by, tw + badgePx * 1.6, bh, bh / 2);
    ctx.fill();
    ctx.fillStyle = '#14082b';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, bx + (tw + badgePx * 1.6) / 2, by + bh / 2 + 1);
    ctx.textBaseline = 'alphabetic';
  }
  ctx.restore();
}

function drawBadgeRibbon(ctx, state, W, H, grade) {
  if (!state.badge) return;
  const px = Math.round(H * 0.024);
  ctx.save();
  ctx.font = `700 ${px}px system-ui, sans-serif`;
  // On narrow covers (portrait / square) the full "BADGE • NEON COAST STUDIO"
  // ribbon spans most of the width and sits across the top row's faces.
  // Shortening it to the badge alone still covered the top-left man's eyes
  // (verified on a 2x zoomed crop), so omit the ribbon entirely when the
  // full pill would cover over half the cover width: the badge already
  // appears as a pill in the title block, so the ribbon adds no identity
  // here — only a face to cover. Landscape keeps the full ribbon.
  const label = `${state.badge.toUpperCase()}  •  NEON COAST STUDIO`;
  const tw = ctx.measureText(label).width;
  const padX = px * 1.1;
  if (tw + padX * 2 > W * 0.5) {
    ctx.restore();
    return;
  }
  ctx.fillStyle = 'rgba(12, 6, 24, 0.85)';
  ctx.beginPath();
  ctx.roundRect(Math.round(W * 0.03), Math.round(H * 0.03), tw + padX * 2, px * 2.2, px * 1.1);
  ctx.fill();
  ctx.fillStyle = grade.accent;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, Math.round(W * 0.03) + padX, Math.round(H * 0.03) + px * 1.1);
  ctx.restore();
}

/** Paint the photo panels for one layout (no grade, no lettering yet). */
function drawPanels(ctx, state, W, H, rects, layout) {
  const photoAt = (i) => {
    const panel = state.panels[i] || { photo: 0, zoom: 1, cx: 0.5, cy: 0.5 };
    return { panel, photo: state.photos[panel.photo] || null };
  };

  if (layout.diagonal) {
    const a = photoAt(0);
    const b = photoAt(1);
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(0, 0); ctx.lineTo(W, 0); ctx.lineTo(0, H); ctx.closePath();
    ctx.clip();
    drawPhotoInto(ctx, a.photo, { x: 0, y: 0, w: W, h: H }, a.panel);
    ctx.restore();
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(W, 0); ctx.lineTo(W, H); ctx.lineTo(0, H); ctx.closePath();
    ctx.clip();
    drawPhotoInto(ctx, b.photo, { x: 0, y: 0, w: W, h: H }, b.panel);
    ctx.restore();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = Math.max(4, H * 0.008);
    ctx.beginPath();
    ctx.moveTo(W, 0); ctx.lineTo(0, H);
    ctx.stroke();
    return;
  }

  if (layout.tilted) {
    // Sunset backdrop wash behind the polaroids.
    const wash = ctx.createLinearGradient(0, 0, W, H);
    wash.addColorStop(0, '#2b0a4a');
    wash.addColorStop(0.55, '#c22a72');
    wash.addColorStop(1, '#ff9a3d');
    ctx.fillStyle = wash;
    ctx.fillRect(0, 0, W, H);
    rects.forEach((r, i) => {
      const { panel, photo } = photoAt(i);
      ctx.save();
      ctx.translate(r.x + r.w / 2, r.y + r.h / 2);
      ctx.rotate((r.rot * Math.PI) / 180);
      ctx.fillStyle = '#fdfdf8';
      ctx.shadowColor = 'rgba(0,0,0,0.55)';
      ctx.shadowBlur = Math.round(H * 0.03);
      ctx.shadowOffsetY = Math.round(H * 0.012);
      const border = Math.round(H * 0.02);
      ctx.fillRect(-r.w / 2 - border, -r.h / 2 - border, r.w + border * 2, r.h + border * 2 + border * 2.4);
      ctx.shadowColor = 'transparent';
      drawPhotoInto(ctx, photo, { x: -r.w / 2, y: -r.h / 2, w: r.w, h: r.h }, panel);
      ctx.restore();
    });
    return;
  }

  rects.forEach((r, i) => {
    const { panel, photo } = photoAt(i);
    drawPhotoInto(ctx, photo, r, panel);
    ctx.strokeStyle = 'rgba(255,255,255,0.9)';
    ctx.lineWidth = Math.max(2, H * 0.002);
    ctx.strokeRect(r.x, r.y, r.w, r.h);
  });
}

/** Tilted layout carries its title at the top instead of a bottom band. */
function drawTiltedTitle(ctx, state, W, H, grade) {
  const pad = Math.round(W * 0.04);
  const title = (state.title || 'UNTITLED').toUpperCase();
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  const px = fitFont(ctx, title, 400, 'Anton, "Arial Black", sans-serif', Math.round(H * 0.11), W - pad * 2);
  const top = Math.round(H * 0.115);
  ctx.fillStyle = grade.accent;
  ctx.fillText(title, pad + 5, top + 5);
  ctx.lineWidth = Math.max(3, px * 0.07);
  ctx.strokeStyle = '#14082b';
  ctx.lineJoin = 'round';
  ctx.strokeText(title, pad, top);
  ctx.fillStyle = '#ffffff';
  ctx.fillText(title, pad, top);
  if (state.subtitle) {
    ctx.font = `${Math.round(H * 0.045)}px Pacifico, cursive`;
    ctx.fillStyle = '#ffffff';
    ctx.fillText(state.subtitle, pad + 2, Math.round(H * 0.175));
  }
}

/**
 * Render the whole cover for a state into ctx at W x H.
 * state.photos: [{img}] in panel order; state.panels[i]: {photo, zoom, cx, cy}.
 * state.title / subtitle / badge, layout, grade id, effects {grain, vignette,
 * halftone, frame}.
 */
export function drawCover(ctx, state, W, H) {
  const grade = GRADES[state.grade] || GRADES['vice-sunset'];
  const layout = LAYOUTS[state.layout] || LAYOUTS['hero-three'];
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = '#0d0618';
  ctx.fillRect(0, 0, W, H);
  const rects = layoutRects(state.layout, W, H);
  drawPanels(ctx, state, W, H, rects, layout);

  // Gradient-map grade over the photo area (kept off the title band).
  const table = gradeLookup(grade);
  const bandH = Math.round(H * 0.21);
  const photoH = layout.tilted ? H : H - bandH;
  const img = ctx.getImageData(0, 0, W, photoH);
  const d = img.data;
  for (let i = 0; i < d.length; i += 4) {
    const lum = Math.round(0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2]);
    const m = lum * 3;
    d[i] = Math.round(d[i] * (1 - GRADE_MIX) + table[m] * GRADE_MIX);
    d[i + 1] = Math.round(d[i + 1] * (1 - GRADE_MIX) + table[m + 1] * GRADE_MIX);
    d[i + 2] = Math.round(d[i + 2] * (1 - GRADE_MIX) + table[m + 2] * GRADE_MIX);
  }
  ctx.putImageData(img, 0, 0);

  // Warm sunset wash across the top third for the poster glow.
  const glow = ctx.createLinearGradient(0, 0, 0, photoH * 0.55);
  glow.addColorStop(0, 'rgba(255, 122, 61, 0.20)');
  glow.addColorStop(1, 'rgba(255, 122, 61, 0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, photoH * 0.55);

  if (layout.tilted) {
    drawTiltedTitle(ctx, state, W, H, grade);
  } else {
    drawTitleBlock(ctx, state, W, H, grade);
    drawBadgeRibbon(ctx, state, W, H, grade);
  }

  if (state.effects.vignette) {
    const vg = ctx.createRadialGradient(
      W / 2, H / 2, Math.min(W, H) * 0.42,
      W / 2, H / 2, Math.max(W, H) * 0.75,
    );
    vg.addColorStop(0, 'rgba(0,0,0,0)');
    vg.addColorStop(1, 'rgba(0,0,0,0.42)');
    ctx.fillStyle = vg;
    ctx.fillRect(0, 0, W, H);
  }
  if (state.effects.grain) {
    ctx.save();
    ctx.globalAlpha = 0.09;
    ctx.globalCompositeOperation = 'overlay';
    ctx.fillStyle = grainPattern(ctx);
    ctx.fillRect(0, 0, W, H);
    ctx.restore();
  }
  if (state.effects.frame) {
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = Math.max(6, H * 0.01);
    ctx.strokeRect(ctx.lineWidth / 2, ctx.lineWidth / 2, W - ctx.lineWidth, H - ctx.lineWidth);
  }
}

/** Render a state to a fresh canvas at one of the post sizes. */
export function renderCoverCanvas(state, sizeId) {
  const size = SIZES[sizeId] || SIZES['1920x1080'];
  const canvas = document.createElement('canvas');
  canvas.width = size.w;
  canvas.height = size.h;
  drawCover(canvas.getContext('2d'), state, size.w, size.h);
  return canvas;
}
