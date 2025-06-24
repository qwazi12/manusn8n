require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function testSupabase() {
  console.log('Testing Supabase connection...');
  
  try {
    // 1. Test connection
    console.log('1. Testing connection...');
    const { count, error: connectionError } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });
    
    if (connectionError) {
      console.error('❌ Connection failed:', connectionError);
      return;
    }
    console.log('✅ Connection successful');
    
    // 2. Test user creation
    console.log('2. Creating test user...');
    const testUser = {
      clerk_id: `test_${Date.now()}`,
      email: `test${Date.now()}@example.com`,
      first_name: 'Test',
      last_name: 'User',
      plan: 'free_user',
      credits: 100
    };
    
    const { data: newUser, error: createError } = await supabase
      .from('users')
      .insert([testUser])
      .select()
      .single();
    
    if (createError) {
      console.error('Failed to create user:', createError);
      return;
    }
    console.log('✅ User created successfully:', newUser.id);
    
    // 3. Test user fetch
    console.log('3. Fetching user...');
    const { data: fetchedUser, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('id', newUser.id)
      .single();
    
    if (fetchError) {
      console.error('Failed to fetch user:', fetchError);
    } else {
      console.log('✅ User fetched successfully:', fetchedUser.email);
    }
    
    // 4. Cleanup - delete test user
    console.log('4. Cleaning up...');
    const { error: deleteError } = await supabase
      .from('users')
      .delete()
      .eq('id', newUser.id);
    
    if (deleteError) {
      console.error('Failed to delete user:', deleteError);
    } else {
      console.log('✅ Test user deleted successfully');
    }
    
    console.log('\n🎉 All tests passed! Supabase is working correctly.');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testSupabase(); 