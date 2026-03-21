import React from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { SongItem } from '../services/api';
import { usePlaylists } from '../hooks/usePlaylists';
import { useTheme } from '../context/ThemeContext';

interface Props {
  visible: boolean;
  onClose: () => void;
  song: SongItem | null;
}

export default function PlaylistPickerModal({ visible, onClose, song }: Props) {
  const { playlists, addSongToPlaylist } = usePlaylists();
  const { colors } = useTheme();

  if (!visible) return null;

  const handleAdd = async (playlistId: string) => {
    if (song) await addSongToPlaylist(playlistId, song);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose}>
        <View style={[styles.card, { backgroundColor: colors.surface }]} onStartShouldSetResponder={() => true}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>Add to Playlist</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Icon name="close" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
            {playlists.length === 0 ? (
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                No playlists yet. Create one in the Library tab.
              </Text>
            ) : (
              playlists.map(p => (
                <TouchableOpacity
                  key={p.id}
                  style={[styles.playlistBtn, { borderBottomColor: 'rgba(255,255,255,0.05)' }]}
                  onPress={() => handleAdd(p.id)}
                >
                  <View style={[styles.iconBox, { backgroundColor: p.color + '33' }]}>
                    <Icon name="musical-note" size={20} color={p.color} />
                  </View>
                  <View style={styles.info}>
                    <Text style={[styles.pName, { color: colors.text }]}>{p.name}</Text>
                    <Text style={[styles.pCount, { color: colors.textSecondary }]}>{p.songs?.length || 0} songs</Text>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    maxHeight: '80%',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
  },
  closeBtn: {
    padding: 4,
  },
  list: {
    maxHeight: 400,
  },
  emptyText: {
    textAlign: 'center',
    paddingVertical: 20,
    fontSize: 14,
  },
  playlistBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  info: {
    flex: 1,
  },
  pName: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  pCount: {
    fontSize: 13,
  }
});
