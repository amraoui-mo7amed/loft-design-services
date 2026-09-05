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
  client: null,
  mobileServiceStage: 1
};

function ensureLevelState() {
  if (typeof st.basementCount !== 'number' || isNaN(st.basementCount)) st.basementCount = 0;
  if (typeof st.upperCount !== 'number' || isNaN(st.upperCount)) st.upperCount = 0;
  if (typeof st.structureChosen !== 'boolean') st.structureChosen = false;
  if (!st.levelAreas || typeof st.levelAreas !== 'object') st.levelAreas = {};
  const isApp = (st.projectType === 'Appartement' || st.projectType === 'appartement' || st.projectType === 'Apartment');
  if (isApp) {
    if (!('APP' in st.levelAreas)) st.levelAreas.APP = 0;
  } else {
    if (!('RDC' in st.levelAreas)) st.levelAreas.RDC = 0;
  }
}

function projectLevelCodes() {
  ensureLevelState();
  const isApp = (st.projectType === 'Appartement' || st.projectType === 'appartement' || st.projectType === 'Apartment');
  if (isApp) return ['APP'];
  const codes = [];
  for (let i = st.upperCount; i >= 1; i--) codes.push(`R+${i}`);
  codes.push('RDC');
  for (let i = 1; i <= st.basementCount; i++) codes.push(`R-${i}`);
  return codes;
}

function levelDisplayName(code) {
  if (code === 'APP') return 'Appartement';
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
    if (!allowInt) {
      useExt = true;
    } else {
      useExt = Boolean(s.defaultExteriorSelected) && hasExt;
    }
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

function triggerComposerShake(el) {
  if (!el) return;
  el.classList.remove('composerShake');
  void el.offsetWidth;
  el.classList.add('composerShake');
  setTimeout(() => el.classList.remove('composerShake'), 800);
}

function v47Attention(el) {
  if (!el) return;
  el.classList.remove('v47NeedsAttention', 'composerShake');
  void el.offsetWidth;
  el.classList.add('v47NeedsAttention');
  el.scrollIntoView?.({ behavior: 'smooth', block: 'center' });
  setTimeout(() => el.classList.remove('v47NeedsAttention'), 1100);
}

function v47ProjectMissing() {
  if (!st.projectType) return { type: 'project' };
  st.levelAreas = st.levelAreas || {};

  const isApp = (st.projectType === 'Appartement' || st.projectType === 'appartement' || st.projectType === 'Apartment');
  if (isApp) {
    if (!('APP' in st.levelAreas) || !(+st.levelAreas.APP > 0)) return { type: 'surface', codes: ['APP'] };
    return null;
  }

  const codes = projectLevelCodes();
  const missing = codes.filter(c => !(+st.levelAreas[c] > 0));
  if (missing.length) return { type: 'surface', codes: missing };
  return null;
}

function v47ProjectComplete() {
  return !v47ProjectMissing();
}

function v47ShowProjectMissing() {
  const missing = v47ProjectMissing();
  if (!missing) return true;

  triggerComposerShake(document.querySelector('#v47ToServices'));

  if (missing.type === 'project') {
    const el = document.querySelector('.v86TypeBlock') || document.querySelector('.v47TypeRow');
    v47Attention(el);
    document.querySelector('.v86ProjectTypes button')?.focus();
    return false;
  }
  if (missing.type === 'surface') {
    missing.codes.forEach(code => {
      const input = document.querySelector(`[data-level-area="${CSS.escape(code)}"]`);
      v47Attention(input?.closest('.v86SurfaceCard, .v47LevelChip, .v47SurfaceCard'));
    });
    const first = document.querySelector(`[data-level-area="${CSS.escape(missing.codes[0])}"]`);
    first?.focus();
    return false;
  }
  return false;
}

function drawTypeAttention() {
  v47ShowProjectMissing();
}

function validateSurfaces() {
  return v47ShowProjectMissing();
}

function gotoStep(step) {
  if (step === 'services' && !v47ProjectComplete()) {
    st.step = 'project';
    st.success = false;
    renderComposer();
    setTimeout(() => {
      v47ShowProjectMissing();
      triggerComposerShake(document.querySelector('.progress button[data-step="services"]'));
    }, 80);
    return;
  }
  if (step === 'contact') {
    if (!v47ProjectComplete()) {
      st.step = 'project';
      st.success = false;
      renderComposer();
      setTimeout(() => {
        v47ShowProjectMissing();
        triggerComposerShake(document.querySelector('.progress button[data-step="contact"]'));
      }, 80);
      return;
    }
    if (!validateServices()) {
      triggerComposerShake(document.querySelector('.progress button[data-step="contact"]'));
      return;
    }
  }
  const enteringServices = step === 'services' && st.step !== 'services';
  if (enteringServices) st.mobileServiceStage = 1;
  st.step = step;
  st.success = false;
  renderComposer();
  document.querySelector('#composer')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function updateProgress() {
  const order = { project: 0, services: 1, contact: 2 };
  document.querySelectorAll('.progress button').forEach(b => {
    const s = b.dataset.step;
    b.classList.toggle('active', s === st.step);
    b.classList.toggle('done', order[s] < order[st.step]);
    b.querySelector('i').textContent = order[s] < order[st.step] ? '✓' : String(order[s] + 1).padStart(2, '0');
    b.onclick = () => gotoStep(s);
  });
}

function renderProject() {
  ensureLevelState();
  const isApartment = (st.projectType === 'Appartement' || st.projectType === 'appartement' || st.projectType === 'Apartment');
  if (isApartment) {
    if (!('APP' in st.levelAreas)) st.levelAreas.APP = 0;
  } else {
    if (!('RDC' in st.levelAreas)) st.levelAreas.RDC = 0;
  }
  syncInteriorFromLevels();

  st.mode = 'custom';
  const body = document.querySelector('#composerBody');
  const nf = new Intl.NumberFormat('fr-DZ');

  const v86Visuals = {
    'villa': {
      name: 'Villa',
      img: 'https://loftdesign.bilnov.com/media/portfolio/thumbnails/Enscape_2026-07-07-23-27-11.png',
      sub: 'Maison individuelle',
      icon: '⌂'
    },
    'appartement': {
      name: 'Appartement',
      img: 'https://loftdesign.bilnov.com/media/portfolio/thumbnails/Enscape_2026-02-05-20-45-23_Enscape_scene_8.jpg',
      sub: 'Logement collectif',
      icon: '▦'
    },
    'apartment': {
      name: 'Appartement',
      img: 'https://loftdesign.bilnov.com/media/portfolio/thumbnails/Enscape_2026-02-05-20-45-23_Enscape_scene_8.jpg',
      sub: 'Logement collectif',
      icon: '▦'
    },
    'residence': {
      name: 'Résidence',
      img: 'https://loftdesign.bilnov.com/media/portfolio/thumbnails/Enscape_2024-10-27-23-48-12.png',
      sub: 'Résidence privée',
      icon: '⌂'
    },
    'residential': {
      name: 'Résidence',
      img: 'https://loftdesign.bilnov.com/media/portfolio/thumbnails/Enscape_2024-10-27-23-48-12.png',
      sub: 'Résidence privée',
      icon: '⌂'
    },
    'commercial': {
      name: 'Commercial',
      img: 'https://loftdesign.bilnov.com/media/spaces/gallery/kitchen-interior/11154/image_1.jpg',
      sub: 'Local commercial',
      icon: '▤'
    },
    'bureau': {
      name: 'Bureau',
      img: 'https://loftdesign.bilnov.com/media/portfolio/thumbnails/SEJOUR_4.png',
      sub: 'Espace professionnel',
      icon: '▣'
    },
    'office': {
      name: 'Bureau',
      img: 'https://loftdesign.bilnov.com/media/portfolio/thumbnails/SEJOUR_4.png',
      sub: 'Espace professionnel',
      icon: '▣'
    },
    'hotel': {
      name: 'Hôtel',
      img: 'https://loftdesign.bilnov.com/media/portfolio/thumbnails/Enscape_2026-01-02-19-38-33_Enscape_scene_14.png',
      sub: 'Hôtellerie & hébergement',
      icon: '⌘'
    }
  };

  const defaultTypes = [
    { slug: 'villa', name: 'Villa' },
    { slug: 'appartement', name: 'Appartement' },
    { slug: 'residence', name: 'Résidence' },
    { slug: 'commercial', name: 'Commercial' },
    { slug: 'bureau', name: 'Bureau' },
    { slug: 'hotel', name: 'Hôtel' }
  ];

  let rawTypes = (typeof projectTypes !== 'undefined' && projectTypes && projectTypes.length > 0)
    ? projectTypes
    : defaultTypes;

  const typesList = rawTypes.map(pt => {
    const name = typeof pt === 'string' ? pt : (pt.name || pt.slug || '');
    const slug = (typeof pt === 'string' ? pt : (pt.slug || pt.name || '')).toLowerCase();
    const cleanKey = slug.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const meta = v86Visuals[cleanKey] || v86Visuals[slug] || {
      name: name,
      img: 'https://loftdesign.bilnov.com/media/portfolio/thumbnails/Enscape_2026-07-07-23-27-11.png',
      sub: 'Projet sur mesure',
      icon: '⌂'
    };
    return {
      name: name,
      slug: slug,
      id: pt.id || slug,
      img: meta.img,
      sub: meta.sub,
      icon: meta.icon
    };
  });

  const basements = isApartment ? [] : Array.from({ length: st.basementCount || 0 }, (_, i) => `R-${i + 1}`);
  const uppers = isApartment ? [] : Array.from({ length: st.upperCount || 0 }, (_, i) => `R+${i + 1}`);
  const extra = [...basements, ...uppers];

  const extraHtml = extra.length
    ? extra.map(code => `<label class="v47LevelChip ${code.startsWith('R-') ? 'basement' : 'upper'}">
        <b>${code}</b>
        <span class="v47InputShell">
          <input type="number" min="1" step="1" inputmode="decimal"
            data-level-area="${code}" value="${st.levelAreas[code] || ''}" placeholder="0">
          <em>m²</em>
        </span>
      </label>`).join('')
    : `<span class="v47NoExtra">Aucun niveau supplémentaire</span>`;

  const interiorCode = isApartment ? 'APP' : 'RDC';
  const interiorTitle = isApartment ? 'Surface intérieure' : 'Surface RDC';
  const interiorSub = isApartment ? 'Surface habitable / utile' : 'Niveau principal traité';

  const isSelected = (item) => {
    return st.projectType && (
      st.projectType === item.name ||
      st.projectType === item.slug ||
      String(st.projectType).toLowerCase() === item.slug ||
      String(st.projectType).toLowerCase() === item.name.toLowerCase()
    );
  };

  body.innerHTML = `
    <div class="v47ProjectScreen v86ProjectScreen">

      <aside class="v86ProjectDecor v86ProjectDecorLeft" aria-hidden="true">
        <strong>01</strong>
        <span>VOTRE<br>PROJET<br>COMMENCE<br>ICI</span>
        <i></i>
      </aside>

      <aside class="v86ProjectDecor v86ProjectDecorRight" aria-hidden="true">
        <span>DES LIEUX<br>QUI VOUS<br>RESSEMBLENT</span>
        <i></i>
      </aside>

      <!-- 1. TYPE DE PROJET -->
      <section class="v86ProjectBlock v86TypeBlock">
        <div class="v86BlockHead">
          <div>
            <h3><b>1.</b> Type de projet</h3>
            <p>Choisissez la catégorie qui correspond à votre projet</p>
          </div>
        </div>

        <div class="v47ProjectTypes v86ProjectTypes">
          ${typesList.map(item => {
            const sel = isSelected(item);
            return `<button type="button"
              class="${sel ? 'selected' : ''}"
              data-v47-project="${item.name}"
              data-project-type="${item.name}"
              data-project-slug="${item.slug}"
              aria-pressed="${sel}">
              <span class="v86ProjectImage">
                <img src="${item.img}" alt="" loading="lazy">
                ${sel ? '<i class="v86SelectedCheck">✓</i>' : ''}
              </span>
              <span class="v86ProjectCardFoot">
                <em>${item.icon}</em>
                <span>
                  <b>${item.name}</b>
                  <small>${item.sub}</small>
                </span>
              </span>
            </button>`;
          }).join('')}
        </div>
      </section>

      <!-- 2. NIVEAUX DU PROJET (if not apartment) -->
      ${!isApartment ? `
      <section class="v86ProjectBlock v86LevelsBlock ${st.projectType ? '' : 'disabled'}">
        <div class="v86BlockHead compact">
          <div>
            <h3><b>2.</b> Niveaux du projet</h3>
            <p>Indiquez uniquement les niveaux concernés par notre intervention</p>
          </div>
        </div>

        <div class="v47LevelControls v86LevelControls">
          <div class="v47LevelCounter basement">
            <span>Sous-sols</span>
            <div class="v47Counter">
              <button type="button" id="basementMinus" ${!st.projectType ? 'disabled' : ''}>−</button>
              <b>${st.basementCount || 0}</b>
              <button type="button" id="basementPlus" ${!st.projectType ? 'disabled' : ''}>+</button>
            </div>
          </div>
          <div class="v47LevelCounter upper">
            <span>Étages</span>
            <div class="v47Counter">
              <button type="button" id="upperMinus" ${!st.projectType ? 'disabled' : ''}>−</button>
              <b>${st.upperCount || 0}</b>
              <button type="button" id="upperPlus" ${!st.projectType ? 'disabled' : ''}>+</button>
            </div>
          </div>
        </div>

        ${extra.length ? `
          <div class="v47ExtraLevels v86ExtraLevels">${extraHtml}</div>
        ` : ''}
      </section>
      ` : ''}

      <!-- 3. SURFACES -->
      <section class="v86ProjectBlock v86SurfaceBlock ${st.projectType ? '' : 'disabled'}">
        <div class="v86BlockHead">
          <div>
            <h3><b>${isApartment ? '2' : '3'}.</b> Surfaces</h3>
            <p>Renseignez les surfaces de votre projet</p>
          </div>
        </div>

        <div class="v86SurfaceGrid">
          <label class="v47SurfaceCard v86SurfaceCard interior">
            <span class="v86SurfaceIcon">▧</span>
            <span class="v86SurfaceCopy">
              <b>${interiorTitle}</b>
              <small>${interiorSub}</small>
            </span>
            <span class="v47InputShell">
              <input type="number" min="1" step="1" inputmode="decimal"
                id="interiorSurfaceInput"
                data-level-area="${interiorCode}"
                value="${st.levelAreas[interiorCode] || ''}" placeholder="0">
              <em>m²</em>
            </span>
          </label>

          <label class="v47SurfaceCard v86SurfaceCard exterior">
            <span class="v86SurfaceIcon exterior">♧</span>
            <span class="v86SurfaceCopy">
              <b>Surface extérieure</b>
              <small>Jardin / terrasse / piscine (optionnel)</small>
            </span>
            <span class="v47InputShell">
              <input type="number" min="0" step="1" inputmode="decimal"
                id="surfaceExterior" value="${st.surfaceExterior || ''}" placeholder="0">
              <em>m²</em>
            </span>
          </label>

          <aside class="v86TotalCard">
            <span class="v86TotalIcon">◇</span>
            <div>
              <small>Surface totale</small>
              <b id="v86TotalValue">${nf.format((st.surfaceInterior || 0) + (st.surfaceExterior || 0))} m²</b>
              <p><strong id="v86InteriorValue">${nf.format(st.surfaceInterior || 0)} m²</strong> intérieur<br>
              + <span id="v86ExteriorValue">${nf.format(st.surfaceExterior || 0)} m²</span> extérieur</p>
            </div>
          </aside>
        </div>
      </section>

      <!-- FOOTER -->
      <section class="v86ProjectFooter">
        <button type="button" class="v86Reset" id="v86ResetProject">
          <span>↻</span> Réinitialiser
        </button>

        <button class="nextBtn v47Next v86Next" id="v47ToServices">
          ${isApartment ? 'SUIVANT' : 'CHOISIR MES PRESTATIONS'}
        </button>
      </section>
    </div>
  `;

  // Project type click handlers
  body.querySelectorAll('[data-v47-project]').forEach(btn => {
    btn.onclick = () => {
      const next = btn.dataset.v47Project;
      const changed = st.projectType !== next;
      st.projectType = next;
      st.structureChosen = true;

      if (changed) {
        st.basementCount = 0;
        st.upperCount = 0;
        st.surfaceInterior = 0;
        st.surfaceExterior = 0;
        st.apartmentFloor = '';
        const nextIsApp = (next === 'Appartement' || next === 'appartement' || next === 'Apartment');
        st.levelAreas = nextIsApp ? { APP: 0 } : { RDC: 0 };
      }
      syncInteriorFromLevels();
      renderComposer();
      setTimeout(() => document.querySelector('#interiorSurfaceInput')?.focus(), 60);
    };
  });

  // Level counter buttons
  document.querySelector('#basementMinus')?.addEventListener('click', () => {
    setBuildingStructure(Math.max(0, (st.basementCount || 0) - 1), st.upperCount || 0, true);
    renderComposer();
  });
  document.querySelector('#basementPlus')?.addEventListener('click', () => {
    setBuildingStructure(Math.min(4, (st.basementCount || 0) + 1), st.upperCount || 0, true);
    renderComposer();
    setTimeout(() => document.querySelector(`[data-level-area="R-${st.basementCount}"]`)?.focus(), 50);
  });
  document.querySelector('#upperMinus')?.addEventListener('click', () => {
    setBuildingStructure(st.basementCount || 0, Math.max(0, (st.upperCount || 0) - 1), true);
    renderComposer();
  });
  document.querySelector('#upperPlus')?.addEventListener('click', () => {
    setBuildingStructure(st.basementCount || 0, Math.min(8, (st.upperCount || 0) + 1), true);
    renderComposer();
    setTimeout(() => document.querySelector(`[data-level-area="R+${st.upperCount}"]`)?.focus(), 50);
  });

  // Surface inputs
  body.querySelectorAll('[data-level-area]').forEach(input => {
    input.addEventListener('input', e => {
      st.levelAreas = st.levelAreas || {};
      st.levelAreas[e.target.dataset.levelArea] = Math.max(0, +e.target.value || 0);
      syncInteriorFromLevels();
      const totalEl = document.querySelector('#v86TotalValue');
      if (totalEl) totalEl.textContent = `${nf.format((st.surfaceInterior || 0) + (st.surfaceExterior || 0))} m²`;
      const intEl = document.querySelector('#v86InteriorValue');
      if (intEl) intEl.textContent = `${nf.format(st.surfaceInterior || 0)} m²`;
    });
  });

  document.querySelector('#surfaceExterior')?.addEventListener('input', e => {
    st.surfaceExterior = Math.max(0, +e.target.value || 0);
    const totalEl = document.querySelector('#v86TotalValue');
    if (totalEl) totalEl.textContent = `${nf.format((st.surfaceInterior || 0) + (st.surfaceExterior || 0))} m²`;
    const extEl = document.querySelector('#v86ExteriorValue');
    if (extEl) extEl.textContent = `${nf.format(st.surfaceExterior || 0)} m²`;
  });

  // Reset button
  document.querySelector('#v86ResetProject')?.addEventListener('click', () => {
    st.basementCount = 0;
    st.upperCount = 0;
    st.surfaceInterior = 0;
    st.surfaceExterior = 0;
    st.apartmentFloor = '';
    st.levelAreas = isApartment ? { APP: 0 } : { RDC: 0 };
    syncInteriorFromLevels();
    renderComposer();
  });

  // Continue button
  document.querySelector('#v47ToServices')?.addEventListener('click', () => {
    if (!v47ShowProjectMissing()) return;
    gotoStep('services');
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
    const avail = document.querySelector('.v46AvailableColumn') || document.querySelector('.v46ServicesScreen');
    v47Attention(avail);
    triggerComposerShake(document.querySelector('#toContact'));
    triggerComposerShake(document.querySelector('.v48MobileServiceNext'));
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

    const getCard = () => document.querySelector(`.v91ServiceCard[data-service-card="${CSS.escape(s.id)}"]`) || document.querySelector(`[data-service="${CSS.escape(s.id)}"]`)?.closest('.v91ServiceCard, .v46AvailableService');

    if (pType === 'PRICE_PER_M2') {
      const sName = (s.name || '').toLowerCase();
      const is3dInt = sName.includes('3d') && (sName.includes('int') || !s.allowExterior);
      const is3dExt = sName.includes('3d') && (sName.includes('ext') || !s.allowInterior);

      // Rule 9: 3D intérieur sélectionné mais surface intérieure = 0
      if (is3dInt && proj.surfaceInterior <= 0) {
        v47Attention(getCard());
        triggerComposerShake(document.querySelector('#toContact'));
        showValidationError(`La prestation "${s.name}" nécessite une surface intérieure supérieure à 0 m². Veuillez renseigner vos surfaces intérieures à l'étape 1.`);
        return false;
      }

      // Rule 9: 3D extérieur sélectionné mais surface extérieure = 0
      if (is3dExt && proj.surfaceExterior <= 0) {
        v47Attention(getCard());
        triggerComposerShake(document.querySelector('#toContact'));
        if (typeof Swal !== 'undefined') {
          Swal.fire({
            title: 'Surface extérieure requise',
            text: `La prestation "${s.name}" nécessite une surface extérieure. Veuillez entrer votre surface extérieure (terrasse / jardin) en m² :`,
            input: 'number',
            inputAttributes: { min: 1, step: 1 },
            inputValue: 30,
            showCancelButton: true,
            confirmButtonText: 'Valider',
            cancelButtonText: 'Annuler',
          }).then(res => {
            if (res.isConfirmed && Number(res.value) > 0) {
              st.surfaceExterior = Number(res.value);
              renderServices();
            }
          });
        } else {
          showValidationError(`La prestation "${s.name}" nécessite une surface extérieure supérieure à 0 m². Veuillez renseigner votre surface extérieure (terrasse / jardin) à l'étape 1.`);
        }
        return false;
      }

      // Rule 9: 2D avec aucune case cochée
      if (!sel.useInterior && !sel.useExterior) {
        v47Attention(getCard());
        triggerComposerShake(document.querySelector('#toContact'));
        showValidationError(`Pour la prestation "${s.name}", vous devez cocher au moins un périmètre (Intérieur ou Extérieur).`);
        return false;
      }

      // Rule 9: 2D avec Intérieur coché mais surface intérieure = 0
      if (sel.useInterior && proj.surfaceInterior <= 0) {
        v47Attention(getCard());
        triggerComposerShake(document.querySelector('#toContact'));
        showValidationError(`La prestation "${s.name}" a le périmètre Intérieur coché, mais la surface intérieure est de 0 m². Veuillez renseigner votre surface intérieure.`);
        return false;
      }

      // Rule 9: 2D avec Extérieur coché mais surface extérieure = 0
      if (sel.useExterior && proj.surfaceExterior <= 0) {
        v47Attention(getCard());
        triggerComposerShake(document.querySelector('#toContact'));
        if (typeof Swal !== 'undefined') {
          Swal.fire({
            title: 'Surface extérieure requise',
            text: `La prestation "${s.name}" a le périmètre Extérieur coché. Veuillez entrer votre surface extérieure en m² (ou décocher Extérieur) :`,
            input: 'number',
            inputAttributes: { min: 1, step: 1 },
            inputValue: 30,
            showCancelButton: true,
            confirmButtonText: 'Valider',
            cancelButtonText: 'Décocher Extérieur',
          }).then(res => {
            if (res.isConfirmed && Number(res.value) > 0) {
              st.surfaceExterior = Number(res.value);
              renderServices();
            } else {
              sel.useExterior = false;
              renderServices();
            }
          });
        } else {
          showValidationError(`La prestation "${s.name}" a le périmètre Extérieur coché, mais la surface extérieure est de 0 m². Veuillez renseigner votre surface extérieure.`);
        }
        return false;
      }
    }

    // Rule 9: Horaire avec heures = 0
    if (pType === 'HOURLY') {
      if (!sel.hours || sel.hours <= 0) {
        v47Attention(getCard());
        triggerComposerShake(document.querySelector('#toContact'));
        showValidationError(`Veuillez spécifier un nombre d'heures supérieur à 0 pour la prestation "${s.name}".`);
        return false;
      }
    }

    // Rule 9: Prix fixe avec quantité = 0
    if (pType === 'FIXED_UNIT') {
      if (!sel.quantity || sel.quantity <= 0) {
        v47Attention(getCard());
        triggerComposerShake(document.querySelector('#toContact'));
        showValidationError(`Veuillez spécifier une quantité supérieure à 0 pour la prestation "${s.name}".`);
        return false;
      }
    }

    // Rule 9: Pourcentage sans montant de référence
    if (pType === 'PERCENTAGE') {
      if (!sel.referenceAmount || sel.referenceAmount <= 0) {
        v47Attention(document.querySelector('.v46BudgetField') || getCard());
        triggerComposerShake(document.querySelector('#toContact'));
        showValidationError(`Veuillez saisir un montant de référence supérieur à 0 DA pour la prestation "${s.name}".`);
        return false;
      }
    }
  }

  return true;
}

const isMobile = () => window.matchMedia('(max-width: 840px)').matches;

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

        let controlsHtml = '';
        if (pType === 'PRICE_PER_M2' && (s.allowInterior !== false || s.allowExterior === true)) {
          controlsHtml = `<div class="v76ScopePick" aria-label="Périmètre de ${s.name}">
            ${s.allowInterior !== false ? `
              <label class="${sel.useInterior ? 'on' : ''}">
                <input type="checkbox" data-scope-int="${s.id}" ${sel.useInterior ? 'checked' : ''}>
                <span>Intérieur (${surfaceInterior()} m²)</span>
              </label>
            ` : ''}
            ${s.allowExterior === true ? `
              <label class="${sel.useExterior ? 'on' : ''}">
                <input type="checkbox" data-scope-ext="${s.id}" ${sel.useExterior ? 'checked' : ''}>
                <span>Extérieur (${surfaceExterior()} m²)</span>
              </label>
            ` : ''}
          </div>`;
        } else if (pType === 'HOURLY') {
          controlsHtml = `<label class="v76NumberField" title="Nombre d’heures">
            <span>Heures</span>
            <input type="number" min="1" step="1" inputmode="numeric" data-svc-hours="${s.id}" value="${sel.hours || 20}">
          </label>`;
        } else if (pType === 'FIXED_UNIT' && (s.allowQuantity !== false)) {
          controlsHtml = `<label class="v76NumberField" title="Quantité">
            <span>Qté</span>
            <input type="number" min="1" step="1" inputmode="numeric" data-svc-qty="${s.id}" value="${sel.quantity || 1}">
          </label>`;
        } else if (pType === 'PERCENTAGE') {
          controlsHtml = `<label class="v76ReferenceField" title="Montant de référence">
            <span>Montant de référence</span>
            <div>
              <input type="number" min="1" step="50000" inputmode="numeric" data-svc-ref="${s.id}" value="${sel.referenceAmount || 100000}" placeholder="100 000">
              <b>DA</b>
            </div>
          </label>`;
        }

        return `<article class="v46SelectedService v76ServiceRow v91ServiceCard" data-service-card="${s.id}">
          <div class="v46SelectedServiceTop v91ServiceHeader">
            <span>
              <b>${s.name}</b>
              <small>${pricingLabel}</small>
            </span>
          </div>

          ${controlsHtml ? `<div class="v91ServiceControls">${controlsHtml}</div>` : ''}

          <div class="v46SelectedCalc v91ServiceFooter">
            <strong class="v91ServicePrice">${money(linePrice)}</strong>
            <div class="v91ServiceActions">
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
        renderServices();
      } else {
        const sName = (s.name || '').toLowerCase();
        const is3dExt = sName.includes('3d') && (sName.includes('ext') || !s.allowInterior);
        const isExtOnly = (!s.allowInterior && s.allowExterior) || is3dExt;
        if (isExtOnly && surfaceExterior() <= 0) {
          if (typeof Swal !== 'undefined') {
            Swal.fire({
              title: 'Surface extérieure requise',
              text: `La prestation "${s.name}" s'applique aux espaces extérieurs. Veuillez indiquer votre surface extérieure (m²) :`,
              input: 'number',
              inputAttributes: { min: 1, step: 1 },
              inputValue: 30,
              showCancelButton: true,
              confirmButtonText: 'Valider',
              cancelButtonText: 'Annuler',
            }).then(res => {
              if (res.isConfirmed && Number(res.value) > 0) {
                st.surfaceExterior = Number(res.value);
                st.services = [...st.services, s.id];
                st.selectedServices[s.id] = getInitialSelection(s);
                st.selectedServices[s.id].useExterior = true;
                renderServices();
              }
            });
            return;
          }
        }
        st.services = [...st.services, s.id];
        if (!st.selectedServices[s.id]) {
          st.selectedServices[s.id] = getInitialSelection(s);
        }
        renderServices();
      }
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
      if (e.target.checked && surfaceExterior() <= 0) {
        if (typeof Swal !== 'undefined') {
          Swal.fire({
            title: 'Surface extérieure',
            text: 'Veuillez renseigner votre surface extérieure (terrasse, jardin, etc.) en m² :',
            input: 'number',
            inputAttributes: { min: 1, step: 1 },
            inputValue: 30,
            showCancelButton: true,
            confirmButtonText: 'Valider',
            cancelButtonText: 'Annuler',
          }).then(res => {
            if (res.isConfirmed && Number(res.value) > 0) {
              st.surfaceExterior = Number(res.value);
              st.selectedServices[s.id].useExterior = true;
              renderServices();
            } else {
              st.selectedServices[s.id].useExterior = false;
              renderServices();
            }
          });
          return;
        }
      }
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
        const strong = card.querySelector('.v91ServicePrice') || card.querySelector('.v46SelectedServiceTop > strong');
        if (strong) strong.textContent = money(getServiceLinePrice(s.id));
      }
      const availCard = b.querySelector(`.v46AvailableService:has([data-service="${s.id}"]) .v46ServiceAdd > strong`);
      if (availCard) availCard.textContent = money(getServiceLinePrice(s.id));
    });
    const mobileNextCount = document.querySelector('#v48MobileServiceNextCount');
    if (mobileNextCount) {
      const count = st.services.length;
      mobileNextCount.textContent = `${count} prestation${count > 1 ? 's' : ''}`;
    }
  }

  // Next button to contact step
  document.querySelector('#toContact')?.addEventListener('click', () => {
    if (validateServices()) gotoStep('contact');
  });

  setupMobileServiceStages();
  fitMobileServiceScroll();
}

function setupMobileServiceStages() {
  const screen = document.querySelector('.v46ServicesScreen');
  if (!screen) return;

  // If on desktop (> 840px), keep two-column layout
  if (!isMobile()) {
    screen.classList.remove('v48StageAvailable', 'v48StageSelected');
    document.querySelector('.v48MobileServiceProgress')?.remove();
    document.querySelector('.v48MobileServiceNext')?.remove();
    document.querySelector('.v48MobileServiceBack')?.remove();
    return;
  }

  if (st.mobileServiceStage !== 2) st.mobileServiceStage = 1;
  const stage = st.mobileServiceStage;

  screen.classList.toggle('v48StageAvailable', stage === 1);
  screen.classList.toggle('v48StageSelected', stage === 2);

  // Clean old elements
  document.querySelector('.v48MobileServiceProgress')?.remove();
  document.querySelector('.v48MobileServiceNext')?.remove();
  document.querySelector('.v48MobileServiceBack')?.remove();

  // Progress indicator: 1 Choisir / 2 Vérifier
  const progress = document.createElement('div');
  progress.className = 'v48MobileServiceProgress';
  progress.innerHTML = `
    <span class="${stage === 1 ? 'active' : 'done'}"><b>${stage === 1 ? '1' : '✓'}</b>Choisir</span>
    <span class="${stage === 2 ? 'active' : ''}"><b>2</b>Vérifier</span>
  `;
  screen.before(progress);

  const available = document.querySelector('.v46AvailableColumn');
  const selected = document.querySelector('.v46SelectedColumn');

  if (stage === 1) {
    const head = available?.querySelector('.v46ColumnHead h3');
    const eyebrow = available?.querySelector('.v46ColumnHead small');
    if (head) head.textContent = 'Choisissez vos prestations';
    if (eyebrow) eyebrow.textContent = '1 / 2 · SÉLECTION';

    const count = st.services?.length || 0;
    const bar = document.createElement('div');
    bar.className = 'v48MobileServiceNext';
    bar.innerHTML = `
      <span>
        <small>Votre sélection</small>
        <strong id="v48MobileServiceNextCount">${count} prestation${count > 1 ? 's' : ''}</strong>
      </span>
      <button type="button" id="v48ServicesNext" ${count === 0 ? 'disabled' : ''}>Suivant</button>
    `;
    document.querySelector('#composerBody')?.appendChild(bar);

    document.querySelector('#v48ServicesNext')?.addEventListener('click', () => {
      if (!(st.services?.length > 0)) {
        triggerComposerShake(document.querySelector('.v48MobileServiceNext'));
        const avail = document.querySelector('.v46AvailableColumn');
        v47Attention(avail);
        return;
      }
      st.mobileServiceStage = 2;
      renderServices();
      document.querySelector('#composer')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  if (stage === 2) {
    const back = document.createElement('button');
    back.type = 'button';
    back.className = 'v48MobileServiceBack';
    back.id = 'v48ServicesBack';
    back.textContent = '← Modifier les prestations';
    selected?.before(back);

    const head = selected?.querySelector('.v46ColumnHead h3');
    const eyebrow = selected?.querySelector('.v46ColumnHead small');
    if (head) head.textContent = 'Vérifiez votre sélection';
    if (eyebrow) eyebrow.textContent = '2 / 2 · VALIDATION';

    const continueBtn = document.querySelector('#toContact');
    if (continueBtn) continueBtn.textContent = 'Valider';

    back.addEventListener('click', () => {
      st.mobileServiceStage = 1;
      renderServices();
      document.querySelector('#composer')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }
}

function fitMobileServiceScroll() {
  if (!isMobile() || st?.step !== 'services') return;

  requestAnimationFrame(() => {
    const screen = document.querySelector('#composer .v46ServicesScreen');
    if (!screen) return;

    const stageAvailable = screen.classList.contains('v48StageAvailable');
    const scroll = stageAvailable
      ? document.querySelector('#composer .v46AvailableScroll')
      : document.querySelector('#composer .v46SelectedScroll');

    if (!scroll) return;

    const bottomBar = stageAvailable
      ? document.querySelector('#composer .v48MobileServiceNext')
      : document.querySelector('#composer .v46TotalDock');

    const top = scroll.getBoundingClientRect().top;
    const bottom = bottomBar
      ? bottomBar.getBoundingClientRect().top - 8
      : window.innerHeight - 90;

    const available = Math.max(180, Math.floor(bottom - top));

    scroll.style.setProperty('height', `${available}px`, 'important');
    scroll.style.setProperty('max-height', `${available}px`, 'important');
    scroll.style.setProperty('overflow-y', 'auto', 'important');
    scroll.style.setProperty('overflow-x', 'hidden', 'important');
    scroll.style.setProperty('touch-action', 'pan-y', 'important');
  });
}

window.addEventListener('resize', () => {
  if (st?.step === 'services') {
    setupMobileServiceStages();
    fitMobileServiceScroll();
  }
}, { passive: true });

window.addEventListener('orientationchange', () => {
  setTimeout(() => {
    if (st?.step === 'services') {
      setupMobileServiceStages();
      fitMobileServiceScroll();
    }
  }, 120);
}, { passive: true });

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
    const lineTotal = getServiceLinePrice(s.id);
    const pType = s.pricingType || (s.pricing_type === 'per_sqm' || s.pricing_type === 'area' ? 'PRICE_PER_M2' : (s.pricing_type === 'hourly' ? 'HOURLY' : (s.pricing_type === 'percent_project_cost' ? 'PERCENTAGE' : 'FIXED_UNIT')));

    if (pType === 'PRICE_PER_M2') {
      const surfaceUsed = (sel.useInterior ? surfaceInterior() : 0) + (sel.useExterior ? surfaceExterior() : 0);
      rows.push({
        designation: s.name,
        pu: s.unitRate || s.price || 0,
        unit: 'M²',
        qty: surfaceUsed,
        total: lineTotal
      });
    } else if (pType === 'HOURLY') {
      rows.push({
        designation: s.name,
        pu: s.hourlyRate || s.price || 0,
        unit: 'HEURE',
        qty: sel.hours || 20,
        total: lineTotal
      });
    } else if (pType === 'FIXED_UNIT') {
      rows.push({
        designation: s.name,
        pu: s.fixedUnitPrice || s.price || 0,
        unit: (s.unitName || 'UNITE').toUpperCase(),
        qty: sel.quantity || 1,
        total: lineTotal
      });
    } else if (pType === 'PERCENTAGE') {
      rows.push({
        designation: s.name,
        pu: `${s.percentage || 0}%`,
        unit: '%',
        qty: money(sel.referenceAmount || 0),
        total: lineTotal
      });
    } else {
      rows.push({
        designation: s.name,
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
function clientAddress(c){return [c?.commune,c?.wilayaName||c?.wilaya].filter(Boolean).join(', ')||'—'}

function companyHeaderHtml(){
  return `
    <header class="v47DocHeader">
      <div class="v47DocCompany">
        <h3>${COMPANY.name}</h3>
        <div class="v47DocCompanyGrid">
          <span><b>R.I.B N°:</b> ${COMPANY.rib}</span>
          <span></span>
          <span><b>RC N° :</b> ${COMPANY.rc}</span>
          <span><b>MAIL:</b> ${COMPANY.mail}</span>
          <span><b>NIS N°:</b> ${COMPANY.nis}</span>
          <span><b>MOBILE :</b> ${COMPANY.mobile}</span>
          <span><b>NIF :</b> ${COMPANY.nif}</span>
          <span><b>ADRESSE :</b> ${COMPANY.address}</span>
          <span><b>N ART :</b>${COMPANY.nart}</span>
          <span></span>
        </div>
      </div>
      <img class="v47DocLogo" src="/static/img/icon.jpeg" alt="LOFT DESIGN">
    </header>`;
}

function projectLabel(){
  if(st.mode==='quick')return spaces.filter(x=>st.spaces.includes(x.id)).map(x=>x.name).join(', ')||'Projet';
  const parts=[st.projectType||'Projet',`${projectLevelCodes().length} niveau(x)`,`${surfaceInterior()} m² intérieur`];
  if(surfaceExterior()>0)parts.push(`${surfaceExterior()} m² extérieur`);
  return parts.join(' · ');
}

function selectedServiceObjects(){
  return services.filter(s=>st.services.some(id=>String(id)===String(s.id)||String(id)===s.slug));
}
function serviceDesc(s){return s.short_description||s.desc||s.detailed_description||''}
function serviceIncludedItems(s){return s.included_items||s.includes||[]}
function serviceExcludedItems(s){return s.excluded_items||s.excludes||[]}

function servicePricingLabel(s){
  const pType=s.pricingType||'FIXED_UNIT';
  if(pType==='PRICE_PER_M2')return `${money(s.unitRate||s.price||0)} / m²`;
  if(pType==='HOURLY')return `${money(s.hourlyRate||s.price||0)} / h`;
  if(pType==='PERCENTAGE')return `${s.percentage||0}%`;
  return `${money(s.fixedUnitPrice||s.price||0)} / ${s.unitName||'forfait'}`;
}

/* Site-supervision / follow-up style services are identified by name since the
   real service catalog (admin-managed) has no dedicated category field for it. */
function isFollowupService(s){return /suivi|chantier|supervision|coordination|pilotage/i.test(`${s.name||''}`)}
function hasFollowupSelected(){return selectedServiceObjects().some(isFollowupService)}
function optionalFollowupServices(){
  if(hasFollowupSelected())return [];
  return services.filter(s=>!st.services.some(id=>String(id)===String(s.id))&&isFollowupService(s));
}

function uniqueTexts(values){
  const seen=new Set();
  return (values||[]).filter(v=>{
    const t=String(v||'').trim();
    if(!t)return false;
    const k=t.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
    if(seen.has(k))return false;
    seen.add(k);
    return true;
  });
}

function selectedExclusions(){
  const seen=new Set(),result=[];
  selectedServiceObjects().forEach(s=>{
    serviceExcludedItems(s).forEach(item=>{
      const text=String(item||'').trim();
      if(!text)return;
      const key=text.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
      if(seen.has(key))return;
      seen.add(key);
      result.push(text);
    });
  });
  return result;
}

function loftObligations(){
  const obligations=[
    'Exécuter uniquement les prestations expressément sélectionnées et décrites dans le présent contrat.',
    'Respecter le périmètre, les surfaces, quantités, heures et montants de référence validés dans le devis.',
    'Informer le client lorsqu’une demande sort du périmètre convenu avant d’engager une prestation supplémentaire.'
  ];
  selectedServiceObjects().forEach(s=>{
    obligations.push(`Réaliser la prestation « ${s.name} » selon le périmètre décrit : ${serviceDesc(s)||'voir le descriptif de la prestation.'}`);
  });
  if(!hasFollowupSelected()){
    obligations.push('La mission de Loft Design s’arrête aux études et livrables sélectionnés : aucun suivi de chantier, pilotage quotidien ou gestion des intervenants n’est compris.');
  }
  return uniqueTexts(obligations);
}

function clientObligations(){
  const obligations=[
    'Fournir des informations, plans, dimensions, photos et documents exacts et suffisamment complets pour permettre l’exécution des prestations.',
    'Valider ou commenter les propositions dans des délais compatibles avec l’avancement du projet.',
    'Informer Loft Design de toute modification du programme, des surfaces, des contraintes techniques ou du chantier susceptible d’affecter les études.',
    'Régler les montants dus selon le devis et les documents de facturation émis.'
  ];
  if(hasFollowupSelected()){
    obligations.push(
      'Garantir l’accès au chantier pendant les visites prévues et désigner un interlocuteur opérationnel disponible.',
      'Maintenir sous la responsabilité du maître d’ouvrage et des entreprises la sécurité du chantier, les méthodes d’exécution et l’organisation quotidienne non comprise dans la mission choisie.'
    );
  }
  return uniqueTexts(obligations);
}

function technicalContractHtml(){
  return selectedServiceObjects().map((s,i)=>`
    <article class="v79ContractService v81ContractService">
      <button type="button" class="v79ContractServiceHead v81ContractServiceToggle" data-contract-detail="${s.id}" aria-expanded="false">
        <span>${String(i+1).padStart(2,'0')}</span>
        <div><h6>${s.name}</h6><small>${s.detailed_description||serviceDesc(s)||'Prestation exécutée conformément au périmètre validé.'}</small></div>
        <i>Voir les détails</i>
      </button>
      <div class="v81ContractServiceDetails">
        <div class="v79ContractIncluded"><b>Inclus dans cette prestation</b>
          <ul>${serviceIncludedItems(s).map(x=>`<li>${x}</li>`).join('')||'<li>Périmètre décrit dans la prestation.</li>'}</ul>
        </div>
      </div>
    </article>`).join('');
}

function contractHtml(){
  const c=st.client||{};
  const exclusions=selectedExclusions();
  const optional=optionalFollowupServices();
  const loft=loftObligations(),client=clientObligations();
  return `
    <div class="v79ContractIntro">
      <p><b>Entre :</b> ${COMPANY.name}, ci-après « Loft Design », et <b>${clientLabel(c)}</b>, ci-après « le Client ».</p>
      <p><b>Projet :</b> ${projectLabel()} · <b>Référence :</b> ${st.ref}</p>
    </div>
    <div class="v47ContractClause"><h5>1. Objet du contrat</h5><p>Le présent contrat définit le périmètre de la mission confiée à Loft Design, les prestations retenues, les engagements de Loft Design et les obligations du Client.</p></div>
    <div class="v47ContractClause"><h5>2. Prix et base contractuelle</h5><p>Le devis financier ${st.ref} fait partie intégrante du contrat. Montant total HT : <b>${money(totalHT())}</b>.${st.clientType==='professional'?` TVA 19 % : <b>${money(tva())}</b>. Total TTC : <b>${money(totalFinal())}</b>.`:''} Toute prestation supplémentaire nécessite un accord écrit.</p></div>
    <div class="v47ContractClause v79TechnicalArticle">
      <h5>3. Offre technique intégrée au contrat</h5>
      <p>Les prestations ci-dessous constituent le périmètre technique contractuel. Cliquez sur une prestation pour consulter son descriptif et les éléments inclus.</p>
      <div class="v79ContractServices">${technicalContractHtml()}</div>
    </div>
    ${(exclusions.length||optional.length)?`
    <div class="v79ContractNb v81ContractNb">
      <h5>4. NB · Éléments et missions non inclus</h5>
      ${exclusions.length?`<ul class="v81ContractExclusions">${exclusions.map(x=>`<li>${x}</li>`).join('')}</ul>`:''}
      ${optional.length?`
      <div class="v81ContractOptional">
        <b>Prestations d’accompagnement disponibles</b>
        <p>Une formule peut être ajoutée au devis avant validation définitive.</p>
        <div class="v81ContractOptionalList">
          ${optional.map(s=>`
          <article class="v81ContractOptionalRow">
            <div><h6>${s.name}</h6><span>${servicePricingLabel(s)}</span></div>
            <div class="v81ContractOptionalActions"><button type="button" class="add" data-contract-add="${s.id}">Ajouter au devis</button></div>
          </article>`).join('')}
        </div>
      </div>`:''}
    </div>`:''}
    <div class="v47ContractClause"><h5>5. Obligations de Loft Design</h5><ul class="v79Obligations">${loft.map(x=>`<li>${x}</li>`).join('')}</ul></div>
    <div class="v47ContractClause"><h5>6. Obligations du Client</h5><ul class="v79Obligations">${client.map(x=>`<li>${x}</li>`).join('')}</ul></div>
    <div class="v47ContractClause"><h5>7. Validations, modifications et prestations supplémentaires</h5><p>Toute modification après validation ou tout changement de surface, quantité, heures, programme ou périmètre peut entraîner une révision du prix, du planning ou des livrables.</p></div>
    <div class="v47ContractClause"><h5>8. Intervention des entreprises et tiers</h5><p>Les entreprises, artisans, fournisseurs, bureaux d’études et autres intervenants restent responsables de leurs travaux, méthodes d’exécution, dimensionnements techniques, conformité réglementaire, sécurité et engagements contractuels.</p></div>
    <div class="v47ContractClause"><h5>9. Délais et coopération</h5><p>Les délais dépendent de la remise des informations nécessaires, des validations du Client et de la disponibilité des tiers concernés.</p></div>
    <div class="v47ContractClause"><h5>10. Validité et acceptation</h5><p>L’offre est valable 30 jours sauf indication contraire. La signature du contrat vaut acceptation du devis, de l’offre technique intégrée, des éléments non inclus et des obligations respectives.</p></div>
    <div class="v47Signatures v79Signatures">
      <div class="v47Signature"><b>Pour Loft Design</b><br><br>Nom : ____________________<br>Date : ____________________<br><br>Signature</div>
      <div class="v47Signature"><b>Le Client</b><br><br>Nom : ____________________<br>Date : ____________________<br><br>Signature précédée de « Lu et approuvé »</div>
    </div>`;
}

/* ---------- Quote persistence, sharing & read-only public view ---------- */
const QUOTE_STORE_KEY='loftDesign.quoteSnapshots.v1';

function quoteStore(){try{return JSON.parse(localStorage.getItem(QUOTE_STORE_KEY)||'[]')}catch(_){return []}}
function saveQuoteStore(rows){localStorage.setItem(QUOTE_STORE_KEY,JSON.stringify(rows||[]))}

function quoteSnapshot(){
  const c=st.client||{};
  return {
    id:st.ref||`LOFT-${Date.now()}`,
    ref:st.ref||'',
    savedAt:new Date().toISOString(),
    clientType:st.clientType,
    client:c,
    project:{type:st.projectType,label:projectLabel(),surfaceInterior:surfaceInterior(),surfaceExterior:surfaceExterior()},
    rows:quoteRows(),
    totals:{ht:totalHT(),tva:tva(),final:totalFinal()},
    contractHtml:contractHtml()
  };
}

function saveCurrentQuote(){
  const snap=quoteSnapshot();
  const rows=quoteStore();
  const i=rows.findIndex(x=>x.id===snap.id);
  if(i>=0)rows[i]=snap;else rows.unshift(snap);
  saveQuoteStore(rows.slice(0,50));
  return snap;
}

function encodeQuote(snapshot){return btoa(unescape(encodeURIComponent(JSON.stringify(snapshot))))}
function decodeQuote(value){try{return JSON.parse(decodeURIComponent(escape(atob(value))))}catch(_){return null}}

function publicQuoteUrl(snapshot=quoteSnapshot()){
  const base=location.href.split('?')[0].split('#')[0];
  return `${base}?quote=${encodeURIComponent(encodeQuote(snapshot))}#quote`;
}

async function shareQuoteLink(){
  const snap=saveCurrentQuote();
  const url=publicQuoteUrl(snap);
  const title=`Devis LOFT DESIGN ${snap.ref||snap.id}`;
  if(navigator.share){
    try{await navigator.share({title,text:`${title}\n${url}`,url});return}catch(_){}
  }
  try{
    await navigator.clipboard.writeText(url);
    if(window.Swal){Swal.fire({icon:'success',title:'Lien copié',text:'Le lien du dossier a été copié, vous pouvez le partager.',confirmButtonText:'Parfait',customClass:{popup:'swal2-popup',confirmButton:'btn neonCyan'},buttonsStyling:false})}
    else alert('Lien du dossier copié.');
  }catch(_){prompt('Copiez le lien du dossier :',url)}
}

function renderPublicQuote(snapshot){
  if(!snapshot)return;
  document.querySelector('#publicQuoteView')?.remove();
  document.body.classList.add('publicQuoteMode');
  const c=snapshot.client||{};
  const root=document.createElement('div');
  root.id='publicQuoteView';
  root.innerHTML=`
    <div class="publicQuoteShell">
      <button type="button" class="publicQuoteClose" id="publicQuoteClose">✕ Fermer</button>
      <article class="v47UnifiedDocument">
        ${companyHeaderHtml()}
        <section class="v47DocSection">
          <div class="v47DocSectionTitle"><h4>1 · Devis / offre financière</h4><span>${new Date(snapshot.savedAt).toLocaleDateString('fr-DZ')} · Réf. ${snapshot.ref}</span></div>
          <div class="v47ClientMeta">
            <span><b>Client</b><br>${clientLabel(c)}</span>
            <span><b>Projet</b><br>${snapshot.project?.label||''}</span>
            <span><b>Adresse</b><br>${clientAddress(c)}</span>
            <span><b>Contact</b><br>${c.phone||''} · ${c.email||''}</span>
          </div>
          <table class="v47DocTable">
            <thead><tr><th>Désignation</th><th>PU HT</th><th>Unité</th><th>Qté</th><th>Montant HT</th></tr></thead>
            <tbody>${(snapshot.rows||[]).map(r=>`<tr><td>${r.designation}</td><td>${typeof r.pu==='number'?money(r.pu):r.pu}</td><td>${r.unit}</td><td>${r.qty}</td><td>${money(r.total)}</td></tr>`).join('')}</tbody>
          </table>
          <div class="v47DocGrandTotal"><span>Total HT</span><b>${money(snapshot.totals?.ht||0)}</b></div>
          ${snapshot.clientType==='professional'?`
            <div class="v47DocGrandTotal"><span>TVA 19 %</span><b>${money(snapshot.totals?.tva||0)}</b></div>
            <div class="v47DocGrandTotal"><span>Total TTC</span><b>${money(snapshot.totals?.final||0)}</b></div>`:''}
        </section>
        <section class="v47DocSection v79ContractSection">
          <div class="v47DocSectionTitle"><h4>2 · Contrat personnalisé de prestations</h4><span>Offre technique intégrée · Réf. ${snapshot.ref}</span></div>
          ${snapshot.contractHtml||''}
        </section>
      </article>
    </div>`;
  document.body.appendChild(root);
  root.querySelector('#publicQuoteClose').onclick=()=>{
    root.remove();
    document.body.classList.remove('publicQuoteMode');
    history.replaceState(null,'',location.pathname+location.hash.replace(/^#?quote$/,''));
  };
  root.querySelectorAll('[data-contract-detail]').forEach(btn=>{
    btn.onclick=()=>{
      const card=btn.closest('.v81ContractService');if(!card)return;
      const open=card.classList.toggle('open');
      btn.setAttribute('aria-expanded',open?'true':'false');
    };
  });
}

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
  f.addEventListener('invalid', e => {
    triggerComposerShake(e.target);
    triggerComposerShake(f);
  }, true);
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
      triggerComposerShake(status);
      triggerComposerShake(f);
      btn.disabled = false;
      btn.textContent = 'Réessayer';
    }
  };
}

function renderSuccess(){
  const b=document.querySelector('#composerBody'),c=st.client||{},rows=quoteRows();
  b.innerHTML=`
    <div class="v47DocumentStage">
      <div class="v47DocumentActions">
        <div>
          <small>DOSSIER CLIENT · ${st.ref}</small>
          <b>Devis + contrat</b>
          <span class="v47SavedStatus" id="v47SavedStatus"></span>
        </div>
        <div class="v47DocumentButtons v81DocumentButtons">
          <button id="v47SaveDoc">Enregistrer</button>
          <button class="primary" id="v47DownloadDoc">Télécharger PDF</button>
          <button id="v47SendDoc">Envoyer le lien</button>
          <button id="sendEmailFacture">Envoyer par e-mail</button>
          <button id="restart">Nouveau projet</button>
        </div>
      </div>

      <article class="v47UnifiedDocument">
        ${companyHeaderHtml()}

        <section class="v47DocSection">
          <div class="v47DocSectionTitle">
            <h4>1 · Devis / offre financière</h4>
            <span>${new Date().toLocaleDateString('fr-DZ')} · Réf. ${st.ref}</span>
          </div>
          <div class="v47ClientMeta">
            <span><b>Client</b><br>${clientLabel(c)}</span>
            <span><b>Projet</b><br>${projectLabel()}</span>
            <span><b>Adresse</b><br>${clientAddress(c)}</span>
            <span><b>Contact</b><br>${c.phone||''} · ${c.email||''}</span>
          </div>
          <table class="v47DocTable">
            <thead><tr><th>Désignation</th><th>PU HT</th><th>Unité</th><th>Qté</th><th>Montant HT</th></tr></thead>
            <tbody>${rows.map(r=>`<tr><td>${r.designation}</td><td>${typeof r.pu==='number'?money(r.pu):r.pu}</td><td>${r.unit}</td><td>${r.qty}</td><td>${money(r.total)}</td></tr>`).join('')}</tbody>
          </table>
          <div class="v47DocGrandTotal"><span>Total HT</span><b>${money(totalHT())}</b></div>
          ${st.clientType==='professional'?`
            <div class="v47DocGrandTotal"><span>TVA 19 %</span><b>${money(tva())}</b></div>
            <div class="v47DocGrandTotal"><span>Total TTC</span><b>${money(totalFinal())}</b></div>
          `:''}
        </section>

        <section class="v47DocSection v79ContractSection">
          <div class="v47DocSectionTitle">
            <h4>2 · Contrat personnalisé de prestations</h4>
            <span>Offre technique intégrée · Réf. ${st.ref}</span>
          </div>
          ${contractHtml()}
        </section>
      </article>
    </div>
  `;

  document.querySelectorAll('[data-contract-detail]').forEach(btn=>{
    btn.onclick=()=>{
      const card=btn.closest('.v81ContractService');if(!card)return;
      const open=card.classList.toggle('open');
      btn.setAttribute('aria-expanded',open?'true':'false');
      const label=btn.querySelector('i');if(label)label.textContent=open?'Masquer les détails':'Voir les détails';
    };
  });

  document.querySelectorAll('[data-contract-add]').forEach(btn=>{
    btn.onclick=()=>{
      const id=btn.dataset.contractAdd;
      if(!st.services.includes(id))st.services=[...st.services,id];
      ensureSelectedServicesState();
      renderSuccess();
    };
  });

  document.querySelector('#v47SaveDoc').onclick=()=>{
    const snap=saveCurrentQuote();
    const status=document.querySelector('#v47SavedStatus');
    if(status){
      status.textContent=`Dossier ${snap.ref||snap.id} enregistré.`;
      setTimeout(()=>{status.textContent=''},2600);
    }
  };

  document.querySelector('#v47DownloadDoc').onclick=()=>downloadUnifiedPdf();
  document.querySelector('#v47SendDoc').onclick=()=>shareQuoteLink();

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

/* Unified PDF export: devis + technical/contract offer, matching the on-screen
   v47DocumentStage dossier (the server-generated PDF behind "Envoyer par e-mail"
   only covers the devis, so this client-side export is what produces the full
   contract dossier as a downloadable file). */
function downloadUnifiedPdf(){
  if(!window.jspdf){alert('Le module PDF se charge. Réessayez dans un instant.');return}
  const {jsPDF}=window.jspdf,doc=new jsPDF({unit:'mm',format:'a4'});
  const rows=quoteRows(),c=st.client||{};
  const teal=[18,126,143],cyan=[221,241,244],cyan2=[157,208,218];

  function pageHeader(subtitle){
    doc.setFillColor(231,238,229);doc.rect(0,0,210,48,'F');
    doc.setTextColor(72,77,75);doc.setFont('helvetica','bold');doc.setFontSize(12);
    doc.text(COMPANY.name,15,13);
    doc.setFontSize(7);doc.setTextColor(75,83,81);
    doc.text(`R.I.B N°: ${COMPANY.rib}`,15,19);
    doc.setFont('helvetica','bold');doc.text('RC N° :',15,24);doc.setFont('helvetica','normal');doc.text(COMPANY.rc,29,24);
    doc.setFont('helvetica','bold');doc.text('MAIL:',95,24);doc.setFont('helvetica','normal');doc.text(COMPANY.mail,105,24);
    doc.setFont('helvetica','bold');doc.text('NIS N°:',15,29);doc.setFont('helvetica','normal');doc.text(COMPANY.nis,29,29);
    doc.setFont('helvetica','bold');doc.text('MOBILE :',95,29);doc.setFont('helvetica','normal');doc.text(COMPANY.mobile,111,29);
    doc.setFont('helvetica','bold');doc.text('NIF :',15,34);doc.setFont('helvetica','normal');doc.text(COMPANY.nif,25,34);
    doc.setFont('helvetica','bold');doc.text('ADRESSE :',95,34);doc.setFont('helvetica','normal');doc.text(COMPANY.address,113,34);
    doc.setFont('helvetica','bold');doc.text('N ART :',15,39);doc.setFont('helvetica','normal');doc.text(COMPANY.nart,29,39);
    doc.setDrawColor(244,184,95);doc.setLineWidth(.8);doc.rect(178,6,20,18);
    doc.setFont('helvetica','bold');doc.setFontSize(10);doc.text('LOFT',188,13,{align:'center'});
    doc.setFontSize(6);doc.text('DESIGN',188,19,{align:'center'});
    doc.setFontSize(11);doc.setTextColor(40);doc.text(`DOSSIER ${st.ref}`,150,29,{align:'right'});
    doc.setFontSize(7.5);doc.setTextColor(90);doc.text(subtitle,150,35,{align:'right'});
  }

  /* Page 1+: devis */
  pageHeader('DEVIS · OFFRE FINANCIÈRE');
  doc.setFont('helvetica','bold');doc.setFontSize(9);doc.setTextColor(60);
  doc.text(`CLIENT : ${clientLabel(c)}`,15,58);
  doc.text(`PROJET : ${projectLabel()}`,15,64);
  doc.setFont('helvetica','normal');
  doc.text(`ADRESSE : ${clientAddress(c)}`,15,70);
  doc.text(`DATE : ${new Date().toLocaleDateString('fr-DZ')}`,150,58);

  doc.autoTable({
    startY:76,margin:{left:15,right:15,top:50,bottom:20},
    head:[['DÉSIGNATION','PU HT','UNITÉ','QTÉ','MONTANT HT']],
    body:rows.map(r=>[r.designation,typeof r.pu==='number'?money(r.pu):r.pu,r.unit,String(r.qty),money(r.total)]),
    headStyles:{fillColor:teal,textColor:255,fontSize:8},
    styles:{fontSize:8,cellPadding:3,textColor:[62,69,67]},
    didDrawPage:(data)=>{if(data.pageNumber>1)pageHeader('DEVIS · OFFRE FINANCIÈRE (suite)')}
  });

  let y=doc.lastAutoTable.finalY+6;
  if(y>255){doc.addPage();pageHeader('DEVIS · OFFRE FINANCIÈRE (suite)');y=58}
  doc.setFillColor(...cyan);doc.rect(115,y,80,9,'F');
  doc.setFont('helvetica','bold');doc.setTextColor(50);doc.setFontSize(9.5);
  doc.text('TOTAL HT',120,y+6);doc.text(money(totalHT()),190,y+6,{align:'right'});
  if(st.clientType==='professional'){
    y+=9;doc.setFillColor(...cyan2);doc.rect(115,y,80,9,'F');
    doc.text('TVA 19 %',120,y+6);doc.text(money(tva()),190,y+6,{align:'right'});
    y+=9;doc.setFillColor(...cyan2);doc.rect(115,y,80,9,'F');
    doc.text('TOTAL TTC',120,y+6);doc.text(money(totalFinal()),190,y+6,{align:'right'});
  }

  /* Contract, rendered as a single-column autoTable so pagination is automatic. */
  const clauseRows=[];
  const addTitle=t=>clauseRows.push([{content:t,styles:{fontStyle:'bold',textColor:teal,fontSize:9,cellPadding:{top:5,bottom:2,left:0,right:0}}}]);
  const addText=t=>clauseRows.push([{content:t,styles:{fontSize:8,textColor:[70,78,75],cellPadding:{top:0,bottom:3,left:0,right:0}}}]);
  const addList=items=>items.forEach(it=>clauseRows.push([{content:`•  ${it}`,styles:{fontSize:7.6,textColor:[70,78,75],cellPadding:{top:.5,bottom:.5,left:4,right:0}}}]));

  addTitle('Entre');
  addText(`${COMPANY.name} (« Loft Design ») et ${clientLabel(c)} (« le Client »). Projet : ${projectLabel()}. Référence : ${st.ref}.`);
  addTitle('1. Objet du contrat');
  addText('Le présent contrat définit le périmètre de la mission confiée à Loft Design, les prestations retenues, les engagements de Loft Design et les obligations du Client.');
  addTitle('2. Prix et base contractuelle');
  addText(`Le devis financier ${st.ref} fait partie intégrante du contrat. Montant total HT : ${money(totalHT())}.${st.clientType==='professional'?` TVA 19 % : ${money(tva())}. Total TTC : ${money(totalFinal())}.`:''} Toute prestation supplémentaire nécessite un accord écrit.`);
  addTitle('3. Offre technique intégrée au contrat');
  selectedServiceObjects().forEach((s,i)=>{
    addTitle(`${String(i+1).padStart(2,'0')} · ${s.name}`);
    addText(s.detailed_description||serviceDesc(s)||'Prestation exécutée conformément au périmètre validé.');
    addList(serviceIncludedItems(s).length?serviceIncludedItems(s):['Périmètre décrit dans la prestation.']);
  });
  const exclusions=selectedExclusions();
  if(exclusions.length){addTitle('4. NB · Éléments et missions non inclus');addList(exclusions)}
  addTitle('5. Obligations de Loft Design');addList(loftObligations());
  addTitle('6. Obligations du Client');addList(clientObligations());
  addTitle('7. Validations, modifications et prestations supplémentaires');
  addText('Toute modification après validation ou tout changement de surface, quantité, heures, programme ou périmètre peut entraîner une révision du prix, du planning ou des livrables.');
  addTitle('8. Intervention des entreprises et tiers');
  addText('Les entreprises, artisans, fournisseurs, bureaux d’études et autres intervenants restent responsables de leurs travaux, méthodes d’exécution, dimensionnements techniques, conformité réglementaire, sécurité et engagements contractuels.');
  addTitle('9. Délais et coopération');
  addText('Les délais dépendent de la remise des informations nécessaires, des validations du Client et de la disponibilité des tiers concernés.');
  addTitle('10. Validité et acceptation');
  addText('L’offre est valable 30 jours sauf indication contraire. La signature du contrat vaut acceptation du devis, de l’offre technique intégrée, des éléments non inclus et des obligations respectives.');

  doc.addPage();
  doc.autoTable({
    startY:50,margin:{left:15,right:15,top:50,bottom:20},
    theme:'plain',showHead:false,body:clauseRows,
    didDrawPage:()=>pageHeader('CONTRAT PERSONNALISÉ DE PRESTATIONS')
  });

  let sy=doc.lastAutoTable.finalY+10;
  if(sy>250){doc.addPage();pageHeader('CONTRAT — SIGNATURES');sy=58}
  doc.setFont('helvetica','bold');doc.setFontSize(8);doc.setTextColor(60);
  doc.text('Pour Loft Design',15,sy);
  doc.text('Le Client',110,sy);
  doc.setFont('helvetica','normal');doc.setFontSize(7.5);doc.setTextColor(90);
  doc.text(['Nom : ____________________','Date : ____________________','Signature'],15,sy+6,{lineHeightFactor:1.8});
  doc.text(['Nom : ____________________','Date : ____________________','Signature précédée de « Lu et approuvé »'],110,sy+6,{lineHeightFactor:1.8});

  doc.save(`DOSSIER_LOFT_DESIGN_${st.ref.replaceAll('/','-')}.pdf`);
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

/* Opening a shared dossier link (?quote=...) shows the read-only public view. */
(function(){
  const encoded=new URLSearchParams(location.search).get('quote');
  if(encoded){
    const snap=decodeQuote(encoded);
    if(snap)renderPublicQuote(snap);
  }
})();

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
