-- Set the first admin user
-- Replace 'your@email.com' with your actual email address that you used to sign up

UPDATE profiles 
SET is_approved = true, role = 'admin' 
WHERE email = 'ramesh@technoarete.org';
