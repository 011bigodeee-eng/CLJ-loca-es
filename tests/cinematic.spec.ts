import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => sessionStorage.setItem("clj-intro", "seen"));
});

test("desktop diagonal uses ScrollTrigger and solutions really stick", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await page.locator(".equipment-journey").scrollIntoViewIfNeeded();
  await expect(page.locator(".equipment-journey")).toHaveAttribute(
    "data-motion-ready",
    "true",
  );
  const first = page.locator(".journey-card").first();
  const before = await first.evaluate(
    (element) => getComputedStyle(element).transform,
  );
  await page.evaluate(() => window.scrollBy({ top: 240, behavior: "instant" }));
  await expect
    .poll(() =>
      first.evaluate((element) => getComputedStyle(element).transform),
    )
    .not.toBe(before);
  const panel = page.locator(".solution-panel").first();
  expect(
    await panel.evaluate((element) => getComputedStyle(element).position),
  ).toBe("sticky");
  const stackTop = await page
    .locator(".solutions-stack")
    .evaluate((element) => element.getBoundingClientRect().top + scrollY);
  await page.evaluate(
    (top) => window.scrollTo({ top: top + 150, behavior: "instant" }),
    stackTop,
  );
  await expect
    .poll(() =>
      panel.evaluate((element) =>
        Math.round(element.getBoundingClientRect().top),
      ),
    )
    .toBeLessThan(160);
  await page.evaluate(
    (top) => window.scrollTo({ top: top + 620, behavior: "instant" }),
    stackTop,
  );
  const link = panel.locator("a");
  await link.focus();
  await expect(panel).toHaveCSS("z-index", "5");
  expect(
    await link.evaluate((element) => {
      const box = element.getBoundingClientRect();
      return (
        document
          .elementFromPoint(box.x + box.width / 2, box.y + box.height / 2)
          ?.closest("a") === element
      );
    }),
  ).toBe(true);
});

test("expansive photograph grows on scroll and no fictitious video is requested", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  const videos: string[] = [];
  page.on("request", (request) => {
    if (/\.(mp4|webm)(\?|$)/.test(request.url())) videos.push(request.url());
  });
  await page.goto("/");
  const top = await page
    .locator(".expanding-impact")
    .evaluate((element) => element.getBoundingClientRect().top + scrollY);
  await page.evaluate(
    (y) => window.scrollTo({ top: y - 650, behavior: "instant" }),
    top,
  );
  const before = await page.locator(".impact-frame").boundingBox();
  await page.evaluate(
    (y) => window.scrollTo({ top: y + 150, behavior: "instant" }),
    top,
  );
  await expect
    .poll(
      async () => (await page.locator(".impact-frame").boundingBox())!.width,
    )
    .toBeGreaterThan(before!.width + 80);
  await expect(page.locator(".operation-media video")).toHaveCount(0);
  await expect(page.locator(".operation-media img")).toBeVisible();
  expect(videos).toEqual([]);
});

test("liquid distortion falls back to SVG and stops when the pointer leaves", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (
      this: HTMLCanvasElement,
      kind: string,
      ...args: unknown[]
    ) {
      if (kind === "webgl" || kind === "webgl2") return null;
      return Reflect.apply(original, this, [kind, ...args]);
    } as typeof original;
  });
  await page.goto("/");
  await page.locator(".depth-photo-front").scrollIntoViewIfNeeded();
  await page.locator(".liquid-image-shell").hover();
  await expect(page.locator(".liquid-canvas")).toHaveAttribute(
    "data-renderer",
    "svg-fallback",
  );
  await page.mouse.move(1, 1);
  await expect
    .poll(() =>
      page
        .locator(".liquid-photo")
        .evaluate((element) => getComputedStyle(element).filter),
    )
    .toBe("none");
  await expect(page.locator("feDisplacementMap")).toHaveAttribute("scale", "0");
});

test("touch and reduced motion keep every card readable with static alternatives", async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await page.locator(".equipment-journey").scrollIntoViewIfNeeded();
  await expect(page.locator(".journey-card")).toHaveCount(3);
  for (const card of await page.locator(".journey-card").all()) {
    expect(
      await card.evaluate((element) => getComputedStyle(element).position),
    ).toBe("relative");
    expect(
      await card.evaluate((element) => getComputedStyle(element).transform),
    ).toBe("none");
  }
  await expect(page.locator(".equipment-journey")).not.toHaveAttribute(
    "data-motion-ready",
    "true",
  );
  await page.locator("#equipamentos").scrollIntoViewIfNeeded();
  await expect(
    page.getByRole("button", { name: "Opções de orçamento: Caminhão prancha" }),
  ).toBeVisible();
  await expect(page.locator(".liquid-canvas")).toHaveCSS("display", "none");
  await expect(page.locator(".operation-media video")).toHaveCount(0);
});
