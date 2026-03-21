import React from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import Slider from '@react-native-community/slider';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../context/ThemeContext';
import { usePlayer } from '../context/PlayerContext';

const PRESETS = [
  { name: 'Flat / Reference', gains: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
  { name: 'Bass Boost / Club', gains: [7, 6, 4, 1, 0, 0, 0, 0, 0, 0] },
  { name: 'Treble Boost', gains: [0, 0, 0, 0, 0, 1, 3, 5, 6, 7] },
  { name: 'Vocal Boost', gains: [-2, -1, 0, 2, 5, 6, 4, 2, 0, -2] },
  { name: 'Loudness / Pop', gains: [5, 4, 2, 0, -2, -3, 0, 2, 4, 5] },
  { name: 'Wedge / Party', gains: [8, 6, 2, -2, -5, -3, 1, 4, 6, 7] }
];


interface Props {
  visible: boolean;
  onClose: () => void;
}

export default function EqualizerModal({ visible, onClose }: Props) {
  const { colors } = useTheme();
  const { eqBands, getEqGain, setEqGain } = usePlayer();

  const applyPreset = (gains: number[]) => {
    gains.forEach((val, i) => setEqGain(i, val));
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose}>
        <View style={[styles.sheet, { backgroundColor: colors.surface }]} onStartShouldSetResponder={() => true}>
          <View style={styles.handle} />
          
          <View style={styles.header}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Icon name="options" size={24} color={colors.primary} style={{ marginRight: 12 }} />
              <Text style={[styles.title, { color: colors.text }]}>Equalizer</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={{ padding: 4 }}>
              <Icon name="close" size={28} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <View style={{ marginBottom: 16 }}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 8 }}>
              {PRESETS.map((p, idx) => (
                <TouchableOpacity 
                  key={idx} 
                  style={[styles.presetBtn, { backgroundColor: colors.surfaceHighlight, borderColor: 'rgba(255,255,255,0.1)' }]}
                  onPress={() => applyPreset(p.gains)}
                >
                  <Text style={[styles.presetText, { color: colors.text }]}>{p.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            {eqBands.map((freq, index) => {
              const label = freq >= 1000 ? `${freq / 1000}k` : freq.toString();
              return (
                <View key={freq} style={styles.bandCol}>
                  <Text style={[styles.gainLabel, { color: colors.textSecondary }]}>
                    +{Math.round(getEqGain(index))}
                  </Text>
                  
                  <View style={styles.sliderWrapper}>
                    <Slider
                      style={{ width: 140, height: 40 }}
                      minimumValue={-20}
                      maximumValue={20}
                      step={1}
                      value={getEqGain(index)}
                      onValueChange={(val) => setEqGain(index, val)}
                      minimumTrackTintColor={colors.primary}
                      maximumTrackTintColor={`${colors.textSecondary}44`}
                      thumbTintColor={colors.primary}
                    />
                  </View>

                  <Text style={[styles.freqLabel, { color: colors.text }]}>{label}</Text>
                </View>
              );
            })}
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
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  scrollContent: {
    paddingVertical: 16,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  bandCol: {
    alignItems: 'center',
    width: 50,
    marginHorizontal: 4,
    height: 220,
  },
  gainLabel: {
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 12,
  },
  sliderWrapper: {
    width: 140,
    height: 140,
    justifyContent: 'center',
    alignItems: 'center',
    transform: [{ rotate: '-90deg' }],
  },
  freqLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 12,
  },
  presetBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 10,
  },
  presetText: {
    fontSize: 13,
    fontWeight: '700',
  }
});
