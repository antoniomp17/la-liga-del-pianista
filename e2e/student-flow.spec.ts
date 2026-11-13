import { test, expect } from "@playwright/test";

test.describe("Flujo Completo del Alumno (E2E)", () => {
  test("Acceso mediante formulario con PIN correcto y navegación", async ({ page }) => {
    await page.goto("/");

    // 1. Verificar pantalla de login
    await expect(page.getByText("LA LIGA DEL PIANISTA 🎹")).toBeVisible();
    const pinInput = page.getByPlaceholder("••••");
    await expect(pinInput).toBeVisible();

    // 2. Introducir PIN de Clara Schumann (7429)
    await pinInput.fill("7429");
    await page.getByRole("button", { name: /Acceder a mi Clasificación/i }).click();

    // 3. Verificar modal de notificación si aparece y cerrarlo
    const modalClose = page.getByRole("button", { name: /¡Entendido, ver clasificación!/i });
    await modalClose.waitFor({ state: "visible", timeout: 6000 }).catch(() => null);
    if (await modalClose.isVisible()) {
      await modalClose.click();
      await modalClose.waitFor({ state: "hidden", timeout: 4000 }).catch(() => null);
    }

    // 4. Verificar elementos clave del dashboard del alumno
    await expect(page.getByText("Podio de Honor")).toBeVisible();
    await expect(page.getByText("Top 10 de Honor")).toBeVisible();
    await expect(page.getByText("Tu Puntuación en los Frentes Oficiales")).toBeVisible();
    await expect(page.getByText("Práctica de Obras (Factor ×2)")).toBeVisible();

    // 5. Probar apertura del Modal de Bases y Calendario
    await page.getByRole("button", { name: /Reglamento & Calendario/i }).click();
    await expect(page.getByText("Bases Oficiales & Calendario de Competición")).toBeVisible();
    await expect(page.getByText("1. Fuentes de Puntos")).toBeVisible();

    // Cambiar a la pestaña de Calendario
    await page.getByText(/2\. Calendario/i).click();
    await expect(page.getByText(/Calendario oficial/i)).toBeVisible();

    // Cerrar modal
    await page.getByRole("button", { name: /Cerrar modal/i }).click();
    await expect(page.getByText("Bases Oficiales & Calendario de Competición")).not.toBeVisible();

    // 6. Probar botón de silenciar/activar sonido en Navbar
    const soundToggle = page.locator("button[title*='sonido']");
    await expect(soundToggle).toBeVisible();
    await soundToggle.click();

    // 7. Salir mediante "Cambiar de alumno"
    await page.getByRole("button", { name: /Cambiar de alumno/i }).click();
    await expect(page.getByPlaceholder("••••")).toBeVisible();
  });

  test("Acceso directo mediante parámetro URL (?pin=7429)", async ({ page }) => {
    await page.goto("/?pin=7429");

    // Debe cargar directamente el panel del alumno
    await expect(page.getByText("Podio de Honor")).toBeVisible({ timeout: 10000 });
    await expect(page.getByText("Top 10 de Honor")).toBeVisible();
  });

  test("Manejo de PIN incorrecto con feedback de error", async ({ page }) => {
    await page.goto("/");
    const pinInput = page.getByPlaceholder("••••");
    await pinInput.fill("0000");
    await page.getByRole("button", { name: /Acceder a mi Clasificación/i }).click();

    // Verificar que aparece el mensaje de error
    await expect(page.getByText(/Código PIN no válido|incorrecto/i)).toBeVisible();
  });
});
