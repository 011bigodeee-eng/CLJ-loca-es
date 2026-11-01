import { test, expect } from "@playwright/test";
import { existsSync } from "node:fs";

test("real liquid shader compiles and releases its GPU context after the pulse", async ({
  playwright,
  baseURL,
}) => {
  const browser = await playwright.chromium.launch({
    executablePath:
      process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH ||
      (existsSync("/usr/bin/chromium") ? "/usr/bin/chromium" : undefined),
    args: [
      "--no-sandbox",
      "--use-angle=swiftshader",
      "--enable-unsafe-swiftshader",
    ],
  });
  try {
    const page = await browser.newPage({
      viewport: { width: 1440, height: 900 },
    });
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.addInitScript(() => sessionStorage.setItem("clj-intro", "seen"));
    await page.goto(baseURL!);
    await page.locator(".depth-photo-front").scrollIntoViewIfNeeded();
    await page.locator(".liquid-image-shell").hover();
    await expect(page.locator(".liquid-canvas")).toHaveAttribute(
      "data-renderer",
      "webgl",
    );
    await expect(page.locator(".liquid-canvas")).toHaveCSS("opacity", "0");
    expect(
      await page
        .locator(".liquid-canvas")
        .evaluate((canvas: HTMLCanvasElement) =>
          canvas.getContext("webgl")?.isContextLost(),
        ),
    ).toBe(true);
    expect(errors).toEqual([]);
  } finally {
    await browser.close();
  }
});
