use fractal::{
    LorenzPlane, Point, RewriteRule, barnsley_fern, box_counting_dimension, clifford_classic,
    correlation_dimension, grow_fern, grow_melody, grow_sierpinski, julia, logistic_lyapunov,
    logistic_lyapunov_scan, lorenz_classic, mandelbrot, points_to_polyline, rewrite, sample_clifford,
    sample_dejong, sample_ifs, sample_lorenz, turtle_path,
};

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

#[test]
fn mandelbrot_marks_cardioid_interior() {
    let field = mandelbrot(64, 48, -0.5, 0.0, 3.0, 80);
    assert_eq!(field.width, 64);
    assert_eq!(field.height, 48);
    assert_eq!(field.values.len(), 64 * 48);
    let cx = 32_usize;
    let cy = 24_usize;
    assert_eq!(field.values[cy * 64 + cx], 80);
    assert!(field.values[cy * 64 + 0] < 10);
}

#[test]
fn julia_has_interior_and_exterior() {
    let field = julia(48, 36, 0.0, 0.0, 3.0, -0.8, 0.156, 60);
    assert_eq!(field.values.len(), 48 * 36);
    assert!(field.values.iter().any(|&v| v < 60));
    assert!(field.values.iter().any(|&v| v == 60));
}

#[test]
fn grow_melody_is_deterministic_and_timed() {
    let a = grow_melody(2, 120.0, 60);
    let b = grow_melody(2, 120.0, 60);
    assert_eq!(a, b);
    assert!(!a.is_empty());
    assert!(a[0].time >= 0.0);
    for w in a.windows(2) {
        assert!(w[1].time >= w[0].time);
    }
    assert!(a.iter().all(|n| n.midi >= 12 && n.midi <= 108));
}

#[test]
fn box_counting_fern_is_between_one_and_two() {
    let pts = grow_fern(8_000, 7);
    let dim = box_counting_dimension(&pts, 2).expect("dimension");
    assert!(dim > 1.0 && dim < 2.0, "dim={dim}");
}

#[test]
fn box_counting_rejects_degenerate_clouds() {
    assert!(box_counting_dimension(&[], 2).is_none());
    assert!(box_counting_dimension(&[Point { x: 1.0, y: 1.0 }], 2).is_none());
    assert!(box_counting_dimension(&[Point { x: 0.0, y: 0.0 }, Point { x: 0.0, y: 0.0 }], 2).is_none());
}

#[test]
fn correlation_dimension_fern_is_between_one_and_two() {
    let pts = grow_fern(6_000, 7);
    let dim = correlation_dimension(&pts, 400).expect("correlation dimension");
    assert!(dim > 1.0 && dim < 2.0, "dim={dim}");
}

#[test]
fn correlation_dimension_rejects_tiny_clouds() {
    assert!(correlation_dimension(&[], 100).is_none());
    let tiny = vec![Point { x: 0.0, y: 0.0 }; 10];
    assert!(correlation_dimension(&tiny, 100).is_none());
}

#[test]
fn logistic_lyapunov_stable_at_r_two() {
    let lam = logistic_lyapunov(2.0, 2_000, 200).expect("lambda");
    assert!(lam < -0.5, "lam={lam}");
}

#[test]
fn logistic_lyapunov_chaotic_near_r_four() {
    let lam = logistic_lyapunov(3.9, 4_000, 400).expect("lambda");
    assert!(lam > 0.0, "lam={lam}");
}

#[test]
fn logistic_lyapunov_scan_covers_range() {
    let scan = logistic_lyapunov_scan(2.5, 4.0, 64, 1_500, 150).expect("scan");
    assert_eq!(scan.steps, 64);
    assert_eq!(scan.values.len(), 64);
    assert!(scan.values.iter().any(|&v| v < 0.0));
    assert!(scan.values.iter().any(|&v| v > 0.0));
}

#[test]
fn sample_ifs_matches_grow_fern_for_barnsley_maps() {
    let via_sample = sample_ifs(&barnsley_fern(), 1_500, 11, 20);
    let via_fern = grow_fern(1_500, 11);
    assert_eq!(via_sample, via_fern);
}

#[test]
fn grow_sierpinski_is_deterministic_and_bounded() {
    let a = grow_sierpinski(3_000, 3);
    let b = grow_sierpinski(3_000, 3);
    assert_eq!(a, b);
    assert_eq!(a.len(), 3_000);
    let min_x = a.iter().map(|p| p.x).fold(f64::INFINITY, f64::min);
    let max_x = a.iter().map(|p| p.x).fold(f64::NEG_INFINITY, f64::max);
    let min_y = a.iter().map(|p| p.y).fold(f64::INFINITY, f64::min);
    let max_y = a.iter().map(|p| p.y).fold(f64::NEG_INFINITY, f64::max);
    assert!(min_x >= -0.05 && max_x <= 1.05, "x in [{min_x}, {max_x}]");
    assert!(min_y >= -0.05 && max_y <= 1.0, "y in [{min_y}, {max_y}]");
}

#[test]
fn clifford_attractor_is_deterministic_and_bounded() {
    let (a, b, c, d) = clifford_classic();
    let pts = sample_clifford(a, b, c, d, 4_000, 50);
    let again = sample_clifford(a, b, c, d, 4_000, 50);
    assert_eq!(pts, again);
    assert_eq!(pts.len(), 4_000);
    for p in &pts {
        assert!(p.x.is_finite() && p.y.is_finite());
        assert!(p.x.abs() < 3.0 && p.y.abs() < 3.0, "({} {})", p.x, p.y);
    }
}

#[test]
fn dejong_attractor_is_deterministic_and_nonempty() {
    let pts = sample_dejong(-2.0, -2.0, -1.2, 2.0, 2_000, 20);
    assert_eq!(pts.len(), 2_000);
    assert!(pts.iter().any(|p| p.x != pts[0].x || p.y != pts[0].y));
}

#[test]
fn lorenz_xy_projection_is_deterministic_and_bounded() {
    let (sigma, rho, beta) = lorenz_classic();
    let a = sample_lorenz(sigma, rho, beta, 0.01, 5_000, 200, LorenzPlane::Xy);
    let b = sample_lorenz(sigma, rho, beta, 0.01, 5_000, 200, LorenzPlane::Xy);
    assert_eq!(a, b);
    assert_eq!(a.len(), 5_000);
    for p in &a {
        assert!(p.x.is_finite() && p.y.is_finite());
        assert!(p.x.abs() < 40.0 && p.y.abs() < 40.0, "({} {})", p.x, p.y);
    }
    // Lorenz butterfly is not a single fixed point.
    assert!(a.iter().any(|p| (p.x - a[0].x).abs() > 1.0));
}
