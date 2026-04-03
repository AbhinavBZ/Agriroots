import React, { useState, useEffect } from 'react';

const centersData = [
    {
        state: "Punjab",
        centers: [
            { name: "Ludhiana Agri-Center", address: "123 Kisan Marg, Ludhiana", phone: "+91 98765 43210", email: "ludhiana@agriroots.in" },
            { name: "Amritsar Hub", address: "45 Heritage Road, Amritsar", phone: "+91 87654 32109", email: "amritsar@agriroots.in" }
        ]
    },
    {
        state: "Maharashtra",
        centers: [
            { name: "Pune Krishi Kendra", address: "Sector 4, Shivaji Nagar, Pune", phone: "+91 76543 21098", email: "pune@agriroots.in" },
            { name: "Nagpur Advisory Center", address: "Orange City Square, Nagpur", phone: "+91 65432 10987", email: "nagpur@agriroots.in" }
        ]
    },
    {
        state: "Uttar Pradesh",
        centers: [
            { name: "Lucknow Kisan Bhavan", address: "Gomti Nagar, Lucknow", phone: "+91 54321 09876", email: "lucknow@agriroots.in" },
            { name: "Varanasi Seed Center", address: "Cantt Road, Varanasi", phone: "+91 43210 98765", email: "varanasi@agriroots.in" }
        ]
    },
    {
        state: "Karnataka",
        centers: [
            { name: "Bengaluru Tech Farm", address: "Electronic City Phase 2, Bengaluru", phone: "+91 32109 87654", email: "bengaluru@agriroots.in" }
        ]
    },
    {
        state: "Gujarat",
        centers: [
            { name: "Ahmedabad Krishi Seva", address: "Navrangpura, Ahmedabad", phone: "+91 21098 76543", email: "ahmedabad@agriroots.in" },
            { name: "Surat Agro Hub", address: "Ring Road, Surat", phone: "+91 10987 65432", email: "surat@agriroots.in" }
        ]
    },
    {
        state: "Tamil Nadu",
        centers: [
            { name: "Chennai Farm Center", address: "T Nagar, Chennai", phone: "+91 99887 76655", email: "chennai@agriroots.in" },
            { name: "Coimbatore Seed Hub", address: "RS Puram, Coimbatore", phone: "+91 88776 65544", email: "coimbatore@agriroots.in" }
        ]
    },
    {
        state: "Rajasthan",
        centers: [
            { name: "Jaipur Kisan Kendra", address: "Tonk Road, Jaipur", phone: "+91 77665 54433", email: "jaipur@agriroots.in" },
            { name: "Jodhpur Agri Point", address: "Mandore, Jodhpur", phone: "+91 66554 43322", email: "jodhpur@agriroots.in" }
        ]
    },
    {
        state: "West Bengal",
        centers: [
            { name: "Kolkata Farm Hub", address: "Sector 5, Kolkata", phone: "+91 55443 32211", email: "kolkata@agriroots.in" }
        ]
    }
];

function Centers() {
    const [selectedState, setSelectedState] = useState(centersData[0].state);

    useEffect(() => { document.title = 'Our Centers | AgriRoots'; }, []);

    const activeStateData = centersData.find(s => s.state === selectedState);

    return (
        <div className="page-container" style={{ padding: '6rem 5%', minHeight: '80vh', backgroundColor: '#f9fbf9' }}>
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                <h1 style={{ fontSize: '3rem', color: '#388e3c', marginBottom: '1rem', fontWeight: 500 }}>Our Regional Centers</h1>
                <p style={{ color: '#666', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>Find an AgriRoots center near you for in-person consultation, soil testing, and equipment purchase.</p>
                <div style={{ width: '80px', height: '4px', backgroundColor: '#4caf50', margin: '1.5rem auto' }}></div>
            </div>

            <div style={{ maxWidth: '1100px', margin: '0 auto', background: '#fff', borderRadius: '15px', overflow: 'hidden', boxShadow: '0 5px 20px rgba(0,0,0,0.08)' }}>
                {/* Selection Bar */}
                <div style={{ display: 'flex', flexWrap: 'wrap', backgroundColor: '#3b6b23' }}>
                    {centersData.map((s, idx) => (
                        <button
                            key={idx}
                            onClick={() => setSelectedState(s.state)}
                            style={{
                                flex: '1 1 25%',
                                minWidth: '150px',
                                padding: '1rem 1.5rem',
                                color: '#fff',
                                background: selectedState === s.state ? 'rgba(255,255,255,0.1)' : 'transparent',
                                border: 'none',
                                borderBottom: selectedState === s.state ? '4px solid #a7e608' : '4px solid transparent',
                                cursor: 'pointer',
                                fontSize: '1rem',
                                fontWeight: selectedState === s.state ? '500' : '300',
                                whiteSpace: 'nowrap',
                                transition: 'all 0.3s'
                            }}
                        >
                            <i className="fa-solid fa-map-location-dot" style={{ marginRight: '0.5rem', color: selectedState === s.state ? '#a7e608' : '#fff' }}></i>
                            {s.state}
                        </button>
                    ))}
                </div>

                {/* Table View */}
                <div style={{ padding: '2rem' }}>
                    <h2 style={{ fontSize: '1.5rem', color: '#1f4037', marginBottom: '1.5rem' }}>
                        Centers in {selectedState}
                    </h2>

                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr>
                                    <th style={{ backgroundColor: '#649729', color: '#fff', padding: '1rem', fontWeight: 400, borderTopLeftRadius: '8px' }}>Center Name</th>
                                    <th style={{ backgroundColor: '#649729', color: '#fff', padding: '1rem', fontWeight: 400 }}>Address</th>
                                    <th style={{ backgroundColor: '#649729', color: '#fff', padding: '1rem', fontWeight: 400 }}>Phone</th>
                                    <th style={{ backgroundColor: '#649729', color: '#fff', padding: '1rem', fontWeight: 400, borderTopRightRadius: '8px' }}>Email</th>
                                </tr>
                            </thead>
                            <tbody>
                                {activeStateData.centers.map((center, idx) => (
                                    <tr key={idx} style={{ backgroundColor: idx % 2 === 0 ? '#f1f8e9' : 'transparent', borderBottom: '1px solid #eee' }}>
                                        <td style={{ padding: '1rem', color: '#000', fontWeight: '500' }}>{center.name}</td>
                                        <td style={{ padding: '1rem', color: '#333' }}>{center.address}</td>
                                        <td style={{ padding: '1rem', color: '#333' }}>{center.phone}</td>
                                        <td style={{ padding: '1rem', color: '#333' }}>{center.email}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Centers;
