import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import organicHero from '../assets/organic_farming_hero.png';
import './OrganicPage.css';

/* ─── Data ─────────────────────────────────────────────────── */
const APPROACHES = [
    {
        id: 'composting',
        icon: 'fa-recycle',
        color: '#6d4c41',
        bg: '#efebe9',
        gradient: 'linear-gradient(135deg,#6d4c41,#a1887f)',
        title: 'Composting & Vermicomposting',
        tagline: 'Turn waste into gold',
        desc: 'Convert kitchen scraps, crop residues, and cattle dung into nutrient-rich humus using aerobic decomposition or earthworms. Vermicompost releases nutrients 5× faster than regular compost.',
        keyFacts: ['Increases soil organic matter by 30–60%', 'Reduces fertiliser cost by up to 40%', 'Earthworms aerate soil naturally', 'Ready in 45–90 days'],
        steps: [
            'Collect green (nitrogen-rich) and brown (carbon-rich) materials in 1:3 ratio',
            'Layer in a pit or bin — alternate wet and dry layers',
            'Moisten and turn every 10–15 days for aeration',
            'Harvest dark, crumbly compost after 6–8 weeks',
        ],
    },
    {
        id: 'natural-pest',
        icon: 'fa-bug-slash',
        color: '#2e7d32',
        bg: '#e8f5e9',
        gradient: 'linear-gradient(135deg,#1b5e20,#66bb6a)',
        title: 'Natural Pest Management',
        tagline: 'Work with nature, not against it',
        desc: 'Use biological controls, trap crops, companion planting, and botanical pesticides (neem, garlic, pyrethrum) to manage pests without synthetic chemicals — protecting soil microbiome and beneficial insects.',
        keyFacts: ['Neem oil disrupts 200+ pest species', 'Companion planting reduces pests by 35%', 'Preserves pollinators & predatory insects', 'Zero pesticide residue on produce'],
        steps: [
            'Identify pests correctly before treatment — not all insects are harmful',
            'Introduce predatory insects: ladybugs, lacewings for aphid control',
            'Spray neem oil (5ml/litre) fortnightly as a systemic deterrent',
            'Use yellow sticky traps for whiteflies and fungus gnats',
        ],
    },
    {
        id: 'crop-rotation',
        icon: 'fa-arrows-rotate',
        color: '#1565c0',
        bg: '#e3f2fd',
        gradient: 'linear-gradient(135deg,#0d47a1,#42a5f5)',
        title: 'Crop Rotation & Intercropping',
        tagline: 'Smarter land use every season',
        desc: 'Systematically alternating crop families across seasons breaks pest cycles, restores soil nitrogen (via legume phases), and reduces weed pressure — while intercropping two crops simultaneously doubles income per acre.',
        keyFacts: ['Reduces soil-borne diseases by 60%', 'Legumes fix 50–200 kg N/ha/year', 'Increases biodiversity in the field', 'Reduces weed pressure naturally'],
        steps: [
            'Divide your field into 3–4 zones',
            'Assign: Cereals → Legumes → Vegetables → Fallow (or cover crop)',
            'Never grow the same crop family in the same spot 2 seasons in a row',
            'Add a nitrogen-fixing legume phase every 3rd season minimum',
        ],
    },
    {
        id: 'green-manure',
        icon: 'fa-seedling',
        color: '#558b2f',
        bg: '#f1f8e9',
        gradient: 'linear-gradient(135deg,#33691e,#9ccc65)',
        title: 'Green Manuring & Cover Crops',
        tagline: 'Living mulch for living soil',
        desc: 'Grow fast-maturing legumes (Dhaincha, sunn hemp, cowpea) during fallow season and plow them in while green. They add 60–150 kg nitrogen per hectare and dramatically improve soil structure.',
        keyFacts: ['Adds 40–80 tonnes organic matter/ha', 'Suppresses weeds through canopy shade', 'Prevents soil erosion during monsoon', 'Improves water infiltration by 50%'],
        steps: [
            'Choose species by season: Dhaincha (Kharif), Mustard (Rabi)',
            'Sow 25–30 kg seed/acre broadcast or in rows',
            'Allow to grow for 45–60 days until flowering stage',
            'Plow into the soil 2–3 weeks before the next crop',
        ],
    },
    {
        id: 'biofertilisers',
        icon: 'fa-flask',
        color: '#7b1fa2',
        bg: '#f3e5f5',
        gradient: 'linear-gradient(135deg,#4a148c,#ab47bc)',
        title: 'Biofertilisers & Microbial Innoculants',
        tagline: 'Microscopic allies for your crops',
        desc: 'Rhizobium, Azospirillum, PSB, and mycorrhizal fungi are applied as seed treatments or soil drenches to fix atmospheric nitrogen, solubilise locked phosphorus, and enhance root absorption by 300%.',
        keyFacts: ['Rhizobium fixes up to 200 kg N/ha/year', 'PSB releases 30–50% more phosphorus', 'Mycorrhizae extend root reach 100×', 'Cost: ₹150–400/acre vs ₹3000+ chemical'],
        steps: [
            'Select the right biofertiliser: Rhizobium for legumes, Azospirillum for cereals',
            'Mix seed with bio-inoculant + jaggery solution; shade-dry for 30 minutes',
            'For soil application: mix in compost at 2–4 kg/acre and broadcast',
            'Store all biofertilisers at 15–25°C away from direct sunlight',
        ],
    },
    {
        id: 'water-conservation',
        icon: 'fa-droplet',
        color: '#0277bd',
        bg: '#e1f5fe',
        gradient: 'linear-gradient(135deg,#01579b,#29b6f6)',
        title: 'Water Conservation & Mulching',
        tagline: 'Every drop counts',
        desc: 'Organic mulches (straw, dry leaves, coconut husk) reduce soil evaporation by 60%, regulate soil temperature, suppress weeds, and gradually decompose into humus — all while saving irrigation costs.',
        keyFacts: ['Reduces water use by 40–60%', 'Keeps soil 5–8°C cooler in summer', 'Suppresses 70–80% of weed germination', 'Improves soil structure over time'],
        steps: [
            'Apply 5–8 cm layer of dry organic material around the plant base',
            'Leave a 5 cm gap around stem to prevent crown rot',
            'Top up mulch layer as it decomposes over the season',
            'Combine with drip irrigation for maximum water efficiency',
        ],
    },
];

const BENEFITS = [
    { icon: 'fa-heart', color: '#e53935', bg: '#ffebee', title: 'Healthier Produce', desc: 'Organic food contains 20–40% more antioxidants, vitamins, and minerals with zero pesticide residues — safer for your family and higher value in the market.' },
    { icon: 'fa-indian-rupee-sign', color: '#f57f17', bg: '#fff8e1', title: 'Higher Market Price', desc: 'Certified organic produce commands 20–50% premium at urban markets, export chains, and online platforms — turning small farms into high-income enterprises.' },
    { icon: 'fa-globe', color: '#2e7d32', bg: '#e8f5e9', title: 'Carbon Sequestration', desc: 'Organic soils store 1–3 tonnes of CO₂ per hectare annually, helping fight climate change while qualifying for carbon credit income programmes.' },
    { icon: 'fa-worm', color: '#6d4c41', bg: '#efebe9', title: 'Soil Biodiversity', desc: 'Organic fields host 50× more earthworms, 10× more beneficial fungi, and richer bacterial communities — building permanent, self-sustaining fertility.' },
    { icon: 'fa-shield-halved', color: '#1565c0', bg: '#e3f2fd', title: 'Drought Resilience', desc: 'Every 1% increase in organic matter helps soil retain 20,000 more litres of water per hectare — dramatically improving drought resilience.' },
    { icon: 'fa-certificate', color: '#7b1fa2', bg: '#f3e5f5', title: 'Certifiable & Exportable', desc: 'With 3-year conversion, farms become eligible for India Organic (NPOP) and EU Organic certification — unlocking international export markets.' },
];

const SOIL_COMPARISON = [
    { label: 'Organic Matter', organic: 85, conventional: 30 },
    { label: 'Earthworm Count', organic: 90, conventional: 20 },
    { label: 'Water Retention', organic: 75, conventional: 35 },
    { label: 'Beneficial Fungi', organic: 80, conventional: 15 },
    { label: 'Nitrogen Availability', organic: 70, conventional: 60 },
    { label: 'Crop Immunity', organic: 78, conventional: 28 },
];

const CONVERSION_TIMELINE = [
    { phase: 'Year 1', icon: 'fa-seedling', title: 'Transition Phase', color: '#8d6e63', desc: 'Stop all synthetic inputs. Begin composting, add biofertilisers and green manure. Yield may dip 10–20%.' },
    { phase: 'Year 2', icon: 'fa-arrows-rotate', title: 'Soil Rebuilding', color: '#558b2f', desc: 'Microbial activity recovers. Introduce crop rotation and pest management systems. Yield stabilises.' },
    { phase: 'Year 3', icon: 'fa-star', title: 'Certification Ready', color: '#f57f17', desc: 'Apply for India Organic (NPOP) certification. Yield often exceeds pre-conversion levels.' },
    { phase: 'Year 4+', icon: 'fa-trophy', title: 'Premium Market', color: '#7b1fa2', desc: 'Certified organic label unlocks premium buyers, export markets, and 30–50% higher pricing.' },
];

const CROP_ROTATION_PLAN = [
    { season: 'Kharif (Jun–Oct)', crops: ['Paddy / Maize', 'Soybean / Groundnut', 'Vegetables (Brinjal, Tomato)', 'Green Manure (Dhaincha)'], colors: ['#4caf50', '#ff9800', '#e53935', '#8bc34a'] },
    { season: 'Rabi (Nov–Mar)', crops: ['Wheat / Barley', 'Chickpea / Mustard', 'Potato / Onion', 'Cover Crop (Berseem)'], colors: ['#ffc107', '#9c27b0', '#00bcd4', '#8bc34a'] },
    { season: 'Zaid (Apr–Jun)', crops: ['Mung / Lobia (N-fix)', 'Watermelon / Cucumber', 'Sunhemp (Green Manure)', 'Fallow / Rest'], colors: ['#4caf50', '#f44336', '#8bc34a', '#9e9e9e'] },
];

const FAQS = [
    { q: 'How long does it take to convert to fully organic farming?', a: 'The official transition period is 3 years without synthetic inputs. During this time, soil microbiome recovers, organic matter builds up, and your farm becomes eligible for NPOP certification. Many farmers see noticeable improvements in soil quality within the first year.' },
    { q: 'Will my yields drop when I switch to organic?', a: 'A temporary 10–20% dip is common in Year 1–2 as soil adjusts. By Year 3, most farmers recover to pre-conversion yields, and many exceed them — especially with proper composting and biofertiliser use. Long-term yields are significantly more stable.' },
    { q: 'Where can I sell organic produce at premium prices?', a: 'Options include: APMC mandis with organic certification lanes, direct-to-consumer (CSA boxes, farmer\'s markets), e-commerce platforms (Organic Heart, Big Basket Daily), and agri-export firms. AgriRoots can connect you with buyers.' },
    { q: 'How do I control pests without chemical pesticides?', a: 'Our 3-layer approach: (1) Preventive — crop rotation, healthy soil, companion planting; (2) Mechanical — traps, nets, hand-picking; (3) Botanical — neem oil, garlic spray, pyrethrum. This combination manages 95%+ of common farm pests effectively.' },
    { q: 'Are biofertilisers effective in all soil types?', a: 'Yes, but effectiveness varies. Sandy soils benefit most from mycorrhizal inoculants (water retention). Clay soils benefit from Azospirillum (aeration). Our soil health assessment identifies the right combination for your specific field.' },
    { q: 'What government support is available for organic farmers?', a: 'The Paramparagat Krishi Vikas Yojana (PKVY) provides ₹50,000/hectare cluster support. PM-KISAN and state organic missions offer additional subsidies. AgriRoots helps with application and documentation.' },
];

/* ─── Sub-components ───────────────────────────────────────── */
function FaqItem({ faq, isOpen, toggle }) {
    const ref = useRef(null);
    const [height, setHeight] = useState('0px');

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setHeight(isOpen ? `${ref.current?.scrollHeight || 0}px` : '0px');
    }, [isOpen]);

    return (
        <div className={`org-faq-item ${isOpen ? 'open' : ''}`}>
            <button className="org-faq-q" onClick={toggle}>
                <span>{faq.q}</span>
                <i className={`fa-solid fa-chevron-${isOpen ? 'up' : 'down'}`} />
            </button>
            <div className="org-faq-a" ref={ref} style={{ maxHeight: height }}>
                <p>{faq.a}</p>
            </div>
        </div>
    );
}

function ApproachCard({ data, isActive, onClick }) {
    return (
        <div
            className={`org-approach-card ${isActive ? 'active' : ''}`}
            onClick={onClick}
            style={{ '--accent': data.color, '--accent-bg': data.bg }}
        >
            <div className="org-approach-icon" style={{ background: data.gradient }}>
                <i className={`fa-solid ${data.icon}`} />
            </div>
            <h3>{data.title}</h3>
            <p className="org-approach-tagline">{data.tagline}</p>
            <i className="fa-solid fa-chevron-right org-card-caret" />
        </div>
    );
}

/* ─── Main Page ─────────────────────────────────────────────── */
export default function OrganicPage() {
    const [activeApproach, setActiveApproach] = useState(0);
    const [openFaq, setOpenFaq] = useState(null);
    const [imgLoaded, setImgLoaded] = useState(false);
    const [soilTab, setSoilTab] = useState('organic'); // 'organic' | 'conventional'

    useEffect(() => {
        window.scrollTo(0, 0);
        document.title = 'Organic Farming Methods | AgriRoots';
    }, []);

    const active = APPROACHES[activeApproach];

    return (
        <div className="org-page">

            {/* ══ HERO ═══════════════════════════════════════════ */}
            <section className="org-hero">
                <div className="org-hero-inner">
                    <div className="org-hero-text">
                        <div className="org-hero-tag">
                            <i className="fa-solid fa-leaf" /> Organic Farming
                        </div>
                        <h1 className="org-hero-title">
                            Farm Smarter.<br />
                            <span className="org-accent">Farm Cleaner.</span><br />
                            Farm Forever.
                        </h1>
                        <p className="org-hero-sub">
                            Discover science-backed organic methods that restore soil health,
                            eliminate dependency on synthetic chemicals, and unlock premium
                            market prices — all while securing your farm's future.
                        </p>
                        <div className="org-hero-badges">
                            <span><i className="fa-solid fa-ban" /> Zero Chemicals</span>
                            <span><i className="fa-solid fa-certificate" /> NPOP Certifiable</span>
                            <span><i className="fa-solid fa-arrow-trend-up" /> 30–50% Premium Price</span>
                        </div>
                        <div className="org-hero-cta">
                            <a href="#approaches" className="org-btn-primary">
                                <i className="fa-solid fa-compass" /> Explore All Methods
                            </a>
                            <Link to="/services/consultation" className="org-btn-ghost">
                                <i className="fa-solid fa-headset" /> Get Expert Advice
                            </Link>
                        </div>
                        <div className="org-hero-stats">
                            <div><span className="org-stat-num">6</span><span className="org-stat-label">Core Methods</span></div>
                            <div className="org-stat-div" />
                            <div><span className="org-stat-num">3 Yrs</span><span className="org-stat-label">To Certification</span></div>
                            <div className="org-stat-div" />
                            <div><span className="org-stat-num">50×</span><span className="org-stat-label">More Earthworms</span></div>
                        </div>
                    </div>

                    <div className="org-hero-visual">
                        <div className="org-img-glow" />
                        <div className={`org-img-wrap ${imgLoaded ? 'loaded' : ''}`}>
                            <img
                                src={organicHero}
                                alt="Organic farmer harvesting fresh produce"
                                onLoad={() => setImgLoaded(true)}
                            />
                            <div className="org-img-badge org-badge-tl">
                                <i className="fa-solid fa-leaf" style={{ color: '#4caf50' }} />
                                100% Chemical-Free
                            </div>
                            <div className="org-img-badge org-badge-br">
                                <i className="fa-solid fa-certificate" style={{ color: '#f57f17' }} />
                                NPOP Certifiable
                            </div>
                        </div>
                        {/* Floating soil health card */}
                        <div className="org-floating-card">
                            <div className="org-floating-title"><i className="fa-solid fa-worm" /> Soil Health Score</div>
                            <div className="org-floating-bar-list">
                                {['Microbes', 'Nitrogen', 'Carbon'].map((l, i) => (
                                    <div key={l} className="org-floating-bar-row">
                                        <span>{l}</span>
                                        <div className="org-floating-bar-track">
                                            <div className="org-floating-bar-fill" style={{ width: ['92%', '78%', '85%'][i] }} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="org-hero-wave">
                    <svg viewBox="0 0 1200 80" preserveAspectRatio="none">
                        <path d="M0,40 C300,80 900,0 1200,40 L1200,80 L0,80 Z" fill="#f9fbf7" />
                    </svg>
                </div>
            </section>

            {/* ══ APPROACHES ════════════════════════════════════ */}
            <section className="org-section org-approaches-section" id="approaches">
                <div className="org-section-inner">
                    <div className="org-section-tag">6 Proven Methods</div>
                    <h2 className="org-section-title">Approaches to<br /><span className="org-accent">Organic Agriculture</span></h2>
                    <p className="org-section-sub">Each method addresses a different farming challenge. Click any to see detailed steps and key facts.</p>

                    <div className="org-approaches-layout">
                        {/* Left: card grid */}
                        <div className="org-approach-grid">
                            {APPROACHES.map((a, i) => (
                                <ApproachCard
                                    key={a.id}
                                    data={a}
                                    isActive={i === activeApproach}
                                    onClick={() => setActiveApproach(i)}
                                />
                            ))}
                        </div>

                        {/* Right: detail panel */}
                        <div className="org-approach-detail" style={{ '--accent': active.color, '--accent-bg': active.bg }}>
                            <div className="org-detail-header" style={{ background: active.gradient }}>
                                <div className="org-detail-icon">
                                    <i className={`fa-solid ${active.icon}`} />
                                </div>
                                <div>
                                    <h3>{active.title}</h3>
                                    <span>{active.tagline}</span>
                                </div>
                            </div>

                            <div className="org-detail-body">
                                <p className="org-detail-desc">{active.desc}</p>

                                <div className="org-detail-facts">
                                    <h4><i className="fa-solid fa-chart-bar" /> Key Facts</h4>
                                    <ul>
                                        {active.keyFacts.map((f, i) => (
                                            <li key={i}><i className="fa-solid fa-circle-check" />{f}</li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="org-detail-steps">
                                    <h4><i className="fa-solid fa-list-ol" /> How to Implement</h4>
                                    <ol>
                                        {active.steps.map((s, i) => (
                                            <li key={i}>
                                                <span className="org-step-num">{i + 1}</span>
                                                <span>{s}</span>
                                            </li>
                                        ))}
                                    </ol>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ══ BENEFITS ══════════════════════════════════════ */}
            <section className="org-section org-benefits-section">
                <div className="org-section-inner">
                    <div className="org-section-tag">Why Go Organic</div>
                    <h2 className="org-section-title">The Benefits of<br /><span className="org-accent">Organic Farming</span></h2>
                    <p className="org-section-sub">Beyond the buzzword — real, measurable advantages for your farm, your family, and your income.</p>
                    <div className="org-benefits-grid">
                        {BENEFITS.map((b, i) => (
                            <div key={i} className="org-benefit-card">
                                <div className="org-benefit-icon" style={{ background: b.bg, color: b.color }}>
                                    <i className={`fa-solid ${b.icon}`} />
                                </div>
                                <h3>{b.title}</h3>
                                <p>{b.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ══ SOIL HEALTH COMPARISON ════════════════════════ */}
            <section className="org-section org-soil-section">
                <div className="org-section-inner org-soil-inner">
                    <div className="org-soil-left">
                        <div className="org-section-tag">Science Behind It</div>
                        <h2 className="org-section-title">Organic vs.<br /><span className="org-accent">Conventional Soil</span></h2>
                        <p className="org-section-sub" style={{ margin: 0 }}>
                            After 3 years of organic transition, every soil parameter
                            improves dramatically — creating a permanent, self-renewing asset.
                        </p>
                        <div className="org-soil-toggle">
                            <button
                                className={soilTab === 'organic' ? 'active' : ''}
                                onClick={() => setSoilTab('organic')}
                            >🌿 Organic Farm</button>
                            <button
                                className={soilTab === 'conventional' ? 'active' : ''}
                                onClick={() => setSoilTab('conventional')}
                            >⚗️ Conventional Farm</button>
                        </div>
                    </div>
                    <div className="org-soil-right">
                        <div className="org-soil-chart">
                            {SOIL_COMPARISON.map((row, i) => {
                                const val = soilTab === 'organic' ? row.organic : row.conventional;
                                return (
                                    <div key={i} className="org-soil-row">
                                        <span className="org-soil-label">{row.label}</span>
                                        <div className="org-soil-track">
                                            <div
                                                className={`org-soil-fill ${soilTab}`}
                                                style={{ width: `${val}%` }}
                                            />
                                        </div>
                                        <span className="org-soil-pct">{val}%</span>
                                    </div>
                                );
                            })}
                        </div>
                        <p className="org-soil-note">* Relative scores based on ICAR and FAO organic farming studies</p>
                    </div>
                </div>
            </section>

            {/* ══ CROP ROTATION PLANNER ════════════════════════ */}
            <section className="org-section org-rotation-section">
                <div className="org-section-inner">
                    <div className="org-section-tag">Planning Tool</div>
                    <h2 className="org-section-title">Seasonal Crop<br /><span className="org-accent">Rotation Planner</span></h2>
                    <p className="org-section-sub">A sample 3-zone rotation plan covering all Indian seasons — customisable for your crops and land size.</p>

                    <div className="org-rotation-grid">
                        {CROP_ROTATION_PLAN.map((season, si) => (
                            <div key={si} className="org-rotation-card">
                                <div className="org-rotation-season">
                                    <i className="fa-regular fa-calendar" />
                                    <strong>{season.season}</strong>
                                </div>
                                <div className="org-rotation-crops">
                                    {season.crops.map((crop, ci) => (
                                        <div key={ci} className="org-rotation-crop" style={{ borderLeftColor: season.colors[ci] }}>
                                            <div className="org-crop-dot" style={{ background: season.colors[ci] }} />
                                            <span>{crop}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="org-rotation-note">
                        <i className="fa-solid fa-circle-info" />
                        <p>This is a <strong>sample plan</strong>. Our agronomists will build a <strong>personalised rotation</strong> based on your soil test results, water availability, market access, and preferred crops.</p>
                    </div>
                </div>
            </section>

            {/* ══ CONVERSION TIMELINE ═══════════════════════════ */}
            <section className="org-section org-timeline-section">
                <div className="org-section-inner">
                    <div className="org-section-tag">Your Journey</div>
                    <h2 className="org-section-title">Conversion<br /><span className="org-accent">Roadmap to Certification</span></h2>
                    <p className="org-section-sub">From first step to premium certified label — here's what to expect each year.</p>
                    <div className="org-timeline">
                        {CONVERSION_TIMELINE.map((t, i) => (
                            <div key={i} className="org-timeline-step">
                                <div className="org-timeline-connector" />
                                <div className="org-tl-phase" style={{ background: t.color }}>{t.phase}</div>
                                <div className="org-tl-icon-wrap" style={{ borderColor: t.color }}>
                                    <i className={`fa-solid ${t.icon}`} style={{ color: t.color }} />
                                </div>
                                <h3 style={{ color: t.color }}>{t.title}</h3>
                                <p>{t.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ══ FAQ ════════════════════════════════════════════ */}
            <section className="org-section org-faq-section">
                <div className="org-section-inner org-faq-inner">
                    <div className="org-faq-left">
                        <div className="org-section-tag">Got Questions?</div>
                        <h2 className="org-section-title">Frequently Asked<br /><span className="org-accent">Questions</span></h2>
                        <p className="org-section-sub" style={{ margin: 0 }}>
                            Everything you need to know about transitioning to organic farming.
                        </p>
                        <div className="org-faq-contact">
                            <i className="fa-solid fa-headset" />
                            <div>
                                <strong>Talk to an Organic Expert</strong>
                                <p>Free consultation for AgriRoots members — <a href="tel:1800-000-0000">1800-AGRI-ORG</a></p>
                            </div>
                        </div>
                    </div>
                    <div className="org-faq-list">
                        {FAQS.map((f, i) => (
                            <FaqItem
                                key={i}
                                faq={f}
                                isOpen={openFaq === i}
                                toggle={() => setOpenFaq(openFaq === i ? null : i)}
                            />
                        ))}
                    </div>
                </div>
            </section>

            {/* ══ CTA ════════════════════════════════════════════ */}
            <section className="org-cta-section">
                <div className="org-cta-inner">
                    <div className="org-cta-glow" />
                    <div className="org-cta-icon-row">
                        <i className="fa-solid fa-seedling" />
                        <i className="fa-solid fa-leaf" />
                        <i className="fa-solid fa-recycle" />
                    </div>
                    <h2>Ready to Start Your<br />Organic Farming Journey?</h2>
                    <p>Our certified agronomists will create a full organic transition plan personalised for your farm — free for new members.</p>
                    <div className="org-cta-btns">
                        <Link to="/services/consultation" className="org-btn-primary large" id="org-cta-btn">
                            <i className="fa-solid fa-calendar-check" /> Book Free Consultation
                        </Link>
                        <Link to="/" className="org-btn-ghost large">
                            <i className="fa-solid fa-house" /> Back to Home
                        </Link>
                    </div>
                    <div className="org-cta-trust">
                        <span><i className="fa-solid fa-certificate" /> NPOP Certified Guidance</span>
                        <span><i className="fa-solid fa-rotate-left" /> 100% Satisfaction Guarantee</span>
                        <span><i className="fa-solid fa-users" /> 8,000+ Organic Farmers Helped</span>
                    </div>
                </div>
            </section>

        </div>
    );
}
