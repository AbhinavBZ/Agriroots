import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

function AuthModal({ onClose }) {
    const { login, register } = useAuth();
    const [mode, setMode] = useState('login'); // 'login' | 'register'
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [form, setForm] = useState({
        fullName: '', email: '', password: '', confirmPassword: '',
        phoneNumber: '', farmState: ''
    });

    const handleChange = (e) => {
        setForm(f => ({ ...f, [e.target.name]: e.target.value }));
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            if (mode === 'login') {
                await login(form.email, form.password);
                setSuccess('Welcome back!');
                setTimeout(() => onClose(), 800);
            } else {
                if (form.password !== form.confirmPassword) {
                    setError('Passwords do not match.');
                    setLoading(false);
                    return;
                }
                await register({ fullName: form.fullName, email: form.email, password: form.password, phoneNumber: form.phoneNumber, farmState: form.farmState });
                setSuccess('Account created! Welcome to AgriRoots.');
                setTimeout(() => onClose(), 800);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center', backdropFilter: 'blur(4px)' }} onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div style={{ background: 'white', borderRadius: '20px', padding: '3rem 2.5rem', width: '100%', maxWidth: '460px', boxShadow: '0 25px 60px rgba(0,0,0,0.2)', position: 'relative', animation: 'slideUp 0.3s ease' }}>

                {/* Close Button */}
                <button onClick={onClose} style={{ position: 'absolute', top: '1.2rem', right: '1.2rem', background: 'none', border: 'none', fontSize: '1.4rem', cursor: 'pointer', color: '#999', lineHeight: 1 }}>✕</button>

                {/* Logo */}
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{ width: '60px', height: '60px', background: 'linear-gradient(135deg,#1f4037,#4caf50)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                        <i className="fa-solid fa-leaf" style={{ color: 'white', fontSize: '1.5rem' }}></i>
                    </div>
                    <h2 style={{ fontSize: '1.8rem', color: '#1f4037', fontWeight: 700, margin: 0 }}>{mode === 'login' ? 'Welcome Back' : 'Join AgriRoots'}</h2>
                    <p style={{ color: '#888', marginTop: '0.4rem', fontSize: '0.95rem' }}>{mode === 'login' ? 'Log in to your farmer account' : 'Create a free account today'}</p>
                </div>

                {/* Tab Toggle */}
                <div style={{ display: 'flex', background: '#f5f5f5', borderRadius: '10px', padding: '4px', marginBottom: '1.8rem' }}>
                    {['login', 'register'].map(m => (
                        <button key={m} onClick={() => { setMode(m); setError(''); setSuccess(''); }}
                            style={{ flex: 1, padding: '0.7rem', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '0.95rem', transition: 'all 0.2s', background: mode === m ? '#1f4037' : 'transparent', color: mode === m ? 'white' : '#666' }}>
                            {m === 'login' ? 'Login' : 'Register'}
                        </button>
                    ))}
                </div>

                {/* Alerts */}
                {error && <div style={{ background: '#ffebee', color: '#c62828', padding: '0.8rem 1rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.9rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}><i className="fa-solid fa-circle-exclamation"></i> {error}</div>}
                {success && <div style={{ background: '#e8f5e9', color: '#2e7d32', padding: '0.8rem 1rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.9rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}><i className="fa-solid fa-circle-check"></i> {success}</div>}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {mode === 'register' && (
                        <input name="fullName" value={form.fullName} onChange={handleChange} placeholder="Full Name" required
                            style={{ padding: '0.9rem 1.1rem', border: '2px solid #eee', borderRadius: '10px', fontSize: '0.95rem', outline: 'none', transition: 'border 0.2s' }}
                            onFocus={e => e.target.style.borderColor = '#4caf50'} onBlur={e => e.target.style.borderColor = '#eee'} />
                    )}
                    <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="Email Address" required
                        style={{ padding: '0.9rem 1.1rem', border: '2px solid #eee', borderRadius: '10px', fontSize: '0.95rem', outline: 'none' }}
                        onFocus={e => e.target.style.borderColor = '#4caf50'} onBlur={e => e.target.style.borderColor = '#eee'} />
                    <input name="password" type="password" value={form.password} onChange={handleChange} placeholder="Password" required
                        style={{ padding: '0.9rem 1.1rem', border: '2px solid #eee', borderRadius: '10px', fontSize: '0.95rem', outline: 'none' }}
                        onFocus={e => e.target.style.borderColor = '#4caf50'} onBlur={e => e.target.style.borderColor = '#eee'} />
                    {mode === 'register' && (<>
                        <input name="confirmPassword" type="password" value={form.confirmPassword} onChange={handleChange} placeholder="Confirm Password" required
                            style={{ padding: '0.9rem 1.1rem', border: '2px solid #eee', borderRadius: '10px', fontSize: '0.95rem', outline: 'none' }}
                            onFocus={e => e.target.style.borderColor = '#4caf50'} onBlur={e => e.target.style.borderColor = '#eee'} />
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <input name="phoneNumber" value={form.phoneNumber} onChange={handleChange} placeholder="Phone (optional)"
                                style={{ padding: '0.9rem 1.1rem', border: '2px solid #eee', borderRadius: '10px', fontSize: '0.95rem', outline: 'none' }}
                                onFocus={e => e.target.style.borderColor = '#4caf50'} onBlur={e => e.target.style.borderColor = '#eee'} />
                            <input name="farmState" value={form.farmState} onChange={handleChange} placeholder="State (optional)"
                                style={{ padding: '0.9rem 1.1rem', border: '2px solid #eee', borderRadius: '10px', fontSize: '0.95rem', outline: 'none' }}
                                onFocus={e => e.target.style.borderColor = '#4caf50'} onBlur={e => e.target.style.borderColor = '#eee'} />
                        </div>
                    </>)}

                    <button type="submit" disabled={loading}
                        style={{ padding: '1rem', background: loading ? '#ccc' : 'linear-gradient(135deg,#1f4037,#4caf50)', color: 'white', border: 'none', borderRadius: '10px', fontSize: '1rem', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', marginTop: '0.5rem', transition: 'transform 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                        onMouseOver={e => !loading && (e.target.style.transform = 'translateY(-2px)')}
                        onMouseOut={e => e.target.style.transform = 'translateY(0)'}>
                        {loading ? <><i className="fa-solid fa-spinner fa-spin"></i> Please wait...</> : (mode === 'login' ? 'Login to Account' : 'Create Account')}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default AuthModal;
