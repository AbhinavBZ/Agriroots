import React, { useEffect } from 'react';

function AboutUs() {
    useEffect(() => { document.title = 'About Us | AgriRoots'; }, []);
    return (
        <div className="page-container" style={{ padding: '6rem 5%', minHeight: '80vh', backgroundColor: '#f9fbf9', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

            <div style={{ textAlign: 'center', marginBottom: '4rem', maxWidth: '800px' }}>
                <h1 style={{ fontSize: '3rem', color: '#388e3c', marginBottom: '1rem', fontWeight: 500 }}>About AgriRoots</h1>
                <p style={{ color: '#666', fontSize: '1.1rem', lineHeight: '1.6' }}>Empowering farmers with modern technology, real-time data, and expert agronomy support.</p>
                <div style={{ width: '80px', height: '4px', backgroundColor: '#4caf50', margin: '1.5rem auto' }}></div>
            </div>

            <div style={{ maxWidth: '1000px', width: '100%', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '3rem' }}>
                <div style={{ background: '#fff', borderRadius: '15px', padding: '2.5rem', boxShadow: '0 5px 20px rgba(0,0,0,0.05)', textAlign: 'left' }}>
                    <i className="fa-solid fa-bullseye" style={{ fontSize: '2.5rem', color: '#8bc34a', marginBottom: '1.5rem' }}></i>
                    <h2 style={{ fontSize: '1.5rem', color: '#1f4037', marginBottom: '1rem' }}>Our Mission</h2>
                    <p style={{ color: '#666', lineHeight: '1.7' }}>
                        To bridge the gap between traditional farming and modern agricultural sciences. We aim to provide farmers with comprehensive data about crops, tools, weather, market prices, and government schemes all in a single platform, enhancing their crop yields and profitability.
                    </p>
                </div>

                <div style={{ background: '#fff', borderRadius: '15px', padding: '2.5rem', boxShadow: '0 5px 20px rgba(0,0,0,0.05)', textAlign: 'left' }}>
                    <i className="fa-solid fa-code" style={{ fontSize: '2.5rem', color: '#8bc34a', marginBottom: '1.5rem' }}></i>
                    <h2 style={{ fontSize: '1.5rem', color: '#1f4037', marginBottom: '1rem' }}>Our Technology</h2>
                    <p style={{ color: '#666', lineHeight: '1.7' }}>
                        AgriRoots is built utilizing the powerful MERN Stack to handle real-time data seamlessly. Our responsive front-end is crafted with React and Vite for blazing-fast performance, while our robust backend is powered by Node.js, Express, and secured by MongoDB for scalable user and product management.
                    </p>
                </div>

                <div style={{ background: '#fff', borderRadius: '15px', padding: '2.5rem', boxShadow: '0 5px 20px rgba(0,0,0,0.05)', textAlign: 'left' }}>
                    <i className="fa-solid fa-handshake" style={{ fontSize: '2.5rem', color: '#8bc34a', marginBottom: '1.5rem' }}></i>
                    <h2 style={{ fontSize: '1.5rem', color: '#1f4037', marginBottom: '1rem' }}>Our Role</h2>
                    <p style={{ color: '#666', lineHeight: '1.7' }}>
                        We act as a catalyst for the Indian agricultural landscape. By partnering with agronomists, local mandi authorities, and machinery vendors, we ensure that reliable, tested, and high-quality assistance is instantly accessible to every farmer, minimizing middleman interference.
                    </p>
                </div>
            </div>

        </div>
    );
}

export default AboutUs;
