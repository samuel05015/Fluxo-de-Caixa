// src/supabaseClient.js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://vokoqcnssfimlexggcej.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZva29xY25zc2ZpbWxleGdnY2VqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEyNTQ1ODYsImV4cCI6MjA3NjgzMDU4Nn0.3cR4hpe0A20sXXPqTKr18PB6Vffc2fYogc4PIkLeSAQ';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
