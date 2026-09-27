document.addEventListener('DOMContentLoaded',()=>{
 const login=document.querySelector('[data-preview-login]');login?.addEventListener('click',()=>{window.location.href='pesantren.html'});
 const toggle=document.querySelector('[data-password-toggle]');if(toggle)toggle.addEventListener('click',()=>{const input=document.getElementById('password');const shown=input.type==='text';input.type=shown?'password':'text';toggle.setAttribute('aria-pressed',String(!shown));toggle.querySelector('span').textContent=shown?'Tampilkan':'Sembunyikan'});
 const open=document.querySelector('[data-menu-open]');const close=()=>{document.body.classList.remove('menu-open');open?.setAttribute('aria-expanded','false')};open?.addEventListener('click',()=>{document.body.classList.add('menu-open');open.setAttribute('aria-expanded','true')});document.querySelectorAll('[data-menu-close]').forEach(b=>b.addEventListener('click',close));
 const switcher=document.querySelector('[data-room-toggle]'),menu=document.querySelector('[data-room-menu]');switcher?.addEventListener('click',()=>{const expanded=switcher.getAttribute('aria-expanded')==='true';switcher.setAttribute('aria-expanded',String(!expanded));menu.hidden=expanded});
 const show=(key)=>{const target=document.querySelector('[data-preview-panel="'+key+'"]')?'[data-preview-panel="'+key+'"]':'[data-preview-panel="dashboard"]';document.querySelectorAll('[data-preview-panel]').forEach(p=>p.classList.toggle('is-active',p.matches(target)));document.querySelectorAll('.nav-link[data-preview-tab]').forEach(a=>a.classList.toggle('is-active',a.dataset.previewTab===key));window.scrollTo({top:0,behavior:'auto'});close();};
 document.querySelectorAll('[data-preview-tab]').forEach(a=>a.addEventListener('click',e=>{e.preventDefault();const key=a.dataset.previewTab;history.replaceState(null,'','#'+key);show(key)}));
 const initial=(location.hash||'#dashboard').slice(1);show(initial);
 document.addEventListener('keydown',e=>{if(e.key==='Escape'){close();if(menu)menu.hidden=true;switcher?.setAttribute('aria-expanded','false')}});
});

document.addEventListener('DOMContentLoaded',()=>{
 const forms={
  'absensi-pesantren':{title:'Buat Absensi Pesantren',fields:[['Kegiatan','select','Subuh|Tahfidz|Ibadah|Aktivitas Asrama'],['Santri','text','Nama atau NIS santri'],['Status','select','Hadir|Izin|Sakit|Alfa'],['Sub keterangan','text','Wajib diisi untuk status Izin'],['Catatan petugas','textarea','Catatan tambahan bila diperlukan']]},
  'absensi-sekolah':{title:'Input Absensi Sekolah',fields:[['Kelas','select','VII A|VII B|VIII A|VIII B|IX A|IX B'],['Siswa','text','Nama atau NIS siswa'],['Status','select','Hadir|Izin|Sakit|Alfa'],['Sub keterangan','text','Wajib diisi untuk status Izin'],['Catatan','textarea','Catatan tambahan bila diperlukan']]},
  'santri':{title:'Tambah Santri',fields:[['Nama lengkap','text','Nama santri'],['NIS','text','Nomor induk'],['Kelas','select','VII A|VII B|VIII A|VIII B|IX A|IX B'],['Asrama / Kamar','text','Contoh: Putra 1 · A-01'],['Status','select','Aktif|Cuti|Nonaktif']]},
  'kamar':{title:'Tambah Kamar',fields:[['Asrama','select','Asrama Putra 1|Asrama Putra 2|Asrama Putri 1|Asrama Putri 2'],['Kode kamar','text','Contoh: A-01'],['Nama kamar','text','Nama kamar'],['Kapasitas','number','Jumlah tempat tidur']]},
  'musyrif':{title:'Tambah Musyrif',fields:[['Nama','text','Nama musyrif/musyrifah'],['Nomor staf','text','Nomor staf'],['Asrama','select','Asrama Putra 1|Asrama Putra 2|Asrama Putri 1|Asrama Putri 2'],['Mulai tugas','date','']]},
  'tahfidz':{title:'Input Setoran Tahfidz',fields:[['Santri','text','Nama atau NIS santri'],['Surat / Juz','text','Contoh: Al-Mulk'],['Ayat','text','Contoh: 1–12'],['Status','select','Selesai|Murajaah|Perlu pendampingan'],['Catatan','textarea','Catatan pembimbing']]},
  'ibadah':{title:'Catat Ibadah',fields:[['Kegiatan','select','Shalat Subuh|Tilawah Pagi|Shalat Dhuha|Dzikir Petang'],['Santri','text','Nama atau NIS santri'],['Status','select','Selesai|Belum|Izin'],['Catatan','textarea','Catatan bila diperlukan']]},
  'aktivitas':{title:'Tambah Aktivitas Asrama',fields:[['Nama aktivitas','text','Nama kegiatan'],['Waktu','time',''],['Lokasi','text','Lokasi kegiatan'],['Penanggung jawab','text','Nama petugas'],['Catatan','textarea','Catatan kegiatan']]},
  'kesehatan':{title:'Catat Pemeriksaan',fields:[['Santri','text','Nama atau NIS santri'],['Keluhan','text','Keluhan utama'],['Kondisi','select','Ringan|Dipantau|Istirahat|Rujukan'],['Tindak lanjut','textarea','Instruksi atau tindak lanjut']]},
  'pelanggaran':{title:'Catat Pelanggaran',fields:[['Santri','text','Nama atau NIS santri'],['Kategori','select','Ringan|Sedang|Berat'],['Kejadian','textarea','Uraian kejadian'],['Status pembinaan','select','Pembinaan|Selesai'],['Tindak lanjut','textarea','Tindak lanjut pembinaan']]},
  'siswa':{title:'Tambah Siswa',fields:[['Nama lengkap','text','Nama siswa'],['NIS','text','Nomor induk'],['Kelas','select','VII A|VII B|VIII A|VIII B|IX A|IX B'],['Tahun masuk','number','2026'],['Status','select','Aktif|Nonaktif']]},
  'kelas':{title:'Tambah Kelas',fields:[['Kode kelas','text','Contoh: VII-A'],['Nama kelas','text','Contoh: VII A'],['Wali kelas','text','Nama wali kelas'],['Kapasitas','number','Jumlah siswa maksimal']]},
  'guru-staf':{title:'Tambah Guru / Staf',fields:[['Nama','text','Nama lengkap'],['Nomor staf','text','Nomor staf'],['Jenis','select','Guru|Staf/TU'],['Mata pelajaran','text','Isi jika guru'],['Status','select','Aktif|Nonaktif']]},
  'mapel':{title:'Tambah Mata Pelajaran',fields:[['Kode','text','Contoh: MAT'],['Nama mata pelajaran','text','Nama mapel'],['Kategori','select','Umum|Keagamaan'],['Kelas','text','Contoh: VII–IX']]},
  'jadwal':{title:'Atur Jadwal Pelajaran',fields:[['Hari','select','Senin|Selasa|Rabu|Kamis|Jumat|Sabtu'],['Kelas','select','VII A|VII B|VIII A|VIII B|IX A|IX B'],['Mata pelajaran','text','Nama mapel'],['Guru','text','Nama guru'],['Waktu','text','Contoh: 07.00–08.20'],['Ruang','text','Contoh: Ruang 7A']]},
  'nilai':{title:'Input Nilai',fields:[['Kelas','select','VII A|VII B|VIII A|VIII B|IX A|IX B'],['Mata pelajaran','text','Nama mapel'],['Siswa','text','Nama atau NIS siswa'],['Nilai','number','0–100'],['Status','select','DRAFT|LOCKED']]},
  'tahun-akademik':{title:'Tambah Tahun Akademik',fields:[['Kode','text','2026-2027'],['Nama','text','2026 / 2027'],['Tanggal mulai','date',''],['Tanggal selesai','date',''],['Status','select','Aktif|Arsip']]}
 };
 const ensureModal=()=>{
  if(document.querySelector('[data-form-modal]')) return document.querySelector('[data-form-modal]');
  const wrap=document.createElement('div');wrap.className='form-modal';wrap.dataset.formModal='';wrap.hidden=true;
  wrap.innerHTML='<div class="form-modal__backdrop" data-form-close></div><section class="form-modal__panel" role="dialog" aria-modal="true"><header class="form-modal__header"><div><span class="eyebrow">Form Input</span><h2 data-form-title>Form</h2></div><button class="icon-button" type="button" data-form-close aria-label="Tutup">×</button></header><form class="form-modal__body" data-dynamic-form><div class="form-grid" data-form-fields></div><div class="form-note" data-form-note>Preview UI saja. Tombol simpan belum terhubung backend.</div><footer class="form-modal__footer"><button class="button button--secondary" type="button" data-form-close>Batal</button><button class="button button--primary" type="submit">Simpan</button></footer></form></section>';
  document.body.appendChild(wrap);wrap.querySelectorAll('[data-form-close]').forEach(x=>x.addEventListener('click',()=>{wrap.hidden=true;document.body.classList.remove('modal-open')}));
  wrap.querySelector('form').addEventListener('submit',e=>{e.preventDefault();const note=wrap.querySelector('[data-form-note]');note.textContent='Preview berhasil: data belum disimpan ke backend.';note.classList.add('is-success')});
  return wrap;
 };
 const openForm=(key)=>{
  const cfg=forms[key]; if(!cfg)return; const modal=ensureModal(); modal.querySelector('[data-form-title]').textContent=cfg.title;
  const fields=modal.querySelector('[data-form-fields]');fields.innerHTML='';
  cfg.fields.forEach(([label,type,data])=>{const div=document.createElement('label');div.className='form-field';div.innerHTML='<span>'+label+'</span>';
   let input;if(type==='select'){input=document.createElement('select');data.split('|').forEach(v=>{const o=document.createElement('option');o.textContent=v;input.appendChild(o)})}
   else if(type==='textarea'){input=document.createElement('textarea');input.rows=3;input.placeholder=data||''}
   else{input=document.createElement('input');input.type=type;input.placeholder=data||''}
   if(label==='Sub keterangan'){div.classList.add('form-field--conditional');input.dataset.subKeterangan=''}
   div.appendChild(input);fields.appendChild(div);
  });
  const status=[...fields.querySelectorAll('label')].find(l=>l.firstChild.textContent==='Status')?.querySelector('select');
  const sub=fields.querySelector('[data-sub-keterangan]')?.closest('label');
  const sync=()=>{if(sub){const izin=status?.value==='Izin';sub.hidden=!izin;sub.querySelector('input').required=izin}};
  status?.addEventListener('change',sync);sync();
  modal.querySelector('[data-form-note]').textContent='Preview UI saja. Tombol simpan belum terhubung backend.';modal.querySelector('[data-form-note]').classList.remove('is-success');
  modal.hidden=false;document.body.classList.add('modal-open');
 };
 document.querySelectorAll('[data-form]').forEach(b=>b.addEventListener('click',()=>openForm(b.dataset.form)));
});

document.addEventListener('DOMContentLoaded',()=>{
 const studentsPesantren=[
  ['Ahmad Fauzan','BK26001','VII A','Putra 1 · A-01'],
  ['Nabila Azzahra','BK26003','VII B','Putri 1 · P-01'],
  ['Rizky Maulana','BK25014','VIII A','Putra 1 · A-03'],
  ['Fikri Hidayat','BK26004','IX A','Putra 2 · B-03'],
  ['Siti Rahmah','BK25018','VIII B','Putri 2 · P-05'],
  ['Muhammad Fajar','BK26021','VII A','Putra 1 · A-05']
 ];
 const studentsSekolah=[
  ['Ahmad Fauzan','BK26001','VII A',''],
  ['Nabila Azzahra','BK26003','VII B',''],
  ['Rizky Maulana','BK25014','VIII A',''],
  ['Fikri Hidayat','BK26004','IX A',''],
  ['Siti Rahmah','BK25018','VIII B',''],
  ['Muhammad Fajar','BK26021','VII A','']
 ];
 const ensureBulk=()=>{
  let wrap=document.querySelector('[data-bulk-modal]'); if(wrap)return wrap;
  wrap=document.createElement('div');wrap.className='form-modal';wrap.dataset.bulkModal='';wrap.hidden=true;
  wrap.innerHTML='<div class="form-modal__backdrop" data-bulk-close></div><section class="form-modal__panel form-modal__panel--wide" role="dialog" aria-modal="true"><header class="form-modal__header"><div><span class="eyebrow">Absensi Manual</span><h2 data-bulk-title>Input Absensi</h2><p class="modal-subtitle">Tandai status setiap santri/siswa sekaligus.</p></div><button class="icon-button" type="button" data-bulk-close aria-label="Tutup">×</button></header><div class="bulk-toolbar"><div class="search-box">⌕ <input type="search" data-bulk-search placeholder="Cari nama atau NIS"></div><select data-bulk-scope></select><button class="button button--secondary" type="button" data-set-all-hadir>Semua Hadir</button></div><form class="form-modal__body" data-bulk-form><div class="bulk-attendance" data-bulk-list></div><div class="form-note" data-bulk-note>Preview UI saja. Data belum tersimpan.</div><footer class="form-modal__footer"><button class="button button--secondary" type="button" data-bulk-close>Batal</button><button class="button button--primary" type="submit">Simpan Absensi</button></footer></form></section>';
  document.body.appendChild(wrap);
  wrap.querySelectorAll('[data-bulk-close]').forEach(x=>x.addEventListener('click',()=>{wrap.hidden=true;document.body.classList.remove('modal-open')}));
  wrap.querySelector('[data-bulk-form]').addEventListener('submit',e=>{e.preventDefault();const n=wrap.querySelector('[data-bulk-note]');n.textContent='Preview berhasil: absensi massal siap disimpan saat backend dihubungkan.';n.classList.add('is-success')});
  wrap.querySelector('[data-set-all-hadir]').addEventListener('click',()=>{wrap.querySelectorAll('input[type=radio][value="Hadir"]').forEach(r=>{r.checked=true;r.dispatchEvent(new Event('change',{bubbles:true}))})});
  wrap.querySelector('[data-bulk-search]').addEventListener('input',e=>{const q=e.target.value.toLowerCase();wrap.querySelectorAll('.attendance-row').forEach(r=>r.hidden=!r.textContent.toLowerCase().includes(q))});
  return wrap;
 };
 const renderBulk=(mode)=>{
  const modal=ensureBulk(), rows=mode==='pesantren'?studentsPesantren:studentsSekolah;
  modal.querySelector('[data-bulk-title]').textContent=mode==='pesantren'?'Buat Absensi Pesantren':'Input Absensi Sekolah';
  const scope=modal.querySelector('[data-bulk-scope]');
  scope.innerHTML=mode==='pesantren'?'<option>Subuh</option><option>Tahfidz</option><option>Ibadah</option><option>Aktivitas Asrama</option>':'<option>VII A</option><option>VII B</option><option>VIII A</option><option>VIII B</option><option>IX A</option>';
  const list=modal.querySelector('[data-bulk-list]');list.innerHTML='';
  rows.forEach((r,i)=>{
   const row=document.createElement('div');row.className='attendance-row';
   row.innerHTML='<div class="attendance-person"><span class="person-avatar">'+r[0].split(' ').map(x=>x[0]).join('').slice(0,2)+'</span><span><strong>'+r[0]+'</strong><small>'+r[1]+' · '+r[2]+(r[3]?' · '+r[3]:'')+'</small></span></div><div class="attendance-status" role="radiogroup"><label><input type="radio" name="att-'+i+'" value="Hadir" checked><span>Hadir</span></label><label><input type="radio" name="att-'+i+'" value="Izin"><span>Izin</span></label><label><input type="radio" name="att-'+i+'" value="Sakit"><span>Sakit</span></label><label><input type="radio" name="att-'+i+'" value="Alfa"><span>Alfa</span></label></div><div class="attendance-reason" hidden><input type="text" placeholder="Keterangan izin (wajib)"></div>';
   row.querySelectorAll('input[type=radio]').forEach(rad=>rad.addEventListener('change',()=>{const reason=row.querySelector('.attendance-reason'),inp=reason.querySelector('input');const izin=rad.checked&&rad.value==='Izin';reason.hidden=!izin;inp.required=izin;if(!izin)inp.value=''}));
   list.appendChild(row);
  });
  modal.querySelector('[data-bulk-note]').textContent='Preview UI saja. Data belum tersimpan.';modal.querySelector('[data-bulk-note]').classList.remove('is-success');
  modal.hidden=false;document.body.classList.add('modal-open');
 };
 document.querySelectorAll('[data-bulk-attendance]').forEach(b=>b.addEventListener('click',()=>renderBulk(b.dataset.bulkAttendance)));

 const worshipItems=['Shalat Subuh','Tilawah Pagi','Shalat Dhuha','Dzikir Petang'];
 const ensureWorship=()=>{
  let wrap=document.querySelector('[data-worship-modal]');if(wrap)return wrap;
  wrap=document.createElement('div');wrap.className='form-modal';wrap.dataset.worshipModal='';wrap.hidden=true;
  wrap.innerHTML='<div class="form-modal__backdrop" data-worship-close></div><section class="form-modal__panel" role="dialog" aria-modal="true"><header class="form-modal__header"><div><span class="eyebrow">Master Kegiatan</span><h2>Kelola Kegiatan Ibadah</h2><p class="modal-subtitle">Tambah, ubah, nonaktifkan atau hapus kegiatan sesuai kebutuhan pondok.</p></div><button class="icon-button" data-worship-close type="button">×</button></header><div class="form-modal__body"><div class="inline-create"><input type="text" data-worship-new placeholder="Nama kegiatan ibadah baru"><button class="button button--primary" type="button" data-worship-add>+ Tambah</button></div><div class="worship-manager" data-worship-list></div><div class="form-note">Preview UI. Pada aplikasi final, daftar ini menjadi master data sehingga form Catat Ibadah mengambil pilihan dari sini.</div><footer class="form-modal__footer"><button class="button button--secondary" type="button" data-worship-close>Selesai</button></footer></div></section>';
  document.body.appendChild(wrap);wrap.querySelectorAll('[data-worship-close]').forEach(x=>x.addEventListener('click',()=>{wrap.hidden=true;document.body.classList.remove('modal-open')}));
  wrap.querySelector('[data-worship-add]').addEventListener('click',()=>{const inp=wrap.querySelector('[data-worship-new]');const v=inp.value.trim();if(v){worshipItems.push(v);inp.value='';renderWorship()}});
  return wrap;
 };
 const renderWorship=()=>{
  const modal=ensureWorship(),list=modal.querySelector('[data-worship-list]');list.innerHTML='';
  worshipItems.forEach((name,i)=>{const row=document.createElement('div');row.className='worship-manager__row';row.innerHTML='<input value="'+name.replace(/"/g,'&quot;')+'" aria-label="Nama kegiatan"><label class="toggle-control"><input type="checkbox" checked><span>Aktif</span></label><button class="table-action" type="button">Hapus</button>';row.querySelector('input[type=text],input:not([type])')?.addEventListener('change',e=>worshipItems[i]=e.target.value);row.querySelector('button').addEventListener('click',()=>{worshipItems.splice(i,1);renderWorship()});list.appendChild(row)});
  modal.hidden=false;document.body.classList.add('modal-open');
 };
 document.querySelector('[data-manage-worship]')?.addEventListener('click',renderWorship);
});
