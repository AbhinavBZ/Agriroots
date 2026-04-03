const BASE_URL = import.meta.env.PROD ? '/api' : 'http://localhost:5000/api';

function getToken() {
    return localStorage.getItem('agriToken');
}

async function request(path, options = {}) {
    const token = getToken();
    const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'API error');
    return data;
}

// ── Auth ──────────────────────────────────────────────────────
export const api = {
    auth: {
        register: (body) => request('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
        login: (body) => request('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
        me: () => request('/auth/me'),
        updateProfile: (body) => request('/auth/profile', { method: 'PUT', body: JSON.stringify(body) }),
        changePassword: (body) => request('/auth/change-password', { method: 'PUT', body: JSON.stringify(body) }),
    },
    // ── Services ───────────────────────────────────────────────
    services: {
        getAll: () => request('/services'),
    },
    // ── Shop ──────────────────────────────────────────────────
    shop: {
        getItems: (tag) => request(`/shop-items${tag && tag !== 'All' ? `?tag=${tag}` : ''}`),
    },
    // ── Cart ──────────────────────────────────────────────────
    cart: {
        get: () => request('/cart'),
        add: (shop_item_id, quantity = 1) => request('/cart', { method: 'POST', body: JSON.stringify({ shop_item_id, quantity }) }),
        update: (id, quantity) => request(`/cart/${id}`, { method: 'PUT', body: JSON.stringify({ quantity }) }),
        remove: (id) => request(`/cart/${id}`, { method: 'DELETE' }),
        clear: () => request('/cart', { method: 'DELETE' }),
    },
    // ── Orders ────────────────────────────────────────────────
    orders: {
        get: () => request('/orders'),
        place: (shippingAddress) => request('/orders', { method: 'POST', body: JSON.stringify({ shippingAddress }) }),
    },
    // ── Crop Guide ────────────────────────────────────────────
    crops: {
        getAll: () => request('/crops'),
        getSeasons: () => request('/seasonal-patterns'),
    },
    // ── AgricultureData tabs ──────────────────────────────────
    agri: {
        cropsGuide: () => request('/agri/crops-guide'),
        tools: () => request('/agri/tools'),
        products: () => request('/agri/products'),
        policies: () => request('/agri/policies'),
        loans: () => request('/agri/loans'),
    },
    // ── Loans & Insurance ─────────────────────────────────────
    loans: {
        apply: (loan_id) => request('/loan-applications', { method: 'POST', body: JSON.stringify({ loan_id }) }),
        myApplications: () => request('/loan-applications'),
    },
    insurance: {
        apply: (body) => request('/insurance', { method: 'POST', body: JSON.stringify(body) }),
    },
    // ── Market, MSP & Live Gov APIs ───────────────────────────
    market: {
        getPrices: () => request('/market-prices'),
        getMsp: () => request('/msp'),
        getCropProduction: () => request('/crop-production'),
        getFertilizerAvailability: () => request('/fertilizer-availability'),
        getPmkisanStats: () => request('/pmkisan-stats'),
    },
    // ── Feedback / Community ──────────────────────────────────
    feedback: {
        getAll: (params = {}) => {
            const q = new URLSearchParams(params).toString();
            return request(`/feedback${q ? '?' + q : ''}`);
        },
        post: (body) => request('/feedback', { method: 'POST', body: JSON.stringify(body) }),
        reply: (id, message) => request(`/feedback/${id}/reply`, { method: 'POST', body: JSON.stringify({ message }) }),
        like: (id) => request(`/feedback/${id}/like`, { method: 'POST' }),
        delete: (id) => request(`/feedback/${id}`, { method: 'DELETE' }),
    },
};
