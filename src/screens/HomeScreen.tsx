import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, StyleSheet, Modal } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTrendingMusic } from '../hooks/useMusicData';
import { useRecentlyPlayed } from '../hooks/useRecentlyPlayed';
import { useAuth } from '../context/AuthContext';
import { usePlayer } from '../context/PlayerContext';
import { SongItem } from '../services/api';
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

const GENRES = [
  { label: 'Pop', color: '#FF6B6B', image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300' },
  { label: 'Chill', color: '#4ECDC4', image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300' },
  { label: 'Workout', color: '#45B7D1', image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=300' },
  { label: 'Rock', color: '#96CEB4', image: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=300' },
  { label: 'Party', color: '#FFEEAD', image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=300' },
  { label: 'Melody', color: '#FFB7B2', image: 'https://images.unsplash.com/photo-1445985543470-41fba5c3144a?w=300' },
];

const GENRE_QUERIES: Record<string, string> = {
  Pop: 'pop hits 2024', Chill: 'lofi chill beats', Workout: 'workout motivation',
  Rock: 'classic rock anthems', Party: 'party dance hits', Melody: 'melody songs',
};

const LANGUAGES = [
  'English', 'Hindi', 'Tamil', 'Telugu', 'Kannada', 'Marathi', 'Bengali', 'Malayalam', 'Punjabi'
];

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

export default function HomeScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation<any>();
  const { user, preferences, prefLoading, updateLanguages } = useAuth();
  
  // Strip numbers from email local part to get a clean name
  const rawName = user?.displayName || user?.email?.split('@')[0] || 'Friend';
  const cleanName = rawName.replace(/[0-9]/g, '') || 'Friend';
  const firstName = cleanName.split(' ')[0].charAt(0).toUpperCase() + cleanName.split(' ')[0].slice(1).toLowerCase();
  const festiveGreeting = getFestiveGreeting(firstName);
  const greetingText = festiveGreeting ? festiveGreeting : `Hi ${firstName}, ${getGreeting()}`;

  useEffect(() => {
    if (festiveGreeting) {
      triggerFestiveNotification(festiveGreeting);
    }
  }, [festiveGreeting]);

  const { playTrack, currentTrack } = usePlayer();
  const { data: trending, isLoading } = useTrendingMusic(preferences?.languages?.length ? preferences.languages : ['English', 'Tamil', 'Hindi']);
  const { recentlyPlayed } = useRecentlyPlayed(12);
  
  const [selectedSong, setSelectedSong] = useState<SongItem | null>(null);
  const [optionsVisible, setOptionsVisible] = useState(false);
  const [pickerVisible, setPickerVisible] = useState(false);
  const [langModalVisible, setLangModalVisible] = useState(false);

  const featured = trending?.slice(0, 5) || [];
  const topCharts = trending?.slice(5, 15) || [];
  const topAlbums = trending?.slice(15, 25) || [];
  
  // Extract unique diverse artists from the entire 100-song randomized feed
  const uniqueArtists = Array.from(new Map((trending || []).map(item => [item.artist, item])).values());
  const topArtists = uniqueArtists.slice(0, 20);
  
  const trendingNow = trending?.slice(25, 60) || [];

  const handlePlay = async (track: SongItem, list: SongItem[]) => {
    if (!user) { navigation.navigate('Login'); return; }
    const idx = list.findIndex(s => s.id === track.id);
    await playTrack(track, list, idx);
    navigation.navigate('Player');
  };

  const openOptions = (song: SongItem) => { setSelectedSong(song); setOptionsVisible(true); };
  const openPicker = () => { setOptionsVisible(false); setPickerVisible(true); };

  return (
    <View style={styles.container}>
      <ScrollView 
        contentContainerStyle={{ padding: 16, paddingBottom: 130 }} 
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

        {/* Featured Today */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Featured Today</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {isLoading ? 
              [0, 1, 2].map(i => <SkeletonLoader key={i} width={280} height={200} style={{ marginRight: 14, borderRadius: 22 }} />) :
              featured.map(item => (
                <TouchableOpacity 
                  key={item.id} 
                  activeOpacity={0.9} 
                  style={styles.featuredCard}
                  onPress={() => handlePlay(item, featured)}
                >
                  <Image source={{ uri: item.artworkUrl }} style={StyleSheet.absoluteFillObject} />
                  <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.9)']}
                    style={styles.featuredGradient}
                  >
                    <View style={[styles.badge, { backgroundColor: colors.primary }]}>
                      <Text style={styles.badgeText}>FEATURED</Text>
                    </View>
                    <Text style={styles.featuredTitle} numberOfLines={1}>{item.title}</Text>
                    <Text style={styles.featuredArtist} numberOfLines={1}>{item.artist}</Text>
                    
                    <View style={styles.featuredControls}>
                      <View style={[styles.featuredPlay, { backgroundColor: colors.primary }]}>
                        <Icon name="musical-notes" size={18} color={getContrastColor(colors.primary)} />
                      </View>
                      <TouchableOpacity onPress={e => { e.stopPropagation(); openOptions(item); }}>
                        <Icon name="ellipsis-horizontal" size={24} color="rgba(255,255,255,0.8)" />
                      </TouchableOpacity>
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              ))
            }
          </ScrollView>
        </View>

        {/* Recently Played */}
        {recentlyPlayed.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Recently Played</Text>
              <TouchableOpacity onPress={() => navigation.navigate('RecentlyPlayed')}>
                <Text style={styles.seeAll}>See All <Icon name="chevron-forward" size={12} /></Text>
              </TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {recentlyPlayed.map((item, idx) => (
                <SongCard key={`rp-${item.id}-${idx}`} item={item} onPress={() => handlePlay(item, recentlyPlayed)} onMorePress={() => openOptions(item)} />
              ))}
            </ScrollView>
          </View>
        )}

        {!user && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Recently Played</Text>
            <GlassCard style={styles.lockedCard}>
              <Text style={{ fontSize: 32, marginBottom: 8 }}>🔒</Text>
              <Text style={{ color: colors.textSecondary, marginBottom: 16 }}>Login to see your recently played songs</Text>
              <TouchableOpacity style={[styles.btnPrimary, { backgroundColor: colors.primary }]} onPress={() => navigation.navigate('Login')}>
                <Text style={styles.btnPrimaryText}>Login</Text>
              </TouchableOpacity>
            </GlassCard>
          </View>
        )}

        {/* Genres */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Genres & Moods</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {GENRES.map(g => (
              <TouchableOpacity 
                key={g.label} 
                activeOpacity={0.8} 
                style={styles.genreCard}
                onPress={() => {
                  navigation.navigate('GenreDetail', { category: g.label });
                }}
              >
                <Image source={{ uri: g.image }} style={StyleSheet.absoluteFillObject} />
                <LinearGradient colors={[`${g.color}DD`, 'transparent']} start={{x:0, y:1}} end={{x:0, y:0}} style={styles.genreOverlay}>
                  <Text style={styles.genreLabel}>{g.label}</Text>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Top Charts */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Top Charts</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Search')}>
              <Text style={styles.seeAll}>See All <Icon name="chevron-forward" size={12} /></Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {isLoading ? Array(4).fill(0).map((_, i) => <SkeletonLoader key={i} width={150} height={200} style={{ marginRight: 14 }} />) :
              topCharts.map((item) => <SongCard key={item.id} item={item} onPress={() => handlePlay(item, topCharts)} onMorePress={() => openOptions(item)} />)}
          </ScrollView>
        </View>

        {/* Top Albums */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Top Albums</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {isLoading ? Array(4).fill(0).map((_, i) => <SkeletonLoader key={i} width={150} height={200} style={{ marginRight: 14 }} />) :
              topAlbums.map((item) => <SongCard key={item.id} item={item} onPress={() => handlePlay(item, topAlbums)} onMorePress={() => openOptions(item)} />)}
          </ScrollView>
        </View>
        
        {/* Top Artists */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Top Artists</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {isLoading ? Array(4).fill(0).map((_, i) => <SkeletonLoader key={i} width={80} height={80} style={{ marginRight: 14, borderRadius: 40 }} />) :
              topArtists.map((item) => (
                <TouchableOpacity key={item.id} style={styles.artistCard} onPress={() => handlePlay(item, topArtists)}>
                  <Image source={{ uri: item.artworkUrl }} style={styles.artistImg} />
                  <Text style={[styles.artistName, { color: colors.text }]} numberOfLines={1}>{item.artist || item.title}</Text>
                </TouchableOpacity>
              ))}
          </ScrollView>
        </View>


        {/* Trending Now */}
        {trendingNow.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Trending Now</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Search')}>
                <Text style={styles.seeAll}>See All <Icon name="chevron-forward" size={12} /></Text>
              </TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {trendingNow.map((item) => <SongCard key={`trending-${item.id}`} item={item} onPress={() => handlePlay(item, trendingNow)} onMorePress={() => openOptions(item)} />)}
            </ScrollView>
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
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 40,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  greeting: {
    fontSize: 12,
    fontWeight: '600',
  },
  brand: {
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  headerRight: {
    flexDirection: 'row',
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  section: {
    marginBottom: 28,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 14,
  },
  seeAll: {
    color: '#aaa',
    fontSize: 13,
    fontWeight: '600',
  },
  featuredCard: {
    width: 280,
    height: 200,
    borderRadius: 22,
    overflow: 'hidden',
    marginRight: 14,
  },
  featuredGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    paddingTop: 40,
  },
  badge: {
    position: 'absolute',
    top: -100, // Roughly place it at the top
    right: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  }, // We will use absolute placement inside the card instead
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  featuredTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  featuredArtist: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 13,
    marginBottom: 12,
  },
  featuredControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featuredPlay: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  lockedCard: {
    padding: 24,
    alignItems: 'center',
    borderRadius: 16,
  },
  btnPrimary: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  btnPrimaryText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  genreCard: {
    width: 130,
    height: 90,
    borderRadius: 16,
    overflow: 'hidden',
    marginRight: 14,
  },
  genreOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    padding: 10,
  },
  genreLabel: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
  artistCard: {
    width: 90,
    alignItems: 'center',
    marginRight: 14,
  },
  artistImg: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 8,
  },
  artistName: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  actionRow: { flexDirection: 'row', paddingHorizontal: 20, marginBottom: 32, gap: 16 },
  actionBtnContainer: { flex: 1 },
  actionBtn: { 
    alignItems: 'center', 
    justifyContent: 'center',
    padding: 20, 
    borderRadius: 24,
    height: 110,
  },
  actionBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '800',
  },
  actionIconOuter: { 
    width: 44, 
    height: 44, 
    borderRadius: 14, 
    backgroundColor: 'rgba(255,255,255,0.2)', 
    justifyContent: 'center', 
    alignItems: 'center',
    marginRight: 12
  },
  actionTitle: { color: '#fff', fontSize: 16, fontWeight: '800' },
  actionSubtitle: { color: 'rgba(255,255,255,0.7)', fontSize: 11, fontWeight: '600' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    paddingBottom: 48,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalHeaderTitle: {
    fontSize: 20,
    fontWeight: '900',
  },
  langGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 32,
  },
  langChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  langText: {
    fontSize: 14,
    fontWeight: '600',
  },
  btnFull: {
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnFullText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
