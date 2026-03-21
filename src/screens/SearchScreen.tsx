import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, Image, StyleSheet, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useSearchMusic, useTrendingMusic } from '../hooks/useMusicData';
import { useDebounce } from '../hooks/useDebounce';
import { useAuth } from '../context/AuthContext';
import { usePlayer } from '../context/PlayerContext';
import { SongItem } from '../services/api';
import { useTheme } from '../context/ThemeContext';
import SkeletonLoader from '../components/ui/SkeletonLoader';
import SongOptionsMenu from '../components/SongOptionsMenu';
import PlaylistPickerModal from '../components/PlaylistPickerModal';
import LinearGradient from 'react-native-linear-gradient';

export default function SearchScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { preferences, user } = useAuth();
  const { playTrack } = usePlayer();

  const [query, setQuery] = useState('');
  const [selectedSong, setSelectedSong] = useState<SongItem | null>(null);
  const [optionsVisible, setOptionsVisible] = useState(false);
  const [pickerVisible, setPickerVisible] = useState(false);
  const [playingId, setPlayingId] = useState<string | null>(null);

  // Clear query when screen is focused (as requested)
  useFocusEffect(
    React.useCallback(() => {
      if (route.params?.query) {
        setQuery(route.params.query);
      } else {
        setQuery('');
      }
    }, [route.params?.query])
  );

  const debouncedQuery = useDebounce(query, 400);
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useSearchMusic(debouncedQuery);
  const { data: recommendations, isLoading: recoLoading } = useTrendingMusic(preferences?.languages);

  const results: SongItem[] = data?.pages.flatMap(p => p) || [];
  const recommendedResults = recommendations || [];

  const handlePlay = async (track: SongItem) => {
    if (!user) { navigation.navigate('Login'); return; }
    setPlayingId(track.id);
    const idx = results.findIndex(s => s.id === track.id);
    await playTrack(track, results, idx);
    navigation.navigate('Player');
    setPlayingId(null);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.primary }]}>Search</Text>
        <View style={[styles.inputWrapper, { backgroundColor: colors.surface, borderColor: 'rgba(255,255,255,0.1)' }]}>
          <Icon name="search" size={22} color={colors.textSecondary} />
          <TextInput
            style={[styles.input, { color: colors.text }]}
            placeholder="Artists, songs, or podcasts"
            placeholderTextColor={colors.textSecondary}
            value={query}
            onChangeText={setQuery}
            autoFocus={!route.params?.query}
            returnKeyType="search"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')} style={styles.clearBtn}>
              <Icon name="close-circle" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {isLoading && (
          <View>
            {[1, 2, 3, 4, 5].map(i => <SkeletonLoader key={i} height={80} style={{ marginBottom: 10, borderRadius: 14 }} />)}
          </View>
        )}

        {!isLoading && query.length === 0 && (
          <View>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Recommended for You</Text>
            {recoLoading ? (
               Array(6).fill(0).map((_, i) => <SkeletonLoader key={i} height={80} style={{ marginBottom: 12, borderRadius: 16 }} />)
            ) : (
              recommendedResults.map((item, index) => (
                <TouchableOpacity
                  key={`reco-${item.id}-${index}`}
                  activeOpacity={0.8}
                  style={styles.resultCard}
                  onPress={() => handlePlay(item)}
                >
                  <Image source={{ uri: item.artworkUrl }} style={StyleSheet.absoluteFillObject} />
                  <LinearGradient
                    colors={['rgba(0,0,0,0.85)', 'rgba(0,0,0,0.5)', 'rgba(0,0,0,0.7)']}
                    start={{x: 0, y: 0}} end={{x: 1, y: 0}}
                    style={styles.resultGradient}
                  >
                    <Icon name="sparkles" size={18} color={colors.primary} style={{ marginRight: 12 }} />
                    <View style={styles.resultInfo}>
                      <Text style={[styles.resultTitle, { color: '#fff' }]} numberOfLines={1}>{item.title}</Text>
                      <Text style={[styles.resultArtist, { color: 'rgba(255,255,255,0.7)' }]} numberOfLines={1}>{item.artist}</Text>
                    </View>
                    <TouchableOpacity
                      style={styles.moreBtn}
                      onPress={e => { e.stopPropagation(); setSelectedSong(item); setOptionsVisible(true); }}
                    >
                      <Icon name="ellipsis-vertical" size={20} color="rgba(255,255,255,0.5)" />
                    </TouchableOpacity>
                  </LinearGradient>
                </TouchableOpacity>
              ))
            )}
          </View>
        )}

        {!isLoading && query.length > 0 && results.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={{ fontSize: 52 }}>🎵</Text>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No results found for "{query}"</Text>
          </View>
        )}

        {!isLoading && results.length > 0 && (
          <View>
            {results.map((item, index) => (
              <TouchableOpacity
                key={`${item.id}-${index}`}
                activeOpacity={0.8}
                style={styles.resultCard}
                onPress={() => handlePlay(item)}
              >
                <Image source={{ uri: item.artworkUrl }} style={StyleSheet.absoluteFillObject} />
                <LinearGradient
                  colors={['rgba(0,0,0,0.85)', 'rgba(0,0,0,0.5)', 'rgba(0,0,0,0.7)']}
                  start={{x: 0, y: 0}} end={{x: 1, y: 0}}
                  style={styles.resultGradient}
                >
                  {playingId === item.id ? (
                    <ActivityIndicator size="small" color={colors.primary} style={{ marginRight: 12 }} />
                  ) : (
                    <Icon name="play" size={20} color={colors.primary} style={{ marginRight: 12 }} />
                  )}
                  
                  <View style={styles.resultInfo}>
                    <Text style={[styles.resultTitle, { color: '#fff' }]} numberOfLines={1}>{item.title}</Text>
                    <Text style={[styles.resultArtist, { color: 'rgba(255,255,255,0.7)' }]} numberOfLines={1}>{item.artist}</Text>
                  </View>
                  
                  <TouchableOpacity
                    style={styles.moreBtn}
                    onPress={e => { e.stopPropagation(); setSelectedSong(item); setOptionsVisible(true); }}
                  >
                    <Icon name="ellipsis-vertical" size={20} color="rgba(255,255,255,0.5)" />
                  </TouchableOpacity>
                </LinearGradient>
              </TouchableOpacity>
            ))}

            {hasNextPage && (
              <TouchableOpacity
                style={[styles.loadMoreBtn, { backgroundColor: colors.surface, borderColor: 'rgba(255,255,255,0.1)' }]}
                onPress={() => fetchNextPage()}
                disabled={isFetchingNextPage}
              >
                <Text style={[styles.loadMoreText, { color: colors.primary }]}>{isFetchingNextPage ? 'Loading...' : 'Load More'}</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </ScrollView>

      <SongOptionsMenu visible={optionsVisible} onClose={() => setOptionsVisible(false)} song={selectedSong} onAddToPlaylist={() => { setOptionsVisible(false); setPickerVisible(true); }} />
      <PlaylistPickerModal visible={pickerVisible} onClose={() => setPickerVisible(false)} song={selectedSong} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  header: {
    padding: 16,
    paddingTop: 48,
  },
  title: {
    fontSize: 30,
    fontWeight: '900',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    marginLeft: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 30,
    paddingHorizontal: 20,
    height: 56,
    borderWidth: 1,
  },
  input: {
    flex: 1,
    fontSize: 16,
    marginLeft: 8,
  },
  clearBtn: {
    padding: 4,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 130,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 16,
  },
  resultCard: {
    height: 80,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 12,
  },
  resultGradient: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  resultInfo: {
    flex: 1,
  },
  resultTitle: {
    fontWeight: '900',
    fontSize: 15,
  },
  resultArtist: {
    fontSize: 12,
    marginTop: 2,
  },
  moreBtn: {
    padding: 8,
  },
  loadMoreBtn: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    marginBottom: 16,
  },
  loadMoreText: {
    fontWeight: '700',
    fontSize: 15,
  }
});
