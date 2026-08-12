import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { HiUser, HiMail, HiLockClosed, HiSparkles, HiArrowRight, HiShieldCheck, HiTicket, HiCheckCircle } from 'react-icons/hi';

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
    <div className="flex justify-center py-10 md:py-14">
      <div className="w-full max-w-6xl overflow-hidden rounded-[32px] border border-stone-200 bg-white shadow-[0_32px_80px_rgba(15,23,42,0.10)] grid lg:grid-cols-[0.95fr_1.05fr]">
        <div className="relative hidden lg:block min-h-[760px]">
          <img
            src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=1400&auto=format&fit=crop"
            alt="People celebrating an event"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-stone-950/90 via-stone-900/55 to-amber-950/25" />

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
                <HiCheckCircle className="text-sm" /> Free membership
              </div>

              <h1 className="max-w-md text-4xl font-black leading-tight tracking-[-0.05em] text-white xl:text-5xl">
                Join a community that lives for the moment.
              </h1>

              <p className="mt-4 max-w-md text-base text-stone-200">
                Discover handpicked events, unlock premium experiences, and book your next unforgettable night in minutes.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {[
                { value: '500+', label: 'Live events' },
                { value: '4.9/5', label: 'Guest rating' },
                { value: '24/7', label: 'Booking support' },
                { value: '0$', label: 'Join fee' },
              ].map((stat) => (
                <div key={stat.label} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 backdrop-blur-sm text-white">
                  <div className="text-2xl font-black tracking-[-0.04em] text-amber-300">{stat.value}</div>
                  <div className="mt-1 text-xs font-bold uppercase tracking-[0.14em] text-stone-300">{stat.label}</div>
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
              <div className="text-[11px] font-black uppercase tracking-[0.24em] text-amber-600">Create account</div>
              <h2 className="mt-3 text-3xl font-black tracking-[-0.05em] text-stone-900">Start your journey</h2>
              <p className="mt-2 text-sm text-stone-500">Join VenueFlow and unlock your next unforgettable experience.</p>
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
                    <label className="mb-2 block text-sm font-bold text-stone-700">Username</label>
                    <div className="relative">
                      <HiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
                      <input
                        type="text"
                        required
                        placeholder="Your name"
                        className="w-full rounded-2xl border border-stone-200 bg-stone-50/80 pl-12 pr-4 py-3.5 text-sm text-stone-900 outline-none transition focus:border-amber-400 focus:ring-4 focus:ring-amber-100"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                      />
                    </div>
                  </div>

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
                        placeholder="Create a password"
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
                    Almost there! An OTP has been sent to <strong>{email}</strong>. Enter it below to activate your account.
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
                {loading ? 'Processing...' : showOTP ? 'Verify & Complete' : 'Create Account'}
                {!loading && <HiArrowRight className="text-base transition group-hover:translate-x-1" />}
              </button>
            </form>

            {!showOTP && (
              <div className="mt-7 text-center text-sm text-stone-500">
                Already have an account?{' '}
                <Link to="/login" className="font-extrabold text-amber-700 hover:text-amber-800">
                  Sign in
                </Link>
              </div>
            )}

            <div className="mt-6 flex items-center gap-3 rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-xs text-stone-600">
              <HiShieldCheck className="text-amber-500" />
              Secure booking with OTP verification and trusted event access
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
