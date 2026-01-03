-- Trigger function to create account and profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
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
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on auth.users
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Allow the trigger function to insert into accounts and profiles
GRANT INSERT ON accounts TO postgres;
GRANT INSERT ON profiles TO postgres;

