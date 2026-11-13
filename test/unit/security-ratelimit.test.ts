import { describe, it, expect } from "vitest";
import {
  hashPin,
  secureCompare,
  createAdminToken,
  verifyAdminToken,
} from "@/lib/security";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";

describe("Security Utilities", () => {
  it("hashPin generates consistent HMAC-SHA256 hex string", () => {
    const hash1 = hashPin("1234");
    const hash2 = hashPin("1234");
    const hash3 = hashPin("4321");

    expect(hash1).toBe(hash2);
    expect(hash1).not.toBe(hash3);
    expect(hash1.length).toBe(64);
  });

  it("secureCompare returns true for identical strings and false otherwise", () => {
    expect(secureCompare("secretToken", "secretToken")).toBe(true);
    expect(secureCompare("secretToken", "wrongToken")).toBe(false);
    expect(secureCompare("secretToken", "secret")).toBe(false);
  });

  it("creates and verifies a valid admin token", () => {
    const token = createAdminToken();
    expect(typeof token).toBe("string");
    expect(token).toContain(".");
    expect(verifyAdminToken(token)).toBe(true);
  });

  it("rejects tampered or malformed admin tokens", () => {
    const validToken = createAdminToken();
    const parts = validToken.split(".");
    const tamperedPayload = parts[0] + "tamper." + parts[1];
    const tamperedSignature = parts[0] + "." + parts[1] + "tamper";

    expect(verifyAdminToken(tamperedPayload)).toBe(false);
    expect(verifyAdminToken(tamperedSignature)).toBe(false);
    expect(verifyAdminToken(null)).toBe(false);
    expect(verifyAdminToken("")).toBe(false);
    expect(verifyAdminToken("random-string-without-dot")).toBe(false);
  });
});

describe("Rate Limiting", () => {
  it("allows requests under the limit and blocks exceeding attempts", () => {
    const testIp = `test-ip-${Date.now()}`;
    const limit = 3;

    // 1st request
    const r1 = checkRateLimit(testIp, limit, 10000);
    expect(r1.allowed).toBe(true);
    expect(r1.remaining).toBe(2);

    // 2nd request
    const r2 = checkRateLimit(testIp, limit, 10000);
    expect(r2.allowed).toBe(true);
    expect(r2.remaining).toBe(1);

    // 3rd request
    const r3 = checkRateLimit(testIp, limit, 10000);
    expect(r3.allowed).toBe(true);
    expect(r3.remaining).toBe(0);

    // 4th request (exceeds limit)
    const r4 = checkRateLimit(testIp, limit, 10000);
    expect(r4.allowed).toBe(false);
    expect(r4.remaining).toBe(0);
    expect(r4.resetInSeconds).toBeGreaterThan(0);
  });

  it("extracts client IP from x-forwarded-for or x-real-ip headers", () => {
    const headers1 = new Headers({ "x-forwarded-for": "203.0.113.195, 70.41.3.18" });
    expect(getClientIp(headers1)).toBe("203.0.113.195");

    const headers2 = new Headers({ "x-real-ip": "198.51.100.1" });
    expect(getClientIp(headers2)).toBe("198.51.100.1");

    const headers3 = new Headers();
    expect(getClientIp(headers3)).toBe("127.0.0.1");
  });
});
