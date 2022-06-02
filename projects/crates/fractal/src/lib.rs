mod analysis;
mod audio;
mod dynamics;
mod errors;
mod escape;
mod ifs;
mod rewrite;
mod turtle;

pub use analysis::box_counting_dimension;
pub use audio::{NoteEvent, grow_melody};
pub use dynamics::{
    LorenzPlane, clifford_classic, dejong_classic, lorenz_classic, sample_clifford, sample_dejong,
    sample_lorenz,
};
pub use errors::{Error, Result};
pub use escape::{EscapeField, julia, mandelbrot};
pub use ifs::{Affine2, barnsley_fern, grow_fern, grow_sierpinski, sample_ifs, sierpinski};
pub use rewrite::{RewriteRule, rewrite};
pub use turtle::{Point, PolylineView, points_to_polyline, turtle_path};
