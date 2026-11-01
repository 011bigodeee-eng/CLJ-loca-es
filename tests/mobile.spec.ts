import { test, expect } from "@playwright/test";

test.use({ hasTouch: true, isMobile: true, deviceScaleFactor: 2 });
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => sessionStorage.setItem("clj-intro", "seen"));
});

for (const [name, width, height] of [
  ["SE", 375, 667],
  ["13-14", 390, 844],
  ["Pro-Max", 430, 932],
  ["Android", 360, 800],
] as const) {
  test(`smartphone composition ${name} ${width}px`, async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(message.text());
    });
    await page.setViewportSize({ width, height });
    await page.goto("/");
    await expect(page.locator("#site-content")).toHaveAttribute(
      "data-mobile-motion",
      "active",
    );
    await page.evaluate(() => document.fonts.ready);
    const hero = await page.locator(".hero").boundingBox();
    expect(hero!.height).toBeLessThanOrEqual(Math.min(height, 740) + 1);
    const font = await page
      .locator(".hero h1")
      .evaluate((el) => parseFloat(getComputedStyle(el).fontSize));
    expect(font).toBeGreaterThanOrEqual(38);
    expect(font).toBeLessThanOrEqual(54);
    const title = await page.locator(".hero h1").boundingBox();
    expect(title!.height).toBeLessThan(height * 0.27);
    const image = await page.locator(".hero-image").boundingBox();
    expect(image!.y).toBeLessThan(100);
    expect(image!.height).toBeGreaterThan(hero!.height * 0.7);
    const buttons = await page.locator(".hero-actions a").all();
    const first = await buttons[0].boundingBox();
    const second = await buttons[1].boundingBox();
    expect(Math.abs(first!.y - second!.y)).toBeLessThan(1);
    for (const button of buttons) {
      const bounds = await button.boundingBox();
      expect(bounds!.height).toBeGreaterThanOrEqual(48);
      expect(bounds!.height).toBeLessThanOrEqual(54);
      expect(bounds!.width).toBeLessThan(width * 0.52);
    }
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
    const source = await page
      .locator(".hero-image img")
      .evaluate((image: HTMLImageElement) =>
        new URL(image.currentSrc).searchParams.get("w"),
      );
    expect(Number(source)).toBeGreaterThanOrEqual(1080);
    await page.getByRole("button", { name: "Abrir menu" }).tap();
    await page
      .locator("#mobile-menu")
      .getByRole("link", { name: "Equipamentos" })
      .tap();
    await expect(page.locator("#mobile-menu")).toHaveCount(0);
    for (const selector of [
      ".depth-showcase",
      "#equipamentos",
      ".equipment-journey",
      "#solucoes",
      ".expanding-impact",
      "#contato",
    ]) {
      await page.locator(selector).scrollIntoViewIfNeeded();
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
    }
    expect(errors).toEqual([]);
  });
}

test("phone scroll drives depth, liquid mask, diagonal cards and image expansion", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    (window as unknown as { webglCalls: number }).webglCalls = 0;
    HTMLCanvasElement.prototype.getContext = function (
      this: HTMLCanvasElement,
      kind: string,
      ...args: unknown[]
    ) {
      if (kind.startsWith("webgl"))
        (window as unknown as { webglCalls: number }).webglCalls++;
      return Reflect.apply(original, this, [kind, ...args]);
    } as typeof original;
  });
  await page.goto("/");
  await expect(page.locator("#site-content")).toHaveAttribute(
    "data-mobile-motion",
    "active",
  );
  const about = page.locator(".about-image");
  await about.scrollIntoViewIfNeeded();
  await expect(about).toHaveCSS("opacity", "1");
  await expect(about).toHaveAttribute("data-revealed", "true");
  await expect
    .poll(() => about.evaluate((el) => getComputedStyle(el).clipPath))
    .toMatch(/inset\(0/);
  const front = page.locator(".depth-photo-front");
  const top = await front.evaluate(
    (el) => el.getBoundingClientRect().top + scrollY,
  );
  await page.evaluate(
    (y) => scrollTo({ top: y - innerHeight * 0.9, behavior: "instant" }),
    top,
  );
  await expect(page.locator("[data-mobile-liquid=active]")).toBeVisible();
  const wave = page.locator(".liquid-filter-defs clipPath path");
  const before = await wave.getAttribute("d");
  const depth = await front.evaluate((el) => getComputedStyle(el).transform);
  await page.evaluate(() => scrollBy({ top: 240, behavior: "instant" }));
  await expect.poll(() => wave.getAttribute("d")).not.toBe(before);
  await expect
    .poll(() => front.evaluate((el) => getComputedStyle(el).transform))
    .not.toBe(depth);
  const card = page.locator(".journey-card").first();
  await card.scrollIntoViewIfNeeded();
  const diagonal = await card.evaluate((el) => getComputedStyle(el).transform);
  await page.evaluate(() => scrollBy({ top: 170, behavior: "instant" }));
  await expect
    .poll(() => card.evaluate((el) => getComputedStyle(el).transform))
    .not.toBe(diagonal);
  expect(await card.evaluate((el) => getComputedStyle(el).position)).toBe(
    "sticky",
  );
  const impactTop = await page
    .locator(".expanding-impact")
    .evaluate((el) => el.getBoundingClientRect().top + scrollY);
  await page.evaluate(
    (y) => scrollTo({ top: y - innerHeight * 0.83, behavior: "instant" }),
    impactTop,
  );
  const width = (await page.locator(".impact-frame").boundingBox())!.width;
  const radius = await page
    .locator(".impact-frame")
    .evaluate((el) => parseFloat(getComputedStyle(el).borderTopLeftRadius));
  await page.evaluate(
    (y) => scrollTo({ top: y + 150, behavior: "instant" }),
    impactTop,
  );
  await expect
    .poll(
      async () => (await page.locator(".impact-frame").boundingBox())!.width,
    )
    .toBeGreaterThan(width + 35);
  expect(
    await page
      .locator(".impact-frame")
      .evaluate((el) => parseFloat(getComputedStyle(el).borderTopLeftRadius)),
  ).toBeLessThan(radius);
  expect(
    await page.evaluate(
      () => (window as unknown as { webglCalls: number }).webglCalls,
    ),
  ).toBe(0);
});

test("touch options expose an equipment-specific WhatsApp link and preserve the modal", async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto("/#equipamentos");
  const card = page.locator(".equipment-card").first();
  await expect(card.getByRole("heading")).toHaveText("Caminhão prancha");
  const toggle = card.getByRole("button", {
    name: "Opções de orçamento: Caminhão prancha",
  });
  await toggle.tap();
  await expect(toggle).toHaveAttribute("aria-expanded", "true");
  const link = card
    .locator(".mobile-quote-options")
    .getByRole("link", { name: "Solicitar orçamento" });
  await expect(link).toBeVisible();
  const target = new URL((await link.getAttribute("href"))!);
  expect(target.hostname).toBe("wa.me");
  expect(target.searchParams.get("text")).toContain("Caminhão prancha");
  await toggle.tap();
  await expect(toggle).toHaveAttribute("aria-expanded", "false");
  await expect(card.locator(".mobile-quote-options")).toHaveCount(0);
  await card
    .getByRole("button", { name: "Ver detalhes: Caminhão prancha" })
    .tap();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.getByRole("button", { name: "Fechar detalhes" }).tap();
  await expect(page.getByRole("dialog")).toHaveCount(0);
});

test("mobile stacked panels keep a focused action exposed and release normal scrolling", async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto("/");
  await expect(page.locator("#site-content")).toHaveAttribute(
    "data-mobile-motion",
    "active",
  );
  const stack = await page
    .locator(".solutions-stack")
    .evaluate((el) => el.getBoundingClientRect().top + scrollY);
  await page.evaluate(
    (y) => scrollTo({ top: y + 550, behavior: "instant" }),
    stack,
  );
  const panel = page.locator(".solution-panel").first();
  expect(await panel.evaluate((el) => getComputedStyle(el).position)).toBe(
    "sticky",
  );
  const action = panel.locator("a");
  await action.focus();
  expect(
    await action.evaluate((el) => {
      const b = el.getBoundingClientRect();
      return (
        document
          .elementFromPoint(b.x + b.width / 2, b.y + b.height / 2)
          ?.closest("a") === el
      );
    }),
  ).toBe(true);
  await page.locator("#contato").scrollIntoViewIfNeeded();
  await expect(page.getByLabel("Seu nome")).toBeVisible();
  await page.getByLabel("Seu nome").focus();
});

test("rotation and layout changes recalculate mobile motion without horizontal scrolling", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await expect(page.locator("#site-content")).toHaveAttribute(
    "data-mobile-motion",
    "active",
  );
  await page.setViewportSize({ width: 844, height: 390 });
  await page.locator("#solucoes").scrollIntoViewIfNeeded();
  expect(
    await page
      .locator(".solution-panel")
      .first()
      .evaluate((el) => getComputedStyle(el).position),
  ).toBe("relative");
  await page.setViewportSize({ width: 768, height: 1024 });
  await expect(page.locator("#site-content")).toHaveAttribute(
    "data-mobile-motion",
    "active",
  );
  await page.locator(".expanding-impact").scrollIntoViewIfNeeded();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.setViewportSize({ width: 1440, height: 900 });
  await expect(page.locator("#site-content")).not.toHaveAttribute(
    "data-mobile-motion",
    "active",
  );
  await expect(page.locator(".mobile-card-actions").first()).toBeHidden();
});

test("reduced motion and modest devices retain static images and touch functionality", async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await page.addInitScript(() =>
    Object.defineProperty(navigator, "deviceMemory", { get: () => 1 }),
  );
  await page.goto("/");
  await expect(page.locator("#site-content")).toHaveAttribute(
    "data-mobile-motion",
    "static",
  );
  await expect(page.locator("[data-mobile-liquid=active]")).toHaveCount(0);
  expect(
    await page
      .locator(".journey-card")
      .first()
      .evaluate((el) => getComputedStyle(el).transform),
  ).toBe("none");
  expect(
    await page
      .locator(".solution-panel")
      .first()
      .evaluate((el) => getComputedStyle(el).position),
  ).toBe("relative");
  await page
    .getByRole("button", { name: "Opções de orçamento: Caminhão prancha" })
    .tap();
  await expect(page.locator(".mobile-quote-options")).toBeVisible();
});
