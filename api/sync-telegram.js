import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://ojhminrrkkxwyybpgvrs.supabase.co";
const supabaseAnonKey = "sb_publishable_c0y0Fx3rb1O1kIXGTgcskg_SZeezhmX";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Rule-based Kurdish parser as fallback
function ruleBasedParse(text, postId) {
  const cleanText = text.replace(/[\u202d\u202e\u200f\u200e]/g, '').trim();
  
  // Extract Title (from the first line, cleaning emojis and headers)
  const firstLine = cleanText.split('\n')[0] || '';
  let title = firstLine.replace(/[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF]/g, '');
  title = title.replace(/📢|🔔|✨|⭐|📍|💼|🏢|هەلی کار|-/g, '').trim();
  if (!title || title.length < 3) {
    title = 'هەلی کاری نوێ';
  }

  // Extract Email
  let email = '';
  const emailMatch = cleanText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  if (emailMatch) {
    email = emailMatch[0].trim();
  }

  // Extract Phone/WhatsApp
  let whatsapp = '';
  const phoneMatch = cleanText.match(/(?:\+964|00964|0)?7[5789]\d{8}/);
  if (phoneMatch) {
    let num = phoneMatch[0].replace(/[-\s]/g, '');
    if (num.startsWith('07')) {
      num = '964' + num.substring(1);
    } else if (num.startsWith('7')) {
      num = '964' + num;
    } else if (num.startsWith('+964')) {
      num = num.substring(1);
    } else if (num.startsWith('00964')) {
      num = num.substring(2);
    }
    whatsapp = num;
  }

  // Extract Form Link
  let formUrl = '';
  const urlRegex = /https?:\/\/[^\s]+/g;
  const urls = cleanText.match(urlRegex);
  if (urls) {
    for (const url of urls) {
      if (!url.includes('t.me') && !url.includes('telegram.org') && !url.includes('whatsapp.com/channel') && !url.includes('wa.me')) {
        formUrl = url;
        break;
      }
    }
  }

  // Extract Company Name
  let company = 'کۆمپانیاکە لە چەناڵی تەلەگرام';
  const companyMatch = cleanText.match(/(?:کۆمپانیای|ناوی کۆمپانیا|کۆمپانیا|باخچەی|قوتابخانەی|مارکێتی)\s+([^\n\r،,.-]+)/i);
  if (companyMatch) {
    company = companyMatch[1].trim();
  }

  // Extract City (Erbil/Sulaymaniyah/Duhok/Kirkuk/Halabja)
  let city = 'erbil';
  const lowerText = cleanText.toLowerCase();
  if (lowerText.includes('سلیمانی') || lowerText.includes('سلێمانی') || lowerText.includes('sulaymaniyah') || lowerText.includes('suly')) {
    city = 'sulaymaniyah';
  } else if (lowerText.includes('دهۆک') || lowerText.includes('دهۆك') || lowerText.includes('duhok')) {
    city = 'duhok';
  } else if (lowerText.includes('کەرکوک') || lowerText.includes('کەرکوك') || lowerText.includes('kirkuk')) {
    city = 'kirkuk';
  } else if (lowerText.includes('هەڵەبجە') || lowerText.includes('halabja')) {
    city = 'halabja';
  } else if (lowerText.includes('دوورەکار') || lowerText.includes('remote') || lowerText.includes('لەمۆبایلەوە')) {
    city = 'remote';
  }

  return {
    title_ku: title,
    title_en: title,
    company: company,
    whatsapp: whatsapp,
    email: email,
    form_url: formUrl,
    description_ku: cleanText,
    description_en: cleanText,
    city_en: JSON.stringify([city]),
    city_ku: JSON.stringify([city])
  };
}

// AI Parse via Google Gemini
async function aiParse(text, apiKey) {
  try {
    const prompt = `You are a data extractor for a Kurdish job board. Read the following job description in Kurdish and extract the details as a JSON object with these EXACT keys (do not wrap in markdown block, just output the JSON):
{
  "title_ku": "Job title in Kurdish",
  "title_en": "Job title in English or Kurdish if English is not present",
  "company": "Company name",
  "whatsapp": "Iraqi phone number/WhatsApp (format: 9647501234567, strictly digits only, keep 964 prefix)",
  "email": "Email address if present, otherwise empty string",
  "form_url": "Form link or social media link or web application URL if present, otherwise empty string",
  "description_ku": "Full job details in Kurdish",
  "description_en": "Full job details in Kurdish",
  "city_en": "Must be a JSON array string containing one or more of: ['erbil', 'sulaymaniyah', 'duhok', 'kirkuk', 'halabja', 'remote']",
  "city_ku": "Same JSON array string as city_en"
}

Job text:
${text}`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });
    
    const data = await response.json();
    let jsonText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    // Clean potential markdown output
    jsonText = jsonText.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(jsonText);
  } catch (e) {
    console.error("Gemini AI Parsing failed, falling back to rule-based parser:", e);
    return null;
  }
}

// Send push notification to all devices
async function sendPushNotification(jobData) {
  try {
    const { data: tokensData, error } = await supabase.from("push_tokens").select("token, lang");
    if (error || !tokensData || tokensData.length === 0) return;
    
    const cityNames = {
      ku: { erbil: "هەولێر", sulaymaniyah: "سلێمانی", duhok: "دهۆک", kirkuk: "کەرکوک", halabja: "هەڵەبجە", remote: "دوورەکار" },
      en: { erbil: "Erbil", sulaymaniyah: "Sulaymaniyah", duhok: "Duhok", kirkuk: "Kirkuk", halabja: "Halabja", remote: "Remote" }
    };

    function getNotificationCityLabel(cityStr, lang) {
      if (!cityStr) return lang === 'ku' ? 'کوردستان' : 'Kurdistan';
      let firstCity = cityStr.trim();
      if (firstCity.startsWith('[') && firstCity.endsWith(']')) {
        try {
          const arr = JSON.parse(firstCity);
          firstCity = arr[0] || 'remote';
        } catch(e) {}
      }
      return (cityNames[lang] && cityNames[lang][firstCity]) || firstCity;
    }

    const messages = tokensData.map(item => {
      const userLang = (item.lang || "ku").toLowerCase();
      const isKurdish = userLang === "ku";
      const cityLabel = getNotificationCityLabel(jobData.city_en, userLang);
      
      const title = isKurdish 
        ? `📢 هەلی کاری نوێ` 
        : `📢 New Job Opportunity`;
      const body = isKurdish
        ? `پۆستێکی نوێی هەلی کار لە ئەپەکە بڵاوکراوەتەوە. کلیک بکە بۆ خوێندنەوەی دیتێڵ.`
        : `A new job opportunity has been posted in the app. Tap to read details.`;

      return {
        to: item.token,
        sound: "default",
        title: title,
        body: body,
        badge: 1,
        channelId: "default",
        data: { jobId: jobData.id }
      };
    });

    for (let i = 0; i < messages.length; i += 100) {
      const chunk = messages.slice(i, i + 100);
      await fetch("https://exp.host/--/api/v2/push/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify(chunk)
      });
    }
  } catch (err) {
    console.error("Failed to dispatch push notification:", err);
  }
}

export default async function handler(req, res) {
  // CORS configuration
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Security check
  const secret = req.query.secret;
  const expectedSecret = process.env.SYNC_SECRET || 'kurd24_secret';
  if (secret !== expectedSecret) {
    res.status(401).json({ error: 'Unauthorized secret token' });
    return;
  }

  try {
    console.log("Starting Telegram channel scraper...");
    const response = await fetch('https://t.me/s/kurd24job', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    const html = await response.text();
    
    // Split messages
    const chunks = html.split(/<div class="tgme_widget_message[^"]*js-widget_message"/);
    const messages = chunks.slice(1);
    
    console.log(`Scraped ${messages.length} messages from Telegram preview.`);
    const syncResults = [];

    // Loop through messages (oldest to newest) to maintain chronological order
    for (const chunk of messages) {
      const postMatch = chunk.match(/data-post="([^"]+)"/);
      if (!postMatch) continue;
      const postId = postMatch[1]; // e.g. "kurd24job/5403"

      // 1. Check if post is already synchronized by checking requirements_en metadata
      const { data: existingJobs, error: selectError } = await supabase
        .from('jobs')
        .select('id')
        .ilike('requirements_en', `%TG_POST_ID: ${postId}%`);

      if (selectError) {
        console.error("Database query failed:", selectError.message);
        continue;
      }

      if (existingJobs && existingJobs.length > 0) {
        // Already synchronized, skip
        continue;
      }

      // 2. Extract text and images
      const textMatch = chunk.match(/<div class="tgme_widget_message_text[^"]*"[^>]*>([\s\S]*?)<\/div>/);
      if (!textMatch) continue;
      
      const textContent = textMatch[1]
        .replace(/<br\s*\/?>/g, '\n')
        .replace(/<\/?[^>]+(>|$)/g, '')
        .trim();

      // Skip generic informational warnings or promo posts
      if (textContent.includes('پارە بۆ هیچ کەس مەنێرن') || textContent.includes('ڕیکلام لە چەناڵەکەمان')) {
        continue;
      }

      console.log(`Processing new post: ${postId}`);

      // 3. Extract and filter images
      const imageRegex = /background-image:url\('([^']+)'\)/g;
      let imgMatch;
      const scrapedImages = [];
      while ((imgMatch = imageRegex.exec(chunk)) !== null) {
        const url = imgMatch[1];
        if (url.startsWith('http') && !url.includes('telegram.org/img/emoji')) {
          scrapedImages.push(url);
        }
      }

      // 4. Parse text using Gemini API (if key is set) or fall back to rule-based parser
      let jobDetails = null;
      const geminiKey = process.env.GEMINI_API_KEY;
      if (geminiKey) {
        jobDetails = await aiParse(textContent, geminiKey);
      }
      
      if (!jobDetails) {
        jobDetails = ruleBasedParse(textContent, postId);
      }

      // 5. Upload image to Supabase Storage if available
      let uploadedImages = [];
      let finalLogo = "";

      if (scrapedImages.length > 0) {
        try {
          const imgUrl = scrapedImages[0];
          const imgResponse = await fetch(imgUrl);
          const imgBlob = await imgResponse.arrayBuffer();
          const storagePath = `listings/${postId.replace('/', '_')}.jpg`;
          
          const { error: uploadError } = await supabase.storage
            .from('job-images')
            .upload(storagePath, imgBlob, {
              contentType: 'image/jpeg',
              upsert: true
            });

          if (!uploadError) {
            const { data: publicUrlData } = supabase.storage
              .from('job-images')
              .getPublicUrl(storagePath);
            uploadedImages.push(publicUrlData.publicUrl);
            finalLogo = publicUrlData.publicUrl;
          } else {
            console.error("Storage upload failed:", uploadError.message);
          }
        } catch (storageErr) {
          console.error("Error processing storage upload:", storageErr);
        }
      }

      // Classify the post type
      const isTraining = /خول|فێرکاری|کۆرس|پەیمانگا|فێربوون|کۆڕ|seminar|course|training|workshop|education/i.test(textContent);

      // Compile exactly 3 images based on categories
      try {
        const { data: settingsData } = await supabase
          .from('system_settings')
          .select('settings')
          .eq('id', 'app-config')
          .maybeSingle();

        const settings = (settingsData && settingsData.settings) ? settingsData.settings : {};
        const jobImages = settings.jobImages || [];
        const trainingImages = settings.trainingImages || [];
        const promoImages = settings.promoImages || [];
        const defaultImages = settings.defaultImages || [];

        // Select the active pool for fallbacks
        const activePool = isTraining ? trainingImages : jobImages;

        // Image 1: Cover / Logo
        if (uploadedImages.length === 0) {
          if (activePool.length > 0) {
            uploadedImages.push(activePool[Math.floor(Math.random() * activePool.length)]);
          } else if (defaultImages.length > 0) {
            uploadedImages.push(defaultImages[Math.floor(Math.random() * defaultImages.length)]);
          } else if (settings.logoUrl) {
            uploadedImages.push(settings.logoUrl);
          }
        }

        // Image 2: Content helper
        let img2 = null;
        if (activePool.length > 0) {
          const poolMinus1 = activePool.filter(img => img !== uploadedImages[0]);
          const selectFrom = poolMinus1.length > 0 ? poolMinus1 : activePool;
          img2 = selectFrom[Math.floor(Math.random() * selectFrom.length)];
        } else if (defaultImages.length > 0) {
          const poolMinus1 = defaultImages.filter(img => img !== uploadedImages[0]);
          const selectFrom = poolMinus1.length > 0 ? poolMinus1 : defaultImages;
          img2 = selectFrom[Math.floor(Math.random() * selectFrom.length)];
        } else if (settings.logoUrl) {
          img2 = settings.logoUrl;
        }

        if (img2) uploadedImages.push(img2);

        // Image 3: Promo Banner
        let img3 = null;
        if (promoImages.length > 0) {
          img3 = promoImages[Math.floor(Math.random() * promoImages.length)];
        } else if (defaultImages.length > 0) {
          const poolMinus12 = defaultImages.filter(img => !uploadedImages.includes(img));
          const selectFrom = poolMinus12.length > 0 ? poolMinus12 : defaultImages;
          img3 = selectFrom[Math.floor(Math.random() * selectFrom.length)];
        } else if (settings.logoUrl) {
          img3 = settings.logoUrl;
        }

        if (img3) uploadedImages.push(img3);

        // Ensure we have exactly 3 images
        while (uploadedImages.length < 3) {
          uploadedImages.push(settings.logoUrl || "https://kurd24-job.vercel.app/assets/images/logo.png");
        }
      } catch (settingsErr) {
        console.error("Error loading categorized fallback images from settings:", settingsErr);
      }

      // Ensure finalLogo is set to the first image in the array
      if (!finalLogo && uploadedImages.length > 0) {
        finalLogo = uploadedImages[0];
      }

      // 6. Complete payload construction
      const payload = {
        ...jobDetails,
        industry: "tech",
        category: isTraining ? "education" : "other",
        logo_url: finalLogo || "",
        images: uploadedImages,
        type: "fullTime",
        experience_level: "junior",
        salary: "ڕێککەوتن",
        status: "published",
        is_vip: false,
        is_pinned: false,
        requirements_ku: "-",
        // Append TG_POST_ID metadata to requirements_en to avoid double sync
        requirements_en: `-\n\nTG_POST_ID: ${postId}`
      };

      // 7. Insert into Supabase
      const { data: insertedJob, error: insertError } = await supabase
        .from('jobs')
        .insert([payload])
        .select()
        .single();

      if (insertError) {
        console.error("Failed to insert job into database:", insertError.message);
        continue;
      }

      console.log(`Successfully synchronized and inserted job: ${insertedJob.id}`);
      
      // 8. Send push notifications
      await sendPushNotification(insertedJob);

      syncResults.push({ postId, jobId: insertedJob.id, title: insertedJob.title_ku });
    }

    res.status(200).json({
      success: true,
      synchronized: syncResults.length,
      details: syncResults
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
