import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";
import sharp from "sharp";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const output = path.join(root, "artifacts/visual");
const url = process.env.VISUAL_BASE_URL ?? "http://127.0.0.1:3000";

async function pixels(image) {
  return sharp(image).resize(160, 90, { fit: "fill" }).removeAlpha().raw().toBuffer();
}

function difference(first, second) {
  let sum = 0;
  for (let index = 0; index < first.length; index += 1) {
    sum += Math.abs(first[index] - second[index]);
  }
  return sum / first.length;
}

const browser = await chromium.launch({
  headless: true,
  args: ["--use-gl=angle", "--use-angle=swiftshader"],
});

try {
  await mkdir(output, { recursive: true });
  for (const { name, width, height } of [
    { name: "desktop", width: 1440, height: 900 },
    { name: "tablet", width: 1024, height: 768 },
    { name: "small-tablet", width: 820, height: 900 },
    { name: "mobile", width: 390, height: 844 },
    { name: "short-mobile", width: 390, height: 667 },
    { name: "narrow", width: 320, height: 568 },
  ]) {
    const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto(url, { waitUntil: "networkidle" });
    const hero = page.locator("#top");
    const heroImage = hero.locator("img");
    await heroImage.evaluate((image) => image.decode());
    assert.equal(await heroImage.evaluate((image) => getComputedStyle(image).objectFit), "contain");
    assert.equal(await heroImage.evaluate((image) => image.naturalWidth), 1254);
    const heroLayout = await page.evaluate(() => ({
      nextSection: document.querySelector("#approach").getBoundingClientRect().top,
      leadBottom: document.querySelector("#top p:nth-of-type(2)").getBoundingClientRect().bottom,
      visualTop: document.querySelector("#top div").getBoundingClientRect().top,
    }));
    assert.ok(heroLayout.nextSection < height, `${name}: no next-section preview`);
    if (width <= 960) {
      assert.ok(heroLayout.leadBottom <= heroLayout.visualTop + 8, `${name}: hero copy overlaps the installation`);
    }
    await hero.screenshot({ path: path.join(output, `${name}-hero.png`) });

    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
    assert.ok(overflow <= 1, `${name}: horizontal overflow ${overflow}px`);

    if (width <= 860) {
      await page.getByRole("button", { name: "Открыть меню" }).click();
      await page.getByRole("navigation", { name: "Мобильная навигация" }).getByText("Линия в движении").click();
      assert.equal(new URL(page.url()).hash, "#scene");
    }

    await page.locator("#scene").scrollIntoViewIfNeeded();
    const canvas = page.locator("#scene canvas");
    await canvas.waitFor({ state: "visible", timeout: 20000 });
    await canvas.scrollIntoViewIfNeeded();
    await page.waitForTimeout(800);
    assert.equal(await page.locator("#scene [data-running]").getAttribute("data-running"), "true");
    const first = await canvas.screenshot({ path: path.join(output, `${name}-scene.png`) });
    const stats = await sharp(first).stats();
    const variation = stats.channels.slice(0, 3).reduce((sum, channel) => sum + channel.stdev, 0);
    assert.ok(variation > 25, `${name}: blank canvas, RGB variation ${variation.toFixed(1)}`);

    const second = await canvas.screenshot();
    await page.waitForTimeout(800);
    const third = await canvas.screenshot();
    const movement = difference(await pixels(second), await pixels(third));
    assert.ok(movement > 0.02, `${name}: scene did not animate (${movement.toFixed(3)})`);

    await page.getByRole("button", { name: "Формование" }).click();
    assert.equal(await page.getByRole("button", { name: "Формование" }).getAttribute("aria-pressed"), "true");
    await page.getByRole("button", { name: "Остановить анимацию" }).click();
    await page.waitForTimeout(250);
    const paused = await pixels(await canvas.screenshot());
    await page.waitForTimeout(500);
    const still = await pixels(await canvas.screenshot());
    const pauseDifference = difference(paused, still);
    assert.ok(pauseDifference < 0.05, `${name}: pause still moves (${pauseDifference.toFixed(3)})`);
    assert.deepEqual(errors, [], `${name}: browser errors`);
    await page.locator("#scene").screenshot({ path: path.join(output, `${name}-feature.png`) });
    if (name === "desktop") {
      const box = await canvas.boundingBox();
      assert.ok(box, "desktop: canvas bounds unavailable");
      await page.mouse.move(box.x + box.width * 0.5, box.y + box.height * 0.5);
      await page.mouse.down();
      await page.mouse.move(box.x + box.width * 0.65, box.y + box.height * 0.55, { steps: 12 });
      await page.mouse.up();
      await page.waitForTimeout(250);
      const rotated = await pixels(await canvas.screenshot());
      assert.ok(difference(still, rotated) > 0.1, "desktop: orbit control did not respond");
    }
    await page.screenshot({ path: path.join(output, `${name}-page.png`), fullPage: name !== "narrow" });
    await page.evaluate(() => scrollTo(0, 0));
    await page.waitForTimeout(500);
    assert.equal(await page.locator("#scene [data-running]").getAttribute("data-running"), "false");
    console.log(`${name}: canvas variation=${variation.toFixed(1)}, movement=${movement.toFixed(3)}, pause=${pauseDifference.toFixed(3)}, overflow=${overflow}`);
    await page.close();
  }

  const reduced = await browser.newPage({ reducedMotion: "reduce", viewport: { width: 960, height: 720 } });
  await reduced.goto(url, { waitUntil: "networkidle" });
  await reduced.locator("#scene").scrollIntoViewIfNeeded();
  await reduced.locator("#scene canvas").waitFor({ state: "visible" });
  assert.equal(await reduced.getByRole("button", { name: "Запустить анимацию" }).getAttribute("aria-pressed"), "false");
  assert.equal(await reduced.locator("#scene [data-running]").getAttribute("data-running"), "false");
  await reduced.close();
} finally {
  await browser.close();
}
