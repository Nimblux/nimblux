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
    if (type === "IHDR") { width = data.readUInt32BE(0); height = data.readUInt32BE(4); }
    else if (type === "IDAT") idatChunks.push(data);
    else if (type === "IEND") break;
  }
  const decompressed = zlib.inflateSync(Buffer.concat(idatChunks));
  const rawPixels = Buffer.alloc(width * height * 4);
  let srcOffset = 0;
  for (let y = 0; y < height; y++) {
    srcOffset++;
    for (let x = 0; x < width; x++) {
      const dstIdx = (y * width + x) * 4;
      rawPixels[dstIdx] = decompressed[srcOffset++];
      rawPixels[dstIdx + 1] = decompressed[srcOffset++];
      rawPixels[dstIdx + 2] = decompressed[srcOffset++];
      rawPixels[dstIdx + 3] = decompressed[srcOffset++];
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
  ihdr.writeUInt32BE(width, 0); ihdr.writeUInt32BE(height, 4);
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

const fullLogoBuf = fs.readFileSync("public/nimblux-logo-white.png");
const { width, height, rawPixels } = decodePNG(fullLogoBuf);

// The icon is roughly the left ~35% of the width (approx height x height square)
const iconW = Math.min(width, Math.round(height * 1.15));
const iconRGBA = Buffer.alloc(iconW * height * 4);

for (let y = 0; y < height; y++) {
  for (let x = 0; x < iconW; x++) {
    const srcIdx = (y * width + x) * 4;
    const dstIdx = (y * iconW + x) * 4;
    iconRGBA[dstIdx] = rawPixels[srcIdx];
    iconRGBA[dstIdx + 1] = rawPixels[srcIdx + 1];
    iconRGBA[dstIdx + 2] = rawPixels[srcIdx + 2];
    iconRGBA[dstIdx + 3] = rawPixels[srcIdx + 3];
  }
}

fs.writeFileSync("public/icon.png", encodePNG(iconW, height, iconRGBA));
fs.writeFileSync("public/nimblux-icon.png", encodePNG(iconW, height, iconRGBA));
console.log(`Generated icon crop: ${iconW} x ${height}`);
