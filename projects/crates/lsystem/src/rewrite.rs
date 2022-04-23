/// Apply parallel character substitutions for `iterations` generations.
pub fn rewrite(axiom: &str, rules: &[(char, &str)], iterations: usize) -> String {
    let mut current = axiom.to_string();
    for _ in 0..iterations {
        let mut next = String::with_capacity(current.len());
        for ch in current.chars() {
            match rules.iter().find(|(from, _)| *from == ch) {
                Some((_, to)) => next.push_str(to),
                None => next.push(ch),
            }
        }
        current = next;
    }
    current
}
