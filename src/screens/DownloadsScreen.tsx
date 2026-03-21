import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../context/ThemeContext';
import { useDownloads } from '../hooks/useDownloads';
import { usePlayer } from '../context/PlayerContext';
import SkeletonLoader from '../components/ui/SkeletonLoader';
import LinearGradient from 'react-native-linear-gradient';

export default function DownloadsScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation<any>();
  const { downloadedSongs, loading, removeDownloadRecord } = useDownloads();
  const { playTrack, currentTrack, isPlaying } = usePlayer();

  const handlePlay = (song: any, index: number) => {
    playTrack({ ...song, isLocal: true }, downloadedSongs, index);
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={[`${colors.primary}22`, 'transparent']} style={styles.headerGradient} />
      
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Icon name="chevron-back" size={28} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <View style={styles.titleRow}>
            <Icon name="download" size={22} color={colors.primary} />
            <Text style={[styles.title, { color: colors.text }]}>Offline Library</Text>
          </View>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {downloadedSongs.length} songs available for offline play
          </Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {loading ? (
          <View>
            {[1, 2, 3, 4, 5].map(i => (
              <View key={i} style={styles.loaderItem}>
                <SkeletonLoader height={64} width={64} style={{ borderRadius: 16 }} />
                <View style={{ flex: 1, marginLeft: 16 }}>
                  <SkeletonLoader height={20} width="60%" style={{ marginBottom: 8 }} />
                  <SkeletonLoader height={14} width="40%" />
                </View>
              </View>
            ))}
          </View>
        ) : downloadedSongs.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={[styles.emptyIconBox, { backgroundColor: colors.surfaceHighlight }]}>
              <Text style={{ fontSize: 50 }}>📥</Text>
            </View>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>Empty Vault</Text>
            <Text style={[styles.emptyDesc, { color: colors.textSecondary }]}>
              Your offline downloads will appear here. Tap the details menu on any track and select Download Song.
            </Text>
            <TouchableOpacity 
              style={[styles.discoverBtn, { backgroundColor: colors.primary, shadowColor: colors.primary }]}
              onPress={() => navigation.navigate('MainTabs', { screen: 'Search' })}
            >
              <Text style={{ color: '#fff', fontWeight: '800', fontSize: 15 }}>Discover Music</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View>
            {downloadedSongs.map((song: any, index) => {
              const isActive = currentTrack?.id === song.id;
              return (
                <TouchableOpacity
                  activeOpacity={0.8}
                  key={song.id}
                  style={[
                    styles.songCard,
                    { 
                      backgroundColor: isActive ? colors.primary + '15' : colors.surface,
                      borderColor: isActive ? colors.primary + '44' : 'rgba(255,255,255,0.05)'
                    }
                  ]}
                  onPress={() => handlePlay(song, index)}
                >
                  <View style={styles.artBox}>
                    <Image source={{ uri: song.artworkUrl }} style={StyleSheet.absoluteFillObject} />
                    {isActive && (
                      <View style={[StyleSheet.absoluteFillObject, styles.activeOverlay]}>
                        {!isPlaying ? (
                          <Icon name="play" color="#fff" size={24} style={{ marginLeft: 3 }} />
                        ) : (
                          <Text style={{ color: '#fff' }}>Playing..</Text>
                        )}
                      </View>
                    )}
                  </View>

                  <View style={styles.infoBox}>
                    <Text style={[styles.songTitle, { color: isActive ? colors.primary : colors.text }]} numberOfLines={1}>
                      {song.title}
                    </Text>
                    
                    <View style={styles.metaRow}>
                      <Text style={[styles.artist, { color: colors.textSecondary }]} numberOfLines={1}>{song.artist}</Text>
                      <View style={[styles.dot, { backgroundColor: colors.textSecondary }]} />
                      <Icon name="disc-outline" size={12} color={colors.textSecondary} />
                      <Text style={[styles.album, { color: colors.textSecondary }]} numberOfLines={1}>{song.album}</Text>
                    </View>

                    <View style={styles.badgeRow}>
                      <View style={[styles.badge, { backgroundColor: colors.primary + '22' }]}>
                        <Icon name="download" size={10} color={colors.primary} />
                        <Text style={[styles.badgeText, { color: colors.primary }]}>OFFLINE READY</Text>
                      </View>
                      <View style={styles.dateRow}>
                        <Icon name="time-outline" size={12} color={colors.textSecondary} />
                        <Text style={[styles.dateText, { color: colors.textSecondary }]}>{new Date(song.downloadedAt).toLocaleDateString()}</Text>
                      </View>
                    </View>
                  </View>

                  <TouchableOpacity 
                    style={[styles.removeBtn, { backgroundColor: 'rgba(255,255,255,0.05)' }]}
                    onPress={e => { e.stopPropagation(); removeDownloadRecord(song.id); }}
                  >
                    <Icon name="trash-outline" size={20} color={colors.textSecondary} />
                  </TouchableOpacity>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent' },
  headerGradient: { position: 'absolute', top: 0, left: 0, right: 0, height: 180 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 24,
    paddingTop: 48,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  backBtn: { padding: 4, marginRight: 16 },
  headerInfo: { flex: 1 },
  titleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  title: { fontSize: 24, fontWeight: '900', marginLeft: 10 },
  subtitle: { fontSize: 13, fontWeight: '600' },
  scrollContent: { padding: 16, paddingBottom: 130 },
  loaderItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  emptyState: { alignItems: 'center', marginTop: 60, paddingHorizontal: 20 },
  emptyIconBox: {
    width: 120, height: 120, borderRadius: 60,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 24, elevation: 12, shadowOffset: {width: 0, height: 8}, shadowOpacity: 0.3, shadowRadius: 24
  },
  emptyTitle: { fontSize: 20, fontWeight: '800', marginBottom: 8 },
  emptyDesc: { fontSize: 14, textAlign: 'center', lineHeight: 22, maxWidth: 280, marginBottom: 24 },
  discoverBtn: {
    paddingVertical: 14, paddingHorizontal: 32, borderRadius: 24,
    elevation: 8, shadowOffset: {width: 0, height: 8}, shadowOpacity: 0.4, shadowRadius: 16
  },
  songCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 24,
    borderWidth: 1,
    marginBottom: 16,
  },
  artBox: { width: 64, height: 64, borderRadius: 16, overflow: 'hidden' },
  activeOverlay: { backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' },
  infoBox: { flex: 1, marginLeft: 16 },
  songTitle: { fontSize: 17, fontWeight: '800', marginBottom: 4 },
  metaRow: { flexDirection: 'row', alignItems: 'center' },
  artist: { fontSize: 13, fontWeight: '600' },
  dot: { width: 3, height: 3, borderRadius: 1.5, opacity: 0.5, marginHorizontal: 8 },
  album: { fontSize: 11, marginLeft: 4 },
  badgeRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  badge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  badgeText: { fontSize: 10, fontWeight: '900', marginLeft: 4 },
  dateRow: { flexDirection: 'row', alignItems: 'center', marginLeft: 12 },
  dateText: { fontSize: 11, marginLeft: 4 },
  removeBtn: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginLeft: 12 }
});
