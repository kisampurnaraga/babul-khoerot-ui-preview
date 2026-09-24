document.addEventListener('DOMContentLoaded',()=>{
 document.querySelector('[data-preview-login]')?.addEventListener('click',()=>{window.location.href='pesantren.html'});
 const toggle=document.querySelector('[data-password-toggle]');
 if(toggle)toggle.addEventListener('click',()=>{const input=document.getElementById('password');const shown=input.type==='text';input.type=shown?'password':'text';toggle.setAttribute('aria-pressed',String(!shown));toggle.setAttribute('aria-label',shown?'Tampilkan kata sandi':'Sembunyikan kata sandi');toggle.querySelector('span').textContent=shown?'Tampilkan':'Sembunyikan'});
 const open=document.querySelector('[data-menu-open]');const close=()=>{document.body.classList.remove('menu-open');open?.setAttribute('aria-expanded','false')};open?.addEventListener('click',()=>{document.body.classList.add('menu-open');open.setAttribute('aria-expanded','true')});document.querySelectorAll('[data-menu-close]').forEach(button=>button.addEventListener('click',close));
 const switcher=document.querySelector('[data-room-toggle]'),menu=document.querySelector('[data-room-menu]');switcher?.addEventListener('click',()=>{let expanded=switcher.getAttribute('aria-expanded')==='true';switcher.setAttribute('aria-expanded',String(!expanded));menu.hidden=expanded});document.addEventListener('keydown',e=>{if(e.key==='Escape'){close();if(menu)menu.hidden=true;switcher?.setAttribute('aria-expanded','false')}});
 document.querySelectorAll('a[aria-disabled="true"]').forEach(a=>a.addEventListener('click',e=>e.preventDefault()));
});
