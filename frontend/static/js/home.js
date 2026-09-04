/* =========================================================
   LOFT DESIGN — HOMEPAGE JAVASCRIPT (V23)
   ========================================================= */

const COMPANY={name:'S.A.R.L. LOFT DESIGN',rib:'03200108218235120814 Agence AGB AKBOU',rc:'06/01 0189926 B 19',nis:'001906250020265',nif:'001906018992690',nart:'06252801027',mail:'loftdesign@live.fr',mobile:'07 76139475',address:'cité de la caserne AKBOU Bejaia 06001'};
const bgImages=['/static/imgs/header_bg_1.jpeg','https://loftdesign.bilnov.com/media/portfolio/thumbnails/Enscape_2026-02-05-20-45-23_Enscape_scene_8.jpg','https://loftdesign.bilnov.com/media/portfolio/thumbnails/Enscape_2025-11-02-20-03-26_Enscape_scene_1.png','https://loftdesign.bilnov.com/media/portfolio/thumbnails/Enscape_2024-10-27-23-48-12.png','https://loftdesign.bilnov.com/media/portfolio/thumbnails/SEJOUR_4.png'];
let bgIndex=0,bgFront=true;const bgA=document.querySelector('#bgA'),bgB=document.querySelector('#bgB');if(bgA&&bgB){bgA.style.backgroundImage=`url("${bgImages[0]}")`;bgB.style.backgroundImage=`url("${bgImages[1]}")`;setInterval(()=>{bgIndex=(bgIndex+1)%bgImages.length;const incoming=bgFront?bgB:bgA,outgoing=bgFront?bgA:bgB;incoming.style.backgroundImage=`url("${bgImages[bgIndex]}")`;incoming.style.opacity=1;outgoing.style.opacity=0;bgFront=!bgFront},9000);}
document.querySelectorAll('a[href^="#"]').forEach(a=>a.addEventListener('click',e=>{const hash=a.getAttribute('href');if(!hash||hash==='#'||hash==='#gallery')return;const el=document.querySelector(hash);if(!el)return;e.preventDefault();if(typeof window.closeGalleryApp==='function'){window.closeGalleryApp(true);}else{const gApp=document.getElementById('galleryApp');if(gApp){gApp.classList.remove('open');gApp.setAttribute('aria-hidden','true');document.body.classList.remove('galleryOpen');}}setTimeout(()=>{el.scrollIntoView({behavior:'smooth',block:'start'});},50)}));document.querySelectorAll('.serviceInfo,.infoCard,.storeCard').forEach(el=>el.addEventListener('click',e=>{if(e.target.closest('a'))return;if(matchMedia('(hover:none)').matches)el.classList.toggle('open')}));
/* Portfolio - DJAWAL CoverFlow logic without removed counters */
const P = (window.PORTFOLIO_DATA && window.PORTFOLIO_DATA.length > 0) ? window.PORTFOLIO_DATA : [
{name:'Appartement Chéraga',img:'https://loftdesign.bilnov.com/media/portfolio/thumbnails/Enscape_2026-02-05-20-45-23_Enscape_scene_8.jpg',vr:'https://loftdesign.bilnov.com/gallery/',gallery:['https://loftdesign.bilnov.com/media/portfolio/thumbnails/Enscape_2026-02-05-20-45-23_Enscape_scene_8.jpg','https://loftdesign.bilnov.com/media/spaces/gallery/living-room/16757/image_1.jpg','https://loftdesign.bilnov.com/media/spaces/gallery/kitchen-interior/11154/image_1.jpg']},
{name:'Suite contemporaine',img:'https://loftdesign.bilnov.com/media/portfolio/thumbnails/Enscape_2025-11-02-20-03-26_Enscape_scene_1.png',vr:'https://loftdesign.bilnov.com/gallery/',gallery:['https://loftdesign.bilnov.com/media/portfolio/thumbnails/Enscape_2025-11-02-20-03-26_Enscape_scene_1.png','https://loftdesign.bilnov.com/media/portfolio/thumbnails/SEJOUR_4.png']},
{name:'Épure urbaine',img:'https://loftdesign.bilnov.com/media/portfolio/thumbnails/Enscape_2024-10-27-23-48-12.png',vr:'https://loftdesign.bilnov.com/gallery/',gallery:['https://loftdesign.bilnov.com/media/portfolio/thumbnails/Enscape_2024-10-27-23-48-12.png','https://loftdesign.bilnov.com/media/spaces/gallery/children-room/10567/image_1_qP62mWe.jpg']},
{name:'Maison Sidi Aïch',img:'https://loftdesign.bilnov.com/media/portfolio/thumbnails/Enscape_2026-07-07-23-27-11.png',vr:'https://loftdesign.bilnov.com/gallery/',gallery:['https://loftdesign.bilnov.com/media/portfolio/thumbnails/Enscape_2026-07-07-23-27-11.png','https://loftdesign.bilnov.com/media/portfolio/thumbnails/Enscape_2026-01-02-19-38-33_Enscape_scene_14.png']},
{name:'Séjour Béjaïa',img:'https://loftdesign.bilnov.com/media/portfolio/thumbnails/SEJOUR_4.png',vr:'https://loftdesign.bilnov.com/gallery/',gallery:['https://loftdesign.bilnov.com/media/portfolio/thumbnails/SEJOUR_4.png','https://loftdesign.bilnov.com/media/spaces/gallery/living-room/16757/image_1.jpg']},
{name:'Triplex Béjaïa',img:'https://loftdesign.bilnov.com/media/portfolio/thumbnails/Enscape_2026-01-02-19-38-33_Enscape_scene_14.png',vr:'https://loftdesign.bilnov.com/gallery/',gallery:['https://loftdesign.bilnov.com/media/portfolio/thumbnails/Enscape_2026-01-02-19-38-33_Enscape_scene_14.png','https://loftdesign.bilnov.com/media/spaces/gallery/bathroom/15230/image_1_dsgPgFt.jpg']}
];
const S=document.querySelector('#slider');if(S){P.forEach((p,i)=>{const b=document.createElement('button');b.className='pc';b.dataset.i=i;b.innerHTML=`<img src="${p.img}" alt="${p.name}" loading="${i<3?'eager':'lazy'}"><a class="visit360" href="${p.vr}" target="_blank">Visite 360°</a>`;S.appendChild(b)});const C=[...S.children];let A=0,down=null,prog=0,drag=0,raf=0,last=0,hit=null,sx=0,sy=0;
const visibleCount=()=>{const w=S.clientWidth;if(innerWidth>innerHeight&&innerWidth<1024)return w<620?3:5;return w<560?3:w<900?5:w<1380?7:9};const cardSize=()=>{const r=S.getBoundingClientRect(),w=r.width,h=r.height;if(innerWidth>innerHeight&&innerWidth<1024)return Math.max(145,Math.min(245,w*.38,h*.80));if(innerWidth>=1500)return Math.max(300,Math.min(440,w*.27,h*.88));if(innerWidth>=1024)return Math.max(260,Math.min(390,w*.28,h*.87));if(innerWidth>=701)return Math.max(220,Math.min(330,w*.43,h*.84));return Math.max(180,Math.min(270,w*.64,h*.83))};const deltaIndex=i=>{let d=i-A;if(d>P.length/2)d-=P.length;if(d<-P.length/2)d+=P.length;return d};
function renderSlider(q=prog){if(typeof q!=='number'||!isFinite(q)||Math.abs(q)>2)q=prog;const r=S.getBoundingClientRect(),w=r.width,h=r.height;if(w<80||h<80)return false;const z=cardSize(),n=Math.max(1,(visibleCount()-1)/2),half=w*.48,f=Math.min(z*(innerWidth>=1024?.88:.62),half*.50),step=Math.max(innerWidth>=1024?44:12,(half-f)/Math.max(1,n-1));C.forEach((c,i)=>{let d=deltaIndex(i)-q,a=Math.abs(d),sg=Math.sign(d)||1;c.style.setProperty('--z',z+'px');if(a>n+.45){c.style.opacity=0;c.style.pointerEvents='none';c.classList.remove('on');return}const x=a<=1?d*f:sg*(f+(a-1)*step),rot=d===0?0:sg*-(innerWidth>=1024?48:55),sc=a<.5?(innerWidth>=1024?1.1:1.05):Math.max(.74,(innerWidth>=1024?.94:.91)-(a-1)*.05);c.style.opacity=Math.max(.48,1-Math.max(0,a-1)*.12);c.style.pointerEvents='auto';c.style.zIndex=a<.5?50:35-Math.round(a*4);c.style.transform=`translate(-50%,-50%) translateX(${x}px) translateZ(${a<.5?120:-20-a*45}px) rotateY(${rot}deg) scale(${sc})`;c.classList.toggle('on',a<.5)});return true}
function queue(v){prog=v;if(raf)return;raf=requestAnimationFrame(()=>{raf=0;renderSlider()})}function bootSlider(){let k=0;(function a(){if(renderSlider())return;if(++k<50)requestAnimationFrame(a)})()}bootSlider();addEventListener('load',renderSlider);addEventListener('resize',()=>requestAnimationFrame(renderSlider));addEventListener('orientationchange',()=>setTimeout(renderSlider,130));if('ResizeObserver'in window)new ResizeObserver(()=>requestAnimationFrame(renderSlider)).observe(S);
function openGallery(i){const p=P[i],sh=document.querySelector('#gallerySheet'),inn=document.querySelector('#galleryInner');inn.innerHTML=`<div class="galleryHero"><img src="${p.img}" alt="${p.name}"><div class="gallerySide"><div class="kicker">PROJET LOFT DESIGN</div><h3>${p.name}</h3><p>Explorez les images du projet ou ouvrez sa visite virtuelle.</p><a class="btn neonCyan" href="${p.vr}" target="_blank">Ouvrir la visite 360°</a></div></div><div class="thumbs">${p.gallery.map(x=>`<img src="${x}" alt="">`).join('')}</div>`;sh.classList.add('open');sh.scrollTop=0}
S.onpointerdown=e=>{if(e.pointerType==='mouse'&&e.button)return;if(e.target.closest('.visit360'))return;down=e.clientX;sx=e.clientX;sy=e.clientY;hit=e.target.closest('.pc')?+e.target.closest('.pc').dataset.i:null;drag=0;prog=0;S.classList.add('drag');if(e.pointerType!=='mouse')try{S.setPointerCapture(e.pointerId)}catch(_){}};S.onpointermove=e=>{if(down==null)return;const dx=e.clientX-down;if(Math.abs(dx)>4)drag=1;queue(Math.max(-1.08,Math.min(1.08,-dx/Math.max(170,cardSize()*.95))));if(e.pointerType!=='mouse')e.preventDefault()};S.onpointerup=e=>{if(down==null)return;const mv=Math.hypot(e.clientX-sx,e.clientY-sy),was=drag;if(was&&Math.abs(prog)>.27)A=(A+(prog>0?1:-1)+C.length)%C.length;if(was)last=Date.now();down=null;prog=0;drag=0;S.classList.remove('drag');renderSlider();if(!was&&mv<8&&Number.isInteger(hit)){if(hit!==A){A=hit;renderSlider()}else openGallery(hit)}hit=null};S.onpointercancel=()=>{down=null;prog=0;drag=0;S.classList.remove('drag');renderSlider()};C.forEach((c,i)=>c.onclick=e=>{if(e.target.closest('.visit360'))return;e.stopPropagation();if(Date.now()-last<250)return;if(i!==A){A=i;renderSlider()}else openGallery(i)});let wl=0;S.onwheel=e=>{if(innerWidth<1024)return;e.preventDefault();if(wl)return;const d=Math.abs(e.deltaX)>Math.abs(e.deltaY)?e.deltaX:e.deltaY;if(Math.abs(d)>4){A=(A+(d>0?1:-1)+C.length)%C.length;renderSlider();wl=1;setTimeout(()=>wl=0,220)}};document.querySelector('#galleryClose')?.addEventListener('click',()=>document.querySelector('#gallerySheet')?.classList.remove('open'));
}

/* Video rail — horizontal swipe / drag / mouse wheel */
const videoRail = document.querySelector('.videoRail');
if (videoRail) {
  let vd = false, vx = 0, vs = 0, vmoved = false, vlast = 0;

  videoRail.addEventListener('mousedown', e => {
    if (e.button !== 0) return;
    vd = true;
    vmoved = false;
    vx = e.clientX;
    vs = videoRail.scrollLeft;
  });

  window.addEventListener('mousemove', e => {
    if (!vd) return;
    const dx = e.clientX - vx;
    if (Math.abs(dx) > 6) {
      vmoved = true;
      videoRail.classList.add('dragging');
      videoRail.scrollLeft = vs - dx;
    }
  });

  const vend = () => {
    if (!vd) return;
    vd = false;
    videoRail.classList.remove('dragging');
    if (vmoved) {
      vlast = Date.now();
      window.__loftVideoRailDraggedUntil = Date.now() + 200;
      setTimeout(() => { vmoved = false; }, 60);
    }
  };

  window.addEventListener('mouseup', vend);

  videoRail.addEventListener('wheel', e => {
    const d = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
    if (Math.abs(d) < 2) return;
    e.preventDefault();
    videoRail.scrollBy({ left: d * 1.4, behavior: 'smooth' });
  }, { passive: false });

  // Direct click handler on every videoCard
  document.querySelectorAll('.videoCard').forEach(card => {
    card.style.cursor = 'pointer';
    card.addEventListener('click', function(e) {
      if (vmoved || Date.now() < (window.__loftVideoRailDraggedUntil || 0)) {
        e.preventDefault();
        return;
      }
      e.preventDefault();
      const url = card.getAttribute('data-video-url') || card.getAttribute('data-youtube-id') || '';
      const title = card.getAttribute('data-video-title') || card.querySelector('.videoLabel')?.textContent?.trim() || 'LOFT DESIGN';
      if (window.openVideoPlayer) {
        window.openVideoPlayer(url, title);
      }
    });
  });
}

/* Composer */
const money=v=>new Intl.NumberFormat('fr-DZ').format(Math.round(v))+' DA';
const spaces = (window.SPACES_DATA && window.SPACES_DATA.length > 0) ? window.SPACES_DATA : [
  {id:'living',name:'Living room',price:8000,img:'https://loftdesign.bilnov.com/media/spaces/gallery/living-room/16757/image_1.jpg'},
  {id:'bed',name:'Bedroom',price:6000,img:'https://loftdesign.bilnov.com/media/portfolio/thumbnails/Enscape_2026-02-05-20-45-23_Enscape_scene_8.jpg'},
  {id:'kitchen',name:'Kitchen',price:12000,img:'https://loftdesign.bilnov.com/media/spaces/gallery/kitchen-interior/11154/image_1.jpg'},
  {id:'bath',name:'Bathroom',price:7000,img:'https://loftdesign.bilnov.com/media/spaces/gallery/bathroom/15230/image_1_dsgPgFt.jpg'},
  {id:'kids',name:'Children room',price:6500,img:'https://loftdesign.bilnov.com/media/spaces/gallery/children-room/10567/image_1_qP62mWe.jpg'}
];

const services = ((window.SERVICES_DATA && window.SERVICES_DATA.length > 0) ? window.SERVICES_DATA : [
  {id:1, order:1, name:'Conception 3D intérieure', pricingType:'PRICE_PER_M2', pricing_type:'area', unitRate:900, price:900, allowInterior:true, allowExterior:false, defaultInteriorSelected:true, defaultExteriorSelected:false, unitName:'m²', is_default:true, short_description:'Modélisation 3D photoréaliste de l\'intérieur basée sur la surface intérieure.'},
  {id:2, order:2, name:'Conception 3D extérieure', pricingType:'PRICE_PER_M2', pricing_type:'area', unitRate:600, price:600, allowInterior:false, allowExterior:true, defaultInteriorSelected:false, defaultExteriorSelected:true, unitName:'m²', is_default:false, short_description:'Conception 3D extérieure pour façades, terrasse, jardin et piscine.'},
  {id:3, order:3, name:'Plan plomberie 2D', pricingType:'PRICE_PER_M2', pricing_type:'area', unitRate:150, price:150, allowInterior:true, allowExterior:true, defaultInteriorSelected:true, defaultExteriorSelected:false, unitName:'m²', is_default:false, short_description:'Plan technique des arrivées, évacuations et réseaux de plomberie.'},
  {id:4, order:4, name:'Plan électricité & luminaires 2D', pricingType:'PRICE_PER_M2', pricing_type:'area', unitRate:150, price:150, allowInterior:true, allowExterior:true, defaultInteriorSelected:true, defaultExteriorSelected:false, unitName:'m²', is_default:false, short_description:'Plan d\'implantation des prises, circuits et luminaires.'},
  {id:5, order:5, name:'Suivi de chantier', pricingType:'HOURLY', pricing_type:'hourly', hourlyRate:5000, price:5000, defaultHours:20, unitName:'h', is_default:false, short_description:'Assistance et visites de contrôle facturées à l\'heure.'},
  {id:6, order:6, name:'Conception de façade', pricingType:'FIXED_UNIT', pricing_type:'fixed', fixedUnitPrice:100000, price:100000, defaultQuantity:3, unitName:'façade', is_default:false, short_description:'Conception architecturale et habillage de façade au forfait unitaire.'},
  {id:7, order:7, name:'Gestion de projet', pricingType:'PERCENTAGE', pricing_type:'percent_project_cost', percentage:10, percentage_rate:10, defaultReferenceAmount:100000, unitName:'%', is_default:false, short_description:'Management global calculé en pourcentage du montant de référence.'}
]).slice().sort((a, b) => ((a.order ?? 9999) - (b.order ?? 9999)));

const projectTypes = (window.PROJECT_TYPES_DATA && window.PROJECT_TYPES_DATA.length > 0) ? window.PROJECT_TYPES_DATA : [
  {id:'residence',name:'Résidence'},{id:'villa',name:'Villa'},{id:'appartement',name:'Appartement'},{id:'commercial',name:'Commercial'},{id:'bureau',name:'Bureau'},{id:'hotel',name:'Hôtel'}
];
const defaultSelectedSpaces = [];

// Strictly enforce SINGLE default service invariant on initialization
const defaultSelectedServices = (() => {
  const def = services.find(s => s.is_default);
  if (def) return [def.id];
  return (services.length > 0) ? [services[0].id] : [1];
})();

let upperLevels = ['R+3', 'R+2', 'R+1'];
const middleLevels = ['RDC'];
const exteriorLevels = ['Terrasse / Jardin'];
let lowerLevels = ['R-1'];

const isExteriorLevel = l => {
  const s = String(l).toLowerCase();
  return s.includes('terrasse') || s.includes('jardin') || s.includes('ext') || s.includes('piscine') || s.includes('cour');
};

let st = {
  mode: 'custom',
  step: 'project',
  spaces: [],
  services: [...defaultSelectedServices],
  selectedServices: {},
  estimatedProjectCost: 10000000,
  projectType: '',
  basementCount: 0,
  upperCount: 0,
  levelAreas: { RDC: 0 },
  structureChosen: false,
  surfaceInterior: 0,
  surfaceExterior: 0,
  levels: ['RDC · niveau principal'],
  surfaces: { 'RDC · niveau principal': 0 },
  promptLevel: null,
  typeAttention: false,
  missing: [],
  clientType: 'particular',
  success: false,
  ref: '',
  client: null
};

function ensureLevelState() {
  if (typeof st.basementCount !== 'number' || isNaN(st.basementCount)) st.basementCount = 0;
  if (typeof st.upperCount !== 'number' || isNaN(st.upperCount)) st.upperCount = 0;
  if (typeof st.structureChosen !== 'boolean') st.structureChosen = false;
  if (!st.levelAreas || typeof st.levelAreas !== 'object') st.levelAreas = { RDC: 0 };
  if (!('RDC' in st.levelAreas)) st.levelAreas.RDC = 0;
}

function projectLevelCodes() {
  ensureLevelState();
  const codes = [];
  for (let i = st.upperCount; i >= 1; i--) codes.push(`R+${i}`);
  codes.push('RDC');
  for (let i = 1; i <= st.basementCount; i++) codes.push(`R-${i}`);
  return codes;
}

function levelDisplayName(code) {
  if (code === 'RDC') return 'RDC · niveau principal';
  if (code.startsWith('R+')) {
    const n = +code.slice(2);
    return `${code} · étage ${n}`;
  }
  if (code.startsWith('R-')) {
    const n = +code.slice(2);
    return `${code} · sous-sol ${n}`;
  }
  return code;
}

function interiorLevelsTotal() {
  ensureLevelState();
  return projectLevelCodes().reduce((sum, code) => sum + (+st.levelAreas[code] || 0), 0);
}

function syncInteriorFromLevels() {
  ensureLevelState();
  const codes = projectLevelCodes();
  st.levelCount = codes.length;
  st.surfaceInterior = interiorLevelsTotal();
  st.levels = codes.map(levelDisplayName);
  st.surfaces = {};
  codes.forEach(code => {
    st.surfaces[levelDisplayName(code)] = +st.levelAreas[code] || 0;
  });
  if (+st.surfaceExterior > 0) {
    st.levels.push('Extérieur');
    st.surfaces['Extérieur'] = +st.surfaceExterior || 0;
  }
}

function setBuildingStructure(basements, uppers, chosen = true) {
  ensureLevelState();
  st.basementCount = Math.max(0, Math.min(4, Math.round(+basements || 0)));
  st.upperCount = Math.max(0, Math.min(8, Math.round(+uppers || 0)));
  st.structureChosen = chosen;

  /* Keep values of levels that still exist; remove abandoned levels. */
  const allowed = new Set(projectLevelCodes());
  Object.keys(st.levelAreas).forEach(code => {
    if (!allowed.has(code)) delete st.levelAreas[code];
  });
  syncInteriorFromLevels();
}

// Rule 1: surfaceInterior = R-2 + R-1 + RDC + R+1 + ...
const surfaceInterior = () => {
  if (st.mode === 'quick') {
    return st.spaces.length > 0 ? (st.spaces.length * 25) : 0;
  }
  if (st.levelAreas && typeof st.levelAreas === 'object') {
    return interiorLevelsTotal();
  }
  return st.levels
    .filter(l => !isExteriorLevel(l))
    .reduce((sum, l) => sum + (+st.surfaces[l] || 0), 0);
};

// Rule 1: surfaceExterior = terrasse, jardin, piscine, etc.
const surfaceExterior = () => {
  if (st.mode === 'quick') {
    return 0;
  }
  if (typeof st.surfaceExterior === 'number' && !isNaN(st.surfaceExterior)) {
    return st.surfaceExterior;
  }
  return st.levels
    .filter(l => isExteriorLevel(l))
    .reduce((sum, l) => sum + (+st.surfaces[l] || 0), 0);
};

const totalSurface = () => surfaceInterior() + surfaceExterior();
const area = totalSurface;

// Helper: create or get initial selection parameters for a service
function getInitialSelection(s) {
  if (!s) return {};
  const pType = s.pricingType || (
    s.pricing_type === 'area' ? 'PRICE_PER_M2' :
    (s.pricing_type === 'hourly' ? 'HOURLY' :
    (s.pricing_type === 'percent_project_cost' ? 'PERCENTAGE' : 'FIXED_UNIT'))
  );

  const hasInt = surfaceInterior() > 0;
  const hasExt = surfaceExterior() > 0;

  const allowInt = s.allowInterior !== false;
  const allowExt = Boolean(s.allowExterior);

  let useInt = false;
  if (allowInt) {
    useInt = (s.defaultInteriorSelected !== false);
    if (hasInt) useInt = true;
  }

  let useExt = false;
  if (allowExt) {
    useExt = Boolean(s.defaultExteriorSelected);
  }

  return {
    serviceId: s.id,
    pricingType: pType,
    useInterior: useInt,
    useExterior: useExt,
    hours: s.defaultHours || (s.pricing_type === 'hourly' ? 20 : 10),
    quantity: s.defaultQuantity || (s.pricing_type === 'fixed' ? 3 : 1),
    referenceAmount: s.defaultReferenceAmount || parseFloat(st.estimatedProjectCost || 100000),
  };
}

function ensureSelectedServicesState() {
  st.services.forEach(sId => {
    const s = services.find(x => String(x.id) === String(sId) || String(x.slug) === String(sId));
    if (!s) return;
    if (!st.selectedServices[s.id] && !st.selectedServices[sId]) {
      st.selectedServices[s.id] = getInitialSelection(s);
    }
  });
}

// Rule 11: Single calculation engine
function calculateService(service, selection, project) {
  if (!selection) return 0;

  const pricingType = selection.pricingType || service.pricingType || (
    service.pricing_type === 'area' ? 'PRICE_PER_M2' :
    (service.pricing_type === 'hourly' ? 'HOURLY' :
    (service.pricing_type === 'percent_project_cost' ? 'PERCENTAGE' : 'FIXED_UNIT'))
  );

  switch (pricingType) {
    case "PRICE_PER_M2": {
      let selectedSurface = 0;
      if (selection.useInterior) {
        selectedSurface += (project.surfaceInterior || 0);
      }
      if (selection.useExterior) {
        selectedSurface += (project.surfaceExterior || 0);
      }
      const rate = (service.unitRate !== undefined) ? service.unitRate : (service.price || 0);
      return Math.round(selectedSurface * rate);
    }

    case "HOURLY": {
      const h = (selection.hours !== undefined) ? selection.hours : (service.defaultHours || 20);
      const rate = (service.hourlyRate !== undefined) ? service.hourlyRate : (service.price || 0);
      return Math.round(h * rate);
    }

    case "FIXED_UNIT": {
      const q = (selection.quantity !== undefined) ? selection.quantity : (service.defaultQuantity || 1);
      const rate = (service.fixedUnitPrice !== undefined) ? service.fixedUnitPrice : (service.price || 0);
      return Math.round(q * rate);
    }

    case "PERCENTAGE": {
      const ref = (selection.referenceAmount !== undefined) ? selection.referenceAmount : (service.defaultReferenceAmount || 100000);
      const pct = (service.percentage !== undefined) ? service.percentage : (service.percentage_rate || 0);
      let fee = (ref * pct) / 100;
      if (service.min_fee && fee < service.min_fee) fee = service.min_fee;
      if (service.max_fee && fee > service.max_fee) fee = service.max_fee;
      return Math.round(fee);
    }

    default:
      return Math.round(service.price || 0);
  }
}

function getServiceLinePrice(sId) {
  const s = services.find(x => String(x.id) === String(sId) || String(x.slug) === String(sId));
  if (!s) return 0;
  const sel = st.selectedServices[s.id] || st.selectedServices[sId] || getInitialSelection(s);
  const proj = {
    surfaceInterior: surfaceInterior(),
    surfaceExterior: surfaceExterior(),
  };
  return calculateService(s, sel, proj);
}

function getServiceCalculationDetail(sId) {
  const s = services.find(x => String(x.id) === String(sId) || String(x.slug) === String(sId));
  if (!s) return '';
  const sel = st.selectedServices[s.id] || st.selectedServices[sId] || getInitialSelection(s);
  const proj = {
    surfaceInterior: surfaceInterior(),
    surfaceExterior: surfaceExterior(),
  };

  const pType = sel.pricingType || s.pricingType || (
    s.pricing_type === 'area' ? 'PRICE_PER_M2' :
    (s.pricing_type === 'hourly' ? 'HOURLY' :
    (s.pricing_type === 'percent_project_cost' ? 'PERCENTAGE' : 'FIXED_UNIT'))
  );

  const priceVal = calculateService(s, sel, proj);

  switch (pType) {
    case 'PRICE_PER_M2': {
      const parts = [];
      if (sel.useInterior) parts.push(`${proj.surfaceInterior} m² int`);
      if (sel.useExterior) parts.push(`${proj.surfaceExterior} m² ext`);
      const totalS = (sel.useInterior ? proj.surfaceInterior : 0) + (sel.useExterior ? proj.surfaceExterior : 0);
      const rate = s.unitRate || s.price || 0;
      if (parts.length === 0) return `0 m² × ${money(rate)}/m² = ${money(0)}`;
      if (parts.length === 1) return `${parts[0]} × ${money(rate)}/m² = ${money(priceVal)}`;
      return `${totalS} m² (${parts.join(' + ')}) × ${money(rate)}/m² = ${money(priceVal)}`;
    }
    case 'HOURLY': {
      const h = sel.hours || 0;
      const rate = s.hourlyRate || s.price || 0;
      return `${h} h × ${money(rate)}/h = ${money(priceVal)}`;
    }
    case 'FIXED_UNIT': {
      const q = sel.quantity || 0;
      const rate = s.fixedUnitPrice || s.price || 0;
      const u = s.unitName || 'unité';
      return `${q} ${u}(s) × ${money(rate)} = ${money(priceVal)}`;
    }
    case 'PERCENTAGE': {
      const ref = sel.referenceAmount || 0;
      const pct = s.percentage || s.percentage_rate || 0;
      return `${pct}% de ${money(ref)} = ${money(priceVal)}`;
    }
    default:
      return `${money(priceVal)}`;
  }
}

const servicePrice = getServiceLinePrice;
const base = () => st.mode === 'quick' ? spaces.filter(x => st.spaces.includes(x.id)).reduce((s, x) => s + (x.price || 0), 0) : 0;
const servTotal = () => st.services.reduce((s, id) => s + getServiceLinePrice(id), 0);
const totalHT = () => base() + servTotal();
const tva = () => st.clientType === 'professional' ? totalHT() * 0.19 : 0;
const totalFinal = () => totalHT() + tva();

function gotoStep(step) {
  st.step = step;
  st.success = false;
  renderComposer();
  document.querySelector('#composer').scrollIntoView({behavior: 'smooth', block: 'start'});
}

function updateProgress() {
  const order = {project: 0, services: 1, contact: 2};
  document.querySelectorAll('.progress button').forEach(b => {
    const s = b.dataset.step;
    b.classList.toggle('active', s === st.step);
    b.classList.toggle('done', order[s] < order[st.step]);
    b.querySelector('i').textContent = order[s] < order[st.step] ? '✓' : String(order[s] + 1).padStart(2, '0');
    b.onclick = () => gotoStep(s);
  });
}

function drawTypeAttention() {
  st.typeAttention = true;
  const row = document.querySelector('.v46TypeRow');
  row?.animate([
    { transform: 'translateX(-5px)' },
    { transform: 'translateX(5px)' },
    { transform: 'none' }
  ], { duration: 300, iterations: 2 });
  setTimeout(() => {
    document.querySelector('.v46ProjectTypes button')?.focus();
  }, 80);
}

function validateSurfaces() {
  ensureLevelState();

  if (!st.projectType) {
    drawTypeAttention();
    return false;
  }

  const missing = projectLevelCodes().filter(code => !(+st.levelAreas[code] > 0));
  if (missing.length) {
    document.querySelectorAll('.v46LevelChip, .v46BaseSurface').forEach(el => {
      const input = el.querySelector('[data-level-area]');
      if (input && missing.includes(input.dataset.levelArea)) {
        el.classList.add('error');
      }
    });
    const firstMissing = document.querySelector(`[data-level-area="${missing[0]}"]`);
    if (firstMissing) firstMissing.focus();
    return false;
  }

  syncInteriorFromLevels();
  return st.surfaceInterior > 0;
}

function renderProject() {
  ensureLevelState();
  syncInteriorFromLevels();

  st.mode = 'custom';
  const body = document.querySelector('#composerBody');
  const COLOR_TONES = [
    '64,205,255',   // Cyan
    '180,138,255',  // Violet
    '103,233,166',  // Emerald / Mint
    '244,189,99',   // Amber / Gold
    '255,135,164',  // Rose / Coral
    '111,159,255',  // Neon Blue
    '255,179,71',   // Orange
    '78,205,196',   // Teal
  ];
  const projectTypesList = (projectTypes && projectTypes.length > 0 ? projectTypes : [
    { id: 'residence', slug: 'residence', name: 'Résidence' },
    { id: 'villa', slug: 'villa', name: 'Villa' },
    { id: 'appartement', slug: 'appartement', name: 'Appartement' },
    { id: 'commercial', slug: 'commercial', name: 'Commercial' },
    { id: 'bureau', slug: 'bureau', name: 'Bureau' },
    { id: 'hotel', slug: 'hotel', name: 'Hôtel' }
  ]).map((pt, idx) => ({
    id: pt.id || pt.slug,
    slug: pt.slug || String(pt.id),
    name: pt.name,
    tone: COLOR_TONES[idx % COLOR_TONES.length],
  }));
  const nf = new Intl.NumberFormat('fr-DZ');

  const basementCodes = Array.from({ length: st.basementCount || 0 }, (_, i) => `R-${i + 1}`);
  const upperCodes = Array.from({ length: st.upperCount || 0 }, (_, i) => `R+${i + 1}`);
  const extraCodes = [...basementCodes, ...upperCodes];

  const extraLevelInputs = extraCodes.map(code => {
    const tone = code.startsWith('R-') ? 'basement' : 'upper';
    return `<label class="v46LevelChip ${tone} ${+st.levelAreas?.[code] > 0 ? 'filled' : ''}" data-level-code="${code}">
      <b>${code}</b>
      <span>
        <input type="number" min="1" step="1" inputmode="decimal"
          data-level-area="${code}" value="${st.levelAreas?.[code] || ''}" placeholder="0">
        <em>m²</em>
      </span>
    </label>`;
  }).join('');

  const missingInterior = st.projectType && (
    !(+st.levelAreas?.RDC > 0) ||
    extraCodes.some(code => !(+st.levelAreas?.[code] > 0))
  );

  body.innerHTML = `
    <div class="v46ProjectScreen">
      <!-- 1. TYPE DE PROJET -->
      <section class="v46ProjectRow v46TypeRow">
        <div class="v46RowLabel">Projet</div>
        <div class="v46ProjectTypes" id="projectTypeContainer">
          ${projectTypesList.map(x => {
            const isSel = (
              st.projectType && (
                st.projectType === x.name ||
                st.projectType === x.slug ||
                String(st.projectType) === String(x.id)
              )
            );
            return `<button type="button"
              class="${isSel ? 'selected' : ''}"
              data-project-type="${x.name}"
              data-type="${x.slug || x.id}"
              data-id="${x.id}"
              title="${x.name}"
              style="--v60c:${x.tone};"
              aria-pressed="${isSel}">
              ${x.name}${isSel ? '<i>✓</i>' : ''}
            </button>`;
          }).join('')}
        </div>
      </section>

      <!-- 2. CALCULATEURS SOUS-SOLS / ETAGES -->
      <section class="v46ProjectRow v46CounterRow ${st.projectType ? '' : 'disabled'}">
        <div class="v46RowLabel">Niveaux</div>
        <div class="v46Counters">
          <div class="v46Counter basement">
            <span>Sous-sols</span>
            <div>
              <button type="button" id="basementMinus" ${!st.projectType ? 'disabled' : ''}>−</button>
              <b>${st.basementCount || 0}</b>
              <button type="button" id="basementPlus" ${!st.projectType ? 'disabled' : ''}>+</button>
            </div>
          </div>
          <div class="v46Counter upper">
            <span>Étages</span>
            <div>
              <button type="button" id="upperMinus" ${!st.projectType ? 'disabled' : ''}>−</button>
              <b>${st.upperCount || 0}</b>
              <button type="button" id="upperPlus" ${!st.projectType ? 'disabled' : ''}>+</button>
            </div>
          </div>
        </div>
      </section>

      <!-- 3. RDC + EXTERIEUR -->
      <section class="v46ProjectRow v46BaseSurfaceRow ${st.projectType ? '' : 'disabled'}">
        <div class="v46RowLabel">Surfaces</div>
        <div class="v46BaseSurfaces">
          <label class="v46BaseSurface rdc ${+st.levelAreas?.RDC > 0 ? 'filled' : ''}">
            <b>RDC</b>
            <span>
              <input type="number" min="1" step="1" inputmode="decimal"
                id="rdcSurface" data-level-area="RDC"
                value="${st.levelAreas?.RDC || ''}" placeholder="Surface">
              <em>m²</em>
            </span>
          </label>

          <label class="v46BaseSurface exterior ${+st.surfaceExterior > 0 ? 'filled' : ''}">
            <b>Extérieur <small>optionnel</small></b>
            <span>
              <input type="number" min="0" step="1" inputmode="decimal"
                id="surfaceExteriorInput"
                value="${st.surfaceExterior || ''}" placeholder="0">
              <em>m²</em>
            </span>
          </label>
        </div>
      </section>

      <!-- 4. ETAGES / SOUS-SOLS SELECTIONNES -->
      <section class="v46ProjectRow v46ExtraRow ${extraCodes.length ? 'hasLevels' : 'empty'}">
        <div class="v46RowLabel">Sélection</div>
        <div class="v46ExtraLevels">
          ${extraCodes.length
            ? extraLevelInputs
            : `<span class="v46NoExtra">Aucun autre niveau sélectionné</span>`}
        </div>
      </section>

      <!-- 5. TOTAL + SUIVANT -->
      <section class="v46ProjectRow v46ActionRow">
        <div class="v46CompactTotal">
          <small>Total intérieur</small>
          <b id="levelInteriorTotal">${nf.format(st.surfaceInterior || 0)} m²</b>
          ${+st.surfaceExterior > 0 ? `<span>+ ${nf.format(st.surfaceExterior)} m² ext.</span>` : ''}
        </div>
        <button class="nextBtn v46NextBtn" id="toServices"
          ${(!st.projectType || missingInterior) ? 'disabled' : ''}>
          Choisir mes prestations
        </button>
      </section>
    </div>`;

  body.querySelectorAll('[data-project-type]').forEach(btn => {
    btn.onclick = () => {
      const next = btn.dataset.projectType;
      const changed = st.projectType && st.projectType !== next;
      st.projectType = next;
      st.typeAttention = false;
      st.structureChosen = true;

      if (changed) {
        st.basementCount = 0;
        st.upperCount = 0;
        st.levelAreas = { RDC: 0 };
        st.surfaceInterior = 0;
        st.surfaceExterior = 0;
      } else if (!st.levelAreas || !('RDC' in st.levelAreas)) {
        st.levelAreas = { ...(st.levelAreas || {}), RDC: 0 };
      }

      syncInteriorFromLevels();
      renderComposer();
      setTimeout(() => document.querySelector('#rdcSurface')?.focus(), 60);
    };
  });

  document.querySelector('#basementMinus')?.addEventListener('click', () => {
    setBuildingStructure(Math.max(0, (st.basementCount || 0) - 1), st.upperCount || 0, true);
    renderComposer();
  });
  document.querySelector('#basementPlus')?.addEventListener('click', () => {
    setBuildingStructure(Math.min(4, (st.basementCount || 0) + 1), st.upperCount || 0, true);
    renderComposer();
    setTimeout(() => document.querySelector(`[data-level-area="R-${st.basementCount}"]`)?.focus(), 60);
  });
  document.querySelector('#upperMinus')?.addEventListener('click', () => {
    setBuildingStructure(st.basementCount || 0, Math.max(0, (st.upperCount || 0) - 1), true);
    renderComposer();
  });
  document.querySelector('#upperPlus')?.addEventListener('click', () => {
    setBuildingStructure(st.basementCount || 0, Math.min(8, (st.upperCount || 0) + 1), true);
    renderComposer();
    setTimeout(() => document.querySelector(`[data-level-area="R+${st.upperCount}"]`)?.focus(), 60);
  });

  body.querySelectorAll('[data-level-area]').forEach(input => {
    input.addEventListener('input', e => {
      const code = e.target.dataset.levelArea;
      st.levelAreas = st.levelAreas || {};
      st.levelAreas[code] = Math.max(0, +e.target.value || 0);
      syncInteriorFromLevels();

      e.target.closest('.v46LevelChip, .v46BaseSurface')?.classList.toggle('filled', +e.target.value > 0);

      const totalEl = document.querySelector('#levelInteriorTotal');
      if (totalEl) totalEl.textContent = `${nf.format(st.surfaceInterior || 0)} m²`;

      const missing = !(+st.levelAreas.RDC > 0) ||
        [...basementCodes, ...upperCodes].some(c => !(+st.levelAreas[c] > 0));
      const nextBtn = document.querySelector('#toServices');
      if (nextBtn) nextBtn.disabled = !st.projectType || missing;
    });
  });

  document.querySelector('#surfaceExteriorInput')?.addEventListener('input', e => {
    st.surfaceExterior = Math.max(0, +e.target.value || 0);
    e.target.closest('.v46BaseSurface')?.classList.toggle('filled', st.surfaceExterior > 0);
    syncInteriorFromLevels();
    const totalEl = document.querySelector('#levelInteriorTotal');
    if (totalEl) {
      totalEl.parentElement.innerHTML = `
        <small>Total intérieur</small>
        <b id="levelInteriorTotal">${nf.format(st.surfaceInterior || 0)} m²</b>
        ${+st.surfaceExterior > 0 ? `<span>+ ${nf.format(st.surfaceExterior)} m² ext.</span>` : ''}
      `;
    }
  });

  document.querySelector('#toServices')?.addEventListener('click', () => {
    if (validateSurfaces()) gotoStep('services');
  });
}

function openServiceDetailsModal(serviceId) {
  const s = services.find(x => String(x.id) === String(serviceId) || String(x.slug) === String(serviceId));
  if (!s) return;

  const modalEl = document.getElementById('serviceDetailsModal');
  if (!modalEl) return;

  const titleEl = document.getElementById('serviceDetailsModalTitle');
  const badgesEl = document.getElementById('serviceDetailsHeaderBadges');
  const bodyEl = document.getElementById('serviceDetailsBody');
  const toggleBtn = document.getElementById('serviceDetailsToggleActionBtn');

  // Translations object with robust fallbacks
  const t = s.translations || {};
  const trans = {
    fr: Object.assign({
      name: s.name,
      short_description: s.short_description || '',
      detailed_description: s.detailed_description || '',
      included_items: s.included_items || [],
      excluded_items: s.excluded_items || [],
      deliverables: s.deliverables || [],
      included_revisions: s.included_revisions || '',
      estimated_delivery_time: s.estimated_delivery_time || '',
    }, t.fr || {}),
    en: Object.assign({
      name: s.name,
      short_description: s.short_description || '',
      detailed_description: s.detailed_description || '',
      included_items: s.included_items || [],
      excluded_items: s.excluded_items || [],
      deliverables: s.deliverables || [],
      included_revisions: s.included_revisions || '',
      estimated_delivery_time: s.estimated_delivery_time || '',
    }, t.en || {}),
    ar: Object.assign({
      name: s.name,
      short_description: s.short_description || '',
      detailed_description: s.detailed_description || '',
      included_items: s.included_items || [],
      excluded_items: s.excluded_items || [],
      deliverables: s.deliverables || [],
      included_revisions: s.included_revisions || '',
      estimated_delivery_time: s.estimated_delivery_time || '',
    }, t.ar || {}),
  };

  const dict = {
    fr: {
      badgePricing: (s.pricing_type === 'percent_project_cost') ? `${s.percentage_rate || 0}% du projet` : (s.pricing_type === 'per_sqm' || s.pricing_type === 'area' ? `${money(s.price || 750)} / m²` : `${money(s.price || 0)} / forfait`),
      modalTitle: "Détails de la prestation",
      included: "Ce qui est inclus",
      excluded: "Ce qui n'est pas inclus",
      deliverables: "Livrables garantis",
      deliveryTime: "Délai estimé",
      revisions: "Révisions incluses",
      mediaTitle: "Aperçu vidéo & Animation",
      watchVideo: "Visionner la vidéo explicative",
      close: "Fermer",
      addQuote: "Ajouter au devis",
      removeQuote: "Retirer du devis",
      defaultBadge: "Inclus par défaut",
    },
    en: {
      badgePricing: (s.pricing_type === 'percent_project_cost') ? `${s.percentage_rate || 0}% of project` : (s.pricing_type === 'per_sqm' || s.pricing_type === 'area' ? `${money(s.price || 750)} / m²` : `${money(s.price || 0)} / package`),
      modalTitle: "Service Details",
      included: "What is included",
      excluded: "What is excluded",
      deliverables: "Guaranteed deliverables",
      deliveryTime: "Estimated delivery",
      revisions: "Included revisions",
      mediaTitle: "Video & Animation Preview",
      watchVideo: "Watch explanatory video",
      close: "Close",
      addQuote: "Add to quote",
      removeQuote: "Remove from quote",
      defaultBadge: "Default included",
    },
    ar: {
      badgePricing: (s.pricing_type === 'percent_project_cost') ? `${s.percentage_rate || 0}% من تكلفة المشروع` : (s.pricing_type === 'per_sqm' || s.pricing_type === 'area' ? `${money(s.price || 750)} / م²` : `${money(s.price || 0)} / باقة`),
      modalTitle: "تفاصيل الخدمة",
      included: "ما تشمله الخدمة",
      excluded: "ما لا تشمله الخدمة",
      deliverables: "المخرجات والتسليمات المضمونة",
      deliveryTime: "مدة التنفيذ المقدرة",
      revisions: "التعديلات المتاحة",
      mediaTitle: "معاينة الفيديو والرسوم المتحركة",
      watchVideo: "مشاهدة الفيديو التوضيحي",
      close: "إغلاق",
      addQuote: "إضافة إلى العرض",
      removeQuote: "إلغاء من العرض",
      defaultBadge: "مدرجة افتراضياً",
    }
  };

  let currentLang = (document.documentElement.lang === 'ar' || document.documentElement.dir === 'rtl') ? 'ar' : (document.documentElement.lang === 'en' ? 'en' : 'fr');

  function renderView(lang) {
    currentLang = lang;
    const lData = trans[lang] || trans.fr;
    const labels = dict[lang] || dict.fr;
    const isRtl = lang === 'ar';

    // 1. Header Title & Badges
    if (titleEl) {
      titleEl.textContent = lData.name || s.name || labels.modalTitle;
    }
    if (badgesEl) {
      let pBadge = `<span class="badge bg-warning text-dark font-monospace px-3 py-1 rounded-pill fw-bold">${labels.badgePricing}</span>`;
      let defBadge = s.is_default ? `<span class="badge bg-warning text-dark font-monospace px-2 py-1 rounded-pill fw-bold"><i class="fas fa-check-circle me-1"></i>${labels.defaultBadge}</span>` : '';
      badgesEl.innerHTML = `<div class="d-flex align-items-center gap-2 flex-wrap">${pBadge}${defBadge}</div>`;
    }

    // 2. Footer Buttons Localization & State
    const currentlySelected = st.services.some(id => String(id) === String(s.id) || String(id) === s.slug);
    if (toggleBtn) {
      if (currentlySelected) {
        toggleBtn.innerHTML = `<i class="fas fa-minus-circle ${isRtl ? 'ms-1' : 'me-1'}"></i> ${labels.removeQuote}`;
        toggleBtn.className = 'btn btn-outline-danger btn-sm px-4 rounded-pill fw-bold';
      } else {
        toggleBtn.innerHTML = `<i class="fas fa-plus-circle ${isRtl ? 'ms-1' : 'me-1'}"></i> ${labels.addQuote}`;
        toggleBtn.className = 'btn dash-btn-primary btn-sm px-4 rounded-pill fw-bold';
      }
    }
    const closeBtn = modalEl.querySelector('.modal-footer-close-btn');
    if (closeBtn) closeBtn.textContent = labels.close;

    // 3. Body Content (Showing ONLY corresponding language)
    const inc = Array.isArray(lData.included_items) ? lData.included_items : (lData.included_items ? String(lData.included_items).split('\n').filter(Boolean) : []);
    const exc = Array.isArray(lData.excluded_items) ? lData.excluded_items : (lData.excluded_items ? String(lData.excluded_items).split('\n').filter(Boolean) : []);
    const deliv = Array.isArray(lData.deliverables) ? lData.deliverables : (lData.deliverables ? String(lData.deliverables).split('\n').filter(Boolean) : []);
    const rev = lData.included_revisions || '';
    const delTime = lData.estimated_delivery_time || '';

    bodyEl.innerHTML = `
      <!-- Single Row Relative Language Switcher -->
      <div class="svc-lang-switcher-wrap mb-4 position-relative" style="position: relative; z-index: 10;">
        <div class="d-flex align-items-center gap-2 w-100 p-1 rounded-pill" style="background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.12); position: relative;">
          <button type="button" class="btn svc-lang-btn flex-fill rounded-pill py-2 px-2 fw-bold text-nowrap position-relative ${lang === 'fr' ? 'active' : ''}" data-svc-set-lang="fr" style="font-size:0.84rem; position: relative;">
            🇫🇷 Français
          </button>
          <button type="button" class="btn svc-lang-btn flex-fill rounded-pill py-2 px-2 fw-bold text-nowrap position-relative ${lang === 'en' ? 'active' : ''}" data-svc-set-lang="en" style="font-size:0.84rem; position: relative;">
            🇬🇧 English
          </button>
          <button type="button" class="btn svc-lang-btn flex-fill rounded-pill py-2 px-2 fw-bold text-nowrap position-relative ${lang === 'ar' ? 'active' : ''}" data-svc-set-lang="ar" style="font-size:0.84rem; position: relative;">
            🇩🇿 العربية
          </button>
        </div>
      </div>

      <!-- Active Language View ONLY -->
      <div class="svc-lang-view-pane" dir="${isRtl ? 'rtl' : 'ltr'}">
        <div class="row g-3">
          <!-- Main Description Header -->
          <div class="col-12">
            <h4 class="fw-bold text-light mb-2">${lData.name || s.name}</h4>
            ${lData.short_description ? `<p class="lead fs-6 text-light opacity-90 mb-3">${lData.short_description}</p>` : ''}
            ${lData.detailed_description ? `
              <div class="p-3 rounded-3 mb-3 text-light" style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.08); font-size: 0.88rem; line-height: 1.65;">
                ${lData.detailed_description.replace(/\n/g, '<br>')}
              </div>
            ` : ''}
          </div>

          <!-- Key Metrics Badges -->
          ${(delTime || rev) ? `
            <div class="col-12 d-flex flex-wrap gap-2 mb-2">
              ${delTime ? `<span class="badge bg-dark border border-secondary text-light px-3 py-2 rounded-3" style="font-size:0.82rem;"><i class="fas fa-clock text-warning ${isRtl ? 'ms-1' : 'me-1'}"></i><strong>${labels.deliveryTime}:</strong> ${delTime}</span>` : ''}
              ${rev ? `<span class="badge bg-dark border border-secondary text-light px-3 py-2 rounded-3" style="font-size:0.82rem;"><i class="fas fa-redo text-info ${isRtl ? 'ms-1' : 'me-1'}"></i><strong>${labels.revisions}:</strong> ${rev}</span>` : ''}
            </div>
          ` : ''}

          <!-- Included Features Card -->
          ${inc.length > 0 ? `
            <div class="col-md-6">
              <div class="p-3 rounded-3 h-100" style="background: rgba(16, 185, 129, 0.04); border: 1px solid rgba(16, 185, 129, 0.18);">
                <h6 class="text-success fw-bold small text-uppercase mb-3 d-flex align-items-center gap-2">
                  <i class="fas fa-check-circle"></i> ${labels.included}
                </h6>
                <ul class="list-unstyled mb-0" style="font-size: 0.85rem;">
                  ${inc.map(item => `<li class="d-flex align-items-start gap-2 mb-2 text-light"><i class="fas fa-check text-success mt-1" style="font-size:0.75rem;"></i><span>${item}</span></li>`).join('')}
                </ul>
              </div>
            </div>
          ` : ''}

          <!-- Excluded Features Card -->
          ${exc.length > 0 ? `
            <div class="col-md-6">
              <div class="p-3 rounded-3 h-100" style="background: rgba(239, 68, 68, 0.04); border: 1px solid rgba(239, 68, 68, 0.18);">
                <h6 class="text-danger fw-bold small text-uppercase mb-3 d-flex align-items-center gap-2">
                  <i class="fas fa-times-circle"></i> ${labels.excluded}
                </h6>
                <ul class="list-unstyled mb-0" style="font-size: 0.85rem;">
                  ${exc.map(item => `<li class="d-flex align-items-start gap-2 mb-2 text-light opacity-75"><i class="fas fa-times text-danger mt-1" style="font-size:0.75rem;"></i><span>${item}</span></li>`).join('')}
                </ul>
              </div>
            </div>
          ` : ''}

          <!-- Guaranteed Deliverables Card -->
          ${deliv.length > 0 ? `
            <div class="col-12 mt-3">
              <div class="p-3 rounded-3" style="background: rgba(244, 184, 95, 0.04); border: 1px solid rgba(244, 184, 95, 0.18);">
                <h6 class="text-warning fw-bold small text-uppercase mb-3 d-flex align-items-center gap-2">
                  <i class="fas fa-box-open"></i> ${labels.deliverables}
                </h6>
                <div class="d-flex flex-wrap gap-2">
                  ${deliv.map(item => `<span class="badge bg-dark border border-warning border-opacity-25 text-light px-3 py-2 rounded-3" style="font-size:0.82rem;"><i class="fas fa-file-alt text-warning ${isRtl ? 'ms-1' : 'me-1'}"></i>${item}</span>`).join('')}
                </div>
              </div>
            </div>
          ` : ''}

          <!-- Media Section -->
          ${(s.video_link || s.gif_url) ? `
            <div class="col-12 mt-3">
              <div class="p-3 rounded-3" style="background: rgba(85, 220, 255, 0.04); border: 1px solid rgba(85, 220, 255, 0.18);">
                <h6 class="text-info fw-bold small text-uppercase mb-2 d-flex align-items-center gap-2">
                  <i class="fas fa-play-circle"></i> ${labels.mediaTitle}
                </h6>
                ${s.gif_url ? `<img src="${s.gif_url}" class="img-fluid rounded-3 border border-secondary border-opacity-25 mb-2 w-100" style="max-height:220px; object-fit:cover;" alt="Preview">` : ''}
                ${s.video_link ? `<a href="${s.video_link}" target="_blank" rel="noopener" class="btn btn-sm btn-outline-info rounded-pill px-3 mt-1 text-light"><i class="fas fa-external-link-alt ${isRtl ? 'ms-1' : 'me-1'}"></i>${labels.watchVideo}</a>` : ''}
              </div>
            </div>
          ` : ''}
        </div>
      </div>
    `;

    // Bind language switcher buttons
    bodyEl.querySelectorAll('[data-svc-set-lang]').forEach(btn => {
      btn.onclick = () => {
        const nextLang = btn.dataset.svcSetLang;
        renderView(nextLang);
      };
    });
  }

  // Initial render
  renderView(currentLang);

  if (toggleBtn) {
    toggleBtn.onclick = () => {
      const currentlySelected = st.services.some(id => String(id) === String(s.id) || String(id) === s.slug);
      const finalId = s.id;
      st.services = currentlySelected ? st.services.filter(y => String(y) !== String(finalId)) : [...st.services, finalId];
      renderComposer();
      if (typeof bootstrap !== 'undefined') {
        bootstrap.Modal.getInstance(modalEl)?.hide();
      }
    };
  }

  if (typeof bootstrap !== 'undefined') {
    let bsModal = bootstrap.Modal.getInstance(modalEl);
    if (!bsModal) bsModal = new bootstrap.Modal(modalEl);
    bsModal.show();
  }
}

let isComposerInViewport = true;
function updateFloatingBarVisibility() {
  const bar = document.querySelector('#composerFloatingPriceBar');
  if (!bar) return;
  if (st.step === 'services' && isComposerInViewport) {
    bar.classList.add('active-visible');
  } else {
    bar.classList.remove('active-visible');
  }
}

// Observe #composer section to show floating price bar only when on viewport
const composerSectionEl = document.querySelector('#composer');
if (composerSectionEl && 'IntersectionObserver' in window) {
  const composerObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      isComposerInViewport = entry.isIntersecting;
      updateFloatingBarVisibility();
    });
  }, { threshold: 0.05 });
  composerObserver.observe(composerSectionEl);
} else {
  window.addEventListener('scroll', () => {
    if (!composerSectionEl) return;
    const rect = composerSectionEl.getBoundingClientRect();
    isComposerInViewport = (rect.top < window.innerHeight && rect.bottom > 0);
    updateFloatingBarVisibility();
  }, { passive: true });
}

function showValidationError(msg) {
  if (window.Swal) {
    Swal.fire({
      icon: 'warning',
      title: 'Vérification requise',
      text: msg,
      confirmButtonText: 'D’accord',
      customClass: { popup: 'swal2-popup', confirmButton: 'btn neonCyan' },
      buttonsStyling: false
    });
  } else {
    alert(msg);
  }
}

function validateServices() {
  if (!st.services || st.services.length === 0) {
    showValidationError('Veuillez sélectionner au moins une prestation pour continuer.');
    return false;
  }

  const proj = {
    surfaceInterior: surfaceInterior(),
    surfaceExterior: surfaceExterior(),
  };

  for (const sId of st.services) {
    const s = services.find(x => String(x.id) === String(sId) || String(x.slug) === String(sId));
    if (!s) continue;
    const sel = st.selectedServices[s.id] || st.selectedServices[sId] || getInitialSelection(s);

    const pType = sel.pricingType || s.pricingType || (
      s.pricing_type === 'area' ? 'PRICE_PER_M2' :
      (s.pricing_type === 'hourly' ? 'HOURLY' :
      (s.pricing_type === 'percent_project_cost' ? 'PERCENTAGE' : 'FIXED_UNIT'))
    );

    if (pType === 'PRICE_PER_M2') {
      const sName = (s.name || '').toLowerCase();
      const is3dInt = sName.includes('3d') && (sName.includes('int') || !s.allowExterior);
      const is3dExt = sName.includes('3d') && (sName.includes('ext') || !s.allowInterior);

      // Rule 9: 3D intérieur sélectionné mais surface intérieure = 0
      if (is3dInt && proj.surfaceInterior <= 0) {
        showValidationError(`La prestation "${s.name}" nécessite une surface intérieure supérieure à 0 m². Veuillez renseigner vos surfaces intérieures à l'étape 1.`);
        return false;
      }

      // Rule 9: 3D extérieur sélectionné mais surface extérieure = 0
      if (is3dExt && proj.surfaceExterior <= 0) {
        showValidationError(`La prestation "${s.name}" nécessite une surface extérieure supérieure à 0 m². Veuillez renseigner votre surface extérieure (terrasse / jardin) à l'étape 1.`);
        return false;
      }

      // Rule 9: 2D avec aucune case cochée
      if (!sel.useInterior && !sel.useExterior) {
        showValidationError(`Pour la prestation "${s.name}", vous devez cocher au moins un périmètre (Intérieur ou Extérieur).`);
        return false;
      }

      // Rule 9: 2D avec Intérieur coché mais surface intérieure = 0
      if (sel.useInterior && proj.surfaceInterior <= 0) {
        showValidationError(`La prestation "${s.name}" a le périmètre Intérieur coché, mais la surface intérieure est de 0 m². Veuillez renseigner votre surface intérieure.`);
        return false;
      }

      // Rule 9: 2D avec Extérieur coché mais surface extérieure = 0
      if (sel.useExterior && proj.surfaceExterior <= 0) {
        showValidationError(`La prestation "${s.name}" a le périmètre Extérieur coché, mais la surface extérieure est de 0 m². Veuillez renseigner votre surface extérieure.`);
        return false;
      }
    }

    // Rule 9: Horaire avec heures = 0
    if (pType === 'HOURLY') {
      if (!sel.hours || sel.hours <= 0) {
        showValidationError(`Veuillez spécifier un nombre d'heures supérieur à 0 pour la prestation "${s.name}".`);
        return false;
      }
    }

    // Rule 9: Prix fixe avec quantité = 0
    if (pType === 'FIXED_UNIT') {
      if (!sel.quantity || sel.quantity <= 0) {
        showValidationError(`Veuillez spécifier une quantité supérieure à 0 pour la prestation "${s.name}".`);
        return false;
      }
    }

    // Rule 9: Pourcentage sans montant de référence
    if (pType === 'PERCENTAGE') {
      if (!sel.referenceAmount || sel.referenceAmount <= 0) {
        showValidationError(`Veuillez saisir un montant de référence supérieur à 0 DA pour la prestation "${s.name}".`);
        return false;
      }
    }
  }

  return true;
}

function renderServices() {
  ensureSelectedServicesState();
  syncInteriorFromLevels();
  const b = document.querySelector('#composerBody');

  // Remove old floating price bar if present, since V75 uses .v46TotalDock
  const oldFloatingBar = document.querySelector('#composerFloatingPriceBar');
  if (oldFloatingBar) oldFloatingBar.remove();

  const selected = services.filter(s => st.services.some(id => String(id) === String(s.id) || String(id) === s.slug));
  const usesBudget = selected.some(s => {
    const sel = st.selectedServices[s.id] || st.selectedServices[s.slug] || getInitialSelection(s);
    return sel.pricingType === 'PERCENTAGE' || s.pricing_type === 'percent_project_cost';
  });

  const selectedMarkup = selected.length
    ? selected.map(s => {
        const sel = st.selectedServices[s.id] || st.selectedServices[s.slug] || getInitialSelection(s);
        const pType = sel.pricingType || s.pricingType || (
          s.pricing_type === 'area' ? 'PRICE_PER_M2' :
          (s.pricing_type === 'hourly' ? 'HOURLY' :
          (s.pricing_type === 'percent_project_cost' ? 'PERCENTAGE' : 'FIXED_UNIT'))
        );
        const linePrice = getServiceLinePrice(s.id);
        const calcDetail = getServiceCalculationDetail(s.id);

        let pricingLabel = '';
        if (pType === 'PRICE_PER_M2') {
          pricingLabel = `${money(s.unitRate || s.price)} / m²`;
        } else if (pType === 'HOURLY') {
          pricingLabel = `${money(s.hourlyRate || s.price)} / h`;
        } else if (pType === 'FIXED_UNIT') {
          pricingLabel = `${money(s.fixedUnitPrice || s.price)} / ${s.unitName || 'unité'}`;
        } else if (pType === 'PERCENTAGE') {
          pricingLabel = `${s.percentage || s.percentage_rate || 10}% du montant`;
        }

        return `<article class="v46SelectedService" data-service-card="${s.id}">
          <div class="v46SelectedServiceTop">
            <span>
              <b>${s.name}</b>
              <small>${pricingLabel}</small>
            </span>
            <strong>${money(linePrice)}</strong>
          </div>

          <!-- Scope checkboxes for 2D plans -->
          ${pType === 'PRICE_PER_M2' && (s.allowInterior !== false || s.allowExterior === true) ? `
            <div class="v46ScopeChecks">
              ${s.allowInterior !== false ? `
                <label>
                  <input type="checkbox" data-scope-int="${s.id}" ${sel.useInterior ? 'checked' : ''}>
                  <span>Intérieur (<strong>${surfaceInterior()} m²</strong>)</span>
                </label>
              ` : ''}
              ${s.allowExterior === true ? `
                <label>
                  <input type="checkbox" data-scope-ext="${s.id}" ${sel.useExterior ? 'checked' : ''}>
                  <span>Extérieur (<strong>${surfaceExterior()} m²</strong>)</span>
                </label>
              ` : ''}
            </div>
          ` : ''}

          <div class="v46SelectedCalc">
            <span>${calcDetail}</span>

            ${pType === 'HOURLY' ? `
              <label class="v74QtyField" title="Nombre d’heures">
                <span>Heures</span>
                <input type="number" min="1" step="1" inputmode="numeric" data-svc-hours="${s.id}" value="${sel.hours || 20}">
              </label>
            ` : ''}

            ${pType === 'FIXED_UNIT' && (s.allowQuantity !== false) ? `
              <label class="v74QtyField" title="Quantité">
                <span>Qté</span>
                <input type="number" min="1" step="1" inputmode="numeric" data-svc-qty="${s.id}" value="${sel.quantity || 1}">
              </label>
            ` : ''}

            ${pType === 'PERCENTAGE' ? `
              <label class="v74QtyField" title="Montant de référence">
                <span>Ref.</span>
                <input type="number" min="1" step="50000" inputmode="numeric" data-svc-ref="${s.id}" value="${sel.referenceAmount || 100000}" style="width:78px;">
              </label>
            ` : ''}

            <div class="v46Actions">
              <button type="button" data-service-details="${s.id}">Détails</button>
              <button type="button" class="remove" data-service-remove="${s.id}" aria-label="Retirer">×</button>
            </div>
          </div>
        </article>`;
      }).join('')
    : `<div class="v46SelectionEmpty">Sélectionnez une prestation à gauche.</div>`;

  b.innerHTML = `
    <div class="v46ServicesScreen">
      <!-- GAUCHE : PRESTATIONS DISPONIBLES / SCROLL INDEPENDANT -->
      <section class="v46AvailableColumn">
        <header class="v46ColumnHead">
          <div><small>02 · PRESTATIONS</small><h3>Prestations disponibles</h3></div>
          <span>${services.length}</span>
        </header>

        <div class="v46AvailableScroll" id="v46AvailableScroll">
          ${services.map(s => {
            const isSelected = st.services.some(id => String(id) === String(s.id) || String(id) === s.slug);
            const sel = st.selectedServices[s.id] || st.selectedServices[s.slug] || getInitialSelection(s);
            const pType = sel.pricingType || s.pricingType || (
              s.pricing_type === 'area' ? 'PRICE_PER_M2' :
              (s.pricing_type === 'hourly' ? 'HOURLY' :
              (s.pricing_type === 'percent_project_cost' ? 'PERCENTAGE' : 'FIXED_UNIT'))
            );

            let unitRateText = '';
            if (pType === 'PRICE_PER_M2') {
              unitRateText = `${money(s.unitRate || s.price)} / m²`;
            } else if (pType === 'HOURLY') {
              unitRateText = `${money(s.hourlyRate || s.price)} / h`;
            } else if (pType === 'FIXED_UNIT') {
              unitRateText = `${money(s.fixedUnitPrice || s.price)} / ${s.unitName || 'unité'}`;
            } else if (pType === 'PERCENTAGE') {
              unitRateText = `${s.percentage || s.percentage_rate || 10}% du montant`;
            }

            return `
              <article class="v46AvailableService ${isSelected ? 'selected' : ''}">
                <button type="button" class="v46ServiceAdd" data-service="${s.id}" aria-pressed="${isSelected}">
                  <i>${isSelected ? '✓' : '+'}</i>
                  <span>
                    <b>${s.name}</b>
                    <small>${unitRateText}</small>
                  </span>
                  <strong>${money(getServiceLinePrice(s.id))}</strong>
                </button>
                <button type="button" class="v46ServiceInfo" data-service-details="${s.id}">Détails</button>
              </article>
            `;
          }).join('')}
        </div>
      </section>

      <!-- DROITE : TOTAL FIXE + SELECTION / SCROLL INDEPENDANT -->
      <aside class="v46SelectedColumn">
        <div class="v46TotalDock">
          <div>
            <small>TOTAL ESTIMÉ HT</small>
            <strong id="dockTotalHT">${money(totalHT())}</strong>
          </div>
          <button class="nextBtn" id="toContact">Continuer</button>
        </div>

        ${usesBudget ? `
          <div class="v46BudgetField">
            <span>Budget projet global</span>
            <div>
              <input id="globalProjectBudget" type="number" min="1" step="50000" inputmode="numeric"
                value="${st.projectBudget || st.estimatedProjectCost || 10000000}" placeholder="10 000 000">
              <b>DA</b>
            </div>
          </div>
        ` : ''}

        <header class="v46ColumnHead selected">
          <div><small>VOTRE CHOIX</small><h3>Prestations sélectionnées</h3></div>
          <span>${selected.length}</span>
        </header>

        <div class="v46SelectedScroll" id="v46SelectedScroll">
          ${selectedMarkup}
        </div>
      </aside>
    </div>
  `;

  // Preserve scroll positions
  const leftScroll = document.querySelector('#v46AvailableScroll');
  const rightScroll = document.querySelector('#v46SelectedScroll');
  if (leftScroll) {
    leftScroll.scrollTop = st.serviceScrollLeft || 0;
    leftScroll.addEventListener('scroll', () => { st.serviceScrollLeft = leftScroll.scrollTop; }, { passive: true });
  }
  if (rightScroll) {
    rightScroll.scrollTop = st.serviceScrollSelected || 0;
    rightScroll.addEventListener('scroll', () => { st.serviceScrollSelected = rightScroll.scrollTop; }, { passive: true });
  }

  // Service toggle buttons on left
  b.querySelectorAll('.v46ServiceAdd').forEach(btn => {
    btn.onclick = () => {
      if (leftScroll) st.serviceScrollLeft = leftScroll.scrollTop;
      if (rightScroll) st.serviceScrollSelected = rightScroll.scrollTop;

      const id = btn.dataset.service;
      const s = services.find(x => String(x.id) === String(id) || String(x.slug) === String(id));
      if (!s) return;

      const isSel = st.services.some(x => String(x) === String(s.id) || String(x) === s.slug);
      if (isSel) {
        st.services = st.services.filter(x => String(x) !== String(s.id) && String(x) !== s.slug);
      } else {
        st.services = [...st.services, s.id];
        if (!st.selectedServices[s.id]) {
          st.selectedServices[s.id] = getInitialSelection(s);
        }
      }
      renderServices();
    };
  });

  // Remove buttons on right
  b.querySelectorAll('[data-service-remove]').forEach(btn => {
    btn.onclick = (e) => {
      e.stopPropagation();
      const id = btn.dataset.serviceRemove;
      const s = services.find(x => String(x.id) === String(id) || String(x.slug) === String(id));
      if (!s) return;
      st.services = st.services.filter(x => String(x) !== String(s.id) && String(x) !== s.slug);
      renderServices();
    };
  });

  // Details buttons
  b.querySelectorAll('[data-service-details]').forEach(btn => {
    btn.onclick = (e) => {
      e.stopPropagation();
      openServiceDetailsModal(btn.dataset.serviceDetails);
    };
  });

  // Checkboxes for 2D scope (Int / Ext)
  b.querySelectorAll('[data-scope-int]').forEach(cb => {
    cb.onchange = (e) => {
      const sId = cb.dataset.scopeInt;
      const s = services.find(x => String(x.id) === String(sId) || String(x.slug) === String(sId));
      if (!s) return;
      if (!st.selectedServices[s.id]) st.selectedServices[s.id] = getInitialSelection(s);
      st.selectedServices[s.id].useInterior = e.target.checked;
      renderServices();
    };
  });

  b.querySelectorAll('[data-scope-ext]').forEach(cb => {
    cb.onchange = (e) => {
      const sId = cb.dataset.scopeExt;
      const s = services.find(x => String(x.id) === String(sId) || String(x.slug) === String(sId));
      if (!s) return;
      if (!st.selectedServices[s.id]) st.selectedServices[s.id] = getInitialSelection(s);
      st.selectedServices[s.id].useExterior = e.target.checked;
      renderServices();
    };
  });

  // Steppers / inputs for hours
  b.querySelectorAll('[data-svc-hours]').forEach(input => {
    input.oninput = (e) => {
      const sId = input.dataset.svcHours;
      const s = services.find(x => String(x.id) === String(sId) || String(x.slug) === String(sId));
      if (!s) return;
      if (!st.selectedServices[s.id]) st.selectedServices[s.id] = getInitialSelection(s);
      st.selectedServices[s.id].hours = Math.max(1, parseInt(e.target.value, 10) || 1);
      updateDockAndTotals();
    };
  });

  // Steppers / inputs for quantity
  b.querySelectorAll('[data-svc-qty]').forEach(input => {
    input.oninput = (e) => {
      const sId = input.dataset.svcQty;
      const s = services.find(x => String(x.id) === String(sId) || String(x.slug) === String(sId));
      if (!s) return;
      if (!st.selectedServices[s.id]) st.selectedServices[s.id] = getInitialSelection(s);
      st.selectedServices[s.id].quantity = Math.max(1, parseInt(e.target.value, 10) || 1);
      updateDockAndTotals();
    };
  });

  // Steppers / inputs for percentage reference amount
  b.querySelectorAll('[data-svc-ref]').forEach(input => {
    input.oninput = (e) => {
      const sId = input.dataset.svcRef;
      const s = services.find(x => String(x.id) === String(sId) || String(x.slug) === String(sId));
      if (!s) return;
      if (!st.selectedServices[s.id]) st.selectedServices[s.id] = getInitialSelection(s);
      st.selectedServices[s.id].referenceAmount = Math.max(1, parseFloat(e.target.value) || 1);
      updateDockAndTotals();
    };
  });

  // Global project budget input
  document.querySelector('#globalProjectBudget')?.addEventListener('input', (e) => {
    const val = Math.max(1, parseFloat(e.target.value) || 1);
    st.projectBudget = val;
    st.estimatedProjectCost = val;
    services.forEach(s => {
      const sel = st.selectedServices[s.id];
      if (sel && sel.pricingType === 'PERCENTAGE') {
        sel.referenceAmount = val;
      }
    });
    updateDockAndTotals();
  });

  function updateDockAndTotals() {
    const dockTotal = document.querySelector('#dockTotalHT');
    if (dockTotal) dockTotal.textContent = money(totalHT());
    selected.forEach(s => {
      const card = b.querySelector(`[data-service-card="${s.id}"]`);
      if (card) {
        const strong = card.querySelector('.v46SelectedServiceTop > strong');
        if (strong) strong.textContent = money(getServiceLinePrice(s.id));
        const calcSpan = card.querySelector('.v46SelectedCalc > span');
        if (calcSpan) calcSpan.textContent = getServiceCalculationDetail(s.id);
      }
      const availCard = b.querySelector(`.v46AvailableService:has([data-service="${s.id}"]) .v46ServiceAdd > strong`);
      if (availCard) availCard.textContent = money(getServiceLinePrice(s.id));
    });
  }

  // Next button to contact step
  document.querySelector('#toContact')?.addEventListener('click', () => {
    if (validateServices()) gotoStep('contact');
  });
}

/* Algeria 2026 dataset */
let geo={wilayas:[],communes:[]};const fallbackWilayas=['Adrar','Chlef','Laghouat','Oum El Bouaghi','Batna','Béjaïa','Biskra','Béchar','Blida','Bouira','Tamanrasset','Tébessa','Tlemcen','Tiaret','Tizi Ouzou','Alger','Djelfa','Jijel','Sétif','Saïda','Skikda','Sidi Bel Abbès','Annaba','Guelma','Constantine','Médéa','Mostaganem','M’Sila','Mascara','Ouargla','Oran','El Bayadh','Illizi','Bordj Bou Arréridj','Boumerdès','El Tarf','Tindouf','Tissemsilt','El Oued','Khenchela','Souk Ahras','Tipaza','Mila','Aïn Defla','Naâma','Aïn Témouchent','Ghardaïa','Relizane','Timimoun','Bordj Badji Mokhtar','Ouled Djellal','Béni Abbès','In Salah','In Guezzam','Touggourt','Djanet','El M’Ghair','El Meniaa','Aflou','El Abiodh Sidi Cheikh','El Aricha','El Kantara','Barika','Bou Saâda','Bir El Ater','Ksar El Boukhari','Ksar Chellala','Aïn Oussera','Messaad'];
async function loadGeo(){try{const [w,c]=await Promise.all([fetch('https://mohamed-gp.github.io/algeria_69_wilayas/main.json').then(r=>r.json()),fetch('https://mohamed-gp.github.io/algeria_69_wilayas/communes.json').then(r=>r.json())]);geo.wilayas=w.wilayas||[];geo.communes=c.communes||[]}catch(_){geo.wilayas=fallbackWilayas.map((name,i)=>({id:i+1,name}));geo.communes=[]}refreshGeoSelects()}loadGeo();
function refreshGeoSelects(){const ws=document.querySelector('#wilaya');if(!ws)return;const current=ws.value;ws.innerHTML='<option value="">Choisir la wilaya</option>'+geo.wilayas.map(w=>`<option value="${w.id}" ${String(w.id)===current?'selected':''}>${String(w.id).padStart(2,'0')} - ${w.name}</option>`).join('');populateCommunes(ws.value)}
function populateCommunes(id){const cs=document.querySelector('#commune');if(!cs)return;const list=geo.communes.filter(c=>String(c.wilaya_id)===String(id));cs.innerHTML='<option value="">Choisir la commune</option>'+list.map(c=>`<option>${c.name}</option>`).join('')+(list.length?'':'<option>Autre / à préciser</option>')}

function quoteRows(){
  const rows=[];
  if(st.mode==='quick') {
    spaces.filter(x=>st.spaces.includes(x.id)).forEach(x=>rows.push({
      designation: `Conception espace - ${x.name}`,
      pu: x.price,
      unit: 'ESPACE',
      qty: 1,
      total: x.price
    }));
  }
  services.filter(s=>st.services.some(id=>String(id)===String(s.id)||String(id)===s.slug)).forEach(s=>{
    const sel = st.selectedServices[s.id] || getInitialSelection(s);
    const detail = getServiceCalculationDetail(s.id);
    const lineTotal = getServiceLinePrice(s.id);
    const pType = s.pricingType || (s.pricing_type === 'per_sqm' || s.pricing_type === 'area' ? 'PRICE_PER_M2' : (s.pricing_type === 'hourly' ? 'HOURLY' : (s.pricing_type === 'percent_project_cost' ? 'PERCENTAGE' : 'FIXED_UNIT')));

    if (pType === 'PRICE_PER_M2') {
      const surfaceUsed = (sel.useInterior ? surfaceInterior() : 0) + (sel.useExterior ? surfaceExterior() : 0);
      rows.push({
        designation: `${s.name} (${detail})`,
        pu: s.unitRate || s.price || 0,
        unit: 'M²',
        qty: surfaceUsed,
        total: lineTotal
      });
    } else if (pType === 'HOURLY') {
      rows.push({
        designation: `${s.name} (${detail})`,
        pu: s.hourlyRate || s.price || 0,
        unit: 'HEURE',
        qty: sel.hours || 20,
        total: lineTotal
      });
    } else if (pType === 'FIXED_UNIT') {
      rows.push({
        designation: `${s.name} (${detail})`,
        pu: s.fixedUnitPrice || s.price || 0,
        unit: (s.unitName || 'UNITE').toUpperCase(),
        qty: sel.quantity || 1,
        total: lineTotal
      });
    } else if (pType === 'PERCENTAGE') {
      rows.push({
        designation: `${s.name} (${detail})`,
        pu: `${s.percentage || 0}%`,
        unit: '%',
        qty: money(sel.referenceAmount || 0),
        total: lineTotal
      });
    } else {
      rows.push({
        designation: `${s.name} (${detail})`,
        pu: s.price || 0,
        unit: 'FORFAIT',
        qty: 1,
        total: lineTotal
      });
    }
  });
  return rows;
}

function clientLabel(c){return st.clientType==='professional'?(c.company||'Entreprise'):`${c.firstName||''} ${c.lastName||''}`.trim()}
function summary(c=st.client||{}){
  const proj=st.mode==='quick'?`Espaces: ${spaces.filter(x=>st.spaces.includes(x.id)).map(x=>x.name).join(', ')}`:`Type: ${st.projectType||'Non spécifié'}; Intérieur: ${surfaceInterior()} m²; Extérieur: ${surfaceExterior()} m²; Niveaux: ${st.levels.map(l=>l+' '+(st.surfaces[l]||0)+' m²').join(', ')}`;
  const selServices = services.filter(s=>st.services.some(id=>String(id)===String(s.id)||String(id)===s.slug)).map(x=>`${x.name} [${getServiceCalculationDetail(x.id)} = ${money(getServiceLinePrice(x.id))}]`).join('\n  - ');
  return `${proj}\nPrestations:\n  - ${selServices}\nClient: ${clientLabel(c)}\nTotal HT: ${money(totalHT())}${st.clientType==='professional'?`\nTVA 19%: ${money(tva())}\nTotal TTC: ${money(totalFinal())}`:''}`;
}

function makeRef(){const d=new Date(),n=Math.floor(1000+Math.random()*9000);return `LOFT-${d.getFullYear()}-${n}`}
function getClientData(form){const d=Object.fromEntries(new FormData(form).entries());const w=geo.wilayas.find(x=>String(x.id)===String(d.wilaya));return {...d,wilayaName:w?.name||d.wilaya}}

function renderContactStep(){
  const b=document.querySelector('#composerBody');
  if(st.success){renderSuccess();return}
  b.innerHTML=`
    <div class="clientType">
      <button type="button" class="${st.clientType==='particular'?'active':''}" data-client="particular">Particulier</button>
      <button type="button" class="${st.clientType==='professional'?'active':''}" data-client="professional">Professionnel</button>
    </div>
    <form class="contactForm" id="composerForm">
      ${st.clientType==='particular'?`
        <label>Prénom
          <input required name="firstName" placeholder="Votre prénom">
        </label>
        <label>Nom
          <input required name="lastName" placeholder="Votre nom">
        </label>
      `:`
        <label class="full">Nom de l’entreprise
          <input required name="company" placeholder="Raison sociale / nom de l’entreprise">
        </label>
      `}
      <label>Téléphone
        <input required name="phone" placeholder="+213 ...">
      </label>
      <label>E-mail
        <input required type="email" name="email" placeholder="vous@exemple.com">
      </label>
      <label>Wilaya
        <select required name="wilaya" id="wilaya">
          <option value="">Chargement…</option>
        </select>
      </label>
      <label>Commune
        <select required name="commune" id="commune">
          <option value="">Choisir la commune</option>
        </select>
      </label>
      <label class="full">Message / observations
        <textarea name="message" placeholder="Décrivez brièvement vos attentes…"></textarea>
      </label>
      <div class="contactTotal">
        <div>
          <strong>${st.clientType==='professional'?'Devis professionnel TTC':'Devis particulier HT'}</strong>
          <div class="tax">${st.clientType==='professional'?`HT ${money(totalHT())} · TVA 19% ${money(tva())}`:'TVA non ajoutée dans cette estimation'}</div>
        </div>
        <b>${money(totalFinal())}</b>
      </div>
      <div class="submitRow">
        <button class="btn neonCyan" type="submit" id="sendProject">Valider & envoyer</button>
      </div>
      <small class="full" id="formStatus" style="text-align:center;color:#ff8e9b;margin-top:8px;display:block;"></small>
    </form>
  `;

  document.querySelectorAll('[data-client]').forEach(x=>x.onclick=()=>{st.clientType=x.dataset.client;renderComposer()});
  refreshGeoSelects();
  document.querySelector('#wilaya').onchange=e=>populateCommunes(e.target.value);

  const f=document.querySelector('#composerForm');
  f.onsubmit=async e=>{
    e.preventDefault();
    const c=getClientData(f),btn=document.querySelector('#sendProject'),status=document.querySelector('#formStatus');
    btn.disabled=true;
    btn.textContent='Envoi…';
    status.textContent='';

    const selectedServicesData = st.services.map(sId => {
      const sObj = services.find(x => String(x.id) === String(sId) || String(x.slug) === String(sId));
      const sel = st.selectedServices[sId] || (sObj ? getInitialSelection(sObj) : {});
      return {
        service_id: sId,
        pricing_type: sObj ? (sObj.pricingType || sObj.pricing_type) : 'FIXED_UNIT',
        use_interior: !!sel.useInterior,
        use_exterior: !!sel.useExterior,
        hours: sel.hours || 0,
        quantity: sel.quantity || 1,
        reference_amount: sel.referenceAmount || 0,
        calculation_detail: getServiceCalculationDetail(sId),
        line_total: getServiceLinePrice(sId),
      };
    });

    const selectedProjType = projectTypes.find(x => 
      x.name === st.projectType || 
      x.slug === st.projectType || 
      String(x.id) === String(st.projectType)
    );

    const payload = {
      mode: st.mode,
      client_type: st.clientType,
      company: c.company || '',
      company_name: c.company || '',
      first_name: c.firstName || '',
      last_name: c.lastName || '',
      phone: c.phone || '',
      email: c.email || '',
      wilaya: c.wilaya || '',
      wilayaName: c.wilayaName || '',
      commune: c.commune || '',
      message: c.message || '',
      project_type_name: selectedProjType ? selectedProjType.name : (st.projectType || ''),
      project_type_id: selectedProjType ? selectedProjType.id : null,
      project_type_slug: selectedProjType ? selectedProjType.slug : null,
      project_type: selectedProjType ? (selectedProjType.slug || selectedProjType.name) : (st.projectType || ''),
      total_surface: area(),
      surface_interior: surfaceInterior(),
      surface_exterior: surfaceExterior(),
      estimated_total_project_cost: st.estimatedProjectCost || 0,
      total: totalFinal(),
      floors: st.levels.map((l, idx) => ({
        name: l,
        level: idx,
        surface: parseFloat(st.surfaces[l] || 0),
      })),
      spaces: st.mode === 'quick' ? st.spaces : [],
      service_ids: st.services,
      selected_services: selectedServicesData,
    };

    const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]')?.value || 
      (document.cookie.match(/(?:^|;\s*)csrftoken=([^;]+)/) || [])[1] || '';

    try {
      const r = await fetch('/api/design/requests/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrfToken,
          'X-Requested-With': 'XMLHttpRequest',
        },
        body: JSON.stringify(payload),
      });
      const data = await r.json();
      if (!data.success) {
        throw new Error(data.errors ? (Array.isArray(data.errors) ? data.errors.join(', ') : (typeof data.errors === 'object' ? Object.values(data.errors).flat().join(', ') : String(data.errors))) : 'Erreur lors de la soumission.');
      }
      st.ref = data.project_number || makeRef();
      st.client = c;
      st.success = true;
      renderComposer();

      if (window.Swal) {
        Swal.fire({
          icon: 'success',
          title: 'Demande enregistrée !',
          html: `<p style="margin:0 0 10px;">Votre projet <strong>${st.ref}</strong> a été transmis avec succès.</p><p style="color:#a0aba6;font-size:14px;">Vous pouvez consulter et télécharger votre devis estimatif ci-dessous.</p>`,
          confirmButtonText: 'Voir mon devis',
          customClass: {
            popup: 'swal2-popup',
            confirmButton: 'btn neonCyan'
          },
          buttonsStyling: false
        });
      }
    } catch(err) {
      if (window.Swal) {
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: err.message || 'Une erreur est survenue lors de l’envoi.',
          confirmButtonText: 'OK',
          customClass: {
            popup: 'swal2-popup',
            confirmButton: 'btn neonCyan'
          },
          buttonsStyling: false
        });
      }
      status.textContent = err.message || 'Une erreur est survenue lors de l’envoi.';
      btn.disabled = false;
      btn.textContent = 'Réessayer';
    }
  };
}

function renderSuccess(){
  const b=document.querySelector('#composerBody'),c=st.client||{};
  b.innerHTML=`
    <div class="success text-center py-4">
      <div class="successTop mb-4">
        <div class="ok mb-3" style="width:64px;height:64px;margin:0 auto;display:flex;align-items:center;justify-content:center;border-radius:50%;background:rgba(85,220,255,0.15);color:var(--cyan);font-size:28px;border:2px solid var(--cyan);box-shadow:0 0 20px rgba(85,220,255,0.35);">✓</div>
        <h3 style="font-size:26px;font-weight:800;color:#fff;">Votre demande a été enregistrée avec succès !</h3>
        <p style="color:#aeb6b3;font-size:15px;margin-top:8px;">Référence projet : <b style="color:var(--cyan);font-size:18px;">${st.ref}</b> · <span class="badge" style="background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.15);color:#e2e8f0;">${st.clientType==='professional'?'Professionnel - TTC':'Particulier - HT'}</span></p>
      </div>

      <div class="facture-summary-box mb-4 p-4" style="max-width:560px;margin:0 auto;background:rgba(255,255,255,0.03);border:1px solid rgba(85,220,255,0.25);border-radius:18px;backdrop-filter:blur(12px);box-shadow:0 8px 32px rgba(0,0,0,0.37);">
        <div class="d-flex justify-content-between align-items-center mb-2" style="border-bottom:1px solid rgba(255,255,255,0.08);padding-bottom:12px;">
          <span style="color:#94a3b8;font-size:14px;">Client</span>
          <strong style="color:#fff;">${clientLabel(c)}</strong>
        </div>
        <div class="d-flex justify-content-between align-items-center mb-2" style="border-bottom:1px solid rgba(255,255,255,0.08);padding-bottom:12px;">
          <span style="color:#94a3b8;font-size:14px;">Total Estimé</span>
          <strong style="color:var(--cyan);font-size:20px;font-weight:800;">${money(totalFinal())}</strong>
        </div>
        <p class="small text-muted mb-0" style="font-size:12px;">Une équipe d'architectes et designers LoftDesign étudie actuellement votre dossier.</p>
      </div>

      <div class="downloadRow d-flex flex-wrap justify-content-center gap-3 mt-4">
        <button class="btn neonCyan d-inline-flex align-items-center gap-2" id="sendEmailFacture">
          <i class="fas fa-envelope"></i>
          <span>Envoyer la facture par e-mail</span>
        </button>
        <button class="btn neonCyan d-inline-flex align-items-center gap-2" id="downloadQuote">
          <i class="fas fa-file-pdf"></i>
          <span>Télécharger le devis PDF</span>
        </button>
        <a class="btn storeTop d-inline-flex align-items-center gap-2" href="https://store.bilnov.com" target="_blank" rel="noopener">
          <span class="storeIcon" aria-hidden="true">
            <svg viewBox="0 0 24 24">
              <path d="M3.5 4h2l2.1 10.1a2 2 0 0 0 2 1.6h7.8a2 2 0 0 0 2-1.5L21 8H7"/>
              <circle cx="10" cy="19" r="1.4"/>
              <circle cx="18" cy="19" r="1.4"/>
            </svg>
          </span>
          Explorer Store Bilnov
        </a>
        <button class="btn neonViolet" id="restart">Nouveau projet</button>
      </div>
    </div>
  `;
  function buildFacturationPayload(targetEmail) {
    const c = st.client || {};
    const selectedProjType = projectTypes.find(x => 
      x.name === st.projectType || 
      x.slug === st.projectType || 
      String(x.id) === String(st.projectType)
    );
    const projTypeName = selectedProjType ? selectedProjType.name : (st.projectType || 'Projet');
    const clientFullName = clientLabel(c);
    const nameParts = clientFullName.split(' ');
    const firstName = nameParts[0] || 'Client';
    const lastName = nameParts.slice(1).join(' ') || '';

    const spacesData = (st.spaces || []).map(s => {
      const spObj = spaces.find(x => x.id === s.spaceId || x.slug === s.spaceId || x.id === s);
      return {
        name: spObj ? spObj.name : (s.spaceId || s),
        price: spObj ? spObj.price : 0
      };
    });

    const servicesData = (st.services || []).map(sId => {
      const sObj = services.find(x => String(x.id) === String(sId) || String(x.slug) === String(sId));
      const sel = st.selectedServices[sId] || (sObj ? getInitialSelection(sObj) : {});
      const lineTot = getServiceLinePrice(sId);
      const detail = getServiceCalculationDetail(sId);
      const pType = sObj ? (sObj.pricingType || sObj.pricing_type) : 'FIXED_UNIT';

      let rateLabel = 'Forfait';
      let qtyLabel = '1';
      let qtyNum = 1;

      if (pType === 'PRICE_PER_M2') {
        const surf = (sel.useInterior ? surfaceInterior() : 0) + (sel.useExterior ? surfaceExterior() : 0);
        rateLabel = `${money(sObj.unitRate || sObj.price || 0)} / m²`;
        qtyLabel = `${surf} m²`;
        qtyNum = surf;
      } else if (pType === 'HOURLY') {
        rateLabel = `${money(sObj.hourlyRate || sObj.price || 0)} / h`;
        qtyLabel = `${sel.hours || 20} h`;
        qtyNum = sel.hours || 20;
      } else if (pType === 'FIXED_UNIT') {
        rateLabel = `${money(sObj.fixedUnitPrice || sObj.price || 0)} / ${sObj.unitName || 'unité'}`;
        qtyLabel = `${sel.quantity || 1} ${sObj.unitName || 'unité'}`;
        qtyNum = sel.quantity || 1;
      } else if (pType === 'PERCENTAGE') {
        rateLabel = `${sObj.percentage || 0}%`;
        qtyLabel = money(sel.referenceAmount || 0);
        qtyNum = 1;
      }

      return {
        id: sId,
        name: sObj ? sObj.name : sId,
        detail: detail,
        rate_label: rateLabel,
        qty_label: qtyLabel,
        pricing_type: pType,
        price: sObj ? (sObj.unitRate || sObj.fixedUnitPrice || sObj.hourlyRate || sObj.price || 0) : 0,
        percentage_rate: sObj ? (sObj.percentage || 0) : 0,
        line_total: lineTot,
        qty: qtyNum,
        unit: (pType === 'PRICE_PER_M2') ? 'm²' : ((pType === 'HOURLY') ? 'h' : ((pType === 'PERCENTAGE') ? '%' : (sObj ? sObj.unitName || 'Unité' : 'Unité'))),
      };
    });

    return {
      email: targetEmail || c.email || '',
      first_name: firstName,
      last_name: lastName,
      phone: c.phone || '',
      company_name: c.company || '',
      client_type: st.clientType || 'particular',
      project_type_name: projTypeName,
      project_name: `${projTypeName} - ${clientFullName}`,
      total_surface: area(),
      surface_interior: surfaceInterior(),
      surface_exterior: surfaceExterior(),
      estimated_total_project_cost: st.estimatedProjectCost || 0,
      spaces: spacesData,
      service_ids: st.services || [],
      services: servicesData,
      doc_number: st.ref || 'LOFT-DEV-001',
      total: totalFinal(),
      final_total: totalFinal(),
      subtotal_before_discount: totalHT(),
      subtotal_after_discount: totalHT(),
      tax_amount: tva(),
    };
  }

  function getCsrf() {
    return document.querySelector('[name=csrfmiddlewaretoken]')?.value || 
      (document.cookie.match(/(?:^|;\s*)csrftoken=([^;]+)/) || [])[1] || '';
  }

  document.querySelector('#downloadQuote').onclick = async () => {
    try {
      const payload = buildFacturationPayload();
      const resp = await fetch('/request/facturation/download/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': getCsrf(),
        },
        body: JSON.stringify(payload)
      });
      if (resp.ok) {
        const blob = await resp.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const refName = (st.ref || 'PROFORMA').replace(/[^a-zA-Z0-9_-]/g, '_');
        a.download = `DEVIS_LOFT_DESIGN_${refName}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
        return;
      }
    } catch (e) {
      console.warn("Server PDF download fallback to client jsPDF:", e);
    }
    // Fallback to client-side jsPDF
    downloadQuotePdf();
  };

  document.querySelector('#sendEmailFacture').onclick = async () => {
    const defaultEmail = (st.client && st.client.email) || '';
    if (window.Swal) {
      const { value: email } = await Swal.fire({
        title: "Envoyer la facture par e-mail",
        text: `Recevez votre devis proforma officiel pour le projet ${st.ref || ''} directement en pièce jointe PDF.`,
        input: "email",
        inputValue: defaultEmail,
        inputPlaceholder: "votre-email@domaine.com",
        showCancelButton: true,
        confirmButtonText: '<i class="fas fa-paper-plane me-1"></i> Envoyer la facture',
        cancelButtonText: "Annuler",
        customClass: {
          popup: "swal2-popup",
          confirmButton: "btn neonCyan",
          cancelButton: "btn neonViolet"
        },
        buttonsStyling: false,
        inputValidator: (value) => {
          if (!value || !value.includes('@')) {
            return "Veuillez saisir une adresse e-mail valide !";
          }
        }
      });

      if (email) {
        Swal.fire({
          title: "Envoi en cours...",
          text: "Génération du PDF et envoi sécurisé à votre adresse e-mail...",
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          },
          customClass: { popup: "swal2-popup" }
        });

        try {
          const payload = buildFacturationPayload(email);
          const response = await fetch('/request/facturation/email/', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-CSRFToken': getCsrf(),
            },
            body: JSON.stringify(payload)
          });
          const result = await response.json();
          if (result.success) {
            Swal.fire({
              icon: "success",
              title: "Facture envoyée !",
              text: result.message || `La facture du projet ${st.ref || ''} a été envoyée avec succès à ${email}.`,
              confirmButtonText: "Parfait",
              customClass: {
                popup: "swal2-popup",
                confirmButton: "btn neonCyan"
              },
              buttonsStyling: false
            });
          } else {
            Swal.fire({
              icon: "error",
              title: "Échec de l'envoi",
              text: (result.errors && result.errors.join(', ')) || "Une erreur est survenue lors de l'envoi.",
              confirmButtonText: "D'accord",
              customClass: {
                popup: "swal2-popup",
                confirmButton: "btn neonCyan"
              },
              buttonsStyling: false
            });
          }
        } catch (err) {
          Swal.fire({
            icon: "error",
            title: "Erreur de connexion",
            text: "Impossible de joindre le serveur. Veuillez réessayer.",
            confirmButtonText: "D'accord",
            customClass: {
              popup: "swal2-popup",
              confirmButton: "btn neonCyan"
            },
            buttonsStyling: false
          });
        }
      }
    }
  };

  document.querySelector('#restart').onclick = () => {
    st.success = false;
    st.step = 'project';
    st.ref = '';
    st.client = null;
    st.spaces = [];
    renderComposer();
  };
}

function downloadQuotePdf(){
  if(!window.jspdf){alert('Le module PDF se charge. Réessayez dans un instant.');return}
  const {jsPDF}=window.jspdf,doc=new jsPDF({unit:'mm',format:'a4'}),rows=quoteRows(),c=st.client||{};
  const teal=[18,126,143],dark=[9,84,96],light=[231,238,229],cyan=[221,241,244],cyan2=[157,208,218];
  doc.setFillColor(...light);doc.rect(0,0,150,55,'F');doc.setTextColor(72,77,75);doc.setFont('helvetica','bold');doc.setFontSize(14);
  doc.text(COMPANY.name,25,15);doc.setFont('helvetica','normal');doc.setFontSize(8.5);
  doc.text([`R.I.B N°: ${COMPANY.rib}`,`RC N°: ${COMPANY.rc}`,`NIS N°: ${COMPANY.nis}`,`NIF: ${COMPANY.nif}`,`N ART: ${COMPANY.nart}`],25,23,{lineHeightFactor:1.55});
  doc.setFont('helvetica','bold');doc.text('MAIL:',116,25);doc.setFont('helvetica','normal');doc.text(COMPANY.mail,127,25);
  doc.setFont('helvetica','bold');doc.text('MOBILE:',116,32);doc.setFont('helvetica','normal');doc.text(COMPANY.mobile,132,32);
  doc.setFont('helvetica','bold');doc.text('ADRESSE:',92,39);doc.setFont('helvetica','normal');doc.text(COMPANY.address,111,39);
  doc.setDrawColor(244,184,95);doc.setLineWidth(.8);doc.rect(164,14,32,22);
  doc.setFont('helvetica','bold');doc.setFontSize(18);doc.text('LOFT',180,24,{align:'center'});doc.setFontSize(9);doc.text('DESIGN',180,30,{align:'center'});
  doc.setFontSize(17);doc.text(`DEVIS ${st.ref}`,105,77,{align:'center'});doc.setFontSize(11);
  doc.text('CLIENT :',25,91);doc.setFont('helvetica','normal');doc.text(clientLabel(c),48,91);
  doc.setFont('helvetica','bold');doc.text('ADRESSE :',25,102);doc.setFont('helvetica','normal');doc.text(`${c.commune||''}, ${c.wilayaName||c.wilaya||''}`,50,102);
  doc.setFont('helvetica','bold');doc.text('DATE',153,116);doc.setFont('helvetica','normal');doc.text(new Date().toLocaleDateString('fr-DZ'),164,116);
  doc.autoTable({
    startY:127,margin:{left:25,right:25},
    head:[['DESIGNATION','PRIX UNITAIRE HT','UNITE','QUANTITE','MONTANT HT DA']],
    body:rows.map(r=>[r.designation,`${new Intl.NumberFormat('fr-DZ').format(r.pu)} DA`,r.unit,String(r.qty),`${new Intl.NumberFormat('fr-DZ').format(r.total)} DA`]),
    headStyles:{fillColor:teal,textColor:255,fontSize:8,halign:'center'},
    styles:{fontSize:8,cellPadding:3,textColor:[75,80,78]},
    alternateRowStyles:{fillColor:[245,245,245]},
    columnStyles:{0:{cellWidth:47},1:{cellWidth:32},2:{cellWidth:22,halign:'center'},3:{cellWidth:22,halign:'center'},4:{cellWidth:32,halign:'right'}}
  });
  let y=doc.lastAutoTable.finalY+2;
  doc.setFillColor(...cyan);doc.rect(92,y,103,st.clientType==='professional'?27:9,'F');
  doc.setFont('helvetica','bold');doc.setTextColor(76,81,79);doc.setFontSize(10);
  doc.text('TOTAL HT',120,y+6);doc.setFillColor(...cyan2);doc.rect(160,y,35,9,'F');
  doc.text(`${new Intl.NumberFormat('fr-DZ').format(totalHT())} DA`,191,y+6,{align:'right'});
  if(st.clientType==='professional'){
    doc.text('TVA 19%',120,y+15);doc.setFillColor(96,180,196);doc.rect(160,y+9,35,9,'F');
    doc.text(`${new Intl.NumberFormat('fr-DZ').format(tva())} DA`,191,y+15,{align:'right'});
    doc.text('TOTAL TTC',120,y+24);doc.setFillColor(...cyan2);doc.rect(160,y+18,35,9,'F');
    doc.text(`${new Intl.NumberFormat('fr-DZ').format(totalFinal())} DA`,191,y+24,{align:'right'});
  }
  doc.setFont('helvetica','normal');doc.setFontSize(7);doc.setTextColor(130);
  doc.text('Document généré depuis le compositeur LOFT DESIGN.',105,287,{align:'center'});
  doc.save(`DEVIS_LOFT_DESIGN_${st.ref.replaceAll('/','-')}.pdf`);
}

function renderComposer(){
  updateProgress();
  const existingFloatingBar = document.querySelector('#composerFloatingPriceBar');
  if (existingFloatingBar && st.step !== 'services') {
    existingFloatingBar.remove();
  }
  if(st.step==='project')renderProject();
  if(st.step==='services')renderServices();
  if(st.step==='contact')renderContactStep();
  updateFloatingBarVisibility();
}
renderComposer();
/* Quick contact */
const quickWaBtn = document.querySelector('#quickWa');
if (quickWaBtn) {
  quickWaBtn.onclick = () => {
    const f = document.querySelector('#quickForm'), d = Object.fromEntries(new FormData(f).entries());
    open(`https://wa.me/213776139475?text=${encodeURIComponent(`Bonjour LOFT DESIGN,\nNom: ${d.name||''}\nE-mail: ${d.email||''}\nTéléphone: ${d.phone||''}\nMessage: ${d.message||''}`)}`, '_blank');
  };
}


/* Video player bridge to components/video_player.html */
window.LoftVideo = {
  open: function(id, title) {
    if (window.openVideoPlayer) {
      window.openVideoPlayer(id, title || 'LOFT DESIGN');
    }
  },
  close: function() {
    const widget = document.querySelector('.video-widget-overlay');
    if (widget) {
      widget.style.display = 'none';
      const stage = widget.querySelector('.video-widget-stage');
      if (stage) stage.innerHTML = '';
    }
  }
};


/* V12 — Explanatory video inside each information card */
(function(){
  const finePointer=window.matchMedia('(hover:hover) and (pointer:fine)');
  const cards=[...document.querySelectorAll('.infoCard[data-explain-video]')];
  const embed=(id,autoplay,mute)=>
    `https://www.youtube-nocookie.com/embed/${id}?autoplay=${autoplay?1:0}&mute=${mute?1:0}&rel=0&modestbranding=1&playsinline=1&controls=1`;

  function ensureLayer(card, autoplay=true, mute=false){
    let layer=card.querySelector('.explainVideoLayer');
    if(layer)return layer;
    const id=card.dataset.explainVideo;
    layer=document.createElement('div');
    layer.className='explainVideoLayer';
    layer.innerHTML=`
      <iframe src="${embed(id,autoplay,mute)}"
        title="${(card.dataset.explainTitle||'Vidéo explicative').replace(/"/g,'&quot;')}"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
        allowfullscreen></iframe>
      <div class="explainVideoActions">
        <button type="button" class="explainFull">⛶ Plein écran</button>
        <button type="button" class="explainClose">✕</button>
      </div>`;
    card.appendChild(layer);

    layer.querySelector('.explainFull').addEventListener('click',e=>{
      e.preventDefault();e.stopPropagation();
      const id=card.dataset.explainVideo;
      card.classList.remove('previewing','mobilePreview');
      layer.remove();
      if(window.LoftVideo?.open){
        window.LoftVideo.open(id,card.dataset.explainTitle||'Vidéo explicative');
        // Force the LOFT DESIGN player itself to full-screen presentation.
        const modal=document.getElementById('videoPlayerModal');
        if(modal){
          modal.classList.add('full');
          const full=document.getElementById('videoToggleFull');
          if(full)full.textContent='↙ Réduire';
        }
      }
    });
    layer.querySelector('.explainClose').addEventListener('click',e=>{
      e.preventDefault();e.stopPropagation();
      card.classList.remove('previewing','mobilePreview');
      layer.remove();
    });
    return layer;
  }

  cards.forEach(card=>{
    const hint=document.createElement('span');
    hint.className='explainHoverHint';
    card.appendChild(hint);

    let timer=null;

    card.addEventListener('pointerenter',()=>{
      if(!finePointer.matches)return;
      clearTimeout(timer);
      // A short dwell: simply approaching reveals intent, staying starts playback.
      timer=setTimeout(()=>{
        ensureLayer(card,true,true);
        card.classList.add('previewing');
      },650);
    });

    card.addEventListener('pointerleave',()=>{
      if(!finePointer.matches)return;
      clearTimeout(timer);
      card.classList.remove('previewing');
      card.querySelector('.explainVideoLayer')?.remove(); // stops YouTube immediately
    });

    card.addEventListener('click',e=>{
      if(e.target.closest('.explainVideoActions'))return;

      const id=card.dataset.explainVideo;

      if(finePointer.matches){
        // Desktop click = open directly in the LOFT DESIGN full player.
        e.preventDefault();
        e.stopPropagation();
        card.classList.remove('previewing');
        card.querySelector('.explainVideoLayer')?.remove();
        if(window.LoftVideo?.open){
          window.LoftVideo.open(id,card.dataset.explainTitle||'Vidéo explicative');
          const modal=document.getElementById('videoPlayerModal');
          if(modal){
            modal.classList.add('full');
            const full=document.getElementById('videoToggleFull');
            if(full)full.textContent='↙ Réduire';
          }
        }
      }else{
        // Mobile/tablet: one tap = small player inside the same card.
        e.preventDefault();
        e.stopPropagation();
        if(card.classList.contains('mobilePreview'))return;
        document.querySelectorAll('.infoCard.mobilePreview').forEach(other=>{
          if(other===card)return;
          other.classList.remove('mobilePreview');
          other.querySelector('.explainVideoLayer')?.remove();
        });
        ensureLayer(card,true,false);
        card.classList.add('mobilePreview');
      }
    });
  });
})();

/* V9 mobile app router */
(function(){
  const mq=window.matchMedia('(max-width:840px)');
  const ids=['portfolio','composer','apropos','videos','contact'];
  const pages=ids.map(id=>document.getElementById(id)).filter(Boolean);
  const buttons=[...document.querySelectorAll('.appNavBtn[data-app-page]')];
  let active='portfolio';

  function show(id,animate=true){
    if(!ids.includes(id))id='portfolio';
    active=id;
    pages.forEach(p=>p.classList.toggle('appActive',p.id===id));
    buttons.forEach(b=>b.classList.toggle('active',b.dataset.appPage===id));
    const activeButton=buttons.find(b=>b.dataset.appPage===id);
    if(activeButton)activeButton.scrollIntoView({behavior:animate?'smooth':'auto',inline:'center',block:'nearest'});
    if(id==='portfolio' && typeof R==='function') requestAnimationFrame(()=>R());
    history.replaceState(null,'','#'+id);
  }
  function enable(){
    if(!mq.matches)return;
    const hash=location.hash.replace('#','');
    show(ids.includes(hash)?hash:'portfolio',false);
  }
  buttons.forEach(b=>b.addEventListener('click',()=>show(b.dataset.appPage)));
  window.addEventListener('hashchange',()=>{if(mq.matches){const h=location.hash.replace('#','');if(ids.includes(h))show(h,false)}});
  mq.addEventListener?.('change',e=>{
    if(e.matches) enable();
    else{
      pages.forEach(p=>p.classList.remove('appActive'));
      document.body.style.removeProperty('overflow');
    }
  });
  enable();
})();
