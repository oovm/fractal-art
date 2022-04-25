use fractal::{Point, RewriteRule, points_to_polyline, rewrite, turtle_path};

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
