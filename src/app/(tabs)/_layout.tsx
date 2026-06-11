import { Tabs } from 'expo-router';
import { useApp } from '../../context/AppContext';
import { Briefcase, Bookmark, Info } from 'lucide-react-native';
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
          // Fixed bottom tab bar — standard Android style
          position: 'relative',
          height: 64,
          borderTopWidth: 1,
          borderTopColor: colors.cardBorder,
          backgroundColor: theme === 'dark' ? '#12121C' : '#FFFFFF',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.08,
          shadowRadius: 8,
          elevation: 8,
          paddingBottom: Platform.OS === 'ios' ? 20 : 4,
          paddingTop: 4,
          flexDirection: isRtl ? 'row-reverse' : 'row',
        },
        tabBarItemStyle: {
          height: 56,
          paddingVertical: 4,
          justifyContent: 'center',
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '700',
          fontFamily: 'NRT',
          marginTop: 2,
        }
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t.findJobs,
          tabBarIcon: ({ color, focused }) => (
            <View style={[
              styles.tabIconWrapper,
              focused && { backgroundColor: colors.primaryGlow }
            ]}>
              <Briefcase size={22} color={color} strokeWidth={focused ? 2.5 : 2} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="bookmarks"
        options={{
          title: t.savedJobs,
          tabBarIcon: ({ color, focused }) => (
            <View style={[
              styles.tabIconWrapper,
              focused && { backgroundColor: colors.primaryGlow }
            ]}>
              <Bookmark size={22} color={color} strokeWidth={focused ? 2.5 : 2} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="about"
        options={{
          title: t.aboutUs,
          tabBarIcon: ({ color, focused }) => (
            <View style={[
              styles.tabIconWrapper,
              focused && { backgroundColor: colors.primaryGlow }
            ]}>
              <Info size={22} color={color} strokeWidth={focused ? 2.5 : 2} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="admin"
        options={{
          href: null, // Completely hidden — admin is web-only
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabIconWrapper: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  }
});
