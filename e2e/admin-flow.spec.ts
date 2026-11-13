import { test, expect } from "@playwright/test";

test.describe("Flujo Completo de la Profesora / Administradora (E2E)", () => {
  test("Autenticación, navegación por pestañas y gestión de concurso", async ({ page }) => {
    await page.goto("/");

    // 1. Cambiar a modo Profesora en la Navbar
    const teacherBtn = page.getByTitle(/Vista Profesora/i).or(page.getByRole("button", { name: /Profe/i }));
    await expect(teacherBtn).toBeVisible();
    await teacherBtn.click();

    // 2. Comprobar pantalla de autenticación de Profesora
    await expect(page.getByText("PANEL DE PROFESORA")).toBeVisible();
    const adminPinInput = page.locator("input[type='password']");
    await expect(adminPinInput).toBeVisible();

    // 3. Probar PIN erróneo
    await adminPinInput.fill("wrongpin");
    await page.getByRole("button", { name: /Acceder al Panel/i }).click();
    await expect(page.getByText(/PIN incorrecto|PIN de profesora incorrecto/i)).toBeVisible();

    // 4. Probar PIN correcto ("piano1234")
    await adminPinInput.fill("piano1234");
    await page.getByRole("button", { name: /Acceder al Panel/i }).click();

    // 5. Verificar que carga el panel con las 4 pestañas en main
    const main = page.locator("main");
    await expect(main.getByRole("button", { name: "Notas", exact: true })).toBeVisible();
    await expect(main.getByRole("button", { name: "Ranking", exact: true })).toBeVisible();
    await expect(main.getByRole("button", { name: "Alumnos", exact: true })).toBeVisible();
    await expect(main.getByRole("button", { name: "Ajustes", exact: true })).toBeVisible();

    // 6. Navegar a pestaña Ranking
    await main.getByRole("button", { name: "Ranking", exact: true }).click();
    await expect(page.getByText(/Clasificación General/i).first()).toBeVisible();

    // 7. Navegar a pestaña Alumnos
    await main.getByRole("button", { name: "Alumnos", exact: true }).click();
    await expect(page.getByText("Nuevo Alumno")).toBeVisible();

    // 8. Navegar a pestaña Ajustes
    await main.getByRole("button", { name: "Ajustes", exact: true }).click();
    await expect(page.getByText("Configuración de LA LIGA DEL PIANISTA")).toBeVisible();

    // 9. Volver a pestaña Notas
    await main.getByRole("button", { name: "Notas", exact: true }).click();
    await expect(page.getByRole("heading", { name: /Semana \d+/i })).toBeVisible();

    // 10. Probar cierre de sesión de administración (vuelve a la vista de alumno)
    const logoutBtn = page.getByTitle(/Cerrar sesión/i).filter({ visible: true }).first();
    await logoutBtn.click();
    await expect(page.getByText("LA LIGA DEL PIANISTA 🎹")).toBeVisible();
  });
});
