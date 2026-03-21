import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, StyleSheet, TextInput, Alert, Modal } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useLikes } from '../hooks/useLikes';
import { useRingtones } from '../hooks/useRingtones';
import { usePlaylists, Playlist } from '../hooks/usePlaylists';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { db } from '../services/firebaseConfig';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { useSocial } from '../context/SocialContext';
import LinearGradient from 'react-native-linear-gradient';

const TABS = ['Playlists', 'Albums', 'Artists'] as const;
type Tab = typeof TABS[number];

export default function LibraryScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation<any>();
  const { likedSongs } = useLikes();
  const { likedRingtones } = useRingtones();
  const { playlists, createPlaylist, createSmartCollection, deletePlaylist } = usePlaylists();
  const { preferences, user } = useAuth();
  const { blends, collabs } = useSocial();
  const [activeTab, setActiveTab] = useState<Tab>('Playlists');
  
  const [modalType, setModalType] = useState<Tab | null>(null);
  const [newName, setNewName] = useState('');
  const [creating, setCreating] = useState(false);

  const handleCreate = async () => {
    if (!newName.trim()) return;
    setCreating(true);
    try {
      if (modalType === 'Playlists') await createPlaylist(newName.trim(), preferences?.languages);
      else if (modalType === 'Albums') await createSmartCollection(newName.trim(), 'smart_album', preferences?.languages);
      else if (modalType === 'Artists') await createSmartCollection(newName.trim(), 'artist_collection', preferences?.languages);
      setModalType(null);
      setNewName('');
    } finally {
      setCreating(false);
    }
  };

  const playlistsByType = (type: Playlist['type']) => playlists.filter(p => p.type === type || (!p.type && type === 'playlist'));

  let data: any[] = [];
  const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400';

  if (activeTab === 'Playlists') {
    data = [
      { id: 'liked', name: 'Liked Songs', count: likedSongs.length, color: '#e91e63', image: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=400', isLiked: true },
      { id: 'ringtones', name: 'Liked Ringtones', count: likedRingtones.length, color: colors.primary, image: 'https://images.unsplash.com/photo-1459749411177-04218006733b?w=400', isRingtone: true },
      ...playlistsByType('playlist').map(p => ({ id: p.id, name: p.name, count: p.songs?.length || 0, color: p.color, image: p.image || DEFAULT_IMAGE, isManageable: true })),
      ...collabs.map(p => ({ id: p.id, name: p.name, count: p.songs?.length || p.songIds?.length || 0, color: colors.primary, image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400', isCollab: true })),
      ...blends.map(b => ({ id: b.id, name: b.name?.includes('Vibe') ? b.name : `Vibe with ${b.participants?.length ? 'Friend' : 'Friend'}`, count: b.songs?.length || b.songIds?.length || 0, color: '#9c27b0', image: 'https://images.unsplash.com/photo-1514525253344-f81f3f77ed96?w=400', isBlend: true, partnerId: b.participants?.find((p:any) => p !== user?.uid) }))
    ];
  } else if (activeTab === 'Albums') {
    data = [
      ...playlistsByType('smart_album').map(p => ({ id: p.id, name: p.name, count: p.songs?.length || 0, color: p.color, image: p.image || DEFAULT_IMAGE, isManageable: true })),
      ...collabs.map(p => ({ id: p.id, name: p.name, count: p.songs?.length || p.songIds?.length || 0, color: colors.primary, image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400', isCollab: true })),
      ...blends.map(b => ({ id: b.id, name: `Vibe with ${b.participants?.length ? 'Friend' : 'Friend'}`, count: b.songs?.length || b.songIds?.length || 0, color: '#9c27b0', image: 'https://images.unsplash.com/photo-1514525253344-f81f3f77ed96?w=400', isBlend: true, partnerId: b.participants?.find((p:any) => p !== user?.uid) }))
    ];
  } else {
    data = playlistsByType('artist_collection').map(p => ({ id: p.id, name: p.name, count: p.songs?.length || 0, color: p.color, image: p.image || DEFAULT_IMAGE, isManageable: true }));
  }

  const handleItemPress = (item: any) => {
    if (item.isLiked) { navigation.navigate('LikedSongs'); return; }
    if (item.isRingtone) { navigation.navigate('Ringtones'); return; }
    if (item.isCollab) { navigation.navigate('CollabDetail', { collabId: item.id }); return; }
    if (item.isBlend) { navigation.navigate('Blend', { partnerId: item.partnerId || 'default' }); return; }
    navigation.navigate('PlaylistDetail', { id: item.id, name: item.name, color: item.color });
  };

  const handleLongPress = (item: any) => {
    if (item.isLiked || item.isRingtone || item.isBlend || item.isCollab) return;
    Alert.alert(
      item.name,
      'Choose an action',
      [
        { text: 'Manage Songs', onPress: () => navigation.navigate('PlaylistManagement', { id: item.id }) },
        { text: `Delete ${activeTab.slice(0, -1)}`, style: 'destructive', onPress: () => deletePlaylist(item.id) },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Library</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => setModalType(activeTab)}>
          <Icon name="add-circle" size={32} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.tabsContainer}>
        {TABS.map(tab => {
          const isActive = activeTab === tab;
          let iconName = 'list';
          if (tab === 'Albums') iconName = 'albums';
          if (tab === 'Artists') iconName = 'people';

          return (
            <TouchableOpacity 
              key={tab} 
              style={[styles.tabBtn, { backgroundColor: isActive ? colors.primary : colors.surface }]}
              onPress={() => setActiveTab(tab)}
            >
              <Icon name={iconName} size={14} color={isActive ? '#fff' : colors.textSecondary} style={{ marginRight: 6 }} />
              <Text style={{ color: isActive ? '#fff' : colors.textSecondary, fontWeight: '700', fontSize: 13 }}>{tab}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.grid}>
          {data.map(item => (
            <TouchableOpacity 
              key={item.id} 
              activeOpacity={0.8}
              style={styles.gridItem}
              onPress={() => handleItemPress(item)}
              onLongPress={() => handleLongPress(item)}
              delayLongPress={300}
            >
              <Image source={{ uri: item.image }} style={StyleSheet.absoluteFillObject} />
              <LinearGradient colors={['rgba(0,0,0,0.9)', 'rgba(0,0,0,0.2)', 'transparent']} start={{x: 0, y: 1}} end={{x: 0, y: 0}} style={styles.itemOverlay}>
                <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.itemCount}>{item.count} tracks</Text>
                
                <View style={[styles.itemIconBox, { backgroundColor: item.color + '55' }]}>
                  {item.isLiked ? <Icon name="heart" size={16} color={item.color} /> : 
                   item.isCollab ? <Icon name="people" size={16} color="#fff" /> :
                   item.isBlend ? <Icon name="disc" size={16} color="#fff" /> :
                   activeTab === 'Artists' ? <Icon name="person" size={16} color={item.color} /> : 
                   <Icon name="disc" size={16} color={item.color} />}
                </View>

                {(item.isCollab || item.isBlend) && (
                  <View style={[styles.badge, { backgroundColor: item.isCollab ? colors.primary : '#9c27b0' }]}>
                    <Text style={styles.badgeText}>{item.isCollab ? 'COLLAB' : 'BLEND'}</Text>
                  </View>
                )}
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>

        {data.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={{ fontSize: 52, marginBottom: 16, opacity: 0.5 }}>
              {activeTab === 'Playlists' ? '🎵' : activeTab === 'Albums' ? '📀' : '👥'}
            </Text>
            <Text style={{ color: colors.textSecondary, marginBottom: 16 }}>No {activeTab.toLowerCase()} found</Text>
            <TouchableOpacity onPress={() => setModalType(activeTab)}>
              <Text style={{ color: colors.primary, fontWeight: 'bold' }}>Add your first {activeTab.slice(0, -1).toLowerCase()}</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Create Modal */}
      <Modal visible={!!modalType} transparent animationType="fade">
        <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={() => setModalType(null)}>
          <View style={[styles.modalCard, { backgroundColor: colors.surface }]} onStartShouldSetResponder={() => true}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                New {modalType === 'Playlists' ? 'Playlist' : modalType === 'Albums' ? 'Smart Album' : 'Artist Collection'}
              </Text>
              <TouchableOpacity onPress={() => setModalType(null)}>
                <Icon name="close" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
            <Text style={[styles.modalDesc, { color: colors.textSecondary }]}>
              {modalType === 'Playlists' ? 'Give your playlist a name.' : `Type a name (e.g. "Love", "Vijay") and we'll find 25 tracks in your preferred languages.`}
            </Text>
            
            <TextInput
              style={[styles.input, { color: colors.text, borderColor: 'rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.03)' }]}
              placeholder={modalType === 'Playlists' ? "Playlist name..." : "Keyword (e.g. Love, Hip Hop)"}
              placeholderTextColor={colors.textSecondary}
              value={newName}
              onChangeText={setNewName}
              autoFocus
              editable={!creating}
              onSubmitEditing={handleCreate}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalType(null)}>
                <Text style={{ color: colors.textSecondary, fontWeight: '600' }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.createBtn, { backgroundColor: colors.primary, opacity: (!newName.trim() || creating) ? 0.5 : 1 }]} 
                onPress={handleCreate}
                disabled={creating || !newName.trim()}
              >
                <Text style={{ color: '#fff', fontWeight: 'bold' }}>{modalType === 'Playlists' ? 'Create' : 'Generate'}</Text>
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
  header: { padding: 20, paddingTop: 48, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 32, fontWeight: '900' },
  addBtn: { padding: 4 },
  tabsContainer: { flexDirection: 'row', paddingHorizontal: 20, marginBottom: 12 },
  tabBtn: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, marginRight: 10 },
  scrollContent: { paddingHorizontal: 16, paddingBottom: 130 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  gridItem: { width: '48%', height: 180, borderRadius: 20, overflow: 'hidden', marginBottom: 14 },
  itemOverlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'flex-end', padding: 12 },
  itemName: { color: '#fff', fontWeight: '900', fontSize: 15 },
  itemCount: { color: 'rgba(255,255,255,0.7)', fontSize: 11, marginTop: 2 },
  itemIconBox: { position: 'absolute', top: 10, right: 10, width: 32, height: 32, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  badge: { position: 'absolute', top: 10, left: 10, paddingHorizontal: 6, paddingVertical: 3, borderRadius: 8 },
  badgeText: { color: '#fff', fontSize: 9, fontWeight: '900' },
  emptyState: { alignItems: 'center', marginTop: 60 },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalCard: { width: '100%', borderRadius: 24, padding: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 20, fontWeight: '800' },
  modalDesc: { fontSize: 13, marginBottom: 20 },
  input: { height: 50, borderRadius: 14, borderWidth: 1, paddingHorizontal: 16, fontSize: 16, marginBottom: 24 },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center' },
  cancelBtn: { padding: 12, marginRight: 12 },
  createBtn: { paddingVertical: 12, paddingHorizontal: 24, borderRadius: 12 }
});
