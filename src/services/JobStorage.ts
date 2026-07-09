import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './SupabaseClient';

export interface Job {
  id: string;
  title_ku: string;
  title_en: string;
  company: string;
  industry: string;
  logo_url?: string;
  images?: string[];
  city_ku: string;
  city_en: string;
  category: string;
  type: string; // e.g. Full-time, Part-time, Contract, Remote
  experience_level: string; // e.g. Junior, Mid, Senior, Lead
  salary: string;
  description_ku: string;
  description_en: string;
  requirements_ku: string; // Newline separated
  requirements_en: string; // Newline separated
  whatsapp: string; // e.g. 9647501234567
  email: string;
  status: 'draft' | 'published';
  views: number;
  clicks: number;
  created_at: string;
  is_vip?: boolean;
  is_pinned?: boolean;
  form_url?: string;
  is_ad?: boolean;
  video_url?: string;
  address?: string;
  map_url?: string;
  video_layout?: 'portrait' | 'landscape';
}

export interface PropertyItem {
  id: string;
  name_ku: string;
  name_en: string;
}

const STORAGE_KEY = '@kurd24_jobs';

// Pre-seeded high-quality mock jobs
const MOCK_JOBS: Job[] = [
  {
    id: 'job-1',
    title_ku: 'گەشەپێدەری ئەپی مۆبایل (React Native)',
    title_en: 'Mobile App Developer (React Native)',
    company: 'Kurd24 Tech Solutions',
    industry: 'tech',
    logo_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=150&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=150&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=150&auto=format&fit=crop&q=80'
    ],
    city_ku: 'erbil',
    city_en: 'erbil',
    category: 'software',
    type: 'fullTime',
    experience_level: 'mid',
    salary: '$1,500 - $2,200',
    description_ku: 'ئێمە بەدوای گەشەپێدەرێکی لێهاتووی React Native دەگەڕێین بۆ دروستکردن و باشترکردنی ئەپی مۆبایلی هاوچەرخ. کارەکە لە نوسینگەی هەولێر دەبێت لەگەڵ تیمێکی فرەچەشن.',
    description_en: 'We are looking for a skilled React Native developer to design and build next-generation mobile applications. You will join our high-performing tech team based in Erbil.',
    requirements_ku: 'ئەزموونی بەکارهێنانی React Native بۆ ٢ ساڵ یان زیاتر\nتێگەیشتن لە کارکردنی Redux یان App Context\nشارەزایی لە خزمەتگوزارییەکانی REST API و Supabase\nتوانای قسەکردن بە زمانی کوردی و ئینگلیزی',
    requirements_en: '2+ years of professional React Native development experience\nSolid understanding of state management (Redux, Context API)\nExperience integrating REST APIs, Supabase, or Firebase\nStrong communication skills in Kurdish and English',
    whatsapp: '9647501234567',
    email: 'hr@kurd24.job',
    status: 'published',
    views: 245,
    clicks: 43,
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    is_vip: true,
  },
  {
    id: 'job-2',
    title_ku: 'دیزاینەری باڵای UI/UX',
    title_en: 'Senior UI/UX Designer',
    company: 'Hewlêr Media Group',
    industry: 'design',
    logo_url: 'https://images.unsplash.com/photo-1618005198143-e5283b519a7f?w=150&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1561070791-26c113006238?w=150&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?w=150&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?w=150&auto=format&fit=crop&q=80'
    ],
    city_ku: 'erbil',
    city_en: 'erbil',
    category: 'design',
    type: 'fullTime',
    experience_level: 'senior',
    salary: '$1,800 - $2,500',
    description_ku: 'دیزاینەرێکی باڵامان دەوێت بۆ دروستکردنی کارلێک و ڕووکاری کاربەرهێنەری ناوازە بۆ وێبسایت و ئەپەکانمان. پێویستە خاوەن پرۆفایلی بەهێز بێت لە Figma.',
    description_en: 'We are seeking a senior UI/UX designer to create stunning user interfaces and experiences for our media portals. Figma proficiency and a strong portfolio are required.',
    requirements_ku: '٤ ساڵ کارکردنی ڕاستەقینە لە دیزاینی دیجیتاڵیدا\nتوانای نوێکردنەوە و پێشخستنی شێوازی دیزاینی گلاسی و نیۆن\nشارەزایی تەواو لە Figma و Adobe Suite\nئامادەکردنی پرۆتۆتایپی پێشکەوتوو',
    requirements_en: '4+ years of professional digital design experience\nExperience designing modern, glassmorphic, and minimalist interfaces\nMastery of Figma, design systems, and prototyping tools\nAbility to present user flows and conduct usability testing',
    whatsapp: '9647507654321',
    email: 'careers@hewlermedia.net',
    status: 'published',
    views: 189,
    clicks: 29,
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'job-3',
    title_ku: 'بەڕێوەبەری مارکێتینگ و سۆشیاڵ میدیا',
    title_en: 'Social Media Marketing Manager',
    company: 'Silêmanî Trading Co.',
    industry: 'retail',
    logo_url: 'https://images.unsplash.com/photo-1606857521015-7f9fcf423740?w=150&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=150&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=150&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1557200134-90327ee9fafa?w=150&auto=format&fit=crop&q=80'
    ],
    city_ku: 'sulaymaniyah',
    city_en: 'sulaymaniyah',
    category: 'marketing',
    type: 'fullTime',
    experience_level: 'mid',
    salary: 'IQD 1,500,000',
    description_ku: 'ئەرکی تۆ داڕشتنی پلانی مارکێتینگ دەبێت لە سۆشیاڵ میدیادا بۆ بەرزکردنەوەی فرۆش و ناساندنی زیاتری کاڵاکانمان لە پارێزگای سلێمانی و دەوروبەری.',
    description_en: 'You will manage social media advertising campaigns, content creation, and brand engagement to drive sales and awareness across Sulaymaniyah.',
    requirements_ku: 'ئەزموونی ٢ ساڵ لە مارکێتینگی سۆشیاڵ میدیا\nتوانای نووسینی ناوەڕۆکی سەرنجڕاکێش بە کوردی و عەرەبی\nشارەزایی لە بەڕێوەبردنی کامپەینی سپۆنسەر (Facebook/Instagram Ads)\nئاشنایی بە ئامرازەکانی شیکاری سۆشیاڵ میدیا',
    requirements_en: '2+ years of social media marketing experience\nAbility to write engaging copy in Kurdish and Arabic\nExperience running paid Meta campaigns (FB/IG Ads Manager)\nFamiliarity with marketing analytics and scheduling tools',
    whatsapp: '9647701122334',
    email: 'info@silemanitrading.com',
    status: 'published',
    views: 110,
    clicks: 18,
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'job-4',
    title_ku: 'وەرگێڕی یاسایی (کوردی - ئینگلیزی)',
    title_en: 'Legal Translator (Kurdish - English)',
    company: 'Kurdish Localization Hub',
    industry: 'education',
    logo_url: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=150&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=150&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=150&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=150&auto=format&fit=crop&q=80'
    ],
    city_ku: 'remote',
    city_en: 'remote',
    category: 'translation',
    type: 'remote',
    experience_level: 'lead',
    salary: '$800 - $1,200',
    description_ku: 'وەرگێڕانی بەڵگەنامە فەرمییەکان و گرێبەستەکان لە زمانی ئینگلیزییەوە بۆ کوردی (سۆرانی و بادینی) بە شێوازێکی زانستی و یاسایی دروست.',
    description_en: 'Translate official documentation, contracts, and policies from English to Central Kurdish (Sorani) and Northern Kurdish (Badini) with legal accuracy.',
    requirements_ku: 'بڕوانامەی بەکالۆریۆس لە زمان یان وەرگێڕاندا\nئەزموونی کارکردن وەک وەرگێڕی فەرمی لانی کەم ٣ ساڵ\nدیسپلینی بەرز بۆ کارکردنی دوور و پابەندبوون بە کاتی دیاریکراو',
    requirements_en: 'Bachelor’s degree in English, Translation, or related field\n3+ years of professional translation experience, legal background preferred\nStrong self-discipline for remote work and meeting deadlines',
    whatsapp: '9647509998877',
    email: 'apply@kurdlocalization.org',
    status: 'published',
    views: 94,
    clicks: 22,
    created_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'job-5',
    title_ku: 'ئەندازیاری شارستانی (پڕۆژەی نیشتەجێبوون)',
    title_en: 'Civil Engineer (Residential Project)',
    company: 'Duhok Build Ltd',
    industry: 'engineering',
    logo_url: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=150&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=150&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=150&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1581094288338-2314dddb7ecc?w=150&auto=format&fit=crop&q=80'
    ],
    city_ku: 'duhok',
    city_en: 'duhok',
    category: 'engineering',
    type: 'contract',
    experience_level: 'mid',
    salary: '$1,200',
    description_ku: 'پێویستمان بە ئەندازیارێکی شارستانی هەیە بۆ چاودێریکردن و سەرپەرشتیکردنی پڕۆژەیەکی نوێی نیشتەجێبوون لە دهۆک.',
    description_en: 'We need a civil engineer to oversee a new residential construction project in Duhok.',
    requirements_ku: 'بڕوانامەی ئەندازیاری شارستانی\nشارەزایی لە AutoCAD و بەرنامەکانی چاودێری پڕۆژە\nکارکردن لە دهۆک',
    requirements_en: 'Degree in Civil Engineering\nProficiency in AutoCAD and structural analysis software\nBased in or willing to relocate to Duhok',
    whatsapp: '9647502223344',
    email: 'jobs@duhokbuild.com',
    status: 'published',
    views: 45,
    clicks: 2,
    created_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'job-6',
    title_ku: 'مامۆستای زمانی ئینگلیزی',
    title_en: 'English Language Teacher',
    company: 'Duhok International Academy',
    industry: 'education',
    logo_url: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?w=150&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=150&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=150&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1577896851231-70ef18881754?w=150&auto=format&fit=crop&q=80'
    ],
    city_ku: 'duhok',
    city_en: 'duhok',
    category: 'education',
    type: 'fullTime',
    experience_level: 'mid',
    salary: '$1,000 - $1,300',
    description_ku: 'قوتابخانەکەمان لە دهۆک بەدوای مامۆستایەکی لێهاتوو دەگەڕێت بۆ وتنەوەی وانەی ئینگلیزی بە پۆلەکانی ناوەندی و ئامادەیی.',
    description_en: 'Our academy in Duhok is hiring a qualified English teacher for middle and high school students.',
    requirements_ku: 'بڕوانامەی بەکالۆریۆس لە زمانی ئینگلیزی\nلانی کەم ٢ ساڵ ئەزموونی وانەوتنەوە\nخاوەن کەسایەتی گونجاو و مامەڵەی باش لەگەڵ قوتابیان',
    requirements_en: 'Bachelor\'s degree in English Literature or Education\n2+ years of classroom teaching experience\nStrong interpersonal and classroom management skills',
    whatsapp: '9647501112223',
    email: 'hr@duhokacademy.edu.krd',
    status: 'published',
    views: 78,
    clicks: 12,
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'job-7',
    title_ku: 'دیزاینەری گرافیک (کاروباری ڕیکلام)',
    title_en: 'Graphic Designer (Advertising)',
    company: 'Slemani Creative Studio',
    industry: 'design',
    logo_url: 'https://images.unsplash.com/photo-1561070791-26c113006238?w=150&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1626785774573-4b799315345d?w=150&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=150&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1626785774625-ddc7c8241314?w=150&auto=format&fit=crop&q=80'
    ],
    city_ku: 'sulaymaniyah',
    city_en: 'sulaymaniyah',
    category: 'design',
    type: 'partTime',
    experience_level: 'junior',
    salary: 'IQD 800,000',
    description_ku: 'دیزاینەرێکی گرافیکمان دەوێت بۆ دروستکردنی دیزاینی سۆشیاڵ میدیا و لۆگۆ بە شێوەی نیوەکات لە ستۆدیۆکەمان لە سلێمانی.',
    description_en: 'We are seeking a part-time graphic designer to create social media posts and branding visual assets at our studio in Sulaymaniyah.',
    requirements_ku: 'شارەزایی لە Adobe Photoshop و Illustrator\nپێشکەشکردنی نموونەی دیزاینەکانی پێشوو (Portfolio)\nئامادەبوون بۆ کارکردنی تیم و هاوبەش',
    requirements_en: 'Proficiency in Adobe Photoshop, Illustrator, or Canva\nPortfolio showcasing branding/social media work\nHigh creativity and ability to work in a collaborative environment',
    whatsapp: '9647704445566',
    email: 'design@slemanistudio.com',
    status: 'published',
    views: 132,
    clicks: 34,
    created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'job-8',
    title_ku: 'پسپۆڕی پشتیوانی IT',
    title_en: 'IT Support Specialist',
    company: 'Kirkuk Oil Services Co.',
    industry: 'tech',
    logo_url: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=150&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=150&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1581092921461-eab62e97a780?w=150&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1596495578065-6e0763fa1141?w=150&auto=format&fit=crop&q=80'
    ],
    city_ku: 'kirkuk',
    city_en: 'kirkuk',
    category: 'software',
    type: 'fullTime',
    experience_level: 'junior',
    salary: 'IQD 1,200,000',
    description_ku: 'پێویستمان بە کارمەندێکی لێهاتووە بۆ چاودێریکردن و پێشکەشکردنی پشتیوانی تەکنیکی بۆ سیستمەکان و تۆڕەکان لە نوسینگەی کەرکوک.',
    description_en: 'We are seeking an IT Support Specialist to maintain computers, servers, and networks, providing technical support at our Kirkuk office.',
    requirements_ku: 'بڕوانامەی بەکالۆریۆس لە زانستی کۆمپیوتەر یان تەکنەلۆژیای زانیاری\nشارەزایی لە کێشە شارەسەرکردنی ڕەقەکاڵا و نەرمەکاڵا\nئەزموونی ١ ساڵ لە پشتیوانی IT',
    requirements_en: 'Bachelor\'s degree in Computer Science, IT, or related field\nGood troubleshooting skills in hardware, software, and networks\n1+ years of IT support experience',
    whatsapp: '9647708887766',
    email: 'support@kirkukoilsol.com',
    status: 'published',
    views: 120,
    clicks: 14,
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'job-9',
    title_ku: 'پسپۆڕی مارکێتینگی دیجیتاڵی',
    title_en: 'Digital Marketing Specialist',
    company: 'Hewlêr Agency',
    industry: 'retail',
    logo_url: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=150&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=150&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=150&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=150&auto=format&fit=crop&q=80'
    ],
    city_ku: 'erbil',
    city_en: 'erbil',
    category: 'marketing',
    type: 'remote',
    experience_level: 'mid',
    salary: '$1,200',
    description_ku: 'داڕشتن و بەڕێوەبردنی کامپەینەکانی ڕیکلام لەسەر گووگڵ و تۆڕە کۆمەڵایەتییەکان بە شێوازی دوورەکار (Remote).',
    description_en: 'Manage paid advertisement search/social campaigns (Google Ads, Meta Ads) remotely for our Erbil office clients.',
    requirements_ku: 'بڕوانامەی فەرمی لە Google Ads یان Meta Blueprint\nئەزموونی بەڕێوەبردنی بودجەی ڕیکلام\nتوانای شیکارکردنی ئەنجامەکان و پێشکەشکردنی ڕاپۆرت',
    requirements_en: 'Certification in Google Ads or Meta Ads\nProven track record managing paid advertising budgets\nAbility to analyze campaign performance and generate reports',
    whatsapp: '9647508889900',
    email: 'info@hewleragency.com',
    status: 'published',
    views: 90,
    clicks: 19,
    created_at: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'job-10',
    title_ku: 'نووسەری ناوەڕۆک (کوردی و عەرەبی)',
    title_en: 'Content Writer (Kurdish & Arabic)',
    company: 'Hewlêr Press Group',
    industry: 'media',
    logo_url: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=150&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=150&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?w=150&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=150&auto=format&fit=crop&q=80'
    ],
    city_ku: 'remote',
    city_en: 'remote',
    category: 'translation',
    type: 'remote',
    experience_level: 'mid',
    salary: '$900',
    description_ku: 'ئێمە بەدوای نووسەرێکی ناوەڕۆکی بەهرەمەند دەگەڕێین بۆ نووسینی وتار، ڕاپۆرت و بڵاوکراوەی سۆشیاڵ میدیا بە هەردوو زمانی کوردی و عەرەبی بە شێوەی دوورەکار (Remote).',
    description_en: 'We are looking for a talented content writer to create articles, reports, and social media updates in both Kurdish and Arabic remotely.',
    requirements_ku: 'شارەزایی تەواو لە نووسینی کوردی و عەرەبی بە شێوەیەکی زمانەوانی دروست\nئەزموونی نووسینی پێشوو لانی کەم ٢ ساڵ\nتوانای پابەندبوون بە کاتی پێشکەشکردنی بابەتەکان',
    requirements_en: 'Excellent writing skills in both Kurdish and Arabic\n2+ years of professional writing or blogging experience\nAbility to work independently and meet tight deadlines',
    whatsapp: '9647503334455',
    email: 'editor@hewlerpress.net',
    status: 'published',
    views: 65,
    clicks: 8,
    created_at: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString(),
  }
];

const seedDatabaseIfNeeded = async () => {
  try {
    const existing = await AsyncStorage.getItem(STORAGE_KEY);
    if (!existing || JSON.parse(existing).length < MOCK_JOBS.length) {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(MOCK_JOBS));
    }
  } catch (e) {
    console.error('Failed to seed local DB:', e);
  }
};

// Seeding is handled dynamically inside database methods

export const JobStorage = {
  /**
   * Fetch jobs based on filter and admin privileges
   */
  async getJobs(showDrafts = false): Promise<Job[]> {
    await seedDatabaseIfNeeded();
    if (supabase) {
      try {
        let query = supabase.from('jobs').select('*');
        if (!showDrafts) {
          query = query.eq('status', 'published');
        }
        // Try ordering by is_pinned first, then created_at
        let result = await query.order('is_pinned', { ascending: false }).order('created_at', { ascending: false });
        if (result.error) {
          // Fallback if is_pinned column is missing
          console.warn("Sorting by is_pinned failed (column might be missing), retrying with created_at only:", result.error.message);
          result = await query.order('created_at', { ascending: false });
        }
        if (result.error) throw result.error;
        return (result.data || []) as Job[];
      } catch (e) {
        console.error('Supabase getJobs failed, falling back to AsyncStorage:', e);
      }
    }

    // Local AsyncStorage Fallback
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      if (data) {
        const jobsList: Job[] = JSON.parse(data);
        const sortedJobs = jobsList.sort((a, b) => {
          const aPinned = a.is_pinned ? 1 : 0;
          const bPinned = b.is_pinned ? 1 : 0;
          if (aPinned !== bPinned) return bPinned - aPinned;
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        });
        if (showDrafts) {
          return sortedJobs;
        }
        return sortedJobs.filter(j => j.status === 'published');
      }
      return MOCK_JOBS.filter(j => showDrafts || j.status === 'published');
    } catch (e) {
      console.error(e);
      return MOCK_JOBS.filter(j => showDrafts || j.status === 'published');
    }
  },

  /**
   * Get a job by ID
   */
  async getJobById(id: string): Promise<Job | null> {
    await seedDatabaseIfNeeded();
    if (supabase) {
      try {
        const { data, error } = await supabase.from('jobs').select('*').eq('id', id).single();
        if (error) throw error;
        return data as Job;
      } catch (e) {
        console.error('Supabase getJobById failed, falling back to AsyncStorage:', e);
      }
    }

    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      if (data) {
        const jobsList: Job[] = JSON.parse(data);
        return jobsList.find(j => j.id === id) || null;
      }
    } catch (e) {
      console.error(e);
    }
    return MOCK_JOBS.find(j => j.id === id) || null;
  },

  /**
   * Create a new job listing
   */
  async createJob(jobData: Omit<Job, 'id' | 'created_at' | 'views' | 'clicks'>): Promise<Job> {
    await seedDatabaseIfNeeded();
    const newJob: Job = {
      ...jobData,
      id: `job-${Date.now()}-${Math.random().toString(36).substring(4)}`,
      views: 0,
      clicks: 0,
      created_at: new Date().toISOString()
    };

    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('jobs')
          .insert([{
            title_ku: newJob.title_ku,
            title_en: newJob.title_en,
            company: newJob.company,
            industry: newJob.industry,
            logo_url: newJob.logo_url || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80',
            images: newJob.images || [],
            city_ku: newJob.city_ku,
            city_en: newJob.city_en,
            category: newJob.category,
            type: newJob.type,
            experience_level: newJob.experience_level,
            salary: newJob.salary,
            description_ku: newJob.description_ku,
            description_en: newJob.description_en,
            requirements_ku: newJob.requirements_ku,
            requirements_en: newJob.requirements_en,
            whatsapp: newJob.whatsapp,
            email: newJob.email,
            status: newJob.status,
            is_vip: newJob.is_vip ?? false,
            is_pinned: newJob.is_pinned ?? false,
            views: 0,
            clicks: 0
          }])
          .select()
          .single();

        if (error) throw error;
        if (data) return data as Job;
      } catch (e) {
        console.error('Supabase createJob failed, running locally:', e);
      }
    }

    // Save locally
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      const jobsList: Job[] = data ? JSON.parse(data) : [...MOCK_JOBS];
      jobsList.push(newJob);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(jobsList));
    } catch (e) {
      console.error(e);
    }
    return newJob;
  },

  /**
   * Update an existing job
   */
  async updateJob(id: string, updates: Partial<Job>): Promise<Job | null> {
    await seedDatabaseIfNeeded();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('jobs')
          .update(updates)
          .eq('id', id)
          .select()
          .single();

        if (error) throw error;
        if (data) return data as Job;
      } catch (e) {
        console.error('Supabase updateJob failed, running locally:', e);
      }
    }

    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      if (data) {
        const jobsList: Job[] = JSON.parse(data);
        const index = jobsList.findIndex(j => j.id === id);
        if (index !== -1) {
          const updatedJob = { ...jobsList[index], ...updates };
          jobsList[index] = updatedJob;
          await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(jobsList));
          return updatedJob;
        }
      }
    } catch (e) {
      console.error(e);
    }
    return null;
  },

  /**
   * Delete a job listing
   */
  async deleteJob(id: string): Promise<boolean> {
    await seedDatabaseIfNeeded();
    if (supabase) {
      try {
        const { error } = await supabase.from('jobs').delete().eq('id', id);
        if (error) throw error;
        return true;
      } catch (e) {
        console.error('Supabase deleteJob failed, running locally:', e);
      }
    }

    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      if (data) {
        const jobsList: Job[] = JSON.parse(data);
        const filteredList = jobsList.filter(j => j.id !== id);
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(filteredList));
        return true;
      }
    } catch (e) {
      console.error(e);
    }
    return false;
  },

  /**
   * Increment job views
   */
  async incrementViews(id: string): Promise<void> {
    if (supabase) {
      try {
        // Increment natively using postgres RPC or custom SQL update, or just client-side increments
        // For simplicity, we can fetch, increment, and update
        const job = await this.getJobById(id);
        if (job) {
          await supabase.from('jobs').update({ views: job.views + 1 }).eq('id', id);
        }
        return;
      } catch (e) {
        console.error('Supabase incrementViews failed:', e);
      }
    }

    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      if (data) {
        const jobsList: Job[] = JSON.parse(data);
        const index = jobsList.findIndex(j => j.id === id);
        if (index !== -1) {
          jobsList[index].views += 1;
          await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(jobsList));
        }
      }
    } catch (e) {
      console.error(e);
    }
  },

  /**
   * Increment job applications / clicks
   */
  async incrementClicks(id: string): Promise<void> {
    if (supabase) {
      try {
        const job = await this.getJobById(id);
        if (job) {
          await supabase.from('jobs').update({ clicks: job.clicks + 1 }).eq('id', id);
        }
        return;
      } catch (e) {
        console.error('Supabase incrementClicks failed:', e);
      }
    }

    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      if (data) {
        const jobsList: Job[] = JSON.parse(data);
        const index = jobsList.findIndex(j => j.id === id);
        if (index !== -1) {
          jobsList[index].clicks += 1;
          await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(jobsList));
        }
      }
    } catch (e) {
      console.error(e);
    }
  },

  /**
   * Reset database back to the 10 mock jobs
   */
  async resetDatabaseToMock(): Promise<boolean> {
    try {
      // 1. Reset AsyncStorage
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(MOCK_JOBS));
      
      // 2. Reset Supabase if configured
      if (supabase) {
        // Delete all records
        const { error: deleteError } = await supabase.from('jobs').delete().neq('id', '');
        if (deleteError) {
          console.error('Supabase delete error during reset:', deleteError);
        }
        
        // Insert clean mock jobs
        const jobsToInsert = MOCK_JOBS.map(job => ({
          title_ku: job.title_ku,
          title_en: job.title_en,
          company: job.company,
          industry: job.industry,
          logo_url: job.logo_url,
          images: job.images || [],
          city_ku: job.city_ku,
          city_en: job.city_en,
          category: job.category,
          type: job.type,
          experience_level: job.experience_level,
          salary: job.salary,
          description_ku: job.description_ku,
          description_en: job.description_en,
          requirements_ku: job.requirements_ku,
          requirements_en: job.requirements_en,
          whatsapp: job.whatsapp,
          email: job.email,
          status: job.status,
          is_vip: job.is_vip ?? false,
          views: job.views,
          clicks: job.clicks,
          created_at: job.created_at
        }));
        
        const { error: insertError } = await supabase.from('jobs').insert(jobsToInsert);
        if (insertError) throw insertError;
      }
      return true;
    } catch (e) {
      console.error('Failed to reset DB:', e);
      return false;
    }
  },

  async getCategories(): Promise<PropertyItem[]> {
    if (supabase) {
      try {
        const { data, error } = await supabase.from('categories').select('*').order('created_at', { ascending: true });
        if (error) throw error;
        if (data && data.length > 0) return data as PropertyItem[];
      } catch (e) {
        console.error('Supabase getCategories failed, using fallback:', e);
      }
    }
    return FALLBACK_CATEGORIES;
  },

  async getCities(): Promise<PropertyItem[]> {
    if (supabase) {
      try {
        const { data, error } = await supabase.from('cities').select('*').order('created_at', { ascending: true });
        if (error) throw error;
        if (data && data.length > 0) return data as PropertyItem[];
      } catch (e) {
        console.error('Supabase getCities failed, using fallback:', e);
      }
    }
    return FALLBACK_CITIES;
  },

  async getIndustries(): Promise<PropertyItem[]> {
    if (supabase) {
      try {
        const { data, error } = await supabase.from('industries').select('*').order('created_at', { ascending: true });
        if (error) throw error;
        if (data && data.length > 0) return data as PropertyItem[];
      } catch (e) {
        console.error('Supabase getIndustries failed, using fallback:', e);
      }
    }
    return FALLBACK_INDUSTRIES;
  },

  async getJobTypes(): Promise<PropertyItem[]> {
    if (supabase) {
      try {
        const { data, error } = await supabase.from('job_types').select('*').order('created_at', { ascending: true });
        if (error) throw error;
        if (data && data.length > 0) return data as PropertyItem[];
      } catch (e) {
        console.error('Supabase getJobTypes failed, using fallback:', e);
      }
    }
    return FALLBACK_JOB_TYPES;
  },

  async getExperienceLevels(): Promise<PropertyItem[]> {
    if (supabase) {
      try {
        const { data, error } = await supabase.from('experience_levels').select('*').order('created_at', { ascending: true });
        if (error) throw error;
        if (data && data.length > 0) return data as PropertyItem[];
      } catch (e) {
        console.error('Supabase getExperienceLevels failed, using fallback:', e);
      }
    }
    return FALLBACK_EXPERIENCE_LEVELS;
  }
};

const FALLBACK_CATEGORIES: PropertyItem[] = [
  { id: 'software', name_ku: 'گەشەپێدانی نەرمەکاڵا', name_en: 'Software Development' },
  { id: 'design', name_ku: 'دیزاین و گرافیک', name_en: 'Design & Creative' },
  { id: 'marketing', name_ku: 'مارکێتینگ و فرۆشتن', name_en: 'Marketing & Sales' },
  { id: 'finance', name_ku: 'دارایی و وردبینی', name_en: 'Finance & Accounting' },
  { id: 'education', name_ku: 'فێرکردن', name_en: 'Education & Teaching' },
  { id: 'translation', name_ku: 'وەرگێڕان', name_en: 'Translation & Content' },
  { id: 'engineering', name_ku: 'ئەندازیاری', name_en: 'Engineering & Operations' }
];

const FALLBACK_CITIES: PropertyItem[] = [
  { id: 'erbil', name_ku: 'هەولێر (Hewlêr)', name_en: 'Erbil (Hewlêr)' },
  { id: 'sulaymaniyah', name_ku: 'سلێمانی (Silêmanî)', name_en: 'Sulaymaniyah (Silêmanî)' },
  { id: 'duhok', name_ku: 'دهۆک (Duhok)', name_en: 'Duhok (Duhok)' },
  { id: 'halabja', name_ku: 'هەڵەبجە', name_en: 'Halabja' },
  { id: 'kirkuk', name_ku: 'کەرکوک', name_en: 'Kirkuk' },
  { id: 'remote', name_ku: 'دوورەکار (Remote)', name_en: 'Remote' }
];

const FALLBACK_INDUSTRIES: PropertyItem[] = [
  { id: 'tech', name_ku: 'تەکنەلۆژیا و نەرمەکاڵا', name_en: 'Tech & Software' },
  { id: 'health', name_ku: 'تەندروستی و پزیشکی', name_en: 'Health & Medical' },
  { id: 'education', name_ku: 'پەروەردە و فێرکردن', name_en: 'Education' },
  { id: 'retail', name_ku: 'فرۆشتن و مارکێتينگ', name_en: 'Sales & Retail' },
  { id: 'finance', name_ku: 'دارایی و بانکداری', name_en: 'Finance & Banking' },
  { id: 'engineering', name_ku: 'ئەندازیاری', name_en: 'Engineering' },
  { id: 'media', name_ku: 'میدیا و ڕاگەیاندن', name_en: 'Media & PR' }
];

const FALLBACK_JOB_TYPES: PropertyItem[] = [
  { id: 'fullTime', name_ku: 'تەواو کات', name_en: 'Full-time' },
  { id: 'partTime', name_ku: 'نیوە کات', name_en: 'Part-time' },
  { id: 'contract', name_ku: 'گرێبەست', name_en: 'Contract' },
  { id: 'remote', name_ku: 'دوورەکار', name_en: 'Remote' }
];

const FALLBACK_EXPERIENCE_LEVELS: PropertyItem[] = [
  { id: 'junior', name_ku: 'سەرەتایی', name_en: 'Junior' },
  { id: 'mid', name_ku: 'ناوەند', name_en: 'Mid-level' },
  { id: 'senior', name_ku: 'پێشکەوتوو', name_en: 'Senior' },
  { id: 'lead', name_ku: 'سەرپەرشتیار', name_en: 'Lead' }
];
