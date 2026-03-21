import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { ThemeRenderer } from './ThemeEngine';

export default function AnimatedBackground() {
  const { colors, currentMode } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]} pointerEvents="none">
      <ThemeRenderer themeMode={currentMode} colors={colors} />
      
      {/* Subtle overlay for depth and color blending */}
      <View style={[styles.overlay, { backgroundColor: colors.background + '22' }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
    zIndex: -1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  }
});
