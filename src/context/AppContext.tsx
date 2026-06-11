import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { supabase } from '../services/SupabaseClient';
import { LanguageType, LOCALES, Translations } from '../constants/Localization';
import { ThemeType, Colors } from '../constants/theme';
import { Config } from '../constants/Config';
import { JobStorage, PropertyItem } from '../services/JobStorage';

interface AppContextProps {
  language: LanguageType;
  setLanguage: (lang: LanguageType) => void;
  theme: ThemeType;
  setTheme: (theme: ThemeType) => void;
  toggleTheme: () => void;
  bookmarks: string[];
  toggleBookmark: (jobId: string) => Promise<void>;
  isBookmarked: (jobId: string) => boolean;
  isDemoMode: boolean;
  t: Translations;
  colors: typeof Colors.light | typeof Colors.dark;
  borderRadius: number;
  logoUrl: string | null;
  loading: boolean;
  categories: PropertyItem[];
  cities: PropertyItem[];
  industries: PropertyItem[];
  jobTypes: PropertyItem[];
  experienceLevels: PropertyItem[];
  refreshProperties: () => Promise<void>;
  getLocalizedProperty: (type: 'category' | 'city' | 'industry' | 'type' | 'experience_level', id: string) => string;
}

const AppContext = createContext<AppContextProps | undefined>(undefined);

const hexToRgba = (hex: string, alpha: number) => {
  hex = hex.replace('#', '');
  if (hex.length === 3) {
    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  }
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export const AppContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<LanguageType>('ku');
  const [theme, setThemeState] = useState<ThemeType>('dark');
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Styling and branding state
  const [customSettings, setCustomSettings] = useState<{
    primaryColorLight?: string;
    primaryColorDark?: string;
    accentColorLight?: string;
    accentColorDark?: string;
    borderRadius?: number;
  } | null>(null);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  // Auto-detect connection mode based on Config
  const isDemoMode = !Config.SUPABASE_URL || !Config.SUPABASE_ANON_KEY;

  const [categories, setCategories] = useState<PropertyItem[]>([]);
  const [cities, setCities] = useState<PropertyItem[]>([]);
  const [industries, setIndustries] = useState<PropertyItem[]>([]);
  const [jobTypes, setJobTypes] = useState<PropertyItem[]>([]);
  const [experienceLevels, setExperienceLevels] = useState<PropertyItem[]>([]);

  const refreshProperties = async () => {
    try {
      const [cats, cits, inds, types, levels] = await Promise.all([
        JobStorage.getCategories(),
        JobStorage.getCities(),
        JobStorage.getIndustries(),
        JobStorage.getJobTypes(),
        JobStorage.getExperienceLevels(),
      ]);
      setCategories(cats);
      setCities(cits);
      setIndustries(inds);
      setJobTypes(types);
      setExperienceLevels(levels);
    } catch (e) {
      console.error('Failed to load dynamic properties in AppContext:', e);
    }
  };

  const getLocalizedProperty = (type: 'category' | 'city' | 'industry' | 'type' | 'experience_level', id: string) => {
    if (!id) return '';
    
    // Check if the id is a JSON array string or contains a list
    let ids: string[] = [];
    const trimmedId = id.trim();
    if (trimmedId.startsWith('[') && trimmedId.endsWith(']')) {
      try {
        ids = JSON.parse(trimmedId);
      } catch (e) {
        ids = [id];
      }
    } else if (id.includes(',')) {
      ids = id.split(',').map(s => s.trim());
    } else {
      ids = [id];
    }

    const translateSingle = (singleId: string) => {
      if (!singleId) return '';
      // 1. Check if it's in local/hardcoded translations first
      const locale = LOCALES[language];
      if (type === 'city' && locale.cities[singleId]) return locale.cities[singleId];
      if (type === 'category' && locale.categories[singleId]) return locale.categories[singleId];
      if (type === 'industry' && locale.industries[singleId]) return locale.industries[singleId];
      if (type === 'type' && locale.jobTypes[singleId]) return locale.jobTypes[singleId];
      if (type === 'experience_level' && locale.experienceLevels[singleId]) return locale.experienceLevels[singleId];

      // 2. Otherwise search in our dynamic properties list loaded from Supabase/AsyncStorage
      let list: PropertyItem[] = [];
      if (type === 'category') list = categories;
      else if (type === 'city') list = cities;
      else if (type === 'industry') list = industries;
      else if (type === 'type') list = jobTypes;
      else if (type === 'experience_level') list = experienceLevels;

      const found = list.find(item => item.id.toLowerCase() === singleId.toLowerCase());
      if (found) {
        return language === 'ku' ? found.name_ku : found.name_en;
      }

      // 3. Fallback: humanize the ID if it's not found
      return singleId.charAt(0).toUpperCase() + singleId.slice(1);
    };

    return ids.map(translateSingle).filter(Boolean).join(language === 'ku' ? ' ، ' : ', ');
  };

  const syncCustomBranding = async () => {
    try {
      let settings = null;

      if (supabase) {
        const { data, error } = await supabase
          .from('system_settings')
          .select('settings')
          .eq('id', 'app-config')
          .maybeSingle();

        if (data && data.settings) {
          settings = data.settings;
        }
      }

      // Fallback: Try fetching from local Node server (if running in local mode)
      if (!settings) {
        const hostUri = Constants.expoConfig?.hostUri;
        const host = hostUri ? hostUri.split(':').shift() : null;
        if (host) {
          const baseUrl = `http://${host}:3000`;
          const response = await fetch(`${baseUrl}/assets/settings.json?t=${Date.now()}`);
          if (response.ok) {
            settings = await response.json();
          }
        }
      }

      if (settings) {
        setCustomSettings(settings);
        await AsyncStorage.setItem('@kurd24_custom_settings', JSON.stringify(settings));

        if (settings.logoUrl) {
          setLogoUrl(settings.logoUrl);
          await AsyncStorage.setItem('@kurd24_logo_url', settings.logoUrl);
        }
      } else {
        // Fallback to cache
        const cached = await AsyncStorage.getItem('@kurd24_custom_settings');
        if (cached) setCustomSettings(JSON.parse(cached));
        const cachedLogo = await AsyncStorage.getItem('@kurd24_logo_url');
        if (cachedLogo) setLogoUrl(cachedLogo);
      }
    } catch (e) {
      console.warn('Failed to fetch dynamic branding styles:', e);
      // Fallback offline cached values
      const cached = await AsyncStorage.getItem('@kurd24_custom_settings');
      if (cached) {
        try {
          setCustomSettings(JSON.parse(cached));
        } catch (err) {
          console.error('Failed to parse cached settings:', err);
        }
      }
      const cachedLogo = await AsyncStorage.getItem('@kurd24_logo_url');
      if (cachedLogo) {
        setLogoUrl(cachedLogo);
      }
    }
  };

  // Load persisted preferences
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const savedLang = await AsyncStorage.getItem('@kurd24_lang');
        const savedTheme = await AsyncStorage.getItem('@kurd24_theme');
        const savedBookmarks = await AsyncStorage.getItem('@kurd24_bookmarks');

        if (savedLang) setLanguageState(savedLang as LanguageType);
        if (savedTheme) setThemeState(savedTheme as ThemeType);
        if (savedBookmarks) setBookmarks(JSON.parse(savedBookmarks));

        // Load cached customization styles for fast startup rendering
        const cachedSettings = await AsyncStorage.getItem('@kurd24_custom_settings');
        if (cachedSettings) {
          try {
            setCustomSettings(JSON.parse(cachedSettings));
          } catch (e) {}
        }
        const cachedLogo = await AsyncStorage.getItem('@kurd24_logo_url');
        if (cachedLogo) setLogoUrl(cachedLogo);

        // Fetch updates from network in background
        await syncCustomBranding();
        await refreshProperties();
      } catch (e) {
        console.error('Failed to load preferences:', e);
      } finally {
        setLoading(false);
      }
    };

    loadPreferences();
  }, []);

  const setLanguage = async (lang: LanguageType) => {
    setLanguageState(lang);
    try {
      await AsyncStorage.setItem('@kurd24_lang', lang);
    } catch (e) {
      console.error(e);
    }
  };

  const setTheme = async (newTheme: ThemeType) => {
    setThemeState(newTheme);
    try {
      await AsyncStorage.setItem('@kurd24_theme', newTheme);
    } catch (e) {
      console.error(e);
    }
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const toggleBookmark = async (jobId: string) => {
    let updatedBookmarks: string[];
    if (bookmarks.includes(jobId)) {
      updatedBookmarks = bookmarks.filter((id) => id !== jobId);
    } else {
      updatedBookmarks = [...bookmarks, jobId];
    }
    setBookmarks(updatedBookmarks);
    try {
      await AsyncStorage.setItem('@kurd24_bookmarks', JSON.stringify(updatedBookmarks));
    } catch (e) {
      console.error(e);
    }
  };

  const isBookmarked = (jobId: string) => {
    return bookmarks.includes(jobId);
  };

  const t = LOCALES[language];
  const baseColors = Colors[theme];

  // Dynamically computed colors
  const colors = React.useMemo(() => {
    const customized: any = { ...baseColors };
    if (customSettings) {
      if (theme === 'light') {
        if (customSettings.primaryColorLight) {
          customized.primary = customSettings.primaryColorLight;
          customized.tabIconSelected = customSettings.primaryColorLight;
          customized.tint = customSettings.primaryColorLight;
          customized.primaryGlow = hexToRgba(customSettings.primaryColorLight, 0.15);
        }
        if (customSettings.accentColorLight) {
          customized.accent = customSettings.accentColorLight;
          customized.accentGlow = hexToRgba(customSettings.accentColorLight, 0.15);
        }
      } else {
        if (customSettings.primaryColorDark) {
          customized.primary = customSettings.primaryColorDark;
          customized.tabIconSelected = customSettings.primaryColorDark;
          customized.tint = customSettings.primaryColorDark;
          customized.primaryGlow = hexToRgba(customSettings.primaryColorDark, 0.25);
        }
        if (customSettings.accentColorDark) {
          customized.accent = customSettings.accentColorDark;
          customized.accentGlow = hexToRgba(customSettings.accentColorDark, 0.25);
        }
      }
    }
    return customized as any;
  }, [theme, customSettings, baseColors]);

  const borderRadius = customSettings?.borderRadius ?? 20;

  return (
    <AppContext.Provider
      value={{
        language,
        setLanguage,
        theme,
        setTheme,
        toggleTheme,
        bookmarks,
        toggleBookmark,
        isBookmarked,
        isDemoMode,
        t,
        colors,
        borderRadius,
        logoUrl,
        loading,
        categories,
        cities,
        industries,
        jobTypes,
        experienceLevels,
        refreshProperties,
        getLocalizedProperty,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppContextProvider');
  }
  return context;
};
