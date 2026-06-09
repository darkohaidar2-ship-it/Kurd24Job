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
  SafeAreaView, 
  ActivityIndicator,
  RefreshControl,
  StatusBar,
  Platform,
  Image
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Search, SlidersHorizontal, Sun, Moon, Languages, X, HelpCircle, Pin, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react-native';
import { useApp } from '../../context/AppContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { JobStorage, Job } from '../../services/JobStorage';
import JobCard from '../../components/JobCard';
import GlassView from '../../components/GlassView';

export default function JobsFeed() {
  const router = useRouter();
  const { colors, theme, toggleTheme, language, setLanguage, t, isDemoMode, categories, cities, industries, jobTypes, experienceLevels, refreshProperties, logoUrl } = useApp();
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

  // Search & Filter State
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [search, setSearch] = useState<string>('');
  const [selCity, setSelCity] = useState<string>('all');
  const [selCategory, setSelCategory] = useState<string>('all');
  const [selType, setSelType] = useState<string>('all');
  const [selExperience, setSelExperience] = useState<string>('all');
  const [selIndustry, setSelIndustry] = useState<string>('all');
  const [selDate, setSelDate] = useState<string>('all');

  // Load jobs from Storage
  const loadJobs = async () => {
    setLoading(true);
    try {
      const data = await JobStorage.getJobs(false); // Only published
      setJobs(data);
      applyFilters(data, search, selCity, selCategory, selType, selExperience, selIndustry, selDate);
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
      applyFilters(data, search, selCity, selCategory, selType, selExperience, selIndustry, selDate);
    } catch (e) {
      console.error(e);
    } finally {
      setRefreshing(false);
    }
  }, [search, selCity, selCategory, selType, selExperience, selIndustry, selDate, refreshProperties]);

  // Apply filters logic
  const applyFilters = (
    allJobs: Job[],
    searchQuery: string,
    city: string,
    category: string,
    type: string,
    experience: string,
    industry: string,
    date: string
  ) => {
    let result = [...allJobs];

    // Search Query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(j => 
        j.company.toLowerCase().includes(query) ||
        j.title_ku.toLowerCase().includes(query) ||
        j.title_en.toLowerCase().includes(query) ||
        j.description_ku.toLowerCase().includes(query) ||
        j.description_en.toLowerCase().includes(query)
      );
    }

    // City Filter
    if (city !== 'all') {
      result = result.filter(j => j.city_en.toLowerCase() === city.toLowerCase());
    }

    // Category Filter
    if (category !== 'all') {
      result = result.filter(j => j.category === category);
    }

    // Job Type Filter
    if (type !== 'all') {
      result = result.filter(j => j.type === type);
    }

    // Experience Level Filter
    if (experience !== 'all') {
      result = result.filter(j => j.experience_level === experience);
    }

    // Industry Filter
    if (industry !== 'all') {
      result = result.filter(j => j.industry === industry);
    }

    // Date Posted Filter
    if (date !== 'all') {
      const now = new Date();
      result = result.filter(j => {
        const postedDate = new Date(j.created_at);
        const diffTime = Math.abs(now.getTime() - postedDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (date === 'last24h') return diffDays <= 1;
        if (date === 'lastWeek') return diffDays <= 7;
        if (date === 'lastMonth') return diffDays <= 30;
        return true;
      });
    }

    setFilteredJobs(result);
  };

  const handleApplyFilters = () => {
    applyFilters(jobs, search, selCity, selCategory, selType, selExperience, selIndustry, selDate);
    setShowFilters(false);
  };

  const handleResetFilters = () => {
    setSearch('');
    setSelCity('all');
    setSelCategory('all');
    setSelType('all');
    setSelExperience('all');
    setSelIndustry('all');
    setSelDate('all');
    applyFilters(jobs, '', 'all', 'all', 'all', 'all', 'all', 'all');
    setShowFilters(false);
  };

  const toggleLanguage = () => {
    setLanguage(language === 'ku' ? 'en' : 'ku');
  };

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
        {/* Telegram Header */}
        <View style={[styles.tgHeader, rowStyle, { borderBottomColor: colors.border }]}>
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
            {/* Unified Search & Filter Button in Corner */}
            <TouchableOpacity 
              activeOpacity={0.7} 
              style={styles.tgIconButton}
              onPress={() => setShowFilters(true)}
            >
              <Search size={20} color={colors.text} />
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
                    ? '١. هەموو هەلی کارەکان ڕاستەوخۆ دەتوانی پێشکەش بکەی.\n٢. لە ناو پۆستەکە کلیک لە "بارکردنی سیڤی" بکە بۆ دروستکردنی بەستەر.\n٣. بەستەرەکە خۆکار لە ناو نامەی وەتسئەپ یان ئیمەیڵەکەت دادەنرێت.\n٤. بەشی ئەدمین بەکاربهێنە بۆ بڵاوکردنەوەی کار.'
                    : '1. You can apply to all jobs directly from the feed.\n2. Tap "Upload CV" inside the details view to generate a shareable link.\n3. The link will be auto-composed in your WhatsApp/Email application.\n4. Use the Admin Panel to post or manage jobs.'}
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

        {/* Combined Search & Filter Modal */}
        <Modal
          visible={showFilters}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowFilters(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: theme === 'dark' ? '#0F172A' : '#F8FAFC', borderColor: colors.cardBorder }]}>
              {/* Modal Header */}
              <View style={[styles.modalHeader, rowStyle, { borderBottomColor: colors.border }]}>
                <Text style={[styles.modalTitle, { color: colors.text }]}>
                  {language === 'ku' ? 'گەڕان و فلتەری کارەکان' : 'Search & Filter'}
                </Text>
                <TouchableOpacity 
                  activeOpacity={0.7} 
                  style={[styles.closeBtn, { backgroundColor: colors.border }]} 
                  onPress={() => setShowFilters(false)}
                >
                  <X size={16} color={colors.text} />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false} style={styles.filterScroll}>
                
                {/* Search Input Bar (Moved Inside Modal) */}
                <Text style={[styles.filterSectionTitle, { color: colors.text, marginTop: 4 }, textStyle]}>
                  {language === 'ku' ? 'گەڕان بە دەق' : 'Text Search'}
                </Text>
                <GlassView style={styles.searchBarWrapper}>
                  <View style={[styles.searchInner, rowStyle]}>
                    <Search size={18} color={colors.textMuted} style={styles.searchIcon} />
                    <TextInput
                      value={search}
                      onChangeText={setSearch}
                      placeholder={t.searchPlaceholder}
                      placeholderTextColor={colors.textMuted}
                      style={[styles.searchInput, { color: colors.text }, textStyle]}
                    />
                  </View>
                </GlassView>

                {/* 1. City Filter */}
                <Text style={[styles.filterSectionTitle, { color: colors.text }, textStyle]}>{t.city}</Text>
                <View style={[styles.optionsGrid, rowStyle]}>
                  {[{ id: 'all', name_ku: t.cities.all, name_en: t.cities.all }, ...cities].map((item) => (
                    <TouchableOpacity
                      key={item.id}
                      style={[
                        styles.chip,
                        { borderColor: colors.border },
                        selCity === item.id && { backgroundColor: colors.primary, borderColor: colors.primary }
                      ]}
                      onPress={() => setSelCity(item.id)}
                    >
                      <Text style={[styles.chipText, { color: colors.textSecondary }, selCity === item.id && { color: '#FFF' }]}>
                        {language === 'ku' ? item.name_ku : item.name_en}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Category Filter */}
                <Text style={[styles.filterSectionTitle, { color: colors.text }, textStyle]}>{t.category}</Text>
                <View style={[styles.optionsGrid, rowStyle]}>
                  {[{ id: 'all', name_ku: t.categories.all, name_en: t.categories.all }, ...categories].map((item) => (
                    <TouchableOpacity
                      key={item.id}
                      style={[
                        styles.chip,
                        { borderColor: colors.border },
                        selCategory === item.id && { backgroundColor: colors.primary, borderColor: colors.primary }
                      ]}
                      onPress={() => setSelCategory(item.id)}
                    >
                      <Text style={[styles.chipText, { color: colors.textSecondary }, selCategory === item.id && { color: '#FFF' }]}>
                        {language === 'ku' ? item.name_ku : item.name_en}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* 2. Job Type */}
                <Text style={[styles.filterSectionTitle, { color: colors.text }, textStyle]}>{t.jobType}</Text>
                <View style={[styles.optionsGrid, rowStyle]}>
                  {[{ id: 'all', name_ku: t.jobTypes.all, name_en: t.jobTypes.all }, ...jobTypes].map((item) => (
                    <TouchableOpacity
                      key={item.id}
                      style={[
                        styles.chip,
                        { borderColor: colors.border },
                        selType === item.id && { backgroundColor: colors.primary, borderColor: colors.primary }
                      ]}
                      onPress={() => setSelType(item.id)}
                    >
                      <Text style={[styles.chipText, { color: colors.textSecondary }, selType === item.id && { color: '#FFF' }]}>
                        {language === 'ku' ? item.name_ku : item.name_en}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* 3. Experience Level */}
                <Text style={[styles.filterSectionTitle, { color: colors.text }, textStyle]}>{t.experienceLevel}</Text>
                <View style={[styles.optionsGrid, rowStyle]}>
                  {[{ id: 'all', name_ku: t.experienceLevels.all, name_en: t.experienceLevels.all }, ...experienceLevels].map((item) => (
                    <TouchableOpacity
                      key={item.id}
                      style={[
                        styles.chip,
                        { borderColor: colors.border },
                        selExperience === item.id && { backgroundColor: colors.primary, borderColor: colors.primary }
                      ]}
                      onPress={() => setSelExperience(item.id)}
                    >
                      <Text style={[styles.chipText, { color: colors.textSecondary }, selExperience === item.id && { color: '#FFF' }]}>
                        {language === 'ku' ? item.name_ku : item.name_en}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* 4. Industry */}
                <Text style={[styles.filterSectionTitle, { color: colors.text }, textStyle]}>{t.industry}</Text>
                <View style={[styles.optionsGrid, rowStyle]}>
                  {[{ id: 'all', name_ku: t.industries.all, name_en: t.industries.all }, ...industries].map((item) => (
                    <TouchableOpacity
                      key={item.id}
                      style={[
                        styles.chip,
                        { borderColor: colors.border },
                        selIndustry === item.id && { backgroundColor: colors.primary, borderColor: colors.primary }
                      ]}
                      onPress={() => setSelIndustry(item.id)}
                    >
                      <Text style={[styles.chipText, { color: colors.textSecondary }, selIndustry === item.id && { color: '#FFF' }]}>
                        {language === 'ku' ? item.name_ku : item.name_en}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* 5. Date Posted */}
                <Text style={[styles.filterSectionTitle, { color: colors.text }, textStyle]}>{t.datePosted}</Text>
                <View style={[styles.optionsGrid, rowStyle]}>
                  {Object.entries(t.dateOptions).map(([key, label]) => (
                    <TouchableOpacity
                      key={key}
                      style={[
                        styles.chip,
                        { borderColor: colors.border },
                        selDate === key && { backgroundColor: colors.primary, borderColor: colors.primary }
                      ]}
                      onPress={() => setSelDate(key)}
                    >
                      <Text style={[styles.chipText, { color: colors.textSecondary }, selDate === key && { color: '#FFF' }]}>
                        {label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <View style={{ height: 40 }} />
              </ScrollView>

              {/* Action Buttons */}
              <View style={[styles.modalFooter, rowStyle, { borderTopColor: colors.border }]}>
                <TouchableOpacity 
                  activeOpacity={0.7} 
                  style={[styles.resetBtn, { borderColor: colors.border }]} 
                  onPress={handleResetFilters}
                >
                  <Text style={[styles.resetBtnText, { color: colors.textSecondary }]}>{t.resetFilters}</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  activeOpacity={0.8} 
                  style={[styles.applyBtn, { backgroundColor: colors.primary, shadowColor: colors.primary }]} 
                  onPress={handleApplyFilters}
                >
                  <Text style={styles.applyBtnText}>{t.applyFilters}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </View>
  );
}

const font = 'Vazirmatn';

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
  tgAvatarText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: font,
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
  },
  pinnedExpandedCardTitle: {
    fontSize: 13,
    fontWeight: '700',
    fontFamily: font,
    marginBottom: 8,
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
  searchRow: {
    display: 'none',
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingTop: 10,
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
  }
});
