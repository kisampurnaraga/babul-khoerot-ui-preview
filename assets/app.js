/* Frontend-only interactions. Operational data is illustrative until backend integration. */
document.addEventListener('DOMContentLoaded', () => {
  'use strict';
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const icon = name => {
    const paths = { close:'M18 6 6 18M6 6l12 12', search:'M4 11a7 7 0 1 1 14 0 7 7 0 0 1-14 0Zm12 5 5 5', upload:'M12 16V3m0 0 4 4m-4-4L8 7M4 16v5h16v-5' };
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class','icon'); svg.setAttribute('viewBox','0 0 24 24'); svg.setAttribute('aria-hidden','true');
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', paths[name] || paths.close); svg.append(path); return svg;
  };
  const el = (tag, className, text) => {
    const node = document.createElement(tag); if(className) node.className=className;
    if(text !== undefined) node.textContent=text; return node;
  };
  const btn = (text, className, callback) => { const node=el('button',className,text); node.type='button'; node.addEventListener('click',callback); return node; };
  const addOptions = (select, values, placeholder) => {
    select.replaceChildren();
    if(placeholder) { const option=el('option','',placeholder); option.value=''; select.append(option); }
    values.forEach(item => {const option=el('option','',typeof item === 'string' ? item : item.label);option.value=typeof item === 'string' ? item : item.value; select.append(option);});
  };
  const message = (container, value, type='info') => { container.textContent=value; container.className='form-note'+(type==='error'?' is-error':type==='valid'?' is-success':''); };
  const appendField = (form, label, type='text', options=[], required=false) => {
    const wrap=el('label','form-field'); const title=el('span','',label+(required?' *':''));wrap.append(title);
    const input=type==='select'?el('select'):type==='textarea'?el('textarea'):el('input');
    if(type==='select')addOptions(input, options,required?'Pilih '+label.toLowerCase():null);
    else if(type==='textarea') input.rows=3;
    else input.type=type;
    input.required=required; input.setAttribute('aria-label',label);wrap.append(input);form.append(wrap);return {wrap,input};
  };
  let lastFocus=null, activeDialog=null;
  const closeDialog = () => {
    if(!activeDialog)return;
    activeDialog.hidden=true; activeDialog=null;document.body.classList.remove('modal-open');
    lastFocus?.focus();lastFocus=null;
  };
  const openDialog = (title,wide=false) => {
    closeDialog();lastFocus=document.activeElement;
    const overlay=el('div','form-modal');overlay.setAttribute('role','presentation');
    const backdrop=el('div','form-modal__backdrop');backdrop.addEventListener('click',closeDialog);
    const panel=el('section','form-modal__panel'+(wide?' form-modal__panel--wide':''));panel.setAttribute('role','dialog');panel.setAttribute('aria-modal','true');
    const head=el('header','form-modal__header');const heading=el('h2','',title);heading.id='demo-dialog-title';panel.setAttribute('aria-labelledby',heading.id);
    const close=btn('','icon-button',closeDialog);close.setAttribute('aria-label','Tutup dialog');close.append(icon('close'));
    head.append(heading,close);panel.append(head);overlay.append(backdrop,panel);document.body.append(overlay);
    activeDialog=overlay;document.body.classList.add('modal-open');close.focus();return panel;
  };
  document.addEventListener('keydown', event=>{
    if(event.key==='Escape'){closeDialog();closeMenu();return;}
    if(event.key==='Tab'&&activeDialog){
      const focus=$$('button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href]',activeDialog).filter(x=>x.getClientRects().length);
      if(!focus.length)return;
      if(event.shiftKey&&document.activeElement===focus[0]){event.preventDefault();focus.at(-1).focus();}
      if(!event.shiftKey&&document.activeElement===focus.at(-1)){event.preventDefault();focus[0].focus();}
    }
  });
  const menuOpen=$('[data-menu-open]'), roomToggle=$('[data-room-toggle]'), roomMenu=$('[data-room-menu]');
  function closeMenu(){document.body.classList.remove('menu-open');menuOpen?.setAttribute('aria-expanded','false');if(roomMenu)roomMenu.hidden=true;roomToggle?.setAttribute('aria-expanded','false');}
  menuOpen?.addEventListener('click',()=>{document.body.classList.add('menu-open');menuOpen.setAttribute('aria-expanded','true');$('[data-menu-close]')?.focus();});
  $$('[data-menu-close]').forEach(node=>node.addEventListener('click',closeMenu));
  roomToggle?.addEventListener('click',()=>{const visible=roomMenu.hidden;roomMenu.hidden=!visible;roomToggle.setAttribute('aria-expanded',String(visible));});
  document.addEventListener('click',event=>{if(roomMenu&&!roomMenu.hidden&&!event.target.closest('.room-switcher')){roomMenu.hidden=true;roomToggle?.setAttribute('aria-expanded','false');}});
  const passwordToggle=$('[data-password-toggle]');
  passwordToggle?.addEventListener('click',()=>{const input=$('#password');const showing=input.type==='text';input.type=showing?'password':'text';passwordToggle.setAttribute('aria-pressed',String(!showing));passwordToggle.setAttribute('aria-label',showing?'Tampilkan kata sandi':'Sembunyikan kata sandi');passwordToggle.querySelector('span').textContent=showing?'Tampilkan':'Sembunyikan';});
  $('[data-submit-form]')?.addEventListener('submit',event=>{if(!event.target.checkValidity())return;const button=$('[data-submit-button]',event.target);button.classList.add('is-submitting');button.disabled=true;button.setAttribute('aria-busy','true');});
  $('[data-child-selector]')?.addEventListener('change',event=>{const url=new URL(location.href);url.searchParams.set('preview','keluarga');url.searchParams.set('anak',event.target.value);location.assign(url.toString());});
  const roleState=$('[data-state-select]'), roleMessage=$('[data-state-message]');
  const stateCopy={loading:'Memuat data sesuai peran aktif…',empty:'Belum ada data yang dapat ditampilkan.',error:'Layanan data belum tersedia. Coba lagi nanti.',validation:'Periksa kembali kolom yang wajib diisi.',success:'Pratinjau aksi UI selesai. Data belum disimpan.',denied:'Anda tidak memiliki izin untuk melihat informasi ini.',offline:'Koneksi terputus. Data terbaru belum tersedia.'};
  roleState?.addEventListener('change',()=>{const state=roleState.value;roleMessage.hidden=state==='default';roleMessage.textContent=stateCopy[state]||'';});
  $$('[data-role-tab]').forEach(tab=>tab.addEventListener('click',()=>{$$('[data-role-tab]').forEach(t=>{const selected=t===tab;t.classList.toggle('is-active',selected);t.setAttribute('aria-selected',String(selected));});$$('[data-role-tab-panel]').forEach(panel=>panel.hidden=panel.dataset.roleTabPanel!==tab.dataset.roleTab);}));
  const help=$('[data-help-search]');
  help?.addEventListener('input',()=>{
    const query=help.value.trim().toLowerCase();let count=0;
    $$('[data-help-item]').forEach(card=>{card.hidden=!!query&&!card.textContent.toLowerCase().includes(query);if(!card.hidden)count++;});
    const empty=$('[data-help-empty]')||el('p','help-empty','Panduan tidak ditemukan.');empty.dataset.helpEmpty='';
    if(count)empty.remove();else $('[data-help-grid]')?.append(empty);
  });
  $$('[data-help-topic]').forEach(button=>button.addEventListener('click',()=>{
    const target=$('#panduan-'+button.dataset.helpTopic.toLowerCase().replaceAll(' ','-'));
    if(target){target.scrollIntoView({behavior:'smooth',block:'start'});target.focus({preventScroll:true});}
  }));
  $$('[data-help-contact],[data-help-report]').forEach(button=>button.addEventListener('click',()=>{const m=$('[data-help-status]');if(m)m.textContent=button.hasAttribute('data-help-contact')?'Hubungi Admin: kontak akan diatur setelah backend terhubung.':'Laporkan Masalah: formulir akan tersedia setelah backend terhubung.';}));

  const worshipItems=[
    {name:'Shalat Subuh',active:true},{name:'Tilawah Pagi',active:true},
    {name:'Shalat Dhuha',active:true},{name:'Dzikir Petang',active:true}
  ]; // Shared demo source. Backend will provide one persisted master.
  const activeWorship=()=>worshipItems.filter(item=>item.active).map(item=>item.name);
  $('[data-manage-worship]')?.addEventListener('click',()=>{
    const panel=openDialog('Kelola kegiatan ibadah');const body=el('div','form-modal__body');
    body.append(el('p','modal-subtitle','Master kegiatan contoh untuk Absensi Pesantren dan Catat Ibadah. Perubahan hanya berlaku sampai halaman dimuat ulang.'));
    const manager=el('div','worship-manager');const create=el('div','inline-create');const input=el('input');input.placeholder='Nama kegiatan baru';input.setAttribute('aria-label','Nama kegiatan ibadah baru');
    const render=()=>{manager.replaceChildren();worshipItems.forEach((item,index)=>{const row=el('div','worship-manager__row');const name=el('input');name.value=item.name;name.setAttribute('aria-label','Nama kegiatan '+(index+1));name.addEventListener('change',()=>item.name=name.value.trim()||item.name);
      const status=el('label','toggle-control');const check=el('input');check.type='checkbox';check.checked=item.active;check.addEventListener('change',()=>item.active=check.checked);status.append(check,document.createTextNode(' Aktif'));
      row.append(name,status,btn('Arsipkan','table-action',()=>{if(confirm('Arsipkan kegiatan pada pratinjau ini?')){worshipItems.splice(index,1);render();}}));manager.append(row);});};
    create.append(input,btn('Tambah','button button--primary',()=>{const name=input.value.trim();if(!name){input.focus();return;}worshipItems.push({name,active:true});input.value='';render();}));body.append(create,manager,el('div','form-note','UI demonstrasi; master kegiatan belum disimpan ke backend.'));panel.append(body);render();
  });

  const forms={
    santri:{title:'Tambah Santri',fields:[['Nama lengkap','text',true],['NIS','text',true],['Kelas','text',true],['Asrama / Kamar','text',true],['Status','select',true,'Aktif|Cuti|Nonaktif']]},
    kamar:{title:'Tambah Kamar',fields:[['Asrama','text',true],['Kode kamar','text',true],['Nama kamar','text',true],['Kapasitas','number',true]]},
    musyrif:{title:'Tambah Musyrif',fields:[['Nama','text',true],['Nomor staf','text',true],['Asrama','text',true],['Mulai tugas','date',true]]},
    tahfidz:{title:'Input Setoran Tahfidz',fields:[['Santri','text',true],['Jenis Setoran','select',true,'Setoran Baru|Murajaah'],['Juz','number',true],['Surat','text',true],['Ayat awal','number',true],['Ayat akhir','number',true],['Hasil','select',true,'Lulus|Perlu Ulang|Belum Lancar'],['Catatan pembimbing','textarea',false]]},
    ibadah:{title:'Catat Ibadah',fields:[['Kegiatan','worship',true],['Santri','text',true],['Status','select',true,'Selesai|Belum|Izin'],['Catatan','textarea',false]]},
    aktivitas:{title:'Tambah Aktivitas Asrama',fields:[['Nama aktivitas','text',true],['Waktu','time',true],['Lokasi','text',true],['Penanggung jawab','text',true],['Catatan','textarea',false]]},
    kesehatan:{title:'Catat Pemeriksaan',fields:[['Santri','text',true],['Informasi yang dapat dibagikan','textarea',true],['Kondisi','select',true,'Ringan|Dipantau|Istirahat|Rujukan'],['Tindak lanjut','textarea',false],['Catatan internal petugas','textarea',false]]},
    pelanggaran:{title:'Catat Pelanggaran',fields:[['Santri','text',true],['Kategori','select',true,'Ringan|Sedang|Berat'],['Kejadian yang dapat dibagikan','textarea',true],['Status pembinaan','select',true,'Pembinaan|Selesai'],['Tindak lanjut','textarea',false],['Catatan internal petugas','textarea',false]]},
    siswa:{title:'Tambah Siswa',fields:[['Nama lengkap','text',true],['NIS','text',true],['Kelas','text',true],['Tahun masuk','number',true],['Status','select',true,'Aktif|Nonaktif']]},
    kelas:{title:'Tambah Kelas',fields:[['Kode kelas','text',true],['Nama kelas','text',true],['Wali kelas','text',true],['Kapasitas','number',true]]},
    'guru-staf':{title:'Tambah Guru / Staf',fields:[['Nama','text',true],['Nomor staf','text',true],['Jenis','select',true,'Guru|Staf/TU'],['Mata pelajaran','text',false],['Status','select',true,'Aktif|Nonaktif']]},
    mapel:{title:'Tambah Mata Pelajaran',fields:[['Kode','text',true],['Nama mata pelajaran','text',true],['Kategori','select',true,'Umum|Keagamaan'],['Kelas','text',false]]},
    jadwal:{title:'Atur Jadwal Pelajaran',fields:[['Hari','select',true,'Senin|Selasa|Rabu|Kamis|Jumat|Sabtu'],['Kelas','text',true],['Mata pelajaran','text',true],['Guru','text',true],['Waktu mulai','time',true],['Waktu selesai','time',true],['Ruang','text',false]]},
    nilai:{title:'Input Nilai',fields:[['Kelas','text',true],['Mata pelajaran','text',true],['Siswa','text',true],['Nilai','number',true],['Status','select',true,'DRAFT|LOCKED']]},
    'tahun-akademik':{title:'Tambah Tahun Akademik',fields:[['Kode','text',true],['Nama','text',true],['Tanggal mulai','date',true],['Tanggal selesai','date',true],['Status','select',true,'Aktif|Arsip']]}
  };
  const openForm=(key,student='')=>{
    const config=forms[key];if(!config)return;
    const panel=openDialog(config.title);const form=el('form','form-modal__body');const grid=el('div','form-grid');const inputs={};
    config.fields.forEach(([label,type,required,choices])=>{const field=appendField(grid,label,type==='worship'?'select':type,type==='worship'?activeWorship():(choices?.split('|')||[]),required);inputs[label]=field.input;if(student&&label==='Santri')field.input.value=student;if(type==='number'){field.input.min='0';}});
    const note=el('div','form-note','UI demonstrasi. Penyimpanan backend belum terhubung.');note.setAttribute('role','status');note.setAttribute('aria-live','polite');const footer=el('footer','form-modal__footer');
    footer.append(btn('Batal','button button--secondary',closeDialog));
    const submit=el('button','button button--primary','Tinjau input');submit.type='submit';footer.append(submit);
    form.append(grid,note,footer);panel.append(form);
    form.addEventListener('submit',event=>{event.preventDefault();
      if(key==='tahfidz' && Number(inputs['Ayat akhir'].value)<Number(inputs['Ayat awal'].value)){message(note,'Ayat akhir tidak boleh lebih kecil dari ayat awal.','error');inputs['Ayat akhir'].focus();return;}
      message(note,'Input contoh valid. BACKEND REQUIRED: tidak ada data yang disimpan.','valid');submit.textContent='Tinjau ulang';
    });
  };
  $$('[data-form]').forEach(button=>button.addEventListener('click',()=>openForm(button.dataset.form)));
  const profiles={
    rizky:{name:'Rizky Maulana',progress:'86%',current:'Juz 30 · Al-Mulk 1–12',target:'Selesaikan Juz 30',history:[['Setoran Baru','Al-Mulk 1–12','Lulus'],['Murajaah','Al-Mulk 1–8','Lulus']]},
    nabila:{name:'Nabila Azzahra',progress:'68%',current:'Juz 30 · Al-Waqi\'ah 1–18',target:'Al-Waqi\'ah pekan ini',history:[['Murajaah','Al-Waqi\'ah 1–18','Perlu Ulang']]},
    ahmad:{name:'Ahmad Fauzan',progress:'77%',current:'Juz 30 · An-Naba 1–20',target:'An-Naba pekan ini',history:[['Setoran Baru','An-Naba 1–20','Lulus']]}
  };
  $$('[data-tahfidz-detail]').forEach(button=>button.addEventListener('click',()=>{
    const profile=profiles[button.dataset.tahfidzDetail];if(!profile)return;const panel=openDialog('Detail Hafalan · '+profile.name,true);const body=el('div','form-modal__body');
    const info=el('div','tahfidz-detail-summary');
    [['Progres',profile.progress],['Hafalan terakhir',profile.current],['Target',profile.target]].forEach(([label,value])=>{const card=el('article');card.append(el('span','',label),el('strong','',value));info.append(card);});body.append(info);
    const tabs=el('div','tahfidz-tabs');const panelContent=el('div','role-panel');
    const panels={
      'Riwayat Hafalan':()=>{panelContent.replaceChildren();profile.history.forEach(([type,material,result])=>panelContent.append(el('p','',type+' · '+material+' · '+result)));},
      'Target':()=>panelContent.replaceChildren(el('p','',profile.target+' · contoh, belum dari backend.')),
      'Murajaah':()=>panelContent.replaceChildren(el('p','','Lihat riwayat setoran yang perlu diulang.'))
    };
    Object.entries(panels).forEach(([title,draw],index)=>tabs.append(btn(title,'table-action'+(index===0?' is-current':''),()=>{$$('button',tabs).forEach(x=>x.classList.toggle('is-current',x.textContent===title));draw();})));
    body.append(tabs,panelContent,el('div','form-note','Data demonstrasi. Santri dapat melihat progres tetapi tidak mengesahkan setoran resmi.'));
    const footer=el('footer','form-modal__footer');footer.append(btn('Tutup','button button--secondary',closeDialog));
    if($('[data-form="tahfidz"]'))footer.append(btn('Input Setoran','button button--primary',()=>{closeDialog();openForm('tahfidz',profile.name);}));
    body.append(footer);panel.append(body);panels['Riwayat Hafalan']();
  }));

  const students=[
    ['Ahmad Fauzan','BK26001','VII A','Putra 1 · A-01'],['Nabila Azzahra','BK26003','VII B','Putri 1 · P-01'],
    ['Rizky Maulana','BK25014','VIII A','Putra 1 · A-01'],['Fikri Hidayat','BK26004','IX A','Putra 2 · B-03'],
    ['Siti Rahmah','BK25018','VIII B','Putri 1 · P-01'],['Muhammad Fajar','BK26021','VII A','Putra 1 · A-01']
  ];
  const classroom=['VII A','VII B','VIII A','VIII B','IX A'];
  for(let i=7;i<=100;i++){
    const number=String(i).padStart(3,'0'),className=classroom[i%classroom.length],room=['Putra 1 · A-01','Putri 1 · P-01','Putra 2 · B-03','Putri 2 · P-02'][i%4];
    students.push(['Santri contoh '+number,'BKD'+number,className,room]);
  }
  $$('[data-bulk-attendance]').forEach(button=>button.addEventListener('click',()=>{
    const pesantren=button.dataset.bulkAttendance==='pesantren';
    const panel=openDialog(pesantren?'Absensi Pesantren · Input massal':'Absensi Sekolah · Input massal',true);
    const toolbar=el('div','bulk-toolbar'), search=el('input'), activity=el('select'), group=el('select');
    search.type='search';search.placeholder='Cari nama atau NIS';search.setAttribute('aria-label','Cari santri');
    const searchBox=el('div','search-box');searchBox.append(icon('search'),search);
    if(pesantren){addOptions(activity,activeWorship(),'Pilih kegiatan *');activity.setAttribute('aria-label','Kegiatan');activity.required=true;toolbar.append(searchBox,activity);}
    else toolbar.append(searchBox);
    addOptions(group,[...new Set(students.map(row=>pesantren?row[3]:row[2]))],pesantren?'Pilih kamar *':'Pilih kelas *');
    group.setAttribute('aria-label',pesantren?'Kamar':'Kelas');toolbar.append(group);
    const all=btn('Semua Hadir','button button--secondary',()=>{
      $$('[data-attendance-row]',list).forEach(row=>{const present=$('input[value=Hadir]',row);present.checked=true;present.dispatchEvent(new Event('change'));});
    });all.disabled=true;toolbar.append(all);
    const form=el('form','form-modal__body');const list=el('div','bulk-attendance');const note=el('div','form-note','Pilih '+(pesantren?'kegiatan dan kamar':'kelas')+' untuk memuat santri contoh. Belum terhubung ke roster aktif.');
    note.setAttribute('role','status');note.setAttribute('aria-live','polite');let status=new Map();
    const draw=()=>{
      const chosen=group.value;list.replaceChildren();if(!chosen){list.append(el('p','bulk-empty','Pilih '+(pesantren?'kamar':'kelas')+' terlebih dahulu.'));all.disabled=true;return;}
      const roster=students.filter(row=>(pesantren?row[3]:row[2])===chosen);
      const query=search.value.trim().toLowerCase();const filtered=roster.filter(row=>!query||row[0].toLowerCase().includes(query)||row[1].toLowerCase().includes(query));
      all.disabled=!filtered.length;
      filtered.forEach(student=>{
        const key=student[1],row=el('div','attendance-row');row.dataset.attendanceRow=key;
        const person=el('div','attendance-person');const avatar=el('span','person-avatar',student[0].split(' ').map(part=>part[0]).join('').slice(0,2));const desc=el('span');desc.append(el('strong','',student[0]),el('small','',student[1]+' · '+student[2]+' · '+student[3]));person.append(avatar,desc);
        const radio=el('div','attendance-status');radio.setAttribute('role','radiogroup');radio.setAttribute('aria-label','Status '+student[0]);
        const reasonWrap=el('label','attendance-reason');reasonWrap.hidden=true;reasonWrap.append(el('span','sr-only','Keterangan Izin wajib untuk '+student[0]));const reason=el('input');reason.type='text';reason.placeholder='Keterangan Izin *';reason.setAttribute('aria-label','Keterangan Izin wajib untuk '+student[0]);reasonWrap.append(reason);
        ['Hadir','Izin','Sakit','Alfa'].forEach(value=>{const label=el('label'),control=el('input'),caption=el('span','',value);control.type='radio';control.name='att-'+key;control.value=value;control.checked=(status.get(key)?.value||'Hadir')===value;control.addEventListener('change',()=>{const entry=status.get(key)||{value:'Hadir',reason:''};entry.value=value;status.set(key,entry);reasonWrap.hidden=value!=='Izin';reason.required=value==='Izin';if(value!=='Izin'){entry.reason='';reason.value='';}});label.append(control,caption);radio.append(label);});
        reason.value=status.get(key)?.reason||'';reason.addEventListener('input',()=>{const entry=status.get(key)||{value:'Izin',reason:''};entry.reason=reason.value;status.set(key,entry);});
        const selected=status.get(key)?.value||'Hadir';reasonWrap.hidden=selected!=='Izin';reason.required=selected==='Izin';
        row.append(person,radio,reasonWrap);list.append(row);
      });
      if(!filtered.length)list.append(el('p','bulk-empty','Tidak ada santri contoh yang cocok.'));
      message(note,'Daftar contoh: '+filtered.length+' dari '+roster.length+'. Pilihan tetap tersimpan saat mencari. Backend roster aktif belum terhubung.');
    };
    search.addEventListener('input',draw);group.addEventListener('change',()=>{status=new Map();draw();});draw();
    const footer=el('footer','form-modal__footer');footer.append(btn('Batal','button button--secondary',closeDialog));const submit=el('button','button button--primary','Tinjau absensi');submit.type='submit';footer.append(submit);
    form.append(list,note,footer);panel.append(toolbar,form);
    form.addEventListener('submit',event=>{event.preventDefault();if((pesantren&&!activity.value)||!group.value){message(note,'Pilih '+(pesantren?'kegiatan dan kamar':'kelas')+' terlebih dahulu.','error');(pesantren&&!activity.value?activity:group).focus();return;}
      const roster=students.filter(row=>(pesantren?row[3]:row[2])===group.value);
      if(!roster.length){message(note,'Daftar santri kosong. Tidak ada yang dapat ditinjau.','error');return;}
      const missing=roster.find(row=>status.get(row[1])?.value==='Izin'&&!status.get(row[1])?.reason.trim());
      if(missing){search.value='';draw();const field=$('[data-attendance-row="'+missing[1]+'"] .attendance-reason input',list);message(note,'Keterangan Izin wajib untuk '+missing[0]+'.','error');field?.focus();return;}
      message(note,'Pratinjau '+roster.length+' baris siap diperiksa. BACKEND REQUIRED: belum ada absensi yang disimpan.','valid');
    });
  }));

  const excelSchemas={
    santri:['nis','nama_lengkap','jenis_kelamin','kelas','asrama','kamar','tahun_masuk','status'],
    kamar:['kode_asrama','nama_asrama','kode_kamar','nama_kamar','kapasitas','status'],
    musyrif:['nomor_staf','nama_lengkap','jenis_kelamin','asrama','mulai_tugas','status'],
    aktivitas:['tanggal','waktu','nama_kegiatan','lokasi','asrama','penanggung_jawab','catatan'],
    siswa:['nis','nama_lengkap','jenis_kelamin','kelas','tahun_masuk','status'],
    kelas:['kode_kelas','nama_kelas','tingkat','wali_kelas','kapasitas','tahun_akademik','status'],
    'guru-staf':['nomor_staf','nama_lengkap','jenis','mata_pelajaran','wali_kelas','tanggal_mulai','status'],
    mapel:['kode_mapel','nama_mapel','kategori','tingkat','guru_pengampu','status'],
    jadwal:['hari','kelas','mata_pelajaran','guru','waktu_mulai','waktu_selesai','ruang'],
    nilai:['nis','kelas','mata_pelajaran','jenis_penilaian','nilai','semester','tahun_akademik','status'],
    'tahun-akademik':['kode','nama','tanggal_mulai','tanggal_selesai','semester_aktif','status']
  };
  const optionalFields=new Set(['catatan','wali_kelas','mata_pelajaran','guru_pengampu','kamar','ruang']);
  const workbook=()=>window.XLSX;
  const download=(key,note)=>{
    const columns=excelSchemas[key];if(!columns)return;
    if(!workbook()){if(note)message(note,'Pembuat berkas XLSX belum tersedia. Muat ulang saat koneksi aktif.','error');else alert('Pembuat berkas XLSX belum tersedia.');return;}
    const ws=workbook().utils.aoa_to_sheet([columns,columns.map(()=> '')]);
    const wb=workbook().utils.book_new();workbook().utils.book_append_sheet(wb,ws,'Template');
    workbook().writeFile(wb,'template-'+key+'.xlsx');
  };
  $$('[data-template]').forEach(button=>button.addEventListener('click',()=>download(button.dataset.template)));
  $$('[data-excel-import]').forEach(button=>button.addEventListener('click',()=>{
    const key=button.dataset.excelImport,columns=excelSchemas[key];if(!columns)return;
    const panel=openDialog('Upload Excel · '+key,true);const body=el('div','form-modal__body'),upload=el('label','excel-dropzone'),file=el('input');
    file.type='file';file.accept='.xlsx';file.setAttribute('aria-label','Pilih berkas Excel XLSX');upload.append(file,icon('upload'),el('strong','','Pilih file .xlsx'),el('small','', 'Maksimum pratinjau 100 baris · belum ada upload server'));
    const note=el('div','form-note','Pilih berkas untuk mulai memeriksa struktur.');note.setAttribute('role','status');note.setAttribute('aria-live','polite');
    const schema=el('div','excel-schema');schema.append(el('strong','','Kolom template'));const tags=el('div');columns.forEach(column=>tags.append(el('span','',column)));schema.append(tags);
    const preview=el('div','excel-preview');preview.hidden=true;const footer=el('footer','form-modal__footer');
    const template=btn('Unduh Template .xlsx','button button--secondary',()=>download(key,note));
    const confirm=btn('Konfirmasi simulasi','button button--primary',()=>message(note,'Simulasi selesai. Tidak ada data yang disimpan. BACKEND REQUIRED.','valid'));confirm.disabled=true;confirm.hidden=true;
    const validate=btn('Validasi & pratinjau','button button--primary',async()=>{
      confirm.disabled=true;confirm.hidden=true;preview.replaceChildren();preview.hidden=true;
      if(!file.files[0]){message(note,'Pilih file .xlsx terlebih dahulu.','error');return;}
      if(!/\.xlsx$/i.test(file.files[0].name)){message(note,'Format utama yang didukung adalah .xlsx.','error');return;}
      if(!workbook()){message(note,'Pembaca XLSX belum tersedia. Coba lagi saat koneksi aktif.','error');return;}
      message(note,'Memvalidasi struktur dan baris contoh…');
      try{
        const buffer=await file.files[0].arrayBuffer(),wb=workbook().read(buffer,{type:'array'}),sheet=wb.Sheets[wb.SheetNames[0]];
        const rows=workbook().utils.sheet_to_json(sheet,{header:1,blankrows:false,defval:''});
        const headers=(rows[0]||[]).map(value=>String(value).trim());
        const missing=columns.filter(column=>!headers.includes(column));
        if(missing.length){message(note,'Header tidak valid. Kolom kurang: '+missing.join(', ')+'.','error');return;}
        const candidates=rows.slice(1).filter(row=>row.some(value=>String(value).trim()));
        if(!candidates.length){message(note,'File belum berisi baris data.','error');return;}
        const errors=[];const table=el('table','data-table'),thead=el('thead'),head=el('tr');
        ['Baris','Ringkasan','Status'].forEach(label=>head.append(el('th','',label)));thead.append(head);const tbody=el('tbody');
        candidates.slice(0,100).forEach((row,index)=>{
          const empty=columns.filter(column=>!optionalFields.has(column)&&!String(row[headers.indexOf(column)]??'').trim());
          const problem=empty.length?'Kolom wajib kosong: '+empty.join(', '):'Struktur lengkap; referensi FK akan divalidasi server.';
          if(empty.length)errors.push(index+2);
          const tr=el('tr');tr.append(el('td','',String(index+2)),el('td','',String(row[headers.indexOf(columns[0])]||'—')),el('td','',problem));tbody.append(tr);
        });
        table.append(thead,tbody);const scroller=el('div','table-wrap');scroller.append(table);preview.append(scroller);
        if(candidates.length>100)preview.append(el('p','modal-subtitle','Menampilkan 100 baris pertama dari '+candidates.length+'. Semua baris memerlukan validasi backend.'));
        preview.hidden=false;
        if(errors.length)message(note,'Baris tidak valid: '+errors.join(', ')+'. Perbaiki file lalu validasi ulang.','error');
        else{message(note,'Pratinjau '+candidates.length+' baris lengkap secara struktur. Siap diimport setelah backend terhubung; FK belum diverifikasi.','valid');confirm.disabled=false;confirm.hidden=false;}
      }catch(error){message(note,'File tidak dapat dibaca. Gunakan template .xlsx.','error');}
    });
    file.addEventListener('change',()=>{confirm.disabled=true;confirm.hidden=true;preview.hidden=true;message(note,file.files[0]?'File dipilih: '+file.files[0].name:'Pilih berkas .xlsx.');});
    footer.append(template,btn('Batal','button button--secondary',closeDialog),validate,confirm);
    body.append(upload,schema,note,preview,footer);panel.append(body);
  }));
  // Existing demo-only buttons are visibly explained rather than silently inert.
  $$('button.table-action:not([data-help-topic]),button.card-link').forEach(button=>{
    if(button.dataset.tahfidzDetail)return;
    button.addEventListener('click',()=>{const row=button.closest('tr,article');const text=(row?.querySelector('strong,h2')?.textContent||'Rincian contoh').trim();const panel=openDialog(text);panel.append(el('div','form-modal__body','Rancangan antarmuka ini menggunakan data contoh. Rincian dan aksi akan tersedia setelah backend terhubung.'));});
  });
});


document.addEventListener('DOMContentLoaded',()=> {
 const report=document.querySelector('[data-mudir-report]');
 if(!report)return;
 const from=report.querySelector('[data-report-from]');
 const to=report.querySelector('[data-report-to]');
 const student=report.querySelector('[data-report-student]');
 const status=report.querySelector('[data-report-status]');
 const nameTarget=document.querySelector('[data-report-name]');
 const rangeTarget=document.querySelector('[data-report-range]');
 const periodButtons=[...report.querySelectorAll('[data-report-period]')];
 const formatDate=(value)=>{if(!value)return '-';const d=new Date(value+'T00:00:00');return new Intl.DateTimeFormat('id-ID',{day:'numeric',month:'long',year:'numeric'}).format(d)};
 const setPeriod=(days)=>{
   const end=to?.value?new Date(to.value+'T00:00:00'):new Date();
   const start=new Date(end);start.setDate(end.getDate()-(days-1));
   if(from)from.value=start.toISOString().slice(0,10);
   periodButtons.forEach(b=>b.classList.toggle('is-active',Number(b.dataset.reportPeriod)===days));
 };
 periodButtons.forEach(b=>b.addEventListener('click',()=>setPeriod(Number(b.dataset.reportPeriod))));
 report.querySelector('[data-report-apply]')?.addEventListener('click',()=>{
   const selectedName=(student?.value||'Santri contoh').trim()||'Santri contoh';
   if(nameTarget)nameTarget.textContent=selectedName;
   const range=(from?.value&&to?.value)?formatDate(from.value)+' – '+formatDate(to.value):'Periode belum lengkap';
   if(rangeTarget)rangeTarget.textContent=range;
   if(status){status.textContent='Menampilkan simulasi laporan '+selectedName+' · '+range+'. Data nyata akan diambil setelah backend terhubung.';status.classList.add('is-success')}
 });
});


document.addEventListener('DOMContentLoaded',()=> {
 const modal=document.querySelector('[data-admin-master-modal]');
 if(!modal)return;
 const title=modal.querySelector('[data-admin-modal-title]');
 const fields=modal.querySelector('[data-admin-modal-fields]');
 const save=modal.querySelector('[data-admin-modal-save]');
 let mode=null, editingRow=null;

 const close=()=>{modal.hidden=true;document.body.classList.remove('modal-open');mode=null;editingRow=null};
 const field=(label,name,value='',type='text')=>{
   const wrap=document.createElement('label');wrap.className='admin-master-modal-field';
   const span=document.createElement('span');span.textContent=label;
   const input=document.createElement('input');input.name=name;input.type=type;input.value=value;input.required=true;
   wrap.append(span,input);return wrap;
 };
 const selectField=(label,name,options,current='')=>{
   const wrap=document.createElement('label');wrap.className='admin-master-modal-field';
   const span=document.createElement('span');span.textContent=label;
   const select=document.createElement('select');select.name=name;
   options.forEach(v=>{const o=document.createElement('option');o.value=v;o.textContent=v;o.selected=v===current;select.append(o)});
   wrap.append(span,select);return wrap;
 };
 const open=(nextMode,row=null)=>{
   mode=nextMode;editingRow=row;fields.innerHTML='';
   if(nextMode==='type'){
     const existing=row?.querySelector('[data-type-name]')?.textContent.trim()||'';
     title.textContent=row?'Ubah jenis pembayaran':'Tambah jenis pembayaran';
     fields.append(field('Kode','code',row?.children[0]?.textContent.trim()||''),field('Nama jenis','name',existing),selectField('Frekuensi','frequency',['Bulanan','Tahunan','Sekali','Insidental'],row?.children[2]?.textContent.trim()||'Bulanan'),field('Nominal default','amount',row?.children[3]?.textContent.trim()||'Dinamis'));
   }else{
     title.textContent=row?'Ubah metode pembayaran':'Tambah metode pembayaran';
     fields.append(selectField('Tipe metode','kind',['Transfer Bank','Tunai','QRIS','Virtual Account','Lainnya']),field('Nama / label','name',row?.querySelector('h2')?.textContent.trim()||''),field('Bank / lokasi','provider',row?.querySelector('strong')?.textContent.trim()||''),field('Nomor rekening / informasi','account',row?.querySelector('.payment-account-number')?.textContent.trim()||''),field('Atas nama / instruksi','holder',''));
   }
   modal.hidden=false;document.body.classList.add('modal-open');
   setTimeout(()=>fields.querySelector('input,select')?.focus(),0);
 };
 document.querySelectorAll('[data-admin-modal-close]').forEach(b=>b.addEventListener('click',close));
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!modal.hidden)close()});
 document.querySelector('[data-admin-add-type]')?.addEventListener('click',()=>open('type'));
 document.querySelectorAll('[data-admin-edit-type]').forEach(b=>b.addEventListener('click',()=>open('type',b.closest('tr'))));
 document.querySelector('[data-admin-add-method]')?.addEventListener('click',()=>open('method'));
 document.querySelectorAll('[data-admin-edit-method]').forEach(b=>b.addEventListener('click',()=>open('method',b.closest('.payment-method-card'))));
 document.querySelectorAll('[data-admin-archive]').forEach(b=>b.addEventListener('click',()=>{
   const row=b.closest('tr,.payment-method-card');const badge=row?.querySelector('.badge');
   if(!badge)return;
   const inactive=badge.textContent.trim()==='Nonaktif';
   badge.textContent=inactive?'Aktif':'Nonaktif';badge.className='badge '+(inactive?'badge--success':'badge--warning');
   b.textContent=inactive?(row.matches('tr')?'Arsipkan':'Nonaktifkan'):'Aktifkan';
 }));
 save?.addEventListener('click',()=>{
   const data=Object.fromEntries([...fields.querySelectorAll('input,select')].map(x=>[x.name,x.value.trim()]));
   if([...fields.querySelectorAll('[required]')].some(x=>!x.value.trim()))return;
   if(mode==='type'){
     if(editingRow){
       editingRow.children[0].textContent=data.code;editingRow.querySelector('[data-type-name]').textContent=data.name;editingRow.children[2].textContent=data.frequency;editingRow.children[3].textContent=data.amount;
     }else{
       const tbody=document.querySelector('[data-payment-type-table] tbody');
       const tr=document.createElement('tr');
       tr.innerHTML='<td></td><td data-type-name></td><td></td><td></td><td><span class="badge badge--success">Aktif</span></td><td><button class="table-action" type="button" data-admin-edit-type>Ubah</button> <button class="table-action" type="button" data-admin-archive>Arsipkan</button></td>';
       tr.children[0].textContent=data.code;tr.children[1].textContent=data.name;tr.children[2].textContent=data.frequency;tr.children[3].textContent=data.amount;tbody?.append(tr);
       tr.querySelector('[data-admin-edit-type]')?.addEventListener('click',()=>open('type',tr));
       tr.querySelector('[data-admin-archive]')?.addEventListener('click',e=>{const badge=tr.querySelector('.badge');badge.textContent='Nonaktif';badge.className='badge badge--warning';e.currentTarget.textContent='Aktifkan'});
     }
   }else{
     const list=document.querySelector('[data-payment-method-list]');
     if(editingRow){
       editingRow.querySelector('h2').textContent=data.name;editingRow.querySelector('strong').textContent=data.provider;const acct=editingRow.querySelector('.payment-account-number');if(acct)acct.textContent=data.account||data.kind;
     }else if(list){
       const article=document.createElement('article');article.className='panel payment-method-card';
       article.innerHTML='<div><span class="badge badge--success">Aktif</span><small></small></div><span class="role-panel__icon"></span><h2></h2><strong></strong><p class="payment-account-number"></p><p></p><small>Metode baru · simulasi frontend.</small><div class="role-actions"><button class="button button--secondary" type="button" data-admin-edit-method>Ubah</button><button class="button button--secondary" type="button" data-admin-archive>Nonaktifkan</button></div>';
       article.querySelector('small').textContent=data.kind;article.querySelector('h2').textContent=data.name;article.querySelector('strong').textContent=data.provider;article.querySelector('.payment-account-number').textContent=data.account;article.querySelectorAll('p')[1].textContent=data.holder;
       list.append(article);article.querySelector('[data-admin-edit-method]')?.addEventListener('click',()=>open('method',article));
     }
   }
   close();
 });
 document.querySelectorAll('[data-admin-notify]').forEach(b=>b.addEventListener('click',()=>{b.textContent='Simulasi terkirim';b.disabled=true}));
});
