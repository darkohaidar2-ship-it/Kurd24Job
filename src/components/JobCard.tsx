import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image, Linking, Share, Alert, ScrollView, Modal } from 'react-native';
import { CheckCheck, Eye, MessageCircle, Mail, ExternalLink, Bookmark, X } from 'lucide-react-native';
import { useApp } from '../context/AppContext';
import { Job, JobStorage } from '../services/JobStorage';
import GlassView from './GlassView';

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
  const { language, toggleBookmark, isBookmarked, colors, t, theme, getLocalizedProperty } = useApp();
  const isRtl = language === 'ku';
  const bookmarked = isBookmarked(job.id);

  // Lightbox Modal State
  const [activeImage, setActiveImage] = useState<string | null>(null);

  // Layout directions
  const rowStyle = isRtl ? styles.rowReverse : styles.row;
  const textStyle = isRtl ? styles.textRight : styles.textLeft;

  // Localized tags
  const city = getLocalizedProperty('city', job.city_en);
  const type = getLocalizedProperty('type', job.type);
  const level = getLocalizedProperty('experience_level', job.experience_level);
  const industry = getLocalizedProperty('industry', job.industry);
  const title = isRtl ? job.title_ku : job.title_en;
  const description = isRtl ? job.description_ku : job.description_en;

  // Time formatting
  const dateObj = new Date(job.created_at);
  const timeFormatted = dateObj.toLocaleTimeString(language === 'ku' ? 'ku-IQ' : 'en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });

  const handleWhatsAppApply = async () => {
    await JobStorage.incrementClicks(job.id);
    const msg = language === 'ku'
      ? `سڵاو، من پێشکەشکارم بۆ هەلی کاری "${title}" لە ڕێگەی ئەپی Kurd24 Job.`
      : `Hello, I am applying for the "${title}" position listed on Kurd24 Job.`;
    const url = `https://wa.me/${job.whatsapp}?text=${encodeURIComponent(msg)}`;
    Linking.openURL(url).catch(() => Alert.alert('Error', 'WhatsApp is not installed'));
  };

  const handleEmailApply = async () => {
    await JobStorage.incrementClicks(job.id);
    const subject = encodeURIComponent(language === 'ku' ? `پێشکەشکردن: ${title}` : `Application: ${title}`);
    const body = encodeURIComponent(language === 'ku' 
      ? `من پێشکەشکارم بۆ هەلی کاری "${title}" لە کۆمپانیای ${job.company}.` 
      : `I am applying for the position of "${title}" at ${job.company}.`
    );
    Linking.openURL(`mailto:${job.email}?subject=${subject}&body=${body}`).catch(() => Alert.alert('Error', 'Mail app is not available'));
  };

  return (
    <View style={styles.cardContainer}>
      {/* Main Window Card */}
      <GlassView 
        noPadding={true}
        style={[
          styles.windowCard, 
          { 
            backgroundColor: theme === 'dark' ? 'rgba(21, 30, 40, 0.92)' : 'rgba(255, 255, 255, 0.96)', 
            borderColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.25)' : 'rgba(15, 23, 42, 0.22)',
            borderWidth: 2,
          }
        ]}
      >
        {/* Window Header Bar */}
        <View style={[styles.windowHeader, rowStyle, { borderBottomColor: colors.border, backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.01)' }]}>
          <View style={[styles.channelAvatar, { backgroundColor: colors.primary }]}>
            <Text style={styles.channelAvatarText}>{job.company.substring(0, 1).toUpperCase()}</Text>
          </View>
          <View style={[styles.channelInfo, isRtl ? styles.marginRight : styles.marginLeft]}>
            <Text style={[styles.channelName, { color: colors.text }]}>{job.company}</Text>
            <Text style={[styles.channelSub, { color: colors.textSecondary }]}>Kurd24 Job Channel</Text>
          </View>

          {!isAdmin && (
            <TouchableOpacity 
              activeOpacity={0.7} 
              style={[styles.bookmarkIcon, { backgroundColor: colors.border }]}
              onPress={() => toggleBookmark(job.id)}
            >
              <Bookmark 
                size={14} 
                color={bookmarked ? colors.primary : colors.textSecondary} 
                fill={bookmarked ? colors.primary : 'none'} 
              />
            </TouchableOpacity>
          )}
        </View>

        {/* Window Content */}
        <View style={styles.windowContent}>
          {/* Job Title */}
          <Text style={[styles.jobTitle, { color: colors.text }, textStyle]}>
            📢 {title}
          </Text>

          {/* 2-Column Grid */}
          <View style={[styles.gridContainer, rowStyle]}>
            
            {/* Metadata Column (40% width) - aligned based on language */}
            <View style={[styles.metaColumn, isRtl ? styles.alignRight : styles.alignLeft]}>
              <View style={styles.metaItem}>
                <Text style={[styles.metaLabel, { color: colors.textSecondary }]}>{isRtl ? '📍 شار:' : '📍 City:'}</Text>
                <Text numberOfLines={1} style={[styles.metaValue, { color: colors.text }]}>{city}</Text>
              </View>
              <View style={styles.metaItem}>
                <Text style={[styles.metaLabel, { color: colors.textSecondary }]}>{isRtl ? '💼 جۆر:' : '💼 Type:'}</Text>
                <Text numberOfLines={1} style={[styles.metaValue, { color: colors.text }]}>{type}</Text>
              </View>
              <View style={styles.metaItem}>
                <Text style={[styles.metaLabel, { color: colors.textSecondary }]}>{isRtl ? '💵 مووچە:' : '💵 Salary:'}</Text>
                <Text numberOfLines={1} style={[styles.metaValue, { color: colors.text }]}>{job.salary}</Text>
              </View>
              <View style={styles.metaItem}>
                <Text style={[styles.metaLabel, { color: colors.textSecondary }]}>{isRtl ? '🎓 ئەزموون:' : '🎓 Exp:'}</Text>
                <Text numberOfLines={1} style={[styles.metaValue, { color: colors.text }]}>{level}</Text>
              </View>
            </View>

            {/* Vertical Divider */}
            <View style={[styles.columnDivider, { backgroundColor: colors.border }]} />

            {/* Description Column (60% width) */}
            <View style={styles.descColumn}>
              <Text style={[styles.postTextTitle, { color: colors.textSecondary }, textStyle]}>
                📝 <Text style={styles.boldText}>{isRtl ? 'دەربارە:' : 'Description:'}</Text>
              </Text>
              <Text 
                numberOfLines={5} 
                ellipsizeMode="tail"
                style={[styles.postText, { color: colors.text }, textStyle]}
              >
                {description}
              </Text>
            </View>
          </View>

          {/* Horizontal Image Gallery (RTL Aligned for Kurdish, LTR for English) */}
          {job.images && job.images.length > 0 && (
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
          )}

          {/* Telegram Footer: Views, Time, and Read Checkmarks */}
          <View style={[styles.bubbleFooter, rowStyle]}>
            <View style={[styles.footerViews, rowStyle]}>
              <Eye size={12} color={colors.textMuted} style={styles.viewIcon} />
              <Text style={[styles.footerText, { color: colors.textMuted }]}>{job.views}</Text>
            </View>

            <View style={[styles.footerTimeRow, rowStyle]}>
              <Text style={[styles.footerText, { color: colors.textMuted }]}>{timeFormatted}</Text>
              <CheckCheck size={14} color="#5288c1" style={styles.checkIcon} />
            </View>
          </View>

          {/* Admin Editing Options */}
          {isAdmin && (
            <View style={[styles.adminActions, { borderTopColor: colors.border }, rowStyle]}>
              <TouchableOpacity onPress={onEdit} style={[styles.adminBtn, { backgroundColor: colors.primaryGlow }]}>
                <Text style={{ color: colors.primary, fontSize: 12, fontWeight: '700' }}>{t.editJob}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={onDelete} style={[styles.adminBtn, { backgroundColor: colors.accentGlow }]}>
                <Text style={{ color: colors.accent, fontSize: 12, fontWeight: '700' }}>{t.deleteJob}</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Borderless Segmented Action Buttons Bar at the very bottom (spans 100% width) */}
        <View style={[
          styles.segmentedBar, 
          { 
            borderTopWidth: 1,
            borderTopColor: colors.border,
            backgroundColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.015)' : 'rgba(0, 0, 0, 0.01)'
          }
        ]}>
          <TouchableOpacity 
            activeOpacity={0.7} 
            style={styles.segmentBtn}
            onPress={handleWhatsAppApply}
          >
            <MessageCircle size={14} color="#25D366" />
            <Text style={[styles.segmentBtnText, { color: '#25D366' }]}>
              {language === 'ku' ? 'وەتسئەپ' : 'WhatsApp'}
            </Text>
          </TouchableOpacity>

          <View style={[styles.verticalDivider, { backgroundColor: colors.border }]} />

          <TouchableOpacity 
            activeOpacity={0.7} 
            style={styles.segmentBtn}
            onPress={handleEmailApply}
          >
            <Mail size={14} color={colors.primary} />
            <Text style={[styles.segmentBtnText, { color: colors.primary }]}>
              {language === 'ku' ? 'ئیمەیڵ' : 'Email'}
            </Text>
          </TouchableOpacity>

          <View style={[styles.verticalDivider, { backgroundColor: colors.border }]} />

          <TouchableOpacity 
            activeOpacity={0.7} 
            style={styles.segmentBtn}
            onPress={onPress}
          >
            <ExternalLink size={14} color={colors.accent} />
            <Text style={[styles.segmentBtnText, { color: colors.accent }]}>
              {language === 'ku' ? 'زانیاری' : 'Details'}
            </Text>
          </TouchableOpacity>
        </View>
      </GlassView>

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
};

const font = 'Vazirmatn';

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
  },
  windowCard: {
    padding: 0,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 3,
  },
  windowHeader: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  windowContent: {
    padding: 14,
    paddingBottom: 8,
  },
  channelAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  channelAvatarText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
    fontFamily: font,
  },
  channelInfo: {
    flex: 1,
  },
  marginLeft: {
    marginLeft: 10,
  },
  marginRight: {
    marginRight: 10,
  },
  channelName: {
    fontSize: 13,
    fontWeight: '700',
    fontFamily: font,
  },
  channelSub: {
    fontSize: 10,
    opacity: 0.5,
    fontFamily: font,
  },
  bookmarkIcon: {
    width: 24,
    height: 24,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  jobTitle: {
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 10,
    lineHeight: 18,
    fontFamily: font,
  },
  gridContainer: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  metaColumn: {
    flex: 1.1,
    gap: 8,
  },
  alignLeft: {
    alignItems: 'flex-start',
  },
  alignRight: {
    alignItems: 'flex-end',
  },
  metaItem: {
    width: '100%',
  },
  metaLabel: {
    fontSize: 10,
    fontWeight: '600',
    marginBottom: 1,
    fontFamily: font,
  },
  metaValue: {
    fontSize: 11,
    fontWeight: '700',
    fontFamily: font,
  },
  columnDivider: {
    width: 1,
    height: '100%',
    marginHorizontal: 12,
  },
  descColumn: {
    flex: 1.9,
  },
  postTextTitle: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 4,
    fontFamily: font,
  },
  postText: {
    fontSize: 11.5,
    lineHeight: 16,
    fontFamily: font,
  },
  boldText: {
    fontWeight: '700',
    fontFamily: font,
  },
  galleryContainer: {
    width: '100%',
    marginVertical: 10,
  },
  galleryScroll: {
    gap: 8,
  },
  thumbnailWrapper: {
    borderRadius: 6,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  thumbnail: {
    width: 60,
    height: 60,
  },
  bubbleFooter: {
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  footerViews: {
    alignItems: 'center',
    gap: 4,
  },
  viewIcon: {
    opacity: 0.7,
  },
  footerTimeRow: {
    alignItems: 'center',
    gap: 4,
  },
  footerText: {
    fontSize: 10,
    fontWeight: '500',
    fontFamily: font,
  },
  checkIcon: {
    marginLeft: 2,
  },
  segmentedBar: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  segmentBtn: {
    flex: 1,
    height: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  segmentBtnText: {
    fontSize: 11,
    fontWeight: '700',
    fontFamily: font,
  },
  verticalDivider: {
    width: 1,
    height: '100%',
  },
  adminActions: {
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 0.5,
    justifyContent: 'space-between',
    gap: 8,
  },
  adminBtn: {
    flex: 1,
    height: 32,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
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
  }
});

export default JobCard;
