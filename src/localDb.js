import { openDB } from 'idb';

const dbName    = 'gmg-vue';
const storeName = 'temperatures';

const db = await openDB(dbName, 1, {
  upgrade(db, oldVersion, newVersion, transaction, event) {
    if (!db.objectStoreNames.contains(storeName)) {
      db.createObjectStore(storeName, { autoIncrement: true });
    }
  }
});



async function addData(data) {
  return await db.add(storeName, data);
}

async function readAllData() {
  return await db.getAll(storeName)
}

async function clearAllData() {
  const tx    = db.transaction(storeName, 'readwrite');
  const store = tx.objectStore(storeName);
  await store.clear();
  return await tx.done;
}

export { addData, readAllData, clearAllData};