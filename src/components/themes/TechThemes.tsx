import React, { useMemo, useRef, useEffect } from 'react';
import { View, StyleSheet, Animated, Dimensions, Text } from 'react-native';
import Svg, { Circle, Path, Defs, RadialGradient, Stop, Ellipse, Rect, Line, Polygon, G } from 'react-native-svg';
import LinearGradient from 'react-native-linear-gradient';

const { width, height } = Dimensions.get('window');
const styles = StyleSheet.create({ center: { flex: 1, justifyContent: 'center', alignItems: 'center' } });

// ─── 21. SNOWFALL ─────────────────────────────────────────────────────────────
const Snowflake = ({ x, size, speed, delay }: any) => {
  const ty = useRef(new Animated.Value(-20)).current;
  const wobble = useRef(new Animated.Value(0)).current;
  const rot = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const run = () => {
      ty.setValue(-20);
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(ty, { toValue: height + 20, duration: speed, useNativeDriver: true }),
          Animated.loop(Animated.sequence([
            Animated.timing(wobble, { toValue: 18, duration: 1400, useNativeDriver: true }),
            Animated.timing(wobble, { toValue: -18, duration: 1400, useNativeDriver: true }),
          ])),
          Animated.timing(rot, { toValue: 1, duration: speed, useNativeDriver: true }),
        ]),
      ]).start(run);
    };
    run();
  }, []);

  const rotate = rot.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  return (
    <Animated.View style={{
      position: 'absolute', left: x, top: 0,
      opacity: 0.8, transform: [{ translateY: ty }, { translateX: wobble }, { rotate }],
    }}>
      <Svg width={size} height={size}>
        <G transform={`translate(${size/2},${size/2})`}>
          {[0,60,120,180,240,300].map((angle, i) => (
            <Line key={i} x1="0" y1="0" x2={Math.cos(angle*Math.PI/180)*(size/2-1)} y2={Math.sin(angle*Math.PI/180)*(size/2-1)} stroke="#bfdbfe" strokeWidth="1.5" />
          ))}
          <Circle cx="0" cy="0" r="2" fill="#fff" />
        </G>
      </Svg>
    </Animated.View>
  );
};

export const SnowfallRenderer = () => {
  const flakes = useMemo(() => Array.from({ length: 40 }).map((_, i) => ({
    x: Math.random() * width, size: Math.random() * 16 + 8,
    speed: Math.random() * 4000 + 5000, delay: i * 300,
  })), []);

  return (
    <View style={StyleSheet.absoluteFill}>
      <LinearGradient colors={['#1e3a5f', '#1e40af', '#172554']} style={StyleSheet.absoluteFillObject} />
      {flakes.map((f, i) => <Snowflake key={i} {...f} />)}
      <LinearGradient colors={['transparent', '#f8fafc']} start={{ x: 0, y: 0.8 }} end={{ x: 0, y: 1 }} style={StyleSheet.absoluteFillObject} />
    </View>
  );
};

// ─── 22. BUTTERFLIES ──────────────────────────────────────────────────────────
const Butterfly = ({ startX, startY, color1, color2 }: any) => {
  const tx = useRef(new Animated.Value(startX)).current;
  const ty = useRef(new Animated.Value(startY)).current;
  const wingFlap = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(Animated.sequence([
      Animated.timing(wingFlap, { toValue: 0.2, duration: 180, useNativeDriver: true }),
      Animated.timing(wingFlap, { toValue: 1, duration: 180, useNativeDriver: true }),
    ])).start();

    const drift = () => {
      const nx = Math.random() * width;
      const ny = Math.random() * height * 0.7 + height * 0.05;
      Animated.parallel([
        Animated.timing(tx, { toValue: nx, duration: 2500 + Math.random() * 2000, useNativeDriver: true }),
        Animated.timing(ty, { toValue: ny, duration: 2500 + Math.random() * 2000, useNativeDriver: true }),
      ]).start(drift);
    };
    drift();
  }, []);

  return (
    <Animated.View style={{ position: 'absolute', transform: [{ translateX: tx }, { translateY: ty }] }}>
      <Svg width={40} height={32}>
        {/* Left wings */}
        <Animated.View style={{ transform: [{ scaleX: wingFlap }] }}>
          <Svg width={20} height={32}>
            <Ellipse cx="16" cy="11" rx="14" ry="9" fill={color1} opacity="0.85" />
            <Ellipse cx="13" cy="23" rx="10" ry="7" fill={color2} opacity="0.75" />
          </Svg>
        </Animated.View>
        {/* Right wings */}
        <Animated.View style={{ position: 'absolute', left: 20, transform: [{ scaleX: wingFlap }] }}>
          <Svg width={20} height={32}>
            <Ellipse cx="4" cy="11" rx="14" ry="9" fill={color1} opacity="0.85" />
            <Ellipse cx="7" cy="23" rx="10" ry="7" fill={color2} opacity="0.75" />
          </Svg>
        </Animated.View>
        <Ellipse cx="20" cy="16" rx="2" ry="14" fill="#292524" />
      </Svg>
    </Animated.View>
  );
};

export const ButterfliesRenderer = () => {
  const butterflies = useMemo(() => [
    { startX: width * 0.1, startY: height * 0.2, color1: '#f97316', color2: '#dc2626' },
    { startX: width * 0.7, startY: height * 0.15, color1: '#3b82f6', color2: '#6366f1' },
    { startX: width * 0.4, startY: height * 0.5, color1: '#eab308', color2: '#f97316' },
    { startX: width * 0.8, startY: height * 0.6, color1: '#ec4899', color2: '#a855f7' },
    { startX: width * 0.2, startY: height * 0.65, color1: '#10b981', color2: '#0ea5e9' },
    { startX: width * 0.55, startY: height * 0.35, color1: '#f43f5e', color2: '#fb923c' },
  ], []);

  return (
    <View style={StyleSheet.absoluteFill}>
      <LinearGradient colors={['#dcfce7', '#d1fae5', '#bbf7d0']} style={StyleSheet.absoluteFillObject} />
      {/* Flower dots */}
      {Array.from({ length: 20 }).map((_, i) => (
        <View key={i} style={{ position: 'absolute', left: Math.random() * width, top: height * 0.6 + Math.random() * height * 0.35, width: 14, height: 14, borderRadius: 7, backgroundColor: ['#f43f5e','#fbbf24','#a855f7','#60a5fa'][i % 4], opacity: 0.7 }} />
      ))}
      {butterflies.map((b, i) => <Butterfly key={i} {...b} />)}
    </View>
  );
};

// ─── 23. GRASS WIND ───────────────────────────────────────────────────────────
const GrassBlade = ({ x, h, color, phase }: any) => {
  const sway = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    setTimeout(() => {
      Animated.loop(Animated.sequence([
        Animated.timing(sway, { toValue: 1, duration: 1800, useNativeDriver: true }),
        Animated.timing(sway, { toValue: -1, duration: 1800, useNativeDriver: true }),
      ])).start();
    }, phase * 60);
  }, []);
  const rotate = sway.interpolate({ inputRange: [-1, 1], outputRange: ['-18deg', '18deg'] });
  return (
    <Animated.View style={{
      position: 'absolute', left: x, bottom: 0,
      width: 3, height: h, backgroundColor: color,
      borderRadius: 2, transform: [{ rotate }, { translateY: 0 }],
      transformOrigin: 'bottom center',
    }} />
  );
};

export const GrassWindRenderer = () => {
  const blades = useMemo(() => Array.from({ length: 80 }).map((_, i) => ({
    x: (width / 80) * i + (Math.random() * 6 - 3),
    h: Math.random() * 80 + 40,
    color: ['#16a34a','#15803d','#4ade80','#22c55e'][i % 4],
    phase: i,
  })), []);

  return (
    <View style={StyleSheet.absoluteFill}>
      <LinearGradient colors={['#7dd3fc', '#bae6fd', '#e0f2fe']} style={StyleSheet.absoluteFillObject} />
      <LinearGradient colors={['transparent', '#16a34a']} start={{ x: 0, y: 0.6 }} end={{ x: 0, y: 1 }} style={StyleSheet.absoluteFillObject} />
      {blades.map((b, i) => <GrassBlade key={i} {...b} />)}
    </View>
  );
};

// ─── 24. SUNRISE SKY ──────────────────────────────────────────────────────────
export const SunriseSkyRenderer = () => {
  const progress = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(Animated.sequence([
      Animated.timing(progress, { toValue: 1, duration: 12000, useNativeDriver: false }),
      Animated.timing(progress, { toValue: 0, duration: 12000, useNativeDriver: false }),
    ])).start();
  }, []);

  const sunY = progress.interpolate({ inputRange: [0, 1], outputRange: [height * 0.85, height * 0.3] });
  const sunScale = progress.interpolate({ inputRange: [0, 1], outputRange: [1.2, 0.85] });

  return (
    <View style={StyleSheet.absoluteFill}>
      <LinearGradient colors={['#312e81', '#6d28d9', '#f97316', '#fbbf24']} locations={[0, 0.3, 0.7, 1]} style={StyleSheet.absoluteFillObject} />
      <Animated.View style={{
        position: 'absolute', left: width / 2 - 55, transform: [{ translateY: sunY }, { scale: sunScale }],
      }}>
        <Svg width={110} height={110}>
          <Defs>
            <RadialGradient id="sun" cx="55" cy="55" r="55" gradientUnits="userSpaceOnUse">
              <Stop offset="0%" stopColor="#fff7" stopOpacity="1" />
              <Stop offset="40%" stopColor="#fde68a" stopOpacity="0.95" />
              <Stop offset="100%" stopColor="#f97316" stopOpacity="0.5" />
            </RadialGradient>
          </Defs>
          <Circle cx="55" cy="55" r="55" fill="url(#sun)" />
        </Svg>
      </Animated.View>
      {/* Horizon buildings silhouette */}
      <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: height * 0.18, backgroundColor: '#0f172a', borderTopLeftRadius: 10 }}>
        {[10, 40, 70, 105, 140, 175, 210, 248, 285, 320, 350].map((x, i) => (
          <View key={i} style={{ position: 'absolute', bottom: 0, left: x, width: 22 + i * 2, height: 50 + (i % 4) * 30, backgroundColor: '#020617' }} />
        ))}
      </View>
    </View>
  );
};

// ─── 27. NEON LINES ───────────────────────────────────────────────────────────
const NeonLine = ({ x1, y1, x2, y2, color, delay }: any) => {
  const progress = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    setTimeout(() => {
      Animated.loop(Animated.sequence([
        Animated.timing(progress, { toValue: 1, duration: 2000, useNativeDriver: true }),
        Animated.delay(500),
        Animated.timing(progress, { toValue: 0, duration: 800, useNativeDriver: true }),
        Animated.delay(1000),
      ])).start();
    }, delay);
  }, []);
  const op = progress.interpolate({ inputRange: [0, 0.2, 0.8, 1], outputRange: [0, 1, 1, 0] });
  return (
    <Animated.View style={{ position: 'absolute', left: 0, top: 0, opacity: op }}>
      <Svg width={width} height={height}>
        <Line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth="2" opacity="1" />
        <Line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth="6" opacity="0.2" />
      </Svg>
    </Animated.View>
  );
};

export const NeonLinesRenderer = () => {
  const lines = useMemo(() => {
    const colors = ['#22d3ee', '#f0abfc', '#4ade80', '#fb923c', '#a78bfa', '#f472b6'];
    return Array.from({ length: 16 }).map((_, i) => ({
      x1: Math.random() * width, y1: Math.random() * height,
      x2: Math.random() * width, y2: Math.random() * height,
      color: colors[i % colors.length], delay: i * 300,
    }));
  }, []);

  return (
    <View style={StyleSheet.absoluteFill}>
      <View style={[StyleSheet.absoluteFillObject, { backgroundColor: '#000' }]} />
      {lines.map((l, i) => <NeonLine key={i} {...l} />)}
    </View>
  );
};

// ─── 33. MATRIX RAIN ──────────────────────────────────────────────────────────
const MatrixColumn = ({ x, speed, chars }: any) => {
  const ty = useRef(new Animated.Value(-height)).current;
  useEffect(() => {
    const run = () => {
      ty.setValue(-height * 0.5);
      Animated.timing(ty, { toValue: height, duration: speed, useNativeDriver: true }).start(run);
    };
    setTimeout(run, Math.random() * speed);
  }, []);

  return (
    <Animated.View style={{ position: 'absolute', left: x, top: 0, transform: [{ translateY: ty }] }}>
      {chars.map((c: string, i: number) => (
        <Text key={i} style={{
          color: i === chars.length - 1 ? '#fff' : i > chars.length - 4 ? '#a7f3d0' : '#00ff41',
          fontSize: 13, fontFamily: 'monospace', lineHeight: 16, opacity: 1 - (i / chars.length) * 0.7,
        }}>{c}</Text>
      ))}
    </Animated.View>
  );
};

const MATRIX_CHARS = '日月火水木金土ア01ウエオカキクケコサシABCDEFGHIJ0123456789';

export const MatrixRainRenderer = () => {
  const columns = useMemo(() => {
    const cols = [];
    for (let x = 0; x < width; x += 15) {
      const len = Math.floor(Math.random() * 15 + 8);
      const chars = Array.from({ length: len }).map(() => MATRIX_CHARS[Math.floor(Math.random() * MATRIX_CHARS.length)]);
      cols.push({ x, speed: Math.random() * 2000 + 2000, chars });
    }
    return cols;
  }, []);

  return (
    <View style={StyleSheet.absoluteFill}>
      <View style={[StyleSheet.absoluteFillObject, { backgroundColor: '#000' }]} />
      {columns.map((c, i) => <MatrixColumn key={i} {...c} />)}
    </View>
  );
};

// ─── 38. RADAR SCAN ───────────────────────────────────────────────────────────
export const RadarScanRenderer = () => {
  const rotation = useRef(new Animated.Value(0)).current;
  const blips = useMemo(() => Array.from({ length: 8 }).map(() => ({
    angle: Math.random() * Math.PI * 2,
    r: Math.random() * 0.38 + 0.08,
    op: new Animated.Value(0),
  })), []);

  useEffect(() => {
    Animated.loop(Animated.timing(rotation, { toValue: 1, duration: 3000, useNativeDriver: true })).start();
  }, []);

  const rotate = rotation.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  const R = Math.min(width, height) * 0.42;

  return (
    <View style={StyleSheet.absoluteFill}>
      <View style={[StyleSheet.absoluteFillObject, { backgroundColor: '#000d00' }]} />
      <View style={styles.center}>
        <View style={{ width: R * 2, height: R * 2, borderRadius: R, borderWidth: 1.5, borderColor: '#00ff41', opacity: 0.5, position: 'relative', justifyContent: 'center', alignItems: 'center' }}>
          {[0.33, 0.66, 1].map((f, i) => (
            <View key={i} style={{ position: 'absolute', width: R * 2 * f, height: R * 2 * f, borderRadius: R * f, borderWidth: 1, borderColor: '#00ff4155' }} />
          ))}
          <Svg width={R * 2} height={R * 2} style={{ position: 'absolute' }}>
            <Line x1={R} y1={0} x2={R} y2={R * 2} stroke="#00ff4133" strokeWidth="1" />
            <Line x1={0} y1={R} x2={R * 2} y2={R} stroke="#00ff4133" strokeWidth="1" />
          </Svg>
          {/* Blips */}
          {blips.map((b, i) => (
            <View key={i} style={{
              position: 'absolute',
              left: R + Math.cos(b.angle) * R * b.r - 4,
              top: R + Math.sin(b.angle) * R * b.r - 4,
              width: 8, height: 8, borderRadius: 4, backgroundColor: '#00ff41',
            }} />
          ))}
          {/* Rotating sweep */}
          <Animated.View style={{ position: 'absolute', width: R * 2, height: R * 2, borderRadius: R, transform: [{ rotate }] }}>
            <Svg width={R * 2} height={R * 2}>
              <Path d={`M ${R} ${R} L ${R} ${2} A ${R} ${R} 0 0 1 ${R + R * 0.25} ${R * 0.05} Z`} fill="#00ff41" opacity="0.3" />
              <Line x1={R} y1={R} x2={R} y2={2} stroke="#00ff41" strokeWidth="2" />
            </Svg>
          </Animated.View>
          <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: '#00ff41' }} />
        </View>
      </View>
    </View>
  );
};

// ─── 39. BALLOONS ─────────────────────────────────────────────────────────────
const Balloon = ({ startX, startY, color, speed }: any) => {
  const ty = useRef(new Animated.Value(startY)).current;
  const wobble = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const run = () => {
      ty.setValue(height + 80);
      Animated.parallel([
        Animated.timing(ty, { toValue: -200, duration: speed, useNativeDriver: true }),
        Animated.loop(Animated.sequence([
          Animated.timing(wobble, { toValue: 12, duration: 1200, useNativeDriver: true }),
          Animated.timing(wobble, { toValue: -12, duration: 1200, useNativeDriver: true }),
        ])),
      ]).start(run);
    };
    setTimeout(run, Math.random() * speed * 0.8);
  }, []);

  return (
    <Animated.View style={{ position: 'absolute', left: startX - 25, top: 0, transform: [{ translateY: ty }, { translateX: wobble }] }}>
      <Svg width={50} height={90}>
        <Defs>
          <RadialGradient id={`bg${startX}`} cx="18" cy="18" r="25" gradientUnits="userSpaceOnUse">
            <Stop offset="0%" stopColor="#fff" stopOpacity="0.5" />
            <Stop offset="100%" stopColor={color} stopOpacity="1" />
          </RadialGradient>
        </Defs>
        <Ellipse cx="25" cy="25" rx="22" ry="26" fill={`url(#bg${startX})`} />
        <Path d="M25 51 Q23 58 25 65 Q27 58 25 51" stroke={color} strokeWidth="1.5" fill="none" />
        <Path d="M25 65 Q20 72 25 78 Q30 72 25 65" stroke="#78350f" strokeWidth="1" fill="none" />
      </Svg>
    </Animated.View>
  );
};

export const BalloonsRenderer = () => {
  const balloons = useMemo(() => [
    { startX: width * 0.15, startY: height + 100, color: '#ef4444', speed: 9000 },
    { startX: width * 0.35, startY: height + 200, color: '#3b82f6', speed: 11000 },
    { startX: width * 0.55, startY: height + 80, color: '#22c55e', speed: 8500 },
    { startX: width * 0.75, startY: height + 150, color: '#eab308', speed: 10000 },
    { startX: width * 0.9, startY: height + 50, color: '#a855f7', speed: 9500 },
    { startX: width * 0.05, startY: height + 180, color: '#f97316', speed: 12000 },
  ], []);

  return (
    <View style={StyleSheet.absoluteFill}>
      <LinearGradient colors={['#dbeafe', '#eff6ff', '#fce7f3']} style={StyleSheet.absoluteFillObject} />
      {balloons.map((b, i) => <Balloon key={i} {...b} />)}
    </View>
  );
};

// ─── 40. PAPER PLANES ─────────────────────────────────────────────────────────
const PaperPlane = ({ startX, startY, color, speed }: any) => {
  const tx = useRef(new Animated.Value(startX)).current;
  const ty = useRef(new Animated.Value(startY)).current;
  const rot = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animate = () => {
      const newY = Math.random() * height * 0.7 + 50;
      tx.setValue(-60); ty.setValue(newY);
      Animated.parallel([
        Animated.timing(tx, { toValue: width + 60, duration: speed, useNativeDriver: true }),
        Animated.sequence([
          Animated.timing(ty, { toValue: newY - 80, duration: speed * 0.3, useNativeDriver: true }),
          Animated.timing(ty, { toValue: newY - 30, duration: speed * 0.4, useNativeDriver: true }),
          Animated.timing(ty, { toValue: newY - 70, duration: speed * 0.3, useNativeDriver: true }),
        ]),
        Animated.timing(rot, { toValue: 0.04, duration: speed, useNativeDriver: true }),
      ]).start(animate);
    };
    setTimeout(animate, Math.random() * speed);
  }, []);

  const rotate = rot.interpolate({ inputRange: [0, 0.04], outputRange: ['-8deg', '8deg'] });

  return (
    <Animated.View style={{ position: 'absolute', transform: [{ translateX: tx }, { translateY: ty }, { rotate }] }}>
      <Svg width={42} height={28}>
        <Path d="M2 14 L40 2 L30 14 L40 26 Z" fill={color} opacity="0.9" />
        <Path d="M30 14 L2 14" stroke={color} strokeWidth="0.5" opacity="0.5" />
      </Svg>
    </Animated.View>
  );
};

export const PaperPlanesRenderer = () => {
  const planes = useMemo(() => Array.from({ length: 5 }).map((_, i) => ({
    startX: -60, startY: Math.random() * height * 0.6 + 80,
    color: '#fff', speed: 6000 + Math.random() * 4000,
  })), []);

  return (
    <View style={StyleSheet.absoluteFill}>
      <LinearGradient colors={['#bfdbfe', '#dbeafe', '#fce7f3']} style={StyleSheet.absoluteFillObject} />
      {planes.map((p, i) => <PaperPlane key={i} {...p} />)}
    </View>
  );
};

// ─── 31. ENERGY WAVES ─────────────────────────────────────────────────────────
const EnergyRing = ({ delay, color }: any) => {
  const scale = useRef(new Animated.Value(0.1)).current;
  const op = useRef(new Animated.Value(0.8)).current;
  useEffect(() => {
    const run = () => {
      scale.setValue(0.1); op.setValue(0.8);
      Animated.parallel([
        Animated.timing(scale, { toValue: 5, duration: 2200, useNativeDriver: true }),
        Animated.timing(op, { toValue: 0, duration: 2200, useNativeDriver: true }),
      ]).start(run);
    };
    setTimeout(run, delay);
  }, []);
  const sz = Math.min(width, height) * 0.5;
  return (
    <Animated.View style={{
      position: 'absolute', left: width / 2 - sz / 2, top: height / 2 - sz / 2,
      width: sz, height: sz, borderRadius: sz / 2,
      borderWidth: 3, borderColor: color, opacity: op, transform: [{ scale }],
    }} />
  );
};

export const EnergyWavesRenderer = () => (
  <View style={StyleSheet.absoluteFill}>
    <LinearGradient colors={['#000814', '#020617', '#0a0020']} style={StyleSheet.absoluteFillObject} />
    {Array.from({ length: 5 }).map((_, i) => (
      <EnergyRing key={i} delay={i * 440} color={i % 2 === 0 ? '#3b82f6' : '#8b5cf6'} />
    ))}
    <View style={{ position: 'absolute', left: width / 2 - 6, top: height / 2 - 6, width: 12, height: 12, borderRadius: 6, backgroundColor: '#fff', shadowColor: '#8b5cf6', shadowOpacity: 1, shadowRadius: 20 }} />
  </View>
);

// ─── 32. AURORA LIGHTS ────────────────────────────────────────────────────────
const AuroraCurtain = ({ x, color, speed, delay }: any) => {
  const sway = useRef(new Animated.Value(0)).current;
  const op = useRef(new Animated.Value(0.2)).current;
  useEffect(() => {
    setTimeout(() => {
      Animated.loop(Animated.sequence([
        Animated.timing(sway, { toValue: 1, duration: speed, useNativeDriver: true }),
        Animated.timing(sway, { toValue: 0, duration: speed, useNativeDriver: true }),
      ])).start();
      Animated.loop(Animated.sequence([
        Animated.timing(op, { toValue: 0.6, duration: speed * 0.7, useNativeDriver: true }),
        Animated.timing(op, { toValue: 0.1, duration: speed * 0.7, useNativeDriver: true }),
      ])).start();
    }, delay);
  }, []);
  const skew = sway.interpolate({ inputRange: [0, 1], outputRange: ['-12deg', '12deg'] });
  return (
    <Animated.View style={{
      position: 'absolute', left: x, top: 0, width: 80, height: height * 0.65,
      backgroundColor: color, opacity: op,
      transform: [{ skewX: skew }],
      borderRadius: 40,
    }} />
  );
};

export const AuroraLightsRenderer = () => {
  const curtains = useMemo(() => [
    { x: -20, color: '#4ade80', speed: 5000, delay: 0 },
    { x: width * 0.15, color: '#34d399', speed: 6000, delay: 800 },
    { x: width * 0.32, color: '#a78bfa', speed: 4500, delay: 1600 },
    { x: width * 0.5, color: '#c084fc', speed: 5500, delay: 400 },
    { x: width * 0.67, color: '#22d3ee', speed: 6500, delay: 1200 },
    { x: width * 0.82, color: '#4ade80', speed: 5000, delay: 2000 },
  ], []);

  return (
    <View style={StyleSheet.absoluteFill}>
      <LinearGradient colors={['#020617', '#0a192f', '#051005']} style={StyleSheet.absoluteFillObject} />
      {curtains.map((c, i) => <AuroraCurtain key={i} {...c} />)}
      {/* Stars */}
      {Array.from({ length: 60 }).map((_, i) => (
        <View key={i} style={{
          position: 'absolute', left: Math.random() * width, top: Math.random() * height * 0.5,
          width: 2, height: 2, borderRadius: 1, backgroundColor: '#fff', opacity: Math.random() * 0.6 + 0.2,
        }} />
      ))}
      {/* Snowy landscape */}
      <LinearGradient colors={['transparent', '#e2e8f0']} start={{ x: 0, y: 0.75 }} end={{ x: 0, y: 1 }} style={StyleSheet.absoluteFillObject} />
    </View>
  );
};
