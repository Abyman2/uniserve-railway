-- Wallet balance on users
ALTER TABLE users ADD COLUMN IF NOT EXISTS balance NUMERIC(19, 2) NOT NULL DEFAULT 1000.00;

-- Payment status + price on bookings
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS payment_status VARCHAR(50) NOT NULL DEFAULT 'UNPAID';
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS price NUMERIC(19, 2) NOT NULL DEFAULT 0.00;

-- Booking delivery files (stored as BYTEA — works on Railway without S3)
CREATE TABLE IF NOT EXISTS booking_files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_type VARCHAR(255) NOT NULL,
    data BYTEA NOT NULL,
    uploaded_at TIMESTAMP NOT NULL DEFAULT NOW(),
    uploaded_by_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE
);

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_booking_files_booking_id ON booking_files(booking_id);