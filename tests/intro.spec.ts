import { test, expect } from "@playwright/test";

test("server sends intro before hydration and watchdog unlocks when scripts fail", async ({
  page,
  request,
}) => {
  const response = await request.get("/");
  const html = await response.text();
  expect(html.indexOf('id="clj-intro-bootstrap"')).toBeLessThan(
    html.indexOf("<body"),
  );
  expect(html).toContain('class="intro"');
  await page.route("**/_next/static/**/*.js", (route) => route.abort());
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await expect(page.locator("html")).toHaveAttribute(
    "data-clj-intro",
    "pending",
  );
  const covering = await page.evaluate(() =>
    Boolean(
      document
        .elementFromPoint(innerWidth / 2, innerHeight / 2)
        ?.closest(".intro"),
    ),
  );
  expect(covering).toBe(true);
  expect(
    await page.evaluate(
      () => getComputedStyle(document.documentElement).overflow,
    ),
  ).toBe("hidden");
  await expect(page.locator(".intro")).toBeHidden({ timeout: 3500 });
  await expect(page.locator("html")).toHaveAttribute(
    "data-clj-fallback",
    "true",
  );
  expect(
    await page.evaluate(
      () => getComputedStyle(document.documentElement).overflow,
    ),
  ).not.toBe("hidden");
  expect(
    await page
      .locator(".hero-line")
      .first()
      .evaluate((el) => getComputedStyle(el).transform),
  ).toBe("none");
});

test("repeat session bypasses overlay before hydration", async ({ page }) => {
  await page.addInitScript(() => sessionStorage.setItem("clj-intro", "seen"));
  await page.route("**/_next/static/**/*.js", (route) => route.abort());
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await expect(page.locator("html")).toHaveAttribute("data-clj-intro", "skip");
  await expect(page.locator(".intro")).toBeHidden();
  await expect(page.locator("html")).toHaveAttribute(
    "data-clj-fallback",
    "true",
    { timeout: 3500 },
  );
  expect(
    await page
      .locator(".reveal")
      .first()
      .evaluate((el) => getComputedStyle(el).opacity),
  ).toBe("1");
});

test("without JavaScript content remains readable and overlay does not trap navigation", async ({
  browser,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto("/");
  await expect(page.locator(".intro")).toBeHidden();
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  expect(
    await page
      .locator(".hero-line")
      .first()
      .evaluate((el) => getComputedStyle(el).transform),
  ).toBe("none");
  await context.close();
});

test("phone first frame is the intro and touch skip releases navigation", async ({
  browser,
}) => {
  const context = await browser.newContext({
    viewport: { width: 375, height: 667 },
    isMobile: true,
    hasTouch: true,
  });
  const page = await context.newPage();
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await expect(page.locator(".intro")).toBeVisible();
  expect(
    await page.evaluate(() =>
      Boolean(
        document
          .elementFromPoint(innerWidth / 2, innerHeight / 2)
          ?.closest(".intro"),
      ),
    ),
  ).toBe(true);
  expect(
    await page.evaluate(
      () => getComputedStyle(document.documentElement).overflow,
    ),
  ).toBe("hidden");
  await page.getByRole("button", { name: "Pular introdução" }).tap();
  await expect(page.locator(".intro")).toHaveCount(0);
  await expect(page.locator("html")).toHaveAttribute("data-clj-intro", "skip");
  await page.getByRole("button", { name: "Abrir menu" }).tap();
  await expect(page.locator("#mobile-menu")).toBeVisible();
  await context.close();
});
