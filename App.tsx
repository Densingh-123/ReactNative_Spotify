import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer, DefaultTheme, createNavigationContainerRef } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StatusBar, Platform } from 'react-native';

import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { AuthProvider } from './src/context/AuthContext';
import { PlayerProvider } from './src/context/PlayerContext';
import { SocialProvider } from './src/context/SocialContext';
import MainNavigator from './src/navigation/MainNavigator';

import AnimatedBackground from './src/components/AnimatedBackground';
import MiniPlayer from './src/components/ui/MiniPlayer';
import { setupNotifications, scheduleInactivityReminder } from './src/services/notificationService';

const queryClient = new QueryClient();
export const navigationRef = createNavigationContainerRef();

function AppContent() {
  const { colors } = useTheme();
  const [currentRoute, setCurrentRoute] = React.useState<string | undefined>(undefined);

  React.useEffect(() => {
    setupNotifications().catch(console.error);
    scheduleInactivityReminder().catch(console.error);
  }, []);
  
  const navTheme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      background: 'transparent',
    },
  };

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <AnimatedBackground />
      <SafeAreaProvider style={{ flex: 1, backgroundColor: 'transparent' }}>
        <NavigationContainer 
          theme={navTheme} 
          ref={navigationRef}
          onReady={() => setCurrentRoute(navigationRef.getCurrentRoute()?.name)}
          onStateChange={() => setCurrentRoute(navigationRef.getCurrentRoute()?.name)}
        >
          <MainNavigator />
          {currentRoute !== 'RingtoneEdit' && <MiniPlayer />}
        </NavigationContainer>
      </SafeAreaProvider>
    </>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <PlayerProvider>
            <SocialProvider>
              <AppContent />
            </SocialProvider>
          </PlayerProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
