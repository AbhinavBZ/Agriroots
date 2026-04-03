import React, { useState, useEffect } from 'react';
import { api } from '../api';

export default function CropGuide() {
    const [cropData, setCropData] = useState([]);
    const [seasonalData, setSeasonalData] = useState([]);
    const [selectedCrop, setSelectedCrop] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            try {
                const [crops, seasons] = await Promise.all([
                    api.crops.getAll(),
                    api.crops.getSeasons(),
                ]);
                setCropData(crops);
                setSeasonalData(seasons);
                if (crops.length > 0) setSelectedCrop(crops[0]);
            } catch (err) {
                console.error('CropGuide fetch error:', err);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: '4rem' }}>
                <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '2rem', color: '#4caf50' }}></i>
                <p style={{ color: '#666', marginTop: '1rem' }}>Loading crop data...</p>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>

            {/* Seasonal Info */}
            <div>
                <h2 style={{ fontSize: '2.5rem', color: '#1f4037', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.8rem', borderBottom: '2px solid #e8f5e9', paddingBottom: '0.5rem' }}>
                    <i className="fa-solid fa-cloud-sun-rain" style={{ color: '#4caf50' }}></i> Seasonal Crop Patterns
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                    {seasonalData.map(s => (
                        <div key={s.id} style={{ background: 'white', padding: '1.5rem', borderRadius: '15px', borderLeft: '5px solid #4caf50', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', transition: 'transform 0.2s', cursor: 'default' }}
                            onMouseOver={e => e.currentTarget.style.transform = 'translateY(-3px)'}
                            onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
                            <h3 style={{ fontSize: '1.2rem', color: '#333' }}>{s.season}</h3>
                            <p style={{ color: '#ff9800', fontWeight: 'bold', fontSize: '1rem', marginBottom: '0.5rem' }}>{s.weather}</p>
                            <p style={{ color: '#666', fontSize: '1rem', lineHeight: '1.5' }}>{s.crops}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Interactive Crop selection */}
            <div>
                <h2 style={{ fontSize: '2.5rem', color: '#1f4037', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.8rem', borderBottom: '2px solid #e8f5e9', paddingBottom: '0.5rem' }}>
                    <i className="fa-solid fa-hand-pointer" style={{ color: '#4caf50' }}></i> Crop Encyclopedia
                </h2>
                <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '1rem' }}>
                    {cropData.map(crop => (
                        <button key={crop.id} onClick={() => setSelectedCrop(crop)}
                            style={{ padding: '1rem 2rem', border: 'none', borderRadius: '30px', background: selectedCrop?.id === crop.id ? '#1f4037' : 'white', color: selectedCrop?.id === crop.id ? 'white' : '#1f4037', fontWeight: 600, fontSize: '1rem', boxShadow: '0 4px 10px rgba(0,0,0,0.05)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'all 0.3s', whiteSpace: 'nowrap' }}>
                            <i className={`fa-solid ${crop.icon}`}></i> {crop.name}
                        </button>
                    ))}
                </div>

                {selectedCrop && (
                    <div style={{ background: 'white', borderRadius: '20px', padding: '3rem', boxShadow: '0 10px 30px rgba(0,0,0,0.08)', marginTop: '1.5rem', borderTop: '5px solid #a7e608', animation: 'fadeIn 0.5s ease-in-out' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '2rem', marginBottom: '2.5rem' }}>
                            <div>
                                <h3 style={{ fontSize: '2.5rem', color: '#1f4037', display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                                    <i className={`fa-solid ${selectedCrop.icon}`} style={{ color: '#a7e608' }}></i> {selectedCrop.name}
                                </h3>
                                <div style={{ display: 'flex', gap: '1rem', color: '#666', fontSize: '1rem' }}>
                                    <span style={{ backgroundColor: '#f5f5f5', padding: '0.4rem 1rem', borderRadius: '20px' }}>
                                        <i className="fa-solid fa-calendar-days" style={{ color: '#4caf50', marginRight: '5px' }}></i>{selectedCrop.cycle}
                                    </span>
                                    <span style={{ backgroundColor: '#f5f5f5', padding: '0.4rem 1rem', borderRadius: '20px' }}>
                                        <i className="fa-solid fa-sun" style={{ color: '#ff9800', marginRight: '5px' }}></i>{selectedCrop.season}
                                    </span>
                                </div>
                            </div>
                            <div style={{ background: '#f1f8e9', padding: '1.5rem 2.5rem', borderRadius: '15px', border: '1px solid #c5e1a5', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                                <p style={{ fontSize: '1rem', color: '#666', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.3rem' }}>Profitability</p>
                                <p style={{ fontSize: '1.2rem', color: '#388e3c', fontWeight: 'bold' }}>{selectedCrop.profitability}</p>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '3rem' }}>
                            <div>
                                <h4 style={{ fontSize: '1.2rem', color: '#333', marginBottom: '1.2rem', borderBottom: '2px solid #eee', paddingBottom: '0.5rem' }}>Growth Requirements</h4>
                                <div style={{ marginBottom: '1.5rem', backgroundColor: '#f9fbf9', padding: '1.2rem', borderRadius: '10px' }}>
                                    <strong style={{ color: '#333', display: 'block', marginBottom: '0.3rem', fontSize: '1rem' }}><i className="fa-solid fa-temperature-half" style={{ color: '#ff9800', width: '20px' }}></i> Climate:</strong>
                                    <span style={{ color: '#555', lineHeight: '1.5', fontSize: '1rem' }}>{selectedCrop.climate}</span>
                                </div>
                                <div style={{ marginBottom: '2rem', backgroundColor: '#f9fbf9', padding: '1.2rem', borderRadius: '10px' }}>
                                    <strong style={{ color: '#333', display: 'block', marginBottom: '0.3rem', fontSize: '1rem' }}><i className="fa-solid fa-mound" style={{ color: '#795548', width: '20px' }}></i> Ideal Soil:</strong>
                                    <span style={{ color: '#555', lineHeight: '1.5', fontSize: '1rem' }}>{selectedCrop.soil}</span>
                                </div>
                                <h4 style={{ fontSize: '1.2rem', color: '#333', marginBottom: '1.2rem', borderBottom: '2px solid #eee', paddingBottom: '0.5rem' }}>Market Insights</h4>
                                <p style={{ color: '#555', lineHeight: '1.6', fontSize: '1rem', backgroundColor: '#fef9e7', padding: '1.2rem', borderRadius: '10px', borderLeft: '4px solid #ffeb3b' }}>
                                    {selectedCrop.profitDesc}
                                </p>
                            </div>

                            <div style={{ background: '#fff5f5', padding: '2rem', borderRadius: '15px', border: '1px solid #ffebee' }}>
                                <h4 style={{ fontSize: '1.2rem', color: '#d32f2f', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                                    <i className="fa-solid fa-bug"></i> Diseases & Remedies
                                </h4>
                                <ul style={{ listStyle: 'none', padding: 0 }}>
                                    {(selectedCrop.diseases || []).map(d => (
                                        <li key={d.name} style={{ marginBottom: '1.5rem', backgroundColor: 'white', padding: '1.2rem', borderRadius: '10px', boxShadow: '0 2px 8px rgba(211,47,47,0.05)' }}>
                                            <strong style={{ color: '#b71c1c', display: 'block', fontSize: '1rem', marginBottom: '0.5rem' }}>
                                                <i className="fa-solid fa-triangle-exclamation" style={{ fontSize: '1rem', marginRight: '0.3rem' }}></i> {d.name}
                                            </strong>
                                            <span style={{ color: '#555', fontSize: '1rem', lineHeight: '1.5', display: 'block' }}>
                                                <strong style={{ color: '#388e3c' }}>Remedy:</strong> {d.remedy}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Profitable crops overview - static reference table */}
            <div>
                <h2 style={{ fontSize: '2.5rem', color: '#1f4037', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.8rem', borderBottom: '2px solid #e8f5e9', paddingBottom: '0.5rem' }}>
                    <i className="fa-solid fa-list-check" style={{ color: '#4caf50' }}></i> Highly Profitable Specialty Crops
                </h2>
                <div style={{ background: 'white', borderRadius: '15px', overflow: 'hidden', boxShadow: '0 5px 15px rgba(0,0,0,0.05)', border: '1px solid #eee' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#f1f8e9', borderBottom: '2px solid #c5e1a5' }}>
                                <th style={{ padding: '1.5rem', fontSize: '1.2rem', color: '#1f4037', width: '33%' }}><i className="fa-solid fa-pepper-hot" style={{ color: '#e53935', marginRight: '0.8rem' }}></i>Horticulture & Spices</th>
                                <th style={{ padding: '1.5rem', fontSize: '1.2rem', color: '#1f4037', width: '33%' }}><i className="fa-brands fa-pagelines" style={{ color: '#4caf50', marginRight: '0.8rem' }}></i>Medicinal Plants</th>
                                <th style={{ padding: '1.5rem', fontSize: '1.2rem', color: '#1f4037', width: '33%' }}><i className="fa-solid fa-apple-whole" style={{ color: '#ffb300', marginRight: '0.8rem' }}></i>Fruit Orchards</th>
                            </tr>
                        </thead>
                        <tbody>
                            {[['Chilies', 'Ashwagandha', 'Mango'], ['Turmeric', 'Aloe Vera', 'Apple'], ['Cardamom', 'Tulsi (Holy Basil)', 'Banana'], ['Black Pepper', 'Neem', 'Guava'], ['Coriander', 'Peppermint', 'Pomegranate'], ['Cumin (Jeera)', 'Safed Musli', 'Papaya'], ['Ginger', 'Brahmi', 'Orange / Citrus']].map((row, index) => (
                                <tr key={index} style={{ borderBottom: index === 6 ? 'none' : '1px solid #eee', backgroundColor: index % 2 === 0 ? 'white' : '#f9fbf9', transition: 'background-color 0.2s' }}
                                    onMouseOver={e => e.currentTarget.style.backgroundColor = '#f1f8e9'}
                                    onMouseOut={e => e.currentTarget.style.backgroundColor = index % 2 === 0 ? 'white' : '#f9fbf9'}>
                                    {row.map((cell, ci) => (
                                        <td key={ci} style={{ padding: '1.2rem 1.5rem', color: '#444', fontWeight: 500, fontSize: '1rem' }}>
                                            <i className="fa-solid fa-check" style={{ color: '#8bc34a', marginRight: '10px', fontSize: '1rem' }}></i>{cell}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
