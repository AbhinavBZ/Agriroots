import React, { useState, useEffect } from 'react';
import { api } from '../api';

function AgricultureData() {
    const [activeTab, setActiveTab] = useState('crops');
    const [data, setData] = useState({ crops: [], tools: [], products: [], policies: [], loans: [] });
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState({ msg: '', type: 'success' });

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast({ msg: '', type: 'success' }), 3500);
    };

    useEffect(() => {
        async function fetchAll() {
            setLoading(true);
            try {
                const [crops, tools, products, policies, loans] = await Promise.all([
                    api.agri.cropsGuide(),
                    api.agri.tools(),
                    api.agri.products(),
                    api.agri.policies(),
                    api.agri.loans(),
                ]);
                setData({ crops, tools, products, policies, loans });
            } catch (err) {
                console.error('AgricultureData fetch error:', err);
            } finally {
                setLoading(false);
            }
        }
        fetchAll();
    }, []);

    const handleTakeLoan = async (loanId, loanName) => {
        const token = localStorage.getItem('agriToken');
        if (!token) {
            showToast('⚠️ Please login to apply for a loan.', 'warning');
            return;
        }
        try {
            await api.loans.apply(loanId);
            showToast(`✅ Successfully applied for: ${loanName}`);
        } catch (err) {
            showToast(`❌ ${err.message || 'Could not apply for loan.'}`, 'error');
        }
    };

    const tabs = [
        { key: 'crops', label: 'CROPS', icon: 'fa-seedling' },
        { key: 'tools', label: 'FARMING TOOLS', icon: 'fa-tractor' },
        { key: 'products', label: 'PRODUCTS', icon: 'fa-box-open' },
        { key: 'policies', label: 'GOVT POLICIES', icon: 'fa-file-contract' },
        { key: 'loans', label: 'LOANS', icon: 'fa-hand-holding-dollar' },
    ];

    if (loading) {
        return (
            <section className="agriculture-data-section" id="guide">
                <div className="agriculture-data-container" style={{ textAlign: 'center', padding: '4rem' }}>
                    <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '2rem', color: '#4caf50' }}></i>
                    <p style={{ color: '#666', marginTop: '1rem' }}>Loading agriculture data...</p>
                </div>
            </section>
        );
    }

    return (
        <section className="agriculture-data-section" id="guide">
            {/* Toast Notification */}
            {toast.msg && (
                <div style={{
                    position: 'fixed', top: '5rem', right: '2rem', zIndex: 9999,
                    background: toast.type === 'error' ? '#c62828' : toast.type === 'warning' ? '#f57f17' : '#1f4037',
                    color: 'white', padding: '1rem 1.5rem', borderRadius: '10px',
                    boxShadow: '0 5px 20px rgba(0,0,0,0.2)', maxWidth: '360px', fontSize: '0.95rem'
                }}>
                    {toast.msg}
                </div>
            )}
            <div className="agriculture-data-container">
                <div className="data-navbar">
                    {tabs.map(tab => (
                        <button
                            key={tab.key}
                            className={`data-tab-btn ${activeTab === tab.key ? 'active' : ''}`}
                            onClick={() => setActiveTab(tab.key)}>
                            <i className={`fa-solid ${tab.icon}`}></i> {tab.label}
                        </button>
                    ))}
                </div>

                <div className="data-content">
                    {/* CROPS TAB */}
                    {activeTab === 'crops' && (
                        <div className="data-table-wrapper">
                            <div className="table-header-title">
                                <h2>🌾 Seasonal Crops Guide</h2>
                                <p>Best crops to plant based on climate and soil conditions</p>
                            </div>
                            <table className="agri-table">
                                <thead><tr><th>Crop</th><th>Season</th><th>Duration</th><th>Yield/Acre</th></tr></thead>
                                <tbody>
                                    {data.crops.map((crop, idx) => (
                                        <tr key={crop.id} className={idx % 2 === 0 ? 'even-row' : 'odd-row'}>
                                            <td className="item-name"><span className="item-icon">{crop.icon}</span> {crop.name}</td>
                                            <td>{crop.season}</td>
                                            <td>{crop.duration}</td>
                                            <td className="yield-cell">{crop.yield_per_acre}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* TOOLS TAB */}
                    {activeTab === 'tools' && (
                        <div className="data-table-wrapper">
                            <div className="table-header-title">
                                <h2>🚜 Farming Equipment</h2>
                                <p>Essential modern machinery for efficient farming</p>
                            </div>
                            <table className="agri-table">
                                <thead><tr><th>Equipment</th><th>Category</th><th>Primary Use</th><th>Price Range</th></tr></thead>
                                <tbody>
                                    {data.tools.map((tool, idx) => (
                                        <tr key={tool.id} className={idx % 2 === 0 ? 'even-row' : 'odd-row'}>
                                            <td className="item-name">{tool.name}</td>
                                            <td>{tool.category}</td>
                                            <td>{tool.use}</td>
                                            <td>{tool.price_range}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* PRODUCTS TAB */}
                    {activeTab === 'products' && (
                        <div className="data-table-wrapper">
                            <div className="table-header-title">
                                <h2>🌱 Farming Products</h2>
                                <p>Fertilizers, pesticides & other agricultural inputs</p>
                            </div>
                            <table className="agri-table">
                                <thead><tr><th>Product</th><th>Category</th><th>Type</th><th>Dosage</th></tr></thead>
                                <tbody>
                                    {data.products.map((p, idx) => (
                                        <tr key={p.id} className={idx % 2 === 0 ? 'even-row' : 'odd-row'}>
                                            <td className="item-name">{p.name}</td>
                                            <td>{p.category}</td>
                                            <td>{p.type}</td>
                                            <td>{p.dosage}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* POLICIES TAB */}
                    {activeTab === 'policies' && (
                        <div className="data-table-wrapper">
                            <div className="table-header-title">
                                <h2>📜 Government Policies & Schemes</h2>
                                <p>Latest agricultural subsidies and support programs</p>
                            </div>
                            <table className="agri-table">
                                <thead><tr><th>Scheme</th><th>Category</th><th>Key Details</th><th>Eligibility</th></tr></thead>
                                <tbody>
                                    {data.policies.map((pol, idx) => (
                                        <tr key={pol.id} className={idx % 2 === 0 ? 'even-row' : 'odd-row'}>
                                            <td className="item-name">{pol.name}</td>
                                            <td>{pol.category}</td>
                                            <td>{pol.details}</td>
                                            <td>{pol.eligibility}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* LOANS TAB */}
                    {activeTab === 'loans' && (
                        <div className="data-table-wrapper">
                            <div className="table-header-title">
                                <h2>💰 Agricultural Loans</h2>
                                <p>Financial support options tailored for farmers</p>
                            </div>
                            <table className="agri-table">
                                <thead><tr><th>Loan Type</th><th>Top Banks/Issuers</th><th>Interest Rate</th><th>Max Amount</th><th>Action</th></tr></thead>
                                <tbody>
                                    {data.loans.map((loan, idx) => (
                                        <tr key={loan.id} className={idx % 2 === 0 ? 'even-row' : 'odd-row'}>
                                            <td className="item-name">{loan.name}</td>
                                            <td>{loan.issuer}</td>
                                            <td>{loan.interest}</td>
                                            <td>{loan.amount}</td>
                                            <td><button className="take-loan-btn" onClick={() => handleTakeLoan(loan.id, loan.name)}>Take Loan</button></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}

export default AgricultureData;
