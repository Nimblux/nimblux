import fs from "fs";
import zlib from "zlib";

function decodePNG(buffer) {
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
    } else if (type === "IDAT") idatChunks.push(data);
    else if (type === "IEND") break;
  }

  const decompressed = zlib.inflateSync(Buffer.concat(idatChunks));
  const bpp = 3; // RGB 24-bit or RGBA 32-bit (let's check size)
  const bytesPerPixel = Math.round((decompressed.length - height) / (width * height));
  console.log(`PNG ${width}x${height}, detected bytesPerPixel: ${bytesPerPixel}`);

  const rawPixels = Buffer.alloc(width * height * 4);
  const rowSize = width * bytesPerPixel;
  const uncompressedRows = Buffer.alloc(height * rowSize);

  let srcOffset = 0;
  for (let y = 0; y < height; y++) {
    const filterType = decompressed[srcOffset++];
    const prevRowOffset = (y - 1) * rowSize;
    const currRowOffset = y * rowSize;

    for (let x = 0; x < rowSize; x++) {
      const byte = decompressed[srcOffset++];
      const a = (x >= bytesPerPixel) ? uncompressedRows[currRowOffset + x - bytesPerPixel] : 0;
      const b = (y > 0) ? uncompressedRows[prevRowOffset + x] : 0;
      const c = (x >= bytesPerPixel && y > 0) ? uncompressedRows[prevRowOffset + x - bytesPerPixel] : 0;

      let val = byte;
      if (filterType === 1) { // Sub
        val = (byte + a) & 0xff;
      } else if (filterType === 2) { // Up
        val = (byte + b) & 0xff;
      } else if (filterType === 3) { // Average
        val = (byte + Math.floor((a + b) / 2)) & 0xff;
      } else if (filterType === 4) { // Paeth
        const p = a + b - c;
        const pa = Math.abs(p - a);
        const pb = Math.abs(p - b);
        const pc = Math.abs(p - c);
        let pr = a;
        if (pb < pa && pb <= pc) pr = b;
        else if (pc < pa && pc <= pb) pr = c;
        val = (byte + pr) & 0xff;
      }
      uncompressedRows[currRowOffset + x] = val;
    }

    // Convert to RGBA
    for (let x = 0; x < width; x++) {
      const srcPx = currRowOffset + x * bytesPerPixel;
      const dstPx = (y * width + x) * 4;
      rawPixels[dstPx] = uncompressedRows[srcPx];
      rawPixels[dstPx + 1] = uncompressedRows[srcPx + 1];
      rawPixels[dstPx + 2] = uncompressedRows[srcPx + 2];
      rawPixels[dstPx + 3] = (bytesPerPixel === 4) ? uncompressedRows[srcPx + 3] : 255;
    }
  }

  return { width, height, rawPixels };
}

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

const inputBuffer = fs.readFileSync("C:/Users/devyadav/.gemini/antigravity/brain/18a94157-3e59-4f4f-81d3-2aa8d0c544e0/.user_uploaded/media_1786974564853.png");
const { width, height, rawPixels } = decodePNG(inputBuffer);

// Find background color from corners
const bgR = rawPixels[0];
const bgG = rawPixels[1];
const bgB = rawPixels[2];
console.log(`True Background Color: RGB(${bgR}, ${bgG}, ${bgB})`);

let minX = width, maxX = 0, minY = height, maxY = 0;

for (let y = 0; y < height; y++) {
  for (let x = 0; x < width; x++) {
    const idx = (y * width + x) * 4;
    const r = rawPixels[idx];
    const g = rawPixels[idx + 1];
    const b = rawPixels[idx + 2];
    const gray = (r + g + b) / 3;

    // Dark logo pixels
    if (gray < 200) {
      minX = Math.min(minX, x);
      maxX = Math.max(maxX, x);
      minY = Math.min(minY, y);
      maxY = Math.max(maxY, y);
    }
  }
}

console.log(`Exact Logo Bounding Box: X [${minX}..${maxX}], Y [${minY}..${maxY}]`);
const pad = 12;
minX = Math.max(0, minX - pad);
maxX = Math.min(width - 1, maxX + pad);
minY = Math.max(0, minY - pad);
maxY = Math.min(height - 1, maxY + pad);

const cropW = maxX - minX + 1;
const cropH = maxY - minY + 1;
console.log(`Cropped Size: ${cropW} x ${cropH}`);

const darkRGBA = Buffer.alloc(cropW * cropH * 4);
const lightRGBA = Buffer.alloc(cropW * cropH * 4);

for (let y = 0; y < cropH; y++) {
  for (let x = 0; x < cropW; x++) {
    const srcIdx = ((minY + y) * width + (minX + x)) * 4;
    const dstIdx = (y * cropW + x) * 4;

    const r = rawPixels[srcIdx];
    const g = rawPixels[srcIdx + 1];
    const b = rawPixels[srcIdx + 2];
    const gray = (r + g + b) / 3;

    // Calculate transparency
    let alpha = 0;
    if (gray < 225) {
      alpha = Math.min(255, Math.max(0, Math.round(((228 - gray) / 120) * 255)));
    }

    // White logo for dark theme
    darkRGBA[dstIdx] = 255;
    darkRGBA[dstIdx + 1] = 255;
    darkRGBA[dstIdx + 2] = 255;
    darkRGBA[dstIdx + 3] = alpha;

    // Dark logo for light theme
    lightRGBA[dstIdx] = 15;
    lightRGBA[dstIdx + 1] = 23;
    lightRGBA[dstIdx + 2] = 42;
    lightRGBA[dstIdx + 3] = alpha;
  }
}

fs.writeFileSync("public/nimblux-logo-white.png", encodePNG(cropW, cropH, darkRGBA));
fs.writeFileSync("public/nimblux-logo-dark.png", encodePNG(cropW, cropH, lightRGBA));
fs.writeFileSync("public/logo.png", encodePNG(cropW, cropH, darkRGBA));

console.log("Successfully decoded, tightly cropped, and generated crisp transparent PNG assets!");
