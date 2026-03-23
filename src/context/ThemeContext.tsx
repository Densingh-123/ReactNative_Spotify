import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ThemeMode =
  | 'black' | 'midnight' | 'amoled' | 'galaxy' | 'ocean' | 'forest' | 'sunset' | 'volcano' | 'neon' | 'cyberpunk'
  | 'deep_blue' | 'deep_purple' | 'deep_red' | 'deep_teal' | 'deep_orange' | 'matrix' | 'dracula' | 'nord_dark' | 'synthwave' | 'obsidian'
  | 'charcoal' | 'espresso' | 'blood_moon' | 'toxic' | 'electric' | 'royal_dark' | 'emerald_dark' | 'ruby' | 'sapphire' | 'twilight'
  | 'white' | 'snow' | 'sky' | 'mint' | 'rose' | 'lemon' | 'peach' | 'lavender' | 'sakura' | 'nord_light'
  | 'twinkling_stars' | 'galaxy_spiral' | 'shooting_stars' | 'nebula_clouds' | 'floating_planets' | 'asteroid_field' | 'black_hole' | 'constellations'
  | 'ocean_waves' | 'underwater_bubbles' | 'sea_shore' | 'coral_reef' | 'jellyfish_glow' | 'water_ripple' | 'rain_ripples' | 'floating_boat'
  | 'falling_leaves' | 'cherry_petals' | 'moving_clouds' | 'fireflies' | 'snowfall' | 'butterflies' | 'grass_wind' | 'sunrise_sky'
  | 'glass_orbs' | 'liquid_gradient' | 'neon_lines' | 'particle_network' | 'three_d_cubes' | 'smoke_waves' | 'energy_waves' | 'aurora_lights'
  | 'matrix_rain' | 'circuit_glow' | 'neural_network' | 'hologram_grid' | 'data_streams' | 'radar_scan' | 'balloons' | 'paper_planes'
  | 'bus_window_rain' | 'train_window' | 'metro_ride' | 'bike_ride_pov' | 'highway_sunset' | 'auto_rickshaw' | 'plane_takeoff' | 'neon_taxi'
  | 'terrace_friends' | 'road_trip_friends' | 'beach_bonfire' | 'college_walk' | 'rooftop_party' | 'rain_walk' | 'sunset_silhouette' | 'street_food'
  | 'market_crowd' | 'city_timelapse' | 'rain_reflection' | 'zebra_crossing' | 'street_musician' | 'empty_night_road' | 'delivery_ride' | 'street_dogs'
  | 'window_thinking' | 'train_goodbye' | 'lonely_walk' | 'city_top_view' | 'bus_stop_rain' | 'sunrise_city' | 'train_bridge' | 'subway_rush'
  | 'truck_night' | 'boat_ride' | 'lofi_window' | 'neon_alley' | 'fog_street' | 'festival_lights' | 'ferris_wheel' | 'slow_traffic';

export interface ThemeColors {
  primary: string; background: string; surface: string; surfaceHighlight: string;
  text: string; textSecondary: string; accent: string; border: string;
  glassBorder: string; isDark: boolean; gradientColors: string[];
}

export const themes: Record<ThemeMode, ThemeColors> = {
  black: { primary: '#1e88e5', background: '#0a0a0a', surface: 'rgba(21,21,21,0.8)', surfaceHighlight: 'rgba(255,255,255,0.1)', text: '#ffffff', textSecondary: '#a0a0a0', accent: '#4fc3f7', border: 'rgba(255,255,255,0.1)', glassBorder: 'rgba(255,255,255,0.1)', isDark: true, gradientColors: ['#000000', '#1a1a1a', '#000000'] },
  midnight: { primary: '#64ffda', background: '#0a192f', surface: 'rgba(17,34,64,0.7)', surfaceHighlight: 'rgba(100,255,218,0.1)', text: '#ccd6f6', textSecondary: '#8892b0', accent: '#64ffda', border: 'rgba(100,255,218,0.2)', glassBorder: 'rgba(100,255,218,0.1)', isDark: true, gradientColors: ['#020c1b', '#0a192f', '#112240'] },
  amoled: { primary: '#ffffff', background: '#000000', surface: 'rgba(15,15,15,0.9)', surfaceHighlight: 'rgba(255,255,255,0.05)', text: '#ffffff', textSecondary: '#777777', accent: '#ffffff', border: '#222222', glassBorder: '#111111', isDark: true, gradientColors: ['#000000', '#000000', '#000000'] },
  galaxy: { primary: '#7c4dff', background: '#0b001e', surface: 'rgba(30,0,60,0.6)', surfaceHighlight: 'rgba(124,77,255,0.15)', text: '#ede7f6', textSecondary: '#b39ddb', accent: '#b388ff', border: 'rgba(124,77,255,0.3)', glassBorder: 'rgba(255,255,255,0.1)', isDark: true, gradientColors: ['#0b001e', '#1e003c', '#311b92'] },
  ocean: { primary: '#00b0ff', background: '#000b1a', surface: 'rgba(0,30,60,0.6)', surfaceHighlight: 'rgba(0,176,255,0.15)', text: '#e1f5fe', textSecondary: '#4fc3f7', accent: '#81d4fa', border: 'rgba(0,176,255,0.3)', glassBorder: 'rgba(255,255,255,0.1)', isDark: true, gradientColors: ['#000b1a', '#001e3c', '#01579b'] },
  forest: { primary: '#00e676', background: '#040d04', surface: 'rgba(10,30,10,0.7)', surfaceHighlight: 'rgba(0,230,118,0.15)', text: '#e8f5e9', textSecondary: '#81c784', accent: '#69f0ae', border: 'rgba(0,230,118,0.2)', glassBorder: 'rgba(255,255,255,0.05)', isDark: true, gradientColors: ['#040d04', '#0a1e0a', '#1b5e20'] },
  sunset: { primary: '#ff5722', background: '#0d0500', surface: 'rgba(40,15,0,0.7)', surfaceHighlight: 'rgba(255,87,34,0.15)', text: '#fff3e0', textSecondary: '#ffab91', accent: '#ff8a65', border: 'rgba(255,87,34,0.3)', glassBorder: 'rgba(255,255,255,0.1)', isDark: true, gradientColors: ['#0d0500', '#280f00', '#4e342e'] },
  volcano: { primary: '#f44336', background: '#0a0000', surface: 'rgba(42,0,0,0.8)', surfaceHighlight: 'rgba(244,67,54,0.15)', text: '#ffebee', textSecondary: '#ef9a9a', accent: '#ff5252', border: '#420000', glassBorder: '#300000', isDark: true, gradientColors: ['#0a0000', '#1a0000', '#3e2723'] },
  neon: { primary: '#ccff00', background: '#050505', surface: 'rgba(20,20,20,0.8)', surfaceHighlight: 'rgba(204,255,0,0.1)', text: '#ccff00', textSecondary: '#888888', accent: '#e5ff80', border: 'rgba(204,255,0,0.3)', glassBorder: 'rgba(204,255,0,0.1)', isDark: true, gradientColors: ['#000000', '#050505', '#1a1a1a'] },
  cyberpunk: { primary: '#f3f315', background: '#050a1a', surface: 'rgba(0,243,255,0.05)', surfaceHighlight: 'rgba(255,0,255,0.1)', text: '#f3f315', textSecondary: '#00f3ff', accent: '#ff00ff', border: '#f3f31588', glassBorder: '#00f3ff44', isDark: true, gradientColors: ['#050a1a', '#001233', '#000000'] },
  deep_blue: { primary: '#2979ff', background: '#00040a', surface: 'rgba(0,18,61,0.8)', surfaceHighlight: '#002663', text: '#e3f2fd', textSecondary: '#90caf9', accent: '#448aff', border: '#002663', glassBorder: '#001333', isDark: true, gradientColors: ['#00040a', '#000c1f', '#0d47a1'] },
  deep_purple: { primary: '#9c27b0', background: '#08001a', surface: 'rgba(18,0,60,0.8)', surfaceHighlight: '#330066', text: '#f3e5f5', textSecondary: '#ce93d8', accent: '#ba68c8', border: '#330066', glassBorder: '#1a0040', isDark: true, gradientColors: ['#08001a', '#12003c', '#4a148c'] },
  deep_red: { primary: '#c62828', background: '#120000', surface: 'rgba(32,0,0,0.8)', surfaceHighlight: '#400000', text: '#ffebee', textSecondary: '#ef9a9a', accent: '#e53935', border: '#400000', glassBorder: '#2a0000', isDark: true, gradientColors: ['#0a0000', '#120000', '#310000'] },
  deep_teal: { primary: '#00695c', background: '#000d0b', surface: 'rgba(0,26,22,0.8)', surfaceHighlight: '#00332a', text: '#e0f2f1', textSecondary: '#80cbc4', accent: '#00897b', border: '#00332a', glassBorder: '#00211a', isDark: true, gradientColors: ['#000d0b', '#001a16', '#004d40'] },
  deep_orange: { primary: '#e65100', background: '#0d0400', surface: 'rgba(26,13,0,0.8)', surfaceHighlight: '#421a00', text: '#fff3e0', textSecondary: '#ffcc80', accent: '#ef6c00', border: '#421a00', glassBorder: '#291100', isDark: true, gradientColors: ['#0d0400', '#1a0d00', '#e6510033'] },
  matrix: { primary: '#00ff41', background: '#000000', surface: 'rgba(0,17,0,0.85)', surfaceHighlight: '#004400', text: '#00ff41', textSecondary: '#008f11', accent: '#003b00', border: '#004400', glassBorder: '#002200', isDark: true, gradientColors: ['#000000', '#001100', '#002200'] },
  dracula: { primary: '#bd93f9', background: '#282a36', surface: 'rgba(68,71,90,0.85)', surfaceHighlight: '#6272a4', text: '#f8f8f2', textSecondary: '#6272a4', accent: '#50fa7b', border: '#44475a', glassBorder: 'rgba(189,147,249,0.1)', isDark: true, gradientColors: ['#282a36', '#44475a', '#282a36'] },
  nord_dark: { primary: '#88c0d0', background: '#2e3440', surface: 'rgba(59,66,82,0.85)', surfaceHighlight: '#4c566a', text: '#eceff4', textSecondary: '#d8dee9', accent: '#81a1c1', border: '#4c566a', glassBorder: 'rgba(255,255,255,0.05)', isDark: true, gradientColors: ['#2e3440', '#3b4252', '#434c5e'] },
  synthwave: { primary: '#ff7edb', background: '#1a0633', surface: 'rgba(45,11,90,0.7)', surfaceHighlight: '#720b98', text: '#f4eee1', textSecondary: '#36f9f6', accent: '#fe7171', border: '#720b98', glassBorder: 'rgba(255,126,219,0.2)', isDark: true, gradientColors: ['#1a0633', '#2d0b5a', '#000000'] },
  obsidian: { primary: '#ffab00', background: '#0e0e0e', surface: 'rgba(26,26,26,0.9)', surfaceHighlight: '#333333', text: '#ffffff', textSecondary: '#aaaaaa', accent: '#ffd600', border: '#333333', glassBorder: '#222222', isDark: true, gradientColors: ['#0a0a0a', '#0e0e0e', '#1a1a1a'] },
  charcoal: { primary: '#cfd8dc', background: '#121212', surface: 'rgba(30,30,30,0.85)', surfaceHighlight: '#333333', text: '#eceff1', textSecondary: '#b0bec5', accent: '#90a4ae', border: '#333333', glassBorder: '#222222', isDark: true, gradientColors: ['#121212', '#1e1e1e', '#2c2c2c'] },
  espresso: { primary: '#d7ccc8', background: '#1a0f0e', surface: 'rgba(45,27,26,0.85)', surfaceHighlight: '#4e342e', text: '#efebe9', textSecondary: '#a1887f', accent: '#8d6e63', border: '#4e342e', glassBorder: '#382220', isDark: true, gradientColors: ['#1a0f0e', '#2d1b1a', '#3e2723'] },
  blood_moon: { primary: '#ff1744', background: '#0a0000', surface: 'rgba(20,0,0,0.85)', surfaceHighlight: '#600000', text: '#ffebee', textSecondary: '#ef5350', accent: '#d32f2f', border: '#600000', glassBorder: '#300000', isDark: true, gradientColors: ['#0a0000', '#1a0000', '#310000'] },
  toxic: { primary: '#39ff14', background: '#000d00', surface: 'rgba(0,26,0,0.85)', surfaceHighlight: '#004a00', text: '#39ff14', textSecondary: '#20c20e', accent: '#00ff41', border: '#004a00', glassBorder: '#002600', isDark: true, gradientColors: ['#000000', '#000d00', '#001a00'] },
  electric: { primary: '#0070ff', background: '#00050d', surface: 'rgba(0,17,38,0.85)', surfaceHighlight: '#002b5c', text: '#e0f0ff', textSecondary: '#66b2ff', accent: '#0099ff', border: '#002b5c', glassBorder: '#001936', isDark: true, gradientColors: ['#00050d', '#001126', '#000000'] },
  royal_dark: { primary: '#ffd700', background: '#050014', surface: 'rgba(10,0,41,0.85)', surfaceHighlight: '#1a0042', text: '#fcf8e3', textSecondary: '#c5a059', accent: '#daa520', border: '#1a0042', glassBorder: '#0d0033', isDark: true, gradientColors: ['#050014', '#0a0029', '#0d0033'] },
  emerald_dark: { primary: '#00ff88', background: '#000d07', surface: 'rgba(0,26,15,0.85)', surfaceHighlight: '#004024', text: '#e0fff0', textSecondary: '#00cc6a', accent: '#00ffaa', border: '#004024', glassBorder: '#002616', isDark: true, gradientColors: ['#000d07', '#001a0f', '#002616'] },
  ruby: { primary: '#ff0033', background: '#0d0003', surface: 'rgba(26,0,6,0.85)', surfaceHighlight: '#4d0012', text: '#ffe0e6', textSecondary: '#ff4d6d', accent: '#ff0055', border: '#4d0012', glassBorder: '#260009', isDark: true, gradientColors: ['#0d0003', '#1a0006', '#260009'] },
  sapphire: { primary: '#0f52ba', background: '#000612', surface: 'rgba(0,17,43,0.85)', surfaceHighlight: '#002b6b', text: '#e0f0ff', textSecondary: '#4169e1', accent: '#1e90ff', border: '#002b6b', glassBorder: '#001940', isDark: true, gradientColors: ['#000612', '#00112b', '#001940'] },
  twilight: { primary: '#f48fb1', background: '#0d020d', surface: 'rgba(26,4,26,0.85)', surfaceHighlight: '#400a40', text: '#fce4ec', textSecondary: '#f06292', accent: '#ec407a', border: '#400a40', glassBorder: '#260626', isDark: true, gradientColors: ['#0d020d', '#1a041a', '#260626'] },
  white: { primary: '#1e88e5', background: '#f5f5f5', surface: 'rgba(255,255,255,0.9)', surfaceHighlight: '#eeeeee', text: '#1a1a1a', textSecondary: '#666666', accent: '#1565c0', border: 'rgba(30,136,229,0.2)', glassBorder: 'rgba(0,0,0,0.05)', isDark: false, gradientColors: ['#f5f5f5', '#ffffff', '#f5f5f5'] },
  snow: { primary: '#9e9e9e', background: '#ffffff', surface: 'rgba(255,255,255,0.95)', surfaceHighlight: '#f0f0f0', text: '#212121', textSecondary: '#757575', accent: '#bdbdbd', border: '#e0e0e0', glassBorder: '#f5f5f5', isDark: false, gradientColors: ['#ffffff', '#fcfcfc', '#ffffff'] },
  sky: { primary: '#0288d1', background: '#e1f5fe', surface: 'rgba(255,255,255,0.85)', surfaceHighlight: '#b3e5fc', text: '#01579b', textSecondary: '#039be5', accent: '#40c4ff', border: '#81d4fa', glassBorder: '#e1f5fe', isDark: false, gradientColors: ['#e1f5fe', '#ffffff', '#b3e5fc'] },
  mint: { primary: '#00796b', background: '#e0f2f1', surface: 'rgba(255,255,255,0.85)', surfaceHighlight: '#b2dfdb', text: '#004d40', textSecondary: '#00897b', accent: '#4db6ac', border: '#80cbc4', glassBorder: '#e0f2f1', isDark: false, gradientColors: ['#e0f2f1', '#ffffff', '#b2dfdb'] },
  rose: { primary: '#c2185b', background: '#fce4ec', surface: 'rgba(255,255,255,0.85)', surfaceHighlight: '#f8bbd0', text: '#880e4f', textSecondary: '#d81b60', accent: '#f06292', border: '#f48fb1', glassBorder: '#fce4ec', isDark: false, gradientColors: ['#fce4ec', '#ffffff', '#f8bbd0'] },
  lemon: { primary: '#fbc02d', background: '#fffde7', surface: 'rgba(255,255,255,0.85)', surfaceHighlight: '#fff9c4', text: '#f57f17', textSecondary: '#fbc02d', accent: '#fff176', border: '#fff59d', glassBorder: '#fffde7', isDark: false, gradientColors: ['#fffde7', '#ffffff', '#fff9c4'] },
  peach: { primary: '#e64a19', background: '#fff3e0', surface: 'rgba(255,255,255,0.85)', surfaceHighlight: '#ffe0b2', text: '#bf360c', textSecondary: '#f4511e', accent: '#ff8a65', border: '#ffab91', glassBorder: '#fff3e0', isDark: false, gradientColors: ['#fff3e0', '#ffffff', '#ffe0b2'] },
  lavender: { primary: '#512da8', background: '#f3e5f5', surface: 'rgba(255,255,255,0.85)', surfaceHighlight: '#e1bee7', text: '#311b92', textSecondary: '#5e35b1', accent: '#9575cd', border: '#b39ddb', glassBorder: '#f3e5f5', isDark: false, gradientColors: ['#f3e5f5', '#ffffff', '#e1bee7'] },
  sakura: { primary: '#e91e63', background: '#fff0f5', surface: 'rgba(255,255,255,0.85)', surfaceHighlight: '#ffc1d1', text: '#880e4f', textSecondary: '#ec407a', accent: '#f48fb1', border: '#ffc1d1', glassBorder: '#fff0f5', isDark: false, gradientColors: ['#fff0f5', '#ffffff', '#ffc1d1'] },
  nord_light: { primary: '#5e81ac', background: '#e5e9f0', surface: 'rgba(236,239,244,0.9)', surfaceHighlight: '#d8dee9', text: '#2e3440', textSecondary: '#434c5e', accent: '#81a1c1', border: '#d8dee9', glassBorder: '#eceff4', isDark: false, gradientColors: ['#e5e9f0', '#eceff4', '#d8dee9'] },

  // --- Animated Themes ---
  twinkling_stars: { primary: '#ffffff', background: '#050a1b', surface: 'rgba(10,20,40,0.7)', surfaceHighlight: 'rgba(255,255,255,0.1)', text: '#ffffff', textSecondary: '#a0acbf', accent: '#4fc3f7', border: 'rgba(255,255,255,0.1)', glassBorder: 'rgba(255,255,255,0.1)', isDark: true, gradientColors: ['#050a1b', '#000000', '#0a192f'] },
  galaxy_spiral: { primary: '#ba68c8', background: '#0b001e', surface: 'rgba(30,0,60,0.6)', surfaceHighlight: 'rgba(124,77,255,0.15)', text: '#ede7f6', textSecondary: '#b39ddb', accent: '#f06292', border: 'rgba(124,77,255,0.3)', glassBorder: 'rgba(255,255,255,0.1)', isDark: true, gradientColors: ['#0b001e', '#1e003c', '#4a148c'] },
  shooting_stars: { primary: '#4fc3f7', background: '#030712', surface: 'rgba(15,23,42,0.7)', surfaceHighlight: 'rgba(56,189,248,0.1)', text: '#f8fafc', textSecondary: '#94a3b8', accent: '#ffffff', border: 'rgba(56,189,248,0.2)', glassBorder: 'rgba(255,255,255,0.05)', isDark: true, gradientColors: ['#030712', '#000000', '#1e293b'] },
  nebula_clouds: { primary: '#f472b6', background: '#0f172a', surface: 'rgba(30,41,59,0.7)', surfaceHighlight: 'rgba(244,114,182,0.1)', text: '#f1f5f9', textSecondary: '#94a3b8', accent: '#22d3ee', border: 'rgba(244,114,182,0.2)', glassBorder: 'rgba(255,255,255,0.05)', isDark: true, gradientColors: ['#0f172a', '#1e1b4b', '#312e81'] },
  floating_planets: { primary: '#fb923c', background: '#0c0a09', surface: 'rgba(41,37,36,0.7)', surfaceHighlight: 'rgba(251,146,60,0.1)', text: '#f5f5f4', textSecondary: '#a8a29e', accent: '#facc15', border: 'rgba(251,146,60,0.2)', glassBorder: 'rgba(255,255,255,0.05)', isDark: true, gradientColors: ['#0c0a09', '#1c1917', '#44403c'] },
  asteroid_field: { primary: '#a8a29e', background: '#1c1917', surface: 'rgba(41,37,36,0.8)', surfaceHighlight: 'rgba(168,162,158,0.1)', text: '#fafaf9', textSecondary: '#78716c', accent: '#d6d3d1', border: 'rgba(168,162,158,0.2)', glassBorder: 'rgba(255,255,255,0.05)', isDark: true, gradientColors: ['#1c1917', '#0c0a09', '#292524'] },
  black_hole: { primary: '#fbbf24', background: '#000000', surface: 'rgba(15,15,15,0.9)', surfaceHighlight: 'rgba(251,191,36,0.1)', text: '#ffffff', textSecondary: '#9ca3af', accent: '#3b82f6', border: 'rgba(251,191,36,0.3)', glassBorder: 'rgba(255,255,255,0.05)', isDark: true, gradientColors: ['#000000', '#111827', '#000000'] },
  constellations: { primary: '#e2e8f0', background: '#020617', surface: 'rgba(15,23,42,0.8)', surfaceHighlight: 'rgba(226,232,240,0.1)', text: '#f8fafc', textSecondary: '#64748b', accent: '#38bdf8', border: 'rgba(226,232,240,0.2)', glassBorder: 'rgba(255,255,255,0.05)', isDark: true, gradientColors: ['#020617', '#0f172a', '#1e293b'] },
  ocean_waves: { primary: '#0ea5e9', background: '#082f49', surface: 'rgba(12,74,110,0.7)', surfaceHighlight: 'rgba(14,165,233,0.1)', text: '#f0f9ff', textSecondary: '#7dd3fc', accent: '#bae6fd', border: 'rgba(14,165,233,0.2)', glassBorder: 'rgba(255,255,255,0.1)', isDark: true, gradientColors: ['#082f49', '#0c4a6e', '#075985'] },
  underwater_bubbles: { primary: '#22d3ee', background: '#083344', surface: 'rgba(21,94,117,0.7)', surfaceHighlight: 'rgba(34,211,238,0.1)', text: '#ecfeff', textSecondary: '#67e8f9', accent: '#06b6d4', border: 'rgba(34,211,238,0.2)', glassBorder: 'rgba(255,255,255,0.1)', isDark: true, gradientColors: ['#083344', '#155e75', '#164e63'] },
  sea_shore: { primary: '#14b8a6', background: '#f0fdfa', surface: 'rgba(255,255,255,0.8)', surfaceHighlight: 'rgba(20,184,166,0.1)', text: '#0f766e', textSecondary: '#2dd4bf', accent: '#5eead4', border: 'rgba(20,184,166,0.2)', glassBorder: 'rgba(20,184,166,0.05)', isDark: false, gradientColors: ['#f0fdfa', '#ccfbf1', '#99f6e4'] },
  coral_reef: { primary: '#f43f5e', background: '#fff1f2', surface: 'rgba(255,255,255,0.85)', surfaceHighlight: 'rgba(244,63,94,0.1)', text: '#9f1239', textSecondary: '#f472b6', accent: '#fb7185', border: 'rgba(244,63,94,0.2)', glassBorder: 'rgba(244,63,94,0.05)', isDark: false, gradientColors: ['#fff1f2', '#ffe4e6', '#fecdd3'] },
  jellyfish_glow: { primary: '#6366f1', background: '#1e1b4b', surface: 'rgba(49,46,129,0.7)', surfaceHighlight: 'rgba(99,102,241,0.1)', text: '#eef2ff', textSecondary: '#818cf8', accent: '#a5b4fc', border: 'rgba(99,102,241,0.2)', glassBorder: 'rgba(255,255,255,0.05)', isDark: true, gradientColors: ['#1e1b4b', '#312e129', '#3730a3'] },
  water_ripple: { primary: '#38bdf8', background: '#f0f9ff', surface: 'rgba(255,255,255,0.8)', surfaceHighlight: 'rgba(56,189,248,0.1)', text: '#075985', textSecondary: '#0ea5e9', accent: '#7dd3fc', border: 'rgba(56,189,248,0.2)', glassBorder: 'rgba(56,189,248,0.05)', isDark: false, gradientColors: ['#f0f9ff', '#e0f2fe', '#bae6fd'] },
  rain_ripples: { primary: '#64748b', background: '#0f172a', surface: 'rgba(30,41,59,0.7)', surfaceHighlight: 'rgba(100,116,139,0.1)', text: '#f1f5f9', textSecondary: '#94a3b8', accent: '#cbd5e1', border: 'rgba(100,116,139,0.2)', glassBorder: 'rgba(255,255,255,0.05)', isDark: true, gradientColors: ['#0f172a', '#1e293b', '#334155'] },
  floating_boat: { primary: '#0ea5e9', background: '#e0f2fe', surface: 'rgba(255,255,255,0.85)', surfaceHighlight: 'rgba(14,165,233,0.1)', text: '#0c4a6e', textSecondary: '#0284c7', accent: '#38bdf8', border: 'rgba(14,165,233,0.2)', glassBorder: 'rgba(14,165,233,0.05)', isDark: false, gradientColors: ['#e0f2fe', '#f0f9ff', '#bae6fd'] },
  falling_leaves: { primary: '#d97706', background: '#fffbeb', surface: 'rgba(255,255,255,0.85)', surfaceHighlight: 'rgba(217,119,6,0.1)', text: '#78350f', textSecondary: '#b45309', accent: '#fbbf24', border: 'rgba(217,119,6,0.2)', glassBorder: 'rgba(217,119,6,0.05)', isDark: false, gradientColors: ['#fffbeb', '#fef3c7', '#fde68a'] },
  cherry_petals: { primary: '#fb7185', background: '#fff1f2', surface: 'rgba(255,255,255,0.85)', surfaceHighlight: 'rgba(251,113,133,0.1)', text: '#9f1239', textSecondary: '#f43f5e', accent: '#fda4af', border: 'rgba(251,113,133,0.2)', glassBorder: 'rgba(251,113,133,0.05)', isDark: false, gradientColors: ['#fff1f2', '#ffe4e6', '#fecdd3'] },
  moving_clouds: { primary: '#38bdf8', background: '#f0f9ff', surface: 'rgba(255,255,255,0.85)', surfaceHighlight: 'rgba(56,189,248,0.1)', text: '#075985', textSecondary: '#0ea5e9', accent: '#bae6fd', border: 'rgba(56,189,248,0.2)', glassBorder: 'rgba(56,189,248,0.05)', isDark: false, gradientColors: ['#f0f9ff', '#e0f2fe', '#ffffff'] },
  fireflies: { primary: '#facc15', background: '#020617', surface: 'rgba(10,15,30,0.7)', surfaceHighlight: 'rgba(250,204,21,0.1)', text: '#fef3c7', textSecondary: '#d97706', accent: '#fbbf24', border: 'rgba(250,204,21,0.2)', glassBorder: 'rgba(255,255,255,0.05)', isDark: true, gradientColors: ['#020617', '#064e3b', '#022c22'] },
  snowfall: { primary: '#f8fafc', background: '#f1f5f9', surface: 'rgba(255,255,255,0.85)', surfaceHighlight: 'rgba(248,250,252,0.1)', text: '#334155', textSecondary: '#64748b', accent: '#cbd5e1', border: 'rgba(255,255,255,0.2)', glassBorder: 'rgba(255,255,255,0.05)', isDark: false, gradientColors: ['#f1f5f9', '#ffffff', '#e2e8f0'] },
  butterflies: { primary: '#f59e0b', background: '#fffbeb', surface: 'rgba(255,255,255,0.85)', surfaceHighlight: 'rgba(245,158,11,0.1)', text: '#78350f', textSecondary: '#d97706', accent: '#fbbf24', border: 'rgba(245,158,11,0.2)', glassBorder: 'rgba(245,158,11,0.05)', isDark: false, gradientColors: ['#fffbeb', '#fef3c7', '#fde68a'] },
  grass_wind: { primary: '#22c55e', background: '#f0fdf4', surface: 'rgba(255,255,255,0.85)', surfaceHighlight: 'rgba(34,197,94,0.1)', text: '#14532d', textSecondary: '#16a34a', accent: '#4ade80', border: 'rgba(34,197,94,0.2)', glassBorder: 'rgba(34,197,94,0.05)', isDark: false, gradientColors: ['#f0fdf4', '#dcfce7', '#bbf7d0'] },
  sunrise_sky: { primary: '#f97316', background: '#fff7ed', surface: 'rgba(255,255,255,0.85)', surfaceHighlight: 'rgba(249,115,22,0.1)', text: '#7c2d12', textSecondary: '#ea580c', accent: '#fb923c', border: 'rgba(249,115,22,0.2)', glassBorder: 'rgba(249,115,22,0.05)', isDark: false, gradientColors: ['#fff7ed', '#ffedd5', '#fed7aa'] },
  glass_orbs: { primary: '#ffffff', background: '#0a0a0a', surface: 'rgba(255,255,255,0.05)', surfaceHighlight: 'rgba(255,255,255,0.1)', text: '#f5f5f5', textSecondary: '#a3a3a3', accent: '#d4d4d4', border: 'rgba(255,255,255,0.1)', glassBorder: 'rgba(255,255,255,0.2)', isDark: true, gradientColors: ['#000000', '#0a0a0a', '#171717'] },
  liquid_gradient: { primary: '#8b5cf6', background: '#020617', surface: 'rgba(15,23,42,0.7)', surfaceHighlight: 'rgba(139,92,246,0.1)', text: '#f8fafc', textSecondary: '#c084fc', accent: '#d8b4fe', border: 'rgba(139,92,246,0.2)', glassBorder: 'rgba(255,255,255,0.05)', isDark: true, gradientColors: ['#020617', '#1e1b4b', '#312e81'] },
  neon_lines: { primary: '#22c55e', background: '#050505', surface: 'rgba(20,20,20,0.8)', surfaceHighlight: 'rgba(34,197,94,0.1)', text: '#22c55e', textSecondary: '#16a34a', accent: '#4ade80', border: 'rgba(34,197,94,0.3)', glassBorder: 'rgba(34,197,94,0.1)', isDark: true, gradientColors: ['#000000', '#050505', '#0a0a0a'] },
  particle_network: { primary: '#64748b', background: '#0f172a', surface: 'rgba(30,41,59,0.7)', surfaceHighlight: 'rgba(100,116,139,0.1)', text: '#f1f5f9', textSecondary: '#94a3b8', accent: '#cbd5e1', border: 'rgba(100,116,139,0.2)', glassBorder: 'rgba(255,255,255,0.05)', isDark: true, gradientColors: ['#0f172a', '#1e293b', '#000000'] },
  three_d_cubes: { primary: '#6366f1', background: '#0a0a0a', surface: 'rgba(30,30,30,0.8)', surfaceHighlight: 'rgba(99,102,241,0.1)', text: '#f5f5f5', textSecondary: '#818cf8', accent: '#a5b4fc', border: 'rgba(99,102,241,0.2)', glassBorder: 'rgba(255,255,255,0.05)', isDark: true, gradientColors: ['#000000', '#050505', '#171717'] },
  smoke_waves: { primary: '#ec4899', background: '#050505', surface: 'rgba(20,20,20,0.8)', surfaceHighlight: 'rgba(236,72,153,0.1)', text: '#fbcfe8', textSecondary: '#f472b6', accent: '#f9a8d4', border: 'rgba(236,72,153,0.2)', glassBorder: 'rgba(255,255,255,0.05)', isDark: true, gradientColors: ['#000000', '#1e1b4b', '#312e81'] },
  energy_waves: { primary: '#0ea5e9', background: '#020617', surface: 'rgba(15,23,42,0.7)', surfaceHighlight: 'rgba(14,165,233,0.1)', text: '#f0f9ff', textSecondary: '#38bdf8', accent: '#7dd3fc', border: 'rgba(14,165,233,0.2)', glassBorder: 'rgba(255,255,255,0.05)', isDark: true, gradientColors: ['#020617', '#0c4a6e', '#075985'] },
  aurora_lights: { primary: '#22c55e', background: '#020617', surface: 'rgba(10,15,30,0.7)', surfaceHighlight: 'rgba(34,197,94,0.1)', text: '#f0fdf4', textSecondary: '#4ade80', accent: '#86efac', border: 'rgba(34,197,94,0.2)', glassBorder: 'rgba(255,255,255,0.05)', isDark: true, gradientColors: ['#020617', '#064e3b', '#1e1b4b'] },
  matrix_rain: { primary: '#00ff41', background: '#000000', surface: 'rgba(0,17,0,0.85)', surfaceHighlight: '#004400', text: '#00ff41', textSecondary: '#008f11', accent: '#003b00', border: '#004400', glassBorder: '#002200', isDark: true, gradientColors: ['#000000', '#001100', '#002200'] },
  circuit_glow: { primary: '#38bdf8', background: '#020617', surface: 'rgba(15,23,42,0.8)', surfaceHighlight: 'rgba(56,189,248,0.1)', text: '#f8fafc', textSecondary: '#0ea5e9', accent: '#7dd3fc', border: 'rgba(56,189,248,0.2)', glassBorder: 'rgba(255,255,255,0.05)', isDark: true, gradientColors: ['#020617', '#1e293b', '#000000'] },
  neural_network: { primary: '#8b5cf6', background: '#020617', surface: 'rgba(15,23,42,0.8)', surfaceHighlight: 'rgba(139,92,246,0.1)', text: '#f8fafc', textSecondary: '#a78bfa', accent: '#c084fc', border: 'rgba(139,92,246,0.2)', glassBorder: 'rgba(255,255,255,0.05)', isDark: true, gradientColors: ['#020617', '#312e81', '#1e1b4b'] },
  hologram_grid: { primary: '#0ea5e9', background: '#020617', surface: 'rgba(15,23,42,0.8)', surfaceHighlight: 'rgba(14,165,233,0.1)', text: '#f0f9ff', textSecondary: '#38bdf8', accent: '#7dd3fc', border: 'rgba(14,165,233,0.2)', glassBorder: 'rgba(255,255,255,0.05)', isDark: true, gradientColors: ['#020617', '#082f49', '#000000'] },
  data_streams: { primary: '#22d3ee', background: '#020617', surface: 'rgba(15,23,42,0.8)', surfaceHighlight: 'rgba(34,211,238,0.1)', text: '#ecfeff', textSecondary: '#06b6d4', accent: '#67e8f9', border: 'rgba(34,211,238,0.2)', glassBorder: 'rgba(255,255,255,0.05)', isDark: true, gradientColors: ['#020617', '#164e63', '#000000'] },
  radar_scan: { primary: '#22c55e', background: '#000000', surface: 'rgba(0,20,0,0.8)', surfaceHighlight: 'rgba(34,197,94,0.1)', text: '#f0fdf4', textSecondary: '#16a34a', accent: '#4ade80', border: 'rgba(34,197,94,0.3)', glassBorder: 'rgba(34,197,94,0.1)', isDark: true, gradientColors: ['#000000', '#052e16', '#000000'] },
  balloons: { primary: '#f43f5e', background: '#fff1f2', surface: 'rgba(255,255,255,0.85)', surfaceHighlight: 'rgba(244,63,94,0.1)', text: '#9f1239', textSecondary: '#fb7185', accent: '#fda4af', border: 'rgba(244,63,94,0.2)', glassBorder: 'rgba(244,63,94,0.05)', isDark: false, gradientColors: ['#fff1f2', '#fce7f3', '#dcfce7'] },
  paper_planes: { primary: '#38bdf8', background: '#f0f9ff', surface: 'rgba(255,255,255,0.85)', surfaceHighlight: 'rgba(56,189,248,0.1)', text: '#075985', textSecondary: '#0ea5e9', accent: '#7dd3fc', border: 'rgba(56,189,248,0.2)', glassBorder: 'rgba(56,189,248,0.05)', isDark: false, gradientColors: ['#f0f9ff', '#ffffff', '#e2e8f0'] },
  // --- Animated Themes Continuation (41–80) ---
  bus_window_rain: { primary: '#94a3b8', background: '#0f172a', surface: 'rgba(30,41,59,0.7)', surfaceHighlight: 'rgba(148,163,184,0.1)', text: '#f1f5f9', textSecondary: '#94a3b8', accent: '#38bdf8', border: 'rgba(148,163,184,0.2)', glassBorder: 'rgba(255,255,255,0.05)', isDark: true, gradientColors: ['#0f172a', '#1e293b', '#334155'] },
  train_window: { primary: '#facc15', background: '#0c0a09', surface: 'rgba(41,37,36,0.7)', surfaceHighlight: 'rgba(250,204,21,0.1)', text: '#f5f5f4', textSecondary: '#a8a29e', accent: '#78350f', border: 'rgba(250,204,21,0.2)', glassBorder: 'rgba(255,255,255,0.05)', isDark: true, gradientColors: ['#0c0a09', '#1c1917', '#44403c'] },
  metro_ride: { primary: '#ef4444', background: '#0a0a0a', surface: 'rgba(20,20,20,0.85)', surfaceHighlight: 'rgba(239,68,68,0.1)', text: '#ffffff', textSecondary: '#a3a3a3', accent: '#f87171', border: 'rgba(239,68,68,0.2)', glassBorder: 'rgba(255,255,255,0.05)', isDark: true, gradientColors: ['#000000', '#0a0a0a', '#171717'] },
  bike_ride_pov: { primary: '#22c55e', background: '#050505', surface: 'rgba(15,15,15,0.8)', surfaceHighlight: 'rgba(34,197,94,0.1)', text: '#f0fdf4', textSecondary: '#4ade80', accent: '#16a34a', border: 'rgba(34,197,94,0.2)', glassBorder: 'rgba(255,255,255,0.05)', isDark: true, gradientColors: ['#000000', '#050505', '#0a0a0a'] },
  highway_sunset: { primary: '#f97316', background: '#1e0000', surface: 'rgba(40,10,0,0.7)', surfaceHighlight: 'rgba(249,115,22,0.15)', text: '#fff7ed', textSecondary: '#fdba74', accent: '#dc2626', border: 'rgba(249,115,22,0.2)', glassBorder: 'rgba(255,255,255,0.1)', isDark: true, gradientColors: ['#1e0000', '#2d0a00', '#4e1a00'] },
  auto_rickshaw: { primary: '#facc15', background: '#0f0f00', surface: 'rgba(30,30,0,0.8)', surfaceHighlight: 'rgba(250,204,21,0.1)', text: '#fef3c7', textSecondary: '#d97706', accent: '#000000', border: 'rgba(250,204,21,0.3)', glassBorder: 'rgba(250,204,21,0.1)', isDark: true, gradientColors: ['#1a1a00', '#2a2a00', '#000000'] },
  plane_takeoff: { primary: '#38bdf8', background: '#000c1a', surface: 'rgba(0,25,50,0.7)', surfaceHighlight: 'rgba(56,189,248,0.15)', text: '#f0f9ff', textSecondary: '#7dd3fc', accent: '#ffffff', border: 'rgba(56,189,248,0.2)', glassBorder: 'rgba(255,255,255,0.1)', isDark: true, gradientColors: ['#000c1a', '#001a33', '#003366'] },
  neon_taxi: { primary: '#ef4444', background: '#020617', surface: 'rgba(15,23,42,0.8)', surfaceHighlight: 'rgba(239,68,68,0.1)', text: '#fef2f2', textSecondary: '#f87171', accent: '#fecaca', border: 'rgba(239,68,68,0.2)', glassBorder: 'rgba(255,255,255,0.05)', isDark: true, gradientColors: ['#020617', '#1e1b4b', '#000000'] },
  terrace_friends: { primary: '#a78bfa', background: '#0f172a', surface: 'rgba(30,41,59,0.7)', surfaceHighlight: 'rgba(167,139,250,0.1)', text: '#f5f3ff', textSecondary: '#c4b5fd', accent: '#ede9fe', border: 'rgba(167,139,250,0.2)', glassBorder: 'rgba(255,255,255,0.05)', isDark: true, gradientColors: ['#0f172a', '#1e1b4b', '#2e1065'] },
  road_trip_friends: { primary: '#fb923c', background: '#1c1917', surface: 'rgba(41,37,36,0.7)', surfaceHighlight: 'rgba(251,146,60,0.1)', text: '#fafaf9', textSecondary: '#fdba74', accent: '#f97316', border: 'rgba(251,146,60,0.2)', glassBorder: 'rgba(255,255,255,0.05)', isDark: true, gradientColors: ['#1c1917', '#0c0a09', '#44403c'] },
  beach_bonfire: { primary: '#f97316', background: '#0c0a09', surface: 'rgba(41,37,36,0.8)', surfaceHighlight: 'rgba(249,115,22,0.1)', text: '#fff7ed', textSecondary: '#fdba74', accent: '#dc2626', border: 'rgba(249,115,22,0.2)', glassBorder: 'rgba(255,255,255,0.05)', isDark: true, gradientColors: ['#0c0a09', '#1c1917', '#450a0a'] },
  college_walk: { primary: '#ec4899', background: '#fff1f2', surface: 'rgba(255,255,255,0.85)', surfaceHighlight: 'rgba(236,72,153,0.1)', text: '#9d174d', textSecondary: '#f472b6', accent: '#f9a8d4', border: 'rgba(236,72,153,0.2)', glassBorder: 'rgba(236,72,153,0.05)', isDark: false, gradientColors: ['#fff1f2', '#fce7f3', '#fbcfe8'] },
  rooftop_party: { primary: '#a855f7', background: '#0f172a', surface: 'rgba(30,41,59,0.7)', surfaceHighlight: 'rgba(168,85,247,0.1)', text: '#f5f3ff', textSecondary: '#c084fc', accent: '#e9d5ff', border: 'rgba(168,85,247,0.2)', glassBorder: 'rgba(255,255,255,0.1)', isDark: true, gradientColors: ['#0f172a', '#312e81', '#581c87'] },
  rain_walk: { primary: '#38bdf8', background: '#0e1b2e', surface: 'rgba(30,50,80,0.7)', surfaceHighlight: 'rgba(56,189,248,0.1)', text: '#f0f9ff', textSecondary: '#7dd3fc', accent: '#bae6fd', border: 'rgba(56,189,248,0.2)', glassBorder: 'rgba(255,255,255,0.05)', isDark: true, gradientColors: ['#0e1b2e', '#0f172a', '#1e293b'] },
  sunset_silhouette: { primary: '#ea580c', background: '#0a0000', surface: 'rgba(30,5,0,0.85)', surfaceHighlight: 'rgba(234,88,12,0.1)', text: '#fff7ed', textSecondary: '#fb923c', accent: '#9a3412', border: 'rgba(234,88,12,0.2)', glassBorder: 'rgba(255,255,255,0.05)', isDark: true, gradientColors: ['#0a0000', '#2d0a00', '#000000'] },
  street_food: { primary: '#fb923c', background: '#1c1917', surface: 'rgba(41,37,36,0.8)', surfaceHighlight: 'rgba(251,146,60,0.1)', text: '#fafaf9', textSecondary: '#fdba74', accent: '#ea580c', border: 'rgba(251,146,60,0.2)', glassBorder: 'rgba(255,255,255,0.05)', isDark: true, gradientColors: ['#1c1917', '#292524', '#44403c'] },
  market_crowd: { primary: '#64748b', background: '#0f172a', surface: 'rgba(30,41,59,0.8)', surfaceHighlight: '#475569', text: '#f1f5f9', textSecondary: '#94a3b8', accent: '#cbd5e1', border: '#475569', glassBorder: 'rgba(255,255,255,0.05)', isDark: true, gradientColors: ['#0f172a', '#1e293b', '#334155'] },
  city_timelapse: { primary: '#facc15', background: '#020617', surface: 'rgba(15,23,42,0.8)', surfaceHighlight: '#334155', text: '#fef3c7', textSecondary: '#d97706', accent: '#fbbf24', border: '#334155', glassBorder: 'rgba(255,255,255,0.05)', isDark: true, gradientColors: ['#020617', '#0f172a', '#000000'] },
  rain_reflection: { primary: '#94a3b8', background: '#020617', surface: 'rgba(15,23,42,0.8)', surfaceHighlight: '#334155', text: '#f8fafc', textSecondary: '#64748b', accent: '#cbd5e1', border: '#334155', glassBorder: 'rgba(255,255,255,0.1)', isDark: true, gradientColors: ['#020617', '#0f172a', '#1e293b'] },
  zebra_crossing: { primary: '#ffffff', background: '#0a0a0a', surface: 'rgba(40,40,40,0.85)', surfaceHighlight: '#525252', text: '#ffffff', textSecondary: '#737373', accent: '#a3a3a3', border: '#525252', glassBorder: 'rgba(255,255,255,0.1)', isDark: true, gradientColors: ['#000000', '#0a0a0a', '#171717'] },
  street_musician: { primary: '#ec4899', background: '#0d020d', surface: 'rgba(26,4,26,0.85)', surfaceHighlight: '#400a40', text: '#fce4ec', textSecondary: '#f06292', accent: '#ec407a', border: '#400a40', glassBorder: 'rgba(255,255,255,0.1)', isDark: true, gradientColors: ['#0d020d', '#1a041a', '#260626'] },
  empty_night_road: { primary: '#475569', background: '#020617', surface: 'rgba(15,23,42,0.85)', surfaceHighlight: '#334155', text: '#f1f5f9', textSecondary: '#64748b', accent: '#94a3b8', border: '#334155', glassBorder: 'rgba(255,255,255,0.05)', isDark: true, gradientColors: ['#020617', '#0f172a', '#000000'] },
  delivery_ride: { primary: '#22c55e', background: '#050505', surface: 'rgba(20,20,20,0.85)', surfaceHighlight: '#3f6212', text: '#f0fdf4', textSecondary: '#4ade80', accent: '#166534', border: '#3f6212', glassBorder: 'rgba(255,255,255,0.05)', isDark: true, gradientColors: ['#000000', '#050505', '#0a0a0a'] },
  street_dogs: { primary: '#a8a29e', background: '#1c1917', surface: 'rgba(41,37,36,0.8)', surfaceHighlight: '#57534e', text: '#fafaf9', textSecondary: '#78716c', accent: '#d6d3d1', border: '#57534e', glassBorder: 'rgba(255,255,255,0.05)', isDark: true, gradientColors: ['#1c1917', '#292524', '#44403c'] },
  window_thinking: { primary: '#94a3b8', background: '#0f172a', surface: 'rgba(30,41,59,0.8)', surfaceHighlight: '#475569', text: '#f1f5f9', textSecondary: '#64748b', accent: '#cbd5e1', border: '#475569', glassBorder: 'rgba(255,255,255,0.05)', isDark: true, gradientColors: ['#0f172a', '#1e293b', '#334155'] },
  train_goodbye: { primary: '#64748b', background: '#0a0a0a', surface: 'rgba(30,30,30,0.85)', surfaceHighlight: '#404040', text: '#f5f5f5', textSecondary: '#a3a3a3', accent: '#525252', border: '#404040', glassBorder: 'rgba(255,255,255,0.05)', isDark: true, gradientColors: ['#000000', '#0a0a0a', '#171717'] },
  lonely_walk: { primary: '#404040', background: '#000000', surface: 'rgba(20,20,20,0.9)', surfaceHighlight: '#262626', text: '#e5e5e5', textSecondary: '#737373', accent: '#171717', border: '#262626', glassBorder: '#171717', isDark: true, gradientColors: ['#000000', '#0a0a0a', '#000000'] },
  city_top_view: { primary: '#facc15', background: '#020617', surface: 'rgba(15,23,42,0.8)', surfaceHighlight: '#1e293b', text: '#f1f5f9', textSecondary: '#d97706', accent: '#fbbf24', border: '#1e293b', glassBorder: 'rgba(255,255,255,0.1)', isDark: true, gradientColors: ['#020617', '#0f172a', '#1e293b'] },
  bus_stop_rain: { primary: '#94a3b8', background: '#0f172a', surface: 'rgba(30,41,59,0.7)', surfaceHighlight: 'rgba(148,163,184,0.1)', text: '#f8fafc', textSecondary: '#64748b', accent: '#cbd5e1', border: 'rgba(148,163,184,0.2)', glassBorder: 'rgba(255,255,255,0.05)', isDark: true, gradientColors: ['#0f172a', '#1e293b', '#334155'] },
  sunrise_city: { primary: '#fb923c', background: '#fff7ed', surface: 'rgba(255,255,255,0.85)', surfaceHighlight: '#ffedd5', text: '#7c2d12', textSecondary: '#ea580c', accent: '#fdba74', border: '#ffedd5', glassBorder: 'rgba(255,255,255,0.05)', isDark: false, gradientColors: ['#fff7ed', '#ffedd5', '#fed7aa'] },
  train_bridge: { primary: '#facc15', background: '#0c0a09', surface: 'rgba(41,37,36,0.7)', surfaceHighlight: '#57534e', text: '#fafaf9', textSecondary: '#d97706', accent: '#fbbf24', border: '#57534e', glassBorder: 'rgba(255,255,255,0.1)', isDark: true, gradientColors: ['#0c0a09', '#1c1917', '#44403c'] },
  subway_rush: { primary: '#64748b', background: '#0a0a0a', surface: 'rgba(20,20,20,0.85)', surfaceHighlight: '#404040', text: '#ffffff', textSecondary: '#a3a3a3', accent: '#525252', border: '#404040', glassBorder: 'rgba(255,255,255,0.1)', isDark: true, gradientColors: ['#000000', '#0a0a0a', '#171717'] },
  truck_night: { primary: '#ef4444', background: '#020617', surface: 'rgba(15,23,42,0.8)', surfaceHighlight: '#1e293b', text: '#f1f5f9', textSecondary: '#dc2626', accent: '#991b1b', border: '#1e293b', glassBorder: 'rgba(255,255,255,0.05)', isDark: true, gradientColors: ['#020617', '#0f172a', '#000000'] },
  boat_ride: { primary: '#0ea5e9', background: '#082f49', surface: 'rgba(12,74,110,0.7)', surfaceHighlight: '#075985', text: '#e0f2fe', textSecondary: '#7dd3fc', accent: '#0284c7', border: '#075985', glassBorder: 'rgba(255,255,255,0.1)', isDark: true, gradientColors: ['#082f49', '#0c4a6e', '#075985'] },
  lofi_window: { primary: '#a78bfa', background: '#1e1b4b', surface: 'rgba(30,41,59,0.7)', surfaceHighlight: '#4c1d95', text: '#f5f3ff', textSecondary: '#c4b5fd', accent: '#8b5cf6', border: '#4c1d95', glassBorder: 'rgba(255,255,255,0.1)', isDark: true, gradientColors: ['#1e1b4b', '#312e81', '#1e1b4b'] },
  neon_alley: { primary: '#f472b6', background: '#020617', surface: 'rgba(15,23,42,0.8)', surfaceHighlight: '#701a75', text: '#fef2f2', textSecondary: '#ec4899', accent: '#d946ef', border: '#701a75', glassBorder: 'rgba(255,255,255,0.1)', isDark: true, gradientColors: ['#020617', '#1e1b4b', '#000000'] },
  fog_street: { primary: '#94a3b8', background: '#0f172a', surface: 'rgba(30,41,59,0.8)', surfaceHighlight: '#334155', text: '#f1f5f9', textSecondary: '#64748b', accent: '#475569', border: '#334155', glassBorder: 'rgba(255,255,255,0.05)', isDark: true, gradientColors: ['#0f172a', '#1e293b', '#2e3440'] },
  festival_lights: { primary: '#facc15', background: '#450a0a', surface: 'rgba(69,10,10,0.7)', surfaceHighlight: '#7c2d12', text: '#fef3c7', textSecondary: '#d97706', accent: '#fbbf24', border: '#7c2d12', glassBorder: 'rgba(255,255,255,0.1)', isDark: true, gradientColors: ['#450a0a', '#78350f', '#000000'] },
  ferris_wheel: { primary: '#ec4899', background: '#0f172a', surface: 'rgba(30,41,59,0.7)', surfaceHighlight: '#701a75', text: '#fdf2f8', textSecondary: '#f472b6', accent: '#be185d', border: '#701a75', glassBorder: 'rgba(255,255,255,0.1)', isDark: true, gradientColors: ['#0f172a', '#1e1b4b', '#312e81'] },
  slow_traffic: { primary: '#ef4444', background: '#0a0a0a', surface: 'rgba(20,20,20,0.85)', surfaceHighlight: '#450a0a', text: '#fef2f2', textSecondary: '#dc2626', accent: '#991b1b', border: '#450a0a', glassBorder: 'rgba(255,255,255,0.1)', isDark: true, gradientColors: ['#000000', '#0a0a0a', '#171717'] },
};

interface ThemeContextType {
  colors: ThemeColors; currentMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const getContrastColor = (hex: string) => {
  if (!hex) return '#ffffff';
  if (hex.startsWith('rgba') || hex.startsWith('rgb')) {
    const coords = hex.match(/\d+/g);
    if (coords && coords.length >= 3) {
      const r = parseInt(coords[0], 10), g = parseInt(coords[1], 10), b = parseInt(coords[2], 10);
      const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
      return yiq >= 128 ? '#111111' : '#ffffff';
    }
    return '#ffffff';
  }
  let cleanedHex = hex.replace('#', '');
  if (cleanedHex.length === 3) cleanedHex = cleanedHex.split('').map(c => c + c).join('');
  if (cleanedHex.length !== 6) return '#ffffff';
  const r = parseInt(cleanedHex.slice(0, 2), 16), g = parseInt(cleanedHex.slice(2, 4), 16), b = parseInt(cleanedHex.slice(4, 6), 16);
  const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
  return yiq >= 128 ? '#111111' : '#ffffff';
};

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [mode, setMode] = useState<ThemeMode>('black');

  useEffect(() => {
    const loadTheme = async () => {
      const saved = await AsyncStorage.getItem('themeMode');
      if (saved && themes[saved as ThemeMode]) setMode(saved as ThemeMode);
    };
    loadTheme();
  }, []);

  const setThemeMode = async (newMode: ThemeMode) => {
    setMode(newMode);
    await AsyncStorage.setItem('themeMode', newMode);
  };

  const rawTheme = themes[mode] || themes['black'];
  const contrastText = getContrastColor(rawTheme.background);
  const computedTheme = {
    ...rawTheme,
    text: contrastText,
    textSecondary: contrastText === '#111111' ? '#444444' : '#aaaaaa',
    isDark: contrastText === '#ffffff'
  };

  return (
    <ThemeContext.Provider value={{ colors: computedTheme, currentMode: mode, setThemeMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
};
