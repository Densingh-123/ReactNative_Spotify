import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet, Modal, Image, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { db } from '../services/firebaseConfig';
import { collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import SkeletonLoader from '../components/ui/SkeletonLoader';
import LinearGradient from 'react-native-linear-gradient';

interface CollabPlaylist {
  id: string;
  name: string;
  ownerId: string;
  ownerName: string;
  createdAt: any;
}

export default function CollaborationHubScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation<any>();
  const { user } = useAuth();

  const [playlists, setPlaylists] = useState<CollabPlaylist[]>([]);
  const [loading, setLoading]     = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newName, setNewName]     = useState('');
  const [creating, setCreating]   = useState(false);

  useEffect(() => {
    if (!user) return;
    fetchPlaylists();
  }, [user]);

  const fetchPlaylists = async () => {
    try {
      // Exactly as web: query on 'members' array-contains, owner is always in members
      const q = query(collection(db, 'collab_playlists'), where('members', 'array-contains', user!.uid));
      const snap = await getDocs(q);
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() } as CollabPlaylist));
      setPlaylists(list);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!user || !newName.trim()) return;
    setCreating(true);
    try {
      // Exactly as web: addDoc with owner as first member
      const docRef = await addDoc(collection(db, 'collab_playlists'), {
        name: newName.trim(),
        ownerId: user.uid,
        ownerName: user.displayName || 'Anonymous',
        members: [user.uid],
        createdAt: serverTimestamp(),
      });
      setShowModal(false);
      setNewName('');
      navigation.navigate('CollabDetail', { collabId: docRef.id });
    } catch (e) {
      console.error(e);
    } finally {
      setCreating(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { borderBottomColor: 'rgba(255,255,255,0.05)' }]}>
        <View style={styles.headerLeft}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Icon name="chevron-back" size={26} color={colors.text} />
          </TouchableOpacity>
          <Icon name="people" size={24} color={colors.primary} />
          <Text style={[styles.title, { color: colors.text }]}>Collab Playlists</Text>
        </View>
        <TouchableOpacity onPress={() => setShowModal(true)}>
          <Icon name="add-circle" size={32} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={{ gap: 16 }}>
            <SkeletonLoader height={80} style={{ borderRadius: 16 }} />
            <SkeletonLoader height={80} style={{ borderRadius: 16 }} />
          </View>
        ) : playlists.length === 0 ? (
          <View style={styles.emptyState}>
            <Icon name="people" size={64} color={`${colors.primary}44`} />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No collab playlists yet</Text>
            <TouchableOpacity
              style={[styles.createBtn, { backgroundColor: colors.primary }]}
              onPress={() => setShowModal(true)}
            >
              <Text style={styles.createBtnText}>Start a Collaboration</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={{ gap: 16 }}>
            {playlists.map(p => (
              <TouchableOpacity
                key={p.id}
                activeOpacity={0.8}
                onPress={() => navigation.navigate('CollabDetail', { collabId: p.id })}
                style={[styles.playlistCard, { borderColor: 'rgba(255,255,255,0.05)' }]}
              >
                <LinearGradient
                  colors={[colors.surfaceHighlight, colors.surface]}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                  style={StyleSheet.absoluteFillObject}
                />
                <Image
                  source={{ uri: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400' }}
                  style={{ width: 50, height: 50, borderRadius: 8, marginRight: 15 }}
                />
                <View style={{ flex: 1, zIndex: 1 }}>
                  <Text style={[styles.cardTitle, { color: colors.text }]}>{p.name}</Text>
                  <Text style={[styles.cardSubtitle, { color: colors.textSecondary }]}>
                    Created by {p.ownerName}
                  </Text>
                </View>
                <Icon name="chevron-forward" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      <Modal visible={showModal} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalSheet, { backgroundColor: colors.background }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Name Your Playlist</Text>
            <TextInput
              autoFocus
              value={newName}
              onChangeText={setNewName}
              placeholder="e.g. Roadtrip Vibes"
              placeholderTextColor={colors.textSecondary}
              style={[styles.modalInput, { backgroundColor: colors.surfaceHighlight, borderColor: 'rgba(255,255,255,0.1)', color: colors.text }]}
            />
            <View style={styles.modalBtns}>
              <TouchableOpacity
                style={[styles.modalBtnCancel, { borderColor: 'rgba(255,255,255,0.1)' }]}
                onPress={() => { setShowModal(false); setNewName(''); }}
              >
                <Text style={[styles.modalBtnText, { color: colors.text }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtnCreate, { backgroundColor: colors.primary, opacity: newName.trim() && !creating ? 1 : 0.5 }]}
                onPress={handleCreate}
                disabled={!newName.trim() || creating}
              >
                {creating
                  ? <ActivityIndicator color="#fff" />
                  : <Text style={[styles.modalBtnText, { color: '#fff' }]}>Create</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, paddingTop: 48, borderBottomWidth: 1 },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  backBtn: { padding: 4 },
  title: { fontSize: 22, fontWeight: '900' },
  scrollContent: { padding: 20 },
  emptyState: { alignItems: 'center', justifyContent: 'center', marginTop: 100 },
  emptyText: { fontSize: 16, marginTop: 16, marginBottom: 24 },
  createBtn: { paddingVertical: 12, paddingHorizontal: 24, borderRadius: 24 },
  createBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  playlistCard: { padding: 20, borderRadius: 16, borderWidth: 1, flexDirection: 'row', alignItems: 'center', overflow: 'hidden' },
  cardTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 4 },
  cardSubtitle: { fontSize: 13 },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
  modalSheet: { width: '90%', maxWidth: 400, padding: 24, borderRadius: 24 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 16 },
  modalInput: { padding: 16, borderRadius: 12, borderWidth: 1, fontSize: 16, marginBottom: 24 },
  modalBtns: { flexDirection: 'row', gap: 12 },
  modalBtnCancel: { flex: 1, padding: 14, borderRadius: 12, borderWidth: 1, alignItems: 'center' },
  modalBtnCreate: { flex: 1, padding: 14, borderRadius: 12, alignItems: 'center' },
  modalBtnText: { fontWeight: 'bold', fontSize: 16 },
});
