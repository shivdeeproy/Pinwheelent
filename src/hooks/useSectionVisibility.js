import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';

const FIRESTORE_TIMEOUT_MS = 3000;
const withTimeout = (promise, ms = FIRESTORE_TIMEOUT_MS) =>
  Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Firebase timeout — using local storage')), ms)
    )
  ]);

const isFirebaseAvailable = () => navigator.onLine;

export const useSectionVisibility = () => {
  const [visibility, setVisibility] = useState(() => {
    const cached = localStorage.getItem('localSettings');
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) {
        console.error('Error parsing localSettings:', e);
      }
    }
    return {
      showWork: true,
      showBrands: true,
      showReviews: true,
      showCollaborated: true,
      googleReviewUrl: ''
    };
  });

  const fetchSettings = async () => {
    if (isFirebaseAvailable()) {
      try {
        const querySnapshot = await withTimeout(getDocs(collection(db, 'settings')));
        if (!querySnapshot.empty) {
          const docMatch = querySnapshot.docs.find(d => d.id === 'sectionVisibility');
          if (docMatch) {
            const data = docMatch.data();
            const loadedSettings = {
              showWork: data.showWork !== false,
              showBrands: data.showBrands !== false,
              showReviews: data.showReviews !== false,
              showCollaborated: data.showCollaborated !== false,
              googleReviewUrl: data.googleReviewUrl || ''
            };
            setVisibility(loadedSettings);
            localStorage.setItem('localSettings', JSON.stringify(loadedSettings));
            return;
          }
        }
      } catch (error) {
        console.warn('Firebase section visibility fetch failed:', error);
      }
    }

    // Fallback if offline/failed
    const cached = localStorage.getItem('localSettings');
    if (cached) {
      try {
        setVisibility(JSON.parse(cached));
      } catch (e) {
        console.error(e);
      }
    }
  };

  useEffect(() => {
    fetchSettings();

    const handleSettingsChange = () => {
      const cached = localStorage.getItem('localSettings');
      if (cached) {
        try {
          setVisibility(JSON.parse(cached));
        } catch (e) {
          console.error(e);
        }
      }
    };

    window.addEventListener('visibilitySettingsChanged', handleSettingsChange);
    return () => {
      window.removeEventListener('visibilitySettingsChanged', handleSettingsChange);
    };
  }, []);

  return visibility;
};
