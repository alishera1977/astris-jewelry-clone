#!/usr/bin/env node
/** Edge flood + strict white hole clear for Dragon series catalog PNGs */
const fs = require("fs");
const zlib = require("zlib");

const BPP = 4;
const file = process.argv[2];
if (!file) {
  console.error("Usage: node scripts/process-dragon-catalog.js <png-path>");
  process.exit(1);
}

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

  const srcBpp = colorType === 6 ? 4 : colorType === 2 ? 3 : 1;
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
        let val = raw[rawPos++];
        const left = prev >= 0 ? src[prev + c] : 0;
        const above = up >= 0 ? src[up + c] : 0;
        const diag = upLeft >= 0 ? src[upLeft + c] : 0;
        if (filter === 1) val = (val + left) & 255;
        else if (filter === 2) val = (val + above) & 255;
        else if (filter === 3) val = (val + ((left + above) >> 1)) & 255;
        else if (filter === 4) val = (val + paeth(left, above, diag)) & 255;
        src[i + c] = val;
      }
    }
  }

  const data = Buffer.alloc(height * width * BPP);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const si = y * srcStride + x * srcBpp;
      const oi = (y * width + x) * BPP;
      data[oi] = src[si];
      data[oi + 1] = src[si + 1];
      data[oi + 2] = src[si + 2];
      data[oi + 3] = 255;
    }
  }
  return { width, height, data };
}

function crc32(buf) {
  let c = ~0;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i];
    for (let k = 0; k < 8; k++) c = c & 1 ? (c >>> 1) ^ 0xedb88320 : c >>> 1;
  }
  return ~c >>> 0;
}

function chunk(type, body) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(body.length, 0);
  const hdr = Buffer.concat([Buffer.from(type), body]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(hdr), 0);
  return Buffer.concat([len, hdr, crc]);
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

function lum(r, g, b) {
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

function spread(r, g, b) {
  return Math.max(r, g, b) - Math.min(r, g, b);
}

function sampleCorners(data, width, height) {
  const pts = [
    [0, 0],
    [width - 1, 0],
    [0, height - 1],
    [width - 1, height - 1],
    [Math.floor(width / 2), 0],
    [Math.floor(width / 2), height - 1],
  ];
  return pts
    .map(([x, y]) => {
      const i = (y * width + x) * BPP;
      return [data[i], data[i + 1], data[i + 2]];
    })
    .filter((c) => lum(...c) > 30);
}

function isColoredStone(r, g, b) {
  if (g > r + 20 && g > b + 12 && g > 90) return true;
  if (r > 90 && r > g + 15 && r > b + 15) return true;
  if (r > 120 && g > 70 && r > b + 8 && g > b) return true;
  return false;
}

const { width, height, data } = decodePng(fs.readFileSync(file));
const cornerAvg = sampleCorners(data, width, height)
  .reduce((acc, c) => [acc[0] + c[0], acc[1] + c[1], acc[2] + c[2]], [0, 0, 0])
  .map((v) => Math.round(v / sampleCorners(data, width, height).length));

function isEdgeBg(r, g, b) {
  const l = lum(r, g, b);
  const s = spread(r, g, b);
  if (l < 30) return true;
  if (r >= 252 && g >= 252 && b >= 252 && s <= 8) return true;
  if (l >= 228 && s <= 14 && dist([r, g, b], cornerAvg) <= 18) return true;
  return false;
}

function isHoleWhite(r, g, b) {
  if (isColoredStone(r, g, b)) return false;
  const l = lum(r, g, b);
  const s = spread(r, g, b);
  return l >= 248 && s <= 8;
}

const visited = new Uint8Array(width * height);
const queue = [];

function tryEdge(x, y) {
  if (x < 0 || y < 0 || x >= width || y >= height) return;
  const idx = y * width + x;
  if (visited[idx]) return;
  const i = idx * BPP;
  const rgb = [data[i], data[i + 1], data[i + 2]];
  if (!isEdgeBg(...rgb)) return;
  visited[idx] = 1;
  queue.push(idx);
}

for (let x = 0; x < width; x++) {
  tryEdge(x, 0);
  tryEdge(x, height - 1);
}
for (let y = 0; y < height; y++) {
  tryEdge(0, y);
  tryEdge(width - 1, y);
}

let head = 0;
while (head < queue.length) {
  const idx = queue[head++];
  const x = idx % width;
  const y = (idx / width) | 0;
  const i = idx * BPP;
  data[i + 3] = 0;
  tryEdge(x - 1, y);
  tryEdge(x + 1, y);
  tryEdge(x, y - 1);
  tryEdge(x, y + 1);
}

const v2 = new Uint8Array(width * height);
const q2 = [];

function tryHole(x, y) {
  if (x < 0 || y < 0 || x >= width || y >= height) return;
  const idx = y * width + x;
  if (v2[idx]) return;
  const i = idx * BPP;
  if (data[i + 3] < 20) return;
  const rgb = [data[i], data[i + 1], data[i + 2]];
  if (!isHoleWhite(...rgb)) return;
  v2[idx] = 1;
  q2.push(idx);
}

[
  [Math.floor(width / 2), Math.floor(height * 0.56)],
  [Math.floor(width / 2), Math.floor(height * 0.6)],
  [Math.floor(width / 2), Math.floor(height * 0.64)],
  [Math.floor(width / 2), Math.floor(height * 0.68)],
].forEach(([x, y]) => tryHole(x, y));

head = 0;
while (head < q2.length) {
  const idx = q2[head++];
  const x = idx % width;
  const y = (idx / width) | 0;
  const i = idx * BPP;
  data[i + 3] = 0;
  tryHole(x - 1, y);
  tryHole(x + 1, y);
  tryHole(x, y - 1);
  tryHole(x, y + 1);
}

let opaque = 0;
for (let i = 0; i < data.length; i += BPP) {
  if (data[i + 3] > 10) opaque++;
}

fs.writeFileSync(file, encodePng(width, height, data));
console.log("Updated", file, "opaque", opaque);
