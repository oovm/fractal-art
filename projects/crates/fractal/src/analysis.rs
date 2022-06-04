//! Quantitative analysis helpers (geometry / fields → scalars).
//! Visualization of results stays in TypeScript.

use crate::turtle::Point;

/// Box-counting estimate of fractal dimension for a 2D point cloud.
///
/// Samples dyadic grids `n = 2, 4, …, 256` over the point-set bounding square
/// and returns the slope of `log(occupied)` vs `log(n)`. `None` if the cloud
/// is empty or degenerate. `min_boxes` is reserved for future finest-grid
/// clamps (currently ignored beyond requiring ≥ 2).
pub fn box_counting_dimension(points: &[Point], min_boxes: u32) -> Option<f64> {
    let _ = min_boxes.max(2);
    if points.len() < 2 {
        return None;
    }
    let mut min_x = f64::INFINITY;
    let mut min_y = f64::INFINITY;
    let mut max_x = f64::NEG_INFINITY;
    let mut max_y = f64::NEG_INFINITY;
    for p in points {
        min_x = min_x.min(p.x);
        min_y = min_y.min(p.y);
        max_x = max_x.max(p.x);
        max_y = max_y.max(p.y);
    }
    let span = (max_x - min_x).max(max_y - min_y);
    if !(span > 0.0) {
        return None;
    }
    let origin_x = min_x - span * 1e-9;
    let origin_y = min_y - span * 1e-9;
    let side = span * (1.0 + 2e-9);

    let mut ns: Vec<f64> = Vec::new();
    let mut counts: Vec<f64> = Vec::new();
    let mut n = 2_u32;
    while n <= 256 {
        let count = occupied_boxes(points, origin_x, origin_y, side, n);
        if count > 0 {
            ns.push(n as f64);
            counts.push(count as f64);
        }
        n *= 2;
    }
    if ns.len() < 2 {
        return None;
    }
    slope_log_log(&ns, &counts)
}

/// Grassberger–Procaccia correlation dimension for a 2D point cloud.
///
/// Subsamples to at most `max_points` (clamped to ≥ 32) for O(n²) pair counting,
/// then fits `log C(r)` vs `log r` over a geometric radius ladder. `None` if
/// the cloud is too small or statistically flat.
pub fn correlation_dimension(points: &[Point], max_points: u32) -> Option<f64> {
    let sample = subsample(points, max_points.max(32) as usize);
    if sample.len() < 32 {
        return None;
    }
    let n = sample.len();
    let pair_total = (n * (n - 1)) / 2;
    if pair_total == 0 {
        return None;
    }

    let mut dists = Vec::with_capacity(pair_total);
    for i in 0..n {
        for j in (i + 1)..n {
            let dx = sample[i].x - sample[j].x;
            let dy = sample[i].y - sample[j].y;
            let d = (dx * dx + dy * dy).sqrt();
            if d > 0.0 {
                dists.push(d);
            }
        }
    }
    if dists.len() < 64 {
        return None;
    }
    dists.sort_by(|a, b| a.partial_cmp(b).unwrap_or(std::cmp::Ordering::Equal));
    let d_min = dists[dists.len() / 20].max(1e-12);
    let d_max = dists[dists.len().saturating_sub(1 + dists.len() / 20)].max(d_min * 2.0);
    if !(d_max > d_min) {
        return None;
    }

    let steps = 12_usize;
    let mut xs = Vec::with_capacity(steps);
    let mut ys = Vec::with_capacity(steps);
    let ratio = (d_max / d_min).ln() / (steps as f64 - 1.0);
    for k in 0..steps {
        let r = d_min * (k as f64 * ratio).exp();
        let count = dists.iter().filter(|&&d| d < r).count();
        let c = count as f64 / pair_total as f64;
        if c > 0.0 && c < 1.0 {
            xs.push(r);
            ys.push(c);
        }
    }
    if xs.len() < 3 {
        return None;
    }
    slope_log_log(&xs, &ys)
}

fn subsample(points: &[Point], max_points: usize) -> Vec<Point> {
    if points.len() <= max_points {
        return points.to_vec();
    }
    let step = points.len() as f64 / max_points as f64;
    let mut out = Vec::with_capacity(max_points);
    let mut i = 0.0_f64;
    while out.len() < max_points {
        out.push(points[i as usize]);
        i += step;
        if i as usize >= points.len() {
            break;
        }
    }
    out
}

fn occupied_boxes(points: &[Point], ox: f64, oy: f64, side: f64, n: u32) -> usize {
    let cell = side / n as f64;
    if !(cell > 0.0) {
        return 0;
    }
    let mut seen =
        std::collections::HashSet::with_capacity(points.len().min(n as usize * n as usize));
    let last = (n as i64) - 1;
    for p in points {
        let ix = ((p.x - ox) / cell).floor() as i64;
        let iy = ((p.y - oy) / cell).floor() as i64;
        seen.insert((ix.clamp(0, last), iy.clamp(0, last)));
    }
    seen.len()
}

fn slope_log_log(xs: &[f64], ys: &[f64]) -> Option<f64> {
    let m = xs.len();
    if m != ys.len() || m < 2 {
        return None;
    }
    let mut sum_x = 0.0;
    let mut sum_y = 0.0;
    let mut sum_xx = 0.0;
    let mut sum_xy = 0.0;
    for i in 0..m {
        let x = xs[i].ln();
        let y = ys[i].ln();
        sum_x += x;
        sum_y += y;
        sum_xx += x * x;
        sum_xy += x * y;
    }
    let n = m as f64;
    let denom = n * sum_xx - sum_x * sum_x;
    if denom.abs() < 1e-18 {
        return None;
    }
    Some((n * sum_xy - sum_x * sum_y) / denom)
}
