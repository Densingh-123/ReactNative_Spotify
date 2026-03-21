import { useState, useEffect } from 'react';
import { db, auth } from '../services/firebaseConfig';
import { doc, setDoc, deleteDoc, collection, onSnapshot, query } from 'firebase/firestore';
import { SongItem } from '../services/api';

export function useLikes() {
  const [likedSongs, setLikedSongs] = useState<SongItem[]>([]);
  const [loading, setLoading] = useState(true);
  const user = auth.currentUser;

  useEffect(() => {
    if (!user) { setLikedSongs([]); setLoading(false); return; }
    const q = query(collection(db, 'users', user.uid, 'likedSongs'));
    return onSnapshot(q, (snap) => {
      setLikedSongs(snap.docs.map(d => d.data() as SongItem));
      setLoading(false);
    });
  }, [user?.uid]);

  const toggleLike = async (song: SongItem) => {
    if (!user) return;
    const ref = doc(db, 'users', user.uid, 'likedSongs', song.id);
    const liked = likedSongs.some(s => s.id === song.id);
    if (liked) await deleteDoc(ref); else await setDoc(ref, song);
  };

  return { likedSongs, toggleLike, isLiked: (id: string) => likedSongs.some(s => s.id === id), loading };
}
