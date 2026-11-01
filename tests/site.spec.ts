import { test, expect } from "@playwright/test";

for (const width of [320, 375, 390, 768, 1024, 1440]) {
  test(`layout and navigation at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      "POTÊNCIA PARA",
    );
    await page.evaluate(() => document.fonts.ready);
    await expect
      .poll(() =>
        page
          .locator(".hero-image img")
          .evaluate(
            (image: HTMLImageElement) =>
              image.complete && image.naturalWidth > 0,
          ),
      )
      .toBe(true);
    for (const section of [
      "sobre",
      "equipamentos",
      "solucoes",
      "como-funciona",
      "contato",
    ]) {
      await page.locator(`#${section}`).scrollIntoViewIfNeeded();
      const dimensions = await page.evaluate(() => ({
        width: innerWidth,
        document: document.documentElement.scrollWidth,
      }));
      expect(dimensions.document).toBeLessThanOrEqual(dimensions.width);
    }
    if (width < 1001) {
      await page.getByRole("button", { name: "Abrir menu" }).click();
      await expect(
        page.getByRole("button", { name: "Fechar menu" }),
      ).toHaveAttribute("aria-expanded", "true");
      await page
        .locator("#mobile-menu")
        .getByRole("link", { name: "Equipamentos" })
        .click();
      await expect(page.locator("#mobile-menu")).toHaveCount(0);
      await expect(page).toHaveURL(/#equipamentos/);
    } else {
      await expect(page.locator(".desktop-nav")).toBeVisible();
    }
    expect(errors).toEqual([]);
    if (width === 1440 || width === 390) {
      await page.goto("/");
      await page.screenshot({
        path: `test-results/home-${width}.png`,
        fullPage: true,
      });
    }
  });
}

test("catalog filters, accent-insensitive search, empty state, modal and WhatsApp", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/#equipamentos");
  await expect(page.locator(".equipment-card")).toHaveCount(5);
  await page
    .getByRole("button", { name: "Máquinas pesadas", exact: true })
    .click();
  await expect(page.locator(".equipment-card")).toHaveCount(1);
  await expect(page).toHaveURL(/categoria=/);
  await page
    .getByRole("button", { name: "Ver detalhes: Escavadeira hidráulica" })
    .click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole("heading")).toHaveText(
    "Escavadeira hidráulica",
  );
  const link = new URL(
    (await dialog
      .getByRole("link", { name: "Solicitar orçamento" })
      .getAttribute("href"))!,
  );
  expect(link.hostname).toBe("wa.me");
  expect(link.pathname).toBe("/5516992206959");
  expect(link.searchParams.get("text")).toContain("Escavadeira hidráulica");
  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Ver detalhes: Escavadeira hidráulica" }),
  ).toBeFocused();
  await page.getByRole("button", { name: "Todos", exact: true }).click();
  await page.getByRole("searchbox").fill("hidraulica");
  await expect(page.locator(".equipment-card")).toHaveCount(1);
  await page.getByRole("searchbox").fill("xyz-impossivel");
  await expect(page.getByText("Nenhum equipamento encontrado")).toBeVisible();
  await page.getByRole("button", { name: "Limpar filtros" }).click();
  await expect(page.locator(".equipment-card")).toHaveCount(5);
});

test("category campaign entry selects catalog", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/?categoria=Transporte#equipamentos");
  await expect(
    page.getByRole("button", { name: "Transporte", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator(".equipment-card")).toHaveCount(1);
});

test("form validates and formats a message without sending data", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/#contato");
  await page.evaluate(() => {
    (window as unknown as { opened: string[] }).opened = [];
    window.open = ((url: string) => {
      (window as unknown as { opened: string[] }).opened.push(String(url));
      return null;
    }) as typeof window.open;
  });
  await page.getByRole("button", { name: "Enviar pelo WhatsApp" }).click();
  expect(
    await page
      .locator("input[name=name]")
      .evaluate((e: HTMLInputElement) => e.validity.valueMissing),
  ).toBe(true);
  await page.getByLabel("Seu nome").fill("Maria Teste");
  await page.getByLabel("Empresa").fill("Empresa teste");
  await page.getByLabel("Telefone", { exact: false }).fill("(16) 99999-9999");
  await page
    .getByLabel("Equipamento de interesse")
    .selectOption({ label: "Caminhão prancha" });
  await page
    .getByLabel("Sua mensagem")
    .fill("Preciso consultar as condições para meu projeto.");
  await page.getByRole("button", { name: "Enviar pelo WhatsApp" }).click();
  await expect(page.getByRole("status")).toContainText(
    "Nada foi enviado automaticamente",
  );
  const urls = await page.evaluate(
    () => (window as unknown as { opened: string[] }).opened,
  );
  expect(urls).toHaveLength(1);
  const url = new URL(urls[0]);
  expect(url.hostname).toBe("wa.me");
  expect(url.searchParams.get("text")).toContain("Maria Teste");
  expect(url.searchParams.get("text")).toContain("Caminhão prancha");
  await expect(
    page.getByRole("link", { name: "Continuar no WhatsApp" }),
  ).toHaveAttribute("href", urls[0]);
});

test("intro can be skipped and appears once per session", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("button", { name: "Pular introdução" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Pular introdução" }).click();
  await expect(page.locator(".intro")).toHaveCount(0);
  await page.reload();
  await expect(page.locator(".intro")).toHaveCount(0);
});

test("reduced motion skips intro and links target valid destinations", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.locator(".intro")).toHaveCount(0);
  const broken = await page
    .locator('a[href^="#"]')
    .evaluateAll((links) =>
      links
        .filter(
          (link) =>
            !document.getElementById(link.getAttribute("href")!.slice(1)),
        )
        .map((link) => link.getAttribute("href")),
    );
  expect(broken).toEqual([]);
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("link", { name: "Pular para o conteúdo" }),
  ).toBeFocused();
});

test("accessibility of the full page and equipment dialog", async ({
  page,
}) => {
  const { default: AxeBuilder } = await import("@axe-core/playwright");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  // Reveal all sections before auditing their rendered contrast.
  for (const section of [
    "sobre",
    "equipamentos",
    "solucoes",
    "como-funciona",
    "contato",
  ])
    await page.locator(`#${section}`).scrollIntoViewIfNeeded();
  const pageAudit = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(
    pageAudit.violations.map((v) => ({
      id: v.id,
      nodes: v.nodes.map((n) => n.target),
    })),
  ).toEqual([]);
  await page
    .getByRole("button", { name: "Ver detalhes: Caminhão prancha" })
    .click();
  const dialogAudit = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(
    dialogAudit.violations.map((v) => ({
      id: v.id,
      nodes: v.nodes.map((n) => n.target),
    })),
  ).toEqual([]);
});
