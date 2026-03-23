import { useRef, useCallback, useEffect } from 'react';

/**
 * useGameAudio — procedural Web Audio API sound engine.
 * No audio files needed. Synthesises all sounds on the fly.
 * Call `start()` when gameplay begins, `stop()` when it ends.
 */
export function useGameAudio(theme: 'floss' | 'banquet') {
    const ctxRef = useRef<AudioContext | null>(null);
    const bgGainRef = useRef<GainNode | null>(null);
    const bgSrcRef = useRef<AudioBufferSourceNode | null>(null);

    // ── helpers ────────────────────────────────────────────────────
    function getCtx(): AudioContext {
        if (!ctxRef.current || ctxRef.current.state === 'closed') {
            ctxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        if (ctxRef.current.state === 'suspended') {
            ctxRef.current.resume();
        }
        return ctxRef.current;
    }

    /** Play a short synthesised tone burst */
    function tone(
        frequency: number,
        duration: number,
        type: OscillatorType = 'sine',
        gainPeak = 0.35,
        delay = 0,
    ) {
        try {
            const ctx = getCtx();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            const now = ctx.currentTime + delay;

            osc.type = type;
            osc.frequency.setValueAtTime(frequency, now);

            gain.gain.setValueAtTime(0, now);
            gain.gain.linearRampToValueAtTime(gainPeak, now + 0.01);
            gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now);
            osc.stop(now + duration + 0.05);
        } catch (_) { }
    }

    // ── background music ───────────────────────────────────────────
    /** Build a short loopable audio buffer from a melody array */
    function buildBgBuffer(ctx: AudioContext): AudioBuffer {
        const bpm = 120;
        const beat = (60 / bpm);       // seconds per beat
        const sr = ctx.sampleRate;

        // Theme-specific melodies (note frequencies in Hz, 0 = rest)
        const flossNotes = [
            523, 659, 784, 659, 523, 0, 392, 523,
            659, 784, 880, 784, 659, 0, 523, 0,
        ];
        const banquetNotes = [
            392, 440, 523, 440, 392, 349, 392, 0,
            440, 523, 587, 523, 440, 392, 440, 0,
        ];
        const notes = theme === 'floss' ? flossNotes : banquetNotes;

        const totalSec = notes.length * beat;
        const buffer = ctx.createBuffer(1, Math.ceil(totalSec * sr), sr);
        const data = buffer.getChannelData(0);

        notes.forEach((freq, i) => {
            if (freq === 0) return;
            const startSample = Math.floor(i * beat * sr);
            const noteSamples = Math.floor(beat * sr * 0.75); // 75% duty cycle
            for (let s = 0; s < noteSamples; s++) {
                const t = s / sr;
                const env = Math.min(1, t * 20) * Math.max(0, 1 - (s / noteSamples) * 1.5);
                data[startSample + s] = Math.sin(2 * Math.PI * freq * t) * env * 0.18;
            }
        });

        return buffer;
    }

    // ── public API ─────────────────────────────────────────────────

    const startBg = useCallback(() => {
        try {
            const ctx = getCtx();
            const buf = buildBgBuffer(ctx);

            const gainNode = ctx.createGain();
            gainNode.gain.setValueAtTime(0, ctx.currentTime);
            gainNode.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 1.5);
            gainNode.connect(ctx.destination);
            bgGainRef.current = gainNode;

            const src = ctx.createBufferSource();
            src.buffer = buf;
            src.loop = true;
            src.connect(gainNode);
            src.start();
            bgSrcRef.current = src;
        } catch (_) { }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [theme]);

    const stopBg = useCallback(() => {
        try {
            bgGainRef.current?.gain.linearRampToValueAtTime(
                0, (ctxRef.current?.currentTime ?? 0) + 0.5
            );
            setTimeout(() => {
                bgSrcRef.current?.stop();
                bgSrcRef.current = null;
            }, 600);
        } catch (_) { }
    }, []);

    // ── SFX (theme-independent names, theme-specific tuning) ───────

    /** Gap passed / correct answer */
    const sfxSuccess = useCallback(() => {
        const base = theme === 'floss' ? 523 : 659;
        tone(base, 0.12, 'sine', 0.3);
        tone(base * 1.25, 0.12, 'sine', 0.25, 0.12);
        tone(base * 1.5, 0.2, 'sine', 0.3, 0.22);
    }, [theme]);

    /** Perfect pass / combo */
    const sfxPerfect = useCallback(() => {
        [0, 0.07, 0.14, 0.21].forEach((d, i) =>
            tone(523 * Math.pow(1.26, i), 0.15, 'sine', 0.35, d)
        );
    }, []);

    /** Life lost / wrong answer */
    const sfxHit = useCallback(() => {
        tone(220, 0.08, 'sawtooth', 0.4);
        tone(180, 0.12, 'sawtooth', 0.35, 0.08);
        tone(140, 0.2, 'square', 0.25, 0.18);
    }, []);

    /** Movement button tap */
    const sfxTap = useCallback(() => {
        tone(880, 0.06, 'sine', 0.12);
    }, []);

    /** Victory fanfare */
    const sfxVictory = useCallback(() => {
        const seq = [523, 659, 784, 1047];
        seq.forEach((f, i) => tone(f, 0.25, 'sine', 0.4, i * 0.18));
        setTimeout(() => {
            [784, 880, 1047].forEach((f, i) => tone(f, 0.35, 'sine', 0.45, i * 0.15));
        }, seq.length * 180 + 100);
    }, []);

    /** Timer tick (last 5 seconds of countdown) */
    const sfxTick = useCallback(() => {
        tone(880, 0.05, 'square', 0.15);
    }, []);

    // Clean up on unmount
    useEffect(() => {
        return () => {
            try {
                bgSrcRef.current?.stop();
                ctxRef.current?.close();
            } catch (_) { }
        };
    }, []);

    return { startBg, stopBg, sfxSuccess, sfxPerfect, sfxHit, sfxTap, sfxVictory, sfxTick };
}
