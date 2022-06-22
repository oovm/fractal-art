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

export type MidiExportOptions = {
    /** Tempo in BPM written into the SMF. Default 120. */
    tempoBpm?: number;
    /** Pulses per quarter note. Default 480. */
    ppq?: number;
};

function midiToHz(midi: number): number {
    return 440 * 2 ** ((midi - 69) / 12);
}

function writeVarLen(value: number, out: number[]): void {
    let buffer = value & 0x7f;
    while ((value >>= 7) > 0) {
        buffer <<= 8;
        buffer |= (value & 0x7f) | 0x80;
    }
    for (;;) {
        out.push(buffer & 0xff);
        if (buffer & 0x80) buffer >>= 8;
        else break;
    }
}

function u16be(n: number): number[] {
    return [(n >> 8) & 0xff, n & 0xff];
}

function u32be(n: number): number[] {
    return [(n >> 24) & 0xff, (n >> 16) & 0xff, (n >> 8) & 0xff, n & 0xff];
}

/**
 * Encode note events as a Standard MIDI File (format 0).
 * Playback / download stays in TypeScript; Rust only supplies events.
 */
export function toMidiBytes(
    melody: MelodyLike | NoteEventLike[],
    options: MidiExportOptions = {},
): Uint8Array {
    const events = Array.isArray(melody) ? melody : melody.events;
    const tempoBpm = options.tempoBpm ?? 120;
    const ppq = options.ppq ?? 480;
    const usPerQuarter = Math.round(60_000_000 / Math.max(1, tempoBpm));

    type MidiMsg = { tick: number; bytes: number[] };
    const msgs: MidiMsg[] = [];
    for (const e of events) {
        const start = Math.max(0, Math.round((e.time * tempoBpm * ppq) / 60));
        const durTicks = Math.max(1, Math.round((e.duration * tempoBpm * ppq) / 60));
        const note = Math.min(127, Math.max(0, Math.round(e.midi)));
        const vel = Math.min(127, Math.max(1, Math.round(e.velocity * 127)));
        msgs.push({ tick: start, bytes: [0x90, note, vel] });
        msgs.push({ tick: start + durTicks, bytes: [0x80, note, 0] });
    }
    msgs.sort((a, b) => a.tick - b.tick || a.bytes[0] - b.bytes[0]);

    const track: number[] = [];
    // Set Tempo meta
    track.push(0x00, 0xff, 0x51, 0x03, (usPerQuarter >> 16) & 0xff, (usPerQuarter >> 8) & 0xff, usPerQuarter & 0xff);
    let prev = 0;
    for (const m of msgs) {
        writeVarLen(m.tick - prev, track);
        track.push(...m.bytes);
        prev = m.tick;
    }
    track.push(0x00, 0xff, 0x2f, 0x00); // End of Track

    const header = [
        0x4d,
        0x54,
        0x68,
        0x64, // MThd
        ...u32be(6),
        ...u16be(0), // format 0
        ...u16be(1), // one track
        ...u16be(ppq),
        0x4d,
        0x54,
        0x72,
        0x6b, // MTrk
        ...u32be(track.length),
        ...track,
    ];
    return Uint8Array.from(header);
}

const MAX_PLAY_EVENTS = 256;
const MAX_PLAY_MS = 30_000;

/**
 * Schedule `NoteEvent`s on a Web Audio context (browser only).
 * Resumes a suspended context, caps event count / wait, and always closes the context.
 */
export async function playMelody(
    melody: MelodyLike | NoteEventLike[],
    options: PlayMelodyOptions = {},
): Promise<void> {
    const raw = Array.isArray(melody) ? melody : melody?.events;
    const events = Array.isArray(raw) ? raw : [];
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
    try {
        if (ctx.state === "suspended") {
            await ctx.resume();
        }
        const master = ctx.createGain();
        const gainLevel = options.gain ?? 0.2;
        master.gain.value = gainLevel;
        master.connect(ctx.destination);
        const oscType = options.type ?? "sine";
        const clipped = events.slice(0, MAX_PLAY_EVENTS);
        const t0 = ctx.currentTime + 0.05;
        let end = t0;

        for (const e of clipped) {
            const start = t0 + Math.max(0, Number(e.time) || 0);
            const dur = Math.max(0.02, Number(e.duration) || 0.02);
            const stop = start + dur;
            if (!Number.isFinite(start) || !Number.isFinite(stop)) continue;
            end = Math.max(end, stop);
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = oscType;
            osc.frequency.value = midiToHz(Number(e.midi) || 60);
            const vel = Math.min(1, Math.max(0.001, Number(e.velocity) || 0.5)) * gainLevel;
            gain.gain.setValueAtTime(0.0001, start);
            gain.gain.exponentialRampToValueAtTime(vel, start + 0.015);
            gain.gain.exponentialRampToValueAtTime(0.0001, Math.max(start + 0.03, stop));
            osc.connect(gain);
            gain.connect(master);
            osc.start(start);
            osc.stop(stop + 0.02);
        }

        const waitMs = Math.min(
            MAX_PLAY_MS,
            Math.max(0, Math.ceil((end - ctx.currentTime) * 1000) + 50),
        );
        await new Promise((r) => setTimeout(r, waitMs));
    } finally {
        try {
            await ctx.close();
        } catch {
            /* ignore close races */
        }
    }
}
