import React, { useMemo, useRef, useEffect } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import Svg, { Circle, Path, Line, Rect, Ellipse, G } from 'react-native-svg';
import LinearGradient from 'react-native-linear-gradient';

const { width: W, height: H } = Dimensions.get('window');

// ─── BIKE RIDE POV (friends at night) ─────────────────────────────────────────
const BikerFriend = ({ x, delay }: any) => {
  const bob = useRef(new Animated.Value(0)).current;
  useEffect(() => { setTimeout(() => Animated.loop(Animated.sequence([Animated.timing(bob,{toValue:-6,duration:400,useNativeDriver:true}),Animated.timing(bob,{toValue:4,duration:400,useNativeDriver:true})])).start(), delay); }, []);
  return (
    <Animated.View style={{position:'absolute',bottom:H*0.19,left:x,transform:[{translateY:bob}]}}>
      <Svg width={55} height={90}>
        {/* Bike */}
        <Circle cx={15} cy={72} r={12} fill="none" stroke="#94a3b8" strokeWidth={3}/>
        <Circle cx={42} cy={72} r={12} fill="none" stroke="#94a3b8" strokeWidth={3}/>
        <Path d="M15 72 L28 48 L42 72" fill="none" stroke="#64748b" strokeWidth={2.5}/>
        <Path d="M28 48 L38 42" fill="none" stroke="#64748b" strokeWidth={2}/>
        <Path d="M38 42 L44 44 L46 42" fill="none" stroke="#94a3b8" strokeWidth={2}/>
        {/* Rider */}
        <Circle cx={28} cy={28} r={8} fill="#1e293b"/>
        <Path d="M28 36 L22 56 L34 56 Z" fill="#0f172a"/>
        <Path d="M22 56 L18 68" stroke="#334155" strokeWidth={3} strokeLinecap="round"/>
        <Path d="M34 56 L38 68" stroke="#334155" strokeWidth={3} strokeLinecap="round"/>
        {/* Headlight */}
        <Ellipse cx={46} cy={74} rx={4} ry={3} fill="#fde68a" opacity={0.9}/>
      </Svg>
    </Animated.View>
  );
};

export const BikeRideFriendsRenderer = () => {
  const lampPositions = useMemo(() => Array.from({length:6}).map((_,i) => i*(W/5)), []);
  const roadLine = useRef(new Animated.Value(0)).current;
  useEffect(() => { Animated.loop(Animated.timing(roadLine,{toValue:1,duration:600,useNativeDriver:true})).start(); }, []);
  const dashTx = roadLine.interpolate({inputRange:[0,1],outputRange:[0,-(W/8)]});
  return (
    <View style={[StyleSheet.absoluteFill,{width:W,height:H}]}>
      <LinearGradient colors={['#020617','#0f172a','#1e293b']} style={StyleSheet.absoluteFillObject} />
      {/* Stars */}
      {Array.from({length:50}).map((_,i)=><View key={i} style={{position:'absolute',left:Math.random()*W,top:Math.random()*H*0.5,width:2,height:2,borderRadius:1,backgroundColor:'#fff',opacity:Math.random()*0.6+0.1}}/>)}
      {/* Road */}
      <LinearGradient colors={['#1e293b','#334155']} start={{x:0,y:0}} end={{x:0,y:1}} style={{position:'absolute',bottom:0,left:0,right:0,height:H*0.22}}/>
      {/* Road markings */}
      <Animated.View style={{position:'absolute',bottom:H*0.12,left:0,right:0,flexDirection:'row',transform:[{translateX:dashTx}]}}>
        {Array.from({length:14}).map((_,i)=><View key={i} style={{width:W/10,height:4,backgroundColor:'#fbbf24',opacity:0.6,marginRight:W/10}}/>)}
      </Animated.View>
      {/* Street lights with glow */}
      {lampPositions.map((x,i)=>(
        <View key={i}>
          <View style={{position:'absolute',left:x+2,top:H*0.12,width:6,height:H*0.38,backgroundColor:'#374151',borderRadius:3}}/>
          <View style={{position:'absolute',left:x-2,top:H*0.1,width:14,height:6,backgroundColor:'#374151',borderRadius:3}}/>
          <View style={{position:'absolute',left:x+4,top:H*0.08,width:8,height:8,borderRadius:4,backgroundColor:'#fde68a',opacity:0.95}}/>
          <View style={{position:'absolute',left:x-20,top:H*0.06,width:50,height:50,borderRadius:25,backgroundColor:'#fde68a',opacity:0.08}}/>
        </View>
      ))}
      {/* Friends on bikes */}
      <BikerFriend x={W*0.1} delay={0}/>
      <BikerFriend x={W*0.35} delay={120}/>
      <BikerFriend x={W*0.6} delay={80}/>
    </View>
  );
};

// ─── AUTO RICKSHAW (bridge, picking customers) ─────────────────────────────────
const AutoRickshaw = ({ startX, speed, delay }: any) => {
  const tx = useRef(new Animated.Value(startX)).current;
  useEffect(() => {
    const run = () => { tx.setValue(-150); Animated.sequence([Animated.delay(delay), Animated.timing(tx,{toValue:W+150,duration:speed,useNativeDriver:true})]).start(run); };
    run();
  }, []);
  return (
    <Animated.View style={{position:'absolute',bottom:H*0.18,transform:[{translateX:tx}]}}>
      <Svg width={100} height={65}>
        <Rect x={5} y={15} width={85} height={42} rx={6} fill="#f97316"/>
        <Rect x={5} y={5} width={85} height={16} rx={6} fill="#ea580c"/>
        <Rect x={12} y={18} width={22} height={18} rx={3} fill="#bfdbfe" opacity={0.85}/>
        <Rect x={42} y={18} width={22} height={18} rx={3} fill="#bfdbfe" opacity={0.85}/>
        <Circle cx={22} cy={57} r={10} fill="#1e293b" stroke="#475569" strokeWidth={2}/>
        <Circle cx={78} cy={57} r={10} fill="#1e293b" stroke="#475569" strokeWidth={2}/>
        <Circle cx={22} cy={57} r={4} fill="#374151"/>
        <Circle cx={78} cy={57} r={4} fill="#374151"/>
        <Rect x={85} y={22} width={12} height={10} rx={2} fill="#fde68a" opacity={0.9}/>
      </Svg>
    </Animated.View>
  );
};

const WaitingPerson = ({ x, opacity }: any) => (
  <Animated.View style={{position:'absolute',bottom:H*0.18+5,left:x,opacity}}>
    <Svg width={20} height={45}>
      <Circle cx={10} cy={8} r={6} fill="#64748b"/>
      <Rect x={4} y={14} width={12} height={20} rx={4} fill="#475569"/>
      <Line x1={10} y1={34} x2={7} y2={44} stroke="#475569" strokeWidth={3} strokeLinecap="round"/>
      <Line x1={10} y1={34} x2={13} y2={44} stroke="#475569" strokeWidth={3} strokeLinecap="round"/>
    </Svg>
  </Animated.View>
);

export const AutoRickshawBridgeRenderer = () => {
  const autos = useMemo(() => [
    {startX:-150,speed:6000,delay:0},{startX:W*0.4,speed:7000,delay:2000},{startX:-50,speed:5500,delay:4000},
  ],[]);
  const waitOp = useMemo(() => Array.from({length:5}).map(()=>new Animated.Value(1)),[]);
  return (
    <View style={[StyleSheet.absoluteFill,{width:W,height:H}]}>
      <LinearGradient colors={['#0c4a6e','#0e7490','#164e63']} style={StyleSheet.absoluteFillObject} />
      {/* Water under bridge */}
      <LinearGradient colors={['#0ea5e9','#0284c7']} start={{x:0,y:0}} end={{x:0,y:1}} style={{position:'absolute',bottom:0,left:0,right:0,height:H*0.2}}/>
      {/* Bridge structure */}
      <View style={{position:'absolute',bottom:H*0.2,left:0,right:0,height:H*0.06,backgroundColor:'#374151'}}/>
      {/* Pillars into water */}
      {[W*0.15,W*0.35,W*0.55,W*0.75,W*0.9].map((x,i)=><View key={i} style={{position:'absolute',left:x-8,bottom:0,width:16,height:H*0.23,backgroundColor:'#4b5563',borderRadius:4}}/>)}
      {/* Guard rails */}
      <View style={{position:'absolute',bottom:H*0.25,left:0,right:0,height:5,backgroundColor:'#94a3b8',opacity:0.7}}/>
      {/* Platform sign */}
      <View style={{position:'absolute',top:H*0.06,left:W*0.3,right:W*0.3,height:32,backgroundColor:'#1e293b',borderRadius:8,justifyContent:'center',alignItems:'center',borderWidth:1,borderColor:'#f97316'}}>
        <View style={{width:80,height:8,backgroundColor:'#f97316',borderRadius:4}}/>
      </View>
      {/* Waiting people */}
      {[W*0.05,W*0.2,W*0.4,W*0.6,W*0.8].map((x,i)=><WaitingPerson key={i} x={x} opacity={waitOp[i]}/>)}
      {autos.map((a,i)=><AutoRickshaw key={i} {...a}/>)}
    </View>
  );
};

// ─── PLANE TAKEOFF (airport morning) ─────────────────────────────────────────
const TakeoffPlane = ({ delay, y }: any) => {
  const tx = useRef(new Animated.Value(-80)).current;
  const ty = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.6)).current;
  useEffect(() => {
    const run = () => {
      tx.setValue(-80); ty.setValue(y); scale.setValue(0.6);
      Animated.sequence([
        Animated.delay(delay+Math.random()*2000),
        Animated.parallel([
          Animated.timing(tx,{toValue:W+100,duration:4000,useNativeDriver:true}),
          Animated.timing(ty,{toValue:y-H*0.35,duration:4000,useNativeDriver:true}),
          Animated.timing(scale,{toValue:1.3,duration:4000,useNativeDriver:true}),
        ]),
      ]).start(run);
    };
    run();
  }, []);
  return (
    <Animated.View style={{position:'absolute',left:0,top:0,transform:[{translateX:tx},{translateY:ty},{scale}]}}>
      <Svg width={80} height={35}>
        <Ellipse cx={50} cy={18} rx={28} ry={9} fill="#e2e8f0"/>
        <Path d="M22 18 L2 18 L8 13 Z" fill="#e2e8f0"/>
        <Path d="M50 10 L70 6 L72 14 Z" fill="#cbd5e1"/>
        <Path d="M50 26 L65 30 L66 23 Z" fill="#cbd5e1"/>
        <Ellipse cx={70} cy={18} rx={10} ry={6} fill="#94a3b8"/>
        <Ellipse cx={20} cy={22} rx={6} ry={4} fill="#94a3b8"/>
        <Circle cx={73} cy={18} r={3} fill="#fbbf24" opacity={0.9}/>
        <Circle cx={23} cy={22} r={2} fill="#fbbf24" opacity={0.7}/>
      </Svg>
    </Animated.View>
  );
};

export const PlaneTakeoffRenderer = () => {
  const planes = useMemo(() => [
    {delay:0, y:H*0.72},{delay:3000, y:H*0.65},{delay:6000, y:H*0.6},
  ],[]);
  return (
    <View style={[StyleSheet.absoluteFill,{width:W,height:H}]}>
      <LinearGradient colors={['#fde68a','#fbbf24','#f97316','#0ea5e9','#7dd3fc']} locations={[0,0.15,0.3,0.6,1]} style={StyleSheet.absoluteFillObject} />
      {/* Airport terminal */}
      <View style={{position:'absolute',bottom:H*0.12,left:0,right:0,height:H*0.2,backgroundColor:'#475569'}}/>
      <View style={{position:'absolute',bottom:H*0.3,left:W*0.1,width:W*0.8,height:H*0.06,backgroundColor:'#64748b',borderRadius:4}}/>
      {/* Windows */}
      {Array.from({length:14}).map((_,i)=><View key={i} style={{position:'absolute',bottom:H*0.15,left:i*(W/14)+4,width:W/18,height:H*0.08,backgroundColor:'#bfdbfe',opacity:0.6,borderRadius:3}}/>)}
      {/* Control tower */}
      <View style={{position:'absolute',bottom:H*0.3,left:W*0.78,width:20,height:H*0.18,backgroundColor:'#374151',borderRadius:3}}/>
      <View style={{position:'absolute',bottom:H*0.46,left:W*0.76,width:26,height:14,backgroundColor:'#475569',borderRadius:3}}/>
      {/* Runway */}
      <View style={{position:'absolute',bottom:0,left:0,right:0,height:H*0.14,backgroundColor:'#1e293b'}}/>
      {Array.from({length:8}).map((_,i)=><View key={i} style={{position:'absolute',bottom:H*0.06,left:i*(W/8)+10,width:W/10,height:5,backgroundColor:'#fff',opacity:0.3,borderRadius:2}}/>)}
      {/* Sun */}
      <View style={{position:'absolute',top:H*0.07,right:W*0.12,width:60,height:60,borderRadius:30,backgroundColor:'#fbbf24',opacity:0.9}}/>
      {planes.map((p,i)=><TakeoffPlane key={i} {...p}/>)}
    </View>
  );
};

// ─── NEON TAXI (vehicles + people entering) ───────────────────────────────────
const StreetVehicle = ({ type, startX, speed, delay }: any) => {
  const tx = useRef(new Animated.Value(startX)).current;
  useEffect(() => {
    const run = () => { tx.setValue(-200); Animated.sequence([Animated.delay(delay+Math.random()*1000), Animated.timing(tx,{toValue:W+200,duration:speed,useNativeDriver:true})]).start(run); };
    run();
  }, []);
  const renderVehicle = () => {
    if (type==='taxi_car') return (
      <Svg width={90} height={48}>
        <Rect x={5} y={16} width={80} height={28} rx={5} fill="#fbbf24"/>
        <Rect x={12} y={5} width={60} height={16} rx={5} fill="#f59e0b"/>
        <Rect x={8} y={18} width={22} height={14} rx={3} fill="#bfdbfe" opacity={0.8}/>
        <Rect x={60} y={18} width={22} height={14} rx={3} fill="#bfdbfe" opacity={0.8}/>
        <Circle cx={22} cy={44} r={8} fill="#1e293b" stroke="#475569" strokeWidth={2}/>
        <Circle cx={68} cy={44} r={8} fill="#1e293b" stroke="#475569" strokeWidth={2}/>
        <Rect x={78} y={22} width={12} height={8} rx={2} fill="#ef4444" opacity={0.9}/>
        <Rect x={0} y={22} width={10} height={8} rx={2} fill="#fde68a" opacity={0.9}/>
      </Svg>
    );
    if (type==='bike_taxi') return (
      <Svg width={60} height={55}>
        <Circle cx={15} cy={45} r={10} fill="none" stroke="#fb923c" strokeWidth={3}/>
        <Circle cx={45} cy={45} r={10} fill="none" stroke="#fb923c" strokeWidth={3}/>
        <Path d="M15 45 L30 22 L45 45" fill="none" stroke="#f97316" strokeWidth={3}/>
        <Circle cx={30} cy={12} r={7} fill="#1e293b"/>
        <Rect x={26} y={19} width={8} height={14} rx={3} fill="#374155"/>
        <Rect x={42} y={26} width={14} height={6} rx={3} fill="#fb923c"/>
      </Svg>
    );
    if (type==='auto') return (
      <Svg width={80} height={55}>
        <Rect x={5} y={14} width={68} height={34} rx={6} fill="#10b981"/>
        <Rect x={5} y={8} width={68} height={12} rx={4} fill="#059669"/>
        <Rect x={10} y={16} width={22} height={16} rx={3} fill="#bfdbfe" opacity={0.8}/>
        <Circle cx={18} cy={48} r={9} fill="#1e293b" stroke="#475569" strokeWidth={2}/>
        <Circle cx={62} cy={48} r={9} fill="#1e293b" stroke="#475569" strokeWidth={2}/>
        <Rect x={66} y={20} width={10} height={8} rx={2} fill="#fde68a" opacity={0.9}/>
      </Svg>
    );
    return null;
  };
  const baseY = type==='bike_taxi'? H*0.2 : H*0.17;
  return <Animated.View style={{position:'absolute',bottom:baseY,transform:[{translateX:tx}]}}>{renderVehicle()}</Animated.View>;
};

export const NeonTaxiStreetRenderer = () => {
  const vehicles = useMemo(() => [
    {type:'taxi_car',startX:-100,speed:5500,delay:0},
    {type:'auto',startX:W*0.3,speed:6000,delay:1500},
    {type:'bike_taxi',startX:-50,speed:4500,delay:3000},
    {type:'taxi_car',startX:W*0.6,speed:5000,delay:4500},
    {type:'auto',startX:-200,speed:7000,delay:2200},
  ],[]);
  return (
    <View style={[StyleSheet.absoluteFill,{width:W,height:H}]}>
      <LinearGradient colors={['#020617','#0f172a','#1e1b4b']} style={StyleSheet.absoluteFillObject} />
      {/* Neon signs */}
      {[{x:W*0.05,y:H*0.15,c:'#ef4444'},{x:W*0.55,y:H*0.08,c:'#06b6d4'},{x:W*0.78,y:H*0.2,c:'#a855f7'}].map((n,i)=>(
        <View key={i} style={{position:'absolute',left:n.x,top:n.y,width:80,height:20,backgroundColor:n.c+'33',borderRadius:4,borderWidth:1,borderColor:n.c+'99'}}/>
      ))}
      {/* Wet road reflection */}
      <LinearGradient colors={['transparent','#0ea5e922']} start={{x:0,y:0.5}} end={{x:0,y:1}} style={StyleSheet.absoluteFillObject}/>
      {/* Road */}
      <View style={{position:'absolute',bottom:0,left:0,right:0,height:H*0.2,backgroundColor:'#0f172a'}}/>
      <View style={{position:'absolute',bottom:H*0.19,left:0,right:0,height:2,backgroundColor:'#fbbf24',opacity:0.3}}/>
      {/* Bokeh city lights */}
      {Array.from({length:20}).map((_,i)=>(
        <View key={i} style={{position:'absolute',left:Math.random()*W,top:Math.random()*H*0.4,width:Math.random()*20+8,height:Math.random()*20+8,borderRadius:12,backgroundColor:['#ef444488','#fbbf2488','#06b6d488','#a855f788'][i%4]}}/>
      ))}
      {vehicles.map((v,i)=><StreetVehicle key={i} {...v}/>)}
      {/* Person hailing */}
      <View style={{position:'absolute',bottom:H*0.21,right:W*0.1}}>
        <Svg width={24} height={55}><Circle cx={12} cy={8} r={7} fill="#64748b"/><Rect x={5} y={15} width={14} height={24} rx={4} fill="#475569"/><Line x1={12} y1={39} x2={9} y2={52} stroke="#475569" strokeWidth={3} strokeLinecap="round"/><Line x1={12} y1={39} x2={15} y2={52} stroke="#475569" strokeWidth={3} strokeLinecap="round"/><Line x1={12} y1={22} x2={22} y2={14} stroke="#475569" strokeWidth={2.5} strokeLinecap="round"/></Svg>
      </View>
    </View>
  );
};

// ─── TERRACE FRIENDS (rooftop party) ──────────────────────────────────────────
const TerraceLight = ({ x, y }: any) => {
  const op = useRef(new Animated.Value(Math.random())).current;
  useEffect(() => { Animated.loop(Animated.sequence([Animated.timing(op,{toValue:1,duration:Math.random()*1500+500,useNativeDriver:true}),Animated.timing(op,{toValue:0.3,duration:Math.random()*1500+500,useNativeDriver:true})])).start(); }, []);
  const color = ['#fbbf24','#ef4444','#06b6d4','#a855f7','#22c55e'][Math.floor(Math.random()*5)];
  return <Animated.View style={{position:'absolute',left:x,top:y,width:10,height:10,borderRadius:5,backgroundColor:color,opacity:op,shadowColor:color,shadowOpacity:0.9,shadowRadius:8}}/>;
};

export const TerraceFriendsRenderer = () => {
  const lights = useMemo(() => Array.from({length:40}).map(()=>({x:Math.random()*W,y:H*0.22+Math.random()*H*0.3})),[]);
  return (
    <View style={[StyleSheet.absoluteFill,{width:W,height:H}]}>
      <LinearGradient colors={['#020617','#0f172a','#1e1b4b']} style={StyleSheet.absoluteFillObject} />
      {/* City lights below */}
      {Array.from({length:35}).map((_,i)=><View key={i} style={{position:'absolute',left:Math.random()*W,top:H*0.55+Math.random()*H*0.3,width:Math.random()*16+4,height:Math.random()*16+4,borderRadius:3,backgroundColor:['#fbbf2455','#ef444455','#38bdf855'][i%3]}}/>)}
      {/* Terrace floor */}
      <View style={{position:'absolute',bottom:0,left:0,right:0,height:H*0.18,backgroundColor:'#1e293b'}}/>
      <View style={{position:'absolute',bottom:H*0.17,left:0,right:0,height:6,backgroundColor:'#334155'}}/>
      {/* String lights */}
      {[H*0.22,H*0.29].map((y,li)=>(
        <Svg key={li} width={W} height={30} style={{position:'absolute',top:y}}>
          <Path d={`M0 10 Q${W*0.25} 20 ${W*0.5} 10 Q${W*0.75} 0 ${W} 10`} fill="none" stroke="#292524" strokeWidth={1.5}/>
        </Svg>
      ))}
      {lights.map((l,i)=><TerraceLight key={i} {...l}/>)}
      {/* Friend silhouettes sitting */}
      {[W*0.08,W*0.22,W*0.38,W*0.55,W*0.72,W*0.86].map((x,i)=>(
        <View key={i} style={{position:'absolute',bottom:H*0.17}}>
          <Svg width={32} height={56} style={{left:x}}><Circle cx={16} cy={9} r={8} fill="#0f172a"/><Rect x={6} y={17} width={20} height={22} rx={5} fill="#0f172a"/><Line x1={16} y1={39} x2={10} y2={52} stroke="#0f172a" strokeWidth={4} strokeLinecap="round"/><Line x1={16} y1={39} x2={22} y2={52} stroke="#0f172a" strokeWidth={4} strokeLinecap="round"/></Svg>
        </View>
      ))}
      {/* Music note floating */}
      <View style={{position:'absolute',top:H*0.35,right:W*0.1}}>
        <Svg width={24} height={24}><Circle cx={8} cy={18} r={5} fill="#f472b6" opacity={0.8}/><Line x1={13} y1={3} x2={13} y2={18} stroke="#f472b6" strokeWidth={2}/><Line x1={13} y1={3} x2={22} y2={6} stroke="#f472b6" strokeWidth={2}/></Svg>
      </View>
    </View>
  );
};
