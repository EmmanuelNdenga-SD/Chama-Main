import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const Navbar = () => {
    const navigate = useNavigate();
    const token = localStorage.getItem('token');
    let user = null;
    let decodedToken = null;

    if (token) {
        try {
            // Safely decode the token, preventing crashes from bad data
            decodedToken = jwtDecode(token);
            // 'sub' (subject) holds our identity data: {id, username}
            user = decodedToken.sub; 
        } catch (error) {
            console.error("Invalid token found in localStorage:", error);
            localStorage.removeItem('token');
        }
    }

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
        window.location.reload(); 
    };

    return (
        <nav className="navbar navbar-expand-lg navbar-dark bg-classic-primary shadow-sm">
            <div className="container">
                <NavLink className="navbar-brand" to="/">
                    <i className="fas fa-landmark me-2"></i>
                    ChamaSys
                </NavLink>

                <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarContent" aria-controls="navbarContent" aria-expanded="false" aria-label="Toggle navigation">
                    <span className="navbar-toggler-icon"></span>
                </button>

                <div className="collapse navbar-collapse" id="navbarContent">
                    <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                        {user && (
                            <li className="nav-item">
                                <NavLink className="nav-link" to="/dashboard">My Contributions</NavLink>
                            </li>
                        )}
                        {decodedToken && decodedToken.is_admin && (
                            <li className="nav-item">
                                <NavLink className="nav-link" to="/admin">Admin Panel</NavLink>
                            </li>
                        )}
                    </ul>

                    <ul className="navbar-nav ms-auto">
                        {!user ? (
                            <>
                                <li className="nav-item">
                                    <NavLink className="nav-link" to="/login"><i className="fas fa-sign-in-alt me-2"></i>Login</NavLink>
                                </li>
                                <li className="nav-item">
                                    <NavLink className="nav-link" to="/signup"><i className="fas fa-user-plus me-2"></i>Sign Up</NavLink>
                                </li>
                            </>
                        ) : (
                            <li className="nav-item dropdown">
                                <a className="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                                    <i className="fas fa-user-circle me-2"></i>
                                    Welcome, {user.username}
                                </a>
                                <ul className="dropdown-menu dropdown-menu-end">
                                    <li>
                                        <button className="dropdown-item" onClick={handleLogout}>
                                            <i className="fas fa-sign-out-alt me-2"></i>Logout
                                        </button>
                                    </li>
                                </ul>
                            </li>
                        )}
                    </ul>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;