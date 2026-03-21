import React, { useMemo, useRef, useEffect } from 'react';
import { View, StyleSheet, Animated, Dimensions, Text } from 'react-native';
import Svg, { Circle, Path, Line, Rect, Ellipse, G } from 'react-native-svg';
import LinearGradient from 'react-native-linear-gradient';

const { width: W, height: H } = Dimensions.get('window');

// ─── ROAD TRIP FRIENDS (desert/snow/forest cycling) ──────────────────────────
const TripScene = ({ scene, opacity }: any) => {
  if (scene === 'desert') return (
    <View style={StyleSheet.absoluteFill}>
      <LinearGradient colors={['#fbbf24','#f97316','#d97706']} style={StyleSheet.absoluteFillObject}/>
      {[H*0.55,H*0.6,H*0.65].map((y,i)=>(
        <View key={i} style={{position:'absolute',top:y,left:0,right:0,height:14,backgroundColor:'#b45309',opacity:0.4+i*0.1,borderRadius:7}}/>
      ))}
      <LinearGradient colors={['transparent','#92400e']} start={{x:0,y:0.5}} end={{x:0,y:1}} style={StyleSheet.absoluteFillObject}/>
    </View>
  );
  if (scene === 'snow') return (
    <View style={StyleSheet.absoluteFill}>
      <LinearGradient colors={['#dbeafe','#bfdbfe','#e0e7ff']} style={StyleSheet.absoluteFillObject}/>
      {Array.from({length:30}).map((_,i)=><View key={i} style={{position:'absolute',left:Math.random()*W,top:Math.random()*H,width:5,height:5,borderRadius:3,backgroundColor:'#fff',opacity:0.7}}/>)}
      <LinearGradient colors={['transparent','#f8fafc']} start={{x:0,y:0.6}} end={{x:0,y:1}} style={StyleSheet.absoluteFillObject}/>
    </View>
  );
  return (
    <View style={StyleSheet.absoluteFill}>
      <LinearGradient colors={['#064e3b','#065f46','#022c22']} style={StyleSheet.absoluteFillObject}/>
      {[0.1,0.2,0.35,0.55,0.65,0.82].map((x,i)=>(
        <View key={i} style={{position:'absolute',left:W*x,bottom:0,width:30,height:H*0.3+i*20,backgroundColor:'#052e16',borderRadius:15}}/>
      ))}
    </View>
  );
};

const TripPerson = () => (
  <Svg width={48} height={100}>
    {/* Backpack */}
    <Rect x={22} y={18} width={22} height={28} rx={5} fill="#6366f1"/>
    <Rect x={24} y={16} width={18} height={8} rx={4} fill="#4f46e5"/>
    {/* Body */}
    <Circle cx={18} cy={10} r={9} fill="#fbbf24"/>
    <Rect x={8} y={19} width={20} height={30} rx={6} fill="#1e293b"/>
    {/* Legs walking */}
    <Line x1={18} y1={49} x2={10} y2={72} stroke="#1e293b" strokeWidth={5} strokeLinecap="round"/>
    <Line x1={18} y1={49} x2={26} y2={72} stroke="#1e293b" strokeWidth={5} strokeLinecap="round"/>
    <Line x1={18} y1={28} x2={8}  y2={42} stroke="#1e293b" strokeWidth={4} strokeLinecap="round"/>
    <Line x1={18} y1={28} x2={30} y2={36} stroke="#1e293b" strokeWidth={4} strokeLinecap="round"/>
    {/* Hiking stick */}
    <Line x1={8} y1={42} x2={2} y2={72} stroke="#92400e" strokeWidth={2.5} strokeLinecap="round"/>
  </Svg>
);

export const RoadTripFriendsRenderer = () => {
  const sceneAnim = useRef(new Animated.Value(0)).current;
  const [sceneIdx, setSceneIdx] = React.useState(0);
  const scenes = ['desert','snow','forest'];

  useEffect(() => {
    const cycle = () => {
      setSceneIdx(i => (i+1) % 3);
      Animated.sequence([
        Animated.timing(sceneAnim,{toValue:1,duration:1500,useNativeDriver:true}),
        Animated.timing(sceneAnim,{toValue:0,duration:1500,useNativeDriver:true}),
      ]).start(cycle);
    };
    setTimeout(cycle, 4000);
  }, []);

  const personWalk = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(Animated.sequence([
      Animated.timing(personWalk,{toValue:W*0.8,duration:5000,useNativeDriver:true}),
      Animated.timing(personWalk,{toValue:0,duration:0,useNativeDriver:true}),
    ])).start();
  }, []);

  return (
    <View style={[StyleSheet.absoluteFill,{width:W,height:H}]}>
      <TripScene scene={scenes[sceneIdx]} opacity={1}/>
      {/* Road */}
      <View style={{position:'absolute',bottom:H*0.05,left:0,right:0,height:H*0.12,backgroundColor:'rgba(0,0,0,0.25)',borderRadius:4}}/>
      <Animated.View style={{position:'absolute',bottom:H*0.09,left:W*0.05,transform:[{translateX:personWalk}]}}>
        <TripPerson/>
      </Animated.View>
    </View>
  );
};

// ─── RAIN WALK (man with umbrella) ────────────────────────────────────────────
const UmbrellaWalker = () => {
  const tx = useRef(new Animated.Value(-60)).current;
  const bob = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(Animated.timing(tx,{toValue:W+60,duration:8000,useNativeDriver:true})).start();
    Animated.loop(Animated.sequence([Animated.timing(bob,{toValue:-4,duration:400,useNativeDriver:true}),Animated.timing(bob,{toValue:3,duration:400,useNativeDriver:true})])).start();
  }, []);
  return (
    <Animated.View style={{position:'absolute',bottom:H*0.14,transform:[{translateX:tx},{translateY:bob}]}}>
      <Svg width={70} height={100}>
        {/* Umbrella */}
        <Path d="M10 28 Q35 0 60 28 Z" fill="#6366f1"/>
        <Path d="M10 28 Q35 0 60 28" fill="none" stroke="#4f46e5" strokeWidth={2}/>
        <Line x1={35} y1={28} x2={35} y2={55} stroke="#6366f1" strokeWidth={2.5}/>
        <Path d="M35 55 Q38 65 35 70" fill="none" stroke="#6366f1" strokeWidth={2.5}/>
        {/* Person */}
        <Circle cx={35} cy={62} r={8} fill="#1e293b"/>
        <Rect x={27} y={70} width={16} height={24} rx={5} fill="#0f172a"/>
        <Line x1={35} y1={94} x2={28} y2={100} stroke="#1e293b" strokeWidth={4} strokeLinecap="round"/>
        <Line x1={35} y1={94} x2={42} y2={100} stroke="#1e293b" strokeWidth={4} strokeLinecap="round"/>
      </Svg>
    </Animated.View>
  );
};

const HeavyRainDrop = ({ x, speed, delay }: any) => {
  const ty = useRef(new Animated.Value(-30)).current;
  useEffect(() => {
    const run = () => { ty.setValue(-30); Animated.sequence([Animated.delay(delay), Animated.timing(ty,{toValue:H+30,duration:speed,useNativeDriver:true})]).start(run); };
    run();
  }, []);
  return <Animated.View style={{position:'absolute',left:x,top:0,width:1.5,height:22,backgroundColor:'rgba(148,163,184,0.6)',borderRadius:1,transform:[{translateY:ty},{rotate:'6deg'}]}}/>;
};

export const RainWalkRenderer = () => {
  const drops = useMemo(() => Array.from({length:100}).map((_,i)=>({x:Math.random()*W,speed:Math.random()*600+700,delay:i*60})),[]);
  return (
    <View style={[StyleSheet.absoluteFill,{width:W,height:H}]}>
      <LinearGradient colors={['#1e293b','#334155','#475569']} style={StyleSheet.absoluteFillObject}/>
      {/* Wet road */}
      <LinearGradient colors={['transparent','#1e3a5f']} start={{x:0,y:0.5}} end={{x:0,y:1}} style={StyleSheet.absoluteFillObject}/>
      {/* Road reflections */}
      {Array.from({length:8}).map((_,i)=>(
        <View key={i} style={{position:'absolute',bottom:Math.random()*H*0.12,left:Math.random()*W,width:Math.random()*40+20,height:4,backgroundColor:['#ef444444','#fbbf2444','#38bdf844'][i%3],borderRadius:2}}/>
      ))}
      {drops.map((d,i)=><HeavyRainDrop key={i} {...d}/>)}
      <UmbrellaWalker/>
      {/* Puddle ripples */}
      {[W*0.25,W*0.6,W*0.85].map((x,i)=>(
        <View key={i} style={{position:'absolute',bottom:H*0.13,left:x-15,width:30,height:10,borderRadius:15,borderWidth:1,borderColor:'rgba(148,163,184,0.3)'}}/>
      ))}
    </View>
  );
};

// ─── DELIVERY BIKE (night road) ───────────────────────────────────────────────
export const DeliveryBikeRenderer = () => {
  const bx = useRef(new Animated.Value(-120)).current;
  const bob = useRef(new Animated.Value(0)).current;
  const roadAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(Animated.timing(bx,{toValue:W+120,duration:5000,useNativeDriver:true})).start();
    Animated.loop(Animated.sequence([Animated.timing(bob,{toValue:-5,duration:300,useNativeDriver:true}),Animated.timing(bob,{toValue:4,duration:300,useNativeDriver:true})])).start();
    Animated.loop(Animated.timing(roadAnim,{toValue:1,duration:500,useNativeDriver:true})).start();
  }, []);

  const dashTx = roadAnim.interpolate({inputRange:[0,1],outputRange:[0,-W/7]});
  const lampPositions = [W*0.1,W*0.33,W*0.56,W*0.79];

  return (
    <View style={[StyleSheet.absoluteFill,{width:W,height:H}]}>
      <LinearGradient colors={['#020617','#0f172a','#1e293b']} style={StyleSheet.absoluteFillObject}/>
      {/* Stars */}
      {Array.from({length:40}).map((_,i)=><View key={i} style={{position:'absolute',left:Math.random()*W,top:Math.random()*H*0.5,width:2,height:2,borderRadius:1,backgroundColor:'#fff',opacity:Math.random()*0.5+0.1}}/>)}
      {/* Street lamps */}
      {lampPositions.map((x,i)=>(
        <View key={i}>
          <View style={{position:'absolute',left:x,top:H*0.06,width:6,height:H*0.38,backgroundColor:'#374151',borderRadius:3}}/>
          <View style={{position:'absolute',left:x-24,top:H*0.04,width:32,height:6,backgroundColor:'#374151',borderRadius:3}}/>
          <View style={{position:'absolute',left:x-19,top:H*0.02,width:10,height:10,borderRadius:5,backgroundColor:'#fde68a',shadowColor:'#fde68a',shadowOpacity:1,shadowRadius:12}}/>
          <View style={{position:'absolute',left:x-50,top:H*0,width:80,height:80,borderRadius:40,backgroundColor:'#fde68a',opacity:0.06}}/>
        </View>
      ))}
      {/* Road */}
      <LinearGradient colors={['#1e293b','#334155']} start={{x:0,y:0}} end={{x:0,y:1}} style={{position:'absolute',bottom:0,left:0,right:0,height:H*0.2}}/>
      <Animated.View style={{position:'absolute',bottom:H*0.11,left:0,right:0,flexDirection:'row',transform:[{translateX:dashTx}]}}>
        {Array.from({length:14}).map((_,i)=><View key={i} style={{width:W/9,height:4,backgroundColor:'#fbbf24',opacity:0.5,marginRight:W/9,borderRadius:2}}/>)}
      </Animated.View>
      {/* Delivery box signboard */}
      <Animated.View style={{position:'absolute',bottom:H*0.19,left:0,transform:[{translateX:bx},{translateY:bob}]}}>
        <Svg width={100} height={85}>
          {/* Delivery box */}
          <Rect x={45} y={18} width={30} height={22} rx={4} fill="#22c55e"/>
          <Rect x={47} y={16} width={26} height={6} rx={2} fill="#16a34a"/>
          <Rect x={55} y={18} width={4} height={22} fill="#15803d"/>
          {/* Bike */}
          <Circle cx={18} cy={68} r={14} fill="none" stroke="#94a3b8" strokeWidth={3}/>
          <Circle cx={72} cy={68} r={14} fill="none" stroke="#94a3b8" strokeWidth={3}/>
          <Path d="M18 68 L42 36 L72 68" fill="none" stroke="#64748b" strokeWidth={3}/>
          <Path d="M42 36 L62 30" fill="none" stroke="#64748b" strokeWidth={2.5}/>
          <Rect x={62} y={26} width={18} height={8} rx={4} fill="#94a3b8"/>
          {/* Rider */}
          <Circle cx={42} cy={22} r={10} fill="#1e293b"/>
          <Rect x={33} y={32} width={18} height={20} rx={5} fill="#0f172a"/>
          {/* Headlight */}
          <Ellipse cx={84} cy={70} rx={5} ry={4} fill="#fde68a" opacity={0.9}/>
          {/* Headlight beam */}
          <Path d="M89 70 L100 60 L100 80 Z" fill="#fde68a" opacity={0.12}/>
        </Svg>
      </Animated.View>
    </View>
  );
};

// ─── CITY TOP VIEW (aerial city grid) ────────────────────────────────────────
const TopViewCar = ({ startX, startY, dir }: any) => {
  const t = useRef(new Animated.Value(dir==='h' ? startX : startY)).current;
  useEffect(() => {
    const run = () => {
      if (dir==='h') { t.setValue(-20); Animated.timing(t,{toValue:W+20,duration:3000+Math.random()*2000,useNativeDriver:true}).start(run); }
      else { t.setValue(-20); Animated.timing(t,{toValue:H+20,duration:4000+Math.random()*2000,useNativeDriver:true}).start(run); }
    };
    setTimeout(run, Math.random()*3000);
  }, []);
  const style: any = {position:'absolute', width:8, height:14, borderRadius:3, backgroundColor:'#ef4444'};
  if (dir==='h') { style.top=startY-4; style.transform=[{translateX:t}]; }
  else { style.left=startX-4; style.width=14; style.height=8; style.transform=[{translateY:t}]; }
  return <Animated.View style={style}/>;
};

export const CityTopViewRenderer = () => {
  const buildingGrid = useMemo(() => {
    const blocks = [];
    for (let row = 0; row < 5; row++) {
      for (let col = 0; col < 4; col++) {
        const bw = W*0.18 + Math.random()*W*0.04;
        const bh = H*0.08 + Math.random()*H*0.12;
        blocks.push({ x: col*(W*0.25)+W*0.03, y: row*(H*0.18)+H*0.02, w: bw, h: bh,
          shade: Math.random(), lit: Math.random() > 0.5 });
      }
    }
    return blocks;
  }, []);

  const cars = useMemo(() => [
    {startX:-20,startY:H*0.18,dir:'h'},{startX:-20,startY:H*0.36,dir:'h'},
    {startX:-20,startY:H*0.54,dir:'h'},{startX:-20,startY:H*0.72,dir:'h'},
    {startX:W*0.25,startY:-20,dir:'v'},{startX:W*0.5,startY:-20,dir:'v'},{startX:W*0.75,startY:-20,dir:'v'},
  ],[]);

  return (
    <View style={[StyleSheet.absoluteFill,{width:W,height:H}]}>
      <View style={{flex:1,backgroundColor:'#1e293b'}}/>
      {/* Road grid */}
      {[0.18,0.36,0.54,0.72,0.9].map((y,i)=><View key={`ry${i}`} style={{position:'absolute',top:H*y-3,left:0,right:0,height:H*0.045,backgroundColor:'#334155'}}/>)}
      {[0.25,0.5,0.75].map((x,i)=><View key={`rx${i}`} style={{position:'absolute',left:W*x-3,top:0,bottom:0,width:W*0.045,backgroundColor:'#334155'}}/>)}
      {/* Buildings */}
      {buildingGrid.map((b,i)=>(
        <View key={i} style={{position:'absolute',left:b.x,top:b.y,width:b.w,height:b.h,backgroundColor:b.shade>0.5?'#0f172a':'#1e293b',borderRadius:3}}>
          {b.lit && <View style={{position:'absolute',right:4,top:4,width:b.w*0.3,height:b.h*0.3,backgroundColor:'#fbbf24',opacity:0.4,borderRadius:2}}/>}
          {/* Shadow */}
          <View style={{position:'absolute',right:-12,bottom:0,width:12,height:b.h,backgroundColor:'rgba(0,0,0,0.4)'}}/>
          <View style={{position:'absolute',bottom:-8,left:0,width:b.w,height:8,backgroundColor:'rgba(0,0,0,0.3)'}}/>
        </View>
      ))}
      {cars.map((c,i)=><TopViewCar key={i} {...c}/>)}
    </View>
  );
};

// ─── CITY TIMELAPSE (village → city growth) ───────────────────────────────────
const STAGE_COLORS = ['#14532d','#ca8a04','#475569','#1e293b'];
const STAGE_LABELS = ['Village','Town','City','Megacity'];

export const CityTimelapseV2Renderer = () => {
  const stageAnim = useRef(new Animated.Value(0)).current;
  const [stage, setStage] = React.useState(0);
  const labelOp = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const cycle = () => {
      Animated.sequence([
        Animated.timing(labelOp,{toValue:0,duration:600,useNativeDriver:true}),
        Animated.timing(stageAnim,{toValue:(stage+1)%4,duration:2000,useNativeDriver:false}),
        Animated.delay(500),
        Animated.timing(labelOp,{toValue:1,duration:600,useNativeDriver:true}),
        Animated.delay(2500),
      ]).start(() => setStage(s => (s+1)%4));
    };
    const timer = setTimeout(cycle, 3000);
    return () => clearTimeout(timer);
  }, [stage]);

  // Building heights grow per stage
  const buildingHeights = useMemo(() => {
    const base = [20,30,18,25,22,35,28,16,38,24,20];
    return base.map(h => [h, h*2.5, h*5, h*10][stage]);
  }, [stage]);

  return (
    <View style={[StyleSheet.absoluteFill,{width:W,height:H}]}>
      <LinearGradient colors={[STAGE_COLORS[stage]+'aa', '#0f172a']} style={StyleSheet.absoluteFillObject}/>
      {/* Ground */}
      <View style={{position:'absolute',bottom:0,left:0,right:0,height:H*0.15,backgroundColor:STAGE_COLORS[stage]+'44'}}/>
      {/* Buildings growing */}
      {buildingHeights.map((bh,i)=>(
        <View key={i} style={{
          position:'absolute',
          left:i*(W/11)+4,
          bottom:H*0.15,
          width:W/12,
          height:Math.min(bh, H*0.75),
          backgroundColor:stage<2?'#f59e0b44':'#334155',
          borderTopLeftRadius:stage<2?0:2,borderTopRightRadius:stage<2?0:2,
          borderWidth:1,borderColor:'rgba(255,255,255,0.05)',
        }}>
          {stage>1 && Array.from({length:3}).map((_,r)=><View key={r} style={{position:'absolute',top:r*H*0.04+4,left:3,width:W/14-8,height:5,backgroundColor:'#fbbf2455',borderRadius:1}}/>)}
        </View>
      ))}
      {/* Stage label */}
      <Animated.View style={{position:'absolute',top:H*0.08,left:0,right:0,alignItems:'center',opacity:labelOp}}>
        <View style={{backgroundColor:'rgba(0,0,0,0.5)',paddingHorizontal:20,paddingVertical:8,borderRadius:20}}>
          <Text style={{color:'#f8fafc',fontSize:22,fontWeight:'800',fontFamily:'monospace'}}>{STAGE_LABELS[stage]}</Text>
        </View>
      </Animated.View>
      {/* Year counter */}
      <View style={{position:'absolute',bottom:H*0.18,left:W*0.35}}>
        <Text style={{color:'rgba(255,255,255,0.4)',fontSize:32,fontWeight:'900',fontFamily:'monospace'}}>{1960+stage*20}</Text>
      </View>
    </View>
  );
};

// ─── WINDOW THINKING (night sky + person at window) ────────────────────────────
export const WindowThinkingRenderer = () => {
  const thoughtScale = useRef(new Animated.Value(1)).current;
  const starTwinkle = useRef(Array.from({length:30}).map(()=>new Animated.Value(Math.random()))).current;
  useEffect(() => {
    Animated.loop(Animated.sequence([Animated.timing(thoughtScale,{toValue:1.05,duration:3000,useNativeDriver:true}),Animated.timing(thoughtScale,{toValue:0.95,duration:3000,useNativeDriver:true})])).start();
    starTwinkle.forEach(t=>Animated.loop(Animated.sequence([Animated.timing(t,{toValue:1,duration:Math.random()*2000+1000,useNativeDriver:true}),Animated.timing(t,{toValue:0.2,duration:Math.random()*2000+1000,useNativeDriver:true})])).start());
  }, []);
  const bgStars = useMemo(()=>Array.from({length:30}).map(()=>({x:Math.random()*W,y:Math.random()*H*0.7,r:Math.random()*2+0.8})),[]);
  return (
    <View style={[StyleSheet.absoluteFill,{width:W,height:H}]}>
      <LinearGradient colors={['#020617','#0f172a','#1e1b4b']} style={StyleSheet.absoluteFillObject}/>
      {/* Stars */}
      {bgStars.map((s,i)=><Animated.View key={i} style={{position:'absolute',left:s.x,top:s.y,width:s.r*2,height:s.r*2,borderRadius:s.r,backgroundColor:'#fff',opacity:starTwinkle[i%30]}}/>)}
      {/* Moon */}
      <View style={{position:'absolute',top:H*0.08,right:W*0.15,width:55,height:55,borderRadius:30,backgroundColor:'#fbbf24',opacity:0.8}}/>
      <View style={{position:'absolute',top:H*0.06,right:W*0.08,width:45,height:45,borderRadius:25,backgroundColor:'#0f172a'}}/>
      {/* Small house silhouette */}
      <View style={{position:'absolute',bottom:H*0.17,left:W*0.12}}>
        <Svg width={80} height={80}><Path d="M40 5 L75 35 L65 35 L65 75 L15 75 L15 35 L5 35 Z" fill="#0f172a"/><Rect x={28} y={48} width={18} height={27} rx={2} fill="#0a0f1a"/><Rect x={18} y={38} width={14} height={16} rx={2} fill="#0a0f1a"/><Rect x={48} y={38} width={14} height={16} rx={2} fill="#fbbf2444"/></Svg>
      </View>
      {/* Person at window */}
      <View style={{position:'absolute',bottom:0,right:W*0.06}}>
        <Svg width={80} height={H*0.45}>
          {/* Window frame */}
          <Rect x={5} y={5} width={70} height={H*0.35} rx={4} fill="#1c1716" stroke="#292524" strokeWidth={4}/>
          <Line x1={40} y1={5} x2={40} y2={H*0.35+5} stroke="#292524" strokeWidth={3}/>
          <Line x1={5} y1={H*0.17} x2={75} y2={H*0.17} stroke="#292524" strokeWidth={3}/>
          {/* Person silhouette through glass */}
          <Circle cx={40} cy={H*0.1} r={14} fill="#0f172a"/>
          <Rect x={25} y={H*0.17} width={30} height={H*0.15} rx={8} fill="#0f172a"/>
          {/* Thought bubble */}
          <Circle cx={58} cy={H*0.05} r={4} fill="#a5b4fc" opacity={0.5}/>
          <Circle cx={65} cy={H*0.025} r={6} fill="#a5b4fc" opacity={0.4}/>
          <Circle cx={70} cy={H*0.01} r={8} fill="#a5b4fc" opacity={0.3}/>
        </Svg>
      </View>
      {/* Window border */}
      <View style={{position:'absolute',left:0,top:0,right:0,bottom:0,borderWidth:24,borderColor:'#0c0a09',pointerEvents:'none'}}/>
    </View>
  );
};

// ─── TRAIN GOODBYE (village countryside) ─────────────────────────────────────
const GoodbyeTrain = () => {
  const tx = useRef(new Animated.Value(0)).current;
  useEffect(() => { Animated.loop(Animated.timing(tx,{toValue:W+350,duration:6000,useNativeDriver:true})).start(); }, []);
  return (
    <Animated.View style={{position:'absolute',bottom:H*0.38,transform:[{translateX:tx}]}}>
      <Svg width={350} height={65}>
        <Rect x={0} y={5} width={350} height={50} rx={5} fill="#475569"/>
        <Rect x={0} y={3} width={350} height={14} rx={3} fill="#1e40af" opacity={0.7}/>
        {[20,70,130,190,250,300].map((x,i)=><Rect key={i} x={x} y={11} width={30} height={22} rx={3} fill="#bfdbfe" opacity={0.75}/>)}
        <Rect x={0}   y={52} width={30} height={14} rx={3} fill="#374151"/>
        <Rect x={320} y={52} width={30} height={14} rx={3} fill="#374151"/>
      </Svg>
    </Animated.View>
  );
};

const CountrysideElement = ({ type, x, y }: any) => {
  const scroll = useRef(new Animated.Value(x)).current;
  useEffect(() => { Animated.loop(Animated.sequence([Animated.timing(scroll,{toValue:-200,duration:type==='tree'?4000:5000,useNativeDriver:true}),Animated.timing(scroll,{toValue:W+100,duration:0,useNativeDriver:true})])).start(); }, []);
  const renderEl = () => {
    if (type==='tree') return <Svg width={35} height={70}><Rect x={13} y={40} width={9} height={30} fill="#78350f"/><Circle cx={18} cy={25} r={22} fill="#15803d"/><Circle cx={10} cy={35} r={14} fill="#166534"/></Svg>;
    if (type==='pond') return <Svg width={90} height={25}><Ellipse cx={45} cy={14} rx={44} ry={12} fill="#0ea5e9" opacity={0.6}/><Ellipse cx={45} cy={10} rx={28} ry={6} fill="#38bdf8" opacity={0.4}/></Svg>;
    return <Svg width={65} height={75}><Path d="M32 5 L60 35 L50 35 L50 70 L14 70 L14 35 L4 35 Z" fill="#d97706"/><Rect x={20} y={48} width={16} height={22} rx={2} fill="#92400e"/><Rect x={36} y={35} width={10} height={14} rx={2} fill="#fde68a" opacity={0.6}/></Svg>;
  };
  return <Animated.View style={{position:'absolute',bottom:y,transform:[{translateX:scroll}]}}>{renderEl()}</Animated.View>;
};

export const TrainGoodbyeRenderer = () => {
  const elements = useMemo(() => [
    {type:'tree',x:0,y:H*0.35},{type:'tree',x:W*0.18,y:H*0.37},{type:'pond',x:W*0.35,y:H*0.33},
    {type:'house',x:W*0.52,y:H*0.36},{type:'tree',x:W*0.7,y:H*0.35},{type:'tree',x:W*0.85,y:H*0.38},
  ],[]);
  return (
    <View style={[StyleSheet.absoluteFill,{width:W,height:H}]}>
      <LinearGradient colors={['#bfdbfe','#93c5fd','#60a5fa']} style={StyleSheet.absoluteFillObject}/>
      <LinearGradient colors={['transparent','#166534']} start={{x:0,y:0.55}} end={{x:0,y:1}} style={StyleSheet.absoluteFillObject}/>
      {/* Track */}
      <View style={{position:'absolute',bottom:H*0.38,left:0,right:0,height:8,backgroundColor:'#374151'}}/>
      {Array.from({length:18}).map((_,i)=><View key={i} style={{position:'absolute',bottom:H*0.37,left:i*(W/18),width:10,height:H*0.04,backgroundColor:'#292524',borderRadius:2}}/>)}
      {/* Mountains/hills */}
      <Svg width={W} height={H*0.45} style={{position:'absolute',top:0}}>
        <Path d={`M0 ${H*0.45} Q${W*0.15} ${H*0.1} ${W*0.3} ${H*0.3} Q${W*0.45} ${H*0.08} ${W*0.6} ${H*0.28} Q${W*0.78} ${H*0.05} ${W} ${H*0.25} L${W} ${H*0.45} Z`} fill="#1a4731" opacity={0.4}/>
      </Svg>
      {elements.map((e,i)=><CountrysideElement key={i} {...e}/>)}
      <GoodbyeTrain/>
    </View>
  );
};
