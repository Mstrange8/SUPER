-- Create courts table
CREATE TABLE IF NOT EXISTS courts (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  address VARCHAR(255) NOT NULL,
  city VARCHAR(100) NOT NULL,
  zip VARCHAR(10),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  description TEXT,
  surface_type VARCHAR(50),
  num_courts INTEGER DEFAULT 1,
  has_lighting BOOLEAN DEFAULT false,
  amenities TEXT,
  image_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_courts_city ON courts(city);

-- Create trigger for courts table
CREATE TRIGGER update_courts_updated_at
  BEFORE UPDATE ON courts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
