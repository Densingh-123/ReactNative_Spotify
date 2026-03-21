import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, StyleSheet, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { searchMusic, SongItem } from '../services/api';
import { usePlayer } from '../context/PlayerContext';
import { useTheme } from '../context/ThemeContext';
import SkeletonLoader from '../components/ui/SkeletonLoader';
import SongOptionsMenu from '../components/SongOptionsMenu';
import PlaylistPickerModal from '../components/PlaylistPickerModal';
import LinearGradient from 'react-native-linear-gradient';

export default function ArtistScreen() {
  const route = useRoute<any>();
  const name = route.params?.name || '';
  const navigation = useNavigation<any>();
  const { colors } = useTheme();
  const { playTrack } = usePlayer();
  
  const [songs, setSongs] = useState<SongItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSong, setSelectedSong] = useState<SongItem | null>(null);
  const [optionsVisible, setOptionsVisible] = useState(false);
  const [pickerVisible, setPickerVisible] = useState(false);

  useEffect(() => {
    if (!name) return;
    setLoading(true);
    searchMusic(name)
      .then(res => {
        setSongs(res);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [name]);

  const handlePlay = (song: SongItem) => {
    playTrack(song, songs, songs.indexOf(song));
    navigation.navigate('Player');
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={[colors.surfaceHighlight, 'transparent']} style={styles.headerGradient} />
      
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Icon name="chevron-back" size={26} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Artist</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.profileSection}>
          <View style={[styles.avatarBox, { backgroundColor: colors.surface, shadowColor: colors.primary }]}>
            {songs[0]?.artworkUrl ? (
              <Image source={{ uri: songs[0].artworkUrl }} style={StyleSheet.absoluteFillObject} />
            ) : (
              <Icon name="person" size={48} color={colors.textSecondary} />
            )}
          </View>
          <Text style={[styles.artistName, { color: colors.text }]}>{name}</Text>
          <Text style={[styles.trackCount, { color: colors.textSecondary }]}>{songs.length} Tracks</Text>
        </View>

        <View style={styles.topSongsSection}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Top Songs</Text>
            <TouchableOpacity 
              style={[styles.playBtn, { backgroundColor: colors.primary }]}
              onPress={() => songs[0] && handlePlay(songs[0])}
            >
              <Icon name="play" size={20} color="#fff" style={{ marginLeft: 2 }} />
            </TouchableOpacity>
          </View>

          <View style={styles.songsList}>
            {loading ? (
              Array(5).fill(0).map((_, i) => <SkeletonLoader key={i} height={64} style={{ borderRadius: 12, marginBottom: 12 }} />)
            ) : (
              songs.map((song, idx) => (
                <TouchableOpacity 
                  key={song.id} 
                  activeOpacity={0.8}
                  style={[styles.songItem, { backgroundColor: colors.surface }]}
                  onPress={() => handlePlay(song)}
                >
                  <Image source={{ uri: song.artworkUrl }} style={styles.songArt} />
                  <View style={styles.songInfo}>
                    <Text style={[styles.songTitle, { color: colors.text }]} numberOfLines={1}>{song.title}</Text>
                    <Text style={[styles.songArtist, { color: colors.textSecondary }]} numberOfLines={1}>{song.artist}</Text>
                  </View>
                  <TouchableOpacity 
                    style={styles.moreBtn}
                    onPress={(e) => { e.stopPropagation(); setSelectedSong(song); setOptionsVisible(true); }}
                  >
                    <Icon name="ellipsis-horizontal" size={20} color={colors.textSecondary} />
                  </TouchableOpacity>
                </TouchableOpacity>
              ))
            )}
            
            {!loading && songs.length === 0 && (
              <Text style={{ textAlign: 'center', color: colors.textSecondary, marginTop: 20 }}>No songs found for this artist.</Text>
            )}
          </View>
        </View>
      </ScrollView>

      <SongOptionsMenu 
        visible={optionsVisible} 
        onClose={() => setOptionsVisible(false)} 
        song={selectedSong} 
        onAddToPlaylist={() => { setOptionsVisible(false); setPickerVisible(true); }} 
      />
      <PlaylistPickerModal 
        visible={pickerVisible} 
        onClose={() => setPickerVisible(false)} 
        song={selectedSong} 
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent' },
  headerGradient: { position: 'absolute', top: 0, left: 0, right: 0, height: 200 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingTop: 48,
  },
  backBtn: { padding: 4, marginRight: 12 },
  title: { fontSize: 24, fontWeight: '900' },
  scrollContent: { padding: 16, paddingBottom: 100 },
  profileSection: { alignItems: 'center', marginBottom: 32, marginTop: 16 },
  avatarBox: {
    width: 120, height: 120, borderRadius: 60, overflow: 'hidden',
    justifyContent: 'center', alignItems: 'center', marginBottom: 16,
    elevation: 8, shadowOffset: {width: 0, height: 8}, shadowOpacity: 0.3, shadowRadius: 24
  },
  artistName: { fontSize: 32, fontWeight: '900', marginBottom: 4 },
  trackCount: { fontSize: 14 },
  topSongsSection: { marginBottom: 24 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '800' },
  playBtn: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  songsList: { flexDirection: 'column' },
  songItem: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 8, borderRadius: 12, marginBottom: 12 },
  songArt: { width: 48, height: 48, borderRadius: 8 },
  songInfo: { flex: 1 },
  songTitle: { fontSize: 15, fontWeight: '600', marginBottom: 2 },
  songArtist: { fontSize: 12 },
  moreBtn: { padding: 8 }
});
