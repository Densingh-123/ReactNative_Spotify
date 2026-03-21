import { useState, useEffect, useRef } from 'react';
import { db, auth } from '../services/firebaseConfig';
import { doc, getDoc, setDoc, updateDoc, increment } from 'firebase/firestore';

export interface DailyStat {
  date: string; // YYYY-MM-DD
  secondsListened: number;
  genres?: { [key: string]: number }; // genre -> seconds
  artists?: { [key: string]: number }; // artist -> seconds
}

export function useStats() {
  const [stats, setStats] = useState<DailyStat[]>([]);
  const [loading, setLoading] = useState(true);
  const user = auth.currentUser;

  useEffect(() => {
    if (!user) { setStats([]); setLoading(false); return; }
    
    const fetchStats = async () => {
      try {
        const ref = doc(db, 'users', user.uid, 'stats', 'daily');
        const snap = await getDoc(ref);
        if (snap.exists()) {
          const data = snap.data();
          // Convert map of YYYY-MM-DD: data to sorted array
          const arr: DailyStat[] = Object.keys(data).map(date => ({
            date,
            ...data[date]
          })).sort((a, b) => a.date.localeCompare(b.date));
          setStats(arr);
        } else {
          setStats([]);
        }
      } catch (e) {
        console.error('Failed to load stats', e);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [user?.uid]);

  return { stats, loading };
}

// Helper to update stats periodically (called from MusicPlayerService)
let lastUpdateDate = new Date().toISOString().split('T')[0];
let accumulatedSeconds = 0;
let currentMetadata: { genre?: string; artist?: string } = {};
let flushTimer: any = null;

export const trackListeningTime = (seconds: number, metadata?: { genre?: string; artist?: string }) => {
  if (!auth.currentUser) return;
  const today = new Date().toISOString().split('T')[0];
  
  if (metadata) {
    currentMetadata = { ...currentMetadata, ...metadata };
  }

  // If day changed, flush old and reset
  if (today !== lastUpdateDate) {
    flushStats();
    lastUpdateDate = today;
    accumulatedSeconds = 0;
  }
  
  accumulatedSeconds += seconds;

  // Debounce the flush to Firestore to save writes (every 30 seconds of listening)
  if (accumulatedSeconds >= 30) {
    flushStats();
  } else {
    clearTimeout(flushTimer);
    flushTimer = setTimeout(flushStats, 10000); // Or flush after 10s of inactivity
  }
};

const flushStats = async () => {
  if (!auth.currentUser || accumulatedSeconds === 0) return;
  const secsToSave = Math.floor(accumulatedSeconds);
  if (secsToSave === 0) return;
  
  accumulatedSeconds = accumulatedSeconds - secsToSave; // Keep remainder if any
  const dateStr = lastUpdateDate;
  const { genre, artist } = currentMetadata;
  
  try {
    const ref = doc(db, 'users', auth.currentUser.uid, 'stats', 'daily');
    const snap = await getDoc(ref);
    
    const updateObj: any = {};
    const baseKey = `${dateStr}.secondsListened`;
    updateObj[baseKey] = increment(secsToSave);

    if (genre) {
      updateObj[`${dateStr}.genres.${genre.replace(/\./g, '_')}`] = increment(secsToSave);
    }
    if (artist) {
      updateObj[`${dateStr}.artists.${artist.replace(/\./g, '_')}`] = increment(secsToSave);
    }

    if (!snap.exists()) {
      await setDoc(ref, { [dateStr]: { 
        secondsListened: secsToSave,
        genres: genre ? { [genre.replace(/\./g, '_')]: secsToSave } : {},
        artists: artist ? { [artist.replace(/\./g, '_')]: secsToSave } : {}
      }});
    } else {
      await updateDoc(ref, updateObj);
    }
  } catch (e) {
    console.error('Failed to flush stats', e);
  }
};
