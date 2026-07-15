import type { CreativeRecord } from "@start-x-work/mos-creative";

// Minimal IndexedDB wrapper. All creative data lives here, in the user's browser.
const DB_NAME = "mos-creative";
const DB_VERSION = 1;
const STORE = "records";

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: "id" });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function tx<T>(
  mode: IDBTransactionMode,
  fn: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  return openDb().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const t = db.transaction(STORE, mode);
        const req = fn(t.objectStore(STORE));
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      }),
  );
}

export function putRecord(record: CreativeRecord): Promise<IDBValidKey> {
  return tx("readwrite", (s) => s.put(record));
}

export function getRecord(id: string): Promise<CreativeRecord | undefined> {
  return tx<CreativeRecord | undefined>("readonly", (s) => s.get(id));
}

export function listRecords(): Promise<CreativeRecord[]> {
  return tx<CreativeRecord[]>("readonly", (s) => s.getAll());
}

export function deleteRecord(id: string): Promise<undefined> {
  return tx("readwrite", (s) => s.delete(id));
}

export async function importRecords(records: CreativeRecord[]): Promise<void> {
  for (const r of records) {
    await putRecord(r);
  }
}
