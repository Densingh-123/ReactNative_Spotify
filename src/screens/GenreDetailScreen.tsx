import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../context/ThemeContext';
import { usePlayer } from '../context/PlayerContext';
import { searchSongs, SongItem } from '../services/api';
import { useAuth } from '../context/AuthContext';
import GlassCard from '../components/ui/GlassCard';

export default function GenreDetailScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { category } = route.params || { category: 'Songs' };
  const { colors } = useTheme();
  const { playTrack } = usePlayer();
  const { preferences } = useAuth();
  
  const [songs, setSongs] = useState<SongItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSongs();
  }, [category]);

  const fetchSongs = async () => {
    setLoading(true);
    try {
      // Fetch 50 songs for this category, filtered by preferred languages
      const results = await searchSongs(category, 50, preferences?.languages);
      setSongs(results);
    } catch (error) {
      console.error('Error fetching genre songs:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderSongItem = ({ item, index }: { item: SongItem, index: number }) => (
    <TouchableOpacity 
      style={styles.songCard} 
      onPress={() => playTrack(item, songs, index)}
    >
      <Image source={{ uri: item.artworkUrl }} style={styles.songArt} />
      <View style={styles.songInfo}>
        <Text style={[styles.songTitle, { color: colors.text }]} numberOfLines={1}>{item.title}</Text>
        <Text style={[styles.songArtist, { color: colors.textSecondary }]} numberOfLines={1}>{item.artist}</Text>
      </View>
      <Icon name="play-circle" size={28} color={colors.primary} />
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Icon name="arrow-back" size={28} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>{category}</Text>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={{ color: colors.textSecondary, marginTop: 12 }}>Loading {category}...</Text>
        </View>
      ) : (
        <FlatList
          data={songs}
          keyExtractor={(item) => item.id}
          renderItem={renderSongItem}
          contentContainerStyle={styles.listContent}
          initialNumToRender={10}
          maxToRenderPerBatch={10}
          windowSize={5}
          ListEmptyComponent={
            <View style={styles.centered}>
              <Icon name="musical-notes-outline" size={64} color={colors.textSecondary} />
              <Text style={{ color: colors.textSecondary, marginTop: 12 }}>No songs found for this category</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: 16, 
    paddingTop: 48,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  backBtn: { marginRight: 16 },
  headerTitle: { fontSize: 22, fontWeight: '900' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  listContent: { padding: 16, paddingBottom: 100 },
  songCard: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 16,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 12,
    padding: 8,
  },
  songArt: { width: 50, height: 50, borderRadius: 8 },
  songInfo: { flex: 1, marginLeft: 12 },
  songTitle: { fontSize: 16, fontWeight: '700', marginBottom: 2 },
  songArtist: { fontSize: 13 },
});
