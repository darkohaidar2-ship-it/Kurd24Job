import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  FlatList, 
  SafeAreaView, 
  ActivityIndicator,
  StatusBar,
  Platform
} from 'react-native';
import { useRouter, useIsFocused } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Bookmark, HelpCircle } from 'lucide-react-native';
import { useApp } from '../../context/AppContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { JobStorage, Job } from '../../services/JobStorage';
import JobCard from '../../components/JobCard';

export default function BookmarksScreen() {
  const router = useRouter();
  const { colors, theme, bookmarks, t, language } = useApp();
  const isRtl = language === 'ku';
  const insets = useSafeAreaInsets();

  const [savedJobs, setSavedJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const loadSavedJobs = async () => {
    setLoading(true);
    try {
      const allJobs = await JobStorage.getJobs(false);
      // Filter jobs that are in the bookmarks array
      const bookmarked = allJobs.filter(j => bookmarks.includes(j.id));
      setSavedJobs(bookmarked);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Reload bookmarks when screen becomes active or bookmarks count changes
  useEffect(() => {
    loadSavedJobs();
  }, [bookmarks]);

  const rowStyle = isRtl ? styles.rowReverse : styles.row;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} />
      
      {/* Background Gradient for Glassmorphic Glow */}
      <LinearGradient
        colors={colors.gradientBg}
        style={StyleSheet.absoluteFillObject}
      />
      
      {/* Ambient Glow Orbs */}
      {theme === 'dark' && (
        <>
          <View style={[styles.glowOrb, { top: -100, right: -100, backgroundColor: colors.primary }]} />
          <View style={[styles.glowOrb, { bottom: 50, left: -120, backgroundColor: colors.accent }]} />
        </>
      )}

      <View style={[styles.safeArea, { paddingTop: insets.top }]}>
        {/* Header */}
        <View style={[styles.header, rowStyle]}>
          <Text style={[styles.title, { color: colors.text }]}>{t.savedJobs}</Text>
          <View style={[styles.badge, { backgroundColor: colors.primaryGlow }]}>
            <Text style={[styles.badgeText, { color: colors.primary }]}>{savedJobs.length}</Text>
          </View>
        </View>

        {/* Content */}
        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : (
          <FlatList
            data={savedJobs}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <JobCard
                job={item}
                onPress={() => router.push(`/job/${item.id}`)}
              />
            )}
            style={{ flex: 1 }}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Bookmark size={48} color={colors.textMuted} style={styles.emptyIcon} />
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                  {t.noSavedJobs}
                </Text>
              </View>
            }
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  glowOrb: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    opacity: 0.18,
    filter: 'blur(80px)',
  },
  safeArea: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowReverse: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
    gap: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    minWidth: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 150,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 96,
  },
  emptyIcon: {
    marginBottom: 16,
    opacity: 0.4,
  },
  emptyText: {
    fontSize: 14,
    fontWeight: '500',
  }
});
