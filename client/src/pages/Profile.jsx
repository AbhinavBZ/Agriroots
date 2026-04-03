import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';

function Profile() {
    const { user, logout, refreshUser } = useAuth();
    const navigate = useNavigate();
    const [activeSection, setActiveSection] = useState('farm'); // farm | orders | security
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState('');
    const [form, setForm] = useState(null);

    // Orders state
    const [orders, setOrders] = useState([]);
    const [ordersLoading, setOrdersLoading] = useState(false);

    // Change password state
    const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    const [pwSaving, setPwSaving] = useState(false);

    const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3500); };

    useEffect(() => {
        document.title = 'My Profile | AgriRoots';
    }, []);

    useEffect(() => {
        if (activeSection === 'orders' && user) {
            setOrdersLoading(true);
            api.orders.get()
                .then(data => setOrders(data))
                .catch(() => showToast('❌ Failed to load orders.'))
                .finally(() => setOrdersLoading(false));
        }
    }, [activeSection, user]);

    const startEdit = () => {
        setForm({
            fullName: user?.fullName || '',
            phoneNumber: user?.phoneNumber || '',
            farmState: user?.farmState || '',
            landArea: user?.landArea || '',
            soilType: user?.soilType || '',
            currentCrop: user?.currentCrop || '',
            location: user?.location || '',
        });
        setEditing(true);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await api.auth.updateProfile(form);
            await refreshUser();
            setEditing(false);
            showToast('✅ Profile updated successfully!');
        } catch (err) {
            showToast('❌ ' + (err.message || 'Update failed.'));
        } finally {
            setSaving(false);
        }
    };

    const handleChangePassword = async () => {
        if (pwForm.newPassword !== pwForm.confirmPassword) {
            showToast('❌ New passwords do not match.'); return;
        }
        if (pwForm.newPassword.length < 6) {
            showToast('❌ New password must be at least 6 characters.'); return;
        }
        setPwSaving(true);
        try {
            await api.auth.changePassword({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
            showToast('✅ Password changed successfully!');
            setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (err) {
            showToast('❌ ' + (err.message || 'Failed to change password.'));
        } finally {
            setPwSaving(false);
        }
    };

    const handleLogout = () => { logout(); navigate('/'); };

    if (!user) {
        return (
            <div className="page-container" style={{ padding: '6rem 5%', minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1.5rem' }}>
                <i className="fa-solid fa-lock" style={{ fontSize: '4rem', color: '#ccc' }}></i>
                <h2 style={{ color: '#555', fontSize: '1.8rem' }}>Please Login to View Profile</h2>
                <Link to="/" style={{ padding: '0.9rem 2rem', background: 'linear-gradient(135deg,#1f4037,#4caf50)', color: 'white', borderRadius: '30px', fontWeight: 600, textDecoration: 'none' }}>
                    Go to Home
                </Link>
            </div>
        );
    }

    const inputStyle = { padding: '0.8rem 1rem', border: '2px solid #eee', borderRadius: '8px', fontSize: '0.95rem', outline: 'none', width: '100%', boxSizing: 'border-box' };
    const sideBtnStyle = (active) => ({
        padding: '0.85rem 1rem', borderRadius: '10px', border: 'none', fontSize: '0.9rem',
        fontWeight: active ? 600 : 400, cursor: 'pointer', textAlign: 'left',
        display: 'flex', alignItems: 'center', gap: '0.7rem',
        backgroundColor: active ? '#e8f5e9' : 'transparent',
        color: active ? '#388e3c' : '#666',
        transition: 'all 0.2s',
    });

    return (
        <div className="page-container" style={{ padding: '6rem 5%', minHeight: '80vh', backgroundColor: '#f9fbf9' }}>
            {toast && (
                <div style={{ position: 'fixed', top: '5rem', right: '2rem', background: '#1f4037', color: 'white', padding: '1rem 1.5rem', borderRadius: '10px', zIndex: 9999, boxShadow: '0 5px 20px rgba(0,0,0,0.2)', maxWidth: '340px' }}>
                    {toast}
                </div>
            )}

            <div style={{ maxWidth: '1050px', margin: '0 auto', display: 'flex', gap: '2.5rem', flexWrap: 'wrap' }}>

                {/* ── Left Sidebar ───────────────────────────────────── */}
                <div style={{ flex: '1 1 28%', minWidth: '240px' }}>
                    <div style={{ backgroundColor: 'white', padding: '2.5rem 1.5rem', borderRadius: '15px', boxShadow: '0 5px 20px rgba(0,0,0,0.05)', textAlign: 'center' }}>
                        {/* Avatar */}
                        <div style={{ width: '90px', height: '90px', borderRadius: '50%', background: 'linear-gradient(135deg,#1f4037,#4caf50)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.2rem', fontSize: '2.2rem', color: 'white', fontWeight: 700 }}>
                            {user.fullName?.charAt(0).toUpperCase()}
                        </div>
                        <h2 style={{ fontSize: '1.3rem', color: '#1f4037', marginBottom: '0.3rem', fontWeight: 600 }}>{user.fullName}</h2>
                        <p style={{ color: '#666', fontSize: '0.85rem', marginBottom: '0.3rem' }}>
                            <i className="fa-solid fa-envelope" style={{ color: '#8bc34a', marginRight: '0.4rem' }}></i>{user.email}
                        </p>
                        {user.phoneNumber && (
                            <p style={{ color: '#666', fontSize: '0.85rem', marginBottom: '0.8rem' }}>
                                <i className="fa-solid fa-phone" style={{ color: '#8bc34a', marginRight: '0.4rem' }}></i>{user.phoneNumber}
                            </p>
                        )}
                        <p style={{ display: 'inline-block', padding: '0.3rem 1rem', background: user.membershipType === 'Premium' ? '#fff8e1' : '#e8f5e9', color: user.membershipType === 'Premium' ? '#f57f17' : '#388e3c', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 600, marginBottom: '1.5rem' }}>
                            {user.membershipType === 'Premium' ? '👑' : '🌱'} {user.membershipType} Member
                        </p>

                        {/* Nav buttons */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                            <button onClick={() => setActiveSection('farm')} style={sideBtnStyle(activeSection === 'farm')}>
                                <i className="fa-solid fa-tractor" style={{ width: '16px' }}></i> Farm Details
                            </button>
                            <button onClick={() => setActiveSection('orders')} style={sideBtnStyle(activeSection === 'orders')}>
                                <i className="fa-solid fa-box" style={{ width: '16px' }}></i> My Orders
                            </button>
                            <button onClick={() => setActiveSection('security')} style={sideBtnStyle(activeSection === 'security')}>
                                <i className="fa-solid fa-lock" style={{ width: '16px' }}></i> Security
                            </button>
                            <div style={{ height: '1px', background: '#eee', margin: '0.5rem 0' }}></div>
                            <button onClick={handleLogout} style={{ ...sideBtnStyle(false), color: '#e53935' }}>
                                <i className="fa-solid fa-right-from-bracket" style={{ width: '16px' }}></i> Logout
                            </button>
                        </div>
                    </div>
                </div>

                {/* ── Right Content ───────────────────────────────────── */}
                <div style={{ flex: '1 1 60%', display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                    {/* FARM DETAILS */}
                    {activeSection === 'farm' && (
                        <div style={{ backgroundColor: 'white', padding: '2.5rem', borderRadius: '15px', boxShadow: '0 5px 20px rgba(0,0,0,0.05)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #f1f8e9', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
                                <h3 style={{ fontSize: '1.3rem', color: '#1f4037', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
                                    <i className="fa-solid fa-tractor" style={{ color: '#8bc34a' }}></i> Farm Details
                                </h3>
                                {!editing && (
                                    <button onClick={startEdit} style={{ padding: '0.5rem 1.2rem', background: '#e8f5e9', color: '#388e3c', border: '1px solid #c5e1a5', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}>
                                        <i className="fa-solid fa-pen" style={{ marginRight: '0.4rem' }}></i>Edit
                                    </button>
                                )}
                            </div>
                            {editing ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                        {[['fullName', 'Full Name'], ['phoneNumber', 'Phone Number'], ['farmState', 'Farm State'], ['landArea', 'Land Area (acres)'], ['soilType', 'Soil Type'], ['currentCrop', 'Current Crop'], ['location', 'Location']].map(([key, label]) => (
                                            <div key={key} style={key === 'fullName' || key === 'location' ? { gridColumn: '1/-1' } : {}}>
                                                <label style={{ fontSize: '0.85rem', color: '#888', display: 'block', marginBottom: '0.3rem' }}>{label}</label>
                                                <input value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                                                    style={inputStyle}
                                                    onFocus={e => e.target.style.borderColor = '#4caf50'}
                                                    onBlur={e => e.target.style.borderColor = '#eee'} />
                                            </div>
                                        ))}
                                    </div>
                                    <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                                        <button onClick={() => setEditing(false)} style={{ flex: 1, padding: '0.9rem', background: '#f5f5f5', color: '#666', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                                        <button onClick={handleSave} disabled={saving} style={{ flex: 2, padding: '0.9rem', background: saving ? '#ccc' : 'linear-gradient(135deg,#1f4037,#4caf50)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                                            {saving ? <><i className="fa-solid fa-spinner fa-spin"></i> Saving…</> : 'Save Changes'}
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                    {[['Total Land Area', user.landArea || '— not set'], ['Primary Soil Type', user.soilType || '— not set'], ['Current Crop', user.currentCrop || '— not set'], ['State', user.farmState || '— not set'], ['Location', user.location || '— not set', true]].map(([label, val, full]) => (
                                        <div key={label} style={full ? { gridColumn: '1/-1' } : {}}>
                                            <p style={{ fontSize: '0.85rem', color: '#aaa', marginBottom: '0.3rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</p>
                                            <p style={{ fontSize: '1rem', color: val.startsWith('—') ? '#ccc' : '#333', fontWeight: 500, fontStyle: val.startsWith('—') ? 'italic' : 'normal' }}>{val}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* ORDERS HISTORY */}
                    {activeSection === 'orders' && (
                        <div style={{ backgroundColor: 'white', padding: '2.5rem', borderRadius: '15px', boxShadow: '0 5px 20px rgba(0,0,0,0.05)' }}>
                            <h3 style={{ fontSize: '1.3rem', color: '#1f4037', borderBottom: '2px solid #f1f8e9', paddingBottom: '1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <i className="fa-solid fa-box" style={{ color: '#8bc34a' }}></i> My Orders
                            </h3>
                            {ordersLoading ? (
                                <div style={{ textAlign: 'center', padding: '2rem' }}>
                                    <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '2rem', color: '#4caf50' }}></i>
                                    <p style={{ color: '#888', marginTop: '0.8rem' }}>Loading orders…</p>
                                </div>
                            ) : orders.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '3rem', color: '#bbb' }}>
                                    <i className="fa-solid fa-box-open" style={{ fontSize: '3.5rem', marginBottom: '1rem', display: 'block' }}></i>
                                    <p style={{ fontSize: '1rem', color: '#999' }}>No orders placed yet.</p>
                                    <Link to="/services/agri-inputs" style={{ display: 'inline-block', marginTop: '1rem', padding: '0.7rem 1.8rem', background: '#4caf50', color: 'white', borderRadius: '30px', textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem' }}>
                                        Browse Products
                                    </Link>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                                    {orders.map(order => (
                                        <div key={order.id} style={{ border: '1px solid #f0f0f0', borderRadius: '12px', overflow: 'hidden' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.5rem', backgroundColor: '#fafff9', flexWrap: 'wrap', gap: '0.5rem' }}>
                                                <div>
                                                    <p style={{ fontWeight: 700, color: '#1f4037', fontSize: '0.95rem' }}>Order #{order.id}</p>
                                                    <p style={{ fontSize: '0.8rem', color: '#aaa' }}>{new Date(order.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                                                    <span style={{
                                                        padding: '0.3rem 0.9rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 700,
                                                        background: order.status === 'Delivered' ? '#e8f5e9' : order.status === 'Cancelled' ? '#ffebee' : '#fff8e1',
                                                        color: order.status === 'Delivered' ? '#2e7d32' : order.status === 'Cancelled' ? '#c62828' : '#f57f17'
                                                    }}>
                                                        {order.status === 'Delivered' ? '✅' : order.status === 'Cancelled' ? '❌' : '⏳'} {order.status}
                                                    </span>
                                                    <span style={{ fontWeight: 700, color: '#1f4037', fontSize: '1rem' }}>₹{Number(order.totalAmount).toLocaleString('en-IN')}</span>
                                                </div>
                                            </div>
                                            {order.items && order.items.length > 0 && (
                                                <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid #f0f0f0' }}>
                                                    {order.items.map((item, i) => (
                                                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: '#555', padding: '0.3rem 0', borderBottom: i < order.items.length - 1 ? '1px dashed #f5f5f5' : 'none' }}>
                                                            <span>{item.name} <span style={{ color: '#aaa' }}>× {item.quantity}</span></span>
                                                            <span style={{ fontWeight: 600 }}>₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* SECURITY — Change Password */}
                    {activeSection === 'security' && (
                        <div style={{ backgroundColor: 'white', padding: '2.5rem', borderRadius: '15px', boxShadow: '0 5px 20px rgba(0,0,0,0.05)' }}>
                            <h3 style={{ fontSize: '1.3rem', color: '#1f4037', borderBottom: '2px solid #f1f8e9', paddingBottom: '1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <i className="fa-solid fa-lock" style={{ color: '#8bc34a' }}></i> Change Password
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', maxWidth: '480px' }}>
                                {[['currentPassword', 'Current Password', 'Enter your current password'],
                                ['newPassword', 'New Password', 'At least 6 characters'],
                                ['confirmPassword', 'Confirm New Password', 'Re-enter new password']].map(([key, label, placeholder]) => (
                                    <div key={key}>
                                        <label style={{ fontSize: '0.85rem', color: '#888', display: 'block', marginBottom: '0.4rem', fontWeight: 500 }}>{label}</label>
                                        <input
                                            type="password"
                                            value={pwForm[key]}
                                            placeholder={placeholder}
                                            onChange={e => setPwForm(f => ({ ...f, [key]: e.target.value }))}
                                            style={inputStyle}
                                            onFocus={e => e.target.style.borderColor = '#4caf50'}
                                            onBlur={e => e.target.style.borderColor = '#eee'}
                                        />
                                    </div>
                                ))}
                                <button onClick={handleChangePassword} disabled={pwSaving || !pwForm.currentPassword || !pwForm.newPassword || !pwForm.confirmPassword}
                                    style={{ padding: '1rem', background: pwSaving ? '#ccc' : 'linear-gradient(135deg,#1f4037,#4caf50)', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 700, cursor: pwSaving ? 'not-allowed' : 'pointer', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginTop: '0.5rem', opacity: (!pwForm.currentPassword || !pwForm.newPassword || !pwForm.confirmPassword) ? 0.6 : 1 }}>
                                    {pwSaving ? <><i className="fa-solid fa-spinner fa-spin"></i> Updating…</> : <><i className="fa-solid fa-key"></i> Update Password</>}
                                </button>
                            </div>

                            {/* Account info block */}
                            <div style={{ marginTop: '2.5rem', paddingTop: '2rem', borderTop: '1px solid #f5f5f5' }}>
                                <h4 style={{ color: '#888', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem' }}>Account Info</h4>
                                <p style={{ fontSize: '0.9rem', color: '#666' }}>
                                    Member since: <strong style={{ color: '#333' }}>{new Date(user.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</strong>
                                </p>
                                <p style={{ fontSize: '0.9rem', color: '#666', marginTop: '0.5rem' }}>
                                    Plan: <strong style={{ color: '#388e3c' }}>{user.membershipType}</strong>
                                </p>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}

export default Profile;
