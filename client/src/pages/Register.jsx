import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { HiUser, HiMail, HiLockClosed, HiSparkles } from 'react-icons/hi';
import { FaArrowRight } from 'react-icons/fa';

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [showOTP, setShowOTP] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register, verifyOTP } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (!showOTP) {
        await register(username, email, password);
        setShowOTP(true);
        setError('');
      } else {
        await verifyOTP(email, otp);
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center py-8 md:py-12">
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden grid md:grid-cols-2 border border-amber-100/60 animate-fade-up">
        {/* Image side */}
        <div className="relative hidden md:block order-2">
          <img
            src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=1400&auto=format&fit=crop"
            alt="People celebrating an event"
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
              Join a community that <span className="font-display italic text-gradient-light">lives for</span> the moment.
            </h2>
            <p className="text-amber-100/80 text-sm leading-relaxed">
              Create your free account and start discovering amazing events near you in minutes.
            </p>
            <div className="mt-6 flex items-center gap-2 text-xs font-bold text-amber-200 bg-white/10 backdrop-blur-sm border border-white/15 rounded-full px-4 py-2 w-fit">
              <span className="text-green-400">●</span> Free forever · No hidden fees
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
            <h1 className="text-3xl font-extrabold text-stone-900 mb-2">Create an Account</h1>
            <p className="text-stone-500">Join VenueFlow today — it's quick & easy</p>
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
                  <label className="block text-sm font-bold text-stone-700 mb-2">Username</label>
                  <div className="relative">
                    <HiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
                    <input
                      type="text"
                      required
                      placeholder="Your name"
                      className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-stone-200 bg-stone-50/50 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition outline-none placeholder-stone-400"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                    />
                  </div>
                </div>
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
                      placeholder="Create a password"
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
                  🎉 Almost there! An OTP has been sent to <strong>{email}</strong>. Enter it below to activate your account.
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
              {loading ? 'Processing...' : (showOTP ? 'Verify & Complete' : 'Create Account')}
              {!loading && <FaArrowRight className="group-hover:translate-x-1 transition-transform" />}
            </button>
          </form>

          {!showOTP && (
            <p className="text-center mt-8 text-stone-500">
              Already have an account?{' '}
              <Link to="/login" className="text-amber-700 font-extrabold hover:underline">
                Sign in
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Register;
