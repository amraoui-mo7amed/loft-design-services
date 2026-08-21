/* =========================================================
   LOFT DESIGN — INSPIRATION GALLERY APP (V23)
   ========================================================= */

/* =========================================================
   V19 — GALERIE INTÉGRÉE
   ========================================================= */
const GALLERY_DATA = (window.GALLERY_DATA && window.GALLERY_DATA.length > 0) ? window.GALLERY_DATA : [{"id": "salon", "name": "Salon", "cover": "https://loftdesign.bilnov.com/media/spaces/gallery/living-room/16757/image_1.jpg", "categories": [{"id": "salon-contemporain", "name": "Salon contemporain", "cover": "https://loftdesign.bilnov.com/media/spaces/gallery/living-room/16757/image_1.jpg", "subs": [{"name": "Vue d’ensemble", "images": ["https://loftdesign.bilnov.com/media/spaces/gallery/living-room/16757/image_1.jpg", "https://loftdesign.bilnov.com/media/portfolio/thumbnails/SEJOUR_4.png", "https://loftdesign.bilnov.com/media/portfolio/thumbnails/Enscape_2025-11-02-20-03-26_Enscape_scene_1.png"]}, {"name": "Matières & détails", "images": ["https://loftdesign.bilnov.com/media/portfolio/thumbnails/Enscape_2024-10-27-23-48-12.png", "https://loftdesign.bilnov.com/media/portfolio/thumbnails/Enscape_2026-07-07-23-27-11.png", "https://loftdesign.bilnov.com/media/spaces/gallery/living-room/16757/image_1.jpg"]}]}, {"id": "salon-elegant", "name": "Salon élégant", "cover": "https://loftdesign.bilnov.com/media/portfolio/thumbnails/SEJOUR_4.png", "subs": [{"name": "Composition", "images": ["https://loftdesign.bilnov.com/media/portfolio/thumbnails/SEJOUR_4.png", "https://loftdesign.bilnov.com/media/spaces/gallery/living-room/16757/image_1.jpg", "https://loftdesign.bilnov.com/media/portfolio/thumbnails/Enscape_2026-01-02-19-38-33_Enscape_scene_14.png"]}, {"name": "Lumière", "images": ["https://loftdesign.bilnov.com/media/portfolio/thumbnails/Enscape_2025-11-02-20-03-26_Enscape_scene_1.png", "https://loftdesign.bilnov.com/media/portfolio/thumbnails/Enscape_2024-10-27-23-48-12.png", "https://loftdesign.bilnov.com/media/portfolio/thumbnails/SEJOUR_4.png"]}]}]}, {"id": "chambre", "name": "Chambre", "cover": "https://loftdesign.bilnov.com/media/portfolio/thumbnails/Enscape_2026-02-05-20-45-23_Enscape_scene_8.jpg", "categories": [{"id": "chambre-master", "name": "Master bedroom", "cover": "https://loftdesign.bilnov.com/media/portfolio/thumbnails/Enscape_2026-02-05-20-45-23_Enscape_scene_8.jpg", "subs": [{"name": "Vue d’ensemble", "images": ["https://loftdesign.bilnov.com/media/portfolio/thumbnails/Enscape_2026-02-05-20-45-23_Enscape_scene_8.jpg", "https://loftdesign.bilnov.com/media/portfolio/thumbnails/Enscape_2024-10-27-23-48-12.png", "https://loftdesign.bilnov.com/media/portfolio/thumbnails/Enscape_2026-01-02-19-38-33_Enscape_scene_14.png"]}, {"name": "Matières", "images": ["https://loftdesign.bilnov.com/media/portfolio/thumbnails/Enscape_2025-11-02-20-03-26_Enscape_scene_1.png", "https://loftdesign.bilnov.com/media/portfolio/thumbnails/Enscape_2026-02-05-20-45-23_Enscape_scene_8.jpg", "https://loftdesign.bilnov.com/media/portfolio/thumbnails/Enscape_2026-07-07-23-27-11.png"]}]}, {"id": "chambre-epuree", "name": "Chambre épurée", "cover": "https://loftdesign.bilnov.com/media/portfolio/thumbnails/Enscape_2024-10-27-23-48-12.png", "subs": [{"name": "Ambiance", "images": ["https://loftdesign.bilnov.com/media/portfolio/thumbnails/Enscape_2024-10-27-23-48-12.png", "https://loftdesign.bilnov.com/media/portfolio/thumbnails/Enscape_2026-02-05-20-45-23_Enscape_scene_8.jpg", "https://loftdesign.bilnov.com/media/portfolio/thumbnails/SEJOUR_4.png"]}]}]}, {"id": "cuisine", "name": "Cuisine", "cover": "https://loftdesign.bilnov.com/media/spaces/gallery/kitchen-interior/11154/image_1.jpg", "categories": [{"id": "cuisine-moderne", "name": "Cuisine moderne", "cover": "https://loftdesign.bilnov.com/media/spaces/gallery/kitchen-interior/11154/image_1.jpg", "subs": [{"name": "Implantation", "images": ["https://loftdesign.bilnov.com/media/spaces/gallery/kitchen-interior/11154/image_1.jpg", "https://loftdesign.bilnov.com/media/portfolio/thumbnails/Enscape_2025-11-02-20-03-26_Enscape_scene_1.png", "https://loftdesign.bilnov.com/media/portfolio/thumbnails/Enscape_2026-07-07-23-27-11.png"]}, {"name": "Détails", "images": ["https://loftdesign.bilnov.com/media/portfolio/thumbnails/Enscape_2026-01-02-19-38-33_Enscape_scene_14.png", "https://loftdesign.bilnov.com/media/spaces/gallery/kitchen-interior/11154/image_1.jpg", "https://loftdesign.bilnov.com/media/portfolio/thumbnails/Enscape_2024-10-27-23-48-12.png"]}]}, {"id": "cuisine-ouverte", "name": "Cuisine ouverte", "cover": "https://loftdesign.bilnov.com/media/portfolio/thumbnails/Enscape_2025-11-02-20-03-26_Enscape_scene_1.png", "subs": [{"name": "Ambiance", "images": ["https://loftdesign.bilnov.com/media/portfolio/thumbnails/Enscape_2025-11-02-20-03-26_Enscape_scene_1.png", "https://loftdesign.bilnov.com/media/spaces/gallery/kitchen-interior/11154/image_1.jpg", "https://loftdesign.bilnov.com/media/portfolio/thumbnails/SEJOUR_4.png"]}]}]}, {"id": "sdb", "name": "Salle de bain", "cover": "https://loftdesign.bilnov.com/media/spaces/gallery/bathroom/15230/image_1_dsgPgFt.jpg", "categories": [{"id": "sdb-minerale", "name": "Salle de bain minérale", "cover": "https://loftdesign.bilnov.com/media/spaces/gallery/bathroom/15230/image_1_dsgPgFt.jpg", "subs": [{"name": "Vue principale", "images": ["https://loftdesign.bilnov.com/media/spaces/gallery/bathroom/15230/image_1_dsgPgFt.jpg", "https://loftdesign.bilnov.com/media/portfolio/thumbnails/Enscape_2026-07-07-23-27-11.png", "https://loftdesign.bilnov.com/media/portfolio/thumbnails/Enscape_2024-10-27-23-48-12.png"]}, {"name": "Revêtements", "images": ["https://loftdesign.bilnov.com/media/portfolio/thumbnails/Enscape_2024-10-27-23-48-12.png", "https://loftdesign.bilnov.com/media/spaces/gallery/bathroom/15230/image_1_dsgPgFt.jpg", "https://loftdesign.bilnov.com/media/portfolio/thumbnails/Enscape_2026-01-02-19-38-33_Enscape_scene_14.png"]}]}, {"id": "sdb-premium", "name": "Salle de bain premium", "cover": "https://loftdesign.bilnov.com/media/portfolio/thumbnails/Enscape_2026-07-07-23-27-11.png", "subs": [{"name": "Détails", "images": ["https://loftdesign.bilnov.com/media/portfolio/thumbnails/Enscape_2026-07-07-23-27-11.png", "https://loftdesign.bilnov.com/media/spaces/gallery/bathroom/15230/image_1_dsgPgFt.jpg", "https://loftdesign.bilnov.com/media/portfolio/thumbnails/Enscape_2025-11-02-20-03-26_Enscape_scene_1.png"]}]}]}, {"id": "enfant", "name": "Chambre enfant", "cover": "https://loftdesign.bilnov.com/media/spaces/gallery/children-room/10567/image_1_qP62mWe.jpg", "categories": [{"id": "enfant-douce", "name": "Chambre enfant douce", "cover": "https://loftdesign.bilnov.com/media/spaces/gallery/children-room/10567/image_1_qP62mWe.jpg", "subs": [{"name": "Vue principale", "images": ["https://loftdesign.bilnov.com/media/spaces/gallery/children-room/10567/image_1_qP62mWe.jpg", "https://loftdesign.bilnov.com/media/portfolio/thumbnails/Enscape_2026-07-07-23-27-11.png", "https://loftdesign.bilnov.com/media/portfolio/thumbnails/SEJOUR_4.png"]}, {"name": "Rangement", "images": ["https://loftdesign.bilnov.com/media/portfolio/thumbnails/Enscape_2025-11-02-20-03-26_Enscape_scene_1.png", "https://loftdesign.bilnov.com/media/spaces/gallery/children-room/10567/image_1_qP62mWe.jpg", "https://loftdesign.bilnov.com/media/portfolio/thumbnails/Enscape_2024-10-27-23-48-12.png"]}]}, {"id": "enfant-creative", "name": "Chambre enfant créative", "cover": "https://loftdesign.bilnov.com/media/portfolio/thumbnails/Enscape_2026-01-02-19-38-33_Enscape_scene_14.png", "subs": [{"name": "Ambiance", "images": ["https://loftdesign.bilnov.com/media/portfolio/thumbnails/Enscape_2026-01-02-19-38-33_Enscape_scene_14.png", "https://loftdesign.bilnov.com/media/spaces/gallery/children-room/10567/image_1_qP62mWe.jpg", "https://loftdesign.bilnov.com/media/portfolio/thumbnails/Enscape_2025-11-02-20-03-26_Enscape_scene_1.png"]}]}]}];

/* V22 — exemples de démonstration pour toujours visualiser la hiérarchie
   Espace > Catégorie > Sous-catégorie > Galerie d'images. */
(function ensureGalleryExamples(){
  const demoNames={
    salon:['Salon contemporain','Salon chaleureux','Salon minimal'],
    chambre:['Master bedroom','Chambre épurée','Suite chaleureuse'],
    cuisine:['Cuisine moderne','Cuisine ouverte','Cuisine minérale'],
    sdb:['Salle de bain minérale','Salle de bain premium','Salle de bain zen'],
    enfant:['Chambre enfant douce','Chambre enfant créative','Chambre évolutive']
  };

  GALLERY_DATA.forEach(space=>{
    if(!Array.isArray(space.categories)) space.categories=[];

    const sourceCats=space.categories.length ? [...space.categories] : [{
      id:`${space.id}-demo-source`,
      name:space.name,
      cover:space.cover,
      subs:[{name:'Vue principale',images:[space.cover]}]
    }];

    while(space.categories.length < 3){
      const source=sourceCats[space.categories.length % sourceCats.length];
      const idx=space.categories.length;
      const baseImages=(source.subs||[]).flatMap(s=>s.images||[]).filter(Boolean);
      const images=[source.cover,space.cover,...baseImages].filter(Boolean);
      const unique=[...new Set(images)];
      while(unique.length<3) unique.push(space.cover);

      space.categories.push({
        id:`${space.id}-demo-${idx+1}`,
        name:(demoNames[space.id]||[])[idx] || `${space.name} inspiration ${idx+1}`,
        cover:source.cover||space.cover,
        subs:[
          {name:'Ambiance',images:unique.slice(0,3)},
          {name:'Détails',images:[unique[1],unique[2],unique[0]]}
        ]
      });
    }

    space.categories.forEach((cat,catIndex)=>{
      if(!cat.cover) cat.cover=space.cover;
      if(!Array.isArray(cat.subs)) cat.subs=[];
      if(cat.subs.length===0){
        cat.subs=[
          {name:'Ambiance',images:[cat.cover,space.cover,cat.cover]},
          {name:'Détails',images:[space.cover,cat.cover,space.cover]}
        ];
      }
      if(cat.subs.length===1){
        const imgs=[...(cat.subs[0].images||[]),cat.cover,space.cover].filter(Boolean);
        const unique=[...new Set(imgs)];
        while(unique.length<3) unique.push(cat.cover);
        cat.subs.push({name:'Détails',images:[unique[1],unique[2],unique[0]]});
      }
      cat.subs.forEach(sub=>{
        if(!Array.isArray(sub.images)) sub.images=[];
        const pool=[...sub.images,cat.cover,space.cover].filter(Boolean);
        const unique=[...new Set(pool)];
        while(unique.length<3) unique.push(cat.cover||space.cover);
        sub.images=unique.slice(0,Math.max(3,unique.length));
      });
    });
  });
})();

const initialSpace = window.INITIAL_SPACE_ID || GALLERY_DATA[0]?.id || '';
const galleryState = { space: initialSpace, cart: new Set(), detail: null, sub: 0, image: 0 };
const galleryApp = document.getElementById('galleryApp');
const galleryDrawer = document.getElementById('galleryCartDrawer');
const galleryDetail = document.getElementById('galleryDetail');

function galleryAllCategories(){
  return GALLERY_DATA.flatMap(s=>s.categories.map(c=>({...c,spaceId:s.id,spaceName:s.name})));
}
function galleryGetSpace(id){return GALLERY_DATA.find(s=>s.id===id)}
function galleryGetCategory(id){return galleryAllCategories().find(c=>c.id===id)}
function gallerySelectionUrl(){
  const u=new URL(location.href);
  u.hash='gallery';
  u.searchParams.set('selection',[...galleryState.cart].join(','));
  return u.toString();
}
function galleryShowToast(msg='Lien copié'){
  const t=document.getElementById('galleryToast');
  if(!t) return;
  t.textContent=msg;t.classList.add('show');
  clearTimeout(galleryShowToast.t);galleryShowToast.t=setTimeout(()=>t.classList.remove('show'),1700);
}
function openGalleryApp(){
  if(!galleryApp) return;
  galleryApp.classList.add('open');galleryApp.setAttribute('aria-hidden','false');document.body.classList.add('galleryOpen');
  if(location.hash!=='#gallery' && !document.querySelector('.gallery-standalone'))history.pushState({gallery:true},'',location.pathname+location.search+'#gallery');
  galleryRenderSpaces();galleryRenderCategories();galleryRenderCart();
}
function closeGalleryApp(fromPop=false){
  if(!galleryApp) return;
  galleryApp.classList.remove('open');galleryApp.setAttribute('aria-hidden','true');document.body.classList.remove('galleryOpen');
  galleryDrawer?.classList.remove('open');galleryDetail?.classList.remove('open');
  if(!fromPop && location.hash==='#gallery'){
    history.replaceState(null, '', location.pathname + location.search);
  }
}
window.openGalleryApp = openGalleryApp;
window.closeGalleryApp = closeGalleryApp;

document.getElementById('desktopGalleryBtn')?.addEventListener('click',openGalleryApp);
document.getElementById('mobileGalleryBtn')?.addEventListener('click',openGalleryApp);
document.getElementById('galleryHeroBtn')?.addEventListener('click',openGalleryApp);
document.getElementById('galleryCloseTop')?.addEventListener('click',()=>closeGalleryApp(false));
document.querySelector('.galleryBrand')?.addEventListener('click',()=>{
  closeGalleryApp(false);
  document.querySelector('#accueil')?.scrollIntoView({behavior:'smooth',block:'start'});
});
window.addEventListener('popstate',()=>{
  if(!galleryApp) return;
  if(location.hash==='#gallery')openGalleryApp();
  else if(galleryApp.classList.contains('open') && !document.querySelector('.gallery-standalone'))closeGalleryApp(true);
});

function galleryRenderSpaces(){
  const host=document.getElementById('gallerySpaces');
  host.innerHTML=GALLERY_DATA.map(s=>`<button type="button" class="gallerySpaceBtn ${s.id===galleryState.space?'active':''}" data-gspace="${s.id}"><img src="${s.cover}" alt="${s.name}"><b>${s.name}</b></button>`).join('');
  host.querySelectorAll('[data-gspace]').forEach(b=>b.addEventListener('click',()=>{
    galleryState.space=b.dataset.gspace;
    galleryRenderSpaces();
    galleryRenderCategories();
    requestAnimationFrame(()=>{
      document.querySelector('.gallerySpaceBtn.active')?.scrollIntoView({behavior:'smooth',block:'nearest',inline:'center'});
      galleryUpdateSpaceArrows();
    });
  }));
  requestAnimationFrame(()=>{
    document.querySelector('.gallerySpaceBtn.active')?.scrollIntoView({behavior:'auto',block:'nearest',inline:'center'});
    galleryUpdateSpaceArrows();
  });
}
function galleryRenderCategories(){
  const s=galleryGetSpace(galleryState.space);
  const host=document.getElementById('galleryCategoryGrid');
  if(!host || !s) return;

  const categories=Array.isArray(s.categories)?s.categories:[];
  host.innerHTML=categories.map(c=>`<article class="galleryCategoryCard ${galleryState.cart.has(c.id)?'selected':''}">
    <img src="${c.cover||s.cover}" alt="${c.name}">
    ${galleryState.cart.has(c.id)?'<span class="gallerySelectedBadge">✓</span>':''}
    <div class="galleryCategoryCopy">
      <h4>${c.name}</h4>
      <div class="galleryCardActions">
        <button type="button" class="galleryMiniBtn" data-gview="${c.id}">Voir</button>
        <button type="button" class="galleryMiniBtn add" data-gadd="${c.id}">
          ${galleryState.cart.has(c.id)?'Retirer':'＋ Ajouter'}
        </button>
      </div>
    </div>
  </article>`).join('');

  host.querySelectorAll('[data-gview]').forEach(b=>
    b.addEventListener('click',()=>galleryOpenDetail(b.dataset.gview))
  );
  host.querySelectorAll('[data-gadd]').forEach(b=>
    b.addEventListener('click',()=>galleryToggleCart(b.dataset.gadd))
  );
}
function galleryToggleCart(id){
  galleryState.cart.has(id)?galleryState.cart.delete(id):galleryState.cart.add(id);
  galleryRenderCategories();galleryRenderCart();
}
function galleryOpenDetail(id){
  galleryState.detail=id;galleryState.sub=0;galleryState.image=0;
  galleryRenderDetail();
  galleryDetail.classList.add('open');
  galleryDetail.setAttribute('aria-hidden','false');
}
function galleryCurrentImages(){
  const c=galleryGetCategory(galleryState.detail);
  const sub=c?.subs?.[galleryState.sub];
  return sub?.images||[];
}
function gallerySetImage(index){
  const images=galleryCurrentImages();
  if(!images.length)return;
  galleryState.image=(index+images.length)%images.length;
  const main=document.getElementById('galleryViewerMain');
  const caption=document.getElementById('galleryViewerCaption');
  if(main)main.src=images[galleryState.image];
  if(caption)caption.textContent=`${galleryState.image+1} / ${images.length}`;
  document.querySelectorAll('[data-gthumb]').forEach((b,i)=>b.classList.toggle('active',i===galleryState.image));
}
function galleryRenderDetail(){
  const c=galleryGetCategory(galleryState.detail);if(!c)return;
  const sub=c.subs[galleryState.sub]||c.subs[0];
  const images=sub?.images||[];
  if(galleryState.image>=images.length)galleryState.image=0;
  const panel=document.getElementById('galleryDetailPanel');

  panel.innerHTML=`<div class="galleryDetailTop">
    <div class="galleryDetailHero"><img src="${c.cover}" alt="${c.name}"></div>
    <div class="galleryDetailInfo">
      <h3>${c.name}</h3>
      <button type="button" class="galleryDetailAdd" id="galleryDetailAdd">${galleryState.cart.has(c.id)?'✓ Retirer':'＋ Ajouter'}</button>
    </div>
  </div>
  <div class="galleryDetailBody">
    <div class="gallerySubGallery">
      ${c.subs.map((s,i)=>`<button type="button" class="gallerySubCard ${i===galleryState.sub?'active':''}" data-gsub="${i}">
        <img src="${s.images?.[0]||c.cover}" alt="${s.name}">
        <b>${s.name}</b>
      </button>`).join('')}
    </div>

    <div class="galleryImageViewer" id="galleryImageViewer">
      <img id="galleryViewerMain" src="${images[galleryState.image]||c.cover}" alt="${sub?.name||c.name}">
      <button type="button" class="galleryViewerFull" id="galleryViewerFull">⛶ Plein écran</button>
      <span class="galleryViewerCaption" id="galleryViewerCaption">${images.length?`${galleryState.image+1} / ${images.length}`:''}</span>
    </div>

    <div class="galleryViewerThumbs">
      ${images.map((x,i)=>`<button type="button" class="galleryViewerThumb ${i===galleryState.image?'active':''}" data-gthumb="${i}">
        <img src="${x}" alt="">
      </button>`).join('')}
    </div>
  </div>`;

  panel.querySelectorAll('[data-gsub]').forEach(b=>b.addEventListener('click',()=>{
    galleryState.sub=+b.dataset.gsub;
    galleryState.image=0;
    galleryRenderDetail();
  }));
  panel.querySelectorAll('[data-gthumb]').forEach(b=>b.addEventListener('click',()=>gallerySetImage(+b.dataset.gthumb)));
  document.getElementById('galleryDetailAdd')?.addEventListener('click',()=>{galleryToggleCart(c.id);galleryRenderDetail()});
  document.getElementById('galleryViewerMain')?.addEventListener('click',galleryOpenLightbox);
  document.getElementById('galleryViewerFull')?.addEventListener('click',galleryOpenLightbox);
}

document.getElementById('galleryDetailClose')?.addEventListener('click',()=>{galleryCloseLightbox();galleryDetail.classList.remove('open');galleryDetail.setAttribute('aria-hidden','true')});


const galleryLightbox=document.getElementById('galleryLightbox');
let galleryLightboxTouchX=null;

function galleryOpenLightbox(){
  const images=galleryCurrentImages();
  if(!images.length)return;
  galleryRenderLightbox();
  galleryLightbox.classList.add('open');
  galleryLightbox.setAttribute('aria-hidden','false');
}
function galleryCloseLightbox(){
  galleryLightbox.classList.remove('open');
  galleryLightbox.setAttribute('aria-hidden','true');
}
function galleryRenderLightbox(){
  const images=galleryCurrentImages();
  if(!images.length)return;
  const img=document.getElementById('galleryLightboxImg');
  img.src=images[galleryState.image];
  document.getElementById('galleryLightboxThumbs').innerHTML=images.map((x,i)=>`
    <button type="button" class="galleryLightboxThumb ${i===galleryState.image?'active':''}" data-glbthumb="${i}">
      <img src="${x}" alt="">
    </button>`).join('');
  document.querySelectorAll('[data-glbthumb]').forEach(b=>b.addEventListener('click',()=>{
    galleryState.image=+b.dataset.glbthumb;
    galleryRenderLightbox();
    gallerySetImage(galleryState.image);
  }));
  requestAnimationFrame(()=>{
    document.querySelector('.galleryLightboxThumb.active')?.scrollIntoView({behavior:'smooth',block:'nearest',inline:'center'});
  });
}
function galleryLightboxMove(delta){
  const images=galleryCurrentImages();
  if(!images.length)return;
  galleryState.image=(galleryState.image+delta+images.length)%images.length;
  galleryRenderLightbox();
  gallerySetImage(galleryState.image);
}
document.getElementById('galleryLightboxClose')?.addEventListener('click',galleryCloseLightbox);
document.getElementById('galleryLightboxPrev')?.addEventListener('click',()=>galleryLightboxMove(-1));
document.getElementById('galleryLightboxNext')?.addEventListener('click',()=>galleryLightboxMove(1));

galleryLightbox?.addEventListener('pointerdown',e=>{
  if(e.pointerType==='touch'||e.pointerType==='pen')galleryLightboxTouchX=e.clientX;
});
galleryLightbox?.addEventListener('pointerup',e=>{
  if(galleryLightboxTouchX==null)return;
  const dx=e.clientX-galleryLightboxTouchX;
  galleryLightboxTouchX=null;
  if(Math.abs(dx)>45)galleryLightboxMove(dx<0?1:-1);
});
document.addEventListener('keydown',e=>{
  if(!galleryLightbox?.classList.contains('open'))return;
  if(e.key==='Escape')galleryCloseLightbox();
  if(e.key==='ArrowRight')galleryLightboxMove(1);
  if(e.key==='ArrowLeft')galleryLightboxMove(-1);
});

function galleryRenderCart(){
  const items=[...galleryState.cart].map(galleryGetCategory).filter(Boolean);
  document.getElementById('galleryCartCount').textContent=items.length;
  document.getElementById('galleryMobileCount').textContent=items.length;
  const host=document.getElementById('galleryCartItems');
  host.innerHTML=items.length?items.map(c=>`<div class="galleryCartItem"><img src="${c.cover}" alt=""><div><b>${c.name}</b><small>${c.spaceName}</small></div><button type="button" class="galleryRemove" data-gremove="${c.id}">×</button></div>`).join(''):'<div class="galleryCartEmpty">Votre panier est vide.<br>Ajoutez une ou plusieurs inspirations.</div>';
  host.querySelectorAll('[data-gremove]').forEach(b=>b.addEventListener('click',()=>galleryToggleCart(b.dataset.gremove)));
}
function galleryOpenCart(){galleryDrawer.classList.add('open');galleryDrawer.setAttribute('aria-hidden','false')}
function galleryCloseCart(){galleryDrawer.classList.remove('open');galleryDrawer.setAttribute('aria-hidden','true')}
document.getElementById('galleryCartTop')?.addEventListener('click',galleryOpenCart);
document.getElementById('galleryMobileCart')?.addEventListener('click',galleryOpenCart);
document.getElementById('galleryCartClose')?.addEventListener('click',galleryCloseCart);

function gallerySummary(){
  const items=[...galleryState.cart].map(galleryGetCategory).filter(Boolean);
  return items.map((c,i)=>`${i+1}. ${c.spaceName} — ${c.name}`).join('\n');
}
document.getElementById('galleryShareWa')?.addEventListener('click',()=>{
  const msg=`Bonjour LOFT DESIGN,\nVoici ma sélection d'inspirations :\n\n${gallerySummary()}\n\nLien : ${gallerySelectionUrl()}`;
  window.open(`https://wa.me/213776139475?text=${encodeURIComponent(msg)}`,'_blank');
});
document.getElementById('galleryShareMail')?.addEventListener('click',()=>{
  const body=`Bonjour,\n\nVoici ma sélection Galerie LOFT DESIGN :\n\n${gallerySummary()}\n\nLien : ${gallerySelectionUrl()}`;
  location.href=`mailto:loftdesign@live.fr?subject=${encodeURIComponent('Sélection Galerie LOFT DESIGN')}&body=${encodeURIComponent(body)}`;
});
document.getElementById('galleryCopyLink')?.addEventListener('click',async()=>{
  try{await navigator.clipboard.writeText(gallerySelectionUrl());galleryShowToast('Lien de sélection copié')}catch(e){prompt('Copiez ce lien',gallerySelectionUrl())}
});

// Restore a shared selection
const galleryParams=new URLSearchParams(location.search);
const sharedSelection=(galleryParams.get('selection')||'').split(',').filter(Boolean);
sharedSelection.forEach(id=>galleryState.cart.add(id));
galleryRenderCart();
if(location.hash==='#gallery' || document.querySelector('.gallery-standalone'))setTimeout(openGalleryApp,50);


/* V23 — controls for horizontal space selector */
const gallerySpacesRail=document.getElementById('gallerySpaces');
const gallerySpacePrev=document.getElementById('gallerySpacePrev');
const gallerySpaceNext=document.getElementById('gallerySpaceNext');

function gallerySpaceStep(){
  const first=gallerySpacesRail?.querySelector('.gallerySpaceBtn');
  if(!first)return 140;
  const gap=parseFloat(getComputedStyle(gallerySpacesRail).gap||8);
  return first.getBoundingClientRect().width+gap;
}
function galleryUpdateSpaceArrows(){
  if(!gallerySpacesRail)return;
  const max=Math.max(0,gallerySpacesRail.scrollWidth-gallerySpacesRail.clientWidth);
  const x=gallerySpacesRail.scrollLeft;
  if(gallerySpacePrev)gallerySpacePrev.disabled=x<=2;
  if(gallerySpaceNext)gallerySpaceNext.disabled=x>=max-2;
}
gallerySpacePrev?.addEventListener('click',()=>{
  gallerySpacesRail?.scrollBy({left:-gallerySpaceStep(),behavior:'smooth'});
});
gallerySpaceNext?.addEventListener('click',()=>{
  gallerySpacesRail?.scrollBy({left:gallerySpaceStep(),behavior:'smooth'});
});
gallerySpacesRail?.addEventListener('scroll',galleryUpdateSpaceArrows,{passive:true});
window.addEventListener('resize',galleryUpdateSpaceArrows);

/* Drag with mouse/pen; native swipe remains active on touch */
if(gallerySpacesRail){
  let dragging=false,startX=0,startScroll=0,moved=false;
  gallerySpacesRail.addEventListener('pointerdown',e=>{
    if(e.pointerType==='touch')return;
    if(e.button!==0)return;
    dragging=true;moved=false;startX=e.clientX;startScroll=gallerySpacesRail.scrollLeft;
    gallerySpacesRail.classList.add('dragging');
    try{gallerySpacesRail.setPointerCapture(e.pointerId)}catch(_){}
  });
  gallerySpacesRail.addEventListener('pointermove',e=>{
    if(!dragging)return;
    const dx=e.clientX-startX;
    if(Math.abs(dx)>4)moved=true;
    gallerySpacesRail.scrollLeft=startScroll-dx;
    if(moved)e.preventDefault();
  });
  const stopDrag=e=>{
    if(!dragging)return;
    dragging=false;
    gallerySpacesRail.classList.remove('dragging');
    setTimeout(()=>galleryUpdateSpaceArrows(),30);
  };
  gallerySpacesRail.addEventListener('pointerup',stopDrag);
  gallerySpacesRail.addEventListener('pointercancel',stopDrag);

  /* Mouse wheel over the rail scrolls horizontally */
  gallerySpacesRail.addEventListener('wheel',e=>{
    const delta=Math.abs(e.deltaX)>Math.abs(e.deltaY)?e.deltaX:e.deltaY;
    if(Math.abs(delta)<2)return;
    if(gallerySpacesRail.scrollWidth<=gallerySpacesRail.clientWidth)return;
    e.preventDefault();
    gallerySpacesRail.scrollBy({left:delta*1.25,behavior:'auto'});
  },{passive:false});
}
