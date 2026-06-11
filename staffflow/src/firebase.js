import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey:            "AIzaSyChkKpxxFuE6BuGeposkAV78xp6Cu175t0",
  authDomain:        "staffflow-e5cd2.firebaseapp.com",
  projectId:         "staffflow-e5cd2",
  storageBucket:     "staffflow-e5cd2.firebasestorage.app",
  messagingSenderId: "501828813501",
  appId:             "1:501828813501:web:9e6b1336ccaf41b634edd4",
  measurementId:     "G-ZHWPBR5EMY",
};

const app            = initializeApp(firebaseConfig);
export const auth    = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Optional: force account selection every time
googleProvider.setCustomParameters({ prompt: 'select_account' });

export default app;
