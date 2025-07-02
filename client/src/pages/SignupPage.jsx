import React, { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import apiClient from '../services/api';
import { useNavigate, Link } from 'react-router-dom';

const SignupPage = () => {
    const navigate = useNavigate();
    const [formError, setFormError] = useState('');

    const formik = useFormik({
        initialValues: { username: '', email: '', password: '', confirmPassword: '' },
        validationSchema: Yup.object({
            username: Yup.string().min(3, 'Must be at least 3 characters').required('Username is required'),
            email: Yup.string().email('Invalid email address').required('Email is required'),
            password: Yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
            confirmPassword: Yup.string().oneOf([Yup.ref('password'), null], 'Passwords must match').required('Confirming your password is required'),
        }),
        onSubmit: async (values, { setSubmitting }) => {
            setFormError('');
            try {
                const { confirmPassword, ...dataToSend } = values;
                await apiClient.post('/auth/signup', dataToSend);
                navigate('/login', { state: { message: 'Signup successful! Please log in.' } });
            } catch (error) {
                if (error.response && error.response.status === 409) {
                    setFormError('Username or email already exists.');
                } else {
                    setFormError('An unexpected error occurred. Please try again.');
                }
            } finally {
                setSubmitting(false);
            }
        },
    });

    return (
        <div className="row justify-content-center mt-5">
            <div className="col-md-6 col-lg-5 col-xl-4">
                <div className="card p-4 shadow">
                    <h2 className="text-center mb-4">Create an Account</h2>
                    <form onSubmit={formik.handleSubmit}>
                        {formError && <div className="alert alert-danger">{formError}</div>}
                        
                        <div className="mb-3 form-group">
                            <i className="fas fa-user form-icon"></i>
                            <input name="username" type="text" className={`form-control ${formik.touched.username && formik.errors.username ? 'is-invalid' : ''}`} placeholder="Choose a username" {...formik.getFieldProps('username')} />
                            {formik.touched.username && formik.errors.username && <div className="invalid-feedback">{formik.errors.username}</div>}
                        </div>
                        <div className="mb-3 form-group">
                            <i className="fas fa-envelope form-icon"></i>
                            <input name="email" type="email" className={`form-control ${formik.touched.email && formik.errors.email ? 'is-invalid' : ''}`} placeholder="your.email@example.com" {...formik.getFieldProps('email')} />
                            {formik.touched.email && formik.errors.email && <div className="invalid-feedback">{formik.errors.email}</div>}
                        </div>
                        <div className="mb-3 form-group">
                            <i className="fas fa-lock form-icon"></i>
                            <input name="password" type="password" className={`form-control ${formik.touched.password && formik.errors.password ? 'is-invalid' : ''}`} placeholder="Create a password" {...formik.getFieldProps('password')} />
                            {formik.touched.password && formik.errors.password && <div className="invalid-feedback">{formik.errors.password}</div>}
                        </div>
                        <div className="mb-4 form-group">
                            <i className="fas fa-check-circle form-icon"></i>
                            <input name="confirmPassword" type="password" className={`form-control ${formik.touched.confirmPassword && formik.errors.confirmPassword ? 'is-invalid' : ''}`} placeholder="Confirm your password" {...formik.getFieldProps('confirmPassword')} />
                            {formik.touched.confirmPassword && formik.errors.confirmPassword && <div className="invalid-feedback">{formik.errors.confirmPassword}</div>}
                        </div>
                        <button type="submit" className="btn btn-primary w-100" disabled={formik.isSubmitting}>
                            {formik.isSubmitting ? 'Creating Account...' : <><i className="fas fa-user-plus me-2"></i>Sign Up</>}
                        </button>
                    </form>
                    <div className="text-center mt-3">
                        <small>Already have an account? <Link to="/login">Login Here</Link></small>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SignupPage;