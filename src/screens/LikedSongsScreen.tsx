import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useLikes } from '../hooks/useLikes';
import { usePlayer } from '../context/PlayerContext';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { SongItem } from '../services/api';
import SongOptionsMenu from '../components/SongOptionsMenu';
import PlaylistPickerModal from '../components/PlaylistPickerModal';
import LinearGradient from 'react-native-linear-gradient';

export default function LikedSongsScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const { likedSongs } = useLikes();
  const { playTrack } = usePlayer();
  
  const [selectedSong, setSelectedSong] = useState<SongItem | null>(null);
  const [optionsVisible, setOptionsVisible] = useState(false);
  const [pickerVisible, setPickerVisible] = useState(false);

  const handlePlay = async (item: SongItem) => {
    if (!user) { navigation.navigate('Login'); return; }
    const idx = likedSongs.findIndex(s => s.id === item.id);
    await playTrack(item, likedSongs, Math.max(0, idx));
    navigation.navigate('Player');
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#e91e6333', 'transparent']} style={styles.headerBackground} />
      
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Icon name="chevron-back" size={26} color={colors.text} />
        </TouchableOpacity>
        <Icon name="heart" size={28} color="#e91e63" />
        <View style={styles.headerInfo}>
          <Text style={[styles.title, { color: colors.text }]}>Liked Songs</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{likedSongs.length} songs</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {likedSongs.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={{ fontSize: 56 }}>💔</Text>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No liked songs yet. Tap ♥ on any song!</Text>
          </View>
        ) : likedSongs.map((item, idx) => (
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
            <TouchableOpacity style={styles.moreBtn} onPress={e => { e.stopPropagation(); setSelectedSong(item); setOptionsVisible(true); }}>
              <Icon name="ellipsis-vertical" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <SongOptionsMenu visible={optionsVisible} onClose={() => setOptionsVisible(false)} song={selectedSong} onAddToPlaylist={() => { setOptionsVisible(false); setPickerVisible(true); }} />
      <PlaylistPickerModal visible={pickerVisible} onClose={() => setPickerVisible(false)} song={selectedSong} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent' },
  headerBackground: { position: 'absolute', top: 0, left: 0, right: 0, height: 150 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingTop: 48,
    marginBottom: 8,
  },
  backBtn: { padding: 4, marginRight: 10 },
  headerInfo: { marginLeft: 14 },
  title: { fontSize: 22, fontWeight: '900' },
  subtitle: { fontSize: 13, marginTop: 2 },
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
  moreBtn: { padding: 8 }
});
