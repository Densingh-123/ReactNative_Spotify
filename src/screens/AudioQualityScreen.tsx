import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../context/ThemeContext';
import { usePlayer } from '../context/PlayerContext';
import EqualizerModal from '../components/EqualizerModal';

const QUALITY_OPTIONS = [
  {
    key: 'low',
    label: 'Low',
    bitrate: '48 kbps',
    description: 'Saves data, lower clarity',
    icon: 'wifi-outline',
  },
  {
    key: 'medium',
    label: 'Medium',
    bitrate: '128 kbps',
    description: 'Balanced quality & data',
    icon: 'radio-outline',
  },
  {
    key: 'high',
    label: 'High',
    bitrate: '320 kbps',
    description: 'Best quality, uses more data',
    icon: 'star-outline',
  },
];

const EQ_PRESETS = [
  { name: 'Flat', gains: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
  { name: 'Bass Boost', gains: [6, 5, 4, 2, 0, 0, 0, 0, 0, 0] },
  { name: 'Treble Boost', gains: [0, 0, 0, 0, 0, 2, 3, 4, 5, 6] },
  { name: 'Vocal Boost', gains: [-2, -1, 0, 2, 4, 4, 2, 0, -1, -2] },
  { name: 'Pop', gains: [2, 3, 4, 2, 0, -1, 0, 2, 3, 3] },
  { name: 'Rock', gains: [4, 3, 2, 0, -1, 0, 2, 3, 4, 4] },
];

const BAND_LABELS = ['32', '64', '125', '250', '500', '1K', '2K', '4K', '8K', '16K'];

export default function AudioQualityScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation<any>();
  const { eqBands, getEqGain, setEqGain } = usePlayer();

  const [selectedQuality, setSelectedQuality] = useState('high');
  const [selectedPreset, setSelectedPreset] = useState('Flat');
  const [eqVisible, setEqVisible] = useState(false);

  const applyPreset = (preset: typeof EQ_PRESETS[0]) => {
    setSelectedPreset(preset.name);
    preset.gains.forEach((g, i) => setEqGain(i, g));
  };

  return (
    <View style={[styles.container, { backgroundColor: 'transparent' }]}>
      <View style={[styles.header, { borderBottomColor: 'rgba(255,255,255,0.06)' }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Icon name="chevron-back" size={26} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Audio Quality</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* ── Streaming Quality ── */}
        <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>STREAMING QUALITY</Text>
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          {QUALITY_OPTIONS.map((opt, i) => {
            const isSelected = selectedQuality === opt.key;
            return (
              <TouchableOpacity
                key={opt.key}
                style={[
                  styles.qualityRow,
                  i < QUALITY_OPTIONS.length - 1 && { borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)' },
                  isSelected && { backgroundColor: colors.primary + '12' },
                ]}
                onPress={() => setSelectedQuality(opt.key)}
              >
                <View style={[styles.qualityIcon, { backgroundColor: isSelected ? colors.primary + '22' : 'rgba(255,255,255,0.05)' }]}>
                  <Icon name={opt.icon} size={20} color={isSelected ? colors.primary : colors.textSecondary} />
                </View>
                <View style={styles.qualityInfo}>
                  <Text style={[styles.qualityLabel, { color: isSelected ? colors.primary : colors.text }]}>{opt.label}</Text>
                  <Text style={[styles.qualityBitrate, { color: colors.textSecondary }]}>{opt.bitrate} — {opt.description}</Text>
                </View>
                {isSelected && (
                  <View style={[styles.checkCircle, { backgroundColor: colors.primary }]}>
                    <Icon name="checkmark" size={14} color="#fff" />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Currently playing quality badge */}
        <View style={[styles.activeBadge, { backgroundColor: colors.primary + '18', borderColor: colors.primary + '44' }]}>
          <Icon name="musical-notes" size={16} color={colors.primary} />
          <Text style={[styles.activeBadgeText, { color: colors.primary }]}>
            Currently streaming at{' '}
            <Text style={{ fontWeight: '900' }}>
              {QUALITY_OPTIONS.find(o => o.key === selectedQuality)?.bitrate}
            </Text>
          </Text>
        </View>

        {/* ── Equalizer ── */}
        <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>EQUALIZER</Text>

        {/* Preset Chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
          {EQ_PRESETS.map(preset => {
            const isActive = selectedPreset === preset.name;
            return (
              <TouchableOpacity
                key={preset.name}
                onPress={() => applyPreset(preset)}
                style={[
                  styles.presetChip,
                  {
                    backgroundColor: isActive ? colors.primary : colors.surface,
                    borderColor: isActive ? colors.primary : 'rgba(255,255,255,0.12)',
                  }
                ]}
              >
                <Text style={[styles.presetChipText, { color: isActive ? '#fff' : colors.textSecondary }]}>
                  {preset.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* EQ Band Visualizer (read-only bars showing current applied gains) */}
        <View style={[styles.card, { backgroundColor: colors.surface, paddingVertical: 20 }]}>
          <View style={styles.eqBars}>
            {eqBands.map((freq, i) => {
              const gain = getEqGain(i);
              const barHeight = Math.max(4, Math.min(80, 40 + gain * 4));
              return (
                <View key={freq} style={styles.eqBarCol}>
                  <View style={[styles.eqBarTrack]}>
                    <View style={[styles.eqBar, { height: barHeight, backgroundColor: colors.primary }]} />
                  </View>
                  <Text style={[styles.eqBandLabel, { color: colors.textSecondary }]}>{BAND_LABELS[i]}</Text>
                </View>
              );
            })}
          </View>
          <TouchableOpacity
            style={[styles.eqOpenBtn, { backgroundColor: colors.primary }]}
            onPress={() => setEqVisible(true)}
          >
            <Icon name="options" size={18} color="#fff" />
            <Text style={styles.eqOpenBtnText}>Open Full Equalizer</Text>
          </TouchableOpacity>
        </View>

        {/* ── Audio Enhancement Tips ── */}
        <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>TIPS</Text>
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          {[
            { icon: 'headset', text: 'Use High quality with headphones for best experience' },
            { icon: 'cellular', text: 'Use Low quality on mobile data to save bandwidth' },
            { icon: 'wifi', text: 'High quality works best on Wi-Fi connections' },
          ].map((tip, i) => (
            <View key={i} style={[styles.tipRow, i > 0 && { borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.06)' }]}>
              <Icon name={tip.icon} size={18} color={colors.primary} style={{ marginRight: 12 }} />
              <Text style={[styles.tipText, { color: colors.textSecondary }]}>{tip.text}</Text>
            </View>
          ))}
        </View>

      </ScrollView>

      <EqualizerModal visible={eqVisible} onClose={() => setEqVisible(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 48,
    paddingBottom: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  backBtn: { padding: 4, width: 40 },
  headerTitle: { fontSize: 18, fontWeight: '800', letterSpacing: 0.3 },
  scrollContent: { padding: 16, paddingBottom: 120 },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 10,
    marginTop: 20,
    paddingHorizontal: 2,
  },
  card: {
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 8,
  },
  qualityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  qualityIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  qualityInfo: { flex: 1 },
  qualityLabel: { fontSize: 16, fontWeight: '700' },
  qualityBitrate: { fontSize: 12, marginTop: 2 },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },

  activeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
    gap: 8,
  },
  activeBadgeText: { fontSize: 13 },

  presetChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  presetChipText: { fontSize: 13, fontWeight: '700' },

  eqBars: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 90,
    paddingHorizontal: 8,
    marginBottom: 16,
  },
  eqBarCol: { alignItems: 'center', flex: 1 },
  eqBarTrack: {
    width: 8,
    height: 80,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 4,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  eqBar: { width: '100%', borderRadius: 4 },
  eqBandLabel: { fontSize: 8, marginTop: 4, fontWeight: '600' },
  eqOpenBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
    marginBottom: 4,
    paddingVertical: 12,
    borderRadius: 14,
    gap: 8,
  },
  eqOpenBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },

  tipRow: { flexDirection: 'row', alignItems: 'flex-start', padding: 14 },
  tipText: { fontSize: 13, flex: 1, lineHeight: 18 },
});
