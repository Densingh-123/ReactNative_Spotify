import React, { useMemo, useRef, useEffect } from 'react';
import { View, StyleSheet, Animated, Dimensions, Text } from 'react-native';
import Svg, { Circle, Path, Line, Rect, Ellipse, G } from 'react-native-svg';
import LinearGradient from 'react-native-linear-gradient';

const { width: W, height: H } = Dimensions.get('window');

// ─── STREET FOOD (full stalls: pizza, burger, chicken, momos) ────────────────
const Steam = ({ x, y, delay }: any) => {
  const ty = useRef(new Animated.Value(0)).current;
  const op = useRef(new Animated.Value(0.7)).current;
  useEffect(() => {
    const run = () => {
      ty.setValue(0); op.setValue(0.7);
      Animated.parallel([
        Animated.timing(ty,{toValue:-40,duration:2500,useNativeDriver:true}),
        Animated.timing(op,{toValue:0,duration:2500,useNativeDriver:true}),
      ]).start(()=>setTimeout(run,delay));
    };
    setTimeout(run,delay);
  }, []);
  return <Animated.View style={{position:'absolute',left:x,top:y,width:5,height:18,borderRadius:3,backgroundColor:'#e2e8f0',opacity:op,transform:[{translateY:ty}]}}/>;
};

const FoodStall = ({ type, x }: any) => {
  const renderFood = () => {
    if (type==='pizza') return (
      <Svg width={60} height={60}>
        <Path d="M30 5 L55 50 L5 50 Z" fill="#f97316"/>
        <Path d="M30 5 L55 50" fill="none" stroke="#fbbf24" strokeWidth={1.5}/>
        <Circle cx={25} cy={35} r={5} fill="#dc2626"/>
        <Circle cx={38} cy={38} r={4} fill="#dc2626"/>
        <Circle cx={28} cy={44} r={3} fill="#84cc16"/>
        <Path d="M30 5 L5 50" fill="none" stroke="#fbbf24" strokeWidth={1.5}/>
      </Svg>
    );
    if (type==='burger') return (
      <Svg width={65} height={55}>
        <Ellipse cx={32} cy={12} rx={28} ry={10} fill="#f59e0b"/>
        <Rect x={6} y={20} width={52} height={8} rx={2} fill="#84cc16"/>
        <Rect x={6} y={26} width={52} height={10} rx={1} fill="#b45309"/>
        <Rect x={6} y={34} width={52} height={7} rx={1} fill="#dc2626"/>
        <Ellipse cx={32} cy={44} rx={28} ry={8} fill="#d97706"/>
      </Svg>
    );
    if (type==='chicken') return (
      <Svg width={60} height={60}>
        <Path d="M15 50 Q10 30 20 20 Q30 8 45 18 Q55 28 48 42 Q42 55 30 55 Z" fill="#f59e0b"/>
        <Path d="M30 20 Q38 15 42 22" fill="none" stroke="#d97706" strokeWidth={2}/>
        <Circle cx={22} cy={36} r={3} fill="#d97706"/>
        <Circle cx={38} cy={38} r={3} fill="#d97706"/>
        <Circle cx={30} cy={44} r={3} fill="#d97706"/>
      </Svg>
    );
    if (type==='momos') return (
      <Svg width={60} height={50}>
        {[0,18,36].map((x,i)=>(
          <G key={i} transform={`translate(${x},0)`}>
            <Ellipse cx={12} cy={32} rx={12} ry={10} fill="#f8fafc"/>
            <Path d="M2 28 Q5 20 12 18 Q19 20 22 28" fill="none" stroke="#e2e8f0" strokeWidth={2}/>
            <Path d="M4 25 Q8 22 12 22 Q16 22 20 25" fill="none" stroke="#cbd5e1" strokeWidth={1}/>
          </G>
        ))}
        <Ellipse cx={18} cy={44} rx={18} ry={5} fill="#e2e8f0" opacity={0.4}/>
      </Svg>
    );
    return null;
  };
  const stallH = H * 0.28;
  return (
    <View style={{position:'absolute',left:x,bottom:H*0.08,width:W*0.22}}>
      {/* Stall canopy */}
      <LinearGradient colors={[type==='pizza'?'#ef4444':type==='burger'?'#f97316':type==='chicken'?'#d97706':'#8b5cf6', '#000']} start={{x:0,y:0}} end={{x:0,y:1}} style={{height:stallH*0.25,borderTopLeftRadius:8,borderTopRightRadius:8,justifyContent:'center',alignItems:'center'}}>
        <Text style={{color:'#fff',fontSize:10,fontWeight:'800'}}>{type.toUpperCase()}</Text>
      </LinearGradient>
      {/* Counter */}
      <View style={{height:stallH*0.5,backgroundColor:'#1e293b',justifyContent:'flex-end',alignItems:'center',paddingBottom:8}}>
        {renderFood()}
      </View>
      {/* Steam from food */}
      <Steam x={W*0.06} y={H*0.01} delay={type==='pizza'?0:type==='burger'?300:type==='chicken'?600:900}/>
      <Steam x={W*0.10} y={H*0.005} delay={type==='pizza'?200:type==='burger'?500:type==='chicken'?800:1100}/>
      {/* Vendor shape */}
      <View style={{height:stallH*0.25,backgroundColor:'#0f172a',justifyContent:'center',alignItems:'center'}}>
        <View style={{width:24,height:24,borderRadius:12,backgroundColor:'#475569'}}/>
      </View>
    </View>
  );
};

export const StreetFoodV2Renderer = () => (
  <View style={[StyleSheet.absoluteFill,{width:W,height:H}]}>
    <LinearGradient colors={['#1c0a00','#2a1000','#0c0500']} style={StyleSheet.absoluteFillObject}/>
    {/* Bokeh lights */}
    {Array.from({length:18}).map((_,i)=>(
      <View key={i} style={{position:'absolute',left:Math.random()*W,top:Math.random()*H*0.3,width:20+Math.random()*25,height:20+Math.random()*25,borderRadius:15,backgroundColor:['#f9731688','#fbbf2488','#ef444488','#a855f788'][i%4]}}/>
    ))}
    {/* Ground */}
    <View style={{position:'absolute',bottom:0,left:0,right:0,height:H*0.1,backgroundColor:'#0f172a'}}/>
    {/* Stalls */}
    <FoodStall type="pizza"   x={W*0.01} />
    <FoodStall type="burger"  x={W*0.26} />
    <FoodStall type="chicken" x={W*0.51} />
    <FoodStall type="momos"   x={W*0.76} />
    {/* Crowd feet and people shadows */}
    {Array.from({length:12}).map((_,i)=>(
      <View key={i} style={{position:'absolute',bottom:H*0.09,left:i*(W/12)+5,width:18,height:8,borderRadius:4,backgroundColor:'#0f172a',opacity:0.5+Math.random()*0.3}}/>
    ))}
  </View>
);

// ─── RAIN REFLECTION (full width, neon reflections) ──────────────────────────
const NeonReflection = ({ x, color, waveAnim }: any) => {
  const stretch = waveAnim.interpolate({inputRange:[0,1],outputRange:[0.7,1.4]});
  const op = waveAnim.interpolate({inputRange:[0,1],outputRange:[0.2,0.5]});
  return (
    <Animated.View style={{position:'absolute',bottom:0,left:x,width:8,height:H*0.22,backgroundColor:color,opacity:op,borderRadius:4,transform:[{scaleX:stretch}]}}/>
  );
};

const RainStreakV = ({ x, speed, delay }: any) => {
  const ty = useRef(new Animated.Value(-25)).current;
  useEffect(() => { const run=()=>{ty.setValue(-25);Animated.sequence([Animated.delay(delay),Animated.timing(ty,{toValue:H+25,duration:speed,useNativeDriver:true})]).start(run);}; run(); }, []);
  return <Animated.View style={{position:'absolute',left:x,top:0,width:1.5,height:25,backgroundColor:'rgba(148,163,184,0.5)',borderRadius:1,transform:[{translateY:ty}]}}/>;
};

export const RainReflectionV2Renderer = () => {
  const waveAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => { Animated.loop(Animated.sequence([Animated.timing(waveAnim,{toValue:1,duration:2000,useNativeDriver:false}),Animated.timing(waveAnim,{toValue:0,duration:2000,useNativeDriver:false})])).start(); }, []);
  const drops = useMemo(()=>Array.from({length:90}).map((_,i)=>({x:Math.random()*W,speed:Math.random()*500+700,delay:i*55})),[]);
  const reflections = useMemo(()=>[
    {x:W*0.1,color:'#ef4444'},{x:W*0.25,color:'#fbbf24'},{x:W*0.4,color:'#22d3ee'},
    {x:W*0.55,color:'#a855f7'},{x:W*0.7,color:'#f97316'},{x:W*0.85,color:'#06b6d4'},
  ],[]);
  return (
    <View style={[StyleSheet.absoluteFill,{width:W,height:H}]}>
      <LinearGradient colors={['#020617','#0f172a','#1e1b4b']} style={StyleSheet.absoluteFillObject}/>
      {/* Wet ground */}
      <LinearGradient colors={['transparent','#0f172a']} start={{x:0,y:0.5}} end={{x:0,y:1}} style={{position:'absolute',bottom:0,left:0,right:0,height:H*0.28}}/>
      {/* Neon signs on buildings */}
      {[{x:W*0.05,c:'#ef4444'},{x:W*0.38,c:'#22d3ee'},{x:W*0.65,c:'#a855f7'},{x:W*0.82,c:'#f97316'}].map((n,i)=>(
        <View key={i} style={{position:'absolute',top:H*0.12+i*H*0.06,left:n.x,width:70,height:16,backgroundColor:n.c+'44',borderRadius:4,borderWidth:1,borderColor:n.c+'88'}}/>
      ))}
      {reflections.map((r,i)=><NeonReflection key={i} {...r} waveAnim={waveAnim}/>)}
      {drops.map((d,i)=><RainStreakV key={i} {...d}/>)}
      {/* Puddles */}
      {[W*0.12,W*0.45,W*0.72].map((x,i)=>(
        <View key={i} style={{position:'absolute',bottom:H*0.03,left:x-20,width:45,height:14,borderRadius:22,borderWidth:1,borderColor:'rgba(148,163,184,0.2)',backgroundColor:'rgba(14,165,233,0.08)'}}/>
      ))}
    </View>
  );
};

// ─── LO-FI WINDOW (full width, desk + mug + city) ────────────────────────────
const MugSteam = ({ x, y, delay }: any) => {
  const ty = useRef(new Animated.Value(0)).current;
  const op = useRef(new Animated.Value(0.8)).current;
  useEffect(() => { const run=()=>{ty.setValue(0);op.setValue(0.8);Animated.parallel([Animated.timing(ty,{toValue:-55,duration:3000,useNativeDriver:true}),Animated.timing(op,{toValue:0,duration:3000,useNativeDriver:true})]).start(()=>setTimeout(run,delay));}; setTimeout(run,delay); }, []);
  return <Animated.View style={{position:'absolute',left:x,top:y,width:6,height:28,borderRadius:3,backgroundColor:'#e2e8f0',opacity:op,transform:[{translateY:ty}]}}/>;
};
const LoFiRainDrop = ({ x, speed, delay }: any) => {
  const ty = useRef(new Animated.Value(-20)).current;
  useEffect(() => { const run=()=>{ty.setValue(-20);Animated.sequence([Animated.delay(delay),Animated.timing(ty,{toValue:H+20,duration:speed,useNativeDriver:true})]).start(run);}; run(); }, []);
  return <Animated.View style={{position:'absolute',left:x,top:0,width:1.5,height:20,backgroundColor:'rgba(148,163,184,0.45)',borderRadius:1,transform:[{translateY:ty}]}}/>;
};

export const LoFiWindowV2Renderer = () => {
  const drops = useMemo(()=>Array.from({length:70}).map((_,i)=>({x:Math.random()*W,speed:Math.random()*800+1200,delay:i*80})),[]);
  return (
    <View style={[StyleSheet.absoluteFill,{width:W,height:H}]}>
      <LinearGradient colors={['#0f172a','#1e293b','#0a0a0a']} style={StyleSheet.absoluteFillObject}/>
      {/* City bokeh behind window */}
      {Array.from({length:25}).map((_,i)=>(
        <View key={i} style={{position:'absolute',left:Math.random()*W,top:H*0.1+Math.random()*H*0.5,width:16+Math.random()*24,height:16+Math.random()*24,borderRadius:14,backgroundColor:['#fbbf2444','#ef444444','#38bdf844','#a855f744'][i%4]}}/>
      ))}
      {/* Rain on window */}
      {drops.map((d,i)=><LoFiRainDrop key={i} {...d}/>)}
      {/* Window pane border */}
      <View style={{position:'absolute',left:0,top:0,right:0,bottom:H*0.22,borderWidth:24,borderColor:'#1c1917',pointerEvents:'none'}}/>
      <View style={{position:'absolute',left:W/2-2,top:0,width:4,height:H*0.78,backgroundColor:'#292524'}}/>
      <View style={{position:'absolute',left:0,top:H*0.4,right:0,height:4,backgroundColor:'#292524'}}/>
      {/* Desk */}
      <View style={{position:'absolute',bottom:0,left:0,right:0,height:H*0.22,backgroundColor:'#44403c'}}/>
      <View style={{position:'absolute',bottom:H*0.2,left:0,right:0,height:6,backgroundColor:'#57534e'}}/>
      {/* Mug */}
      <View style={{position:'absolute',bottom:H*0.22,right:W*0.12}}>
        <Svg width={44} height={55}>
          <Rect x={6} y={18} width={32} height={32} rx={6} fill="#78350f"/>
          <Ellipse cx={22} cy={18} rx={16} ry={5} fill="#92400e"/>
          <Ellipse cx={22} cy={17} rx={12} ry={4} fill="#fde68a" opacity={0.3}/>
          <Path d="M38 26 Q50 30 38 40" fill="none" stroke="#92400e" strokeWidth={4} strokeLinecap="round"/>
        </Svg>
        <MugSteam x={10} y={-30} delay={0}/>
        <MugSteam x={20} y={-35} delay={500}/>
        <MugSteam x={30} y={-28} delay={250}/>
      </View>
      {/* Book/notebook */}
      <View style={{position:'absolute',bottom:H*0.22,left:W*0.08,width:W*0.3,height:18,backgroundColor:'#1e40af',borderRadius:3}}/>
      {/* Plant */}
      <View style={{position:'absolute',bottom:H*0.22,left:W*0.65,width:32,height:40,backgroundColor:'#14532d',borderRadius:16}}/>
    </View>
  );
};

// ─── BUS STOP RAIN (full width) ───────────────────────────────────────────────
const BusArriving = () => {
  const tx = useRef(new Animated.Value(-220)).current;
  useEffect(() => {
    const run = () => {
      tx.setValue(-220);
      Animated.sequence([
        Animated.delay(4000),
        Animated.timing(tx,{toValue:W*0.2,duration:2500,useNativeDriver:true}),
        Animated.delay(3000),
        Animated.timing(tx,{toValue:W+220,duration:2500,useNativeDriver:true}),
      ]).start(run);
    };
    run();
  }, []);
  return (
    <Animated.View style={{position:'absolute',bottom:H*0.11,transform:[{translateX:tx}]}}>
      <Svg width={220} height={80}>
        <Rect x={2} y={5} width={216} height={62} rx={6} fill="#16a34a"/>
        <Rect x={14} y={10} width={36} height={28} rx={3} fill="#bfdbfe" opacity={0.85}/>
        <Rect x={58} y={10} width={36} height={28} rx={3} fill="#bfdbfe" opacity={0.85}/>
        <Rect x={102} y={10} width={36} height={28} rx={3} fill="#bfdbfe" opacity={0.85}/>
        <Rect x={146} y={10} width={36} height={28} rx={3} fill="#bfdbfe" opacity={0.85}/>
        <Rect x={5} y={3} width={40} height={10} rx={3} fill="#fbbf24" opacity={0.9}/>
        <Circle cx={40} cy={67} r={12} fill="#1e293b" stroke="#475569" strokeWidth={2}/>
        <Circle cx={174} cy={67} r={12} fill="#1e293b" stroke="#475569" strokeWidth={2}/>
        <Circle cx={40} cy={67} r={5} fill="#374151"/>
        <Circle cx={174} cy={67} r={5} fill="#374151"/>
      </Svg>
    </Animated.View>
  );
};
const BusStopDrop = ({ x, speed, delay }: any) => {
  const ty = useRef(new Animated.Value(-20)).current;
  useEffect(() => { const run=()=>{ty.setValue(-20);Animated.sequence([Animated.delay(delay),Animated.timing(ty,{toValue:H+20,duration:speed,useNativeDriver:true})]).start(run);}; run(); }, []);
  return <Animated.View style={{position:'absolute',left:x,top:0,width:1.6,height:22,backgroundColor:'rgba(148,163,184,0.6)',borderRadius:1,transform:[{translateY:ty}]}}/>;
};

export const BusStopRainRenderer = () => {
  const drops = useMemo(()=>Array.from({length:80}).map((_,i)=>({x:Math.random()*W,speed:Math.random()*600+900,delay:i*65})),[]);
  return (
    <View style={[StyleSheet.absoluteFill,{width:W,height:H}]}>
      <LinearGradient colors={['#1e293b','#334155','#0f172a']} style={StyleSheet.absoluteFillObject}/>
      {drops.map((d,i)=><BusStopDrop key={i} {...d}/>)}
      {/* Wet ground */}
      <View style={{position:'absolute',bottom:0,left:0,right:0,height:H*0.13,backgroundColor:'rgba(14,165,233,0.1)'}}/>
      {/* Bus shelter */}
      <View style={{position:'absolute',bottom:H*0.12,left:W*0.1,width:W*0.35,height:H*0.32}}>
        {/* Roof */}
        <View style={{height:H*0.03,backgroundColor:'#475569',borderTopLeftRadius:4,borderTopRightRadius:4}}/>
        {/* Back wall (partial) */}
        <View style={{flex:1,borderLeftWidth:4,borderColor:'#374151',flexDirection:'row',alignItems:'flex-end',paddingHorizontal:8,paddingBottom:8,gap:10}}>
          {/* Waiting people */}
          {[0,1,2].map((_,i)=>(
            <Svg key={i} width={20} height={50}><Circle cx={10} cy={8} r={7} fill="#1e293b"/><Rect x={3} y={15} width={14} height={22} rx={4} fill="#0f172a"/><Line x1={10} y1={37} x2={7} y2={50} stroke="#0f172a" strokeWidth={3} strokeLinecap="round"/><Line x1={10} y1={37} x2={13} y2={50} stroke="#0f172a" strokeWidth={3} strokeLinecap="round"/></Svg>
          ))}
        </View>
        {/* Support pillars */}
        <View style={{position:'absolute',left:0,top:0,bottom:0,width:4,backgroundColor:'#374151'}}/>
        <View style={{position:'absolute',right:0,top:0,bottom:0,width:4,backgroundColor:'#374151'}}/>
      </View>
      {/* Bus stop sign */}
      <View style={{position:'absolute',bottom:H*0.12,left:W*0.44,width:12,height:H*0.26,backgroundColor:'#374151',borderRadius:6}}/>
      <View style={{position:'absolute',bottom:H*0.36,left:W*0.38,width:60,height:28,backgroundColor:'#1d4ed8',borderRadius:6,justifyContent:'center',alignItems:'center'}}>
        <Text style={{color:'#fff',fontSize:11,fontWeight:'800'}}>BUS STOP</Text>
      </View>
      <BusArriving/>
      {/* Ground puddle reflections */}
      {[W*0.15,W*0.45,W*0.72].map((x,i)=><View key={i} style={{position:'absolute',bottom:H*0.04,left:x-18,width:36,height:8,borderRadius:18,backgroundColor:'rgba(148,163,184,0.15)'}}/>)}
    </View>
  );
};
