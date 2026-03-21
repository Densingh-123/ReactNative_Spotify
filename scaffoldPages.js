const fs = require('fs');
const path = require('path');

const screensDir = path.join(__dirname, 'src', 'screens');
fs.mkdirSync(screensDir, { recursive: true });

const screens = [
  'HomeScreen', 'SearchScreen', 'LibraryScreen', 'PlayerScreen',
  'LoginScreen', 'RegisterScreen', 'PlaylistDetailScreen',
  'LikedSongsScreen', 'RecentlyPlayedScreen', 'StatsScreen',
  'RingtonesScreen', 'RingtoneEditScreen', 'SettingsScreen',
  'ThemesScreen', 'SupportChatScreen', 'CollabHubScreen',
  'CollabDetailScreen', 'BlendScreen', 'ArtistScreen'
];

screens.forEach(screen => {
  const content = `import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';

export default function ${screen}() {
  const { colors } = useTheme();
  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <Text style={{ color: colors.text }}>${screen} Placeholder</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' }
});
`;
  fs.writeFileSync(path.join(screensDir, `${screen}.tsx`), content);
});

console.log('Successfully scaffolded ' + screens.length + ' screens in src/screens.');
