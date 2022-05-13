/** Pure-TS note-event → WebAudio. Compute stays in Rust (NAPI / WASM). */

export type NoteEventLike = {
    time: number;
    midi: number;
    duration: number;
    velocity: number;
};

export type MelodyLike = {
    events: NoteEventLike[];
    count: number;
};

export type PlayMelodyOptions = {
    /** Master gain 0..1. Default 0.2. */
    gain?: number;
    /** Oscillator type. Default sine. */
    type?: OscillatorType;
};

function midiToHz(midi: number): number {
    return 440 * 2 ** ((midi - 69) / 12);
}

/**
 * Schedule `NoteEvent`s on a Web Audio context (browser only).
 * Returns when the last note ends (approx).
 */
export async function playMelody(
    melody: MelodyLike | NoteEventLike[],
    options: PlayMelodyOptions = {},
): Promise<void> {
    const events = Array.isArray(melody) ? melody : melody.events;
    if (events.length === 0) {
        return;
    }
    const AudioCtx =
        typeof globalThis !== "undefined"
            ? (globalThis as unknown as { AudioContext?: typeof AudioContext; webkitAudioContext?: typeof AudioContext })
                  .AudioContext ||
              (globalThis as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
            : undefined;
    if (!AudioCtx) {
        throw new Error("Web Audio API unavailable");
    }
    const ctx = new AudioCtx();
    const master = ctx.createGain();
    master.gain.value = options.gain ?? 0.2;
    master.connect(ctx.destination);
    const oscType = options.type ?? "sine";
    const t0 = ctx.currentTime + 0.05;
    let end = t0;

    for (const e of events) {
        const start = t0 + Math.max(0, e.time);
        const dur = Math.max(0.02, e.duration);
        const stop = start + dur;
        end = Math.max(end, stop);
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = oscType;
        osc.frequency.value = midiToHz(e.midi);
        const vel = Math.min(1, Math.max(0, e.velocity)) * (options.gain ?? 0.2);
        gain.gain.setValueAtTime(0, start);
        gain.gain.linearRampToValueAtTime(vel, start + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.0001, stop);
        osc.connect(gain);
        gain.connect(master);
        osc.start(start);
        osc.stop(stop + 0.02);
    }

    const waitMs = Math.ceil((end - ctx.currentTime) * 1000) + 50;
    await new Promise((r) => setTimeout(r, waitMs));
    await ctx.close();
}
