import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const testEmail = process.env.TEST_AUTH_EMAIL;
const testPassword = process.env.TEST_AUTH_PASSWORD;

if (!supabaseUrl || !supabaseServiceKey || !testEmail || !testPassword) {
  console.warn('Skipping test user setup. Missing SUPABASE_URL/SERVICE_ROLE_KEY or test credentials.');
}

// Create admin client with service role key
const supabaseAdmin = supabaseUrl && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  : null;

export async function ensureTestUser() {
  if (!supabaseAdmin || !testEmail || !testPassword) {
    return null;
  }

  try {
    // Try to create test user (will fail if already exists)
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: testEmail,
      password: testPassword,
      email_confirm: true,
      user_metadata: {
        firstName: 'Test',
        lastName: 'User',
        role: 'member'
      }
    });

    if (createError) {
      // Check if error is because user already exists
      if (createError.message.includes('already registered') || 
          createError.message.includes('User already registered') ||
          createError.code === 'email_exists') {
        console.log(`Test user already exists: ${testEmail}`);
        return null; // User already exists, which is fine
      } else {
        console.error('Error creating test user:', createError);
        throw createError;
      }
    }

    console.log(`Test user created successfully: ${testEmail}`);
    return newUser;
  } catch (error) {
    console.error('Error ensuring test user:', error);
    // Don't throw error - just log it so the server can still start
    return null;
  }
}
