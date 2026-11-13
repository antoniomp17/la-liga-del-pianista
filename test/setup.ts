import "@testing-library/jest-dom";
import { vi } from "vitest";

// Mock canvas-confetti
vi.mock("canvas-confetti", () => ({
  default: vi.fn(),
}));

// Mock Web Audio API
if (typeof window !== "undefined") {
  class MockAudioContext {
    createOscillator() {
      return {
        connect: vi.fn(),
        start: vi.fn(),
        stop: vi.fn(),
        frequency: { setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() },
        type: "sine",
      };
    }
    createGain() {
      return {
        connect: vi.fn(),
        gain: {
          setValueAtTime: vi.fn(),
          linearRampToValueAtTime: vi.fn(),
          exponentialRampToValueAtTime: vi.fn(),
        },
      };
    }
    get destination() {
      return {};
    }
    get currentTime() {
      return 0;
    }
    close() {
      return Promise.resolve();
    }
  }

  // @ts-expect-error Mocking window AudioContext
  window.AudioContext = MockAudioContext;
  // @ts-expect-error Mocking window webkitAudioContext
  window.webkitAudioContext = MockAudioContext;
}
