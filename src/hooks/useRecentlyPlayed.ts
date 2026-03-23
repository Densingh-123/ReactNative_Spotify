import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../services/firebaseConfig';
import { SongItem } from '../services/api';

export const useRecentlyPlayed = (limitCount = 10) => {
  const [recentlyPlayed, setRecentlyPlayed] = useState<SongItem[]>([]);
  const [ringtoneHistory, setRingtoneHistory] = useState<SongItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubSnap: (() => void) | null = null;
    const unsubAuth = auth.onAuthStateChanged((user) => {
      if (unsubSnap) { unsubSnap(); unsubSnap = null; }
      if (!user) { setRecentlyPlayed([]); setLoading(false); return; }
      const q = query(collection(db, 'recentlyPlayed'), where('userId', '==', user.uid));
      unsubSnap = onSnapshot(q, (snap) => {
        const songs = snap.docs.map(d => {
          const data = d.data();
          return {
            id: data.songId,
            title: data.title,
            artist: data.artist,
            artworkUrl: data.artworkUrl,
            streamUrl: data.streamUrl,
            duration: data.duration || 0,
            playedAt: data.playedAt?.toDate?.() || new Date(0) // Handle firestore timestamp
          } as any;
        });

        // Sort by playedAt desc
        const sorted = songs.sort((a: any, b: any) => b.playedAt - a.playedAt);
        const mapped = sorted.map(({ playedAt, ...s }: any) => s as SongItem);
        
        const fullSongs = mapped.filter(s => !s.duration || s.duration >= 180).slice(0, limitCount);
        const ringtones = mapped.filter(s => s.duration && s.duration > 0 && s.duration < 180).slice(0, limitCount);

        setRecentlyPlayed(fullSongs);
        setRingtoneHistory(ringtones);
        setLoading(false);
      }, () => setLoading(false));
    });
    return () => { unsubAuth(); if (unsubSnap) unsubSnap(); };
  }, [limitCount]);

  return { recentlyPlayed, ringtoneHistory, loading };
};
