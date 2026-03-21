import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet, Easing, Dimensions } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useTheme } from '../../context/ThemeContext';

const { width, height } = Dimensions.get('window');

export default function CinematicLoader() {
  const { colors } = useTheme();
  
  // Animation values
  const rotateX = useRef(new Animated.Value(0)).current;
  const rotateY = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(0)).current;
  const floatZ = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // 3D Rotation Animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(rotateX, { toValue: 1, duration: 4000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(rotateX, { toValue: 0, duration: 4000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(rotateY, { toValue: 1, duration: 3000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(rotateY, { toValue: 0, duration: 3000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    ).start();

    // Pulse and Float Animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 2000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 2000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(floatZ, { toValue: 1, duration: 2500, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(floatZ, { toValue: 0, duration: 2500, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    ).start();
  }, [rotateX, rotateY, pulse, floatZ]);

  // Interpolations
  const spinX = rotateX.interpolate({ inputRange: [0, 1], outputRange: ['20deg', '-20deg'] });
  const spinY = rotateY.interpolate({ inputRange: [0, 1], outputRange: ['-25deg', '25deg'] });
  
  const scaleCenter = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1.1] });
  const opacityOuter = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.3, 0.8] });
  const floatOffset = floatZ.interpolate({ inputRange: [0, 1], outputRange: [-10, 10] });

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#020617', '#0f172a', '#020617']} style={StyleSheet.absoluteFillObject} />
      
      {/* 3D Glass Rings Container */}
      <Animated.View style={[styles.ringsContainer, { transform: [{ rotateX: spinX }, { rotateY: spinY }, { translateY: floatOffset }] }]}>
        
        {/* Ring 1 (Outer) */}
        <Animated.View style={[styles.ring, styles.ringOuter, { opacity: opacityOuter, transform: [{ scale: 1.2 }] }]} />
        
        {/* Ring 2 (Middle) */}
        <Animated.View style={[styles.ring, styles.ringMiddle, { transform: [{ scale: 1.05 }, { rotateZ: rotateX.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '180deg'] }) }] }]} />
        
        {/* Center Glowing Core */}
        <Animated.View style={[styles.coreGlow, { transform: [{ scale: scaleCenter }] }]}>
          <LinearGradient
            colors={['#e0f2fe', '#38bdf8', '#0284c7']}
            style={styles.coreGradient}
            start={{ x: 0.2, y: 0.2 }}
            end={{ x: 0.8, y: 0.8 }}
          />
        </Animated.View>

      </Animated.View>

      {/* Brand Text */}
      <View style={styles.textContainer}>
        <Text style={[styles.brandText, { color: '#f8fafc' }]}>MELODIFY</Text>
        <Animated.Text style={[styles.subText, { color: '#94a3b8', opacity: opacityOuter }]}>
          
        </Animated.Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020617',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringsContainer: {
    width: 200,
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    position: 'absolute',
    borderWidth: 2,
    borderRadius: 100,
  },
  ringOuter: {
    width: 180,
    height: 180,
    borderColor: 'rgba(14, 165, 233, 0.4)',
    borderTopColor: 'rgba(56, 189, 248, 0.9)',
    borderBottomColor: 'rgba(56, 189, 248, 0.9)',
    shadowColor: '#0ea5e9',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 15,
  },
  ringMiddle: {
    width: 140,
    height: 140,
    borderColor: 'rgba(125, 211, 252, 0.6)',
    borderLeftColor: 'rgba(224, 242, 254, 0.9)',
    borderRightColor: 'rgba(224, 242, 254, 0.9)',
  },
  coreGlow: {
    width: 70,
    height: 70,
    borderRadius: 35,
    shadowColor: '#38bdf8',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 30,
    elevation: 20,
    backgroundColor: 'transparent',
  },
  coreGradient: {
    flex: 1,
    borderRadius: 35,
  },
  textContainer: {
    position: 'absolute',
    bottom: height * 0.15,
    alignItems: 'center',
  },
  brandText: {
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: 10,
    marginBottom: 8,
  },
  subText: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 5,
  },
});
