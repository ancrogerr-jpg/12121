/*
  # Food Supply Chain Schema for Web3Auth

  ## Overview
  Complete database schema for food supply chain tracking with Web3Auth wallet addresses.
  
  ## Tables Created
  
  ### collector_batches
  Tracks batches collected from farmers/sources
  - id, collector_id (wallet address), batch_number, seed_crop_name
  - GPS coordinates, weather data, harvest details
  - Pesticide information, pricing, weight
  - QR code data, status, timestamps
  
  ### tester_batches
  Tracks quality testing performed on collector batches
  - id, tester_id (wallet address), collector_batch_id reference
  - Testing location, weather, test date
  - Quality scores, contaminant levels, purity
  - Lab information, collector rating
  - QR code data, status, timestamps
  
  ### processor_batches
  Tracks processing of tested batches
  - id, processor_id (wallet address), tester_batch_id reference
  - Processing details, equipment, output
  - Quality metrics, tester rating
  - QR code data, status, timestamps
  
  ### manufacturer_batches
  Tracks final manufacturing of processed batches
  - id, manufacturer_id (wallet address), processor_batch_id reference
  - Manufacturing details, product info, packaging
  - Quality control, processor rating
  - QR code data, status, timestamps
  
  ### waste_metrics
  Tracks waste at each stage
  
  ### qr_codes
  Stores QR code mappings
  
  ### notifications
  User notification system
  
  ### transaction_cache
  Blockchain transaction cache
  
  ## Security
  - All tables have RLS enabled
  - Permissive policies for authenticated access (Web3Auth doesn't use Supabase auth)
  - Proper indexes for performance
*/

-- Helper function for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Collector Batches Table
CREATE TABLE IF NOT EXISTS collector_batches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  collector_id text NOT NULL,
  batch_number text NOT NULL UNIQUE,
  seed_crop_name text NOT NULL,
  gps_latitude decimal(10, 8),
  gps_longitude decimal(11, 8),
  weather_condition text,
  temperature decimal(5, 2),
  harvest_date date NOT NULL,
  pesticide_used boolean DEFAULT false,
  pesticide_name text,
  pesticide_quantity text,
  price_per_unit decimal(10, 2) NOT NULL CHECK (price_per_unit >= 0),
  weight_total decimal(10, 2) NOT NULL CHECK (weight_total > 0),
  total_price decimal(10, 2) NOT NULL CHECK (total_price >= 0),
  qr_code_data text,
  blockchain_tx_hash text,
  status text DEFAULT 'submitted',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_collector_batches_collector_id ON collector_batches(collector_id);
CREATE INDEX idx_collector_batches_batch_number ON collector_batches(batch_number);
CREATE INDEX idx_collector_batches_created_at ON collector_batches(created_at DESC);

ALTER TABLE collector_batches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations on collector_batches"
  ON collector_batches FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE TRIGGER update_collector_batches_updated_at
  BEFORE UPDATE ON collector_batches
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Tester Batches Table
CREATE TABLE IF NOT EXISTS tester_batches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  collector_batch_id uuid NOT NULL REFERENCES collector_batches(id) ON DELETE CASCADE,
  tester_id text NOT NULL,
  gps_latitude decimal(10, 8),
  gps_longitude decimal(11, 8),
  weather_condition text,
  temperature decimal(5, 2),
  test_date date NOT NULL,
  quality_grade_score decimal(5, 2) NOT NULL CHECK (quality_grade_score >= 0 AND quality_grade_score <= 100),
  contaminant_level decimal(10, 4),
  purity_level decimal(5, 2) CHECK (purity_level >= 0 AND purity_level <= 100),
  lab_name text NOT NULL,
  collector_rating integer NOT NULL CHECK (collector_rating >= 1 AND collector_rating <= 5),
  collector_rating_notes text,
  qr_code_data text,
  blockchain_tx_hash text,
  status text DEFAULT 'completed',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_tester_batches_tester_id ON tester_batches(tester_id);
CREATE INDEX idx_tester_batches_collector_batch_id ON tester_batches(collector_batch_id);
CREATE INDEX idx_tester_batches_created_at ON tester_batches(created_at DESC);

ALTER TABLE tester_batches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations on tester_batches"
  ON tester_batches FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE TRIGGER update_tester_batches_updated_at
  BEFORE UPDATE ON tester_batches
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Processor Batches Table
CREATE TABLE IF NOT EXISTS processor_batches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tester_batch_id uuid NOT NULL REFERENCES tester_batches(id) ON DELETE CASCADE,
  processor_id text NOT NULL,
  processing_method text NOT NULL,
  equipment_used text NOT NULL,
  input_weight decimal(10, 2) NOT NULL CHECK (input_weight > 0),
  output_weight decimal(10, 2) NOT NULL CHECK (output_weight > 0),
  processing_date date NOT NULL,
  quality_score decimal(5, 2) CHECK (quality_score >= 0 AND quality_score <= 100),
  tester_rating integer CHECK (tester_rating >= 1 AND tester_rating <= 5),
  tester_rating_notes text,
  qr_code_data text,
  blockchain_tx_hash text,
  status text DEFAULT 'completed',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_processor_batches_processor_id ON processor_batches(processor_id);
CREATE INDEX idx_processor_batches_tester_batch_id ON processor_batches(tester_batch_id);
CREATE INDEX idx_processor_batches_created_at ON processor_batches(created_at DESC);

ALTER TABLE processor_batches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations on processor_batches"
  ON processor_batches FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE TRIGGER update_processor_batches_updated_at
  BEFORE UPDATE ON processor_batches
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Manufacturer Batches Table
CREATE TABLE IF NOT EXISTS manufacturer_batches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  processor_batch_id uuid NOT NULL REFERENCES processor_batches(id) ON DELETE CASCADE,
  manufacturer_id text NOT NULL,
  product_name text NOT NULL,
  product_type text NOT NULL,
  manufacturing_date date NOT NULL,
  expiry_date date NOT NULL,
  batch_size integer NOT NULL CHECK (batch_size > 0),
  packaging_type text NOT NULL,
  storage_conditions text,
  quality_certifications text[],
  processor_rating integer CHECK (processor_rating >= 1 AND processor_rating <= 5),
  processor_rating_notes text,
  qr_code_data text,
  blockchain_tx_hash text,
  status text DEFAULT 'completed',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_manufacturer_batches_manufacturer_id ON manufacturer_batches(manufacturer_id);
CREATE INDEX idx_manufacturer_batches_processor_batch_id ON manufacturer_batches(processor_batch_id);
CREATE INDEX idx_manufacturer_batches_created_at ON manufacturer_batches(created_at DESC);

ALTER TABLE manufacturer_batches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations on manufacturer_batches"
  ON manufacturer_batches FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE TRIGGER update_manufacturer_batches_updated_at
  BEFORE UPDATE ON manufacturer_batches
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Waste Metrics Table
CREATE TABLE IF NOT EXISTS waste_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id text NOT NULL,
  phase text NOT NULL CHECK (phase IN ('collection', 'testing', 'processing', 'manufacturing')),
  waste_amount decimal(10, 2) NOT NULL CHECK (waste_amount >= 0),
  waste_type text NOT NULL,
  reason text,
  recorded_by text NOT NULL,
  recorded_at timestamptz DEFAULT now()
);

CREATE INDEX idx_waste_metrics_batch_id ON waste_metrics(batch_id);
CREATE INDEX idx_waste_metrics_recorded_by ON waste_metrics(recorded_by);
CREATE INDEX idx_waste_metrics_phase ON waste_metrics(phase);
CREATE INDEX idx_waste_metrics_recorded_at ON waste_metrics(recorded_at DESC);

ALTER TABLE waste_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations on waste_metrics"
  ON waste_metrics FOR ALL
  USING (true)
  WITH CHECK (true);

-- QR Codes Table
CREATE TABLE IF NOT EXISTS qr_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id text NOT NULL,
  batch_type text NOT NULL CHECK (batch_type IN ('collector', 'tester', 'processor', 'manufacturer')),
  qr_data text NOT NULL UNIQUE,
  created_by text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_qr_codes_batch_id ON qr_codes(batch_id);
CREATE INDEX idx_qr_codes_qr_data ON qr_codes(qr_data);

ALTER TABLE qr_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations on qr_codes"
  ON qr_codes FOR ALL
  USING (true)
  WITH CHECK (true);

-- Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  type text NOT NULL,
  severity text DEFAULT 'info' CHECK (severity IN ('info', 'warning', 'error', 'success')),
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations on notifications"
  ON notifications FOR ALL
  USING (true)
  WITH CHECK (true);

-- Transaction Cache Table
CREATE TABLE IF NOT EXISTS transaction_cache (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tx_hash text NOT NULL UNIQUE,
  from_address text NOT NULL,
  to_address text,
  block_number bigint,
  timestamp bigint,
  status text DEFAULT 'pending',
  description text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_transaction_cache_tx_hash ON transaction_cache(tx_hash);
CREATE INDEX idx_transaction_cache_from_address ON transaction_cache(from_address);
CREATE INDEX idx_transaction_cache_created_at ON transaction_cache(created_at DESC);

ALTER TABLE transaction_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations on transaction_cache"
  ON transaction_cache FOR ALL
  USING (true)
  WITH CHECK (true);
