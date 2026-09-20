/* Straight-line "string art" curves — every curve on this site is drawn from
   straight lines only. Ported from the original site's stringart.js. */
const NS = 'http://www.w3.org/2000/svg';

function el(name, attrs) {
  const n = document.createElementNS(NS, name);
  if (attrs) for (const k in attrs) n.setAttribute(k, attrs[k]);
  return n;
}
function tValues(n, tMin, span) {
  const out = [], r = Math.pow(span, 1 / n);
  for (let k = 0; k <= n; k++) out.push(tMin * Math.pow(r, k));
  return out;
}
function cross(tj, tk, s) { return [(tj * tk) / (tj + tk), s / (tj + tk)]; }
function polyArea(pts) {
  let a = 0;
  for (let i = 0, n = pts.length; i < n; i++) {
    const p = pts[i], q = pts[(i + 1) % n];
    a += p[0] * q[1] - q[0] * p[1];
  }
  return Math.abs(a / 2);
}
function compactness(pts) {
  let per = 0;
  for (let i = 0; i < pts.length; i++) {
    const p = pts[i], q = pts[(i + 1) % pts.length];
    per += Math.hypot(q[0] - p[0], q[1] - p[1]);
  }
  return per ? (4 * Math.PI * polyArea(pts)) / (per * per) : 0;
}
function pointsAttr(pts) { return pts.map(p => p[0].toFixed(2) + ',' + p[1].toFixed(2)).join(' '); }
function centroid(pts) { return pts.reduce((a, p) => [a[0] + p[0] / pts.length, a[1] + p[1] / pts.length], [0, 0]); }

function spreadOrder(blocks) {
  if (blocks.length < 3) return blocks.slice();
  const rest = blocks.slice().sort((a, b) => (a.quad === b.quad) ? (a.i - b.i || a.j - b.j) : (a.quad < b.quad ? -1 : 1));
  rest.forEach(b => { b.c = centroid(b.pts); });
  const out = [rest.shift()];
  while (rest.length) {
    let best = 0, bestD = -1;
    for (let i = 0; i < rest.length; i++) {
      let min = Infinity;
      for (let j = 0; j < out.length; j++) {
        const dx = rest[i].c[0] - out[j].c[0], dy = rest[i].c[1] - out[j].c[1];
        const d = dx * dx + dy * dy;
        if (d < min) min = d;
      }
      if (min > bestD) { bestD = min; best = i; }
    }
    out.push(rest.splice(best, 1)[0]);
  }
  return out;
}

function quadrant(o, quad) {
  const n = o.n, s = o.s, k = o.block;
  const sx = (quad === 'ur' || quad === 'lr') ? 1 : -1;
  const sy = (quad === 'ur' || quad === 'ul') ? -1 : 1;
  const t = tValues(n, o.tMin, o.span);
  const screen = p => [o.cx + sx * p[0], o.cy + sy * p[1]];
  const P = (a, b) => screen(cross(t[a], t[b], s));

  const lines = t.map(tk => {
    if (o.trim) {
      const a = screen(cross(tk, t[0], s));
      const b = screen(cross(tk, t[n], s));
      return { x1: a[0], y1: a[1], x2: b[0], y2: b[1] };
    }
    const p = screen([tk, 0]), q = screen([0, s / tk]);
    return { x1: p[0], y1: p[1], x2: q[0], y2: q[1] };
  });

  const cells = [];
  for (let i = 0; i <= n - 2; i++)
    for (let j = i + 1; j <= n - 1; j++)
      cells.push([P(i, j), P(i, j + 1), P(i + 1, j + 1), P(i + 1, j)]);

  const blocks = [], m = Math.floor(n / k);
  for (let a = 0; a < m; a++)
    for (let b = a + 1; b < m; b++) {
      const bi = a * k, bj = b * k;
      const pts = [P(bi, bj), P(bi, bj + k), P(bi + k, bj + k), P(bi + k, bj)];
      if (sx * sy < 0) pts.reverse();
      blocks.push({ i: bi, j: bj, quad, pts, area: polyArea(pts), fit: compactness(pts) });
    }

  return { lines, cells, blocks };
}

let uid = 0;

export function draw(svg, opts) {
  opts = opts || {};
  const o = {
    quads: opts.quads || ['ur', 'll'],
    n: opts.n || 12,
    span: opts.span || 12,
    tMin: opts.tMin || 60,
    block: opts.block || 2,
    minFit: opts.minFit != null ? opts.minFit : 0.45,
    stroke: opts.stroke != null ? opts.stroke : 2.4,
    fillCells: opts.fillCells !== false,
    frame: opts.frame === null ? null : (opts.frame || 1.04),
    whole: !!opts.whole, trim: !!opts.trim,
    cx: 500, cy: 500
  };
  o.s = o.tMin * o.tMin * o.span;

  while (svg.firstChild) svg.removeChild(svg.firstChild);

  const gTiles = el('g', { class: 'sa-tiles' });
  const gArt = el('g', { class: 'sa-art' });
  const gLines = el('g', { class: 'sa-lines', fill: 'none', stroke: 'currentColor', 'stroke-width': o.stroke, 'stroke-linecap': 'butt' });

  const byQuad = {};
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  const extend = (x, y) => { if (x < minX) minX = x; if (x > maxX) maxX = x; if (y < minY) minY = y; if (y > maxY) maxY = y; };

  o.quads.forEach(q => {
    const geo = quadrant(o, q);
    geo.lines.forEach(l => {
      gLines.appendChild(el('line', { x1: l.x1.toFixed(2), y1: l.y1.toFixed(2), x2: l.x2.toFixed(2), y2: l.y2.toFixed(2) }));
      if (o.whole || o.trim) { extend(l.x1, l.y1); extend(l.x2, l.y2); }
    });
    geo.cells.forEach(pts => {
      pts.forEach(p => extend(p[0], p[1]));
      if (o.fillCells) gTiles.appendChild(el('polygon', { points: pointsAttr(pts), class: 'sa-tile' }));
    });
    byQuad[q] = geo.blocks.filter(b => b.fit >= o.minFit);
    byQuad[q].forEach(b => { b.d = pointsAttr(b.pts); });
  });

  svg.appendChild(gTiles); svg.appendChild(gArt); svg.appendChild(gLines);

  if (o.frame) {
    const side = Math.max(maxX - minX, maxY - minY) * o.frame;
    const mx = (minX + maxX) / 2, my = (minY + maxY) / 2;
    svg.setAttribute('viewBox', `${(mx - side / 2).toFixed(1)} ${(my - side / 2).toFixed(1)} ${side.toFixed(1)} ${side.toFixed(1)}`);
  } else {
    svg.setAttribute('viewBox', '0 0 1000 1000');
  }

  let pool = [];
  o.quads.forEach(q => { if (byQuad[q]) pool = pool.concat(byQuad[q]); });
  return { slots: spreadOrder(pool), artLayer: gArt, svg, uid: ++uid };
}

export function placeArtwork(ctx, block, project, index) {
  const clipId = 'sa-clip-' + ctx.uid + '-' + index;
  let defs = ctx.svg.querySelector('defs');
  if (!defs) { defs = el('defs'); ctx.svg.insertBefore(defs, ctx.svg.firstChild); }
  const cp = el('clipPath', { id: clipId, clipPathUnits: 'userSpaceOnUse' });
  cp.appendChild(el('polygon', { points: block.d }));
  defs.appendChild(cp);

  const xs = block.pts.map(p => p[0]), ys = block.pts.map(p => p[1]);
  const bx = Math.min(...xs), by = Math.min(...ys);
  const bw = Math.max(...xs) - bx, bh = Math.max(...ys) - by;

  const a = el('a', { class: 'sa-piece', tabindex: '0' });
  const href = 'Project.dc.html#' + project.slug;
  a.setAttributeNS('http://www.w3.org/1999/xlink', 'href', href);
  a.setAttribute('href', href);
  a.setAttribute('aria-label', project.title + ', ' + project.year);

  const g = el('g', { 'clip-path': 'url(#' + clipId + ')' });
  if (project.image) {
    const img = el('image', { x: bx, y: by, width: bw, height: bh, preserveAspectRatio: 'xMidYMid slice' });
    img.setAttributeNS('http://www.w3.org/1999/xlink', 'href', project.image);
    img.setAttribute('href', project.image);
    g.appendChild(img);
  } else {
    g.appendChild(el('rect', { x: bx, y: by, width: bw, height: bh, class: 'sa-empty' }));
  }
  a.appendChild(g);
  a.appendChild(el('polygon', { points: block.d, class: 'sa-hit' }));
  ctx.artLayer.appendChild(a);
  return a;
}

const STAR_CELLS = [
  [0,-2],[2,0],[0,2],[-2,0],
  [-1,-1],[1,-1],[1,1],[-1,1],
  [0,-1],[0,1],[-1,0],[1,0],
  [-1,-2],[1,-2],[1,2],[-1,2],
  [-2,-1],[2,-1],[2,1],[-2,1]
];

export function starGrid(svg, opts) {
  opts = opts || {};
  const pitch = opts.pitch || 200;
  const side = pitch * (opts.fill || 0.96);
  const cx = 500, cy = 500, h = side / 2;

  while (svg.firstChild) svg.removeChild(svg.firstChild);
  const gArt = el('g', { class: 'sa-art' });
  svg.appendChild(gArt);

  const slots = STAR_CELLS.map((c, i) => {
    const x = cx + c[0] * pitch, y = cy + c[1] * pitch;
    const pts = [[x - h, y - h], [x + h, y - h], [x + h, y + h], [x - h, y + h]];
    return { i: c[0], j: c[1], quad: 'g', order: i, cxy: [x, y], pts, area: side * side, fit: 1, d: pointsAttr(pts) };
  });

  const reach = 2 * pitch + side / 2;
  const half = reach * (opts.frame || 1.02);
  svg.setAttribute('viewBox', `${(cx - half).toFixed(1)} ${(cy - half).toFixed(1)} ${(half * 2).toFixed(1)} ${(half * 2).toFixed(1)}`);

  return { slots, artLayer: gArt, svg, uid: ++uid, side };
}
