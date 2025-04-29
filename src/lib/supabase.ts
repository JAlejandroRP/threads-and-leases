
import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types';

// Use direct values since environment variables aren't set up
const supabaseUrl = "https://wzrxsxsllytmtahvoqur.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind6cnhzeHNsbHl0bXRhaHZvcXVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU5MDE2NjcsImV4cCI6MjA2MTQ3NzY2N30.FSUX2AtpNl0XlRPEmLPw5n4eYMoL7TspOQAfPhx9jn0";

export const supabase = createClient<Database>(supabaseUrl, supabaseKey);
