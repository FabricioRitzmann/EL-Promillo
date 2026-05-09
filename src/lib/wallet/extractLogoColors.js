function rgbToHex(r, g, b) {
  return `#${[r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('')}`;
}

function colorDistance(a, b) {
  return Math.sqrt((a.r - b.r) ** 2 + (a.g - b.g) ** 2 + (a.b - b.b) ** 2);
}

function buildBuckets(imageData) {
  const buckets = [];
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    const a = data[i + 3];
    if (a < 40) continue;
    const r = Math.round(data[i] / 16) * 16;
    const g = Math.round(data[i + 1] / 16) * 16;
    const b = Math.round(data[i + 2] / 16) * 16;
    const existing = buckets.find((entry) => colorDistance(entry, { r, g, b }) < 24);
    if (existing) {
      existing.count += 1;
    } else {
      buckets.push({ r, g, b, count: 1 });
    }
  }
  return buckets.sort((a, b) => b.count - a.count);
}

export async function extractPalette(imageUrl) {
  const img = new Image();
  img.crossOrigin = 'anonymous';
  await new Promise((resolve, reject) => {
    img.onload = resolve;
    img.onerror = reject;
    img.src = imageUrl;
  });

  const canvas = document.createElement('canvas');
  const maxSide = 180;
  const ratio = Math.min(1, maxSide / Math.max(img.width, img.height));
  canvas.width = Math.max(1, Math.floor(img.width * ratio));
  canvas.height = Math.max(1, Math.floor(img.height * ratio));
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  const full = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const buckets = buildBuckets(full);
  const edgeThickness = Math.max(1, Math.floor(Math.min(canvas.width, canvas.height) * 0.08));
  const edgeCanvas = document.createElement('canvas');
  edgeCanvas.width = canvas.width;
  edgeCanvas.height = canvas.height;
  const edgeCtx = edgeCanvas.getContext('2d', { willReadFrequently: true });
  edgeCtx.drawImage(canvas, 0, 0);

  const edgeData = [];
  for (let x = 0; x < canvas.width; x += 1) {
    for (let y = 0; y < edgeThickness; y += 1) {
      const top = edgeCtx.getImageData(x, y, 1, 1).data;
      const bottom = edgeCtx.getImageData(x, canvas.height - 1 - y, 1, 1).data;
      edgeData.push(...top, ...bottom);
    }
  }
  const edgeImage = new ImageData(new Uint8ClampedArray(edgeData), 1, edgeData.length / 4);
  const edgeBuckets = buildBuckets(edgeImage);

  const background = edgeBuckets[0] || buckets[0] || null;
  const primary = buckets[0] || background;
  const secondary = buckets.find((entry) => colorDistance(entry, primary) > 52) || buckets[1] || primary;

  return {
    backgroundColor: background ? rgbToHex(background.r, background.g, background.b) : null,
    primaryColor: primary ? rgbToHex(primary.r, primary.g, primary.b) : null,
    secondaryColor: secondary ? rgbToHex(secondary.r, secondary.g, secondary.b) : null
  };
}

export async function extractDominantColor(imageUrl) {
  const palette = await extractPalette(imageUrl);
  return palette.backgroundColor || palette.primaryColor;
}
