import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import BottomTabNavigator from './BottomTabNavigator';

import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import PlayerScreen from '../screens/PlayerScreen';
import PlaylistDetailScreen from '../screens/PlaylistDetailScreen';
import LikedSongsScreen from '../screens/LikedSongsScreen';
import RecentlyPlayedScreen from '../screens/RecentlyPlayedScreen';
import StatsScreen from '../screens/StatsScreen';
import RingtonesScreen from '../screens/RingtonesScreen';
import RingtoneEditScreen from '../screens/RingtoneEditScreen';
import ThemesScreen from '../screens/ThemesScreen';
import SupportChatScreen from '../screens/SupportChatScreen';
import CollaborationHubScreen from '../screens/CollaborationHubScreen';
import CollabDetailScreen from '../screens/CollabDetailScreen';
import BlendScreen from '../screens/BlendScreen';
import ArtistScreen from '../screens/ArtistScreen';
import DownloadsScreen from '../screens/DownloadsScreen';
import PlaylistManagementScreen from '../screens/PlaylistManagementScreen';
import GenreDetailScreen from '../screens/GenreDetailScreen';
import { useAuth } from '../context/AuthContext';
import CinematicLoader from '../components/ui/CinematicLoader';

const Stack = createNativeStackNavigator();

export default function MainNavigator() {
  const { user, isLoading } = useAuth();

  if (isLoading) return <CinematicLoader />;

  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      {!user ? (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </>
      ) : (
        <>
          <Stack.Screen name="MainTabs" component={BottomTabNavigator} />
          <Stack.Screen name="Player" component={PlayerScreen} options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
          <Stack.Screen name="PlaylistDetail" component={PlaylistDetailScreen} />
          <Stack.Screen name="LikedSongs" component={LikedSongsScreen} />
          <Stack.Screen name="RecentlyPlayed" component={RecentlyPlayedScreen} />
          <Stack.Screen name="Stats" component={StatsScreen} />
          <Stack.Screen name="Ringtones" component={RingtonesScreen} />
          <Stack.Screen name="RingtoneEdit" component={RingtoneEditScreen} />
          <Stack.Screen name="Themes" component={ThemesScreen} />
          <Stack.Screen name="SupportChat" component={SupportChatScreen} />
          <Stack.Screen name="CollabHub" component={CollaborationHubScreen} />
          <Stack.Screen name="CollabDetail" component={CollabDetailScreen} />
          <Stack.Screen name="Blend" component={BlendScreen} />
          <Stack.Screen name="Artist" component={ArtistScreen} />
          <Stack.Screen name="Downloads" component={DownloadsScreen} />
          <Stack.Screen name="PlaylistManagement" component={PlaylistManagementScreen} />
          <Stack.Screen name="GenreDetail" component={GenreDetailScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}
