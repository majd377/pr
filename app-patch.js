/* ═══════════════════════════════════════════════════════════════
   APP.JS — PATCH NOTES
   
   هاد الملف يوضح التغييرات اللي لازم تطبقها على app.js الأصلي.
   لأن app.js مشفر/مضمن بالـ base64، راجع التعليمات أدناه.
═══════════════════════════════════════════════════════════════

   ✅ التغييرات المطلوبة في app.js:

   1. شيل كل كود CV (storageUpload للـ CV، cvDownloadBtn، cvFileName)
   
   2. في دالة addProject: بدل imgUpload (file input) استخدم:
      const imageUrl = document.getElementById('newImageUrl').value.trim();
      // احفظ imageUrl مباشرة بدل رفع ملف للـ Storage

   3. في renderProject: استخدم project.imageUrl مباشرة كـ src للصورة
   
   4. الـ horizontal scroll drag — أضف هاد الكود بعد ما تجهز الـ projectsGrid:

═══════════════════════════════════════════════════════════════ */

// ── Horizontal Scroll: Drag to scroll + arrow buttons ─────────
export function initProjectsScroll() {
  const track = document.getElementById('projectsGrid');
  const btnL  = document.getElementById('scrollLeft');
  const btnR  = document.getElementById('scrollRight');

  if (!track) return;

  // Arrow buttons
  btnL && btnL.addEventListener('click', () => {
    track.scrollBy({ left: -340, behavior: 'smooth' });
  });
  btnR && btnR.addEventListener('click', () => {
    track.scrollBy({ left: 340, behavior: 'smooth' });
  });

  // Drag to scroll (mouse)
  let isDown = false, startX, scrollLeft;
  track.addEventListener('mousedown', e => {
    isDown = true;
    track.classList.add('active');
    startX = e.pageX - track.offsetLeft;
    scrollLeft = track.scrollLeft;
  });
  track.addEventListener('mouseleave', () => { isDown = false; track.classList.remove('active'); });
  track.addEventListener('mouseup',    () => { isDown = false; track.classList.remove('active'); });
  track.addEventListener('mousemove',  e => {
    if (!isDown) return;
    e.preventDefault();
    const x    = e.pageX - track.offsetLeft;
    const walk = (x - startX) * 1.5;
    track.scrollLeft = scrollLeft - walk;
  });

  // Touch swipe
  let touchStartX = 0, touchScrollLeft = 0;
  track.addEventListener('touchstart', e => {
    touchStartX    = e.touches[0].clientX;
    touchScrollLeft = track.scrollLeft;
  }, { passive: true });
  track.addEventListener('touchmove', e => {
    const diff = touchStartX - e.touches[0].clientX;
    track.scrollLeft = touchScrollLeft + diff;
  }, { passive: true });
}

// ── Image URL Preview in Admin ─────────────────────────────────
export function initImageUrlPreview() {
  const input   = document.getElementById('newImageUrl');
  const preview = document.getElementById('imgUrlPreview');
  if (!input || !preview) return;

  input.addEventListener('input', () => {
    const url = input.value.trim();
    if (url) {
      preview.style.display = 'block';
      preview.innerHTML = `<img src="${url}" alt="preview" onerror="this.parentElement.style.display='none'">`;
    } else {
      preview.style.display = 'none';
      preview.innerHTML = '';
    }
  });
}

// ── Bilingual (EN / AR) ────────────────────────────────────────
export function initBilingual() {
  const btn = document.getElementById('langToggleBtn');
  if (!btn) return;

  let isAr = false;

  function applyLang(ar) {
    document.documentElement.lang = ar ? 'ar' : 'en';
    document.documentElement.dir  = ar ? 'rtl' : 'ltr';
    btn.textContent = ar ? 'English' : 'عربي';

    // Swap all data-en / data-ar elements
    document.querySelectorAll('[data-en][data-ar]').forEach(el => {
      const key = ar ? 'ar' : 'en';
      // Handle innerHTML for elements with <span> etc.
      el.innerHTML = el.dataset[key] || el.innerHTML;
    });

    // Nav search placeholder
    const search = document.getElementById('navSearch');
    if (search) search.placeholder = ar ? 'ابحث...' : 'Search...';
  }

  btn.addEventListener('click', () => {
    isAr = !isAr;
    applyLang(isAr);
  });
}

/*
  ── كيف تدمج هاد مع app.js الأصلي ──

  في نهاية app.js الأصلي (أو في دالة init الرئيسية) أضف:

  import { initProjectsScroll, initImageUrlPreview, initBilingual } from './app-patch.js';

  // أو إذا ما تحب تستخدم import، انسخ الدوال مباشرة في app.js
  // وناديها في نهاية الكود:

  initProjectsScroll();
  initImageUrlPreview();
  initBilingual();

  ── التغييرات على دالة addProject ──

  // قبل:
  const file = document.getElementById('imgUpload').files[0];
  let imageUrl = '';
  if (file) {
    imageUrl = await storageUpload(`projects/${Date.now()}`, await toDataURL(file));
  }

  // بعد:
  const imageUrl = document.getElementById('newImageUrl').value.trim();

  ── التغييرات على renderProject ──

  // الكارد يعرض الصورة كـ background-image أو <img>:
  if (project.imageUrl) {
    card.style.backgroundImage = `url(${project.imageUrl})`;
  }
*/
