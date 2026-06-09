import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import * as Font from 'expo-font';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SplashScreen from 'expo-splash-screen';
import { AppContextProvider } from '../context/AppContext';
import { supabase } from '../services/SupabaseClient';

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

        // 3. Register custom font or fall back to local Vazirmatn
        if (latestFontUrl) {
          console.log("Loading custom font dynamically from:", latestFontUrl);
          await Font.loadAsync({
            'Vazirmatn': { uri: latestFontUrl }
          });
        } else {
          await Font.loadAsync({
            'Vazirmatn': require('../../assets/fonts/Vazirmatn-Regular.ttf')
          });
        }
      } catch (err) {
        console.warn("Failed to load custom font, falling back to local Vazirmatn:", err);
        try {
          await Font.loadAsync({
            'Vazirmatn': require('../../assets/fonts/Vazirmatn-Regular.ttf')
          });
        } catch (e) {}
      } finally {
        setFontsLoaded(true);
      }
    }

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
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="job/[id]" />
      </Stack>
    </AppContextProvider>
  );
}
