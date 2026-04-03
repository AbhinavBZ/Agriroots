import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function NotFound() {
    const navigate = useNavigate();

    useEffect(() => {
        document.title = '404 – Page Not Found | AgriRoots';
    }, []);

    return (
        <div style={{
            minHeight: '90vh', display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', textAlign: 'center',
            padding: '4rem 5%', background: '#f9fbf9'
        }}>
            <div style={{ fontSize: '7rem', lineHeight: 1, marginBottom: '1rem', filter: 'grayscale(0.2)' }}>🌾</div>
            <h1 style={{
                fontSize: '7rem', fontWeight: 800, color: '#e8e8e8',
                letterSpacing: '-4px', lineHeight: 1, marginBottom: '0.5rem'
            }}>404</h1>
            <h2 style={{ fontSize: '1.8rem', color: '#1f4037', fontWeight: 600, marginBottom: '1rem' }}>
                Oops! This field is empty.
            </h2>
            <p style={{ color: '#888', fontSize: '1rem', maxWidth: '420px', lineHeight: '1.7', marginBottom: '2.5rem' }}>
                The page you're looking for doesn't exist or has been moved. Let's get you back to familiar ground.
            </p>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                <button onClick={() => navigate(-1)}
                    style={{ padding: '0.9rem 2rem', background: '#f1f8e9', color: '#388e3c', border: '1px solid #c5e1a5', borderRadius: '30px', fontWeight: 600, cursor: 'pointer', fontSize: '0.95rem' }}>
                    ← Go Back
                </button>
                <Link to="/"
                    style={{ padding: '0.9rem 2rem', background: 'linear-gradient(135deg,#1f4037,#4caf50)', color: 'white', borderRadius: '30px', fontWeight: 600, textDecoration: 'none', fontSize: '0.95rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                    <i className="fa-solid fa-house"></i> Back to Home
                </Link>
            </div>
        </div>
    );
}
