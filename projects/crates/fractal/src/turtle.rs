/// 2D point in turtle space.
#[derive(Debug, Clone, Copy, PartialEq)]
pub struct Point {
    pub x: f64,
    pub y: f64,
}

/// SVG-friendly polyline plus a viewBox string.
#[derive(Debug, Clone, PartialEq)]
pub struct PolylineView {
    pub points: String,
    pub view_box: String,
}

/// Interpret classic L-system turtle commands (`F`/`G`/`+`/`-`/`[`/`]`).
pub fn turtle_path(source: &str, step: f64, turn_degrees: f64) -> Vec<Point> {
    let rad = turn_degrees.to_radians();
    let mut x = 0.0_f64;
    let mut y = 0.0_f64;
    let mut heading = -std::f64::consts::FRAC_PI_2;
    let mut stack: Vec<(f64, f64, f64)> = Vec::new();
    let mut points = vec![Point { x, y }];

    for ch in source.chars() {
        match ch {
            'F' | 'G' => {
                x += heading.cos() * step;
                y += heading.sin() * step;
                points.push(Point { x, y });
            }
            '+' => heading += rad,
            '-' => heading -= rad,
            '[' => stack.push((x, y, heading)),
            ']' => {
                if let Some((sx, sy, sh)) = stack.pop() {
                    x = sx;
                    y = sy;
                    heading = sh;
                    points.push(Point { x, y });
                }
            }
            _ => {}
        }
    }
    points
}

/// Fit turtle points into an SVG polyline + viewBox with padding.
pub fn points_to_polyline(points: &[Point], padding: f64) -> PolylineView {
    if points.is_empty() {
        return PolylineView {
            points: String::new(),
            view_box: "0 0 100 100".into(),
        };
    }

    let mut min_x = points[0].x;
    let mut min_y = points[0].y;
    let mut max_x = points[0].x;
    let mut max_y = points[0].y;
    for p in points.iter().skip(1) {
        min_x = min_x.min(p.x);
        min_y = min_y.min(p.y);
        max_x = max_x.max(p.x);
        max_y = max_y.max(p.y);
    }

    let width = (max_x - min_x).max(1.0);
    let height = (max_y - min_y).max(1.0);
    let serialized = points
        .iter()
        .map(|p| format!("{:.2},{:.2}", p.x - min_x + padding, p.y - min_y + padding))
        .collect::<Vec<_>>()
        .join(" ");

    PolylineView {
        points: serialized,
        view_box: format!("0 0 {:.2} {:.2}", width + padding * 2.0, height + padding * 2.0),
    }
}
