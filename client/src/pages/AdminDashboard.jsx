import React, { useState, useEffect } from 'react';
import apiClient from '../services/api';
import { useFormik } from 'formik';
import * as Yup from 'yup';

const StatCard = ({ title, value, icon }) => (
    <div className="card shadow-sm h-100">
        <div className="card-body d-flex flex-column justify-content-center">
            <div className="d-flex align-items-center">
                <div className="fs-1 text-primary me-3"><i className={icon}></i></div>
                <div>
                    <h6 className="card-title text-secondary text-uppercase">{title}</h6>
                    <p className="card-text fs-4 fw-bold mb-0">{value}</p>
                </div>
            </div>
        </div>
    </div>
);

const AdminDashboard = () => {
    const [users, setUsers] = useState([]);
    const [contributions, setContributions] = useState([]);
    const [editingContribution, setEditingContribution] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchAllData = async () => {
        try {
            const [usersRes, contributionsRes] = await Promise.all([
                apiClient.get('/admin/users'),
                apiClient.get('/admin/contributions')
            ]);
            setUsers(usersRes.data);
            setContributions(contributionsRes.data);
        } catch (error) {
            console.error("Failed to fetch data", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchAllData() }, []);

    const formik = useFormik({
        initialValues: { amount: '', date: '', user_id: '' },
        enableReinitialize: true,
        validationSchema: Yup.object({
            amount: Yup.number().positive('Must be a positive number').required('Amount is required'),
            date: Yup.date().required('Date is required'),
            user_id: Yup.number().required('You must select a member'),
        }),
        onSubmit: async (values, { resetForm, setSubmitting }) => {
            const payload = { ...values, user_id: parseInt(values.user_id) };
            try {
                if (editingContribution) {
                    await apiClient.put(`/admin/contributions/${editingContribution.id}`, payload);
                } else {
                    await apiClient.post('/admin/contributions', payload);
                }
                resetForm();
                setEditingContribution(null);
                fetchAllData();
            } catch (error) {
                console.error("Failed to save contribution", error);
            } finally {
                setSubmitting(false);
            }
        },
    });

    const handleEdit = (contribution) => {
        const formattedDate = new Date(contribution.date).toISOString().split('T')[0];
        formik.setValues({ amount: contribution.amount, date: formattedDate, user_id: contribution.user_id });
        window.scrollTo(0, 0);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to permanently delete this contribution?')) {
            await apiClient.delete(`/admin/contributions/${id}`);
            fetchAllData();
        }
    };

    const totalCollected = contributions.reduce((sum, c) => sum + c.amount, 0);

    if (loading) {
        return (
            <div className="text-center py-5">
                <div className="spinner-border text-primary" style={{ width: '3rem', height: '3rem' }}></div>
                <h4 className="mt-3">Loading Admin Panel...</h4>
            </div>
        );
    }

    return (
        <div>
            <h1 className="mb-4"><i className="fas fa-tachometer-alt me-3 text-primary"></i>Admin Control Panel</h1>
            <div className="row g-4 mb-5">
                <div className="col-md-4"><StatCard title="Total Collected" value={`$${totalCollected.toFixed(2)}`} icon="fas fa-dollar-sign" /></div>
                <div className="col-md-4"><StatCard title="Total Members" value={users.length} icon="fas fa-users" /></div>
                <div className="col-md-4"><StatCard title="Total Transactions" value={contributions.length} icon="fas fa-exchange-alt" /></div>
            </div>

            <div className="row g-5">
                <div className="col-lg-4">
                    <h3 className="mb-3"><i className="fas fa-edit me-2 text-primary"></i>{editingContribution ? 'Edit Entry' : 'New Contribution'}</h3>
                    <div className="card p-4 shadow-sm">
                        <form onSubmit={formik.handleSubmit}>
                            <div className="mb-3">
                                <label className="form-label">Member</label>
                                <select name="user_id" className={`form-select ${formik.touched.user_id && formik.errors.user_id ? 'is-invalid' : ''}`} {...formik.getFieldProps('user_id')}>
                                    <option value="">Select a member...</option>
                                    {users.filter(u => !u.is_admin).map(u => <option key={u.id} value={u.id}>{u.username}</option>)}
                                </select>
                                {formik.touched.user_id && formik.errors.user_id && <div className="invalid-feedback">{formik.errors.user_id}</div>}
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Amount</label>
                                <input name="amount" type="number" step="0.01" placeholder="0.00" className={`form-control ${formik.touched.amount && formik.errors.amount ? 'is-invalid' : ''}`} {...formik.getFieldProps('amount')} />
                                {formik.touched.amount && formik.errors.amount && <div className="invalid-feedback">{formik.errors.amount}</div>}
                            </div>
                            <div className="mb-4">
                                <label className="form-label">Date</label>
                                <input name="date" type="date" className={`form-control ${formik.touched.date && formik.errors.date ? 'is-invalid' : ''}`} {...formik.getFieldProps('date')} />
                                {formik.touched.date && formik.errors.date && <div className="invalid-feedback">{formik.errors.date}</div>}
                            </div>
                            <button type="submit" className="btn btn-primary w-100 mb-2" disabled={formik.isSubmitting}>
                                <i className={`fas ${editingContribution ? 'fa-save' : 'fa-plus'} me-2`}></i>
                                {formik.isSubmitting ? 'Saving...' : (editingContribution ? 'Update Entry' : 'Add Entry')}
                            </button>
                            {editingContribution && <button type="button" className="btn btn-secondary w-100" onClick={() => { setEditingContribution(null); formik.resetForm(); }}>Cancel Edit</button>}
                        </form>
                    </div>
                </div>

                <div className="col-lg-8">
                     <h3 className="mb-3"><i className="fas fa-book me-2 text-primary"></i>Master Contributions Ledger</h3>
                    {contributions.length === 0 ? (
                        <div className="card text-center p-5"><div className="card-body"><i className="fas fa-folder-open fa-3x text-muted mb-3"></i><h5 className="card-title">The Ledger is Empty</h5><p className="card-text">Use the form on the left to add the first contribution.</p></div></div>
                    ) : (
                        <div className="ledger-list">
                            <div className="ledger-header" style={{gridTemplateColumns: '2fr 1fr 1fr .8fr'}}><div>Member</div><div>Date</div><div>Amount</div><div className="text-end">Actions</div></div>
                            {contributions.map(c => (
                                <div key={c.id} className="ledger-item" style={{gridTemplateColumns: '2fr 1fr 1fr .8fr'}}>
                                    <div className="user-name">{users.find(u => u.id === c.user_id)?.username || 'Unknown'}</div>
                                    <div className="date">{new Date(c.date).toLocaleDateString()}</div>
                                    <div className="amount" style={{fontFamily: 'monospace'}}>${c.amount.toFixed(2)}</div>
                                    <div className="actions text-end">
                                        <button title="Edit" className="btn btn-sm btn-outline-primary me-2" onClick={() => handleEdit(c)}><i className="fas fa-pencil-alt"></i></button>
                                        <button title="Delete" className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(c.id)}><i className="fas fa-trash-alt"></i></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;