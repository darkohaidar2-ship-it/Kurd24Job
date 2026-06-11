import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  SafeAreaView, 
  ActivityIndicator,
  Linking,
  Share,
  Platform,
  StatusBar,
  Alert,
  Modal,
  Image
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, ArrowRight, MapPin, Briefcase, Calendar, DollarSign, MessageCircle, Mail, Share2, FileText, CheckCircle, X } from 'lucide-react-native';
import { useApp } from '../../context/AppContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { JobStorage, Job } from '../../services/JobStorage';
import GlassView from '../../components/GlassView';

export default function JobDetails() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { colors, theme, t, language, getLocalizedProperty } = useApp();
  const isRtl = language === 'ku';
  const insets = useSafeAreaInsets();

  // State
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeImage, setActiveImage] = useState<string | null>(null);

  useEffect(() => {
    const fetchJobDetails = async () => {
      if (!id || typeof id !== 'string') return;
      
      setLoading(true);
      try {
        const data = await JobStorage.getJobById(id);
        if (data) {
          setJob(data);
          // Increment views on mount
          await JobStorage.incrementViews(id);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    fetchJobDetails();
  }, [id]);

  // WhatsApp Apply CTA
  const handleApplyWhatsApp = async () => {
    if (!job) return;

    // Track click
    await JobStorage.incrementClicks(job.id);

    const jobTitle = isRtl ? job.title_ku : job.title_en;
    const cityText = getLocalizedProperty('city', job.city_en);
    
    // Compose WhatsApp message
    const text = language === 'ku'
      ? `سڵاو، ڕێز و سڵاو 🌷\n\nمن پێشکەشکارم بۆ هەلی کاری ئۆفەرکراو:\n\n📌 *ناونیشانی کار:* ${jobTitle}\n🏢 *کۆمپانیا:* ${job.company}\n📍 *شار:* ${cityText}\n💵 *مووچە:* ${job.salary}\n\nسەرچاوە: ئەپی Kurd24 Job`
      : `Hello, Best Regards 🌷\n\nI am applying for the listed position:\n\n📌 *Job Title:* ${jobTitle}\n🏢 *Company:* ${job.company}\n📍 *City:* ${cityText}\n💵 *Salary:* ${job.salary}\n\nSource: Kurd24 Job App`;

    const whatsappUrl = `https://wa.me/${job.whatsapp}?text=${encodeURIComponent(text)}`;
    
    try {
      await Linking.openURL(whatsappUrl);
    } catch (e) {
      console.error(e);
    }
  };

  // Email Apply CTA
  const handleApplyEmail = async () => {
    if (!job) return;

    // Track click
    await JobStorage.incrementClicks(job.id);

    const jobTitle = isRtl ? job.title_ku : job.title_en;
    const subject = encodeURIComponent(
      language === 'ku' 
        ? `پێشکەشکردن بۆ هەلی کاری: ${jobTitle}` 
        : `Job Application: ${jobTitle}`
    );

    const body = language === 'ku'
      ? `سڵاو،\n\nمن پێشکەشکارم بۆ کار و پۆستی "${jobTitle}" لە کۆمپانیای ${job.company}.\n\nسوپاس،\nلە ڕێگەی ئەپی Kurd24 Job پێشکەش کراوە.`
      : `Hello,\n\nI would like to submit my application for the position of "${jobTitle}" at ${job.company}.\n\nBest regards,\nSubmitted via Kurd24 Job app.`;

    const mailtoUrl = `mailto:${job.email}?subject=${subject}&body=${encodeURIComponent(body)}`;
    
    try {
      await Linking.openURL(mailtoUrl);
    } catch (e) {
      console.error(e);
    }
  };

  // Share Job
  const handleShareJob = async () => {
    if (!job) return;
    const jobTitle = isRtl ? job.title_ku : job.title_en;
    const city = t.cities[job.city_en] || job.city_ku;
    const shareText = 
      language === 'ku'
        ? `هەلی کار لە کۆمپانیای ${job.company}!\n\nناونیشانی کار: ${jobTitle}\nشار: ${city}\nمووچە: ${job.salary}\n\nپێشکەشکردن بە وەتسئەپ: wa.me/${job.whatsapp}\nپێشکەشکردن بە ئیمەیڵ: ${job.email}\nبڵاوکراوە لە ڕێگەی ئەپی Kurd24 Job`
        : `New Job Opportunity at ${job.company}!\n\nTitle: ${jobTitle}\nCity: ${city}\nSalary: ${job.salary}\n\nApply via WhatsApp: wa.me/${job.whatsapp}\nApply via Email: ${job.email}\nShared via Kurd24 Job app`;

    try {
      await Share.share({
        message: shareText,
        title: jobTitle
      });
    } catch (e) {
      console.error(e);
    }
  };

  const rowStyle = isRtl ? styles.rowReverse : styles.row;
  const textStyle = isRtl ? styles.textRight : styles.textLeft;

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!job) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: colors.text }}>Job not found</Text>
      </View>
    );
  }

  const jobTitle = isRtl ? job.title_ku : job.title_en;
  const city = getLocalizedProperty('city', job.city_en);
  const type = getLocalizedProperty('type', job.type);
  const level = getLocalizedProperty('experience_level', job.experience_level);
  const industry = getLocalizedProperty('industry', job.industry);
  const description = (isRtl ? job.description_ku : job.description_en) || '';
  const requirements = isRtl ? job.requirements_ku : job.requirements_en;

  // Split requirements by newlines
  const requirementsList = requirements
    ? requirements
        .split('\n')
        .map(r => r.trim())
        .filter(r => r.length > 0)
    : [];

  const dateFormatted = new Date(job.created_at).toLocaleDateString(
    language === 'ku' ? 'ku-IQ' : 'en-US',
    { month: 'short', day: 'numeric', year: 'numeric' }
  );

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
        {/* Navigation Bar */}
        <View style={[styles.navBar, rowStyle]}>
          <TouchableOpacity 
            activeOpacity={0.7} 
            style={[styles.backButton, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}
            onPress={() => router.back()}
          >
            {isRtl ? <ArrowRight size={20} color={colors.text} /> : <ArrowLeft size={20} color={colors.text} />}
          </TouchableOpacity>

          <Text style={[styles.navTitle, { color: colors.text }]}>
            {language === 'ku' ? 'زانیاری کار' : 'Job Details'}
          </Text>

          <TouchableOpacity 
            activeOpacity={0.7} 
            style={[styles.backButton, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}
            onPress={handleShareJob}
          >
            <Share2 size={18} color={colors.text} />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContainer}>
          {/* Main Glass Header Card */}
          <GlassView style={styles.mainHeaderCard}>
            <View style={styles.center}>
              <View style={[styles.companyLogoPlaceholder, { backgroundColor: colors.primaryGlow }]}>
                <Text style={[styles.logoLetter, { color: colors.primary }]}>
                  {job.company.substring(0, 2).toUpperCase()}
                </Text>
              </View>

              <Text style={[styles.jobTitle, { color: colors.text }]}>{jobTitle}</Text>
              <Text style={[styles.companyName, { color: colors.textSecondary }]}>{job.company}</Text>

              {/* Tag Grid */}
              <View style={[styles.tagGrid, rowStyle]}>
                <View style={[styles.detailTag, { backgroundColor: colors.primaryGlow }]}>
                  <MapPin size={12} color={colors.primary} />
                  <Text style={[styles.tagText, { color: colors.primary }]}>{city}</Text>
                </View>
                <View style={[styles.detailTag, { backgroundColor: colors.accentGlow }]}>
                  <Briefcase size={12} color={colors.accent} />
                  <Text style={[styles.tagText, { color: colors.accent }]}>{type}</Text>
                </View>
                <View style={[styles.detailTag, { backgroundColor: colors.successGlow }]}>
                  <Text style={[styles.tagText, { color: colors.success }]}>{level}</Text>
                </View>
              </View>
            </View>
          </GlassView>

          {/* Quick Info Grid */}
          <View style={[styles.infoRow, rowStyle]}>
            <GlassView style={styles.infoBox}>
              <DollarSign size={18} color={colors.primary} />
              <Text style={[styles.infoVal, { color: colors.text }]}>{job.salary}</Text>
              <Text style={[styles.infoLbl, { color: colors.textSecondary }]}>{t.salary}</Text>
            </GlassView>
            <GlassView style={styles.infoBox}>
              <Calendar size={18} color={colors.accent} />
              <Text style={[styles.infoVal, { color: colors.text }]}>{dateFormatted}</Text>
              <Text style={[styles.infoLbl, { color: colors.textSecondary }]}>{t.posted}</Text>
            </GlassView>
          </View>

          {/* VIP Analytics Tracker */}
          {job.is_vip && (
            <GlassView style={[styles.contentCard, { borderColor: '#FFB800', borderWidth: 1.5 }]}>
              <Text style={[styles.cardTitle, { color: '#FFB800' }, textStyle]}>
                📊 {language === 'ku' ? 'ئاماری فەرمی کار (VIP)' : 'Official Job Stats (VIP)'}
              </Text>
              <View style={[styles.analyticsRow, rowStyle]}>
                <View style={styles.analyticsItem}>
                  <Text style={[styles.analyticsVal, { color: colors.text }]}>{job.views}</Text>
                  <Text style={[styles.analyticsLbl, { color: colors.textSecondary }]}>
                    {language === 'ku' ? 'بینینی گشتی' : 'Total Views'}
                  </Text>
                </View>
                <View style={[styles.analyticsDivider, { backgroundColor: colors.border }]} />
                <View style={styles.analyticsItem}>
                  <Text style={[styles.analyticsVal, { color: colors.text }]}>{job.clicks}</Text>
                  <Text style={[styles.analyticsLbl, { color: colors.textSecondary }]}>
                    {language === 'ku' ? 'کلیکی وەتسئەپ' : 'WhatsApp Clicks'}
                  </Text>
                </View>
              </View>
            </GlassView>
          )}

          {/* Job Description */}
          <GlassView style={styles.contentCard}>
            <Text style={[styles.cardTitle, { color: colors.text }, textStyle]}>{t.description}</Text>
            <Text style={[styles.descriptionText, { color: colors.textSecondary }, textStyle]}>
              {description}
            </Text>
          </GlassView>

          {/* Horizontal Image Gallery (RTL Aligned for Kurdish, LTR for English) */}
          {job.images && job.images.length > 0 && (
            <GlassView style={styles.contentCard}>
              <Text style={[styles.cardTitle, { color: colors.text }, textStyle]}>
                {language === 'ku' ? 'وێنەکانی پڕۆژە / شوێنی کار' : 'Job / Project Images'}
              </Text>
              <View style={[styles.galleryContainer, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={[
                    styles.galleryScroll,
                    { flexDirection: isRtl ? 'row-reverse' : 'row' }
                  ]}
                >
                  {job.images.map((imgUrl, idx) => (
                    <TouchableOpacity
                      key={idx}
                      activeOpacity={0.8}
                      onPress={() => setActiveImage(imgUrl)}
                      style={styles.thumbnailWrapper}
                    >
                      <Image source={{ uri: imgUrl }} style={styles.thumbnail} />
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </GlassView>
          )}

          {/* Job Requirements */}
          {requirementsList.length > 0 && (
            <GlassView style={styles.contentCard}>
              <Text style={[styles.cardTitle, { color: colors.text }, textStyle]}>{t.requirements}</Text>
              {requirementsList.map((req, index) => (
                <View key={index} style={[styles.bulletRow, rowStyle]}>
                  <Text style={[styles.bulletPoint, { color: colors.primary }]}>•</Text>
                  <Text style={[styles.bulletText, { color: colors.textSecondary }, textStyle, isRtl ? styles.marginRightTen : styles.marginLeftTen]}>
                    {req}
                  </Text>
                </View>
              ))}
            </GlassView>
          )}



          {/* Apply Action Buttons */}
          <View style={[styles.actionsCard]}>
            <TouchableOpacity 
              activeOpacity={0.9} 
              style={[styles.applyWhatsAppBtn, { backgroundColor: '#25D366' }]}
              onPress={handleApplyWhatsApp}
            >
              <MessageCircle size={20} color="#FFF" />
              <Text style={styles.applyBtnText}>{t.sendWhatsApp}</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              activeOpacity={0.9} 
              style={[styles.applyEmailBtn, { backgroundColor: colors.primary }]}
              onPress={handleApplyEmail}
            >
              <Mail size={18} color="#FFF" />
              <Text style={styles.applyBtnText}>{t.sendEmail}</Text>
            </TouchableOpacity>
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      </View>

      {/* Lightbox / Zoom Modal */}
      <Modal
        visible={activeImage !== null}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setActiveImage(null)}
      >
        <View style={styles.lightboxOverlay}>
          <TouchableOpacity 
            style={styles.lightboxCloseBtn} 
            activeOpacity={0.7}
            onPress={() => setActiveImage(null)}
          >
            <X size={24} color="#FFF" />
          </TouchableOpacity>
          {activeImage && (
            <Image 
              source={{ uri: activeImage }} 
              style={styles.lightboxImage} 
              resizeMode="contain" 
            />
          )}
        </View>
      </Modal>
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
  navBar: {
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navTitle: {
    fontSize: 16,
    fontWeight: '800',
    fontFamily: font,
  },
  scrollContainer: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  mainHeaderCard: {
    borderRadius: 24,
    marginBottom: 16,
  },
  center: {
    alignItems: 'center',
  },
  companyLogoPlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  logoLetter: {
    fontSize: 24,
    fontWeight: '800',
    fontFamily: font,
  },
  jobTitle: {
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
    fontFamily: font,
    marginBottom: 4,
  },
  companyName: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: font,
    marginBottom: 14,
  },
  tagGrid: {
    gap: 8,
    justifyContent: 'center',
  },
  detailTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    gap: 4,
  },
  tagText: {
    fontSize: 11,
    fontWeight: '700',
    fontFamily: font,
  },
  infoRow: {
    gap: 12,
    marginBottom: 16,
  },
  infoBox: {
    flex: 1,
    alignItems: 'center',
    borderRadius: 16,
    paddingVertical: 14,
  },
  infoVal: {
    fontSize: 13,
    fontWeight: '800',
    marginTop: 6,
    textAlign: 'center',
    fontFamily: font,
  },
  infoLbl: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
    fontFamily: font,
  },
  contentCard: {
    borderRadius: 20,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 12,
    fontFamily: font,
  },
  descriptionText: {
    fontSize: 13,
    lineHeight: 20,
    opacity: 0.9,
    fontFamily: font,
  },
  bulletRow: {
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  bulletPoint: {
    fontSize: 16,
    lineHeight: 18,
    fontWeight: 'bold',
  },
  bulletText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
    opacity: 0.9,
    fontFamily: font,
  },
  uploadCard: {
    borderRadius: 20,
    marginBottom: 16,
  },
  uploadButton: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  uploadBtnText: {
    fontSize: 13,
    fontWeight: '700',
    fontFamily: font,
  },
  uploadBoxCenter: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  uploadingText: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 6,
    fontFamily: font,
  },
  uploadedContainer: {
    gap: 10,
    paddingHorizontal: 4,
  },
  uploadedTextWrapper: {
    flex: 1,
  },
  uploadedTitle: {
    fontSize: 13,
    fontWeight: '700',
    fontFamily: font,
  },
  uploadedName: {
    fontSize: 11,
    marginTop: 2,
    opacity: 0.8,
    fontFamily: font,
  },
  actionsCard: {
    gap: 12,
    marginBottom: 20,
  },
  applyWhatsAppBtn: {
    flexDirection: 'row',
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#25D366',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  applyEmailBtn: {
    flexDirection: 'row',
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  applyBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFF',
    fontFamily: font,
  },
  marginLeftTen: {
    marginLeft: 10,
  },
  marginRightTen: {
    marginRight: 10,
  },
  galleryContainer: {
    width: '100%',
    marginVertical: 4,
  },
  galleryScroll: {
    gap: 8,
  },
  thumbnailWrapper: {
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  thumbnail: {
    width: 80,
    height: 80,
  },
  lightboxOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lightboxCloseBtn: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    padding: 10,
  },
  lightboxImage: {
    width: '90%',
    height: '70%',
  },
  analyticsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 10,
    marginTop: 6,
  },
  analyticsItem: {
    alignItems: 'center',
    flex: 1,
  },
  analyticsVal: {
    fontSize: 22,
    fontWeight: '800',
    fontFamily: font,
  },
  analyticsLbl: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 4,
    fontFamily: font,
  },
  analyticsDivider: {
    width: 1.5,
    height: 36,
    opacity: 0.5,
  }
});
