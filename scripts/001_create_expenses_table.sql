-- Create expenses table for tracking daily expenses
CREATE TABLE expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  amount DECIMAL(10, 2) NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create an index on date for faster queries
CREATE INDEX idx_expenses_date ON expenses(date);

-- Create an index on category for filtering
CREATE INDEX idx_expenses_category ON expenses(category);

-- Enable Row Level Security (RLS) - for future auth implementation
-- For now, we'll use public access policies since no auth was requested
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access (no auth required)
CREATE POLICY "Allow public read access" ON expenses FOR SELECT USING (true);

-- Create policy for public insert access (no auth required)
CREATE POLICY "Allow public insert access" ON expenses FOR INSERT WITH CHECK (true);

-- Create policy for public update access (no auth required)
CREATE POLICY "Allow public update access" ON expenses FOR UPDATE USING (true);

-- Create policy for public delete access (no auth required)
CREATE POLICY "Allow public delete access" ON expenses FOR DELETE USING (true);
