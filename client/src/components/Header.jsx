import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import AuthModal from './AuthModal';

function Header() {
    const location = useLocation();
    const { user, logout } = useAuth();
    const { cartCount } = useCart();
    const [showAuth, setShowAuth] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <>
            <header className="top-header">
                <Link to="/" className="logo">
                    <i className="fa-solid fa-leaf leaf-icon"></i>
                    <span className="logo-text">AgriRoots</span>
                </Link>
                <div className="user-actions">
                    {user ? (
                        <div style={{ position: 'relative' }}>
                            <button
                                onClick={() => setShowDropdown(d => !d)}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'inherit', fontSize: '0.95rem', fontWeight: 600 }}>
                                <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: 'linear-gradient(135deg,#1f4037,#4caf50)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '0.85rem', fontWeight: 700 }}>
                                    {user.fullName?.charAt(0).toUpperCase()}
                                </div>
                                <span style={{ maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.fullName?.split(' ')[0]}</span>
                                <i className="fa-solid fa-chevron-down" style={{ fontSize: '0.7rem', opacity: 0.7 }}></i>
                            </button>
                            {showDropdown && (
                                <div style={{ position: 'absolute', top: '110%', right: 0, background: 'white', borderRadius: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.12)', minWidth: '180px', zIndex: 100, overflow: 'hidden', border: '1px solid #eee' }}>
                                    <Link to="/profile" onClick={() => setShowDropdown(false)} style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', padding: '0.9rem 1.2rem', color: '#333', textDecoration: 'none', fontSize: '0.9rem', transition: 'background 0.2s' }}
                                        onMouseOver={e => e.currentTarget.style.background = '#f9fbf9'}
                                        onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                                        <i className="fa-solid fa-user" style={{ color: '#4caf50', width: '16px' }}></i> My Profile
                                    </Link>
                                    <Link to="/cart" onClick={() => setShowDropdown(false)} style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', padding: '0.9rem 1.2rem', color: '#333', textDecoration: 'none', fontSize: '0.9rem' }}
                                        onMouseOver={e => e.currentTarget.style.background = '#f9fbf9'}
                                        onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                                        <i className="fa-solid fa-box" style={{ color: '#4caf50', width: '16px' }}></i> My Orders
                                    </Link>
                                    <div style={{ height: '1px', background: '#eee', margin: '0 1rem' }}></div>
                                    <button onClick={() => { logout(); setShowDropdown(false); }}
                                        style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', padding: '0.9rem 1.2rem', color: '#e53935', background: 'none', border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer', fontSize: '0.9rem' }}
                                        onMouseOver={e => e.currentTarget.style.background = '#ffebee'}
                                        onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                                        <i className="fa-solid fa-right-from-bracket" style={{ width: '16px' }}></i> Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <button onClick={() => setShowAuth(true)}
                            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'linear-gradient(135deg,#1f4037,#4caf50)', color: 'white', border: 'none', borderRadius: '20px', padding: '0.5rem 1.2rem', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem' }}>
                            <i className="fa-regular fa-user"></i> Login
                        </button>
                    )}
                </div>
            </header>

            <nav className="navbar">
                <div className="nav-links">
                    <Link to="/" className={location.pathname === '/' ? "active" : ""}>Home</Link>
                    <a href="/#services">Services</a>
                    <a href="/#guide">Guide &amp; Tips</a>
                    <Link to="/centers" className={location.pathname === '/centers' ? "active" : ""}>Our Centers</Link>
                    <Link to="/about" className={location.pathname === '/about' ? "active" : ""}>About Us</Link>
                </div>
                <div className="nav-cart">
                    <Link to="/cart" className="cart-btn" style={{ position: 'relative' }}>
                        <i className="fa-solid fa-cart-shopping"></i> Cart
                        {cartCount > 0 && (
                            <span style={{ position: 'absolute', top: '-8px', right: '-8px', background: '#e53935', color: 'white', borderRadius: '50%', width: '20px', height: '20px', fontSize: '0.7rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                {cartCount > 99 ? '99+' : cartCount}
                            </span>
                        )}
                    </Link>
                </div>
                {/* Hamburger button – mobile only */}
                <button className="hamburger-btn" onClick={() => setMobileOpen(o => !o)} aria-label="Toggle menu">
                    <i className={`fa-solid ${mobileOpen ? 'fa-xmark' : 'fa-bars'}`}></i>
                </button>
            </nav>

            {/* Mobile slide-down menu */}
            {mobileOpen && (
                <div className="mobile-nav-overlay" onClick={() => setMobileOpen(false)}>
                    <div className="mobile-nav-drawer" onClick={e => e.stopPropagation()}>
                        <Link to="/" onClick={() => setMobileOpen(false)} className={location.pathname === '/' ? 'mobile-nav-link active' : 'mobile-nav-link'}><i className="fa-solid fa-house"></i> Home</Link>
                        <a href="/#services" onClick={() => setMobileOpen(false)} className="mobile-nav-link"><i className="fa-solid fa-briefcase"></i> Services</a>
                        <a href="/#guide" onClick={() => setMobileOpen(false)} className="mobile-nav-link"><i className="fa-solid fa-book"></i> Guide &amp; Tips</a>
                        <Link to="/centers" onClick={() => setMobileOpen(false)} className={location.pathname === '/centers' ? 'mobile-nav-link active' : 'mobile-nav-link'}><i className="fa-solid fa-map-location-dot"></i> Our Centers</Link>
                        <Link to="/about" onClick={() => setMobileOpen(false)} className={location.pathname === '/about' ? 'mobile-nav-link active' : 'mobile-nav-link'}><i className="fa-solid fa-circle-info"></i> About Us</Link>
                        <Link to="/cart" onClick={() => setMobileOpen(false)} className="mobile-nav-link" style={{ position: 'relative' }}>
                            <i className="fa-solid fa-cart-shopping"></i> Cart
                            {cartCount > 0 && <span style={{ marginLeft: '0.4rem', background: '#e53935', color: 'white', borderRadius: '10px', padding: '0.1rem 0.5rem', fontSize: '0.75rem', fontWeight: 700 }}>{cartCount}</span>}
                        </Link>
                    </div>
                </div>
            )}

            {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}

            {/* Close dropdown when clicking outside */}
            {showDropdown && <div style={{ position: 'fixed', inset: 0, zIndex: 99 }} onClick={() => setShowDropdown(false)} />}
        </>
    );
}

export default Header;
