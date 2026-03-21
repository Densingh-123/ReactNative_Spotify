import React, { memo } from 'react';
import { View, StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

// Space Themes (1-8)
import {
  TwinklingStarsRenderer, GalaxySpiralRenderer, ShootingStarsRenderer,
  NebulaCloudsRenderer, FloatingPlanetsRenderer, AsteroidFieldRenderer,
  BlackHoleRenderer, ConstellationsRenderer,
} from './themes/SpaceThemes';

// Nature Themes (9-20)
import {
  OceanWavesRenderer, UnderwaterBubblesRenderer, SeaShoreRenderer,
  CoralReefRenderer, JellyfishGlowRenderer, WaterRippleRenderer,
  RainRipplesRenderer, FloatingBoatRenderer, FallingLeavesRenderer,
  CherryPetalsRenderer, MovingCloudsRenderer, FirefliesRenderer,
} from './themes/NatureThemes';

// Tech/Modern Themes (21-40) — originals
import {
  SnowfallRenderer, ButterfliesRenderer, GrassWindRenderer, SunriseSkyRenderer,
  NeonLinesRenderer, MatrixRainRenderer, RadarScanRenderer, BalloonsRenderer,
  PaperPlanesRenderer, EnergyWavesRenderer, AuroraLightsRenderer,
} from './themes/TechThemes';

// Tech/Modern Themes — v2 (improved)
import {
  GlassOrbsRenderer, ThreeDCubesRenderer, NeuralNetworkRenderer,
  CircuitGlowRenderer, DataStreamsRenderer, PaperPlanesV2Renderer,
  ParticleNetworkRenderer,
} from './themes/TechThemes2';

// Street/Travel/Vibe Themes — original
import {
  HighwaySunsetRenderer, BeachBonfireRenderer, SunsetSilhouetteRenderer,
  StreetMusicianRenderer, EmptyNightRoadRenderer, BoatRideRenderer,
  FerrisWheelRenderer, LonelyWalkRenderer, FogStreetRenderer,
  FestivalLightsRenderer, SlowTrafficRenderer, BokehLights,
} from './themes/StreetThemes';

// Street Themes v2a — full rewrites
import {
  BusWindowRainV2Renderer, TrainWindowV2Renderer, MetroRideV2Renderer,
  RailwayPlatformRenderer, TrainBridgeRenderer,
} from './themes/StreetThemes2a';

// Street Themes v2b
import {
  BikeRideFriendsRenderer, AutoRickshawBridgeRenderer, PlaneTakeoffRenderer,
  NeonTaxiStreetRenderer, TerraceFriendsRenderer,
} from './themes/StreetThemes2b';

// Street Themes v2c
import {
  RoadTripFriendsRenderer, RainWalkRenderer, DeliveryBikeRenderer,
  CityTopViewRenderer, CityTimelapseV2Renderer, WindowThinkingRenderer,
  TrainGoodbyeRenderer,
} from './themes/StreetThemes2c';

// Street Themes v2d
import {
  StreetFoodV2Renderer, RainReflectionV2Renderer, LoFiWindowV2Renderer,
  BusStopRainRenderer,
} from './themes/StreetThemes2d';


// Fallback for themes without dedicated renderer
const StarfieldFallback = ({ primaryColor = '#fff' }: { primaryColor?: string }) => {
  const stars = React.useMemo(() => Array.from({ length: 80 }).map(() => ({
    x: Math.random() * 400, y: Math.random() * 800,
    r: Math.random() * 3 + 1, op: Math.random() * 0.6 + 0.3,
  })), []);
  return (
    <View style={StyleSheet.absoluteFill}>
      {stars.map((s, i) => (
        <View key={i} style={{
          position: 'absolute', left: s.x, top: s.y,
          width: s.r * 2, height: s.r * 2, borderRadius: s.r,
          backgroundColor: primaryColor, opacity: s.op,
        }} />
      ))}
    </View>
  );
};

// Glass orbs – simple floating circles with opacity (reused for several "premium" themes)
const GlassOrbsFallback = () => (
  <View style={[StyleSheet.absoluteFill, { backgroundColor: '#0a0a0a' }]}>
    <StarfieldFallback primaryColor="#ffffff" />
  </View>
);

// Liquid gradient fallback
const LiquidGradientFallback = () => (
  <View style={StyleSheet.absoluteFill}>
    <LinearGradient colors={['#8E2DE2', '#4A00E0', '#7928CA', '#FF0080']} style={StyleSheet.absoluteFillObject} />
  </View>
);

// The main ThemeRenderer component that all screens use
const ThemeRenderer = memo(({ themeMode, colors }: { themeMode: string; colors: any }) => {
  const renderTheme = () => {
    switch (themeMode) {
      // ─ SPACE ─────────────────────────────────
      case 'twinkling_stars':    return <TwinklingStarsRenderer />;
      case 'galaxy_spiral':      return <GalaxySpiralRenderer />;
      case 'shooting_stars':     return <ShootingStarsRenderer />;
      case 'nebula_clouds':      return <NebulaCloudsRenderer />;
      case 'floating_planets':   return <FloatingPlanetsRenderer />;
      case 'asteroid_field':     return <AsteroidFieldRenderer />;
      case 'black_hole':         return <BlackHoleRenderer />;
      case 'constellations':     return <ConstellationsRenderer />;

      // ─ WATER / NATURE ─────────────────────────
      case 'ocean_waves':        return <OceanWavesRenderer />;
      case 'underwater_bubbles': return <UnderwaterBubblesRenderer />;
      case 'sea_shore':          return <SeaShoreRenderer />;
      case 'coral_reef':         return <CoralReefRenderer />;
      case 'jellyfish_glow':     return <JellyfishGlowRenderer />;
      case 'water_ripple':       return <WaterRippleRenderer />;
      case 'rain_ripples':       return <RainRipplesRenderer />;
      case 'floating_boat':      return <FloatingBoatRenderer />;
      case 'falling_leaves':     return <FallingLeavesRenderer />;
      case 'cherry_petals':      return <CherryPetalsRenderer />;
      case 'moving_clouds':      return <MovingCloudsRenderer />;
      case 'fireflies':          return <FirefliesRenderer />;

      // ─ MODERN / TECH ──────────────────────────
      case 'snowfall':           return <SnowfallRenderer />;
      case 'butterflies':        return <ButterfliesRenderer />;
      case 'grass_wind':         return <GrassWindRenderer />;
      case 'sunrise_sky':        return <SunriseSkyRenderer />;
      case 'glass_orbs':         return <GlassOrbsRenderer />;
      case 'liquid_gradient':    return <LiquidGradientFallback />;
      case 'neon_lines':         return <NeonLinesRenderer />;
      case 'particle_network':   return <ParticleNetworkRenderer />;
      case 'three_d_cubes':      return <ThreeDCubesRenderer />;
      case 'smoke_waves':        return (
        <View style={StyleSheet.absoluteFill}>
          <LinearGradient colors={['#050505', '#1e003c', '#000']} style={StyleSheet.absoluteFillObject} />
          <StarfieldFallback primaryColor="#ec4899" />
        </View>
      );
      case 'energy_waves':       return <EnergyWavesRenderer />;
      case 'aurora_lights':      return <AuroraLightsRenderer />;
      case 'matrix_rain':        return <MatrixRainRenderer />;
      case 'circuit_glow':       return <CircuitGlowRenderer />;
      case 'neural_network':     return <NeuralNetworkRenderer />;
      case 'hologram_grid':      return (
        <View style={[StyleSheet.absoluteFill, { backgroundColor: '#020617' }]}>
          <StarfieldFallback primaryColor="#0ea5e9" />
        </View>
      );
      case 'data_streams':       return <DataStreamsRenderer />;
      case 'radar_scan':         return <RadarScanRenderer />;
      case 'balloons':           return <BalloonsRenderer />;
      case 'paper_planes':       return <PaperPlanesV2Renderer />;

      // ─ STREET / TRAVEL / VIBE ─────────────────
      case 'bus_window_rain':    return <BusWindowRainV2Renderer />;
      case 'train_window':       return <TrainWindowV2Renderer />;
      case 'metro_ride':         return <MetroRideV2Renderer />;
      case 'bike_ride_pov':      return <BikeRideFriendsRenderer />;
      case 'highway_sunset':     return <HighwaySunsetRenderer />;
      case 'auto_rickshaw':      return <AutoRickshawBridgeRenderer />;
      case 'plane_takeoff':      return <PlaneTakeoffRenderer />;
      case 'neon_taxi':          return <NeonTaxiStreetRenderer />;
      case 'terrace_friends':    return <TerraceFriendsRenderer />;
      case 'road_trip_friends':  return <RoadTripFriendsRenderer />;
      case 'beach_bonfire':      return <BeachBonfireRenderer />;
      case 'college_walk':       return <FallingLeavesRenderer />;
      case 'rooftop_party':      return <TerraceFriendsRenderer />;
      case 'rain_walk':          return <RainWalkRenderer />;
      case 'sunset_silhouette':  return <SunsetSilhouetteRenderer />;
      case 'street_food':        return <StreetFoodV2Renderer />;
      case 'market_crowd':       return (
        <View style={[StyleSheet.absoluteFill, { backgroundColor: '#0f172a' }]}>
          <BokehLights colors={['#fff', '#fbbf24', '#60a5fa', '#f43f5e']} />
        </View>
      );
      case 'city_timelapse':     return <CityTimelapseV2Renderer />;
      case 'rain_reflection':    return <RainReflectionV2Renderer />;
      case 'zebra_crossing':     return (
        <View style={[StyleSheet.absoluteFill, { backgroundColor: '#0a0a0a' }]}>
          <StarfieldFallback primaryColor="#ffffff" />
        </View>
      );
      case 'street_musician':    return <StreetMusicianRenderer />;
      case 'empty_night_road':   return <EmptyNightRoadRenderer />;
      case 'delivery_ride':      return <DeliveryBikeRenderer />;
      case 'street_dogs':        return (
        <View style={[StyleSheet.absoluteFill, { backgroundColor: '#1c1917' }]}>
          <BokehLights colors={['#fde68a', '#d97706']} />
        </View>
      );
      case 'window_thinking':    return <WindowThinkingRenderer />;
      case 'train_goodbye':      return <TrainGoodbyeRenderer />;
      case 'lonely_walk':        return <LonelyWalkRenderer />;
      case 'city_top_view':      return <CityTopViewRenderer />;
      case 'bus_stop_rain':      return <BusStopRainRenderer />;
      case 'sunrise_city':       return <SunriseSkyRenderer />;
      case 'train_bridge':       return <TrainBridgeRenderer />;
      case 'subway_rush':        return <RailwayPlatformRenderer />;
      case 'truck_night':        return <EmptyNightRoadRenderer />;
      case 'boat_ride':          return <BoatRideRenderer />;
      case 'lofi_window':        return <LoFiWindowV2Renderer />;
      case 'neon_alley':         return <NeonTaxiStreetRenderer />;
      case 'fog_street':         return <FogStreetRenderer />;
      case 'festival_lights':    return <FestivalLightsRenderer />;
      case 'ferris_wheel':       return <FerrisWheelRenderer />;
      case 'slow_traffic':       return <SlowTrafficRenderer />;

      default:                   return null;
    }
  };

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {renderTheme()}
    </View>
  );
});

export { ThemeRenderer };
export default ThemeRenderer;

