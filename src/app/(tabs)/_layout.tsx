import { Tabs } from 'expo-router';
import { useApp } from '../../context/AppContext';
import { Briefcase, Bookmark, ShieldAlert } from 'lucide-react-native';
import { BlurView } from 'expo-blur';
import { Platform, StyleSheet, View } from 'react-native';
import React from 'react';

export default function TabLayout() {
  const { colors, theme, t, language } = useApp();
  const isRtl = language === 'ku';

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.tabIconDefault,
        headerShown: false,
        tabBarStyle: {
          position: 'absolute',
          bottom: Platform.OS === 'ios' ? 24 : 16,
          left: 16,
          right: 16,
          height: 64,
          borderRadius: 20,
          borderWidth: 1,
          borderColor: colors.cardBorder,
          backgroundColor: theme === 'dark' ? 'rgba(15, 23, 42, 0.75)' : 'rgba(255, 255, 255, 0.8)',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.1,
          shadowRadius: 15,
          elevation: 5,
          paddingBottom: 0,
          // Support RTL layouts dynamically if tab bar is horizontal
          flexDirection: isRtl ? 'row-reverse' : 'row',
        },
        tabBarBackground: () => (
          Platform.OS === 'ios' ? (
            <BlurView 
              intensity={80} 
              tint={theme === 'dark' ? 'dark' : 'light'} 
              style={[StyleSheet.absoluteFill, { borderRadius: 20, overflow: 'hidden' }]} 
            />
          ) : null
        ),
        tabBarItemStyle: {
          height: 52,
          paddingVertical: 6,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: -2,
        }
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t.findJobs,
          tabBarIcon: ({ color, focused }) => (
            <Briefcase size={20} color={color} strokeWidth={focused ? 2.5 : 2} />
          ),
        }}
      />
      <Tabs.Screen
        name="bookmarks"
        options={{
          title: t.savedJobs,
          tabBarIcon: ({ color, focused }) => (
            <Bookmark size={20} color={color} strokeWidth={focused ? 2.5 : 2} />
          ),
        }}
      />
      <Tabs.Screen
        name="admin"
        options={{
          href: null, // Hides the Admin panel tab from regular mobile users
          title: t.adminPanel,
          tabBarIcon: ({ color, focused }) => (
            <ShieldAlert size={20} color={color} strokeWidth={focused ? 2.5 : 2} />
          ),
        }}
      />
    </Tabs>
  );
}
