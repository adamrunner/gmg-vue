// Open a connection to the IndexedDB database
let openRequest = indexedDB.open("myDatabase", 1);

// If the database doesn't exist, create it
openRequest.onupgradeneeded = function(e) {
  let db = e.target.result;
  // Create an object store named "temperatures"
  if (!db.objectStoreNames.contains('temperatures')) {
    db.createObjectStore('temperatures', { autoIncrement: true });
  }
};

openRequest.onerror = function(e) {
  console.error("Error opening db", e);
};
let db;
openRequest.onsuccess = function(e) {
  db = e.target.result;
  console.log("DB opened");
};

// Function to add data to the "temperatures" store
function addData(data) {
  let tx = db.transaction(['temperatures'], 'readwrite');
  let store = tx.objectStore('temperatures');
  store.add(data);
}

// Function to read all data from the "temperatures" store
function readAllData() {
  let tx = db.transaction(['temperatures'], 'readonly');
  let store = tx.objectStore('temperatures');
  let request = store.getAll();

  request.onsuccess = function(e) {
    let result = e.target.result;
    console.log(result);
  };
}

export { addData, readAllData };