import fs from "fs";
import zlib from "zlib";

function parsePNG(buffer) {
  let offset = 8;
  let width, height;
  const idatChunks = [];

  while (offset < buffer.length) {
    const length = buffer.readUInt32BE(offset);
    const type = buffer.toString("ascii", offset + 4, offset + 8);
    const data = buffer.subarray(offset + 8, offset + 8 + length);
    offset += 12 + length;

    if (type === "IHDR") {
      width = data.readUInt32BE(0);
      height = data.readUInt32BE(4);
    } else if (type === "IDAT") {
      idatChunks.push(data);
    } else if (type === "IEND") break;
  }

  const decompressed = zlib.inflateSync(Buffer.concat(idatChunks));
  const rawPixels = Buffer.alloc(width * height * 4);
  let srcOffset = 0;

  for (let y = 0; y < height; y++) {
    const filterType = decompressed[srcOffset++];
    for (let x = 0; x < width; x++) {
      const dstIdx = (y * width + x) * 4;
      const r = decompressed[srcOffset++];
      const g = decompressed[srcOffset++];
      const b = decompressed[srcOffset++];
      const a = decompressed[srcOffset++];
      rawPixels[dstIdx] = r;
      rawPixels[dstIdx + 1] = g;
      rawPixels[dstIdx + 2] = b;
      rawPixels[dstIdx + 3] = a;
    }
  }

  return { width, height, rawPixels };
}

// Encode PNG
function encodePNG(width, height, rgbaBuffer) {
  const rowStride = width * 4;
  const filtered = Buffer.alloc(height * (rowStride + 1));
  for (let y = 0; y < height; y++) {
    filtered[y * (rowStride + 1)] = 0;
    rgbaBuffer.copy(filtered, y * (rowStride + 1) + 1, y * rowStride, (y + 1) * rowStride);
  }
  const compressed = zlib.deflateSync(filtered);
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; ihdr[9] = 6; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;

  function createChunk(type, data) {
    const len = Buffer.alloc(4); len.writeUInt32BE(data.length, 0);
    const typeBuf = Buffer.from(type, "ascii");
    const body = Buffer.concat([typeBuf, data]);
    let crc = 0xffffffff;
    for (let i = 0; i < body.length; i++) {
      let c = (crc ^ body[i]) & 0xff;
      for (let k = 0; k < 8; k++) c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
      crc = (crc >>> 8) ^ c;
    }
    crc = (crc ^ 0xffffffff) >>> 0;
    const crcBuf = Buffer.alloc(4); crcBuf.writeUInt32BE(crc, 0);
    return Buffer.concat([len, body, crcBuf]);
  }

  return Buffer.concat([
    signature,
    createChunk("IHDR", ihdr),
    createChunk("IDAT", compressed),
    createChunk("IEND", Buffer.alloc(0)),
  ]);
}

const inputBuffer = fs.readFileSync("public/logo.png");
const { width, height, rawPixels } = parsePNG(inputBuffer);

// Sample background color from top-left (0,0)
const bgR = rawPixels[0];
const bgG = rawPixels[1];
const bgB = rawPixels[2];
console.log(`Background sampled: RGB(${bgR}, ${bgG}, ${bgB})`);

let minX = width, maxX = 0, minY = height, maxY = 0;

for (let y = 0; y < height; y++) {
  for (let x = 0; x < width; x++) {
    const idx = (y * width + x) * 4;
    const r = rawPixels[idx];
    const g = rawPixels[idx + 1];
    const b = rawPixels[idx + 2];

    const diff = Math.abs(r - bgR) + Math.abs(g - bgG) + Math.abs(b - bgB);
    if (diff > 30) {
      minX = Math.min(minX, x);
      maxX = Math.max(maxX, x);
      minY = Math.min(minY, y);
      maxY = Math.max(maxY, y);
    }
  }
}

console.log(`Tight Logo Bounds: X [${minX}..${maxX}], Y [${minY}..${maxY}]`);
const pad = 8;
minX = Math.max(0, minX - pad);
maxX = Math.min(width - 1, maxX + pad);
minY = Math.max(0, minY - pad);
maxY = Math.min(height - 1, maxY + pad);

const cropW = maxX - minX + 1;
const cropH = maxY - minY + 1;
console.log(`Final Cropped Size: ${cropW} x ${cropH}`);

// Generate white-on-transparent (for dark theme) & dark-on-transparent (for light theme)
const darkRGBA = Buffer.alloc(cropW * cropH * 4);
const lightRGBA = Buffer.alloc(cropW * cropH * 4);

for (let y = 0; y < cropH; y++) {
  for (let x = 0; x < cropW; x++) {
    const srcIdx = ((minY + y) * width + (minX + x)) * 4;
    const dstIdx = (y * cropW + x) * 4;

    const r = rawPixels[srcIdx];
    const g = rawPixels[srcIdx + 1];
    const b = rawPixels[srcIdx + 2];
    const diff = (Math.abs(r - bgR) + Math.abs(g - bgG) + Math.abs(b - bgB)) / 3;

    // Smooth antialiased alpha
    const alpha = Math.min(255, Math.round(diff * 2.2));

    // White logo for dark background
    darkRGBA[dstIdx] = 255;
    darkRGBA[dstIdx + 1] = 255;
    darkRGBA[dstIdx + 2] = 255;
    darkRGBA[dstIdx + 3] = alpha;

    // Dark logo for light background
    lightRGBA[dstIdx] = 15;
    lightRGBA[dstIdx + 1] = 23;
    lightRGBA[dstIdx + 2] = 42;
    lightRGBA[dstIdx + 3] = alpha;
  }
}

fs.writeFileSync("public/nimblux-logo-white.png", encodePNG(cropW, cropH, darkRGBA));
fs.writeFileSync("public/nimblux-logo-dark.png", encodePNG(cropW, cropH, lightRGBA));
fs.writeFileSync("public/logo.png", encodePNG(cropW, cropH, darkRGBA)); // Default logo is crisp white transparent

// Also generate Icon-only crop (left half containing just the N symbol)
// Let's find icon width boundary (~40% of cropW)
const iconW = Math.round(cropH * 1.1);
const iconRGBA = Buffer.alloc(iconW * cropH * 4);
for (let y = 0; y < cropH; y++) {
  for (let x = 0; x < iconW; x++) {
    const srcIdx = (y * cropW + x) * 4;
    const dstIdx = (y * iconW + x) * 4;
    iconRGBA[dstIdx] = darkRGBA[srcIdx];
    iconRGBA[dstIdx + 1] = darkRGBA[srcIdx + 1];
    iconRGBA[dstIdx + 2] = darkRGBA[srcIdx + 2];
    iconRGBA[dstIdx + 3] = darkRGBA[srcIdx + 3];
  }
}
fs.writeFileSync("public/nimblux-icon.png", encodePNG(iconW, cropH, iconRGBA));

console.log("Successfully generated cropped public/nimblux-logo-white.png, public/nimblux-logo-dark.png, public/nimblux-icon.png and updated public/logo.png!");
