import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, StyleSheet, Modal } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function SettingsScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation<any>();
  const { user, signOut, preferences, updateLanguages } = useAuth();

  const [langModalVisible, setLangModalVisible] = useState(false);
  const [tempLangs, setTempLangs] = useState<string[]>(preferences?.languages || []);

  const LANGUAGES = ['English', 'Hindi', 'Tamil', 'Telugu', 'Kannada', 'Marathi', 'Bengali', 'Malayalam', 'Punjabi'];

  const handleSaveLangs = async () => {
    if (tempLangs.length === 0) return;
    await updateLanguages(tempLangs);
    setLangModalVisible(false);
  };

  const toggleLang = (lang: string) => {
    setTempLangs(prev => prev.includes(lang) ? prev.filter(l => l !== lang) : [...prev, lang]);
  };

  const handleSignOut = async () => {
    await signOut();
    // navigation.reset is handled automatically by MainNavigator
  };

  const sections = [
    {
      title: 'Account',
      items: [
        { icon: 'person', label: 'Profile', sub: user?.email || 'Not logged in', action: () => { } },
        { icon: 'log-out', label: 'Sign Out', sub: 'See you next time!', action: handleSignOut, danger: true },
      ]
    },
    {
      title: 'Music',
      items: [
        { icon: 'globe-outline', label: 'Music Languages', sub: preferences?.languages?.join(', ') || 'English, Tamil', action: () => { setTempLangs(preferences?.languages || []); setLangModalVisible(true); } },
        { icon: 'download', label: 'Downloads', sub: 'Offline songs', action: () => navigation.navigate('Downloads') },
        { icon: 'time', label: 'Recently Played', sub: 'Your history', action: () => navigation.navigate('RecentlyPlayed') },
        { icon: 'heart', label: 'Liked Songs', sub: 'Your favorites', action: () => navigation.navigate('LikedSongs') },
      ]
    },
    {
      title: 'Social & Friends',
      items: [
        { icon: 'shuffle', label: 'Blend', sub: 'Merge taste with friends', action: () => navigation.navigate('Blend', { partnerId: '' }) },
        { icon: 'people', label: 'Collab Hub', sub: 'Listen together', action: () => navigation.navigate('CollabHub') },
      ]
    },
    {
      title: 'Personalization',
      items: [
        { icon: 'color-palette', label: 'Themes', sub: '100 themes available', action: () => navigation.navigate('Themes') },
        { icon: 'musical-notes', label: 'Ringtones', sub: 'Set your incoming call tune', action: () => navigation.navigate('Ringtones') },
        { icon: 'time', label: 'Ringtones History', sub: 'Your custom rings', action: () => navigation.navigate('RingtoneHistory') },
        { icon: 'stats-chart', label: 'Listening Stats', sub: 'Time spent, top artists', action: () => navigation.navigate('Stats') },
        { icon: 'musical-notes', label: 'Audio Quality & EQ', sub: 'Streaming quality & equalizer', action: () => navigation.navigate('AudioQuality') },
      ]
    },
    {
      title: 'Support & Info',
      items: [
        { icon: 'help-circle', label: 'Support Chat', sub: 'AI-powered help', action: () => navigation.navigate('SupportChat') },
        { icon: 'lock-closed', label: 'Privacy Policy', sub: 'How we protect your data', action: () => { } },
        { icon: 'information-circle', label: 'About Melodify', sub: 'Version 1.0.0', action: () => { } },
      ]
    },
  ];

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Profile Header */}
        <View style={[styles.profileHeader, { backgroundColor: colors.surface }]}>
          <View style={[styles.avatarBox, { backgroundColor: colors.primary }]}>
            {user?.photoURL ? (
              <Image source={{ uri: user.photoURL }} style={styles.avatar} />
            ) : (
              <Icon name="person" size={38} color="#fff" />
            )}
          </View>
          <View style={styles.profileInfo}>
            <Text style={[styles.profileName, { color: colors.text }]}>{user?.displayName || 'Music Lover'}</Text>
            <Text style={[styles.profileEmail, { color: colors.textSecondary }]}>{user?.email || 'Guest User'}</Text>
            {!user && (
              <TouchableOpacity onPress={() => navigation.navigate('Login')} style={[styles.loginBtn, { backgroundColor: colors.primary }]}>
                <Text style={styles.loginBtnText}>Login Now</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Settings Sections */}
        {sections.map((sec, idx) => (
          <View key={idx} style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>{sec.title}</Text>
            <View style={[styles.sectionCard, { backgroundColor: colors.surface, borderColor: 'rgba(255,255,255,0.05)' }]}>
              {sec.items.map((item, i) => (
                <TouchableOpacity
                  key={item.label}
                  activeOpacity={0.7}
                  onPress={item.action}
                  style={[
                    styles.itemBtn,
                    i < sec.items.length - 1 && { borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' }
                  ]}
                >
                  <View style={[styles.itemIconBox, { backgroundColor: item.danger ? '#ff000020' : colors.primary + '20' }]}>
                    <Icon name={item.icon} size={18} color={item.danger ? '#ff4444' : colors.primary} />
                  </View>
                  <View style={styles.itemInfo}>
                    <Text style={[styles.itemLabel, { color: item.danger ? '#ff4444' : colors.text }]}>{item.label}</Text>
                    <Text style={[styles.itemSub, { color: colors.textSecondary }]}>{item.sub}</Text>
                  </View>
                  <Icon name="chevron-forward" size={16} color={colors.textSecondary} />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        <Text style={[styles.footerText, { color: colors.textSecondary }]}>Melodify v1.0.0 — Made with ❤️</Text>
      </ScrollView>

      {/* Language Modal */}
      <Modal visible={langModalVisible} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, { backgroundColor: colors.surface }]}>
            <View style={styles.modalHeader}>
              <View style={[styles.modalIconBox, { backgroundColor: colors.primary + '22' }]}>
                <Icon name="globe-outline" size={32} color={colors.primary} />
              </View>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Music Languages</Text>
              <Text style={[styles.modalSubtitle, { color: colors.textSecondary }]}>Select languages for your personalized feed</Text>
            </View>

            <ScrollView style={styles.langList}>
              <View style={styles.langGrid}>
                {LANGUAGES.map(lang => {
                  const isSelected = tempLangs.includes(lang);
                  return (
                    <TouchableOpacity
                      key={lang}
                      onPress={() => toggleLang(lang)}
                      style={[
                        styles.langBtn,
                        {
                          backgroundColor: isSelected ? colors.primary + '15' : 'rgba(255,255,255,0.05)',
                          borderColor: isSelected ? colors.primary + '44' : 'transparent',
                        }
                      ]}
                    >
                      <Text style={[styles.langText, { color: isSelected ? colors.primary : colors.text }]}>{lang}</Text>
                      {isSelected && <Icon name="checkmark-circle" size={18} color={colors.primary} />}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setLangModalVisible(false)}>
                <Text style={{ color: colors.textSecondary, fontWeight: '700' }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveBtn, { backgroundColor: colors.primary }]}
                onPress={handleSaveLangs}
                disabled={tempLangs.length === 0}
              >
                <Text style={{ color: '#fff', fontWeight: 'bold' }}>Save</Text>
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
  scrollContent: { padding: 16, paddingTop: 48, paddingBottom: 130 },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 24,
    borderRadius: 24,
    marginBottom: 24,
  },
  avatarBox: {
    width: 72,
    height: 72,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  profileInfo: {
    marginLeft: 18,
    flex: 1,
  },
  profileName: {
    fontSize: 22,
    fontWeight: '900',
  },
  profileEmail: {
    fontSize: 13,
    marginTop: 2,
  },
  loginBtn: {
    marginTop: 10,
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  loginBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 13,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    paddingHorizontal: 4,
    marginBottom: 10,
  },
  sectionCard: {
    borderRadius: 18,
    borderWidth: 1,
    overflow: 'hidden',
  },
  itemBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  itemIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  itemInfo: {
    flex: 1,
  },
  itemLabel: {
    fontSize: 15,
    fontWeight: '700',
  },
  itemSub: {
    fontSize: 12,
    marginTop: 2,
  },
  footerText: {
    textAlign: 'center',
    fontSize: 13,
    paddingTop: 8,
    marginBottom: 20,
  },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalCard: { width: '100%', borderRadius: 24, padding: 24 },
  modalHeader: { alignItems: 'center', marginBottom: 20 },
  modalIconBox: { width: 60, height: 60, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 22, fontWeight: '900' },
  modalSubtitle: { fontSize: 13, marginTop: 4, textAlign: 'center' },
  langList: { maxHeight: 300 },
  langGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  langBtn: { width: '48%', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 12, borderRadius: 14, borderWidth: 1, marginBottom: 10 },
  langText: { fontSize: 14, fontWeight: '700' },
  modalActions: { flexDirection: 'row', paddingTop: 24 },
  cancelBtn: { flex: 1, padding: 14, alignItems: 'center' },
  saveBtn: { flex: 1, padding: 14, borderRadius: 14, alignItems: 'center' }
});
