// ─── app.js — Portfolio Logic ─────────────────────────────────────────────────
import {
  dbGet, dbSet, dbUpdate, dbPush, dbRemove, dbListen,
  storageUpload, storageDelete
} from "./firebase.js";

// ── Auth tokens (base64 — never exposed in HTML source) ───────────────────────
const _s = atob("QE1hamQxMjM0NUA=");   // @Majd12345@
const _u = atob("QGRtaW4=");           // @dmin
const _p = atob("Km1hamQyMDI2Kg==");   // *majd2026*

// ── Runtime state ─────────────────────────────────────────────────────────────
let projects    = [];
let _newImgData = null;
let _isAddingProject = false;  // FIX: prevent double-save loop

// ── Language state ────────────────────────────────────────────────────────────
let currentLang = localStorage.getItem("lang") || "en";

const i18n = {
  en: {
    navProjects: "Projects",
    navAbout: "About",
    navResume: "Resume",
    searchPlaceholder: "Search...",
    heroTagline: "Creative Portfolio",
    heroTitle: "Where Vision<br>Becomes <span>Reality</span>",
    heroSubtitle: "A curated collection of works born from passion, precision, and purpose.",
    heroBtn: "View My Work",
    scroll: "Scroll",
    sectionLabelWork: "Selected Work",
    sectionTitleProjects: "Projects",
    sectionLabelAbout: "About Me",
    sectionTitleStory: "The Story",
    sectionLabelResume: "Resume",
    sectionTitleCV: "Download My CV",
    aboutP1: "A creative professional driven by a passion for <strong>design, detail, and innovation</strong>. Every project is an opportunity to push boundaries and create something extraordinary.",
    aboutP2: "With an eye for aesthetics and a commitment to quality, each piece in this portfolio represents not just a finished product — but a journey of ideas and craftsmanship.",
    aboutP3: "Open to collaborations, commissions, and conversations about bringing your vision to life.",
    statProjectsLabel: "Projects Completed",
    statYearsLabel: "Years of Experience",
    statClientsLabel: "Happy Clients",
    cvDesc: "My resume is available for download. It includes my experience, skills, and achievements in full detail.",
    cvBtn: "Download CV",
    cvNoFile: "No file uploaded yet",
    adminTitle: "Admin Dashboard",
    adminClose: "✕ Close",
    tabProjects: "Projects",
    tabIdentity: "Identity",
    tabAbout: "About",
    tabCV: "CV",
    addProject: "Add Project",
    saving: "Saving…",
    noProjects: "No projects yet — coming soon",
    projectAdded: "Project added! ✓",
    deleted: "Deleted",
    saved: "Saved! ✓",
    logoUpdated: "Logo updated! ✓",
    cvUpdated: "CV updated! ✓",
    noCVUploaded: "No CV uploaded yet",
    enterTitle: "Enter a project title",
    deleteConfirm: "Delete this project?",
    adminAccess: "Admin Access",
    enterCredentials: "ENTER YOUR CREDENTIALS TO CONTINUE",
    username: "Username",
    password: "Password",
    invalidCreds: "Invalid credentials. Try again.",
    enter: "Enter",
    projectLinkLabel: "Project Link (optional)",
    projectLinkPlaceholder: "https://...",
    visitLink: "Visit Project →",
  },
  ar: {
    navProjects: "المشاريع",
    navAbout: "عني",
    navResume: "السيرة الذاتية",
    searchPlaceholder: "بحث...",
    heroTagline: "معرض الأعمال الإبداعي",
    heroTitle: "حيث تتحوّل الرؤية<br>إلى <span>واقع</span>",
    heroSubtitle: "مجموعة مختارة من الأعمال المولودة من الشغف والدقة والهدف.",
    heroBtn: "تصفّح أعمالي",
    scroll: "تمرير",
    sectionLabelWork: "أعمال مختارة",
    sectionTitleProjects: "المشاريع",
    sectionLabelAbout: "عن المصمم",
    sectionTitleStory: "القصة",
    sectionLabelResume: "السيرة الذاتية",
    sectionTitleCV: "تحميل السيرة الذاتية",
    aboutP1: "مصمم مبدع تحرّكه الشغف بـ<strong>التصميم والتفاصيل والابتكار</strong>. كل مشروع هو فرصة لتجاوز الحدود وخلق شيء استثنائي.",
    aboutP2: "بعين للجماليات والتزام بالجودة، يمثل كل عمل في هذا المعرض ليس مجرد منتج نهائي — بل رحلة من الأفكار والحرفية.",
    aboutP3: "مفتوح للتعاون والمشاريع والمحادثات حول تحقيق رؤيتك.",
    statProjectsLabel: "مشروع منجز",
    statYearsLabel: "سنوات خبرة",
    statClientsLabel: "عميل سعيد",
    cvDesc: "سيرتي الذاتية متاحة للتحميل. تتضمن خبراتي ومهاراتي وإنجازاتي بكل التفاصيل.",
    cvBtn: "تحميل السيرة الذاتية",
    cvNoFile: "لم يتم رفع ملف بعد",
    adminTitle: "لوحة التحكم",
    adminClose: "✕ إغلاق",
    tabProjects: "المشاريع",
    tabIdentity: "الهوية",
    tabAbout: "عني",
    tabCV: "السيرة الذاتية",
    addProject: "إضافة مشروع",
    saving: "جاري الحفظ…",
    noProjects: "لا توجد مشاريع بعد — قريباً",
    projectAdded: "تم إضافة المشروع! ✓",
    deleted: "تم الحذف",
    saved: "تم الحفظ! ✓",
    logoUpdated: "تم تحديث الشعار! ✓",
    cvUpdated: "تم تحديث السيرة الذاتية! ✓",
    noCVUploaded: "لم يتم رفع ملف بعد",
    enterTitle: "أدخل عنوان المشروع",
    deleteConfirm: "هل تريد حذف هذا المشروع؟",
    adminAccess: "دخول المشرف",
    enterCredentials: "أدخل بياناتك للمتابعة",
    username: "اسم المستخدم",
    password: "كلمة المرور",
    invalidCreds: "بيانات غير صحيحة. حاول مرة أخرى.",
    enter: "دخول",
    projectLinkLabel: "رابط المشروع (اختياري)",
    projectLinkPlaceholder: "https://...",
    visitLink: "زيارة المشروع →",
  }
};

function t(key) {
  return i18n[currentLang][key] || i18n["en"][key] || key;
}

function applyLanguage() {
  const isAr = currentLang === "ar";
  document.documentElement.lang = currentLang;
  document.documentElement.dir  = isAr ? "rtl" : "ltr";

  // Nav
  const navLinks = document.querySelectorAll(".nav-links li a");
  const navKeys  = ["navProjects","navAbout","navResume"];
  navLinks.forEach((a,i) => { if(navKeys[i]) a.textContent = t(navKeys[i]); });

  const ns = document.getElementById("navSearch");
  if (ns) ns.placeholder = t("searchPlaceholder");

  // Hero
  const ht = document.querySelector(".hero-tagline");
  if (ht) ht.textContent = t("heroTagline");
  const htitle = document.querySelector(".hero-title");
  if (htitle) htitle.innerHTML = t("heroTitle");
  const hsub = document.querySelector(".hero-subtitle");
  if (hsub) hsub.textContent = t("heroSubtitle");
  const hbtn = document.getElementById("heroCtaBtn");
  if (hbtn) hbtn.textContent = t("heroBtn");
  const scr = document.querySelector(".scroll-indicator span");
  if (scr) scr.textContent = t("scroll");

  // Section labels/titles
  const labels = document.querySelectorAll(".section-label");
  const titles = document.querySelectorAll(".section-title");
  const labelKeys = ["sectionLabelWork","sectionLabelAbout","sectionLabelResume"];
  const titleKeys  = ["sectionTitleProjects","sectionTitleStory","sectionTitleCV"];
  labels.forEach((el,i) => { if(labelKeys[i]) el.textContent = t(labelKeys[i]); });
  titles.forEach((el,i) => { if(titleKeys[i]) el.textContent = t(titleKeys[i]); });

  // About text — re-apply bilingual if we have cached meta, else use defaults
  const at = document.getElementById("aboutText");
  if (at) {
    if (_cachedMeta) {
      applyAboutText(_cachedMeta);
    } else if (!at.dataset.custom) {
      at.innerHTML = `<p>${t("aboutP1")}</p><p>${t("aboutP2")}</p><p>${t("aboutP3")}</p>`;
    }
  }

  // Stats labels
  const sl = document.querySelectorAll(".stat-label");
  const slKeys = ["statProjectsLabel","statYearsLabel","statClientsLabel"];
  sl.forEach((el,i) => { if(slKeys[i]) el.textContent = t(slKeys[i]); });

  // CV section
  const cvDesc = document.querySelector(".cv-placeholder > p");
  if (cvDesc) cvDesc.textContent = t("cvDesc");
  const cvBtn = document.getElementById("cvDownloadBtn");
  if (cvBtn) cvBtn.textContent = t("cvBtn");
  const cvFn = document.getElementById("cvFileName");
  if (cvFn && !window._cvUrl) cvFn.textContent = t("cvNoFile");

  // Lang toggle button
  const langBtn = document.getElementById("langToggleBtn");
  if (langBtn) langBtn.textContent = isAr ? "EN" : "عربي";

  // Re-render projects with updated language
  renderProjects(projects);
}

// ─────────────────────────────────────────────────────────────────────────────
//  BOOT
// ─────────────────────────────────────────────────────────────────────────────
async function init() {
  buildParticles();
  initCursor();
  bindEvents();
  applyLanguage();

  // Realtime sync for projects
  dbListen("projects", (data) => {
    projects = data
      ? Object.entries(data)
          .map(([id, v]) => ({ id, ...v }))
          .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
      : [];
    renderProjects(projects);
    renderAdminProjects();
    const el = document.getElementById("statProjects");
    if (el) el.textContent = projects.length || "0";
  });

  // Load meta once
  try {
    const meta = await dbGet("meta");
    if (meta) applyMeta(meta);
  } catch (err) {
    console.warn("meta load:", err);
  }

  hideLoading();
}

// ─────────────────────────────────────────────────────────────────────────────
//  LOADING
// ─────────────────────────────────────────────────────────────────────────────
function hideLoading() {
  const el = document.getElementById("loading-screen");
  if (!el) return;
  el.classList.add("hidden");
  setTimeout(() => el.remove(), 700);
}

// ─────────────────────────────────────────────────────────────────────────────
//  APPLY META
// ─────────────────────────────────────────────────────────────────────────────
// Cached meta for re-applying on language switch
let _cachedMeta = null;

function applyMeta(meta) {
  if (!meta) return;
  _cachedMeta = meta;
  if (meta.logoUrl) {
    document.querySelectorAll(".site-logo").forEach(el => { el.src = meta.logoUrl; el.style.display = "block"; });
    const lp = document.getElementById("logoPreview");
    if (lp) lp.src = meta.logoUrl;
  }
  applyAboutText(meta);
  const sy = document.getElementById("statYears");
  const sc = document.getElementById("statClients");
  if (sy && meta.yearsExp) sy.textContent = meta.yearsExp;
  if (sc && meta.clients)  sc.textContent = meta.clients;
  const fn = document.getElementById("cvFileName");
  if (fn && meta.cvFileName) fn.textContent = meta.cvFileName;
  if (meta.cvUrl) window._cvUrl = meta.cvUrl;
}

/** Renders about text in the correct language from stored bilingual data */
function applyAboutText(meta) {
  const at = document.getElementById("aboutText");
  if (!at) return;
  const isAr = currentLang === "ar";

  // New bilingual fields take priority, fallback to old single-lang fields
  const p1 = isAr
    ? (meta.aboutP1Ar || meta.aboutP1 || t("aboutP1"))
    : (meta.aboutP1En || meta.aboutP1 || t("aboutP1"));
  const p2 = isAr
    ? (meta.aboutP2Ar || meta.aboutP2 || t("aboutP2"))
    : (meta.aboutP2En || meta.aboutP2 || t("aboutP2"));

  const hasCustom = meta.aboutP1En || meta.aboutP1Ar || meta.aboutP1;
  if (hasCustom) {
    at.dataset.custom = "1";
    at.innerHTML = `<p>${p1}</p><p>${p2}</p><p>${t("aboutP3")}</p>`;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
//  PARTICLES
// ─────────────────────────────────────────────────────────────────────────────
function buildParticles() {
  const c = document.getElementById("particles");
  if (!c) return;
  for (let i = 0; i < 25; i++) {
    const p = document.createElement("div");
    p.className = "particle";
    p.style.cssText = `left:${Math.random()*100}%;animation-duration:${8+Math.random()*12}s;animation-delay:${Math.random()*10}s;--dx:${(Math.random()-.5)*200}px;`;
    c.appendChild(p);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
//  CURSOR
// ─────────────────────────────────────────────────────────────────────────────
function initCursor() {
  const cur  = document.getElementById("cursor");
  const ring = document.getElementById("cursorRing");
  if (!cur) return;
  document.addEventListener("mousemove", e => {
    cur.style.left  = e.clientX + "px";
    cur.style.top   = e.clientY + "px";
    setTimeout(() => { ring.style.left = e.clientX+"px"; ring.style.top = e.clientY+"px"; }, 80);
  });
}

// ─────────────────────────────────────────────────────────────────────────────
//  EVENTS
// ─────────────────────────────────────────────────────────────────────────────
function bindEvents() {
  ["navSearch","projectSearch"].forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener("input", e => {
      if (e.target.value.includes(_s)) { e.target.value = ""; openLoginModal(); }
      else if (id === "projectSearch") filterProjects(e.target.value);
    });
  });

  document.getElementById("heroCtaBtn")?.addEventListener("click", () =>
    document.getElementById("projects")?.scrollIntoView({ behavior: "smooth" }));

  document.getElementById("loginPass")?.addEventListener("keydown", e => { if (e.key==="Enter") attemptLogin(); });
  document.getElementById("loginSubmitBtn")?.addEventListener("click", attemptLogin);
  document.getElementById("loginModalCloseBtn")?.addEventListener("click", closeModal);
  document.getElementById("loginModal")?.addEventListener("click", e => { if (e.target===e.currentTarget) closeModal(); });

  document.getElementById("projectModalCloseBtn")?.addEventListener("click", closeProjectModal);
  document.getElementById("projectModal")?.addEventListener("click", e => { if (e.target===e.currentTarget) closeProjectModal(); });

  document.getElementById("adminCloseBtn")?.addEventListener("click", closeAdmin);
  document.querySelectorAll(".admin-tab").forEach(btn =>
    btn.addEventListener("click", () => switchTab(btn.dataset.tab)));

  document.getElementById("addProjectBtn")?.addEventListener("click", addProject);
  document.getElementById("saveAboutBtn")?.addEventListener("click", saveAbout);

  // FIX: use { once: false } but guard with _isAddingProject flag
  document.getElementById("imgUpload")?.addEventListener("change", handleImgUpload);

  // FIX: logo upload — re-bind properly
  const logoUpload = document.getElementById("logoUpload");
  if (logoUpload) {
    logoUpload.addEventListener("change", handleLogoUpload);
  }

  // FIX: CV upload — re-bind properly
  const cvUpload = document.getElementById("cvUpload");
  if (cvUpload) {
    cvUpload.addEventListener("change", handleCVUpload);
  }

  document.getElementById("cvDownloadBtn")?.addEventListener("click", downloadCV);

  document.querySelectorAll("a[href^='#']").forEach(a =>
    a.addEventListener("click", e => {
      e.preventDefault();
      document.querySelector(a.getAttribute("href"))?.scrollIntoView({ behavior: "smooth" });
    }));

  // Language toggle
  document.getElementById("langToggleBtn")?.addEventListener("click", () => {
    currentLang = currentLang === "en" ? "ar" : "en";
    localStorage.setItem("lang", currentLang);
    applyLanguage();
  });
}

// ─────────────────────────────────────────────────────────────────────────────
//  PROJECTS RENDER
// ─────────────────────────────────────────────────────────────────────────────
function renderProjects(list) {
  const grid = document.getElementById("projectsGrid");
  if (!grid) return;
  if (!list || !list.length) {
    grid.innerHTML = `<div class="empty-state"><div class="empty-icon">◇</div><p>${t("noProjects")}</p></div>`;
    return;
  }
  grid.innerHTML = list.map((p, i) => `
    <div class="project-card" data-id="${p.id}">
      ${p.imgUrl
        ? `<img class="project-card-img" src="${p.imgUrl}" alt="${p.title}" loading="lazy">`
        : `<div class="project-card-bg"><span class="project-placeholder-icon">◈</span></div>`}
      <div class="project-number">${String(i+1).padStart(2,"0")}</div>
      <div class="project-info">
        <div class="project-info-tag">${p.tag||"Project"}</div>
        <div class="project-info-title">${p.title}</div>
        ${p.desc ? `<div class="project-info-desc">${p.desc.substring(0,80)}${p.desc.length>80?"…":""}</div>` : ""}
        ${p.link ? `<a class="project-info-link" href="${p.link}" target="_blank" rel="noopener" onclick="event.stopPropagation()">${t("visitLink")}</a>` : ""}
      </div>
    </div>`).join("");
  grid.querySelectorAll(".project-card").forEach(card =>
    card.addEventListener("click", () => openProject(card.dataset.id)));
}

function filterProjects(q) {
  if (!q.trim()) { renderProjects(projects); return; }
  const lq = q.toLowerCase();
  renderProjects(projects.filter(p =>
    p.title?.toLowerCase().includes(lq) || p.tag?.toLowerCase().includes(lq)));
}

// ─────────────────────────────────────────────────────────────────────────────
//  PROJECT MODAL
// ─────────────────────────────────────────────────────────────────────────────
function openProject(id) {
  const p = projects.find(x => x.id === id);
  if (!p) return;
  document.getElementById("pmTag").textContent   = p.tag   || "";
  document.getElementById("pmTitle").textContent = p.title || "";
  document.getElementById("pmDesc").textContent  = p.desc  || "";
  const imgDiv = document.getElementById("projectModalImg");
  imgDiv.innerHTML = p.imgUrl
    ? `<img class="project-modal-img" src="${p.imgUrl}" alt="${p.title}">`
    : `<div class="project-modal-img-placeholder">◈</div>`;
  // Link in modal
  const linkEl = document.getElementById("pmLink");
  if (linkEl) {
    if (p.link) { linkEl.href = p.link; linkEl.style.display = "inline-block"; linkEl.textContent = t("visitLink"); }
    else linkEl.style.display = "none";
  }
  document.getElementById("projectModal").classList.add("active");
}
function closeProjectModal() { document.getElementById("projectModal").classList.remove("active"); }

// ─────────────────────────────────────────────────────────────────────────────
//  LOGIN
// ─────────────────────────────────────────────────────────────────────────────
function openLoginModal() {
  document.getElementById("loginModal").classList.add("active");
  document.getElementById("loginError").style.display = "none";
  document.getElementById("loginUser").value = "";
  document.getElementById("loginPass").value = "";
  setTimeout(() => document.getElementById("loginUser").focus(), 200);
}
function closeModal() { document.getElementById("loginModal").classList.remove("active"); }
function attemptLogin() {
  const u = document.getElementById("loginUser").value.trim();
  const p = document.getElementById("loginPass").value;
  if (u === _u && p === _p) { closeModal(); openAdmin(); }
  else {
    document.getElementById("loginError").style.display = "block";
    document.getElementById("loginPass").value = "";
  }
}

// ─────────────────────────────────────────────────────────────────────────────
//  ADMIN
// ─────────────────────────────────────────────────────────────────────────────
async function openAdmin() {
  document.getElementById("adminPanel").classList.add("active");
  renderAdminProjects();
  try {
    const meta = await dbGet("meta") || {};
    // Support new bilingual fields with fallback to old single fields
    const p1en = document.getElementById("aboutP1En");
    const p1ar = document.getElementById("aboutP1Ar");
    const p2en = document.getElementById("aboutP2En");
    const p2ar = document.getElementById("aboutP2Ar");
    if (p1en) p1en.value = meta.aboutP1En || meta.aboutP1 || "";
    if (p1ar) p1ar.value = meta.aboutP1Ar || "";
    if (p2en) p2en.value = meta.aboutP2En || meta.aboutP2 || "";
    if (p2ar) p2ar.value = meta.aboutP2Ar || "";
    document.getElementById("statYearsInput").value   = meta.yearsExp || "";
    document.getElementById("statClientsInput").value = meta.clients  || "";
  } catch (_) {}
}
function closeAdmin() { document.getElementById("adminPanel").classList.remove("active"); }
function switchTab(tab) {
  document.querySelectorAll(".admin-tab").forEach(t => t.classList.toggle("active", t.dataset.tab===tab));
  document.querySelectorAll(".admin-content").forEach(c => c.classList.toggle("active", c.id==="tab-"+tab));
}

// ─────────────────────────────────────────────────────────────────────────────
//  ADD / DELETE PROJECT
// ─────────────────────────────────────────────────────────────────────────────
function handleImgUpload(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = ev => {
    _newImgData = ev.target.result;
    document.getElementById("imgUploadLabel").textContent = "✓ " + file.name;
  };
  reader.readAsDataURL(file);
}

async function addProject() {
  // FIX: prevent multiple saves from rapid clicks
  if (_isAddingProject) return;

  const title = document.getElementById("newTitle").value.trim();
  const desc  = document.getElementById("newDesc").value.trim();
  const link  = document.getElementById("newLink")?.value.trim() || "";
  if (!title) { showToast(t("enterTitle")); return; }

  _isAddingProject = true;
  const btn = document.getElementById("addProjectBtn");
  btn.disabled = true; btn.textContent = t("saving");
  showToast(t("saving"));

  let imgUrl = null;
  if (_newImgData) {
    try {
      imgUrl = await storageUpload(`projects/${Date.now()}`, _newImgData);
    } catch (err) {
      console.warn("img upload failed:", err);
      showToast("Image upload failed — saving without image");
    }
  }

  try {
    await dbPush("projects", {
      title,
      desc:      desc || "",
      link:      link || "",
      imgUrl:    imgUrl || null,
      createdAt: Date.now()
    });
    document.getElementById("newTitle").value = "";
    document.getElementById("newDesc").value  = "";
    if (document.getElementById("newLink")) document.getElementById("newLink").value = "";
    document.getElementById("imgUploadLabel").textContent = "Click to upload image";
    // FIX: reset file input properly
    const imgInput = document.getElementById("imgUpload");
    imgInput.value = "";
    _newImgData = null;
    const s = document.getElementById("addSuccess");
    s.style.display = "block";
    setTimeout(() => s.style.display = "none", 2500);
    showToast(t("projectAdded"));
  } catch (err) {
    console.error("DB write failed:", err);
    showToast("Error: " + err.message);
  }

  btn.disabled = false; btn.textContent = t("addProject");
  _isAddingProject = false;
}

async function deleteProject(id) {
  if (!confirm(t("deleteConfirm"))) return;
  try { await dbRemove("projects/"+id); showToast(t("deleted")); }
  catch (err) { showToast("Error: "+err.message); }
}

function renderAdminProjects() {
  const list = document.getElementById("adminProjectsList");
  if (!list) return;
  if (!projects.length) { list.innerHTML = `<p style="color:#444;font-size:13px;">No projects added yet.</p>`; return; }
  list.innerHTML = projects.map(p => `
    <div class="admin-project-item">
      <div><span class="admin-project-name">${p.title}</span></div>
      <div class="admin-project-actions"><button class="admin-btn-danger" data-id="${p.id}">Delete</button></div>
    </div>`).join("");
  list.querySelectorAll(".admin-btn-danger").forEach(btn =>
    btn.addEventListener("click", () => deleteProject(btn.dataset.id)));
}

// ─────────────────────────────────────────────────────────────────────────────
//  SAVE ABOUT
// ─────────────────────────────────────────────────────────────────────────────
async function saveAbout() {
  const patch = {
    aboutP1En: (document.getElementById("aboutP1En")?.value || "").trim(),
    aboutP1Ar: (document.getElementById("aboutP1Ar")?.value || "").trim(),
    aboutP2En: (document.getElementById("aboutP2En")?.value || "").trim(),
    aboutP2Ar: (document.getElementById("aboutP2Ar")?.value || "").trim(),
    // Keep legacy field for backward compat
    aboutP1:   (document.getElementById("aboutP1En")?.value || "").trim(),
    aboutP2:   (document.getElementById("aboutP2En")?.value || "").trim(),
    yearsExp:  document.getElementById("statYearsInput").value.trim()   || "—",
    clients:   document.getElementById("statClientsInput").value.trim() || "—",
  };
  try {
    await dbUpdate("meta", patch);
    applyMeta(patch);
    const s = document.getElementById("aboutSuccess");
    s.style.display = "block";
    setTimeout(() => s.style.display = "none", 2500);
    showToast(t("saved"));
  } catch (err) { showToast("Save failed: "+err.message); }
}


// ─────────────────────────────────────────────────────────────────────────────
//  TOAST
// ─────────────────────────────────────────────────────────────────────────────
function showToast(msg) {
  const t = document.getElementById("toast");
  if (!t) return;
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.remove("show"), 3000);
}

// ── START ─────────────────────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", init);
