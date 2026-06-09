const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://ojhminrrkkxwyybpgvrs.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_c0y0Fx3rb1O1kIXGTgcskg_SZeezhmX';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testStorage() {
  console.log('Checking Supabase Storage buckets...');
  try {
    const { data: buckets, error } = await supabase.storage.listBuckets();
    if (error) {
      console.error('Failed to list buckets:', error.message);
      console.log('Tip: The Anon key might not have permission to list buckets, which is normal. Let\'s try to read/write a dummy file in "job-images" bucket directly.');
    } else {
      console.log('Existing buckets:', buckets.map(b => b.name));
      const hasJobImages = buckets.some(b => b.name === 'job-images');
      if (hasJobImages) {
        console.log('SUCCESS: "job-images" bucket exists!');
      } else {
        console.log('WARNING: "job-images" bucket does NOT exist in the list.');
      }
    }

    // Try uploading a small text file as a test
    console.log('Testing upload to "job-images" bucket...');
    const testFile = new Blob(['test'], { type: 'text/plain' });
    const uniqueName = `test_connection_${Date.now()}.txt`;
    const { data, error: uploadError } = await supabase.storage
      .from('job-images')
      .upload(uniqueName, testFile, { cacheControl: '3600', upsert: true });

    if (uploadError) {
      console.log('Upload test failed:', uploadError.message);
      console.log('Tip: You may need to create the "job-images" bucket in your Supabase Storage Dashboard and set it to PUBLIC.');
    } else {
      console.log('Upload test succeeded! File path:', data.path);
      // Clean up the test file
      const { error: deleteError } = await supabase.storage
        .from('job-images')
        .remove([uniqueName]);
      if (deleteError) {
        console.log('Clean up warning (failed to delete test file):', deleteError.message);
      } else {
        console.log('Clean up succeeded (test file deleted).');
      }
    }
  } catch (e) {
    console.error('Error during storage test:', e.message);
  }
}

testStorage();
