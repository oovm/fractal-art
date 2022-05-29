//! Browser WASM export surface for the homepage demo.
//! Compute only: rewrite + turtle / IFS / escape / note events / analysis. SVG/Canvas/WebAudio stays in TypeScript.

use fractal::{
    Affine2, Point, RewriteRule, box_counting_dimension as box_counting_dimension_core,
    grow_fern as grow_fern_core, grow_melody as grow_melody_core,
    grow_sierpinski as grow_sierpinski_core, julia as julia_core, mandelbrot as mandelbrot_core,
    rewrite, sample_ifs as sample_ifs_core, turtle_path,
};
use serde::{Deserialize, Serialize};
use wasm_bindgen::prelude::*;

const PLANT_TO: &str = "FF+[+F-F-F]-[-F+F+F]";
const MAX_FIELD_SIDE: u32 = 1024;

#[derive(Serialize, Deserialize)]
struct PointJs {
    x: f64,
    y: f64,
}

#[derive(Deserialize)]
struct Affine2Js {
    a: f64,
    b: f64,
    c: f64,
    d: f64,
    e: f64,
    f: f64,
    weight: f64,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct PlantPath {
    points: Vec<PointJs>,
    source: String,
    source_length: usize,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct PointCloud {
    points: Vec<PointJs>,
    count: usize,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct EscapeField {
    width: u32,
    height: u32,
    max_iter: u32,
    values: Vec<u16>,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct NoteEventJs {
    time: f64,
    midi: u8,
    duration: f64,
    velocity: f32,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct Melody {
    events: Vec<NoteEventJs>,
    count: usize,
}

fn clamp_side(side: u32) -> u32 {
    side.clamp(1, MAX_FIELD_SIDE)
}

/// Parallel L-system rewrite. `rules` is a flat `[from, to, from, to, …]` list.
#[wasm_bindgen(js_name = rewrite)]
pub fn js_rewrite(axiom: &str, rules: JsValue, iterations: u32) -> Result<String, JsValue> {
    let pairs: Vec<String> = serde_wasm_bindgen::from_value(rules).map_err(js_err)?;
    if pairs.len() % 2 != 0 {
        return Err(JsValue::from_str("rules must be an even-length [from, to, …] list"));
    }
    let owned: Vec<(char, String)> = pairs
        .chunks(2)
        .filter_map(|chunk| {
            let from = chunk[0].chars().next()?;
            Some((from, chunk[1].clone()))
        })
        .collect();
    let rules: Vec<RewriteRule<'_>> = owned
        .iter()
        .map(|(from, to)| RewriteRule { from: *from, to: to.as_str() })
        .collect();
    Ok(rewrite(axiom, &rules, iterations as usize))
}

/// Grow the classic plant L-system and return turtle points (no SVG bake-in).
#[wasm_bindgen(js_name = growPlant)]
pub fn grow_plant(iterations: u32, step: f64, turn_degrees: f64) -> Result<JsValue, JsValue> {
    let plant = RewriteRule { from: 'F', to: PLANT_TO };
    let source = rewrite("F", &[plant], iterations as usize);
    let path = turtle_path(&source, step, turn_degrees);
    let payload = PlantPath {
        points: path.iter().map(|p| PointJs { x: p.x, y: p.y }).collect(),
        source_length: source.len(),
        source,
    };
    serde_wasm_bindgen::to_value(&payload).map_err(js_err)
}

/// Sample the classic Barnsley fern IFS (geometry only, deterministic for a given seed).
#[wasm_bindgen(js_name = growFern)]
pub fn grow_fern(iterations: u32, seed: u32) -> Result<JsValue, JsValue> {
    let path = grow_fern_core(iterations as usize, seed as u64);
    let payload = PointCloud {
        count: path.len(),
        points: path.iter().map(|p| PointJs { x: p.x, y: p.y }).collect(),
    };
    serde_wasm_bindgen::to_value(&payload).map_err(js_err)
}

/// Sample an arbitrary IFS via the chaos game (geometry only).
#[wasm_bindgen(js_name = sampleIfs)]
pub fn sample_ifs(
    maps: JsValue,
    iterations: u32,
    seed: u32,
    burn_in: u32,
) -> Result<JsValue, JsValue> {
    let raw: Vec<Affine2Js> = serde_wasm_bindgen::from_value(maps).map_err(js_err)?;
    let mapped: Vec<Affine2> = raw
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
    let payload = PointCloud {
        count: path.len(),
        points: path.iter().map(|p| PointJs { x: p.x, y: p.y }).collect(),
    };
    serde_wasm_bindgen::to_value(&payload).map_err(js_err)
}

/// Sample the classic Sierpiński gasket IFS (geometry only).
#[wasm_bindgen(js_name = growSierpinski)]
pub fn grow_sierpinski(iterations: u32, seed: u32) -> Result<JsValue, JsValue> {
    let path = grow_sierpinski_core(iterations as usize, seed as u64);
    let payload = PointCloud {
        count: path.len(),
        points: path.iter().map(|p| PointJs { x: p.x, y: p.y }).collect(),
    };
    serde_wasm_bindgen::to_value(&payload).map_err(js_err)
}

/// Sample a Mandelbrot escape-time field (row-major `values`, no color bake-in).
#[wasm_bindgen(js_name = mandelbrot)]
pub fn mandelbrot(
    width: u32,
    height: u32,
    center_x: f64,
    center_y: f64,
    scale: f64,
    max_iter: u32,
) -> Result<JsValue, JsValue> {
    let field = mandelbrot_core(
        clamp_side(width),
        clamp_side(height),
        center_x,
        center_y,
        scale,
        max_iter.max(1),
    );
    let payload = EscapeField {
        width: field.width,
        height: field.height,
        max_iter: field.max_iter,
        values: field.values,
    };
    serde_wasm_bindgen::to_value(&payload).map_err(js_err)
}

/// Sample a Julia escape-time field for fixed `c = (cx, cy)`.
#[wasm_bindgen(js_name = julia)]
pub fn julia(
    width: u32,
    height: u32,
    center_x: f64,
    center_y: f64,
    scale: f64,
    cx: f64,
    cy: f64,
    max_iter: u32,
) -> Result<JsValue, JsValue> {
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
    let payload = EscapeField {
        width: field.width,
        height: field.height,
        max_iter: field.max_iter,
        values: field.values,
    };
    serde_wasm_bindgen::to_value(&payload).map_err(js_err)
}

/// Grow an L-system melody as discrete note events (no PCM bake-in).
#[wasm_bindgen(js_name = growMelody)]
pub fn grow_melody(iterations: u32, tempo_bpm: f64, seed_midi: u32) -> Result<JsValue, JsValue> {
    let events = grow_melody_core(iterations as usize, tempo_bpm, seed_midi.clamp(12, 108) as u8);
    let payload = Melody {
        count: events.len(),
        events: events
            .iter()
            .map(|e| NoteEventJs {
                time: e.time,
                midi: e.midi,
                duration: e.duration,
                velocity: e.velocity,
            })
            .collect(),
    };
    serde_wasm_bindgen::to_value(&payload).map_err(js_err)
}

/// Box-counting fractal dimension for a 2D point cloud (`null` if degenerate).
#[wasm_bindgen(js_name = boxCountingDimension)]
pub fn box_counting_dimension(points: JsValue, min_boxes: u32) -> Result<JsValue, JsValue> {
    let raw: Vec<PointJs> = serde_wasm_bindgen::from_value(points).map_err(js_err)?;
    let mapped: Vec<Point> = raw.iter().map(|p| Point { x: p.x, y: p.y }).collect();
    match box_counting_dimension_core(&mapped, min_boxes.max(2)) {
        Some(dim) => Ok(JsValue::from_f64(dim)),
        None => Ok(JsValue::NULL),
    }
}

fn js_err(err: impl std::fmt::Display) -> JsValue {
    JsValue::from_str(&err.to_string())
}
