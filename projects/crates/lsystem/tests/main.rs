use lsystem::rewrite;

#[test]
fn ready() {
    println!("it works!")
}

#[test]
fn algae_rewrites_like_lindenmayer() {
    let rules = [('A', "AB"), ('B', "A")];
    assert_eq!(rewrite("A", &rules, 0), "A");
    assert_eq!(rewrite("A", &rules, 1), "AB");
    assert_eq!(rewrite("A", &rules, 2), "ABA");
    assert_eq!(rewrite("A", &rules, 3), "ABAAB");
}
