import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';

function Cart() {
    const { user } = useAuth();
    const { cartItems, updateQuantity, removeItem } = useCart();
    const [orderPlaced, setOrderPlaced] = useState(false);
    const [placingOrder, setPlacingOrder] = useState(false);
    const [address, setAddress] = useState('');
    const [showAddressModal, setShowAddressModal] = useState(false);
    const [toast, setToast] = useState('');

    useEffect(() => { document.title = 'My Cart | AgriRoots'; }, []);

    const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

    // Parse numeric price from ₹ strings like "₹266" or "₹12,000 / acre"
    const parsePrice = (priceStr) => parseFloat(String(priceStr).replace(/[₹,]/g, '').split(' ')[0]) || 0;

    const subtotal = cartItems.reduce((acc, item) => acc + (parsePrice(item.price) * item.quantity), 0);
    const taxes = Math.round(subtotal * 0.05);
    const total = subtotal + taxes;

    const handlePlaceOrder = async () => {
        if (!address.trim()) return;
        setPlacingOrder(true);
        try {
            await api.orders.place(address);
            setOrderPlaced(true);
            setShowAddressModal(false);
            showToast('🎉 Order placed successfully!');
        } catch (err) {
            showToast(err.message || 'Failed to place order.');
        } finally {
            setPlacingOrder(false);
        }
    };

    // Not logged in
    if (!user) {
        return (
            <div className="page-container" style={{ padding: '6rem 5%', minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1.5rem' }}>
                <i className="fa-solid fa-lock" style={{ fontSize: '4rem', color: '#ccc' }}></i>
                <h2 style={{ color: '#555', fontSize: '1.8rem' }}>Login to View Your Cart</h2>
                <p style={{ color: '#888' }}>You need to be logged in to manage your cart and place orders.</p>
                <Link to="/" style={{ padding: '0.9rem 2rem', background: 'linear-gradient(135deg,#1f4037,#4caf50)', color: 'white', borderRadius: '30px', fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <i className="fa-solid fa-arrow-left"></i> Go to Home & Login
                </Link>
            </div>
        );
    }

    if (orderPlaced) {
        return (
            <div className="page-container" style={{ padding: '6rem 5%', minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1.5rem', textAlign: 'center' }}>
                <div style={{ width: '100px', height: '100px', background: '#e8f5e9', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <i className="fa-solid fa-circle-check" style={{ fontSize: '3.5rem', color: '#4caf50' }}></i>
                </div>
                <h2 style={{ fontSize: '2rem', color: '#1f4037', fontWeight: 700 }}>Order Placed Successfully!</h2>
                <p style={{ color: '#666', maxWidth: '400px' }}>Your order has been received. We'll process it shortly and notify you on delivery.</p>
                <Link to="/" style={{ padding: '0.9rem 2rem', background: 'linear-gradient(135deg,#1f4037,#4caf50)', color: 'white', borderRadius: '30px', fontWeight: 600, textDecoration: 'none' }}>
                    Continue Shopping
                </Link>
            </div>
        );
    }

    return (
        <div className="page-container" style={{ padding: '4rem 5%', minHeight: '80vh', backgroundColor: '#f9fbf9' }}>
            {toast && (
                <div style={{ position: 'fixed', top: '5rem', right: '2rem', background: '#1f4037', color: 'white', padding: '1rem 1.5rem', borderRadius: '10px', zIndex: 9999, boxShadow: '0 5px 20px rgba(0,0,0,0.2)', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    {toast}
                </div>
            )}

            <h1 style={{ fontSize: '2.5rem', color: '#1f4037', marginBottom: '2rem', fontWeight: 600 }}>Your Shopping Cart</h1>

            {cartItems.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '5rem 0' }}>
                    <i className="fa-solid fa-cart-arrow-down" style={{ fontSize: '5rem', color: '#ccc', marginBottom: '1rem' }}></i>
                    <h2 style={{ color: '#666' }}>Your cart is empty!</h2>
                    <Link to="/services/agri-inputs" style={{ display: 'inline-block', marginTop: '1rem', padding: '0.8rem 2rem', backgroundColor: '#4caf50', color: 'white', borderRadius: '30px', fontWeight: 600, textDecoration: 'none' }}>
                        Browse Products
                    </Link>
                </div>
            ) : (
                <div style={{ display: 'flex', gap: '3rem', flexWrap: 'wrap' }}>
                    {/* Cart Items */}
                    <div style={{ flex: '1 1 60%' }}>
                        {cartItems.map(item => (
                            <div key={item.id} style={{ display: 'flex', alignItems: 'center', backgroundColor: 'white', padding: '1.5rem', borderRadius: '15px', marginBottom: '1.5rem', boxShadow: '0 5px 15px rgba(0,0,0,0.05)' }}>
                                <div style={{ width: '80px', height: '80px', backgroundColor: '#e8f5e9', display: 'flex', justifyContent: 'center', alignItems: 'center', borderRadius: '10px', marginRight: '1.5rem', flexShrink: 0 }}>
                                    <i className={`fa-solid ${item.icon}`} style={{ fontSize: '2.5rem', color: '#4caf50' }}></i>
                                </div>
                                <div style={{ flex: 1 }}>
                                    <h3 style={{ fontSize: '1.2rem', color: '#333', marginBottom: '0.3rem' }}>{item.name}</h3>
                                    <p style={{ color: '#888', fontSize: '0.9rem', marginBottom: '0.4rem' }}>{item.tag}</p>
                                    <p style={{ color: '#1f4037', fontWeight: 700, fontSize: '1.1rem' }}>{item.price}</p>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '1rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', backgroundColor: '#f1f1f1', borderRadius: '20px', padding: '0.3rem 0.5rem' }}>
                                        <button onClick={() => updateQuantity(item.id, item.quantity - 1)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0 0.5rem', fontSize: '1.2rem', color: '#666' }}>&minus;</button>
                                        <span style={{ fontWeight: 600, width: '20px', textAlign: 'center' }}>{item.quantity}</span>
                                        <button onClick={() => updateQuantity(item.id, item.quantity + 1)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0 0.5rem', fontSize: '1.2rem', color: '#666' }}>&#43;</button>
                                    </div>
                                    <h3 style={{ fontSize: '1.2rem', color: '#1f4037' }}>₹{(parsePrice(item.price) * item.quantity).toLocaleString()}</h3>
                                    <button onClick={() => removeItem(item.id)} style={{ background: 'none', border: 'none', color: '#f44336', fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                        <i className="fa-solid fa-trash"></i> Remove
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Order Summary */}
                    <div style={{ flex: '1 1 30%', minWidth: '300px' }}>
                        <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '15px', boxShadow: '0 5px 15px rgba(0,0,0,0.05)', position: 'sticky', top: '2rem' }}>
                            <h2 style={{ fontSize: '1.5rem', color: '#1f4037', borderBottom: '2px solid #f1f8e9', paddingBottom: '1rem', marginBottom: '1.5rem' }}>Order Summary</h2>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', color: '#666' }}><span>Subtotal</span><span>₹{subtotal.toLocaleString()}</span></div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', color: '#666' }}><span>Taxes (5% GST)</span><span>₹{taxes.toLocaleString()}</span></div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', color: '#666' }}><span>Shipping</span><span style={{ color: '#4caf50', fontWeight: 600 }}>FREE</span></div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '2px solid #f1f8e9', paddingTop: '1.5rem', marginBottom: '2rem' }}>
                                <span style={{ fontSize: '1.2rem', fontWeight: 600, color: '#333' }}>Total:</span>
                                <span style={{ fontSize: '1.8rem', fontWeight: 700, color: '#1f4037' }}>₹{total.toLocaleString()}</span>
                            </div>
                            <button onClick={() => setShowAddressModal(true)}
                                style={{ width: '100%', padding: '1.2rem', backgroundColor: '#a7e608', color: '#1f4037', border: 'none', borderRadius: '30px', fontSize: '1.1rem', fontWeight: 700, cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', boxShadow: '0 5px 15px rgba(167,230,8,0.4)', transition: 'transform 0.2s' }}
                                onMouseOver={e => e.currentTarget.style.transform = 'translateY(-3px)'}
                                onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
                                Proceed to Pay <i className="fa-solid fa-arrow-right"></i>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Address Modal */}
            {showAddressModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
                    <div style={{ background: 'white', borderRadius: '20px', padding: '2.5rem', width: '100%', maxWidth: '480px', boxShadow: '0 20px 50px rgba(0,0,0,0.2)' }}>
                        <h2 style={{ fontSize: '1.6rem', color: '#1f4037', marginBottom: '1.5rem' }}>📦 Delivery Address</h2>
                        <textarea value={address} onChange={e => setAddress(e.target.value)} rows={4} placeholder="Enter your full delivery address..."
                            style={{ width: '100%', padding: '1rem', border: '2px solid #ddd', borderRadius: '10px', fontSize: '0.95rem', resize: 'vertical', outline: 'none', boxSizing: 'border-box' }}
                            onFocus={e => e.target.style.borderColor = '#4caf50'} onBlur={e => e.target.style.borderColor = '#ddd'} />
                        <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                            <button onClick={() => setShowAddressModal(false)}
                                style={{ flex: 1, padding: '0.9rem', background: '#f5f5f5', color: '#666', border: 'none', borderRadius: '10px', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                            <button onClick={handlePlaceOrder} disabled={placingOrder || !address.trim()}
                                style={{ flex: 2, padding: '0.9rem', background: placingOrder ? '#ccc' : 'linear-gradient(135deg,#1f4037,#4caf50)', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 700, cursor: placingOrder ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                                {placingOrder ? <><i className="fa-solid fa-spinner fa-spin"></i> Placing...</> : 'Confirm Order'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Cart;
