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

-- Create plastic_analysis table for AI analysis results
CREATE TABLE IF NOT EXISTS plastic_analysis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES plastic_listings(id) ON DELETE CASCADE,
  purity_percentage DECIMAL(5, 2) NOT NULL,
  contamination_percentage DECIMAL(5, 2) NOT NULL,
  grade_quality VARCHAR(10) NOT NULL CHECK (grade_quality IN ('A', 'B', 'C', 'D')),
  estimated_price_per_kg DECIMAL(8, 2) NOT NULL,
  image_analysis_data JSONB,
  analyzed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create discount_tiers table for quantity-based discounts
CREATE TABLE IF NOT EXISTS discount_tiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plastic_type VARCHAR(100) NOT NULL,
  grade_quality VARCHAR(10),
  min_quantity_kg DECIMAL(10, 2),
  max_quantity_kg DECIMAL(10, 2),
  discount_percentage DECIMAL(5, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create orders table (replaces/extends transactions)
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number VARCHAR(50) UNIQUE NOT NULL,
  listing_id UUID REFERENCES plastic_listings(id) ON DELETE SET NULL,
  buyer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  seller_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  quantity_kg DECIMAL(10, 2) NOT NULL,
  base_price DECIMAL(12, 2) NOT NULL,
  discount_percentage DECIMAL(5, 2) DEFAULT 0,
  discount_amount DECIMAL(12, 2) DEFAULT 0,
  total_amount DECIMAL(12, 2) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'payment_pending', 'confirmed', 'shipped', 'delivered', 'received_verified', 'cancelled')),
  payment_status VARCHAR(50) DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'paid', 'failed', 'refunded')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create payments table for Razorpay integration
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  razorpay_order_id VARCHAR(100),
  razorpay_payment_id VARCHAR(100),
  razorpay_signature VARCHAR(500),
  amount DECIMAL(12, 2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'INR',
  payment_method VARCHAR(50),
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'captured', 'failed', 'refunded')),
  error_message VARCHAR(500),
  transaction_details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create invoices table for PDF generation
CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL UNIQUE REFERENCES orders(id) ON DELETE CASCADE,
  invoice_number VARCHAR(50) UNIQUE NOT NULL,
  pdf_url VARCHAR(500),
  buyer_name VARCHAR(255),
  buyer_email VARCHAR(255),
  seller_name VARCHAR(255),
  seller_email VARCHAR(255),
  material_details JSONB,
  amount DECIMAL(12, 2),
  issued_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  due_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create epr_certificates table for government EPR certificates
CREATE TABLE IF NOT EXISTS epr_certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL UNIQUE REFERENCES orders(id) ON DELETE CASCADE,
  certificate_number VARCHAR(100) UNIQUE NOT NULL,
  certificate_pdf_url VARCHAR(500),
  brand_name VARCHAR(255),
  brand_email VARCHAR(255),
  material_type VARCHAR(100),
  quantity_kg DECIMAL(10, 2),
  grade_quality VARCHAR(10),
  certification_authority VARCHAR(255) DEFAULT 'Ministry of Environment, Forest and Climate Change',
  validity_start TIMESTAMP WITH TIME ZONE,
  validity_end TIMESTAMP WITH TIME ZONE,
  issued_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create shipments table for tracking
CREATE TABLE IF NOT EXISTS shipments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  tracking_number VARCHAR(100) UNIQUE,
  status VARCHAR(50) DEFAULT 'order_placed' CHECK (status IN ('order_placed', 'payment_confirmed', 'in_transit', 'out_for_delivery', 'delivered', 'received_verified')),
  current_location VARCHAR(255),
  estimated_delivery DATE,
  actual_delivery DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create shipment_status_history table for tracking timeline
CREATE TABLE IF NOT EXISTS shipment_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shipment_id UUID NOT NULL REFERENCES shipments(id) ON DELETE CASCADE,
  status VARCHAR(50) NOT NULL,
  location VARCHAR(255),
  notes VARCHAR(500),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for new tables
CREATE INDEX idx_plastic_analysis_listing ON plastic_analysis(listing_id);
CREATE INDEX idx_orders_buyer_id ON orders(buyer_id);
CREATE INDEX idx_orders_seller_id ON orders(seller_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_order_number ON orders(order_number);
CREATE INDEX idx_orders_listing_id ON orders(listing_id);
CREATE INDEX idx_payments_order_id ON payments(order_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_razorpay_payment_id ON payments(razorpay_payment_id);
CREATE INDEX idx_invoices_order_id ON invoices(order_id);
CREATE INDEX idx_epr_certificates_order_id ON epr_certificates(order_id);
CREATE INDEX idx_shipments_order_id ON shipments(order_id);
CREATE INDEX idx_shipments_status ON shipments(status);
CREATE INDEX idx_shipment_status_history_shipment_id ON shipment_status_history(shipment_id);

-- Create sample data for testing
INSERT INTO users (email, name, role, phone, location) VALUES
  ('collector@example.com', 'Rajesh Kumar', 'collector', '+91 9876543210', 'Mumbai'),
  ('buyer@example.com', 'Priya Enterprises', 'buyer', '+91 9876543211', 'Delhi');

INSERT INTO plastic_listings (collector_id, plastic_type, quantity_kg, price_per_kg, description, status, location, photo_url)
VALUES
  ((SELECT id FROM users WHERE email = 'collector@example.com'), 'HDPE', 50, 25, 'Clean HDPE bottles', 'active', 'Mumbai', NULL),
  ((SELECT id FROM users WHERE email = 'collector@example.com'), 'PET', 30, 20, 'Sorted PET bottles', 'active', 'Mumbai', NULL),
  ((SELECT id FROM users WHERE email = 'collector@example.com'), 'PP', 40, 22, 'PP containers', 'active', 'Mumbai', NULL);

-- Insert discount tiers
INSERT INTO discount_tiers (plastic_type, grade_quality, min_quantity_kg, max_quantity_kg, discount_percentage) VALUES
  ('HDPE', 'A', 100, 500, 5),
  ('HDPE', 'A', 500, 1000, 10),
  ('HDPE', 'A', 1000, NULL, 15),
  ('HDPE', 'B', 100, 500, 3),
  ('HDPE', 'B', 500, 1000, 7),
  ('HDPE', 'B', 1000, NULL, 12),
  ('PET', 'A', 100, 500, 5),
  ('PET', 'A', 500, 1000, 10),
  ('PET', 'A', 1000, NULL, 15),
  ('PP', 'A', 100, 500, 4),
  ('PP', 'A', 500, 1000, 9),
  ('PP', 'A', 1000, NULL, 14);
