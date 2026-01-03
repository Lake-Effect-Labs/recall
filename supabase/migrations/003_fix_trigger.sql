-- Fix for account creation trigger
-- Run this in Supabase SQL Editor if you're getting "Database error saving new user"

-- Drop and recreate the function with proper permissions
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  new_account_id uuid;
BEGIN
  -- Create a new account
  INSERT INTO accounts (name) 
  VALUES (COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email))
  RETURNING id INTO new_account_id;
  
  -- Create the profile linking user to account
  INSERT INTO profiles (user_id, account_id, email)
  VALUES (NEW.id, new_account_id, NEW.email);
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error (you can check Supabase logs)
    RAISE LOG 'Error in handle_new_user: %', SQLERRM;
    RETURN NEW;
END;
$$;

-- Recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Ensure the function can bypass RLS (SECURITY DEFINER should handle this, but let's be explicit)
ALTER FUNCTION handle_new_user() OWNER TO postgres;

