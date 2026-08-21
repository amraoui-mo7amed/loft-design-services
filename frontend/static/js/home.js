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
S.onpointerdown=e=>{if(e.pointerType==='mouse'&&e.button)return;if(e.target.closest('.visit360'))return;down=e.clientX;sx=e.clientX;sy=e.clientY;hit=e.target.closest('.pc')?+e.target.closest('.pc').dataset.i:null;drag=0;prog=0;S.classList.add('drag');if(e.pointerType!=='mouse')try{S.setPointerCapture(e.pointerId)}catch(_){}};S.onpointermove=e=>{if(down==null)return;const dx=e.clientX-down;if(Math.abs(dx)>4)drag=1;queue(Math.max(-1.08,Math.min(1.08,-dx/Math.max(170,cardSize()*.95))));if(e.pointerType!=='mouse')e.preventDefault()};S.onpointerup=e=>{if(down==null)return;const mv=Math.hypot(e.clientX-sx,e.clientY-sy),was=drag;if(was&&Math.abs(prog)>.27)A=(A+(prog>0?1:-1)+C.length)%C.length;if(was)last=Date.now();down=null;prog=0;drag=0;S.classList.remove('drag');renderSlider();if(!was&&mv<8&&Number.isInteger(hit)){if(hit!==A){A=hit;renderSlider()}else openGallery(hit)}hit=null};S.onpointercancel=()=>{down=null;prog=0;drag=0;S.classList.remove('drag');renderSlider()};C.forEach((c,i)=>c.onclick=e=>{if(e.target.closest('.visit360'))return;e.stopPropagation();if(Date.now()-last<250)return;if(i!==A){A=i;renderSlider()}else openGallery(i)});let wl=0;S.onwheel=e=>{if(innerWidth<1024)return;e.preventDefault();if(wl)return;const d=Math.abs(e.deltaX)>Math.abs(e.deltaY)?e.deltaX:e.deltaY;if(Math.abs(d)>4){A=(A+(d>0?1:-1)+C.length)%C.length;renderSlider();wl=1;setTimeout(()=>wl=0,220)}};document.querySelector('#galleryClose').onclick=()=>document.querySelector('#gallerySheet').classList.remove('open');
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
const spaces = (window.SPACES_DATA && window.SPACES_DATA.length > 0) ? window.SPACES_DATA : [{id:'living',name:'Living room',price:8000,img:'https://loftdesign.bilnov.com/media/spaces/gallery/living-room/16757/image_1.jpg'},{id:'bed',name:'Bedroom',price:6000,img:'https://loftdesign.bilnov.com/media/portfolio/thumbnails/Enscape_2026-02-05-20-45-23_Enscape_scene_8.jpg'},{id:'kitchen',name:'Kitchen',price:12000,img:'https://loftdesign.bilnov.com/media/spaces/gallery/kitchen-interior/11154/image_1.jpg'},{id:'bath',name:'Bathroom',price:7000,img:'https://loftdesign.bilnov.com/media/spaces/gallery/bathroom/15230/image_1_dsgPgFt.jpg'},{id:'kids',name:'Children room',price:6500,img:'https://loftdesign.bilnov.com/media/spaces/gallery/children-room/10567/image_1_qP62mWe.jpg'}];
const services = (window.SERVICES_DATA && window.SERVICES_DATA.length > 0) ? window.SERVICES_DATA : [{id:'3d',name:'Modélisation 3D',price:750},{id:'360',name:'Visite virtuelle 360°',price:8000},{id:'light',name:'Étude d’éclairage',price:12000}];
const defaultSelectedSpaces = (spaces.length >= 2) ? [spaces[0].id, spaces[1].id] : (spaces[0] ? [spaces[0].id] : ['living', 'bed']);
let upperLevels=['R+3','R+2','R+1'];const middleLevels=['Terrasse / Jardin','RDC'];let lowerLevels=['R-1'];
let st={mode:'quick',step:'project',spaces:defaultSelectedSpaces,services:['3d','360'],projectType:'',levels:[],surfaces:{},promptLevel:null,typeAttention:false,missing:[],clientType:'particular',success:false,ref:'',client:null};
const area=()=>st.levels.reduce((s,l)=>s+(+st.surfaces[l]||0),0);const base=()=>st.mode==='quick'?spaces.filter(x=>st.spaces.includes(x.id)).reduce((s,x)=>s+(x.price||0),0):0;const servicePrice=id=>id==='3d'?750*(st.mode==='custom'?area():320):id==='360'?8000:12000;const servTotal=()=>st.services.reduce((s,id)=>s+servicePrice(id),0);const totalHT=()=>base()+servTotal();const tva=()=>st.clientType==='professional'?totalHT()*.19:0;const totalFinal=()=>totalHT()+tva();
function gotoStep(step){st.step=step;st.success=false;renderComposer();document.querySelector('#composer').scrollIntoView({behavior:'smooth',block:'start'})}function updateProgress(){const order={project:0,services:1,contact:2};document.querySelectorAll('.progress button').forEach(b=>{const s=b.dataset.step;b.classList.toggle('active',s===st.step);b.classList.toggle('done',order[s]<order[st.step]);b.querySelector('i').textContent=order[s]<order[st.step]?'✓':String(order[s]+1).padStart(2,'0');b.onclick=()=>gotoStep(s)})}
function drawTypeAttention(){st.typeAttention=true;renderComposer();setTimeout(()=>{const x=document.querySelector('#projectType');x?.focus()},80);setTimeout(()=>{st.typeAttention=false;document.querySelector('.typeBox')?.classList.remove('attention')},2500)}
function levelClick(l){if(!st.projectType){drawTypeAttention();return}if(st.projectType==='Appartement'&&!st.levels.includes(l)&&st.levels.length>=1){const selected=document.querySelector('.levelRow.selected');selected?.classList.add('attention');setTimeout(()=>selected?.classList.remove('attention'),1000);return}if(st.levels.includes(l)){st.levels=st.levels.filter(x=>x!==l);delete st.surfaces[l];st.promptLevel=null}else{st.levels.push(l);st.promptLevel=l;st.missing=[]}renderComposer();setTimeout(()=>{const x=document.querySelector(`[data-surface="${CSS.escape(l)}"]`);if(x){x.focus();x.select?.()}},80)}

function nextUpperLevel(){
  const nums=upperLevels.map(x=>+x.replace('R+','')).filter(Number.isFinite);
  return `R+${Math.max(0,...nums)+1}`;
}
function nextLowerLevel(){
  const nums=lowerLevels.map(x=>+x.replace('R-','')).filter(Number.isFinite);
  return `R-${Math.max(0,...nums)+1}`;
}
function addUpperLevel(){
  const n=nextUpperLevel();
  upperLevels=[n,...upperLevels];
  renderComposer();
  setTimeout(()=>document.querySelector(`[data-level="${n}"]`)?.closest('.levelRow')?.classList.add('newLevel'),20);
}
function addLowerLevel(){
  const n=nextLowerLevel();
  lowerLevels=[...lowerLevels,n];
  renderComposer();
  setTimeout(()=>document.querySelector(`[data-level="${n}"]`)?.closest('.levelRow')?.classList.add('newLevel'),20);
}
function levelRowHTML(l){
  return `<div class="levelRow ${st.levels.includes(l)?'selected':''}">
    <button type="button" data-level="${l}">
      <i>${st.levels.includes(l)?'✓':''}</i><strong>${l}</strong>
    </button>
    ${st.levels.includes(l)?`<div class="surface ${st.promptLevel===l&&!(+st.surfaces[l]>0)?'prompt':''} ${st.missing.includes(l)?'error':''}">
      <input type="number" min="1" inputmode="decimal" placeholder="Surface" data-surface="${l}" value="${st.surfaces[l]??''}">
      <span>m²</span>
    </div>`:''}
  </div>`;
}
function validateSurfaces(){if(!st.projectType){drawTypeAttention();return false}if(!st.levels.length){document.querySelector('.levels')?.animate([{transform:'translateX(-5px)'},{transform:'translateX(5px)'},{transform:'none'}],{duration:360,iterations:2});return false}const missing=st.levels.filter(l=>!(+st.surfaces[l]>0));if(missing.length){st.missing=missing;renderComposer();return false}return true}
function renderProject(){
  const body=document.querySelector('#composerBody');
  body.innerHTML=`
    <div class="modeTabs">
      <button class="${st.mode==='quick'?'on':''}" id="quickMode"><b>Choisir mes espaces</b><small>Rapide et visuel</small></button>
      <button class="${st.mode==='custom'?'on':''}" id="customMode"><b>Projet personnalisé</b><small>Niveaux et superficies</small></button>
    </div>
    <div id="modeBody"></div>`;

  document.querySelector('#quickMode').onclick=()=>{st.mode='quick';renderComposer()};
  document.querySelector('#customMode').onclick=()=>{st.mode='custom';renderComposer()};
  const m=document.querySelector('#modeBody');

  if(st.mode==='quick'){
    m.innerHTML=`
      <div class="spaceGrid">
        ${spaces.map(s=>`<button class="spaceCard ${st.spaces.includes(s.id)?'selected':''}" data-space="${s.id}">
          <img src="${s.img}" alt="${s.name}" onerror="if(!this.dataset.retried){this.dataset.retried='1';this.src='https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=600';}">
          <i class="check">${st.spaces.includes(s.id)?'✓':'+'}</i>
          <span class="copy"><strong>${s.name}</strong><small>${money(s.price)} HT</small></span>
        </button>`).join('')}
      </div>
      <div class="composerBottom">
        <div><small>${st.spaces.length} espaces sélectionnés</small><b>${money(base())} HT</b></div>
        <button class="nextBtn" id="toServices">Continuer →</button>
      </div>`;
    m.querySelectorAll('[data-space]').forEach(b=>b.onclick=()=>{
      const id=b.dataset.space;
      st.spaces=st.spaces.includes(id)?st.spaces.filter(x=>x!==id):[...st.spaces,id];
      renderComposer();
    });
    document.querySelector('#toServices').onclick=()=>gotoStep('services');
    return;
  }

  const canAddLevels=st.projectType!=='Appartement';
  m.innerHTML=`
    <div class="typeBox ${st.typeAttention?'attention':''}">
      <label>TYPE DE PROJET · OBLIGATOIRE</label>
      <select id="projectType">
        <option value="">Sélectionnez un type de projet</option>
        ${['Résidence','Villa','Appartement','Commercial','Bureau','Hôtel'].map(x=>`<option ${st.projectType===x?'selected':''}>${x}</option>`).join('')}
      </select>
      ${!st.projectType?'<div class="typeHint">Commencez ici avant de sélectionner un niveau.</div>':''}
    </div>

    <div class="levels levelsVertical ${!st.projectType?'locked':''}">
      ${canAddLevels?'<button type="button" class="addLevelBtn addUpper" id="addUpper">＋ Ajouter un étage</button>':''}

      <div class="levelGroup upperGroup">
        <span class="levelGroupLabel">ÉTAGES</span>
        ${upperLevels.map(levelRowHTML).join('')}
      </div>

      <div class="levelGroup middleGroup">
        <span class="levelGroupLabel">NIVEAU PRINCIPAL</span>
        ${middleLevels.map(levelRowHTML).join('')}
      </div>

      <div class="levelGroup lowerGroup">
        <span class="levelGroupLabel">SOUS-SOLS</span>
        ${lowerLevels.map(levelRowHTML).join('')}
      </div>

      ${canAddLevels?'<button type="button" class="addLevelBtn addLower" id="addLower">＋ Ajouter un étage</button>':''}
    </div>

    <div class="composerBottom">
      <div><small>${st.levels.length} niveau(x) · ${area()} m²</small><b>${st.projectType||'Type non sélectionné'}</b></div>
      <button class="nextBtn" id="toServices">Continuer →</button>
    </div>`;

  document.querySelector('#projectType').onchange=e=>{
    st.projectType=e.target.value;
    st.typeAttention=false;
    if(st.projectType==='Appartement'&&st.levels.length>1){
      const keep=st.levels[0];
      st.levels=[keep];
      st.surfaces=Object.fromEntries([[keep,st.surfaces[keep]||'']]);
    }
    renderComposer();
  };

  document.querySelector('#addUpper')?.addEventListener('click',addUpperLevel);
  document.querySelector('#addLower')?.addEventListener('click',addLowerLevel);

  m.querySelectorAll('[data-level]').forEach(b=>b.onclick=()=>levelClick(b.dataset.level));
  m.querySelectorAll('[data-surface]').forEach(i=>i.oninput=e=>{
    st.surfaces[e.target.dataset.surface]=e.target.value;
    st.promptLevel=null;
    st.missing=st.missing.filter(x=>x!==e.target.dataset.surface);
    e.target.closest('.surface').classList.remove('error');
  });
  document.querySelector('#toServices').onclick=()=>{if(validateSurfaces())gotoStep('services')};
}

function renderServices(){const b=document.querySelector('#composerBody');b.innerHTML=`<div class="serviceStage"><div class="serviceChoices"><h3>Prestations disponibles</h3><p>Choisissez les services à ajouter. Le total évolue immédiatement.</p>${services.map(s=>`<button class="serviceChoice ${st.services.includes(s.id)?'selected':''}" data-service="${s.id}"><i>${st.services.includes(s.id)?'✓':'+'}</i><span><strong>${s.name}</strong><small>${s.id==='3d'?money(s.price)+' / m²':money(s.price)+' / forfait'}</small></span><b>${money(servicePrice(s.id))}</b></button>`).join('')}</div><aside class="quote"><h3>Votre estimation</h3>${services.filter(s=>st.services.includes(s.id)).map(s=>`<div class="quoteRow"><span>✓ ${s.name}</span><b>${money(servicePrice(s.id))}</b></div>`).join('')}<div class="quoteRow"><span>Base projet</span><b>${money(base())}</b></div><strong class="grand"><small>TOTAL ESTIMÉ HT</small>${money(totalHT())}</strong><button class="nextBtn" style="width:100%;margin-top:11px" id="toContact">Continuer →</button></aside></div>`;b.querySelectorAll('[data-service]').forEach(x=>x.onclick=()=>{const id=x.dataset.service;st.services=st.services.includes(id)?st.services.filter(y=>y!==id):[...st.services,id];renderComposer()});document.querySelector('#toContact').onclick=()=>gotoStep('contact')}
/* Algeria 2026 dataset */
let geo={wilayas:[],communes:[]};const fallbackWilayas=['Adrar','Chlef','Laghouat','Oum El Bouaghi','Batna','Béjaïa','Biskra','Béchar','Blida','Bouira','Tamanrasset','Tébessa','Tlemcen','Tiaret','Tizi Ouzou','Alger','Djelfa','Jijel','Sétif','Saïda','Skikda','Sidi Bel Abbès','Annaba','Guelma','Constantine','Médéa','Mostaganem','M’Sila','Mascara','Ouargla','Oran','El Bayadh','Illizi','Bordj Bou Arréridj','Boumerdès','El Tarf','Tindouf','Tissemsilt','El Oued','Khenchela','Souk Ahras','Tipaza','Mila','Aïn Defla','Naâma','Aïn Témouchent','Ghardaïa','Relizane','Timimoun','Bordj Badji Mokhtar','Ouled Djellal','Béni Abbès','In Salah','In Guezzam','Touggourt','Djanet','El M’Ghair','El Meniaa','Aflou','El Abiodh Sidi Cheikh','El Aricha','El Kantara','Barika','Bou Saâda','Bir El Ater','Ksar El Boukhari','Ksar Chellala','Aïn Oussera','Messaad'];
async function loadGeo(){try{const [w,c]=await Promise.all([fetch('https://mohamed-gp.github.io/algeria_69_wilayas/main.json').then(r=>r.json()),fetch('https://mohamed-gp.github.io/algeria_69_wilayas/communes.json').then(r=>r.json())]);geo.wilayas=w.wilayas||[];geo.communes=c.communes||[]}catch(_){geo.wilayas=fallbackWilayas.map((name,i)=>({id:i+1,name}));geo.communes=[]}refreshGeoSelects()}loadGeo();
function refreshGeoSelects(){const ws=document.querySelector('#wilaya');if(!ws)return;const current=ws.value;ws.innerHTML='<option value="">Choisir la wilaya</option>'+geo.wilayas.map(w=>`<option value="${w.id}" ${String(w.id)===current?'selected':''}>${String(w.id).padStart(2,'0')} - ${w.name}</option>`).join('');populateCommunes(ws.value)}function populateCommunes(id){const cs=document.querySelector('#commune');if(!cs)return;const list=geo.communes.filter(c=>String(c.wilaya_id)===String(id));cs.innerHTML='<option value="">Choisir la commune</option>'+list.map(c=>`<option>${c.name}</option>`).join('')+(list.length?'':'<option>Autre / à préciser</option>')}
function quoteRows(){const rows=[];if(st.mode==='quick')spaces.filter(x=>st.spaces.includes(x.id)).forEach(x=>rows.push({designation:`Conception espace - ${x.name}`,pu:x.price,unit:'ESPACE',qty:1,total:x.price}));st.services.filter(id=>st.services.includes(id)).forEach(id=>{const s=services.find(x=>x.id===id);if(id==='3d'&&st.mode==='custom')rows.push({designation:'Modélisation 3D - rendu immersif',pu:750,unit:'M2',qty:area(),total:750*area()});else rows.push({designation:s.name,pu:servicePrice(id),unit:'FORFAIT',qty:1,total:servicePrice(id)})});return rows}
function clientLabel(c){return st.clientType==='professional'?c.company:`${c.firstName||''} ${c.lastName||''}`.trim()}function summary(c=st.client||{}){const proj=st.mode==='quick'?`Espaces: ${spaces.filter(x=>st.spaces.includes(x.id)).map(x=>x.name).join(', ')}`:`Type: ${st.projectType}; Niveaux: ${st.levels.map(l=>l+' '+(st.surfaces[l]||0)+' m²').join(', ')}`;return `${proj}\nPrestations: ${services.filter(x=>st.services.includes(x.id)).map(x=>x.name).join(', ')}\nClient: ${clientLabel(c)}\nTotal HT: ${money(totalHT())}${st.clientType==='professional'?`\nTVA 19%: ${money(tva())}\nTotal TTC: ${money(totalFinal())}`:''}`}
function makeRef(){const d=new Date(),n=Math.floor(1000+Math.random()*9000);return `${String(d.getFullYear()).slice(-2)}${String(d.getMonth()+1).padStart(2,'0')}-${n}/${d.getFullYear()}`}
async function emailProject(c){const payload={_subject:`Nouvelle demande LOFT DESIGN - Devis ${st.ref}`,_template:'table','N° devis':st.ref,'Type client':st.clientType==='professional'?'Professionnel':'Particulier','Client':clientLabel(c),'Téléphone':c.phone,'E-mail':c.email,'Wilaya':c.wilayaName,'Commune':c.commune,'Projet':summary(c),'Message':c.message||''};const r=await fetch('https://formsubmit.co/ajax/loftdesign@live.fr',{method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json'},body:JSON.stringify(payload)});if(!r.ok)throw Error('mail')}
function getClientData(form){const d=Object.fromEntries(new FormData(form).entries());const w=geo.wilayas.find(x=>String(x.id)===String(d.wilaya));return {...d,wilayaName:w?.name||d.wilaya}}
function renderContactStep(){const b=document.querySelector('#composerBody');if(st.success){renderSuccess();return}b.innerHTML=`<div class="clientType"><button class="${st.clientType==='particular'?'active':''}" data-client="particular">Particulier</button><button class="${st.clientType==='professional'?'active':''}" data-client="professional">Professionnel</button></div><form class="contactForm" id="composerForm">${st.clientType==='particular'?'<label>Prénom<input required name="firstName" placeholder="Votre prénom"></label><label>Nom<input required name="lastName" placeholder="Votre nom"></label>':'<label class="full">Nom de l’entreprise<input required name="company" placeholder="Raison sociale / nom de l’entreprise"></label>'}<label>Téléphone<input required name="phone" placeholder="+213 ..."></label><label>E-mail<input required type="email" name="email" placeholder="vous@exemple.com"></label><label>Wilaya<select required name="wilaya" id="wilaya"><option value="">Chargement…</option></select></label><label>Commune<select required name="commune" id="commune"><option value="">Choisir la commune</option></select></label><label class="full">Message / observations<textarea name="message" placeholder="Décrivez brièvement vos attentes…"></textarea></label><div class="contactTotal"><div><strong>${st.clientType==='professional'?'Devis professionnel TTC':'Devis particulier HT'}</strong><div class="tax">${st.clientType==='professional'?`HT ${money(totalHT())} · TVA 19% ${money(tva())}`:'TVA non ajoutée dans cette estimation'}</div></div><b>${money(totalFinal())}</b></div><div class="submitRow"><button class="btn neonCyan" type="submit" id="sendProject">Valider & envoyer</button></div><small class="full" id="formStatus" style="text-align:center;color:#aeb6b3"></small></form>`;document.querySelectorAll('[data-client]').forEach(x=>x.onclick=()=>{st.clientType=x.dataset.client;renderComposer()});refreshGeoSelects();document.querySelector('#wilaya').onchange=e=>populateCommunes(e.target.value);const f=document.querySelector('#composerForm');f.onsubmit=async e=>{e.preventDefault();const c=getClientData(f),btn=document.querySelector('#sendProject'),status=document.querySelector('#formStatus');st.ref=makeRef();st.client=c;btn.disabled=true;btn.textContent='Envoi…';const waText=`Bonjour LOFT DESIGN,\nNouvelle demande ${st.ref}\n${summary(c)}`;const waWin=window.open('about:blank','_blank');try{await emailProject(c);if(waWin)waWin.location=`https://wa.me/213776139475?text=${encodeURIComponent(waText)}`;st.success=true;renderComposer()}catch(_){if(waWin)waWin.location=`https://wa.me/213776139475?text=${encodeURIComponent(waText)}`;status.textContent='Le message WhatsApp est prêt. L’envoi e-mail automatique doit être activé/autorisé pour cette adresse.';btn.disabled=false;btn.textContent='Réessayer'}}}
function renderSuccess(){const b=document.querySelector('#composerBody'),rows=quoteRows(),c=st.client;b.innerHTML=`<div class="success"><div class="successTop"><div class="ok">✓</div><h3>Votre devis est prêt.</h3><p>Référence <b style="color:var(--cyan)">${st.ref}</b> · ${st.clientType==='professional'?'Professionnel - TTC':'Particulier - HT'}</p></div><div class="quotePreview"><div class="qpHeader"><div><strong>${COMPANY.name}</strong><small>R.I.B N°: ${COMPANY.rib}<br>RC N°: ${COMPANY.rc} · NIS: ${COMPANY.nis}<br>NIF: ${COMPANY.nif} · N ART: ${COMPANY.nart}<br>${COMPANY.mail} · ${COMPANY.mobile}<br>${COMPANY.address}</small></div><div class="qpLogo">LOFT<br>DESIGN</div></div><div class="qpMeta"><div><h4>DEVIS ${st.ref}</h4><small>CLIENT : ${clientLabel(c)}<br>ADRESSE : ${c.commune}, ${c.wilayaName}</small></div><strong>${new Date().toLocaleDateString('fr-DZ')}</strong></div><table class="qpTable"><thead><tr><th>DÉSIGNATION</th><th>PRIX UNITAIRE HT</th><th>UNITÉ</th><th>QUANTITÉ</th><th>MONTANT HT</th></tr></thead><tbody>${rows.map(r=>`<tr><td>${r.designation}</td><td>${money(r.pu)}</td><td>${r.unit}</td><td>${r.qty}</td><td>${money(r.total)}</td></tr>`).join('')}</tbody></table><div class="qpTotals"><div><span>TOTAL HT</span><b>${money(totalHT())}</b></div>${st.clientType==='professional'?`<div><span>TVA 19%</span><b>${money(tva())}</b></div><div><span>TOTAL TTC</span><b>${money(totalFinal())}</b></div>`:''}</div></div><div class="downloadRow"><button class="btn neonCyan" id="downloadQuote">Télécharger le devis PDF</button><a class="btn storeTop" href="https://store.bilnov.com" target="_blank" rel="noopener"><span class="storeIcon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M3.5 4h2l2.1 10.1a2 2 0 0 0 2 1.6h7.8a2 2 0 0 0 2-1.5L21 8H7"/><circle cx="10" cy="19" r="1.4"/><circle cx="18" cy="19" r="1.4"/></svg></span>Explorer Store Bilnov</a><button class="btn neonViolet" id="restart">Nouveau projet</button></div></div>`;document.querySelector('#downloadQuote').onclick=downloadQuotePdf;document.querySelector('#restart').onclick=()=>{st.success=false;st.step='project';st.ref='';st.client=null;renderComposer()}}
function downloadQuotePdf(){if(!window.jspdf){alert('Le module PDF se charge. Réessayez dans un instant.');return}const {jsPDF}=window.jspdf,doc=new jsPDF({unit:'mm',format:'a4'}),rows=quoteRows(),c=st.client;const teal=[18,126,143],dark=[9,84,96],light=[231,238,229],cyan=[221,241,244],cyan2=[157,208,218];doc.setFillColor(...light);doc.rect(0,0,150,55,'F');doc.setTextColor(72,77,75);doc.setFont('helvetica','bold');doc.setFontSize(14);doc.text(COMPANY.name,25,15);doc.setFont('helvetica','normal');doc.setFontSize(8.5);doc.text([`R.I.B N°: ${COMPANY.rib}`,`RC N°: ${COMPANY.rc}`,`NIS N°: ${COMPANY.nis}`,`NIF: ${COMPANY.nif}`,`N ART: ${COMPANY.nart}`],25,23,{lineHeightFactor:1.55});doc.setFont('helvetica','bold');doc.text('MAIL:',116,25);doc.setFont('helvetica','normal');doc.text(COMPANY.mail,127,25);doc.setFont('helvetica','bold');doc.text('MOBILE:',116,32);doc.setFont('helvetica','normal');doc.text(COMPANY.mobile,132,32);doc.setFont('helvetica','bold');doc.text('ADRESSE:',92,39);doc.setFont('helvetica','normal');doc.text(COMPANY.address,111,39);doc.setDrawColor(244,184,95);doc.setLineWidth(.8);doc.rect(164,14,32,22);doc.setFont('helvetica','bold');doc.setFontSize(18);doc.text('LOFT',180,24,{align:'center'});doc.setFontSize(9);doc.text('DESIGN',180,30,{align:'center'});doc.setFontSize(17);doc.text(`DEVIS ${st.ref}`,105,77,{align:'center'});doc.setFontSize(11);doc.text('CLIENT :',25,91);doc.setFont('helvetica','normal');doc.text(clientLabel(c),48,91);doc.setFont('helvetica','bold');doc.text('ADRESSE :',25,102);doc.setFont('helvetica','normal');doc.text(`${c.commune}, ${c.wilayaName}`,50,102);doc.setFont('helvetica','bold');doc.text('DATE',153,116);doc.setFont('helvetica','normal');doc.text(new Date().toLocaleDateString('fr-DZ'),164,116);doc.autoTable({startY:127,margin:{left:25,right:25},head:[['DESIGNATION','PRIX UNITAIRE HT','UNITE','QUANTITE','MONTANT HT DA']],body:rows.map(r=>[r.designation,`${new Intl.NumberFormat('fr-DZ').format(r.pu)} DA`,r.unit,String(r.qty),`${new Intl.NumberFormat('fr-DZ').format(r.total)} DA`]),headStyles:{fillColor:teal,textColor:255,fontSize:8,halign:'center'},styles:{fontSize:8,cellPadding:3,textColor:[75,80,78]},alternateRowStyles:{fillColor:[245,245,245]},columnStyles:{0:{cellWidth:47},1:{cellWidth:32},2:{cellWidth:22,halign:'center'},3:{cellWidth:22,halign:'center'},4:{cellWidth:32,halign:'right'}}});let y=doc.lastAutoTable.finalY+2;doc.setFillColor(...cyan);doc.rect(92,y,103,st.clientType==='professional'?27:9,'F');doc.setFont('helvetica','bold');doc.setTextColor(76,81,79);doc.setFontSize(10);doc.text('TOTAL HT',120,y+6);doc.setFillColor(...cyan2);doc.rect(160,y,35,9,'F');doc.text(`${new Intl.NumberFormat('fr-DZ').format(totalHT())} DA`,191,y+6,{align:'right'});if(st.clientType==='professional'){doc.text('TVA 19%',120,y+15);doc.setFillColor(96,180,196);doc.rect(160,y+9,35,9,'F');doc.text(`${new Intl.NumberFormat('fr-DZ').format(tva())} DA`,191,y+15,{align:'right'});doc.text('TOTAL TTC',120,y+24);doc.setFillColor(...cyan2);doc.rect(160,y+18,35,9,'F');doc.text(`${new Intl.NumberFormat('fr-DZ').format(totalFinal())} DA`,191,y+24,{align:'right'})}doc.setFont('helvetica','normal');doc.setFontSize(7);doc.setTextColor(130);doc.text('Document généré depuis le compositeur LOFT DESIGN.',105,287,{align:'center'});doc.save(`DEVIS_LOFT_DESIGN_${st.ref.replaceAll('/','-')}.pdf`)}
function renderComposer(){updateProgress();if(st.step==='project')renderProject();if(st.step==='services')renderServices();if(st.step==='contact')renderContactStep()}renderComposer();
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
