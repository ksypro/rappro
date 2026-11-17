let dbPromise;
function db(){return dbPromise??=new Promise((resolve,reject)=>{const r=indexedDB.open('rap-flow-gym',1);r.onupgradeneeded=()=>r.result.createObjectStore('sessions',{keyPath:'id'});r.onsuccess=()=>resolve(r.result);r.onerror=()=>{dbPromise=null;reject(r.error);};});}
async function transaction(mode,op){const d=await db();return new Promise((resolve,reject)=>{const t=d.transaction('sessions',mode);let result;const request=op(t.objectStore('sessions'));request.onsuccess=()=>result=request.result;t.oncomplete=()=>resolve(result);t.onerror=()=>reject(t.error);t.onabort=()=>reject(t.error||Error('Storage aborted'));});}
export const saveSession=s=>transaction('readwrite',store=>store.put(s));
export const deleteSession=id=>transaction('readwrite',store=>store.delete(id));
export const listSessions=()=>transaction('readonly',store=>store.getAll());
