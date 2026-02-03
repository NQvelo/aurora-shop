CREATE TABLE IF NOT EXISTS home_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  left_title TEXT DEFAULT 'Autumn/Winter 2025',
  left_subtitle TEXT DEFAULT 'New Season',
  left_image TEXT DEFAULT '',
  right_image TEXT DEFAULT '',
  cta_text TEXT DEFAULT 'Shop the Collection',
  cta_link TEXT DEFAULT '/collections/aw25',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_home_settings_updated_at 
  BEFORE UPDATE ON home_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE home_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to home_settings"
  ON home_settings
  FOR SELECT
  USING (true);

CREATE POLICY "Allow admins to insert home_settings"
  ON home_settings
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "Allow admins to update home_settings"
  ON home_settings
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );
