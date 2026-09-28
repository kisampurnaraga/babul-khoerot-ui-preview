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
