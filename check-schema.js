require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('Supabase URL:', supabaseUrl ? 'Found' : 'Missing');
console.log('Service Role Key:', supabaseKey ? 'Found' : 'Missing');

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
  console.log('Checking current users table schema...');
  
  try {
    // Get table info
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('Error querying users table:', error);
      return;
    }
    
    console.log('✅ Users table exists');
    
    if (data && data.length > 0) {
      console.log('Current columns in users table:');
      console.log(Object.keys(data[0]));
      console.log('Sample row:', data[0]);
    } else {
      console.log('No rows exist in users table');
    }
    
  } catch (err) {
    console.error('Error:', err.message);
  }
}

checkSchema(); 