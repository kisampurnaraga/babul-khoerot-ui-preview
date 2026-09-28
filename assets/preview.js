/* Static mirror adapter. No network, authentication, storage, or financial mutation. */
document.addEventListener('submit', event => {
  const form=event.target;
  if(form.matches('[data-static-login]')) { event.preventDefault();event.stopImmediatePropagation();location.assign(form.getAttribute('action'));return; }
  if(form.matches('[data-static-filter]')) {
    event.preventDefault();event.stopImmediatePropagation();
    const data=new FormData(form), labels={PENDING:'Menunggu Verifikasi',VERIFIED:'Terverifikasi',REJECTED:'Ditolak'};
    document.querySelectorAll('tr:has([data-payment-detail])').forEach(row=>{
      const status=data.get('payment_status'), student=data.get('payment_student_id'), type=data.get('payment_type_id');
      const studentLabel=form.querySelector('[name=payment_student_id]')?.selectedOptions[0]?.textContent.split(' · ').at(-1);
      const typeLabel=form.querySelector('[name=payment_type_id]')?.selectedOptions[0]?.textContent;
      const date='2026-09-28',from=data.get('payment_date_from'),to=data.get('payment_date_to');
      row.hidden=!!((status&&!row.textContent.includes(labels[status]))||(student&&!row.textContent.includes(studentLabel))||(type&&!row.textContent.includes(typeLabel))||(from&&date<from)||(to&&date>to));
    });
    let message=form.querySelector('[data-preview-filter-result]');if(!message){message=document.createElement('p');message.dataset.previewFilterResult='';message.setAttribute('role','status');form.append(message);}
    message.textContent=document.querySelectorAll('tr:has([data-payment-detail]):not([hidden])').length+' transaksi contoh. Filter hanya untuk data preview.';
  }
},true);
document.addEventListener('change',event=>{
  const child=event.target.closest('[data-child-selector]');
  if(child){event.stopImmediatePropagation();location.assign(location.pathname.replace(/-family-[ab]\.html$/,`-family-${child.value}.html`));return;}
  const role=event.target.closest('[data-preview-role]');if(!role)return;
  const value=role.value,prefix=role.dataset.previewPrefix,room=role.dataset.previewRoom;
  const path=role.hasAttribute('data-preview-home')?(value==='admin'?'home.html':`screens/${value}-home.html`):(value==='admin'?`${room}.html`:`screens/${value}-${room}.html`);
  location.assign(prefix+path);
},true);
document.addEventListener('click',event=>{
  const action=event.target.closest('[data-verify-payment],[data-create-reminder],[data-admin-archive]');if(!action)return;
  event.preventDefault();event.stopImmediatePropagation();
  let note=action.parentElement.querySelector('[data-simulation-note]');if(!note){note=document.createElement('p');note.className='form-note';note.dataset.simulationNote='';note.setAttribute('role','status');action.parentElement.append(note);}
  note.textContent='Simulasi saja. Tidak ada status, transaksi, atau pesan yang disimpan maupun dikirim.';
},true);
// Complete keyboard navigation for source-rendered static administration modals.
let modalTrigger=null;
document.addEventListener('click',event=>{if(event.target.closest('[data-open-payment],[data-payment-detail],[data-admin-new-bill],[data-admin-add-type],[data-admin-add-method]'))modalTrigger=event.target.closest('button');},true);
document.addEventListener('keydown',event=>{
  const modal=document.querySelector('.form-modal:not([hidden]),[data-onboarding]:not([hidden])');if(!modal)return;
  if(event.key==='Escape'){
    const close=modal.querySelector('[data-payment-detail-close],[data-payment-close],[data-bill-close],[data-admin-modal-close],[data-onboarding-close]');close?.click();modalTrigger?.focus();
  }
  if(event.key==='Tab'){
    const items=[...modal.querySelectorAll('button,input,select,textarea,a[href]')].filter(el=>!el.disabled&&el.getClientRects().length);
    if(!items.length)return;const first=items[0],last=items.at(-1);
    if(event.shiftKey&&(document.activeElement===first||!modal.contains(document.activeElement))){event.preventDefault();last.focus();}
    else if(!event.shiftKey&&(document.activeElement===last||!modal.contains(document.activeElement))){event.preventDefault();first.focus();}
  }
});
