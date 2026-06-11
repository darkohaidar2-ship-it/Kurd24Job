import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  Modal, 
  TextInput, 
  ScrollView, 
  SafeAreaView, 
  ActivityIndicator,
  Switch,
  Alert,
  StatusBar,
  Platform
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useApp } from '../../context/AppContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { JobStorage, Job } from '../../services/JobStorage';
import JobCard from '../../components/JobCard';
import GlassView from '../../components/GlassView';
import { Plus, X, PlusCircle, CheckCircle, BarChart2, Eye, Send, ShieldAlert, FileText, RotateCcw } from 'lucide-react-native';

export default function AdminScreen() {
  const router = useRouter();
  const { colors, theme, t, language, categories, cities, industries, jobTypes, experienceLevels, refreshProperties } = useApp();
  const isRtl = language === 'ku';
  const insets = useSafeAreaInsets();

  // State
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showFormModal, setShowFormModal] = useState<boolean>(false);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [jobToDelete, setJobToDelete] = useState<string | null>(null);

  // Form State
  const [editingJobId, setEditingJobId] = useState<string | null>(null);
  const [titleKu, setTitleKu] = useState<string>('');
  const [titleEn, setTitleEn] = useState<string>('');
  const [company, setCompany] = useState<string>('');
  const [logoUrl, setLogoUrl] = useState<string>('');
  const [images, setImages] = useState<string[]>(['', '', '']);
  const [industry, setIndustry] = useState<string>('tech');
  const [selectedCities, setSelectedCities] = useState<string[]>(['erbil']);
  const [isVip, setIsVip] = useState<boolean>(false);
  const [isPinned, setIsPinned] = useState<boolean>(false);
  const [category, setCategory] = useState<string>('software');
  const [type, setType] = useState<string>('fullTime');
  const [experienceLevel, setExperienceLevel] = useState<string>('junior');
  const [salary, setSalary] = useState<string>('');
  const [descriptionKu, setDescriptionKu] = useState<string>('');
  const [descriptionEn, setDescriptionEn] = useState<string>('');
  const [requirementsKu, setRequirementsKu] = useState<string>('');
  const [requirementsEn, setRequirementsEn] = useState<string>('');
  const [whatsapp, setWhatsapp] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [status, setStatus] = useState<'draft' | 'published'>('published');

  // Stats Analytics
  const [stats, setStats] = useState({
    total: 0,
    views: 0,
    clicks: 0,
    drafts: 0,
    published: 0
  });

  const loadData = async () => {
    setLoading(true);
    try {
      await refreshProperties();
      const allJobs = await JobStorage.getJobs(true); // Get drafts too
      setJobs(allJobs);
      
      // Calculate Stats
      const total = allJobs.length;
      let views = 0;
      let clicks = 0;
      let drafts = 0;
      let published = 0;
      
      allJobs.forEach(j => {
        views += j.views || 0;
        clicks += j.clicks || 0;
        if (j.status === 'draft') drafts++;
        else published++;
      });

      setStats({ total, views, clicks, drafts, published });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleResetDatabase = () => {
    Alert.alert(
      language === 'ku' ? 'تەئکیدکردنەوە' : 'Confirm Reset',
      language === 'ku' 
        ? 'ئایا دڵنیای لە پاککردنەوەی هەموو داتاکان و گەڕاندنەوەی ١٠ کارە تاقیکارییەکە؟' 
        : 'Are you sure you want to delete all current jobs and restore the 10 test jobs?',
      [
        { text: t.cancel, style: 'cancel' },
        { 
          text: t.yes, 
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            const success = await JobStorage.resetDatabaseToMock();
            if (success) {
              await loadData();
              Alert.alert(
                language === 'ku' ? 'سەرکەوتوو بوو' : 'Success',
                language === 'ku' ? 'داتاکان بە سەرکەوتوویی نوێکرانەوە بۆ ١٠ کار.' : 'Database has been successfully reset to 10 test jobs.'
              );
            } else {
              Alert.alert(
                language === 'ku' ? 'خەتەر' : 'Error',
                language === 'ku' ? 'کێشەیەک ڕوویدا لە کاتی ڕێستکردندا' : 'An error occurred during database reset.'
              );
            }
            setLoading(false);
          }
        }
      ]
    );
  };

  const openAddModal = () => {
    setEditingJobId(null);
    setTitleKu('');
    setTitleEn('');
    setCompany('');
    setLogoUrl('');
    setIndustry('tech');
    setSelectedCities(['erbil']);
    setIsVip(false);
    setIsPinned(false);
    setCategory('software');
    setType('fullTime');
    setExperienceLevel('junior');
    setSalary('');
    setDescriptionKu('');
    setDescriptionEn('');
    setRequirementsKu('');
    setRequirementsEn('');
    setWhatsapp('');
    setEmail('');
    setStatus('published');
    setImages(['', '', '']);
    setShowFormModal(true);
  };

  const openEditModal = (job: Job) => {
    setEditingJobId(job.id);
    setTitleKu(job.title_ku);
    setTitleEn(job.title_en);
    setCompany(job.company);
    setLogoUrl(job.logo_url || '');
    setIndustry(job.industry);
    
    setIsVip(job.is_vip || false);
    setIsPinned(job.is_pinned || false);
    
    let parsedCities: string[] = [];
    const rawCity = job.city_en || 'erbil';
    if (rawCity.trim().startsWith('[') && rawCity.trim().endsWith(']')) {
      try {
        parsedCities = JSON.parse(rawCity);
      } catch (e) {
        parsedCities = [rawCity];
      }
    } else if (rawCity.includes(',')) {
      parsedCities = rawCity.split(',').map(s => s.trim());
    } else {
      parsedCities = [rawCity];
    }
    setSelectedCities(parsedCities);

    setCategory(job.category);
    setType(job.type);
    setExperienceLevel(job.experience_level);
    setSalary(job.salary);
    setDescriptionKu(job.description_ku);
    setDescriptionEn(job.description_en);
    setRequirementsKu(job.requirements_ku);
    setRequirementsEn(job.requirements_en);
    setWhatsapp(job.whatsapp);
    setEmail(job.email);
    setStatus(job.status);
    
    // Ensure we have at least 3 images represented, pad with empty strings
    const jobImgs = job.images || [];
    const editImgs = [...jobImgs];
    while (editImgs.length < 3) {
      editImgs.push('');
    }
    setImages(editImgs);
    
    setShowFormModal(true);
  };

  const handleDeletePress = (jobId: string) => {
    setJobToDelete(jobId);
    setShowDeleteModal(true);
  };

  const confirmDeleteJob = async () => {
    if (jobToDelete) {
      const success = await JobStorage.deleteJob(jobToDelete);
      if (success) {
        loadData();
      }
      setShowDeleteModal(false);
      setJobToDelete(null);
    }
  };

  const handleSaveJob = async () => {
    const finalCompany = company.trim() || 'Kurd24 Employer';
    const finalTitleKu = titleKu.trim() || titleEn.trim();
    const finalTitleEn = titleEn.trim() || titleKu.trim();

    if (!finalTitleKu && !finalTitleEn) {
      Alert.alert(
        language === 'ku' ? 'ئاگاداری' : 'Alert',
        language === 'ku' ? 'تکایە ناونیشانی کار بنووسە (کوردی یان ئینگلیزی)' : 'Please fill in at least one Job Title (Kurdish or English)'
      );
      return;
    }

    if (!finalCompany) {
      Alert.alert(
        language === 'ku' ? 'ئاگاداری' : 'Alert',
        language === 'ku' ? 'تکایە ناوی کۆمپانیا بنووسە' : 'Please fill in the Company Name'
      );
      return;
    }

    const filteredImages = images.map(img => img.trim()).filter(img => img !== '');

    const jobData = {
      title_ku: finalTitleKu || 'ڕیکلامی کار',
      title_en: finalTitleEn || 'Job Announcement',
      company: finalCompany,
      logo_url: logoUrl.trim() || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80',
      images: filteredImages,
      industry,
      city_ku: JSON.stringify(selectedCities),
      city_en: JSON.stringify(selectedCities),
      category,
      type,
      experience_level: experienceLevel,
      salary: salary.trim() || 'Discussable (ڕێککەوتن)',
      description_ku: descriptionKu.trim() || 'پێویستی و مەرجەکانی ئەم هەلی کارە بەستراوە بە لێهاتوویی پێشکەشکار. تکایە پەیوەندی بکەن بۆ زانیاری.',
      description_en: descriptionEn.trim() || 'Job description and details depend on applicant capabilities. Contact for more info.',
      requirements_ku: requirementsKu.trim() || 'مەرجەکان لە کاتی چاوپێکەوتن دیاری دەکرێن.',
      requirements_en: requirementsEn.trim() || 'Requirements will be discussed in the interview.',
      whatsapp: whatsapp.trim() || '9647501234567',
      email: email.trim() || 'careers@kurd24.job',
      status,
      is_vip: isVip,
      is_pinned: isPinned
    };

    if (editingJobId) {
      // Edit
      await JobStorage.updateJob(editingJobId, jobData);
    } else {
      // Create
      await JobStorage.createJob(jobData);
    }

    setShowFormModal(false);
    loadData();
  };

  // Sync city selection keys
  const handleCityToggle = (cityKey: string) => {
    if (selectedCities.includes(cityKey)) {
      if (selectedCities.length > 1) {
        setSelectedCities(selectedCities.filter(c => c !== cityKey));
      }
    } else {
      setSelectedCities([...selectedCities, cityKey]);
    }
  };

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
        {/* Header */}
        <View style={[styles.header, rowStyle]}>
          <View style={[styles.headerLeft, rowStyle]}>
            <ShieldAlert size={22} color={colors.primary} style={styles.headerIcon} />
            <Text style={[styles.title, { color: colors.text }]}>{t.adminPanel}</Text>
          </View>

          <TouchableOpacity 
            activeOpacity={0.8} 
            style={[styles.addButton, { backgroundColor: colors.primary }]}
            onPress={openAddModal}
          >
            <Plus size={18} color="#FFF" style={styles.plusIcon} />
            <Text style={styles.addButtonText}>{t.addNewJob}</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : (
          <ScrollView 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContainer}
          >
            {/* Analytics Dashboard Grid */}
            <Text style={[styles.sectionTitle, { color: colors.text }, textStyle]}>{t.analyticsTitle}</Text>
            
            <View style={[styles.statsGrid, rowStyle]}>
              <GlassView style={styles.statBox}>
                <Text style={[styles.statNum, { color: colors.text }]}>{stats.total}</Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{t.totalJobs}</Text>
              </GlassView>
              <GlassView style={styles.statBox}>
                <Text style={[styles.statNum, { color: colors.primary }]}>{stats.views}</Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{t.totalViews}</Text>
              </GlassView>
              <GlassView style={styles.statBox}>
                <Text style={[styles.statNum, { color: colors.accent }]}>{stats.clicks}</Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{t.totalClicks}</Text>
              </GlassView>
            </View>

            {/* Custom Comparative Bar Charts */}
            <GlassView style={styles.chartCard}>
              <View style={[styles.chartHeader, rowStyle]}>
                <BarChart2 size={16} color={colors.primary} />
                <Text style={[styles.chartTitle, { color: colors.text }, isRtl ? styles.marginRightTen : styles.marginLeftTen]}>
                  {language === 'ku' ? 'ئاماری بینین بەرامبەر پێشکەشکردن' : 'Views vs Applications'}
                </Text>
              </View>

              {/* Views Bar */}
              <View style={styles.chartBarWrapper}>
                <View style={[styles.barLabelRow, rowStyle]}>
                  <Text style={[styles.barLabel, { color: colors.textSecondary }]}>{t.totalViews}</Text>
                  <Text style={[styles.barVal, { color: colors.primary }]}>{stats.views}</Text>
                </View>
                <View style={[styles.barBg, { backgroundColor: colors.border }]}>
                  <View style={[
                    styles.barFill, 
                    { 
                      backgroundColor: colors.primary, 
                      width: stats.views > 0 ? `${Math.min(100, (stats.views / (stats.views + stats.clicks || 1)) * 100)}%` : '0%' 
                    }
                  ]} />
                </View>
              </View>

              {/* Clicks Bar */}
              <View style={styles.chartBarWrapper}>
                <View style={[styles.barLabelRow, rowStyle]}>
                  <Text style={[styles.barLabel, { color: colors.textSecondary }]}>{t.totalClicks}</Text>
                  <Text style={[styles.barVal, { color: colors.accent }]}>{stats.clicks}</Text>
                </View>
                <View style={[styles.barBg, { backgroundColor: colors.border }]}>
                  <View style={[
                    styles.barFill, 
                    { 
                      backgroundColor: colors.accent, 
                      width: stats.clicks > 0 ? `${Math.min(100, (stats.clicks / (stats.views + stats.clicks || 1)) * 100)}%` : '0%' 
                    }
                  ]} />
                </View>
              </View>

              {/* Drafts vs Published */}
              <View style={[styles.chartFooterRow, rowStyle]}>
                <Text style={[styles.footerStat, { color: colors.textSecondary }]}>
                  {t.publishedCount}: <Text style={{ color: colors.success, fontWeight: '700' }}>{stats.published}</Text>
                </Text>
                <Text style={[styles.footerStat, { color: colors.textSecondary }, isRtl ? styles.marginRightTen : styles.marginLeftTen]}>
                  {t.draftsCount}: <Text style={{ color: colors.primary, fontWeight: '700' }}>{stats.drafts}</Text>
                </Text>
              </View>
            </GlassView>

            {/* Reset DB Card */}
            <GlassView style={{ padding: 14, borderRadius: 16, marginBottom: 16, marginTop: 4, borderStyle: 'dashed', borderWidth: 1.5, borderColor: colors.primaryGlow }}>
              <View style={[rowStyle, { justifyContent: 'space-between', gap: 10 }]}>
                <View style={{ flex: 1 }}>
                  <Text style={[{ fontSize: 13, fontWeight: '700', color: colors.text }, textStyle]}>
                    {language === 'ku' ? 'ڕێستکردن و پاککردنەوەی کارەکان' : 'Reset & Clear Jobs'}
                  </Text>
                  <Text style={[{ fontSize: 10, color: colors.textSecondary, marginTop: 2 }, textStyle]}>
                    {language === 'ku' ? 'هەموو کارەکان دەسڕێنەوە و ١٠ هەلی کاری تاقیکاری جێگیر دەکرێنەوە.' : 'Wipe all jobs and restore the 10 default test jobs.'}
                  </Text>
                </View>
                <TouchableOpacity
                  activeOpacity={0.8}
                  style={[rowStyle, { backgroundColor: colors.accent, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 10, gap: 6 }]}
                  onPress={handleResetDatabase}
                >
                  <RotateCcw size={12} color="#FFF" />
                  <Text style={{ color: '#FFF', fontSize: 11, fontWeight: '700' }}>
                    {t.resetToMock}
                  </Text>
                </TouchableOpacity>
              </View>
            </GlassView>

            {/* Admin Jobs List */}
            <Text style={[styles.sectionTitle, { color: colors.text }, textStyle, { marginTop: 12 }]}>
              {language === 'ku' ? 'بەڕێوەبردنی کارەکان' : 'Manage Jobs'}
            </Text>

            {jobs.map((item) => (
              <JobCard
                key={item.id}
                job={item}
                isAdmin={true}
                onPress={() => router.push(`/job/${item.id}`)}
                onEdit={() => openEditModal(item)}
                onDelete={() => handleDeletePress(item.id)}
              />
            ))}
            <View style={{ height: 160 }} />
          </ScrollView>
        )}

        {/* Add / Edit Form Modal */}
        <Modal
          visible={showFormModal}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowFormModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: theme === 'dark' ? '#0F172A' : '#F8FAFC', borderColor: colors.cardBorder }]}>
              <View style={[styles.modalHeader, rowStyle, { borderBottomColor: colors.border }]}>
                <Text style={[styles.modalTitle, { color: colors.text }]}>
                  {editingJobId ? t.editJob : t.addNewJob}
                </Text>
                <TouchableOpacity 
                  activeOpacity={0.7} 
                  style={[styles.closeBtn, { backgroundColor: colors.border }]} 
                  onPress={() => setShowFormModal(false)}
                >
                  <X size={16} color={colors.text} />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false} style={styles.formScroll}>
                {/* Status Toggle (Draft / Published) */}
                <View style={[styles.formRow, rowStyle, { justifyContent: 'space-between', marginBottom: 18 }]}>
                  <Text style={[styles.inputLabel, { color: colors.text, marginBottom: 0 }]}>{t.status}</Text>
                  <View style={[styles.row, { gap: 8 }]}>
                    <Text style={{ color: colors.textSecondary, fontSize: 13, fontWeight: '600' }}>
                      {status === 'draft' ? t.draft : t.published}
                    </Text>
                    <Switch
                      value={status === 'published'}
                      onValueChange={(val) => setStatus(val ? 'published' : 'draft')}
                      trackColor={{ false: colors.border, true: colors.primaryGlow }}
                      thumbColor={status === 'published' ? colors.primary : colors.textMuted}
                    />
                  </View>
                </View>

                {/* VIP Toggle */}
                <View style={[styles.formRow, rowStyle, { justifyContent: 'space-between', marginBottom: 18 }]}>
                  <Text style={[styles.inputLabel, { color: colors.text, marginBottom: 0 }]}>{language === 'ku' ? 'ڕیکلامی VIP' : 'VIP Ad'}</Text>
                  <View style={[styles.row, { gap: 8 }]}>
                    <Text style={{ color: colors.textSecondary, fontSize: 13, fontWeight: '600' }}>
                      {isVip ? (language === 'ku' ? 'بەڵێ' : 'Yes') : (language === 'ku' ? 'نەخێر' : 'No')}
                    </Text>
                    <Switch
                      value={isVip}
                      onValueChange={setIsVip}
                      trackColor={{ false: colors.border, true: '#FFB800' }}
                      thumbColor={isVip ? '#FFB800' : colors.textMuted}
                    />
                  </View>
                </View>

                {/* Pinned Toggle */}
                <View style={[styles.formRow, rowStyle, { justifyContent: 'space-between', marginBottom: 18 }]}>
                  <Text style={[styles.inputLabel, { color: colors.text, marginBottom: 0 }]}>{language === 'ku' ? 'جێگیرکردن (Pin)' : 'Pin Post'}</Text>
                  <View style={[styles.row, { gap: 8 }]}>
                    <Text style={{ color: colors.textSecondary, fontSize: 13, fontWeight: '600' }}>
                      {isPinned ? (language === 'ku' ? 'بەڵێ' : 'Yes') : (language === 'ku' ? 'نەخێر' : 'No')}
                    </Text>
                    <Switch
                      value={isPinned}
                      onValueChange={setIsPinned}
                      trackColor={{ false: colors.border, true: colors.primaryGlow }}
                      thumbColor={isPinned ? colors.primary : colors.textMuted}
                    />
                  </View>
                </View>

                {/* Title Kurdish */}
                <Text style={[styles.inputLabel, { color: colors.text }, textStyle]}>{t.titleKu} (ئارەزوومەندانە - Optional)</Text>
                <TextInput
                  value={titleKu}
                  onChangeText={setTitleKu}
                  placeholder="گەشەپێدەری ڕیاکت نەیتیڤ..."
                  placeholderTextColor={colors.textMuted}
                  style={[styles.input, { color: colors.text, borderColor: colors.border }, textStyle]}
                />

                {/* Title English */}
                <Text style={[styles.inputLabel, { color: colors.text }, textStyle]}>{t.titleEn} (ئارەزوومەندانە - Optional)</Text>
                <TextInput
                  value={titleEn}
                  onChangeText={setTitleEn}
                  placeholder="React Native Developer..."
                  placeholderTextColor={colors.textMuted}
                  style={[styles.input, { color: colors.text, borderColor: colors.border }, styles.textLeft]}
                />

                {/* Company Name */}
                <Text style={[styles.inputLabel, { color: colors.text }, textStyle]}>{t.companyName} *</Text>
                <TextInput
                  value={company}
                  onChangeText={setCompany}
                  placeholder="Kurd24 Company..."
                  placeholderTextColor={colors.textMuted}
                  style={[styles.input, { color: colors.text, borderColor: colors.border }, textStyle]}
                />

                {/* Logo URL */}
                <Text style={[styles.inputLabel, { color: colors.text }, textStyle]}>{t.logoUrl}</Text>
                <TextInput
                  value={logoUrl}
                  onChangeText={setLogoUrl}
                  placeholder="https://example.com/logo.png"
                  placeholderTextColor={colors.textMuted}
                  style={[styles.input, { color: colors.text, borderColor: colors.border }, styles.textLeft]}
                />

                {/* Image URLs */}
                <Text style={[styles.inputLabel, { color: colors.text }, textStyle]}>
                  {language === 'ku' ? 'بەستەری وێنەکان' : 'Image URLs'}
                </Text>
                {images.map((imgUrl, index) => (
                  <View key={index} style={[rowStyle, { marginBottom: 8, gap: 8 }]}>
                    <TextInput
                      value={imgUrl}
                      onChangeText={(val) => {
                        const newImgs = [...images];
                        newImgs[index] = val;
                        setImages(newImgs);
                      }}
                      placeholder={`https://example.com/image-${index + 1}.png`}
                      placeholderTextColor={colors.textMuted}
                      style={[styles.input, { flex: 1, marginBottom: 0, color: colors.text, borderColor: colors.border }, styles.textLeft]}
                    />
                    {images.length > 3 && (
                      <TouchableOpacity
                        activeOpacity={0.7}
                        style={{ padding: 10, borderRadius: 8, backgroundColor: colors.border, justifyContent: 'center', alignItems: 'center' }}
                        onPress={() => {
                          const newImgs = images.filter((_, idx) => idx !== index);
                          setImages(newImgs);
                        }}
                      >
                        <X size={16} color={colors.accent} />
                      </TouchableOpacity>
                    )}
                  </View>
                ))}
                
                <TouchableOpacity
                  activeOpacity={0.8}
                  style={[rowStyle, { alignSelf: 'flex-start', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8, borderStyle: 'dashed', borderWidth: 1, borderColor: colors.primary, gap: 4, marginBottom: 14 }]}
                  onPress={() => setImages([...images, ''])}
                >
                  <PlusCircle size={14} color={colors.primary} />
                  <Text style={{ fontSize: 11, fontWeight: '700', color: colors.primary }}>
                    {language === 'ku' ? 'زیادکردنی وێنەی تر' : 'Add More Images'}
                  </Text>
                </TouchableOpacity>

                {/* Salary */}
                <Text style={[styles.inputLabel, { color: colors.text }, textStyle]}>{t.salary} (ئارەزوومەندانە - Optional)</Text>
                <TextInput
                  value={salary}
                  onChangeText={setSalary}
                  placeholder="e.g. $1,200 - $1,500 / Month"
                  placeholderTextColor={colors.textMuted}
                  style={[styles.input, { color: colors.text, borderColor: colors.border }, textStyle]}
                />

                {/* City Picker Grid */}
                <Text style={[styles.inputLabel, { color: colors.text }, textStyle]}>{t.city} (ئارەزوومەندانە - Optional)</Text>
                <View style={[styles.pickerGrid, rowStyle]}>
                  {cities.map((item) => {
                    const isSelected = selectedCities.includes(item.id);
                    return (
                      <TouchableOpacity
                        key={item.id}
                        style={[
                          styles.pickerChip,
                          { borderColor: colors.border },
                          isSelected && { backgroundColor: colors.primaryGlow, borderColor: colors.primary }
                        ]}
                        onPress={() => handleCityToggle(item.id)}
                      >
                        <Text style={[styles.pickerChipText, { color: colors.textSecondary }, isSelected && { color: colors.primary, fontWeight: '700' }]}>
                          {language === 'ku' ? item.name_ku : item.name_en}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* Job Type Grid */}
                <Text style={[styles.inputLabel, { color: colors.text }, textStyle]}>{t.jobType} (ئارەزوومەندانە - Optional)</Text>
                <View style={[styles.pickerGrid, rowStyle]}>
                  {jobTypes.map((item) => (
                    <TouchableOpacity
                      key={item.id}
                      style={[
                        styles.pickerChip,
                        { borderColor: colors.border },
                        type === item.id && { backgroundColor: colors.primaryGlow, borderColor: colors.primary }
                      ]}
                      onPress={() => setType(item.id)}
                    >
                      <Text style={[styles.pickerChipText, { color: colors.textSecondary }, type === item.id && { color: colors.primary, fontWeight: '700' }]}>
                        {language === 'ku' ? item.name_ku : item.name_en}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Experience Grid */}
                <Text style={[styles.inputLabel, { color: colors.text }, textStyle]}>{t.experienceLevel} (ئارەزوومەندانە - Optional)</Text>
                <View style={[styles.pickerGrid, rowStyle]}>
                  {experienceLevels.map((item) => (
                    <TouchableOpacity
                      key={item.id}
                      style={[
                        styles.pickerChip,
                        { borderColor: colors.border },
                        experienceLevel === item.id && { backgroundColor: colors.primaryGlow, borderColor: colors.primary }
                      ]}
                      onPress={() => setExperienceLevel(item.id)}
                    >
                      <Text style={[styles.pickerChipText, { color: colors.textSecondary }, experienceLevel === item.id && { color: colors.primary, fontWeight: '700' }]}>
                        {language === 'ku' ? item.name_ku : item.name_en}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Industry Grid */}
                <Text style={[styles.inputLabel, { color: colors.text }, textStyle]}>{t.industry} (ئارەزوومەندانە - Optional)</Text>
                <View style={[styles.pickerGrid, rowStyle]}>
                  {industries.map((item) => (
                    <TouchableOpacity
                      key={item.id}
                      style={[
                        styles.pickerChip,
                        { borderColor: colors.border },
                        industry === item.id && { backgroundColor: colors.primaryGlow, borderColor: colors.primary }
                      ]}
                      onPress={() => setIndustry(item.id)}
                    >
                      <Text style={[styles.pickerChipText, { color: colors.textSecondary }, industry === item.id && { color: colors.primary, fontWeight: '700' }]}>
                        {language === 'ku' ? item.name_ku : item.name_en}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Category Grid */}
                <Text style={[styles.inputLabel, { color: colors.text }, textStyle]}>{t.category} (ئارەزوومەندانە - Optional)</Text>
                <View style={[styles.pickerGrid, rowStyle]}>
                  {categories.map((item) => (
                    <TouchableOpacity
                      key={item.id}
                      style={[
                        styles.pickerChip,
                        { borderColor: colors.border },
                        category === item.id && { backgroundColor: colors.primaryGlow, borderColor: colors.primary }
                      ]}
                      onPress={() => setCategory(item.id)}
                    >
                      <Text style={[styles.pickerChipText, { color: colors.textSecondary }, category === item.id && { color: colors.primary, fontWeight: '700' }]}>
                        {language === 'ku' ? item.name_ku : item.name_en}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Description Kurdish */}
                <Text style={[styles.inputLabel, { color: colors.text }, textStyle]}>{t.descKu} (ئارەزوومەندانە - Optional)</Text>
                <TextInput
                  value={descriptionKu}
                  onChangeText={setDescriptionKu}
                  placeholder="دەربارەی کارەکە بە کوردی بنووسە..."
                  placeholderTextColor={colors.textMuted}
                  multiline={true}
                  numberOfLines={4}
                  style={[styles.textArea, { color: colors.text, borderColor: colors.border }, textStyle]}
                />

                {/* Description English */}
                <Text style={[styles.inputLabel, { color: colors.text }, textStyle]}>{t.descEn} (ئارەزوومەندانە - Optional)</Text>
                <TextInput
                  value={descriptionEn}
                  onChangeText={setDescriptionEn}
                  placeholder="Write job description in English..."
                  placeholderTextColor={colors.textMuted}
                  multiline={true}
                  numberOfLines={4}
                  style={[styles.textArea, { color: colors.text, borderColor: colors.border }, styles.textLeft]}
                />

                {/* Requirements Kurdish */}
                <Text style={[styles.inputLabel, { color: colors.text }, textStyle]}>{t.reqKu} (ئارەزوومەندانە - Optional)</Text>
                <TextInput
                  value={requirementsKu}
                  onChangeText={setRequirementsKu}
                  placeholder="شارەزایی لە دیزاین&#10;٢ ساڵ ئەزموون&#10;(هەر مەرجێک لە دێڕێکی نوێ بێت)"
                  placeholderTextColor={colors.textMuted}
                  multiline={true}
                  numberOfLines={4}
                  style={[styles.textArea, { color: colors.text, borderColor: colors.border }, textStyle]}
                />

                {/* Requirements English */}
                <Text style={[styles.inputLabel, { color: colors.text }, textStyle]}>{t.reqEn} (ئارەزوومەندانە - Optional)</Text>
                <TextInput
                  value={requirementsEn}
                  onChangeText={setRequirementsEn}
                  placeholder="Figma proficiency&#10;2+ years of experience&#10;(One requirement per line)"
                  placeholderTextColor={colors.textMuted}
                  multiline={true}
                  numberOfLines={4}
                  style={[styles.textArea, { color: colors.text, borderColor: colors.border }, styles.textLeft]}
                />

                {/* WhatsApp */}
                <Text style={[styles.inputLabel, { color: colors.text }, textStyle]}>{t.whatsappNumber} (ئارەزوومەندانە - Optional)</Text>
                <TextInput
                  value={whatsapp}
                  onChangeText={setWhatsapp}
                  placeholder="9647501234567"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="phone-pad"
                  style={[styles.input, { color: colors.text, borderColor: colors.border }, styles.textLeft]}
                />

                {/* Email */}
                <Text style={[styles.inputLabel, { color: colors.text }, textStyle]}>{t.emailAddress} (ئارەزوومەندانە - Optional)</Text>
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder="jobs@company.com"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="email-address"
                  style={[styles.input, { color: colors.text, borderColor: colors.border }, styles.textLeft]}
                />

                <View style={{ height: 60 }} />
              </ScrollView>

              {/* Footer Save / Cancel */}
              <View style={[styles.modalFooter, rowStyle, { borderTopColor: colors.border }]}>
                <TouchableOpacity 
                  activeOpacity={0.7} 
                  style={[styles.cancelBtn, { borderColor: colors.border }]} 
                  onPress={() => setShowFormModal(false)}
                >
                  <Text style={[styles.cancelBtnText, { color: colors.textSecondary }]}>{t.cancel}</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  activeOpacity={0.8} 
                  style={[styles.saveBtn, { backgroundColor: colors.primary, shadowColor: colors.primary }]} 
                  onPress={handleSaveJob}
                >
                  <Text style={styles.saveBtnText}>{t.save}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Custom Glassmorphic Delete Confirmation Modal */}
        <Modal
          visible={showDeleteModal}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowDeleteModal(false)}
        >
          <View style={styles.deleteOverlay}>
            <GlassView style={[styles.deleteCard, { borderColor: colors.cardBorder }]}>
              <Text style={[styles.deleteTitle, { color: colors.text }]}>{t.deleteJob}</Text>
              <Text style={[styles.deleteDesc, { color: colors.textSecondary }]}>{t.confirmDelete}</Text>
              
              <View style={[styles.deleteActions, rowStyle]}>
                <TouchableOpacity 
                  activeOpacity={0.7} 
                  style={[styles.deleteCancel, { borderColor: colors.border }]}
                  onPress={() => setShowDeleteModal(false)}
                >
                  <Text style={[styles.deleteCancelText, { color: colors.textSecondary }]}>{t.no}</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  activeOpacity={0.8} 
                  style={[styles.deleteConfirm, { backgroundColor: colors.accent }]}
                  onPress={confirmDeleteJob}
                >
                  <Text style={styles.deleteConfirmText}>{t.yes}</Text>
                </TouchableOpacity>
              </View>
            </GlassView>
          </View>
        </Modal>
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
    opacity: 0.15,
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
  header: {
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
  },
  headerLeft: {
    gap: 8,
  },
  headerIcon: {
    marginTop: 2,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 0.5,
    fontFamily: font,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    gap: 4,
  },
  plusIcon: {
    marginTop: -1,
  },
  addButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFF',
    fontFamily: font,
  },
  scrollContainer: {
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 12,
    fontFamily: font,
  },
  statsGrid: {
    gap: 12,
    marginBottom: 16,
  },
  statBox: {
    flex: 1,
    padding: 12,
    alignItems: 'center',
    borderRadius: 16,
  },
  statNum: {
    fontSize: 20,
    fontWeight: '800',
    fontFamily: font,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 4,
    fontFamily: font,
  },
  chartCard: {
    marginBottom: 20,
    borderRadius: 20,
  },
  chartHeader: {
    marginBottom: 16,
  },
  chartTitle: {
    fontSize: 14,
    fontWeight: '700',
    fontFamily: font,
  },
  chartBarWrapper: {
    marginBottom: 14,
  },
  barLabelRow: {
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  barLabel: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: font,
  },
  barVal: {
    fontSize: 12,
    fontWeight: '700',
    fontFamily: font,
  },
  barBg: {
    height: 8,
    borderRadius: 4,
    width: '100%',
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 4,
  },
  chartFooterRow: {
    marginTop: 6,
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(255,255,255,0.05)',
    paddingTop: 12,
  },
  footerStat: {
    fontSize: 11,
    fontWeight: '600',
    fontFamily: font,
  },
  marginLeftTen: {
    marginLeft: 10,
  },
  marginRightTen: {
    marginRight: 10,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    borderBottomWidth: 0,
    maxHeight: '90%',
  },
  modalHeader: {
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 18,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    fontFamily: font,
  },
  closeBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  formScroll: {
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  formRow: {
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 8,
    marginTop: 10,
    fontFamily: font,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    height: 48,
    paddingHorizontal: 14,
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 8,
    fontFamily: font,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 13,
    fontWeight: '500',
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: 8,
    fontFamily: font,
  },
  pickerGrid: {
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  pickerChip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  pickerChipText: {
    fontSize: 11,
    fontWeight: '600',
    fontFamily: font,
  },
  modalFooter: {
    paddingHorizontal: 24,
    paddingVertical: 18,
    borderTopWidth: 1,
    justifyContent: 'space-between',
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderWidth: 1,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: '700',
    fontFamily: font,
  },
  saveBtn: {
    flex: 2,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  saveBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFF',
    fontFamily: font,
  },
  deleteOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  deleteCard: {
    width: '100%',
    maxWidth: 320,
    padding: 24,
    borderRadius: 24,
    alignItems: 'center',
  },
  deleteTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 8,
    fontFamily: font,
  },
  deleteDesc: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
    fontFamily: font,
  },
  deleteActions: {
    width: '100%',
    gap: 12,
  },
  deleteCancel: {
    flex: 1,
    paddingVertical: 10,
    borderWidth: 1,
    borderRadius: 10,
    alignItems: 'center',
  },
  deleteCancelText: {
    fontSize: 13,
    fontWeight: '700',
    fontFamily: font,
  },
  deleteConfirm: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  deleteConfirmText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFF',
    fontFamily: font,
  }
});
