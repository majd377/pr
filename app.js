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

// ─────────────────────────────────────────────────────────────────────────────
//  BOOT
// ─────────────────────────────────────────────────────────────────────────────
async function init() {
  buildParticles();
  initCursor();
  bindEvents();

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
function applyMeta(meta) {
  if (!meta) return;
  if (meta.logoUrl) {
    document.querySelectorAll(".site-logo").forEach(el => { el.src = meta.logoUrl; el.style.display = "block"; });
    const lp = document.getElementById("logoPreview");
    if (lp) lp.src = meta.logoUrl;
  }
  const at = document.getElementById("aboutText");
  if (at && (meta.aboutP1 || meta.aboutP2)) {
    at.innerHTML = `<p>${meta.aboutP1||""}</p><p>${meta.aboutP2||""}</p><p>Open to collaborations, commissions, and conversations about bringing your vision to life.</p>`;
  }
  const sy = document.getElementById("statYears");
  const sc = document.getElementById("statClients");
  if (sy && meta.yearsExp) sy.textContent = meta.yearsExp;
  if (sc && meta.clients)  sc.textContent = meta.clients;
  const fn = document.getElementById("cvFileName");
  if (fn && meta.cvFileName) fn.textContent = meta.cvFileName;
  if (meta.cvUrl) window._cvUrl = meta.cvUrl;
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
  document.getElementById("imgUpload")?.addEventListener("change", handleImgUpload);
  document.getElementById("logoUpload")?.addEventListener("change", handleLogoUpload);
  document.getElementById("cvUpload")?.addEventListener("change", handleCVUpload);
  document.getElementById("cvDownloadBtn")?.addEventListener("click", downloadCV);

  document.querySelectorAll("a[href^='#']").forEach(a =>
    a.addEventListener("click", e => {
      e.preventDefault();
      document.querySelector(a.getAttribute("href"))?.scrollIntoView({ behavior: "smooth" });
    }));
}

// ─────────────────────────────────────────────────────────────────────────────
//  PROJECTS
// ─────────────────────────────────────────────────────────────────────────────
function renderProjects(list) {
  const grid = document.getElementById("projectsGrid");
  if (!grid) return;
  if (!list || !list.length) {
    grid.innerHTML = `<div class="empty-state"><div class="empty-icon">◇</div><p style="font-size:14px;letter-spacing:.1em">No projects yet — coming soon</p></div>`;
    return;
  }
  grid.innerHTML = list.map((p, i) => `
    <div class="project-card" data-id="${p.id}">
      ${p.imgUrl
        ? `<img class="project-card-img" src="${p.imgUrl}" alt="${p.title}" loading="lazy">`
        : `<div class="project-card-bg"><span class="project-placeholder-icon">◈</span></div>`}
      <div class="project-overlay">
        <div class="project-tag">${p.tag||"Project"}</div>
        <div class="project-title">${p.title}</div>
        ${p.desc ? `<div class="project-desc">${p.desc.substring(0,90)}${p.desc.length>90?"…":""}</div>` : ""}
      </div>
      <div class="project-number">${String(i+1).padStart(2,"0")}</div>
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
  document.getElementById("pmDesc").textContent  = p.desc  || "No description provided.";
  document.getElementById("projectModalImg").innerHTML = p.imgUrl
    ? `<img class="project-modal-img" src="${p.imgUrl}" alt="${p.title}">`
    : `<div class="project-modal-img-placeholder"><span>◈</span></div>`;
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
    document.getElementById("aboutP1").value          = meta.aboutP1  || "";
    document.getElementById("aboutP2").value          = meta.aboutP2  || "";
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
  reader.onload = ev => { _newImgData = ev.target.result; document.getElementById("imgUploadLabel").textContent = "✓ "+file.name; };
  reader.readAsDataURL(file);
}

async function addProject() {
  const title = document.getElementById("newTitle").value.trim();
  const tag   = document.getElementById("newTag").value.trim();
  const desc  = document.getElementById("newDesc").value.trim();
  if (!title) { showToast("Enter a project title"); return; }

  const btn = document.getElementById("addProjectBtn");
  btn.disabled = true; btn.textContent = "Saving…";
  showToast("Saving...");

  let imgUrl = null;
  if (_newImgData) {
    try { imgUrl = await storageUpload(`projects/${Date.now()}`, _newImgData); }
    catch (err) { console.warn("img upload failed:", err); showToast("Image upload failed — saving without image"); }
  }

  try {
    await dbPush("projects", {
      title,
      tag:       tag  || "Project",
      desc:      desc || "",
      imgUrl:    imgUrl || null,
      createdAt: Date.now()
    });
    document.getElementById("newTitle").value = "";
    document.getElementById("newTag").value   = "";
    document.getElementById("newDesc").value  = "";
    document.getElementById("imgUploadLabel").textContent = "Click to upload image";
    document.getElementById("imgUpload").value = "";
    _newImgData = null;
    const s = document.getElementById("addSuccess");
    s.style.display = "block";
    setTimeout(() => s.style.display = "none", 2500);
    showToast("Project added! ✓");
  } catch (err) {
    console.error("DB write failed:", err);
    showToast("Error: " + err.message);
  }
  btn.disabled = false; btn.textContent = "Add Project";
}

async function deleteProject(id) {
  if (!confirm("Delete this project?")) return;
  try { await dbRemove("projects/"+id); showToast("Deleted"); }
  catch (err) { showToast("Error: "+err.message); }
}

function renderAdminProjects() {
  const list = document.getElementById("adminProjectsList");
  if (!list) return;
  if (!projects.length) { list.innerHTML = `<p style="color:#444;font-size:13px;">No projects added yet.</p>`; return; }
  list.innerHTML = projects.map(p => `
    <div class="admin-project-item">
      <div><span class="admin-project-name">${p.title}</span><span class="admin-project-tag">${p.tag||""}</span></div>
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
    aboutP1:  document.getElementById("aboutP1").value.trim(),
    aboutP2:  document.getElementById("aboutP2").value.trim(),
    yearsExp: document.getElementById("statYearsInput").value.trim()   || "—",
    clients:  document.getElementById("statClientsInput").value.trim() || "—",
  };
  try {
    await dbUpdate("meta", patch);
    applyMeta(patch);
    const s = document.getElementById("aboutSuccess");
    s.style.display = "block";
    setTimeout(() => s.style.display = "none", 2500);
    showToast("Saved! ✓");
  } catch (err) { showToast("Save failed: "+err.message); }
}

// ─────────────────────────────────────────────────────────────────────────────
//  LOGO UPLOAD
// ─────────────────────────────────────────────────────────────────────────────
function handleLogoUpload(e) {
  const file = e.target.files[0];
  if (!file) return;
  showToast("Uploading logo...");
  const reader = new FileReader();
  reader.onload = async ev => {
    try {
      const url = await storageUpload("meta/logo", ev.target.result);
      await dbUpdate("meta", { logoUrl: url });
      document.querySelectorAll(".site-logo").forEach(el => { el.src = url; el.style.display = "block"; });
      const lp = document.getElementById("logoPreview");
      if (lp) lp.src = url;
      document.getElementById("logoUploadLabel").textContent = "✓ "+file.name;
      showToast("Logo updated! ✓");
    } catch (err) { showToast("Logo upload failed: "+err.message); }
  };
  reader.readAsDataURL(file);
}

// ─────────────────────────────────────────────────────────────────────────────
//  CV UPLOAD
// ─────────────────────────────────────────────────────────────────────────────
function handleCVUpload(e) {
  const file = e.target.files[0];
  if (!file) return;
  showToast("Uploading CV...");
  const reader = new FileReader();
  reader.onload = async ev => {
    try {
      const url = await storageUpload("meta/cv", ev.target.result);
      await dbUpdate("meta", { cvUrl: url, cvFileName: file.name });
      window._cvUrl = url;
      const fn = document.getElementById("cvFileName");
      if (fn) fn.textContent = file.name;
      const s = document.getElementById("cvSuccess");
      s.style.display = "block";
      setTimeout(() => s.style.display = "none", 2500);
      showToast("CV updated! ✓");
    } catch (err) { showToast("CV upload failed: "+err.message); }
  };
  reader.readAsDataURL(file);
}

function downloadCV() {
  if (!window._cvUrl) { showToast("No CV uploaded yet"); return; }
  const a = document.createElement("a");
  a.href = window._cvUrl; a.target = "_blank"; a.click();
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
