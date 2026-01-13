// js/firebase-config.js

// 1. استيراد المكتبات مرة واحدة فقط هنا
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, setPersistence, browserLocalPersistence } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";

// 2. إعدادات مشروعك (مأخوذة من ملفاتك الحالية)
// 2. إعدادات مشروعك
// ⚠️ هام: تأكد من تقييد هذا المفتاح في Google Cloud Console ليعمل فقط على نطاق موقعك
// راجع: api_security_guide.md
const firebaseConfig = {
    apiKey: "AIzaSyA2YVbGrW-9OAvNv__aAxlJnQNQ8OAHN0o",
    authDomain: "qasaba-cc03c.firebaseapp.com",
    projectId: "qasaba-cc03c",
    storageBucket: "qasaba-cc03c.firebasestorage.app",
    messagingSenderId: "744912812463",
    appId: "1:744912812463:web:94ee8343989013f606575a"
};

// 3. تهيئة التطبيق
const app = initializeApp(firebaseConfig);

// 4. تصدير الأدوات لنستخدمها في الملفات الأخرى
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// 5. ضبط استمرار الجلسة تلقائياً (لحل مشكلة الخروج المفاجئ)
setPersistence(auth, browserLocalPersistence).catch((error) => {
    console.error("خطأ في استمرار الجلسة:", error);
});

console.log("✅ Firebase Initialized Successfully");