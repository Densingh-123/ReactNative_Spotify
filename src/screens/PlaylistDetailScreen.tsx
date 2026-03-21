import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useSearchMusic } from '../hooks/useMusicData';
import { usePlaylists } from '../hooks/usePlaylists';
import { usePlayer } from '../context/PlayerContext';
import { useTheme } from '../context/ThemeContext';
import { SongItem } from '../services/api';
import SkeletonLoader from '../components/ui/SkeletonLoader';
import SongOptionsMenu from '../components/SongOptionsMenu';
import PlaylistPickerModal from '../components/PlaylistPickerModal';
import { useAuth } from '../context/AuthContext';
import { getContrastColor } from '../utils/colors';
import LinearGradient from 'react-native-linear-gradient';

export default function PlaylistDetailScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { user } = useAuth();
  const { playTrack } = usePlayer();
  const { playlists } = usePlaylists();

  const playlistId = route.params?.id;
  const playlistName = route.params?.name || 'Playlist';
  const playlistQuery = route.params?.query || playlistName;
  const playlistColor = route.params?.color || colors.primary;

  const firestorePlaylist = playlists.find(p => p.id === playlistId);
  const { data, isLoading } = useSearchMusic(firestorePlaylist ? '' : playlistQuery);

  const songs: SongItem[] = firestorePlaylist?.songs?.length
    ? firestorePlaylist.songs
    : data?.pages.flatMap(p => p) || [];

  const [selectedSong, setSelectedSong] = useState<SongItem | null>(null);
  const [optionsVisible, setOptionsVisible] = useState(false);
  const [pickerVisible, setPickerVisible] = useState(false);

  const handlePlay = async (item: SongItem) => {
    if (!user) { navigation.navigate('Login'); return; }
    const idx = songs.findIndex(s => s.id === item.id);
    await playTrack(item, songs, Math.max(0, idx));
    navigation.navigate('Player');
  };

  return (
    <View style={styles.container}>
      <LinearGradient 
        colors={[`${playlistColor}55`, 'transparent']} 
        style={styles.headerBackground}
      />
      
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Icon name="chevron-back" size={26} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <View style={[styles.coverContainer, { backgroundColor: playlistColor, shadowColor: playlistColor }]}>
            {songs[0] ? (
              <Image source={{ uri: songs[0].artworkUrl }} style={StyleSheet.absoluteFillObject} />
            ) : (
              <Text style={{ fontSize: 36 }}>🎵</Text>
            )}
          </View>
          <View style={styles.headerInfo}>
            <Text style={[styles.playlistName, { color: colors.text }]} numberOfLines={2}>{playlistName}</Text>
            <Text style={{ fontSize: 14, color: colors.textSecondary, marginTop: 4 }}>{songs.length} songs</Text>
            
            <TouchableOpacity 
              style={[styles.playAllBtn, { backgroundColor: colors.primary }]}
              onPress={() => songs.length > 0 && handlePlay(songs[0])}
            >
              <Icon name="play" size={16} color={getContrastColor(colors.primary)} style={{ marginRight: 8 }} />
              <Text style={{ color: getContrastColor(colors.primary), fontWeight: '700', fontSize: 14 }}>Play All</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {isLoading && !firestorePlaylist ? Array(8).fill(0).map((_, i) => <SkeletonLoader key={i} height={72} style={{ marginBottom: 10, borderRadius: 14 }} />) :
          songs.map((item, idx) => (
            <TouchableOpacity 
              key={`${item.id}-${idx}`}
              activeOpacity={0.8}
              style={[styles.songItem, { backgroundColor: 'transparent' }]}
              onPress={() => handlePlay(item)}
            >
              <Text style={[styles.songIndex, { color: colors.textSecondary }]}>{idx + 1}</Text>
              <Image source={{ uri: item.artworkUrl }} style={styles.songArt} />
              <View style={styles.songInfo}>
                <Text style={[styles.songTitle, { color: colors.text }]} numberOfLines={1}>{item.title}</Text>
                <Text style={{ fontSize: 12, color: colors.textSecondary }} numberOfLines={1}>{item.artist}</Text>
              </View>
              <TouchableOpacity style={styles.moreBtn} onPress={e => { e.stopPropagation(); setSelectedSong(item); setOptionsVisible(true); }}>
                <Icon name="ellipsis-vertical" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </TouchableOpacity>
          ))
        }

        {!isLoading && songs.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={{ fontSize: 48, opacity: 0.4 }}>🎵</Text>
            <Text style={{ color: colors.textSecondary, marginTop: 12 }}>No songs here yet</Text>
          </View>
        )}
      </ScrollView>

      <SongOptionsMenu visible={optionsVisible} onClose={() => setOptionsVisible(false)} song={selectedSong} onAddToPlaylist={() => { setOptionsVisible(false); setPickerVisible(true); }} />
      <PlaylistPickerModal visible={pickerVisible} onClose={() => setPickerVisible(false)} song={selectedSong} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent' },
  headerBackground: { position: 'absolute', top: 0, left: 0, right: 0, height: 300 },
  header: { padding: 16, paddingTop: 48, paddingBottom: 20 },
  backBtn: { padding: 8, alignSelf: 'flex-start', marginBottom: 12 },
  headerContent: { flexDirection: 'row', alignItems: 'flex-end' },
  coverContainer: {
    width: 100, height: 100, borderRadius: 20, overflow: 'hidden',
    justifyContent: 'center', alignItems: 'center', elevation: 8,
    shadowOffset: {width: 0, height: 8}, shadowOpacity: 0.4, shadowRadius: 24
  },
  headerInfo: { flex: 1, marginLeft: 16, paddingBottom: 4 },
  playlistName: { fontSize: 24, fontWeight: '900' },
  playAllBtn: { flexDirection: 'row', alignItems: 'center', marginTop: 14, paddingVertical: 10, paddingHorizontal: 28, borderRadius: 25, alignSelf: 'flex-start' },
  scrollContent: { padding: 16, paddingBottom: 130 },
  songItem: { flexDirection: 'row', alignItems: 'center', padding: 10, borderRadius: 14, marginBottom: 4 },
  songIndex: { width: 24, textAlign: 'center', fontSize: 15, fontWeight: '700' },
  songArt: { width: 52, height: 52, borderRadius: 12, marginLeft: 10 },
  songInfo: { flex: 1, marginLeft: 14 },
  songTitle: { fontWeight: '700', fontSize: 14, marginBottom: 2 },
  moreBtn: { padding: 8 },
  emptyState: { alignItems: 'center', paddingTop: 60 }
});
