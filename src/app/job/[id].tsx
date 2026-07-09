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
import { ArrowLeft, ArrowRight, MapPin, Briefcase, Calendar, DollarSign, MessageCircle, Mail, Share2, FileText, CheckCircle, X, Phone, Globe } from 'lucide-react-native';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useIsFocused } from '@react-navigation/native';
import { useApp } from '../../context/AppContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { JobStorage, Job } from '../../services/JobStorage';
import GlassView from '../../components/GlassView';

const DetailsVideoPlayer: React.FC<{ videoUrl: string; layout?: 'portrait' | 'landscape' }> = ({ videoUrl, layout }) => {
  const isFocused = useIsFocused();
  const player = useVideoPlayer(videoUrl, playerInstance => {
    playerInstance.loop = true;
    playerInstance.muted = false;
  });

  useEffect(() => {
    if (isFocused) {
      player.play();
    } else {
      player.pause();
    }
  }, [isFocused, player]);

  const isLandscape = layout === 'landscape';
  const videoStyle = [
    styles.detailsVideo,
    { aspectRatio: isLandscape ? 16 / 9 : 2 / 3 }
  ];

  if (!isFocused) return null;

  return (
    <VideoView
      player={player}
      style={videoStyle}
      allowsFullscreen={true}
      nativeControls={true}
    />
  );
};

export default function JobDetails() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { colors, theme, t, language, getLocalizedProperty, logoUrl } = useApp();
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

  // Form Apply CTA
  const handleApplyForm = async () => {
    if (!job || !job.form_url) return;

    // Track click
    await JobStorage.incrementClicks(job.id);
    
    try {
      await Linking.openURL(job.form_url);
    } catch (e) {
      console.error(e);
      Alert.alert(
        language === 'ku' ? 'کێشە' : 'Error',
        language === 'ku' ? 'نەتوانرا بەستەرەکە بکرێتەوە.' : 'Could not open the link.'
      );
    }
  };

  // Open Map Link CTA
  const handleOpenMap = async () => {
    if (!job || !job.map_url) return;
    
    try {
      await Linking.openURL(job.map_url);
    } catch (e) {
      console.error(e);
      Alert.alert(
        language === 'ku' ? 'کێشە' : 'Error',
        language === 'ku' ? 'نەتوانرا نەخشەکە بکرێتەوە.' : 'Could not open the map link.'
      );
    }
  };

  // Share Job
  const handleShareJob = async () => {
    if (!job) return;
    const jobTitle = isRtl ? job.title_ku : job.title_en;
    const city = t.cities[job.city_en] || job.city_ku;
    
    let shareText = '';
    if (language === 'ku') {
      shareText = `هەلی کار لە کۆمپانیای ${job.company}!\n\nناونیشانی کار: ${jobTitle}\nشار: ${city}\nمووچە: ${job.salary}\n`;
      if (job.whatsapp && job.whatsapp.trim() !== "" && job.whatsapp.trim() !== "770") {
        shareText += `پێشکەشکردن بە وەتسئەپ: wa.me/${job.whatsapp}\n`;
      }
      if (job.email && job.email.trim() !== "") {
        shareText += `پێشکەشکردن بە ئیمەیڵ: ${job.email}\n`;
      }
      if (job.form_url && job.form_url.trim() !== "") {
        shareText += `پڕکردنەوەی فۆرم: ${job.form_url}\n`;
      }
      shareText += `بڵاوکراوە لە ڕێگەی ئەپی Kurd24 Job`;
    } else {
      shareText = `New Job Opportunity at ${job.company}!\n\nTitle: ${jobTitle}\nCity: ${city}\nSalary: ${job.salary}\n`;
      if (job.whatsapp && job.whatsapp.trim() !== "" && job.whatsapp.trim() !== "770") {
        shareText += `Apply via WhatsApp: wa.me/${job.whatsapp}\n`;
      }
      if (job.email && job.email.trim() !== "") {
        shareText += `Apply via Email: ${job.email}\n`;
      }
      if (job.form_url && job.form_url.trim() !== "") {
        shareText += `Fill Form: ${job.form_url}\n`;
      }
      shareText += `Shared via Kurd24 Job app`;
    }

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

  const logoSource = (job.logo_url && job.logo_url.trim() !== '' && !job.logo_url.includes('unsplash.com/photo-1618005182384-a83a8bd57fbe'))
    ? { uri: job.logo_url }
    : (logoUrl ? { uri: logoUrl } : require('../../../assets/images/logo.png'));

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
              <Image 
                source={logoSource} 
                style={styles.companyLogo}
                resizeMode="cover"
              />

              <Text style={[styles.jobTitle, { color: colors.text }]}>{jobTitle}</Text>
              <Text style={[styles.companyName, { color: colors.textSecondary }]}>{job.company}</Text>

              {/* Tag Grid - ONLY City Tag */}
              <View style={[styles.tagGrid, rowStyle]}>
                <View style={[styles.detailTag, { backgroundColor: colors.primaryGlow }]}>
                  <MapPin size={12} color={colors.primary} />
                  <Text style={[styles.tagText, { color: colors.primary }]}>{city}</Text>
                </View>
              </View>
            </View>
          </GlassView>

          {/* Job Description (Details) */}
          <GlassView style={styles.contentCard}>
            <Text style={[styles.cardTitle, { color: colors.text }, textStyle]}>
              {language === 'ku' ? 'دیتەڵ و زانیاری کارەکە' : 'Job Details & Description'}
            </Text>
            <Text style={[styles.descriptionText, { color: colors.textSecondary }, textStyle]}>
              {description}
            </Text>
          </GlassView>

          {/* Ad Video Player */}
          {job.is_ad && job.video_url ? (
            <GlassView style={styles.contentCard}>
              <Text style={[styles.cardTitle, { color: colors.text }, textStyle]}>
                {language === 'ku' ? 'ڤیدیۆی ڕیکلام 📹' : 'Sponsored Video 📹'}
              </Text>
              <DetailsVideoPlayer videoUrl={job.video_url} layout={job.video_layout} />
            </GlassView>
          ) : null}

          {/* Ad Location Address */}
          {job.is_ad && job.address ? (
            <GlassView style={styles.contentCard}>
              <Text style={[styles.cardTitle, { color: colors.text }, textStyle]}>
                📍 {language === 'ku' ? 'ناونیشانی شوێن' : 'Location Address'}
              </Text>
              <Text style={[styles.descriptionText, { color: colors.textSecondary }, textStyle]}>
                {job.address}
              </Text>
            </GlassView>
          ) : null}

          {/* Horizontal Image Gallery */}
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

          {/* Apply Action Buttons */}
          <View style={[styles.actionsCard]}>
            {/* WhatsApp Button (Both normal and ad posts) */}
            {job.whatsapp && job.whatsapp.trim() !== "" && job.whatsapp.trim() !== "770" && (
              <TouchableOpacity 
                activeOpacity={0.9} 
                style={[styles.applyWhatsAppBtn, { backgroundColor: '#25D366' }]}
                onPress={handleApplyWhatsApp}
              >
                <MessageCircle size={20} color="#FFF" />
                <Text style={styles.applyBtnText}>{t.sendWhatsApp}</Text>
              </TouchableOpacity>
            )}

            {/* Phone Call Button (Only for advertisement posts) */}
            {job.is_ad && job.whatsapp && job.whatsapp.trim() !== "" && job.whatsapp.trim() !== "770" && (
              <TouchableOpacity 
                activeOpacity={0.9} 
                style={[styles.applyPhoneBtn, { backgroundColor: '#0088CC' }]}
                onPress={() => Linking.openURL(`tel:${job.whatsapp}`)}
              >
                <Phone size={18} color="#FFF" />
                <Text style={styles.applyBtnText}>
                  {language === 'ku' ? 'پەیوەندی تەلەفۆنی 📞' : 'Phone Call 📞'}
                </Text>
              </TouchableOpacity>
            )}

            {/* Email Button (Only for normal posts) */}
            {!job.is_ad && job.email && job.email.trim() !== "" && (
              <TouchableOpacity 
                activeOpacity={0.9} 
                style={[styles.applyEmailBtn, { backgroundColor: colors.primary }]}
                onPress={handleApplyEmail}
              >
                <Mail size={18} color="#FFF" />
                <Text style={styles.applyBtnText}>{t.sendEmail}</Text>
              </TouchableOpacity>
            )}

            {/* Fill Form Button (Only for normal posts) */}
            {!job.is_ad && job.form_url && job.form_url.trim() !== "" && (
              <TouchableOpacity 
                activeOpacity={0.9} 
                style={[styles.applyFormBtn, { backgroundColor: colors.accent }]}
                onPress={handleApplyForm}
              >
                <FileText size={18} color="#FFF" />
                <Text style={styles.applyBtnText}>{t.fillForm}</Text>
              </TouchableOpacity>
            )}

            {/* Social Media / Web Link Button (Only for advertisement posts) */}
            {job.is_ad && job.form_url && job.form_url.trim() !== "" && (
              <TouchableOpacity 
                activeOpacity={0.9} 
                style={[styles.applySocialBtn, { backgroundColor: '#8B5CF6' }]}
                onPress={handleApplyForm}
              >
                <Globe size={18} color="#FFF" />
                <Text style={styles.applyBtnText}>
                  {language === 'ku' ? 'تۆڕی کۆمەڵایەتی / بەستەر 🌐' : 'Social Media / Link 🌐'}
                </Text>
              </TouchableOpacity>
            )}

            {/* Location Button (Only for advertisement posts) */}
            {job.is_ad && job.map_url && job.map_url.trim() !== "" && (
              <TouchableOpacity 
                activeOpacity={0.9} 
                style={[styles.applyMapBtn, { backgroundColor: '#FFB800' }]}
                onPress={handleOpenMap}
              >
                <MapPin size={18} color="#000" />
                <Text style={[styles.applyBtnText, { color: '#000' }]}>
                  {language === 'ku' ? 'لۆکەیشن لەسەر نەخشە 📍' : 'Map Location 📍'}
                </Text>
              </TouchableOpacity>
            )}
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
  companyLogo: {
    width: 64,
    height: 64,
    borderRadius: 16,
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
  applyFormBtn: {
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
  applyPhoneBtn: {
    flexDirection: 'row',
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#0088CC',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  applySocialBtn: {
    flexDirection: 'row',
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  applyMapBtn: {
    flexDirection: 'row',
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 10,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  detailsVideo: {
    width: '100%',
    aspectRatio: 2 / 3,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    marginVertical: 10,
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
