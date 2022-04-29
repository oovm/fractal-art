//! Browser WASM export surface for the homepage demo.
//! Node consumers use `fractal-napi` + `@doki-land/fractal-<platform>` instead.

use fractal::{RewriteRule, points_to_polyline, rewrite, turtle_path};
use serde::Serialize;
use wasm_bindgen::prelude::*;

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct PolylinePayload {
    points: String,
    view_box: String,
    source: String,
    source_length: usize,
}

const PLANT_TO: &str = "FF+[+F-F-F]-[-F+F+F]";

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

/// Grow the classic plant L-system and return SVG polyline fields.
#[wasm_bindgen(js_name = growPlant)]
pub fn grow_plant(iterations: u32, step: f64, turn_degrees: f64, padding: f64) -> Result<JsValue, JsValue> {
    let plant = RewriteRule { from: 'F', to: PLANT_TO };
    let source = rewrite("F", &[plant], iterations as usize);
    let path = turtle_path(&source, step, turn_degrees);
    let view = points_to_polyline(&path, padding);
    let payload = PolylinePayload {
        points: view.points,
        view_box: view.view_box,
        source_length: source.len(),
        source,
    };
    serde_wasm_bindgen::to_value(&payload).map_err(js_err)
}

fn js_err(err: impl std::fmt::Display) -> JsValue {
    JsValue::from_str(&err.to_string())
}
