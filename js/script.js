// Navigation toggle for small screens
const navToggle = document.querySelector('.nav-toggle');
const navList = document.querySelector('.nav-list');
if (navToggle) {
  navToggle.addEventListener('click', () => {
    const expanded = navToggle.getAttribute('aria-expanded') === 'true';
    navToggle.setAttribute('aria-expanded', String(!expanded));
    navList.style.display = expanded ? 'none' : 'flex';
  });
}

// Smooth scrolling for internal links
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', function(e){
    const target = document.querySelector(this.getAttribute('href'));
    if(target){
      e.preventDefault();
      target.scrollIntoView({behavior:'smooth',block:'start'});
      // close nav on mobile
      if(window.innerWidth < 700 && navList){navList.style.display='none';navToggle.setAttribute('aria-expanded','false')}
    }
  })
})

// Reveal on scroll
const reveals = document.querySelectorAll('.reveal');
const io = new IntersectionObserver(entries =>{
  entries.forEach(entry =>{
    if(entry.isIntersecting){
      entry.target.classList.add('is-visible');
      io.unobserve(entry.target);
    }
  })
},{threshold:0.12});
reveals.forEach(r => io.observe(r));

// Inject current year in footer
const y = new Date().getFullYear();
document.getElementById('year').textContent = y;

// Hero card tilt + blob parallax
const heroCard = document.querySelector('.hero-card');
const blobs = document.querySelectorAll('.blob');
const hero = document.querySelector('.hero');
if(heroCard && hero){
  hero.addEventListener('mousemove', (e)=>{
    const rect = hero.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    const rx = (-y * 6).toFixed(2);
    const ry = (x * 10).toFixed(2);
    heroCard.style.transform = `perspective(800px) rotateX(${rx}deg) rotateY(${ry}deg)`;
    heroCard.classList.add('tilt');
    // move blobs subtly
    blobs.forEach((b, i)=>{
      const mx = x * (20 + i*8);
      const my = y * (14 + i*6);
      b.style.transform = `translate3d(${mx}px, ${my}px, 0) scale(1)`;
    })
  });
  hero.addEventListener('mouseleave', ()=>{
    heroCard.style.transform = '';
    heroCard.classList.remove('tilt');
    blobs.forEach(b=>b.style.transform='');
  });
  // touch friendly: small parallax on touchmove
  hero.addEventListener('touchmove', (ev)=>{
    const t = ev.touches[0];
    if(!t) return;
    const rect = hero.getBoundingClientRect();
    const x = (t.clientX - rect.left) / rect.width - 0.5;
    const y = (t.clientY - rect.top) / rect.height - 0.5;
    heroCard.style.transform = `perspective(800px) rotateX(${(-y*4).toFixed(2)}deg) rotateY(${(x*6).toFixed(2)}deg)`;
  }, {passive:true});
}

// Preloader: typewriter + hide on load
const preloader = document.getElementById('preloader');
const typer = document.getElementById('typewriter');
const message = "Narrative building and data backed research...";
function typeText(el, text, delay=60){
  return new Promise(res=>{
    let i=0;
    const t = setInterval(()=>{
      el.textContent = text.slice(0,i+1);
      i++;
      if(i>=text.length){clearInterval(t);res();}
    }, delay);
  })
}

window.addEventListener('load', async ()=>{
  try{
    if(typer) await typeText(typer, message, 35);
  }catch(e){/* ignore */}
  if(preloader){
    preloader.classList.add('hidden');
    setTimeout(()=>{preloader.style.display='none'},500);
  }
  // reveal profile card after load
  const profileCard = document.querySelector('.profile-card');
  if(profileCard){setTimeout(()=>profileCard.classList.add('is-visible'),450)}
});

// Spiral background animation + pointer parallax
const spiral = document.querySelector('.spiral-bg');
let rot = 0;
let lastTime = 0;
function spiralLoop(ts){
  if(!lastTime) lastTime = ts;
  const dt = ts - lastTime;
  lastTime = ts;
  // slow rotation
  rot += dt * 0.003; // degrees per ms ~0.18deg/sec
  if(spiral){
    spiral.style.transform = `rotate(${rot}deg)`;
  }
  requestAnimationFrame(spiralLoop);
}
requestAnimationFrame(spiralLoop);

// pointer parallax for spiral
document.addEventListener('mousemove', (e)=>{
  if(!spiral) return;
  const x = (e.clientX / window.innerWidth) - 0.5;
  const y = (e.clientY / window.innerHeight) - 0.5;
  const mx = x * 12;
  const my = y * 8;
  spiral.style.transform = `translate3d(${mx}px, ${my}px, 0) rotate(${rot}deg)`;
});

// Nav drawer controls with backdrop, ESC-to-close, and simple focus trap
const navToggleBtn = document.getElementById('navToggle');
const navDrawer = document.getElementById('navDrawer');
const navClose = document.getElementById('navClose');
const drawerBackdrop = document.getElementById('drawerBackdrop');

function openDrawer(){
  if(!navDrawer) return;
  navDrawer.setAttribute('aria-hidden','false');
  if(drawerBackdrop) drawerBackdrop.setAttribute('aria-hidden','false');
  if(navToggleBtn) navToggleBtn.setAttribute('aria-expanded','true');
  // save previously focused element to restore later
  openDrawer._prevFocus = document.activeElement;
  // focus first focusable element inside drawer
  const focusable = navDrawer.querySelectorAll('a, button');
  if(focusable.length) focusable[0].focus();
  // start trapping focus
  document.addEventListener('focus', trapFocus, true);
}

function closeDrawer(){
  if(!navDrawer) return;
  navDrawer.setAttribute('aria-hidden','true');
  if(drawerBackdrop) drawerBackdrop.setAttribute('aria-hidden','true');
  if(navToggleBtn) navToggleBtn.setAttribute('aria-expanded','false');
  // remove focus trap
  document.removeEventListener('focus', trapFocus, true);
  // restore focus
  if(openDrawer._prevFocus) openDrawer._prevFocus.focus();
}

function trapFocus(e){
  if(!navDrawer) return;
  if(navDrawer.getAttribute('aria-hidden') === 'true') return; // not open
  if(navDrawer.contains(e.target)) return; // focus is inside drawer
  // otherwise move focus back to drawer
  const focusable = navDrawer.querySelectorAll('a, button');
  if(focusable.length) focusable[0].focus();
  e.stopPropagation();
}

if(navToggleBtn && navDrawer){
  navToggleBtn.addEventListener('click', ()=>{
    const open = navDrawer.getAttribute('aria-hidden') === 'false';
    if(open) closeDrawer(); else openDrawer();
  });
}
if(navClose){
  navClose.addEventListener('click', closeDrawer);
}
if(drawerBackdrop){
  drawerBackdrop.addEventListener('click', closeDrawer);
}
// close on ESC key
document.addEventListener('keydown', (e)=>{ if(e.key === 'Escape' || e.key === 'Esc'){ if(navDrawer && navDrawer.getAttribute('aria-hidden') === 'false') closeDrawer(); } });
// close drawer when clicking a link inside it
document.querySelectorAll('.nav-drawer-list a').forEach(a=>a.addEventListener('click', closeDrawer));