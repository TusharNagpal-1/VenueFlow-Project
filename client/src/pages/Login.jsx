import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { HiMail, HiLockClosed, HiBadgeCheck, HiSparkles, HiArrowRight, HiShieldCheck, HiCalendar, HiTicket } from 'react-icons/hi';

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
    <div className="flex justify-center py-10 md:py-14">
      <div className="w-full max-w-6xl overflow-hidden rounded-[32px] border border-stone-200 bg-white shadow-[0_32px_80px_rgba(15,23,42,0.10)] grid lg:grid-cols-[1.1fr_0.9fr]">
        <div className="relative hidden lg:block min-h-[760px]">
          <img
            src="https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=1400&auto=format&fit=crop"
            alt="Event celebration"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-stone-950/90 via-stone-900/60 to-amber-950/30" />

          <div className="relative z-10 flex h-full flex-col justify-between p-8 xl:p-10">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-stone-900 shadow-lg shadow-amber-500/30">
                <HiSparkles className="text-xl" />
              </div>
              <div className="text-2xl font-black tracking-tight text-white">
                Venue<span className="text-amber-300">Flow</span>
              </div>
            </div>

            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-[10px] font-black uppercase tracking-[0.22em] text-amber-200 backdrop-blur-sm">
                <HiBadgeCheck className="text-sm" /> Member access
              </div>

              <h1 className="max-w-md text-4xl font-black leading-tight tracking-[-0.05em] text-white xl:text-5xl">
                Welcome back to your next unforgettable night.
              </h1>

              <p className="mt-4 max-w-md text-base text-stone-200">
                Discover standout events, secure seats in seconds, and keep your plans close at hand.
              </p>
            </div>

            <div className="space-y-4">
              {[
                { icon: <HiShieldCheck className="text-lg" />, label: 'Verified ticket access' },
                { icon: <HiCalendar className="text-lg" />, label: 'Curated experiences' },
                { icon: <HiTicket className="text-lg" />, label: 'Fast booking flow' },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-sm text-sm text-white/90">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-400/10 text-amber-300">{item.icon}</div>
                  {item.label}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center bg-[#fffdf9] p-6 sm:p-8 lg:p-12">
          <div className="w-full max-w-md">
            <div className="mb-8 lg:hidden">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-stone-900 shadow-lg shadow-amber-500/30">
                  <HiSparkles className="text-xl" />
                </div>
                <div className="text-2xl font-black tracking-tight text-stone-900">
                  Venue<span className="text-amber-500">Flow</span>
                </div>
              </div>
            </div>

            <div className="mb-8">
              <div className="text-[11px] font-black uppercase tracking-[0.24em] text-amber-600">Sign in</div>
              <h2 className="mt-3 text-3xl font-black tracking-[-0.05em] text-stone-900">Welcome back</h2>
              <p className="mt-2 text-sm text-stone-500">Access your saved events and bookings.</p>
            </div>

            {error && (
              <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {!showOTP ? (
                <>
                  <div>
                    <label className="mb-2 block text-sm font-bold text-stone-700">Email address</label>
                    <div className="relative">
                      <HiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
                      <input
                        type="email"
                        required
                        placeholder="you@example.com"
                        className="w-full rounded-2xl border border-stone-200 bg-stone-50/80 pl-12 pr-4 py-3.5 text-sm text-stone-900 outline-none transition focus:border-amber-400 focus:ring-4 focus:ring-amber-100"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-bold text-stone-700">Password</label>
                    <div className="relative">
                      <HiLockClosed className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
                      <input
                        type="password"
                        required
                        placeholder="••••••••"
                        className="w-full rounded-2xl border border-stone-200 bg-stone-50/80 pl-12 pr-4 py-3.5 text-sm text-stone-900 outline-none transition focus:border-amber-400 focus:ring-4 focus:ring-amber-100"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                    </div>
                  </div>
                </>
              ) : (
                <div>
                  <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                    Check your inbox — a verification code has been sent to <strong>{email}</strong>.
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-bold text-stone-700">Verification code</label>
                    <input
                      type="text"
                      required
                      placeholder="6-digit code"
                      className="w-full rounded-2xl border border-stone-200 bg-stone-50/80 px-4 py-3.5 text-center text-lg font-bold tracking-[0.4em] text-stone-900 outline-none transition focus:border-amber-400 focus:ring-4 focus:ring-amber-100"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      maxLength="6"
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-600 px-6 py-3.5 text-sm font-black text-stone-900 shadow-lg shadow-amber-500/20 transition hover:-translate-y-0.5 hover:shadow-xl disabled:opacity-60"
              >
                {loading ? 'Processing...' : showOTP ? 'Verify OTP & Log In' : 'Sign In'}
                {!loading && <HiArrowRight className="text-base transition group-hover:translate-x-1" />}
              </button>
            </form>

            <div className="mt-7 text-center text-sm text-stone-500">
              Don’t have an account?{' '}
              <Link to="/register" className="font-extrabold text-amber-700 hover:text-amber-800">
                Create one free
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
