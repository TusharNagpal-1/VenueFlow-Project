import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { HiSparkles } from 'react-icons/hi';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-amber-900 shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center py-4 gap-4">
          <Link to="/" className="text-amber-100 text-2xl font-bold flex items-center gap-2">
            <HiSparkles className="text-amber-300" /> VenueFlow
          </Link>
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
            <Link to="/" className="text-amber-200 hover:text-white transition cursor-pointer">Events</Link>
            {user ? (
              <>
                <Link to={user.role === 'admin' ? '/admin' : '/dashboard'} className="text-amber-200 hover:text-white transition">Dashboard</Link>
                <button onClick={handleLogout} className="bg-amber-700 hover:bg-amber-800 text-white px-4 py-2 rounded-md transition">Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-amber-200 hover:text-white transition">Login</Link>
                <Link to="/register" className="bg-amber-400 text-amber-900 hover:bg-amber-300 px-4 py-2 rounded-md font-semibold transition">Sign Up</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
