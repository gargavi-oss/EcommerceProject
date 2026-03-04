# ShopVerse — Full Stack E-Commerce

A modern, responsive, full-stack e-commerce project built using the powerful React.js + Node.js ecosystem. 
ShopVerse provides a premium, "human-made" aesthetic, smooth interactions, and complete functionality for a digital storefront.

## Features

### Fast & Intuitive Frontend
- **React + Vite** for blazing-fast development and optimized production builds.
- **Context API** for global state management (Auth, Cart, Wishlist).
- **Modern UI Redesign**: Switched from an AI-perfect dark theme to a warm, inviting, light theme with beautiful typography (Inter), glassmorphism effects, and micro-interactions.
- **Fully Responsive**: Works seamlessly from mobile phones to high-definition desktops.
- **Indian Localization**: Integrated ₹ Indian currency formatting and number systems (e.g., lakhs/crores parsing) across all pages.

### Robust Backend
- **Node.js + Express**: RESTful API structure with robust modular routing.
- **MySQL Database**: Performant relational data modeling with solid constraints.
- **Multer Image Uploads**: Secure product image uploading saved into the backend file system and served statically.
- **Socket.IO Real-time Notifications**: Admins receive immediate notifications for new orders without refreshing the page.
- **JWT Authentication & bcrypt**: Complete security flow (Registration, Login, Protected Routes, Admin Role).

### Core User Capabilities
- **Product Discovery**: Browse by categories, check featured items, and search dynamically.
- **Shopping Flow**: Add items to a shopping cart, transfer from a wishlist, update quantities, and process checkouts (stock management included).
- **User Dashboard**: Customers can track order timelines (Pending, Processing, Shipped, Delivered) and rate/review purchased products.

### Complete Admin Panel
- **Store Analytics**: View quick stats on orders, users, revenue, and product volumes.
- **Product Management**: Create, edit, and delete products. **Image upload integration** enables admins to visually update inventory.
- **Order Processing**: Update order statuses through an intuitive interface.

## Quick Start Guide

### Prerequisites
- Node.js (v18+)
- MySQL

### 1. Database Setup
1. Log into your MySQL server.
2. Ensure the database doesn't exist, or create it manually: `CREATE DATABASE ecommerce_store;`
3. Import the schema inside the `backend/` directory:
   ```bash
   mysql -u root -p < backend/schema.sql
   ```
   *(The default user is `admin@store.com` with password `admin123`)*

### 2. Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up your environment variables. Create a `.env` file:
   ```env
   PORT=8000
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=ecommerce_store
   JWT_SECRET=super_secret_key
   CLIENT_URL=http://localhost:5173
   ```
4. Start the backend development server:
   ```bash
   npm run dev
   ```

### 3. Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the Vite development server:
   ```bash
   npm run dev
   ```
4. The frontend will be available at `http://localhost:5173` (or the next available port indicated in the terminal). Let Vite run!

## Tech Stack Overview
- **Frontend**: React.js 18, React Router v6, Axios, Socket.IO Client, React Icons, Vanilla CSS
- **Backend**: Node.js, Express.js, MySQL2, Bcrypt.js, JsonWebToken, Multer, Socket.IO
