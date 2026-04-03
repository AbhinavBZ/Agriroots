import React, { useState, useEffect } from 'react';
import treeImg from '../assets/tree1.png';

function Hero() {
    const [currentSlide, setCurrentSlide] = useState(0);

    const slides = [
        {
            title: 'Expert Crop Guidance',
            desc: 'Get personalized recommendations for seasonal crops, planting schedules, and yield optimization based on your soil and climate.',
            icon: 'fa-wheat-awn',
            color: '#4CAF50',
            tags: ['50+ Crop Varieties', 'Season Wise Guide']
        },
        {
            title: 'Government Schemes',
            desc: 'Stay updated with latest government policies, subsidies, and support programs. We help you access PM-KISAN, crop insurance, and more.',
            icon: 'fa-scroll',
            color: '#e67e22',
            tags: ['Subsidy Info', 'Easy Application']
        },
        {
            title: 'Market Prices',
            desc: 'Real-time commodity prices from local mandis and APMC markets. Make informed decisions on when and where to sell your produce.',
            icon: 'fa-chart-line',
            color: '#e74c3c',
            tags: ['Live Mandi Rates', 'Price Trends']
        },
        {
            title: 'Weather Forecast',
            desc: 'Accurate, location-specific weather alerts and localized forecasts to help you plan irrigation and fertilizer applications.',
            icon: 'fa-cloud-sun-rain',
            color: '#3498db',
            tags: ['Local Alerts', 'Rainfall Prediction']
        },
        {
            title: 'Soil Health',
            desc: 'Understand your soil better with our testing tie-ups. Get customized fertilizer schedules based on NPK values and micro-nutrients.',
            icon: 'fa-seedling',
            color: '#8e44ad',
            tags: ['Lab Testing', 'Fertilizer Guide']
        },
        {
            title: 'Smart Farming',
            desc: 'Adopt modern techniques like drip irrigation, polyhouse farming, and organic practices for better yield and minimal resource waste.',
            icon: 'fa-tractor',
            color: '#009688',
            tags: ['Organic Tips', 'Modern Tech']
        }
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentSlide((prevSlide) => (prevSlide + 1) % slides.length);
        }, 2000); // changes every 30s

        return () => clearInterval(interval);
    }, [slides.length]);

    return (
        <section className="hero-section">
            <div className="hero-header">
                <h1>Welcome to <span className="highlight">AgriRoots</span></h1>
                <p>Empowering Indian Farmers with Modern Solutions</p>
            </div>

            <div className="hero-content">
                <div className="hero-graphics">
                    <img src={treeImg} alt="AgriRoots Tree" className="tree-image" />
                </div>

                <div className="hero-slider-container">
                    {slides.map((slide, index) => (
                        <div key={index} className={`slide ${currentSlide === index ? 'active' : ''}`}>
                            <div className="slide-icon" style={{ fontSize: '2rem', color: slide.color, marginBottom: '1rem' }}>
                                <i className={`fa-solid ${slide.icon}`}></i>
                            </div>
                            <h2 style={{ color: slide.color }}>{slide.title}</h2>
                            <p>{slide.desc}</p>
                            <div className="slide-tags">
                                {slide.tags.map((tag, i) => (
                                    <span key={i} className="tag" style={{ color: slide.color }}>
                                        <i className="fa-solid fa-check"></i> {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    ))}

                    <div className="slider-dots">
                        {slides.map((_, index) => (
                            <span
                                key={index}
                                className={`dot ${currentSlide === index ? 'active' : ''}`}
                                onClick={() => setCurrentSlide(index)}
                            ></span>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}

export default Hero;
