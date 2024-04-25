import { openDB } from 'idb';

const db = await openDB('gmg-vue', 1, {
  upgrade(db, oldVersion, newVersion, transaction, event) {
    // Create an object store named "temperatures"
    if (!db.objectStoreNames.contains('temperatures')) {
      db.createObjectStore('temperatures', { autoIncrement: true });
    }
  },
  blocked(currentVersion, blockedVersion, event) {
    // …
  },
  blocking(currentVersion, blockedVersion, event) {
    // …
  },
  terminated() {
    // …
  },
});



async function addData(data) {
  return await db.add('temperatures', data);
}

async function readAllData(success, error) {
  return await db.getAll('temperatures')
}

export { addData, readAllData };