let db;
 //create a new db request for a budget database.
const request = indexedDB.open('budget', 1);

request.onupgradeneeded = e =>{
    //create object pending 
    const db = e.target.res;
    db.createObjectStore('pending', { autoIncrement: true });
};

request.onsuccess =  e =>{
    const db = e.target.res;

    //check if online before reading
    if(navigator.onLine){
        checkDatabase();
    }
}
