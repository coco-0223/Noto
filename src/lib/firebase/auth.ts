
import { auth } from '@/lib/firebase';
import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword,
    updateProfile,
    User
} from 'firebase/auth';

export const signUpWithEmailAndPassword = async (email: string, password: string, fullName: string) => {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // Update user profile with full name
        await updateProfile(user, {
            displayName: fullName
        });
        
        // Here you might want to create a document in a 'users' or 'nurses' collection in Firestore
        // For example: await setDoc(doc(db, "nurses", user.uid), { fullName, email });
        
        return user;
    } catch (error) {
        console.error("Error signing up:", error);
        throw error;
    }
};

export const signIn = async (email: string, password: string): Promise<User> => {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        return userCredential.user;
    } catch (error) {
        console.error("Error signing in:", error);
        throw error;
    }
};

export { signInWithEmailAndPassword };
