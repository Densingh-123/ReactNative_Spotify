import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../context/ThemeContext';
import { SongItem, getLyrics, LyricsData } from '../services/api';
import { usePlayer } from '../context/PlayerContext';
import SkeletonLoader from '../components/ui/SkeletonLoader';
import LinearGradient from 'react-native-linear-gradient';

export default function RingtoneEditScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const route = useRoute<any>();
  const [song, setSong] = useState<SongItem | null>(route.params?.song || null);
  
  const { currentTrack, isPlaying, position, duration, playTrack, togglePlay, seekTo } = usePlayer();
  const [lyrics, setLyrics] = useState<LyricsData | null>(null);
  const [loadingLyrics, setLoadingLyrics] = useState(false);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (song && (!currentTrack || currentTrack.id !== song.id)) {
      playTrack(song);
    }
    if (song) fetchLyrics();
  }, [song]);

  const fetchLyrics = async () => {
    if (!song) return;
    setLoadingLyrics(true);
    try {
      const data = await getLyrics(song.id, song.title, song.artist);
      setLyrics(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingLyrics(false);
    }
  };

  const handleDownload = async () => {
    if (!currentTrack?.resolvedUrl && !currentTrack?.streamUrl) return;
    setDownloading(true);
    try {
      const url = currentTrack.resolvedUrl || currentTrack.streamUrl;
      const RNFS = require('react-native-fs');
      const filename = `${song?.title.replace(/[\\/:*?"<>|]/g, '') || 'ringtone'}.mp3`;
      const dirPath = RNFS.DownloadDirectoryPath || RNFS.DocumentDirectoryPath;
      const localPath = `${dirPath}/${filename}`;
      
      const downloadJob = RNFS.downloadFile({
        fromUrl: url!,
        toFile: localPath,
      });
      await downloadJob.promise;
      
      Alert.alert("Success", `Ringtone saved to ${localPath}!`);
    } catch (error) {
      console.error('Download failed', error);
      Alert.alert('Error', 'Failed to download ringtone.');
    } finally {
      setDownloading(false);
    }
  };

  const currentLyricIndex = useMemo(() => {
    if (!lyrics?.synced || lyrics.synced.length === 0) return -1;
    let index = -1;
    for (let i = 0; i < lyrics.synced.length; i++) {
      if (position >= lyrics.synced[i].time) {
        index = i;
      } else {
        break;
      }
    }
    return index;
  }, [lyrics, position]);

  if (!song) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: colors.text }}>Ringtone not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Icon name="chevron-back" size={26} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Ringtone Studio</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.heroSection}>
          <View style={[
            styles.artWrapper, 
            { borderColor: colors.surfaceHighlight, shadowColor: colors.primary, transform: [{ scale: isPlaying ? 1.05 : 1 }] }
          ]}>
            <Image source={{ uri: song.artworkUrl }} style={StyleSheet.absoluteFillObject} />
          </View>
          <View style={styles.titleSection}>
            <Text style={[styles.songTitle, { color: colors.text, textShadowColor: colors.primary + '33' }]} numberOfLines={2}>
              {song.title}
            </Text>
            <Text style={[styles.songArtist, { color: colors.textSecondary }]}>{song.artist}</Text>
          </View>
        </View>

        <LinearGradient
          colors={[colors.surfaceHighlight, colors.surface + 'dd']}
          style={[styles.trimmerCard, { borderColor: 'rgba(255,255,255,0.05)' }]}
        >
          <View style={styles.trimmerHeader}>
             <View style={styles.trimmerTitleBox}>
               <View style={[styles.cutIconBox, { backgroundColor: colors.primary + '22' }]}>
                 <Icon name="cut" color={colors.primary} size={18} />
               </View>
               <Text style={[styles.trimmerTitleText, { color: colors.text }]}>Precision Tuner</Text>
             </View>
             <View style={styles.timeStats}>
                <View style={[styles.timePill, { backgroundColor: colors.surface }]}>
                   <Text style={[styles.timeText, { color: colors.textSecondary }]}>Seek: {Math.floor(position)}s</Text>
                </View>
                <View style={[styles.timePill, { backgroundColor: colors.primary }]}>
                   <Text style={[styles.timeText, { color: '#fff', fontWeight: 'bold' }]}>Duration: {Math.round(duration)}s</Text>
                </View>
             </View>
          </View>
          
          <View style={[styles.waveformBox, { borderColor: 'rgba(255,255,255,0.05)' }]}>
             <View style={styles.barsContainer}>
               {Array(40).fill(0).map((_, i) => {
                 const barPos = i / 40;
                 const isPlayed = barPos <= (position / (duration || 1));
                 const baseHeight = 30 + (Math.sin(i * 0.5) * 20 + 20);
                 const activeHeight = isPlaying ? baseHeight + (Math.sin(Date.now() / 200 + i) * 15) : baseHeight;
                 
                 return (
                   <View key={i} style={[
                     styles.waveBar,
                     {
                       backgroundColor: isPlayed ? colors.primary : colors.textSecondary,
                       opacity: isPlayed ? 1 : 0.2,
                       height: `${Math.min(100, activeHeight)}%`
                     }
                   ]} />
                 );
               })}
             </View>
             <View style={[
               styles.playhead, 
               { left: `${(position / (duration || 1)) * 100}%` }
             ]} />
          </View>

          <View style={styles.controlsRow}>
             <TouchableOpacity 
               onPress={togglePlay}
               activeOpacity={0.8}
               style={[
                 styles.playBtn, 
                 { backgroundColor: colors.primary, transform: [{ scale: isPlaying ? 1.1 : 1 }] }
               ]}
             >
                <Icon name={isPlaying ? "pause" : "play"} size={30} color="#fff" style={{ marginLeft: isPlaying ? 0 : 4 }} />
             </TouchableOpacity>

             <TouchableOpacity 
               onPress={handleDownload}
               disabled={downloading || (!currentTrack?.streamUrl && !currentTrack?.resolvedUrl)}
               activeOpacity={0.8}
               style={[styles.saveBtn, { backgroundColor: colors.text }]}
             >
               {downloading ? (
                 <ActivityIndicator color={colors.background} style={{ marginRight: 8 }} />
               ) : (
                 <Icon name="save" size={22} color={colors.background} style={{ marginRight: 8 }} />
               )}
               <Text style={[styles.saveBtnText, { color: colors.background }]}>
                 {downloading ? 'Working...' : 'Save Ringtone'}
               </Text>
             </TouchableOpacity>
          </View>
        </LinearGradient>

        <View style={styles.lyricsSection}>
          <View style={styles.lyricsHeader}>
            <LinearGradient colors={['transparent', colors.primary + '66']} start={{x:0, y:0}} end={{x:1, y:0}} style={styles.lineFlex} />
            <View style={styles.lyricsTitleBox}>
              <Icon name="musical-notes" size={22} color={colors.primary} />
              <Text style={[styles.lyricsTitle, { color: colors.text }]}>STUDIO LYRICS</Text>
            </View>
            <LinearGradient colors={[colors.primary + '66', 'transparent']} start={{x:0, y:0}} end={{x:1, y:0}} style={styles.lineFlex} />
          </View>
          
          <LinearGradient
            colors={['rgba(0,0,0,0.4)', 'rgba(0,0,0,0.2)']}
            style={[styles.lyricsBox, { borderColor: 'rgba(255,255,255,0.05)' }]}
          >
            {loadingLyrics ? (
              <View style={{ alignItems: 'center' }}>
                <SkeletonLoader height={24} width="70%" style={{ marginBottom: 16 }} />
                <SkeletonLoader height={24} width="50%" style={{ marginBottom: 16 }} />
                <SkeletonLoader height={24} width="60%" />
              </View>
            ) : (lyrics?.synced && lyrics.synced.length > 0) || (lyrics?.plain) ? (
              <View style={styles.lyricsTextContainer}>
                {(lyrics?.synced && lyrics.synced.length > 0 ? lyrics.synced : lyrics?.plain?.split('\n')?.map((t) => ({ time: 0, text: t })) || []).map((line: any, i: number) => {
                  const isActive = currentLyricIndex === i;
                  return (
                    <Text key={i} style={[
                      styles.lyricLine,
                      { 
                        opacity: isActive ? 1 : 0.3,
                        transform: [{ scale: isActive ? 1.1 : 1 }],
                        color: isActive ? colors.primary : '#fff',
                        textShadowColor: isActive ? colors.primary : 'transparent',
                        textShadowRadius: isActive ? 15 : 0
                      }
                    ]}>
                      {line.text}
                    </Text>
                  );
                })}
              </View>
            ) : (
              <View style={styles.noLyrics}>
                <Icon name="list" size={48} color={`${colors.textSecondary}33`} style={{ marginBottom: 16 }} />
                <Text style={{ color: colors.textSecondary, fontSize: 16, fontWeight: '600' }}>No studio lyrics available.</Text>
              </View>
            )}
          </LinearGradient>
        </View>
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
    zIndex: 10
  },
  backBtn: { padding: 4, marginRight: 12 },
  headerTitle: { fontSize: 22, fontWeight: '900' },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 120 },
  heroSection: { alignItems: 'center', marginTop: 20 },
  artWrapper: {
    width: 200, height: 200, borderRadius: 32, overflow: 'hidden',
    borderWidth: 4, marginBottom: 24, elevation: 12,
    shadowOffset: { width: 0, height: 20 }, shadowOpacity: 0.4, shadowRadius: 30
  },
  titleSection: { alignItems: 'center', marginBottom: 32 },
  songTitle: { fontSize: 28, fontWeight: '900', marginBottom: 8, textAlign: 'center', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 20 },
  songArtist: { fontSize: 16, fontWeight: '600' },
  trimmerCard: {
    padding: 24, borderRadius: 32, marginBottom: 32, borderWidth: 1,
    elevation: 8, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.2, shadowRadius: 20
  },
  trimmerHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  trimmerTitleBox: { flexDirection: 'row', alignItems: 'center' },
  cutIconBox: { width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  trimmerTitleText: { fontWeight: '800', fontSize: 14 },
  timeStats: { flexDirection: 'row', alignItems: 'center' },
  timePill: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20, marginLeft: 8 },
  timeText: { fontSize: 12 },
  waveformBox: { height: 100, backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: 20, overflow: 'hidden', borderWidth: 1 },
  barsContainer: { flexDirection: 'row', alignItems: 'flex-end', height: '100%', paddingHorizontal: 4, justifyContent: 'space-between' },
  waveBar: { width: '2%', borderTopLeftRadius: 2, borderTopRightRadius: 2 },
  playhead: { position: 'absolute', top: 0, bottom: 0, width: 2, backgroundColor: '#fff', shadowColor: '#fff', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 1, shadowRadius: 10, zIndex: 10 },
  controlsRow: { marginTop: 32, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  playBtn: {
    width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center',
    marginRight: 40, elevation: 8, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 20
  },
  saveBtn: {
    paddingVertical: 18, paddingHorizontal: 40, borderRadius: 20,
    flexDirection: 'row', alignItems: 'center',
    elevation: 8, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 20
  },
  saveBtnText: { fontWeight: '900', fontSize: 16 },
  lyricsSection: { marginTop: 24 },
  lyricsHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  lineFlex: { height: 1, flex: 1 },
  lyricsTitleBox: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10 },
  lyricsTitle: { fontSize: 18, fontWeight: '900', marginLeft: 8, letterSpacing: 1 },
  lyricsBox: {
    borderRadius: 32, padding: 32, borderWidth: 1,
    minHeight: 250, overflow: 'hidden'
  },
  lyricsTextContainer: { alignItems: 'center' },
  lyricLine: { fontSize: 20, fontWeight: '800', lineHeight: 40, textAlign: 'center', marginBottom: 16 },
  noLyrics: { alignItems: 'center', paddingVertical: 40 }
});
