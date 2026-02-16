-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('collector', 'buyer')),
  phone VARCHAR(20),
  location VARCHAR(255),
  profile_image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create plastic listings table
CREATE TABLE IF NOT EXISTS plastic_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  collector_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plastic_type VARCHAR(100) NOT NULL,
  quantity_kg DECIMAL(10, 2) NOT NULL,
  price_per_kg DECIMAL(10, 2) NOT NULL,
  description TEXT,
  status VARCHAR(50) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'sold', 'pending')),
  location VARCHAR(255),
  photo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create plastic photos table
CREATE TABLE IF NOT EXISTS plastic_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  collector_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  listing_id UUID REFERENCES plastic_listings(id) ON DELETE CASCADE,
  photo_url TEXT NOT NULL,
  photo_data BYTEA,
  captured_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create offers table
CREATE TABLE IF NOT EXISTS offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES plastic_listings(id) ON DELETE CASCADE,
  buyer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  price_per_kg DECIMAL(10, 2) NOT NULL,
  total_amount DECIMAL(12, 2) NOT NULL,
  quantity_kg DECIMAL(10, 2) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'completed')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  offer_id UUID NOT NULL REFERENCES offers(id) ON DELETE CASCADE,
  collector_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  buyer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount DECIMAL(12, 2) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  payment_method VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Create earnings table
CREATE TABLE IF NOT EXISTS earnings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  collector_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount DECIMAL(12, 2) NOT NULL,
  transaction_id UUID REFERENCES transactions(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create ESG impact table
CREATE TABLE IF NOT EXISTS esg_impact (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plastic_weight_kg DECIMAL(10, 2) NOT NULL,
  water_saved_liters DECIMAL(10, 2),
  co2_prevented_kg DECIMAL(10, 2),
  date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_plastic_listings_collector ON plastic_listings(collector_id);
CREATE INDEX idx_plastic_listings_status ON plastic_listings(status);
CREATE INDEX idx_plastic_photos_collector ON plastic_photos(collector_id);
CREATE INDEX idx_plastic_photos_listing ON plastic_photos(listing_id);
CREATE INDEX idx_offers_listing ON offers(listing_id);
CREATE INDEX idx_offers_buyer ON offers(buyer_id);
CREATE INDEX idx_offers_status ON offers(status);
CREATE INDEX idx_transactions_collector ON transactions(collector_id);
CREATE INDEX idx_transactions_buyer ON transactions(buyer_id);
CREATE INDEX idx_transactions_offer ON transactions(offer_id);
CREATE INDEX idx_earnings_collector ON earnings(collector_id);
CREATE INDEX idx_esg_impact_user ON esg_impact(user_id);

-- Create sample data for testing
INSERT INTO users (email, name, role, phone, location) VALUES
  ('collector@example.com', 'Rajesh Kumar', 'collector', '+91 9876543210', 'Mumbai'),
  ('buyer@example.com', 'Priya Enterprises', 'buyer', '+91 9876543211', 'Delhi');

INSERT INTO plastic_listings (collector_id, plastic_type, quantity_kg, price_per_kg, description, status, location, photo_url)
VALUES
  ((SELECT id FROM users WHERE email = 'collector@example.com'), 'HDPE', 50, 25, 'Clean HDPE bottles', 'active', 'Mumbai', NULL),
  ((SELECT id FROM users WHERE email = 'collector@example.com'), 'PET', 30, 20, 'Sorted PET bottles', 'active', 'Mumbai', NULL),
  ((SELECT id FROM users WHERE email = 'collector@example.com'), 'PP', 40, 22, 'PP containers', 'active', 'Mumbai', NULL);
