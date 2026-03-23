import React, { createContext, useContext, useState, useEffect } from 'react';
import { db, auth } from '../services/firebaseConfig';
import {
  collection, query, where, onSnapshot, addDoc,
  serverTimestamp, doc, updateDoc, getDoc, setDoc
} from 'firebase/firestore';
import { SongItem } from '../services/api';

export interface SocialItem {
  id: string;
  name: string;
  type: 'blend' | 'collab';
  creator: string;
  members: string[];
  participants?: string[];
  songIds: string[];            // kept for back-compat
  songsMap?: Record<string, SongItem>; // keyed by songId – the source of truth
  songCount?: number;
  similarity?: number;
  description?: string;
  createdAt: any;
}

interface SocialContextType {
  blends: SocialItem[];
  collabs: SocialItem[];
  createSocialItem: (name: string, type: 'blend' | 'collab') => Promise<SocialItem>;
  addSongToCollab: (itemId: string, song: SongItem) => Promise<void>;
}

const SocialContext = createContext<SocialContextType | undefined>(undefined);

export const SocialProvider = ({ children }: { children: React.ReactNode }) => {
  const [blends, setBlends]   = useState<SocialItem[]>([]);
  const [collabs, setCollabs] = useState<SocialItem[]>([]);

  // Convert raw Firestore doc to SocialItem, resolving songsMap → songs array
  const toItem = (id: string, data: any): SocialItem => {
    const songsMap: Record<string, SongItem> = data.songsMap || {};
    return {
      id,
      ...data,
      songsMap,
      songs: Object.values(songsMap),
      songIds: Object.keys(songsMap),
    } as SocialItem;
  };

  useEffect(() => {
    let unsubCollabs = () => {};
    let unsubBlends  = () => {};

    const setupListeners = () => {
      const user = auth.currentUser;
      if (!user) { setBlends([]); setCollabs([]); return; }

      const qCollab = query(
        collection(db, 'collab_playlists'),
        where('members', 'array-contains', user.uid)
      );
      unsubCollabs = onSnapshot(qCollab, snap => {
        setCollabs(snap.docs.map(d => toItem(d.id, d.data())));
      });

      const qBlend = query(
        collection(db, 'blends'),
        where('participants', 'array-contains', user.uid)
      );
      unsubBlends = onSnapshot(qBlend, snap => {
        setBlends(snap.docs.map(d => toItem(d.id, d.data())));
      });
    };

    const unsubAuth = auth.onAuthStateChanged(() => setupListeners());

    return () => {
      unsubCollabs();
      unsubBlends();
      unsubAuth();
    };
  }, []);

  // ── Create blend or collab ─────────────────────────────
  const createSocialItem = async (name: string, type: 'blend' | 'collab'): Promise<SocialItem> => {
    const user = auth.currentUser;
    if (!user) throw new Error('Must be logged in');

    const colName = type === 'blend' ? 'blends' : 'collab_playlists';
    const creator = user.displayName || user.email?.split('@')[0] || 'Friend';

    const data = {
      name,
      type,
      creator,
      members:      [user.uid],
      participants: [user.uid],
      songsMap:     {},
      songIds:      [],
      songs:        [],
      description:  type === 'blend' ? 'A perfect mix of our musical tastes.' : 'Our shared musical journey.',
      createdAt:    serverTimestamp(),
    };

    const ref = await addDoc(collection(db, colName), data);
    return toItem(ref.id, data);
  };

  // ── Add song to collab using a keyed map (idempotent, no duplicates) ─────
  const addSongToCollab = async (itemId: string, song: SongItem): Promise<void> => {
    const user = auth.currentUser;
    if (!user) return;

    const ref = doc(db, 'collab_playlists', itemId);
    // Use dot-notation to add / overwrite this specific song inside songsMap
    await updateDoc(ref, {
      [`songsMap.${song.id}`]: {
        id:         song.id,
        title:      song.title,
        artist:     song.artist,
        artworkUrl: song.artworkUrl,
        streamUrl:  song.streamUrl,
        addedBy:    user.uid,
        addedAt:    Date.now(),
      },
    });
  };

  return (
    <SocialContext.Provider value={{ blends, collabs, createSocialItem, addSongToCollab }}>
      {children}
    </SocialContext.Provider>
  );
};

export const useSocial = () => {
  const ctx = useContext(SocialContext);
  if (!ctx) throw new Error('useSocial must be inside SocialProvider');
  return ctx;
};
