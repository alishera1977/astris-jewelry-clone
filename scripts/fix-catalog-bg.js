#!/usr/bin/env node
/**
 * Replace catalog PNG backgrounds with transparent pixels (like other ASTRIS catalog shots).
 */
const fs = require("fs");
const zlib = require("zlib");

const TARGET = [249, 248, 246];
const BPP = 4;
const TRANSPARENT_BG = process.argv.includes("--cream");
const SOFTEN_METAL = process.argv.includes("--soften");
const NO_GLARE = process.argv.includes("--no-glare");

function paeth(a, b, c) {
  const p = a + b - c;
  const pa = Math.abs(p - a);
  const pb = Math.abs(p - b);
  const pc = Math.abs(p - c);
  if (pa <= pb && pa <= pc) return a;
  if (pb <= pc) return b;
  return c;
}

function decodePng(buffer) {
  let pos = 8;
  let width = 0;
  let height = 0;
  let colorType = 0;
  const idat = [];

  while (pos < buffer.length) {
    const len = buffer.readUInt32BE(pos);
    const type = buffer.toString("ascii", pos + 4, pos + 8);
    const start = pos + 8;

    if (type === "IHDR") {
      width = buffer.readUInt32BE(start);
      height = buffer.readUInt32BE(start + 4);
      colorType = buffer[start + 9];
    } else if (type === "IDAT") {
      idat.push(buffer.slice(start, start + len));
    } else if (type === "IEND") {
      break;
    }

    pos += 12 + len;
  }

  const srcBpp = colorType === 6 ? 4 : colorType === 2 ? 3 : colorType === 0 ? 1 : 0;
  if (!srcBpp) {
    throw new Error("Unsupported PNG color type " + colorType);
  }

  const raw = zlib.inflateSync(Buffer.concat(idat));
  const srcStride = width * srcBpp;
  const src = Buffer.alloc(height * srcStride);
  let rawPos = 0;

  for (let y = 0; y < height; y++) {
    const filter = raw[rawPos++];
    for (let x = 0; x < width; x++) {
      const i = y * srcStride + x * srcBpp;
      const prev = x > 0 ? i - srcBpp : -1;
      const up = y > 0 ? i - srcStride : -1;
      const upLeft = x > 0 && y > 0 ? i - srcStride - srcBpp : -1;

      for (let c = 0; c < srcBpp; c++) {
        const v = raw[rawPos++];
        let val = v;
        const left = prev >= 0 ? src[prev + c] : 0;
        const above = up >= 0 ? src[up + c] : 0;
        const diag = upLeft >= 0 ? src[upLeft + c] : 0;

        if (filter === 1) val = (v + left) & 255;
        else if (filter === 2) val = (v + above) & 255;
        else if (filter === 3) val = (v + ((left + above) >> 1)) & 255;
        else if (filter === 4) val = (v + paeth(left, above, diag)) & 255;

        src[i + c] = val;
      }
    }
  }

  const out = Buffer.alloc(height * width * BPP);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const si = y * srcStride + x * srcBpp;
      const oi = (y * width + x) * BPP;
      if (srcBpp === 4) {
        src.copy(out, oi, si, si + 4);
      } else if (srcBpp === 3) {
        out[oi] = src[si];
        out[oi + 1] = src[si + 1];
        out[oi + 2] = src[si + 2];
        out[oi + 3] = 255;
      } else {
        out[oi] = src[si];
        out[oi + 1] = src[si];
        out[oi + 2] = src[si];
        out[oi + 3] = 255;
      }
    }
  }

  return { width, height, data: out };
}

function crc32(buf) {
  let c = ~0;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i];
    for (let k = 0; k < 8; k++) c = c & 1 ? (c >>> 1) ^ 0xedb88320 : c >>> 1;
  }
  return ~c >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const body = Buffer.concat([Buffer.from(type), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body), 0);
  return Buffer.concat([len, body, crc]);
}

function encodePng(width, height, data) {
  const raw = Buffer.alloc(height * (1 + width * BPP));
  let rawPos = 0;
  for (let y = 0; y < height; y++) {
    raw[rawPos++] = 0;
    const row = y * width * BPP;
    data.copy(raw, rawPos, row, row + width * BPP);
    rawPos += width * BPP;
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk("IHDR", ihdr),
    chunk("IDAT", zlib.deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

function dist(a, b) {
  return Math.sqrt((a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2);
}

function sampleCorners(data, width, height) {
  const pts = [
    [0, 0],
    [width - 1, 0],
    [0, height - 1],
    [width - 1, height - 1],
    [Math.floor(width / 2), 0],
    [Math.floor(width / 2), height - 1],
    [0, Math.floor(height / 2)],
    [width - 1, Math.floor(height / 2)],
  ];
  return pts.map(([x, y]) => {
    const i = (y * width + x) * BPP;
    return [data[i], data[i + 1], data[i + 2]];
  });
}

function spread(rgb) {
  return Math.max(rgb[0], rgb[1], rgb[2]) - Math.min(rgb[0], rgb[1], rgb[2]);
}

function luminance(rgb) {
  return 0.299 * rgb[0] + 0.587 * rgb[1] + 0.114 * rgb[2];
}

function isBackgroundPixel(rgb, cornerAvg) {
  const lum = luminance(rgb);
  const s = spread(rgb);

  if (dist(rgb, cornerAvg) <= 52) return true;
  if (lum <= 40 && s < 28) return true;
  if (lum >= 188 && s < 34) return true;
  if (!TRANSPARENT_BG && dist(rgb, TARGET) <= 18 && s < 22) return true;
  return false;
}

function floodReplaceBg(data, width, height) {
  const corners = sampleCorners(data, width, height);
  const cornerAvg = corners.reduce(
    (acc, c) => [acc[0] + c[0], acc[1] + c[1], acc[2] + c[2]],
    [0, 0, 0]
  ).map((v) => Math.round(v / corners.length));

  const visited = new Uint8Array(width * height);
  const queue = [];

  function tryPush(x, y) {
    if (x < 0 || y < 0 || x >= width || y >= height) return;
    const idx = y * width + x;
    if (visited[idx]) return;
    const i = idx * BPP;
    const rgb = [data[i], data[i + 1], data[i + 2]];
    if (!isBackgroundPixel(rgb, cornerAvg)) return;
    visited[idx] = 1;
    queue.push(idx);
  }

  for (let x = 0; x < width; x++) {
    tryPush(x, 0);
    tryPush(x, height - 1);
  }
  for (let y = 0; y < height; y++) {
    tryPush(0, y);
    tryPush(width - 1, y);
  }

  if (luminance(cornerAvg) < 55) {
    const seeds = [
      [Math.floor(width * 0.5), Math.floor(height * 0.27)],
      [Math.floor(width * 0.5), Math.floor(height * 0.73)],
      [Math.floor(width * 0.42), Math.floor(height * 0.5)],
      [Math.floor(width * 0.58), Math.floor(height * 0.5)],
    ];
    seeds.forEach(function (pt) {
      tryPush(pt[0], pt[1]);
    });
  }

  for (let i = 0; i < width * height; i++) {
    if (visited[i]) continue;
    const p = i * BPP;
    const rgb = [data[p], data[p + 1], data[p + 2]];
    const lum = luminance(rgb);
    if (lum >= 205 && spread(rgb) < 18) visited[i] = 1;
  }

  let head = 0;
  queue.length = 0;
  for (let i = 0; i < width * height; i++) {
    if (!visited[i]) continue;
    queue.push(i);
  }

  head = 0;
  while (head < queue.length) {
    const idx = queue[head++];
    const x = idx % width;
    const y = (idx / width) | 0;
    const i = idx * BPP;
    if (TRANSPARENT_BG) {
      data[i] = TARGET[0];
      data[i + 1] = TARGET[1];
      data[i + 2] = TARGET[2];
      data[i + 3] = 255;
    } else {
      data[i + 3] = 0;
    }

    tryPush(x - 1, y);
    tryPush(x + 1, y);
    tryPush(x, y - 1);
    tryPush(x, y + 1);
  }
}

function isGreenStone(r, g, b) {
  return g > r + 20 && g > b + 12 && g > 90;
}

function removePureBlack(data) {
  for (let i = 0; i < data.length; i += BPP) {
    if (data[i + 3] < 10) continue;
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    if (isGreenStone(r, g, b)) continue;
    if (Math.max(r, g, b) < 28) {
      data[i + 3] = 0;
    }
  }
}

function removeGlares(data) {
  for (let i = 0; i < data.length; i += BPP) {
    if (data[i + 3] < 10) continue;

    let r = data[i];
    let g = data[i + 1];
    let b = data[i + 2];
    if (isGreenStone(r, g, b)) continue;

    const lum = 0.299 * r + 0.587 * g + 0.114 * b;
    if (lum > 198) {
      const compress = 0.52;
      r = Math.round(198 + (r - 198) * compress);
      g = Math.round(198 + (g - 198) * compress);
      b = Math.round(198 + (b - 198) * compress);
    }

    data[i] = r;
    data[i + 1] = g;
    data[i + 2] = b;
  }
}

function softenMetalHighlights(data) {
  for (let i = 0; i < data.length; i += BPP) {
    if (data[i + 3] < 10) continue;

    let r = data[i];
    let g = data[i + 1];
    let b = data[i + 2];
    const lum = 0.299 * r + 0.587 * g + 0.114 * b;

    if (lum > 198) {
      const compress = 0.52;
      r = Math.round(198 + (r - 198) * compress);
      g = Math.round(198 + (g - 198) * compress);
      b = Math.round(198 + (b - 198) * compress);
    } else if (lum > 40 && lum < 130) {
      r = Math.min(255, Math.round(r * 1.06 + 6));
      g = Math.min(255, Math.round(g * 1.06 + 6));
      b = Math.min(255, Math.round(b * 1.06 + 6));
    }

    data[i] = r;
    data[i + 1] = g;
    data[i + 2] = b;
  }
}

const file = process.argv.find(function (arg) {
  return arg && !arg.startsWith("-") && arg.endsWith(".png");
});
if (!file) {
  console.error("Usage: node scripts/fix-catalog-bg.js <png-path> [--cream] [--soften] [--no-glare]");
  process.exit(1);
}

const buf = fs.readFileSync(file);
const { width, height, data } = decodePng(buf);
floodReplaceBg(data, width, height);
removePureBlack(data);
if (NO_GLARE) removeGlares(data);
else if (SOFTEN_METAL) softenMetalHighlights(data);
fs.writeFileSync(file, encodePng(width, height, data));
console.log("Updated", file);
