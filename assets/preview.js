/* Static routing only; never calls Laravel endpoints or persists data. */
document.addEventListener('change',event=>{
  const child=event.target.closest('[data-child-selector]');
  if(child){
    event.stopImmediatePropagation();
    const next=location.pathname.replace(/-family-[ab]\.html$/,`-family-${child.value}.html`);
    if(next!==location.pathname)location.assign(next);
    return;
  }
  const role=event.target.closest('[data-preview-role]');
  if(role){
    const room=role.dataset.previewRoom;
    const prefix=role.dataset.previewPrefix;
    const target=role.value==='admin'?`${room}.html`:`screens/${role.value}-${room}.html`;
    location.assign(prefix+target);
  }
},true);
