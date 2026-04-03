import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function Services() {
    const [services, setServices] = useState([]);

    useEffect(() => {
        fetch('http://localhost:5000/api/services')
            .then(res => res.json())
            .then(data => setServices(data))
            .catch(err => console.error(err));
    }, []);

    return (
        <section className="services-section" id="services">
            <h2>Our Services &amp; Products</h2>
            <hr className="underline"></hr>
            <div className="services-container">
                {services.map((svc, index) => (
                    <div key={index} className="service-card">
                        <div className="card-bg">
                            <div className="card-content">
                                <h3>{svc.title}</h3>
                                <p>{svc.desc}</p>
                                <Link to={svc.path || '#'} className={`btn btn-${svc.color}`}>{svc.btn}</Link>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}

export default Services;
