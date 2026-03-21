import React from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, Share } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { SongItem } from '../services/api';
import { useLikes } from '../hooks/useLikes';
import { useDownloads } from '../hooks/useDownloads';
import { useTheme } from '../context/ThemeContext';

interface Props {
  visible: boolean;
  onClose: () => void;
  song: SongItem | null;
  onAddToPlaylist?: () => void;
}

export default function SongOptionsMenu({ visible, onClose, song, onAddToPlaylist }: Props) {
  const { toggleLike, isLiked } = useLikes();
  const { downloadSong, isDownloaded } = useDownloads();
  const { colors } = useTheme();
  const navigation = useNavigation<any>();

  if (!visible || !song) return null;

  const liked = isLiked(song.id);
  const downloaded = isDownloaded(song.id);

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Listen to ${song.title} by ${song.artist} on Melodify!`,
        url: song.streamUrl || song.previewUrl || '',
      });
    } catch (e) {}
    onClose();
  };

  const options = [
    { icon: <Icon name={liked ? "heart" : "heart-outline"} size={22} color={liked ? '#e91e63' : colors.primary} />, label: liked ? 'Unlike Song' : 'Like Song', action: () => { toggleLike(song); onClose(); } },
    { icon: <Icon name="add-circle-outline" size={22} color={colors.primary} />, label: 'Add to Playlist', action: () => { if (onAddToPlaylist) onAddToPlaylist(); else onClose(); } },
    { icon: <Icon name={downloaded ? "download" : "download-outline"} size={22} color={downloaded ? '#4caf50' : colors.primary} />, label: downloaded ? 'Downloaded' : 'Download Song', action: () => { downloadSong(song); onClose(); } },
    { icon: <Icon name="share-social-outline" size={22} color={colors.primary} />, label: 'Share Song', action: handleShare },
    { icon: <Icon name="list-outline" size={22} color={colors.primary} />, label: 'View Queue', action: () => { onClose(); navigation.navigate('Player'); } },
    { icon: <Icon name="musical-notes-outline" size={22} color={colors.primary} />, label: 'Go to Artist', action: () => { onClose(); navigation.navigate('Artist', { name: song.artist }); } },
  ];

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose}>
        <View style={[styles.sheet, { backgroundColor: colors.surface }]} onStartShouldSetResponder={() => true}>
          <View style={styles.handle} />
          
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>{song.title}</Text>
            <Text style={[styles.artist, { color: colors.textSecondary }]} numberOfLines={1}>{song.artist}</Text>
          </View>
          
          {options.map((opt, idx) => (
            <TouchableOpacity key={idx} style={styles.optionBtn} onPress={opt.action}>
              <View style={styles.iconContainer}>{opt.icon}</View>
              <Text style={[styles.optionLabel, { color: colors.text }]}>{opt.label}</Text>
            </TouchableOpacity>
          ))}
          
          <TouchableOpacity style={[styles.cancelBtn, { backgroundColor: 'rgba(255,255,255,0.05)' }]} onPress={onClose}>
            <Text style={[styles.cancelText, { color: colors.text }]}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 40,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  header: {
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  artist: {
    fontSize: 14,
  },
  optionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 8,
  },
  iconContainer: {
    width: 32,
    alignItems: 'center',
    marginRight: 12,
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  cancelBtn: {
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 16,
    fontWeight: 'bold',
  }
});
