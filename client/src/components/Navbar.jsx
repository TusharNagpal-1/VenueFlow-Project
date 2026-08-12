import React, { useContext, useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { HiSparkles, HiTicket, HiUserCircle, HiCog, HiLogout, HiChevronDown } from 'react-icons/hi';

const getInitials = (name) =>
  (name || '?').split(' ').filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase() || '?';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const onClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const handleLogout = () => {
    setMenuOpen(false);
    logout();
    navigate('/login');
  };

  const go = (path) => {
    setMenuOpen(false);
    navigate(path);
  };

  const dashboardPath = user?.role === 'admin' ? '/admin' : '/dashboard';

  return (
    <nav className="sticky top-0 z-50 bg-stone-950/85 backdrop-blur-xl border-b border-white/10 shadow-lg shadow-stone-950/20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-3.5">
          <Link to="/" className="group flex items-center gap-2.5">
            <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-stone-900 flex items-center justify-center text-xl shadow-md shadow-amber-500/30 group-hover:rotate-12 transition-transform">
              <HiSparkles />
            </span>
            <span className="text-xl font-extrabold tracking-tight text-white">
              Venue<span className="text-gradient-amber">Flow</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8 text-sm font-semibold">
            <Link to="/" className="text-amber-100/80 hover:text-amber-300 transition-colors relative group">
              Events
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-amber-400 rounded-full group-hover:w-full transition-all"></span>
            </Link>
            {user && (
              <Link to={dashboardPath} className="text-amber-100/80 hover:text-amber-300 transition-colors relative group">
                Dashboard
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-amber-400 rounded-full group-hover:w-full transition-all"></span>
              </Link>
            )}
          </div>

          <div className="flex items-center gap-3">
            {user ? (
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setMenuOpen((o) => !o)}
                  className="flex items-center gap-2.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-amber-400/40 rounded-full pl-1.5 pr-3 py-1.5 transition-all"
                >
                  <span className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 text-stone-900 flex items-center justify-center text-sm font-black shadow-md shadow-amber-500/25">
                    {getInitials(user.name || user.username)}
                  </span>
                  <span className="hidden sm:block text-sm font-bold text-amber-100 max-w-[110px] truncate">
                    {user.name || user.username}
                  </span>
                  <HiChevronDown className={`text-amber-300 transition-transform ${menuOpen ? 'rotate-180' : ''}`} />
                </button>

                {menuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-stone-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl shadow-stone-950/60 overflow-hidden animate-fade-up">
                    <div className="px-4 py-3.5 border-b border-white/10 flex items-center gap-3">
                      <span className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 text-stone-900 flex items-center justify-center text-sm font-black">
                        {getInitials(user.name || user.username)}
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-white truncate">{user.name || user.username}</p>
                        <p className="text-xs text-amber-100/50 truncate">{user.email}</p>
                      </div>
                    </div>
                    <div className="py-1.5">
                      <button onClick={() => go('/dashboard')} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-amber-100/80 hover:bg-white/5 hover:text-amber-300 transition-colors">
                        <HiUserCircle className="text-lg text-amber-400" /> Profile
                      </button>
                      <button onClick={() => go('/dashboard#bookings')} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-amber-100/80 hover:bg-white/5 hover:text-amber-300 transition-colors">
                        <HiTicket className="text-lg text-amber-400" /> My Bookings
                      </button>
                      <button onClick={() => go('/dashboard')} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-amber-100/80 hover:bg-white/5 hover:text-amber-300 transition-colors">
                        <HiCog className="text-lg text-amber-400" /> Settings
                      </button>
                      <div className="my-1.5 border-t border-white/10"></div>
                      <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors">
                        <HiLogout className="text-lg" /> Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link to="/login" className="hidden sm:block text-amber-100/80 hover:text-amber-300 font-semibold transition-colors px-3 py-2">
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-900 font-bold px-5 py-2.5 rounded-full transition-all shadow-lg shadow-amber-500/25 hover:-translate-y-0.5"
                >
                  <HiTicket className="text-lg" /> Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
