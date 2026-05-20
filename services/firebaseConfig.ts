import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyDFIdqO8ZicVwZxxxd59cNVbIRS7YHpG28',
  authDomain: 'erptafe.firebaseapp.com',
  projectId: 'erptafe',
  storageBucket: 'erptafe.firebasestorage.app',
  messagingSenderId: '1056071220902',
  appId: '1:1056071220902:web:b63d9ec3ef162296297e67',
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const auth = getAuth(app);
