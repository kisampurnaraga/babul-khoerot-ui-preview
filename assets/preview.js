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
