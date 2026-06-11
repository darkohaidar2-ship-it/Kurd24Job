import { useEffect, useState } from 'react';
import { Stack, useRouter } from 'expo-router';
import * as Font from 'expo-font';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SplashScreen from 'expo-splash-screen';
import { Appearance, Platform } from 'react-native';
import { AppContextProvider } from '../context/AppContext';
import { supabase } from '../services/SupabaseClient';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    async function loadFonts() {
      try {
        // 1. Try to load cached custom settings from AsyncStorage
        const cachedSettings = await AsyncStorage.getItem('@kurd24_custom_settings');
        let fontUrl = null;
        if (cachedSettings) {
          try {
            const parsed = JSON.parse(cachedSettings);
            if (parsed.fontUrl) {
              fontUrl = parsed.fontUrl;
            }
          } catch (e) {}
        }

        // 2. Query Supabase for latest settings in parallel to check if fontUrl has changed
        let latestFontUrl = fontUrl;
        if (supabase) {
          try {
            const { data } = await supabase
              .from('system_settings')
              .select('settings')
              .eq('id', 'app-config')
              .maybeSingle();
            
            if (data && data.settings && data.settings.fontUrl) {
              latestFontUrl = data.settings.fontUrl;
            }
          } catch (e) {
            console.warn("Failed to check remote font setting on startup:", e);
          }
        }

        // 3. Register custom font or fall back to local NRT / Vazirmatn
        if (latestFontUrl) {
          console.log("Loading custom font dynamically from:", latestFontUrl);
          await Font.loadAsync({
            'NRT': { uri: latestFontUrl }
          });
        } else {
          // Load the bundled font file as 'NRT'
          // Falls back to Vazirmatn-Regular.ttf until user provides NRT font file
          await Font.loadAsync({
            'NRT': require('../../assets/fonts/Vazirmatn-Regular.ttf')
          });
        }
      } catch (err) {
        console.warn("Failed to load custom font, falling back to bundled font:", err);
        try {
          await Font.loadAsync({
            'NRT': require('../../assets/fonts/Vazirmatn-Regular.ttf')
          });
        } catch (e) {}
      } finally {
        setFontsLoaded(true);
      }
    }

    // Auto-detect system theme preference
    async function detectSystemTheme() {
      const savedTheme = await AsyncStorage.getItem('@kurd24_theme');
      if (!savedTheme) {
        // No saved preference — detect from system
        const systemScheme = Appearance.getColorScheme();
        if (systemScheme) {
          await AsyncStorage.setItem('@kurd24_theme', systemScheme);
        }
      }
    }

    detectSystemTheme();
    loadFonts();
  }, []);

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <AppContextProvider>
      <NotificationHandler />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="job/[id]" />
      </Stack>
    </AppContextProvider>
  );
}

// Push notification permission request helper
async function registerForPushNotificationsAsync() {
  let token;
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7A',
    });
  }

  if (Platform.OS !== 'web') {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      console.log('Failed to get push token for push notification!');
      return;
    }
    const projectId =
      Constants?.expoConfig?.extra?.eas?.projectId ??
      Constants?.easConfig?.projectId;
    if (projectId) {
      token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
    }
  }

  return token;
}

// Helper component inside AppContextProvider to handle router logic
function NotificationHandler() {
  const router = useRouter();

  useEffect(() => {
    async function setupNotifications() {
      try {
        // Clear badge count on startup
        if (Platform.OS !== 'web') {
          await Notifications.setBadgeCountAsync(0);
        }

        const token = await registerForPushNotificationsAsync();
        if (token && supabase) {
          const savedToken = await AsyncStorage.getItem('@kurd24_push_token');
          if (savedToken !== token) {
            const { error } = await supabase
              .from('push_tokens')
              .upsert([{ token }], { onConflict: 'token' });
            if (!error) {
              await AsyncStorage.setItem('@kurd24_push_token', token);
              console.log('Push token synced successfully:', token);
            } else {
              console.warn('Failed to sync push token:', error.message);
            }
          } else {
            console.log('Push token already synced:', token);
          }
        }
      } catch (err) {
        console.error('Error setting up push notifications:', err);
      }
    }

    setupNotifications();

    const subscription = Notifications.addNotificationResponseReceivedListener(response => {
      const jobId = response.notification.request.content.data?.jobId;
      if (jobId) {
        router.push(`/job/${jobId}`);
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  return null;
}
