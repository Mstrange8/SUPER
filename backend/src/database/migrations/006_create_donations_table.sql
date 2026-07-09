-- Migration: Create donations table
CREATE TABLE donations (
    id SERIAL PRIMARY KEY,
    stripe_session_id VARCHAR(255) UNIQUE NOT NULL,
    amount INTEGER NOT NULL, -- amount in cents
    currency VARCHAR(3) DEFAULT 'usd',
    donor_name VARCHAR(255),
    donor_email VARCHAR(255),
    message TEXT,
    status VARCHAR(20) NOT NULL CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index on stripe_session_id for faster lookups
CREATE INDEX idx_donations_stripe_session_id ON donations(stripe_session_id);

-- Create index on status for filtering
CREATE INDEX idx_donations_status ON donations(status);

-- Create index on created_at for sorting
CREATE INDEX idx_donations_created_at ON donations(created_at DESC);

-- Create trigger to update updated_at timestamp
CREATE TRIGGER update_donations_updated_at
    BEFORE UPDATE ON donations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
