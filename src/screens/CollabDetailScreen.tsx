import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TextInput, TouchableOpacity,
  Image, StyleSheet, ActivityIndicator, Share, Alert
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { usePlayer } from '../context/PlayerContext';
import { db } from '../services/firebaseConfig';
import {
  doc, updateDoc, arrayUnion, collection, query,
  onSnapshot, addDoc, orderBy, limit, getDocs, where, deleteDoc
} from 'firebase/firestore';
import { SongItem, getRecommendedSongs, searchSongs } from '../services/api';
import { triggerCollabNotification } from '../services/notificationService';

export default function CollabDetailScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation<any>();
  const route      = useRoute<any>();
  const { collabId: id } = route.params;
  const { user }   = useAuth();
  const { playTrack } = usePlayer();

  const [playlistName, setPlaylistName] = useState('');
  const [songs, setSongs]               = useState<(SongItem & { _docId: string; addedBy?: string })[]>([]);
  const [recommended, setRecommended]   = useState<SongItem[]>([]);
  const [searchResults, setSearchResults] = useState<SongItem[]>([]);
  const [searchQuery, setSearchQuery]   = useState('');
  const [loading, setLoading]           = useState(true);
  const [searching, setSearching]       = useState(false);
  const [deletingId, setDeletingId]     = useState<string | null>(null);

  useEffect(() => {
    if (!id || !user) return;

    // 1. Listen to playlist metadata + auto-join
    const unsubInfo = onSnapshot(doc(db, 'collab_playlists', id), async (docSnap) => {
      if (!docSnap.exists()) return;
      const data = docSnap.data();
      setPlaylistName(data.name);
      if (data.members && !data.members.includes(user.uid)) {
        await updateDoc(doc(db, 'collab_playlists', id), { members: arrayUnion(user.uid) });
      }
    });

    // 2. Subscribe to songs subcollection in real-time
    const songsQ = query(
      collection(db, 'collab_playlists', id, 'songs'),
      orderBy('addedAt', 'asc')
    );
    const unsubSongs = onSnapshot(songsQ, async (snap) => {
      const sList = snap.docs.map(d => ({ ...(d.data() as SongItem), _docId: d.id }));
      setSongs(sList);
      setLoading(false);

      // Seed recommendations from last song or user's liked songs
      let seedSong: SongItem | null = sList.length > 0 ? sList[sList.length - 1] : null;
      if (!seedSong) {
        const likedSnap = await getDocs(query(collection(db, 'users', user.uid, 'likedSongs'), limit(1)));
        if (!likedSnap.empty) seedSong = likedSnap.docs[0].data() as SongItem;
        else {
          const histSnap = await getDocs(query(collection(db, 'recentlyPlayed'), where('userId', '==', user.uid), limit(1)));
          if (!histSnap.empty) {
            const h = histSnap.docs[0].data();
            seedSong = { id: h.songId, title: h.title, artist: h.artist, artworkUrl: h.artworkUrl, streamUrl: h.streamUrl } as SongItem;
          }
        }
      }

      if (seedSong) {
        const recs = await getRecommendedSongs(seedSong);
        const histSnap = await getDocs(query(collection(db, 'recentlyPlayed'), where('userId', '==', user.uid), limit(10)));
        const historySongs = histSnap.docs.map(d => {
          const h = d.data();
          return { id: h.songId, title: h.title, artist: h.artist, artworkUrl: h.artworkUrl, streamUrl: h.streamUrl } as SongItem;
        });
        const existingIds = new Set(sList.map(s => s.id));
        const combined = [...recs, ...historySongs].filter(s => !existingIds.has(s.id));
        const unique = Array.from(new Map(combined.map(item => [item.id, item])).values());
        setRecommended(unique.slice(0, 20));
      } else {
        const dummy = { id: 'cWigVlzj', title: 'Illuminati', artist: 'Sushin Shyam', artworkUrl: '', streamUrl: '' } as SongItem;
        getRecommendedSongs(dummy).then(recs => setRecommended(recs.slice(0, 20)));
      }
    });

    return () => { unsubInfo(); unsubSongs(); };
  }, [id, user]);

  const handleSearch = async (q: string) => {
    setSearchQuery(q);
    if (!q.trim()) { setSearchResults([]); return; }
    setSearching(true);
    try {
      const results = await searchSongs(q);
      setSearchResults(results || []);
    } catch (e) {
      console.error(e);
    } finally {
      setSearching(false);
    }
  };

  const shareLink = async () => {
    const webUrl = `https://react-melodify.vercel.app/collab/${id}`;
    try {
      await Share.share({
        title: `Join my playlist: ${playlistName}`,
        message: `Join my collab playlist "${playlistName}" on Melodify!\n\n${webUrl}`,
        url: webUrl,
      });
    } catch (e) { console.error(e); }
  };

  const handleAddSong = async (song: SongItem) => {
    if (!id) return;
    try {
      await addDoc(collection(db, 'collab_playlists', id, 'songs'), {
        ...song,
        addedBy: user?.displayName || user?.email?.split('@')[0] || 'Anonymous',
        addedAt: new Date(),
      });
      setRecommended(prev => prev.filter(s => s.id !== song.id));
      setSearchResults(prev => prev.filter(s => s.id !== song.id));
      setSearchQuery('');
      // 🔔 Trigger push notification for the added song
      await triggerCollabNotification(song.title, playlistName);
    } catch (e) {
      console.error('Failed to add song', e);
    }
  };

  const handleDeleteSong = (docId: string, title: string) => {
    Alert.alert(
      'Remove Song',
      `Remove "${title}" from this playlist?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            setDeletingId(docId);
            try {
              await deleteDoc(doc(db, 'collab_playlists', id, 'songs', docId));
            } catch (e) {
              console.error('Failed to delete song', e);
            } finally {
              setDeletingId(null);
            }
          },
        },
      ]
    );
  };

  const songList = songs as (SongItem & { _docId: string; addedBy?: string })[];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surfaceHighlight, borderBottomColor: 'rgba(255,255,255,0.05)' }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Icon name="chevron-back" size={26} color={colors.text} />
        </TouchableOpacity>
        <View style={[styles.headerIcon, { backgroundColor: colors.primary }]}>
          <Icon name="musical-notes" size={20} color="#fff" />
        </View>
        <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
          {playlistName || 'Loading...'}
        </Text>
        <TouchableOpacity onPress={shareLink} style={{ padding: 8 }}>
          <Icon name="share-social" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={{ height: 200, borderRadius: 16, backgroundColor: colors.surfaceHighlight }} />
        ) : (
          <>
            {/* Playlist Tracks */}
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Playlist Tracks ({songs.length})
              </Text>
              {songs.length > 0 && (
                <TouchableOpacity
                  onPress={() => { playTrack(songList[0], songList, 0); navigation.navigate('Player'); }}
                  style={[styles.playBtn, { backgroundColor: colors.primary }]}
                >
                  <Icon name="play" size={20} color="#fff" style={{ marginLeft: 3 }} />
                </TouchableOpacity>
              )}
            </View>

            {songs.length === 0 ? (
              <View style={[styles.emptyBox, { backgroundColor: colors.surfaceHighlight, borderColor: 'rgba(255,255,255,0.1)' }]}>
                <Text style={{ color: colors.textSecondary, marginBottom: 4 }}>This playlist is empty.</Text>
                <Text style={{ fontSize: 13, color: colors.textSecondary }}>Share the link or add songs from below!</Text>
              </View>
            ) : (
              <View style={{ gap: 12, marginBottom: 32 }}>
                {songList.map((song, i) => (
                  <View key={`${song._docId}`} style={[styles.songItem, { backgroundColor: colors.surfaceHighlight }]}>
                    <TouchableOpacity
                      style={{ flexDirection: 'row', alignItems: 'center', flex: 1, gap: 12 }}
                      onPress={() => { playTrack(song, songList, i); navigation.navigate('Player'); }}
                    >
                      <Image source={{ uri: song.artworkUrl }} style={styles.songArt} />
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.songTitle, { color: colors.text }]} numberOfLines={1}>{song.title}</Text>
                        <Text style={[styles.songArtist, { color: colors.textSecondary }]} numberOfLines={1}>
                          {song.artist} · Added by {song.addedBy || 'Unknown'}
                        </Text>
                      </View>
                    </TouchableOpacity>
                    {/* Delete button */}
                    {deletingId === song._docId ? (
                      <ActivityIndicator size="small" color={colors.primary} style={{ padding: 8 }} />
                    ) : (
                      <TouchableOpacity
                        onPress={() => handleDeleteSong(song._docId, song.title)}
                        style={{ padding: 8 }}
                      >
                        <Icon name="trash-outline" size={20} color="#ff4444" />
                      </TouchableOpacity>
                    )}
                  </View>
                ))}
              </View>
            )}

            {/* Search */}
            <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 24, marginBottom: 16 }]}>
              Find & Add Songs
            </Text>
            <View style={[styles.searchBox, { backgroundColor: colors.surfaceHighlight, borderColor: 'rgba(255,255,255,0.1)' }]}>
              <Icon name="search" size={20} color={colors.textSecondary} style={{ marginRight: 10 }} />
              <TextInput
                placeholder="Search and add to playlist..."
                placeholderTextColor={colors.textSecondary}
                value={searchQuery}
                onChangeText={handleSearch}
                style={[styles.searchInput, { color: colors.text }]}
              />
              {searching && <ActivityIndicator size="small" color={colors.primary} />}
            </View>

            {searchResults.length > 0 && (
              <View style={{ gap: 12, marginTop: 16, marginBottom: 32 }}>
                <Text style={[styles.labelText, { color: colors.primary }]}>SEARCH RESULTS</Text>
                {searchResults.map(song => (
                  <View key={song.id} style={styles.songRow}>
                    <Image source={{ uri: song.artworkUrl }} style={styles.songArt} />
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.songTitle, { color: colors.text }]} numberOfLines={1}>{song.title}</Text>
                      <Text style={[styles.songArtist, { color: colors.textSecondary }]} numberOfLines={1}>{song.artist}</Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => { handleAddSong(song); setSearchQuery(''); setSearchResults([]); }}
                      style={{ padding: 8 }}
                    >
                      <Icon name="add-circle" size={28} color={colors.primary} />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}

            {/* Recommendations */}
            <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 16, marginBottom: 16 }]}>
              Recommended to Add
            </Text>
            <View style={{ gap: 12 }}>
              {recommended.map(song => (
                <View key={song.id} style={styles.songRow}>
                  <Image source={{ uri: song.artworkUrl }} style={styles.songArt} />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.songTitle, { color: colors.text }]} numberOfLines={1}>{song.title}</Text>
                    <Text style={[styles.songArtist, { color: colors.textSecondary }]} numberOfLines={1}>{song.artist}</Text>
                  </View>
                  <TouchableOpacity onPress={() => handleAddSong(song)} style={{ padding: 8 }}>
                    <Icon name="add-circle-outline" size={28} color={colors.primary} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, paddingTop: 48, gap: 12, borderBottomWidth: 1 },
  backBtn: { padding: 4 },
  headerIcon: { width: 40, height: 40, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  title: { flex: 1, fontSize: 20, fontWeight: '900' },
  scrollContent: { padding: 20, paddingBottom: 120 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '800' },
  playBtn: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  emptyBox: { padding: 40, borderRadius: 16, borderWidth: 1, borderStyle: 'dashed', alignItems: 'center', marginBottom: 32 },
  songItem: { flexDirection: 'row', alignItems: 'center', padding: 8, borderRadius: 12, gap: 0 },
  songRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  songArt: { width: 48, height: 48, borderRadius: 8 },
  songTitle: { fontSize: 15, fontWeight: '600' },
  songArtist: { fontSize: 12, marginTop: 2 },
  searchBox: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 16, borderWidth: 1 },
  searchInput: { flex: 1, fontSize: 16 },
  labelText: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
});
