import { useState, useEffect } from 'react';
import { db, auth } from '../services/firebaseConfig';
import { collection, query, where, onSnapshot, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { SongItem } from '../services/api';

export function useRingtones() {
  const [likedRingtones, setLikedRingtones] = useState<SongItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth.currentUser) {
      setLikedRingtones([]);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'liked_ringtones'),
      where('userId', '==', auth.currentUser.uid)
    );

    return onSnapshot(q, (snapshot) => {
      const ringtones = snapshot.docs.map(doc => doc.data() as SongItem);
      setLikedRingtones(ringtones);
      setLoading(false);
    });
  }, [auth.currentUser]);

  const isRingtoneLiked = (id: string) => likedRingtones.some(r => r.id === id);

  const toggleLikeRingtone = async (ringtone: SongItem) => {
    if (!auth.currentUser) return;
    const ref = doc(db, 'liked_ringtones', `${auth.currentUser.uid}_${ringtone.id}`);
    
    if (isRingtoneLiked(ringtone.id)) {
      await deleteDoc(ref);
    } else {
      await setDoc(ref, {
        ...ringtone,
        userId: auth.currentUser.uid,
        likedAt: Date.now()
      });
    }
  };

  return { likedRingtones, loading, toggleLikeRingtone, isRingtoneLiked };
}
