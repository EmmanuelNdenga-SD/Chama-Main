import React, { useState, useEffect } from 'react';
import apiClient from '../services/api';

const UserDashboard = () => {
    const [contributions, setContributions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        apiClient.get('/user/my-contributions')
            .then(response => {
                setContributions(response.data);
            })
            .catch(error => {
                console.error("Error fetching contributions:", error);
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    const totalContributions = contributions.reduce((sum, contribution) => sum + contribution.amount, 0);

    if (loading) {
        return (
            <div className="text-center py-5">
                <div className="spinner-border text-primary" style={{ width: '3rem', height: '3rem' }} role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
                <h4 className="mt-3">Loading Your Ledger...</h4>
            </div>
        );
    }

    return (
        <div>
            <h1 className="mb-4"><i className="fas fa-file-invoice-dollar me-3 text-primary"></i>My Contributions Ledger</h1>
            <div className="card shadow-sm mb-5">
                <div className="card-body text-center p-4">
                    <h5 className="card-title text-secondary">TOTAL CONTRIBUTED</h5>
                    <p className="card-text display-4 text-primary" style={{ fontFamily: 'monospace' }}>${totalContributions.toFixed(2)}</p>
                    <small className="text-muted">Across {contributions.length} contributions</small>
                </div>
            </div>

            {contributions.length === 0 ? (
                <div className="card text-center p-5">
                    <div className="card-body">
                        <i className="fas fa-folder-open fa-3x text-muted mb-3"></i>
                        <h5 className="card-title">No Contributions Found</h5>
                        <p className="card-text">It looks like the admin hasn't posted any of your contributions yet.</p>
                    </div>
                </div>
            ) : (
                <div className="ledger-list">
                    <div className="ledger-header" style={{ gridTemplateColumns: '3fr 1fr' }}>
                        <div>Date of Contribution</div>
                        <div style={{ textAlign: 'right' }}>Amount</div>
                    </div>
                    {contributions.map(c => (
                        <div key={c.id} className="ledger-item" style={{ gridTemplateColumns: '3fr 1fr' }}>
                            <div className="date">{new Date(c.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                            <div className="amount" style={{ textAlign: 'right', fontFamily: 'monospace', fontSize: '1.1rem' }}>${c.amount.toFixed(2)}</div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default UserDashboard;