import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { SongItem } from '../../services/api';
import { useTheme } from '../../context/ThemeContext';
import LinearGradient from 'react-native-linear-gradient';

interface Props {
  item: SongItem;
  onPress: () => void;
  onMorePress: () => void;
  isPlaying?: boolean;
  width?: number;
  height?: number;
}

export default function SongCard({ item, onPress, onMorePress, isPlaying, width = 150, height = 200 }: Props) {
  const { colors } = useTheme();

  return (
    <TouchableOpacity 
      activeOpacity={0.8} 
      onPress={onPress}
      style={[styles.card, { width, height, backgroundColor: colors.surface }]}
    >
      <View style={{ flex: 1, width: '100%', position: 'relative', overflow: 'hidden' }}>
        <Image
          source={{ uri: item.artworkUrl || 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=400' }}
          style={StyleSheet.absoluteFillObject}
          resizeMode="cover"
        />
        <LinearGradient
          colors={['rgba(0,0,0,0.8)', 'transparent']}
          start={{ x: 0, y: 1 }}
          end={{ x: 0, y: 0.4 }}
          style={StyleSheet.absoluteFillObject}
        />
        
        <TouchableOpacity
          style={styles.moreBtn}
          onPress={(e) => { e.stopPropagation(); onMorePress(); }}
        >
          <Icon name="ellipsis-horizontal" size={16} color="#fff" />
        </TouchableOpacity>

        <View style={[styles.playBtn, { backgroundColor: colors.primary }]}>
          {isPlaying ? <Icon name="pause" size={16} color="#fff" /> : <Icon name="play" size={16} color="#fff" style={{ marginLeft: 2 }} />}
        </View>
      </View>

      <View style={{ padding: 8, paddingBottom: 10 }}>
        <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>{item.title}</Text>
        <Text style={[styles.artist, { color: colors.textSecondary }]} numberOfLines={1}>{item.artist}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    overflow: 'hidden',
    marginRight: 14,
  },
  moreBtn: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 14,
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playBtn: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  artist: {
    fontSize: 12,
  }
});
