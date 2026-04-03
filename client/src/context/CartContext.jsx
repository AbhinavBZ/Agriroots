/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../api';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export function CartProvider({ children }) {
    const { user } = useAuth();
    const [cartItems, setCartItems] = useState([]);
    const [cartCount, setCartCount] = useState(0);

    const fetchCart = useCallback(async () => {
        if (!user) {
            Promise.resolve().then(() => {
                setCartItems([]);
                setCartCount(0);
            });
            return;
        }
        try {
            const items = await api.cart.get();
            setCartItems(items);
            setCartCount(items.reduce((sum, i) => sum + i.quantity, 0));
        } catch (err) {
            console.error('Cart fetch error:', err);
        }
    }, [user]);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchCart();
    }, [fetchCart]);

    const addToCart = async (shop_item_id, quantity = 1) => {
        if (!user) return { requiresAuth: true };
        await api.cart.add(shop_item_id, quantity);
        await fetchCart();
    };

    const updateQuantity = async (id, quantity) => {
        await api.cart.update(id, quantity);
        await fetchCart();
    };

    const removeItem = async (id) => {
        await api.cart.remove(id);
        await fetchCart();
    };

    const clearCart = async () => {
        await api.cart.clear();
        setCartItems([]);
        setCartCount(0);
    };

    return (
        <CartContext.Provider value={{ cartItems, cartCount, fetchCart, addToCart, updateQuantity, removeItem, clearCart }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    return useContext(CartContext);
}
