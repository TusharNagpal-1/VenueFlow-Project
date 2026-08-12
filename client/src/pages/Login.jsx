import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { HiMail, HiLockClosed, HiBadgeCheck, HiSparkles } from 'react-icons/hi';
import { FaArrowRight } from 'react-icons/fa';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [showOTP, setShowOTP] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, verifyOTP } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (!showOTP) {
        const data = await login(email, password);
        if (data.role === 'admin') navigate('/admin');
        else navigate('/dashboard');
      } else {
        const data = await verifyOTP(email, otp);
        if (data.role === 'admin') navigate('/admin');
        else navigate('/dashboard');
      }
    } catch (err) {
      if (err.needsVerification) {
        setShowOTP(true);
        setError('Account not verified. A new OTP has been sent to your email.');
      } else {
        setError(err.message || err);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center py-8 md:py-12">
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden grid md:grid-cols-2 border border-amber-100/60 animate-fade-up">
        {/* Image side */}
        <div className="relative hidden md:block">
          <img
            src="https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=1400&auto=format&fit=crop"
            alt="Event celebration"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950/90 via-stone-950/40 to-stone-950/10"></div>
          <div className="absolute bottom-0 p-10">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 text-stone-900 flex items-center justify-center">
                <HiSparkles />
              </span>
              <span className="text-xl font-extrabold text-white">VenueFlow</span>
            </div>
            <h2 className="text-3xl font-extrabold text-white mb-3">
              Welcome back to your <span className="font-display italic text-gradient-light">spotlight.</span>
            </h2>
            <p className="text-amber-100/80 text-sm leading-relaxed">
              Your next unforgettable event is one login away. Pick up right where you left off.
            </p>
            <div className="flex items-center gap-2 mt-6 text-xs font-bold text-amber-200 bg-white/10 backdrop-blur-sm border border-white/15 rounded-full px-4 py-2 w-fit">
              <HiBadgeCheck className="text-amber-400 text-base" /> OTP-secured sign in
            </div>
          </div>
        </div>

        {/* Form side */}
        <div className="p-8 md:p-12">
          <div className="md:hidden flex items-center gap-2 mb-8">
            <span className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 text-stone-900 flex items-center justify-center">
              <HiSparkles />
            </span>
            <span className="text-xl font-extrabold text-stone-900">VenueFlow</span>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-extrabold text-stone-900 mb-2">Sign In</h1>
            <p className="text-stone-500">Sign in to continue</p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-3.5 rounded-xl mb-6 text-sm font-medium border border-red-100">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {!showOTP ? (
              <>
                <div>
                  <label className="block text-sm font-bold text-stone-700 mb-2">Email Address</label>
                  <div className="relative">
                    <HiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
                    <input
                      type="email"
                      required
                      placeholder="you@example.com"
                      className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-stone-200 bg-stone-50/50 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition outline-none placeholder-stone-400"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-stone-700 mb-2">Password</label>
                  <div className="relative">
                    <HiLockClosed className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-stone-200 bg-stone-50/50 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition outline-none placeholder-stone-400"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                </div>
              </>
            ) : (
              <div>
                <div className="bg-amber-50 border border-amber-200 text-amber-800 text-sm font-medium p-3.5 rounded-xl mb-4">
                  Check your inbox — a verification code has been sent to <strong>{email}</strong>.
                </div>
                <label className="block text-sm font-bold text-stone-700 mb-2">Verification Code (OTP)</label>
                <input
                  type="text"
                  required
                  placeholder="6-digit code"
                  className="w-full px-4 py-3.5 rounded-xl border border-stone-200 bg-stone-50/50 focus:ring-2 focus:ring-amber-500 transition outline-none font-bold tracking-widest text-center text-lg placeholder-stone-400"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  maxLength="6"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="group w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-900 font-extrabold py-4 rounded-xl transition-all shadow-lg shadow-amber-500/25 hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-60 disabled:translate-y-0 flex items-center justify-center gap-2"
            >
              {loading ? 'Processing...' : (showOTP ? 'Verify OTP & Log In' : 'Sign In')}
              {!loading && <FaArrowRight className="group-hover:translate-x-1 transition-transform" />}
            </button>
          </form>

          <p className="text-center mt-8 text-stone-500">
            Don't have an account?{' '}
            <Link to="/register" className="text-amber-700 font-extrabold hover:underline">
              Create one free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
