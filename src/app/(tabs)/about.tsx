import React from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  Linking, 
  StatusBar,
  Dimensions,
  Platform
} from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { MessageSquare, Send, PhoneCall, Info, ShieldCheck } from 'lucide-react-native';
import { useApp } from '../../context/AppContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import GlassView from '../../components/GlassView';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function AboutScreen() {
  const { colors, theme, language, t, logoUrl, customSettings } = useApp();
  const isRtl = language === 'ku';
  const insets = useSafeAreaInsets();

  // Load settings dynamically with hardcoded fallback values
  const whatsapp = customSettings?.aboutWhatsApp || '9647501234567';
  const telegram = customSettings?.aboutTelegram || '@kurd24_job';
  const phone = customSettings?.aboutPhone || '';
  
  const defaultTextKu = 'ئێمە لە Kurd24 Job پردی سەرەکین بۆ بەیەک گەیاندنی خاوەنکاران و کارخوازان. ئەگەر دەتەوێت کارەکەت بە خێراترین کات بڵاوببێتەوە و بگاتە زۆرترین کارخواز، یان گەر دەتەوێت کارەکەت بکەیتە ڕیکلامی VIP بە ئەنیمەیشنی زێڕینی جوڵاو، لە ڕێگەی دەستەبەرەکانی خوارەوە پەیوەندیمان پێوە بکەن:';
  const defaultTextEn = 'We at Kurd24 Job are the main bridge connecting employers and job seekers. If you want your job to be published quickly and reach the maximum number of job seekers, or if you want to turn your post into a VIP Ad with a moving gold border, contact us via the options below:';

  const aboutText = isRtl 
    ? (customSettings?.aboutTextKu || defaultTextKu)
    : (customSettings?.aboutTextEn || defaultTextEn);

  const handleWhatsApp = () => {
    // Remove '+' if present
    const cleanWhatsApp = whatsapp.replace('+', '').trim();
    Linking.openURL(`https://wa.me/${cleanWhatsApp}`);
  };

  const handleTelegram = () => {
    // Remove '@' and URL parts if present
    let cleanTelegram = telegram.replace('@', '').trim();
    if (cleanTelegram.includes('t.me/')) {
      cleanTelegram = cleanTelegram.split('t.me/').pop() || '';
    }
    Linking.openURL(`https://t.me/${cleanTelegram}`);
  };

  const handlePhone = () => {
    if (phone) {
      Linking.openURL(`tel:${phone}`);
    } else {
      Linking.openURL(`tel:${whatsapp}`);
    }
  };

  const rowStyle = isRtl ? styles.rowReverse : styles.row;
  const textStyle = isRtl ? styles.textRight : styles.textLeft;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} />
      
      {/* Background Gradient */}
      <LinearGradient
        colors={colors.gradientBg}
        style={StyleSheet.absoluteFillObject}
      />
      
      {/* Background Glow Orbs */}
      {theme === 'dark' && (
        <>
          <View style={[styles.glowOrb, { top: -100, right: -100, backgroundColor: colors.primary }]} />
          <View style={[styles.glowOrb, { bottom: 50, left: -120, backgroundColor: colors.accent }]} />
        </>
      )}

      <ScrollView 
        style={[styles.safeArea, { paddingTop: insets.top }]}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={[styles.header, rowStyle]}>
          <Text style={[styles.title, { color: colors.text }]}>{t.aboutUs}</Text>
        </View>

        {/* Branding Showcase Card */}
        <GlassView style={[styles.brandCard, { borderColor: colors.cardBorder }]}>
          <View style={styles.logoFrame}>
            <Image 
              source={logoUrl ? { uri: logoUrl } : require('@/assets/images/logo.png')} 
              style={styles.logoImage} 
              priority="high"
            />
          </View>
          <Text style={[styles.appName, { color: colors.text }]}>{t.appName}</Text>
          <Text style={[styles.appVersion, { color: colors.textMuted }]}>وەشانی ١.٠.٠ (v1.0.0)</Text>
        </GlassView>

        {/* About Info Content */}
        <GlassView style={[styles.infoCard, { borderColor: colors.cardBorder }]}>
          <View style={[styles.sectionTitleRow, rowStyle]}>
            <Info size={16} color={colors.primary} />
            <Text style={[styles.sectionTitle, { color: colors.primary }, isRtl ? styles.marginRightMini : styles.marginLeftMini]}>
              {isRtl ? 'دەربارەی پلاتفۆرمەکەی ئێمە' : 'About Our Platform'}
            </Text>
          </View>
          <Text style={[styles.infoDescription, { color: colors.textSecondary }, textStyle]}>
            {aboutText}
          </Text>
        </GlassView>

        {/* Contact Actions Section */}
        <Text style={[styles.contactLabel, { color: colors.textMuted }, textStyle]}>
          {isRtl ? 'پەیوەندی خێرا و ڕاستەوخۆ' : 'Direct Contacts'}
        </Text>

        {/* WhatsApp Button */}
        <TouchableOpacity 
          activeOpacity={0.85} 
          style={styles.contactBtnWrapper} 
          onPress={handleWhatsApp}
        >
          <LinearGradient
            colors={['#25D366', '#128C7E']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.contactGradientBtn}
          >
            <View style={[styles.btnInnerContent, rowStyle]}>
              <MessageSquare size={20} color="#FFFFFF" />
              <Text style={styles.contactBtnText}>
                {isRtl ? 'پەیوەندی لە ڕێگەی WhatsApp' : 'Contact via WhatsApp'}
              </Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {/* Telegram Button */}
        <TouchableOpacity 
          activeOpacity={0.85} 
          style={styles.contactBtnWrapper} 
          onPress={handleTelegram}
        >
          <LinearGradient
            colors={['#0088cc', '#0077b5']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.contactGradientBtn}
          >
            <View style={[styles.btnInnerContent, rowStyle]}>
              <Send size={20} color="#FFFFFF" />
              <Text style={styles.contactBtnText}>
                {isRtl ? 'پەیوەندی لە ڕێگەی Telegram' : 'Contact via Telegram'}
              </Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {/* Phone Button */}
        <TouchableOpacity 
          activeOpacity={0.85} 
          style={styles.contactBtnWrapper} 
          onPress={handlePhone}
        >
          <LinearGradient
            colors={[colors.primary, colors.primary + 'CC']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.contactGradientBtn, { shadowColor: colors.primary }]}
          >
            <View style={[styles.btnInnerContent, rowStyle]}>
              <PhoneCall size={20} color="#FFFFFF" />
              <Text style={styles.contactBtnText}>
                {phone 
                  ? (isRtl ? `پەیوەندی بە تەلەفۆن: ${phone}` : `Call Phone: ${phone}`)
                  : (isRtl ? 'پەیوەندی بە تەلەفۆن' : 'Call Directly')}
              </Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {/* Footer Notes */}
        <View style={styles.footerContainer}>
          <View style={[rowStyle, styles.footerRow, { justifyContent: 'center' }]}>
            <ShieldCheck size={13} color={colors.textMuted} />
            <Text style={[styles.footerText, { color: colors.textMuted }]}>
              {isRtl ? 'ڕێساکانی پاراستنی نهێنی پارێزراون' : 'Privacy & Terms Protected'}
            </Text>
          </View>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  glowOrb: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: 130,
    opacity: 0.12,
    filter: Platform.OS === 'ios' ? 'blur(60px)' : undefined,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  header: {
    height: 56,
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    fontFamily: 'NRT',
  },
  brandCard: {
    paddingVertical: 30,
    alignItems: 'center',
    borderRadius: 16,
    marginBottom: 20,
  },
  logoFrame: {
    width: 84,
    height: 84,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  logoImage: {
    width: '80%',
    height: '80%',
    objectFit: 'contain',
  },
  appName: {
    fontSize: 20,
    fontWeight: '800',
    fontFamily: 'NRT',
    marginBottom: 4,
  },
  appVersion: {
    fontSize: 12,
    fontFamily: 'NRT',
  },
  infoCard: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 25,
  },
  sectionTitleRow: {
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    fontFamily: 'NRT',
  },
  infoDescription: {
    fontSize: 13,
    lineHeight: 22,
    fontFamily: 'NRT',
  },
  contactLabel: {
    fontSize: 13,
    fontWeight: '800',
    fontFamily: 'NRT',
    marginBottom: 14,
    paddingHorizontal: 4,
  },
  contactBtnWrapper: {
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  contactGradientBtn: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnInnerContent: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    width: '100%',
  },
  contactBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    fontFamily: 'NRT',
  },
  footerContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  footerRow: {
    alignItems: 'center',
    gap: 6,
  },
  footerText: {
    fontSize: 11,
    fontFamily: 'NRT',
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
  marginLeftMini: {
    marginLeft: 6,
  },
  marginRightMini: {
    marginRight: 6,
  },
});
