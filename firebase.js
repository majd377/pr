// ─── Firebase Config & Init ───────────────────────────────────────────────────
const V = "11.1.0";
const BASE = `https://www.gstatic.com/firebasejs/${V}`;

import { initializeApp }
  from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import { getAnalytics }
  from "https://www.gstatic.com/firebasejs/11.1.0/firebase-analytics.js";
import {
  getDatabase, ref, get, set, push, remove, onValue, update
} from "https://www.gstatic.com/firebasejs/11.1.0/firebase-database.js";
import {
  getStorage, ref as sRef,
  uploadString, getDownloadURL, deleteObject
} from "https://www.gstatic.com/firebasejs/11.1.0/firebase-storage.js";

// ── Config ────────────────────────────────────────────────────────────────────
const firebaseConfig = {
  apiKey:            "AIzaSyBfBVw32bCQnIE_xLgZgsjUwhkBnLPHvOI",
  authDomain:        "box0-238b3.firebaseapp.com",
  databaseURL:       "https://box0-238b3-default-rtdb.firebaseio.com",
  projectId:         "box0-238b3",
  storageBucket:     "box0-238b3.firebasestorage.app",
  messagingSenderId: "210150614938",
  appId:             "1:210150614938:web:fcc3c60a8b6506324a3c23",
  measurementId:     "G-6962LDZ4KN"
};

// ── Init ──────────────────────────────────────────────────────────────────────
const app     = initializeApp(firebaseConfig);
const db      = getDatabase(app);
const storage = getStorage(app);

// Init analytics safely (may fail in some environments)
try { getAnalytics(app); } catch (_) {}

// ── Realtime Database helpers ─────────────────────────────────────────────────

/** Read once → returns value or null */
export async function dbGet(path) {
  const snap = await get(ref(db, path));
  return snap.exists() ? snap.val() : null;
}

/** Write / overwrite */
export async function dbSet(path, value) {
  await set(ref(db, path), value);
}

/** Merge-update (partial write) */
export async function dbUpdate(path, value) {
  await update(ref(db, path), value);
}

/** Push new child → returns generated key */
export async function dbPush(path, value) {
  const r = await push(ref(db, path), value);
  return r.key;
}

/** Delete a node */
export async function dbRemove(path) {
  await remove(ref(db, path));
}

/** Realtime listener → returns unsubscribe function */
export function dbListen(path, callback) {
  const unsub = onValue(ref(db, path), snap => {
    callback(snap.exists() ? snap.val() : null);
  });
  return unsub;
}

// ── Storage helpers ───────────────────────────────────────────────────────────

/**
 * Upload a base64 data-URL to Firebase Storage
 * Returns the public HTTPS download URL
 */
export async function storageUpload(storagePath, dataUrl) {
  const storageRef = sRef(storage, storagePath);
  await uploadString(storageRef, dataUrl, "data_url");
  return await getDownloadURL(storageRef);
}

/** Delete a file from Storage (silent fail if not found) */
export async function storageDelete(storagePath) {
  try { await deleteObject(sRef(storage, storagePath)); } catch (_) {}
}
