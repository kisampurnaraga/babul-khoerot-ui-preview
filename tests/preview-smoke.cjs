const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const base = 'http://127.0.0.1:8765';
const out = path.join(process.cwd(), 'screenshots');
fs.mkdirSync(out, { recursive: true });

(async () => {
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  const errors = [];
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
    page.on('pageerror', error => errors.push(error.message));
    page.on('response', response => { if (response.url().startsWith(base) && response.status() >= 400) errors.push(`${response.status()} ${response.url()}`); });
    await page.goto(base + '/index.html');
    await page.getByText('Mode Preview').first().waitFor();
    await page.screenshot({ path: path.join(out, 'login-desktop.png'), fullPage: true });
    await page.locator('[data-submit-button]').click();
    await page.waitForURL(base + '/pesantren.html');
    await page.locator('main h1').first().waitFor();

    const roles = ['admin', 'mudir', 'guru-musyrif', 'santri', 'orang-tua'];
    for (const role of roles) {
      for (const room of ['pesantren', 'sekolah']) {
        const filename = role === 'admin' ? `${room}.html` : `screens/${role}-${room}.html`;
        await page.goto(`${base}/${filename}`);
        await page.locator('[data-preview-role]').waitFor();
        if (await page.locator('[data-preview-role]').inputValue() !== role) throw new Error(`Role selector mismatch: ${role}`);
        if (!await page.getByText(`Room ${room[0].toUpperCase() + room.slice(1)}`).first().isVisible()) throw new Error(`Wrong room: ${role} ${room}`);
        await page.screenshot({ path: path.join(out, `${role}-${room}-desktop.png`), fullPage: true });
      }
    }

    for (const width of [360, 390, 430, 768, 1440]) {
      await page.setViewportSize({ width, height: 844 });
      await page.goto(base + '/pesantren.html');
      if (width < 900) {
        await page.locator('[data-menu-open]').click();
        if (!await page.locator('body').evaluate(el => el.classList.contains('menu-open'))) throw new Error(`Drawer failed at ${width}`);
        await page.locator('.sidebar__close').click();
      }
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth);
      if (overflow > width + 1) throw new Error(`Overflow at ${width}: ${overflow}`);
      await page.screenshot({ path: path.join(out, `admin-${width}.png`), fullPage: true });
    }
    await page.locator('[data-preview-role]').selectOption('guru-musyrif');
    await page.waitForURL(base + '/screens/guru-musyrif-pesantren.html');
    await page.locator('[data-room-toggle]').click();
    await page.locator('[data-room-menu] a[href*="sekolah"]').first().click();
    await page.waitForURL(base + '/screens/guru-musyrif-sekolah.html');

    await page.goto(base + '/screens/orang-tua-pesantren.html');
    await page.getByText('Hubungan wali belum diverifikasi').first().waitFor();
    await page.getByText('Lihat rancangan dengan data contoh').click();
    await page.waitForURL(base + '/screens/orang-tua-pesantren-family-a.html');
    await page.locator('[data-child-selector]').selectOption('b');
    await page.waitForURL(base + '/screens/orang-tua-pesantren-family-b.html');

    await page.goto(base + '/screens/admin-pesantren-santri.html');
    await page.locator('[data-excel-import]').first().click();
    if (await page.getByRole('button', { name: 'Konfirmasi simulasi' }).isVisible()) throw new Error('Import confirmation shown before validation');
    await page.screenshot({ path: path.join(out, 'excel-modal.png'), fullPage: true });
    await page.keyboard.press('Escape');
    await page.goto(base + '/screens/admin-pesantren-absensi.html');
    await page.locator('[data-bulk-attendance]').first().click();
    await page.locator('[aria-label=Kegiatan]').selectOption({ index: 1 });
    await page.locator('[aria-label=Kamar]').selectOption({ index: 1 });
    await page.screenshot({ path: path.join(out, 'attendance-batch.png'), fullPage: true });
    await page.keyboard.press('Escape');
    await page.goto(base + '/screens/admin-pesantren-tahfidz.html');
    await page.locator('[data-tahfidz-detail]').first().click();
    await page.screenshot({ path: path.join(out, 'tahfidz-detail.png'), fullPage: true });
    await page.keyboard.press('Escape');
    await page.goto(base + '/bantuan.html');
    await page.locator('[data-help-search]').fill('wali');
    await page.getByText('Panduan Wali').first().waitFor();
    await page.setViewportSize({ width: 390, height: 844 });
    await page.screenshot({ path: path.join(out, 'help-mobile.png'), fullPage: true });
    if (errors.length) throw new Error('Browser errors: ' + errors.join('; '));
    console.log('Static preview browser smoke PASS: 10 role/room dashboards, 5 viewports, selector, room switch, Wali, Excel, attendance, Tahfidz, Help');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
