import React, { useMemo, useRef, useEffect } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import Svg, { Circle, Path, Defs, RadialGradient, Stop, Ellipse, Rect, Line, G } from 'react-native-svg';
import LinearGradient from 'react-native-linear-gradient';

const { width, height } = Dimensions.get('window');
const styles = StyleSheet.create({ center: { flex: 1, justifyContent: 'center', alignItems: 'center' } });

// Shared: Raindrop on glass
const GlassRain = ({ color = '#94a3b8' }: any) => {
  const drops = useMemo(() => Array.from({ length: 50 }).map(() => ({
    x: Math.random() * width, speed: new Animated.Value(0), size: Math.random() * 30 + 20,
    startX: Math.random() * width,
  })), []);
  useEffect(() => {
    drops.forEach(d => {
      const run = () => {
        d.speed.setValue(0);
        Animated.timing(d.speed, { toValue: 1, duration: Math.random() * 2000 + 1500, useNativeDriver: true }).start(run);
      };
      run();
    });
  }, []);
  return (
    <View style={StyleSheet.absoluteFill}>
      {drops.map((d, i) => {
        const ty = d.speed.interpolate({ inputRange: [0, 1], outputRange: [0, height] });
        return (
          <Animated.View key={i} style={{
            position: 'absolute', left: d.startX, top: 0, width: 2, height: d.size,
            backgroundColor: color, opacity: 0.4, borderRadius: 2,
            transform: [{ translateY: ty }],
          }} />
        );
      })}
    </View>
  );
};

// Shared: City bokeh lights
const BokehLights = ({ colors }: any) => {
  const lights = useMemo(() => Array.from({ length: 25 }).map(() => ({
    x: Math.random() * width, y: height * 0.4 + Math.random() * height * 0.4,
    size: Math.random() * 30 + 12, color: colors[Math.floor(Math.random() * colors.length)],
    op: new Animated.Value(Math.random() * 0.5 + 0.3),
  })), []);
  useEffect(() => {
    lights.forEach(l => {
      Animated.loop(Animated.sequence([
        Animated.timing(l.op, { toValue: Math.random() * 0.4 + 0.5, duration: Math.random() * 2000 + 1000, useNativeDriver: true }),
        Animated.timing(l.op, { toValue: Math.random() * 0.3 + 0.2, duration: Math.random() * 2000 + 1000, useNativeDriver: true }),
      ])).start();
    });
  }, []);
  return (
    <View style={StyleSheet.absoluteFill}>
      {lights.map((l, i) => (
        <Animated.View key={i} style={{
          position: 'absolute', left: l.x, top: l.y, width: l.size, height: l.size,
          borderRadius: l.size / 2, backgroundColor: l.color, opacity: l.op,
        }} />
      ))}
    </View>
  );
};

// ─── 41. BUS WINDOW RAIN ──────────────────────────────────────────────────────
export const BusWindowRainRenderer = () => (
  <View style={StyleSheet.absoluteFill}>
    <LinearGradient colors={['#0f172a', '#1e293b', '#0f172a']} style={StyleSheet.absoluteFillObject} />
    <BokehLights colors={['#fbbf24', '#f97316', '#60a5fa', '#f43f5e']} />
    <GlassRain color="#94a3b8" />
    {/* Window frame */}
    <View style={{ position: 'absolute', left: 0, top: 0, right: 0, bottom: 0, borderWidth: 24, borderColor: '#1e293b' }} />
  </View>
);

// ─── 42. TRAIN WINDOW ─────────────────────────────────────────────────────────
const TrainStreak = ({ y, speed, color }: any) => {
  const tx = useRef(new Animated.Value(-300)).current;
  useEffect(() => {
    const run = () => { tx.setValue(-300); Animated.timing(tx, { toValue: width + 300, duration: speed, useNativeDriver: true }).start(run); };
    run();
  }, []);
  return <Animated.View style={{ position: 'absolute', top: y, left: 0, width: 220, height: 2, backgroundColor: color, opacity: 0.6, transform: [{ translateX: tx }] }} />;
};

export const TrainWindowRenderer = () => {
  const streaks = useMemo(() => Array.from({ length: 18 }).map((_, i) => ({
    y: Math.random() * height, speed: Math.random() * 300 + 250,
    color: ['#fde68a', '#fff', '#bae6fd', '#d1fae5'][i % 4],
  })), []);
  return (
    <View style={StyleSheet.absoluteFill}>
      <LinearGradient colors={['#14532d', '#166534', '#1a4731']} style={StyleSheet.absoluteFillObject} />
      {streaks.map((s, i) => <TrainStreak key={i} {...s} />)}
      <View style={{ position: 'absolute', left: 0, top: 0, right: 0, bottom: 0, borderWidth: 20, borderColor: '#0c0a09' }} />
    </View>
  );
};

// ─── 43. METRO RIDE ───────────────────────────────────────────────────────────
const TunnelLight = ({ index }: any) => {
  const tx = useRef(new Animated.Value(width + 20)).current;
  useEffect(() => {
    const run = () => { tx.setValue(width + 20); Animated.timing(tx, { toValue: -20, duration: 350, useNativeDriver: true }).start(run); };
    setTimeout(run, index * 95);
  }, []);
  return (
    <Animated.View style={{
      position: 'absolute', top: 30, left: 0, width: 16, height: height - 60,
      backgroundColor: '#facc15', opacity: 0.5, transform: [{ translateX: tx }],
    }} />
  );
};

export const MetroRideRenderer = () => (
  <View style={StyleSheet.absoluteFill}>
    <View style={[StyleSheet.absoluteFillObject, { backgroundColor: '#050505' }]} />
    {/* Tunnel walls */}
    <View style={{ position: 'absolute', left: 0, top: 0, right: 0, height: 35, backgroundColor: '#1a1a1a' }} />
    <View style={{ position: 'absolute', left: 0, bottom: 0, right: 0, height: 35, backgroundColor: '#1a1a1a' }} />
    {Array.from({ length: 12 }).map((_, i) => <TunnelLight key={i} index={i} />)}
  </View>
);

// ─── 44. BIKE RIDE POV ────────────────────────────────────────────────────────
const RoadLine = ({ index }: any) => {
  const scale = useRef(new Animated.Value(0)).current;
  const op = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const run = () => {
      scale.setValue(0); op.setValue(1);
      Animated.parallel([
        Animated.timing(scale, { toValue: 12, duration: 1200, useNativeDriver: true }),
        Animated.sequence([Animated.delay(900), Animated.timing(op, { toValue: 0, duration: 300, useNativeDriver: true })]),
      ]).start(run);
    };
    setTimeout(run, index * 220);
  }, []);
  return (
    <Animated.View style={{
      position: 'absolute', left: width / 2 - 2, top: height / 2,
      width: 4, height: 60, backgroundColor: '#fff', opacity: op,
      transform: [{ scale }],
    }} />
  );
};

export const BikeRidePOVRenderer = () => (
  <View style={StyleSheet.absoluteFill}>
    <LinearGradient colors={['#0f172a', '#1e293b', '#334155']} style={StyleSheet.absoluteFillObject} />
    <LinearGradient colors={['transparent', '#475569']} start={{ x: 0, y: 0.4 }} end={{ x: 0, y: 1 }} style={StyleSheet.absoluteFillObject} />
    {/* Horizon line converging to center */}
    <Svg width={width} height={height} style={StyleSheet.absoluteFillObject}>
      <Path d={`M0 ${height*0.5} L${width/2} ${height*0.4} L${width} ${height*0.5}`} stroke="#fff" strokeWidth="1" opacity="0.2" />
      <Line x1={width/2} y1={height*0.4} x2={width/2} y2={height} stroke="#fff" strokeWidth="1" opacity="0.15" />
    </Svg>
    {Array.from({ length: 6 }).map((_, i) => <RoadLine key={i} index={i} />)}
  </View>
);

// ─── 45. HIGHWAY SUNSET ───────────────────────────────────────────────────────
export const HighwaySunsetRenderer = () => {
  const flash = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.loop(Animated.sequence([
      Animated.timing(flash, { toValue: 0.6, duration: 300, useNativeDriver: true }),
      Animated.timing(flash, { toValue: 1, duration: 300, useNativeDriver: true }),
    ])).start();
  }, []);
  return (
    <View style={StyleSheet.absoluteFill}>
      <LinearGradient colors={['#1e1b4b', '#9a3412', '#ea580c', '#fbbf24']} style={StyleSheet.absoluteFillObject} />
      <Svg width={width} height={height} style={StyleSheet.absoluteFillObject}>
        {/* Road perspective */}
        <Path d={`M${width*0.3} ${height} L${width*0.45} ${height*0.5} L${width*0.55} ${height*0.5} L${width*0.7} ${height}`} fill="#111827" opacity="0.8" />
        {/* Road markings */}
        {[0.6, 0.7, 0.8, 0.9].map((y, i) => (
          <Rect key={i} x={width*0.47} y={height*y} width={12} height={30} fill="#fbbf24" opacity="0.7" />
        ))}
        {/* Sun */}
        <Circle cx={width/2} cy={height*0.5} r={50} fill="#fbbf24" opacity="0.9" />
        <Circle cx={width/2} cy={height*0.5} r={70} fill="#f97316" opacity="0.3" />
      </Svg>
    </View>
  );
};

// ─── 48. NEON TAXI ────────────────────────────────────────────────────────────
export const NeonTaxiRenderer = () => (
  <View style={StyleSheet.absoluteFill}>
    <LinearGradient colors={['#020617', '#0f172a', '#1e1b4b']} style={StyleSheet.absoluteFillObject} />
    <BokehLights colors={['#ef4444', '#f97316', '#06b6d4', '#a855f7', '#22c55e']} />
    <GlassRain color="#38bdf8" />
    {/* Neon sign glow overlays */}
    {['#ef4444', '#06b6d4', '#a855f7'].map((c, i) => (
      <View key={i} style={{ position: 'absolute', left: Math.random() * width * 0.7, top: height * 0.2 + i * 80, width: 80, height: 18, backgroundColor: c, opacity: 0.25, borderRadius: 4 }} />
    ))}
  </View>
);

// ─── 51. BEACH BONFIRE ────────────────────────────────────────────────────────
const FireParticle = ({ delay }: { delay: number }) => {
  const ty = useRef(new Animated.Value(0)).current;
  const tx = useRef(new Animated.Value(0)).current;
  const op = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;
  const colors = ['#dc2626', '#ea580c', '#f97316', '#fbbf24', '#fff'];

  useEffect(() => {
    const run = () => {
      ty.setValue(0); tx.setValue(0); op.setValue(1); scale.setValue(1);
      Animated.parallel([
        Animated.timing(ty, { toValue: -(Math.random() * 120 + 60), duration: 1200, useNativeDriver: true }),
        Animated.timing(tx, { toValue: (Math.random() - 0.5) * 60, duration: 1200, useNativeDriver: true }),
        Animated.timing(op, { toValue: 0, duration: 1200, useNativeDriver: true }),
        Animated.timing(scale, { toValue: 0.2, duration: 1200, useNativeDriver: true }),
      ]).start(run);
    };
    setTimeout(run, delay);
  }, []);

  const color = colors[Math.floor(Math.random() * 4)];
  return (
    <Animated.View style={{
      position: 'absolute', left: width / 2 + (Math.random() - 0.5) * 40, bottom: height * 0.13,
      width: 8, height: 8, borderRadius: 4, backgroundColor: color,
      opacity: op, transform: [{ translateY: ty }, { translateX: tx }, { scale }],
    }} />
  );
};

export const BeachBonfireRenderer = () => (
  <View style={StyleSheet.absoluteFill}>
    <LinearGradient colors={['#0c0a09', '#1c1917', '#1a0a04']} style={StyleSheet.absoluteFillObject} />
    {/* Ocean */}
    <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: height * 0.12, backgroundColor: '#0c4a6e', opacity: 0.7 }} />
    {/* Sand */}
    <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: height * 0.18, backgroundColor: '#a16207', opacity: 0.8 }} />
    {/* Logs */}
    <View style={{ position: 'absolute', left: width / 2 - 40, bottom: height * 0.12, width: 80, height: 14, backgroundColor: '#78350f', borderRadius: 7 }} />
    {Array.from({ length: 25 }).map((_, i) => <FireParticle key={i} delay={i * 50} />)}
    {/* Warm glow */}
    <View style={{ position: 'absolute', left: width / 2 - 80, bottom: height * 0.05, width: 160, height: 160, borderRadius: 80, backgroundColor: '#f97316', opacity: 0.12 }} />
  </View>
);

// ─── 55. SUNSET SILHOUETTE ────────────────────────────────────────────────────
export const SunsetSilhouetteRenderer = () => {
  const sunY = useRef(new Animated.Value(height * 0.45)).current;
  useEffect(() => {
    Animated.loop(Animated.sequence([
      Animated.timing(sunY, { toValue: height * 0.4, duration: 8000, useNativeDriver: true }),
      Animated.timing(sunY, { toValue: height * 0.45, duration: 8000, useNativeDriver: true }),
    ])).start();
  }, []);
  return (
    <View style={StyleSheet.absoluteFill}>
      <LinearGradient colors={['#1e1b4b', '#7c3aed', '#dc2626', '#f97316', '#fbbf24']} style={StyleSheet.absoluteFillObject} />
      {/* Sun */}
      <Animated.View style={{ position: 'absolute', left: width / 2 - 55, transform: [{ translateY: sunY }], alignItems: 'center' }}>
        <Svg width={110} height={110}><Circle cx="55" cy="55" r="50" fill="#fbbf24" opacity="0.9" /></Svg>
      </Animated.View>
      {/* Ground / field */}
      <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: height * 0.28, backgroundColor: '#1c1917' }} />
      {/* Tree silhouette */}
      <View style={{ position: 'absolute', left: width / 2 - 8, bottom: height * 0.28, width: 16, height: 110, backgroundColor: '#000' }} />
      <View style={{ position: 'absolute', left: width / 2 - 45, bottom: height * 0.28 + 65, width: 90, height: 95, borderRadius: 45, backgroundColor: '#000' }} />
      {/* Two person silhouettes */}
      <View style={{ position: 'absolute', left: width * 0.42, bottom: height * 0.28, width: 18, height: 70, backgroundColor: '#000', borderRadius: 4 }} />
      <View style={{ position: 'absolute', left: width * 0.55, bottom: height * 0.28, width: 18, height: 65, backgroundColor: '#000', borderRadius: 4 }} />
    </View>
  );
};

// ─── 58. CITY TIMELAPSE ───────────────────────────────────────────────────────
const CarTrail = ({ y, color, speed }: any) => {
  const tx = useRef(new Animated.Value(-80)).current;
  useEffect(() => {
    const run = () => { tx.setValue(-80); Animated.timing(tx, { toValue: width + 80, duration: speed, useNativeDriver: true }).start(run); };
    run();
  }, []);
  return (
    <Animated.View style={{ position: 'absolute', left: 0, top: y, width: 60, height: 3, backgroundColor: color, opacity: 0.7, borderRadius: 2, transform: [{ translateX: tx }] }} />
  );
};

export const CityTimelapseRenderer = () => {
  const trails = useMemo(() => Array.from({ length: 20 }).map((_, i) => ({
    y: height * 0.5 + (Math.random() - 0.5) * height * 0.3,
    color: i % 2 === 0 ? '#fbbf24' : '#ef4444',
    speed: Math.random() * 800 + 400,
  })), []);
  return (
    <View style={StyleSheet.absoluteFill}>
      <LinearGradient colors={['#020617', '#0f172a', '#1e293b']} style={StyleSheet.absoluteFillObject} />
      {/* Building skyline silhouette */}
      {[15, 50, 85, 120, 155, 190, 225, 260, 295, 330].map((x, i) => (
        <View key={i} style={{ position: 'absolute', left: x, bottom: 0, width: 30 + i * 2, height: 80 + (i % 4) * 50, backgroundColor: '#111827', borderTopLeftRadius: 4, borderTopRightRadius: 4 }} />
      ))}
      {trails.map((t, i) => <CarTrail key={i} {...t} />)}
    </View>
  );
};

// ─── 61. STREET MUSICIAN ──────────────────────────────────────────────────────
const FloatingNote = ({ startX, startY, delay }: any) => {
  const ty = useRef(new Animated.Value(startY)).current;
  const tx = useRef(new Animated.Value(startX)).current;
  const op = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const run = () => {
      ty.setValue(startY); tx.setValue(startX); op.setValue(1);
      Animated.parallel([
        Animated.timing(ty, { toValue: startY - 120, duration: 3000, useNativeDriver: true }),
        Animated.timing(tx, { toValue: startX + 40, duration: 3000, useNativeDriver: true }),
        Animated.sequence([Animated.delay(2000), Animated.timing(op, { toValue: 0, duration: 1000, useNativeDriver: true })]),
      ]).start(run);
    };
    setTimeout(run, delay);
  }, []);
  return (
    <Animated.View style={{ position: 'absolute', opacity: op, transform: [{ translateX: tx }, { translateY: ty }] }}>
      <Svg width={18} height={18}>
        <Circle cx="7" cy="13" r="5" fill="#f472b6" />
        <Line x1="12" y1="2" x2="12" y2="13" stroke="#f472b6" strokeWidth="1.5" />
        <Line x1="12" y1="2" x2="18" y2="5" stroke="#f472b6" strokeWidth="1.5" />
      </Svg>
    </Animated.View>
  );
};

export const StreetMusicianRenderer = () => {
  const notes = useMemo(() => Array.from({ length: 8 }).map((_, i) => ({
    startX: width * 0.45 + (Math.random() - 0.5) * 60,
    startY: height * 0.45, delay: i * 600,
  })), []);
  return (
    <View style={StyleSheet.absoluteFill}>
      <LinearGradient colors={['#0d020d', '#1a041a', '#0d0d0d']} style={StyleSheet.absoluteFillObject} />
      {/* Street lamp glow */}
      <View style={{ position: 'absolute', left: width * 0.6, top: 0, width: 8, height: height * 0.4, backgroundColor: '#fde68a', opacity: 0.3 }} />
      <View style={{ position: 'absolute', left: width * 0.6 - 50, top: height * 0.38, width: 110, height: 110, borderRadius: 55, backgroundColor: '#fde68a', opacity: 0.08 }} />
      {notes.map((n, i) => <FloatingNote key={i} {...n} />)}
    </View>
  );
};

// ─── 62. EMPTY NIGHT ROAD ─────────────────────────────────────────────────────
const FogLayer = ({ y, speed, delay }: any) => {
  const tx = useRef(new Animated.Value(-width)).current;
  useEffect(() => {
    setTimeout(() => {
      Animated.loop(Animated.timing(tx, { toValue: width, duration: speed, useNativeDriver: true })).start();
    }, delay);
  }, []);
  return (
    <Animated.View style={{
      position: 'absolute', top: y, left: 0, width: width * 2, height: 60,
      backgroundColor: '#94a3b8', opacity: 0.07, borderRadius: 30,
      transform: [{ translateX: tx }],
    }} />
  );
};

export const EmptyNightRoadRenderer = () => (
  <View style={StyleSheet.absoluteFill}>
    <LinearGradient colors={['#020617', '#0f172a', '#1e293b']} style={StyleSheet.absoluteFillObject} />
    {/* Road */}
    <Svg width={width} height={height} style={StyleSheet.absoluteFillObject}>
      <Path d={`M${width*0.3} ${height} L${width*0.45} ${height*0.4} L${width*0.55} ${height*0.4} L${width*0.7} ${height}`} fill="#111827" />
      {/* Dashes */}
      {[0.55, 0.65, 0.75, 0.85, 0.95].map((y, i) => (
        <Rect key={i} x={width*0.485} y={height*y} width={10} height={18} fill="#fbbf24" opacity="0.4" />
      ))}
    </Svg>
    {/* Lamp post */}
    <View style={{ position: 'absolute', left: width * 0.22, top: height * 0.15, width: 6, height: height * 0.4, backgroundColor: '#374151' }} />
    <View style={{ position: 'absolute', left: width * 0.22, top: height * 0.15 - 2, width: 50, height: 6, backgroundColor: '#374151' }} />
    <View style={{ position: 'absolute', left: width * 0.22 + 40, top: height * 0.13, width: 15, height: 15, borderRadius: 7.5, backgroundColor: '#fbbf24', opacity: 0.9 }} />
    {[0.3, 0.45, 0.6].map((y, i) => <FogLayer key={i} y={height * y} speed={20000 + i * 5000} delay={i * 2000} />)}
  </View>
);

// ─── 74. BOAT RIDE ────────────────────────────────────────────────────────────
const WakeRipple = ({ y }: any) => {
  const scale = useRef(new Animated.Value(0.5)).current;
  const op = useRef(new Animated.Value(0.6)).current;
  useEffect(() => {
    Animated.loop(Animated.parallel([
      Animated.timing(scale, { toValue: 2, duration: 2000, useNativeDriver: true }),
      Animated.timing(op, { toValue: 0, duration: 2000, useNativeDriver: true }),
    ])).start();
  }, []);
  return (
    <Animated.View style={{
      position: 'absolute', left: width / 2 - 20, top: y,
      width: 40, height: 15, borderRadius: 10,
      borderWidth: 1, borderColor: '#38bdf8', opacity: op, transform: [{ scaleX: scale }],
    }} />
  );
};

export const BoatRideRenderer = () => {
  const bob = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(Animated.sequence([
      Animated.timing(bob, { toValue: -10, duration: 2000, useNativeDriver: true }),
      Animated.timing(bob, { toValue: 6, duration: 2000, useNativeDriver: true }),
    ])).start();
  }, []);
  return (
    <View style={StyleSheet.absoluteFill}>
      <LinearGradient colors={['#0ea5e9', '#0284c7', '#075985']} style={StyleSheet.absoluteFillObject} />
      <LinearGradient colors={['transparent', '#0c4a6e']} start={{ x: 0, y: 0.4 }} end={{ x: 0, y: 1 }} style={StyleSheet.absoluteFillObject} />
      {/* Water sparkle */}
      {Array.from({ length: 20 }).map((_, i) => (
        <View key={i} style={{ position: 'absolute', left: Math.random() * width, top: height * 0.4 + Math.random() * height * 0.5, width: 4, height: 4, borderRadius: 2, backgroundColor: '#fff', opacity: 0.3 }} />
      ))}
      <View style={styles.center}>
        <Animated.View style={{ transform: [{ translateY: bob }] }}>
          <Svg width={130} height={80} viewBox="0 0 130 80">
            <Line x1="65" y1="8" x2="65" y2="55" stroke="#78350f" strokeWidth="3" />
            <Path d="M67 10 L100 40 L67 54 Z" fill="#f8fafc" opacity="0.9" />
            <Path d="M18 57 Q65 48 112 57 Q104 76 65 79 Q26 76 18 57 Z" fill="#92400e" />
          </Svg>
        </Animated.View>
      </View>
      {[height * 0.58, height * 0.63, height * 0.68].map((y, i) => <WakeRipple key={i} y={y} />)}
    </View>
  );
};

// ─── 75. LO-FI WINDOW ────────────────────────────────────────────────────────
export const LoFiWindowRenderer = () => {
  const steamY = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(Animated.sequence([
      Animated.timing(steamY, { toValue: -30, duration: 3000, useNativeDriver: true }),
      Animated.timing(steamY, { toValue: 0, duration: 3000, useNativeDriver: true }),
    ])).start();
  }, []);
  return (
    <View style={StyleSheet.absoluteFill}>
      <LinearGradient colors={['#1e1b4b', '#312e81', '#0f172a']} style={StyleSheet.absoluteFillObject} />
      <BokehLights colors={['#fbbf24', '#f97316', '#22d3ee', '#a855f7']} />
      <GlassRain color="#a5b4fc" />
      {/* Windowsill with mug */}
      <View style={{ position: 'absolute', bottom: height * 0.12, left: 0, right: 0, height: 14, backgroundColor: '#292524' }} />
      <View style={{ position: 'absolute', bottom: height * 0.125, right: width * 0.25, width: 36, height: 44, backgroundColor: '#78350f', borderRadius: 4 }}>
        <Animated.View style={{ position: 'absolute', left: 8, top: -18, width: 4, height: 20, backgroundColor: '#f8fafc', opacity: 0.4, borderRadius: 2, transform: [{ translateY: steamY }] }} />
      </View>
      <View style={{ position: 'absolute', left: 0, top: 0, right: 0, bottom: 0, borderWidth: 22, borderColor: '#1c1917' }} />
    </View>
  );
};

// ─── 79. FERRIS WHEEL ─────────────────────────────────────────────────────────
export const FerrisWheelRenderer = () => {
  const rotation = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(Animated.timing(rotation, { toValue: 1, duration: 8000, useNativeDriver: true })).start();
  }, []);
  const rotate = rotation.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  const R = Math.min(width, height) * 0.3;
  const cabinColors = ['#ef4444', '#3b82f6', '#22c55e', '#fbbf24', '#a855f7', '#f97316', '#06b6d4', '#f43f5e'];

  return (
    <View style={StyleSheet.absoluteFill}>
      <LinearGradient colors={['#0f172a', '#1e1b4b', '#020617']} style={StyleSheet.absoluteFillObject} />
      {/* Stars */}
      {Array.from({ length: 40 }).map((_, i) => (
        <View key={i} style={{ position: 'absolute', left: Math.random() * width, top: Math.random() * height * 0.6, width: 2, height: 2, borderRadius: 1, backgroundColor: '#fff', opacity: Math.random() * 0.7 + 0.2 }} />
      ))}
      <View style={[styles.center, { marginTop: -40 }]}>
        <Animated.View style={{ transform: [{ rotate }] }}>
          <Svg width={R * 2 + 40} height={R * 2 + 40}>
            {/* Spokes */}
            {Array.from({ length: 8 }).map((_, i) => (
              <Line key={i}
                x1={R + 20} y1={R + 20}
                x2={R + 20 + Math.cos(i * Math.PI / 4) * R}
                y2={R + 20 + Math.sin(i * Math.PI / 4) * R}
                stroke="#94a3b8" strokeWidth="2" />
            ))}
            <Circle cx={R + 20} cy={R + 20} r={R} fill="none" stroke="#475569" strokeWidth="3" />
            {/* Cabins */}
            {Array.from({ length: 8 }).map((_, i) => {
              const angle = i * Math.PI / 4;
              const cx2 = R + 20 + Math.cos(angle) * R;
              const cy2 = R + 20 + Math.sin(angle) * R;
              return <Rect key={i} x={cx2 - 9} y={cy2 - 8} width={18} height={16} rx="3" fill={cabinColors[i]} opacity="0.9" />;
            })}
            <Circle cx={R + 20} cy={R + 20} r={12} fill="#374151" />
          </Svg>
        </Animated.View>
      </View>
      {/* Support pole */}
      <View style={{ position: 'absolute', left: width / 2 - 6, bottom: 0, width: 12, height: height * 0.35, backgroundColor: '#374151' }} />
    </View>
  );
};

// ─── 67. LONELY WALK ──────────────────────────────────────────────────────────
const FigureWalk = () => {
  const tx = useRef(new Animated.Value(width / 2)).current;
  useEffect(() => {
    Animated.loop(Animated.sequence([
      Animated.timing(tx, { toValue: width * 0.8, duration: 8000, useNativeDriver: true }),
      Animated.timing(tx, { toValue: width / 2, duration: 0, useNativeDriver: true }),
    ])).start();
  }, []);
  return (
    <Animated.View style={{ position: 'absolute', bottom: height * 0.15, transform: [{ translateX: tx }] }}>
      <Svg width={24} height={60}>
        <Circle cx="12" cy="10" r="8" fill="#1e293b" />
        <Rect x="7" y="18" width="10" height="28" rx="4" fill="#1e293b" />
        <Line x1="7" y1="30" x2="0" y2="46" stroke="#1e293b" strokeWidth="4" strokeLinecap="round" />
        <Line x1="17" y1="30" x2="24" y2="46" stroke="#1e293b" strokeWidth="4" strokeLinecap="round" />
        <Line x1="9" y1="46" x2="6" y2="60" stroke="#1e293b" strokeWidth="3" strokeLinecap="round" />
        <Line x1="15" y1="46" x2="18" y2="60" stroke="#1e293b" strokeWidth="3" strokeLinecap="round" />
      </Svg>
    </Animated.View>
  );
};

export const LonelyWalkRenderer = () => (
  <View style={StyleSheet.absoluteFill}>
    <LinearGradient colors={['#000', '#0a0a0a', '#000']} style={StyleSheet.absoluteFillObject} />
    {/* Street lamp pools */}
    {[width * 0.2, width * 0.5, width * 0.8].map((x, i) => (
      <React.Fragment key={i}>
        <View style={{ position: 'absolute', left: x - 4, top: 0, width: 8, height: height * 0.4, backgroundColor: '#374151' }} />
        <View style={{ position: 'absolute', left: x - 50, top: height * 0.38, width: 100, height: 100, borderRadius: 50, backgroundColor: '#fbbf24', opacity: 0.06 }} />
        <View style={{ position: 'absolute', left: x - 5, top: height * 0.38, width: 10, height: 10, borderRadius: 5, backgroundColor: '#fde68a' }} />
      </React.Fragment>
    ))}
    {/* Wet road reflection */}
    <LinearGradient colors={['transparent', '#0ea5e9']} start={{ x: 0.5, y: 0.6 }} end={{ x: 0.5, y: 0.8 }} style={StyleSheet.absoluteFillObject} />
    <GlassRain color="#94a3b8" />
    <FigureWalk />
  </View>
);

// ─── 77. FOG STREET ───────────────────────────────────────────────────────────
export const FogStreetRenderer = () => {
  const fogAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(Animated.sequence([
      Animated.timing(fogAnim, { toValue: 1, duration: 12000, useNativeDriver: true }),
      Animated.timing(fogAnim, { toValue: 0, duration: 12000, useNativeDriver: true }),
    ])).start();
  }, []);
  const fogTx = fogAnim.interpolate({ inputRange: [0, 1], outputRange: [-100, 100] });
  return (
    <View style={StyleSheet.absoluteFill}>
      <LinearGradient colors={['#1e293b', '#334155', '#475569']} style={StyleSheet.absoluteFillObject} />
      {/* Lamp posts */}
      {[width * 0.25, width * 0.75].map((x, i) => (
        <React.Fragment key={i}>
          <View style={{ position: 'absolute', left: x, top: height * 0.1, width: 6, height: height * 0.45, backgroundColor: '#64748b' }} />
          <View style={{ position: 'absolute', left: x - 30, top: height * 0.08, width: 36 + 6, height: 6, backgroundColor: '#64748b' }} />
          <View style={{ position: 'absolute', left: x + 6, top: height * 0.055, width: 18, height: 18, borderRadius: 9, backgroundColor: '#fde68a', opacity: 0.95, shadowColor: '#fde68a', shadowOpacity: 0.9, shadowRadius: 20 }} />
          <View style={{ position: 'absolute', left: x - 30, top: height * 0.04, width: 100, height: 100, borderRadius: 50, backgroundColor: '#fde68a', opacity: 0.06 }} />
        </React.Fragment>
      ))}
      {/* Fog layers */}
      {[0.3, 0.5, 0.65].map((y, i) => (
        <Animated.View key={i} style={{
          position: 'absolute', top: height * y, left: -100, right: -100, height: 80,
          backgroundColor: '#94a3b8', opacity: 0.12, borderRadius: 40,
          transform: [{ translateX: fogTx }],
        }} />
      ))}
    </View>
  );
};

// ─── 78. FESTIVAL LIGHTS ──────────────────────────────────────────────────────
export const FestivalLightsRenderer = () => {
  const bulbs = useMemo(() => Array.from({ length: 50 }).map((_, i) => ({
    x: Math.random() * width, y: Math.random() * height * 0.7,
    size: Math.random() * 12 + 8, color: ['#fbbf24', '#ef4444', '#3b82f6', '#22c55e', '#a855f7'][i % 5],
    op: new Animated.Value(Math.random()),
  })), []);
  useEffect(() => {
    bulbs.forEach(b => {
      Animated.loop(Animated.sequence([
        Animated.timing(b.op, { toValue: 1, duration: Math.random() * 1500 + 500, useNativeDriver: true }),
        Animated.timing(b.op, { toValue: 0.3, duration: Math.random() * 1500 + 500, useNativeDriver: true }),
      ])).start();
    });
  }, []);
  return (
    <View style={StyleSheet.absoluteFill}>
      <LinearGradient colors={['#450a0a', '#78350f', '#1a0a00']} style={StyleSheet.absoluteFillObject} />
      {/* String lines */}
      <Svg width={width} height={height} style={StyleSheet.absoluteFillObject}>
        {[0.15, 0.35, 0.55].map((y, i) => (
          <Path key={i} d={`M0 ${height*y} Q${width*0.5} ${height*y+30} ${width} ${height*y}`} fill="none" stroke="#292524" strokeWidth="1" />
        ))}
      </Svg>
      {bulbs.map((b, i) => (
        <Animated.View key={i} style={{
          position: 'absolute', left: b.x, top: b.y, width: b.size, height: b.size,
          borderRadius: b.size / 2, backgroundColor: b.color, opacity: b.op,
          shadowColor: b.color, shadowOpacity: 0.8, shadowRadius: b.size,
        }} />
      ))}
    </View>
  );
};

// ─── 80. SLOW TRAFFIC ─────────────────────────────────────────────────────────
const TrafficCar = ({ laneY, delay }: any) => {
  const tx = useRef(new Animated.Value(-50)).current;
  useEffect(() => {
    const run = () => {
      tx.setValue(-50);
      Animated.sequence([
        Animated.delay(delay + Math.random() * 800),
        Animated.timing(tx, { toValue: width + 50, duration: 8000 + Math.random() * 4000, useNativeDriver: true }),
      ]).start(run);
    };
    run();
  }, []);
  return (
    <Animated.View style={{ position: 'absolute', top: laneY - 10, transform: [{ translateX: tx }] }}>
      <Svg width={50} height={22}>
        <Rect x="4" y="6" width="42" height="13" rx="4" fill="#374151" />
        <Rect x="0" y="10" width="8" height="6" rx="2" fill="#ef4444" opacity="0.9" />
        <Rect x="42" y="10" width="8" height="6" rx="2" fill="#fff" opacity="0.7" />
      </Svg>
    </Animated.View>
  );
};

export const SlowTrafficRenderer = () => {
  const lanes = useMemo(() => Array.from({ length: 3 }).map((_, li) =>
    Array.from({ length: 4 }).map((_, ci) => ({ laneY: height * (0.45 + li * 0.1), delay: ci * 2200 }))
  ).flat(), []);

  return (
    <View style={StyleSheet.absoluteFill}>
      <LinearGradient colors={['#1c1917', '#292524', '#0c0a09']} style={StyleSheet.absoluteFillObject} />
      {/* Road lanes */}
      {[0.43, 0.53, 0.63].map((y, i) => (
        <View key={i} style={{ position: 'absolute', top: height * y, left: 0, right: 0, height: height * 0.09, backgroundColor: '#111827', opacity: 0.8 }} />
      ))}
      {/* Lane dashes */}
      {Array.from({ length: 10 }).map((_, i) => (
        <View key={i} style={{ position: 'absolute', top: height * 0.53 - 2, left: i * width / 10, width: 28, height: 3, backgroundColor: '#fbbf24', opacity: 0.4, borderRadius: 2 }} />
      ))}
      {lanes.map((l, i) => <TrafficCar key={i} {...l} />)}
      {/* Sunset */}
      <LinearGradient colors={['#b45309', '#dc2626', 'transparent']} start={{ x: 0, y: 0 }} end={{ x: 0, y: 0.4 }} style={StyleSheet.absoluteFillObject} />
    </View>
  );
};

// ─── Export remaining stub themes (use BokehLights/GlassRain combos) ─────────
export { GlassRain, BokehLights };
