import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, addDoc, serverTimestamp, doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { auth, db } from '../services/firebaseConfig';

export interface Playlist {
  id: string; name: string; userId: string; createdAt: any;
  songs: any[]; color: string; icon: string;
  type?: 'playlist' | 'smart_album' | 'artist_collection';
  image?: string;
}

export const usePlaylists = () => {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth.currentUser) { setPlaylists([]); setLoading(false); return; }
    const q = query(collection(db, 'playlists'), where('userId', '==', auth.currentUser!.uid));
    return onSnapshot(q, (snap) => {
      setPlaylists(snap.docs.map(d => ({ id: d.id, ...d.data() })) as Playlist[]);
      setLoading(false);
    }, () => setLoading(false));
  }, []);

  const createPlaylist = async (name: string, languages: string[] = ['Tamil']) => {
    if (!auth.currentUser) return;
    const { searchMusic } = await import('../services/api');
    
    const langSuffix = languages.length > 0 ? ` ${languages[0]}` : '';
    let songsToStore: any[] = [];
    try {
      const results = await searchMusic(`${name}${langSuffix} songs`);
      songsToStore = results.slice(0, 50);
    } catch (e) {
      console.log('Failed to fetch songs for new playlist', e);
    }

    const colors = ['#e91e63', '#673ab7', '#ff5722', '#009688', '#f57f17', '#6200ea', '#2196f3'];
    const icons = ['musical-notes', 'heart', 'headset', 'disc', 'radio', 'star', 'planet'];
    const artworkUrl = songsToStore[0]?.artworkUrl || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4';

    await addDoc(collection(db, 'playlists'), {
      name, userId: auth.currentUser.uid, createdAt: serverTimestamp(), 
      songs: songsToStore,
      color: colors[Math.floor(Math.random() * colors.length)],
      icon: icons[Math.floor(Math.random() * icons.length)],
      image: artworkUrl,
      type: 'playlist'
    });
  };

  const addSongToPlaylist = async (playlistId: string, song: any) => {
    await updateDoc(doc(db, 'playlists', playlistId), { songs: arrayUnion(song) });
  };

  const createSmartCollection = async (keyword: string, type: 'smart_album' | 'artist_collection', languages: string[] = ['Tamil']) => {
    if (!auth.currentUser) return;
    const { searchMusic } = await import('../services/api');
    
    // Construct search query: "keyword languages songs"
    const langSuffix = languages.length > 0 ? ` ${languages[0]}` : '';
    const searchString = `${keyword}${langSuffix} ${type === 'smart_album' ? 'songs' : 'movie songs'}`;
    
    try {
      const results = await searchMusic(searchString);
      const songsToStore = results.slice(0, 25);
      
      const colors = ['#e91e63', '#673ab7', '#ff5722', '#009688', '#f57f17', '#6200ea', '#2196f3'];
      const icons = type === 'smart_album' ? ['disc', 'musical-notes'] : ['person', 'headset'];
      
      const artworkUrl = songsToStore[0]?.artworkUrl || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&q=80';

      await addDoc(collection(db, 'playlists'), {
        name: keyword,
        userId: auth.currentUser.uid,
        createdAt: serverTimestamp(),
        songs: songsToStore,
        color: colors[Math.floor(Math.random() * colors.length)],
        icon: icons[Math.floor(Math.random() * icons.length)],
        type: type,
        image: artworkUrl
      });
    } catch (e) {
      console.error('Failed to create smart collection:', e);
    }
  };

  const deletePlaylist = async (playlistId: string) => {
    const { deleteDoc } = await import('firebase/firestore');
    await deleteDoc(doc(db, 'playlists', playlistId));
  };

  const setPlaylistSongs = async (playlistId: string, songs: any[]) => {
    await updateDoc(doc(db, 'playlists', playlistId), { songs });
  };

  return { playlists, loading, createPlaylist, addSongToPlaylist, setPlaylistSongs, deletePlaylist, createSmartCollection };
};
