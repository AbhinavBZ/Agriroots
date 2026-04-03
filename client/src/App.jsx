import { useState, useEffect } from 'react'
import './App.css'
import Header from './components/Header'
import Hero from './components/Hero'
import Services from './components/Services'
import Journey from './components/Journey'
import AgricultureData from './components/AgricultureData'
import LearningVideos from './components/LearningVideos'
import Feedback from './components/Feedback'
import Footer from './components/Footer'
import AuthModal from './components/AuthModal'

import { Routes, Route, useLocation } from 'react-router-dom'
import Centers from './pages/Centers'
import AboutUs from './pages/AboutUs'
import Cart from './pages/Cart'
import Profile from './pages/Profile'
import ServiceDetail from './pages/ServiceDetail'
import NotFound from './pages/NotFound'
import PhTestPage from './pages/PhTestPage'
import OrganicPage from './pages/OrganicPage'
import JourneyPage from './pages/JourneyPage'
import { useAuth } from './context/AuthContext'

function App() {
  const [showTopBtn, setShowTopBtn] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      setTimeout(() => {
        const elem = document.getElementById(location.hash.slice(1));
        if (elem) elem.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [location]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowTopBtn(true);
      } else {
        setShowTopBtn(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const goToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  const { loading: authLoading } = useAuth();

  // Prevent flash of "not logged in" content on refresh
  if (authLoading) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem', background: '#f9fbf9' }}>
        <div style={{ width: '60px', height: '60px', background: 'linear-gradient(135deg,#1f4037,#4caf50)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <i className="fa-solid fa-leaf" style={{ fontSize: '1.5rem', color: 'white', animation: 'spin 1s linear infinite' }}></i>
        </div>
        <p style={{ color: '#888', fontSize: '0.95rem' }}>Loading AgriRoots…</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const isJourneyPage = location.pathname === '/journey';

  return (
    <div className="app-container">
      {!isJourneyPage && <Header />}
      <Routes>
        <Route path="/" element={
          <main>
            <Hero />
            <Services />
            <Journey />
            <AgricultureData />
            <LearningVideos />
            <Feedback onAuthRequired={() => setShowAuthModal(true)} />
          </main>
        } />
        <Route path="/centers" element={<Centers />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/services/phtest" element={<PhTestPage />} />
        <Route path="/services/organic" element={<OrganicPage />} />
        <Route path="/services/:serviceId" element={<ServiceDetail />} />
        <Route path="/journey" element={<JourneyPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>

      {!isJourneyPage && <Footer />}

      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}

      {!isJourneyPage && showTopBtn && (
        <button className="back-to-top" onClick={goToTop}>
          <i className="fa-solid fa-arrow-up"></i>
        </button>
      )}
    </div>
  )
}

export default App
