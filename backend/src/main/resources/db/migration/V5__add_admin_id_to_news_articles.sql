-- Create service_listings table
CREATE TABLE IF NOT EXISTS service_listings (
    id UUID PRIMARY KEY,
    provider_id UUID NOT NULL,
    title VARCHAR(255) NOT NULL,
    description VARCHAR(2000) NOT NULL,
    category VARCHAR(255) NOT NULL,
    price NUMERIC(38,2) NOT NULL,
    campus VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL,
    created_at TIMESTAMP,
    CONSTRAINT fk_listing_provider FOREIGN KEY (provider_id) REFERENCES users(id)
);

-- Add foreign key constraints to bookings table safely
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_booking_buyer') THEN
        ALTER TABLE bookings ADD CONSTRAINT fk_booking_buyer FOREIGN KEY (buyer_id) REFERENCES users(id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_booking_provider') THEN
        ALTER TABLE bookings ADD CONSTRAINT fk_booking_provider FOREIGN KEY (provider_id) REFERENCES users(id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_booking_listing') THEN
        ALTER TABLE bookings ADD CONSTRAINT fk_booking_listing FOREIGN KEY (listing_id) REFERENCES service_listings(id);
    END IF;
END $$;

-- Create provider_applications table
CREATE TABLE IF NOT EXISTS provider_applications (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL UNIQUE,
    skills VARCHAR(255) NOT NULL,
    portfolio_links VARCHAR(255),
    status VARCHAR(50) NOT NULL,
    submitted_at TIMESTAMP,
    CONSTRAINT fk_provider_user FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Create reviews table
CREATE TABLE IF NOT EXISTS reviews (
    id UUID PRIMARY KEY,
    booking_id UUID NOT NULL UNIQUE,
    reviewer_id UUID NOT NULL,
    provider_id UUID NOT NULL,
    rating INTEGER NOT NULL,
    comment VARCHAR(2000),
    created_at TIMESTAMP,
    CONSTRAINT fk_review_booking FOREIGN KEY (booking_id) REFERENCES bookings(id),
    CONSTRAINT fk_review_reviewer FOREIGN KEY (reviewer_id) REFERENCES users(id),
    CONSTRAINT fk_review_provider FOREIGN KEY (provider_id) REFERENCES users(id)
);

-- Make scheduled_time nullable in bookings table
ALTER TABLE bookings ALTER COLUMN scheduled_time DROP NOT NULL;

-- Add admin_id to news_articles table and its constraint safely
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='news_articles' AND column_name='admin_id') THEN
        ALTER TABLE news_articles ADD COLUMN admin_id uuid;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_news_admin') THEN
        ALTER TABLE news_articles ADD CONSTRAINT fk_news_admin FOREIGN KEY (admin_id) REFERENCES users(id);
    END IF;
END $$;