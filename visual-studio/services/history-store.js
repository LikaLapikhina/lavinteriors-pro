// LAV Visual Studio — local project history (IndexedDB).
// Keeps source photos and generated results in this browser so they survive reloads.
// Will be replaced/synced by server storage once accounts exist.

const DB_NAME = "lav-visual-studio";
const STORE = "projects";
const VERSION = 1;

function open() {
  return new Promise((resolve, reject) => {
    if (!("indexedDB" in globalThis)) { reject(new Error("indexeddb_unavailable")); return; }
    const request = indexedDB.open(DB_NAME, VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: "id" }).createIndex("updatedAt", "updatedAt");
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function run(mode, fn) {
  const db = await open();
  return await new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, mode);
    const store = tx.objectStore(STORE);
    let result;
    Promise.resolve(fn(store)).then((value) => { result = value; });
    tx.oncomplete = () => { db.close(); resolve(result); };
    tx.onerror = () => { db.close(); reject(tx.error); };
    tx.onabort = () => { db.close(); reject(tx.error); };
  });
}

const req = (request) => new Promise((resolve, reject) => {
  request.onsuccess = () => resolve(request.result);
  request.onerror = () => reject(request.error);
});

export const HistoryStore = {
  async list() {
    try {
      const items = await run("readonly", (store) => req(store.getAll()));
      return (items || []).sort((a, b) => (b.updatedAt || "").localeCompare(a.updatedAt || ""));
    } catch { return []; }
  },
  async get(id) {
    try { return await run("readonly", (store) => req(store.get(id))); } catch { return null; }
  },
  async put(project) {
    try { await run("readwrite", (store) => req(store.put({ ...project, updatedAt: new Date().toISOString() }))); return true; } catch { return false; }
  },
  async remove(id) {
    try { await run("readwrite", (store) => req(store.delete(id))); return true; } catch { return false; }
  }
};

export const newId = (prefix = "p") => `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
