import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FiMenu, FiX, FiBook, FiLogOut, FiUser, FiSettings } from 'react-icons/fi';
import './Navbar.css';

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => { setMenuOpen(false); }, [location]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/about', label: 'About' },
    { to: '/contact', label: 'Contact Us' },
    { to: '/membership', label: 'Membership' },
  ];

  return (
    <nav className={`navbar ${scrolled ? 'navbar-scrolled' : ''}`}>
      <div className="navbar-inner container">
        {/* Logo */}
        <Link to="/" className="navbar-logo">
          <div className="logo-icon"><FiBook /></div>
          <span className="logo-text">Study<span>Hub</span></span>
        </Link>

        {/* Desktop Nav */}
        <ul className="nav-links">
          {navLinks.map(link => (
            <li key={link.to}>
              <Link
                to={link.to}
                className={`nav-link ${location.pathname === link.to ? 'active' : ''}`}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Auth Buttons */}
        <div className="nav-actions">
          {user ? (
            <div className="user-menu">
              {isAdmin() && (
                <Link to="/admin" className="btn btn-ghost btn-sm">
                  <FiSettings size={14} /> Admin
                </Link>
              )}
              <div className="user-avatar-wrap">
                <div className="user-avatar">
                  {user.name?.charAt(0).toUpperCase()}
                </div>
                <div className="user-dropdown">
                  <div className="dropdown-header">
                    <p className="dropdown-name">{user.name}</p>
                    <p className="dropdown-email">{user.email}</p>
                    {user.isMember && <span className="badge badge-green" style={{fontSize:'11px',marginTop:'4px'}}>⭐ Member</span>}
                  </div>
                  <button onClick={handleLogout} className="dropdown-item">
                    <FiLogOut size={14} /> Logout
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="auth-btns">
              <Link to="/login" className="btn btn-ghost btn-sm">Login</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Register</Link>
            </div>
          )}

          {/* Mobile toggle */}
          <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <FiX size={22} /> : <FiMenu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="mobile-menu">
          {navLinks.map(link => (
            <Link key={link.to} to={link.to} className={`mobile-link ${location.pathname === link.to ? 'active' : ''}`}>
              {link.label}
            </Link>
          ))}
          {!user ? (
            <div className="mobile-auth">
              <Link to="/login" className="btn btn-secondary" style={{width:'100%',justifyContent:'center'}}>Login</Link>
              <Link to="/register" className="btn btn-primary" style={{width:'100%',justifyContent:'center'}}>Register</Link>
            </div>
          ) : (
            <div className="mobile-auth">
              {isAdmin() && <Link to="/admin" className="btn btn-ghost" style={{width:'100%',justifyContent:'center'}}>Admin Panel</Link>}
              <button onClick={handleLogout} className="btn btn-secondary" style={{width:'100%',justifyContent:'center'}}>
                <FiLogOut size={14} /> Logout
              </button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
