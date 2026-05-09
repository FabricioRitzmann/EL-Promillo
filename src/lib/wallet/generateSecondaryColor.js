function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

export function generateSecondaryColor(baseColor, intensity = 0.24) {
  const hex = baseColor.replace('#', '');
  const full = hex.length === 3 ? hex.split('').map((c) => c + c).join('') : hex;
  const r = Number.parseInt(full.slice(0, 2), 16);
  const g = Number.parseInt(full.slice(2, 4), 16);
  const b = Number.parseInt(full.slice(4, 6), 16);
  const mix = (channel) => Math.round(clamp(channel + (255 - channel) * intensity, 0, 255));
  return `#${[mix(r), mix(g), mix(b)].map((v) => v.toString(16).padStart(2, '0')).join('')}`;
}
