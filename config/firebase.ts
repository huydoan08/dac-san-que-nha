import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics, isSupported } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyAgnfcH8wJX6RvPlS1Ma8YIKUOZxgaaDIM",
  authDomain: "dac-san-que-nha.firebaseapp.com",
  projectId: "dac-san-que-nha",
  storageBucket: "dac-san-que-nha.firebasestorage.app",
  messagingSenderId: "876492366653",
  appId: "1:876492366653:web:0f252d36cb7d6ebdfbdb54",
  measurementId: "G-F5GEX6M0EQ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// Initialize Analytics only on client side
let analytics = null;
if (typeof window !== 'undefined') {
  isSupported().then(yes => yes && (analytics = getAnalytics(app)));
}
export { analytics }; 