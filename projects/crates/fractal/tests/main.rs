use fractal::{Point, RewriteRule, grow_fern, points_to_polyline, rewrite, turtle_path};

#[test]
fn ready() {
    println!("it works!")
}

#[test]
fn algae_rewrites_like_lindenmayer() {
    let rules = [RewriteRule { from: 'A', to: "AB" }, RewriteRule { from: 'B', to: "A" }];
    assert_eq!(rewrite("A", &rules, 0), "A");
    assert_eq!(rewrite("A", &rules, 1), "AB");
    assert_eq!(rewrite("A", &rules, 2), "ABA");
    assert_eq!(rewrite("A", &rules, 3), "ABAAB");
}

#[test]
fn turtle_draws_forward_and_turns() {
    let path = turtle_path("F+F", 10.0, 90.0);
    assert_eq!(path.len(), 3);
    assert_eq!(path[0], Point { x: 0.0, y: 0.0 });
    assert!((path[1].y + 10.0).abs() < 1e-9);
    let view = points_to_polyline(&path, 0.0);
    assert!(view.points.contains(','));
    assert!(view.view_box.starts_with("0 0 "));
}

#[test]
fn barnsley_fern_is_deterministic_and_bounded() {
    let a = grow_fern(2_000, 42);
    let b = grow_fern(2_000, 42);
    assert_eq!(a.len(), 2_000);
    assert_eq!(a, b);
    let min_x = a.iter().map(|p| p.x).fold(f64::INFINITY, f64::min);
    let max_x = a.iter().map(|p| p.x).fold(f64::NEG_INFINITY, f64::max);
    let min_y = a.iter().map(|p| p.y).fold(f64::INFINITY, f64::min);
    let max_y = a.iter().map(|p| p.y).fold(f64::NEG_INFINITY, f64::max);
    assert!(min_x > -3.0 && max_x < 3.0, "x in [{min_x}, {max_x}]");
    assert!(min_y > -1.0 && max_y < 11.0, "y in [{min_y}, {max_y}]");
    let other = grow_fern(2_000, 99);
    assert_ne!(a, other);
}
