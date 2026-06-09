const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://ojhminrrkkxwyybpgvrs.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_c0y0Fx3rb1O1kIXGTgcskg_SZeezhmX';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function test() {
  const tables = ['categories', 'cities', 'industries', 'job_types', 'experience_levels', 'jobs', 'settings', 'app_settings', 'system_settings'];
  
  for (const table of tables) {
    try {
      const { data, error } = await supabase.from(table).select('*').limit(1);
      if (error) {
        console.log(`Table '${table}' failed:`, error.message);
      } else {
        console.log(`Table '${table}' exists! Sample data:`, data);
      }
    } catch (e) {
      console.log(`Table '${table}' threw error:`, e.message);
    }
  }
}

test();
