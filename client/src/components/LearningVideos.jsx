import React, { useState, useRef, useEffect, useCallback } from 'react';

/* ─── Real agricultural YouTube videos ──────────────────────── */
const VIDEOS = [
    {
        id: 'tpHrq4CGGQ8',
        title: 'Modern Drip Irrigation Setup — Complete Guide for Farmers',
        channel: 'Krishi Jagran',
        category: 'Irrigation',
        duration: '14:22',
        views: '2.4M views',
    },
    {
        id: 'Y1zsKBE_vHI',
        title: 'How to Make Organic Compost at Home — Step by Step',
        channel: 'DD Kisan',
        category: 'Organic',
        duration: '11:08',
        views: '1.1M views',
    },
    {
        id: 'F4thl_YDWKU',
        title: 'Soil pH Testing & Soil Health Management for Better Crops',
        channel: 'Agriculture Academy',
        category: 'Soil Science',
        duration: '8:55',
        views: '980K views',
    },
    {
        id: 'OZ6uL6uyLZM',
        title: 'High-Yield Paddy Cultivation — Season Guide for India',
        channel: 'Kisan Suvidha',
        category: 'Crops',
        duration: '22:40',
        views: '3.6M views',
    },
    {
        id: 'vxThiimRpFg',
        title: 'Natural Pest Control Without Chemicals — Organic Methods',
        channel: 'Green Farm India',
        category: 'Pest Control',
        duration: '16:30',
        views: '780K views',
    },
    {
        id: 'FWJl63IQNSQ',
        title: 'Profitable Vegetable Farming on Small Land — Earn More',
        channel: 'Smart Agri',
        category: 'Horticulture',
        duration: '19:45',
        views: '5.3M views',
    },
    {
        id: 'qIbNGMYHmAg',
        title: 'Greenhouse Polyhouse Setup — Full Setup & Crop Guide',
        channel: 'AgriTech India',
        category: 'Technology',
        duration: '26:12',
        views: '2.1M views',
    },
];

const CATEGORY_COLORS = {
    Irrigation: { bg: '#e1f5fe', text: '#0277bd' },
    Organic: { bg: '#e8f5e9', text: '#2e7d32' },
    'Soil Science': { bg: '#fce4ec', text: '#c62828' },
    Crops: { bg: '#fff8e1', text: '#f57f17' },
    'Pest Control': { bg: '#f3e5f5', text: '#6a1b9a' },
    Horticulture: { bg: '#e0f2f1', text: '#00695c' },
    Technology: { bg: '#e8eaf6', text: '#283593' },
};

/* How many side slots to show (each side) */
const SIDE_COUNT = 2;

export default function LearningVideos() {
    const [active, setActive] = useState(0);
    const [playingId, setPlayingId] = useState(null);
    const [dragStart, setDragStart] = useState(0);
    const dragThreshold = 60;
    const autoRef = useRef(null);
    const total = VIDEOS.length;

    /* ── helpers ── */
    const mod = (n, m) => ((n % m) + m) % m;

    const goTo = useCallback((idx) => {
        setPlayingId(null);
        setActive(mod(idx, total));
    }, [total]);

    const prev = () => goTo(active - 1);
    const next = () => goTo(active + 1);

    /* ── auto-advance ── */
    const resetAuto = useCallback(() => {
        clearInterval(autoRef.current);
        autoRef.current = setInterval(() => {
            if (!playingId) setActive(a => mod(a + 1, total));
        }, 5000);
    }, [playingId, total]);

    useEffect(() => { resetAuto(); return () => clearInterval(autoRef.current); }, [resetAuto]);

    /* ── keyboard ── */
    useEffect(() => {
        const handler = e => {
            if (e.key === 'ArrowLeft') { prev(); resetAuto(); }
            if (e.key === 'ArrowRight') { next(); resetAuto(); }
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    });

    /* ── drag / swipe ── */
    const onDragStart = e => {
        setDragStart(e.clientX ?? e.touches?.[0]?.clientX ?? 0);
    };
    const onDragEnd = e => {
        const end = e.clientX ?? e.changedTouches?.[0]?.clientX ?? 0;
        const delta = dragStart - end;
        if (Math.abs(delta) > dragThreshold) {
            delta > 0 ? next() : prev();
            resetAuto();
        }
    };

    /* ── slot positions relative to active ── */
    // positions: -SIDE_COUNT … -1  = left side cards (smallest first)
    //            0                = center (hero)
    //            1 … SIDE_COUNT   = right side cards
    const slots = [];
    for (let offset = -SIDE_COUNT; offset <= SIDE_COUNT; offset++) {
        const vidIdx = mod(active + offset, total);
        slots.push({ offset, vidIdx });
    }

    return (
        <section className="lv-section">
            {/* ── Header ── */}
            <div className="lv-header">
                <div className="lv-tag"><i className="fa-solid fa-play" /> AgriRoots Learning</div>
                <h2 className="lv-title">
                    Grow Your Knowledge,<br />
                    <span className="lv-accent">Grow Your Yields</span>
                </h2>
                <p className="lv-sub">
                    Curated expert videos on modern farming techniques, soil health, irrigation, and more —
                    hand-picked for Indian farmers.
                </p>
            </div>

            {/* ── Carousel ── */}
            <div
                className="lv-carousel-wrap"
                onMouseDown={onDragStart}
                onMouseUp={onDragEnd}
                onTouchStart={onDragStart}
                onTouchEnd={onDragEnd}
                style={{ userSelect: 'none' }}
            >
                {/* Left arrow */}
                <button className="lv-arrow lv-arrow-left" onClick={() => { prev(); resetAuto(); }} aria-label="Previous video">
                    <i className="fa-solid fa-chevron-left" />
                </button>

                {/* Cards stage */}
                <div className="lv-stage">
                    {slots.map(({ offset, vidIdx }) => {
                        const v = VIDEOS[vidIdx];
                        const isCenter = offset === 0;
                        const isPlaying = playingId === v.id && isCenter;
                        const catStyle = CATEGORY_COLORS[v.category] || { bg: '#eee', text: '#333' };

                        return (
                            <div
                                key={`${offset}-${vidIdx}`}
                                className={`lv-card lv-offset-${offset < 0 ? 'n' : 'p'}${Math.abs(offset)} ${isCenter ? 'lv-center' : ''}`}
                                onClick={() => {
                                    if (!isCenter) { goTo(vidIdx); resetAuto(); }
                                    else if (!isPlaying) setPlayingId(v.id);
                                }}
                                style={{ cursor: isCenter && !isPlaying ? 'pointer' : isCenter ? 'default' : 'pointer' }}
                            >
                                {/* Thumbnail / Player */}
                                <div className="lv-thumb-wrap">
                                    {isPlaying ? (
                                        <iframe
                                            className="lv-iframe"
                                            src={`https://www.youtube.com/embed/${v.id}?autoplay=1&rel=0&modestbranding=1`}
                                            title={v.title}
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                            allowFullScreen
                                        />
                                    ) : (
                                        <>
                                            <img
                                                className="lv-thumb"
                                                src={`https://img.youtube.com/vi/${v.id}/hqdefault.jpg`}
                                                alt={v.title}
                                                draggable={false}
                                            />
                                            {isCenter && (
                                                <div className="lv-play-btn">
                                                    <i className="fa-solid fa-play" />
                                                </div>
                                            )}
                                            {!isCenter && (
                                                <div className="lv-side-overlay">
                                                    <i className="fa-solid fa-expand" />
                                                </div>
                                            )}
                                            <span className="lv-duration">{v.duration}</span>
                                        </>
                                    )}
                                </div>

                                {/* Info — only on center card */}
                                {isCenter && (
                                    <div className="lv-info">
                                        <span className="lv-cat-badge" style={{ background: catStyle.bg, color: catStyle.text }}>
                                            {v.category}
                                        </span>
                                        <h3 className="lv-card-title">{v.title}</h3>
                                        <div className="lv-meta">
                                            <span><i className="fa-solid fa-circle-user" />{v.channel}</span>
                                            <span><i className="fa-solid fa-eye" />{v.views}</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Right arrow */}
                <button className="lv-arrow lv-arrow-right" onClick={() => { next(); resetAuto(); }} aria-label="Next video">
                    <i className="fa-solid fa-chevron-right" />
                </button>
            </div>

            {/* ── Dot indicators ── */}
            <div className="lv-dots">
                {VIDEOS.map((_, i) => (
                    <button
                        key={i}
                        className={`lv-dot ${i === active ? 'active' : ''}`}
                        onClick={() => { goTo(i); resetAuto(); }}
                        aria-label={`Go to video ${i + 1}`}
                    />
                ))}
            </div>

            {/* ── Playlist strip ── */}
            <div className="lv-playlist">
                {VIDEOS.map((v, i) => {
                    const catStyle = CATEGORY_COLORS[v.category] || { bg: '#eee', text: '#333' };
                    return (
                        <button
                            key={v.id}
                            className={`lv-pl-item ${i === active ? 'active' : ''}`}
                            onClick={() => { goTo(i); resetAuto(); }}
                        >
                            <img
                                src={`https://img.youtube.com/vi/${v.id}/mqdefault.jpg`}
                                alt={v.title}
                            />
                            <div className="lv-pl-info">
                                <span className="lv-pl-cat" style={{ color: catStyle.text }}>{v.category}</span>
                                <p className="lv-pl-title">{v.title}</p>
                                <span className="lv-pl-views">{v.views}</span>
                            </div>
                            {i === active && <div className="lv-pl-active-bar" />}
                        </button>
                    );
                })}
            </div>

            {/* ── Footer CTA ── */}
            <div className="lv-footer">
                <a
                    href="https://www.youtube.com/@KrishiJagranTV"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="lv-yt-btn"
                >
                    <i className="fa-brands fa-youtube" /> Explore More on YouTube
                </a>
                <p className="lv-footer-note">New videos added weekly · Free for all AgriRoots members</p>
            </div>
        </section>
    );
}
