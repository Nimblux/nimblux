import fs from "fs";
import zlib from "zlib";

// Simple PNG chunk reader & decoder
function parsePNG(buffer) {
  let offset = 8; // skip PNG signature
  let width, height, bitDepth, colorType, compressionMethod, filterMethod, interlaceMethod;
  const idatChunks = [];

  while (offset < buffer.length) {
    const length = buffer.readUInt32BE(offset);
    const type = buffer.toString("ascii", offset + 4, offset + 8);
    const data = buffer.subarray(offset + 8, offset + 8 + length);
    offset += 12 + length;

    if (type === "IHDR") {
      width = data.readUInt32BE(0);
      height = data.readUInt32BE(4);
      bitDepth = data[8];
      colorType = data[9];
      compressionMethod = data[10];
      filterMethod = data[11];
      interlaceMethod = data[12];
    } else if (type === "IDAT") {
      idatChunks.push(data);
    } else if (type === "IEND") {
      break;
    }
  }

  const compressedData = Buffer.concat(idatChunks);
  const decompressed = zlib.inflateSync(compressedData);

  // Unfilter PNG (Assume RGBA, colorType === 6, or RGB colorType === 2)
  const bytesPerPixel = colorType === 6 ? 4 : colorType === 2 ? 3 : 4;
  const stride = width * bytesPerPixel;
  const rawPixels = Buffer.alloc(width * height * 4);

  let srcOffset = 0;
  for (let y = 0; y < height; y++) {
    const filterType = decompressed[srcOffset++];
    for (let x = 0; x < width; x++) {
      const dstIdx = (y * width + x) * 4;
      let r, g, b, a = 255;

      if (bytesPerPixel === 4) {
        r = decompressed[srcOffset++];
        g = decompressed[srcOffset++];
        b = decompressed[srcOffset++];
        a = decompressed[srcOffset++];
      } else if (bytesPerPixel === 3) {
        r = decompressed[srcOffset++];
        g = decompressed[srcOffset++];
        b = decompressed[srcOffset++];
      }

      // If unfiltered line has filter, handle basic None (0) or Sub (1)
      rawPixels[dstIdx] = r;
      rawPixels[dstIdx + 1] = g;
      rawPixels[dstIdx + 2] = b;
      rawPixels[dstIdx + 3] = a;
    }
  }

  return { width, height, rawPixels };
}

// Encode raw RGBA into PNG
function encodePNG(width, height, rgbaBuffer) {
  const rowStride = width * 4;
  const filtered = Buffer.alloc(height * (rowStride + 1));

  for (let y = 0; y < height; y++) {
    filtered[y * (rowStride + 1)] = 0; // Filter type 0 (None)
    rgbaBuffer.copy(
      filtered,
      y * (rowStride + 1) + 1,
      y * rowStride,
      (y + 1) * rowStride
    );
  }

  const compressed = zlib.deflateSync(filtered);

  // Build PNG chunks
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type RGBA
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace
  const ihdrChunk = createChunk("IHDR", ihdr);

  // IDAT
  const idatChunk = createChunk("IDAT", compressed);

  // IEND
  const iendChunk = createChunk("IEND", Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function createChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, "ascii");
  const body = Buffer.concat([typeBuf, data]);
  const crc = crc32(body);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc, 0);
  return Buffer.concat([len, body, crcBuf]);
}

// CRC32 table
const crcTable = [];
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    if (c & 1) c = 0xedb88320 ^ (c >>> 1);
    else c = c >>> 1;
  }
  crcTable[n] = c;
}

function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

async function run() {
  const inputBuffer = fs.readFileSync("public/logo.png");
  const { width, height, rawPixels } = parsePNG(inputBuffer);
  console.log(`Parsed Logo PNG: ${width}x${height}`);

  // Create White Logo on Transparent background (for Dark Theme)
  const darkThemeBuffer = Buffer.alloc(width * height * 4);
  // Create Black Logo on Transparent background (for Light Theme)
  const lightThemeBuffer = Buffer.alloc(width * height * 4);

  // Find min/max bounds to crop tightly
  let minX = width, maxX = 0, minY = height, maxY = 0;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const r = rawPixels[idx];
      const g = rawPixels[idx + 1];
      const b = rawPixels[idx + 2];
      const gray = (r + g + b) / 3;

      // In the uploaded image, the background is ~235-245 (light gray/white)
      // The logo strokes/text are dark (~0-80).
      // Calculate opacity based on darkness
      const darkness = Math.max(0, Math.min(255, (230 - gray) * 1.5));
      const alpha = Math.round(darkness);

      if (alpha > 40) {
        minX = Math.min(minX, x);
        maxX = Math.max(maxX, x);
        minY = Math.min(minY, y);
        maxY = Math.max(maxY, y);
      }

      // Dark Theme (White text/strokes + transparent bg)
      darkThemeBuffer[idx] = 255;
      darkThemeBuffer[idx + 1] = 255;
      darkThemeBuffer[idx + 2] = 255;
      darkThemeBuffer[idx + 3] = alpha;

      // Light Theme (Black text/strokes + transparent bg)
      lightThemeBuffer[idx] = 15;
      lightThemeBuffer[idx + 1] = 23;
      lightThemeBuffer[idx + 2] = 42;
      lightThemeBuffer[idx + 3] = alpha;
    }
  }

  // Add small padding
  const pad = 12;
  minX = Math.max(0, minX - pad);
  maxX = Math.min(width - 1, maxX + pad);
  minY = Math.max(0, minY - pad);
  maxY = Math.min(height - 1, maxY + pad);

  const cropW = maxX - minX + 1;
  const cropH = maxY - minY + 1;
  console.log(`Cropped Bounding Box: ${cropW}x${cropH} at (${minX}, ${minY})`);

  const croppedDark = Buffer.alloc(cropW * cropH * 4);
  const croppedLight = Buffer.alloc(cropW * cropH * 4);

  for (let y = 0; y < cropH; y++) {
    for (let x = 0; x < cropW; x++) {
      const srcIdx = ((minY + y) * width + (minX + x)) * 4;
      const dstIdx = (y * cropW + x) * 4;

      croppedDark[dstIdx] = darkThemeBuffer[srcIdx];
      croppedDark[dstIdx + 1] = darkThemeBuffer[srcIdx + 1];
      croppedDark[dstIdx + 2] = darkThemeBuffer[srcIdx + 2];
      croppedDark[dstIdx + 3] = darkThemeBuffer[srcIdx + 3];

      croppedLight[dstIdx] = lightThemeBuffer[srcIdx];
      croppedLight[dstIdx + 1] = lightThemeBuffer[srcIdx + 1];
      croppedLight[dstIdx + 2] = lightThemeBuffer[srcIdx + 2];
      croppedLight[dstIdx + 3] = lightThemeBuffer[srcIdx + 3];
    }
  }

  const pngDark = encodePNG(cropW, cropH, croppedDark);
  const pngLight = encodePNG(cropW, cropH, croppedLight);

  fs.writeFileSync("public/nimblux-logo-white.png", pngDark);
  fs.writeFileSync("public/nimblux-logo-dark.png", pngLight);
  console.log("Successfully generated public/nimblux-logo-white.png and public/nimblux-logo-dark.png!");
}

run().catch(console.error);
