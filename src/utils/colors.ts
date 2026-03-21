export const getContrastColor = (hex: string) => {
  if (!hex) return '#ffffff';
  
  // if rgba/rgb, we'll try to extract the RGB values
  if (hex.startsWith('rgba') || hex.startsWith('rgb')) {
    const coords = hex.match(/\d+/g);
    if (coords && coords.length >= 3) {
      const r = parseInt(coords[0], 10);
      const g = parseInt(coords[1], 10);
      const b = parseInt(coords[2], 10);
      const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
      return yiq >= 128 ? '#000000' : '#ffffff';
    }
    return '#ffffff';
  }

  // Ensure it's a 6-char hex
  let cleanedHex = hex.replace('#', '');
  if (cleanedHex.length === 3) {
    cleanedHex = cleanedHex.split('').map(char => char + char).join('');
  }
  if (cleanedHex.length !== 6) return '#ffffff';

  const r = parseInt(cleanedHex.slice(0, 2), 16);
  const g = parseInt(cleanedHex.slice(2, 4), 16);
  const b = parseInt(cleanedHex.slice(4, 6), 16);
  
  // YIQ formula for perceived luminance
  const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
  
  return yiq >= 128 ? '#000000' : '#ffffff';
};
