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
INSERT INTO products (name, slug, description, price, sale_price, stock, category_id, featured, image) VALUES 
('Wireless Bluetooth Headphones', 'wireless-bluetooth-headphones', 'Premium noise-canceling wireless headphones with 30-hour battery life.', 199.99, 149.99, 50, 1, true, '/uploads/product-headphones.jpg'),
('Smart Watch Pro', 'smart-watch-pro', 'Fitness tracking, heart rate monitor, and sleep tracking in a sleek design.', 299.99, null, 30, 1, true, '/uploads/product-watch.jpg'),
('Cotton Crew Neck T-Shirt', 'cotton-crew-neck-tshirt', 'Comfortable 100% organic cotton basic tee for everyday wear.', 24.99, 19.99, 100, 2, false, '/uploads/product-tshirt.jpg'),
('Denim Jacket Classic', 'denim-jacket-classic', 'Timeless blue denim jacket with a comfortable fit.', 89.99, null, 25, 2, true, '/uploads/product-jacket.jpg'),
('Stainless Steel Cookware Set', 'stainless-steel-cookware-set', '10-piece professional grade stainless steel pots and pans.', 199.99, 159.99, 15, 3, false, '/uploads/product-cookware.jpg'),
('Bamboo Cutting Board', 'bamboo-cutting-board', 'Eco-friendly, durable bamboo cutting board for kitchen prep.', 34.99, null, 40, 3, false, '/uploads/product-cuttingboard.jpg'),
('JavaScript: The Good Parts', 'javascript-the-good-parts', 'Unearthing the Excellence in JavaScript. A must-read for web developers.', 29.99, 24.99, 60, 4, true, '/uploads/product-book-js.jpg'),
('The Art of War', 'the-art-of-war', 'Ancient Chinese military treatise by Sun Tzu.', 14.99, null, 80, 4, false, '/uploads/product-book-art.jpg'),
('Yoga Mat Premium', 'yoga-mat-premium', 'Non-slip, eco-friendly 6mm thick yoga mat for all practices.', 45.00, 35.00, 45, 5, true, '/uploads/product-yogamat.jpg'),
('Running Shoes Ultra', 'running-shoes-ultra', 'Lightweight, breathable running shoes for long distances.', 129.99, 99.99, 20, 5, true, '/uploads/product-shoes.jpg'),
('Vitamin C Serum', 'vitamin-c-serum', 'Anti-aging facial serum with hyaluronic acid.', 39.99, null, 55, 6, false, '/uploads/product-serum.jpg'),
('Natural Lip Balm Set', 'natural-lip-balm-set', 'Set of 4 organic beeswax lip balms with natural flavors.', 15.99, 12.99, 120, 6, false, '/uploads/product-lipbalm.jpg');
