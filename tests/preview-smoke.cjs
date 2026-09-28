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
    await page.waitForURL(base + '/home.html');
    await page.getByText('Berita & Artikel Pondok').first().waitFor();
    await page.locator('[data-preview-home-role]').selectOption('ketatausahaan');
    await page.getByText('Peran aktif:').first().waitFor();
    if (!await page.getByText('Administrasi Pondok', { exact: true }).first().isVisible()) throw new Error('Administration entry missing on portal');
    await page.screenshot({ path: path.join(out, 'portal-ketatausahaan.png'), fullPage: true });
    await page.locator('[data-preview-home-role]').selectOption('admin');
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(base + '/index.html');
    await page.screenshot({ path: path.join(out, 'login-mobile.png'), fullPage: true });
    await page.setViewportSize({ width: 1440, height: 900 });

    const roles = ['admin', 'mudir', 'ketatausahaan', 'guru-musyrif', 'santri', 'orang-tua'];
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

    await page.goto(base + '/screens/ketatausahaan-administrasi.html');
    await page.getByText('Dashboard Administrasi').first().waitFor();
    for (const [tab,title] of [
      ['santri','Data Administrasi Santri'],
      ['jenis','Jenis Pembayaran'],
      ['metode','Metode & Rekening Pembayaran'],
      ['tagihan','Tagihan Santri'],
      ['pembayaran','Pembayaran'],
      ['tunggakan','Tunggakan Pembayaran'],
      ['notifikasi','Notifikasi Wali'],
      ['laporan','Laporan Administrasi']
    ]) {
      await page.locator('[data-admin-tab="'+tab+'"]').click();
      await page.getByRole('heading',{name:title,exact:true}).waitFor();
    }
    await page.locator('[data-admin-tab="jenis"]').click();
    await page.locator('[data-admin-add-type]').click();
    await page.locator('[data-admin-master-modal]').waitFor({ state: 'visible' });
    await page.screenshot({ path: path.join(out, 'ketatausahaan-administrasi.png'), fullPage: true });
    await page.keyboard.press('Escape');

    await page.goto(base + '/screens/mudir-pesantren-laporan.html');
    await page.getByText('Ringkasan & Laporan Santri').first().waitFor();
    await page.locator('[data-report-period="30"]').click();
    await page.locator('[data-report-apply]').click();
    await page.getByText('Sinta Nur Aulia').first().waitFor();
    await page.screenshot({ path: path.join(out, 'mudir-laporan-santri.png'), fullPage: true });

    await page.goto(base + '/screens/orang-tua-administrasi.html');
    await page.getByText('Pembayaran Anak').first().waitFor();
    await page.getByText('7123 4567 890').first().waitFor();

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
    await page.waitForFunction(() => !!window.XLSX, null, { timeout: 15000 });
    const upload = async (headers, rows) => {
      const bytes = await page.evaluate(({ headers, rows }) => {
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([headers, ...rows]), 'Template');
        return Array.from(new Uint8Array(XLSX.write(wb, { bookType: 'xlsx', type: 'array' })));
      }, { headers, rows });
      await page.locator('.form-modal input[type=file]').setInputFiles({ name: 'data-contoh.xlsx', mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', buffer: Buffer.from(bytes) });
      await page.getByRole('button', { name: 'Validasi & pratinjau' }).click();
    };
    await upload(['kolom_salah'], [['contoh']]);
    await page.locator('.form-modal .form-note').getByText('Header tidak valid', { exact: false }).waitFor();
    const headers = ['nis', 'nama_lengkap', 'jenis_kelamin', 'kelas', 'asrama', 'kamar', 'tahun_masuk', 'status'];
    await upload(headers, [['BK001', '', 'L', 'VII A', '', '', '2026', 'Aktif']]);
    await page.locator('.form-modal .form-note').getByText('Baris tidak valid', { exact: false }).waitFor();
    await upload(headers, [['BK001', 'Santri Contoh', 'L', 'VII A', 'Asrama Putra 1', '', '2026', 'Aktif']]);
    await page.locator('.form-modal .form-note').getByText('Siap diimport setelah backend terhubung', { exact: false }).waitFor();
    await page.getByRole('button', { name: 'Konfirmasi simulasi' }).click();
    await page.locator('.form-modal .form-note').getByText('Tidak ada data yang disimpan', { exact: false }).waitFor();
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
    console.log('Static preview browser smoke PASS: portal, 12 role/room dashboards, Ketatausahaan administration, Mudir individual reports, Wali payments, 5 viewports, selector, room switch, Excel states, attendance, Tahfidz, Help');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
