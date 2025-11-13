import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updateProfile,
  User,
  AuthError,
  signInWithPhoneNumber,
  ConfirmationResult,
  RecaptchaVerifier,
  signInWithCredential,
  PhoneAuthProvider,
  GoogleAuthProvider,
  signInWithPopup,
  linkWithCredential,
  PhoneAuthCredential,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink
} from 'firebase/auth';
import { auth } from '@/lib/config/firebase';

export interface FirebaseUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

export class FirebaseAuthService {
  async signIn(email: string, password: string): Promise<FirebaseUser> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return this.mapFirebaseUser(userCredential.user);
    } catch (error) {
      throw this.handleAuthError(error as AuthError);
    }
  }

  async signUp(email: string, password: string, displayName?: string): Promise<FirebaseUser> {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update display name if provided
      if (displayName && userCredential.user) {
        await updateProfile(userCredential.user, { displayName });
      }
      
      return this.mapFirebaseUser(userCredential.user);
    } catch (error) {
      throw this.handleAuthError(error as AuthError);
    }
  }

  async signOut(): Promise<void> {
    try {
      await signOut(auth);
    } catch (error) {
      throw this.handleAuthError(error as AuthError);
    }
  }

  onAuthStateChanged(callback: (user: FirebaseUser | null) => void): () => void {
    return onAuthStateChanged(auth, (user) => {
      callback(user ? this.mapFirebaseUser(user) : null);
    });
  }

  getCurrentUser(): FirebaseUser | null {
    const user = auth.currentUser;
    return user ? this.mapFirebaseUser(user) : null;
  }

  async signInWithPhone(phoneNumber: string, appVerifier: RecaptchaVerifier): Promise<ConfirmationResult> {
    try {
      return await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
    } catch (error) {
      throw this.handleAuthError(error as AuthError);
    }
  }

  async verifyPhoneOTP(confirmationResult: ConfirmationResult, otp: string): Promise<FirebaseUser> {
    try {
      const userCredential = await confirmationResult.confirm(otp);
      return this.mapFirebaseUser(userCredential.user);
    } catch (error) {
      throw this.handleAuthError(error as AuthError);
    }
  }

  async signInWithGoogle(): Promise<FirebaseUser> {
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      return this.mapFirebaseUser(userCredential.user);
    } catch (error) {
      throw this.handleAuthError(error as AuthError);
    }
  }

  async signUpWithPhone(phoneNumber: string, appVerifier: RecaptchaVerifier): Promise<ConfirmationResult> {
    try {
      return await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
    } catch (error) {
      throw this.handleAuthError(error as AuthError);
    }
  }

  async verifyPhoneOTPAndSignUp(confirmationResult: ConfirmationResult, otp: string, displayName: string): Promise<FirebaseUser> {
    try {
      const userCredential = await confirmationResult.confirm(otp);
      if (userCredential.user) {
        await updateProfile(userCredential.user, { displayName });
      }
      return this.mapFirebaseUser(userCredential.user);
    } catch (error) {
      throw this.handleAuthError(error as AuthError);
    }
  }

  async sendSignInLinkToEmail(email: string): Promise<void> {
    try {
      const actionCodeSettings = {
        // URL you want to redirect back to. The domain (www.example.com) for this
        // URL must be in the authorized domains list in the Firebase Console.
        url: `${window.location.origin}/auth/email-callback`,
        // This must be true.
        handleCodeInApp: true,
      };
      
      await sendSignInLinkToEmail(auth, email, actionCodeSettings);
      
      // Save the email to localStorage so we can use it after the user clicks the link
      window.localStorage.setItem('emailForSignIn', email);
    } catch (error) {
      throw this.handleAuthError(error as AuthError);
    }
  }

  isSignInWithEmailLink(emailLink: string): boolean {
    return isSignInWithEmailLink(auth, emailLink);
  }

  async signInWithEmailLink(email: string, emailLink: string): Promise<FirebaseUser> {
    try {
      const userCredential = await signInWithEmailLink(auth, email, emailLink);
      
      // Clear the email from localStorage
      window.localStorage.removeItem('emailForSignIn');
      
      return this.mapFirebaseUser(userCredential.user);
    } catch (error) {
      throw this.handleAuthError(error as AuthError);
    }
  }

  createRecaptchaVerifier(elementId: string, size: 'normal' | 'invisible' = 'normal'): RecaptchaVerifier {
    return new RecaptchaVerifier(auth, elementId, {
      size: size,
      callback: () => {
        console.log('reCAPTCHA verified');
      },
      'expired-callback': () => {
        console.log('reCAPTCHA expired');
      },
    });
  }

  private mapFirebaseUser(user: User): FirebaseUser {
    return {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
    };
  }

  private handleAuthError(error: AuthError): Error {
    let message = 'An authentication error occurred';
    
    switch (error.code) {
      case 'auth/user-not-found':
        message = 'No user found with this email address';
        break;
      case 'auth/wrong-password':
        message = 'Incorrect password';
        break;
      case 'auth/email-already-in-use':
        message = 'An account with this email already exists';
        break;
      case 'auth/weak-password':
        message = 'Password should be at least 6 characters';
        break;
      case 'auth/invalid-email':
        message = 'Invalid email address';
        break;
      case 'auth/user-disabled':
        message = 'This account has been disabled';
        break;
      case 'auth/too-many-requests':
        message = 'Too many failed attempts. Please try again later';
        break;
      case 'auth/network-request-failed':
        message = 'Network error. Please check your connection';
        break;
      default:
        message = error.message || message;
    }
    
    return new Error(message);
  }
}

// Create a singleton instance
export const firebaseAuthService = new FirebaseAuthService();
