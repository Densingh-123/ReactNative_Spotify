import React from 'react';
import { View, ViewStyle, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

interface Props {
  style?: ViewStyle;
  children?: React.ReactNode;
  onPress?: () => void;
  intensity?: number;
}

export default function GlassCard({ style, children, onPress, intensity = 20 }: Props) {
  const { colors } = useTheme();

  const content = (
    <View style={[styles.container, { backgroundColor: colors.surface + 'CC', borderColor: 'rgba(255,255,255,0.12)' }, style]}>
      {/* Frosted glass overlay */}
      <View style={[StyleSheet.absoluteFillObject, { backgroundColor: 'rgba(255,255,255,0.05)' }]} />
      {children}
    </View>
  );

  if (onPress) {
    return <TouchableOpacity activeOpacity={0.8} onPress={onPress}>{content}</TouchableOpacity>;
  }

  return content;
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
  },
});
