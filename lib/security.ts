import crypto from "crypto";

// Secreto interno del servidor para salar y firmar tokens (nunca expuesto al cliente)
const SERVER_SECRET =
  process.env.CONTEST_SECRET || "piano-league-ultra-secret-salt-key-2025-deepmind";

/**
 * Hashea un PIN usando HMAC-SHA256 con el secreto del servidor.
 */
export function hashPin(pin: string): string {
  return crypto.createHmac("sha256", SERVER_SECRET).update(pin.trim()).digest("hex");
}

/**
 * Compara dos cadenas de forma segura contra ataques de temporización (timing attack).
 */
export function secureCompare(a: string, b: string): boolean {
  try {
    const bufA = Buffer.from(a, "utf-8");
    const bufB = Buffer.from(b, "utf-8");
    if (bufA.length !== bufB.length) {
      return false;
    }
    return crypto.timingSafeEqual(bufA, bufB);
  } catch {
    return false;
  }
}

/**
 * Genera un token firmado de sesión para la administradora (Profesora).
 * Expira en 7 días.
 */
export function createAdminToken(): string {
  const payload = {
    role: "admin",
    exp: Date.now() + 7 * 24 * 60 * 60 * 1000,
    nonce: crypto.randomBytes(8).toString("hex"),
  };
  const str = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = crypto.createHmac("sha256", SERVER_SECRET).update(str).digest("base64url");
  return `${str}.${signature}`;
}

/**
 * Valida un token de sesión de la administradora.
 */
export function verifyAdminToken(token: string | null | undefined): boolean {
  if (!token || !token.includes(".")) return false;
  const [str, signature] = token.split(".");
  if (!str || !signature) return false;

  const expectedSig = crypto.createHmac("sha256", SERVER_SECRET).update(str).digest("base64url");
  if (!secureCompare(signature, expectedSig)) {
    return false;
  }

  try {
    const payload = JSON.parse(Buffer.from(str, "base64url").toString("utf-8"));
    if (payload.role !== "admin" || Date.now() > payload.exp) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}
