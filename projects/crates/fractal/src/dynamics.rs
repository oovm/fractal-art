//! Strange attractors (2D iterative maps and 3D ODE projections).
//! Returns point clouds only; SVG / Canvas paint stays in TypeScript.

use crate::turtle::Point;

/// Which plane to project a 3D orbit onto.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum LorenzPlane {
    Xy,
    Xz,
    Yz,
}

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

/// Lorenz system integrated with RK4, projected to a 2D plane.
///
/// `dx/dt = σ(y − x)`, `dy/dt = x(ρ − z) − y`, `dz/dt = xy − βz`.
pub fn sample_lorenz(
    sigma: f64,
    rho: f64,
    beta: f64,
    dt: f64,
    iterations: usize,
    burn_in: usize,
    plane: LorenzPlane,
) -> Vec<Point> {
    if iterations == 0 || !(dt > 0.0) {
        return Vec::new();
    }
    let mut x = 0.1_f64;
    let mut y = 0.0_f64;
    let mut z = 0.0_f64;
    let mut out = Vec::with_capacity(iterations);
    for i in 0..(iterations + burn_in) {
        let (nx, ny, nz) = rk4_lorenz(x, y, z, sigma, rho, beta, dt);
        x = nx;
        y = ny;
        z = nz;
        if i >= burn_in {
            out.push(project(x, y, z, plane));
        }
    }
    out
}

/// Classic Clifford coefficients (a common demo set).
pub fn clifford_classic() -> (f64, f64, f64, f64) {
    (-1.4, 1.6, 1.0, 0.7)
}

/// Classic de Jong coefficients (a common demo set).
pub fn dejong_classic() -> (f64, f64, f64, f64) {
    (-2.0, -2.0, -1.2, 2.0)
}

/// Classic Lorenz coefficients (σ, ρ, β).
pub fn lorenz_classic() -> (f64, f64, f64) {
    (10.0, 28.0, 8.0 / 3.0)
}

fn project(x: f64, y: f64, z: f64, plane: LorenzPlane) -> Point {
    match plane {
        LorenzPlane::Xy => Point { x, y },
        LorenzPlane::Xz => Point { x, y: z },
        LorenzPlane::Yz => Point { x: y, y: z },
    }
}

fn lorenz_deriv(x: f64, y: f64, z: f64, sigma: f64, rho: f64, beta: f64) -> (f64, f64, f64) {
    (sigma * (y - x), x * (rho - z) - y, x * y - beta * z)
}

fn rk4_lorenz(
    x: f64,
    y: f64,
    z: f64,
    sigma: f64,
    rho: f64,
    beta: f64,
    dt: f64,
) -> (f64, f64, f64) {
    let (k1x, k1y, k1z) = lorenz_deriv(x, y, z, sigma, rho, beta);
    let (k2x, k2y, k2z) = lorenz_deriv(
        x + 0.5 * dt * k1x,
        y + 0.5 * dt * k1y,
        z + 0.5 * dt * k1z,
        sigma,
        rho,
        beta,
    );
    let (k3x, k3y, k3z) = lorenz_deriv(
        x + 0.5 * dt * k2x,
        y + 0.5 * dt * k2y,
        z + 0.5 * dt * k2z,
        sigma,
        rho,
        beta,
    );
    let (k4x, k4y, k4z) = lorenz_deriv(
        x + dt * k3x,
        y + dt * k3y,
        z + dt * k3z,
        sigma,
        rho,
        beta,
    );
    (
        x + (dt / 6.0) * (k1x + 2.0 * k2x + 2.0 * k3x + k4x),
        y + (dt / 6.0) * (k1y + 2.0 * k2y + 2.0 * k3y + k4y),
        z + (dt / 6.0) * (k1z + 2.0 * k2z + 2.0 * k3z + k4z),
    )
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
