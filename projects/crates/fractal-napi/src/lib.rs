//! Node-API export surface for `@doki-land/fractal`.
//! Compute only: rewrite + turtle / IFS / escape / note events. SVG/Canvas/WebAudio stays in TypeScript.

use fractal::{
    RewriteRule, grow_fern as grow_fern_core, grow_melody as grow_melody_core,
    julia as julia_core, mandelbrot as mandelbrot_core, rewrite as rewrite_core, turtle_path,
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
