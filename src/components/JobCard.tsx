import React, { useState, useEffect, useRef } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  Image, 
  ScrollView, 
  Modal,
  Dimensions,
  Animated,
  Easing
} from 'react-native';
import { 
  CheckCheck, 
  Eye, 
  Bookmark, 
  X, 
  CheckCircle2,
  Pin
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useApp } from '../context/AppContext';
import { Job } from '../services/JobStorage';
import GlassView from './GlassView';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface JobCardProps {
  job: Job;
  onPress: () => void;
  isAdmin?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}

export const JobCard: React.FC<JobCardProps> = ({
  job,
  onPress,
  isAdmin = false,
  onEdit,
  onDelete
}) => {
  const { language, toggleBookmark, isBookmarked, colors, theme, getLocalizedProperty } = useApp();
  const isRtl = language === 'ku';
  const bookmarked = isBookmarked(job.id);

  // States
  const [activeImage, setActiveImage] = useState<string | null>(null);
  const [currentImgIndex, setCurrentImgIndex] = useState<number>(0);

  // Animation for VIP Shine Sweep & Pulsing Border
  const shimmerAnim = useRef(new Animated.Value(-1.5)).current;
  const borderGlowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (job.is_vip) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(shimmerAnim, {
            toValue: 1.5,
            duration: 2200,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.delay(1800), // Delay between sweeps for subtle elegance
        ])
      ).start();

      Animated.loop(
        Animated.sequence([
          Animated.timing(borderGlowAnim, {
            toValue: 1,
            duration: 1500,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: false,
          }),
          Animated.timing(borderGlowAnim, {
            toValue: 0,
            duration: 1500,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: false,
          })
        ])
      ).start();
    }
  }, [job.is_vip]);

  const borderColor = job.is_vip 
    ? borderGlowAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['#FFB800', '#FFE57F']
      })
    : colors.cardBorder;

  const translateX = shimmerAnim.interpolate({
    inputRange: [-1.5, 1.5],
    outputRange: [-SCREEN_WIDTH * 1.5, SCREEN_WIDTH * 1.5],
  });

  // Localized variables
  const title = isRtl ? job.title_ku : job.title_en;
  const description = isRtl ? job.description_ku : job.description_en;

  // Time format
  const dateObj = new Date(job.created_at);
  const timeFormatted = dateObj.toLocaleTimeString(language === 'ku' ? 'ku-IQ' : 'en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });

  const handleScroll = (event: any) => {
    const contentOffset = event.nativeEvent.contentOffset.x;
    const viewSize = event.nativeEvent.layoutMeasurement.width;
    if (viewSize > 0) {
      const index = Math.round(contentOffset / viewSize);
      setCurrentImgIndex(index);
    }
  };

  // Alignments based on RTL
  const rowStyle = isRtl ? styles.rowReverse : styles.row;
  const textStyle = isRtl ? styles.textRight : styles.textLeft;

  return (
    <View style={styles.cardContainer}>
      <Animated.View
        style={{
          borderWidth: job.is_vip ? 2 : 1,
          borderColor: borderColor,
          borderRadius: 12,
          overflow: 'hidden',
        }}
      >
        <GlassView 
          noPadding={true}
          style={[
            styles.windowCard, 
            { 
              backgroundColor: theme === 'dark' ? 'rgba(21, 30, 40, 0.82)' : 'rgba(255, 255, 255, 0.9)',
              borderWidth: 0,
              borderRadius: 12,
            }
          ]}
        >
          {/* Animated Gold Shine Sweep Overlay for VIP */}
          {job.is_vip && (
            <Animated.View
              style={[
                StyleSheet.absoluteFillObject,
                {
                  transform: [
                    { translateX },
                    { rotate: '25deg' },
                  ],
                  zIndex: 1,
                  pointerEvents: 'none',
                }
              ]}
            >
              <LinearGradient
                colors={[
                  'rgba(255, 215, 0, 0)',
                  'rgba(255, 215, 0, 0.02)',
                  'rgba(255, 223, 0, 0.25)', // Glowing gold sweep
                  'rgba(255, 215, 0, 0.02)',
                  'rgba(255, 215, 0, 0)',
                ]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.shimmerGradient}
              />
            </Animated.View>
          )}

          {/* Clickable Card Content area */}
          <TouchableOpacity 
            activeOpacity={0.8} 
            style={styles.cardClickableArea}
            onPress={onPress}
          >
            {/* Header Row */}
            <View style={[styles.headerRow, rowStyle]}>
              <View style={[styles.companyLogoPlaceholder, { backgroundColor: colors.primaryGlow }]}>
                <Text style={[styles.logoLetter, { color: colors.primary }]}>
                  {job.company.substring(0, 1).toUpperCase()}
                </Text>
              </View>
              
              <View style={[styles.companyDetails, isRtl ? styles.marginRight : styles.marginLeft]}>
                <View style={[styles.companyNameRow, rowStyle]}>
                  <Text style={[styles.companyName, { color: colors.text }]}>{job.company}</Text>
                  <CheckCircle2 size={13} color="#3b82f6" fill="#FFF" style={styles.verifiedIcon} />
                  {job.is_pinned && (
                    <View style={[styles.pinBadge, { backgroundColor: colors.primaryGlow }]}>
                      <Pin size={9} color={colors.primary} fill={colors.primary} />
                      <Text style={[styles.pinBadgeText, { color: colors.primary }]}>
                        {language === 'ku' ? 'جێگیرکراو' : 'Pinned'}
                      </Text>
                    </View>
                  )}
                </View>
                <Text style={[styles.companySubtitle, { color: colors.textSecondary }]}>
                  Kurd24 Job Channel
                </Text>
              </View>

              {!isAdmin && (
                <TouchableOpacity 
                  activeOpacity={0.7} 
                  style={[styles.bookmarkButton, { backgroundColor: colors.border }]}
                  onPress={() => toggleBookmark(job.id)}
                >
                  <Bookmark 
                    size={16} 
                    color={bookmarked ? colors.primary : colors.textSecondary} 
                    fill={bookmarked ? colors.primary : 'none'} 
                  />
                </TouchableOpacity>
              )}
            </View>

            {/* Job Title */}
            <Text style={[styles.jobTitle, { color: colors.text }, textStyle]}>
              📢 {title}
            </Text>

          {/* Description Snippet */}
          <Text 
            numberOfLines={3} 
            ellipsizeMode="tail"
            style={[styles.descriptionSnippet, { color: colors.textSecondary }, textStyle]}
          >
            {description}
          </Text>

          {/* Premium Overlap Image Slider */}
          {job.images && job.images.length > 0 && (
            <View style={styles.sliderContainer}>
              <ScrollView 
                horizontal 
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onScroll={handleScroll}
                scrollEventThrottle={16}
                contentContainerStyle={{ flexDirection: isRtl ? 'row-reverse' : 'row' }}
                style={styles.sliderScroll}
              >
                {job.images.map((imgUrl, idx) => (
                  <TouchableOpacity
                    key={idx}
                    activeOpacity={0.9}
                    onPress={() => setActiveImage(imgUrl)}
                    style={styles.slideWrapper}
                  >
                    <Image source={{ uri: imgUrl }} style={styles.slideImage} />
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* Floating translucent counter badge */}
              <View style={styles.counterOverlay}>
                <Text style={styles.counterText}>
                  {currentImgIndex + 1}/{job.images.length}
                </Text>
              </View>
            </View>
          )}

          {/* Time & Views footer */}
          <View style={[styles.footerRow, rowStyle]}>
            <View style={[styles.footerItem, rowStyle]}>
              <Eye size={12} color={colors.textMuted} />
              <Text style={[styles.footerText, { color: colors.textMuted }, isRtl ? styles.marginRightMini : styles.marginLeftMini]}>
                {job.views} {language === 'ku' ? 'بینین' : 'views'}
              </Text>
            </View>
            <View style={[styles.footerItem, rowStyle]}>
              <Text style={[styles.footerText, { color: colors.textMuted }]}>{timeFormatted}</Text>
              <CheckCheck size={14} color="#5288c1" style={isRtl ? styles.marginRightMini : styles.marginLeftMini} />
            </View>
          </View>
        </TouchableOpacity>

        {/* Admin actions row */}
        {isAdmin && (
          <View style={[styles.adminActionsRow, { borderTopColor: colors.border }, rowStyle]}>
            <TouchableOpacity onPress={onEdit} style={[styles.adminBtn, { backgroundColor: colors.primaryGlow }]}>
              <Text style={[styles.adminBtnText, { color: colors.primary }]}>{language === 'ku' ? 'دەستکاری' : 'Edit'}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onDelete} style={[styles.adminBtn, { backgroundColor: colors.accentGlow }]}>
              <Text style={[styles.adminBtnText, { color: colors.accent }]}>{language === 'ku' ? 'سڕینەوە' : 'Delete'}</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Action button: See More (زانیاری زیاتر) */}
        <View style={[styles.seeMoreContainer, { borderTopColor: colors.border }]}>
          <TouchableOpacity 
            activeOpacity={0.8}
            style={[
              styles.seeMoreBtn, 
              { 
                backgroundColor: job.is_vip ? 'rgba(255, 184, 0, 0.12)' : colors.primaryGlow,
                borderColor: job.is_vip ? '#FFB800' : colors.primary,
              }
            ]}
            onPress={onPress}
          >
            <Text style={[
              styles.seeMoreBtnText, 
              { color: job.is_vip ? '#FFB800' : colors.primary }
            ]}>
              {language === 'ku' ? 'زانیاری زیاتر 🔍' : 'More Info 🔍'}
            </Text>
          </TouchableOpacity>
        </View>
      </GlassView>

      {/* Full screen image lightbox zoom */}
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
      </Animated.View>
    </View>
  );
};

const font = 'NRT';

const styles = StyleSheet.create({
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
  cardContainer: {
    marginBottom: 16,
    width: '100%',
    paddingHorizontal: 12,
  },
  windowCard: {
    padding: 0,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  cardClickableArea: {
    padding: 16,
    paddingBottom: 12,
  },
  headerRow: {
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  companyLogoPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoLetter: {
    fontSize: 15,
    fontWeight: '800',
    fontFamily: font,
  },
  companyDetails: {
    flex: 1,
  },
  companyNameRow: {
    gap: 4,
    alignItems: 'center',
  },
  companyName: {
    fontSize: 14,
    fontWeight: '700',
    fontFamily: font,
  },
  companySubtitle: {
    fontSize: 10,
    opacity: 0.6,
    fontFamily: font,
    marginTop: 1,
  },
  verifiedIcon: {
    marginTop: 1,
  },
  marginLeft: {
    marginLeft: 10,
  },
  marginRight: {
    marginRight: 10,
  },
  bookmarkButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  jobTitle: {
    fontSize: 18,
    fontWeight: '800',
    lineHeight: 24,
    marginBottom: 10,
    fontFamily: font,
  },
  descriptionSnippet: {
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.8,
    fontFamily: font,
    marginBottom: 12,
  },
  sliderContainer: {
    position: 'relative',
    height: 180,
    width: '100%',
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    marginBottom: 12,
  },
  sliderScroll: {
    flex: 1,
  },
  slideWrapper: {
    width: SCREEN_WIDTH - 56,
    height: 180,
  },
  slideImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  counterOverlay: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  counterText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
    fontFamily: font,
  },
  footerRow: {
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  footerItem: {
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    fontFamily: font,
  },
  marginLeftMini: {
    marginLeft: 4,
  },
  marginRightMini: {
    marginRight: 4,
  },
  adminActionsRow: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: 0.5,
    justifyContent: 'space-between',
    gap: 8,
  },
  adminBtn: {
    flex: 1,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  adminBtnText: {
    fontSize: 12,
    fontWeight: '700',
    fontFamily: font,
  },
  seeMoreContainer: {
    borderTopWidth: 1,
    padding: 10,
  },
  seeMoreBtn: {
    height: 38,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  seeMoreBtnText: {
    fontSize: 13,
    fontWeight: '700',
    fontFamily: font,
  },
  vipBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
    marginLeft: 6,
    marginRight: 6,
    alignSelf: 'center',
  },
  vipBadgeText: {
    color: '#000',
    fontSize: 9,
    fontWeight: '900',
    fontFamily: font,
  },
  pinBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 6,
    marginRight: 6,
    alignSelf: 'center',
  },
  pinBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    fontFamily: font,
  },
  shimmerGradient: {
    height: '250%', 
    width: 120, 
    top: '-75%'
  },
  lightboxOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
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
    height: '75%',
  }
});

export default JobCard;
