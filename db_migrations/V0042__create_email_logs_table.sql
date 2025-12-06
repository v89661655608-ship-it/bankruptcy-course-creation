-- Create email_logs table to track all email sending attempts
CREATE TABLE IF NOT EXISTS email_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    email VARCHAR(255) NOT NULL,
    email_type VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL,
    error_message TEXT,
    payment_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_email_logs_email ON email_logs(email);
CREATE INDEX idx_email_logs_payment_id ON email_logs(payment_id);
CREATE INDEX idx_email_logs_created_at ON email_logs(created_at DESC);