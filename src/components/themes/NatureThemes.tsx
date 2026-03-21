import React, { useMemo, useRef, useEffect } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import Svg, { Circle, Path, Defs, RadialGradient, Stop, Ellipse, Rect, Line } from 'react-native-svg';
import LinearGradient from 'react-native-linear-gradient';

const { width, height } = Dimensions.get('window');

// ─── 9. OCEAN WAVES ───────────────────────────────────────────────────────────
const Wave = ({ yBase, color, speed, offset }: any) => {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(Animated.sequence([
      Animated.timing(anim, { toValue: 1, duration: speed, useNativeDriver: true }),
      Animated.timing(anim, { toValue: 0, duration: speed, useNativeDriver: true }),
    ])).start();
  }, []);
  const ty = anim.interpolate({ inputRange: [0, 1], outputRange: [-12, 12] });
  const tx = anim.interpolate({ inputRange: [0, 1], outputRange: [-20, 20] });
  return (
    <Animated.View style={{ position: 'absolute', left: -30, top: yBase, width: width + 60, height: 80, transform: [{ translateY: ty }, { translateX: tx }] }}>
      <Svg width={width + 60} height={80}>
        <Path d={`M0 30 Q${(width+60)*0.25} 5 ${(width+60)*0.5} 30 Q${(width+60)*0.75} 55 ${width+60} 30 L${width+60} 80 L0 80 Z`} fill={color} opacity={0.4} />
      </Svg>
    </Animated.View>
  );
};

export const OceanWavesRenderer = () => (
  <View style={StyleSheet.absoluteFill}>
    <LinearGradient colors={['#082f49', '#0c4a6e', '#075985']} style={StyleSheet.absoluteFillObject} />
    {[0.45, 0.55, 0.65, 0.72].map((y, i) => (
      <Wave key={i} yBase={height * y} color={i % 2 === 0 ? '#38bdf8' : '#0ea5e9'} speed={3000 + i * 800} offset={i} />
    ))}
  </View>
);

// ─── 10. UNDERWATER BUBBLES ───────────────────────────────────────────────────
const Bubble = ({ startX, size, speed }: any) => {
  const ty = useRef(new Animated.Value(0)).current;
  const wobble = useRef(new Animated.Value(0)).current;
  const op = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    const run = () => {
      ty.setValue(height + size);
      Animated.parallel([
        Animated.timing(ty, { toValue: -size - 20, duration: speed, useNativeDriver: true }),
        Animated.loop(Animated.sequence([
          Animated.timing(wobble, { toValue: 12, duration: 800, useNativeDriver: true }),
          Animated.timing(wobble, { toValue: -12, duration: 800, useNativeDriver: true }),
        ])),
      ]).start(run);
    };
    setTimeout(run, Math.random() * speed);
  }, []);

  return (
    <Animated.View style={{
      position: 'absolute', left: startX, bottom: 0, width: size, height: size, borderRadius: size / 2,
      borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.6)', backgroundColor: 'rgba(255,255,255,0.08)',
      opacity: op, transform: [{ translateY: ty }, { translateX: wobble }],
    }} />
  );
};

export const UnderwaterBubblesRenderer = () => {
  const bubbles = useMemo(() => Array.from({ length: 30 }).map(() => ({
    startX: Math.random() * width, size: Math.random() * 24 + 8, speed: Math.random() * 5000 + 5000,
  })), []);

  return (
    <View style={StyleSheet.absoluteFill}>
      <LinearGradient colors={['#164e63', '#083344', '#042f3d']} style={StyleSheet.absoluteFillObject} />
      {/* God rays */}
      {[0.2, 0.4, 0.6, 0.8].map((x, i) => (
        <View key={i} style={{
          position: 'absolute', left: width * x - 20, top: 0, width: 40, height: height * 0.6,
          backgroundColor: 'rgba(186,230,253,0.06)',
          transform: [{ skewX: `${(i % 2 === 0 ? 8 : -8)}deg` }],
        }} />
      ))}
      {bubbles.map((b, i) => <Bubble key={i} {...b} />)}
    </View>
  );
};

// ─── 11. SEA SHORE ────────────────────────────────────────────────────────────
const ShoreWave = ({ index }: { index: number }) => {
  const progress = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(Animated.sequence([
      Animated.delay(index * 600),
      Animated.timing(progress, { toValue: 1, duration: 2800, useNativeDriver: true }),
      Animated.timing(progress, { toValue: 0, duration: 2800, useNativeDriver: true }),
    ])).start();
  }, []);
  const tx = progress.interpolate({ inputRange: [0, 1], outputRange: [-60, 60] });
  const op = progress.interpolate({ inputRange: [0, 0.3, 0.7, 1], outputRange: [0, 0.7, 0.7, 0] });
  return (
    <Animated.View style={{ position: 'absolute', left: -60, bottom: height * 0.22 + index * 18, width: width + 120, height: 3, backgroundColor: 'rgba(255,255,255,0.8)', borderRadius: 2, opacity: op, transform: [{ translateX: tx }] }} />
  );
};

export const SeaShoreRenderer = () => (
  <View style={StyleSheet.absoluteFill}>
    <LinearGradient colors={['#0ea5e9', '#0284c7', '#7dd3fc']} style={StyleSheet.absoluteFillObject} />
    <LinearGradient colors={['transparent', '#d4a76a', '#c8916c']} start={{ x: 0, y: 0.5 }} end={{ x: 0, y: 1 }} style={StyleSheet.absoluteFillObject} />
    {Array.from({ length: 5 }).map((_, i) => <ShoreWave key={i} index={i} />)}
  </View>
);

// ─── 12. CORAL REEF ───────────────────────────────────────────────────────────
const CoralBranch = ({ x, y, color, height: h }: any) => {
  const sway = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(Animated.sequence([
      Animated.timing(sway, { toValue: 5, duration: 2000 + Math.random() * 1000, useNativeDriver: true }),
      Animated.timing(sway, { toValue: -5, duration: 2000 + Math.random() * 1000, useNativeDriver: true }),
    ])).start();
  }, []);
  const rotate = sway.interpolate({ inputRange: [-5, 5], outputRange: ['-5deg', '5deg'] });
  return (
    <Animated.View style={{
      position: 'absolute', left: x, bottom: y, width: 14, height: h,
      backgroundColor: color, borderRadius: 7, transform: [{ rotate }, { translateY: -h / 2 }],
    }}>
      <View style={{ position: 'absolute', left: -8, top: h * 0.3, width: 10, height: h * 0.5, backgroundColor: color, borderRadius: 5, transform: [{ rotate: '-30deg' }] }} />
      <View style={{ position: 'absolute', right: -8, top: h * 0.5, width: 10, height: h * 0.4, backgroundColor: color, borderRadius: 5, transform: [{ rotate: '30deg' }] }} />
    </Animated.View>
  );
};

const Fish = ({ startX, y, color }: any) => {
  const tx = useRef(new Animated.Value(startX)).current;
  useEffect(() => {
    const run = () => {
      tx.setValue(-60);
      Animated.timing(tx, { toValue: width + 60, duration: 6000 + Math.random() * 4000, useNativeDriver: true }).start(run);
    };
    setTimeout(run, Math.random() * 5000);
  }, []);
  return (
    <Animated.View style={{ position: 'absolute', top: y, transform: [{ translateX: tx }] }}>
      <Svg width={30} height={16}>
        <Ellipse cx="15" cy="8" rx="12" ry="6" fill={color} />
        <Path d="M27 8 L36 2 L36 14 Z" fill={color} />
        <Circle cx="6" cy="6" r="2" fill="#fff" />
      </Svg>
    </Animated.View>
  );
};

export const CoralReefRenderer = () => {
  const corals = useMemo(() => [
    { x: 20, y: 0, color: '#f43f5e', height: 100 }, { x: 60, y: 0, color: '#fb923c', height: 70 },
    { x: 110, y: 0, color: '#a855f7', height: 120 }, { x: 150, y: 0, color: '#06b6d4', height: 85 },
    { x: 200, y: 0, color: '#f43f5e', height: 95 }, { x: 240, y: 0, color: '#eab308', height: 110 },
    { x: 280, y: 0, color: '#10b981', height: 75 }, { x: 320, y: 0, color: '#ec4899', height: 90 },
    { x: 360, y: 0, color: '#06b6d4', height: 105 },
  ], []);

  const fish = useMemo(() => [
    { startX: 0, y: height * 0.3, color: '#fbbf24' },
    { startX: -100, y: height * 0.45, color: '#60a5fa' },
    { startX: -200, y: height * 0.55, color: '#f87171' },
    { startX: -50, y: height * 0.25, color: '#34d399' },
  ], []);

  return (
    <View style={StyleSheet.absoluteFill}>
      <LinearGradient colors={['#082f49', '#0c4a6e', '#0e7490']} style={StyleSheet.absoluteFillObject} />
      {fish.map((f, i) => <Fish key={i} {...f} />)}
      {corals.map((c, i) => <CoralBranch key={i} {...c} />)}
      <LinearGradient colors={['transparent', '#c4a060']} start={{ x: 0, y: 0.7 }} end={{ x: 0, y: 1 }} style={StyleSheet.absoluteFillObject} />
    </View>
  );
};

// ─── 13. JELLYFISH GLOW ───────────────────────────────────────────────────────
const Jellyfish = ({ cx, startY, color, size, speed }: any) => {
  const ty = useRef(new Animated.Value(startY)).current;
  const scale = useRef(new Animated.Value(1)).current;
  const wobble = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(Animated.sequence([
      Animated.timing(ty, { toValue: startY - 40, duration: speed, useNativeDriver: true }),
      Animated.timing(ty, { toValue: startY, duration: speed, useNativeDriver: true }),
    ])).start();
    Animated.loop(Animated.sequence([
      Animated.timing(scale, { toValue: 1.12, duration: 800, useNativeDriver: true }),
      Animated.timing(scale, { toValue: 0.92, duration: 800, useNativeDriver: true }),
    ])).start();
    Animated.loop(Animated.sequence([
      Animated.timing(wobble, { toValue: 15, duration: 2000, useNativeDriver: true }),
      Animated.timing(wobble, { toValue: -15, duration: 2000, useNativeDriver: true }),
    ])).start();
  }, []);

  return (
    <Animated.View style={{ position: 'absolute', left: cx - size / 2, transform: [{ translateY: ty }, { translateX: wobble }] }}>
      <Svg width={size} height={size * 2.5}>
        <Defs>
          <RadialGradient id={`jg${cx}`} cx={size / 2} cy={size * 0.4} r={size * 0.55} gradientUnits="userSpaceOnUse">
            <Stop offset="0%" stopColor="#fff" stopOpacity="0.9" />
            <Stop offset="50%" stopColor={color} stopOpacity="0.7" />
            <Stop offset="100%" stopColor={color} stopOpacity="0.1" />
          </RadialGradient>
        </Defs>
        <Animated.View style={{ transform: [{ scaleY: scale }] }}>
          <Svg width={size} height={size * 0.65}>
            <Path d={`M0 ${size * 0.55} Q${size * 0.5} 0 ${size} ${size * 0.55} Z`} fill={`url(#jg${cx})`} />
          </Svg>
        </Animated.View>
        {[-size * 0.3, -size * 0.1, size * 0.1, size * 0.3].map((tx2, i) => (
          <View key={i} style={{
            position: 'absolute', top: size * 0.55, left: size / 2 + tx2 - 2, width: 2,
            height: size * 0.8 + Math.random() * size * 0.5, backgroundColor: color, opacity: 0.4, borderRadius: 1,
          }} />
        ))}
      </Svg>
    </Animated.View>
  );
};

export const JellyfishGlowRenderer = () => {
  const jellies = useMemo(() => [
    { cx: width * 0.2, startY: height * 0.2, color: '#a78bfa', size: 70, speed: 3000 },
    { cx: width * 0.7, startY: height * 0.1, color: '#ec4899', size: 55, speed: 3500 },
    { cx: width * 0.5, startY: height * 0.5, color: '#22d3ee', size: 85, speed: 4000 },
    { cx: width * 0.15, startY: height * 0.6, color: '#6366f1', size: 50, speed: 2800 },
    { cx: width * 0.85, startY: height * 0.45, color: '#f472b6', size: 60, speed: 3200 },
  ], []);

  return (
    <View style={StyleSheet.absoluteFill}>
      <LinearGradient colors={['#020617', '#0a0520', '#060218']} style={StyleSheet.absoluteFillObject} />
      {jellies.map((j, i) => <Jellyfish key={i} {...j} />)}
    </View>
  );
};

// ─── 14. WATER RIPPLE ─────────────────────────────────────────────────────────
const RippleRing = ({ delay }: { delay: number }) => {
  const scale = useRef(new Animated.Value(0)).current;
  const op = useRef(new Animated.Value(0.8)).current;
  useEffect(() => {
    const run = () => {
      scale.setValue(0); op.setValue(0.7);
      Animated.parallel([
        Animated.timing(scale, { toValue: 5, duration: 3500, useNativeDriver: true }),
        Animated.timing(op, { toValue: 0, duration: 3500, useNativeDriver: true }),
      ]).start(run);
    };
    setTimeout(run, delay);
  }, []);

  return (
    <Animated.View style={{
      position: 'absolute', left: width / 2 - 40, top: height * 0.45 - 40,
      width: 80, height: 80, borderRadius: 40,
      borderWidth: 1.5, borderColor: '#38bdf8',
      opacity: op, transform: [{ scale }],
    }} />
  );
};

export const WaterRippleRenderer = () => (
  <View style={StyleSheet.absoluteFill}>
    <LinearGradient colors={['#e0f7fa', '#b2ebf2', '#80deea']} style={StyleSheet.absoluteFillObject} />
    {Array.from({ length: 5 }).map((_, i) => <RippleRing key={i} delay={i * 700} />)}
    <View style={{ position: 'absolute', left: width / 2 - 3, top: height * 0.45 - 3, width: 6, height: 6, borderRadius: 3, backgroundColor: '#0284c7' }} />
  </View>
);

// ─── 15. RAIN RIPPLES ─────────────────────────────────────────────────────────
const Raindrop = ({ x, y, delay }: any) => {
  const scale = useRef(new Animated.Value(0)).current;
  const op = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const run = () => {
      scale.setValue(0); op.setValue(0.8);
      Animated.sequence([
        Animated.delay(delay + Math.random() * 2000),
        Animated.parallel([
          Animated.timing(scale, { toValue: 2.5, duration: 600, useNativeDriver: true }),
          Animated.timing(op, { toValue: 0, duration: 600, useNativeDriver: true }),
        ]),
      ]).start(run);
    };
    run();
  }, []);
  return (
    <Animated.View style={{
      position: 'absolute', left: x - 12, top: y - 12, width: 24, height: 24, borderRadius: 12,
      borderWidth: 1, borderColor: '#94a3b8', opacity: op, transform: [{ scale }],
    }} />
  );
};

export const RainRipplesRenderer = () => {
  const drops = useMemo(() => Array.from({ length: 25 }).map((_, i) => ({
    x: Math.random() * width, y: height * 0.5 + Math.random() * height * 0.35, delay: i * 150,
  })), []);

  return (
    <View style={StyleSheet.absoluteFill}>
      <LinearGradient colors={['#374151', '#1f2937', '#111827']} style={StyleSheet.absoluteFillObject} />
      {/* Falling rain lines */}
      {Array.from({ length: 60 }).map((_, i) => (
        <View key={`r${i}`} style={{
          position: 'absolute', left: Math.random() * width, top: Math.random() * height * 0.5,
          width: 1, height: 14, backgroundColor: 'rgba(148,163,184,0.4)',
          transform: [{ rotate: '10deg' }],
        }} />
      ))}
      {drops.map((d, i) => <Raindrop key={i} {...d} />)}
    </View>
  );
};

// ─── 16. FLOATING BOAT ────────────────────────────────────────────────────────
export const FloatingBoatRenderer = () => {
  const bob = useRef(new Animated.Value(0)).current;
  const rot = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(Animated.sequence([
      Animated.timing(bob, { toValue: -14, duration: 2200, useNativeDriver: true }),
      Animated.timing(bob, { toValue: 6, duration: 2200, useNativeDriver: true }),
    ])).start();
    Animated.loop(Animated.sequence([
      Animated.timing(rot, { toValue: 1, duration: 3500, useNativeDriver: true }),
      Animated.timing(rot, { toValue: -1, duration: 3500, useNativeDriver: true }),
    ])).start();
  }, []);

  const rotate = rot.interpolate({ inputRange: [-1, 1], outputRange: ['-3deg', '3deg'] });

  return (
    <View style={StyleSheet.absoluteFill}>
      <LinearGradient colors={['#dbeafe', '#bfdbfe', '#93c5fd']} style={StyleSheet.absoluteFillObject} />
      {/* Water */}
      <LinearGradient colors={['transparent', '#0284c7']} start={{ x: 0, y: 0.4 }} end={{ x: 0, y: 1 }} style={StyleSheet.absoluteFillObject} />
      {/* Gentle waves */}
      {[0.58, 0.65, 0.72].map((y, i) => (
        <Wave key={i} yBase={height * y} color={i === 0 ? '#38bdf8' : '#0ea5e9'} speed={2500 + i * 500} offset={i} />
      ))}
      <View style={styles.center}>
        <Animated.View style={{ transform: [{ translateY: bob }, { rotate }] }}>
          <Svg width={160} height={120} viewBox="0 0 160 120">
            {/* Mast */}
            <Line x1="80" y1="15" x2="80" y2="75" stroke="#78350f" strokeWidth="3" />
            {/* Sail */}
            <Path d="M82 18 L120 55 L82 72 Z" fill="#f8fafc" opacity="0.95" />
            {/* Hull */}
            <Path d="M20 78 Q80 70 140 78 Q130 105 80 108 Q30 105 20 78 Z" fill="#92400e" />
            <Rect x="22" y="78" width="116" height="8" fill="#b45309" rx="3" />
          </Svg>
        </Animated.View>
      </View>
    </View>
  );
};

// ─── 17. FALLING LEAVES ───────────────────────────────────────────────────────
const Leaf = ({ startX, color, size, speed, delay }: any) => {
  const ty = useRef(new Animated.Value(-size)).current;
  const tx = useRef(new Animated.Value(0)).current;
  const rot = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const run = () => {
      ty.setValue(-size); tx.setValue(startX);
      Animated.sequence([
        Animated.delay(delay + Math.random() * 3000),
        Animated.parallel([
          Animated.timing(ty, { toValue: height + size, duration: speed, useNativeDriver: true }),
          Animated.timing(rot, { toValue: 3, duration: speed, useNativeDriver: true }),
          Animated.sequence([
            Animated.timing(tx, { toValue: startX + 60, duration: speed / 3, useNativeDriver: true }),
            Animated.timing(tx, { toValue: startX - 40, duration: speed / 3, useNativeDriver: true }),
            Animated.timing(tx, { toValue: startX + 30, duration: speed / 3, useNativeDriver: true }),
          ]),
        ]),
      ]).start(run);
    };
    run();
  }, []);

  const rotate = rot.interpolate({ inputRange: [0, 3], outputRange: ['0deg', '1080deg'] });

  return (
    <Animated.View style={{ position: 'absolute', transform: [{ translateX: tx }, { translateY: ty }, { rotate }] }}>
      <Svg width={size} height={size}>
        <Path d={`M${size/2} 2 Q${size} ${size*0.3} ${size*0.85} ${size*0.7} Q${size/2} ${size} ${size*0.15} ${size*0.7} Q0 ${size*0.3} ${size/2} 2 Z`} fill={color} opacity={0.85} />
        <Line x1={size/2} y1="2" x2={size/2} y2={size * 0.9} stroke="#92400e" strokeWidth="1" opacity="0.5" />
      </Svg>
    </Animated.View>
  );
};

export const FallingLeavesRenderer = () => {
  const colors = ['#d97706', '#b45309', '#dc2626', '#ea580c', '#fbbf24'];
  const leaves = useMemo(() => Array.from({ length: 22 }).map((_, i) => ({
    startX: Math.random() * width, color: colors[i % colors.length],
    size: Math.random() * 20 + 18, speed: Math.random() * 3000 + 4000, delay: i * 300,
  })), []);

  return (
    <View style={StyleSheet.absoluteFill}>
      <LinearGradient colors={['#78350f', '#92400e', '#b45309']} style={StyleSheet.absoluteFillObject} />
      <LinearGradient colors={['#fde68a', '#fbbf24', '#78350f']} start={{ x: 0, y: 0 }} end={{ x: 0, y: 0.5 }} style={StyleSheet.absoluteFillObject} />
      {leaves.map((l, i) => <Leaf key={i} {...l} />)}
    </View>
  );
};

// ─── 18. CHERRY PETALS ────────────────────────────────────────────────────────
const Petal = ({ startX, startY, delay }: any) => {
  const tx = useRef(new Animated.Value(startX)).current;
  const ty = useRef(new Animated.Value(startY)).current;
  const rot = useRef(new Animated.Value(0)).current;
  const op = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const run = () => {
      tx.setValue(startX); ty.setValue(-30); op.setValue(1); rot.setValue(0);
      Animated.sequence([
        Animated.delay(delay + Math.random() * 2000),
        Animated.parallel([
          Animated.timing(ty, { toValue: height + 30, duration: 5000, useNativeDriver: true }),
          Animated.timing(rot, { toValue: 4, duration: 5000, useNativeDriver: true }),
          Animated.sequence([
            Animated.timing(tx, { toValue: startX + 80, duration: 1700, useNativeDriver: true }),
            Animated.timing(tx, { toValue: startX - 50, duration: 1700, useNativeDriver: true }),
            Animated.timing(tx, { toValue: startX + 30, duration: 1600, useNativeDriver: true }),
          ]),
          Animated.sequence([
            Animated.delay(4000),
            Animated.timing(op, { toValue: 0, duration: 1000, useNativeDriver: true }),
          ]),
        ]),
      ]).start(run);
    };
    run();
  }, []);

  const rotate = rot.interpolate({ inputRange: [0, 4], outputRange: ['0deg', '720deg'] });

  return (
    <Animated.View style={{ position: 'absolute', opacity: op, transform: [{ translateX: tx }, { translateY: ty }, { rotate }] }}>
      <Svg width={16} height={12}>
        <Ellipse cx="8" cy="6" rx="8" ry="5" fill="#fda4af" />
      </Svg>
    </Animated.View>
  );
};

export const CherryPetalsRenderer = () => {
  const petals = useMemo(() => Array.from({ length: 28 }).map((_, i) => ({
    startX: Math.random() * width, startY: -30, delay: i * 250,
  })), []);

  return (
    <View style={StyleSheet.absoluteFill}>
      <LinearGradient colors={['#fdf2f8', '#fce7f3', '#fbcfe8']} style={StyleSheet.absoluteFillObject} />
      {/* Tree silhouettes */}
      <View style={{ position: 'absolute', bottom: 0, left: -20, width: 100, height: height * 0.4, backgroundColor: '#9f1239', borderRadius: 50, opacity: 0.5 }} />
      <View style={{ position: 'absolute', bottom: 0, right: -20, width: 120, height: height * 0.45, backgroundColor: '#be185d', borderRadius: 60, opacity: 0.4 }} />
      {petals.map((p, i) => <Petal key={i} {...p} />)}
    </View>
  );
};

// ─── 19. MOVING CLOUDS ────────────────────────────────────────────────────────
const Cloud = ({ startX, y, size, speed }: any) => {
  const tx = useRef(new Animated.Value(startX)).current;
  useEffect(() => {
    const run = () => {
      tx.setValue(-size - 50);
      Animated.timing(tx, { toValue: width + 50, duration: speed, useNativeDriver: true }).start(run);
    };
    tx.setValue(startX);
    Animated.timing(tx, { toValue: width + 50, duration: speed * ((width + 50 - startX) / (width + size + 100)), useNativeDriver: true }).start(run);
  }, []);

  return (
    <Animated.View style={{ position: 'absolute', top: y, transform: [{ translateX: tx }] }}>
      <View style={{ position: 'relative', width: size, height: size * 0.55 }}>
        <View style={{ position: 'absolute', bottom: 0, left: 0, width: size, height: size * 0.45, backgroundColor: '#fff', borderRadius: size * 0.22 }} />
        <View style={{ position: 'absolute', bottom: size * 0.15, left: size * 0.15, width: size * 0.5, height: size * 0.5, backgroundColor: '#f8fafc', borderRadius: size * 0.25 }} />
        <View style={{ position: 'absolute', bottom: size * 0.2, left: size * 0.4, width: size * 0.35, height: size * 0.35, backgroundColor: '#fff', borderRadius: size * 0.175 }} />
      </View>
    </Animated.View>
  );
};

export const MovingCloudsRenderer = () => {
  const cloudData = useMemo(() => [
    { startX: 0, y: height * 0.08, size: 180, speed: 30000 },
    { startX: width * 0.3, y: height * 0.18, size: 140, speed: 25000 },
    { startX: width * 0.7, y: height * 0.05, size: 220, speed: 35000 },
    { startX: -100, y: height * 0.3, size: 160, speed: 28000 },
    { startX: width * 0.5, y: height * 0.38, size: 130, speed: 22000 },
  ], []);

  return (
    <View style={StyleSheet.absoluteFill}>
      <LinearGradient colors={['#93c5fd', '#60a5fa', '#bfdbfe']} style={StyleSheet.absoluteFillObject} />
      {cloudData.map((c, i) => <Cloud key={i} {...c} />)}
    </View>
  );
};

// ─── 20. FIREFLIES ────────────────────────────────────────────────────────────
const Firefly = ({ x, y }: any) => {
  const op = useRef(new Animated.Value(0)).current;
  const tx = useRef(new Animated.Value(x)).current;
  const ty = useRef(new Animated.Value(y)).current;

  useEffect(() => {
    const drift = () => {
      Animated.parallel([
        Animated.timing(tx, { toValue: x + (Math.random() - 0.5) * 80, duration: 3000, useNativeDriver: true }),
        Animated.timing(ty, { toValue: y + (Math.random() - 0.5) * 60, duration: 3000, useNativeDriver: true }),
        Animated.sequence([
          Animated.timing(op, { toValue: 1, duration: 500, useNativeDriver: true }),
          Animated.delay(Math.random() * 2000 + 500),
          Animated.timing(op, { toValue: 0, duration: 500, useNativeDriver: true }),
          Animated.delay(Math.random() * 1500),
        ]),
      ]).start(drift);
    };
    setTimeout(drift, Math.random() * 4000);
  }, []);

  return (
    <Animated.View style={{
      position: 'absolute', width: 6, height: 6, borderRadius: 3,
      backgroundColor: '#86efac', opacity: op,
      shadowColor: '#4ade80', shadowOpacity: 1, shadowRadius: 8,
      transform: [{ translateX: tx }, { translateY: ty }],
    }} />
  );
};

export const FirefliesRenderer = () => {
  const flies = useMemo(() => Array.from({ length: 40 }).map(() => ({
    x: Math.random() * width, y: Math.random() * height,
  })), []);

  return (
    <View style={StyleSheet.absoluteFill}>
      <LinearGradient colors={['#020617', '#052e16', '#0a1628']} style={StyleSheet.absoluteFillObject} />
      {/* Tree silhouettes */}
      {[-30, width * 0.15, width * 0.55, width * 0.8, width - 10].map((x, i) => (
        <View key={i} style={{ position: 'absolute', bottom: 0, left: x, width: 60 + i * 10, height: height * (0.3 + i * 0.04), backgroundColor: '#011811', borderRadius: 0 }} />
      ))}
      {flies.map((f, i) => <Firefly key={i} {...f} />)}
    </View>
  );
};

const styles = StyleSheet.create({ center: { flex: 1, justifyContent: 'center', alignItems: 'center' } });
