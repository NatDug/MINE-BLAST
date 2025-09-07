import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './Navbar.css';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          Mine Blast Analytics
        </Link>
        
        <div className="navbar-menu">
          <Link to="/" className="navbar-link">Dashboard</Link>
          <Link to="/blasts" className="navbar-link">Blasts</Link>
          <Link to="/drill" className="navbar-link">Drill Plans</Link>
          <Link to="/maps" className="navbar-link">Maps</Link>
          <Link to="/analysis" className="navbar-link">Analysis</Link>
          
          {user ? (
            <div className="navbar-user">
              <span className="navbar-user-name">{user.full_name || user.email}</span>
              <button onClick={handleLogout} className="navbar-logout">
                Logout
              </button>
            </div>
          ) : (
            <Link to="/login" className="navbar-link">Login</Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
