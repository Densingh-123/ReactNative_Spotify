/**
 * Extra Tech Renderers — added to supplement TechThemes.tsx
 * Themes: Glass Orbs, 3D Cubes, Neural Network, Circuit Glow, Data Streams, Paper Planes (improved)
 */
import React, { useMemo, useRef, useEffect } from 'react';
import { View, StyleSheet, Animated, Dimensions, Text } from 'react-native';
import Svg, { Circle, Line, Rect, Path, G, Defs, RadialGradient, Stop, Ellipse } from 'react-native-svg';
import LinearGradient from 'react-native-linear-gradient';

const { width, height } = Dimensions.get('window');
const styles = StyleSheet.create({ center: { flex: 1, justifyContent: 'center', alignItems: 'center' } });

// ─── GLASS ORBS ──────────────────────────────────────────────────────────────
const GlassOrb = ({ cx, cy, r, color, delay }: any) => {
  const floatY = useRef(new Animated.Value(0)).current;
  const floatX = useRef(new Animated.Value(0)).current;
  const scale  = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    setTimeout(() => {
      Animated.loop(Animated.sequence([
        Animated.timing(floatY, { toValue: -28, duration: 3500, useNativeDriver: true }),
        Animated.timing(floatY, { toValue: 12,  duration: 3500, useNativeDriver: true }),
      ])).start();
      Animated.loop(Animated.sequence([
        Animated.timing(floatX, { toValue: 14,  duration: 4000, useNativeDriver: true }),
        Animated.timing(floatX, { toValue: -14, duration: 4000, useNativeDriver: true }),
      ])).start();
      Animated.loop(Animated.sequence([
        Animated.timing(scale,  { toValue: 1.06, duration: 2500, useNativeDriver: true }),
        Animated.timing(scale,  { toValue: 0.94, duration: 2500, useNativeDriver: true }),
      ])).start();
    }, delay);
  }, []);

  return (
    <Animated.View style={{
      position: 'absolute', left: cx - r, top: cy - r, width: r*2, height: r*2,
      borderRadius: r, transform: [{ translateY: floatY }, { translateX: floatX }, { scale }],
      overflow: 'hidden',
    }}>
      {/* Glass orb body */}
      <View style={{ flex:1, borderRadius:r, backgroundColor: color, opacity: 0.18 }} />
      {/* Specular highlight */}
      <View style={{
        position: 'absolute', left: r*0.2, top: r*0.12, width: r*0.45, height: r*0.28,
        borderRadius: r*0.2, backgroundColor: '#fff', opacity: 0.55,
        transform: [{ rotate: '-25deg' }],
      }} />
      {/* Rim highlight */}
      <View style={{
        position: 'absolute', left: 0, top: 0, right: 0, bottom: 0,
        borderRadius: r, borderWidth: 1.5,
        borderColor: `${color}99`,
      }} />
      {/* Bottom reflection */}
      <View style={{
        position: 'absolute', bottom: r*0.15, left: r*0.25, right: r*0.25, height: r*0.12,
        borderRadius: r*0.08, backgroundColor: '#fff', opacity: 0.18,
      }} />
    </Animated.View>
  );
};

export const GlassOrbsRenderer = () => {
  const orbs = useMemo(() => [
    { cx: width*0.15, cy: height*0.22, r: 70,  color: '#8b5cf6', delay: 0    },
    { cx: width*0.75, cy: height*0.18, r: 90,  color: '#06b6d4', delay: 600  },
    { cx: width*0.5,  cy: height*0.45, r: 115, color: '#ec4899', delay: 1200 },
    { cx: width*0.1,  cy: height*0.62, r: 65,  color: '#3b82f6', delay: 1800 },
    { cx: width*0.88, cy: height*0.55, r: 80,  color: '#a855f7', delay: 400  },
    { cx: width*0.35, cy: height*0.75, r: 75,  color: '#10b981', delay: 900  },
    { cx: width*0.68, cy: height*0.78, r: 55,  color: '#f472b6', delay: 2200 },
  ], []);

  return (
    <View style={StyleSheet.absoluteFill}>
      <LinearGradient colors={['#0a0020', '#05102a', '#000']} style={StyleSheet.absoluteFillObject} />
      {/* Background shimmer grid */}
      {Array.from({ length: 50 }).map((_, i) => (
        <View key={i} style={{
          position: 'absolute', left: Math.random()*width, top: Math.random()*height,
          width: 2, height: 2, borderRadius: 1, backgroundColor: '#fff', opacity: 0.15,
        }} />
      ))}
      {orbs.map((o, i) => <GlassOrb key={i} {...o} />)}
      {/* Ambient glow overlay */}
      <LinearGradient colors={['transparent', '#8b5cf611', '#06b6d411', 'transparent']} style={StyleSheet.absoluteFillObject} />
    </View>
  );
};

// ─── 3D CUBES ─────────────────────────────────────────────────────────────────
const Cube3D = ({ x, y, size, delay, color }: any) => {
  const rot = useRef(new Animated.Value(0)).current;
  const float = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    setTimeout(() => {
      Animated.loop(Animated.timing(rot, { toValue: 1, duration: 4000 + delay*300, useNativeDriver: true })).start();
      Animated.loop(Animated.sequence([
        Animated.timing(float, { toValue: -18, duration: 2200, useNativeDriver: true }),
        Animated.timing(float, { toValue: 8,   duration: 2200, useNativeDriver: true }),
      ])).start();
    }, delay * 200);
  }, []);

  const rotDeg = rot.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  const s = size;
  // Isometric cube faces
  const top   = `M${s} 0 L${s*2} ${s*0.5} L${s} ${s} L0 ${s*0.5} Z`;
  const left  = `M0 ${s*0.5} L${s} ${s} L${s} ${s*2} L0 ${s*1.5} Z`;
  const right = `M${s} ${s} L${s*2} ${s*0.5} L${s*2} ${s*1.5} L${s} ${s*2} Z`;

  return (
    <Animated.View style={{
      position: 'absolute', left: x, top: y,
      transform: [{ rotate: rotDeg }, { translateY: float }],
    }}>
      <Svg width={s*2} height={s*2}>
        <Path d={top}   fill={color}     opacity={0.9} />
        <Path d={left}  fill={color}     opacity={0.55} />
        <Path d={right} fill={color}     opacity={0.35} />
        {/* Edges */}
        <Path d={top}   fill="none" stroke={'#fff'} strokeWidth={0.8} opacity={0.4} />
        <Path d={left}  fill="none" stroke={'#fff'} strokeWidth={0.8} opacity={0.4} />
        <Path d={right} fill="none" stroke={'#fff'} strokeWidth={0.8} opacity={0.4} />
      </Svg>
    </Animated.View>
  );
};

export const ThreeDCubesRenderer = () => {
  const cubes = useMemo(() => {
    const colors = ['#6366f1','#8b5cf6','#06b6d4','#3b82f6','#a855f7','#0ea5e9','#7c3aed','#2563eb','#9333ea','#0891b2'];
    return Array.from({ length: 10 }).map((_, i) => ({
      x: (i%5)*(width/5) + Math.random()*30 - 15,
      y: i < 5 ? Math.random()*height*0.35+20 : Math.random()*height*0.35+height*0.5,
      size: Math.random()*20+22, delay: i, color: colors[i],
    }));
  }, []);

  return (
    <View style={StyleSheet.absoluteFill}>
      <LinearGradient colors={['#000', '#0a0a18', '#000']} style={StyleSheet.absoluteFillObject} />
      {cubes.map((c, i) => <Cube3D key={i} {...c} />)}
    </View>
  );
};

// ─── NEURAL NETWORK ───────────────────────────────────────────────────────────
const LAYERS = [
  [{ x: 0.08, y: 0.2 }, { x: 0.08, y: 0.4 }, { x: 0.08, y: 0.6 }, { x: 0.08, y: 0.8 }],
  [{ x: 0.32, y: 0.25 }, { x: 0.32, y: 0.45 }, { x: 0.32, y: 0.65 }, { x: 0.32, y: 0.85 }, { x: 0.32, y: 0.15 }],
  [{ x: 0.56, y: 0.3  }, { x: 0.56, y: 0.5  }, { x: 0.56, y: 0.7  }, { x: 0.56, y: 0.15 }],
  [{ x: 0.80, y: 0.35 }, { x: 0.80, y: 0.55 }, { x: 0.80, y: 0.75 }],
];

const DataPacket = ({ x1, y1, x2, y2, color, delay }: any) => {
  const progress = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    setTimeout(() => {
      Animated.loop(Animated.sequence([
        Animated.timing(progress, { toValue: 1, duration: 1200, useNativeDriver: true }),
        Animated.delay(Math.random()*1500 + 300),
        Animated.timing(progress, { toValue: 0, duration: 0, useNativeDriver: true }),
      ])).start();
    }, delay);
  }, []);
  const tx = progress.interpolate({ inputRange: [0,1], outputRange: [x1*width, x2*width] });
  const ty = progress.interpolate({ inputRange: [0,1], outputRange: [y1*height, y2*height] });
  const op = progress.interpolate({ inputRange: [0, 0.1, 0.9, 1], outputRange: [0, 1, 1, 0] });
  return (
    <Animated.View style={{
      position: 'absolute', width: 6, height: 6, borderRadius: 3,
      backgroundColor: color, opacity: op,
      transform: [{ translateX: tx }, { translateY: ty }],
      shadowColor: color, shadowOpacity: 1, shadowRadius: 6,
    }} />
  );
};

export const NeuralNetworkRenderer = () => {
  const packets = useMemo(() => {
    const ps: any[] = [];
    LAYERS.forEach((layer, li) => {
      if (li < LAYERS.length - 1) {
        layer.forEach((n, ni) => {
          LAYERS[li+1].forEach((n2, ni2) => {
            ps.push({ x1: n.x, y1: n.y, x2: n2.x, y2: n2.y,
              color: li===0?'#06b6d4': li===1?'#8b5cf6':'#10b981',
              delay: (li*500 + ni*120 + ni2*80) });
          });
        });
      }
    });
    return ps;
  }, []);

  const nodeGlow = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(Animated.sequence([
      Animated.timing(nodeGlow, { toValue: 1, duration: 1800, useNativeDriver: true }),
      Animated.timing(nodeGlow, { toValue: 0, duration: 1800, useNativeDriver: true }),
    ])).start();
  }, []);

  return (
    <View style={StyleSheet.absoluteFill}>
      <LinearGradient colors={['#020617', '#050918', '#000']} style={StyleSheet.absoluteFillObject} />
      {/* Edges */}
      <Svg width={width} height={height} style={StyleSheet.absoluteFillObject}>
        {LAYERS.map((layer, li) => li < LAYERS.length - 1 ? layer.map((n, ni) =>
          LAYERS[li+1].map((n2, ni2) => (
            <Line key={`${li}-${ni}-${ni2}`}
              x1={n.x*width}  y1={n.y*height}
              x2={n2.x*width} y2={n2.y*height}
              stroke={li===0?'#06b6d4':li===1?'#8b5cf6':'#10b981'}
              strokeWidth={0.6} opacity={0.25} />
          ))
        ) : null)}
      </Svg>
      {/* Packets */}
      {packets.map((p, i) => <DataPacket key={i} {...p} />)}
      {/* Nodes */}
      {LAYERS.flat().map((n, i) => (
        <Animated.View key={i} style={{
          position: 'absolute',
          left: n.x*width - 9, top: n.y*height - 9,
          width: 18, height: 18, borderRadius: 9,
          backgroundColor: '#0f172a', borderWidth: 2,
          borderColor: i % 3 === 0 ? '#06b6d4' : i % 3 === 1 ? '#8b5cf6' : '#10b981',
          opacity: nodeGlow.interpolate({ inputRange:[0,1], outputRange:[0.6,1] }),
          shadowColor: '#8b5cf6', shadowOpacity: 0.9, shadowRadius: 8,
        }} />
      ))}
      {/* Layer labels */}
      {['Input', 'Hidden 1', 'Hidden 2', 'Output'].map((label, i) => (
        <Text key={i} style={{
          position: 'absolute', left: LAYERS[i][0].x*width - 20, top: height*0.06,
          color: '#64748b', fontSize: 9, fontFamily: 'monospace', width: 60, textAlign: 'center',
        }}>{label}</Text>
      ))}
    </View>
  );
};

// ─── CIRCUIT GLOW ─────────────────────────────────────────────────────────────
const CIRCUIT_PATHS = [
  // Horizontal and vertical traces forming a PCB-like grid
  'M20 80 L180 80 L180 140 L280 140',
  'M280 140 L310 140 L310 60 L380 60',
  'M380 60 L380 200 L280 200',
  'M40 200 L180 200 L180 140',
  'M310 60 L370 60',
  'M20 280 L100 280 L100 140 L180 140',
  'M280 200 L280 280 L380 280',
  'M380 280 L380 350 L200 350 L200 280 L100 280',
  'M20 80 L20 350 L200 350',
  'M100 280 L40 280',
];

const CircuitCurrentDot = ({ pathStr, delay, color }: any) => {
  const progress = useRef(new Animated.Value(0)).current;
  const op = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const run = () => {
      progress.setValue(0); op.setValue(1);
      Animated.parallel([
        Animated.timing(progress, { toValue: 1, duration: 2000, useNativeDriver: false }),
        Animated.sequence([
          Animated.delay(1700),
          Animated.timing(op, { toValue: 0, duration: 300, useNativeDriver: true }),
        ]),
      ]).start(() => setTimeout(run, Math.random()*1500 + delay));
    };
    setTimeout(run, delay);
  }, []);

  // We'll render as a simple overlay dot (path interpolation is complex in RN)
  // Use a wrapper that moves along a pre-calculated set of waypoints
  return null; // handled below
};

const AnimatedDot = ({ waypoints, delay, color }: any) => {
  const progress = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const run = () => {
      progress.setValue(0);
      Animated.sequence([
        Animated.delay(delay + Math.random()*1000),
        Animated.timing(progress, { toValue: waypoints.length - 1, duration: 2200, useNativeDriver: false }),
      ]).start(run);
    };
    run();
  }, []);


  const tx = progress.interpolate({
    inputRange: waypoints.map((_: any, i: number) => i),
    outputRange: waypoints.map((w: any) => w.x),
  });
  const ty = progress.interpolate({
    inputRange: waypoints.map((_: any, i: number) => i),
    outputRange: waypoints.map((w: any) => w.y),
  });

  return (
    <Animated.View style={{
      position: 'absolute', width: 8, height: 8, borderRadius: 4,
      backgroundColor: color, top: 0, left: 0,
      transform: [{ translateX: tx }, { translateY: ty }],
      shadowColor: color, shadowOpacity: 1, shadowRadius: 8,
    }} />
  );
};

export const CircuitGlowRenderer = () => {
  const scale = Math.min(width, height) / 400;
  const dotRoutes = useMemo(() => [
    { waypoints: [{x:20,y:80},{x:180,y:80},{x:180,y:140},{x:280,y:140},{x:310,y:140},{x:310,y:60},{x:380,y:60}].map(p=>({x:p.x*scale,y:p.y*scale})), delay:0,   color:'#22d3ee' },
    { waypoints: [{x:20,y:280},{x:100,y:280},{x:100,y:140},{x:180,y:140},{x:180,y:80},{x:20,y:80}].map(p=>({x:p.x*scale,y:p.y*scale})),                          delay:500,  color:'#a78bfa' },
    { waypoints: [{x:380,y:60},{x:380,y:200},{x:280,y:200},{x:280,y:280},{x:380,y:280},{x:380,y:350},{x:200,y:350}].map(p=>({x:p.x*scale,y:p.y*scale})),         delay:900,  color:'#4ade80' },
    { waypoints: [{x:200,y:350},{x:100,y:280},{x:40,y:280},{x:20,y:280},{x:20,y:80}].map(p=>({x:p.x*scale,y:p.y*scale})),                                        delay:1400, color:'#f472b6' },
  ], []);

  return (
    <View style={StyleSheet.absoluteFill}>
      <LinearGradient colors={['#000d00','#001209','#000']} style={StyleSheet.absoluteFillObject} />
      <Svg width={width} height={height*0.98} style={{ position:'absolute', left:0, top:height*0.01 }}>
        {/* Circuit traces */}
        {[
          'M20 80 L180 80 L180 140 L280 140', 'M280 140 L310 140 L310 60 L380 60',
          'M380 60 L380 200 L280 200', 'M40 200 L180 200 L180 140',
          'M20 280 L100 280 L100 140 L180 140', 'M280 200 L280 280 L380 280',
          'M380 280 L380 350 L200 350 L200 280 L100 280', 'M20 80 L20 350 L200 350',
        ].map((d, i) => (
          <Path key={i} d={d.replace(/(\d+)/g, (m) => String(parseInt(m)*scale))}
            stroke="#22d3ee" strokeWidth={1.5} fill="none" opacity={0.3} />
        ))}
        {/* Component pads */}
        {[{x:180,y:80},{x:310,y:60},{x:380,y:200},{x:100,y:280},{x:280,y:200}].map((p,i) => (
          <Circle key={i} cx={p.x*scale} cy={p.y*scale} r={6*scale} fill="#001a00" stroke="#4ade80" strokeWidth={1.5} />
        ))}
      </Svg>
      {dotRoutes.map((r, i) => <AnimatedDot key={i} {...r} />)}
    </View>
  );
};

// ─── DATA STREAMS ─────────────────────────────────────────────────────────────
const SearchPacket = ({ startX, startY, endX, endY, delay, color }: any) => {
  const progress = useRef(new Animated.Value(0)).current;
  const op = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const run = () => {
      progress.setValue(0); op.setValue(1);
      Animated.parallel([
        Animated.timing(progress, { toValue: 1, duration: 900, useNativeDriver: true }),
        Animated.sequence([
          Animated.delay(750),
          Animated.timing(op, { toValue: 0, duration: 150, useNativeDriver: true }),
        ]),
      ]).start(() => setTimeout(run, Math.random()*1500 + delay));
    };
    setTimeout(run, delay);
  }, []);
  const tx = progress.interpolate({ inputRange: [0,1], outputRange: [startX, endX] });
  const ty = progress.interpolate({ inputRange: [0,1], outputRange: [startY, endY] });
  return (
    <Animated.View style={{
      position:'absolute', width:10, height:10, borderRadius:5,
      backgroundColor: color, opacity: op,
      transform:[{translateX:tx},{translateY:ty}],
      shadowColor: color, shadowOpacity: 1, shadowRadius: 8,
    }} />
  );
};

export const DataStreamsRenderer = () => {
  const CX = width / 2;
  // Node positions: Search → App Server → DB
  const nodes = { search: {x:CX, y:height*0.12}, api:{x:CX, y:height*0.42}, db:{x:CX,y:height*0.72} };
  const nodeL = { cache:{x:CX-width*0.28, y:height*0.57}, cdn:{x:CX+width*0.28, y:height*0.57} };

  const packets = useMemo(() => [
    // Search → API
    { startX:nodes.search.x, startY:nodes.search.y, endX:nodes.api.x, endY:nodes.api.y, delay:0, color:'#38bdf8' },
    // API → DB
    { startX:nodes.api.x, startY:nodes.api.y, endX:nodes.db.x, endY:nodes.db.y, delay:500, color:'#a78bfa' },
    // DB → API (response)
    { startX:nodes.db.x, startY:nodes.db.y, endX:nodes.api.x, endY:nodes.api.y, delay:1200, color:'#4ade80' },
    // API → Search (response)
    { startX:nodes.api.x, startY:nodes.api.y, endX:nodes.search.x, endY:nodes.search.y, delay:1700, color:'#22d3ee' },
    // API → Cache
    { startX:nodes.api.x, startY:nodes.api.y, endX:nodeL.cache.x, endY:nodeL.cache.y, delay:800, color:'#fb923c' },
    // API → CDN
    { startX:nodes.api.x, startY:nodes.api.y, endX:nodeL.cdn.x, endY:nodeL.cdn.y, delay:1000, color:'#f472b6' },
  ], []);

  const searchBlink = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.loop(Animated.sequence([
      Animated.timing(searchBlink, { toValue: 0.4, duration: 600, useNativeDriver: true }),
      Animated.timing(searchBlink, { toValue: 1, duration: 600, useNativeDriver: true }),
    ])).start();
  }, []);

  return (
    <View style={StyleSheet.absoluteFill}>
      <LinearGradient colors={['#020617','#080d1e','#000']} style={StyleSheet.absoluteFillObject} />
      {/* Lines between nodes */}
      <Svg width={width} height={height} style={StyleSheet.absoluteFillObject}>
        <Line x1={nodes.search.x} y1={nodes.search.y} x2={nodes.api.x}  y2={nodes.api.y}  stroke="#38bdf844" strokeWidth={1.5} strokeDasharray="6 4" />
        <Line x1={nodes.api.x}    y1={nodes.api.y}    x2={nodes.db.x}   y2={nodes.db.y}   stroke="#a78bfa44" strokeWidth={1.5} strokeDasharray="6 4" />
        <Line x1={nodes.api.x}    y1={nodes.api.y}    x2={nodeL.cache.x} y2={nodeL.cache.y} stroke="#fb923c44" strokeWidth={1} strokeDasharray="4 4" />
        <Line x1={nodes.api.x}    y1={nodes.api.y}    x2={nodeL.cdn.x}   y2={nodeL.cdn.y}   stroke="#f472b644" strokeWidth={1} strokeDasharray="4 4" />
      </Svg>

      {/* Packets */}
      {packets.map((p, i) => <SearchPacket key={i} {...p} />)}

      {/* Node: Search Bar */}
      <Animated.View style={{ position:'absolute', left:nodes.search.x-70, top:nodes.search.y-22, width:140, height:44, borderRadius:22, backgroundColor:'#1e293b', borderWidth:1.5, borderColor:'#38bdf8', justifyContent:'center', alignItems:'center', flexDirection:'row', gap:8, opacity:searchBlink }}>
        <Text style={{ color:'#38bdf8', fontSize:20 }}>🔍</Text>
        <Text style={{ color:'#94a3b8', fontSize:13, fontFamily:'monospace' }}>Searching...</Text>
      </Animated.View>

      {/* Node: API Server */}
      <View style={{ position:'absolute', left:nodes.api.x-50, top:nodes.api.y-28, width:100, height:56, borderRadius:12, backgroundColor:'#1e293b', borderWidth:1.5, borderColor:'#a78bfa', justifyContent:'center', alignItems:'center' }}>
        <Text style={{ fontSize:20 }}>⚙️</Text>
        <Text style={{ color:'#a78bfa', fontSize:10, fontFamily:'monospace' }}>API Server</Text>
      </View>

      {/* Node: Database */}
      <View style={{ position:'absolute', left:nodes.db.x-45, top:nodes.db.y-30 }}>
        <Svg width={90} height={60}>
          <Ellipse cx={45} cy={15} rx={40} ry={12} fill="#1e293b" stroke="#4ade80" strokeWidth={1.5} />
          <Rect x={5} y={15} width={80} height={28} fill="#1e293b" />
          <Ellipse cx={45} cy={43} rx={40} ry={12} fill="#1e293b" stroke="#4ade80" strokeWidth={1.5} />
          <Line x1={5} y1={25} x2={5} y2={43}  stroke="#4ade80" strokeWidth={1.5} />
          <Line x1={85} y1={25} x2={85} y2={43} stroke="#4ade80" strokeWidth={1.5} />
        </Svg>
        <Text style={{ position:'absolute', bottom:-16, left:15, color:'#4ade80', fontSize:9, fontFamily:'monospace' }}>Database</Text>
      </View>

      {/* Node: Cache */}
      <View style={{ position:'absolute', left:nodeL.cache.x-35, top:nodeL.cache.y-20, width:70, height:40, borderRadius:8, backgroundColor:'#1e293b', borderWidth:1, borderColor:'#fb923c', justifyContent:'center', alignItems:'center' }}>
        <Text style={{ color:'#fb923c', fontSize:18 }}>💾</Text>
        <Text style={{ color:'#fb923c', fontSize:8, fontFamily:'monospace' }}>Cache</Text>
      </View>

      {/* Node: CDN */}
      <View style={{ position:'absolute', left:nodeL.cdn.x-30, top:nodeL.cdn.y-20, width:60, height:40, borderRadius:8, backgroundColor:'#1e293b', borderWidth:1, borderColor:'#f472b6', justifyContent:'center', alignItems:'center' }}>
        <Text style={{ color:'#f472b6', fontSize:18 }}>🌐</Text>
        <Text style={{ color:'#f472b6', fontSize:8, fontFamily:'monospace' }}>CDN</Text>
      </View>
    </View>
  );
};

// ─── PAPER PLANES (improved — dark background, more planes) ───────────────────
const PaperPlaneV2 = ({ delay, startY, tint }: any) => {
  const tx = useRef(new Animated.Value(-80)).current;
  const ty = useRef(new Animated.Value(0)).current;
  const rot = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const run = () => {
      const baseY = startY ?? Math.random()*height*0.7 + 60;
      tx.setValue(-80); ty.setValue(baseY); rot.setValue(0);
      const speed = Math.random()*3000 + 5000;
      Animated.parallel([
        Animated.timing(tx, { toValue: width + 80, duration: speed, useNativeDriver: true }),
        Animated.sequence([
          Animated.timing(ty, { toValue: baseY - 70, duration: speed*0.25, useNativeDriver: true }),
          Animated.timing(ty, { toValue: baseY + 40, duration: speed*0.35, useNativeDriver: true }),
          Animated.timing(ty, { toValue: baseY - 50, duration: speed*0.25, useNativeDriver: true }),
          Animated.timing(ty, { toValue: baseY,      duration: speed*0.15, useNativeDriver: true }),
        ]),
        Animated.timing(rot, { toValue: 1, duration: speed, useNativeDriver: true }),
      ]).start(() => setTimeout(run, Math.random()*2000));
    };
    setTimeout(run, delay);
  }, []);

  const rotate = rot.interpolate({ inputRange:[0,1], outputRange:['-6deg','6deg'] });

  return (
    <Animated.View style={{ position:'absolute', left:0, top:0, transform:[{translateX:tx},{translateY:ty},{rotate}] }}>
      <Svg width={50} height={34}>
        <Path d="M2 17 L48 3 L36 17 L48 31 Z" fill={tint || '#e0e7ff'} opacity={0.95} />
        <Path d="M2 17 L36 17" stroke={tint||'#c7d2fe'} strokeWidth={0.8} opacity={0.6} />
        <Path d="M36 17 L44 10 L44 24 Z" fill={tint ? tint+'99' : '#a5b4fc88'} />
      </Svg>
    </Animated.View>
  );
};

export const PaperPlanesV2Renderer = () => {
  const planes = useMemo(() => Array.from({length:14}).map((_,i) => ({
    delay: i * 450,
    startY: Math.random()*height*0.75 + 40,
    tint: ['#e0e7ff','#c7d2fe','#a5b4fc','#818cf8','#fce7f3','#fbcfe8'][i % 6],
  })), []);

  return (
    <View style={StyleSheet.absoluteFill}>
      <LinearGradient colors={['#1e1b4b','#312e81','#0f0e2a']} style={StyleSheet.absoluteFillObject} />
      {/* Stars */}
      {Array.from({length:60}).map((_,i) => (
        <View key={i} style={{ position:'absolute', left:Math.random()*width, top:Math.random()*height, width:2, height:2, borderRadius:1, backgroundColor:'#fff', opacity:Math.random()*0.5+0.1 }} />
      ))}
      {/* Clouds (light streaks) */}
      {[0.2, 0.5, 0.75].map((y,i) => (
        <View key={i} style={{ position:'absolute', top:height*y, left:10, right:10, height:40, backgroundColor:'rgba(255,255,255,0.04)', borderRadius:20 }} />
      ))}
      {planes.map((p, i) => <PaperPlaneV2 key={i} {...p} />)}
    </View>
  );
};

// ─── PARTICLE NETWORK (improved) ──────────────────────────────────────────────
const NODE_COUNT = 18;
const ParticleNode = ({ x, y, linked, anim }: any) => {
  const pulse = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(Animated.sequence([
      Animated.timing(pulse, { toValue:1, duration:Math.random()*2000+1000, useNativeDriver:true }),
      Animated.timing(pulse, { toValue:0, duration:Math.random()*2000+1000, useNativeDriver:true }),
    ])).start();
  }, []);
  const scale = pulse.interpolate({ inputRange:[0,1], outputRange:[0.8,1.2] });
  return (
    <Animated.View style={{
      position:'absolute', left:x-5, top:y-5, width:10, height:10, borderRadius:5,
      backgroundColor:'#8b5cf6', transform:[{scale}],
      shadowColor:'#8b5cf6', shadowOpacity:0.9, shadowRadius:6,
    }} />
  );
};

export const ParticleNetworkRenderer = () => {
  const nodes = useMemo(() => Array.from({length:NODE_COUNT}).map(() => ({
    x: Math.random()*width*0.9 + width*0.05,
    y: Math.random()*height*0.85 + height*0.05,
  })), []);

  const lineOps = useMemo(() => nodes.map((n, i) =>
    nodes.slice(i+1).filter(n2 => Math.hypot(n.x-n2.x, n.y-n2.y) < 180).map(n2 => ({
      x1:n.x, y1:n.y, x2:n2.x, y2:n2.y,
      op: new Animated.Value(Math.random()),
    }))
  ).flat(), []);

  useEffect(() => {
    lineOps.forEach(l => {
      Animated.loop(Animated.sequence([
        Animated.timing(l.op, { toValue:Math.random()*0.5+0.1, duration:Math.random()*2000+1000, useNativeDriver:true }),
        Animated.timing(l.op, { toValue:Math.random()*0.2,     duration:Math.random()*2000+1000, useNativeDriver:true }),
      ])).start();
    });
  }, []);

  return (
    <View style={StyleSheet.absoluteFill}>
      <LinearGradient colors={['#0f172a','#1e1b4b','#0a0a18']} style={StyleSheet.absoluteFillObject} />
      <Svg width={width} height={height} style={StyleSheet.absoluteFillObject}>
        {lineOps.map((l, i) => (
          <Line key={i} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2} stroke="#8b5cf6" strokeWidth={0.8} opacity={0.3} />
        ))}
      </Svg>
      {/* Animated line opacities are handled via SVG opacity — approximate */}
      {nodes.map((n, i) => <ParticleNode key={i} {...n} />)}
    </View>
  );
};
