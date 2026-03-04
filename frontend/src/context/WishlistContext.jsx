import { createContext, useContext, useState, useEffect } from 'react';
import { wishlistService } from '../api/services';
import { useAuth } from './AuthContext';

const WishlistContext = createContext();

export const useWishlist = () => useContext(WishlistContext);

export function WishlistProvider({ children }) {
    const { user } = useAuth();
    const [wishlistItems, setWishlistItems] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) {
            loadWishlist();
        } else {
            setWishlistItems([]);
        }
    }, [user]);

    const loadWishlist = async () => {
        try {
            setLoading(true);
            const res = await wishlistService.get();
            setWishlistItems(res.data);
        } catch (error) {
            console.error('Load wishlist error:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleWishlist = async (productId) => {
        try {
            const res = await wishlistService.toggle({ product_id: productId });
            await loadWishlist();
            return res.data;
        } catch (error) {
            throw error;
        }
    };

    const isInWishlist = (productId) => {
        return wishlistItems.some(item => item.product_id === productId);
    };

    const removeFromWishlist = async (id) => {
        try {
            await wishlistService.remove(id);
            await loadWishlist();
        } catch (error) {
            throw error;
        }
    };

    return (
        <WishlistContext.Provider value={{ wishlistItems, loading, toggleWishlist, isInWishlist, removeFromWishlist, loadWishlist }}>
            {children}
        </WishlistContext.Provider>
    );
}
