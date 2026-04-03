import React, { useState, useCallback } from 'react';

// ── Weather code → human label + icon + color ─────────────────────────────────
const WC = {
    0: { label: 'Clear Sky', icon: '☀️', color: '#f59e0b', bg: '#fef3c7' },
    1: { label: 'Mainly Clear', icon: '🌤️', color: '#f59e0b', bg: '#fef9e7' },
    2: { label: 'Partly Cloudy', icon: '⛅', color: '#6b7280', bg: '#f3f4f6' },
    3: { label: 'Overcast', icon: '☁️', color: '#4b5563', bg: '#e5e7eb' },
    45: { label: 'Foggy', icon: '🌫️', color: '#9ca3af', bg: '#f9fafb' },
    48: { label: 'Icy Fog', icon: '🌫️', color: '#9ca3af', bg: '#f9fafb' },
    51: { label: 'Light Drizzle', icon: '🌦️', color: '#3b82f6', bg: '#eff6ff' },
    53: { label: 'Moderate Drizzle', icon: '🌦️', color: '#3b82f6', bg: '#eff6ff' },
    55: { label: 'Heavy Drizzle', icon: '🌧️', color: '#1d4ed8', bg: '#dbeafe' },
    61: { label: 'Slight Rain', icon: '🌧️', color: '#3b82f6', bg: '#eff6ff' },
    63: { label: 'Moderate Rain', icon: '🌧️', color: '#1d4ed8', bg: '#dbeafe' },
    65: { label: 'Heavy Rain', icon: '🌧️', color: '#1e40af', bg: '#bfdbfe' },
    71: { label: 'Light Snow', icon: '🌨️', color: '#60a5fa', bg: '#eff6ff' },
    73: { label: 'Moderate Snow', icon: '❄️', color: '#3b82f6', bg: '#dbeafe' },
    75: { label: 'Heavy Snow', icon: '❄️', color: '#1d4ed8', bg: '#bfdbfe' },
    80: { label: 'Slight Showers', icon: '🌦️', color: '#2563eb', bg: '#dbeafe' },
    81: { label: 'Moderate Showers', icon: '🌧️', color: '#1d4ed8', bg: '#bfdbfe' },
    82: { label: 'Violent Showers', icon: '⛈️', color: '#1e40af', bg: '#bfdbfe' },
    95: { label: 'Thunderstorm', icon: '⛈️', color: '#dc2626', bg: '#fee2e2' },
    96: { label: 'Thunderstorm + Hail', icon: '⛈️', color: '#dc2626', bg: '#fee2e2' },
    99: { label: 'Thunderstorm + Hail', icon: '⛈️', color: '#dc2626', bg: '#fee2e2' },
};

function wc(code) {
    return WC[code] || { label: 'Unknown', icon: '🌡️', color: '#6b7280', bg: '#f3f4f6' };
}

// ── Wind direction from degrees ───────────────────────────────────────────────
function windDir(deg) {
    const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    return dirs[Math.round(deg / 45) % 8];
}

// ── Agricultural advisory based on conditions ─────────────────────────────────
function getAdvisories(current, daily) {
    const advisories = [];
    const temp = current.temperature_2m;
    const humidity = current.relative_humidity_2m;
    const rain = daily?.precipitation_sum?.[0] || 0;
    const windSpeed = current.wind_speed_10m;
    const wCode = current.weather_code;

    if (temp < 5) advisories.push({ type: 'danger', icon: '❄️', msg: 'Frost Risk: Cover frost-sensitive crops tonight. Avoid irrigation.' });
    if (temp > 38) advisories.push({ type: 'danger', icon: '🔥', msg: 'Heat Stress: Irrigate early morning or evening to prevent crop damage.' });
    if (humidity > 80 && temp > 20) advisories.push({ type: 'warning', icon: '🍄', msg: 'High Fungal Risk: Conditions favor disease spread. Apply preventive fungicide.' });
    if (rain > 20) advisories.push({ type: 'warning', icon: '🌊', msg: 'Heavy Rainfall Expected: Ensure proper field drainage. Postpone fertilizer application.' });
    if (rain < 1 && temp > 30) advisories.push({ type: 'info', icon: '💧', msg: 'Dry & Warm: Good time for harvesting. Consider irrigation for standing crops.' });
    if ([0, 1].includes(wCode)) advisories.push({ type: 'success', icon: '🌾', msg: 'Clear skies: Ideal conditions for spraying pesticides and herbicides.' });
    if (windSpeed > 30) advisories.push({ type: 'warning', icon: '💨', msg: 'High Winds: Avoid pesticide spraying. Risk of crop lodging — support tall crops.' });
    if ([95, 96, 99].includes(wCode)) advisories.push({ type: 'danger', icon: '⛈️', msg: 'Thunderstorm Alert: Secure farm equipment. Do not work in open fields.' });
    if (advisories.length === 0) advisories.push({ type: 'success', icon: '✅', msg: 'Weather conditions are normal. Continue regular farm operations.' });
    return advisories;
}

// ── Advisory color scheme ─────────────────────────────────────────────────────
const advStyle = {
    danger: { bg: '#fee2e2', border: '#fca5a5', color: '#991b1b' },
    warning: { bg: '#fef3c7', border: '#fcd34d', color: '#92400e' },
    info: { bg: '#eff6ff', border: '#93c5fd', color: '#1e40af' },
    success: { bg: '#d1fae5', border: '#6ee7b7', color: '#065f46' },
};

// ── Simple sparkline bar chart ────────────────────────────────────────────────
function TempChart({ hourly }) {
    if (!hourly) return null;
    const temps = hourly.temperature_2m?.slice(0, 24) || [];
    const times = hourly.time?.slice(0, 24) || [];
    const min = Math.min(...temps);
    const max = Math.max(...temps);
    const range = max - min || 1;

    return (
        <div style={{ marginTop: '1.5rem' }}>
            <h4 style={{ color: '#1f4037', fontSize: '1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span>🌡️</span> 24-Hour Temperature Trend
            </h4>
            <div style={{ display: 'flex', alignItems: 'flex-end', height: '80px', gap: '2px', background: '#f9fbf9', borderRadius: '10px', padding: '0.8rem 0.5rem 0.3rem', position: 'relative' }}>
                {temps.map((t, i) => {
                    const h = ((t - min) / range) * 55 + 10;
                    const hour = times[i] ? new Date(times[i]).getHours() : i;
                    const isNight = hour < 6 || hour > 19;
                    return (
                        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }} title={`${hour}:00 → ${t}°C`}>
                            <div style={{ height: `${h}px`, width: '100%', background: isNight ? '#7c3aed' : 'linear-gradient(to top, #f59e0b, #ef4444)', borderRadius: '3px 3px 0 0', transition: 'all 0.3s' }}></div>
                            {i % 6 === 0 && <span style={{ fontSize: '0.55rem', color: '#888', whiteSpace: 'nowrap' }}>{hour}h</span>}
                        </div>
                    );
                })}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.3rem' }}>
                <span style={{ fontSize: '0.75rem', color: '#3b82f6', fontWeight: 600 }}>↓ {min}°C</span>
                <span style={{ fontSize: '0.75rem', color: '#ef4444', fontWeight: 600 }}>↑ {max}°C</span>
            </div>
        </div>
    );
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function WeatherReport() {
    const [status, setStatus] = useState('idle');   // idle | locating | loading | done | error
    const [weather, setWeather] = useState(null);
    const [location, setLocation] = useState(null);
    const [error, setError] = useState('');
    const [manual, setManual] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [searching, setSearching] = useState(false);

    // ── Fetch weather by lat/lon ───────────────────────────────────────────
    const fetchWeather = useCallback(async (lat, lon, locName) => {
        setStatus('loading');
        try {
            const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
                `&current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,wind_direction_10m,precipitation,weather_code,surface_pressure,visibility` +
                `&hourly=temperature_2m,precipitation_probability,soil_temperature_0cm,soil_moisture_0_to_1cm` +
                `&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max,uv_index_max,sunrise,sunset` +
                `&timezone=auto&forecast_days=7`;
            const res = await fetch(url);
            const data = await res.json();
            setWeather(data);
            setLocation(locName || `${lat.toFixed(2)}°N, ${lon.toFixed(2)}°E`);
            setStatus('done');
        } catch {
            setError('Failed to fetch weather data. Please try again.');
            setStatus('error');
        }
    }, []);

    // ── GPS auto-detect ───────────────────────────────────────────────────
    const detectLocation = useCallback(() => {
        if (!navigator.geolocation) { setError('Geolocation not supported by your browser.'); setStatus('error'); return; }
        setStatus('locating');
        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                const { latitude, longitude } = pos.coords;
                // Reverse geocode with Nominatim
                try {
                    const geoRes = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&accept-language=en`);
                    const geoData = await geoRes.json();
                    const addr = geoData.address;
                    const locName = [addr.village || addr.town || addr.city, addr.state, addr.country].filter(Boolean).join(', ');
                    await fetchWeather(latitude, longitude, locName);
                } catch {
                    await fetchWeather(latitude, longitude, null);
                }
            },
            (err) => {
                if (err.code === 1) setError('Location access denied. Please allow location or search manually.');
                else setError('Unable to detect location. Please search manually.');
                setStatus('error');
            },
            { timeout: 12000 }
        );
    }, [fetchWeather]);

    // ── Manual search via Nominatim geocoding ──────────────────────────────
    const handleSearch = async () => {
        if (!manual.trim()) return;
        setSearching(true);
        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(manual)}&format=json&limit=5&accept-language=en`);
            const data = await res.json();
            setSearchResults(data);
        } catch {
            setError('Search failed. Check your connection.');
        } finally {
            setSearching(false);
        }
    };

    const selectResult = async (r) => {
        setSearchResults([]);
        setManual('');
        await fetchWeather(parseFloat(r.lat), parseFloat(r.lon), r.display_name.split(',').slice(0, 3).join(', '));
    };

    // ── Data helpers ──────────────────────────────────────────────────────
    const cur = weather?.current;
    const daily = weather?.daily;
    const hourly = weather?.hourly;
    const adv = cur ? getAdvisories(cur, daily) : [];
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const statCard = (icon, label, value, sub, color = '#1f4037') => (
        <div style={{ background: 'white', borderRadius: '14px', padding: '1.2rem 1.5rem', boxShadow: '0 4px 12px rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', gap: '1rem', border: '1px solid #f0f0f0' }}>
            <div style={{ fontSize: '2rem', lineHeight: 1 }}>{icon}</div>
            <div>
                <p style={{ fontSize: '0.78rem', color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</p>
                <p style={{ fontSize: '1.3rem', fontWeight: 700, color }}>{value}</p>
                {sub && <p style={{ fontSize: '0.75rem', color: '#aaa', marginTop: '1px' }}>{sub}</p>}
            </div>
        </div>
    );

    // ── STATES ────────────────────────────────────────────────────────────
    if (status === 'idle') return (
        <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
            <div style={{ background: 'linear-gradient(135deg,#1f4037 0%,#2563eb 100%)', padding: '3rem', borderRadius: '24px', color: 'white', maxWidth: '600px', margin: '0 auto', boxShadow: '0 20px 60px rgba(31,64,55,0.3)' }}>
                <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🌦️</div>
                <h2 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '0.8rem' }}>AgriWeather Live</h2>
                <p style={{ opacity: 0.85, marginBottom: '2rem', lineHeight: 1.6 }}>
                    Get real-time weather conditions, 7-day forecast, soil data, and farm-specific advisories for your exact location.
                </p>
                <button onClick={detectLocation}
                    style={{ background: '#a7e608', color: '#1f4037', border: 'none', padding: '1rem 2.5rem', borderRadius: '30px', fontSize: '1.1rem', fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.6rem', transition: 'all 0.2s', boxShadow: '0 5px 20px rgba(167,230,8,0.4)' }}
                    onMouseOver={e => e.currentTarget.style.transform = 'translateY(-3px)'}
                    onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
                    <i className="fa-solid fa-location-dot"></i> Use My Location
                </button>
                <p style={{ marginTop: '1.5rem', opacity: 0.6, fontSize: '0.85rem' }}>— or search by city / district below —</p>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', position: 'relative' }}>
                    <input value={manual} onChange={e => setManual(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSearch()}
                        placeholder="e.g. Ludhiana, Punjab..."
                        style={{ flex: 1, padding: '0.9rem 1.2rem', borderRadius: '10px', border: 'none', fontSize: '0.95rem', outline: 'none', color: '#333' }} />
                    <button onClick={handleSearch} disabled={searching}
                        style={{ padding: '0.9rem 1.5rem', background: '#1f4037', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 700 }}>
                        {searching ? '...' : '🔍 Search'}
                    </button>
                </div>
                {searchResults.length > 0 && (
                    <div style={{ background: 'white', borderRadius: '10px', overflow: 'hidden', textAlign: 'left', marginTop: '0.5rem' }}>
                        {searchResults.map(r => (
                            <div key={r.place_id} onClick={() => selectResult(r)} style={{ padding: '0.8rem 1rem', cursor: 'pointer', color: '#333', borderBottom: '1px solid #f0f0f0', fontSize: '0.9rem' }}
                                onMouseOver={e => e.currentTarget.style.background = '#f1f8e9'}
                                onMouseOut={e => e.currentTarget.style.background = 'white'}>
                                📍 {r.display_name.split(',').slice(0, 4).join(', ')}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );

    if (status === 'locating' || status === 'loading') return (
        <div style={{ textAlign: 'center', padding: '5rem 1rem' }}>
            <div style={{ width: '80px', height: '80px', background: 'linear-gradient(135deg,#1f4037,#4caf50)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', animation: 'pulse 1.5s infinite' }}>
                <i className="fa-solid fa-location-dot" style={{ fontSize: '2rem', color: 'white' }}></i>
            </div>
            <h3 style={{ color: '#1f4037', fontSize: '1.4rem', marginBottom: '0.5rem' }}>
                {status === 'locating' ? 'Detecting your location...' : 'Fetching live weather data...'}
            </h3>
            <p style={{ color: '#888' }}>{status === 'locating' ? 'Please allow location access in your browser.' : 'Connecting to Open-Meteo weather service'}</p>
        </div>
    );

    if (status === 'error') return (
        <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
            <div style={{ background: '#fee2e2', padding: '2rem', borderRadius: '16px', maxWidth: '500px', margin: '0 auto' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
                <h3 style={{ color: '#991b1b', marginBottom: '1rem' }}>{error}</h3>
                <button onClick={() => setStatus('idle')}
                    style={{ padding: '0.9rem 2rem', background: '#1f4037', color: 'white', border: 'none', borderRadius: '30px', cursor: 'pointer', fontWeight: 600 }}>
                    Try Again
                </button>
            </div>
        </div>
    );

    // ── MAIN WEATHER DASHBOARD ─────────────────────────────────────────────
    const todayWC = wc(cur.weather_code);
    const sunrise = daily?.sunrise?.[0] ? new Date(daily.sunrise[0]).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '--';
    const sunset = daily?.sunset?.[0] ? new Date(daily.sunset[0]).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '--';

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.8rem' }}>

            {/* ── Top Bar: Location & Refresh ─────── */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                    <div style={{ background: '#e8f5e9', padding: '0.6rem', borderRadius: '50%' }}>
                        <i className="fa-solid fa-location-dot" style={{ color: '#388e3c', fontSize: '1rem' }}></i>
                    </div>
                    <div>
                        <p style={{ fontSize: '0.75rem', color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Weather for</p>
                        <p style={{ fontSize: '1rem', fontWeight: 600, color: '#1f4037' }}>{location}</p>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap' }}>
                    <button onClick={() => { setStatus('idle'); setWeather(null); setSearchResults([]); }}
                        style={{ padding: '0.6rem 1.2rem', background: '#f1f8e9', color: '#388e3c', border: '1px solid #c5e1a5', borderRadius: '20px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                        🔍 Change Location
                    </button>
                    <button onClick={detectLocation}
                        style={{ padding: '0.6rem 1.2rem', background: '#e8f5e9', color: '#388e3c', border: '1px solid #c5e1a5', borderRadius: '20px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                        <i className="fa-solid fa-rotate"></i> Refresh
                    </button>
                </div>
            </div>

            {/* ── Hero Current Conditions ─────────────────────────────────── */}
            <div style={{ background: `linear-gradient(135deg, ${todayWC.color}22 0%, ${todayWC.color}08 100%)`, border: `1px solid ${todayWC.color}44`, borderRadius: '20px', padding: '2.5rem', display: 'flex', gap: '2rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', flexWrap: 'wrap' }}>
                    <div style={{ fontSize: '5rem', lineHeight: 1 }}>{todayWC.icon}</div>
                    <div>
                        <p style={{ fontSize: '5rem', fontWeight: 800, color: '#1f4037', lineHeight: 1 }}>{Math.round(cur.temperature_2m)}°<span style={{ fontSize: '2rem', opacity: 0.5 }}>C</span></p>
                        <p style={{ fontSize: '1.3rem', color: '#555', marginTop: '0.3rem' }}>{todayWC.label}</p>
                        <p style={{ fontSize: '0.9rem', color: '#888' }}>Feels like {Math.round(cur.apparent_temperature)}°C</p>
                    </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem', minWidth: '280px' }}>
                    {statCard('💧', 'Humidity', `${cur.relative_humidity_2m}%`, 'Relative humidity')}
                    {statCard('💨', 'Wind', `${Math.round(cur.wind_speed_10m)} km/h`, windDir(cur.wind_direction_10m))}
                    {statCard('🌧️', "Today's Rain", `${(daily?.precipitation_sum?.[0] || 0).toFixed(1)} mm`, 'Expected rainfall')}
                    {statCard('👁️', 'Visibility', `${Math.round((cur.visibility || 10000) / 1000)} km`, 'Current visibility', '#7c3aed')}
                </div>
            </div>

            {/* ── Extra Stats Row ─────────────────────────────────────────── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem' }}>
                {statCard('🌅', 'Sunrise', sunrise, 'Today')}
                {statCard('🌇', 'Sunset', sunset, 'Today')}
                {statCard('☀️', 'UV Index', daily?.uv_index_max?.[0]?.toFixed(1) || '--', daily?.uv_index_max?.[0] > 5 ? 'High — protect skin' : 'Low — safe')}
                {statCard('🌡️', 'High / Low', `${Math.round(daily?.temperature_2m_max?.[0])}° / ${Math.round(daily?.temperature_2m_min?.[0])}°`, 'Today\'s range')}
                {statCard('📊', 'Pressure', `${Math.round(cur.surface_pressure)} hPa`, cur.surface_pressure > 1015 ? 'High — stable' : 'Low — unsettled')}
                {statCard('🌱', 'Soil Temp', hourly?.soil_temperature_0cm?.[0] ? `${Math.round(hourly.soil_temperature_0cm[0])}°C` : '--', 'Surface layer')}
            </div>

            {/* ── 24h Temperature Chart ────────────────────────────────────── */}
            <div style={{ background: 'white', borderRadius: '16px', padding: '1.8rem', boxShadow: '0 4px 15px rgba(0,0,0,0.06)' }}>
                <TempChart hourly={hourly} />
            </div>

            {/* ── 7-Day Forecast ───────────────────────────────────────────── */}
            <div>
                <h3 style={{ fontSize: '1.2rem', color: '#1f4037', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    📅 7-Day Forecast
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.8rem' }}>
                    {(daily?.weather_code || []).map((code, i) => {
                        const d = wc(code);
                        const date = new Date(daily.time[i]);
                        const dayName = i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : days[date.getDay()];
                        return (
                            <div key={i} style={{ background: d.bg, border: `1px solid ${d.color}33`, borderRadius: '14px', padding: '1.2rem 0.8rem', textAlign: 'center', transition: 'transform 0.2s' }}
                                onMouseOver={e => e.currentTarget.style.transform = 'translateY(-4px)'}
                                onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
                                <p style={{ fontSize: '0.8rem', fontWeight: 600, color: '#888', marginBottom: '0.5rem' }}>{dayName}</p>
                                <p style={{ fontSize: '2.2rem', lineHeight: 1, marginBottom: '0.5rem' }}>{d.icon}</p>
                                <p style={{ fontSize: '0.75rem', color: d.color, fontWeight: 600, marginBottom: '0.5rem' }}>{d.label}</p>
                                <p style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1f4037' }}>
                                    {Math.round(daily.temperature_2m_max[i])}° <span style={{ color: '#93c5fd', fontWeight: 400 }}>/ {Math.round(daily.temperature_2m_min[i])}°</span>
                                </p>
                                {daily.precipitation_sum[i] > 0 && (
                                    <p style={{ fontSize: '0.7rem', color: '#3b82f6', marginTop: '0.3rem' }}>🌧 {daily.precipitation_sum[i].toFixed(1)}mm</p>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* ── Agricultural Advisories ─────────────────────────────────── */}
            <div>
                <h3 style={{ fontSize: '1.2rem', color: '#1f4037', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    🌾 Farm Advisories
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                    {adv.map((a, i) => {
                        const s = advStyle[a.type];
                        return (
                            <div key={i} style={{ background: s.bg, border: `1px solid ${s.border}`, borderRadius: '12px', padding: '1rem 1.5rem', display: 'flex', alignItems: 'flex-start', gap: '0.8rem', color: s.color }}>
                                <span style={{ fontSize: '1.3rem', lineHeight: 1 }}>{a.icon}</span>
                                <p style={{ fontSize: '0.95rem', fontWeight: 500, lineHeight: 1.5 }}>{a.msg}</p>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* ── Soil Moisture Strip ─────────────────────────────────────── */}
            {hourly?.soil_moisture_0_to_1cm && (
                <div style={{ background: 'white', borderRadius: '16px', padding: '1.8rem', boxShadow: '0 4px 15px rgba(0,0,0,0.06)' }}>
                    <h3 style={{ fontSize: '1.1rem', color: '#1f4037', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        🧱 Soil Moisture (Surface Layer)
                    </h3>
                    {(() => {
                        const moisture = hourly.soil_moisture_0_to_1cm[0];
                        const pct = Math.min(100, Math.round(moisture * 100));
                        let label = 'Dry', barColor = '#fcd34d';
                        if (pct > 40) { label = 'Adequate'; barColor = '#4caf50'; }
                        if (pct > 70) { label = 'Saturated'; barColor = '#3b82f6'; }
                        return (
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                    <span style={{ fontSize: '0.85rem', color: '#666' }}>Current: <strong>{moisture.toFixed(3)} m³/m³</strong></span>
                                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: barColor }}>{label}</span>
                                </div>
                                <div style={{ height: '12px', background: '#e5e7eb', borderRadius: '6px', overflow: 'hidden' }}>
                                    <div style={{ height: '100%', width: `${pct}%`, background: barColor, borderRadius: '6px', transition: 'width 1s ease' }}></div>
                                </div>
                                <p style={{ fontSize: '0.78rem', color: '#888', marginTop: '0.5rem' }}>
                                    {pct < 30 ? '⚠️ Soil is too dry. Irrigation recommended.' : pct > 70 ? '⚠️ Soil is saturated. Delay irrigation and check drainage.' : '✅ Soil moisture is in the optimal range for most crops.'}
                                </p>
                            </div>
                        );
                    })()}
                </div>
            )}

            {/* ── Data Attribution ─────────────────────────────────────────── */}
            <p style={{ textAlign: 'center', fontSize: '0.75rem', color: '#ccc' }}>
                Weather data by <a href="https://open-meteo.com" target="_blank" rel="noreferrer" style={{ color: '#4caf50' }}>Open-Meteo</a> · Geocoding by <a href="https://nominatim.org" target="_blank" rel="noreferrer" style={{ color: '#4caf50' }}>OpenStreetMap Nominatim</a>
            </p>
        </div>
    );
}
