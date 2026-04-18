// ─── Firebase Config & Init ───────────────────────────────────────────────────
import { initializeApp }           from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAnalytics }            from "https://www.gstatic.com/firebasejs/10.12.0/firebase-analytics.js";
import { getDatabase, ref, get,
         set, push, remove,
         onValue }                 from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";
import { getStorage, ref as sRef,
         uploadString,
         getDownloadURL,
         deleteObject }            from "https://www.gstatic.com/firebasejs/10.12.0/firebase-storage.js";

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

const app      = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db       = getDatabase(app);
const storage  = getStorage(app);

// ─── Realtime DB helpers ──────────────────────────────────────────────────────

/** Read once */
export async function dbGet(path) {
  const snap = await get(ref(db, path));
  return snap.exists() ? snap.val() : null;
}

/** Overwrite value */
export async function dbSet(path, value) {
  await set(ref(db, path), value);
}

/** Push new child, returns key */
export async function dbPush(path, value) {
  const r = await push(ref(db, path), value);
  return r.key;
}

/** Delete node */
export async function dbRemove(path) {
  await remove(ref(db, path));
}

/** Subscribe to realtime changes */
export function dbListen(path, callback) {
  return onValue(ref(db, path), snap => callback(snap.exists() ? snap.val() : null));
}

// ─── Storage helpers ──────────────────────────────────────────────────────────

/** Upload base64 data URL → returns public download URL */
export async function storageUpload(path, dataUrl) {
  const storageRef = sRef(storage, path);
  const format     = dataUrl.startsWith('data:image/png') ? 'data_url' : 'data_url';
  await uploadString(storageRef, dataUrl, format);
  return await getDownloadURL(storageRef);
}

/** Delete file from storage */
export async function storageDelete(path) {
  try { await deleteObject(sRef(storage, path)); } catch (_) {}
}
