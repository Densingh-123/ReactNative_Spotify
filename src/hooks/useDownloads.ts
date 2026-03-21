import { useState, useEffect } from 'react';
import { db, auth, ENV } from '../services/firebaseConfig';
import { doc, setDoc, deleteDoc, collection, onSnapshot, query, serverTimestamp } from 'firebase/firestore';
import { SongItem, getPlayableAudioUrl } from '../services/api';
import RNFS from 'react-native-fs';

export function useDownloads() {
  const [downloadedSongs, setDownloadedSongs] = useState<SongItem[]>([]);
  const [loading, setLoading] = useState(true);
  const user = auth.currentUser;

  useEffect(() => {
    if (!user) { setDownloadedSongs([]); setLoading(false); return; }
    const q = query(collection(db, 'users', user.uid, 'downloads'));
    return onSnapshot(q, (snap) => {
      setDownloadedSongs(snap.docs.map(d => d.data() as SongItem));
      setLoading(false);
    });
  }, [user?.uid]);

  const downloadSong = async (song: SongItem) => {
    if (!user) {
      return;
    }
    
    if (downloadedSongs.some(s => s.id === song.id)) {
      return;
    }

    try {
      const streamUrl = await getPlayableAudioUrl(song);
      if (!streamUrl) throw new Error('Could not resolve stream URL');

      const finalUrl = (streamUrl.startsWith('http') && !streamUrl.includes('proxy')) 
        ? (ENV.VITE_CORS_PROXY || 'https://api.codetabs.com/v1/proxy/?quest=') + encodeURIComponent(streamUrl)
        : streamUrl;
      
      const filename = `${song.title.replace(/[\\/:*?"<>|]/g, '')} - ${song.artist.replace(/[\\/:*?"<>|]/g, '')}.mp3`;
      const localPath = `${RNFS.DocumentDirectoryPath}/${filename}`;

      console.log('Downloading from:', finalUrl, 'to', localPath);
      
      const downloadJob = RNFS.downloadFile({
        fromUrl: finalUrl,
        toFile: localPath,
      });

      await downloadJob.promise;

      // 5. Save metadata to Firestore
      const docRef = doc(db, 'users', user.uid, 'downloads', song.id);
      await setDoc(docRef, {
        ...song,
        isLocal: true,
        localPath,
        downloadedAt: new Date().toISOString()
      });

    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  const removeDownloadRecord = async (songId: string) => {
     if (!user) return;
     const docInfo = downloadedSongs.find(s => s.id === songId);
     
     if (docInfo && (docInfo as any).localPath) {
       try {
         await RNFS.unlink((docInfo as any).localPath);
       } catch (e) {
         console.warn("File to delete not found locally");
       }
     }
     
     const ref = doc(db, 'users', user.uid, 'downloads', songId);
     await deleteDoc(ref);
  };

  return { 
    downloadedSongs, 
    downloadSong, 
    removeDownloadRecord,
    isDownloaded: (id: string) => downloadedSongs.some(s => s.id === id), 
    loading 
  };
}
