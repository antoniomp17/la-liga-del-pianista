// In-memory rate limiter per IP address for Next.js API routes

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const ipMap = new Map<string, RateLimitRecord>();

// Limpiar IPs expiradas periódicamente
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [ip, record] of ipMap.entries()) {
      if (now > record.resetAt) {
        ipMap.delete(ip);
      }
    }
  }, 60000);
}

export function resetRateLimits() {
  ipMap.clear();
}

/**
 * Verifica si una IP ha superado el límite de intentos.
 * @param ip Dirección IP del cliente
 * @param limit Número máximo de intentos permitidos
 * @param windowMs Ventana de tiempo en milisegundos (ej: 60000 = 1 minuto)
 * @returns { allowed: boolean, remaining: number, resetInSeconds: number }
 */
export function checkRateLimit(ip: string, limit = 5, windowMs = 60000) {
  if (process.env.DISABLE_RATE_LIMIT === "1") {
    return {
      allowed: true,
      remaining: 999,
      resetInSeconds: 0,
    };
  }

  const now = Date.now();
  const record = ipMap.get(ip);

  if (!record || now > record.resetAt) {
    ipMap.set(ip, {
      count: 1,
      resetAt: now + windowMs,
    });
    return {
      allowed: true,
      remaining: limit - 1,
      resetInSeconds: Math.ceil(windowMs / 1000),
    };
  }

  if (record.count >= limit) {
    const resetInSeconds = Math.max(1, Math.ceil((record.resetAt - now) / 1000));
    return {
      allowed: false,
      remaining: 0,
      resetInSeconds,
    };
  }

  record.count += 1;
  return {
    allowed: true,
    remaining: limit - record.count,
    resetInSeconds: Math.ceil((record.resetAt - now) / 1000),
  };
}

/**
 * Obtiene la IP real del cliente a partir de los encabezados HTTP.
 */
export function getClientIp(headers: Headers): string {
  const testIp = headers.get("x-test-ip");
  if (testIp) {
    return testIp.trim();
  }
  const forwardedFor = headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }
  const realIp = headers.get("x-real-ip");
  if (realIp) {
    return realIp.trim();
  }
  return "127.0.0.1";
}
