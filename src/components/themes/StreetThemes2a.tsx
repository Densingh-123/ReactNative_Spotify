import React, { useMemo, useRef, useEffect } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import Svg, { Circle, Path, Line, Rect, Ellipse, Defs, RadialGradient, Stop, G } from 'react-native-svg';
import LinearGradient from 'react-native-linear-gradient';

const { width, height } = Dimensions.get('window');
const W = width, H = height;

// ─── BUS WINDOW RAIN (full width) ────────────────────────────────────────────
const RainDrop = ({ x, h, speed, delay }: any) => {
  const ty = useRef(new Animated.Value(-h)).current;
  useEffect(() => {
    const run = () => { ty.setValue(-h); Animated.sequence([Animated.delay(delay), Animated.timing(ty, { toValue: H + h, duration: speed, useNativeDriver: true })]).start(run); };
    run();
  }, []);
  return <Animated.View style={{ position:'absolute', left:x, top:0, width:1.8, height:h, backgroundColor:'rgba(174,214,241,0.55)', borderRadius:1, transform:[{translateY:ty}] }} />;
};
const RainStreakHorizontal = ({ y, speed, delay }: any) => {
  const tx = useRef(new Animated.Value(0)).current;
  const ty2 = useRef(new Animated.Value(y)).current;
  useEffect(() => {
    const run = () => {
      const nx = Math.random()*W*0.6;
      const ny = Math.random()*H*0.5+H*0.1;
      tx.setValue(nx); ty2.setValue(ny);
      Animated.parallel([
        Animated.timing(tx, { toValue: nx + Math.random()*60-30, duration: speed, useNativeDriver: true }),
        Animated.timing(ty2, { toValue: ny + Math.random()*80+40, duration: speed, useNativeDriver: true }),
      ]).start(run);
    };
    setTimeout(run, delay);
  }, []);
  return <Animated.View style={{ position:'absolute', left:0, top:0, width:1.5, height:Math.random()*40+15, backgroundColor:'rgba(174,214,241,0.7)', borderRadius:1, transform:[{translateX:tx},{translateY:ty2}] }} />;
};

export const BusWindowRainV2Renderer = () => {
  const drops = useMemo(() => Array.from({length:80}).map((_,i) => ({
    x: Math.random()*W, h: Math.random()*28+14, speed: Math.random()*1800+1200, delay: i*110,
  })), []);
  const cityLights = useMemo(() => Array.from({length:30}).map(() => ({
    x: Math.random()*W, y: H*0.25+Math.random()*H*0.5,
    size: Math.random()*28+10,
    color: ['#fbbf2488','#ef444488','#38bdf888','#a855f788','#f9731688'][Math.floor(Math.random()*5)],
  })), []);
  return (
    <View style={[StyleSheet.absoluteFill, {width:W, height:H}]}>
      <LinearGradient colors={['#0c1445','#111827','#0a0a0a']} style={StyleSheet.absoluteFillObject} />
      {cityLights.map((l,i) => <View key={i} style={{ position:'absolute', left:l.x, top:l.y, width:l.size, height:l.size, borderRadius:l.size/2, backgroundColor:l.color }} />)}
      {drops.map((d,i) => <RainDrop key={i} {...d} />)}
      {Array.from({length:12}).map((_,i) => <RainStreakHorizontal key={i} y={H*0.2+Math.random()*H*0.5} speed={2200+Math.random()*800} delay={i*300} />)}
      <View style={{position:'absolute',left:0,top:0,right:0,bottom:0,borderWidth:28,borderColor:'#0a0a12',pointerEvents:'none'}} />
      <View style={{position:'absolute',left:W/2-1,top:0,width:2,height:H,backgroundColor:'rgba(255,255,255,0.06)'}} />
    </View>
  );
};

// ─── TRAIN WINDOW (village parallax) ─────────────────────────────────────────
const VillageElement = ({ type, startX, speed }: any) => {
  const tx = useRef(new Animated.Value(startX)).current;
  useEffect(() => {
    const run = () => { tx.setValue(W+100); Animated.timing(tx, { toValue: -300, duration: speed, useNativeDriver: true }).start(run); };
    tx.setValue(startX);
    Animated.timing(tx, { toValue: -300, duration: speed*((W+100-startX)/(W+400)), useNativeDriver: true }).start(run);
  }, []);
  const renderShape = () => {
    if (type === 'tree') return (
      <Svg width={50} height={90}><Rect x={20} y={55} width={10} height={35} fill="#5c4033" /><Path d="M25 5 L5 55 L45 55 Z" fill="#2d6a4f" /><Path d="M25 20 L8 60 L42 60 Z" fill="#40916c" /></Svg>
    );
    if (type === 'house') return (
      <Svg width={70} height={80}><Rect x={5} y={40} width={60} height={40} fill="#fde68a" /><Path d="M0 40 L35 8 L70 40 Z" fill="#dc2626" /><Rect x={24} y={55} width={22} height={25} fill="#92400e" /><Rect x={8} y={45} width={14} height={14} fill="#bfdbfe" /></Svg>
    );
    if (type === 'pond') return (
      <Svg width={100} height={30}><Ellipse cx={50} cy={18} rx={48} ry={14} fill="#164e63" opacity={0.8}/><Ellipse cx={50} cy={12} rx={35} ry={6} fill="#0ea5e9" opacity={0.4}/></Svg>
    );
    return null;
  };
  const baseY = type==='tree' ? H*0.58 : type==='house' ? H*0.56 : H*0.68;
  return <Animated.View style={{ position:'absolute', bottom: H-baseY, transform:[{translateX:tx}] }}>{renderShape()}</Animated.View>;
};

export const TrainWindowV2Renderer = () => {
  const elements = useMemo(() => {
    const els: any[] = [];
    const types = ['tree','tree','house','tree','pond','tree','tree','house','tree'];
    types.forEach((type, i) => { const spd = type==='pond'?5000:type==='house'?4500:3500; els.push({type, startX: i*(W/types.length*0.9), speed: spd}); });
    return els;
  }, []);
  const personBlink = useRef(new Animated.Value(0)).current;
  useEffect(() => { Animated.loop(Animated.sequence([Animated.timing(personBlink,{toValue:1,duration:3000,useNativeDriver:true}),Animated.timing(personBlink,{toValue:0,duration:2500,useNativeDriver:true})])).start(); }, []);
  const personOp = personBlink.interpolate({inputRange:[0,0.3,0.7,1],outputRange:[0.4,1,1,0.4]});
  return (
    <View style={[StyleSheet.absoluteFill,{width:W,height:H}]}>
      <LinearGradient colors={['#bfdbfe','#93c5fd','#dbeafe']} style={StyleSheet.absoluteFillObject} />
      <LinearGradient colors={['transparent','#166534']} start={{x:0,y:0.65}} end={{x:0,y:1}} style={StyleSheet.absoluteFillObject} />
      {elements.map((e,i) => <VillageElement key={i} {...e} />)}
      {/* Window frame */}
      <View style={{position:'absolute',left:0,right:0,top:0,bottom:0,borderWidth:26,borderColor:'#1c1917',pointerEvents:'none'}} />
      <View style={{position:'absolute',left:W/2-1,top:30,width:2,height:H-60,backgroundColor:'#292524'}} />
      {/* Person reflection */}
      <Animated.View style={{position:'absolute',right:W*0.05,bottom:H*0.22,opacity:personOp}}>
        <Svg width={40} height={80}><Circle cx={20} cy={10} r={9} fill="#000" opacity={0.3}/><Rect x={11} y={19} width={18} height={35} rx={6} fill="#000" opacity={0.3}/></Svg>
      </Animated.View>
    </View>
  );
};

// ─── METRO RIDE (elevated city track) ────────────────────────────────────────
const MetroTrain = () => {
  const tx = useRef(new Animated.Value(-280)).current;
  useEffect(() => { Animated.loop(Animated.sequence([Animated.timing(tx,{toValue:W+50,duration:3000,useNativeDriver:true}),Animated.delay(1500),Animated.timing(tx,{toValue:-280,duration:0,useNativeDriver:true})])).start(); }, []);
  return (
    <Animated.View style={{position:'absolute',top:H*0.42,left:0,transform:[{translateX:tx}]}}>
      <Svg width={280} height={60}>
        <Rect x={2} y={2} width={276} height={52} rx={8} fill="#334155"/>
        <Rect x={2} y={2} width={276} height={14} rx={4} fill="#1e40af"/>
        {[22,82,142,202,242].map((x,i)=><Rect key={i} x={x} y={14} width={28} height={22} rx={3} fill="#bfdbfe" opacity={0.85}/>)}
        <Rect x={2} y={54} width={40} height={8} rx={3} fill="#475569"/>
        <Rect x={238} y={54} width={40} height={8} rx={3} fill="#475569"/>
        <Rect x={0} y={56} width={8} height={16} rx={3} fill="#1e3a8a"/>
        <Rect x={270} y={56} width={8} height={16} rx={3} fill="#1e3a8a"/>
      </Svg>
    </Animated.View>
  );
};

export const MetroRideV2Renderer = () => {
  const buildings = useMemo(() => Array.from({length:12}).map((_,i) => ({
    x: i*(W/12), h: Math.random()*H*0.3+H*0.1, w: W/14, lit: Math.random()>0.4,
  })), []);
  return (
    <View style={[StyleSheet.absoluteFill,{width:W,height:H}]}>
      <LinearGradient colors={['#0f172a','#1e293b','#0a1628']} style={StyleSheet.absoluteFillObject} />
      {buildings.map((b,i) => (
        <View key={i} style={{position:'absolute',left:b.x,bottom:H*0.45,width:b.w,height:b.h,backgroundColor:'#1e293b',borderTopLeftRadius:4,borderTopRightRadius:4}}>
          {b.lit && Array.from({length:4}).map((_,j) => <View key={j} style={{position:'absolute',left:j*8+4,top:Math.random()*b.h*0.7,width:6,height:6,backgroundColor:'#fbbf24',opacity:0.7}}/>)}
        </View>
      ))}
      {/* Elevated track */}
      <View style={{position:'absolute',top:H*0.5,left:0,right:0,height:12,backgroundColor:'#475569'}}/>
      <View style={{position:'absolute',top:H*0.44,left:0,right:0,height:4,backgroundColor:'#94a3b8',opacity:0.5}}/>
      {Array.from({length:18}).map((_,i) => <View key={i} style={{position:'absolute',top:H*0.44,left:i*(W/18),width:8,height:H*0.07,backgroundColor:'#374151',borderRadius:3}}/>)}
      <MetroTrain />
      {/* Platform lights */}
      {Array.from({length:8}).map((_,i) => <View key={i} style={{position:'absolute',bottom:H*0.49,left:i*(W/8),width:4,height:30,backgroundColor:'#fbbf24',opacity:0.5,borderRadius:2}}/>)}
    </View>
  );
};

// ─── RAILWAY PLATFORM (old subway rush) ──────────────────────────────────────
const PlatformPerson = ({ startX, speed, delay }: any) => {
  const tx = useRef(new Animated.Value(startX)).current;
  useEffect(() => {
    const run = () => {
      const dest = Math.random()*W;
      Animated.sequence([Animated.delay(delay+Math.random()*1000), Animated.timing(tx,{toValue:dest,duration:speed,useNativeDriver:true})]).start(run);
    };
    run();
  }, []);
  const sz = Math.random()*10+18;
  return (
    <Animated.View style={{position:'absolute',bottom:H*0.14,transform:[{translateX:tx}]}}>
      <Svg width={sz} height={sz*2.2}>
        <Circle cx={sz*0.5} cy={sz*0.35} r={sz*0.28} fill="#475569"/>
        <Rect x={sz*0.2} y={sz*0.6} width={sz*0.6} height={sz*0.9} rx={sz*0.15} fill="#334155"/>
        <Line x1={sz*0.5} y1={sz*1.5} x2={sz*0.2} y2={sz*2.1} stroke="#475569" strokeWidth={sz*0.12} strokeLinecap="round"/>
        <Line x1={sz*0.5} y1={sz*1.5} x2={sz*0.8} y2={sz*2.1} stroke="#475569" strokeWidth={sz*0.12} strokeLinecap="round"/>
      </Svg>
    </Animated.View>
  );
};

const PlatformTrain = () => {
  const tx = useRef(new Animated.Value(-W-50)).current;
  const op = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const run = () => {
      tx.setValue(-W-50); op.setValue(0);
      Animated.sequence([
        Animated.delay(4000),
        Animated.parallel([
          Animated.timing(op,{toValue:1,duration:400,useNativeDriver:true}),
          Animated.timing(tx,{toValue:0,duration:2000,useNativeDriver:true}),
        ]),
        Animated.delay(2000),
        Animated.parallel([
          Animated.timing(tx,{toValue:W+50,duration:2500,useNativeDriver:true}),
          Animated.timing(op,{toValue:0,duration:400,useNativeDriver:true}),
        ]),
      ]).start(run);
    };
    run();
  }, []);
  return (
    <Animated.View style={{position:'absolute',top:H*0.3,left:0,width:W,height:H*0.22,opacity:op,transform:[{translateX:tx}]}}>
      <LinearGradient colors={['#1e40af','#1e3a8a']} start={{x:0,y:0}} end={{x:1,y:0}} style={{flex:1,borderRadius:8}}>
        <View style={{flexDirection:'row',padding:8,gap:6}}>
          {Array.from({length:6}).map((_,i) => <View key={i} style={{flex:1,height:H*0.12,backgroundColor:'#93c5fd',opacity:0.8,borderRadius:4}}/>)}
        </View>
      </LinearGradient>
    </Animated.View>
  );
};

export const RailwayPlatformRenderer = () => {
  const people = useMemo(() => Array.from({length:25}).map((_,i) => ({
    startX: Math.random()*W, speed: Math.random()*3000+2000, delay: i*200,
  })), []);
  return (
    <View style={[StyleSheet.absoluteFill,{width:W,height:H}]}>
      <LinearGradient colors={['#0f172a','#1e293b','#334155']} style={StyleSheet.absoluteFillObject} />
      {/* Platform surface */}
      <LinearGradient colors={['#475569','#334155']} start={{x:0,y:0}} end={{x:0,y:1}} style={{position:'absolute',bottom:0,left:0,right:0,height:H*0.16}}/>
      {/* Yellow line */}
      <View style={{position:'absolute',bottom:H*0.14,left:0,right:0,height:4,backgroundColor:'#fbbf24',opacity:0.8}}/>
      {/* Roof pillars */}
      {[W*0.15,W*0.38,W*0.62,W*0.85].map((x,i) => <View key={i} style={{position:'absolute',left:x-5,top:0,width:10,height:H*0.45,backgroundColor:'#64748b'}}/>)}
      {/* Roof */}
      <View style={{position:'absolute',top:0,left:0,right:0,height:H*0.08,backgroundColor:'#1e293b'}}/>
      {/* Destination board */}
      <View style={{position:'absolute',top:H*0.08,left:W*0.29,right:W*0.29,height:36,backgroundColor:'#0f172a',borderRadius:6,justifyContent:'center',alignItems:'center',borderWidth:1,borderColor:'#334155'}}>
        <View style={{flexDirection:'row',gap:4}}>
          {['M','U','M','B','A','I'].map((c,i) => <View key={i} style={{width:12,height:18,backgroundColor:'#fbbf24',borderRadius:2,opacity:0.9,justifyContent:'center',alignItems:'center'}}/>)}
        </View>
      </View>
      <PlatformTrain />
      {people.map((p,i) => <PlatformPerson key={i} {...p} />)}
      {/* Ground grid */}
      {Array.from({length:10}).map((_,i) => <View key={i} style={{position:'absolute',bottom:0,left:i*(W/10),width:1,height:H*0.16,backgroundColor:'rgba(255,255,255,0.04)'}}/>)}
    </View>
  );
};

// ─── TRAIN BRIDGE (water bridge) ─────────────────────────────────────────────
const BridgeTrain = () => {
  const tx = useRef(new Animated.Value(-300)).current;
  useEffect(() => { Animated.loop(Animated.sequence([Animated.timing(tx,{toValue:W+100,duration:5000,useNativeDriver:true}),Animated.delay(2000),Animated.timing(tx,{toValue:-300,duration:0,useNativeDriver:true})])).start(); }, []);
  return (
    <Animated.View style={{position:'absolute',top:H*0.36,transform:[{translateX:tx}]}}>
      <Svg width={300} height={45}>
        <Rect x={0} y={4} width={300} height={36} rx={5} fill="#374151"/>
        <Rect x={0} y={3} width={300} height={10} rx={3} fill="#1e40af"/>
        {[20,70,120,170,220,260].map((x,i)=><Rect key={i} x={x} y={10} width={25} height={18} rx={3} fill="#bfdbfe" opacity={0.8}/>)}
        <Rect x={0} y={38} width={24} height={8} rx={3} fill="#475569"/>
        <Rect x={276} y={38} width={24} height={8} rx={3} fill="#475569"/>
      </Svg>
    </Animated.View>
  );
};
const WaterReflection = () => {
  const wave = useRef(new Animated.Value(0)).current;
  useEffect(() => { Animated.loop(Animated.sequence([Animated.timing(wave,{toValue:1,duration:3000,useNativeDriver:true}),Animated.timing(wave,{toValue:0,duration:3000,useNativeDriver:true})])).start(); }, []);
  const tx = wave.interpolate({inputRange:[0,1],outputRange:[-30,30]});
  return (
    <Animated.View style={{position:'absolute',top:H*0.52,left:0,right:0,height:H*0.08,transform:[{translateX:tx}]}}>
      <Svg width={W+60} height={40}>
        {[0,12,24].map((y,i)=><Path key={i} d={`M0 ${y} Q${(W+60)*0.25} ${y-8} ${(W+60)*0.5} ${y} Q${(W+60)*0.75} ${y+8} ${W+60} ${y}`} fill="none" stroke="#38bdf8" strokeWidth={1.5} opacity={0.3-i*0.07}/>)}
      </Svg>
    </Animated.View>
  );
};

export const TrainBridgeRenderer = () => {
  return (
    <View style={[StyleSheet.absoluteFill,{width:W,height:H}]}>
      <LinearGradient colors={['#bfdbfe','#93c5fd','#60a5fa']} style={StyleSheet.absoluteFillObject} />
      {/* River */}
      <LinearGradient colors={['#0ea5e9','#0284c7','#075985']} start={{x:0,y:0}} end={{x:0,y:1}} style={{position:'absolute',top:H*0.48,left:0,right:0,bottom:0}}/>
      {/* Bridge pillars */}
      {[W*0.15,W*0.35,W*0.55,W*0.75,W*0.9].map((x,i) => (
        <View key={i} style={{position:'absolute',left:x-8,top:H*0.39,width:16,height:H*0.2,backgroundColor:'#64748b',borderRadius:4}}/>
      ))}
      {/* Bridge deck */}
      <View style={{position:'absolute',top:H*0.4,left:0,right:0,height:10,backgroundColor:'#475569'}}/>
      <View style={{position:'absolute',top:H*0.38,left:0,right:0,height:6,backgroundColor:'#1e293b'}}/>
      {/* Arch */}
      <Svg width={W} height={H*0.15} style={{position:'absolute',top:H*0.26}}>
        <Path d={`M0 ${H*0.15} Q${W*0.25} 0 ${W*0.5} ${H*0.15}`} fill="none" stroke="#475569" strokeWidth={8} />
        <Path d={`M${W*0.5} ${H*0.15} Q${W*0.75} 0 ${W} ${H*0.15}`} fill="none" stroke="#475569" strokeWidth={8} />
      </Svg>
      {/* Cables */}
      <Svg width={W} height={H*0.15} style={{position:'absolute',top:H*0.26}}>
        {Array.from({length:8}).map((_,i)=>(
          <Line key={i} x1={W*0.5} y1={0} x2={i*(W/8)} y2={H*0.15} stroke="#64748b" strokeWidth={1} opacity={0.6}/>
        ))}
      </Svg>
      <BridgeTrain />
      <WaterReflection />
    </View>
  );
};
