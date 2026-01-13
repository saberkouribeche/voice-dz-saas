// js/auth-service.js
import { auth, db } from './firebase-config.js';
import { 
    signInWithPopup, 
    GoogleAuthProvider, 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword, 
    signOut, 
    sendPasswordResetEmail,
    onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { doc, getDoc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const googleProvider = new GoogleAuthProvider();

// ✅ دالة داخلية (لا يتم تصديرها) لإنشاء محفظة للمستخدم الجديد
async function ensureUserHasWallet(user) {
    try {
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (!userDoc.exists()) {
            console.log("Creating wallet for user:", user.email);
            await setDoc(userDocRef, {
                email: user.email,
                credits: 500, // رصيد مجاني
                plan: 'free',
                createdAt: serverTimestamp() 
            });
        }
    } catch (error) {
        console.error("Wallet error:", error);
    }
}

// 1. تسجيل الدخول بجوجل
export async function loginWithGoogle() {
    try {
        const result = await signInWithPopup(auth, googleProvider);
        await ensureUserHasWallet(result.user);
        return { success: true, user: result.user };
    } catch (error) {
        return { success: false, error: error };
    }
}

// 2. تسجيل الدخول بالإيميل
export async function loginWithEmail(email, password) {
    try {
        const result = await signInWithEmailAndPassword(auth, email, password);
        await ensureUserHasWallet(result.user);
        return { success: true, user: result.user };
    } catch (error) {
        return { success: false, error: error };
    }
}

// 3. إنشاء حساب جديد
export async function registerWithEmail(email, password) {
    try {
        const result = await createUserWithEmailAndPassword(auth, email, password);
        await ensureUserHasWallet(result.user);
        return { success: true, user: result.user };
    } catch (error) {
        return { success: false, error: error };
    }
}

// 4. تسجيل الخروج
export function logoutUser() {
    return signOut(auth);
}

// 5. استعادة كلمة المرور
export async function resetUserPassword(email) {
    try {
        await sendPasswordResetEmail(auth, email);
        return { success: true };
    } catch (error) {
        return { success: false, error: error };
    }
}

// 6. مراقب حالة المستخدم (للتوجيه التلقائي)
export function monitorAuthState(callback) {
    onAuthStateChanged(auth, (user) => {
        callback(user);
    });
}