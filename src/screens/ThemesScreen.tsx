import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme, ThemeMode, themes } from '../context/ThemeContext';
import LinearGradient from 'react-native-linear-gradient';

const THEME_GROUPS = [
  { title: ' Dark Themes', keys: ['black','midnight','amoled','galaxy','ocean','forest','sunset','volcano','neon','cyberpunk','deep_blue','deep_purple','deep_red','deep_teal','deep_orange', 'matrix','dracula','nord_dark','synthwave','obsidian','charcoal','espresso','blood_moon','toxic', 'electric','royal_dark','emerald_dark','ruby','sapphire','twilight'] },
  { title: ' Light Themes', keys: ['white','snow','sky','mint','rose','lemon','peach','lavender','sakura','nord_light'] },
  { title: ' Animated: Space', keys: ['twinkling_stars', 'galaxy_spiral', 'shooting_stars', 'nebula_clouds', 'floating_planets', 'asteroid_field', 'black_hole', 'constellations'] },
  { title: ' Animated: Nature', keys: ['ocean_waves', 'underwater_bubbles', 'sea_shore', 'coral_reef', 'jellyfish_glow', 'water_ripple', 'rain_ripples', 'floating_boat', 'falling_leaves', 'cherry_petals', 'moving_clouds', 'fireflies', 'snowfall', 'butterflies', 'grass_wind', 'sunrise_sky'] },
  { title: ' Animated: Abstract', keys: ['glass_orbs', 'liquid_gradient', 'neon_lines', 'particle_network', 'three_d_cubes', 'smoke_waves', 'energy_waves', 'aurora_lights'] },
  { title: ' Animated: Tech', keys: ['matrix_rain', 'circuit_glow', 'neural_network', 'hologram_grid', 'data_streams', 'radar_scan'] },
  { title: ' Animated: Creative', keys: ['balloons', 'paper_planes'] },
  { title: ' Animated: Travel', keys: ['bus_window_rain', 'train_window', 'metro_ride', 'bike_ride_pov', 'highway_sunset', 'auto_rickshaw', 'plane_takeoff', 'neon_taxi'] },
  { title: ' Animated: Life', keys: ['terrace_friends', 'road_trip_friends', 'beach_bonfire', 'college_walk', 'rooftop_party', 'rain_walk', 'sunset_silhouette', 'street_food', 'market_crowd', 'rain_reflection', 'zebra_crossing', 'street_musician', 'empty_night_road', 'delivery_ride', 'street_dogs', 'city_timelapse'] },
  { title: ' Animated: Mood', keys: ['window_thinking', 'train_goodbye', 'lonely_walk', 'city_top_view', 'bus_stop_rain', 'sunrise_city', 'train_bridge', 'subway_rush', 'truck_night', 'boat_ride', 'lofi_window', 'neon_alley', 'fog_street', 'festival_lights', 'ferris_wheel', 'slow_traffic'] },
];

const DISPLAY_NAMES: Record<string, string> = {
  black:'Pitch Black', midnight:'Midnight', amoled:'AMOLED', galaxy:'Galaxy', ocean:'Deep Ocean',
  forest:'Forest', sunset:'Sunset', volcano:'Volcano', neon:'Neon', cyberpunk:'Cyberpunk',
  deep_blue:'Deep Blue', deep_purple:'Deep Purple', deep_red:'Deep Red', deep_teal:'Deep Teal',
  deep_orange:'Deep Orange', matrix:'Matrix', dracula:'Dracula', nord_dark:'Nord Dark',
  synthwave:'Synthwave', obsidian:'Obsidian', charcoal:'Charcoal', espresso:'Espresso',
  blood_moon:'Blood Moon', toxic:'Toxic', electric:'Electric', royal_dark:'Royal Dark',
  emerald_dark:'Emerald Dark', ruby:'Ruby', sapphire:'Sapphire', twilight:'Twilight',
  white:'Pure White', snow:'Snow', sky:'Sky Blue', mint:'Mint', rose:'Rose',
  lemon:'Lemon', peach:'Peach', lavender:'Lavender', sakura:'Sakura', nord_light:'Nord Light',
  twinkling_stars: 'Twinkling Stars', galaxy_spiral: 'Galaxy Spiral', shooting_stars: 'Shooting Stars', nebula_clouds: 'Nebula Clouds', floating_planets: 'Floating Planets', asteroid_field: 'Asteroid Field', black_hole: 'Black Hole', constellations: 'Constellations',
  ocean_waves: 'Ocean Waves', underwater_bubbles: 'Bubbles', sea_shore: 'Sea Shore', coral_reef: 'Coral Reef', jellyfish_glow: 'Jellyfish Glow', water_ripple: 'Water Ripple', rain_ripples: 'Rain Ripples', floating_boat: 'Floating Boat',
  falling_leaves: 'Falling Leaves', cherry_petals: 'Cherry Petals', moving_clouds: 'Moving Clouds', fireflies: 'Fireflies', snowfall: 'Snowfall', butterflies: 'Butterflies', grass_wind: 'Grass in Wind', sunrise_sky: 'Sunrise Sky',
  glass_orbs: 'Glass Orbs', liquid_gradient: 'Liquid Gradient', neon_lines: 'Neon Lines', particle_network: 'Particle Network', three_d_cubes: '3D Cubes', smoke_waves: 'Smoke Waves', energy_waves: 'Energy Waves', aurora_lights: 'Aurora Lights',
  matrix_rain: 'Matrix Rain', circuit_glow: 'Circuit Glow', neural_network: 'Neural Network', hologram_grid: 'Hologram Grid', data_streams: 'Data Streams', radar_scan: 'Radar Scan',
  balloons: 'Balloons', paper_planes: 'Paper Planes',
  bus_window_rain: 'Bus Window Rain', train_window: 'Train Window', metro_ride: 'Metro Ride', bike_ride_pov: 'Bike Ride POV', highway_sunset: 'Highway Sunset', auto_rickshaw: 'Auto Rickshaw', plane_takeoff: 'Plane Takeoff', neon_taxi: 'Neon Taxi',
  terrace_friends: 'Terrace Friends', road_trip_friends: 'Road Trip', beach_bonfire: 'Beach Bonfire', college_walk: 'College Walk', rooftop_party: 'Rooftop Party', rain_walk: 'Rain Walk', sunset_silhouette: 'Sunset Silhouette', street_food: 'Street Food',
  market_crowd: 'Market Crowd', city_timelapse: 'City Timelapse', rain_reflection: 'Rain Reflection', zebra_crossing: 'Zebra Crossing', street_musician: 'Street Musician', empty_night_road: 'Empty Night Road', delivery_ride: 'Delivery Ride', street_dogs: 'Street Dogs',
  window_thinking: 'Window Thinking', train_goodbye: 'Train Goodbye', lonely_walk: 'Lonely Walk', city_top_view: 'City Top View', bus_stop_rain: 'Bus Stop Rain', sunrise_city: 'Sunrise City', train_bridge: 'Train Bridge', subway_rush: 'Subway Rush',
  truck_night: 'Truck Night', boat_ride: 'Boat Ride', lofi_window: 'Lo-Fi Window', neon_alley: 'Neon Alley', fog_street: 'Foggy Street', festival_lights: 'Festival Lights', ferris_wheel: 'Ferris Wheel', slow_traffic: 'Slow Traffic'
};

export default function ThemesScreen() {
  const navigation = useNavigation<any>();
  const { colors, currentMode, setThemeMode } = useTheme();

  return (
    <View style={styles.container}>
      <View style={[styles.header, { borderBottomColor: 'rgba(255,255,255,0.05)' }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Icon name="chevron-back" size={26} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Themes</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Active Theme */}
        <View style={[styles.activeCard, { backgroundColor: colors.surface, borderColor: colors.primary }]}>
          <View style={[styles.activeColorBox, { backgroundColor: themes[currentMode].primary }]} />
          <View style={styles.activeInfo}>
            <Text style={[styles.activeLabel, { color: colors.primary }]}>ACTIVE THEME</Text>
            <Text style={[styles.activeName, { color: colors.text }]}>{DISPLAY_NAMES[currentMode] || currentMode}</Text>
          </View>
        </View>

        {THEME_GROUPS.map(group => (
          <View key={group.title} style={styles.groupContainer}>
            <Text style={[styles.groupTitle, { color: colors.text }]}>{group.title}</Text>
            <View style={styles.grid}>
              {group.keys.map(key => {
                const t = themes[key as ThemeMode];
                const isSelected = key === currentMode;
                return (
                  <TouchableOpacity
                    key={key}
                    activeOpacity={0.8}
                    onPress={() => setThemeMode(key as ThemeMode)}
                    style={[
                      styles.themeCard,
                      { borderColor: isSelected ? t.primary : 'transparent', transform: [{ scale: isSelected ? 1.03 : 1 }] }
                    ]}
                  >
                    <LinearGradient
                      colors={[t.gradientColors[0], t.gradientColors[2] || t.gradientColors[0]]}
                      start={{x: 0, y: 0}} end={{x: 1, y: 1}}
                      style={StyleSheet.absoluteFillObject}
                    />
                    <LinearGradient
                      colors={[`${t.primary}44`, `${t.accent}44`]}
                      start={{x: 0, y: 0}} end={{x: 1, y: 1}}
                      style={StyleSheet.absoluteFillObject}
                    />

                    <View style={styles.dotsRow}>
                      <View style={[styles.dot, { backgroundColor: t.primary }]} />
                      <View style={[styles.dot, { backgroundColor: t.accent }]} />
                    </View>

                    <LinearGradient
                      colors={['transparent', 'rgba(0,0,0,0.6)']}
                      style={styles.nameOverlay}
                    >
                      <Text style={styles.themeName}>{DISPLAY_NAMES[key]}</Text>
                    </LinearGradient>

                    {isSelected && (
                      <View style={styles.checkIcon}>
                        <Icon name="checkmark-circle" size={20} color={t.primary} />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingTop: 48,
    borderBottomWidth: 1,
  },
  backBtn: { padding: 4, marginRight: 12 },
  title: { fontSize: 22, fontWeight: '900' },
  scrollContent: { paddingBottom: 130 },
  activeCard: {
    margin: 16,
    borderRadius: 16,
    padding: 14,
    borderWidth: 2,
    flexDirection: 'row',
    alignItems: 'center',
  },
  activeColorBox: { width: 44, height: 44, borderRadius: 12 },
  activeInfo: { marginLeft: 12, flex: 1 },
  activeLabel: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
  activeName: { fontSize: 18, fontWeight: '800' },
  groupContainer: { marginBottom: 28, paddingHorizontal: 16 },
  groupTitle: { fontSize: 16, fontWeight: '800', marginBottom: 14 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  themeCard: {
    width: '48%',
    height: 100,
    borderRadius: 16,
    borderWidth: 2,
    marginBottom: 10,
    overflow: 'hidden',
  },
  dotsRow: { position: 'absolute', top: 10, right: 10, flexDirection: 'row', gap: 4 },
  dot: { width: 10, height: 10, borderRadius: 5, shadowColor: '#000', shadowOffset: {width:0,height:1}, shadowOpacity: 0.3, shadowRadius: 2 },
  nameOverlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'flex-end', alignItems: 'center', padding: 10 },
  themeName: { fontSize: 12, fontWeight: '700', color: '#fff', textAlign: 'center', textShadowColor: 'rgba(0,0,0,0.8)', textShadowOffset: {width:0,height:1}, textShadowRadius: 3 },
  checkIcon: { position: 'absolute', top: 8, left: 8 }
});
