import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, StyleSheet, Modal, ActivityIndicator, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTrendingMusic } from '../hooks/useMusicData';
import { useRecentlyPlayed } from '../hooks/useRecentlyPlayed';
import { useAuth } from '../context/AuthContext';
import { usePlayer } from '../context/PlayerContext';
import { SongItem, fetchMoodSongs } from '../services/api';
import { useTheme } from '../context/ThemeContext';
import SongCard from '../components/ui/SongCard';
import SkeletonLoader from '../components/ui/SkeletonLoader';
import SongOptionsMenu from '../components/SongOptionsMenu';
import PlaylistPickerModal from '../components/PlaylistPickerModal';
import GlassCard from '../components/ui/GlassCard';
import LinearGradient from 'react-native-linear-gradient';
import { getFestiveGreeting } from '../utils/festivals';
import { getContrastColor } from '../utils/colors';
import { triggerFestiveNotification } from '../services/notificationService';

// YouTube Music-style mood filter chips
const MOOD_FILTERS = [
  { label: 'All', icon: 'musical-notes' },
  { label: 'Podcasts', icon: 'mic' },
  { label: 'Romance', icon: 'heart' },
  { label: 'Relax', icon: 'leaf' },
  { label: 'Feel good', icon: 'happy' },
  { label: 'Energise', icon: 'flash' },
  { label: 'Commute', icon: 'car' },
  { label: 'Party', icon: 'beer' },
  { label: 'Work out', icon: 'barbell' },
  { label: 'Sad', icon: 'rainy' },
  { label: 'Focus', icon: 'bulb' },
  { label: 'Sleep', icon: 'moon' },
];

const LANGUAGES = [
  'English', 'Hindi', 'Tamil', 'Telugu', 'Kannada', 'Marathi', 'Bengali', 'Malayalam', 'Punjabi'
];

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

/** Unique dedup by song ID */
const uniqueSongs = (songs: SongItem[]) =>
  Array.from(new Map(songs.map(s => [s.id, s])).values());

// Global cache to preserve the user's selected Home tab across screen navigation/unmounts
let globalActiveFilter = 'All';
let globalFilteredSongs: SongItem[] = [];

export default function HomeScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation<any>();
  const { user, preferences, updateLanguages } = useAuth();

  const rawName = user?.displayName || user?.email?.split('@')[0] || 'Friend';
  const cleanName = rawName.replace(/[0-9]/g, '') || 'Friend';
  const firstName = cleanName.split(' ')[0].charAt(0).toUpperCase() + cleanName.split(' ')[0].slice(1).toLowerCase();
  const festiveGreeting = getFestiveGreeting(firstName);
  const greetingText = festiveGreeting ? festiveGreeting : `Hi ${firstName}, ${getGreeting()}`;

  useEffect(() => {
    if (festiveGreeting) triggerFestiveNotification(festiveGreeting);
  }, [festiveGreeting]);

  const { playTrack } = usePlayer();
  const userLangs = preferences?.languages?.length ? preferences.languages : ['English', 'Tamil', 'Hindi'];
  const { data: trending, isLoading } = useTrendingMusic(userLangs);
  const { recentlyPlayed } = useRecentlyPlayed(12);

  const [activeFilter, setActiveFilter] = useState(globalActiveFilter);
  const [filteredSongs, setFilteredSongs] = useState<SongItem[]>(globalFilteredSongs);
  const [filterLoading, setFilterLoading] = useState(false);

  const [selectedSong, setSelectedSong] = useState<SongItem | null>(null);
  const [optionsVisible, setOptionsVisible] = useState(false);
  const [pickerVisible, setPickerVisible] = useState(false);
  const [langModalVisible, setLangModalVisible] = useState(false);

  // Handle mood filter chip selection
  const handleFilterSelect = useCallback(async (filter: string) => {
    setActiveFilter(filter);
    globalActiveFilter = filter;
    if (filter === 'All') {
      setFilteredSongs([]);
      globalFilteredSongs = [];
      return;
    }
    setFilterLoading(true);
    try {
      const songs = await fetchMoodSongs(filter, userLangs);
      const deduped = uniqueSongs(songs);
      setFilteredSongs(deduped);
      globalFilteredSongs = deduped;
    } catch (e) {
      console.warn('Failed to load mood songs', e);
    } finally {
      setFilterLoading(false);
    }
  }, [userLangs]);

  // All songs from trending feed, deduplicated
  const allTrending = uniqueSongs(trending || []);

  // Derive YTM-style named sections from trending feed using safe modular slicing
  const safeSlice = (arr: SongItem[], seed: number) => {
    if (!arr.length) return [];
    const offset = (seed * 17) % arr.length;
    const result = [];
    for(let i = 0; i < Math.min(25, arr.length); i++) {
      result.push(arr[(offset + i) % arr.length]);
    }
    return result;
  };

  const featuredNow    = safeSlice(allTrending, 1);
  const quickPicks     = safeSlice(allTrending, 2);
  const freshFinds     = safeSlice(allTrending, 3);
  const newReleases    = safeSlice(allTrending, 4);
  const oldFavourites  = safeSlice(allTrending, 5);
  const topCharts      = safeSlice(allTrending, 6);
  const topAlbums      = safeSlice(allTrending, 7);
  const trendingSongs  = allTrending; // User request: Show ALL songs in Trending Now
  
  const listenAgain    = uniqueSongs(recentlyPlayed).slice(0, 25);

  // Extract unique artists
  const topArtists = Array.from(
    new Map(allTrending.map(item => [item.artist, item])).values()
  ).slice(0, 25);

  const handlePlay = async (track: SongItem, fallbackList: SongItem[]) => {
    if (!user) { navigation.navigate('Login'); return; }
    
    // Use the massive ~250 item lists for a deep queue
    let queue = activeFilter !== 'All' ? displaySongs : allTrending;
    
    // If the massive queue lacks the selected track (e.g. Listen Again), unshift it
    if (!queue.find(s => s.id === track.id)) {
      queue = [...fallbackList, ...queue];
    }
    
    const deduped = uniqueSongs(queue);
    const idx = deduped.findIndex(s => s.id === track.id);
    await playTrack(track, deduped, Math.max(0, idx));
    navigation.navigate('Player');
  };

  const openOptions = (song: SongItem) => { setSelectedSong(song); setOptionsVisible(true); };
  const openPicker = () => { setOptionsVisible(false); setPickerVisible(true); };

  // Songs to show (filtered or trending)
  const displaySongs = activeFilter !== 'All' ? filteredSongs : [];

  const renderSection = (title: string, songs: SongItem[], icon?: string, noMargin?: boolean) => {
    if (!songs || songs.length === 0) return null;
    return (
      <View style={[styles.section, noMargin && { marginBottom: 0 }]}>
        <View style={styles.sectionHeaderRow}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {icon ? `${icon}  ` : ''}{title}
          </Text>
        </View>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={songs}
          keyExtractor={(item, index) => `${title}-${item.id}-${index}`}
          initialNumToRender={4}
          maxToRenderPerBatch={4}
          windowSize={3}
          renderItem={({ item }) => (
            <SongCard
              item={item}
              onPress={() => handlePlay(item, songs)}
              onMorePress={() => openOptions(item)}
            />
          )}
        />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 65 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={[styles.logoIcon, { backgroundColor: colors.primary + '22', borderColor: colors.primary + '44' }]}>
              <Icon name="musical-notes" size={24} color={colors.primary} />
            </View>
            <View>
              <Text style={[styles.greeting, { color: colors.textSecondary }]}>
                {greetingText}{' '}
                <Icon name="hand-right" size={14} color={colors.primary} />
              </Text>
              <Text style={[styles.brand, { color: colors.text }]}>Melodify</Text>
            </View>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.iconBtn} onPress={() => setLangModalVisible(true)}>
              <Icon name="globe-outline" size={22} color={colors.text} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.navigate('Settings')}>
              <Icon name="settings-outline" size={22} color={colors.text} />
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Mood Filter Chips (YouTube Music style) ── */}
        {/* ── Genres & Moods ── */}
        <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 10, marginBottom: 12 }]}>Genres & Moods</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterRow}
          contentContainerStyle={{ paddingBottom: 4 }}
        >
          {MOOD_FILTERS.map(f => {
            const isActive = activeFilter === f.label;
            const activeTextColor = getContrastColor(colors.primary);
            return (
              <TouchableOpacity
                key={f.label}
                onPress={() => handleFilterSelect(f.label)}
                style={[
                  styles.filterChip,
                  {
                    backgroundColor: isActive ? colors.primary : colors.surface,
                    borderColor: isActive ? colors.primary : 'rgba(255,255,255,0.12)',
                  }
                ]}
              >
                <Icon name={f.icon as any} size={14} color={isActive ? activeTextColor : colors.textSecondary} style={{ marginRight: 5 }} />
                <Text style={[styles.filterChipText, { color: isActive ? activeTextColor : colors.text }]}>
                  {f.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* ── Always Visible Top Sections ── */}
        {featuredNow.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Featured Today</Text>
            <FlatList 
              horizontal 
              showsHorizontalScrollIndicator={false}
              data={(isLoading ? [0, 1, 2] : featuredNow) as any}
              keyExtractor={(item, i) => isLoading ? `feat-skel-${i}` : `feat-${(item as SongItem).id}`}
              initialNumToRender={2}
              renderItem={({ item }) => {
                if (isLoading) return <SkeletonLoader width={280} height={200} style={{ borderRadius: 22, marginRight: 14 }} />;
                const song = item as SongItem;
                return (
                  <TouchableOpacity activeOpacity={0.9} style={styles.featuredCard} onPress={() => handlePlay(song, featuredNow)}>
                    <Image source={{ uri: song.artworkUrl }} style={StyleSheet.absoluteFillObject} />
                    <LinearGradient colors={['transparent', 'rgba(0,0,0,0.9)']} style={styles.featuredGradient}>
                      <View style={[styles.badge, { backgroundColor: colors.primary }]}><Text style={styles.badgeText}>FEATURED</Text></View>
                      <Text style={styles.featuredTitle} numberOfLines={1}>{song.title}</Text>
                      <Text style={styles.featuredArtist} numberOfLines={1}>{song.artist}</Text>
                      <View style={styles.featuredControls}>
                        <View style={[styles.featuredPlay, { backgroundColor: colors.primary }]}><Icon name="play" size={18} color={getContrastColor(colors.primary)} /></View>
                        <TouchableOpacity onPress={e => { e.stopPropagation(); openOptions(song); }}><Icon name="ellipsis-horizontal" size={24} color="rgba(255,255,255,0.8)" /></TouchableOpacity>
                      </View>
                    </LinearGradient>
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        )}

        {listenAgain.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <Text style={[styles.sectionTitle, { color: colors.text, marginBottom: 0 }]}>Listen Again</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Library', { screen: 'RecentlyPlayed' })}>
                <Text style={styles.seeAll}>See All <Icon name="chevron-forward" size={12} color="#aaa" /></Text>
              </TouchableOpacity>
            </View>
            <FlatList 
              horizontal 
              showsHorizontalScrollIndicator={false}
              data={listenAgain}
              keyExtractor={item => `listen-${item.id}`}
              initialNumToRender={4}
              renderItem={({ item }) => (
                <SongCard item={item} onPress={() => handlePlay(item, listenAgain)} onMorePress={() => openOptions(item)} />
              )}
            />
          </View>
        )}

        {/* Mood-filtered full page content */}
        {activeFilter !== 'All' ? (
          <View>
            {filterLoading ? (
              <View>
                {renderSection(`Top Charts`, [])}
                {renderSection(`Trending Now`, [])}
              </View>
            ) : displaySongs.length > 0 ? (
              <View>
                {renderSection(`Top ${activeFilter} Picks`, displaySongs.slice(0, 25))}
                {renderSection(`Top Charts`, displaySongs.slice(25, 50))}
                {renderSection(`Top Albums`, displaySongs.slice(50, 75))}
                {renderSection(`Trending Now`, displaySongs.slice(75, 100))}
                {renderSection(`New ${activeFilter}`, displaySongs.slice(100, 125))}
                {renderSection(`Best of ${activeFilter}`, displaySongs.slice(125, 150))}
                {renderSection(`More ${activeFilter}`, displaySongs.slice(150, 250))}
              </View>
            ) : (
              <Text style={{ color: colors.textSecondary, marginTop: 12 }}>No songs found for "{activeFilter}"</Text>
            )}
          </View>
        ) : (
          <View>
            {/* ── Default Home Content ── */}
            {/* ── Quick Picks ── */}
            {isLoading
              ? renderSection('Quick Picks', [])
              : renderSection('Quick Picks', quickPicks)}
            {isLoading && (
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Quick Picks</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {[0,1,2,3].map(i => <SkeletonLoader key={i} width={150} height={200} style={{ marginRight: 14 }} />)}
                </ScrollView>
              </View>
            )}

            {/* ── Fresh Finds ── */}
            {renderSection('Fresh Finds', freshFinds)}

            {/* ── New Releases ── */}
            {renderSection('New Releases', newReleases)}

            {/* ── Old Favourites ── */}
            {renderSection('Old Favourites', oldFavourites)}

            {renderSection('Top Charts', topCharts)}
            {renderSection('Top Albums', topAlbums)}

            {/* ── Top Artists ── */}
            {topArtists.length > 0 && (
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Top Artists</Text>
                <FlatList
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  data={(isLoading ? [0,1,2,3] : topArtists) as any}
                  keyExtractor={(item, i) => isLoading ? `top-skel-${i}` : `artist-${(item as SongItem).artist}`}
                  initialNumToRender={5}
                  renderItem={({ item }) => {
                    if (isLoading) return <SkeletonLoader width={80} height={80} style={{ marginRight: 14, borderRadius: 40 }} />;
                    const artist = item as SongItem;
                    return (
                      <TouchableOpacity style={styles.artistCard} onPress={() => handlePlay(artist, topArtists)}>
                        <Image source={{ uri: artist.artworkUrl }} style={styles.artistImg} />
                        <Text style={[styles.artistName, { color: colors.text }]} numberOfLines={1}>{artist.artist || artist.title}</Text>
                      </TouchableOpacity>
                    );
                  }}
                />
              </View>
            )}

            {renderSection(`Trending Now (${allTrending.length})`, trendingSongs, undefined, true)}

          </View>
        )}

      </ScrollView>

      <SongOptionsMenu visible={optionsVisible} onClose={() => setOptionsVisible(false)} song={selectedSong} onAddToPlaylist={openPicker} />
      <PlaylistPickerModal visible={pickerVisible} onClose={() => setPickerVisible(false)} song={selectedSong} />

      {/* Language Selection Modal */}
      <Modal visible={langModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalHeaderTitle, { color: colors.text }]}>Select Languages</Text>
              <TouchableOpacity onPress={() => setLangModalVisible(false)}>
                <Icon name="close" size={28} color={colors.text} />
              </TouchableOpacity>
            </View>
            <View style={styles.langGrid}>
              {LANGUAGES.map(lang => {
                const isSelected = preferences?.languages?.includes(lang);
                return (
                  <TouchableOpacity
                    key={lang}
                    style={[
                      styles.langChip,
                      {
                        backgroundColor: isSelected ? colors.primary : colors.surfaceHighlight,
                        borderColor: isSelected ? colors.primary : 'transparent'
                      }
                    ]}
                    onPress={() => {
                      const current = preferences?.languages || [];
                      const next = isSelected ? current.filter(l => l !== lang) : [...current, lang];
                      updateLanguages(next);
                    }}
                  >
                    <Text style={[styles.langText, { color: isSelected ? '#fff' : colors.text }]}>{lang}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            <TouchableOpacity
              style={[styles.btnFull, { backgroundColor: colors.primary }]}
              onPress={() => setLangModalVisible(false)}
            >
              <Text style={styles.btnFullText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, marginTop: 40 },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  logoIcon: { width: 44, height: 44, borderRadius: 14, borderWidth: 1, justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  greeting: { fontSize: 12, fontWeight: '600' },
  brand: { fontSize: 22, fontWeight: '900', letterSpacing: -0.5 },
  headerRight: { flexDirection: 'row' },
  iconBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.05)', justifyContent: 'center', alignItems: 'center', marginLeft: 8 },

  // Filter chips
  filterRow: { marginBottom: 20 },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  filterChipText: { fontSize: 13, fontWeight: '700' },

  section: { marginBottom: 28 },
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 14 },
  seeAll: { color: '#aaa', fontSize: 13, fontWeight: '600' },

  featuredCard: { width: 280, height: 200, borderRadius: 22, overflow: 'hidden', marginRight: 14 },
  featuredGradient: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 16, paddingTop: 40 },
  badge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, marginBottom: 6 },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: 'bold', letterSpacing: 1 },
  featuredTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  featuredArtist: { color: 'rgba(255,255,255,0.8)', fontSize: 13, marginBottom: 12 },
  featuredControls: { flexDirection: 'row', alignItems: 'center' },
  featuredPlay: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginRight: 12 },

  lockedCard: { padding: 24, alignItems: 'center', borderRadius: 16 },
  btnPrimary: { paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
  btnPrimaryText: { color: '#fff', fontWeight: 'bold' },

  artistCard: { width: 90, alignItems: 'center', marginRight: 14 },
  artistImg: { width: 80, height: 80, borderRadius: 40, marginBottom: 8 },
  artistName: { fontSize: 12, fontWeight: '600', textAlign: 'center' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24, paddingBottom: 48 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  modalHeaderTitle: { fontSize: 20, fontWeight: '900' },
  langGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 32 },
  langChip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, borderWidth: 1 },
  langText: { fontSize: 14, fontWeight: '600' },
  btnFull: { height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  btnFullText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});
