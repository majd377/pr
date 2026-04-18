// ─── app.js — Portfolio Logic (Firebase-powered) ─────────────────────────────
import { dbGet, dbSet, dbPush, dbRemove, dbListen, storageUpload, storageDelete }
  from "./firebase.js";

// ── Credentials (obfuscated at runtime, not in HTML) ─────────────────────────
const _s = atob("QE1hamQxMjM0NUA=");        // @Majd12345@
const _u = atob("QGRtaW4=");                 // @dmin
const _p = atob("Km1hamQyMDI2Kg==");         // *majd2026*

// ── State ─────────────────────────────────────────────────────────────────────
let projects = [];

// ── Init ──────────────────────────────────────────────────────────────────────
async function init() {
  buildParticles();
  initCursor();
  await loadSiteData();
  hideLoading();
  bindEvents();
}

// ── Loading screen ────────────────────────────────────────────────────────────
function hideLoading() {
  const el = document.getElementById("loading-screen");
  if (el) { el.classList.add("hidden"); setTimeout(() => el.remove(), 700); }
}

// ── Load everything from Firebase ────────────────────────────────────────────
async function loadSiteData() {
  // Listen realtime for projects
  dbListen("projects", (data) => {
    projects = data
      ? Object.entries(data).map(([id, v]) => ({ id, ...v })).reverse()
      : [];
    renderProjects(projects);
    renderAdminProjects();
    document.getElementById("statProjects").textContent = projects.length || "0";
  });

  // Site meta (about, logo, cv info)
  const meta = await dbGet("meta");
  if (meta) applyMeta(meta);
}

function applyMeta(meta) {
  if (meta.logoUrl) {
    document.querySelectorAll(".site-logo").forEach(el => { el.src = meta.logoUrl; });
  }
  if (meta.aboutP1 || meta.aboutP2) {
    document.getElementById("aboutText").innerHTML = `
      <p>${meta.aboutP1 || ""}</p>
      <p>${meta.aboutP2 || ""}</p>
      <p>Open to collaborations, commissions, and conversations about bringing your vision to life.</p>`;
  }
  if (meta.yearsExp) document.getElementById("statYears").textContent   = meta.yearsExp;
  if (meta.clients)  document.getElementById("statClients").textContent = meta.clients;
  if (meta.cvFileName) document.getElementById("cvFileName").textContent = meta.cvFileName;
  if (meta.cvUrl)    window._cvUrl = meta.cvUrl;
}

// ── Particles ─────────────────────────────────────────────────────────────────
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

// ── Cursor ────────────────────────────────────────────────────────────────────
function initCursor() {
  const cur = document.getElementById("cursor");
  const ring = document.getElementById("cursorRing");
  if (!cur) return;
  document.addEventListener("mousemove", e => {
    cur.style.left = e.clientX + "px";
    cur.style.top  = e.clientY + "px";
    setTimeout(() => {
      ring.style.left = e.clientX + "px";
      ring.style.top  = e.clientY + "px";
    }, 80);
  });
}

// ── Bind Events ───────────────────────────────────────────────────────────────
function bindEvents() {
  // Secret code detection on both search inputs
  ["navSearch","projectSearch"].forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener("input", e => {
      if (e.target.value.includes(_s)) {
        e.target.value = "";
        openLoginModal();
      } else if (id === "projectSearch") {
        filterProjects(e.target.value);
      }
    });
  });

  // Hero CTA scroll
  document.getElementById("heroCtaBtn")?.addEventListener("click", () => {
    document.getElementById("projects").scrollIntoView({ behavior: "smooth" });
  });

  // Login modal
  document.getElementById("loginPass")?.addEventListener("keydown", e => {
    if (e.key === "Enter") attemptLogin();
  });

  // Close modals on backdrop
  document.getElementById("loginModal")?.addEventListener("click", e => {
    if (e.target === e.currentTarget) closeModal();
  });
  document.getElementById("projectModal")?.addEventListener("click", e => {
    if (e.target === e.currentTarget) closeProjectModal();
  });

  // Smooth nav links
  document.querySelectorAll("a[href^='#']").forEach(a => {
    a.addEventListener("click", e => {
      e.preventDefault();
      document.querySelector(a.getAttribute("href"))?.scrollIntoView({ behavior: "smooth" });
    });
  });

  // CV download
  document.getElementById("cvDownloadBtn")?.addEventListener("click", downloadCV);

  // Admin tabs
  document.querySelectorAll(".admin-tab").forEach(btn => {
    btn.addEventListener("click", () => switchTab(btn.dataset.tab));
  });

  // Image upload inputs
  document.getElementById("imgUpload")?.addEventListener("change", handleImgUpload);
  document.getElementById("logoUpload")?.addEventListener("change", handleLogoUpload);
  document.getElementById("cvUpload")?.addEventListener("change", handleCVUpload);

  // Admin buttons
  document.getElementById("addProjectBtn")?.addEventListener("click", addProject);
  document.getElementById("saveAboutBtn")?.addEventListener("click", saveAbout);
  document.getElementById("adminCloseBtn")?.addEventListener("click", closeAdmin);
  document.getElementById("loginModalCloseBtn")?.addEventListener("click", closeModal);
  document.getElementById("projectModalCloseBtn")?.addEventListener("click", closeProjectModal);
  document.getElementById("loginSubmitBtn")?.addEventListener("click", attemptLogin);
}

// ── RENDER PROJECTS ───────────────────────────────────────────────────────────
function renderProjects(list) {
  const grid = document.getElementById("projectsGrid");
  if (!list || list.length === 0) {
    grid.innerHTML = `<div class="empty-state"><div class="empty-icon">◇</div><p style="font-size:14px;letter-spacing:.1em">No projects yet — coming soon</p></div>`;
    return;
  }
  grid.innerHTML = list.map((p, i) => `
    <div class="project-card" data-id="${p.id}">
      ${p.imgUrl
        ? `<img class="project-card-img" src="${p.imgUrl}" alt="${p.title}">`
        : `<div class="project-card-bg"><span class="project-placeholder-icon">◈</span></div>`}
      <div class="project-overlay">
        <div class="project-tag">${p.tag || "Project"}</div>
        <div class="project-title">${p.title}</div>
        ${p.desc ? `<div class="project-desc">${p.desc.substring(0,80)}${p.desc.length>80?"...":""}</div>` : ""}
      </div>
      <div class="project-number">${String(i+1).padStart(2,"0")}</div>
    </div>`).join("");

  grid.querySelectorAll(".project-card").forEach(card => {
    card.addEventListener("click", () => openProject(card.dataset.id));
  });
}

function filterProjects(q) {
  if (!q) { renderProjects(projects); return; }
  renderProjects(projects.filter(p =>
    p.title.toLowerCase().includes(q.toLowerCase()) ||
    (p.tag && p.tag.toLowerCase().includes(q.toLowerCase()))
  ));
}

// ── PROJECT MODAL ─────────────────────────────────────────────────────────────
function openProject(id) {
  const p = projects.find(x => x.id === id);
  if (!p) return;
  document.getElementById("pmTag").textContent   = p.tag || "";
  document.getElementById("pmTitle").textContent = p.title;
  document.getElementById("pmDesc").textContent  = p.desc || "No description provided.";
  document.getElementById("projectModalImg").innerHTML = p.imgUrl
    ? `<img class="project-modal-img" src="${p.imgUrl}" alt="${p.title}">`
    : `<div class="project-modal-img-placeholder"><span>◈</span></div>`;
  document.getElementById("projectModal").classList.add("active");
}
function closeProjectModal() {
  document.getElementById("projectModal").classList.remove("active");
}

// ── LOGIN ─────────────────────────────────────────────────────────────────────
function openLoginModal() {
  document.getElementById("loginModal").classList.add("active");
  document.getElementById("loginError").style.display = "none";
  document.getElementById("loginUser").value = "";
  document.getElementById("loginPass").value = "";
  setTimeout(() => document.getElementById("loginUser").focus(), 200);
}
function closeModal() {
  document.getElementById("loginModal").classList.remove("active");
}
function attemptLogin() {
  const u = document.getElementById("loginUser").value.trim();
  const p = document.getElementById("loginPass").value;
  if (u === _u && p === _p) {
    closeModal();
    openAdmin();
  } else {
    document.getElementById("loginError").style.display = "block";
    document.getElementById("loginPass").value = "";
  }
}

// ── ADMIN ─────────────────────────────────────────────────────────────────────
async function openAdmin() {
  document.getElementById("adminPanel").classList.add("active");
  renderAdminProjects();
  const meta = await dbGet("meta") || {};
  document.getElementById("aboutP1").value        = meta.aboutP1 || "";
  document.getElementById("aboutP2").value        = meta.aboutP2 || "";
  document.getElementById("statYearsInput").value = meta.yearsExp || "";
  document.getElementById("statClientsInput").value = meta.clients || "";
}
function closeAdmin() {
  document.getElementById("adminPanel").classList.remove("active");
}
function switchTab(tab) {
  document.querySelectorAll(".admin-tab").forEach(t => t.classList.toggle("active", t.dataset.tab === tab));
  document.querySelectorAll(".admin-content").forEach(c => c.classList.toggle("active", c.id === "tab-" + tab));
}

// ── ADD PROJECT ───────────────────────────────────────────────────────────────
let _pendingImgData = null;

function handleImgUpload(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = ev => {
    _pendingImgData = ev.target.result;
    document.getElementById("imgUploadLabel").textContent = "✓ " + file.name;
  };
  reader.readAsDataURL(file);
}

async function addProject() {
  const title = document.getElementById("newTitle").value.trim();
  const tag   = document.getElementById("newTag").value.trim();
  const desc  = document.getElementById("newDesc").value.trim();
  if (!title) { showToast("Please enter a project title"); return; }

  showToast("Saving...");
  let imgUrl = null;

  if (_pendingImgData) {
    try {
      const key = Date.now();
      imgUrl = await storageUpload(`projects/${key}`, _pendingImgData);
    } catch (err) {
      console.warn("Image upload failed:", err);
    }
  }

  await dbPush("projects", {
    title,
    tag:   tag  || "Project",
    desc:  desc || "",
    imgUrl: imgUrl || null,
    createdAt: Date.now()
  });

  document.getElementById("newTitle").value = "";
  document.getElementById("newTag").value   = "";
  document.getElementById("newDesc").value  = "";
  document.getElementById("imgUploadLabel").textContent = "Click to upload image";
  _pendingImgData = null;
  document.getElementById("imgUpload").value = "";

  const s = document.getElementById("addSuccess");
  s.style.display = "block";
  setTimeout(() => s.style.display = "none", 2500);
  showToast("Project added!");
}

async function deleteProject(id) {
  await dbRemove("projects/" + id);
  showToast("Project deleted");
}

function renderAdminProjects() {
  const list = document.getElementById("adminProjectsList");
  if (!projects.length) { list.innerHTML = `<p style="color:#444;font-size:13px;">No projects added yet.</p>`; return; }
  list.innerHTML = projects.map(p => `
    <div class="admin-project-item">
      <div><span class="admin-project-name">${p.title}</span><span class="admin-project-tag">${p.tag}</span></div>
      <div class="admin-project-actions">
        <button class="admin-btn-danger" data-id="${p.id}">Delete</button>
      </div>
    </div>`).join("");
  list.querySelectorAll(".admin-btn-danger").forEach(btn => {
    btn.addEventListener("click", () => deleteProject(btn.dataset.id));
  });
}

// ── SAVE ABOUT ────────────────────────────────────────────────────────────────
async function saveAbout() {
  const meta = (await dbGet("meta")) || {};
  meta.aboutP1   = document.getElementById("aboutP1").value;
  meta.aboutP2   = document.getElementById("aboutP2").value;
  meta.yearsExp  = document.getElementById("statYearsInput").value || "—";
  meta.clients   = document.getElementById("statClientsInput").value || "—";
  await dbSet("meta", meta);
  applyMeta(meta);
  const s = document.getElementById("aboutSuccess");
  s.style.display = "block";
  setTimeout(() => s.style.display = "none", 2500);
  showToast("Saved!");
}

// ── LOGO UPLOAD ───────────────────────────────────────────────────────────────
async function handleLogoUpload(e) {
  const file = e.target.files[0];
  if (!file) return;
  showToast("Uploading logo...");
  const reader = new FileReader();
  reader.onload = async ev => {
    const url = await storageUpload("meta/logo", ev.target.result);
    const meta = (await dbGet("meta")) || {};
    meta.logoUrl = url;
    await dbSet("meta", meta);
    document.querySelectorAll(".site-logo").forEach(el => el.src = url);
    document.getElementById("logoPreview").src = url;
    document.getElementById("logoUploadLabel").textContent = "✓ " + file.name;
    showToast("Logo updated!");
  };
  reader.readAsDataURL(file);
}

// ── CV UPLOAD ─────────────────────────────────────────────────────────────────
async function handleCVUpload(e) {
  const file = e.target.files[0];
  if (!file) return;
  showToast("Uploading CV...");
  const reader = new FileReader();
  reader.onload = async ev => {
    const url = await storageUpload("meta/cv", ev.target.result);
    const meta = (await dbGet("meta")) || {};
    meta.cvUrl      = url;
    meta.cvFileName = file.name;
    await dbSet("meta", meta);
    window._cvUrl = url;
    document.getElementById("cvFileName").textContent = file.name;
    const s = document.getElementById("cvSuccess");
    s.style.display = "block";
    setTimeout(() => s.style.display = "none", 2500);
    showToast("CV updated!");
  };
  reader.readAsDataURL(file);
}

function downloadCV() {
  if (!window._cvUrl) { showToast("No CV uploaded yet"); return; }
  const a = document.createElement("a");
  a.href = window._cvUrl;
  a.target = "_blank";
  a.click();
}

// ── TOAST ─────────────────────────────────────────────────────────────────────
function showToast(msg) {
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.classList.add("show");
  setTimeout(() => t.classList.remove("show"), 3000);
}

// ── Boot ──────────────────────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", init);
