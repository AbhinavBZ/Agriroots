import React from 'react';

function Footer() {
    return (
        <footer className="footer-section">
            <div className="footer-container">
                <div className="footer-brand">
                    <h2>Know our Team</h2>
                    <p className="footer-tagline">Connect with us on social media</p>
                    <div className="footer-socials">
                        <a href="#"><i className="fa-brands fa-facebook-f"></i></a>
                        <a href="#"><i className="fa-brands fa-twitter"></i></a>
                        <a href="#"><i className="fa-brands fa-instagram"></i></a>
                        <a href="#"><i className="fa-brands fa-youtube"></i></a>
                    </div>
                </div>

                <div className="footer-col footer-contact-col">
                    <h3>Contact Info</h3>
                    <ul className="footer-contact">
                        <li><i className="fa-solid fa-location-dot"></i> 123 Farming Hub, Bhubaneswar, Odisha, India</li>
                        <li><i className="fa-solid fa-phone"></i> +91 98765 43210</li>
                        <li><i className="fa-solid fa-envelope"></i> support@agriroots.com</li>
                    </ul>
                </div>

                <div className="footer-big-logo-container">
                    <h1 className="footer-big-logo">AgriRoots</h1>
                </div>
            </div>

            <div className="footer-bottom">
                <p>&copy; {new Date().getFullYear()} AgriRoots. All rights reserved.</p>
            </div>
        </footer>
    );
}

export default Footer;
