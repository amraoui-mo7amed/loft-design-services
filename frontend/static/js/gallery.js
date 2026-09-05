/* =========================================================
   LOFT DESIGN — INSPIRATION GALLERY APP (V23)
   ========================================================= */

/* =========================================================
   V19 — GALERIE INTÉGRÉE
   ========================================================= */
const GALLERY_DATA = Array.isArray(window.GALLERY_DATA) ? window.GALLERY_DATA : [{"id": "salon", "name": "Salon", "cover": "https://loftdesign.bilnov.com/media/spaces/gallery/living-room/16757/image_1.jpg", "categories": [{"id": "salon-contemporain", "name": "Salon contemporain", "cover": "https://loftdesign.bilnov.com/media/spaces/gallery/living-room/16757/image_1.jpg", "subs": [{"name": "Vue d’ensemble", "images": ["https://loftdesign.bilnov.com/media/spaces/gallery/living-room/16757/image_1.jpg", "https://loftdesign.bilnov.com/media/portfolio/thumbnails/SEJOUR_4.png", "https://loftdesign.bilnov.com/media/portfolio/thumbnails/Enscape_2025-11-02-20-03-26_Enscape_scene_1.png"]}, {"name": "Matières & détails", "images": ["https://loftdesign.bilnov.com/media/portfolio/thumbnails/Enscape_2024-10-27-23-48-12.png", "https://loftdesign.bilnov.com/media/portfolio/thumbnails/Enscape_2026-07-07-23-27-11.png", "https://loftdesign.bilnov.com/media/spaces/gallery/living-room/16757/image_1.jpg"]}]}, {"id": "salon-elegant", "name": "Salon élégant", "cover": "https://loftdesign.bilnov.com/media/portfolio/thumbnails/SEJOUR_4.png", "subs": [{"name": "Composition", "images": ["https://loftdesign.bilnov.com/media/portfolio/thumbnails/SEJOUR_4.png", "https://loftdesign.bilnov.com/media/spaces/gallery/living-room/16757/image_1.jpg", "https://loftdesign.bilnov.com/media/portfolio/thumbnails/Enscape_2026-01-02-19-38-33_Enscape_scene_14.png"]}, {"name": "Lumière", "images": ["https://loftdesign.bilnov.com/media/portfolio/thumbnails/Enscape_2025-11-02-20-03-26_Enscape_scene_1.png", "https://loftdesign.bilnov.com/media/portfolio/thumbnails/Enscape_2024-10-27-23-48-12.png", "https://loftdesign.bilnov.com/media/portfolio/thumbnails/SEJOUR_4.png"]}]}]}, {"id": "chambre", "name": "Chambre", "cover": "https://loftdesign.bilnov.com/media/portfolio/thumbnails/Enscape_2026-02-05-20-45-23_Enscape_scene_8.jpg", "categories": [{"id": "chambre-master", "name": "Master bedroom", "cover": "https://loftdesign.bilnov.com/media/portfolio/thumbnails/Enscape_2026-02-05-20-45-23_Enscape_scene_8.jpg", "subs": [{"name": "Vue d’ensemble", "images": ["https://loftdesign.bilnov.com/media/portfolio/thumbnails/Enscape_2026-02-05-20-45-23_Enscape_scene_8.jpg", "https://loftdesign.bilnov.com/media/portfolio/thumbnails/Enscape_2024-10-27-23-48-12.png", "https://loftdesign.bilnov.com/media/portfolio/thumbnails/Enscape_2026-01-02-19-38-33_Enscape_scene_14.png"]}, {"name": "Matières", "images": ["https://loftdesign.bilnov.com/media/portfolio/thumbnails/Enscape_2025-11-02-20-03-26_Enscape_scene_1.png", "https://loftdesign.bilnov.com/media/portfolio/thumbnails/Enscape_2026-02-05-20-45-23_Enscape_scene_8.jpg", "https://loftdesign.bilnov.com/media/portfolio/thumbnails/Enscape_2026-07-07-23-27-11.png"]}]}, {"id": "chambre-epuree", "name": "Chambre épurée", "cover": "https://loftdesign.bilnov.com/media/portfolio/thumbnails/Enscape_2024-10-27-23-48-12.png", "subs": [{"name": "Ambiance", "images": ["https://loftdesign.bilnov.com/media/portfolio/thumbnails/Enscape_2024-10-27-23-48-12.png", "https://loftdesign.bilnov.com/media/portfolio/thumbnails/Enscape_2026-02-05-20-45-23_Enscape_scene_8.jpg", "https://loftdesign.bilnov.com/media/portfolio/thumbnails/SEJOUR_4.png"]}]}]}, {"id": "cuisine", "name": "Cuisine", "cover": "https://loftdesign.bilnov.com/media/spaces/gallery/kitchen-interior/11154/image_1.jpg", "categories": [{"id": "cuisine-moderne", "name": "Cuisine moderne", "cover": "https://loftdesign.bilnov.com/media/spaces/gallery/kitchen-interior/11154/image_1.jpg", "subs": [{"name": "Implantation", "images": ["https://loftdesign.bilnov.com/media/spaces/gallery/kitchen-interior/11154/image_1.jpg", "https://loftdesign.bilnov.com/media/portfolio/thumbnails/Enscape_2025-11-02-20-03-26_Enscape_scene_1.png", "https://loftdesign.bilnov.com/media/portfolio/thumbnails/Enscape_2026-07-07-23-27-11.png"]}, {"name": "Détails", "images": ["https://loftdesign.bilnov.com/media/portfolio/thumbnails/Enscape_2026-01-02-19-38-33_Enscape_scene_14.png", "https://loftdesign.bilnov.com/media/spaces/gallery/kitchen-interior/11154/image_1.jpg", "https://loftdesign.bilnov.com/media/portfolio/thumbnails/Enscape_2024-10-27-23-48-12.png"]}]}, {"id": "cuisine-ouverte", "name": "Cuisine ouverte", "cover": "https://loftdesign.bilnov.com/media/portfolio/thumbnails/Enscape_2025-11-02-20-03-26_Enscape_scene_1.png", "subs": [{"name": "Ambiance", "images": ["https://loftdesign.bilnov.com/media/portfolio/thumbnails/Enscape_2025-11-02-20-03-26_Enscape_scene_1.png", "https://loftdesign.bilnov.com/media/spaces/gallery/kitchen-interior/11154/image_1.jpg", "https://loftdesign.bilnov.com/media/portfolio/thumbnails/SEJOUR_4.png"]}]}]}, {"id": "sdb", "name": "Salle de bain", "cover": "https://loftdesign.bilnov.com/media/spaces/gallery/bathroom/15230/image_1_dsgPgFt.jpg", "categories": [{"id": "sdb-minerale", "name": "Salle de bain minérale", "cover": "https://loftdesign.bilnov.com/media/spaces/gallery/bathroom/15230/image_1_dsgPgFt.jpg", "subs": [{"name": "Vue principale", "images": ["https://loftdesign.bilnov.com/media/spaces/gallery/bathroom/15230/image_1_dsgPgFt.jpg", "https://loftdesign.bilnov.com/media/portfolio/thumbnails/Enscape_2026-07-07-23-27-11.png", "https://loftdesign.bilnov.com/media/portfolio/thumbnails/Enscape_2024-10-27-23-48-12.png"]}, {"name": "Revêtements", "images": ["https://loftdesign.bilnov.com/media/portfolio/thumbnails/Enscape_2024-10-27-23-48-12.png", "https://loftdesign.bilnov.com/media/spaces/gallery/bathroom/15230/image_1_dsgPgFt.jpg", "https://loftdesign.bilnov.com/media/portfolio/thumbnails/Enscape_2026-01-02-19-38-33_Enscape_scene_14.png"]}]}, {"id": "sdb-premium", "name": "Salle de bain premium", "cover": "https://loftdesign.bilnov.com/media/portfolio/thumbnails/Enscape_2026-07-07-23-27-11.png", "subs": [{"name": "Détails", "images": ["https://loftdesign.bilnov.com/media/portfolio/thumbnails/Enscape_2026-07-07-23-27-11.png", "https://loftdesign.bilnov.com/media/spaces/gallery/bathroom/15230/image_1_dsgPgFt.jpg", "https://loftdesign.bilnov.com/media/portfolio/thumbnails/Enscape_2025-11-02-20-03-26_Enscape_scene_1.png"]}]}]}, {"id": "enfant", "name": "Chambre enfant", "cover": "https://loftdesign.bilnov.com/media/spaces/gallery/children-room/10567/image_1_qP62mWe.jpg", "categories": [{"id": "enfant-douce", "name": "Chambre enfant douce", "cover": "https://loftdesign.bilnov.com/media/spaces/gallery/children-room/10567/image_1_qP62mWe.jpg", "subs": [{"name": "Vue principale", "images": ["https://loftdesign.bilnov.com/media/spaces/gallery/children-room/10567/image_1_qP62mWe.jpg", "https://loftdesign.bilnov.com/media/portfolio/thumbnails/Enscape_2026-07-07-23-27-11.png", "https://loftdesign.bilnov.com/media/portfolio/thumbnails/SEJOUR_4.png"]}, {"name": "Rangement", "images": ["https://loftdesign.bilnov.com/media/portfolio/thumbnails/Enscape_2025-11-02-20-03-26_Enscape_scene_1.png", "https://loftdesign.bilnov.com/media/spaces/gallery/children-room/10567/image_1_qP62mWe.jpg", "https://loftdesign.bilnov.com/media/portfolio/thumbnails/Enscape_2024-10-27-23-48-12.png"]}]}, {"id": "enfant-creative", "name": "Chambre enfant créative", "cover": "https://loftdesign.bilnov.com/media/portfolio/thumbnails/Enscape_2026-01-02-19-38-33_Enscape_scene_14.png", "subs": [{"name": "Ambiance", "images": ["https://loftdesign.bilnov.com/media/portfolio/thumbnails/Enscape_2026-01-02-19-38-33_Enscape_scene_14.png", "https://loftdesign.bilnov.com/media/spaces/gallery/children-room/10567/image_1_qP62mWe.jpg", "https://loftdesign.bilnov.com/media/portfolio/thumbnails/Enscape_2025-11-02-20-03-26_Enscape_scene_1.png"]}]}]}];

/* V22 — exemples de démonstration pour toujours visualiser la hiérarchie
   Espace > Catégorie > Sous-catégorie > Galerie d'images. */
(function ensureGalleryExamples(){
  if (Array.isArray(window.GALLERY_DATA)) return;
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
/* =========================================================
   V75 — PINTREST MASONRY EXPLORATION + CLIENT BOARDS
   (ported from LOFT_DESIGN_V75_PORTFOLIO_9_CARD_EDGE_TO_EDGE.html;
    multi-select space chips + search + masonry pins + saved
    boards + fullscreen viewer + share/selection)
   ========================================================= */

const galleryApp = document.getElementById('galleryApp');
const galleryDrawer = document.getElementById('galleryCartDrawer');
const galleryDetail = document.getElementById('galleryDetail');
const galleryDetailPanel = document.getElementById('galleryDetailPanel');
const galleryLightbox = document.getElementById('galleryLightbox');
const galleryFilterPanel = document.getElementById('galleryFilterPanel');
const galleryFilterTopBtn = document.getElementById('galleryFilterTop');
const gallerySearchShell = document.querySelector('.gallerySearchShell');

const initialSpace = window.INITIAL_SPACE_ID || GALLERY_DATA[0]?.id || '';
const galleryState = {
  space: initialSpace,
  cart: new Set(),
  detail: null,
  detailPin: null,
  sub: 0,
  image: 0,
  search: '',
  filters: new Set(GALLERY_DATA.map(s => s.id))
};

function galleryAllCategories() {
  return GALLERY_DATA.flatMap(s => s.categories.map(c => ({ ...c, spaceId: s.id, spaceName: s.name })));
}
function galleryGetSpace(id) {
  if (id == null) return null;
  const target = String(id).trim().toLowerCase();
  return GALLERY_DATA.find(s =>
    String(s.id).trim().toLowerCase() === target ||
    (s.slug && String(s.slug).trim().toLowerCase() === target) ||
    (s.name && String(s.name).trim().toLowerCase() === target)
  ) || GALLERY_DATA[0];
}
function galleryGetCategory(id) {
  if (id == null) return null;
  const target = String(id).trim().toLowerCase();
  return galleryAllCategories().find(c =>
    String(c.id).trim().toLowerCase() === target ||
    (c.name && String(c.name).trim().toLowerCase() === target)
  ) || null;
}
function galleryEscape(v) {
  return String(v ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
function galleryShowToast(msg) {
  const t = document.getElementById('galleryToast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(window.__galleryToastTimer);
  window.__galleryToastTimer = setTimeout(() => t.classList.remove('show'), 2400);
}

/* ---------- Pinterest pins (V29) ---------- */
const ratioCycle = ['4/5', '1/1', '3/4', '5/7', '16/11', '2/3', '6/7', '4/3'];
function galleryCategoryImages(c) {
  if (!c) return [];
  const list = [c.cover];
  (c.subs || []).forEach(s => (s.images || []).forEach(x => list.push(x)));
  return [...new Set(list.filter(Boolean))];
}
function galleryPins() {
  const out = [];
  GALLERY_DATA.forEach(space => {
    (space.categories || []).forEach(cat => {
      const pinImages = (Array.isArray(cat.featured_images) && cat.featured_images.length > 0)
        ? cat.featured_images
        : (cat.cover ? [cat.cover] : []);
      pinImages.forEach((url, index) => {
        if (!url) return;
        const sub = (cat.subs || []).find(s => (s.images || []).includes(url));
        out.push({
          id: `${cat.id}--${index}`,
          categoryId: cat.id,
          categoryName: cat.name,
          spaceId: space.id,
          spaceName: space.name,
          title: index === 0 ? cat.name : (sub?.name || cat.name),
          image: url,
          imageIndex: index,
          ratio: ratioCycle[(out.length + index) % ratioCycle.length]
        });
      });
    });
  });
  return out;
}
function galleryGetPin(id) {
  if (id == null) return null;
  const s = String(id).trim().toLowerCase();
  const direct = galleryPins().find(p => String(p.id).trim().toLowerCase() === s);
  if (direct) return direct;
  if (s.includes('--')) {
    const [catId, idxStr] = s.split('--');
    const c = galleryGetCategory(catId);
    if (c) {
      const images = galleryCategoryImages(c);
      const idx = parseInt(idxStr, 10);
      if (!isNaN(idx) && images[idx]) {
        return galleryPinFromCategoryImage(c.id, images[idx]);
      }
    }
  }
  const c = galleryGetCategory(s);
  if (c) return galleryPins().find(p => p.categoryId === c.id) || null;
  return null;
}
function galleryPinFromCategoryImage(categoryId, url) {
  const pin = galleryPins().find(p => p.categoryId === categoryId && p.image === url);
  if (pin) return pin;
  const c = galleryGetCategory(categoryId);
  if (!c) return null;
  const sp = GALLERY_DATA.find(s => (s.categories || []).some(cat => cat.id === categoryId));
  const images = galleryCategoryImages(c);
  const index = images.indexOf(url);
  const sub = (c.subs || []).find(s => (s.images || []).includes(url));
  return {
    id: `${categoryId}--${index >= 0 ? index : 0}`,
    categoryId: c.id,
    categoryName: c.name,
    spaceId: sp?.id || '',
    spaceName: sp?.name || '',
    title: index === 0 ? c.name : (sub?.name || c.name),
    image: url,
    imageIndex: index >= 0 ? index : 0,
    ratio: ratioCycle[Math.max(0, index) % ratioCycle.length]
  };
}
function galleryCurrentImages() {
  return galleryCategoryImages(galleryGetCategory(galleryState.detail));
}

/* ---------- Boards (V29 persistence) ---------- */
const BOARD_KEY = 'loftDesignGalleryBoardsV29';
let boardStore = null;
function galleryActiveBoard() {
  if (!boardStore) boardStore = galleryLoadBoards();
  return boardStore.sort((a, b) => (a.boardSort ?? 0) - (b.boardSort ?? 0))[0] || null;
}
function galleryLoadBoards() {
  try {
    const raw = JSON.parse(localStorage.getItem(BOARD_KEY) || '[]');
    return Array.isArray(raw) && raw.length ? raw : galleryDefaultStore();
  } catch (err) {
    return galleryDefaultStore();
  }
}
function galleryDefaultStore() {
  return [{
    name: 'Mes inspirations',
    boardSort: 1,
    pins: [],
    uploads: []
  }];
}
function galleryPersistBoards() {
  try { localStorage.setItem(BOARD_KEY, JSON.stringify(boardStore || [])); } catch (err) {}
}
function gallerySyncCartFromBoard() {
  const b = galleryActiveBoard();
  galleryState.cart = new Set(b?.pins || []);
  document.querySelectorAll('[data-pin-card]').forEach(card => {
    card.classList.toggle('saved', galleryState.cart.has(card.dataset.pinCard));
  });
}

/* ---------- URL shares (V29) ---------- */
function gallerySelectionUrl() {
  const u = new URL(location.href);
  u.hash = 'gallery';
  u.searchParams.set('selection', [...galleryState.cart].join(','));
  u.searchParams.delete('pin');
  const b = galleryActiveBoard();
  if (b?.name) u.searchParams.set('board', b.name);
  return u.toString();
}
function galleryPinUrl(id) {
  const u = new URL(location.href);
  u.hash = 'gallery';
  u.searchParams.set('pin', id);
  return u.toString();
}
function gallerySummary() {
  const b = galleryActiveBoard();
  const pins = [...galleryState.cart].map(galleryGetPin).filter(Boolean);
  const lines = pins.map((p, i) => `${i + 1}. ${p.spaceName} — ${p.categoryName} — ${p.title}`);
  if (b?.uploads?.length) lines.push(`${b.uploads.length} image(s) personnelle(s) ajoutée(s) au tableau.`);
  return lines.join('\n');
}

/* ---------- App open / close ---------- */
function openGalleryApp() {
  if (!galleryApp) return;
  galleryApp.classList.add('open');
  galleryApp.setAttribute('aria-hidden', 'false');
  document.body.classList.add('galleryOpen');
  if (location.hash !== '#gallery' && !document.querySelector('.gallery-standalone')) {
    window.history?.pushState({ gallery: true }, '', location.pathname + location.search + '#gallery');
  }
  galleryRenderFilters();
  galleryRenderCategories();
  galleryRenderCart();
  const search = document.getElementById('gallerySearch');
  if (search) search.value = galleryState.search || '';
}
function closeGalleryApp(fromPop) {
  if (!galleryApp) return;
  galleryApp.classList.remove('open');
  galleryApp.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('galleryOpen');
  galleryFilterPanel?.classList.remove('open');
  syncFilterButton();
  if (!fromPop && !document.querySelector('.gallery-standalone')) {
    try { window.history?.replaceState(null, '', location.pathname + location.search); } catch (err) {}
  }
}
window.openGalleryApp = openGalleryApp;
window.closeGalleryApp = closeGalleryApp;

function galleryGoHome() {
  galleryCloseLightbox();
  galleryDetail?.classList.remove('open');
  galleryDetail?.setAttribute('aria-hidden', 'true');
  galleryDrawer?.classList.remove('open');
  galleryDrawer?.setAttribute('aria-hidden', 'true');
  closeGalleryApp(false);
  setTimeout(() => document.getElementById('accueil')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60);
}

/* ---------- Filters (V34 on-demand chips) ---------- */
function galleryRenderFilters() {
  const host = document.getElementById('galleryFilterChips');
  if (!host) return;
  const allActive = galleryState.filters.size >= GALLERY_DATA.length;
  host.innerHTML = [
    `<button type="button" class="galleryFilterChip all ${allActive ? 'active' : ''}" data-gfilter="all">Tous les espaces</button>`,
    ...GALLERY_DATA.map(s =>
      `<button type="button" class="galleryFilterChip ${galleryState.filters.has(s.id) ? 'active' : ''}" data-gfilter="${galleryEscape(s.id)}">${galleryEscape(s.name)}</button>`
    )
  ].join('');
  host.querySelectorAll('[data-gfilter]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.gfilter;
      if (id === 'all') {
        galleryState.filters = new Set(GALLERY_DATA.map(s => s.id));
      } else {
        const allWasSelected = galleryState.filters.size >= GALLERY_DATA.length;
        if (allWasSelected) {
          galleryState.filters = new Set([id]);
        } else if (galleryState.filters.has(id)) {
          galleryState.filters.delete(id);
          if (galleryState.filters.size === 0) galleryState.filters = new Set(GALLERY_DATA.map(s => s.id));
        } else {
          galleryState.filters.add(id);
        }
      }
      galleryRenderFilters();
      galleryRenderCategories();
    });
  });
}
function syncFilterButton() {
  const open = galleryFilterPanel?.classList.contains('open');
  galleryFilterTopBtn?.classList.toggle('active', !!open);
  if (galleryFilterTopBtn) {
    const badge = GALLERY_DATA.length - galleryState.filters.size;
    galleryFilterTopBtn.textContent = open ? 'Fermer filtres' : (badge > 0 ? `Filtres (${badge})` : 'Filtres');
  }
}
function closeFilterPanel() {
  galleryFilterPanel?.classList.remove('open');
  syncFilterButton();
}
galleryFilterTopBtn?.addEventListener('click', (e) => {
  e.preventDefault();
  galleryFilterPanel?.classList.toggle('open');
  syncFilterButton();
});
document.addEventListener('pointerdown', (e) => {
  if (!galleryFilterPanel?.classList.contains('open')) return;
  if (galleryFilterPanel.contains(e.target) || galleryFilterTopBtn?.contains(e.target)) return;
  closeFilterPanel();
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && galleryFilterPanel?.classList.contains('open')) closeFilterPanel();
});

/* ---------- Masonry pins (V29 + V35 selection visibility) ---------- */
function galleryRenderCategories() {
  const host = document.getElementById('galleryCategoryGrid');
  if (!host) return;
  const q = (galleryState.search || '').trim().toLowerCase();
  let pins = galleryPins().filter(p => galleryState.filters.has(p.spaceId));
  if (q) {
    pins = pins.filter(p => {
      const c = galleryGetCategory(p.categoryId);
      const keywords = [p.title, p.categoryName, p.spaceName, ...((c?.subs || []).map(s => s.name))].join(' ').toLowerCase();
      return keywords.includes(q);
    });
  }
  const meta = document.getElementById('galleryResultsMeta');
  if (meta) meta.textContent = `${pins.length} inspiration${pins.length > 1 ? 's' : ''}`;
  if (!pins.length) {
    host.innerHTML = `<div class="galleryNoResults"><div><strong>Aucune inspiration trouvée</strong><span>Essayez un autre mot-clé ou élargissez vos filtres.</span></div></div>`;
    return;
  }
  host.innerHTML = pins.map(p => {
    const saved = galleryState.cart.has(p.id);
    return `<article class="galleryPin ${saved ? 'saved v75Saved' : ''}" data-pin-card="${galleryEscape(p.id)}">
      <div class="galleryPinMedia" data-gview="${galleryEscape(p.id)}" style="--pin-ratio:${p.ratio}">
        <img src="${p.image}" alt="${galleryEscape(p.title)}" loading="lazy" referrerpolicy="no-referrer">
        <span class="galleryPinOverlay"></span>
        <button type="button" class="galleryPinSave ${saved ? 'saved' : ''}" data-psave="${galleryEscape(p.id)}">${saved ? 'Enregistré' : 'Enregistrer'}</button>
        <button type="button" class="galleryPinShare" data-pshare="${galleryEscape(p.id)}" aria-label="Envoyer">
          <svg viewBox="0 0 24 24"><path d="M12 16V4"></path><path d="m7 9 5-5 5 5"></path><path d="M5 14v5h14v-5"></path></svg>
        </button>
        <span class="galleryPinOpenLabel">Ouvrir la galerie</span>
      </div>
      <div class="galleryPinMeta">
        <b>${galleryEscape(p.title)}</b>
        <small>${galleryEscape(p.spaceName)} · ${galleryEscape(p.categoryName)}</small>
      </div>
    </article>`;
  }).join('');
  host.querySelectorAll('[data-gview]').forEach(el => el.addEventListener('click', (e) => {
    if (e.target.closest('[data-psave],[data-pshare]')) return;
    v75OpenPinFullscreen(el.dataset.gview);
  }));
  host.querySelectorAll('[data-psave]').forEach(b => b.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    galleryToggleCart(b.dataset.psave);
    return false;
  }));
  host.querySelectorAll('[data-pshare]').forEach(b => b.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    gallerySharePin(b.dataset.pshare);
    return false;
  }));
}
const galleryRenderSpaces = galleryRenderFilters;

/* ---------- Save / selection (V32 + V35) ---------- */
function galleryToggleCart(id) {
  const pin = galleryGetPin(id);
  if (!pin) {
    galleryShowToast('Inspiration introuvable');
    return;
  }
  const wasAdded = !galleryState.cart.has(pin.id);
  if (wasAdded) galleryState.cart.add(pin.id);
  else galleryState.cart.delete(pin.id);
  const board = galleryActiveBoard();
  if (board) {
    if (wasAdded) {
      if (!board.pins.includes(pin.id)) board.pins.push(pin.id);
    } else {
      board.pins = (board.pins || []).filter(x => x !== pin.id);
    }
    galleryPersistBoards();
  }
  galleryRenderCategories();
  galleryRenderCart();
  galleryPulseSelection(pin.id, wasAdded);
  galleryShowToast(wasAdded ? 'Ajouté à votre tableau' : 'Retiré de votre tableau');
}
window.galleryToggleCart = galleryToggleCart;

function galleryPulseSelection(id, wasAdded) {
  if (!wasAdded || !window.matchMedia('(max-width:840px)').matches) return;
  const mobileCart = document.getElementById('galleryMobileCart');
  const topCart = document.getElementById('galleryCartTop');
  const card = document.querySelector(`[data-pin-card="${CSS.escape(id)}"]`);
  [mobileCart, topCart].forEach(el => {
    if (!el) return;
    el.classList.remove('v32CartPulse', 'selectionPulse');
    void el.offsetWidth;
    el.classList.add('v32CartPulse');
    if (el === mobileCart) el.classList.add('selectionPulse');
    setTimeout(() => el.classList.remove('v32CartPulse', 'selectionPulse'), 760);
  });
  if (card) {
    card.classList.remove('v32Added');
    void card.offsetWidth;
    card.classList.add('v32Added');
    setTimeout(() => card.classList.remove('v32Added'), 700);
  }
}
function galleryApplySelectionState(animate = false) {
  const topCart = document.getElementById('galleryCartTop');
  const mobileCart = document.getElementById('galleryMobileCart');
  const v55Dock = document.getElementById('v55GallerySelectionDock');
  const topCount = document.getElementById('galleryCartCount');
  const mobileCount = document.getElementById('galleryMobileCount');
  const v55Count = document.getElementById('v55GallerySelectionCount');
  const a = parseInt(topCount?.textContent || '0', 10);
  const b = parseInt(mobileCount?.textContent || '0', 10);
  const total = Number.isFinite(a) ? a : (Number.isFinite(b) ? b : 0);
  const has = total > 0;

  if (v55Count) v55Count.textContent = String(total);
  if (v55Dock) {
    v55Dock.classList.toggle('hasSelection', has);
    v55Dock.setAttribute('aria-label', has ? `Ma sélection — ${total} élément${total > 1 ? 's' : ''}` : 'Ma sélection — vide');
    if (animate) {
      v55Dock.classList.remove('selectionPulse');
      void v55Dock.offsetWidth;
      v55Dock.classList.add('selectionPulse');
      setTimeout(() => v55Dock.classList.remove('selectionPulse'), 760);
    }
  }

  [topCart, mobileCart].forEach(el => {
    if (!el) return;
    el.classList.toggle('hasSelection', has);
    el.setAttribute('aria-label', has ? `Ma sélection — ${total} élément${total > 1 ? 's' : ''}` : 'Ma sélection — vide');
    if (animate) {
      el.classList.remove('selectionFlash');
      void el.offsetWidth;
      el.classList.add('selectionFlash');
      setTimeout(() => el.classList.remove('selectionFlash'), 760);
    }
  });
}

/* V35 — observe rendered counters → keep the selection beacon coherent */
(function () {
  const topCount = document.getElementById('galleryCartCount');
  const mobileCount = document.getElementById('galleryMobileCount');
  const v55Count = document.getElementById('v55GallerySelectionCount');
  let previousTotal = null;
  function getTotal() {
    const a = parseInt(topCount?.textContent || '0', 10);
    const b = parseInt(mobileCount?.textContent || '0', 10);
    return Number.isFinite(a) ? a : (Number.isFinite(b) ? b : 0);
  }
  const observer = new MutationObserver(() => {
    const total = getTotal();
    const changed = previousTotal !== null && total !== previousTotal;
    galleryApplySelectionState(changed);
    previousTotal = total;
  });
  if (topCount) observer.observe(topCount, { childList: true, characterData: true, subtree: true });
  if (mobileCount) observer.observe(mobileCount, { childList: true, characterData: true, subtree: true });
  galleryApplySelectionState(false);
  let resizeTimer = 0;
  addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      document.documentElement.style.setProperty('--gallery-vw', `${innerWidth}px`);
      galleryApplySelectionState(false);
    }, 90);
  }, { passive: true });
  addEventListener('orientationchange', () => setTimeout(() => galleryApplySelectionState(false), 180));
})();

/* ---------- Share (WA / mail / copy) ---------- */
function gallerySharePin(id) {
  const p = galleryGetPin(id);
  if (!p) return;
  const msg = `Bonjour LOFT DESIGN,\nJe partage cette inspiration : ${p.title} — ${p.spaceName} (${p.categoryName})\n\nLien : ${galleryPinUrl(p.id)}`;
  window.open(`https://wa.me/213776139475?text=${encodeURIComponent(msg)}`, '_blank');
}
document.getElementById('galleryShareWa')?.addEventListener('click', () => {
  const msg = `Bonjour LOFT DESIGN,\nVoici ma sélection d'inspirations :\n\n${gallerySummary()}\n\nLien : ${gallerySelectionUrl()}`;
  window.open(`https://wa.me/213776139475?text=${encodeURIComponent(msg)}`, '_blank');
});
document.getElementById('galleryShareMail')?.addEventListener('click', () => {
  const body = `Bonjour,\n\nVoici ma sélection Galerie LOFT DESIGN :\n\n${gallerySummary()}\n\nLien : ${gallerySelectionUrl()}`;
  location.href = `mailto:loftdesign@live.fr?subject=${encodeURIComponent('Sélection Galerie LOFT DESIGN')}&body=${encodeURIComponent(body)}`;
});
document.getElementById('galleryCopyLink')?.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(gallerySelectionUrl());
    galleryShowToast('Lien de sélection copié');
  } catch (err) {
    window.prompt('Copiez ce lien :', gallerySelectionUrl());
  }
});

/* ---------- Cart drawer + boards manager ---------- */
function galleryRenderBoardSelect() {
  const sel = document.getElementById('galleryBoardSelect');
  if (!sel) return;
  const boards = (boardStore || []).sort((a, b) => (a.boardSort ?? 0) - (b.boardSort ?? 0));
  sel.innerHTML = boards.map(b => {
    const n = (b.pins || []).length + (b.uploads || []).length;
    return `<option value="${galleryEscape(b.name)}">${galleryEscape(b.name)} (${n})</option>`;
  }).join('');
  const active = galleryActiveBoard();
  if (active) sel.value = active.name;
  document.querySelectorAll('.galleryBoardMeta .galleryBoardCount').forEach(el => {
    el.textContent = active ? ((active.pins || []).length + (active.uploads || []).length) : 0;
  });
  const btn = document.getElementById('galleryBoardDelete');
  if (btn) btn.classList.toggle('disabled', !active);
}
function galleryRefreshBoardMeta() {
  document.querySelectorAll('.galleryBoardMeta .galleryBoardCount').forEach(el => {
    const b = galleryActiveBoard();
    el.textContent = b ? ((b.pins || []).length + (b.uploads || []).length) : 0;
  });
}
function galleryRenderCart() {
  const b = galleryActiveBoard();
  const pins = [...galleryState.cart].map(galleryGetPin).filter(Boolean);
  const uploads = b?.uploads || [];
  const total = pins.length + uploads.length;
  const countTop = document.getElementById('galleryCartCount');
  if (countTop) countTop.textContent = total;
  const mobileTop = document.getElementById('galleryMobileCount');
  if (mobileTop) mobileTop.textContent = total;
  document.querySelectorAll('.cartBadge').forEach(el => { el.textContent = total; });
  galleryRenderBoardSelect();
  const host = document.getElementById('galleryCartItems');
  if (!host) return;
  const pinRows = pins.map(p => `<div class="galleryCartItem">
    <button type="button" class="preview" data-cartview="${galleryEscape(p.id)}" aria-label="Voir"><img src="${p.image}" alt="" referrerpolicy="no-referrer"></button>
    <div><b>${galleryEscape(p.title)}</b><small>${galleryEscape(p.spaceName)} · ${galleryEscape(p.categoryName)}</small></div>
    <button type="button" class="galleryRemove" data-gremove="${galleryEscape(p.id)}" aria-label="Retirer">×</button>
  </div>`);
  const uploadRows = uploads.map(u => `<div class="galleryCartItem galleryUploadRow">
    <button type="button" class="preview" data-upview="${galleryEscape(u.id)}" aria-label="Voir"><img src="${u.data}" alt="" referrerpolicy="no-referrer"></button>
    <div><b>${galleryEscape(u.name || 'Image personnelle')}</b><small>Ajoutée par vous · <span class="galleryUploadTag">IMAGE</span></small></div>
    <button type="button" class="galleryRemove" data-upremove="${galleryEscape(u.id)}" aria-label="Retirer">×</button>
  </div>`);
  host.innerHTML = (pinRows.length || uploadRows.length)
    ? [...pinRows, ...uploadRows].join('')
    : '<div class="galleryCartEmpty">Votre tableau est vide.<br>Enregistrez des inspirations ou ajoutez vos propres images.</div>';
  host.querySelectorAll('[data-gremove]').forEach(btn => btn.addEventListener('click', () => {
    galleryToggleCart(btn.dataset.gremove);
  }));
  host.querySelectorAll('[data-cartview]').forEach(btn => btn.addEventListener('click', () => {
    galleryCloseCart();
    v75OpenPinFullscreen(btn.dataset.cartview);
  }));
  host.querySelectorAll('[data-upremove]').forEach(btn => btn.addEventListener('click', () => {
    const board = galleryActiveBoard();
    if (!board) return;
    board.uploads = (board.uploads || []).filter(x => x.id !== btn.dataset.upremove);
    galleryPersistBoards();
    galleryRenderCart();
    galleryShowToast('Image retirée');
  }));
  host.querySelectorAll('[data-upview]').forEach(btn => {
    const u = (galleryActiveBoard()?.uploads || []).find(x => x.id === btn.dataset.upview);
    if (u) window.open(u.data, '_blank');
  });
}
function galleryOpenCart() {
  if (!galleryDrawer) return;
  galleryDrawer.classList.add('open');
  galleryDrawer.setAttribute('aria-hidden', 'false');
}
function galleryCloseCart() {
  if (!galleryDrawer) return;
  if (document.activeElement && typeof document.activeElement.blur === 'function') {
    document.activeElement.blur();
  }
  galleryDrawer.classList.remove('open');
  galleryDrawer.setAttribute('aria-hidden', 'true');
}
document.getElementById('galleryCartTop')?.addEventListener('click', galleryOpenCart);
document.getElementById('galleryMobileCart')?.addEventListener('click', galleryOpenCart);
document.getElementById('v55GallerySelectionDock')?.addEventListener('click', galleryOpenCart);
document.getElementById('galleryCartClose')?.addEventListener('click', galleryCloseCart);

function galleryNewBoard() {
  const boards = boardStore || galleryDefaultStore();
  boardStore = boards;
  const name = (window.prompt('Nom du nouveau tableau :', '') || '').trim();
  if (!name) return;
  if (boards.some(b => b.name.toLowerCase() === name.toLowerCase())) {
    galleryShowToast('Ce tableau existe déjà');
    return;
  }
  boards.push({ name, boardSort: boards.length + 1, pins: [], uploads: [] });
  galleryPersistBoards();
  galleryRenderCart();
  galleryShowToast(`Tableau « ${name} » créé`);
}
function galleryRenameBoard() {
  const b = galleryActiveBoard();
  if (!b) return;
  const name = (window.prompt('Renommer le tableau :', b.name) || '').trim();
  if (!name || name.toLowerCase() === b.name.toLowerCase()) return;
  boardStore.forEach(x => { if (x === b) x.name = name; });
  galleryPersistBoards();
  galleryRenderCart();
  galleryShowToast('Tableau renommé');
}
function galleryDeleteBoard() {
  const b = galleryActiveBoard();
  if (!b) return;
  if (!window.confirm(`Supprimer le tableau « ${b.name} » ?`)) return;
  boardStore = boardStore.filter(x => x !== b);
  if (!boardStore.length) boardStore = galleryDefaultStore();
  galleryPersistBoards();
  gallerySyncCartFromBoard();
  galleryRenderCategories();
  galleryRenderCart();
  galleryShowToast('Tableau supprimé');
}
function galleryResizeImage(file, max = 1280, quality = 0.78) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error);
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('image'));
      img.onload = () => {
        const scale = Math.min(1, max / Math.max(img.width, img.height));
        const w = Math.round(img.width * scale);
        const h = Math.round(img.height * scale);
        const canvas = document.createElement('canvas');
        canvas.width = w; canvas.height = h;
        canvas.getContext('2d').drawImage(img, 0, 0, w, h);
        resolve({ image: canvas.toDataURL('image/jpeg', quality), width: w, height: h });
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}
async function galleryUploadFiles(files) {
  const b = galleryActiveBoard();
  if (!b || !files?.length) return;
  const ok = [...files].filter(f => f.type?.startsWith('image/'));
  if (!ok.length) {
    galleryShowToast('Seules les images sont acceptées');
    return;
  }
  for (const f of ok) {
    try {
      const { image, width } = await galleryResizeImage(f, 1280, 0.78);
      b.uploads = b.uploads || [];
      b.uploads.push({ id: `up-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, data: image, name: f.name, width });
      galleryShowToast('Image ajoutée au tableau');
    } catch (err) {
      galleryShowToast('Image illisible, ignorée');
    }
  }
  galleryPersistBoards();
  galleryRenderCart();
}
document.getElementById('galleryBoardSelect')?.addEventListener('change', (e) => {
  const boards = (boardStore || []).sort((a, b) => (a.boardSort ?? 0) - (b.boardSort ?? 0));
  const next = boards.find(b => b.name === e.target.value) || boards[0];
  if (!next) return;
  boards.forEach((b, i) => { b.boardSort = i + 1; });
  next.boardSort = 0;
  galleryPersistBoards();
  gallerySyncCartFromBoard();
  galleryRenderCategories();
  galleryRenderCart();
});
document.getElementById('galleryBoardNew')?.addEventListener('click', galleryNewBoard);
document.getElementById('galleryBoardRename')?.addEventListener('click', galleryRenameBoard);
document.getElementById('galleryBoardDelete')?.addEventListener('click', galleryDeleteBoard);
document.getElementById('galleryBoardUpload')?.addEventListener('click', () => document.getElementById('galleryBoardFile')?.click());
document.getElementById('galleryBoardUploadText')?.addEventListener('click', () => document.getElementById('galleryBoardFile')?.click());
document.getElementById('galleryBoardFile')?.addEventListener('change', (e) => {
  galleryUploadFiles(e.target.files);
  e.target.value = '';
});

/* ---------- Detail (V29; V30 promotes clicks to full-screen viewer) ---------- */
function galleryRenderDetail() {
  const c = galleryGetCategory(galleryState.detail);
  if (!c) return;
  const images = galleryCategoryImages(c);
  if (!images.length) return;
  if (galleryState.image >= images.length) galleryState.image = 0;
  const current = images[galleryState.image] || images[0];
  const currentPin = galleryPinFromCategoryImage(c.id, current) || galleryGetPin(galleryState.detailPin);
  if (currentPin) galleryState.detailPin = currentPin.id;
  if (!galleryDetailPanel) return;
  const saved = currentPin && galleryState.cart.has(currentPin.id);
  galleryDetailPanel.innerHTML = `<div class="galleryDetailPinterest">
    <div class="galleryDetailVisual">
      <img id="galleryViewerMain" src="${current}" alt="${galleryEscape(c.name)}" referrerpolicy="no-referrer">
      <button type="button" class="galleryDetailFullscreen" id="galleryViewerFull">Plein écran</button>
    </div>
    <aside class="galleryDetailSide">
      <div class="galleryDetailTopActions">
        <button type="button" class="galleryDetailSend" id="galleryDetailSend">Envoyer</button>
        <button type="button" class="galleryDetailSave ${saved ? 'saved' : ''}" id="galleryDetailSave" data-pin="${currentPin ? galleryEscape(currentPin.id) : ''}">${saved ? 'Enregistré' : 'Enregistrer'}</button>
      </div>
      <div class="galleryDetailBreadcrumb">${galleryEscape(galleryGetSpace(currentPin?.spaceId)?.name || c.spaceName || 'LOFT DESIGN')}</div>
      <h3>${galleryEscape(c.name)}</h3>
      <p>Explorez les autres vues de cette inspiration, enregistrez celles qui vous plaisent et composez votre tableau.</p>
      <div class="galleryRelatedTitle"><strong>Images de cette galerie</strong><small>${images.length} image${images.length > 1 ? 's' : ''}</small></div>
      <div class="galleryRelatedStrip">
        ${images.map((url, i) => `<button type="button" class="galleryRelatedPin ${i === galleryState.image ? 'active' : ''}" data-v75related="${i}"><img src="${url}" alt="" referrerpolicy="no-referrer"><span>${i + 1}</span></button>`).join('')}
      </div>
    </aside>
  </div>`;
  galleryDetailPanel.querySelectorAll('[data-v75related]').forEach(b => b.addEventListener('click', () => gallerySetImage(+b.dataset.v75related)));
  document.getElementById('galleryDetailSave')?.addEventListener('click', (e) => {
    const id = e.currentTarget.dataset.pin;
    if (id) galleryToggleCart(id);
  });
  document.getElementById('galleryDetailSend')?.addEventListener('click', () => {
    const p = galleryCurrentPin();
    if (p) gallerySharePin(p.id);
  });
  document.getElementById('galleryViewerMain')?.addEventListener('click', galleryOpenLightbox);
  document.getElementById('galleryViewerFull')?.addEventListener('click', galleryOpenLightbox);
}
function gallerySetImage(index) {
  const c = galleryGetCategory(galleryState.detail);
  const images = galleryCategoryImages(c);
  if (!images.length) return;
  galleryState.image = (index + images.length) % images.length;
  const url = images[galleryState.image];
  const p = galleryPinFromCategoryImage(c.id, url);
  if (p) galleryState.detailPin = p.id;
  if (galleryDetailPanel) {
    const main = document.getElementById('galleryViewerMain');
    if (main) main.src = url;
    galleryDetailPanel.querySelectorAll('[data-v75related]').forEach((b, i) => b.classList.toggle('active', i === galleryState.image));
    const save = document.getElementById('galleryDetailSave');
    if (save && p) {
      const saved = galleryState.cart.has(p.id);
      save.classList.toggle('saved', saved);
      save.textContent = saved ? 'Enregistré' : 'Enregistrer';
      save.dataset.pin = p.id;
    }
  }
}
function galleryOpenDetail(id) {
  const p = galleryGetPin(id);
  if (!p) return;
  v75OpenPinFullscreen(p.id);
}
document.getElementById('galleryDetailClose')?.addEventListener('click', () => {
  galleryDetail?.classList.remove('open');
  galleryDetail?.setAttribute('aria-hidden', 'true');
});

/* ---------- Fullscreen viewer (V30) ---------- */
function galleryCurrentPin() {
  const c = galleryGetCategory(galleryState.detail);
  if (!c) return null;
  const images = galleryCategoryImages(c);
  const url = images[galleryState.image] || images[0];
  return galleryPinFromCategoryImage(c.id, url) || galleryGetPin(galleryState.detailPin);
}
function galleryRenderLightbox() {
  const images = galleryCurrentImages();
  if (!images.length) return;
  const img = document.getElementById('galleryLightboxImg');
  if (img) img.src = images[galleryState.image] || images[0];
  const thumbs = document.getElementById('galleryLightboxThumbs');
  if (thumbs) {
    thumbs.innerHTML = images.map((x, i) => `
      <button type="button" class="galleryLightboxThumb ${i === galleryState.image ? 'active' : ''}" data-glbthumb="${i}">
        <img src="${x}" alt="" referrerpolicy="no-referrer">
      </button>`).join('');
    thumbs.querySelectorAll('[data-glbthumb]').forEach(b => b.addEventListener('click', () => {
      galleryState.image = +b.dataset.glbthumb;
      galleryRenderLightbox();
    }));
  }
  galleryRefreshLightboxActions();
  requestAnimationFrame(() => {
    document.querySelector('.galleryLightboxThumb.active')?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  });
}
function galleryRefreshLightboxActions() {
  const send = document.getElementById('galleryLightboxSend');
  const save = document.getElementById('galleryLightboxSave');
  if (!save && !send) return;
  const p = galleryCurrentPin();
  const saved = !!(p && galleryState.cart.has(p.id));
  if (save) {
    save.classList.toggle('saved', saved);
    save.textContent = saved ? 'Enregistré' : 'Enregistrer';
    save.dataset.pin = p?.id || '';
  }
  if (send) send.dataset.pin = p?.id || '';
}
function galleryLightboxMove(delta) {
  const images = galleryCurrentImages();
  if (!images.length) return;
  galleryState.image = (galleryState.image + delta + images.length) % images.length;
  galleryRenderLightbox();
}
function v75OpenPinFullscreen(id) {
  const p = galleryGetPin(id);
  if (!p) {
    console.warn('[LOFT] gallery pin not found:', id);
    return;
  }
  galleryState.detail = p.categoryId;
  galleryState.detailPin = p.id;
  const c = galleryGetCategory(p.categoryId);
  const images = galleryCategoryImages(c);
  galleryState.image = Math.max(0, images.indexOf(p.image));
  galleryDetail?.classList.remove('open');
  galleryDrawer?.classList.remove('open');
  galleryOpenLightbox();
}
function galleryOpenLightbox() {
  if (!galleryLightbox) return;
  if (!galleryCurrentImages().length) return;
  galleryRenderLightbox();
  galleryLightbox.classList.add('open');
  galleryLightbox.setAttribute('aria-hidden', 'false');
}
function galleryCloseLightbox() {
  if (!galleryLightbox) return;
  galleryLightbox.classList.remove('open');
  galleryLightbox.setAttribute('aria-hidden', 'true');
}
window.galleryOpenDetail = galleryOpenDetail;

document.getElementById('galleryLightboxSave')?.addEventListener('click', (e) => {
  const id = e.currentTarget.dataset.pin;
  if (id) {
    galleryToggleCart(id);
    galleryRefreshLightboxActions();
  }
});
document.getElementById('galleryLightboxSend')?.addEventListener('click', (e) => {
  const id = e.currentTarget.dataset.pin;
  const p = id ? galleryGetPin(id) : galleryCurrentPin();
  if (p) gallerySharePin(p.id);
});
document.getElementById('galleryLightboxClose')?.addEventListener('click', galleryCloseLightbox);
document.getElementById('galleryLightboxPrev')?.addEventListener('click', () => galleryLightboxMove(-1));
document.getElementById('galleryLightboxNext')?.addEventListener('click', () => galleryLightboxMove(1));
let galleryLightboxTouchX = null;
galleryLightbox?.addEventListener('pointerdown', e => {
  if (e.pointerType === 'touch' || e.pointerType === 'pen') galleryLightboxTouchX = e.clientX;
});
galleryLightbox?.addEventListener('pointerup', e => {
  if (galleryLightboxTouchX == null) return;
  const dx = e.clientX - galleryLightboxTouchX;
  galleryLightboxTouchX = null;
  if (Math.abs(dx) > 45) galleryLightboxMove(dx < 0 ? 1 : -1);
});
document.addEventListener('keydown', e => {
  if (!galleryLightbox?.classList.contains('open')) return;
  if (e.key === 'Escape') galleryCloseLightbox();
  if (e.key === 'ArrowRight' && !e.metaKey && !e.ctrlKey) galleryLightboxMove(1);
  if (e.key === 'ArrowLeft' && !e.metaKey && !e.ctrlKey) galleryLightboxMove(-1);
});
if (galleryLightbox) {
  galleryLightbox.addEventListener('dblclick', (e) => {
    if (e.target.closest('button')) return;
    const img = document.getElementById('galleryLightboxImg');
    if (!img) return;
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    else img.requestFullscreen?.().catch(() => {});
  });
}

/* ---------- Search (V32 mobile shell is handled in CSS) ---------- */
const gallerySearchInput = document.getElementById('gallerySearch');
gallerySearchInput?.addEventListener('input', () => {
  galleryState.search = gallerySearchInput.value;
  galleryRenderCategories();
});
gallerySearchShell?.addEventListener('click', (e) => {
  if (!window.matchMedia('(max-width:840px)').matches) return;
  if (!gallerySearchShell.classList.contains('mobileOpen')) {
    e.preventDefault();
    gallerySearchShell.classList.add('mobileOpen');
    setTimeout(() => gallerySearchInput?.focus(), 60);
  }
});
gallerySearchInput?.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    gallerySearchShell?.classList.remove('mobileOpen');
    gallerySearchInput.blur();
  }
});
document.addEventListener('pointerdown', (e) => {
  if (!window.matchMedia('(max-width:840px)').matches) return;
  if (gallerySearchShell?.classList.contains('mobileOpen') && !gallerySearchShell.contains(e.target)) {
    gallerySearchShell.classList.remove('mobileOpen');
  }
});

/* ---------- Open triggers (home buttons) ---------- */
document.getElementById('desktopGalleryBtn')?.addEventListener('click', openGalleryApp);
document.getElementById('mobileGalleryBtn')?.addEventListener('click', openGalleryApp);
document.getElementById('galleryHeroBtn')?.addEventListener('click', openGalleryApp);
document.getElementById('galleryCloseTop')?.addEventListener('click', () => closeGalleryApp(false));
document.getElementById('galleryBrandHome')?.addEventListener('click', galleryGoHome);
document.getElementById('galleryHomeTop')?.addEventListener('click', galleryGoHome);
window.addEventListener('popstate', () => {
  if (location.hash === '#gallery') openGalleryApp();
  else closeGalleryApp(true);
});

/* ---------- Submit selection (AJAX to /gallery/submit-selection/) ---------- */
document.getElementById('gallerySubmitSelection')?.addEventListener('click', async () => {
  const items = [...galleryState.cart].map(galleryGetPin).filter(Boolean).map(p => ({
    id: p.categoryId,
    name: p.categoryName,
    spaceId: p.spaceId,
    spaceName: p.spaceName,
    cover: p.image
  }));
  if (!items.length) {
    if (window.Swal) {
      Swal.fire({
        icon: 'info',
        title: 'Panier vide',
        text: 'Veuillez sélectionner au moins une inspiration avant d’envoyer.',
        confirmButtonText: 'OK',
        customClass: { popup: 'swal2-popup', confirmButton: 'btn neonCyan' },
        buttonsStyling: false
      });
    } else {
      galleryShowToast('Panier vide');
    }
    return;
  }

  if (window.Swal) {
    const { value: formValues } = await Swal.fire({
      title: 'Transmettre ma sélection',
      html: `
        <div style="display:flex;flex-direction:column;gap:10px;text-align:left;margin-top:14px;">
          <label style="font-size:12px;color:#c0c7c4;">Nom complet
            <input id="swal_name" class="swal2-input" placeholder="Votre nom" style="width:100%;margin:4px 0 0;box-sizing:border-box;background:rgba(4,9,12,.85);border:1px solid rgba(255,255,255,.15);color:#fff;border-radius:10px;padding:10px 14px;font-size:13px;">
          </label>
          <label style="font-size:12px;color:#c0c7c4;">E-mail <span style="color:#55dcff;">*</span>
            <input id="swal_email" type="email" class="swal2-input" placeholder="vous@exemple.com" required style="width:100%;margin:4px 0 0;box-sizing:border-box;background:rgba(4,9,12,.85);border:1px solid rgba(255,255,255,.15);color:#fff;border-radius:10px;padding:10px 14px;font-size:13px;">
          </label>
          <label style="font-size:12px;color:#c0c7c4;">Téléphone
            <input id="swal_phone" class="swal2-input" placeholder="+213 ..." style="width:100%;margin:4px 0 0;box-sizing:border-box;background:rgba(4,9,12,.85);border:1px solid rgba(255,255,255,.15);color:#fff;border-radius:10px;padding:10px 14px;font-size:13px;">
          </label>
          <label style="font-size:12px;color:#c0c7c4;">Message / Remarques
            <textarea id="swal_notes" class="swal2-textarea" placeholder="Vos souhaits particuliers…" style="width:100%;margin:4px 0 0;box-sizing:border-box;background:rgba(4,9,12,.85);border:1px solid rgba(255,255,255,.15);color:#fff;border-radius:10px;padding:10px 14px;font-size:13px;min-height:60px;resize:vertical;"></textarea>
          </label>
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Envoyer ma sélection',
      cancelButtonText: 'Annuler',
      customClass: {
        popup: 'swal2-popup',
        confirmButton: 'btn neonCyan',
        cancelButton: 'btn btn-outline-light'
      },
      buttonsStyling: false,
      preConfirm: () => {
        const email = document.getElementById('swal_email')?.value?.trim();
        if (!email) {
          Swal.showValidationMessage('Veuillez renseigner votre adresse e-mail.');
          return false;
        }
        return {
          name: document.getElementById('swal_name')?.value?.trim() || '',
          email: email,
          phone: document.getElementById('swal_phone')?.value?.trim() || '',
          notes: document.getElementById('swal_notes')?.value?.trim() || '',
          items: items.map(c => ({
            id: c.id,
            name: c.name,
            spaceId: c.spaceId,
            spaceName: c.spaceName,
            cover: c.cover
          }))
        };
      }
    });

    if (formValues) {
      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content ||
        document.querySelector('[name=csrfmiddlewaretoken]')?.value ||
        (document.cookie.match(/(?:^|;\s*)csrftoken=([^;]+)/) || [])[1] || '';

      try {
        const res = await fetch('/gallery/submit-selection/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrfToken,
            'X-Requested-With': 'XMLHttpRequest'
          },
          body: JSON.stringify(formValues)
        });
        const data = await res.json();
        if (data.success) {
          const board = galleryActiveBoard();
          if (board) { board.pins = []; galleryPersistBoards(); }
          galleryState.cart.clear();
          galleryRenderCategories();
          galleryRenderCart();
          galleryCloseCart();
          Swal.fire({
            icon: 'success',
            title: 'Sélection envoyée !',
            text: data.message || 'Votre sélection d’inspirations a bien été reçue par nos architectes.',
            confirmButtonText: 'OK',
            customClass: { popup: 'swal2-popup', confirmButton: 'btn neonCyan' },
            buttonsStyling: false
          });
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Erreur',
            text: (Array.isArray(data.errors) ? data.errors.join(', ') : data.errors) || 'Impossible d’enregistrer votre sélection.',
            confirmButtonText: 'OK',
            customClass: { popup: 'swal2-popup', confirmButton: 'btn neonCyan' },
            buttonsStyling: false
          });
        }
      } catch (err) {
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: 'Une erreur réseau est survenue. Veuillez réessayer.',
          confirmButtonText: 'OK',
          customClass: { popup: 'swal2-popup', confirmButton: 'btn neonCyan' },
          buttonsStyling: false
        });
      }
    }
  }
});

/* ---------- Restore shared selection + deep links ---------- */
const galleryParams = new URLSearchParams(location.search);
const sharedSelection = (galleryParams.get('selection') || '').split(',').filter(Boolean);
if (window.INITIAL_SPACE_ID && galleryGetSpace(window.INITIAL_SPACE_ID)) {
  galleryState.filters = new Set([window.INITIAL_SPACE_ID]);
}
boardStore = galleryLoadBoards();
if (sharedSelection.length) {
  const board = galleryActiveBoard();
  if (board) {
    sharedSelection.forEach(id => {
      const pin = galleryGetPin(id);
      const realId = pin?.id || id;
      if (!board.pins.includes(realId)) board.pins.push(realId);
    });
    galleryPersistBoards();
  }
}
gallerySyncCartFromBoard();

function galleryInit() {
  galleryRenderFilters();
  galleryRenderCategories();
  galleryRenderCart();
  syncFilterButton();
  const pinParam = galleryParams.get('pin');
  if (pinParam && galleryGetPin(pinParam)) {
    requestAnimationFrame(() => {
      openGalleryApp();
      v75OpenPinFullscreen(pinParam);
    });
    return;
  }
  if (location.hash === '#gallery' || document.querySelector('.gallery-standalone')) {
    setTimeout(openGalleryApp, 60);
  }
}
galleryInit();