import {firebaseConfig,firebaseReady} from './firebase.js';
import {initializeApp} from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js';
import {getFirestore,collection,getDocs,addDoc,updateDoc,deleteDoc,doc,serverTimestamp} from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js';
import {getAuth,signInWithEmailAndPassword,signOut,onAuthStateChanged} from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js';
import {getStorage,ref,uploadBytes,getDownloadURL} from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-storage.js';
let db,auth,storage;if(firebaseReady){const app=initializeApp(firebaseConfig);db=getFirestore(app);auth=getAuth(app);storage=getStorage(app)}
const requireConfig=()=>{if(!firebaseReady)throw Error('Спочатку заповніть firebase.js даними вашого Firebase проєкту')};
export const authState=fn=>{requireConfig();return onAuthStateChanged(auth,fn)};
export const login=(email,password)=>{requireConfig();return signInWithEmailAndPassword(auth,email,password)};
export const logout=()=>signOut(auth);
export async function getProducts(){requireConfig();const snap=await getDocs(collection(db,'products'));return snap.docs.map(d=>({id:d.id,...d.data()}))}
export async function saveProduct(product,id){requireConfig();if(id)return updateDoc(doc(db,'products',id),product);return addDoc(collection(db,'products'),{...product,createdAt:serverTimestamp()})}
export async function removeProduct(id){requireConfig();return deleteDoc(doc(db,'products',id))}
export async function placeOrder(order){requireConfig();return addDoc(collection(db,'orders'),{...order,createdAt:serverTimestamp()})}
export async function getOrders(){requireConfig();const snap=await getDocs(collection(db,'orders'));return snap.docs.map(d=>({id:d.id,...d.data()}))}
export async function uploadPhotos(files){requireConfig();const urls=[];for(const file of files){if(!file.type.startsWith('image/'))throw Error('Дозволені тільки зображення');if(file.size>8*1024*1024)throw Error('Максимум 8 МБ на фото');const name=`products/${Date.now()}-${crypto.randomUUID()}-${file.name.replace(/[^a-zA-Z0-9._-]/g,'_')}`;const r=ref(storage,name);await uploadBytes(r,file,{contentType:file.type});urls.push(await getDownloadURL(r))}return urls}
