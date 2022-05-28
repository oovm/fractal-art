//! Iterated Function Systems (IFS) — chaos game sampling.
//! Returns point clouds only; SVG / Canvas paint stays in TypeScript.

use crate::turtle::Point;

/// 2D affine map `x' = a·x + b·y + e`, `y' = c·x + d·y + f`, with selection weight.
#[derive(Debug, Clone, Copy, PartialEq)]
pub struct Affine2 {
    pub a: f64,
    pub b: f64,
    pub c: f64,
    pub d: f64,
    pub e: f64,
    pub f: f64,
    /// Relative probability weight (must be > 0).
    pub weight: f64,
}

impl Affine2 {
    #[inline]
    pub fn apply(self, p: Point) -> Point {
        Point {
            x: self.a * p.x + self.b * p.y + self.e,
            y: self.c * p.x + self.d * p.y + self.f,
        }
    }
}

/// Classic Barnsley fern IFS (4 maps).
pub fn barnsley_fern() -> [Affine2; 4] {
    [
        Affine2 {
            a: 0.0,
            b: 0.0,
            c: 0.0,
            d: 0.16,
            e: 0.0,
            f: 0.0,
            weight: 0.01,
        },
        Affine2 {
            a: 0.85,
            b: 0.04,
            c: -0.04,
            d: 0.85,
            e: 0.0,
            f: 1.6,
            weight: 0.85,
        },
        Affine2 {
            a: 0.2,
            b: -0.26,
            c: 0.23,
            d: 0.22,
            e: 0.0,
            f: 1.6,
            weight: 0.07,
        },
        Affine2 {
            a: -0.15,
            b: 0.28,
            c: 0.26,
            d: 0.24,
            e: 0.0,
            f: 0.44,
            weight: 0.07,
        },
    ]
}

/// Classic Sierpiński gasket IFS (3 equal-weight maps).
pub fn sierpinski() -> [Affine2; 3] {
    [
        Affine2 {
            a: 0.5,
            b: 0.0,
            c: 0.0,
            d: 0.5,
            e: 0.0,
            f: 0.0,
            weight: 1.0,
        },
        Affine2 {
            a: 0.5,
            b: 0.0,
            c: 0.0,
            d: 0.5,
            e: 0.5,
            f: 0.0,
            weight: 1.0,
        },
        Affine2 {
            a: 0.5,
            b: 0.0,
            c: 0.0,
            d: 0.5,
            e: 0.25,
            f: 0.433_012_701_892_219_3, // √3 / 4
            weight: 1.0,
        },
    ]
}

/// Tiny deterministic LCG so tests and demos stay reproducible without `rand`.
#[derive(Debug, Clone, Copy)]
struct Lcg(u64);

impl Lcg {
    fn next_f64(&mut self) -> f64 {
        self.0 = self.0.wrapping_mul(6364136223846793005).wrapping_add(1);
        (self.0 >> 11) as f64 / ((1u64 << 53) as f64)
    }
}

/// Chaos-game sample of an arbitrary IFS. Discards the first `burn_in` iterates.
pub fn sample_ifs(maps: &[Affine2], iterations: usize, seed: u64, burn_in: usize) -> Vec<Point> {
    if maps.is_empty() || iterations == 0 {
        return Vec::new();
    }
    let total_weight: f64 = maps.iter().map(|m| m.weight.max(0.0)).sum();
    if total_weight <= 0.0 {
        return Vec::new();
    }

    let mut rng = Lcg(seed | 1);
    let mut p = Point { x: 0.0, y: 0.0 };
    let mut out = Vec::with_capacity(iterations);

    for i in 0..(iterations + burn_in) {
        let pick = rng.next_f64() * total_weight;
        let mut acc = 0.0;
        let mut chosen = maps[0];
        for m in maps {
            acc += m.weight.max(0.0);
            if pick <= acc {
                chosen = *m;
                break;
            }
        }
        p = chosen.apply(p);
        if i >= burn_in {
            out.push(p);
        }
    }
    out
}

/// Sample the classic Barnsley fern (geometry only).
pub fn grow_fern(iterations: usize, seed: u64) -> Vec<Point> {
    sample_ifs(&barnsley_fern(), iterations, seed, 20)
}

/// Sample the classic Sierpiński gasket (geometry only).
pub fn grow_sierpinski(iterations: usize, seed: u64) -> Vec<Point> {
    sample_ifs(&sierpinski(), iterations, seed, 20)
}
