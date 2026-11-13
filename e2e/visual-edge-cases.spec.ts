import { test, expect } from "@playwright/test";

test.describe("Tests de Recovecos y Casos Extremos de UI (Edge Cases)", () => {
  test.beforeEach(async ({ page }) => {
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

  test("Estado Líder (1º Puesto): Tarjeta Dorada y Corona", async ({ page }) => {
    // Interceptar /api/student/view para simular el alumno en Puesto 1
    await page.route("**/api/student/view*", async (route) => {
      const response = await route.fetch();
      const json = await response.json();
      if (json.data) {
        json.data.currentStudent.rank = 1;
        json.data.currentStudent.pointsToNextRank = 0;
        json.data.currentStudent.nextRankTargetName = undefined;
        json.data.currentStudent.nextRankTargetScore = undefined;
        json.data.currentStudent.isInTop10 = true;
      }
      await route.fulfill({ json });
    });

    await page.goto("/?pin=7429");
    await expect(page.getByText("Podio de Honor")).toBeVisible({ timeout: 10000 });

    const modalClose = page.getByRole("button", { name: /¡Entendido, ver clasificación!/i });
    await modalClose.waitFor({ state: "visible", timeout: 4000 }).catch(() => null);
    if (await modalClose.isVisible()) {
      await modalClose.click();
    }

    // Verificar que aparece la tarjeta especial de Líder
    await expect(page.getByText("Líder de la Liga")).toBeVisible();
    await expect(page.getByText(/¡Vas en 1ª Posición! 🏆/i)).toBeVisible();
    await expect(page.getByText(/Defiende la corona/i)).toBeVisible();

    await expect(page).toHaveScreenshot("edge-01-leader-rank1.png", { fullPage: true });
  });

  test("Alumno fuera del Top 10: Fila Privada Flotante/Fijada (#18)", async ({ page }) => {
    await page.route("**/api/student/view*", async (route) => {
      const response = await route.fetch();
      const json = await response.json();
      if (json.data) {
        json.data.currentStudent.rank = 18;
        json.data.currentStudent.isInTop10 = false;
        json.data.currentStudent.pointsToNextRank = 4;
        json.data.currentStudent.nextRankTargetName = "Mateo";
      }
      await route.fulfill({ json });
    });

    await page.goto("/?pin=7429");
    await expect(page.getByText("Podio de Honor")).toBeVisible({ timeout: 10000 });

    const modalClose = page.getByRole("button", { name: /¡Entendido, ver clasificación!/i });
    await modalClose.waitFor({ state: "visible", timeout: 4000 }).catch(() => null);
    if (await modalClose.isVisible()) {
      await modalClose.click();
    }

    // Comprobar la tarjeta privada fijada
    await expect(page.getByText("¡Tu Puesto!")).toBeVisible();
    await expect(page.getByText("#18", { exact: true })).toBeVisible();

    const leaderboard = page.locator("div:has(> div:has-text('Top 10 de Honor'))").first();
    await expect(leaderboard).toHaveScreenshot("edge-02-outside-top10-pinned-card.png");
  });

  test("Texto Extremo: Nombre largo sin desbordar ni romper el layout", async ({ page }) => {
    await page.route("**/api/student/view*", async (route) => {
      const response = await route.fetch();
      const json = await response.json();
      if (json.data) {
        json.data.currentStudent.name = "María del Carmen de los Ángeles Rodríguez";
        if (json.data.top10[1]) {
          json.data.top10[1].name = "Maximiliano Alejandro von Hohenzollern";
        }
      }
      await route.fulfill({ json });
    });

    await page.goto("/?pin=7429");
    await expect(page.getByText("Podio de Honor")).toBeVisible({ timeout: 10000 });

    const modalClose = page.getByRole("button", { name: /¡Entendido, ver clasificación!/i });
    await modalClose.waitFor({ state: "visible", timeout: 4000 }).catch(() => null);
    if (await modalClose.isVisible()) {
      await modalClose.click();
    }

    // Validar que la tabla y el podio contienen los textos sin scroll horizontal del body
    const bodyScrollWidth = await page.evaluate(() => document.body.scrollWidth);
    const windowWidth = await page.evaluate(() => window.innerWidth);
    expect(bodyScrollWidth).toBeLessThanOrEqual(windowWidth + 5);

    await expect(page).toHaveScreenshot("edge-03-long-text-overflow.png", { fullPage: true });
  });

  test("Admin Dashboard: Alternancia entre vista Tarjetas y vista Tabla", async ({ page }) => {
    await page.goto("/");
    const teacherBtn = page.getByTitle(/Vista Profesora/i).or(page.getByRole("button", { name: /Profe/i }));
    await teacherBtn.click();

    const adminPinInput = page.locator("input[type='password']");
    await adminPinInput.fill("piano1234");
    await page.getByRole("button", { name: /Acceder al Panel/i }).click();

    const main = page.locator("main");
    await expect(main.getByRole("button", { name: "Notas", exact: true })).toBeVisible();

    // Cambiar a vista Tabla
    const tableViewBtn = page.getByRole("button", { name: /Tabla/i });
    if (await tableViewBtn.isVisible()) {
      await tableViewBtn.click();
      await expect(page.locator("table")).toBeVisible();
      await expect(page).toHaveScreenshot("edge-04-admin-table-view.png");

      // Volver a vista Tarjetas
      const cardsViewBtn = page.getByRole("button", { name: /Tarjetas/i });
      await cardsViewBtn.click();
      await expect(page).toHaveScreenshot("edge-05-admin-cards-view.png");
    }
  });
});
