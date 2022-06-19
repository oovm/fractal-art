/** TS render helpers for escape-time fields (Mandelbrot / Julia). */

export type EscapeField = {
  width: number;
  height: number;
  maxIter: number;
  values: number[] | Uint16Array;
};

function hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
  const hue = ((h % 360) + 360) % 360;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((hue / 60) % 2) - 1));
  const m = l - c / 2;
  let rp = 0;
  let gp = 0;
  let bp = 0;
  if (hue < 60) {
    rp = c;
    gp = x;
  } else if (hue < 120) {
    rp = x;
    gp = c;
  } else if (hue < 180) {
    gp = c;
    bp = x;
  } else if (hue < 240) {
    gp = x;
    bp = c;
  } else if (hue < 300) {
    rp = x;
    bp = c;
  } else {
    rp = c;
    bp = x;
  }
  return {
    r: Math.round((rp + m) * 255),
    g: Math.round((gp + m) * 255),
    b: Math.round((bp + m) * 255),
  };
}

/** Map escape iterations to ImageData (no color bake-in from Rust). */
export function paintEscapeField(
  canvas: HTMLCanvasElement,
  field: EscapeField,
  options: { hue?: number; interiorRgb?: [number, number, number] } = {},
) {
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("2D canvas context unavailable");
  const width = field.width | 0;
  const height = field.height | 0;
  canvas.width = width;
  canvas.height = height;
  const image = ctx.createImageData(width, height);
  const data = image.data;
  const maxIter = Math.max(field.maxIter, 1);
  const hue = options.hue ?? 210;
  const [ir, ig, ib] = options.interiorRgb ?? [8, 8, 16];
  for (let i = 0; i < width * height; i++) {
    const iter = field.values[i] ?? 0;
    const o = i * 4;
    if (iter >= maxIter) {
      data[o] = ir;
      data[o + 1] = ig;
      data[o + 2] = ib;
      data[o + 3] = 255;
      continue;
    }
    const t = iter / maxIter;
    const { r, g, b } = hslToRgb(hue, 0.72, 0.12 + t * 0.62);
    data[o] = r;
    data[o + 1] = g;
    data[o + 2] = b;
    data[o + 3] = 255;
  }
  ctx.putImageData(image, 0, 0);
}
