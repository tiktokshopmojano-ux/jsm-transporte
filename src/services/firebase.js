// src/services/firebase.js
// Configuração centralizada do Firebase para o sistema JSM Transporte / LogiTrack SP

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyDZRkR4RQ9QdFAYRbqS4NpoeTAARNabN14',
  authDomain: 'jsm-transporte.firebaseapp.com',
  projectId: 'jsm-transporte',
  storageBucket: 'jsm-transporte.firebasestorage.app',
  messagingSenderId: '58453115039',
  appId: '1:58453115039:web:d8ba25c242c82ffa8462aa',
  measurementId: 'G-VE1TF5XTNC'
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
