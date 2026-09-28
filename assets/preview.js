/* Static routing only; never calls Laravel endpoints or persists data. */
const previewRoleCopy={
  admin:'Kelola konfigurasi, master, audit, dan operasional sesuai izin.',
  mudir:'Pantau informasi pondok, room operasional, laporan santri, dan monitoring administrasi.',
  ketatausahaan:'Kelola administrasi santri, tagihan, pembayaran, rekening, notifikasi wali, dan laporan.',
  'guru-musyrif':'Lihat informasi pondok dan masuk ke room sesuai penugasan.',
  santri:'Lihat informasi pondok dan perkembangan pribadi sesuai akses.',
  'orang-tua':'Pantau informasi pondok, perkembangan anak, tagihan, dan pembayaran.'
};
const previewRoleLabel={
  admin:'Admin',mudir:'Mudir',ketatausahaan:'Ketatausahaan','guru-musyrif':'Guru / Musyrif',santri:'Santri','orang-tua':'Orang Tua / Wali'
};
const administrationRoles=new Set(['admin','mudir','ketatausahaan','orang-tua']);
const routeFor=(role,room,prefix='')=>role==='admin'?prefix+`${room}.html`:prefix+`screens/${role}-${room}.html`;

document.addEventListener('submit',event=>{
  if(event.target.matches('.auth-form')){
    event.preventDefault();
    event.stopImmediatePropagation();
    location.assign(event.target.getAttribute('action'));
  }
},true);

document.addEventListener('DOMContentLoaded',()=>{
  document.querySelectorAll('[data-preview-role]').forEach(select=>{
    if(!select.querySelector('option[value="ketatausahaan"]')){
      const option=document.createElement('option');
      option.value='ketatausahaan';option.textContent='Ketatausahaan';
      const guru=select.querySelector('option[value="guru-musyrif"]');
      if(guru)select.insertBefore(option,guru);else select.append(option);
    }
  });
  const homeRole=document.querySelector('[data-preview-home-role]');
  const syncHome=()=>{
    if(!homeRole)return;
    const role=homeRole.value;
    document.querySelector('[data-preview-role-label]')?.replaceChildren(document.createTextNode(previewRoleLabel[role]||role));
    document.querySelector('[data-preview-home-copy]')?.replaceChildren(document.createTextNode(previewRoleCopy[role]||'Pilih ruang kerja.'));
    const admin=document.querySelector('[data-admin-entry]');
    if(admin){
      admin.hidden=!administrationRoles.has(role);
      admin.href=`screens/${role}-administrasi.html`;
      const copy=admin.querySelector('[data-preview-admin-copy]');
      if(copy)copy.textContent=role==='orang-tua'?'Tagihan anak, riwayat pembayaran, dan rekening resmi pondok.':role==='mudir'?'Monitoring tagihan, pembayaran, tunggakan, dan laporan administrasi.':'Administrasi santri, tagihan, pembayaran, rekening, notifikasi wali, dan laporan.';
    }
  };
  homeRole?.addEventListener('change',syncHome);
  syncHome();
  document.querySelectorAll('[data-home-room]').forEach(link=>link.addEventListener('click',event=>{
    const role=homeRole?.value||'admin';
    event.preventDefault();
    location.assign(routeFor(role,link.dataset.homeRoom));
  }));
});

document.addEventListener('change',event=>{
  const child=event.target.closest('[data-child-selector]');
  if(child){
    event.stopImmediatePropagation();
    const next=location.pathname.replace(/-family-[ab]\.html$/,`-family-${child.value}.html`);
    if(next!==location.pathname)location.assign(next);
    return;
  }
  const role=event.target.closest('[data-preview-role]');
  if(role && !role.matches('[data-preview-home-role]')){
    const room=role.dataset.previewRoom;
    const prefix=role.dataset.previewPrefix;
    const target=role.value==='admin'?`${room}.html`:`screens/${role.value}-${room}.html`;
    location.assign(prefix+target);
  }
},true);


document.addEventListener('DOMContentLoaded',()=>{
  const nav=document.querySelector('[data-admin-tabs]');
  const panes=[...document.querySelectorAll('[data-admin-pane]')];
  if(!nav || !panes.length) return;
  const valid=new Set(panes.map(p=>p.dataset.adminPane));
  const activate=(tab,push=false)=>{
    const chosen=valid.has(tab)?tab:'dashboard';
    panes.forEach(p=>p.hidden=p.dataset.adminPane!==chosen);
    nav.querySelectorAll('[data-admin-tab]').forEach(a=>a.classList.toggle('is-active',a.dataset.adminTab===chosen));
    if(push){
      const url=new URL(location.href);
      url.searchParams.set('tab',chosen);
      history.pushState({tab:chosen},'',url);
    }
    document.querySelector('[data-menu-close]')?.click();
    window.scrollTo({top:0,behavior:'instant'});
  };
  const current=new URL(location.href).searchParams.get('tab')||'dashboard';
  activate(current,false);
  nav.addEventListener('click',event=>{
    const link=event.target.closest('[data-admin-tab]');
    if(!link)return;
    event.preventDefault();
    activate(link.dataset.adminTab,true);
  });
  addEventListener('popstate',()=>activate(new URL(location.href).searchParams.get('tab')||'dashboard',false));
});


const onboardingGuides={
  admin:{
    title:'Onboarding Admin',
    intro:'Admin mengatur akses, master data, konfigurasi, dan supervisi seluruh modul.',
    steps:[
      ['Mulai dari Beranda Pondok','Tentukan peran aktif lalu pilih Room Sekolah, Room Pesantren, atau Administrasi Pondok.'],
      ['Kelola master & pengguna','Gunakan master data untuk santri, kelas, asrama, staf, mapel, serta pengaturan lain.'],
      ['Gunakan aksi operasional seperlunya','Tetap ikuti permission, konteks room, dan audit saat membantu proses operasional.'],
      ['Pantau bantuan & audit','Gunakan Pusat Bantuan dan histori/audit untuk menelusuri perubahan penting.']
    ]
  },
  mudir:{
    title:'Onboarding Mudir',
    intro:'Mudir berfokus pada monitoring, ringkasan, laporan, dan tindak lanjut keputusan.',
    steps:[
      ['Pilih room yang ingin dipantau','Masuk ke Room Pesantren atau Sekolah untuk melihat indikator sesuai konteks.'],
      ['Gunakan Ringkasan & Laporan','Cari santri berdasarkan nama/NIS dan tentukan periode 7, 14, 30 hari, atau tanggal khusus.'],
      ['Pantau administrasi pembayaran','Administrasi Pondok menampilkan tagihan, pembayaran, dan tunggakan secara monitoring.'],
      ['Tindak lanjuti temuan','Koordinasikan temuan dengan Guru, Musyrif/Musyrifah, atau Ketatausahaan.']
    ]
  },
  ketatausahaan:{
    title:'Onboarding Ketatausahaan',
    intro:'Ketatausahaan mengelola administrasi santri, tagihan, pembayaran, rekening, dan komunikasi administratif ke wali.',
    steps:[
      ['Buka Administrasi Pondok','Workspace ini menjadi pusat pekerjaan TU lintas Room Sekolah dan Pesantren.'],
      ['Atur jenis & metode pembayaran','Jenis pembayaran dan rekening bersifat dinamis dan dapat diaktifkan/nonaktifkan.'],
      ['Buat dan pantau tagihan','Pilih santri berdasarkan nama/NIS, tentukan jenis, periode, nominal, dan jatuh tempo.'],
      ['Verifikasi & ingatkan wali','Pantau pembayaran masuk, tunggakan, dan informasi administratif untuk wali.']
    ]
  },
  'guru-musyrif':{
    title:'Onboarding Guru / Ustadzah / Musyrif',
    intro:'Role operasional bekerja sesuai penugasan. Guru/Ustadzah fokus Sekolah; Musyrif/Musyrifah fokus Pesantren.',
    steps:[
      ['Pilih room sesuai tugas','Guru/Ustadzah masuk Room Sekolah; Musyrif/Musyrifah masuk Room Pesantren.'],
      ['Kerjakan data operasional','Isi absensi, kegiatan, Tahfidz, ibadah, nilai, atau data lain sesuai penugasan.'],
      ['Periksa konteks sebelum menyimpan','Pastikan kelas, asrama, kamar, mapel, kegiatan, dan tanggal sudah benar.'],
      ['Gunakan Pusat Bantuan','Jika menu tidak muncul, cek role dan penugasan lalu hubungi Admin bila akses perlu diperbarui.']
    ]
  }
};

document.addEventListener('DOMContentLoaded',()=>{
  const onboarding=document.querySelector('[data-onboarding]');
  const roleSelect=document.querySelector('[data-preview-home-role]');
  if(onboarding && roleSelect){
    const title=onboarding.querySelector('[data-onboarding-title]');
    const intro=onboarding.querySelector('[data-onboarding-intro]');
    const steps=onboarding.querySelector('[data-onboarding-steps]');
    const hideCheck=onboarding.querySelector('[data-onboarding-hide]');
    const openButton=document.querySelector('[data-onboarding-open]');
    const render=()=>{
      const role=roleSelect.value;
      const guide=onboardingGuides[role];
      if(!guide){onboarding.hidden=true;openButton.hidden=true;return false}
      openButton.hidden=false;
      title.textContent=guide.title;intro.textContent=guide.intro;steps.innerHTML='';
      guide.steps.forEach((step,index)=>{
        const article=document.createElement('article');article.className='onboarding-step';
        const num=document.createElement('span');num.className='onboarding-step__number';num.textContent=String(index+1);
        const div=document.createElement('div');const strong=document.createElement('strong');strong.textContent=step[0];const p=document.createElement('p');p.textContent=step[1];div.append(strong,p);article.append(num,div);steps.append(article);
      });
      return true;
    };
    const key=()=> 'bk-preview-onboarding-hidden-'+roleSelect.value;
    const open=()=>{if(render()){onboarding.hidden=false;document.body.classList.add('modal-open')}};
    const close=()=>{if(hideCheck?.checked){try{localStorage.setItem(key(),'1')}catch(_){}}onboarding.hidden=true;document.body.classList.remove('modal-open')};
    openButton.addEventListener('click',open);
    onboarding.querySelectorAll('[data-onboarding-close]').forEach(b=>b.addEventListener('click',close));
    roleSelect.addEventListener('change',()=>{render();let hidden=false;try{hidden=localStorage.getItem(key())==='1'}catch(_){}if(!hidden&&onboardingGuides[roleSelect.value])setTimeout(open,80)});
    render();
    let hidden=false;try{hidden=localStorage.getItem(key())==='1'}catch(_){}
    if(!hidden&&onboardingGuides[roleSelect.value])setTimeout(open,180);
  }

  const billModal=document.querySelector('[data-bill-modal]');
  if(billModal){
    const rows=[...billModal.querySelectorAll('[data-bill-student]')];
    const checks=[...billModal.querySelectorAll('[data-bill-student-check]')];
    const search=billModal.querySelector('[data-bill-search]');
    const count=billModal.querySelector('[data-bill-selected-count]');
    const empty=billModal.querySelector('[data-bill-empty]');
    const validation=billModal.querySelector('[data-bill-validation]');
    const success=billModal.querySelector('[data-bill-success]');
    const type=billModal.querySelector('[data-bill-type]');
    const amount=billModal.querySelector('[data-bill-amount]');
    const update=()=>{const total=checks.filter(c=>c.checked).length;if(count)count.textContent=total+' santri';rows.forEach(r=>r.classList.toggle('is-selected',!!r.querySelector('[data-bill-student-check]')?.checked))};
    const reset=()=>{if(search)search.value='';rows.forEach(r=>{r.hidden=false;const c=r.querySelector('[data-bill-student-check]');if(c)c.checked=false;r.classList.remove('is-selected')});if(type)type.value='';if(amount)amount.value='';if(validation)validation.hidden=true;if(success)success.hidden=true;if(empty)empty.hidden=true;update()};
    const open=()=>{reset();billModal.hidden=false;document.body.classList.add('modal-open');setTimeout(()=>search?.focus(),0)};
    const close=()=>{billModal.hidden=true;document.body.classList.remove('modal-open')};
    document.querySelectorAll('[data-admin-new-bill]').forEach(b=>b.addEventListener('click',open));
    billModal.querySelectorAll('[data-bill-close]').forEach(b=>b.addEventListener('click',close));
    checks.forEach(c=>c.addEventListener('change',update));
    search?.addEventListener('input',()=>{const q=search.value.trim().toLowerCase();let visible=0;rows.forEach(r=>{const match=!q||(r.dataset.search||'').includes(q);r.hidden=!match;if(match)visible++});if(empty)empty.hidden=visible!==0});
    billModal.querySelector('[data-bill-submit]')?.addEventListener('click',()=>{const selected=checks.filter(c=>c.checked);const valid=selected.length>0&&!!type?.value&&!!amount?.value.trim();if(validation)validation.hidden=valid;if(success)success.hidden=true;if(!valid)return;success.textContent='Simulasi tagihan siap untuk '+selected.length+' santri. Tidak ada data yang disimpan.';success.hidden=false});
    document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!billModal.hidden)close()});
  }
});
