
import { auth, db } from '@/lib/firebase';
import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword as firebaseSignIn,
    signOut as firebaseSignOut,
    updateProfile,
    User
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { NURSES } from '../constants';

export const signUpWithEmailAndPassword = async (email: string, password: string, fullName: string) => {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // Update user profile with full name
        await updateProfile(user, {
            displayName: fullName
        });
        
        // Create a nurse document in Firestore
        const nurseRef = doc(db, NURSES, user.uid);
        await setDoc(nurseRef, {
            fullName,
            email,
            uid: user.uid
        });
        
        return user;
    } catch (error) {
        console.error("Error signing up:", error);
        throw error;
    }
};

export const signInWithEmailAndPassword = async (email: string, password: string): Promise<User> => {
    try {
        const userCredential = await firebaseSignIn(auth, email, password);
        return userCredential.user;
    } catch (error) {
        console.error("Error signing in:", error);
        throw error;
    }
};

export const signOut = async (): Promise<void> => {
    try {
        await firebaseSignOut(auth);
    } catch (error) {
        console.error("Error signing out:", error);
        throw error;
    }
}
