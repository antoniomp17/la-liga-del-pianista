/**
 * Sintetizador sutil de piano usando la Web Audio API nativa del navegador.
 * No requiere archivos MP3 externos y funciona al instante.
 */

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!audioCtx) {
    const AudioContextClass =
      window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === "suspended") {
    audioCtx.resume();
  }
  return audioCtx;
}

// Frecuencias de notas musicales para acordes
const NOTES: { [key: string]: number } = {
  C4: 261.63,
  D4: 293.66,
  E4: 329.63,
  F4: 349.23,
  G4: 392.0,
  A4: 440.0,
  B4: 493.88,
  C5: 523.25,
  E5: 659.25,
  G5: 783.99,
};

function playNote(freq: number, startTime: number, duration: number, ctx: AudioContext) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  // Tipo triángulo/senoide para simular el timbre cálido de una cuerda pulsada
  osc.type = "sine";
  osc.frequency.setValueAtTime(freq, startTime);

  // Envolvente de ataque rápido y decaimiento suave (tipo piano)
  gain.gain.setValueAtTime(0, startTime);
  gain.gain.linearRampToValueAtTime(0.2, startTime + 0.03);
  gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(startTime);
  osc.stop(startTime + duration);
}

/**
 * Toca un acorde de victoria o subida de puesto (Do Mayor brillante: C4 -> E4 -> G4 -> C5).
 */
export function playTriumphChord() {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  playNote(NOTES.C4, now + 0.0, 0.8, ctx);
  playNote(NOTES.E4, now + 0.1, 0.8, ctx);
  playNote(NOTES.G4, now + 0.2, 0.9, ctx);
  playNote(NOTES.C5, now + 0.35, 1.4, ctx);
}

/**
 * Toca una nota simple de confirmación (tipo tecla de piano suave).
 */
export function playPianoKey(note: "C4" | "E4" | "G4" | "C5" = "C4") {
  const ctx = getAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;
  playNote(NOTES[note] || 261.63, now, 0.6, ctx);
}

/**
 * Toca un acorde alentador menor para cuando se pierde puesto (G4 -> E4).
 */
export function playEncouragementChime() {
  const ctx = getAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;
  playNote(NOTES.G4, now + 0.0, 0.5, ctx);
  playNote(NOTES.E4, now + 0.15, 0.8, ctx);
}
