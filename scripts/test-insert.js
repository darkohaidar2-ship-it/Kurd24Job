const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = "https://ojhminrrkkxwyybpgvrs.supabase.co";
const supabaseAnonKey = "sb_publishable_c0y0Fx3rb1O1kIXGTgcskg_SZeezhmX";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
  console.log("Attempting to insert a job with is_vip and is_pinned...");
  const testJob = {
    title_ku: "تاقیکردنەوەی VIP و Pin",
    title_en: "VIP and Pin Test Job",
    company: "Test Company",
    industry: "tech",
    city_ku: "erbil",
    city_en: "erbil",
    category: "software",
    type: "fullTime",
    experience_level: "mid",
    salary: "$1,000",
    description_ku: "ئەمە پۆستێکی تاقیکردنەوەیە بۆ دڵنیابوون لە کارکردنی سیستەمەکە.",
    description_en: "This is a test post to ensure the system is working properly.",
    requirements_ku: "تاقیکردنەوە",
    requirements_en: "test",
    whatsapp: "9647501234567",
    email: "test@test.com",
    status: "published",
    is_vip: true,
    is_pinned: true
  };

  const { data, error } = await supabase
    .from('jobs')
    .insert([testJob])
    .select();

  if (error) {
    console.error("Insertion failed:", error);
  } else {
    console.log("Insertion succeeded! Inserted data:", data);
  }
}

run();
