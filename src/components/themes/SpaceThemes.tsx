import React, { useMemo, useRef, useEffect } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import Svg, { Circle, Path, G, Defs, RadialGradient, Stop, Line, Ellipse, Polygon } from 'react-native-svg';
import LinearGradient from 'react-native-linear-gradient';

const { width, height } = Dimensions.get('window');

// ─── 1. TWINKLING STARS ───────────────────────────────────────────────────────
export const TwinklingStarsRenderer = () => {
  const stars = useMemo(() => Array.from({ length: 220 }).map(() => ({
    x: Math.random() * width,
    y: Math.random() * height,
    r: Math.random() * 2.5 + 0.3,
    opacity: new Animated.Value(Math.random()),
    dur: Math.random() * 3000 + 1500,
  })), []);

  useEffect(() => {
    stars.forEach(s => {
      const loop = Animated.loop(Animated.sequence([
        Animated.timing(s.opacity, { toValue: 1, duration: s.dur, useNativeDriver: true }),
        Animated.timing(s.opacity, { toValue: 0.1, duration: s.dur, useNativeDriver: true }),
      ]));
      setTimeout(() => loop.start(), Math.random() * 3000);
    });
  }, []);

  return (
    <View style={StyleSheet.absoluteFill}>
      <LinearGradient colors={['#020619', '#050a1b', '#030810']} style={StyleSheet.absoluteFillObject} />
      {stars.map((s, i) => (
        <Animated.View key={i} style={{
          position: 'absolute', left: s.x, top: s.y,
          width: s.r * 2, height: s.r * 2, borderRadius: s.r,
          backgroundColor: s.r > 1.8 ? '#a8d4ff' : '#ffffff',
          opacity: s.opacity,
          shadowColor: '#fff', shadowOpacity: 0.8, shadowRadius: s.r * 2,
        }} />
      ))}
    </View>
  );
};

// ─── 2. GALAXY SPIRAL ─────────────────────────────────────────────────────────
export const GalaxySpiralRenderer = () => {
  const rot = useRef(new Animated.Value(0)).current;
  const zoom = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(Animated.timing(rot, { toValue: 1, duration: 40000, useNativeDriver: true })).start();
    Animated.loop(Animated.sequence([
      Animated.timing(zoom, { toValue: 1.15, duration: 20000, useNativeDriver: true }),
      Animated.timing(zoom, { toValue: 1, duration: 20000, useNativeDriver: true }),
    ])).start();
  }, []);

  const rotate = rot.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  const spiralPoints = useMemo(() => {
    const pts = [];
    for (let i = 0; i < 300; i++) {
      const angle = i * 0.3;
      const r = i * 0.55;
      pts.push({ x: 150 + Math.cos(angle) * r, y: 150 + Math.sin(angle) * r, s: Math.random() * 2.5 + 0.5 });
      pts.push({ x: 150 + Math.cos(angle + Math.PI) * r * 0.9, y: 150 + Math.sin(angle + Math.PI) * r * 0.9, s: Math.random() * 2 + 0.5 });
    }
    return pts;
  }, []);

  return (
    <View style={StyleSheet.absoluteFill}>
      <LinearGradient colors={['#0b001e', '#150030', '#000000']} style={StyleSheet.absoluteFillObject} />
      <View style={styles.center}>
        <Animated.View style={{ transform: [{ rotate }, { scale: zoom }] }}>
          <Svg width={300} height={300} viewBox="0 0 300 300">
            <Defs>
              <RadialGradient id="core" cx="150" cy="150" r="40" gradientUnits="userSpaceOnUse">
                <Stop offset="0%" stopColor="#fff" stopOpacity="1" />
                <Stop offset="40%" stopColor="#f3a8ff" stopOpacity="0.9" />
                <Stop offset="100%" stopColor="#7c3aed" stopOpacity="0" />
              </RadialGradient>
            </Defs>
            {spiralPoints.map((p, i) => (
              <Circle key={i} cx={p.x} cy={p.y} r={p.s}
                fill={i % 3 === 0 ? '#c084fc' : i % 3 === 1 ? '#818cf8' : '#f0abfc'}
                opacity={0.6 - (i / spiralPoints.length) * 0.4} />
            ))}
            <Circle cx="150" cy="150" r="40" fill="url(#core)" />
          </Svg>
        </Animated.View>
      </View>
    </View>
  );
};

// ─── 3. SHOOTING STARS ────────────────────────────────────────────────────────
const ShootingStreakAnimated = ({ delay }: { delay: number }) => {
  const pos = useRef(new Animated.ValueXY({ x: Math.random() * width, y: -20 })).current;
  const op = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const run = () => {
      pos.setValue({ x: Math.random() * width * 0.8 + 50, y: -20 });
      op.setValue(0);
      Animated.sequence([
        Animated.delay(Math.random() * 6000 + delay),
        Animated.parallel([
          Animated.timing(op, { toValue: 1, duration: 150, useNativeDriver: true }),
          Animated.timing(pos, { toValue: { x: (pos.x as any)._value - 250, y: (pos.y as any)._value + 350 }, duration: 700, useNativeDriver: true }),
        ]),
        Animated.timing(op, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]).start(run);
    };
    run();
  }, []);

  return (
    <Animated.View style={{
      position: 'absolute', width: 2, height: 90,
      backgroundColor: '#fff', opacity: op,
      transform: [{ translateX: pos.x }, { translateY: pos.y }, { rotate: '35deg' }],
      shadowColor: '#9dd8ff', shadowOpacity: 1, shadowRadius: 6,
    }} />
  );
};

export const ShootingStarsRenderer = () => {
  const bgStars = useMemo(() => Array.from({ length: 120 }).map(() => ({
    x: Math.random() * width, y: Math.random() * height,
    r: Math.random() * 1.5 + 0.3, op: Math.random() * 0.7 + 0.3,
  })), []);

  return (
    <View style={StyleSheet.absoluteFill}>
      <LinearGradient colors={['#020614', '#030a1c', '#000000']} style={StyleSheet.absoluteFillObject} />
      {bgStars.map((s, i) => (
        <View key={i} style={{ position: 'absolute', left: s.x, top: s.y, width: s.r * 2, height: s.r * 2, borderRadius: s.r, backgroundColor: '#fff', opacity: s.op }} />
      ))}
      {Array.from({ length: 6 }).map((_, i) => <ShootingStreakAnimated key={i} delay={i * 1500} />)}
    </View>
  );
};

// ─── 4. NEBULA CLOUDS ─────────────────────────────────────────────────────────
const NebulaBlob = ({ cx, cy, color, size, speed, delay }: any) => {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    setTimeout(() => {
      Animated.loop(Animated.sequence([
        Animated.timing(anim, { toValue: 1, duration: speed, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0, duration: speed, useNativeDriver: true }),
      ])).start();
    }, delay);
  }, []);
  const tx = anim.interpolate({ inputRange: [0, 1], outputRange: [-20, 20] });
  const ty = anim.interpolate({ inputRange: [0, 1], outputRange: [-15, 15] });
  return (
    <Animated.View style={{
      position: 'absolute', left: cx - size / 2, top: cy - size / 2,
      width: size, height: size, borderRadius: size / 2,
      backgroundColor: color, opacity: 0.25,
      transform: [{ translateX: tx }, { translateY: ty }],
    }} />
  );
};

export const NebulaCloudsRenderer = () => {
  const blobs = useMemo(() => [
    { cx: width * 0.2, cy: height * 0.3, color: '#f472b6', size: 280, speed: 12000, delay: 0 },
    { cx: width * 0.8, cy: height * 0.2, color: '#818cf8', size: 320, speed: 15000, delay: 2000 },
    { cx: width * 0.5, cy: height * 0.6, color: '#22d3ee', size: 260, speed: 10000, delay: 4000 },
    { cx: width * 0.1, cy: height * 0.7, color: '#c084fc', size: 220, speed: 13000, delay: 1000 },
    { cx: width * 0.9, cy: height * 0.8, color: '#fb7185', size: 200, speed: 11000, delay: 3000 },
    { cx: width * 0.5, cy: height * 0.15, color: '#a78bfa', size: 300, speed: 14000, delay: 5000 },
  ], []);

  return (
    <View style={StyleSheet.absoluteFill}>
      <LinearGradient colors={['#0f172a', '#1e1b4b', '#0d0d2b']} style={StyleSheet.absoluteFillObject} />
      {blobs.map((b, i) => <NebulaBlob key={i} {...b} />)}
    </View>
  );
};

// ─── 5. FLOATING PLANETS ──────────────────────────────────────────────────────
const PlanetSvg = ({ cx, cy, r, color1, color2, hasRing, drift }: any) => {
  const tx = drift.interpolate({ inputRange: [0, 1], outputRange: [-25, 25] });
  const ty = drift.interpolate({ inputRange: [0, 1], outputRange: [-10, 10] });
  return (
    <Animated.View style={{ position: 'absolute', left: cx - r, top: cy - r, transform: [{ translateX: tx }, { translateY: ty }] }}>
      <Svg width={r * 2} height={r * 2 + (hasRing ? 30 : 0)}>
        <Defs>
          <RadialGradient id={`pg${cx}`} cx={r * 0.35} cy={r * 0.35} r={r} gradientUnits="userSpaceOnUse">
            <Stop offset="0%" stopColor="#fff" stopOpacity="0.4" />
            <Stop offset="40%" stopColor={color1} stopOpacity="1" />
            <Stop offset="100%" stopColor={color2} stopOpacity="1" />
          </RadialGradient>
        </Defs>
        {hasRing && <Ellipse cx={r} cy={r + 15} rx={r + 10} ry={8} fill="none" stroke={color1} strokeWidth="3" opacity="0.5" />}
        <Circle cx={r} cy={r} r={r - 2} fill={`url(#pg${cx})`} />
      </Svg>
    </Animated.View>
  );
};

export const FloatingPlanetsRenderer = () => {
  const drifts = useMemo(() => Array.from({ length: 4 }).map(() => new Animated.Value(0)), []);
  useEffect(() => {
    drifts.forEach((d, i) => {
      Animated.loop(Animated.sequence([
        Animated.timing(d, { toValue: 1, duration: 8000 + i * 2000, useNativeDriver: true }),
        Animated.timing(d, { toValue: 0, duration: 8000 + i * 2000, useNativeDriver: true }),
      ])).start();
    });
  }, []);
  const planets = [
    { cx: width * 0.5, cy: height * 0.3, r: 70, color1: '#60a5fa', color2: '#1e3a8a', hasRing: true, drift: drifts[0] },
    { cx: width * 0.2, cy: height * 0.65, r: 45, color1: '#f97316', color2: '#7c2d12', hasRing: false, drift: drifts[1] },
    { cx: width * 0.8, cy: height * 0.55, r: 55, color1: '#34d399', color2: '#064e3b', hasRing: false, drift: drifts[2] },
    { cx: width * 0.15, cy: height * 0.2, r: 30, color1: '#a78bfa', color2: '#4c1d95', hasRing: false, drift: drifts[3] },
  ];
  return (
    <View style={StyleSheet.absoluteFill}>
      <LinearGradient colors={['#000000', '#0a0a1a', '#050510']} style={StyleSheet.absoluteFillObject} />
      {planets.map((p, i) => <PlanetSvg key={i} {...p} />)}
    </View>
  );
};

// ─── 6. ASTEROID FIELD ────────────────────────────────────────────────────────
const Asteroid = ({ delay }: { delay: number }) => {
  const scale = useRef(new Animated.Value(0.1)).current;
  const op = useRef(new Animated.Value(0)).current;
  const tx = useRef(new Animated.Value((Math.random() - 0.5) * width)).current;
  const ty = useRef(new Animated.Value((Math.random() - 0.5) * height)).current;
  const size = Math.random() * 18 + 6;

  useEffect(() => {
    const run = () => {
      scale.setValue(0.1); op.setValue(0);
      const nx = (Math.random() - 0.5) * width * 0.5;
      const ny = (Math.random() - 0.5) * height * 0.5;
      tx.setValue(nx);
      ty.setValue(ny);
      Animated.sequence([
        Animated.delay(delay + Math.random() * 3000),
        Animated.parallel([
          Animated.timing(scale, { toValue: 3 + Math.random() * 2, duration: 2500, useNativeDriver: true }),
          Animated.timing(op, { toValue: 0.8, duration: 400, useNativeDriver: true }),
          Animated.timing(tx, { toValue: nx + (Math.random() - 0.5) * 200, duration: 2500, useNativeDriver: true }),
          Animated.timing(ty, { toValue: ny + (Math.random() - 0.5) * 200, duration: 2500, useNativeDriver: true }),
        ]),
        Animated.timing(op, { toValue: 0, duration: 400, useNativeDriver: true }),
      ]).start(run);
    };
    run();
  }, []);

  return (
    <Animated.View style={{
      position: 'absolute', left: width / 2, top: height / 2,
      width: size, height: size * 0.75, borderRadius: size * 0.2,
      backgroundColor: '#a8a29e',
      opacity: op, transform: [{ scale }, { translateX: tx }, { translateY: ty }, { rotate: `${Math.random() * 60}deg` }],
    }} />
  );
};

export const AsteroidFieldRenderer = () => (
  <View style={StyleSheet.absoluteFill}>
    <LinearGradient colors={['#0c0a09', '#1c1917', '#000000']} style={StyleSheet.absoluteFillObject} />
    {Array.from({ length: 20 }).map((_, i) => <Asteroid key={i} delay={i * 200} />)}
  </View>
);

// ─── 7. BLACK HOLE ────────────────────────────────────────────────────────────
export const BlackHoleRenderer = () => {
  const diskRot = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(Animated.timing(diskRot, { toValue: 1, duration: 4000, useNativeDriver: true })).start();
    Animated.loop(Animated.sequence([
      Animated.timing(pulse, { toValue: 1.04, duration: 1500, useNativeDriver: true }),
      Animated.timing(pulse, { toValue: 1, duration: 1500, useNativeDriver: true }),
    ])).start();
  }, []);

  const rot = diskRot.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  return (
    <View style={StyleSheet.absoluteFill}>
      <LinearGradient colors={['#000', '#000', '#0a0005']} style={StyleSheet.absoluteFillObject} />
      <View style={styles.center}>
        <Animated.View style={{ transform: [{ rotate: rot }, { scale: pulse }] }}>
          <Svg width={320} height={320} viewBox="0 0 320 320">
            <Defs>
              <RadialGradient id="disk" cx="160" cy="160" r="120" gradientUnits="userSpaceOnUse">
                <Stop offset="0%" stopColor="#000" stopOpacity="1" />
                <Stop offset="35%" stopColor="#000" stopOpacity="1" />
                <Stop offset="50%" stopColor="#fbbf24" stopOpacity="0.9" />
                <Stop offset="65%" stopColor="#dc2626" stopOpacity="0.7" />
                <Stop offset="80%" stopColor="#7c2d12" stopOpacity="0.5" />
                <Stop offset="100%" stopColor="#000" stopOpacity="0" />
              </RadialGradient>
            </Defs>
            <Circle cx="160" cy="160" r="120" fill="url(#disk)" />
            <Ellipse cx="160" cy="160" rx="115" ry="28" fill="none" stroke="#fbbf24" strokeWidth="16" opacity="0.6" />
            <Ellipse cx="160" cy="160" rx="100" ry="20" fill="none" stroke="#f97316" strokeWidth="8" opacity="0.4" />
            <Circle cx="160" cy="160" r="48" fill="#000" />
          </Svg>
        </Animated.View>
      </View>
    </View>
  );
};

// ─── 8. CONSTELLATIONS ────────────────────────────────────────────────────────
const CONST_STARS = [
  { x: 0.2, y: 0.2 }, { x: 0.35, y: 0.15 }, { x: 0.5, y: 0.25 },
  { x: 0.65, y: 0.18 }, { x: 0.3, y: 0.4 }, { x: 0.55, y: 0.45 },
  { x: 0.75, y: 0.35 }, { x: 0.15, y: 0.6 }, { x: 0.4, y: 0.65 },
  { x: 0.6, y: 0.7 }, { x: 0.8, y: 0.6 }, { x: 0.25, y: 0.8 },
  { x: 0.5, y: 0.82 }, { x: 0.7, y: 0.78 }, { x: 0.9, y: 0.3 },
];
const LINES = [[0,1],[1,2],[2,3],[4,5],[5,6],[7,8],[8,9],[9,10],[11,12],[12,13],[2,5],[5,9]];

export const ConstellationsRenderer = () => {
  const lineOp = useRef(new Animated.Value(0)).current;
  const twinkle = useRef(Array.from({length: CONST_STARS.length}).map(() => new Animated.Value(Math.random()))).current;

  useEffect(() => {
    Animated.loop(Animated.sequence([
      Animated.timing(lineOp, { toValue: 1, duration: 3000, useNativeDriver: true }),
      Animated.timing(lineOp, { toValue: 0.3, duration: 2000, useNativeDriver: true }),
    ])).start();
    twinkle.forEach(t => {
      Animated.loop(Animated.sequence([
        Animated.timing(t, { toValue: 1, duration: Math.random() * 2000 + 1000, useNativeDriver: true }),
        Animated.timing(t, { toValue: 0.3, duration: Math.random() * 2000 + 1000, useNativeDriver: true }),
      ])).start();
    });
  }, []);

  return (
    <View style={StyleSheet.absoluteFill}>
      <LinearGradient colors={['#020617', '#0a0f23', '#000']} style={StyleSheet.absoluteFillObject} />
      <Svg width={width} height={height} style={StyleSheet.absoluteFillObject}>
        {LINES.map(([a, b], i) => (
          <Line key={i}
            x1={CONST_STARS[a].x * width} y1={CONST_STARS[a].y * height}
            x2={CONST_STARS[b].x * width} y2={CONST_STARS[b].y * height}
            stroke="#60a5fa" strokeWidth="0.8" opacity="0.5"
          />
        ))}
      </Svg>
      {CONST_STARS.map((s, i) => (
        <Animated.View key={i} style={{
          position: 'absolute', left: s.x * width - 5, top: s.y * height - 5,
          width: 10, height: 10, borderRadius: 5, backgroundColor: '#c7d2fe',
          opacity: twinkle[i], shadowColor: '#a5b4fc', shadowOpacity: 1, shadowRadius: 6,
        }} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({ center: { flex: 1, justifyContent: 'center', alignItems: 'center' } });
