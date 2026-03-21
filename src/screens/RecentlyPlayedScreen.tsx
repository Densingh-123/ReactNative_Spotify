import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { doc, deleteDoc } from 'firebase/firestore';
import { db } from '../services/firebaseConfig';
import { useRecentlyPlayed } from '../hooks/useRecentlyPlayed';
import { usePlayer } from '../context/PlayerContext';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { SongItem } from '../services/api';
import SkeletonLoader from '../components/ui/SkeletonLoader';

export default function RecentlyPlayedScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const { recentlyPlayed, loading } = useRecentlyPlayed(50);
  const { playTrack } = usePlayer();

  const handlePlay = async (item: SongItem) => {
    if (!user) { navigation.navigate('Login'); return; }
    const idx = recentlyPlayed.findIndex(s => s.id === item.id);
    await playTrack(item, recentlyPlayed, Math.max(0, idx));
    navigation.navigate('Player');
  };

  const handleRemove = async (songId: string) => {
    if (!user) return;
    try {
      const docId = `${user.uid}_${songId}`;
      await deleteDoc(doc(db, 'recentlyPlayed', docId));
    } catch (err) {
      console.error('Failed to remove from history:', err);
    }
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { borderBottomColor: 'rgba(255,255,255,0.05)' }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Icon name="chevron-back" size={26} color={colors.text} />
        </TouchableOpacity>
        <Icon name="time" size={24} color={colors.primary} />
        <Text style={[styles.title, { color: colors.text }]}>Recently Played</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {loading ? Array(8).fill(0).map((_, i) => <SkeletonLoader key={i} height={72} style={{ marginBottom: 10, borderRadius: 14 }} />) :
          recentlyPlayed.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={{ fontSize: 56 }}>⏳</Text>
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No history yet. Start listening!</Text>
            </View>
          ) : recentlyPlayed.map((item, idx) => (
            <TouchableOpacity 
              key={`${item.id}-${idx}`}
              activeOpacity={0.8}
              style={styles.songItem}
              onPress={() => handlePlay(item)}
            >
              <Image source={{ uri: item.artworkUrl }} style={styles.songArt} />
              <View style={styles.songInfo}>
                <Text style={[styles.songTitle, { color: colors.text }]} numberOfLines={1}>{item.title}</Text>
                <Text style={[styles.songArtist, { color: colors.textSecondary }]} numberOfLines={1}>{item.artist}</Text>
              </View>
              <TouchableOpacity 
                style={styles.removeBtn} 
                onPress={e => { e.stopPropagation(); handleRemove(item.id); }}
              >
                <Icon name="trash-outline" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </TouchableOpacity>
          ))
        }
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
  backBtn: { padding: 4, marginRight: 10 },
  title: { fontSize: 22, fontWeight: '900', marginLeft: 14 },
  scrollContent: { padding: 16, paddingBottom: 130 },
  emptyState: { alignItems: 'center', paddingTop: 80 },
  emptyText: { marginTop: 16, fontSize: 14, textAlign: 'center' },
  songItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 14,
    marginBottom: 4,
  },
  songArt: { width: 52, height: 52, borderRadius: 12 },
  songInfo: { flex: 1, marginLeft: 14 },
  songTitle: { fontWeight: '700', fontSize: 14, marginBottom: 2 },
  songArtist: { fontSize: 12 },
  removeBtn: { padding: 8 }
});
