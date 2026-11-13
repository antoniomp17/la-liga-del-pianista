import { test, expect } from "@playwright/test";

test.describe("Tests Exhaustivos Extremos de Visualización (UI)", () => {
  test.beforeEach(async ({ page }) => {
    // Desactivar animaciones CSS y transiciones para screenshots deterministas
    await page.addStyleTag({
      content: `
        *, *::before, *::after {
          animation-duration: 0s !important;
          animation-delay: 0s !important;
          transition-duration: 0s !important;
          transition-delay: 0s !important;
        }
      `,
    });
  });

  test("Pantalla de Acceso Alumno: Estado Inicial y Estado de Error", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("LA LIGA DEL PIANISTA 🎹")).toBeVisible();

    // Snapshot de la pantalla de login vacía
    await expect(page).toHaveScreenshot("01-student-login-empty.png", { fullPage: true });

    // Rellenar con PIN incorrecto y validar render de error
    const pinInput = page.getByPlaceholder("••••");
    await pinInput.fill("0000");
    await page.getByRole("button", { name: /Acceder a mi Clasificación/i }).click();

    await expect(page.getByText(/Código PIN no válido|incorrecto/i)).toBeVisible();
    await expect(page).toHaveScreenshot("02-student-login-error.png", { fullPage: true });
  });

  test("Dashboard Completo del Alumno (Podio, Clasificación, Puntos y Frentes)", async ({ page }) => {
    // Acceso con PIN de Clara Schumann (7429)
    await page.goto("/?pin=7429");

    // Esperar a que cargue el dashboard
    await expect(page.getByText("Podio de Honor")).toBeVisible({ timeout: 10000 });

    // Cerrar el modal de bienvenida/notificación si está abierto
    const modalClose = page.getByRole("button", { name: /¡Entendido, ver clasificación!/i });
    await modalClose.waitFor({ state: "visible", timeout: 6000 }).catch(() => null);
    if (await modalClose.isVisible()) {
      await modalClose.click();
      await modalClose.waitFor({ state: "hidden", timeout: 4000 }).catch(() => null);
    }

    // Screenshot del dashboard completo del alumno
    await expect(page).toHaveScreenshot("03-student-dashboard-full.png", { fullPage: true });

    // Snapshots de componentes críticos aislados
    const podium = page.locator("div:has(> div:has-text('Podio de Honor'))").first();
    if (await podium.isVisible()) {
      await expect(podium).toHaveScreenshot("04-podium-component.png");
    }

    const leaderboard = page.locator("div:has(> div:has-text('Top 10 de Honor'))").first();
    if (await leaderboard.isVisible()) {
      await expect(leaderboard).toHaveScreenshot("05-leaderboard-component.png");
    }

    const testCards = page.locator("div:has(> div:has-text('Tu Puntuación en los Frentes Oficiales'))").first();
    if (await testCards.isVisible()) {
      await expect(testCards).toHaveScreenshot("06-test-cards-component.png");
    }
  });

  test("Modal de Bases Oficiales y Calendario Anual (Pestañas 1 y 2)", async ({ page }) => {
    await page.goto("/?pin=7429");
    await expect(page.getByText("Podio de Honor")).toBeVisible({ timeout: 10000 });

    const modalClose = page.getByRole("button", { name: /¡Entendido, ver clasificación!/i });
    await modalClose.waitFor({ state: "visible", timeout: 6000 }).catch(() => null);
    if (await modalClose.isVisible()) {
      await modalClose.click();
      await modalClose.waitFor({ state: "hidden", timeout: 4000 }).catch(() => null);
    }

    // Abrir Modal de Bases & Calendario
    await page.getByRole("button", { name: /Reglamento & Calendario/i }).click();
    await expect(page.getByText("Bases Oficiales & Calendario de Competición")).toBeVisible();

    // Screenshot de Tab 1: Fuentes de Puntos
    await expect(page).toHaveScreenshot("07-modal-bases-tab.png");

    // Cambiar a Tab 2: Calendario (27 Sem)
    await page.getByText(/2\. Calendario/i).click();
    await expect(page.getByText(/Calendario oficial/i)).toBeVisible();

    // Screenshot de Tab 2: Calendario
    await expect(page).toHaveScreenshot("08-modal-calendar-tab.png");
  });

  test("Panel de Profesora / Administradora (Login y Pestañas)", async ({ page }) => {
    await page.goto("/");
    const teacherBtn = page.getByTitle(/Vista Profesora/i).or(page.getByRole("button", { name: /Profe/i }));
    await teacherBtn.click();

    await expect(page.getByText("PANEL DE PROFESORA")).toBeVisible();
    await expect(page).toHaveScreenshot("09-admin-login.png");

    // Iniciar sesión
    const adminPinInput = page.locator("input[type='password']");
    await adminPinInput.fill("piano1234");
    await page.getByRole("button", { name: /Acceder al Panel/i }).click();

    const main = page.locator("main");
    await expect(main.getByRole("button", { name: "Notas", exact: true })).toBeVisible();

    // Screenshot de Pestaña Notas
    await expect(page).toHaveScreenshot("10-admin-scores-tab.png", { fullPage: true });

    // Pestaña Ranking
    await main.getByRole("button", { name: "Ranking", exact: true }).click();
    await expect(page).toHaveScreenshot("11-admin-ranking-tab.png", { fullPage: true });

    // Pestaña Alumnos
    await main.getByRole("button", { name: "Alumnos", exact: true }).click();
    await expect(page).toHaveScreenshot("12-admin-students-tab.png", { fullPage: true });

    // Pestaña Ajustes
    await main.getByRole("button", { name: "Ajustes", exact: true }).click();
    await expect(page).toHaveScreenshot("13-admin-settings-tab.png", { fullPage: true });
  });
});
