import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../services/firebaseConfig';

export interface UserPreferences {
  languages: string[];
}

const DEFAULT_PREFERENCES: UserPreferences = {
  languages: ['English', 'Tamil'],
};

export const useUserPreferences = () => {
  const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_PREFERENCES);
  const [loading, setLoading] = useState(true);
  const [hasPrompted, setHasPrompted] = useState(false);

  useEffect(() => {
    let unsubSnap: (() => void) | null = null;
    const unsubAuth = auth.onAuthStateChanged((user) => {
      if (unsubSnap) { unsubSnap(); unsubSnap = null; }
      if (!user) {
        setPreferences(DEFAULT_PREFERENCES);
        setLoading(false);
        return;
      }

      const userDocRef = doc(db, 'userPreferences', user.uid);
      
      // Listen for changes
      unsubSnap = onSnapshot(userDocRef, (snap) => {
        if (snap.exists()) {
          setPreferences(snap.data() as UserPreferences);
          setHasPrompted(true);
        } else {
          setHasPrompted(false);
        }
        setLoading(false);
      }, () => setLoading(false));
    });

    return () => { unsubAuth(); if (unsubSnap) unsubSnap(); };
  }, []);

  const updateLanguages = async (languages: string[]) => {
    const user = auth.currentUser;
    if (!user) return;
    
    const userDocRef = doc(db, 'userPreferences', user.uid);
    await setDoc(userDocRef, { languages }, { merge: true });
  };

  return { preferences, loading, hasPrompted, updateLanguages };
};
