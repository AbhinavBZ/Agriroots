import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import CropGuide from '../components/CropGuide';
import WeatherReport from '../components/WeatherReport';
import { api } from '../api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

function ServiceDetail() {
    const { serviceId } = useParams();
    const { user } = useAuth();
    const { addToCart } = useCart();
    const [loading, setLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState('All');
    const [shopItems, setShopItems] = useState([]);
    const [marketPrices, setMarketPrices] = useState([]);
    const [marketMeta, setMarketMeta] = useState({ source: 'fallback', fetched_at: null });
    const [marketFilter, setMarketFilter] = useState('');
    const [mspData, setMspData] = useState([]);
    const [mspMeta, setMspMeta] = useState({ source: 'fallback', fetched_at: null });
    const [mspFilter, setMspFilter] = useState('');
    const [cropProduction, setCropProduction] = useState([]);
    const [cropMeta, setCropMeta] = useState({ source: 'fallback', fetched_at: null });
    const [cropFilter, setCropFilter] = useState('');
    const [fertData, setFertData] = useState([]);
    const [fertMeta, setFertMeta] = useState({ source: 'fallback', fetched_at: null });
    const [pmkisanData, setPmkisanData] = useState([]);
    const [pmkisanMeta, setPmkisanMeta] = useState({ source: 'fallback', fetched_at: null });
    const [toast, setToast] = useState('');
    const [insForm, setInsForm] = useState({ full_name: '', phone: '', farm_address: '' });
    const [insSubmitting, setInsSubmitting] = useState(false);
    const [insSuccess, setInsSuccess] = useState(false);

    const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

    const ServiceConfigs = {
        'crops': { title: 'Crop Encyclopedia & Guide', icon: 'fa-seedling', description: 'A comprehensive, interactive guide on crop cycles, diseases, seasonal weather patterns, and highly profitable crop varieties.', type: 'crop_guide', bgColor: '#e8f5e9' },
        'organic': { title: 'Organic Farming Methods', icon: 'fa-leaf', description: 'Discover chemical-free farming methods that preserve soil health and produce premium quality organic produce.', type: 'info', bgColor: '#f1f8e9', features: ['Composting Techniques', 'Natural Pest Repellents', 'Crop Rotation Planning', 'Soil Health Management', 'Water Conservation', 'Indigenous Seed Saving'] },
        'agri-inputs': { title: 'Agri-Inputs & Tools', icon: 'fa-store', description: 'Your one-stop shop for Farming Equipment, Seeds, Fertilizers, Pesticides, and Weed Control solutions.', type: 'shop', bgColor: '#e8f5e9', categories: ['All', 'Tools', 'Seeds', 'Fertilizers', 'Weed Control', 'Pesticides'] },
        'insurance': { title: 'Crop Insurance (PMFBY)', icon: 'fa-shield-halved', description: 'Protect your agricultural investments against natural calamities, pests, and unexpected weather failures.', type: 'booking', bgColor: '#ffebee', formTitle: 'Apply for Crop Insurance' },
        'market': { title: 'Live Market Mandi Prices', icon: 'fa-chart-line', description: 'Stay updated with the real-time commodity rates across major regional Mandis to negotiate better prices.', type: 'market', bgColor: '#fff8e1' },
        'msp': { title: 'Minimum Support Price (MSP)', icon: 'fa-file-invoice-dollar', description: 'Check the latest government-mandated Minimum Support Prices before deciding to sell your harvest.', type: 'msp', bgColor: '#e0f2f1' },
        'weather': { title: 'Agricultural Weather Forecast', icon: 'fa-cloud-sun-rain', description: 'Accurate, localized weather forecasts and extreme condition alerts customized for farmers.', type: 'weather', bgColor: '#e1f5fe' },
        'phtest': { title: 'Soil pH Testing', icon: 'fa-flask', description: 'Test your soil pH and get expert fertilizer recommendations tailored to your land.', type: 'info', bgColor: '#f3e5f5', features: ['pH Level Analysis', 'NPK Testing', 'Micronutrient Report', 'Expert Fertilizer Schedule', 'Soil Organic Matter Check', 'Home Collection Available'] },
        'crop-stats': { title: 'National Crop Production Stats', icon: 'fa-chart-bar', description: 'State-wise area, production and yield data for all major crops sourced live from the Government of India.', type: 'crop-stats', bgColor: '#e8f5e9' },
        'fertilizer': { title: 'Fertilizer Availability', icon: 'fa-sack-xmark', description: 'State-wise fertilizer requirement vs availability data to plan your inputs efficiently.', type: 'fertilizer', bgColor: '#fff3e0' },
        'govt-schemes': { title: 'PM-KISAN Beneficiary Data', icon: 'fa-landmark', description: 'State-wise PM-KISAN scheme beneficiary count and installment data sourced live from data.gov.in.', type: 'govt-schemes', bgColor: '#ede7f6' },
    };

    const config = ServiceConfigs[serviceId] || { title: 'Service Not Found', icon: 'fa-circle-exclamation', description: '', type: 'error', bgColor: '#fff' };

    useEffect(() => {
        window.scrollTo(0, 0);
        document.title = `${config?.title || 'Service'} | AgriRoots`;
        async function loadData() {
            setLoading(true);
            try {
                if (serviceId === 'agri-inputs') {
                    const items = await api.shop.getItems();
                    setShopItems(items);
                } else if (serviceId === 'market') {
                    const res = await api.market.getPrices();
                    if (Array.isArray(res)) {
                        setMarketPrices(res);
                    } else {
                        setMarketPrices(res.data || []);
                        setMarketMeta({ source: res.source || 'fallback', fetched_at: res.fetched_at || null });
                    }
                } else if (serviceId === 'msp') {
                    const res = await api.market.getMsp();
                    if (Array.isArray(res)) {
                        setMspData(res);
                    } else {
                        setMspData(res.data || []);
                        setMspMeta({ source: res.source || 'fallback', fetched_at: res.fetched_at || null });
                    }
                } else if (serviceId === 'crop-stats') {
                    const res = await api.market.getCropProduction();
                    setCropProduction(res.data || []);
                    setCropMeta({ source: res.source || 'fallback', fetched_at: res.fetched_at || null });
                } else if (serviceId === 'fertilizer') {
                    const res = await api.market.getFertilizerAvailability();
                    setFertData(res.data || []);
                    setFertMeta({ source: res.source || 'fallback', fetched_at: res.fetched_at || null });
                } else if (serviceId === 'govt-schemes') {
                    const res = await api.market.getPmkisanStats();
                    setPmkisanData(res.data || []);
                    setPmkisanMeta({ source: res.source || 'fallback', fetched_at: res.fetched_at || null });
                }
            } catch (err) {
                console.error(err);
            }
            setTimeout(() => setLoading(false), 300);
        }
        loadData();
    }, [serviceId, config?.title]);

    const handleAddToCart = async (item) => {
        if (!user) { showToast('⚠️ Please login to add items to cart.'); return; }
        try {
            await addToCart(item.id, 1);
            showToast(`✅ "${item.name}" added to cart!`);
        } catch (err) {
            console.error(err);
            showToast('❌ Failed to add to cart.');
        }
    };

    const handleInsuranceSubmit = async (e) => {
        e.preventDefault();
        setInsSubmitting(true);
        try {
            await api.insurance.apply({ ...insForm, user_id: user?.id || null });
            setInsSuccess(true);
        } catch (err) {
            showToast('❌ ' + (err.message || 'Submission failed.'));
        } finally {
            setInsSubmitting(false);
        }
    };

    const filteredShopItems = activeCategory === 'All' ? shopItems : shopItems.filter(i => i.tag === activeCategory);

    if (loading) {
        return (
            <div style={{ height: '80vh', display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', gap: '1rem' }}>
                <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '2.5rem', color: '#4caf50' }}></i>
                <p style={{ color: '#888' }}>Loading...</p>
            </div>
        );
    }

    return (
        <div className="page-container" style={{ padding: '6rem 5%', minHeight: '80vh', backgroundColor: '#f9fbf9' }}>
            {toast && (
                <div style={{ position: 'fixed', top: '5rem', right: '2rem', background: '#1f4037', color: 'white', padding: '1rem 1.5rem', borderRadius: '10px', zIndex: 9999, boxShadow: '0 5px 20px rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {toast}
                </div>
            )}

            {/* Service Header */}
            <div style={{ backgroundColor: config.bgColor, padding: '4rem 2rem', borderRadius: '20px', textAlign: 'center', marginBottom: '3rem', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
                <i className={`fa-solid ${config.icon}`} style={{ fontSize: '4rem', color: '#388e3c', marginBottom: '1.5rem' }}></i>
                <h1 style={{ fontSize: '2.5rem', color: '#1f4037', marginBottom: '1rem', fontWeight: 600 }}>{config.title}</h1>
                <p style={{ color: '#555', fontSize: '1rem', maxWidth: '700px', margin: '0 auto', lineHeight: '1.6' }}>{config.description}</p>
            </div>

            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

                {/* CROP GUIDE */}
                {config.type === 'crop_guide' && <CropGuide />}

                {/* SHOP VIEW */}
                {config.type === 'shop' && (
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                            <h2 style={{ color: '#1f4037', fontSize: '2rem' }}>Available Products</h2>
                            <span style={{ background: '#e8f5e9', color: '#388e3c', padding: '0.4rem 1rem', borderRadius: '20px', fontWeight: 600, fontSize: '0.9rem' }}>{filteredShopItems.length} items</span>
                        </div>
                        <div style={{ display: 'flex', gap: '0.8rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
                            {config.categories.map(cat => (
                                <button key={cat} onClick={() => setActiveCategory(cat)}
                                    style={{ padding: '0.6rem 1.5rem', borderRadius: '20px', border: 'none', backgroundColor: activeCategory === cat ? '#4caf50' : '#e8f5e9', color: activeCategory === cat ? 'white' : '#4caf50', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.3s' }}>
                                    {cat}
                                </button>
                            ))}
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '2rem' }}>
                            {filteredShopItems.map(item => (
                                <div key={item.id} style={{ backgroundColor: 'white', border: '1px solid #eee', borderRadius: '15px', overflow: 'hidden', transition: 'transform 0.3s, box-shadow 0.3s', boxShadow: '0 5px 15px rgba(0,0,0,0.03)' }}
                                    onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = '0 15px 35px rgba(0,0,0,0.1)'; }}
                                    onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 5px 15px rgba(0,0,0,0.03)'; }}>
                                    <div style={{ height: '180px', backgroundColor: '#f5f5f5', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                        <i className={`fa-solid ${item.icon}`} style={{ fontSize: '4rem', color: '#a5d6a7' }}></i>
                                    </div>
                                    <div style={{ padding: '1.5rem' }}>
                                        <span style={{ display: 'inline-block', padding: '0.3rem 0.8rem', backgroundColor: '#e8f5e9', color: '#4caf50', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.8rem' }}>{item.tag}</span>
                                        <h3 style={{ fontSize: '1.1rem', color: '#333', marginBottom: '0.5rem', lineHeight: '1.4' }}>{item.name}</h3>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.2rem' }}>
                                            <span style={{ fontSize: '1.3rem', fontWeight: 700, color: '#1f4037' }}>{item.price}</span>
                                            <button onClick={() => handleAddToCart(item)}
                                                style={{ backgroundColor: '#a7e608', color: '#1f4037', border: 'none', padding: '0.6rem 1.2rem', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem', transition: 'all 0.2s' }}
                                                onMouseOver={e => e.currentTarget.style.background = '#8bc34a'}
                                                onMouseOut={e => e.currentTarget.style.background = '#a7e608'}>
                                                <i className="fa-solid fa-cart-plus"></i> Add
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* INFO VIEW */}
                {config.type === 'info' && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3rem' }}>
                        <div style={{ flex: '1 1 50%', backgroundColor: 'white', padding: '3rem', borderRadius: '15px', boxShadow: '0 5px 20px rgba(0,0,0,0.05)' }}>
                            <h2 style={{ fontSize: '2rem', color: '#388e3c', marginBottom: '1.5rem' }}>Key Benefits</h2>
                            <ul style={{ listStyle: 'none', padding: 0 }}>
                                {config.features?.map((feature, idx) => (
                                    <li key={idx} style={{ marginBottom: '1.2rem', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '1rem', color: '#444' }}>
                                        <i className="fa-solid fa-circle-check" style={{ color: '#8bc34a', fontSize: '1.3rem' }}></i> {feature}
                                    </li>
                                ))}
                            </ul>
                            <Link to="/#guide" style={{ display: 'inline-block', marginTop: '2rem', padding: '1rem 2rem', backgroundColor: '#4caf50', color: 'white', textDecoration: 'none', borderRadius: '10px', fontWeight: 600 }}>
                                Read Detailed Guides
                            </Link>
                        </div>
                        <div style={{ flex: '1 1 40%', backgroundColor: '#1f4037', padding: '3rem', borderRadius: '15px', color: 'white', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
                            <i className="fa-solid fa-headset" style={{ fontSize: '4rem', color: '#a7e608', marginBottom: '1.5rem' }}></i>
                            <h2 style={{ marginBottom: '1rem' }}>Need Expert Advice?</h2>
                            <p style={{ opacity: 0.8, marginBottom: '2rem' }}>Our agronomy experts are available 24/7 to help you implement these strategies effectively.</p>
                            <button style={{ backgroundColor: '#a7e608', color: '#1f4037', border: 'none', padding: '1rem 2rem', borderRadius: '30px', fontSize: '1.1rem', fontWeight: 700, cursor: 'pointer' }}>Contact an Expert</button>
                        </div>
                    </div>
                )}

                {/* INSURANCE BOOKING */}
                {config.type === 'booking' && (
                    <div style={{ maxWidth: '700px', margin: '0 auto', backgroundColor: 'white', padding: '3rem', borderRadius: '15px', boxShadow: '0 10px 30px rgba(0,0,0,0.08)' }}>
                        {insSuccess ? (
                            <div style={{ textAlign: 'center', padding: '2rem' }}>
                                <i className="fa-solid fa-circle-check" style={{ fontSize: '4rem', color: '#4caf50', marginBottom: '1rem' }}></i>
                                <h2 style={{ color: '#1f4037', marginBottom: '1rem' }}>Application Submitted!</h2>
                                <p style={{ color: '#666' }}>Your crop insurance application has been received. Our team will contact you within 2-3 business days.</p>
                            </div>
                        ) : (
                            <>
                                <h2 style={{ fontSize: '2rem', color: '#1f4037', marginBottom: '2rem', textAlign: 'center' }}>{config.formTitle}</h2>
                                <form onSubmit={handleInsuranceSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                            <label style={{ fontWeight: 600, color: '#444' }}>Full Name</label>
                                            <input type="text" defaultValue={user?.fullName || ''} onChange={e => setInsForm(f => ({ ...f, full_name: e.target.value }))} placeholder="John Doe" required style={{ padding: '1rem', border: '1px solid #ccc', borderRadius: '8px', outline: 'none' }} onFocus={e => e.target.style.borderColor = '#4caf50'} onBlur={e => e.target.style.borderColor = '#ccc'} />
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                            <label style={{ fontWeight: 600, color: '#444' }}>Phone Number</label>
                                            <input type="text" defaultValue={user?.phoneNumber || ''} onChange={e => setInsForm(f => ({ ...f, phone: e.target.value }))} placeholder="+91 9876543210" required style={{ padding: '1rem', border: '1px solid #ccc', borderRadius: '8px', outline: 'none' }} onFocus={e => e.target.style.borderColor = '#4caf50'} onBlur={e => e.target.style.borderColor = '#ccc'} />
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                        <label style={{ fontWeight: 600, color: '#444' }}>Farm Location / Address</label>
                                        <textarea rows="3" onChange={e => setInsForm(f => ({ ...f, farm_address: e.target.value }))} placeholder="Enter your complete farm address" required style={{ padding: '1rem', border: '1px solid #ccc', borderRadius: '8px', resize: 'vertical', outline: 'none' }} onFocus={e => e.target.style.borderColor = '#4caf50'} onBlur={e => e.target.style.borderColor = '#ccc'}></textarea>
                                    </div>
                                    <button type="submit" disabled={insSubmitting}
                                        style={{ padding: '1.2rem', backgroundColor: insSubmitting ? '#ccc' : '#4caf50', color: 'white', border: 'none', borderRadius: '8px', fontSize: '1.1rem', fontWeight: 700, cursor: insSubmitting ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                                        {insSubmitting ? <><i className="fa-solid fa-spinner fa-spin"></i> Submitting...</> : 'Submit Application'}
                                    </button>
                                </form>
                            </>
                        )}
                    </div>
                )}

                {/* MARKET PRICES VIEW */}
                {config.type === 'market' && (() => {
                    const filtered = marketPrices.filter(row =>
                        !marketFilter || row.commodity.toLowerCase().includes(marketFilter.toLowerCase())
                    );
                    const isLive = marketMeta.source === 'live';
                    const fetchedLabel = marketMeta.fetched_at
                        ? new Date(marketMeta.fetched_at).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
                        : 'Seed Data';
                    return (
                        <div style={{ backgroundColor: 'white', borderRadius: '15px', overflow: 'hidden', boxShadow: '0 5px 20px rgba(0,0,0,0.05)' }}>
                            {/* Table Header */}
                            <div style={{ padding: '1.5rem 2rem', backgroundColor: '#388e3c', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.8rem' }}>
                                <h2 style={{ fontSize: '1.5rem', fontWeight: 500, margin: 0 }}>Live Mandi Rates</h2>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', flexWrap: 'wrap' }}>
                                    <span style={{
                                        fontSize: '0.8rem', fontWeight: 700, padding: '0.3rem 0.75rem', borderRadius: '20px',
                                        backgroundColor: isLive ? '#a7e608' : '#ffd54f',
                                        color: isLive ? '#1f4037' : '#5d4037'
                                    }}>
                                        {isLive ? '🟢 LIVE' : '🟡 Cached'}
                                    </span>
                                    <span style={{ fontSize: '0.85rem', opacity: 0.85 }}>
                                        <i className="fa-solid fa-clock" style={{ marginRight: '0.3rem' }}></i>
                                        {fetchedLabel}
                                    </span>
                                </div>
                            </div>

                            {/* Search / Filter */}
                            <div style={{ padding: '1rem 2rem', borderBottom: '1px solid #f0f0f0', backgroundColor: '#fafff9' }}>
                                <div style={{ position: 'relative', maxWidth: '360px' }}>
                                    <i className="fa-solid fa-magnifying-glass" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#aaa' }}></i>
                                    <input
                                        type="text"
                                        placeholder="Search commodity (e.g. Wheat, Tomato)…"
                                        value={marketFilter}
                                        onChange={e => setMarketFilter(e.target.value)}
                                        style={{ width: '100%', padding: '0.65rem 1rem 0.65rem 2.4rem', border: '1px solid #ddd', borderRadius: '8px', outline: 'none', fontSize: '0.9rem', boxSizing: 'border-box' }}
                                        onFocus={e => e.target.style.borderColor = '#4caf50'}
                                        onBlur={e => e.target.style.borderColor = '#ddd'}
                                    />
                                </div>
                            </div>

                            {/* Table */}
                            {filtered.length === 0 ? (
                                <div style={{ padding: '3rem', textAlign: 'center', color: '#999' }}>
                                    <i className="fa-solid fa-circle-info" style={{ fontSize: '2rem', marginBottom: '0.8rem', display: 'block' }}></i>
                                    No results found for &ldquo;{marketFilter}&rdquo;
                                </div>
                            ) : (
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead><tr style={{ backgroundColor: '#f1f8e9' }}>
                                        <th style={{ padding: '1rem 1.5rem', textAlign: 'left', color: '#1f4037', fontSize: '0.95rem' }}>Commodity</th>
                                        <th style={{ padding: '1rem 1.5rem', textAlign: 'left', color: '#1f4037', fontSize: '0.95rem' }}>Mandi Location</th>
                                        <th style={{ padding: '1rem 1.5rem', textAlign: 'right', color: '#1f4037', fontSize: '0.95rem' }}>Modal Price</th>
                                        <th style={{ padding: '1rem 1.5rem', textAlign: 'right', color: '#1f4037', fontSize: '0.95rem' }}>Change</th>
                                    </tr></thead>
                                    <tbody>
                                        {filtered.map((row, idx) => {
                                            const changeVal = row.change_percent;
                                            const isNA = !changeVal || changeVal === 'N/A';
                                            const isUp = !isNA && changeVal.startsWith('+');
                                            return (
                                                <tr key={idx} style={{ borderBottom: '1px solid #f0f0f0', backgroundColor: idx % 2 === 0 ? 'white' : '#fafff9' }}>
                                                    <td style={{ padding: '1.1rem 1.5rem', fontWeight: 600, color: '#333' }}>{row.commodity}</td>
                                                    <td style={{ padding: '1.1rem 1.5rem', color: '#666', fontSize: '0.9rem' }}>{row.mandi}</td>
                                                    <td style={{ padding: '1.1rem 1.5rem', textAlign: 'right', fontWeight: 700, color: '#1f4037' }}>{row.price_per_quintal}</td>
                                                    <td style={{ padding: '1.1rem 1.5rem', textAlign: 'right' }}>
                                                        {isNA ? (
                                                            <span style={{ color: '#999', fontSize: '0.85rem' }}>—</span>
                                                        ) : (
                                                            <span style={{ color: isUp ? '#2e7d32' : '#c62828', fontWeight: 600, background: isUp ? '#e8f5e9' : '#ffebee', padding: '0.2rem 0.7rem', borderRadius: '20px', fontSize: '0.85rem' }}>
                                                                {isUp ? '▲' : '▼'} {changeVal}
                                                            </span>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            )}

                            {/* Footer note when live */}
                            {isLive && (
                                <div style={{ padding: '0.8rem 2rem', borderTop: '1px solid #f0f0f0', backgroundColor: '#f9fbf9', fontSize: '0.8rem', color: '#888', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                    <i className="fa-solid fa-circle-info"></i>
                                    Prices sourced live from <strong style={{ color: '#388e3c' }}>AGMARKNET / data.gov.in</strong> · Modal (most common transaction) price shown · Cache refreshes every 30 min
                                </div>
                            )}
                        </div>
                    );
                })()}

                {/* MSP VIEW */}
                {config.type === 'msp' && (() => {
                    const isLive = mspMeta.source === 'live';
                    const fetchedLabel = mspMeta.fetched_at
                        ? new Date(mspMeta.fetched_at).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
                        : 'Seed Data';
                    const filtered = mspData.filter(row =>
                        !mspFilter || (row.crop || '').toLowerCase().includes(mspFilter.toLowerCase())
                    );
                    return (
                        <div style={{ backgroundColor: 'white', borderRadius: '15px', overflow: 'hidden', boxShadow: '0 5px 20px rgba(0,0,0,0.05)' }}>
                            <div style={{ padding: '1.5rem 2rem', backgroundColor: '#00695c', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.8rem' }}>
                                <h2 style={{ fontSize: '1.5rem', fontWeight: 500, margin: 0 }}>MSP Comparison 2024 vs 2025</h2>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', flexWrap: 'wrap' }}>
                                    <span style={{ fontSize: '0.8rem', fontWeight: 700, padding: '0.3rem 0.75rem', borderRadius: '20px', backgroundColor: isLive ? '#a7e608' : '#ffd54f', color: isLive ? '#1f4037' : '#5d4037' }}>
                                        {isLive ? '🟢 LIVE' : '🗄️ Seeded'}
                                    </span>
                                    <span style={{ fontSize: '0.85rem', opacity: 0.85 }}>
                                        <i className="fa-solid fa-clock" style={{ marginRight: '0.3rem' }}></i>{fetchedLabel}
                                    </span>
                                </div>
                            </div>
                            <div style={{ padding: '1rem 2rem', borderBottom: '1px solid #f0f0f0', backgroundColor: '#f4fffe' }}>
                                <div style={{ position: 'relative', maxWidth: '360px' }}>
                                    <i className="fa-solid fa-magnifying-glass" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#aaa' }}></i>
                                    <input type="text" placeholder="Search crop…" value={mspFilter} onChange={e => setMspFilter(e.target.value)}
                                        style={{ width: '100%', padding: '0.65rem 1rem 0.65rem 2.4rem', border: '1px solid #ddd', borderRadius: '8px', outline: 'none', fontSize: '0.9rem', boxSizing: 'border-box' }}
                                        onFocus={e => e.target.style.borderColor = '#00897b'} onBlur={e => e.target.style.borderColor = '#ddd'} />
                                </div>
                            </div>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead><tr style={{ backgroundColor: '#e0f2f1' }}>
                                    <th style={{ padding: '1rem 1.5rem', textAlign: 'left', color: '#00695c' }}>Crop</th>
                                    <th style={{ padding: '1rem 1.5rem', textAlign: 'left', color: '#00695c' }}>Season</th>
                                    <th style={{ padding: '1rem 1.5rem', textAlign: 'right', color: '#00695c' }}>MSP 2024</th>
                                    <th style={{ padding: '1rem 1.5rem', textAlign: 'right', color: '#00695c' }}>MSP 2025</th>
                                    <th style={{ padding: '1rem 1.5rem', textAlign: 'right', color: '#00695c' }}>Change</th>
                                </tr></thead>
                                <tbody>
                                    {filtered.map((row, idx) => {
                                        const chg = row.change_percent;
                                        const chgUp = chg && chg.startsWith('+');
                                        return (
                                            <tr key={row.id || idx} style={{ borderBottom: '1px solid #f0f0f0', backgroundColor: idx % 2 === 0 ? 'white' : '#f4fffe' }}>
                                                <td style={{ padding: '1.1rem 1.5rem', fontWeight: 600, color: '#333' }}>{row.crop}</td>
                                                <td style={{ padding: '1.1rem 1.5rem', color: '#666', fontSize: '0.9rem' }}>{row.season}</td>
                                                <td style={{ padding: '1.1rem 1.5rem', textAlign: 'right', color: '#666' }}>{row.msp_2024}</td>
                                                <td style={{ padding: '1.1rem 1.5rem', textAlign: 'right', fontWeight: 700, color: '#00695c' }}>{row.msp_2025}</td>
                                                <td style={{ padding: '1.1rem 1.5rem', textAlign: 'right' }}>
                                                    {(!chg || chg === '—') ? <span style={{ color: '#999' }}>—</span> : (
                                                        <span style={{ color: chgUp ? '#2e7d32' : '#c62828', fontWeight: 600, background: chgUp ? '#e8f5e9' : '#ffebee', padding: '0.2rem 0.7rem', borderRadius: '20px', fontSize: '0.85rem' }}>
                                                            {chgUp ? '▲' : '▼'} {chg}
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                            {isLive && (
                                <div style={{ padding: '0.8rem 2rem', borderTop: '1px solid #f0f0f0', backgroundColor: '#f4fffe', fontSize: '0.8rem', color: '#888' }}>
                                    <i className="fa-solid fa-circle-info" style={{ marginRight: '0.4rem' }}></i>
                                    Data sourced live from <strong style={{ color: '#00695c' }}>data.gov.in</strong> · Ministry of Agriculture &amp; Farmers Welfare · Cache refreshes every 30 min
                                </div>
                            )}
                        </div>
                    );
                })()}

                {/* CROP PRODUCTION STATS */}
                {config.type === 'crop-stats' && (() => {
                    const isLive = cropMeta.source === 'live';
                    const fetchedLabel = cropMeta.fetched_at
                        ? new Date(cropMeta.fetched_at).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
                        : 'Cached';
                    const filtered = cropProduction.filter(r =>
                        !cropFilter || r.state.toLowerCase().includes(cropFilter.toLowerCase()) || r.crop.toLowerCase().includes(cropFilter.toLowerCase())
                    );
                    return (
                        <div style={{ backgroundColor: 'white', borderRadius: '15px', overflow: 'hidden', boxShadow: '0 5px 20px rgba(0,0,0,0.05)' }}>
                            <div style={{ padding: '1.5rem 2rem', backgroundColor: '#2e7d32', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.8rem' }}>
                                <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 500 }}>Area, Production &amp; Yield (APY)</h2>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                                    <span style={{ fontSize: '0.8rem', fontWeight: 700, padding: '0.3rem 0.75rem', borderRadius: '20px', backgroundColor: isLive ? '#a7e608' : '#ffd54f', color: isLive ? '#1f4037' : '#5d4037' }}>
                                        {isLive ? '🟢 LIVE' : '🗄️ Cached'}
                                    </span>
                                    <span style={{ fontSize: '0.85rem', opacity: 0.85 }}><i className="fa-solid fa-clock" style={{ marginRight: '0.3rem' }}></i>{fetchedLabel}</span>
                                </div>
                            </div>
                            <div style={{ padding: '1rem 2rem', borderBottom: '1px solid #f0f0f0', backgroundColor: '#f1f8e9' }}>
                                <div style={{ position: 'relative', maxWidth: '360px' }}>
                                    <i className="fa-solid fa-magnifying-glass" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#aaa' }}></i>
                                    <input type="text" placeholder="Search crop or state…" value={cropFilter} onChange={e => setCropFilter(e.target.value)}
                                        style={{ width: '100%', padding: '0.65rem 1rem 0.65rem 2.4rem', border: '1px solid #ddd', borderRadius: '8px', outline: 'none', fontSize: '0.9rem', boxSizing: 'border-box' }}
                                        onFocus={e => e.target.style.borderColor = '#4caf50'} onBlur={e => e.target.style.borderColor = '#ddd'} />
                                </div>
                            </div>
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead><tr style={{ backgroundColor: '#e8f5e9' }}>
                                        <th style={{ padding: '1rem 1.5rem', textAlign: 'left', color: '#2e7d32' }}>State</th>
                                        <th style={{ padding: '1rem 1.5rem', textAlign: 'left', color: '#2e7d32' }}>Crop</th>
                                        <th style={{ padding: '1rem 1.5rem', textAlign: 'left', color: '#2e7d32' }}>Season</th>
                                        <th style={{ padding: '1rem 1.5rem', textAlign: 'left', color: '#2e7d32' }}>Year</th>
                                        <th style={{ padding: '1rem 1.5rem', textAlign: 'right', color: '#2e7d32' }}>Area (Ha)</th>
                                        <th style={{ padding: '1rem 1.5rem', textAlign: 'right', color: '#2e7d32' }}>Production (MT)</th>
                                        <th style={{ padding: '1rem 1.5rem', textAlign: 'right', color: '#2e7d32' }}>Yield (Kg/Ha)</th>
                                    </tr></thead>
                                    <tbody>
                                        {(filtered.length > 0 ? filtered : cropProduction).map((r, idx) => (
                                            <tr key={idx} style={{ borderBottom: '1px solid #f0f0f0', backgroundColor: idx % 2 === 0 ? 'white' : '#fafff9' }}>
                                                <td style={{ padding: '1rem 1.5rem', fontWeight: 600, color: '#333' }}>{r.state}</td>
                                                <td style={{ padding: '1rem 1.5rem', color: '#555' }}>{r.crop}</td>
                                                <td style={{ padding: '1rem 1.5rem', color: '#888', fontSize: '0.9rem' }}>{r.season}</td>
                                                <td style={{ padding: '1rem 1.5rem', color: '#888', fontSize: '0.9rem' }}>{r.year}</td>
                                                <td style={{ padding: '1rem 1.5rem', textAlign: 'right', color: '#555' }}>{r.area_ha}</td>
                                                <td style={{ padding: '1rem 1.5rem', textAlign: 'right', fontWeight: 700, color: '#2e7d32' }}>{r.production_mt}</td>
                                                <td style={{ padding: '1rem 1.5rem', textAlign: 'right', color: '#1565c0', fontWeight: 600 }}>{r.yield_kgha}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div style={{ padding: '0.8rem 2rem', borderTop: '1px solid #f0f0f0', fontSize: '0.8rem', color: '#888' }}>
                                <i className="fa-solid fa-circle-info" style={{ marginRight: '0.4rem' }}></i>
                                Source: <strong style={{ color: '#2e7d32' }}>data.gov.in</strong> — Area, Production &amp; Yield (APY), Ministry of Agriculture · Cache: 30 min
                            </div>
                        </div>
                    );
                })()}

                {/* FERTILIZER AVAILABILITY */}
                {config.type === 'fertilizer' && (() => {
                    const isLive = fertMeta.source === 'live';
                    const fetchedLabel = fertMeta.fetched_at
                        ? new Date(fertMeta.fetched_at).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
                        : 'Cached';
                    return (
                        <div style={{ backgroundColor: 'white', borderRadius: '15px', overflow: 'hidden', boxShadow: '0 5px 20px rgba(0,0,0,0.05)' }}>
                            <div style={{ padding: '1.5rem 2rem', backgroundColor: '#e65100', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.8rem' }}>
                                <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 500 }}>Fertilizer Requirement vs Availability</h2>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                                    <span style={{ fontSize: '0.8rem', fontWeight: 700, padding: '0.3rem 0.75rem', borderRadius: '20px', backgroundColor: isLive ? '#a7e608' : '#ffd54f', color: isLive ? '#1f4037' : '#5d4037' }}>
                                        {isLive ? '🟢 LIVE' : '🗄️ Cached'}
                                    </span>
                                    <span style={{ fontSize: '0.85rem', opacity: 0.85 }}><i className="fa-solid fa-clock" style={{ marginRight: '0.3rem' }}></i>{fetchedLabel}</span>
                                </div>
                            </div>
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead><tr style={{ backgroundColor: '#fff3e0' }}>
                                        <th style={{ padding: '1rem 1.5rem', textAlign: 'left', color: '#e65100' }}>State</th>
                                        <th style={{ padding: '1rem 1.5rem', textAlign: 'left', color: '#e65100' }}>Fertilizer</th>
                                        <th style={{ padding: '1rem 1.5rem', textAlign: 'right', color: '#e65100' }}>Requirement (MT)</th>
                                        <th style={{ padding: '1rem 1.5rem', textAlign: 'right', color: '#e65100' }}>Availability (MT)</th>
                                        <th style={{ padding: '1rem 1.5rem', textAlign: 'right', color: '#e65100' }}>Balance</th>
                                        <th style={{ padding: '1rem 1.5rem', textAlign: 'left', color: '#e65100' }}>Period</th>
                                    </tr></thead>
                                    <tbody>
                                        {fertData.map((r, idx) => {
                                            const bal = String(r.balance);
                                            const pos = bal.startsWith('+') || (parseFloat(bal) > 0);
                                            const neg = bal.startsWith('-') || (parseFloat(bal) < 0);
                                            return (
                                                <tr key={idx} style={{ borderBottom: '1px solid #f0f0f0', backgroundColor: idx % 2 === 0 ? 'white' : '#fff8f3' }}>
                                                    <td style={{ padding: '1rem 1.5rem', fontWeight: 600, color: '#333' }}>{r.state}</td>
                                                    <td style={{ padding: '1rem 1.5rem', color: '#555' }}>{r.fertilizer}</td>
                                                    <td style={{ padding: '1rem 1.5rem', textAlign: 'right', color: '#666' }}>{r.requirement}</td>
                                                    <td style={{ padding: '1rem 1.5rem', textAlign: 'right', fontWeight: 700, color: '#2e7d32' }}>{r.availability}</td>
                                                    <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                                                        <span style={{ fontWeight: 700, color: pos ? '#2e7d32' : neg ? '#c62828' : '#888', background: pos ? '#e8f5e9' : neg ? '#ffebee' : '#f5f5f5', padding: '0.2rem 0.7rem', borderRadius: '20px', fontSize: '0.85rem' }}>
                                                            {pos ? '▲' : neg ? '▼' : '='} {r.balance}
                                                        </span>
                                                    </td>
                                                    <td style={{ padding: '1rem 1.5rem', color: '#888', fontSize: '0.88rem' }}>{r.month}</td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                            <div style={{ padding: '0.8rem 2rem', borderTop: '1px solid #f0f0f0', fontSize: '0.8rem', color: '#888' }}>
                                <i className="fa-solid fa-circle-info" style={{ marginRight: '0.4rem' }}></i>
                                Source: <strong style={{ color: '#e65100' }}>data.gov.in</strong> — Ministry of Chemicals &amp; Fertilizers · Quantities in metric tons
                            </div>
                        </div>
                    );
                })()}

                {/* PM-KISAN GOVT SCHEMES */}
                {config.type === 'govt-schemes' && (() => {
                    const isLive = pmkisanMeta.source === 'live';
                    const fetchedLabel = pmkisanMeta.fetched_at
                        ? new Date(pmkisanMeta.fetched_at).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
                        : 'Cached';
                    return (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                            <div style={{ backgroundColor: 'white', borderRadius: '15px', overflow: 'hidden', boxShadow: '0 5px 20px rgba(0,0,0,0.05)' }}>
                                <div style={{ padding: '1.5rem 2rem', background: 'linear-gradient(135deg,#4527a0,#7b1fa2)', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.8rem' }}>
                                    <div>
                                        <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 500 }}>PM-KISAN Beneficiary Data</h2>
                                        <p style={{ margin: '0.3rem 0 0', opacity: 0.8, fontSize: '0.88rem' }}>₹6,000/year directly transferred to farmer bank accounts</p>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                                        <span style={{ fontSize: '0.8rem', fontWeight: 700, padding: '0.3rem 0.75rem', borderRadius: '20px', backgroundColor: isLive ? '#a7e608' : '#ffd54f', color: isLive ? '#1f4037' : '#5d4037' }}>
                                            {isLive ? '🟢 LIVE' : '🗄️ Cached'}
                                        </span>
                                        <span style={{ fontSize: '0.85rem', opacity: 0.85 }}><i className="fa-solid fa-clock" style={{ marginRight: '0.3rem' }}></i>{fetchedLabel}</span>
                                    </div>
                                </div>

                                {/* Summary stat cards */}
                                {(() => {
                                    const totalBenef = pmkisanData.reduce((sum, r) => {
                                        const n = parseInt(String(r.total_beneficiaries).replace(/,/g, ''), 10);
                                        return sum + (isNaN(n) ? 0 : n);
                                    }, 0);
                                    return (
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', padding: '1.5rem 2rem', backgroundColor: '#f9f5ff' }}>
                                            <div style={{ background: 'white', borderRadius: '12px', padding: '1.2rem 1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', textAlign: 'center' }}>
                                                <p style={{ color: '#aaa', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Total Beneficiaries (Shown)</p>
                                                <p style={{ fontSize: '1.8rem', fontWeight: 800, color: '#4527a0', margin: '0.3rem 0 0' }}>{totalBenef > 0 ? (totalBenef / 1e6).toFixed(1) + ' Cr' : '—'}</p>
                                            </div>
                                            <div style={{ background: 'white', borderRadius: '12px', padding: '1.2rem 1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', textAlign: 'center' }}>
                                                <p style={{ color: '#aaa', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Instalment Tracked</p>
                                                <p style={{ fontSize: '1.8rem', fontWeight: 800, color: '#4527a0', margin: '0.3rem 0 0' }}>{pmkisanData[0]?.installment ? `#${pmkisanData[0].installment}` : '—'}</p>
                                            </div>
                                            <div style={{ background: 'white', borderRadius: '12px', padding: '1.2rem 1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', textAlign: 'center' }}>
                                                <p style={{ color: '#aaa', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Annual Support</p>
                                                <p style={{ fontSize: '1.8rem', fontWeight: 800, color: '#4527a0', margin: '0.3rem 0 0' }}>₹6,000</p>
                                            </div>
                                        </div>
                                    );
                                })()}

                                <div style={{ overflowX: 'auto' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                        <thead><tr style={{ backgroundColor: '#ede7f6' }}>
                                            <th style={{ padding: '1rem 1.5rem', textAlign: 'left', color: '#4527a0' }}>State</th>
                                            <th style={{ padding: '1rem 1.5rem', textAlign: 'right', color: '#4527a0' }}>Male Beneficiaries</th>
                                            <th style={{ padding: '1rem 1.5rem', textAlign: 'right', color: '#4527a0' }}>Female Beneficiaries</th>
                                            <th style={{ padding: '1rem 1.5rem', textAlign: 'right', color: '#4527a0' }}>Total</th>
                                        </tr></thead>
                                        <tbody>
                                            {pmkisanData.map((r, idx) => (
                                                <tr key={idx} style={{ borderBottom: '1px solid #f0f0f0', backgroundColor: idx % 2 === 0 ? 'white' : '#faf5ff' }}>
                                                    <td style={{ padding: '1rem 1.5rem', fontWeight: 600, color: '#333' }}>{r.state}</td>
                                                    <td style={{ padding: '1rem 1.5rem', textAlign: 'right', color: '#1565c0' }}>{r.beneficiaries_male}</td>
                                                    <td style={{ padding: '1rem 1.5rem', textAlign: 'right', color: '#c2185b' }}>{r.beneficiaries_female}</td>
                                                    <td style={{ padding: '1rem 1.5rem', textAlign: 'right', fontWeight: 700, color: '#4527a0' }}>{r.total_beneficiaries}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                <div style={{ padding: '0.8rem 2rem', borderTop: '1px solid #f0f0f0', fontSize: '0.8rem', color: '#888' }}>
                                    <i className="fa-solid fa-circle-info" style={{ marginRight: '0.4rem' }}></i>
                                    Source: <strong style={{ color: '#7b1fa2' }}>data.gov.in</strong> — PM-KISAN Samman Nidhi, Ministry of Agriculture &amp; Farmers Welfare · Cache: 30 min
                                </div>
                            </div>
                        </div>
                    );
                })()}

                {/* WEATHER VIEW — Live via Open-Meteo + Geolocation */}
                {config.type === 'weather' && <WeatherReport />}

                {/* ERROR */}
                {config.type === 'error' && (
                    <div style={{ textAlign: 'center', padding: '5rem 0' }}>
                        <Link to="/" style={{ padding: '1rem 2rem', backgroundColor: '#4caf50', color: 'white', textDecoration: 'none', borderRadius: '30px', fontWeight: 600 }}>Return to Home</Link>
                    </div>
                )}
            </div>
        </div>
    );
}

export default ServiceDetail;
