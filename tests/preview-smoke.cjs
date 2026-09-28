const {chromium}=require('playwright');
const fs=require('fs'),path=require('path'),assert=require('node:assert/strict');
const base=process.env.PREVIEW_URL||'http://127.0.0.1:8765';
fs.mkdirSync('screenshots',{recursive:true});
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 const errors=[];const page=await browser.newPage({viewport:{width:1440,height:900},reducedMotion:'reduce'});
 page.setDefaultTimeout(12000);
 page.on('pageerror',e=>errors.push(e.message));
 page.on('response',r=>{if(r.url().startsWith(base)&&r.status()>=400)errors.push(r.status()+' '+r.url());});
 page.on('request',r=>{if(['fetch','xhr'].includes(r.resourceType()))errors.push('Unexpected backend request: '+r.url());});
 const go=async file=>{await page.goto(base+'/'+file);await page.locator('main').waitFor();};
 const shot=async name=>page.screenshot({path:'screenshots/'+name+'.png',fullPage:true});
 const overflow=async(label,width)=>assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth)<=width+1,'Overflow '+label+' '+width);
 try{
  await go('index.html');await shot('login-1440');await page.locator('[data-submit-button]').click();await page.waitForURL(base+'/home.html');await page.locator('[data-onboarding]:visible').waitFor();await page.keyboard.press('Escape');
  const roles=['admin','mudir','ketatausahaan','guru-musyrif','santri','orang-tua'];
  for(const width of [360,390,430,768,1440]){
   await page.setViewportSize({width,height:900});
   for(const role of roles){
    const home=role==='admin'?'home.html':`screens/${role}-home.html`;
    await go(home);await page.locator('[data-onboarding]:visible').waitFor();await overflow(role+' onboarding',width);if(width===390||width===1440)await shot(role+'-onboarding-'+width);await page.keyboard.press('Escape');
    assert.equal(await page.locator('[data-preview-role]').inputValue(),role);
    for(const room of ['pesantren','sekolah']){
     const file=role==='admin'?room+'.html':`screens/${role}-${room}.html`;
     await go(file);assert.equal(await page.locator('[data-preview-role]').inputValue(),role);await overflow(role+' '+room,width);
     if(width<900){await page.locator('[data-menu-open]').click();assert.ok(await page.locator('body').evaluate(e=>e.classList.contains('menu-open')));await page.locator('.sidebar__close').click();}
     if(width===390||width===1440)await shot(role+'-'+room+'-'+width);
    }
   }
   await go('index.html');await overflow('login',width);if(width===390)await shot('login-390');
   for(const file of ['screens/ketatausahaan-administrasi-pembayaran.html','screens/admin-sekolah-nilai.html','bantuan.html']){await go(file);await overflow(file,width);}
  }
  await page.setViewportSize({width:1440,height:900});
  await go('pesantren.html');await page.locator('[data-preview-role]').selectOption('ketatausahaan');await page.waitForURL('**/ketatausahaan-pesantren.html');
  await page.locator('[data-room-toggle]').click();await page.locator('[data-room-menu] a[href*="sekolah"]').first().click();await page.waitForURL('**/ketatausahaan-sekolah.html');
  await go('home.html');await page.locator('[data-onboarding]:visible').waitFor();await page.keyboard.press('Escape');await page.locator('[data-preview-role]').selectOption('orang-tua');await page.waitForURL('**/orang-tua-home.html');await page.locator('[data-onboarding]:visible').waitFor();await page.keyboard.press('Escape');
  await go('screens/orang-tua-pesantren.html');await page.getByText('Hubungan wali belum diverifikasi',{exact:true}).waitFor();await page.getByText('Lihat rancangan dengan data contoh').click();await page.locator('[data-child-selector]').selectOption('b');await page.waitForURL('**/*family-b.html');
  // Latest NIS/NISN, template, invalid header/rows, preview and confirmation.
  await go('screens/admin-pesantren-santri.html');await page.locator('[data-form="santri"]').click();assert.equal(await page.getByLabel('NIS',{exact:true}).getAttribute('required'),'');assert.equal(await page.getByLabel('NISN',{exact:true}).getAttribute('required'),null);await shot('nisn-optional');await page.keyboard.press('Escape');
  await page.waitForFunction(()=>!!window.XLSX);
  const downloadPromise=page.waitForEvent('download');await page.locator('[data-template="santri"]').click();const download=await downloadPromise;assert.ok(download.suggestedFilename().endsWith('.xlsx'));
  await page.locator('[data-excel-import="santri"]').click();assert.equal(await page.getByRole('button',{name:'Konfirmasi simulasi'}).isVisible(),false);
  const upload=async(headers,row)=>{const bytes=await page.evaluate(({headers,row})=>{const wb=XLSX.utils.book_new();XLSX.utils.book_append_sheet(wb,XLSX.utils.aoa_to_sheet([headers,row]),'Template');return Array.from(new Uint8Array(XLSX.write(wb,{type:'array',bookType:'xlsx'})));},{headers,row});await page.locator('.form-modal input[type=file]').setInputFiles({name:'demo.xlsx',mimeType:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',buffer:Buffer.from(bytes)});await page.getByRole('button',{name:'Validasi & pratinjau'}).click();};
  await upload(['salah'],['demo']);await page.locator('.form-modal .form-note').getByText('Header tidak valid',{exact:false}).waitFor();
  const headers=['nis','nisn','nama_lengkap','jenis_kelamin','kelas','asrama','kamar','tahun_masuk','status'];
  await upload(headers,['','','Santri Contoh','L','VII A','Asrama 1','','2026','Aktif']);await page.locator('.form-modal .form-note').getByText('Baris tidak valid',{exact:false}).waitFor();
  await upload(headers,['DEMO001','','Santri Contoh','L','VII A','Asrama 1','','2026','Aktif']);await page.getByRole('button',{name:'Konfirmasi simulasi'}).waitFor();await shot('excel-optional-nisn');await page.getByRole('button',{name:'Konfirmasi simulasi'}).click();await page.getByText('Tidak ada data yang disimpan',{exact:false}).last().waitFor();await page.keyboard.press('Escape');
  await go('screens/admin-sekolah-nilai.html');await page.locator('[data-form="nilai"]').click();assert.deepEqual(await page.getByLabel('Jenis Penilaian',{exact:true}).locator('option').allTextContents(),['Pilih jenis penilaian','Ujian Bulanan 1','Ujian Bulanan 2','PTS','Ujian Bulanan 3','PAS','PAT']);await page.locator('.student-picker__trigger').click();await page.locator('.student-picker__option').first().click();assert.equal(await page.locator('input[aria-label="Siswa"][type=text]').count(),0);assert.ok((await page.getByLabel('Status',{exact:true}).textContent()).includes('LOCKED'));await shot('assessment-workflow');await page.keyboard.press('Escape');
  await go('screens/admin-pesantren-absensi.html');await page.locator('[data-bulk-attendance]').first().click();await page.locator('[aria-label=Kegiatan]').selectOption({index:1});await page.locator('[aria-label=Kamar]').selectOption({index:1});await shot('attendance');await page.keyboard.press('Escape');
  await go('screens/admin-pesantren-tahfidz.html');await page.locator('[data-tahfidz-detail]').first().click();await shot('tahfidz');await page.keyboard.press('Escape');
  await go('screens/ketatausahaan-administrasi-tagihan.html');await page.locator('[data-admin-new-bill]').click();await page.locator('[data-bill-search]').fill('BK26017');await page.locator('[data-bill-student]:visible input').first().check();await page.locator('[data-bill-type]').selectOption('1');await page.locator('[data-bill-submit]').click();await page.locator('[data-bill-success]:visible').waitFor();assert.match(await page.locator('[data-bill-success]').textContent(),/Tidak ada data/);await shot('bill-picker');await page.keyboard.press('Escape');
  await go('screens/ketatausahaan-administrasi-jenis.html');await page.locator('[data-admin-add-type]').click();await page.locator('[data-admin-master-modal]:visible').waitFor();await shot('payment-type');await page.keyboard.press('Escape');
  await go('screens/ketatausahaan-administrasi-metode.html');await page.locator('[data-admin-add-method]').click();await page.locator('[data-admin-master-modal]:visible').waitFor();await shot('payment-method');await page.keyboard.press('Escape');
  await go('screens/ketatausahaan-administrasi-pembayaran.html');await page.locator('[name=payment_status]').selectOption('PENDING');await page.getByRole('button',{name:'Terapkan Filter'}).click();assert.equal(await page.locator('tr:has([data-payment-detail]):visible').count(),1);await page.locator('[data-payment-detail]:visible').click();await page.locator('[data-payment-detail-modal]:visible').waitFor();await shot('payment-detail-audit');await page.keyboard.press('Escape');await page.locator('[data-verify-payment]:visible').first().click();await page.getByText('Simulasi saja. Tidak ada status',{exact:false}).waitFor();
  await go('screens/orang-tua-administrasi-tagihan.html');await page.locator('[data-open-payment]').first().click();await page.locator('[data-payment-method]').selectOption({index:1});await page.locator('[data-payment-submit]').click();await page.locator('[data-payment-success]:visible').waitFor();assert.match(await page.locator('[data-payment-success]').textContent(),/Tidak ada pembayaran/);await shot('guardian-payment');await page.keyboard.press('Escape');
  await go('bantuan.html');for(const word of ['NISN','UB1','pembayaran'])assert.ok((await page.locator('body').textContent()).includes(word));await shot('help-current');
  // Every static page must load, without hidden network dependencies.
  const files=fs.readdirSync('screens').filter(f=>f.endsWith('.html'));for(const file of files){await go('screens/'+file);assert.ok((await page.locator('body').textContent()).length>100);}
  assert.deepEqual(errors,[]);console.log('PASS: 6 role states × 2 rooms × 5 viewports; 166 pages; onboarding, NISN Excel, grades, payments, Help, drawer; zero backend requests/errors.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
