import { createContext, useContext, useState, useEffect } from 'react';
import { cartService } from '../api/services';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export function CartProvider({ children }) {
    const { user } = useAuth();
    const [cartItems, setCartItems] = useState([]);
    const [cartTotal, setCartTotal] = useState(0);
    const [cartCount, setCartCount] = useState(0);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) {
            loadCart();
        } else {
            setCartItems([]);
            setCartTotal(0);
            setCartCount(0);
        }
    }, [user]);

    const loadCart = async () => {
        try {
            setLoading(true);
            const res = await cartService.get();
            setCartItems(res.data.items);
            setCartTotal(res.data.total);
            setCartCount(res.data.count);
        } catch (error) {
            console.error('Load cart error:', error);
        } finally {
            setLoading(false);
        }
    };

    const addToCart = async (productId, quantity = 1) => {
        try {
            await cartService.add({ product_id: productId, quantity });
            await loadCart();
        } catch (error) {
            throw error;
        }
    };

    const updateQuantity = async (itemId, quantity) => {
        try {
            await cartService.update(itemId, { quantity });
            await loadCart();
        } catch (error) {
            throw error;
        }
    };

    const removeFromCart = async (itemId) => {
        try {
            await cartService.remove(itemId);
            await loadCart();
        } catch (error) {
            throw error;
        }
    };

    const clearCart = async () => {
        try {
            await cartService.clear();
            setCartItems([]);
            setCartTotal(0);
            setCartCount(0);
        } catch (error) {
            throw error;
        }
    };

    return (
        <CartContext.Provider value={{ cartItems, cartTotal, cartCount, loading, addToCart, updateQuantity, removeFromCart, clearCart, loadCart }}>
            {children}
        </CartContext.Provider>
    );
}
