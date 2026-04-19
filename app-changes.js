/*
  ════════════════════════════════════════════════════════════════════
  APP.JS — التعديلات المطلوبة
  هاد مش ملف تشغيلي — هو شرح للتغييرات اللي تطبقها على app.js
  ════════════════════════════════════════════════════════════════════

  ── 1. شيل كل كود CV ──────────────────────────────────────────────
  احذف أي سطر يذكر:
    cvDownloadBtn / cvFileName / storageUpload للـ CV / dbGet('cv') / dbSet('cv')

  ── 2. دالة addProject — شيل رفع الصورة ──────────────────────────

  // قبل (الكود القديم):
  const file = document.getElementById('imgUpload')?.files[0];
  let imageUrl = '';
  if (file) {
    const dataUrl = await toDataURL(file);
    imageUrl = await storageUpload(`projects/${Date.now()}`, dataUrl);
  }

  // بعد (الكود الجديد) — ما في رفع، الصورة ثابتة:
  const imageUrl = 'majd-removebg-preview.png';

  ── 3. دالة renderProject — ثبّت الصورة ──────────────────────────

  // في أي مكان تبني الـ project-card، خلّي الصورة دايماً اللوجو:
  const imgSrc = 'majd-removebg-preview.png';

  // مثال على بناء الكارد:
  card.innerHTML = `
    <div class="project-img">
      <img src="${imgSrc}" alt="${project.title}">
    </div>
    <div class="project-info">
      <h3>${project.title}</h3>
      <p>${project.desc || ''}</p>
    </div>
  `;

  ── 4. Horizontal scroll — أضف في نهاية init() ───────────────────

  // Arrow buttons
  const track = document.getElementById('projectsGrid');
  document.getElementById('scrollLeft')?.addEventListener('click', () => {
    track.scrollBy({ left: -320, behavior: 'smooth' });
  });
  document.getElementById('scrollRight')?.addEventListener('click', () => {
    track.scrollBy({ left: 320, behavior: 'smooth' });
  });

  // Drag to scroll (mouse)
  let isDown = false, startX, scrollLeft;
  track.addEventListener('mousedown', e => {
    isDown = true;
    startX = e.pageX - track.offsetLeft;
    scrollLeft = track.scrollLeft;
  });
  track.addEventListener('mouseleave', () => { isDown = false; });
  track.addEventListener('mouseup',    () => { isDown = false; });
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
    touchStartX     = e.touches[0].clientX;
    touchScrollLeft = track.scrollLeft;
  }, { passive: true });
  track.addEventListener('touchmove', e => {
    track.scrollLeft = touchScrollLeft + (touchStartX - e.touches[0].clientX);
  }, { passive: true });

  ── 5. اللغة (bilingual) — إضافة في init() ───────────────────────

  const langBtn = document.getElementById('langToggleBtn');
  let isAr = false;

  function applyLang(ar) {
    document.documentElement.lang = ar ? 'ar' : 'en';
    document.documentElement.dir  = ar ? 'rtl' : 'ltr';
    langBtn.textContent = ar ? 'English' : 'عربي';

    document.querySelectorAll('[data-en][data-ar]').forEach(el => {
      el.innerHTML = el.dataset[ar ? 'ar' : 'en'];
    });

    const search = document.getElementById('navSearch');
    if (search) search.placeholder = ar ? 'ابحث...' : 'Search...';
  }

  langBtn?.addEventListener('click', () => {
    isAr = !isAr;
    applyLang(isAr);
  });

  ════════════════════════════════════════════════════════════════════
*/
