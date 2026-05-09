function hexToRgb(hex) {
  const value = hex.replace('#', '');
  const full = value.length === 3 ? value.split('').map((c) => c + c).join('') : value;
  return {
    r: Number.parseInt(full.slice(0, 2), 16),
    g: Number.parseInt(full.slice(2, 4), 16),
    b: Number.parseInt(full.slice(4, 6), 16)
  };
}

function luminance({ r, g, b }) {
  const channels = [r, g, b].map((v) => {
    const n = v / 255;
    return n <= 0.03928 ? n / 12.92 : ((n + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}

export function getContrastColor(background) {
  const bgLum = luminance(hexToRgb(background));
  const whiteContrast = (1.05) / (bgLum + 0.05);
  const blackContrast = (bgLum + 0.05) / 0.05;
  return whiteContrast >= blackContrast ? '#ffffff' : '#111111';
}

export function generateAccessibleTextColor(background) {
  return getContrastColor(background);
}
