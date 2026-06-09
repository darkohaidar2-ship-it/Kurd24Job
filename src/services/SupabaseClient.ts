import { createClient } from '@supabase/supabase-js';
import { Config } from '../constants/Config';

const supabaseUrl = Config.SUPABASE_URL;
const supabaseAnonKey = Config.SUPABASE_ANON_KEY;

// Create Supabase client only if credentials are provided
export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

/**
 * Upload applicant's PDF CV to Supabase Storage
 * BUCKET NAME: "resumes"
 * 
 * @param fileUri Local document URI (e.g. from DocumentPicker)
 * @param fileName Name of the file
 * @returns Public shareable URL of the uploaded PDF, or null if failed
 */
export const uploadCVToSupabase = async (fileUri: string, fileName: string): Promise<string | null> => {
  if (!supabase) {
    console.warn('Supabase not configured. Simulating file upload...');
    // Simulated upload delay
    await new Promise((resolve) => setTimeout(resolve, 1500));
    return `https://kurd24-job.supabase.co/storage/v1/object/public/resumes/demo_${Date.now()}_${fileName}`;
  }

  try {
    // Read the file as base64 or blob. In React Native, we can fetch the local URI and get a Blob.
    const response = await fetch(fileUri);
    const blob = await response.blob();
    
    const fileExt = fileName.split('.').pop();
    const uniqueFileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `applicants/${uniqueFileName}`;

    const { data, error } = await supabase.storage
      .from('resumes')
      .upload(filePath, blob, {
        contentType: 'application/pdf',
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      throw error;
    }

    const { data: publicUrlData } = supabase.storage
      .from('resumes')
      .getPublicUrl(filePath);

    return publicUrlData.publicUrl;
  } catch (error) {
    console.error('Error uploading CV to Supabase:', error);
    return null;
  }
};
