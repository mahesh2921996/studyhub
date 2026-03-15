import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { FiGrid, FiBook, FiUpload, FiUsers, FiSettings, FiLogOut, FiMenu, FiX, FiBook as FiLogo } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import './AdminLayout.css';

const navItems = [
  { to: '/admin', icon: FiGrid, label: 'Dashboard', exact: true },
  { to: '/admin/materials', icon: FiBook, label: 'Materials' },
  { to: '/admin/upload', icon: FiUpload, label: 'Upload' },
  { to: '/admin/users', icon: FiUsers, label: 'Users' },
  { to: '/admin/settings', icon: FiSettings, label: 'Settings' },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => { logout(); navigate('/'); };

  const isActive = (to, exact) => exact ? location.pathname === to : location.pathname.startsWith(to);

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className={`admin-sidebar ${collapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <div className="logo-icon-sm"><FiLogo size={16} /></div>
            {!collapsed && <span>StudyHub</span>}
          </div>
          <button className="collapse-btn" onClick={() => setCollapsed(!collapsed)}>
            {collapsed ? <FiMenu size={18} /> : <FiX size={18} />}
          </button>
        </div>

        <nav className="sidebar-nav">
          {navItems.map(({ to, icon: Icon, label, exact }) => (
            <Link
              key={to}
              to={to}
              className={`sidebar-link ${isActive(to, exact) ? 'active' : ''}`}
              title={collapsed ? label : ''}
            >
              <Icon size={18} />
              {!collapsed && <span>{label}</span>}
            </Link>
          ))}
        </nav>

        <div className="sidebar-footer">
          {!collapsed && (
            <div className="sidebar-user">
              <div className="user-avatar-sm">{user?.name?.charAt(0)}</div>
              <div>
                <p className="user-name-sm">{user?.name}</p>
                <p className="user-role-sm">Administrator</p>
              </div>
            </div>
          )}
          <button onClick={handleLogout} className="logout-btn" title={collapsed ? 'Logout' : ''}>
            <FiLogOut size={16} />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
}
