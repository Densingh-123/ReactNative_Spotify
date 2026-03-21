import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { usePlayer } from '../../context/PlayerContext';
import { useTheme } from '../../context/ThemeContext';
import { navigationRef } from '../../../App';

export default function MiniPlayer() {
  const { currentTrack, isPlaying, position, duration, togglePlay, skipNext, reset } = usePlayer();
  const navigation = useNavigation<any>();
  const { colors } = useTheme();

  const [currentRoute, setCurrentRoute] = useState('');

  useEffect(() => {
    const unsub = navigationRef.addListener('state', () => {
      if (navigationRef.isReady()) {
        const route = navigationRef.getCurrentRoute();
        setCurrentRoute(route?.name || '');
      }
    });
    return unsub;
  }, []);

  if (!currentTrack || currentRoute === 'Player') return null;

  const progress = duration > 0 ? (position / duration) * 100 : 0;

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      <TouchableOpacity 
        style={styles.inner} 
        activeOpacity={0.9} 
        onPress={() => navigation.navigate('Player')}
      >
        <Image
          source={{ uri: currentTrack.artworkUrl || 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=100' }}
          style={styles.art}
        />
        
        <View style={styles.info}>
          <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>{currentTrack.title}</Text>
          <Text style={[styles.artist, { color: colors.textSecondary }]} numberOfLines={1}>{currentTrack.artist}</Text>
          
          <View style={styles.progressContainer}>
            <View style={[styles.progressFill, { width: `${progress}%`, backgroundColor: colors.primary }]} />
          </View>
        </View>
        
        <View style={styles.controls}>
          <TouchableOpacity 
            style={styles.playBtn} 
            onPress={(e) => { e.stopPropagation(); togglePlay(); }}
          >
            {isPlaying ? <Icon name="pause" size={18} color="#fff" /> : <Icon name="play" size={18} color="#fff" style={{ marginLeft: 2 }} />}
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.iconBtn} 
            onPress={(e) => { e.stopPropagation(); skipNext(); }}
          >
            <Icon name="play-skip-forward" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.iconBtn} 
            onPress={(e) => { 
                e.stopPropagation(); 
                reset(); 
                navigation.navigate('MainTabs', { screen: 'Home' }); // Navigate home on close
            }}
          >
            <Icon name="close" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 60, // Above bottom nav
    left: 8,
    right: 8,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  art: {
    width: 44,
    height: 44,
    borderRadius: 10,
  },
  info: {
    flex: 1,
    marginLeft: 10,
    justifyContent: 'center',
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  artist: {
    fontSize: 12,
    marginBottom: 6,
  },
  progressContainer: {
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 2,
    overflow: 'hidden',
    width: '90%',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  playBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
  },
  iconBtn: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  }
});
