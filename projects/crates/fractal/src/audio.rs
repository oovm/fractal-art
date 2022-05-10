//! Fractal → discrete note events (geometry of time / pitch only).
//! PCM / WebAudio / MIDI playback stays in TypeScript.

use crate::rewrite::{RewriteRule, rewrite};

/// One scheduled note in seconds from the sequence start.
#[derive(Debug, Clone, Copy, PartialEq)]
pub struct NoteEvent {
    /// Onset time in seconds.
    pub time: f64,
    /// MIDI note number (0–127).
    pub midi: u8,
    /// Duration in seconds.
    pub duration: f64,
    /// Velocity in 0..1.
    pub velocity: f32,
}

/// L-system → melody events on a diatonic scale.
///
/// Alphabet: `A`–`G` = scale degrees 0–6, `+`/`-` = transpose ±1 octave,
/// `[` / `]` = push / pop transposition (like turtle). Other symbols ignored.
pub fn grow_melody(iterations: usize, tempo_bpm: f64, seed_midi: u8) -> Vec<NoteEvent> {
    let rules = [
        RewriteRule { from: 'A', to: "A+BC-A" },
        RewriteRule { from: 'B', to: "CA" },
        RewriteRule { from: 'C', to: "A-B" },
    ];
    let source = rewrite("A", &rules, iterations);
    events_from_source(&source, tempo_bpm, seed_midi)
}

fn events_from_source(source: &str, tempo_bpm: f64, seed_midi: u8) -> Vec<NoteEvent> {
    let beat = 60.0 / tempo_bpm.max(1.0);
    let step = beat * 0.5;
    let scale: [i16; 7] = [0, 2, 4, 5, 7, 9, 11];
    let base = seed_midi as i16;
    let mut t = 0.0_f64;
    let mut octave = 0_i16;
    let mut stack: Vec<i16> = Vec::new();
    let mut out: Vec<NoteEvent> = Vec::new();

    for ch in source.chars() {
        match ch {
            '+' => octave += 1,
            '-' => octave -= 1,
            '[' => stack.push(octave),
            ']' => {
                if let Some(prev) = stack.pop() {
                    octave = prev;
                }
            }
            'A'..='G' => {
                let degree = (ch as u8 - b'A') as usize % 7;
                let midi = (base + scale[degree] + octave * 12).clamp(12, 108) as u8;
                out.push(NoteEvent {
                    time: t,
                    midi,
                    duration: step * 0.9,
                    velocity: 0.55,
                });
                t += step;
            }
            _ => {}
        }
    }
    out
}
