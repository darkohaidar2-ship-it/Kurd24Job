import React, { useState, useEffect, useCallback } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  FlatList, 
  TextInput, 
  TouchableOpacity, 
  Modal, 
  ScrollView, 
  StatusBar,
  ActivityIndicator,
  RefreshControl,
  Platform,
  Image,
  Linking,
  Alert,
  Share
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  Search, 
  Sun, 
  Moon, 
  Languages, 
  X, 
  HelpCircle, 
  Pin, 
  CheckCircle2, 
  ChevronDown, 
  ChevronUp,
  MapPin,
  Briefcase,
  Calendar,
  DollarSign,
  MessageCircle,
  Mail
} from 'lucide-react-native';
import { useApp } from '../../context/AppContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { JobStorage, Job } from '../../services/JobStorage';
import JobCard from '../../components/JobCard';
import GlassView from '../../components/GlassView';

export default function JobsFeed() {
  const router = useRouter();
  const { colors, theme, toggleTheme, language, setLanguage, t, isDemoMode, categories, cities, industries, jobTypes, experienceLevels, refreshProperties, logoUrl, getLocalizedProperty } = useApp();
  const isRtl = language === 'ku';
  const insets = useSafeAreaInsets();

  // State
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  
  // Telegram Pinned message state
  const [showPinned, setShowPinned] = useState<boolean>(true);
  const [expandedPinned, setExpandedPinned] = useState<boolean>(false);

  // Details Sheet Drawer State (Removed)

  // Search State
  const [search, setSearch] = useState<string>('');
  const [isSearching, setIsSearching] = useState<boolean>(false);

  // Apply filters logic (Search text only)
  const applyFilters = (allJobs: Job[], searchQuery: string) => {
    let result = [...allJobs];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(j => 
        (j.company && j.company.toLowerCase().includes(query)) ||
        (j.title_ku && j.title_ku.toLowerCase().includes(query)) ||
        (j.title_en && j.title_en.toLowerCase().includes(query)) ||
        (j.description_ku && j.description_ku.toLowerCase().includes(query)) ||
        (j.description_en && j.description_en.toLowerCase().includes(query))
      );
    }

    setFilteredJobs(result);
  };

  // Load jobs from Storage
  const loadJobs = async () => {
    setLoading(true);
    try {
      const data = await JobStorage.getJobs(false); // Only published
      setJobs(data);
      applyFilters(data, search);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJobs();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refreshProperties();
      const data = await JobStorage.getJobs(false);
      setJobs(data);
      applyFilters(data, search);
    } catch (e) {
      console.error(e);
    } finally {
      setRefreshing(false);
    }
  }, [search, refreshProperties]);

  const toggleLanguage = () => {
    setLanguage(language === 'ku' ? 'en' : 'ku');
  };

  // Apply handlers removed - actions reside on details page

  // UI layout configurations
  const rowStyle = isRtl ? styles.rowReverse : styles.row;
  const textStyle = isRtl ? styles.textRight : styles.textLeft;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} />
      <LinearGradient colors={colors.gradientBg} style={StyleSheet.absoluteFillObject} />
      
      {theme === 'dark' && (
        <>
          <View style={[styles.glowOrb, { top: -100, right: -100, backgroundColor: colors.primary }]} />
          <View style={[styles.glowOrb, { bottom: 50, left: -120, backgroundColor: colors.accent }]} />
        </>
      )}

      <View style={[styles.safeArea, { paddingTop: insets.top }]}>
        {/* Telegram Header / Search Bar Header */}
        <View style={[styles.tgHeader, rowStyle, { borderBottomColor: colors.border }]}>
          {isSearching ? (
            <View style={[styles.searchHeaderWrapper, rowStyle]}>
              <TouchableOpacity 
                activeOpacity={0.7} 
                style={styles.tgIconButton}
                onPress={() => {
                  setIsSearching(false);
                  setSearch('');
                  applyFilters(jobs, '');
                }}
              >
                <X size={20} color={colors.text} />
              </TouchableOpacity>
              <TextInput
                value={search}
                autoFocus={true}
                onChangeText={(text) => {
                  setSearch(text);
                  applyFilters(jobs, text);
                }}
                placeholder={language === 'ku' ? 'گەڕان بەدوای کار یان کۆمپانیا...' : 'Search jobs or companies...'}
                placeholderTextColor={colors.textMuted}
                style={[
                  styles.headerSearchInput, 
                  { 
                    color: colors.text, 
                    textAlign: isRtl ? 'right' : 'left',
                    fontFamily: font,
                  }
                ]}
              />
            </View>
          ) : (
            <>
              <View style={[styles.tgHeaderLeft, rowStyle]}>
                <Image 
                  source={logoUrl ? { uri: logoUrl } : require('../../../assets/images/logo.png')} 
                  style={styles.logoIcon} 
                />
                <View style={[styles.tgChannelInfo, isRtl ? styles.marginRight : styles.marginLeft]}>
                  <View style={[styles.tgTitleRow, rowStyle]}>
                    <Text style={[styles.tgChannelName, { color: colors.text }]}>{t.appName}</Text>
                    <CheckCircle2 size={14} color="#5288c1" fill="#FFF" style={styles.verifiedIcon} />
                  </View>
                  <Text style={[styles.tgSubs, { color: colors.textSecondary }]}>
                    {language === 'ku' ? '١٥٤،٢٠٣ سەبسکرایبەر' : '154,203 subscribers'}
                  </Text>
                </View>
              </View>

              <View style={[styles.tgHeaderRight, rowStyle]}>
                <TouchableOpacity 
                  activeOpacity={0.7} 
                  style={styles.tgIconButton}
                  onPress={() => setIsSearching(true)}
                >
                  <Search size={18} color={colors.text} />
                </TouchableOpacity>

                <TouchableOpacity 
                  activeOpacity={0.7} 
                  style={styles.tgIconButton}
                  onPress={toggleLanguage}
                >
                  <Languages size={18} color={colors.text} />
                </TouchableOpacity>

                <TouchableOpacity 
                  activeOpacity={0.7} 
                  style={styles.tgIconButton}
                  onPress={toggleTheme}
                >
                  {theme === 'dark' ? <Sun size={18} color={colors.text} /> : <Moon size={18} color={colors.text} />}
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>

        {/* Telegram Pinned Message */}
        {showPinned && (
          <View style={styles.pinnedContainer}>
            <View style={[styles.pinnedBar, rowStyle, { backgroundColor: theme === 'dark' ? 'rgba(21, 30, 40, 0.9)' : 'rgba(255, 255, 255, 0.9)', borderColor: colors.border }]}>
              <TouchableOpacity 
                activeOpacity={0.8} 
                style={[styles.pinnedContent, rowStyle]}
                onPress={() => setExpandedPinned(!expandedPinned)}
              >
                <Pin size={14} color={colors.primary} style={styles.pinnedPinIcon} />
                <View style={[styles.pinnedTextWrapper, isRtl ? styles.marginRightMini : styles.marginLeftMini]}>
                  <Text style={[styles.pinnedTitle, { color: colors.primary }, textStyle]}>
                    {language === 'ku' ? 'نامەی دەرچوو (Pinned)' : 'Pinned Message'}
                  </Text>
                  <Text numberOfLines={1} style={[styles.pinnedText, { color: colors.textSecondary }, textStyle]}>
                    {language === 'ku' 
                      ? 'ڕێنمایی پێشکەشکردن بە وەتسئەپ، ئیمەیڵ و بارکردنی سیڤی لێرە بخوێنەرەوە...' 
                      : 'Read guidelines for applying via WhatsApp, Email, and resume upload...'}
                  </Text>
                </View>
                {expandedPinned ? <ChevronUp size={16} color={colors.textSecondary} /> : <ChevronDown size={16} color={colors.textSecondary} />}
              </TouchableOpacity>

              <TouchableOpacity 
                activeOpacity={0.7} 
                style={styles.pinnedClose}
                onPress={() => setShowPinned(false)}
              >
                <X size={14} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Expanded Pinned Guidelines Card */}
            {expandedPinned && (
              <GlassView style={[styles.pinnedExpandedCard, { borderColor: colors.cardBorder }]}>
                <Text style={[styles.pinnedCardTitle, { color: colors.text }, textStyle]}>
                  📌 {language === 'ku' ? 'ڕێنمایی و ڕێساکان' : 'Welcome Guidelines'}
                </Text>
                <Text style={[styles.pinnedCardBody, { color: colors.textSecondary }, textStyle]}>
                  {language === 'ku' 
                    ? '١. هەموو هەلی کارەکان ڕاستەوخۆ دەتوانی پێشکەش بکەی.\n٢. بەشی ئەدمین بەکاربهێنە بۆ بڵاوکردنەوەی کار.'
                    : '1. You can apply to all jobs directly from the feed.\n2. Use the Admin Panel to post or manage jobs.'}
                </Text>
                {isDemoMode && (
                  <Text style={[styles.demoWarn, { color: colors.accent }]}>
                    ⚠️ {t.demoModeWarning}
                  </Text>
                )}
              </GlassView>
            )}
          </View>
        )}

        {/* Telegram Messages Feed (100% pure post viewing screen) */}
        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : (
          <FlatList
            data={filteredJobs}
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
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[colors.primary]}
                tintColor={colors.primary}
              />
            }
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <HelpCircle size={48} color={colors.textMuted} style={styles.emptyIcon} />
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                  {language === 'ku' ? 'هیچ پۆستێکی کار نەدۆزرایەوە' : 'No job posts found'}
                </Text>
              </View>
            }
          />
        )}
      </View>
    </View>
  );
}

const font = 'NRT';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  glowOrb: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    opacity: 0.12,
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
  textLeft: {
    textAlign: 'left',
  },
  textRight: {
    textAlign: 'right',
  },
  tgHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 0.5,
  },
  tgHeaderLeft: {
    alignItems: 'center',
  },
  logoIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
  },
  tgChannelInfo: {
    justifyContent: 'center',
  },
  tgTitleRow: {
    alignItems: 'center',
    gap: 4,
  },
  tgChannelName: {
    fontSize: 15,
    fontWeight: '700',
    fontFamily: font,
  },
  tgSubs: {
    fontSize: 11,
    opacity: 0.8,
    marginTop: 1,
    fontFamily: font,
  },
  verifiedIcon: {
    marginLeft: 3,
  },
  tgHeaderRight: {
    gap: 12,
  },
  tgIconButton: {
    padding: 6,
  },
  searchHeaderWrapper: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
  },
  headerSearchInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  marginLeft: {
    marginLeft: 10,
  },
  marginRight: {
    marginRight: 10,
  },
  pinnedContainer: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    zIndex: 10,
  },
  pinnedBar: {
    flexDirection: 'row',
    height: 40,
    borderRadius: 8,
    borderWidth: 0.5,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pinnedContent: {
    flex: 1,
    height: '100%',
    alignItems: 'center',
  },
  pinnedPinIcon: {
    opacity: 0.8,
  },
  pinnedTextWrapper: {
    flex: 1,
  },
  pinnedTitle: {
    fontSize: 11,
    fontWeight: '700',
    fontFamily: font,
  },
  pinnedText: {
    fontSize: 10,
    opacity: 0.9,
    marginTop: 1,
    fontFamily: font,
  },
  pinnedClose: {
    padding: 6,
  },
  marginLeftMini: {
    marginLeft: 6,
  },
  marginRightMini: {
    marginRight: 6,
  },
  pinnedExpandedCard: {
    marginTop: 6,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
  },
  pinnedCardTitle: {
    fontSize: 13,
    fontWeight: '700',
    fontFamily: font,
    marginBottom: 8,
  },
  pinnedCardBody: {
    fontSize: 11,
    lineHeight: 16,
    fontFamily: font,
  },
  demoWarn: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 8,
    fontFamily: font,
  },
  searchBarContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 6,
  },
  searchBarWrapper: {
    width: '100%',
    padding: 0,
    borderRadius: 12,
    marginBottom: 10,
  },
  searchInner: {
    paddingHorizontal: 10,
    height: 40,
  },
  searchIcon: {
    marginHorizontal: 2,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    paddingVertical: 6,
    fontWeight: '500',
    fontFamily: font,
  },
  listContainer: {
    paddingHorizontal: 0,
    paddingTop: 10,
    paddingBottom: 100, // Bottom offset to clear the absolute tab bar
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
    opacity: 0.6,
  },
  emptyText: {
    fontSize: 13,
    fontWeight: '500',
    fontFamily: font,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderBottomWidth: 0,
    maxHeight: '85%',
  },
  modalHeader: {
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    fontFamily: font,
  },
  closeBtn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterScroll: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  filterSectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginTop: 10,
    marginBottom: 8,
    fontFamily: font,
  },
  optionsGrid: {
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12,
  },
  chip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 11,
    fontWeight: '600',
    fontFamily: font,
  },
  modalFooter: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderTopWidth: 1,
    justifyContent: 'space-between',
    gap: 10,
  },
  resetBtn: {
    flex: 1,
    paddingVertical: 10,
    borderWidth: 1,
    borderRadius: 10,
    alignItems: 'center',
  },
  resetBtnText: {
    fontSize: 13,
    fontWeight: '700',
    fontFamily: font,
  },
  applyBtn: {
    flex: 2,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  applyBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFF',
    fontFamily: font,
  },
  dragHandle: {
    width: 38,
    height: 5,
    borderRadius: 3,
    backgroundColor: 'rgba(128, 128, 128, 0.4)',
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 5,
  },
  detailsSheetTitle: {
    fontSize: 20,
    fontWeight: '800',
    fontFamily: font,
  },
  detailsSheetSubtitle: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: font,
    marginTop: 2,
  },
  detailsTagsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginVertical: 10,
  },
  detailTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    gap: 4,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '700',
    fontFamily: font,
  },
  detailsInfoRow: {
    flexDirection: 'row',
    gap: 10,
    marginVertical: 10,
  },
  detailsInfoBox: {
    flex: 1,
    alignItems: 'center',
    borderRadius: 12,
    paddingVertical: 10,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  detailsInfoVal: {
    fontSize: 13,
    fontWeight: '800',
    fontFamily: font,
    marginTop: 4,
  },
  detailsInfoLbl: {
    fontSize: 11,
    fontWeight: '600',
    fontFamily: font,
  },
  detailsSection: {
    marginTop: 14,
  },
  detailsSectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    fontFamily: font,
    marginBottom: 6,
  },
  detailsBodyText: {
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.85,
    fontFamily: font,
  },
  galleryScroll: {
    gap: 8,
    marginTop: 4,
  },
  thumbnailWrapper: {
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  thumbnail: {
    width: 70,
    height: 70,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 5,
  },
  bulletPoint: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  bulletText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.85,
    fontFamily: font,
  },
  marginRightTen: {
    marginRight: 10,
  },
  marginLeftTen: {
    marginLeft: 10,
  },
  applyWhatsAppBtn: {
    flexDirection: 'row',
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  applyEmailBtn: {
    flexDirection: 'row',
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  }
});
