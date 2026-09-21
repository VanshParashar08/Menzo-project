// ============================================================
// MENZO UNIFIED AUTHENTICATION SERVICE (FIREBASE AUTH)
// Provides complete email/password registration, login,
// Google OAuth, password reset, and session state sync.
// ============================================================

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut,
  updateProfile,
  sendPasswordResetEmail,
  onAuthStateChanged
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, googleProvider, db, isFirebaseConfigured } from './firebase.js';

// Local storage session keys
const STORAGE_KEYS = {
  USER_ID: 'menzo_user_id',
  EMAIL: 'menzo_email',
  RESTAURANT_NAME: 'menzo_restaurant_name',
  OWNER_NAME: 'menzo_owner_name',
  PHONE: 'menzo_phone',
  AUTH_PROVIDER: 'menzo_auth_provider',
  AVATAR: 'menzo_user_avatar'
};

/**
 * Friendly error mapper for Firebase error codes
 */
export function mapAuthError(error) {
  if (!error) return 'An unexpected error occurred. Please try again.';
  const code = error.code || '';
  const message = error.message || '';

  switch (code) {
    case 'auth/email-already-in-use':
      return 'This email address is already registered. Please log in instead.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters long.';
    case 'auth/user-not-found':
      return 'No account found with this email. Please sign up first.';
    case 'auth/wrong-password':
      return 'Incorrect password. Please double check and try again.';
    case 'auth/invalid-credential':
      return 'Invalid email or password. Please verify your credentials.';
    case 'auth/popup-closed-by-user':
      return 'Google sign-in popup was closed before completing.';
    case 'auth/popup-blocked':
      return 'Sign-in popup was blocked by your browser. Please allow popups for this site.';
    case 'auth/operation-not-allowed':
      return 'Google sign-in is being enabled for your Firebase project. Please try again or use email.';
    case 'auth/unauthorized-domain':
      return 'Domain not authorized in Firebase. Please make sure you are accessing via http://localhost:5173.';
    case 'auth/network-request-failed':
      return 'Network connection error. Please check your internet connection.';
    case 'auth/too-many-requests':
      return 'Too many unsuccessful attempts. Access temporarily disabled. Please reset password or try again later.';
    case 'auth/missing-credentials':
      return 'Firebase credentials not found in .env. To open the real Google account chooser popup, please enter your Firebase Web API Key and Project ID in .env.';
    case 'auth/api-key-not-valid':
    case 'auth/invalid-api-key':
      return 'Invalid Firebase API Key. Please verify your VITE_FIREBASE_API_KEY in the .env file.';
    default:
      if (message.includes('API key')) {
        return 'Firebase API key is invalid or not yet configured. Please check your .env file.';
      }
      return message.replace('Firebase: ', '') || 'Authentication failed. Please try again.';
  }
}

/**
 * Sync active user data to localStorage
 */
function syncUserToStorage(user, extra = {}) {
  if (!user) return;
  try {
    localStorage.setItem(STORAGE_KEYS.USER_ID, user.uid);
    if (user.email) localStorage.setItem(STORAGE_KEYS.EMAIL, user.email);
    if (user.photoURL) localStorage.setItem(STORAGE_KEYS.AVATAR, user.photoURL);

    // Compute friendly user names
    const emailPrefix = user.email ? user.email.split('@')[0] : 'Restaurant';
    const cleanEmailName = emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1);

    const resolvedOwner = extra.ownerName || user.displayName || cleanEmailName;
    localStorage.setItem(STORAGE_KEYS.OWNER_NAME, resolvedOwner);

    const resolvedRest = extra.restaurantName || `${resolvedOwner}'s Restaurant`;
    localStorage.setItem(STORAGE_KEYS.RESTAURANT_NAME, resolvedRest);

    if (extra.phoneNumber) {
      localStorage.setItem(STORAGE_KEYS.PHONE, extra.phoneNumber);
    }

    if (extra.provider) {
      localStorage.setItem(STORAGE_KEYS.AUTH_PROVIDER, extra.provider);
    }
  } catch (err) {
    console.warn('[AuthService] Error syncing user to localStorage:', err);
  }
}

/**
 * Save user profile to Cloud Firestore (non-blocking in background)
 */
async function saveUserProfileToFirestore(uid, data) {
  if (!db || !isFirebaseConfigured()) return;
  try {
    const userDocRef = doc(db, 'users', uid);
    await setDoc(userDocRef, {
      ...data,
      updatedAt: serverTimestamp()
    }, { merge: true });
  } catch (err) {
    console.warn('[AuthService] Firestore profile save (non-blocking):', err);
  }
}

/**
 * Load user profile from Cloud Firestore (non-blocking)
 */
async function loadUserProfileFromFirestore(uid) {
  if (!db || !isFirebaseConfigured()) return null;
  try {
    const userDocRef = doc(db, 'users', uid);
    const snap = await getDoc(userDocRef);
    if (snap.exists()) {
      return snap.data();
    }
  } catch (err) {
    console.warn('[AuthService] Firestore profile load (non-blocking):', err);
  }
  return null;
}

/**
 * Sign Up with Email and Password
 */
export async function signUpWithEmail(email, password, metadata = {}) {
  if (!isFirebaseConfigured()) {
    return handleFallbackSignUp(email, password, metadata);
  }

  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  // Set displayName to Owner Name or Restaurant Name
  const displayName = metadata.ownerName || metadata.restaurantName || '';
  if (displayName) {
    try {
      await updateProfile(user, { displayName });
    } catch (err) {
      console.warn('[AuthService] Could not set displayName:', err);
    }
  }

  syncUserToStorage(user, { ...metadata, provider: 'password' });

  // Save profile document in Firestore (non-blocking)
  saveUserProfileToFirestore(user.uid, {
    uid: user.uid,
    email: user.email,
    restaurantName: metadata.restaurantName || '',
    ownerName: metadata.ownerName || '',
    phoneNumber: metadata.phoneNumber || '',
    createdAt: serverTimestamp()
  }).catch(() => {});

  return user;
}

/**
 * Sign In with Email and Password
 */
export async function signInWithEmail(email, password) {
  if (!isFirebaseConfigured()) {
    return handleFallbackSignIn(email, password);
  }

  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  // Immediately store session so user is authenticated without delay
  syncUserToStorage(user, { provider: 'password' });

  // Enrich with Firestore profile in background if available
  loadUserProfileFromFirestore(user.uid).then(profile => {
    if (profile) {
      syncUserToStorage(user, {
        provider: 'password',
        restaurantName: profile.restaurantName,
        ownerName: profile.ownerName,
        phoneNumber: profile.phoneNumber
      });
    }
  }).catch(() => {});

  return user;
}

/**
 * Sign In with Google Popup (instant response, non-blocking firestore sync)
 */
export async function signInWithGoogle(timeoutMs = 5000) {
  if (!isFirebaseConfigured()) {
    throw new Error('Firebase credentials not configured in .env');
  }

  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => {
      const err = new Error('Google sign-in popup was closed or timed out. Please try again or use full-page redirect.');
      err.code = 'auth/popup-closed-by-user';
      reject(err);
    }, timeoutMs);
  });

  try {
    const authAction = (async () => {
      const userCredential = await signInWithPopup(auth, googleProvider);
      const user = userCredential.user;
      
      // Immediately sync to storage so auth state is ready immediately
      syncUserToStorage(user, {
        ownerName: user.displayName,
        restaurantName: user.displayName ? `${user.displayName}'s Restaurant` : 'My Restaurant',
        provider: 'google'
      });

      // Background non-blocking profile sync
      loadUserProfileFromFirestore(user.uid).then(profile => {
        if (!profile) {
          saveUserProfileToFirestore(user.uid, {
            uid: user.uid,
            email: user.email,
            ownerName: user.displayName || '',
            restaurantName: user.displayName ? `${user.displayName}'s Restaurant` : 'My Restaurant',
            createdAt: serverTimestamp()
          }).catch(() => {});
        } else {
          syncUserToStorage(user, {
            ownerName: profile.ownerName || user.displayName,
            restaurantName: profile.restaurantName || `${user.displayName || 'My'}'s Restaurant`,
            phoneNumber: profile.phoneNumber,
            provider: 'google'
          });
        }
      }).catch(() => {});

      return user;
    })();

    return await Promise.race([authAction, timeoutPromise]);
  } catch (err) {
    console.error('[GoogleAuth] Firebase popup error:', err.code, err.message);
    throw err;
  }
}

/**
 * Sign In with Google Redirect (Bypasses popup blockers)
 */
export async function signInWithGoogleRedirect() {
  if (!isFirebaseConfigured()) {
    throw new Error('Firebase credentials not configured in .env');
  }
  return await signInWithRedirect(auth, googleProvider);
}

/**
 * Check for result after returning from signInWithRedirect
 */
export async function checkRedirectResult() {
  if (!auth || !isFirebaseConfigured()) return null;
  try {
    const result = await getRedirectResult(auth);
    if (result && result.user) {
      const user = result.user;
      syncUserToStorage(user, {
        ownerName: user.displayName,
        restaurantName: user.displayName ? `${user.displayName}'s Restaurant` : 'My Restaurant',
        provider: 'google'
      });

      loadUserProfileFromFirestore(user.uid).then(profile => {
        if (profile) {
          syncUserToStorage(user, {
            ownerName: profile.ownerName || user.displayName,
            restaurantName: profile.restaurantName,
            phoneNumber: profile.phoneNumber,
            provider: 'google'
          });
        } else {
          saveUserProfileToFirestore(user.uid, {
            uid: user.uid,
            email: user.email,
            ownerName: user.displayName || '',
            restaurantName: user.displayName ? `${user.displayName}'s Restaurant` : 'My Restaurant',
            createdAt: serverTimestamp()
          }).catch(() => {});
        }
      }).catch(() => {});

      return user;
    }
  } catch (err) {
    console.error('[GoogleAuth] Redirect result error:', err);
    throw err;
  }
  return null;
}

/**
 * Send Password Reset Email
 */
export async function sendPasswordReset(email) {
  if (!isFirebaseConfigured()) {
    throw new Error('Firebase configuration missing. Please add credentials to .env file.');
  }
  return await sendPasswordResetEmail(auth, email);
}

/**
 * Sign Out
 */
export async function logoutUser() {
  try {
    if (auth && isFirebaseConfigured()) {
      await signOut(auth);
    }
  } catch (err) {
    console.warn('[AuthService] SignOut error:', err);
  } finally {
    // Clear all auth session data from localStorage
    localStorage.removeItem(STORAGE_KEYS.USER_ID);
    localStorage.removeItem(STORAGE_KEYS.EMAIL);
    localStorage.removeItem(STORAGE_KEYS.RESTAURANT_NAME);
    localStorage.removeItem(STORAGE_KEYS.OWNER_NAME);
    localStorage.removeItem(STORAGE_KEYS.PHONE);
    localStorage.removeItem(STORAGE_KEYS.AUTH_PROVIDER);
    localStorage.removeItem(STORAGE_KEYS.AVATAR);
  }
}

/**
 * Get current session user
 */
export function getCurrentUser() {
  if (auth && auth.currentUser) {
    return auth.currentUser;
  }
  const uid = localStorage.getItem(STORAGE_KEYS.USER_ID);
  if (uid) {
    return {
      uid,
      email: localStorage.getItem(STORAGE_KEYS.EMAIL),
      displayName: localStorage.getItem(STORAGE_KEYS.OWNER_NAME),
      photoURL: localStorage.getItem(STORAGE_KEYS.AVATAR)
    };
  }
  return null;
}

/**
 * Listen to auth state changes
 */
export function onAuthChange(callback) {
  if (!auth) {
    callback(getCurrentUser());
    return () => {};
  }
  return onAuthStateChanged(auth, (user) => {
    if (user) {
      syncUserToStorage(user);
    }
    callback(user);
  });
}

// ============================================================
// LOCAL SIMULATED FALLBACK (When .env keys are not yet supplied)
// Allows development & testing without hard-crashing.
// ============================================================
const LOCAL_USERS_KEY = 'menzo_local_registered_users';

function getLocalUsers() {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_USERS_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveLocalUsers(users) {
  try {
    localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));
  } catch (e) {}
}

async function handleFallbackSignUp(email, password, metadata) {
  await new Promise(r => setTimeout(r, 400));
  const users = getLocalUsers();
  if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
    const err = new Error('This email is already registered.');
    err.code = 'auth/email-already-in-use';
    throw err;
  }

  const newUser = {
    uid: 'local_' + Math.random().toString(36).substr(2, 9),
    email,
    password, // Mock storage for local demo
    displayName: metadata.ownerName || metadata.restaurantName || 'Restaurant Owner',
    restaurantName: metadata.restaurantName || 'My Restaurant',
    phoneNumber: metadata.phoneNumber || '',
    createdAt: new Date().toISOString()
  };

  users.push(newUser);
  saveLocalUsers(users);

  syncUserToStorage(newUser, { ...metadata, provider: 'password' });
  return newUser;
}

async function handleFallbackSignIn(email, password) {
  await new Promise(r => setTimeout(r, 400));
  const users = getLocalUsers();
  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

  if (!user) {
    const err = new Error('No account found with this email.');
    err.code = 'auth/user-not-found';
    throw err;
  }

  if (user.password !== password) {
    const err = new Error('Incorrect password.');
    err.code = 'auth/wrong-password';
    throw err;
  }

  syncUserToStorage(user, {
    restaurantName: user.restaurantName,
    ownerName: user.displayName,
    phoneNumber: user.phoneNumber,
    provider: 'password'
  });
  return user;
}

/**
 * Interactive Google Account Selector Modal
 * Pops up when clicking "Continue with Google"
 */
export function showGoogleAccountChooserModal() {
  return new Promise((resolve, reject) => {
    // Clean up any existing overlay
    const existing = document.getElementById('google-account-chooser-overlay');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.id = 'google-account-chooser-overlay';
    overlay.style.cssText = `
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.45);
      backdrop-filter: blur(4px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 999999;
      animation: gFadeIn 0.15s ease-out;
      padding: 16px;
    `;

    overlay.innerHTML = `
      <style>
        @keyframes gFadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes gPopUp { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        .g-acc-row {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 12px 14px;
          border-radius: 10px;
          border: 1px solid transparent;
          background: transparent;
          cursor: pointer;
          width: 100%;
          text-align: left;
          font-family: inherit;
          transition: background-color 0.15s ease, border-color 0.15s ease;
        }
        .g-acc-row:hover {
          background-color: #F1F3F4;
          border-color: #E8EAED;
        }
        .g-acc-avatar {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          font-weight: 700;
          color: #FFFFFF;
          flex-shrink: 0;
        }
        .g-acc-name {
          font-size: 14.5px;
          font-weight: 600;
          color: #202124;
          margin-bottom: 2px;
        }
        .g-acc-email {
          font-size: 12.5px;
          color: #5F6368;
        }
      </style>

      <div style="
        background: #FFFFFF;
        border-radius: 24px;
        width: 100%;
        max-width: 420px;
        padding: 32px 32px 24px;
        box-shadow: 0 24px 60px rgba(0,0,0,0.22);
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
        position: relative;
        animation: gPopUp 0.2s cubic-bezier(0.16, 1, 0.3, 1);
      ">
        <!-- Close Button -->
        <button type="button" id="g-modal-close-btn" style="
          position: absolute;
          top: 18px;
          right: 18px;
          background: none;
          border: none;
          cursor: pointer;
          font-size: 24px;
          line-height: 1;
          color: #5F6368;
          padding: 4px 8px;
          border-radius: 50%;
        " title="Close">&times;</button>

        <!-- Google Header -->
        <div style="text-align: center; margin-bottom: 22px;">
          <svg width="28" height="28" viewBox="0 0 24 24" style="margin-bottom: 10px;">
            <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z"/>
            <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.15C3.25 21.37 7.31 24 12 24Z"/>
            <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.14-1.55.38-2.27V6.58H1.26C.46 8.16 0 9.94 0 12s.46 3.84 1.26 5.42l4.02-3.15Z"/>
            <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.25 2.63 1.26 6.58l4.02 3.15c.95-2.83 3.6-4.98 6.72-4.98Z"/>
          </svg>
          <h2 style="font-size: 21px; font-weight: 600; color: #202124; margin: 0 0 4px;">Sign in with Google</h2>
          <p style="font-size: 13.5px; color: #5F6368; margin: 0;">Choose an email to continue to <span style="font-weight: 700; color: #F4512A;">Menzo</span></p>
        </div>

        <!-- Account List -->
        <div style="display: flex; flex-direction: column; gap: 4px; margin-bottom: 16px; border: 1px solid #DADCE0; border-radius: 14px; padding: 6px;">
          <!-- Account 1 -->
          <button type="button" class="g-acc-row" data-name="Vansh" data-email="vansh.parashar@gmail.com">
            <div class="g-acc-avatar" style="background: #1A73E8;">V</div>
            <div>
              <div class="g-acc-name">Vansh</div>
              <div class="g-acc-email">vansh.parashar@gmail.com</div>
            </div>
          </button>

          <div style="height: 1px; background: #E8EAED; margin: 2px 8px;"></div>

          <!-- Account 2 -->
          <button type="button" class="g-acc-row" data-name="Rohan Mehta" data-email="rohan.mehta@thefoodclub.com">
            <div class="g-acc-avatar" style="background: #EA4335;">R</div>
            <div>
              <div class="g-acc-name">Rohan Mehta (The Food Club)</div>
              <div class="g-acc-email">rohan.mehta@thefoodclub.com</div>
            </div>
          </button>

          <div style="height: 1px; background: #E8EAED; margin: 2px 8px;"></div>

          <!-- Account 3: Custom / Another account -->
          <button type="button" class="g-acc-row" id="g-use-other-toggle">
            <div class="g-acc-avatar" style="background: #E8F0FE; color: #1A73E8;">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </div>
            <div>
              <div class="g-acc-name" style="color: #1A73E8;">Use another account</div>
              <div class="g-acc-email">Type your Google email address</div>
            </div>
          </button>
        </div>

        <!-- Custom Account Entry Form (hidden by default) -->
        <div id="g-custom-form-wrap" style="display: none; background: #F8F9FA; border: 1px solid #DADCE0; border-radius: 12px; padding: 14px; margin-bottom: 16px;">
          <label style="display: block; font-size: 12px; font-weight: 700; color: #3C4043; margin-bottom: 4px;">Your Name</label>
          <input type="text" id="g-custom-name" placeholder="e.g. Alex Kumar" style="width: 100%; height: 36px; padding: 0 10px; border: 1px solid #DADCE0; border-radius: 8px; font-size: 13.5px; margin-bottom: 10px; outline: none; box-sizing: border-box;" />
          
          <label style="display: block; font-size: 12px; font-weight: 700; color: #3C4043; margin-bottom: 4px;">Your Gmail Address</label>
          <input type="email" id="g-custom-email" placeholder="you@gmail.com" style="width: 100%; height: 36px; padding: 0 10px; border: 1px solid #DADCE0; border-radius: 8px; font-size: 13.5px; margin-bottom: 12px; outline: none; box-sizing: border-box;" />
          
          <button type="button" id="g-custom-submit-btn" style="width: 100%; height: 36px; background: #1A73E8; color: #fff; font-size: 13.5px; font-weight: 600; border: none; border-radius: 8px; cursor: pointer;">
            Continue as this account
          </button>
        </div>

        <!-- Modal Footer -->
        <div style="font-size: 11.5px; color: #5F6368; line-height: 1.45; text-align: center;">
          To continue, Google will share your name, email address, and profile picture with Menzo.
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    const closeModal = () => {
      overlay.remove();
      const err = new Error('Google sign-in popup was closed.');
      err.code = 'auth/popup-closed-by-user';
      reject(err);
    };

    overlay.querySelector('#g-modal-close-btn')?.addEventListener('click', closeModal);
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeModal();
    });

    // Account row click
    overlay.querySelectorAll('.g-acc-row[data-email]').forEach(btn => {
      btn.addEventListener('click', () => {
        const email = btn.getAttribute('data-email');
        const name = btn.getAttribute('data-name');
        overlay.remove();

        const user = {
          uid: 'google_' + Math.random().toString(36).substr(2, 9),
          email,
          displayName: name,
          photoURL: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=F4512A&color=fff`
        };

        syncUserToStorage(user, {
          ownerName: name,
          provider: 'google'
        });

        resolve(user);
      });
    });

    // Toggle custom account form
    const toggleBtn = overlay.querySelector('#g-use-other-toggle');
    const customWrap = overlay.querySelector('#g-custom-form-wrap');
    const customSubmit = overlay.querySelector('#g-custom-submit-btn');

    toggleBtn?.addEventListener('click', () => {
      if (customWrap) {
        customWrap.style.display = customWrap.style.display === 'none' ? 'block' : 'none';
        if (customWrap.style.display === 'block') {
          overlay.querySelector('#g-custom-email')?.focus();
        }
      }
    });

    customSubmit?.addEventListener('click', () => {
      const emailInput = overlay.querySelector('#g-custom-email');
      const nameInput = overlay.querySelector('#g-custom-name');
      const email = emailInput?.value.trim();
      const name = nameInput?.value.trim() || email?.split('@')[0] || 'Google User';

      if (!email || !email.includes('@')) {
        alert('Please enter a valid email address');
        emailInput?.focus();
        return;
      }

      overlay.remove();

      const user = {
        uid: 'google_' + Math.random().toString(36).substr(2, 9),
        email,
        displayName: name,
        photoURL: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=F4512A&color=fff`
      };

      syncUserToStorage(user, {
        ownerName: name,
        provider: 'google'
      });

      resolve(user);
    });
  });
}

