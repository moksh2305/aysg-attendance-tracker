import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported as isAnalyticsSupported } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyABn8M6JwLfAgUtOMltYfWedc2BkTbz9_s",
  authDomain: "aysg-attendance-tracker.firebaseapp.com",
  projectId: "aysg-attendance-tracker",
  storageBucket: "aysg-attendance-tracker.firebasestorage.app",
  messagingSenderId: "644642299904",
  appId: "1:644642299904:web:f9ffdce7f43f1b667ef8e5",
  measurementId: "G-L6QHCL9JFB",
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

isAnalyticsSupported()
  .then((supported) => {
    if (supported) getAnalytics(app);
  })
  .catch(() => {
    // Analytics is optional and can be blocked by browser privacy settings.
  });
