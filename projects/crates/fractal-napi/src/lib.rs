//! Node-API export surface for `@doki-land/fractal`.
//! Compute only: rewrite + turtle / IFS / dynamics / escape / note events / analysis.
//! SVG/Canvas/WebAudio stays in TypeScript.

use fractal::{
    Affine2, LorenzPlane, Point, RewriteRule, box_counting_dimension as box_counting_dimension_core,
    correlation_dimension as correlation_dimension_core, grow_fern as grow_fern_core,
    grow_melody as grow_melody_core, grow_sierpinski as grow_sierpinski_core, julia as julia_core,
    logistic_lyapunov as logistic_lyapunov_core,
    logistic_lyapunov_scan as logistic_lyapunov_scan_core, mandelbrot as mandelbrot_core,
    rewrite as rewrite_core, sample_clifford as sample_clifford_core,
    sample_dejong as sample_dejong_core, sample_ifs as sample_ifs_core,
    sample_lorenz as sample_lorenz_core, turtle_path,
};
use napi::bindgen_prelude::*;
use napi_derive::napi;

const PLANT_TO: &str = "FF+[+F-F-F]-[-F+F+F]";
const MAX_FIELD_SIDE: u32 = 2048;

#[napi(object)]
pub struct Point2 {
    pub x: f64,
    pub y: f64,
}

#[napi(object)]
pub struct PlantPath {
    pub points: Vec<Point2>,
    pub source: String,
    pub source_length: u32,
}

#[napi(object)]
pub struct PointCloud {
    pub points: Vec<Point2>,
    pub count: u32,
}

#[napi(object)]
pub struct Affine2Js {
    pub a: f64,
    pub b: f64,
    pub c: f64,
    pub d: f64,
    pub e: f64,
    pub f: f64,
    pub weight: f64,
}

#[napi(object)]
pub struct EscapeField {
    pub width: u32,
    pub height: u32,
    pub max_iter: u32,
    pub values: Vec<u16>,
}

#[napi(object)]
pub struct NoteEvent {
    pub time: f64,
    pub midi: u32,
    pub duration: f64,
    pub velocity: f64,
}

#[napi(object)]
pub struct Melody {
    pub events: Vec<NoteEvent>,
    pub count: u32,
}

#[napi(object)]
pub struct LyapunovScan {
    pub r_min: f64,
    pub r_max: f64,
    pub steps: u32,
    pub values: Vec<f64>,
}

fn clamp_side(side: u32) -> u32 {
    side.clamp(1, MAX_FIELD_SIDE)
}

/// Parallel L-system rewrite. `rules` is a flat `[from, to, from, to, …]` list.
#[napi]
pub fn rewrite(axiom: String, rules: Vec<String>, iterations: u32) -> Result<String> {
    if rules.len() % 2 != 0 {
        return Err(Error::from_reason("rules must be an even-length [from, to, …] list"));
    }
    let owned: Vec<(char, String)> = rules
        .chunks(2)
        .filter_map(|chunk| {
            let from = chunk[0].chars().next()?;
            Some((from, chunk[1].clone()))
        })
        .collect();
    let mapped: Vec<RewriteRule<'_>> = owned
        .iter()
        .map(|(from, to)| RewriteRule { from: *from, to: to.as_str() })
        .collect();
    Ok(rewrite_core(&axiom, &mapped, iterations as usize))
}

/// Grow the classic plant L-system and return turtle points (no SVG bake-in).
#[napi]
pub fn grow_plant(iterations: u32, step: f64, turn_degrees: f64) -> PlantPath {
    let plant = RewriteRule { from: 'F', to: PLANT_TO };
    let source = rewrite_core("F", &[plant], iterations as usize);
    let path = turtle_path(&source, step, turn_degrees);
    PlantPath {
        points: path.iter().map(|p| Point2 { x: p.x, y: p.y }).collect(),
        source_length: source.len() as u32,
        source,
    }
}

/// Sample the classic Barnsley fern IFS (geometry only, deterministic for a given seed).
#[napi]
pub fn grow_fern(iterations: u32, seed: u32) -> PointCloud {
    let path = grow_fern_core(iterations as usize, seed as u64);
    PointCloud {
        count: path.len() as u32,
        points: path.iter().map(|p| Point2 { x: p.x, y: p.y }).collect(),
    }
}

/// Sample an arbitrary IFS via the chaos game (geometry only).
#[napi]
pub fn sample_ifs(maps: Vec<Affine2Js>, iterations: u32, seed: u32, burn_in: u32) -> PointCloud {
    let mapped: Vec<Affine2> = maps
        .iter()
        .map(|m| Affine2 {
            a: m.a,
            b: m.b,
            c: m.c,
            d: m.d,
            e: m.e,
            f: m.f,
            weight: m.weight,
        })
        .collect();
    let path = sample_ifs_core(&mapped, iterations as usize, seed as u64, burn_in as usize);
    PointCloud {
        count: path.len() as u32,
        points: path.iter().map(|p| Point2 { x: p.x, y: p.y }).collect(),
    }
}

/// Sample the classic Sierpiński gasket IFS (geometry only).
#[napi]
pub fn grow_sierpinski(iterations: u32, seed: u32) -> PointCloud {
    let path = grow_sierpinski_core(iterations as usize, seed as u64);
    PointCloud {
        count: path.len() as u32,
        points: path.iter().map(|p| Point2 { x: p.x, y: p.y }).collect(),
    }
}

/// Sample a Clifford attractor point cloud (geometry only).
#[napi]
pub fn sample_clifford(
    a: f64,
    b: f64,
    c: f64,
    d: f64,
    iterations: u32,
    burn_in: u32,
) -> PointCloud {
    let path = sample_clifford_core(a, b, c, d, iterations as usize, burn_in as usize);
    PointCloud {
        count: path.len() as u32,
        points: path.iter().map(|p| Point2 { x: p.x, y: p.y }).collect(),
    }
}

/// Sample a Peter de Jong attractor point cloud (geometry only).
#[napi]
pub fn sample_dejong(
    a: f64,
    b: f64,
    c: f64,
    d: f64,
    iterations: u32,
    burn_in: u32,
) -> PointCloud {
    let path = sample_dejong_core(a, b, c, d, iterations as usize, burn_in as usize);
    PointCloud {
        count: path.len() as u32,
        points: path.iter().map(|p| Point2 { x: p.x, y: p.y }).collect(),
    }
}

fn parse_lorenz_plane(plane: &str) -> Result<LorenzPlane> {
    match plane.trim().to_ascii_lowercase().as_str() {
        "xy" => Ok(LorenzPlane::Xy),
        "xz" => Ok(LorenzPlane::Xz),
        "yz" => Ok(LorenzPlane::Yz),
        _ => Err(Error::from_reason("plane must be one of xy, xz, yz")),
    }
}

/// Sample a Lorenz attractor projected to a 2D plane (`xy` / `xz` / `yz`).
#[napi]
pub fn sample_lorenz(
    sigma: f64,
    rho: f64,
    beta: f64,
    dt: f64,
    iterations: u32,
    burn_in: u32,
    plane: String,
) -> Result<PointCloud> {
    let plane = parse_lorenz_plane(&plane)?;
    let path = sample_lorenz_core(
        sigma,
        rho,
        beta,
        dt,
        iterations as usize,
        burn_in as usize,
        plane,
    );
    Ok(PointCloud {
        count: path.len() as u32,
        points: path.iter().map(|p| Point2 { x: p.x, y: p.y }).collect(),
    })
}

/// Sample a Mandelbrot escape-time field (row-major `values`, no color bake-in).
#[napi]
pub fn mandelbrot(
    width: u32,
    height: u32,
    center_x: f64,
    center_y: f64,
    scale: f64,
    max_iter: u32,
) -> EscapeField {
    let field = mandelbrot_core(
        clamp_side(width),
        clamp_side(height),
        center_x,
        center_y,
        scale,
        max_iter.max(1),
    );
    EscapeField {
        width: field.width,
        height: field.height,
        max_iter: field.max_iter,
        values: field.values,
    }
}

/// Sample a Julia escape-time field for fixed `c = (cx, cy)`.
#[napi]
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
    let field = julia_core(
        clamp_side(width),
        clamp_side(height),
        center_x,
        center_y,
        scale,
        cx,
        cy,
        max_iter.max(1),
    );
    EscapeField {
        width: field.width,
        height: field.height,
        max_iter: field.max_iter,
        values: field.values,
    }
}

/// Grow an L-system melody as discrete note events (no PCM bake-in).
#[napi]
pub fn grow_melody(iterations: u32, tempo_bpm: f64, seed_midi: u32) -> Melody {
    let events = grow_melody_core(
        iterations as usize,
        tempo_bpm,
        seed_midi.clamp(12, 108) as u8,
    );
    Melody {
        count: events.len() as u32,
        events: events
            .iter()
            .map(|e| NoteEvent {
                time: e.time,
                midi: e.midi as u32,
                duration: e.duration,
                velocity: e.velocity as f64,
            })
            .collect(),
    }
}

/// Box-counting fractal dimension for a 2D point cloud (`null` if degenerate).
#[napi]
pub fn box_counting_dimension(points: Vec<Point2>, min_boxes: u32) -> Option<f64> {
    let mapped: Vec<Point> = points.iter().map(|p| Point { x: p.x, y: p.y }).collect();
    box_counting_dimension_core(&mapped, min_boxes.max(2))
}

/// Correlation dimension for a 2D point cloud (`null` if degenerate).
#[napi]
pub fn correlation_dimension(points: Vec<Point2>, max_points: u32) -> Option<f64> {
    let mapped: Vec<Point> = points.iter().map(|p| Point { x: p.x, y: p.y }).collect();
    correlation_dimension_core(&mapped, max_points.max(32))
}

/// Lyapunov exponent of the logistic map at parameter `r` (`null` if non-finite).
#[napi]
pub fn logistic_lyapunov(r: f64, iterations: u32, burn_in: u32) -> Option<f64> {
    logistic_lyapunov_core(r, iterations.max(1) as usize, burn_in as usize)
}

/// Scan logistic Lyapunov exponents over `[rMin, rMax]`.
#[napi]
pub fn logistic_lyapunov_scan(
    r_min: f64,
    r_max: f64,
    steps: u32,
    iterations: u32,
    burn_in: u32,
) -> Option<LyapunovScan> {
    let scan = logistic_lyapunov_scan_core(
        r_min,
        r_max,
        steps.max(2),
        iterations.max(1) as usize,
        burn_in as usize,
    )?;
    Some(LyapunovScan {
        r_min: scan.r_min,
        r_max: scan.r_max,
        steps: scan.steps,
        values: scan.values,
    })
}
