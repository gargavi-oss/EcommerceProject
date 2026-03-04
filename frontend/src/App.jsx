import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute, { AdminRoute } from './components/ProtectedRoute';

// Pages
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import Cart from './pages/Cart';
import Wishlist from './pages/Wishlist';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';
import Profile from './pages/Profile';

// Admin Pages
import Dashboard from './pages/admin/Dashboard';
import AdminProducts from './pages/admin/AdminProducts';
import AdminOrders from './pages/admin/AdminOrders';
import AdminUsers from './pages/admin/AdminUsers';

function AppLayout({ children, showNav = true }) {
  return (
    <>
      {showNav && <Navbar />}
      <main>{children}</main>
      {showNav && <Footer />}
    </>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <Toaster
              position="top-right"
              toastOptions={{
                style: {
                  background: '#1E1E32',
                  color: '#FFFFFF',
                  border: '1px solid rgba(168, 168, 210, 0.1)',
                },
                duration: 3000,
              }}
            />
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<AppLayout><Home /></AppLayout>} />
              <Route path="/products" element={<AppLayout><Products /></AppLayout>} />
              <Route path="/product/:id" element={<AppLayout><ProductDetail /></AppLayout>} />
              <Route path="/login" element={<AppLayout><Login /></AppLayout>} />
              <Route path="/register" element={<AppLayout><Register /></AppLayout>} />

              {/* Protected Routes */}
              <Route path="/cart" element={<AppLayout><ProtectedRoute><Cart /></ProtectedRoute></AppLayout>} />
              <Route path="/wishlist" element={<AppLayout><ProtectedRoute><Wishlist /></ProtectedRoute></AppLayout>} />
              <Route path="/checkout" element={<AppLayout><ProtectedRoute><Checkout /></ProtectedRoute></AppLayout>} />
              <Route path="/orders" element={<AppLayout><ProtectedRoute><Orders /></ProtectedRoute></AppLayout>} />
              <Route path="/profile" element={<AppLayout><ProtectedRoute><Profile /></ProtectedRoute></AppLayout>} />

              {/* Admin Routes (no navbar/footer) */}
              <Route path="/admin" element={<AppLayout showNav={false}><AdminRoute><Dashboard /></AdminRoute></AppLayout>} />
              <Route path="/admin/products" element={<AppLayout showNav={false}><AdminRoute><AdminProducts /></AdminRoute></AppLayout>} />
              <Route path="/admin/orders" element={<AppLayout showNav={false}><AdminRoute><AdminOrders /></AdminRoute></AppLayout>} />
              <Route path="/admin/users" element={<AppLayout showNav={false}><AdminRoute><AdminUsers /></AdminRoute></AppLayout>} />
            </Routes>
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
