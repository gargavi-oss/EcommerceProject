-- Full Stack Ecommerce Database Schema

CREATE DATABASE IF NOT EXISTS ecommerce_store;
USE ecommerce_store;

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  phone VARCHAR(20) DEFAULT NULL,
  address TEXT DEFAULT NULL,
  city VARCHAR(100) DEFAULT NULL,
  state VARCHAR(100) DEFAULT NULL,
  zip_code VARCHAR(20) DEFAULT NULL,
  role ENUM('user', 'admin') DEFAULT 'user',
  avatar VARCHAR(255) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) NOT NULL UNIQUE,
  description TEXT DEFAULT NULL,
  image VARCHAR(255) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  description TEXT DEFAULT NULL,
  price DECIMAL(10, 2) NOT NULL,
  sale_price DECIMAL(10, 2) DEFAULT NULL,
  stock INT DEFAULT 0,
  category_id INT DEFAULT NULL,
  image VARCHAR(255) DEFAULT NULL,
  images JSON DEFAULT NULL,
  featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
);

-- Cart items table
CREATE TABLE IF NOT EXISTS cart_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity INT DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  UNIQUE KEY unique_cart_item (user_id, product_id)
);

-- Wishlist table
CREATE TABLE IF NOT EXISTS wishlist (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  product_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  UNIQUE KEY unique_wishlist_item (user_id, product_id)
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  total DECIMAL(10, 2) NOT NULL,
  status ENUM('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
  shipping_name VARCHAR(100) NOT NULL,
  shipping_email VARCHAR(100) NOT NULL,
  shipping_phone VARCHAR(20) NOT NULL,
  shipping_address TEXT NOT NULL,
  shipping_city VARCHAR(100) NOT NULL,
  shipping_state VARCHAR(100) NOT NULL,
  shipping_zip VARCHAR(20) NOT NULL,
  notes TEXT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Order items table
CREATE TABLE IF NOT EXISTS order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity INT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  product_id INT NOT NULL,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  UNIQUE KEY unique_review (user_id, product_id)
);

-- Notifications table (for admin)
CREATE TABLE IF NOT EXISTS notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  type VARCHAR(50) NOT NULL DEFAULT 'new_order',
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  order_id INT DEFAULT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

-- Insert default admin user (password: admin123)
INSERT INTO users (name, email, password, role) VALUES 
('Admin', 'admin@store.com', '$2b$10$HWRQ3BIEzaPQA92BuDYQZOVOd3s1Ijrbe7uCruP5oyETIyHbOw66C', 'admin');

-- Insert sample categories
INSERT INTO categories (name, slug, description) VALUES 
('Electronics', 'electronics', 'Latest electronic gadgets and devices'),
('Clothing', 'clothing', 'Fashion and apparel for everyone'),
('Home & Kitchen', 'home-kitchen', 'Everything for your home'),
('Books', 'books', 'Explore the world of knowledge'),
('Sports & Outdoors', 'sports-outdoors', 'Get active and explore'),
('Beauty & Health', 'beauty-health', 'Look and feel your best');

-- Insert sample products
INSERT INTO products (name, slug, description, price, sale_price, stock, category_id, featured) VALUES 
('Wireless Bluetooth Headphones', 'wireless-bluetooth-headphones', 'Premium noise-cancelling wireless headphones with 30-hour battery life and crystal-clear audio.', 79.99, 59.99, 50, 1, TRUE),
('Smart Watch Pro', 'smart-watch-pro', 'Advanced smartwatch with health monitoring, GPS, and 7-day battery life.', 199.99, 149.99, 30, 1, TRUE),
('Cotton Crew Neck T-Shirt', 'cotton-crew-neck-tshirt', 'Soft 100% organic cotton t-shirt available in multiple colors.', 24.99, NULL, 200, 2, FALSE),
('Denim Jacket Classic', 'denim-jacket-classic', 'Timeless classic denim jacket with modern fit.', 89.99, 69.99, 45, 2, TRUE),
('Stainless Steel Cookware Set', 'stainless-steel-cookware-set', 'Professional-grade 10-piece stainless steel cookware set.', 149.99, 119.99, 25, 3, TRUE),
('Bamboo Cutting Board', 'bamboo-cutting-board', 'Eco-friendly bamboo cutting board with juice grooves.', 29.99, NULL, 100, 3, FALSE),
('JavaScript: The Good Parts', 'javascript-the-good-parts', 'Essential guide to JavaScript programming by Douglas Crockford.', 34.99, 24.99, 60, 4, FALSE),
('The Art of War', 'the-art-of-war', 'Ancient Chinese military treatise by Sun Tzu.', 12.99, NULL, 150, 4, TRUE),
('Yoga Mat Premium', 'yoga-mat-premium', 'Extra thick non-slip yoga mat with alignment lines.', 39.99, 29.99, 80, 5, FALSE),
('Running Shoes Ultra', 'running-shoes-ultra', 'Lightweight running shoes with responsive cushioning.', 129.99, 99.99, 40, 5, TRUE),
('Vitamin C Serum', 'vitamin-c-serum', 'Brightening face serum with 20% Vitamin C and hyaluronic acid.', 24.99, 19.99, 90, 6, TRUE),
('Natural Lip Balm Set', 'natural-lip-balm-set', 'Set of 4 organic lip balms in assorted flavors.', 14.99, NULL, 120, 6, FALSE);
