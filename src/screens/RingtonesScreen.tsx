import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, StyleSheet, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useRingtones } from '../hooks/useRingtones';
import { usePlayer } from '../context/PlayerContext';
import { fetchTrendingRingtones, searchRingtones, SongItem } from '../services/api';
import SkeletonLoader from '../components/ui/SkeletonLoader';

export default function RingtonesScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation<any>();
  const { user, preferences } = useAuth();
  const { playTrack, currentTrack, isPlaying: isGlobalPlaying, pause } = usePlayer();
  const { toggleLikeRingtone, isRingtoneLiked } = useRingtones();

  const [searchQuery, setSearchQuery] = useState('');
  const [songs, setSongs] = useState<SongItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim()) {
        performSearch(searchQuery);
      } else {
        loadTrending();
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const loadTrending = async () => {
    setLoading(true);
    const results = await fetchTrendingRingtones(preferences?.languages);
    setSongs(results);
    setLoading(false);
  };

  const performSearch = async (query: string) => {
    setLoading(true);
    const results = await searchRingtones(query, preferences?.languages);
    setSongs(results);
    setLoading(false);
  };

  const togglePlay = async (song: SongItem) => {
    if (!user) { navigation.navigate('Login'); return; }
    if (currentTrack?.id === song.id && isGlobalPlaying) {
      pause();
    } else {
      await playTrack(song, songs);
    }
  };

  const isPlaying = (id: string) => currentTrack?.id === id && isGlobalPlaying;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Icon name="chevron-back" size={26} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Ringtones</Text>
      </View>

      <View style={styles.searchContainer}>
        <View style={[styles.searchInputWrapper, { backgroundColor: colors.surface, borderColor: 'rgba(255,255,255,0.1)' }]}>
          <Icon name="search" size={20} color={colors.textSecondary} />
          <TextInput 
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search ringtones..." 
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          {searchQuery ? 'Search Results' : 'Trending Previews'}
        </Text>

        <View style={styles.listContainer}>
          {loading ? (
            Array(8).fill(0).map((_, i) => <SkeletonLoader key={i} height={80} style={{ borderRadius: 16, marginBottom: 12 }} />)
          ) : (
            songs.map((song) => (
              <View 
                key={song.id}
                style={[styles.songCard, { backgroundColor: colors.surface }]}
              >
                <TouchableOpacity 
                  activeOpacity={0.8}
                  onPress={() => togglePlay(song)}
                  style={styles.artBox}
                >
                  <Image source={{ uri: song.artworkUrl }} style={StyleSheet.absoluteFillObject} />
                  <View style={[styles.playOverlay, { backgroundColor: isPlaying(song.id) ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.2)' }]}>
                    <Icon name={isPlaying(song.id) ? "pause" : "play"} size={24} color="#fff" style={{ marginLeft: isPlaying(song.id) ? 0 : 2 }} />
                  </View>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.infoBox}
                  onPress={() => navigation.navigate('RingtoneEdit', { song })}
                >
                  <Text style={[styles.songTitle, { color: colors.text }]} numberOfLines={1}>{song.title}</Text>
                  <Text style={[styles.songArtist, { color: colors.textSecondary }]} numberOfLines={1}>{song.artist}</Text>
                </TouchableOpacity>

                <View style={styles.actionBox}>
                  <TouchableOpacity style={styles.iconBtn} onPress={() => toggleLikeRingtone(song)}>
                    <Icon name={isRingtoneLiked(song.id) ? "heart" : "heart-outline"} size={22} color={isRingtoneLiked(song.id) ? "#e91e63" : colors.textSecondary} />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.navigate('RingtoneEdit', { song })}>
                    <Icon name="cut" size={22} color={colors.primary} />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.iconBtn}>
                    <Icon name="notifications" size={22} color={colors.textSecondary} />
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}

          {!loading && songs.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={{ fontSize: 48, marginBottom: 12, opacity: 0.3 }}>🎧</Text>
              <Text style={{ color: colors.textSecondary }}>No ringtones found for "{searchQuery}"</Text>
            </View>
          )}
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
  },
  backBtn: { padding: 4, marginRight: 12 },
  title: { fontSize: 24, fontWeight: '900' },
  searchContainer: { paddingHorizontal: 20, paddingBottom: 20 },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderRadius: 16,
    height: 50,
    borderWidth: 1,
  },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 16 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 130 },
  sectionTitle: { fontSize: 18, fontWeight: '800', marginBottom: 16 },
  listContainer: { paddingBottom: 20 },
  songCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 16,
    marginBottom: 12,
    elevation: 4,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 12
  },
  artBox: { width: 56, height: 56, borderRadius: 12, overflow: 'hidden' },
  playOverlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center' },
  infoBox: { flex: 1, marginHorizontal: 12 },
  songTitle: { fontSize: 16, fontWeight: '700', marginBottom: 2 },
  songArtist: { fontSize: 13 },
  actionBox: { flexDirection: 'row', alignItems: 'center' },
  iconBtn: { padding: 6, marginLeft: 2 },
  emptyState: { alignItems: 'center', paddingVertical: 40 }
});
