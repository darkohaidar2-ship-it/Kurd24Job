export type LanguageType = 'ku' | 'en';

export interface Translations {
  // Navigation / Headers
  appName: string;
  findJobs: string;
  savedJobs: string;
  adminPanel: string;
  aboutUs: string;
  
  // Feed / Filters
  searchPlaceholder: string;
  filterTitle: string;
  applyFilters: string;
  resetFilters: string;
  city: string;
  category: string;
  jobType: string;
  experienceLevel: string;
  industry: string;
  datePosted: string;
  all: string;
  
  // Filter Options
  cities: Record<string, string>;
  jobTypes: Record<string, string>;
  experienceLevels: Record<string, string>;
  industries: Record<string, string>;
  dateOptions: Record<string, string>;
  categories: Record<string, string>;

  // Job Details
  salary: string;
  posted: string;
  description: string;
  requirements: string;
  applyNow: string;
  sendWhatsApp: string;
  sendEmail: string;
  shareJob: string;
  uploadCV: string;
  cvUploaded: string;
  cvRequired: string;
  errorUploading: string;
  
  // Bookmarks
  noSavedJobs: string;
  
  // Admin Panel & Analytics
  analyticsTitle: string;
  totalJobs: string;
  totalViews: string;
  totalClicks: string;
  draftsCount: string;
  publishedCount: string;
  addNewJob: string;
  editJob: string;
  deleteJob: string;
  confirmDelete: string;
  yes: string;
  no: string;
  save: string;
  cancel: string;
  status: string;
  draft: string;
  published: string;
  resetToMock: string;
  
  // Admin Form Fields
  titleKu: string;
  titleEn: string;
  companyName: string;
  logoUrl: string;
  descKu: string;
  descEn: string;
  reqKu: string;
  reqEn: string;
  whatsappNumber: string;
  emailAddress: string;
  
  // App States
  demoModeBadge: string;
  liveModeBadge: string;
  demoModeWarning: string;
}

export const LOCALES: Record<LanguageType, Translations> = {
  ku: {
    appName: "Kurd24 Job",
    findJobs: "گەڕان بەدوای کار",
    savedJobs: "خەزنکراوەکان",
    adminPanel: "پانێڵی بەڕێوەبەر",
    aboutUs: "ئێمە",
    
    searchPlaceholder: "گەڕان بەدوای ناونیشانی کار یان کۆمپانیا...",
    filterTitle: "فلتەری پێشکەوتوو",
    applyFilters: "جێبەجێکردنی فلتەرەکان",
    resetFilters: "پاککردنەوە",
    city: "شار",
    category: "کاتیگۆری",
    jobType: "جۆری کار",
    experienceLevel: "ئاستی ئەزموون",
    industry: "وار / پیشەسازی",
    datePosted: "کاتی بڵاوکردنەوە",
    all: "هەموو",
    
    cities: {
      all: "هەموو شارەکان",
      erbil: "هەولێر (Hewlêr)",
      sulaymaniyah: "سلێمانی (Silêmanî)",
      duhok: "دهۆک (Duhok)",
      halabja: "هەڵەبجە",
      kirkuk: "کەرکوک",
      remote: "دوورەکار (Remote)"
    },
    jobTypes: {
      all: "هەموو جۆرەکان",
      fullTime: "تەواو کات (Full-time)",
      partTime: "نیوە کات (Part-time)",
      contract: "گرێبەست (Contract)",
      remote: "دوورەکار (Remote)"
    },
    experienceLevels: {
      all: "هەموو ئاستەکان",
      junior: "سەرەتایی (Junior)",
      mid: "ناوەند (Mid-level)",
      senior: "پێشکەوتوو (Senior)",
      lead: "سەرپەرشتیار (Lead)"
    },
    industries: {
      all: "هەموو پیشەسازییەکان",
      tech: "تەکنەلۆژیا و نەرمەکاڵا",
      health: "تەندروستی و پزیشکی",
      education: "پەروەردە و فێرکردن",
      retail: "فرۆشتن و مارکێتينگ",
      finance: "دارایی و بانکداری",
      engineering: "ئەندازیاری",
      media: "میدیا و ڕاگەیاندن"
    },
    dateOptions: {
      all: "هەر کاتێک بێت",
      last24h: "٢٤ کاتژمێری ڕابردوو",
      lastWeek: "هەفتەی ڕابردوو",
      lastMonth: "مانگی ڕابردوو"
    },
    categories: {
      all: "هەموو کاتیگۆرییەکان",
      software: "گەشەپێدانی نەرمەکاڵا",
      design: "دیزاین و گرافیک",
      marketing: "مارکێتینگ و فرۆشتن",
      finance: "دارایی و وردبینی",
      education: "فێرکردن",
      translation: "وەرگێڕان",
      engineering: "کاروباری ئەندازیاری"
    },
    
    salary: "مووچە",
    posted: "بڵاوکراوەتەوە لە",
    description: "دەربارەی کارەکە (Description)",
    requirements: "مەرج و پێویستییەکان (Requirements)",
    applyNow: "پێشکەشکردنی داواکاری",
    sendWhatsApp: "ناردن بە وەتسئەپ",
    sendEmail: "پێشکەشکردن بە ئیمەیڵ",
    shareJob: "هاوبەشکردنی کارەکە",
    uploadCV: "بارکردنی سیڤی (PDF)",
    cvUploaded: "سیڤی بارکرا: ",
    cvRequired: "تکایە سەرەتا سیڤیەکەت بە PDF باربکە بۆ وەرگرتنی بەستەر",
    errorUploading: "کێشەیەک لە بارکردنی سیڤیەکەدا ڕوویدا",
    
    noSavedJobs: "هیچ هەلی کارێک خەزن نەکراوە.",
    
    analyticsTitle: "ئامارەکانی ئەپڵیکەیشن",
    totalJobs: "سەرجەم کارەکان",
    totalViews: "بینینی کارەکان",
    totalClicks: "پێشکەشکردنەکان (کلیک)",
    draftsCount: "ڕەشنووسەکان",
    publishedCount: "بڵاوکراوەکان",
    addNewJob: "زیادکردنی هەلی کار",
    editJob: "دەستکاری کارەکە",
    deleteJob: "سڕینەوەی کارەکە",
    confirmDelete: "ئایا دڵنیای لە سڕینەوەی ئەم کارە؟",
    yes: "بەڵێ",
    no: "نەخێر",
    save: "خەزنکردن",
    cancel: "پەشیمانبوونەوە",
    status: "دۆخ (Status)",
    draft: "ڕەشنووس (Draft)",
    published: "بڵاوکراوە (Published)",
    resetToMock: "ڕێستکردنی کارەکان بۆ تاقیکاری (١٠ کار)",
    
    titleKu: "ناونیشانی کار (کوردی)",
    titleEn: "ناونیشانی کار (ئینگلیزی)",
    companyName: "ناوی کۆمپانیا",
    logoUrl: "بەستەری لۆگۆ (URL)",
    descKu: "دەربارەی کار (کوردی)",
    descEn: "دەربارەی کار (ئینگلیزی)",
    reqKu: "مەرجەکان (کوردی - دابەش بە هێڵی نوێ)",
    reqEn: "مەرجەکان (ئینگلیزی - دابەش بە هێڵی نوێ)",
    whatsappNumber: "ژمارەی وەتسئەپ (وەک: 964750xxxxxx)",
    emailAddress: "ئیمەیڵی پێشکەشکردن",
    
    demoModeBadge: "Local / تاقیکاری",
    liveModeBadge: "Supabase / کارا",
    demoModeWarning: "ئەپەکە لەسەر مۆدی لۆکاڵ کار دەکات. داتاکان لە ناو مۆبایلەکەتدا پاشەکەوت دەبن."
  },
  en: {
    appName: "Kurd24 Job",
    findJobs: "Find Jobs",
    savedJobs: "Bookmarks",
    adminPanel: "Admin Panel",
    aboutUs: "About Us",
    
    searchPlaceholder: "Search job title or company...",
    filterTitle: "Advanced Filter",
    applyFilters: "Apply Filters",
    resetFilters: "Reset",
    city: "City",
    category: "Category",
    jobType: "Job Type",
    experienceLevel: "Experience",
    industry: "Industry",
    datePosted: "Date Posted",
    all: "All",
    
    cities: {
      all: "All Cities",
      erbil: "Erbil (Hewlêr)",
      sulaymaniyah: "Sulaymaniyah (Silêmanî)",
      duhok: "Duhok (Duhok)",
      halabja: "Halabja",
      kirkuk: "Kirkuk",
      remote: "Remote"
    },
    jobTypes: {
      all: "All Types",
      fullTime: "Full-time",
      partTime: "Part-time",
      contract: "Contract",
      remote: "Remote"
    },
    experienceLevels: {
      all: "All Levels",
      junior: "Junior",
      mid: "Mid-level",
      senior: "Senior",
      lead: "Lead / Manager"
    },
    industries: {
      all: "All Industries",
      tech: "Tech & Software",
      health: "Health & Medical",
      education: "Education",
      retail: "Sales & Retail",
      finance: "Finance & Banking",
      engineering: "Engineering",
      media: "Media & PR"
    },
    dateOptions: {
      all: "Any time",
      last24h: "Last 24 Hours",
      lastWeek: "Last Week",
      lastMonth: "Last Month"
    },
    categories: {
      all: "All Categories",
      software: "Software Development",
      design: "Design & Creative",
      marketing: "Marketing & Sales",
      finance: "Finance & Accounting",
      education: "Education & Teaching",
      translation: "Translation & Content",
      engineering: "Engineering & Operations"
    },
    
    salary: "Salary",
    posted: "Posted on",
    description: "Job Description",
    requirements: "Requirements",
    applyNow: "Apply Now",
    sendWhatsApp: "Send via WhatsApp",
    sendEmail: "Apply by Email",
    shareJob: "Share Job",
    uploadCV: "Upload Resume (PDF)",
    cvUploaded: "CV Uploaded: ",
    cvRequired: "Please upload your PDF CV first to generate a link",
    errorUploading: "Error occurred while uploading CV",
    
    noSavedJobs: "No bookmarked jobs found.",
    
    analyticsTitle: "Application Dashboard",
    totalJobs: "Total Jobs",
    totalViews: "Total Views",
    totalClicks: "Total Applies (Clicks)",
    draftsCount: "Drafts",
    publishedCount: "Published",
    addNewJob: "Add New Job",
    editJob: "Edit Job",
    deleteJob: "Delete Job",
    confirmDelete: "Are you sure you want to delete this job?",
    yes: "Yes",
    no: "No",
    save: "Save",
    cancel: "Cancel",
    status: "Status",
    draft: "Draft",
    published: "Published",
    resetToMock: "Reset to 10 Test Jobs",
    
    titleKu: "Job Title (Kurdish)",
    titleEn: "Job Title (English)",
    companyName: "Company Name",
    logoUrl: "Logo URL Link",
    descKu: "Job Description (Kurdish)",
    descEn: "Job Description (English)",
    reqKu: "Requirements (Kurdish - Line Separated)",
    reqEn: "Requirements (English - Line Separated)",
    whatsappNumber: "WhatsApp Number (e.g. 964750xxxxxx)",
    emailAddress: "Application Email Address",
    
    demoModeBadge: "Demo / Local",
    liveModeBadge: "Supabase / Active",
    demoModeWarning: "App is running in Local Mode. Data is stored on your device."
  }
};
