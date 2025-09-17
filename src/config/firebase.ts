// Configuração do Firebase para o app mobile
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyB-wj1YpoKy_v5f1v1wYsbweIriAVWgRMg',
  authDomain: 'qrcodemaster-8e611.firebaseapp.com',
  projectId: 'qrcodemaster-8e611',
  storageBucket: 'qrcodemaster-8e611.firebasestorage.app',
  messagingSenderId: '528133505282',
  appId: '1:528133505282:web:db7db56d63077343ef021b',
  measurementId: 'G-MEQSCMHPW7'
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export default app;
