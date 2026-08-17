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
    } else if (type === "IDAT") idatChunks.push(data);
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

const inputBuffer = fs.readFileSync("C:/Users/devyadav/.gemini/antigravity/brain/18a94157-3e59-4f4f-81d3-2aa8d0c544e0/.user_uploaded/media_1786974564853.png");
const { width, height, rawPixels } = parsePNG(inputBuffer);

console.log("Top-left pixel (0,0):", rawPixels[0], rawPixels[1], rawPixels[2]);
console.log("Center pixel (250,250):", rawPixels[(250*501+250)*4], rawPixels[(250*501+250)*4+1], rawPixels[(250*501+250)*4+2]);

// Print min and max RGB across entire image
let minG = 255, maxG = 0;
for (let i = 0; i < width * height; i++) {
  const g = (rawPixels[i*4] + rawPixels[i*4+1] + rawPixels[i*4+2])/3;
  if (g < minG) minG = g;
  if (g > maxG) maxG = g;
}
console.log(`Global min gray: ${minG}, max gray: ${maxG}`);

// Find bounding box for pixels with gray < (minG + 60)
let minX = width, maxX = 0, minY = height, maxY = 0;
let darkCount = 0;
for (let y = 0; y < height; y++) {
  for (let x = 0; x < width; x++) {
    const idx = (y * width + x) * 4;
    const g = (rawPixels[idx] + rawPixels[idx+1] + rawPixels[idx+2])/3;
    if (g < (maxG - 50)) {
      minX = Math.min(minX, x);
      maxX = Math.max(maxX, x);
      minY = Math.min(minY, y);
      maxY = Math.max(maxY, y);
      darkCount++;
    }
  }
}
console.log(`Dark pixels count: ${darkCount}`);
console.log(`Actual Logo Bounds: X [${minX}..${maxX}], Y [${minY}..${maxY}]`);
