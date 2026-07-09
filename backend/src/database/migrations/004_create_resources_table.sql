-- Create resources table
CREATE TABLE IF NOT EXISTS resources (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  resource_type VARCHAR(50) NOT NULL CHECK (resource_type IN ('brand', 'article', 'video', 'other')),
  url VARCHAR(500) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_resources_resource_type ON resources(resource_type);

-- Create trigger for resources table
CREATE TRIGGER update_resources_updated_at
  BEFORE UPDATE ON resources
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
