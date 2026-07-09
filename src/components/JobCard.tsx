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
import { BlurView } from 'expo-blur';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useIsFocused } from '@react-navigation/native';
import { useApp } from '../context/AppContext';
import { Job } from '../services/JobStorage';
import GlassView from './GlassView';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface AdVideoPlayerProps {
  videoUrl: string;
  isActive: boolean;
  layout?: 'portrait' | 'landscape';
}

const AdVideoPlayer: React.FC<AdVideoPlayerProps> = ({ videoUrl, isActive, layout }) => {
  const isFocused = useIsFocused();
  const player = useVideoPlayer(videoUrl, playerInstance => {
    playerInstance.loop = true;
    playerInstance.muted = true;
  });

  useEffect(() => {
    if (isActive && isFocused) {
      player.play();
    } else {
      player.pause();
    }
  }, [isActive, isFocused, player]);

  const isLandscape = layout === 'landscape';
  const videoStyle = [
    styles.adVideo,
    { aspectRatio: isLandscape ? 16 / 9 : 2 / 3 }
  ];

  if (!isFocused) {
    return <View style={videoStyle} />;
  }

  return (
    <VideoView
      player={player}
      style={videoStyle}
      allowsFullscreen={false}
      nativeControls={false}
    />
  );
};

interface JobCardProps {
  job: Job;
  onPress: () => void;
  isAdmin?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  activeVisibleJobId?: string | null;
}

export const JobCard: React.FC<JobCardProps> = ({
  job,
  onPress,
  isAdmin = false,
  onEdit,
  onDelete,
  activeVisibleJobId = null
}) => {
  const { language, toggleBookmark, isBookmarked, colors, theme, logoUrl } = useApp();
  const isRtl = language === 'ku';
  const bookmarked = isBookmarked(job.id);

  // States
  const [activeImage, setActiveImage] = useState<string | null>(null);
  const [currentImgIndex, setCurrentImgIndex] = useState<number>(0);

  // Entrance animation
  const entranceAnim = useRef(new Animated.Value(0)).current;

  // Animation for VIP/Ad Shine Sweep & Pulsing Border
  const shimmerAnim = useRef(new Animated.Value(-1.5)).current;
  const borderGlowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Entrance fade+scale
    Animated.timing(entranceAnim, {
      toValue: 1,
      duration: 380,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();

    if (job.is_vip || job.is_ad) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(shimmerAnim, {
            toValue: 1.5,
            duration: 2200,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.delay(1800),
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
  }, [job.is_vip, job.is_ad]);

  const borderColor = job.is_vip 
    ? borderGlowAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['#FFB800', '#FFE57F']
      })
    : (job.is_ad
      ? borderGlowAnim.interpolate({
          inputRange: [0, 1],
          outputRange: ['#EC4899', '#8B5CF6']
        })
      : (theme === 'dark' ? 'rgba(56, 189, 248, 0.45)' : 'rgba(14, 165, 233, 0.35)'));

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
  const titlePaddingStyle = isRtl ? { paddingLeft: 8 } : { paddingRight: 8 };

  // Company Logo Resolution
  const logoSource = (job.logo_url && job.logo_url.trim() !== '' && !job.logo_url.includes('unsplash.com/photo-1618005182384-a83a8bd57fbe'))
    ? { uri: job.logo_url }
    : (logoUrl ? { uri: logoUrl } : require('../../assets/images/logo.png'));

  // Gradient colors for the card background
  const cardGradientColors: [string, string, string] = theme === 'dark'
    ? (job.is_vip
        ? ['rgba(38, 30, 10, 0.98)', 'rgba(28, 25, 20, 0.92)', 'rgba(22, 22, 18, 0.88)']
        : (job.is_ad
            ? ['rgba(32, 18, 45, 0.98)', 'rgba(23, 20, 35, 0.92)', 'rgba(18, 18, 30, 0.88)']
            : ['rgba(22, 32, 48, 0.99)', 'rgba(18, 26, 40, 0.94)', 'rgba(14, 20, 34, 0.88)']))
    : (job.is_vip
        ? ['rgba(255, 253, 235, 0.99)', 'rgba(255, 251, 225, 0.95)', 'rgba(250, 245, 215, 0.9)']
        : (job.is_ad
            ? ['rgba(252, 248, 255, 0.99)', 'rgba(248, 243, 255, 0.95)', 'rgba(242, 236, 255, 0.9)']
            : ['rgba(255, 255, 255, 0.99)', 'rgba(247, 250, 255, 0.95)', 'rgba(238, 244, 255, 0.88)']));

  const entranceStyle = {
    opacity: entranceAnim,
    transform: [{
      scale: entranceAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0.97, 1],
      })
    }]
  };

  return (
    <Animated.View style={[styles.cardContainer, entranceStyle]}>
      <Animated.View
        style={{
          borderWidth: (job.is_vip || job.is_ad) ? 1.5 : 0,
          borderColor: borderColor,
          borderRadius: 0,
          overflow: 'hidden',
        }}
      >
        {/* Subtle gradient background for all cards */}
        <LinearGradient
          colors={cardGradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={[styles.cardGradientBase]}
        />
        <GlassView
          noPadding={true}
          style={[
            styles.windowCard,
            {
              backgroundColor: 'transparent',
              borderWidth: 0,
              borderRadius: 0,
            }
          ]}
        >
          {/* Animated Gold/Pink Shine Sweep Overlay */}
          {(job.is_vip || job.is_ad) && (
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
                colors={job.is_vip ? [
                  'rgba(255, 215, 0, 0)',
                  'rgba(255, 215, 0, 0.02)',
                  'rgba(255, 223, 0, 0.25)',
                  'rgba(255, 215, 0, 0.02)',
                  'rgba(255, 215, 0, 0)',
                ] : [
                  'rgba(236, 72, 153, 0)',
                  'rgba(236, 72, 153, 0.02)',
                  'rgba(139, 92, 246, 0.25)',
                  'rgba(236, 72, 153, 0.02)',
                  'rgba(236, 72, 153, 0)',
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
            {/* 1. Job Title & Bookmark Row */}
            <View style={[styles.titleBookmarkRow, rowStyle]}>
              <Text 
                numberOfLines={2} 
                ellipsizeMode="tail" 
                style={[styles.jobTitle, { color: colors.text }, textStyle, titlePaddingStyle]}
              >
                📢 {title}
              </Text>
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

            {/* 2. Meta Info Row (Logo & Badges) */}
            <View style={[styles.metaRow, rowStyle]}>
              <View style={[styles.logoContainer, rowStyle]}>
                <Image 
                  source={logoSource} 
                  style={styles.metaLogo}
                  resizeMode="cover"
                />
                <CheckCircle2 size={12} color="#3b82f6" fill="#FFF" style={isRtl ? { marginRight: 4 } : { marginLeft: 4 }} />
              </View>

              {job.is_vip && (
                <View style={styles.vipBadge}>
                  <Text style={styles.vipBadgeText}>
                    👑 {language === 'ku' ? 'VIP' : 'VIP'}
                  </Text>
                </View>
              )}

              {job.is_ad && (
                <View style={styles.adBadge}>
                  <Text style={styles.adBadgeText}>
                    {language === 'ku' ? 'ڕیکلام' : 'Sponsored'}
                  </Text>
                </View>
              )}
              
              {job.is_pinned && (
                <View style={[styles.pinBadge, { backgroundColor: colors.primaryGlow }]}>
                  <Pin size={9} color={colors.primary} fill={colors.primary} />
                  <Text style={[styles.pinBadgeText, { color: colors.primary }]}>
                    {language === 'ku' ? 'جێگیرکراو' : 'Pinned'}
                  </Text>
                </View>
              )}
            </View>

            {/* 3. Description Snippet */}
            <Text 
              numberOfLines={3} 
              ellipsizeMode="tail"
              style={[styles.descriptionSnippet, { color: colors.textSecondary }, textStyle]}
            >
              {description}
            </Text>

            {/* 4. Ad Video Player or Image Gallery Slider */}
            {job.is_ad && job.video_url ? (
              <AdVideoPlayer 
                videoUrl={job.video_url} 
                isActive={activeVisibleJobId === job.id} 
                layout={job.video_layout}
              />
            ) : (
              job.images && job.images.length > 0 && (
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
              )
            )}

            {/* Ad Location Address */}
            {job.is_ad && job.address ? (
              <View style={[styles.adAddressContainer, rowStyle, { marginBottom: 12 }]}>
                <Text style={[styles.adAddressText, { color: colors.textSecondary }, textStyle]}>
                  📍 {language === 'ku' ? `ناونیشان: ${job.address}` : `Location: ${job.address}`}
                </Text>
              </View>
            ) : null}

            {/* 5. Time & Views footer */}
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
        </Animated.View>

      <View
        style={[
          styles.solidDivider,
          { backgroundColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.07)' : 'rgba(0, 0, 0, 0.05)' }
        ]}
      />

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
    marginBottom: 0,
    width: '100%',
    paddingHorizontal: 0,
  },
  cardGradientBase: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
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
    flex: 1,
  },
  titleBookmarkRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaLogo: {
    width: 24,
    height: 24,
    borderRadius: 6,
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
    fontSize: 16,
    fontWeight: '800',
    lineHeight: 22,
    fontFamily: font,
    flex: 1,
  },
  descriptionSnippet: {
    fontSize: 13,
    lineHeight: 18,
    opacity: 0.8,
    fontFamily: font,
    marginBottom: 12,
  },
  sliderContainer: {
    position: 'relative',
    height: 150,
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
    width: SCREEN_WIDTH - 32, // Edges-to-edge minus cardClickableArea horizontal padding
    height: 150,
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
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#FFB800',
    backgroundColor: 'rgba(255, 184, 0, 0.12)',
    alignSelf: 'center',
  },
  vipBadgeText: {
    color: '#FFB800',
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
  },
  adBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#EC4899',
    backgroundColor: 'rgba(236, 72, 153, 0.12)',
    alignSelf: 'center',
  },
  adBadgeText: {
    color: '#EC4899',
    fontSize: 9,
    fontWeight: '900',
    fontFamily: font,
  },
  adVideo: {
    width: '100%',
    aspectRatio: 2 / 3,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    marginBottom: 12,
  },
  adAddressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  adAddressText: {
    fontSize: 12,
    fontWeight: '700',
    fontFamily: font,
  },
  solidDivider: {
    height: 1,
    width: '100%',
    marginTop: 14,
  }
});

export default JobCard;
