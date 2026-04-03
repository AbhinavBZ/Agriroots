import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';
import phKitImg from '../assets/ph_test_kit.png';
import './PhTestPage.css';

// ── pH Scale bar data ──────────────────────────────────────────
const PH_SCALE = [
    { value: 3, label: '3', color: '#e53935', soil: 'Extremely Acidic', crops: 'Nothing grows' },
    { value: 4, label: '4', color: '#f4511e', soil: 'Strongly Acidic', crops: 'Blueberries, Cranberries' },
    { value: 5, label: '5', color: '#fb8c00', soil: 'Moderately Acidic', crops: 'Potatoes, Tea' },
    { value: 6, label: '6', color: '#fdd835', soil: 'Slightly Acidic', crops: 'Most Vegetables & Fruits' },
    { value: 7, label: '7', color: '#43a047', soil: 'Neutral ✓ Ideal', crops: 'Wheat, Rice, Maize' },
    { value: 8, label: '8', color: '#00acc1', soil: 'Slightly Alkaline', crops: 'Barley, Sorghum, Alfalfa' },
    { value: 9, label: '9', color: '#5e35b1', soil: 'Strongly Alkaline', crops: 'Few crops survive' },
    { value: 10, label: '10', color: '#311b92', soil: 'Extremely Alkaline', crops: 'Nothing grows' },
];

const BENEFITS = [
    {
        icon: 'fa-seedling',
        color: '#4caf50',
        bg: '#e8f5e9',
        title: 'Maximise Crop Yield',
        desc: 'Soil pH directly controls nutrient availability. At optimal pH (6–7), crops absorb up to 3× more phosphorus, iron, and zinc.'
    },
    {
        icon: 'fa-flask',
        color: '#7b1fa2',
        bg: '#f3e5f5',
        title: 'Precise Fertiliser Savings',
        desc: 'Stop wasting money on fertilisers that your soil can\'t utilise. Our report tells you exactly what to add (and skip).'
    },
    {
        icon: 'fa-shield-halved',
        color: '#1565c0',
        bg: '#e3f2fd',
        title: 'Prevent Root Diseases',
        desc: 'Wrong pH creates an environment where harmful fungi & bacteria thrive. A balanced soil is your first line of disease defence.'
    },
    {
        icon: 'fa-leaf',
        color: '#2e7d32',
        bg: '#f1f8e9',
        title: 'Soil Organic Carbon',
        desc: 'Acidic soils destroy beneficial microbes that break down organic matter. Correcting pH restores the microbial ecosystem.'
    },
    {
        icon: 'fa-droplet',
        color: '#0277bd',
        bg: '#e1f5fe',
        title: 'Better Water Retention',
        desc: 'Balanced pH improves soil structure, allowing it to hold 30–40% more water — key for drought resilience.'
    },
    {
        icon: 'fa-chart-line',
        color: '#e65100',
        bg: '#fff3e0',
        title: 'Higher Market Value',
        desc: 'Healthy-soil produce has better size, colour, and nutrition — commanding premium prices at local mandis.'
    },
];

const PROCESS_STEPS = [
    { step: '01', icon: 'fa-calendar-check', title: 'Book Online', desc: 'Fill the booking form with your farm location, land area, and preferred slot. No upfront payment needed.' },
    { step: '02', icon: 'fa-truck-fast', title: 'Home Collection', desc: 'Our trained technician visits your farm and collects soil samples from multiple points using professional equipment.' },
    { step: '03', icon: 'fa-microscope', title: 'Lab Analysis', desc: 'Samples are analysed in our NABL-accredited lab for pH, NPK, micronutrients, and organic matter content within 48 hrs.' },
    { step: '04', icon: 'fa-file-lines', title: 'Detailed Report', desc: 'You receive a personalised digital report with your exact soil pH reading, interpretation, and treatment plan.' },
    { step: '05', icon: 'fa-headset', title: 'Expert Consultation', desc: 'A certified agronomist reviews your report with you and recommends specific fertilisers, lime doses, and crop suitability.' },
];

const WHAT_WE_TEST = [
    { icon: 'fa-vial', label: 'Soil pH Level', desc: 'Acidic / Neutral / Alkaline reading to 0.1 precision', badge: 'Core Test' },
    { icon: 'fa-atom', label: 'Nitrogen (N)', desc: 'Available nitrogen for plant uptake', badge: 'NPK' },
    { icon: 'fa-circle-nodes', label: 'Phosphorus (P)', desc: 'Critical for root development & flowering', badge: 'NPK' },
    { icon: 'fa-bolt', label: 'Potassium (K)', desc: 'Strengthens immunity & water regulation', badge: 'NPK' },
    { icon: 'fa-bacteria', label: 'Organic Matter %', desc: 'Microbial biomass and carbon content', badge: 'Soil Health' },
    { icon: 'fa-droplet-slash', label: 'Micronutrients', desc: 'Zinc, Iron, Manganese, Copper, Boron levels', badge: 'Advanced' },
];

const FAQS = [
    { q: 'How many soil samples are collected?', a: 'Our technician collects 5–8 soil cores from different zones of your field and combines them into a composite sample for accurate representation.' },
    { q: 'What is the ideal soil pH for most Indian crops?', a: 'Most crops grow best at pH 6.0–7.0. Rice prefers pH 5.5–6.5, Wheat 6.0–7.5, and Vegetables 5.8–6.8. Our report gives crop-specific recommendations.' },
    { q: 'How often should I test my soil?', a: 'We recommend testing every 2–3 years for regular fields, or every season if you\'ve applied lime, heavy fertilisers, or noticed unusual crop performance.' },
    { q: 'How do I correct acidic soil?', a: 'Liming with agricultural lime (CaCO₃) or dolomite is the most effective solution. We provide exact dosage in kg/acre based on your test results.' },
    { q: 'How do I correct alkaline soil?', a: 'Sulphur application, gypsum (for sodic soils), or organic matter additions like compost are recommended. We guide you with precise quantities.' },
    { q: 'When will I receive my report?', a: 'Lab reports are delivered digitally within 48–72 hours of sample collection. Premium customers get results within 24 hours.' },
];

// ── Booking Modal ──────────────────────────────────────────────
function BookingModal({ onClose, user }) {
    const [form, setForm] = useState({
        name: user?.fullName || '',
        phone: user?.phoneNumber || '',
        address: user?.location || '',
        landArea: '',
        preferredDate: '',
        testType: 'Standard (pH + NPK)',
    });
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

    const handleSubmit = async e => {
        e.preventDefault();
        if (!form.name || !form.phone || !form.address) { setError('Name, phone, and address are required.'); return; }
        setSubmitting(true); setError('');
        try {
            await api.insurance.apply({
                full_name: form.name,
                phone: form.phone,
                farm_address: `pH Test Booking | Area: ${form.landArea || 'N/A'} | Test: ${form.testType} | Date: ${form.preferredDate || 'Flexible'} | Location: ${form.address}`,
                user_id: user?.id || null,
            });
            setSuccess(true);
        } catch (err) {
            setError(err.message || 'Booking failed. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="phb-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="phb-modal">
                <button className="phb-close" onClick={onClose} aria-label="Close">✕</button>

                {success ? (
                    <div className="phb-success">
                        <div className="phb-success-icon"><i className="fa-solid fa-circle-check" /></div>
                        <h2>Booking Confirmed!</h2>
                        <p>Our agronomist will contact you within 24 hours to confirm your soil collection slot.</p>
                        <div className="phb-success-meta">
                            <span><i className="fa-solid fa-phone" /> +91 1800-AGRI-PH</span>
                            <span><i className="fa-solid fa-envelope" /> support@agriroots.in</span>
                        </div>
                        <button className="phb-btn-primary" onClick={onClose}>Done</button>
                    </div>
                ) : (
                    <>
                        <div className="phb-modal-header">
                            <div className="phb-modal-icon"><i className="fa-solid fa-flask" /></div>
                            <h2>Book pH Soil Test</h2>
                            <p>Home collection · NABL lab · 48-hr report</p>
                        </div>

                        {error && <div className="phb-error-alert"><i className="fa-solid fa-circle-xmark" /> {error}</div>}

                        <form onSubmit={handleSubmit} className="phb-form">
                            <div className="phb-form-row">
                                <div className="phb-field">
                                    <label>Full Name *</label>
                                    <input name="name" value={form.name} onChange={handleChange} placeholder="Ramesh Kumar" required />
                                </div>
                                <div className="phb-field">
                                    <label>Phone Number *</label>
                                    <input name="phone" value={form.phone} onChange={handleChange} placeholder="+91 9876543210" required />
                                </div>
                            </div>

                            <div className="phb-field">
                                <label>Farm Address / Village *</label>
                                <input name="address" value={form.address} onChange={handleChange} placeholder="Village, Tehsil, District, State" required />
                            </div>

                            <div className="phb-form-row">
                                <div className="phb-field">
                                    <label>Land Area (acres)</label>
                                    <input name="landArea" value={form.landArea} onChange={handleChange} placeholder="e.g. 2.5 acres" />
                                </div>
                                <div className="phb-field">
                                    <label>Preferred Date</label>
                                    <input name="preferredDate" type="date" value={form.preferredDate} onChange={handleChange}
                                        min={new Date().toISOString().split('T')[0]} />
                                </div>
                            </div>

                            <div className="phb-field">
                                <label>Test Package</label>
                                <select name="testType" value={form.testType} onChange={handleChange}>
                                    <option>Standard (pH + NPK)</option>
                                    <option>Advanced (pH + NPK + Micronutrients)</option>
                                    <option>Premium (Full Soil Profile + Consultation)</option>
                                </select>
                            </div>

                            <div className="phb-packages">
                                {[
                                    { name: 'Standard', price: '₹299', tests: 'pH + N, P, K', time: '48 hrs' },
                                    { name: 'Advanced', price: '₹499', tests: '+ Micronutrients', time: '48 hrs' },
                                    { name: 'Premium', price: '₹799', tests: '+ Full Report + Call', time: '24 hrs' },
                                ].map(pkg => (
                                    <div
                                        key={pkg.name}
                                        className={`phb-pkg ${form.testType.startsWith(pkg.name) ? 'selected' : ''}`}
                                        onClick={() => setForm(f => ({ ...f, testType: `${pkg.name} (${pkg.tests})` }))}
                                    >
                                        <strong>{pkg.name}</strong>
                                        <span className="phb-pkg-price">{pkg.price}</span>
                                        <span className="phb-pkg-tests">{pkg.tests}</span>
                                        <span className="phb-pkg-time"><i className="fa-regular fa-clock" /> {pkg.time}</span>
                                    </div>
                                ))}
                            </div>

                            <button type="submit" className="phb-btn-primary" disabled={submitting}>
                                {submitting
                                    ? <><i className="fa-solid fa-spinner fa-spin" /> Booking…</>
                                    : <><i className="fa-solid fa-calendar-check" /> Confirm Booking</>
                                }
                            </button>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
}

// ── pH Scale Visualiser ────────────────────────────────────────
function PhScaleBar({ activeIdx, setActiveIdx }) {
    return (
        <div className="ph-scale-wrapper">
            <div className="ph-scale-bar">
                {PH_SCALE.map((p, i) => (
                    <div
                        key={p.value}
                        className={`ph-scale-cell ${activeIdx === i ? 'active' : ''}`}
                        style={{ background: p.color }}
                        onClick={() => setActiveIdx(i)}
                        title={`pH ${p.value} — ${p.soil}`}
                    >
                        <span className="ph-num">{p.value}</span>
                    </div>
                ))}
            </div>
            <div className="ph-scale-labels">
                <span>← Acidic</span>
                <span>Neutral</span>
                <span>Alkaline →</span>
            </div>
            {activeIdx !== null && (
                <div className="ph-info-card" style={{ borderColor: PH_SCALE[activeIdx].color }}>
                    <div className="ph-info-dot" style={{ background: PH_SCALE[activeIdx].color }} />
                    <div>
                        <strong>pH {PH_SCALE[activeIdx].value} — {PH_SCALE[activeIdx].soil}</strong>
                        <p>Best for: {PH_SCALE[activeIdx].crops}</p>
                    </div>
                </div>
            )}
        </div>
    );
}

// ── FAQ Accordion ──────────────────────────────────────────────
function FaqItem({ faq, isOpen, toggle }) {
    const bodyRef = useRef(null);
    const [height, setHeight] = useState('0px');

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setHeight(isOpen ? `${bodyRef.current?.scrollHeight || 0}px` : '0px');
    }, [isOpen]);

    return (
        <div className={`ph-faq-item ${isOpen ? 'open' : ''}`}>
            <button className="ph-faq-q" onClick={toggle} aria-expanded={isOpen}>
                <span>{faq.q}</span>
                <i className={`fa-solid fa-chevron-${isOpen ? 'up' : 'down'}`} />
            </button>
            <div className="ph-faq-a" ref={bodyRef} style={{ maxHeight: height }}>
                <p>{faq.a}</p>
            </div>
        </div>
    );
}

// ── Main Page ─────────────────────────────────────────────────
export default function PhTestPage() {
    const { user } = useAuth();
    const [showModal, setShowModal] = useState(false);
    const [activePhIdx, setActivePhIdx] = useState(3); // default: 6 (slightly acidic / ideal)
    const [openFaq, setOpenFaq] = useState(null);
    const [imgLoaded, setImgLoaded] = useState(false);

    useEffect(() => {
        window.scrollTo(0, 0);
        document.title = 'Soil pH Testing | AgriRoots';
    }, []);

    return (
        <div className="ph-page">

            {/* ── HERO SECTION ─────────────────────────────────── */}
            <section className="ph-hero">
                <div className="ph-hero-inner">
                    <div className="ph-hero-text">
                        <div className="ph-hero-tag">
                            <i className="fa-solid fa-flask" /> Soil Science
                        </div>
                        <h1 className="ph-hero-title">
                            Know Your Soil.<br />
                            <span className="ph-accent">Grow Smarter.</span>
                        </h1>
                        <p className="ph-hero-sub">
                            Professional soil pH testing with home collection, NABL-certified lab analysis,
                            and a personalised fertiliser prescription — delivered to your phone within 48 hours.
                        </p>
                        <div className="ph-hero-badges">
                            <span><i className="fa-solid fa-truck-fast" /> Free Home Collection</span>
                            <span><i className="fa-solid fa-award" /> NABL Certified Lab</span>
                            <span><i className="fa-solid fa-clock" /> 48-hr Report</span>
                        </div>
                        <div className="ph-hero-cta">
                            <button
                                className="ph-btn-book"
                                onClick={() => setShowModal(true)}
                                id="ph-book-btn"
                            >
                                <i className="fa-solid fa-calendar-check" />
                                Book a Soil Test — Starting ₹299
                            </button>
                            <a href="#how-it-works" className="ph-btn-ghost">
                                <i className="fa-solid fa-circle-play" /> See How It Works
                            </a>
                        </div>
                        <div className="ph-hero-stats">
                            <div>
                                <span className="ph-stat-num">14,000+</span>
                                <span className="ph-stat-label">Tests Done</span>
                            </div>
                            <div className="ph-stat-divider" />
                            <div>
                                <span className="ph-stat-num">98%</span>
                                <span className="ph-stat-label">Accuracy Rate</span>
                            </div>
                            <div className="ph-stat-divider" />
                            <div>
                                <span className="ph-stat-num">22+</span>
                                <span className="ph-stat-label">States Covered</span>
                            </div>
                        </div>
                    </div>

                    <div className="ph-hero-visual">
                        <div className="ph-img-glow" />
                        <div className={`ph-img-card ${imgLoaded ? 'loaded' : ''}`}>
                            <img
                                src={phKitImg}
                                alt="Professional Soil pH Test Kit"
                                className="ph-kit-img"
                                onLoad={() => setImgLoaded(true)}
                            />
                            <div className="ph-img-badge ph-badge-tl">
                                <i className="fa-solid fa-star" style={{ color: '#ffc107' }} />
                                4.9 / 5 Rating
                            </div>
                            <div className="ph-img-badge ph-badge-br">
                                <i className="fa-solid fa-check-circle" style={{ color: '#4caf50' }} />
                                NABL Certified
                            </div>
                        </div>

                        {/* Floating pH Meter Card */}
                        <div className="ph-floating-meter">
                            <div className="ph-meter-screen">
                                <span className="ph-meter-label">pH</span>
                                <span className="ph-meter-value">6.8</span>
                            </div>
                            <p className="ph-meter-status">Optimal Range ✓</p>
                        </div>
                    </div>
                </div>

                {/* Wave divider */}
                <div className="ph-hero-wave">
                    <svg viewBox="0 0 1200 80" preserveAspectRatio="none">
                        <path d="M0,40 C300,80 900,0 1200,40 L1200,80 L0,80 Z" fill="#f9fbf9" />
                    </svg>
                </div>
            </section>

            {/* ── pH SCALE EXPLORER ────────────────────────────── */}
            <section className="ph-section ph-scale-section">
                <div className="ph-section-inner">
                    <div className="ph-section-tag">Interactive</div>
                    <h2 className="ph-section-title">Understand the pH Scale</h2>
                    <p className="ph-section-sub">Tap any pH level below to see which crops thrive — and which suffer.</p>
                    <PhScaleBar activeIdx={activePhIdx} setActivePhIdx={setActivePhIdx} />
                </div>
            </section>

            {/* ── WHAT WE TEST ─────────────────────────────────── */}
            <section className="ph-section ph-tests-section">
                <div className="ph-section-inner">
                    <div className="ph-section-tag">Comprehensive</div>
                    <h2 className="ph-section-title">What's Included in Your Report</h2>
                    <p className="ph-section-sub">Every test covers 6 critical soil parameters — giving you the complete picture.</p>
                    <div className="ph-tests-grid">
                        {WHAT_WE_TEST.map((t, i) => (
                            <div key={i} className="ph-test-card">
                                <div className="ph-test-icon"><i className={`fa-solid ${t.icon}`} /></div>
                                <div className="ph-test-info">
                                    <div className="ph-test-header">
                                        <strong>{t.label}</strong>
                                        <span className="ph-test-badge">{t.badge}</span>
                                    </div>
                                    <p>{t.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── BENEFITS ─────────────────────────────────────── */}
            <section className="ph-section ph-benefits-section">
                <div className="ph-section-inner">
                    <div className="ph-section-tag">Why It Matters</div>
                    <h2 className="ph-section-title">
                        Soil pH — The Master Control<br />
                        <span className="ph-accent">of Your Farm's Health</span>
                    </h2>
                    <p className="ph-section-sub">
                        Soil pH determines whether your crops can absorb 17 essential nutrients. Even the best fertilisers are wasted
                        if your soil's pH is out of range.
                    </p>
                    <div className="ph-benefits-grid">
                        {BENEFITS.map((b, i) => (
                            <div key={i} className="ph-benefit-card">
                                <div className="ph-benefit-icon" style={{ background: b.bg, color: b.color }}>
                                    <i className={`fa-solid ${b.icon}`} />
                                </div>
                                <h3>{b.title}</h3>
                                <p>{b.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── HOW IT WORKS ─────────────────────────────────── */}
            <section className="ph-section ph-process-section" id="how-it-works">
                <div className="ph-section-inner">
                    <div className="ph-section-tag">Simple Process</div>
                    <h2 className="ph-section-title">How It Works</h2>
                    <p className="ph-section-sub">From booking to your personalised report — 5 effortless steps.</p>
                    <div className="ph-process-track">
                        {PROCESS_STEPS.map((s, i) => (
                            <React.Fragment key={i}>
                                <div className="ph-process-step">
                                    <div className="ph-step-num">{s.step}</div>
                                    <div className="ph-step-icon-wrap">
                                        <i className={`fa-solid ${s.icon}`} />
                                    </div>
                                    <h3>{s.title}</h3>
                                    <p>{s.desc}</p>
                                </div>
                                {i < PROCESS_STEPS.length - 1 && <div className="ph-process-connector" />}
                            </React.Fragment>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── SOIL HEALTH GUIDE ────────────────────────────── */}
            <section className="ph-section ph-guide-section">
                <div className="ph-section-inner ph-guide-inner">
                    <div className="ph-guide-left">
                        <div className="ph-section-tag">Soil Health Guide</div>
                        <h2 className="ph-section-title">Signs Your Soil pH<br /><span className="ph-accent">Needs Attention</span></h2>
                        <ul className="ph-symptom-list">
                            {[
                                { icon: 'fa-triangle-exclamation', color: '#f59e0b', text: 'Yellow leaves despite regular fertilisation (iron/zinc lockout)' },
                                { icon: 'fa-arrow-trend-down', color: '#ef4444', text: 'Declining yield over consecutive seasons' },
                                { icon: 'fa-bug', color: '#7c3aed', text: 'Recurring fungal diseases or root rot' },
                                { icon: 'fa-circle-xmark', color: '#dc2626', text: 'Poor germination rates even with good seeds' },
                                { icon: 'fa-water', color: '#0284c7', text: 'Waterlogging or hard, compact soil surface' },
                                { icon: 'fa-leaf', color: '#16a34a', text: 'Patchy, uneven crop growth across the field' },
                            ].map((s, i) => (
                                <li key={i}>
                                    <i className={`fa-solid ${s.icon}`} style={{ color: s.color }} />
                                    <span>{s.text}</span>
                                </li>
                            ))}
                        </ul>
                        <button className="ph-btn-book" onClick={() => setShowModal(true)} style={{ marginTop: '2rem' }}>
                            <i className="fa-solid fa-flask" /> Get My Soil Tested
                        </button>
                    </div>

                    <div className="ph-guide-right">
                        <div className="ph-nutrient-chart">
                            <h3 className="ph-nutrient-title">Nutrient Availability vs. pH</h3>
                            {[
                                { name: 'Nitrogen (N)', availability: [60, 75, 90, 100, 100, 85, 70], colors: '#4caf50' },
                                { name: 'Phosphorus (P)', availability: [20, 35, 65, 100, 95, 50, 25], colors: '#ff9800' },
                                { name: 'Potassium (K)', availability: [70, 80, 90, 100, 100, 90, 75], colors: '#2196f3' },
                                { name: 'Iron (Fe)', availability: [100, 90, 70, 45, 20, 10, 5], colors: '#f44336' },
                                { name: 'Zinc (Zn)', availability: [95, 80, 60, 40, 20, 10, 5], colors: '#9c27b0' },
                            ].map((n, ni) => {
                                const phLabels = [4, 5, 6, 7, 7.5, 8, 9];
                                return (
                                    <div key={ni} className="ph-nutrient-row">
                                        <span className="ph-nutrient-name" style={{ color: n.colors }}>{n.name}</span>
                                        <div className="ph-nutrient-bars">
                                            {n.availability.map((pct, pi) => (
                                                <div key={pi} className="ph-nutrient-bar-wrap" title={`pH ${phLabels[pi]}: ${pct}% available`}>
                                                    <div
                                                        className="ph-nutrient-bar"
                                                        style={{ height: `${pct}%`, background: n.colors, opacity: 0.3 + pct / 150 }}
                                                    />
                                                    <span className="ph-bar-label">{phLabels[pi]}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                            <p className="ph-nutrient-note">Bar height = % nutrient available at each pH level</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── FAQ ──────────────────────────────────────────── */}
            <section className="ph-section ph-faq-section">
                <div className="ph-section-inner ph-faq-inner">
                    <div>
                        <div className="ph-section-tag">Got Questions?</div>
                        <h2 className="ph-section-title">Frequently Asked<br /><span className="ph-accent">Questions</span></h2>
                        <p className="ph-section-sub">Everything you need to know about soil pH testing and our service.</p>
                        <div className="ph-faq-contact">
                            <i className="fa-solid fa-headset" />
                            <div>
                                <strong>Still have questions?</strong>
                                <p>Call our agronomists at <a href="tel:1800-000-0000">1800-AGRI-PH</a> (free)</p>
                            </div>
                        </div>
                    </div>
                    <div className="ph-faq-list">
                        {FAQS.map((faq, i) => (
                            <FaqItem
                                key={i}
                                faq={faq}
                                isOpen={openFaq === i}
                                toggle={() => setOpenFaq(openFaq === i ? null : i)}
                            />
                        ))}
                    </div>
                </div>
            </section>

            {/* ── FINAL CTA ────────────────────────────────────── */}
            <section className="ph-cta-section">
                <div className="ph-cta-inner">
                    <div className="ph-cta-glow" />
                    <i className="fa-solid fa-flask ph-cta-icon" />
                    <h2>Ready to Unlock Your Soil's Potential?</h2>
                    <p>Book today and get a FREE expert consultation with your Premium package.</p>
                    <div className="ph-cta-btns">
                        <button className="ph-btn-book large" onClick={() => setShowModal(true)} id="ph-cta-book-btn">
                            <i className="fa-solid fa-calendar-check" /> Book pH Soil Test Now
                        </button>
                        <Link to="/" className="ph-btn-ghost large">
                            <i className="fa-solid fa-house" /> Back to Home
                        </Link>
                    </div>
                    <div className="ph-cta-trust">
                        <span><i className="fa-solid fa-lock" /> Secure & Confidential</span>
                        <span><i className="fa-solid fa-rotate-left" /> 100% Satisfaction Guarantee</span>
                        <span><i className="fa-solid fa-indian-rupee-sign" /> No Hidden Charges</span>
                    </div>
                </div>
            </section>

            {/* ── BOOKING MODAL ─────────────────────────────────── */}
            {showModal && <BookingModal onClose={() => setShowModal(false)} user={user} />}
        </div>
    );
}
