import React, { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import apiClient from '../services/api';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const LoginPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [formError, setFormError] = useState('');
    const successMessage = location.state?.message;

    const formik = useFormik({
        initialValues: { username: '', password: '' },
        validationSchema: Yup.object({
            username: Yup.string().required('Username is required'),
            password: Yup.string().required('Password is required'),
        }),
        onSubmit: async (values, { setSubmitting }) => {
            setFormError('');
            try {
                const response = await apiClient.post('/auth/login', values);
                localStorage.setItem('token', response.data.access_token);
                const user = jwtDecode(response.data.access_token);

                if (user.is_admin) {
                    navigate('/admin');
                } else {
                    navigate('/dashboard');
                }
                window.location.reload();
            } catch (error) {
                setFormError('Invalid username or password. Please try again.');
            } finally {
                setSubmitting(false);
            }
        },
    });

    return (
        <div className="row justify-content-center mt-5">
            <div className="col-md-6 col-lg-5 col-xl-4">
                <div className="card p-4 shadow">
                    <h2 className="text-center mb-4">Member Login</h2>
                    <form onSubmit={formik.handleSubmit}>
                        {successMessage && <div className="alert alert-success">{successMessage}</div>}
                        {formError && <div className="alert alert-danger">{formError}</div>}
                        
                        <div className="mb-3 form-group">
                            <i className="fas fa-user form-icon"></i>
                            <input name="username" type="text" className={`form-control ${formik.touched.username && formik.errors.username ? 'is-invalid' : ''}`} placeholder="Username" {...formik.getFieldProps('username')} />
                            {formik.touched.username && formik.errors.username && <div className="invalid-feedback">{formik.errors.username}</div>}
                        </div>

                        <div className="mb-4 form-group">
                            <i className="fas fa-lock form-icon"></i>
                            <input name="password" type="password" className={`form-control ${formik.touched.password && formik.errors.password ? 'is-invalid' : ''}`} placeholder="Password" {...formik.getFieldProps('password')} />
                            {formik.touched.password && formik.errors.password && <div className="invalid-feedback">{formik.errors.password}</div>}
                        </div>

                        <button type="submit" className="btn btn-primary w-100" disabled={formik.isSubmitting}>
                            {formik.isSubmitting ? 'Logging in...' : <><i className="fas fa-sign-in-alt me-2"></i>Login</>}
                        </button>
                    </form>
                    <div className="text-center mt-3">
                        <small>Don't have an account? <Link to="/signup">Sign Up Here</Link></small>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;