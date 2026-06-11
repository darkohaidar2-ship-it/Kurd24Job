const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = "https://ojhminrrkkxwyybpgvrs.supabase.co";
const supabaseAnonKey = "sb_publishable_c0y0Fx3rb1O1kIXGTgcskg_SZeezhmX";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
  console.log("Connecting to Supabase...");
  
  // Test query jobs
  const { data: jobs, error: jobsError } = await supabase
    .from('jobs')
    .select('*')
    .limit(2);
    
  if (jobsError) {
    console.error("Error fetching jobs:", jobsError);
  } else {
    console.log("Successfully fetched jobs. Sample columns:", jobs.length > 0 ? Object.keys(jobs[0]) : "No jobs found");
    console.log("Sample job data:", jobs[0]);
  }

  // Test query system_settings
  const { data: settings, error: settingsError } = await supabase
    .from('system_settings')
    .select('*');
    
  if (settingsError) {
    console.error("Error fetching system_settings:", settingsError);
  } else {
    console.log("Successfully fetched system_settings:", settings);
  }
}

run();
