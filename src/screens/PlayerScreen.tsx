import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Animated, Dimensions, Easing, TextInput, Modal } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import Slider from '@react-native-community/slider';
import { useProgress } from 'react-native-track-player';
import { usePlayer } from '../context/PlayerContext';
import { useLikes } from '../hooks/useLikes';
import { useDownloads } from '../hooks/useDownloads';
import { getLyrics, LyricLine } from '../services/api';
import { useTheme } from '../context/ThemeContext';
import PlaylistPickerModal from '../components/PlaylistPickerModal';
import EqualizerModal from '../components/EqualizerModal';
import SongOptionsMenu from '../components/SongOptionsMenu';

const { width } = Dimensions.get('window');

export default function PlayerScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation<any>();
  const { 
    currentTrack, queue, isPlaying, repeatMode, setRepeat, 
    togglePlay, skipNext, skipPrev, isShuffled, toggleShuffle, setSleepTimer, sleepTimerEnd, seekTo, jumpToQueueIndex 
  } = usePlayer();
  const { position, duration } = useProgress(100); // 100ms interval for smooth UI
  const { isLiked, toggleLike } = useLikes();
  
  const [showMenu, setShowMenu] = useState(false);
  const [lyrics, setLyrics] = useState<LyricLine[]>([]);
  const [isSeeking, setIsSeeking] = useState(false);
  const [seekValue, setSeekValue] = useState(0);
  const [activeTab, setActiveTab] = useState<'lyrics' | 'queue'>('queue');
  
  const [pickerVisible, setPickerVisible] = useState(false);
  const [eqVisible, setEqVisible] = useState(false);
  const [timerVisible, setTimerVisible] = useState(false);
  const [timerMinutes, setTimerMinutes] = useState('15');
  const [timeLeftStr, setTimeLeftStr] = useState<string | null>(null);

  useEffect(() => {
    if (!sleepTimerEnd) {
      setTimeLeftStr(null);
      return;
    }
    const updateTime = () => {
      const diff = sleepTimerEnd - Date.now();
      if (diff <= 0) {
        setTimeLeftStr(null);
      } else {
        const m = Math.floor(diff / 60000);
        const s = Math.floor((diff % 60000) / 1000);
        setTimeLeftStr(`${m}:${s < 10 ? '0' : ''}${s}`);
      }
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [sleepTimerEnd]);

  const lyricsScrollRef = useRef<ScrollView>(null);
  // Removed spin animation as per user request for a fixed box look
  const liked = currentTrack ? isLiked(currentTrack.id) : false;
  // Animated Ripples
  const waveAnims = useRef(Array.from({ length: 48 }).map(() => new Animated.Value(0))).current;

  useEffect(() => {
    if (isPlaying) {
      const animations = waveAnims.map((anim, i) => {
        // pseudorandom fixed delays so it looks like a continuous audio wave pattern
        const randomDelay = (i * 47) % 1200;
        const randomDuration = 600 + ((i * 31) % 400);
        
        return Animated.loop(
          Animated.sequence([
            Animated.delay(randomDelay),
            Animated.timing(anim, { toValue: 1, duration: randomDuration, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
            Animated.timing(anim, { toValue: 0, duration: randomDuration, easing: Easing.inOut(Easing.ease), useNativeDriver: true })
          ])
        );
      });
      Animated.parallel(animations).start();
    } else {
      waveAnims.forEach(anim => { anim.stopAnimation(); anim.setValue(0); });
    }
  }, [isPlaying]);

  const displayPosition = isSeeking ? seekValue * (duration || 1) : position;

  // Fetch lyrics
  useEffect(() => {
    if (!currentTrack) {
      setLyrics([]);
      return;
    }
    let active = true;
    setLyrics([]);
    getLyrics(currentTrack.id, currentTrack.title, currentTrack.artist, currentTrack.album, duration)
      .then(d => { if (active) setLyrics(d.synced); })
      .catch(() => { if (active) setLyrics([]); });
    return () => { active = false; };
  }, [currentTrack?.id, duration > 0]);

  // Current Lyric Sync
  const currentLyricIdx = lyrics.findIndex((l, i) => {
    const nextTime = lyrics[i + 1]?.time || 9999;
    return position >= l.time && position < nextTime;
  });

  useEffect(() => {
    if (currentLyricIdx !== -1 && lyricsScrollRef.current) {
      // Each inactive line ~40px, active ~54px
      lyricsScrollRef.current.scrollTo({ y: Math.max(0, currentLyricIdx * 40 - 80), animated: true });
    }
  }, [currentLyricIdx]);

  const formatTime = (s: number) => {
    if (isNaN(s)) return '0:00';
    const m = Math.floor(s / 60), sec = Math.floor(s % 60);
    return `${m}:${sec < 10 ? '0' : ''}${sec}`;
  };

  const cycleRepeat = () => setRepeat(repeatMode === 'off' ? 'track' : repeatMode === 'track' ? 'queue' : 'off');

  if (!currentTrack) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Icon name="musical-notes" size={64} color={colors.primary} />
        <Text style={{ color: colors.textSecondary, fontSize: 18, marginVertical: 16 }}>No song playing</Text>
        <TouchableOpacity style={[styles.btnPrimary, { backgroundColor: colors.primary }]} onPress={() => navigation.navigate('MainTabs', { screen: 'Home' })}>
          <Text style={{ color: '#fff', fontWeight: 'bold' }}>Browse Music</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.goBack()}>
          <Icon name="chevron-down" size={30} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>NOW PLAYING</Text>
        <TouchableOpacity style={styles.iconBtn} onPress={() => setShowMenu(true)}>
          <Icon name="ellipsis-horizontal" size={26} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Album Art - Concentric Ripples */}
        <View style={[styles.artContainer, { marginTop: 20, position: 'relative', height: width * 0.7, justifyContent: 'center', alignItems: 'center' }]}>
          {waveAnims.map((anim, i) => (
            <Animated.View
              key={`wave-${i}`}
              style={{
                position: 'absolute',
                width: 5,
                height: 6,
                backgroundColor: colors.primary,
                borderRadius: 3,
                transform: [
                  { rotate: `${i * 7.5}deg` },
                  { translateY: (width * 0.35) + 18 },
                  { scaleY: anim.interpolate({ inputRange: [0, 1], outputRange: [1, 2.5 + ((i % 4 === 0) ? 2.5 : 0)] }) }
                ]
              }}
            />
          ))}
          <View style={{
            width: width * 0.7,
            height: width * 0.7,
            borderRadius: width * 0.35,
            padding: 10,
            borderWidth: 3,
            borderColor: colors.primary + '55',
            backgroundColor: colors.surfaceHighlight,
            elevation: isPlaying ? 20 : 0,
            shadowColor: colors.primary,
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: isPlaying ? 0.6 : 0,
            shadowRadius: 20,
          }}>
            <Image 
              source={{ uri: currentTrack.artworkUrl || 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=400' }} 
              style={{ width: '100%', height: '100%', borderRadius: (width * 0.7 - 20) / 2, resizeMode: 'cover' }} 
            />
          </View>
        </View>

        {/* Info */}
        <View style={styles.infoRow}>
          <View style={styles.infoText}>
            <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>{currentTrack.title}</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Artist', { name: currentTrack.artist })}>
              <Text style={[styles.artist, { color: colors.textSecondary }]} numberOfLines={1}>{currentTrack.artist}</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity onPress={() => toggleLike(currentTrack)}>
            <Icon name={liked ? "heart" : "heart-outline"} size={28} color={liked ? "#e91e63" : colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Progress */}
        <View style={styles.progressContainer}>
          <Slider
            style={{ width: '100%', height: 40 }}
            minimumValue={0}
            maximumValue={duration || 1}
            value={displayPosition}
            onSlidingStart={() => setIsSeeking(true)}
            onValueChange={v => setSeekValue(v / (duration || 1))}
            onSlidingComplete={v => { seekTo(v); setIsSeeking(false); }}
            minimumTrackTintColor={colors.primary}
            maximumTrackTintColor="rgba(255,255,255,0.1)"
            thumbTintColor={colors.primary}
          />
          <View style={styles.timeRow}>
            <Text style={[styles.timeText, { color: colors.textSecondary }]}>{formatTime(displayPosition)}</Text>
            <Text style={[styles.timeText, { color: colors.textSecondary }]}>{formatTime(duration)}</Text>
          </View>
        </View>

        {/* Controls */}
        <View style={styles.controlsRow}>
          <TouchableOpacity onPress={() => setEqVisible(true)} style={[styles.eqBtn, { borderColor: 'rgba(255,255,255,0.1)' }]}>
            <Text style={[styles.eqText, { color: colors.textSecondary }]}>EQ</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={toggleShuffle}>
            <Icon name="shuffle" size={26} color={isShuffled ? colors.primary : colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity onPress={skipPrev}>
            <Icon name="play-skip-back" size={36} color={colors.text} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.playBtn, { backgroundColor: colors.primary }]} 
            activeOpacity={0.8}
            onPress={togglePlay}
          >
            <Icon name={isPlaying ? "pause" : "play"} size={44} color="#fff" style={{ marginLeft: isPlaying ? 0 : 4 }} />
          </TouchableOpacity>

          <TouchableOpacity onPress={async () => {
             await skipNext();
          }}>
            <Icon name="play-skip-forward" size={36} color={colors.text} />
          </TouchableOpacity>

          <TouchableOpacity onPress={cycleRepeat} style={{ position: 'relative' }}>
            <Icon name="repeat" size={26} color={repeatMode !== 'off' ? colors.primary : colors.textSecondary} />
            {repeatMode === 'track' && <Text style={[styles.repeatOneText, { color: colors.primary }]}>1</Text>}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setTimerVisible(true)} style={{ alignItems: 'center' }}>
            <Icon name="moon" size={24} color={sleepTimerEnd ? colors.primary : colors.textSecondary} />
            {timeLeftStr && <Text style={{ fontSize: 10, color: colors.primary, marginTop: 2, fontWeight: 'bold' }}>{timeLeftStr}</Text>}
          </TouchableOpacity>
        </View>

        {/* Tabs */}
        <View style={[styles.tabContainer, { backgroundColor: colors.surface }]}>
          <TouchableOpacity 
            style={[styles.tabBtn, { backgroundColor: activeTab === 'lyrics' ? colors.primary : 'transparent' }]}
            onPress={() => setActiveTab('lyrics')}
          >
            <Text style={[styles.tabText, { color: activeTab === 'lyrics' ? '#fff' : colors.textSecondary }]}>Lyrics</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tabBtn, { backgroundColor: activeTab === 'queue' ? colors.primary : 'transparent' }]}
            onPress={() => setActiveTab('queue')}
          >
            <Text style={[styles.tabText, { color: activeTab === 'queue' ? '#fff' : colors.textSecondary }]}>Up Next</Text>
          </TouchableOpacity>
        </View>

        {/* Content Box */}
        <View style={[styles.contentBox, { backgroundColor: colors.surface }]}>
          {activeTab === 'lyrics' ? (
            <View>
              <Text style={[styles.contentTitle, { color: colors.textSecondary }]}>LYRICS</Text>
              {lyrics.length > 0 ? (
                <View style={{ paddingHorizontal: 4 }}>
                  {lyrics.map((line, idx) => {
                    const isActive = idx === currentLyricIdx;
                    return (
                      <View
                        key={`lyr-${idx}`}
                        style={[
                          styles.lyricLine,
                          isActive && styles.lyricLineActive,
                        ]}
                      >
                        <Text
                          style={[
                            styles.lyricText,
                            {
                              color: isActive ? colors.primary : colors.textSecondary,
                              fontWeight: isActive ? '800' : '400',
                              fontSize: isActive ? 17 : 14,
                              opacity: isActive ? 1 : 0.45,
                              transform: [{ scale: isActive ? 1.04 : 1 }],
                            }
                          ]}
                        >
                          {line.text}
                        </Text>
                      </View>
                    );
                  })}
                  <View style={{ height: 100 }} />
                </View>
              ) : (
                <View style={styles.emptyContent}>
                  <Text style={{ fontSize: 48 }}>🎵</Text>
                  <Text style={{ color: colors.textSecondary, marginTop: 12 }}>No synchronized lyrics available</Text>
                </View>
              )}
            </View>
          ) : (
            <View>
              <View style={styles.queueHeader}>
                <Text style={[styles.contentTitle, { color: colors.textSecondary, marginBottom: 0 }]}>UP NEXT</Text>
                <Text style={{ fontSize: 11, color: colors.primary, fontWeight: '600' }}>{queue.length} Songs</Text>
              </View>
              <View>
                {/* Deduplicate queue by ID before rendering */}
                {Array.from(new Map(queue.map(s => [s.id, s])).values()).map((song, idx) => {
                  const isCurrent = currentTrack.id === song.id;
                  return (
                    <TouchableOpacity
                      key={`q-${song.id}-${idx}`}
                      style={[styles.queueItem, { backgroundColor: isCurrent ? colors.primary + '15' : 'transparent', borderColor: isCurrent ? colors.primary + '33' : 'transparent' }]}
                      onPress={() => jumpToQueueIndex(idx)}
                    >
                      <Image source={{ uri: song.artworkUrl }} style={styles.queueArt} />
                      <View style={styles.queueInfo}>
                        <Text style={[styles.queueTitle, { color: isCurrent ? colors.primary : colors.text }]} numberOfLines={1}>{song.title}</Text>
                        <Text style={[styles.queueArtist, { color: colors.textSecondary }]} numberOfLines={1}>{song.artist}</Text>
                      </View>
                      {isPlaying && isCurrent && <Icon name="musical-notes" size={16} color={colors.primary} />}
                    </TouchableOpacity>
                  );
                })}
                <View style={{ height: 80 }} />
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      <SongOptionsMenu visible={showMenu} onClose={() => setShowMenu(false)} song={currentTrack} onAddToPlaylist={() => { setShowMenu(false); setPickerVisible(true); }} />
      <PlaylistPickerModal visible={pickerVisible} onClose={() => setPickerVisible(false)} song={currentTrack} />
      <EqualizerModal visible={eqVisible} onClose={() => setEqVisible(false)} />

      {/* Sleep Timer Modal */}
      <Modal visible={timerVisible} transparent animationType="fade" onRequestClose={() => setTimerVisible(false)}>
        <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={() => setTimerVisible(false)}>
          <View style={[styles.modalCard, { backgroundColor: colors.surface }]} onStartShouldSetResponder={() => true}>
            <Icon name="moon" size={48} color={colors.primary} style={{ alignSelf: 'center', marginBottom: 16 }} />
            <Text style={[styles.modalTitle, { color: colors.text }]}>Sleep Timer</Text>
            <Text style={[styles.modalDesc, { color: colors.textSecondary }]}>Stop playing music automatically after...</Text>

            <View style={styles.timerInputRow}>
              <TextInput
                style={[styles.timerInput, { backgroundColor: colors.surfaceHighlight, color: colors.text, borderColor: 'rgba(255,255,255,0.1)' }]}
                keyboardType="numeric"
                value={timerMinutes}
                onChangeText={setTimerMinutes}
              />
              <Text style={[styles.timerUnit, { color: colors.textSecondary }]}>mins</Text>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity style={[styles.timerBtn, { borderColor: 'rgba(255,255,255,0.1)' }]} onPress={() => { setSleepTimer(0); setTimerVisible(false); }}>
                <Text style={{ color: colors.textSecondary, fontWeight: '800' }}>Off</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.timerBtn, { backgroundColor: colors.primary, borderColor: colors.primary, marginLeft: 12 }]} onPress={() => { setSleepTimer(parseInt(timerMinutes) || 0); setTimerVisible(false); }}>
                <Text style={{ color: '#fff', fontWeight: '800' }}>Start Timer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 48,
  },
  iconBtn: { padding: 4 },
  headerTitle: { fontSize: 13, fontWeight: '700', letterSpacing: 1.2 },
  scrollContent: { padding: 20, paddingBottom: 60 },
  artContainer: { alignItems: 'center', marginBottom: 32 },
  albumArt: {
    width: 180,
    height: 180,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.05)',
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
  },
  artImage: { 
    width: '100%', 
    height: '100%', 
    borderRadius: 20,
    resizeMode: 'cover',
  },
  infoRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 },
  infoText: { flex: 1, marginRight: 16 },
  title: { fontSize: 24, fontWeight: '900', marginBottom: 4 },
  artist: { fontSize: 16 },
  progressContainer: { marginBottom: 24 },
  timeRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 4, marginTop: -8 },
  timeText: { fontSize: 12 },
  controlsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 },
  eqBtn: { paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderRadius: 12 },
  eqText: { fontSize: 13, fontWeight: '700' },
  playBtn: { width: 76, height: 76, borderRadius: 38, justifyContent: 'center', alignItems: 'center', elevation: 8 },
  repeatOneText: { position: 'absolute', bottom: 2, right: 0, fontSize: 8, fontWeight: '900' },
  tabContainer: { flexDirection: 'row', borderRadius: 16, padding: 4, marginBottom: 20 },
  tabBtn: { flex: 1, paddingVertical: 10, borderRadius: 12, alignItems: 'center' },
  tabText: { fontSize: 13, fontWeight: '700' },
  contentBox: { borderRadius: 24, padding: 20 },
  contentTitle: { fontSize: 12, fontWeight: '700', letterSpacing: 1, marginBottom: 16 },
  lyricLine: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lyricLineActive: {
    paddingVertical: 14,
    marginVertical: 4,
  },
  lyricText: { textAlign: 'center', lineHeight: 22, paddingHorizontal: 4 },
  emptyContent: { height: 300, justifyContent: 'center', alignItems: 'center', opacity: 0.4 },
  queueHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  queueItem: { flexDirection: 'row', alignItems: 'center', padding: 8, borderRadius: 12, marginBottom: 8 },
  queueArt: { width: 44, height: 44, borderRadius: 8 },
  queueInfo: { flex: 1, marginLeft: 12 },
  queueTitle: { fontSize: 15, fontWeight: '600', marginBottom: 2 },
  queueArtist: { fontSize: 13 },
  btnPrimary: { paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalCard: { width: '100%', maxWidth: 360, borderRadius: 32, padding: 32, alignItems: 'center' },
  modalTitle: { fontSize: 24, fontWeight: '900', marginBottom: 8, textAlign: 'center' },
  modalDesc: { fontSize: 14, textAlign: 'center', marginBottom: 24 },
  timerInputRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  timerInput: { width: 100, height: 60, borderRadius: 16, borderWidth: 2, fontSize: 32, fontWeight: '900', textAlign: 'center' },
  timerUnit: { fontSize: 20, fontWeight: '700', marginLeft: 12 },
  modalActions: { flexDirection: 'row', width: '100%' },
  timerBtn: { flex: 1, paddingVertical: 16, borderRadius: 16, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
});
