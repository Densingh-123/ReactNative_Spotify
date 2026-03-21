import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, Image,
  StyleSheet, Share, Modal, TextInput, ActivityIndicator, Alert
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { db } from '../services/firebaseConfig';
import {
  collection, query, getDocs, doc, getDoc,
  setDoc, serverTimestamp, where, addDoc, onSnapshot
} from 'firebase/firestore';
import { SongItem } from '../services/api';
import { usePlayer } from '../context/PlayerContext';
import SkeletonLoader from '../components/ui/SkeletonLoader';
import LinearGradient from 'react-native-linear-gradient';
import Svg, { Circle } from 'react-native-svg';

// ─────────────────────────────────────────────────────────────────────
// Blend Logic (exact web app algorithm)
// ─────────────────────────────────────────────────────────────────────
const calculateBlend = (mine: SongItem[], theirs: SongItem[]) => {
  if (mine.length === 0 || theirs.length === 0) {
    return { vibeMatch: 0, blendPlaylist: [] };
  }
  
  const theirIds = new Set(theirs.map(s => s.id));
  const commonSongs = mine.filter(s => theirIds.has(s.id));
  
  const uniqueCount = mine.length + theirs.length - commonSongs.length;
  let percentage = uniqueCount === 0 ? 0 : Math.round((commonSongs.length / uniqueCount) * 100);
  
  // Give a small bump if there is at least one overlap so it feels rewarding
  if (commonSongs.length > 0 && percentage < 15) {
    percentage += 15;
  }
  
  // Combine all songs (interleaved)
  const blended: SongItem[] = [];
  let i = 0, j = 0;
  const addedIds = new Set<string>();
  while (i < mine.length || j < theirs.length) {
    if (i < mine.length && !addedIds.has(mine[i].id)) {
      blended.push(mine[i]); addedIds.add(mine[i].id);
    }
    if (j < theirs.length && !addedIds.has(theirs[j].id)) {
      blended.push(theirs[j]); addedIds.add(theirs[j].id);
    }
    i++; j++;
  }
  
  return { vibeMatch: Math.min(100, Math.max(0, percentage)), blendPlaylist: blended };
};

interface BlendDoc {
  id: string;
  name: string;
  participants?: string[];
  vibeMatch?: number;
  createdAt?: any;
}

// ═════════════════════════════════════════════════════════════════════
export default function BlendScreen() {
  const { colors }   = useTheme();
  const navigation   = useNavigation<any>();
  const route        = useRoute<any>();
  const { user }     = useAuth();
  const { playTrack } = usePlayer();

  // When partner opens a share link: route.params.partnerId = sharer's uid
  const partnerIdParam: string | undefined = route.params?.partnerId;

  // ── List view state ──────────────────────────────
  const [myBlends, setMyBlends] = useState<BlendDoc[]>([]);
  const [listsLoading, setListsLoading] = useState(true);

  // ── Create modal state ────────────────────────────
  const [showModal, setShowModal]   = useState(false);
  const [blendName, setBlendName]   = useState('');
  const [creating, setCreating]     = useState(false);

  // ── Active blend (detail view) ─────────────────────
  const [activeBlend, setActiveBlend]   = useState<BlendDoc | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [partnerUsername, setPartnerUsername] = useState('Friend');
  const [blendPlaylist, setBlendPlaylist] = useState<SongItem[]>([]);
  const [vibeMatch, setVibeMatch]       = useState<number | null>(null);
  // "invite" mode: blend created but no partner yet; show share link
  const [shareMode, setShareMode]       = useState(false);

  // ── Fetch my blends list ─────────────────────────
  useEffect(() => {
    if (!user) return;
    setListsLoading(true);
    const q = query(
      collection(db, 'blends'),
      where('participants', 'array-contains', user.uid)
    );
    const unsub = onSnapshot(q, snap => {
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() } as BlendDoc));
      setMyBlends(list);
      setListsLoading(false);
    });
    return () => unsub();
  }, [user]);

  // ── If opened via a share link, immediately compute the blend ──
  useEffect(() => {
    if (partnerIdParam && user && partnerIdParam !== user.uid) {
      openBlendWithPartner(partnerIdParam, null);
    }
  }, [partnerIdParam, user]);

  // ── Create a new named blend ─────────────────────
  const handleCreateBlend = async () => {
    if (!user || !blendName.trim()) return;
    setCreating(true);
    try {
      const docRef = await addDoc(collection(db, 'blends'), {
        name: blendName.trim(),
        participants: [user.uid],
        createdAt: serverTimestamp(),
      });
      setShowModal(false);
      setBlendName('');
      // Fetch my liked songs and store them; then show share mode
      const myLikes = await fetchLikedSongs(user.uid);
      setActiveBlend({ id: docRef.id, name: blendName.trim(), participants: [user.uid] });
      setBlendPlaylist(myLikes); // show creator's songs while waiting for partner
      setVibeMatch(null);
      setShareMode(true); // waiting-for-partner state
    } catch (e) {
      console.error(e);
    } finally {
      setCreating(false);
    }
  };

  // ── Open a saved blend from list ─────────────────
  const openSavedBlend = async (blend: BlendDoc) => {
    if (!user) return;
    setDetailLoading(true);
    setShareMode(false);
    const participants = blend.participants || [];
    const otherId = participants.find(p => p !== user.uid);

    if (!otherId) {
      // Only creator so far — show share-link mode
      setActiveBlend(blend);
      const myLikes = await fetchLikedSongs(user.uid);
      setBlendPlaylist(myLikes);
      setVibeMatch(null);
      setShareMode(true);
      setDetailLoading(false);
    } else {
      // Both users present — calculate blend
      openBlendWithPartner(otherId, blend);
    }
  };

  // ── Fetch liked songs for any user ───────────────
  const fetchLikedSongs = async (uid: string): Promise<SongItem[]> => {
    const snap = await getDocs(collection(db, 'users', uid, 'likedSongs'));
    return snap.docs.map(d => d.data() as SongItem);
  };

  // ── Compute blend between current user and a partner ─────────────
  const openBlendWithPartner = async (partnerId: string, blendDoc: BlendDoc | null) => {
    if (!user) return;
    setDetailLoading(true);
    setShareMode(false);
    try {
      // Partner name
      const pDoc = await getDoc(doc(db, 'users', partnerId));
      let pName = 'Friend';
      if (pDoc.exists()) {
        const d = pDoc.data();
        pName = (d.email ? d.email.split('@')[0] : null) || d.displayName || d.username || 'Friend';
      }
      setPartnerUsername(pName);

      const [myLikes, partnerLikes] = await Promise.all([
        fetchLikedSongs(user.uid),
        fetchLikedSongs(partnerId),
      ]);

      const { vibeMatch: pct, blendPlaylist: mixed } = calculateBlend(myLikes, partnerLikes);
      setVibeMatch(pct);
      setBlendPlaylist(mixed);

      // Set the active blend doc (or create a virtual one for link-opened flows)
      const blendId = [user.uid, partnerId].sort().join('_');
      const bd: BlendDoc = blendDoc || { id: blendId, name: `${pName}'s Blend` };
      setActiveBlend(bd);

      // Persist result to Firestore
      await setDoc(doc(db, 'blends', blendId), {
        name: bd.name,
        participants: [user.uid, partnerId],
        vibeMatch: pct,
        songs: mixed.slice(0, 30),
        updatedAt: serverTimestamp(),
      }, { merge: true });

    } catch (e) {
      console.error('openBlendWithPartner error', e);
      Alert.alert('Error', 'Could not load blend data. Please try again.');
    } finally {
      setDetailLoading(false);
    }
  };

  // ── Share link (sharer's UID is the identifier, exactly like web) ─
  const handleShare = async () => {
    if (!user) return;
    const webUrl = `https://react-melodify.vercel.app/blend/${user.uid}`;
    try {
      await Share.share({
        title: 'Blend our Vibes!',
        message: `${activeBlend?.name ? `"${activeBlend.name}" — ` : ''}Check out our Blend on Melodify!\n\n${webUrl}`,
        url: webUrl,
      });
    } catch (e) { console.error(e); }
  };

  const handlePlayBlend = () => {
    if (blendPlaylist.length > 0) {
      playTrack(blendPlaylist[0], blendPlaylist, 0);
      navigation.navigate('Player');
    }
  };

  const goBack = () => {
    if (activeBlend) { setActiveBlend(null); setShareMode(false); }
    else navigation.goBack();
  };

  if (!user) return null;

  // ─────────────────────────────────────────────────────────────────
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={activeBlend && !shareMode
          ? [`${colors.primary}99`, '#9c27b099', 'transparent']
          : [`${colors.primary}55`, colors.surface, 'transparent']}
        style={styles.bgGradient}
      />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={goBack}>
          <Icon name="chevron-back" size={26} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>
          {activeBlend ? (activeBlend.name || 'Blend') : 'Blend'}
        </Text>
        <View style={{ flex: 1 }} />
        {/* + button only on list view */}
        {!activeBlend && (
          <TouchableOpacity onPress={() => setShowModal(true)} style={{ padding: 4 }}>
            <Icon name="add-circle" size={32} color={colors.primary} />
          </TouchableOpacity>
        )}
        {/* Share button on active blend */}
        {activeBlend && (
          <TouchableOpacity onPress={handleShare} style={{ padding: 4 }}>
            <Icon name="share-social" size={24} color={colors.text} />
          </TouchableOpacity>
        )}
      </View>

      {/* Create Blend Modal */}
      <Modal visible={showModal} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalSheet, { backgroundColor: colors.background }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Name Your Blend</Text>
            <TextInput
              autoFocus
              value={blendName}
              onChangeText={setBlendName}
              placeholder="e.g. Summer Feels"
              placeholderTextColor={colors.textSecondary}
              style={[styles.modalInput, { backgroundColor: colors.surfaceHighlight, borderColor: 'rgba(255,255,255,0.1)', color: colors.text }]}
            />
            <View style={styles.modalBtns}>
              <TouchableOpacity
                style={[styles.modalBtnCancel, { borderColor: 'rgba(255,255,255,0.1)' }]}
                onPress={() => { setShowModal(false); setBlendName(''); }}
              >
                <Text style={[styles.modalBtnText, { color: colors.text }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtnCreate, { backgroundColor: colors.primary, opacity: blendName.trim() && !creating ? 1 : 0.5 }]}
                onPress={handleCreateBlend}
                disabled={!blendName.trim() || creating}
              >
                {creating
                  ? <ActivityIndicator color="#fff" />
                  : <Text style={[styles.modalBtnText, { color: '#fff' }]}>Create</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* ── LIST VIEW ── */}
        {!activeBlend ? (
          listsLoading ? (
            <View style={{ gap: 16 }}>
              <SkeletonLoader height={80} style={{ borderRadius: 16 }} />
              <SkeletonLoader height={80} style={{ borderRadius: 16 }} />
            </View>
          ) : (
            <View style={{ gap: 24 }}>
              {/* Invite card */}
              <View style={styles.inviteSection}>
                <View style={[styles.inviteIconBox, { backgroundColor: `${colors.primary}22` }]}>
                  <Icon name="shuffle" size={52} color={colors.primary} />
                </View>
                <Text style={[styles.inviteTitle, { color: colors.text }]}>Blend</Text>
                <Text style={[styles.inviteDesc, { color: colors.textSecondary }]}>
                  Create a Blend and share the link with a friend. When they open it, you'll both see how much your music tastes match!
                </Text>
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() => setShowModal(true)}
                  style={[styles.shareBtn, { backgroundColor: colors.primary }]}
                >
                  <Icon name="add" size={22} color="#fff" style={{ marginRight: 6 }} />
                  <Text style={styles.shareBtnText}>Create New Blend</Text>
                </TouchableOpacity>
              </View>

              {/* Saved blends list */}
              {myBlends.length > 0 && (
                <View>
                  <Text style={[styles.sectionLabel, { color: colors.text }]}>My Blends</Text>
                  <View style={{ gap: 12 }}>
                    {myBlends.map(blend => {
                      const hasPartner = (blend.participants?.length || 0) > 1;
                      return (
                        <TouchableOpacity
                          key={blend.id}
                          activeOpacity={0.8}
                          style={[styles.blendCard, { backgroundColor: colors.surfaceHighlight, borderColor: 'rgba(255,255,255,0.05)' }]}
                          onPress={() => openSavedBlend(blend)}
                        >
                          <LinearGradient colors={['#8E2DE2', '#4A00E0']} style={styles.blendCardIcon}>
                            <Icon name="shuffle" size={20} color="#fff" />
                          </LinearGradient>
                          <View style={{ flex: 1 }}>
                            <Text style={[styles.blendCardName, { color: colors.text }]}>{blend.name}</Text>
                            <Text style={[styles.blendCardSub, { color: colors.textSecondary }]}>
                              {hasPartner
                                ? `${blend.vibeMatch ?? '?'}% match`
                                : 'Waiting for a friend to open your link'}
                            </Text>
                          </View>
                          <Icon name="chevron-forward" size={18} color={colors.textSecondary} />
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              )}
            </View>
          )
        ) : detailLoading ? (
          /* ── DETAIL LOADING ── */
          <View style={{ gap: 20 }}>
            <SkeletonLoader height={220} style={{ borderRadius: 24 }} />
            <SkeletonLoader height={60} style={{ borderRadius: 12 }} />
            <SkeletonLoader height={60} style={{ borderRadius: 12 }} />
          </View>
        ) : shareMode ? (
          /* ── SHARE MODE (created but no partner yet) ── */
          <View style={styles.inviteSection}>
            <View style={[styles.inviteIconBox, { backgroundColor: `${colors.primary}22` }]}>
              <Icon name="share-social" size={52} color={colors.primary} />
            </View>
            <Text style={[styles.inviteTitle, { color: colors.text }]}>{activeBlend.name}</Text>
            <Text style={[styles.inviteDesc, { color: colors.textSecondary }]}>
              Your Blend link is ready! Share it with a friend. When they open it, you'll both see how much your liked songs match. ✨
            </Text>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={handleShare}
              style={[styles.shareBtn, { backgroundColor: colors.primary, shadowColor: colors.primary }]}
            >
              <Icon name="share-social" size={22} color="#fff" style={{ marginRight: 10 }} />
              <Text style={styles.shareBtnText}>Share Blend Link</Text>
            </TouchableOpacity>

            {blendPlaylist.length > 0 && (
              <View style={{ width: '100%', marginTop: 32 }}>
                <Text style={[styles.sectionLabel, { color: colors.text }]}>Your Liked Songs</Text>
                <View style={{ gap: 10 }}>
                  {blendPlaylist.slice(0, 10).map((song, idx) => (
                    <TouchableOpacity
                      key={`my-${song.id}-${idx}`}
                      style={[styles.songItem, { backgroundColor: colors.surface }]}
                      onPress={() => { playTrack(song, blendPlaylist, idx); navigation.navigate('Player'); }}
                    >
                      <Image source={{ uri: song.artworkUrl }} style={styles.songArt} />
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.songTitle, { color: colors.text }]} numberOfLines={1}>{song.title}</Text>
                        <Text style={[styles.songArtist, { color: colors.textSecondary }]} numberOfLines={1}>{song.artist}</Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
          </View>
        ) : (
          /* ── BLEND RESULT (both users matched) ── */
          <View style={{ gap: 32 }}>
            {/* Vibe Match Card */}
            <View style={[styles.resultCard, { backgroundColor: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.1)' }]}>
              <Text style={[styles.vibeLabel, { color: colors.textSecondary }]}>VIBE MATCH</Text>
              <View style={styles.circleBox}>
                <Svg width={160} height={160} style={{ transform: [{ rotate: '-90deg' }] }}>
                  <Circle cx="80" cy="80" r="72" fill="none" stroke={`${colors.textSecondary}33`} strokeWidth="12" />
                  <Circle
                    cx="80" cy="80" r="72" fill="none"
                    stroke={vibeMatch! > 70 ? '#4caf50' : vibeMatch! > 40 ? '#ff9800' : colors.primary}
                    strokeWidth="12" strokeLinecap="round"
                    strokeDasharray={2 * Math.PI * 72}
                    strokeDashoffset={2 * Math.PI * 72 * (1 - (vibeMatch ?? 0) / 100)}
                  />
                </Svg>
                <View style={styles.vibeTextContainer}>
                  <Text style={[styles.vibeText, { color: colors.text }]}>{vibeMatch}%</Text>
                </View>
              </View>
              <Text style={[styles.partnerLabel, { color: colors.text }]}>You + {partnerUsername}</Text>
            </View>

            {/* Blend Playlist */}
            <View>
              <View style={styles.playlistHeader}>
                <Text style={[styles.playlistTitle, { color: colors.text }]}>Your Blend Playlist</Text>
                <TouchableOpacity
                  onPress={handlePlayBlend}
                  style={[styles.playBtn, { backgroundColor: colors.primary, shadowColor: colors.primary }]}
                >
                  <Icon name="play" size={24} color="#fff" style={{ marginLeft: 3 }} />
                </TouchableOpacity>
              </View>
              <View style={{ gap: 12 }}>
                {blendPlaylist.length === 0 ? (
                  <Text style={{ color: colors.textSecondary, textAlign: 'center', marginTop: 20 }}>
                    No common liked songs found. Start liking more music!
                  </Text>
                ) : (
                  blendPlaylist.map((song, idx) => (
                    <TouchableOpacity
                      key={`${song.id}-${idx}`}
                      style={[styles.songItem, { backgroundColor: colors.surface }]}
                      onPress={() => { playTrack(song, blendPlaylist, idx); navigation.navigate('Player'); }}
                    >
                      <Image source={{ uri: song.artworkUrl }} style={styles.songArt} />
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.songTitle, { color: colors.text }]} numberOfLines={1}>{song.title}</Text>
                        <Text style={[styles.songArtist, { color: colors.textSecondary }]} numberOfLines={1}>{song.artist}</Text>
                      </View>
                    </TouchableOpacity>
                  ))
                )}
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent' },
  bgGradient: { position: 'absolute', top: 0, left: 0, right: 0, height: 400 },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, paddingTop: 48, gap: 12 },
  backBtn: { padding: 4 },
  title: { fontSize: 22, fontWeight: '900' },
  scrollContent: { padding: 20, paddingBottom: 120 },

  // Modal
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
  modalSheet: { width: '90%', maxWidth: 400, padding: 24, borderRadius: 24 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 16 },
  modalInput: { padding: 16, borderRadius: 12, borderWidth: 1, fontSize: 16, marginBottom: 24 },
  modalBtns: { flexDirection: 'row', gap: 12 },
  modalBtnCancel: { flex: 1, padding: 14, borderRadius: 12, borderWidth: 1, alignItems: 'center' },
  modalBtnCreate: { flex: 1, padding: 14, borderRadius: 12, alignItems: 'center' },
  modalBtnText: { fontWeight: 'bold', fontSize: 16 },

  // Invite / Share
  inviteSection: { alignItems: 'center', marginTop: 20 },
  inviteIconBox: { width: 110, height: 110, borderRadius: 55, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  inviteTitle: { fontSize: 26, fontWeight: '900', marginBottom: 8, textAlign: 'center' },
  inviteDesc: { fontSize: 14, textAlign: 'center', maxWidth: 300, marginBottom: 28, lineHeight: 21 },
  shareBtn: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 15, paddingHorizontal: 28,
    borderRadius: 30, elevation: 8,
    shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.4, shadowRadius: 20,
  },
  shareBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },

  // List
  sectionLabel: { fontSize: 18, fontWeight: '800', marginBottom: 14 },
  blendCard: {
    flexDirection: 'row', alignItems: 'center',
    padding: 14, borderRadius: 16, borderWidth: 1,
  },
  blendCardIcon: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  blendCardName: { fontSize: 16, fontWeight: '700' },
  blendCardSub: { fontSize: 12, marginTop: 2 },

  // Result
  resultCard: { padding: 28, borderRadius: 32, borderWidth: 1, alignItems: 'center' },
  vibeLabel: { fontSize: 13, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 2 },
  circleBox: { width: 160, height: 160, marginVertical: 20, justifyContent: 'center', alignItems: 'center' },
  vibeTextContainer: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center' },
  vibeText: { fontSize: 48, fontWeight: '900' },
  partnerLabel: { fontSize: 22, fontWeight: '800', marginTop: 4 },
  playlistHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  playlistTitle: { fontSize: 20, fontWeight: '800' },
  playBtn: {
    width: 48, height: 48, borderRadius: 24,
    justifyContent: 'center', alignItems: 'center',
    elevation: 8, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 16,
  },
  songItem: { flexDirection: 'row', alignItems: 'center', padding: 8, borderRadius: 12, gap: 12 },
  songArt: { width: 48, height: 48, borderRadius: 8 },
  songTitle: { fontSize: 15, fontWeight: '600', marginBottom: 2 },
  songArtist: { fontSize: 13 },
});
