import React, { useState, useEffect } from 'react';
import './JourneyPage.css';

const stepsData = [
  {
    num: "01",
    title: "Soil Preparation",
    desc: "The foundation of all farming. Plowing, tilling, and leveling the soil to create the perfect seedbed. This critical first step improves soil aeration, enhances water absorption capacity, and uproots early weeds. A well-prepared field provides young roots the freedom to expand deeply and securely."
  },
  {
    num: "02",
    title: "Seed Selection & Sowing",
    desc: "The journey truly begins with high-quality, disease-resistant seeds. Depending on the crop and climate, seeds are sown at precise depths and spacings. Proper alignment and spacing ensure that every seedling receives adequate sunlight, moisture, and soil nutrients without excessive competition."
  },
  {
    num: "03",
    title: "Irrigation & Water Mgmt.",
    desc: "Water is the lifeblood of agriculture. Modern irrigation systems—like drip and micro-sprinklers—deliver the exact amount of moisture directly to the root zone at the right intervals. Efficient water management prevents waterlogging, reduces wastage, and ensures continuous physiological growth."
  },
  {
    num: "04",
    title: "Nutrients & Fertilizer",
    desc: "Just as humans need vitamins, crops require essential macronutrients (Nitrogen, Phosphorous, Potassium) and micronutrients. By enriching the soil with organic compost, manure, or balanced bio-fertilizers, farmers replenish depleted soil energy, ensuring vigorous stems, robust leaves, and high-yield potential."
  },
  {
    num: "05",
    title: "Weed & Pest Control",
    desc: "A growing plant faces numerous threats from invasive weeds, parasitic pests, and fungal diseases. Integrated Pest Management (IPM) involves biological controls, safe organic sprays, and regular crop monitoring to protect young plants, ensuring they reach maturity unharmed and healthy."
  },
  {
    num: "06",
    title: "Harvesting",
    desc: "The defining moment of a season's dedicated labor. Harvesting must be timed perfectly to gather mature crops at their peak nutritional value, ripeness, and flavor. Whether done manually to protect delicate fruits or via advanced machinery for vast grain fields, it demands precision."
  },
  {
    num: "07",
    title: "Post-Harvest & Storage",
    desc: "The final step secures the crop's long-term value. Processing involves cleaning, sorting, and drying the harvest. Safe storage in climate-controlled silos, cold-storage units, or secure bins prevents post-harvest losses from moisture and pests, ensuring the produce remains fresh and market-ready."
  }
];

// Reusable animated plant SVG
const AnimatedPlant = ({ scrollProgress }) => {
  const stemRef = React.useRef(null);
  const [stemLength, setStemLength] = React.useState(1000);

  useEffect(() => {
    if (stemRef.current) {
      setStemLength(stemRef.current.getTotalLength());
    }
  }, []);

  // Progress determines how much of the stem is drawn.
  // We want the stem to start growing immediately and finish slightly before the end.
  const stemDrawOffset = stemLength - (stemLength * scrollProgress);

  return (
    <svg className="plant-svg" viewBox="0 0 400 600" preserveAspectRatio="xMidYMax meet">
      <defs>
        <linearGradient id="stemGradient" x1="0%" y1="100%" x2="0%" y2="0%">
           <stop offset="0%" stopColor="#2e7d32" />
           <stop offset="100%" stopColor="#69f0ae" />
        </linearGradient>
        <linearGradient id="leafGradient" x1="0%" y1="0%" x2="100%" y2="100%">
           <stop offset="0%" stopColor="#81c784" />
           <stop offset="100%" stopColor="#2e7d32" />
        </linearGradient>
      </defs>

      {/* Background Glow */}
      <circle cx="200" cy="500" r="150" className="seed-glow" style={{ opacity: scrollProgress > 0.1 ? 0.3 : 0 }} />

      {/* Main Stem Path */}
      <path 
        ref={stemRef}
        className="stem-path" 
        stroke="url(#stemGradient)"
        d="M 200,500 C 170,430 250,370 200,280 C 150,190 230,140 190,80" 
        strokeDasharray={stemLength}
        strokeDashoffset={Math.max(0, stemDrawOffset)}
      />

      {/* Banana Leaves Group 1 */}
      <g className="leaf" style={{ 
        transform: `translate(193px, 459px) rotate(-15deg) scale(${scrollProgress > 0.15 ? Math.min(1, (scrollProgress - 0.15)*5) : 0})`,
        opacity: scrollProgress > 0.15 ? 1 : 0
      }}>
        {/* Long sweeping banana leaf shape */}
        <path d="M0,0 Q-40,10 -100,-40 Q-30,-70 0,0" />
        {/* Inner midrib */}
        <path d="M0,0 Q-30,-10 -95,-40" stroke="#81c784" strokeWidth="2" fill="none" opacity="0.6"/>
      </g>

      {/* Banana Leaves Group 2 */}
      <g className="leaf" style={{ 
        transform: `translate(208px, 398px) rotate(10deg) scale(${scrollProgress > 0.25 ? Math.min(1, (scrollProgress - 0.25)*5) : 0})`,
        opacity: scrollProgress > 0.25 ? 1 : 0
      }}>
        <path d="M0,0 Q50,-10 120,-30 Q60,-60 0,0" />
        <path d="M0,0 Q40,-20 115,-30" stroke="#81c784" strokeWidth="2" fill="none" opacity="0.6"/>
      </g>

      {/* Banana Leaves Group 3 */}
      <g className="leaf" style={{ 
        transform: `translate(216px, 331px) rotate(-5deg) scale(${scrollProgress > 0.4 ? Math.min(0.9, (scrollProgress - 0.4)*5) : 0})`,
        opacity: scrollProgress > 0.4 ? 1 : 0
      }}>
        <path d="M0,0 Q40,30 110,60 Q80,0 0,0" />
        <path d="M0,0 Q50,20 105,58" stroke="#81c784" strokeWidth="2" fill="none" opacity="0.6"/>
      </g>

      {/* Banana Leaves Group 4 */}
      <g className="leaf" style={{ 
        transform: `translate(184px, 230px) rotate(-20deg) scale(${scrollProgress > 0.55 ? Math.min(0.8, (scrollProgress - 0.55)*5) : 0})`,
        opacity: scrollProgress > 0.55 ? 1 : 0
      }}>
        <path d="M0,0 Q-50,-20 -110,-10 Q-60,-50 0,0" />
        <path d="M0,0 Q-40,-20 -105,-10" stroke="#81c784" strokeWidth="2" fill="none" opacity="0.6"/>
      </g>

      {/* Banana Leaves Group 5 */}
      <g className="leaf" style={{ 
        transform: `translate(191px, 169px) rotate(10deg) scale(${scrollProgress > 0.7 ? Math.min(0.7, (scrollProgress - 0.7)*5) : 0})`,
        opacity: scrollProgress > 0.7 ? 1 : 0
      }}>
        <path d="M0,0 Q40,-30 100,-70 Q10,-60 0,0" />
        <path d="M0,0 Q30,-40 95,-65" stroke="#81c784" strokeWidth="2" fill="none" opacity="0.6"/>
      </g>

      {/* Banana Leaves Group 6 */}
      <g className="leaf" style={{ 
        transform: `translate(202px, 115px) rotate(-15deg) scale(${scrollProgress > 0.8 ? Math.min(0.6, (scrollProgress - 0.8)*5) : 0})`,
        opacity: scrollProgress > 0.8 ? 1 : 0
      }}>
        <path d="M0,0 Q-40,10 -100,20 Q-60,-30 0,0" />
        <path d="M0,0 Q-40,-5 -95,18" stroke="#81c784" strokeWidth="2" fill="none" opacity="0.6"/>
      </g>

      {/* Fruit/Flower */}
      <g className="fruit" style={{ 
        transform: `translate(190px, 80px) scale(${scrollProgress > 0.9 ? Math.min(1, (scrollProgress - 0.9)*10) : 0})`,
        opacity: scrollProgress > 0.9 ? 1 : 0
      }}>
        <circle cx="0" cy="0" r="25" className="fruit-glow" />
        <circle cx="0" cy="0" r="18" className="fruit-core" />
        <circle cx="-5" cy="-5" r="4" fill="#fff" opacity="0.6" />
        <circle cx="8" cy="4" r="2" fill="#fff" opacity="0.4" />
      </g>

      {/* Soil base */}
      <ellipse cx="200" cy="500" rx="140" ry="30" className="soil" />
      <ellipse cx="200" cy="500" rx="90" ry="15" className="soil-top" />
      
      {/* Seed (fades as plant grows) */}
      <g className="seed-body" style={{ opacity: scrollProgress < 0.15 ? 1 : Math.max(0, 1 - (scrollProgress - 0.15) * 5) }}>
        <path d="M200,490 C215,490 220,505 200,510 C180,505 185,490 200,490 Z" fill="#5d4037" />
        <path d="M200,492 C210,492 215,500 200,508 C190,500 190,495 200,492 Z" fill="#8d6e63" />
        <circle cx="195" cy="497" r="2.5" fill="#d7ccc8" />
      </g>
    </svg>
  );
};

const ParticlesBackground = () => {
  // Generate random static particles that will animate in CSS
  const [particles] = useState(() => Array.from({ length: 40 }, () => ({
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 3 + 1,
    duration: Math.random() * 20 + 10,
    delay: Math.random() * 5
  })));

  return (
    <div className="particles-container">
      {particles.map((p, i) => (
        <div 
          key={i} 
          className="particle"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`
          }}
        />
      ))}
    </div>
  );
};

const LeafCurtain = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    // Open curtains after a short delay
    const t = setTimeout(() => setIsOpen(true), 600);
    // Remove from DOM completely after animation finishes
    const t2 = setTimeout(() => setHidden(true), 2500);
    return () => { clearTimeout(t); clearTimeout(t2); };
  }, []);

  if (hidden) return null;

  return (
    <>
      <div className={`curtain-logo ${isOpen ? 'open' : ''}`}>
        <i className="fa-solid fa-seedling"></i>
      </div>
      <div className="curtain-overlay">
        <div className={`curtain-panel left ${isOpen ? 'open' : ''}`}>
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="curtain-svg" filter="drop-shadow(5px 0 15px rgba(0,0,0,0.8))">
            {/* Massive Banana Leaf Left */}
            <path d="M 0,0 C 70,0 120,50 80,100 L 0,100 Z" fill="#13331a"/>
            <path d="M 0,0 C 60,0 100,50 65,100 L 0,100 Z" fill="#1e4526"/>
            {/* Midrib and veins */}
            <path d="M 0,0 C 50,0 90,50 65,100" stroke="#4caf50" strokeWidth="1.5" fill="none" opacity="0.4"/>
            <path d="M 30,20 C 50,20 80,30 90,40" stroke="#4caf50" strokeWidth="0.5" fill="none" opacity="0.3"/>
            <path d="M 30,40 C 60,40 85,50 90,60" stroke="#4caf50" strokeWidth="0.5" fill="none" opacity="0.3"/>
            <path d="M 20,60 C 50,60 70,70 80,80" stroke="#4caf50" strokeWidth="0.5" fill="none" opacity="0.3"/>
            <path d="M 10,80 C 30,80 50,90 65,95" stroke="#4caf50" strokeWidth="0.5" fill="none" opacity="0.3"/>
          </svg>
        </div>
        <div className={`curtain-panel right ${isOpen ? 'open' : ''}`}>
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="curtain-svg" filter="drop-shadow(-5px 0 15px rgba(0,0,0,0.8))">
             {/* Massive Banana Leaf Right */}
            <path d="M 100,0 C 30,0 -20,50 20,100 L 100,100 Z" fill="#13331a"/>
            <path d="M 100,0 C 40,0 0,50 35,100 L 100,100 Z" fill="#1e4526"/>
            {/* Midrib and veins */}
            <path d="M 100,0 C 50,0 10,50 35,100" stroke="#4caf50" strokeWidth="1.5" fill="none" opacity="0.4"/>
            <path d="M 70,20 C 50,20 20,30 10,40" stroke="#4caf50" strokeWidth="0.5" fill="none" opacity="0.3"/>
            <path d="M 70,40 C 40,40 15,50 10,60" stroke="#4caf50" strokeWidth="0.5" fill="none" opacity="0.3"/>
            <path d="M 80,60 C 50,60 30,70 20,80" stroke="#4caf50" strokeWidth="0.5" fill="none" opacity="0.3"/>
            <path d="M 90,80 C 70,80 50,90 35,95" stroke="#4caf50" strokeWidth="0.5" fill="none" opacity="0.3"/>
          </svg>
        </div>
      </div>
    </>
  );
};

const JourneyPage = () => {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleScroll = () => {
      // Calculate how far down the user has scrolled
      const element = document.documentElement;
      const scrollTop = element.scrollTop || document.body.scrollTop;
      const scrollHeight = element.scrollHeight || document.body.scrollHeight;
      const clientHeight = element.clientHeight;
      
      // Calculate progress between 0 and 1
      const progress = scrollTop / (scrollHeight - clientHeight);
      setScrollProgress(progress);
    };

    const handleMouseMove = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('mousemove', handleMouseMove);
    // Initial call
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <div className="journey-page">
      <LeafCurtain />
      <ParticlesBackground />
      {/* Reactive Mouse Glow Background */}
      <div 
        className="mouse-glow" 
        style={{ transform: `translate(${mousePos.x - 400}px, ${mousePos.y - 400}px)` }}
      ></div>

      <div className="journey-content">
        
        {/* Fixed Visual Canvas */}
        <div className="visual-canvas">
           <AnimatedPlant scrollProgress={scrollProgress} />
        </div>

        {/* Scrollable text step cards */}
        <div className="steps-container">
          {stepsData.map((step, index) => {
            // Determine visibility based on approximate scroll chunk
            // There are 7 steps, so roughly index/7 to (index+1)/7 is its visibility window
            // But we can just use CSS to position them nicely over 100vh each.
            // A simple threshold check could provide the fading, but position is relative anyway.
            
            const stepThreshold = index / (stepsData.length - 1);
            // We want it to be visible when scrollProgress is roughly near stepThreshold.
            const distance = Math.abs(scrollProgress - stepThreshold);
            // It gets the 'visible' class if it's within 0.2 units of the threshold
            const isVisible = distance < 0.25;

            return (
              <div key={index} className="step-card">
                <div className={`step-content ${isVisible ? 'visible' : ''}`}>
                  <div className="step-number">{step.num}</div>
                  <h2 className="step-title">{step.title}</h2>
                  <p className="step-desc">{step.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
};

export default JourneyPage;
