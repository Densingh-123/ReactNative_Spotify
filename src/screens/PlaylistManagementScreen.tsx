import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, StyleSheet, TextInput } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../context/ThemeContext';
import { usePlaylists } from '../hooks/usePlaylists';
import { searchMusic, SongItem } from '../services/api';

export default function PlaylistManagementScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const route = useRoute<any>();
  const playlistId = route.params?.id;
  const { playlists, setPlaylistSongs } = usePlaylists();
  
  const playlist = playlists.find(p => p.id === playlistId);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SongItem[]>([]);
  const [searching, setSearching] = useState(false);
  const [songs, setSongs] = useState<SongItem[]>([]);

  useEffect(() => {
    if (playlist) {
      setSongs(playlist.songs || []);
    }
  }, [playlist]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    try {
      const results = await searchMusic(searchQuery);
      setSearchResults(results);
    } catch (e) {
      console.error(e);
    } finally {
      setSearching(false);
    }
  };

  const addSong = async (song: SongItem) => {
    if (songs.some(s => s.id === song.id)) return;
    const newSongs = [...songs, song];
    setSongs(newSongs);
    await setPlaylistSongs(playlistId, newSongs);
  };

  const removeSong = async (songId: string) => {
    const newSongs = songs.filter(s => s.id !== songId);
    setSongs(newSongs);
    await setPlaylistSongs(playlistId, newSongs);
  };

  if (!playlist) {
    return (
       <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
         <Text style={{ color: colors.text }}>Playlist not found</Text>
       </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={[styles.header, { borderBottomColor: 'rgba(255,255,255,0.05)' }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Icon name="chevron-back" size={26} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>Manage {playlist.name}</Text>
          <Text style={{ fontSize: 13, color: colors.textSecondary }}>{songs.length} tracks</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Find more songs</Text>
          
          <View style={[styles.searchBox, { backgroundColor: colors.surface, borderColor: 'rgba(255,255,255,0.05)' }]}>
            <TextInput
              style={[styles.searchInput, { color: colors.text }]}
              placeholder="Search for tracks to add..."
              placeholderTextColor={colors.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
            />
            <TouchableOpacity 
              style={[styles.searchBtn, { backgroundColor: colors.primary }]}
              onPress={handleSearch}
            >
              {searching ? (
                <Text style={{ color: '#fff' }}>...</Text>
              ) : (
                <Icon name="search" size={20} color="#fff" />
              )}
            </TouchableOpacity>
          </View>

          {searchResults.length > 0 && (
            <View style={styles.resultsList}>
               {searchResults.map(result => (
                 <View key={result.id} style={[styles.resultItem, { backgroundColor: colors.surfaceHighlight }]}>
                    <Image source={{ uri: result.artworkUrl }} style={styles.resultArt} />
                    <View style={styles.resultInfo}>
                      <Text style={[styles.resultTitle, { color: colors.text }]} numberOfLines={1}>{result.title}</Text>
                      <Text style={[styles.resultArtist, { color: colors.textSecondary }]} numberOfLines={1}>{result.artist}</Text>
                    </View>
                    <TouchableOpacity 
                      style={[styles.addBtn, { backgroundColor: colors.primary }]}
                      onPress={() => addSong(result)}
                    >
                      <Icon name="add" size={20} color="#fff" />
                    </TouchableOpacity>
                 </View>
               ))}
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Playlist Songs</Text>
          <View style={styles.songsList}>
            {songs.map((song, i) => (
              <View key={`${song.id}-${i}`} style={[styles.songItem, { backgroundColor: colors.surface }]}>
                 <View style={[styles.indexBox, { backgroundColor: colors.surfaceHighlight }]}>
                   <Text style={[styles.indexText, { color: colors.textSecondary }]}>{i + 1}</Text>
                 </View>
                 <Image source={{ uri: song.artworkUrl }} style={styles.songArt} />
                 <View style={styles.songInfo}>
                    <Text style={[styles.songTitle, { color: colors.text }]} numberOfLines={1}>{song.title}</Text>
                    <Text style={[styles.songArtist, { color: colors.textSecondary }]} numberOfLines={1}>{song.artist}</Text>
                 </View>
                 <TouchableOpacity style={styles.removeBtn} onPress={() => removeSong(song.id)}>
                   <Icon name="trash" size={20} color="#ff4444" />
                 </TouchableOpacity>
              </View>
            ))}
            {songs.length === 0 && (
              <Text style={{ textAlign: 'center', color: colors.textSecondary, marginTop: 20 }}>No songs in this playlist yet.</Text>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingTop: 48,
    borderBottomWidth: 1,
  },
  backBtn: { padding: 4, marginRight: 16 },
  headerInfo: { flex: 1 },
  title: { fontSize: 20, fontWeight: '900' },
  scrollContent: { padding: 20, paddingBottom: 100 },
  section: { marginBottom: 32 },
  sectionTitle: { fontSize: 16, fontWeight: '800', marginBottom: 16 },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 16,
    borderWidth: 1,
  },
  searchInput: { flex: 1, paddingHorizontal: 12, fontSize: 15 },
  searchBtn: { paddingVertical: 10, paddingHorizontal: 20, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  resultsList: { marginTop: 16, gap: 10 },
  resultItem: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 8, paddingRight: 12, borderRadius: 12 },
  resultArt: { width: 44, height: 44, borderRadius: 8 },
  resultInfo: { flex: 1 },
  resultTitle: { fontWeight: '700', fontSize: 14 },
  resultArtist: { fontSize: 12 },
  addBtn: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  songsList: { gap: 10 },
  songItem: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 10, paddingRight: 16, borderRadius: 16 },
  indexBox: { width: 40, height: 40, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  indexText: { fontWeight: '700', fontSize: 14 },
  songArt: { width: 40, height: 40, borderRadius: 8 },
  songInfo: { flex: 1 },
  songTitle: { fontWeight: '700', fontSize: 14 },
  songArtist: { fontSize: 12 },
  removeBtn: { padding: 8 }
});
