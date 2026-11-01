import { test, expect } from "@playwright/test";
const names = [
  "Transporte",
  "Locação de Equipamentos",
  "Movimentação de Cargas",
  "Apoio Operacional",
];
const ids = [
  "transporte",
  "locacao-equipamentos",
  "movimentacao-cargas",
  "apoio-operacional",
];

test("the four real areas appear immediately after About and before the equipment catalog", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  expect(
    await page.locator("#sobre").evaluate((el) => el.nextElementSibling?.id),
  ).toBe("solucoes");
  expect(
    await page.locator("#solucoes").evaluate((el) => el.nextElementSibling?.id),
  ).toBe("equipamentos");
  await expect(page.locator(".service-overview-card")).toHaveCount(4);
  expect(
    await page.locator(".service-overview-card h3").allTextContents(),
  ).toEqual(names);
  await expect(page.locator(".equipment-card")).toHaveCount(5);
  await expect(page.locator(".catalog-disclaimer")).toContainText(
    "não representam a frota",
  );
  expect(
    await page
      .locator(".service-overview-grid")
      .evaluate(
        (el) => getComputedStyle(el).gridTemplateColumns.split(" ").length,
      ),
  ).toBe(4);
});

test("service quotes carry their subject and every quote link goes to WhatsApp", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  for (let index = 0; index < 4; index++) {
    const card = page.locator(`[data-service-id="${ids[index]}"]`);
    const link = card.getByRole("link", { name: "Solicitar orçamento" });
    const target = new URL((await link.getAttribute("href"))!);
    expect(target.hostname).toBe("wa.me");
    expect(target.pathname).toBe("/5516992206959");
    expect(target.searchParams.get("text")).toBe(
      `Olá! Conheci o site da CLJ e gostaria de solicitar um orçamento para ${names[index]}.`,
    );
    await expect(link).toHaveAttribute("target", "_blank");
    await expect(link).toHaveAttribute("rel", /noopener/);
    await expect(card.locator(".service-image-notice")).toContainText(
      "ILUSTRATIVA",
    );
  }
  for (const link of await page
    .getByRole("link", { name: "Solicitar orçamento", exact: true })
    .all())
    expect(new URL((await link.getAttribute("href"))!).hostname).toBe("wa.me");
  for (const id of ["transporte", "movimentacao-cargas", "apoio-operacional"]) {
    const panel = page.locator(`#${id}`);
    await expect(panel.getByRole("heading")).toHaveText(names[ids.indexOf(id)]);
    await expect(
      panel.getByRole("link", { name: "Solicitar orçamento" }),
    ).toHaveAttribute("href", /^https:\/\/wa.me\/5516992206959/);
  }
});

test("service detail anchors and local intent preserve service identity", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/#solucoes");
  await page
    .getByRole("link", { name: "Conhecer Transporte", exact: true })
    .click();
  await expect(page).toHaveURL(/#transporte$/);
  await expect(page.locator(".desktop-nav .active")).toHaveText("Soluções");
  await page.evaluate(() => {
    (window as unknown as { intent: unknown }).intent = null;
    window.addEventListener("clj:conversion", (event) => {
      (window as unknown as { intent: unknown }).intent = (
        event as CustomEvent
      ).detail;
    });
    document
      .querySelector('[data-service-id="transporte"] .service-quote')!
      .addEventListener("click", (event) => event.preventDefault());
  });
  await page.locator('[data-service-id="transporte"] .service-quote').click();
  const detail = await page.evaluate(
    () =>
      (
        window as unknown as {
          intent: { serviceId: string; equipmentId?: string };
        }
      ).intent,
  );
  expect(detail.serviceId).toBe("transporte");
  expect(detail.equipmentId).toBeUndefined();
});

test("contact form accepts a service without pretending the message was sent", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/#contato");
  await page.evaluate(() => {
    (window as unknown as { opened: string }).opened = "";
    window.open = ((url: string) => {
      (window as unknown as { opened: string }).opened = String(url);
      return null;
    }) as typeof window.open;
  });
  await page.getByLabel("Seu nome").fill("Joubert Teste");
  await page.getByLabel("Telefone", { exact: false }).fill("(16) 99999-9999");
  await page
    .getByLabel("Serviço ou equipamento de interesse")
    .selectOption({ label: "Movimentação de Cargas" });
  await page
    .getByLabel("Sua mensagem")
    .fill("Gostaria de conversar sobre a minha necessidade.");
  await page.getByRole("button", { name: "Enviar pelo WhatsApp" }).click();
  const url = new URL(
    await page.evaluate(() => (window as unknown as { opened: string }).opened),
  );
  expect(url.searchParams.get("text")).toContain("Movimentação de Cargas");
  await expect(page.getByRole("status")).toContainText(
    "Nada foi enviado automaticamente",
  );
});

for (const width of [360, 375, 390, 430]) {
  test(`the four service cards remain readable at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 844 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(message.text());
    });
    await page.goto("/#solucoes");
    for (const id of ids) {
      const card = page.locator(`[data-service-id="${id}"]`);
      await card.scrollIntoViewIfNeeded();
      await expect(card).toHaveCSS("opacity", "1");
      await expect(card.getByRole("heading")).toBeVisible();
      await expect(
        card.getByRole("link", { name: "Solicitar orçamento" }),
      ).toBeVisible();
      await expect
        .poll(() =>
          card
            .locator("img")
            .evaluate(
              (img: HTMLImageElement) => img.complete && img.naturalWidth > 0,
            ),
        )
        .toBe(true);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
    }
    expect(errors).toEqual([]);
  });
}
