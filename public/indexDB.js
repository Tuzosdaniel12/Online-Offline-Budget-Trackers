let db;
 //create a new db request for a budget database.
const request = indexedDB.open('budget', 1);

request.onupgradeneeded = e =>{
    //create object pending 
    const db = e.target.result;
    db.createObjectStore('transaction', { autoIncrement: true });
};

request.onsuccess =  e =>{
    db = e.target.result;

    //check if online before reading
    if(navigator.onLine){
        checkDatabase();
    }
}

request.onerror = e =>{
    console.log(`Error ${e.target.errorCode}`);
}

const saveTransaction = data =>{
      // create a transaction on the store db with readwrite access
  const transaction = db.transaction(["transaction"], "readwrite");

  // access your object store
  const store = transaction.objectStore("transaction");

  // add data to your store with add method.
  store.add(data); 
}

function checkDatabase() {
    // open a transaction on your store db
    const transaction = db.transaction(["transaction"], "readwrite");
    // access your pending object store
    const store = transaction.objectStore("transaction");
    // get all records from store and set to a variable
    const getAll = store.getAll();
  
    getAll.onsuccess =  async () => {
        try {
            if (getAll.result.length > 0) {
                const response = await fetch("/api/transaction/bulk", {
                  method: "POST",
                  body: JSON.stringify(getAll.result),
                  headers: {
                    Accept: "application/json, text/plain, */*",
                    "Content-Type": "application/json"
                  }
                })
                response.json()
                
                const transaction = db.transaction(["pending"], "readwrite");
        
                // access your pending object store
                 const store = transaction.objectStore("pending");
          
                // clear all items in your store
                store.clear();
              }
        } catch (error) {
            console.log(`Error ${error}`);
        }
      
    };
  }
  
  // listen for app coming back online
  window.addEventListener("online", checkDatabase);
