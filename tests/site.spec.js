import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const prepareImages = async (page) => {
  await page.locator('img').evaluateAll((images) => {
    images.forEach((image) => {
      image.loading = 'eager';
    });
  });

  const viewport = page.viewportSize();
  const height = await page.evaluate(() => document.documentElement.scrollHeight);
  const step = Math.max(320, Math.floor((viewport?.height || 800) * 0.72));
  for (let y = 0; y < height; y += step) {
    await page.evaluate((position) => window.scrollTo(0, position), y);
    await page.waitForTimeout(35);
  }

  await page.waitForFunction(
    () => [...document.images].every((image) => image.complete),
    undefined,
    { timeout: 15_000 },
  );
  await page.locator('img').evaluateAll(async (images) => {
    await Promise.all(images.map((image) => image.decode?.().catch(() => undefined)));
  });
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(850);
};

test('renders the complete site without runtime or responsive failures', async ({ page }, testInfo) => {
  const pageErrors = [];
  const consoleErrors = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });

  const response = await page.goto('/', { waitUntil: 'networkidle' });
  expect(response?.status()).toBe(200);
  await expect(page).toHaveTitle(/Tailored Europe DMC/);
  await expect(page.getByRole('heading', { level: 1, name: /Europe,\s*made personal/i })).toBeVisible();
  await expect(page.locator('.hero-intro strong')).toHaveText('No standard packages.');

  await prepareImages(page);

  const brokenImages = await page.locator('img').evaluateAll((images) =>
    images.filter((image) => image.naturalWidth === 0).map((image) => image.currentSrc),
  );
  expect(brokenImages).toEqual([]);

  const overflow = await page.evaluate(() => ({
    viewport: document.documentElement.clientWidth,
    body: document.body.scrollWidth,
    root: document.documentElement.scrollWidth,
  }));
  expect(overflow.body).toBeLessThanOrEqual(overflow.viewport + 1);
  expect(overflow.root).toBeLessThanOrEqual(overflow.viewport + 1);

  const missingAnchors = await page.locator('a[href^="#"]').evaluateAll((links) =>
    links
      .map((link) => link.getAttribute('href'))
      .filter((href) => href && href !== '#' && !document.querySelector(href)),
  );
  expect(missingAnchors).toEqual([]);

  if ((page.viewportSize()?.width || 1000) <= 900) {
    const menuButton = page.locator('[data-menu-toggle]');
    await menuButton.click();
    await expect(menuButton).toHaveAttribute('aria-expanded', 'true');
    await expect(page.getByRole('navigation', { name: 'Primary navigation' })).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('navigation', { name: 'Primary navigation' })).toBeHidden();
  }

  const accessibility = await new AxeBuilder({ page }).analyze();
  const seriousViolations = accessibility.violations.filter(({ impact }) =>
    impact === 'serious' || impact === 'critical',
  );
  expect(seriousViolations, JSON.stringify(seriousViolations, null, 2)).toEqual([]);

  await page.evaluate(() => document.activeElement?.blur());
  await page.screenshot({ path: testInfo.outputPath('tailored-europe-full.png'), fullPage: true });

  expect(pageErrors).toEqual([]);
  expect(consoleErrors).toEqual([]);
});

test('journey brief builder and back-to-top interaction work', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  const form = page.locator('[data-journey-form]');
  await form.locator('[name="name"]').fill('Alex Traveller');
  await form.locator('[name="email"]').fill('alex@example.com');
  await form.locator('[name="travellers"]').selectOption({ label: 'Couple' });
  await form.locator('[name="region"]').selectOption({ label: 'Multi-region journey' });
  await form.locator('[name="timing"]').fill('September 2027');
  await form.locator('[name="duration"]').fill('12 nights');
  await form.getByText('Romantic', { exact: true }).click();
  await form.locator('[name="notes"]').fill('Food, architecture and time by the sea.');
  await form.getByRole('button', { name: /Prepare my journey brief/i }).click();

  const dialog = page.getByRole('dialog', { name: /A thoughtful first draft/i });
  await expect(dialog).toBeVisible();
  await expect(dialog.locator('pre')).toContainText('Alex Traveller');
  await expect(dialog.locator('pre')).toContainText('Multi-region journey');
  await expect(dialog.locator('pre')).toContainText('Romantic');
  await dialog.getByRole('button', { name: 'Close journey brief' }).click();
  await expect(dialog).toBeHidden();

  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await expect(page.locator('[data-back-to-top]')).toBeVisible();
  await page.locator('[data-back-to-top]').click();
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeLessThan(8);
});

test('core content remains available without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();
  const response = await page.goto('/', { waitUntil: 'domcontentloaded' });
  expect(response?.status()).toBe(200);
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Europe');
  await expect(page.getByRole('heading', { name: 'Europe is our whole world.' })).toBeVisible();
  await expect(page.locator('link[rel="stylesheet"]')).toHaveCount(2);
  await context.close();
});
