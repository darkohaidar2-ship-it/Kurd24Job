import { Tabs } from 'expo-router';
import { useApp } from '../../context/AppContext';
import { Briefcase, Bookmark, Info } from 'lucide-react-native';
import { Platform, StyleSheet, View, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import React from 'react';

export default function TabLayout() {
  const { colors, theme, t, language } = useApp();
  const { bottom } = useSafeAreaInsets();
  const isRtl = language === 'ku';

  // Calculate dynamic heights to account for Android 3-button or iOS home indicators
  const tabHeight = 64 + (bottom > 0 ? bottom - 4 : 0);
  const tabPaddingBottom = bottom > 0 ? bottom : 4;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.tabIconDefault,
        headerShown: false,
        tabBarShowLabel: false, // Hide default labels under icons
        tabBarStyle: {
          position: 'relative',
          height: tabHeight,
          borderTopWidth: 1,
          borderTopColor: colors.cardBorder,
          backgroundColor: theme === 'dark' ? '#12121C' : '#FFFFFF',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.08,
          shadowRadius: 8,
          elevation: 8,
          paddingBottom: tabPaddingBottom,
          paddingTop: 4,
          flexDirection: isRtl ? 'row-reverse' : 'row',
        },
        tabBarItemStyle: {
          height: 56,
          justifyContent: 'center',
          alignItems: 'center',
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
              focused 
                ? [styles.activeCapsule, { backgroundColor: colors.primaryGlow, flexDirection: isRtl ? 'row-reverse' : 'row' }] 
                : styles.inactiveIcon
            ]}>
              <Briefcase size={18} color={focused ? colors.primary : color} strokeWidth={focused ? 2.5 : 2} />
              {focused && (
                <Text style={[styles.tabLabel, { color: colors.primary }, isRtl ? styles.marginRightMini : styles.marginLeftMini]}>
                  {t.findJobs}
                </Text>
              )}
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
              focused 
                ? [styles.activeCapsule, { backgroundColor: colors.primaryGlow, flexDirection: isRtl ? 'row-reverse' : 'row' }] 
                : styles.inactiveIcon
            ]}>
              <Bookmark size={18} color={focused ? colors.primary : color} strokeWidth={focused ? 2.5 : 2} />
              {focused && (
                <Text style={[styles.tabLabel, { color: colors.primary }, isRtl ? styles.marginRightMini : styles.marginLeftMini]}>
                  {t.savedJobs}
                </Text>
              )}
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
              focused 
                ? [styles.activeCapsule, { backgroundColor: colors.primaryGlow, flexDirection: isRtl ? 'row-reverse' : 'row' }] 
                : styles.inactiveIcon
            ]}>
              <Info size={18} color={focused ? colors.primary : color} strokeWidth={focused ? 2.5 : 2} />
              {focused && (
                <Text style={[styles.tabLabel, { color: colors.primary }, isRtl ? styles.marginRightMini : styles.marginLeftMini]}>
                  {t.aboutUs}
                </Text>
              )}
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeCapsule: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inactiveIcon: {
    padding: 8,
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '800',
    fontFamily: 'NRT',
  },
  marginLeftMini: {
    marginLeft: 6,
  },
  marginRightMini: {
    marginRight: 6,
  }
});
