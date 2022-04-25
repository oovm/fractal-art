/// One parallel production: replace `from` with `to`.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub struct RewriteRule<'a> {
    pub from: char,
    pub to: &'a str,
}

/// Apply parallel character substitutions for `iterations` generations.
pub fn rewrite(axiom: &str, rules: &[RewriteRule<'_>], iterations: usize) -> String {
    let mut current = axiom.to_string();
    for _ in 0..iterations {
        let mut next = String::with_capacity(current.len());
        for ch in current.chars() {
            match rules.iter().find(|rule| rule.from == ch) {
                Some(rule) => next.push_str(rule.to),
                None => next.push(ch),
            }
        }
        current = next;
    }
    current
}
