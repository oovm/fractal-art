//! Node-API export surface for `@doki-land/fractal`.

use fractal::{
    RewriteRule, points_to_polyline, rewrite as rewrite_core, turtle_path,
};
use napi::bindgen_prelude::*;
use napi_derive::napi;

const PLANT_TO: &str = "FF+[+F-F-F]-[-F+F+F]";

#[napi(object)]
pub struct PlantGrowResult {
    pub points: String,
    pub view_box: String,
    pub source: String,
    pub source_length: u32,
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

/// Grow the classic plant L-system and return SVG polyline fields.
#[napi]
pub fn grow_plant(iterations: u32, step: f64, turn_degrees: f64, padding: f64) -> PlantGrowResult {
    let plant = RewriteRule { from: 'F', to: PLANT_TO };
    let source = rewrite_core("F", &[plant], iterations as usize);
    let path = turtle_path(&source, step, turn_degrees);
    let view = points_to_polyline(&path, padding);
    PlantGrowResult {
        points: view.points,
        view_box: view.view_box,
        source_length: source.len() as u32,
        source,
    }
}
