//! Escape-time fractals (Mandelbrot / Julia).
//! Returns iteration fields only; color mapping stays in TypeScript.

/// Row-major escape-time field (`values[y * width + x]`).
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct EscapeField {
    pub width: u32,
    pub height: u32,
    pub max_iter: u32,
    pub values: Vec<u16>,
}

#[inline]
fn escape_iter(mut zx: f64, mut zy: f64, cx: f64, cy: f64, max_iter: u32) -> u16 {
    let mut i = 0_u32;
    while i < max_iter {
        let zx2 = zx * zx;
        let zy2 = zy * zy;
        if zx2 + zy2 > 4.0 {
            break;
        }
        zy = 2.0 * zx * zy + cy;
        zx = zx2 - zy2 + cx;
        i += 1;
    }
    i.min(u16::MAX as u32) as u16
}

/// Sample the Mandelbrot set over a rectangular window in the complex plane.
///
/// `center_x` / `center_y` is the window center; `scale` is the full width of the view.
pub fn mandelbrot(
    width: u32,
    height: u32,
    center_x: f64,
    center_y: f64,
    scale: f64,
    max_iter: u32,
) -> EscapeField {
    let w = width.max(1);
    let h = height.max(1);
    let max_iter = max_iter.max(1);
    let aspect = h as f64 / w as f64;
    let half_w = scale.max(1e-12) * 0.5;
    let half_h = half_w * aspect;
    let mut values = vec![0_u16; (w * h) as usize];

    for y in 0..h {
        let cy = center_y + (y as f64 / (h as f64 - 1.0).max(1.0) * 2.0 - 1.0) * half_h;
        for x in 0..w {
            let cx = center_x + (x as f64 / (w as f64 - 1.0).max(1.0) * 2.0 - 1.0) * half_w;
            values[(y * w + x) as usize] = escape_iter(0.0, 0.0, cx, cy, max_iter);
        }
    }

    EscapeField {
        width: w,
        height: h,
        max_iter,
        values,
    }
}

/// Sample a Julia set for fixed `c = (cx, cy)` over the same window convention as [`mandelbrot`].
pub fn julia(
    width: u32,
    height: u32,
    center_x: f64,
    center_y: f64,
    scale: f64,
    cx: f64,
    cy: f64,
    max_iter: u32,
) -> EscapeField {
    let w = width.max(1);
    let h = height.max(1);
    let max_iter = max_iter.max(1);
    let aspect = h as f64 / w as f64;
    let half_w = scale.max(1e-12) * 0.5;
    let half_h = half_w * aspect;
    let mut values = vec![0_u16; (w * h) as usize];

    for y in 0..h {
        let zy0 = center_y + (y as f64 / (h as f64 - 1.0).max(1.0) * 2.0 - 1.0) * half_h;
        for x in 0..w {
            let zx0 = center_x + (x as f64 / (w as f64 - 1.0).max(1.0) * 2.0 - 1.0) * half_w;
            values[(y * w + x) as usize] = escape_iter(zx0, zy0, cx, cy, max_iter);
        }
    }

    EscapeField {
        width: w,
        height: h,
        max_iter,
        values,
    }
}
