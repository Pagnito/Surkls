import idb from "./idb";

const idbPromise = idb.open("surkls", 1, function(db) {
  if (!db.objectStoreNames.contains("surkl-chat-media")) {
    db.createObjectStore("surkl-chat-media", { keyPath: "id" });
  }
  if (!db.objectStoreNames.contains("session-chat-media")) {
    db.createObjectStore("session-chat-media", { keyPath: "id" });
  }
});

export function writeData(st, data) {
  return idbPromise.then(function(db) {
    var tx = db.transaction(st, "readwrite");
    var store = tx.objectStore(st);
    store.put(data);
    return tx.complete;
  });
}
export function readData(st) {
  return idbPromise.then(function(db) {
    var tx = db.transaction(st, "readonly");
    var store = tx.objectStore(st);
    return store.getAll();
  });
}
export function readOne(st, key) {
  return idbPromise.then(function(db) {
    var tx = db.transaction(st, "readonly");
    var store = tx.objectStore(st);
    return store.get(key);
  });
}
export function clearData(st) {
  return idbPromise.then(function(db) {
    var tx = db.transaction(st, "readwrite");
    var store = tx.objectStore(st);
    store.clear();
    return tx.complete;
  });
}
export function deleteOne(st, id) {
  return idbPromise
    .then(function(db) {
      var tx = db.transaction(st, "readwrite");
      var store = tx.objectStore(st);
      store.delete(id);
      return tx.complete;
    })
    .then(function() {
      console.log("item deleted");
    });
}
