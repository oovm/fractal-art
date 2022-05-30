//! Strange attractors (2D iterative maps).
//! Returns point clouds only; SVG / Canvas paint stays in TypeScript.

use crate::turtle::Point;

/// Clifford attractor:
/// `x' = sin(a·y) + c·cos(a·x)`, `y' = sin(b·x) + d·cos(b·y)`.
pub fn sample_clifford(
    a: f64,
    b: f64,
    c: f64,
    d: f64,
    iterations: usize,
    burn_in: usize,
) -> Vec<Point> {
    sample_map(iterations, burn_in, |x, y| {
        (
            (a * y).sin() + c * (a * x).cos(),
            (b * x).sin() + d * (b * y).cos(),
        )
    })
}

/// Peter de Jong attractor:
/// `x' = sin(a·y) − cos(b·x)`, `y' = sin(c·x) − cos(d·y)`.
pub fn sample_dejong(
    a: f64,
    b: f64,
    c: f64,
    d: f64,
    iterations: usize,
    burn_in: usize,
) -> Vec<Point> {
    sample_map(iterations, burn_in, |x, y| {
        ((a * y).sin() - (b * x).cos(), (c * x).sin() - (d * y).cos())
    })
}

/// Classic Clifford coefficients (a common demo set).
pub fn clifford_classic() -> (f64, f64, f64, f64) {
    (-1.4, 1.6, 1.0, 0.7)
}

/// Classic de Jong coefficients (a common demo set).
pub fn dejong_classic() -> (f64, f64, f64, f64) {
    (-2.0, -2.0, -1.2, 2.0)
}

fn sample_map(
    iterations: usize,
    burn_in: usize,
    mut step: impl FnMut(f64, f64) -> (f64, f64),
) -> Vec<Point> {
    if iterations == 0 {
        return Vec::new();
    }
    let mut x = 0.1_f64;
    let mut y = 0.1_f64;
    let mut out = Vec::with_capacity(iterations);
    for i in 0..(iterations + burn_in) {
        let (nx, ny) = step(x, y);
        x = nx;
        y = ny;
        if i >= burn_in {
            out.push(Point { x, y });
        }
    }
    out
}
