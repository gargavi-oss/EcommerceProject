import API from './axios';

// Auth
export const authService = {
    register: (data) => API.post('/auth/register', data),
    login: (data) => API.post('/auth/login', data),
    getProfile: () => API.get('/auth/profile'),
    updateProfile: (data) => API.put('/auth/profile', data),
};

// Products
export const productService = {
    getAll: (params) => API.get('/products', { params }),
    getOne: (id) => API.get(`/products/${id}`),
    create: (data) => API.post('/products', data),
    update: (id, data) => API.put(`/products/${id}`, data),
    delete: (id) => API.delete(`/products/${id}`),
};

// Categories
export const categoryService = {
    getAll: () => API.get('/categories'),
    getOne: (id) => API.get(`/categories/${id}`),
    create: (data) => API.post('/categories', data),
    update: (id, data) => API.put(`/categories/${id}`, data),
    delete: (id) => API.delete(`/categories/${id}`),
};

// Cart
export const cartService = {
    get: () => API.get('/cart'),
    add: (data) => API.post('/cart', data),
    update: (id, data) => API.put(`/cart/${id}`, data),
    remove: (id) => API.delete(`/cart/${id}`),
    clear: () => API.delete('/cart/clear'),
};

// Wishlist
export const wishlistService = {
    get: () => API.get('/wishlist'),
    toggle: (data) => API.post('/wishlist', data),
    check: (productId) => API.get(`/wishlist/check/${productId}`),
    remove: (id) => API.delete(`/wishlist/${id}`),
};

// Orders
export const orderService = {
    create: (data) => API.post('/orders', data),
    getUserOrders: () => API.get('/orders'),
    getOne: (id) => API.get(`/orders/${id}`),
    getAll: (params) => API.get('/orders/all', { params }),
    updateStatus: (id, data) => API.put(`/orders/${id}/status`, data),
};

// Reviews
export const reviewService = {
    getByProduct: (productId) => API.get(`/reviews/product/${productId}`),
    create: (data) => API.post('/reviews', data),
    delete: (id) => API.delete(`/reviews/${id}`),
};

// Admin
export const adminService = {
    getDashboard: () => API.get('/admin/dashboard'),
    getNotifications: () => API.get('/admin/notifications'),
    markRead: (id) => API.put(`/admin/notifications/${id}/read`),
    markAllRead: () => API.put('/admin/notifications/read-all'),
    getUsers: () => API.get('/admin/users'),
    updateUserRole: (id, data) => API.put(`/admin/users/${id}/role`, data),
    deleteUser: (id) => API.delete(`/admin/users/${id}`),
};

// Upload
export const uploadService = {
    uploadImage: (file) => {
        const formData = new FormData();
        formData.append('image', file);
        return API.post('/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    }
};
