import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../utils/axios';
import { AuthContext } from '../context/AuthContext';
import { FaCalendarAlt, FaMapMarkerAlt, FaChair, FaMoneyBillWave, FaArrowLeft } from 'react-icons/fa';
import { HiTicket } from 'react-icons/hi';

const getEventImage = (event) => {
  if (event.image) return event.image;
  return 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?q=80&w=2000&auto=format&fit=crop';
};

const EventDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [otp, setOtp] = useState('');
  const [showOTP, setShowOTP] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const { data } = await api.get(`/events/${id}`);
        setEvent(data);
      } catch (err) {
        setError('Failed to load event details.');
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id]);

  const handleBooking = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    setBookingLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      if (!showOTP) {
        await api.post('/events/send-otp');
        setShowOTP(true);
        setSuccessMsg('OTP sent to your email. Please verify to confirm booking.');
      } else {
        await api.post('/events/book', { eventId: event._id, otp });
        setSuccessMsg('Booking requested! Awaiting admin confirmation.');
        setShowOTP(false);
        setEvent({ ...event, availableSeats: event.availableSeats - 1 });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Booking failed');
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) return <div className="text-center py-20 text-xl font-semibold text-amber-800">Loading...</div>;
  if (error && !event) return <div className="text-center py-20 text-xl text-red-500">{error || 'Event not found'}</div>;

  const isSoldOut = event.availableSeats <= 0;
  const soldPercent = Math.round((event.availableSeats / event.totalSeats) * 100);

  return (
    <div className="max-w-6xl mx-auto">
      <Link to="/" className="inline-flex items-center gap-2 text-stone-500 hover:text-amber-700 font-semibold mb-6 transition-colors">
        <FaArrowLeft /> Back to Events
      </Link>

      <div className="bg-white rounded-3xl shadow-soft overflow-hidden border border-amber-100/60">
        <div className="relative">
          <img src={getEventImage(event)} alt={event.title} className="w-full h-72 md:h-96 object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-stone-950/20 to-transparent"></div>
          <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
            <span className="inline-block bg-amber-400 text-stone-900 text-xs font-black px-4 py-1.5 rounded-full uppercase tracking-wider shadow-lg mb-4">
              {event.category}
            </span>
            <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-3 drop-shadow-lg">{event.title}</h1>
            <p className="flex items-center gap-2 text-amber-100/90 font-medium">
              <FaCalendarAlt className="text-amber-300" />
              {new Date(event.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
        </div>

        <div className="p-8 md:p-12">
          <div className="flex flex-col lg:flex-row gap-10">
            <div className="flex-1">
              <span className="text-xs font-black uppercase tracking-[0.25em] text-amber-600">About this event</span>
              <h2 className="text-2xl font-extrabold text-stone-900 mt-2 mb-4">Event Details</h2>
              <p className="text-stone-600 leading-relaxed text-lg mb-8 whitespace-pre-line">
                {event.description || 'No description provided for this event. Check the venue and booking details to learn more.'}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="bg-amber-50 rounded-2xl p-5 border border-amber-100 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-stone-900 flex items-center justify-center text-xl shrink-0 shadow-md shadow-amber-500/20">
                    <FaMoneyBillWave />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-1">Ticket Price</p>
                    <p className="font-extrabold text-stone-800 text-xl">
                      {event.ticketPrice === 0 ? <span className="text-green-600">Free Entry</span> : `$${event.ticketPrice}`}
                    </p>
                  </div>
                </div>

                <div className="bg-amber-50 rounded-2xl p-5 border border-amber-100 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-stone-900 flex items-center justify-center text-xl shrink-0 shadow-md shadow-amber-500/20">
                    <FaChair />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-1">Availability</p>
                    <p className="font-extrabold text-stone-800 text-xl">
                      <span className={event.availableSeats < 10 ? 'text-red-600' : event.availableSeats < 30 ? 'text-amber-600' : 'text-stone-800'}>
                        {event.availableSeats}
                      </span>
                      <span className="text-stone-400 text-base font-semibold"> / {event.totalSeats} seats</span>
                    </p>
                  </div>
                </div>

                <div className="bg-amber-50 rounded-2xl p-5 border border-amber-100 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-stone-900 flex items-center justify-center text-xl shrink-0 shadow-md shadow-amber-500/20">
                    <FaCalendarAlt />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-1">Event Date</p>
                    <p className="font-extrabold text-stone-800">{new Date(event.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</p>
                  </div>
                </div>

                <div className="bg-amber-50 rounded-2xl p-5 border border-amber-100 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-stone-900 flex items-center justify-center text-xl shrink-0 shadow-md shadow-amber-500/20">
                    <FaMapMarkerAlt />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-1">Location</p>
                    <p className="font-extrabold text-stone-800">{event.location}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:w-[380px] shrink-0">
              <div className="bg-stone-900 rounded-3xl p-8 text-white shadow-2xl sticky top-24">
                <h3 className="text-2xl font-extrabold mb-2 flex items-center gap-3">
                  <HiTicket className="text-amber-400 text-3xl" /> Book Now
                </h3>
                <p className="text-amber-100/70 text-sm mb-6">Reserve your spot in seconds.</p>

                <div className="mb-6">
                  <div className="flex items-center justify-between text-sm font-bold mb-2">
                    <span className="text-amber-100/70">Seats available</span>
                    <span className={event.availableSeats < 10 ? 'text-red-400' : 'text-amber-300'}>{event.availableSeats} left</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2.5 overflow-hidden">
                    <div
                      className={`h-2.5 rounded-full ${soldPercent < 25 ? 'bg-red-500' : 'bg-gradient-to-r from-amber-400 to-amber-600'}`}
                      style={{ width: `${soldPercent}%` }}
                    ></div>
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between items-center bg-white/5 border border-white/10 rounded-xl px-4 py-3">
                    <span className="text-sm text-amber-100/70 font-semibold">Price per ticket</span>
                    <span className="font-extrabold text-lg">{event.ticketPrice === 0 ? 'FREE' : `$${event.ticketPrice}`}</span>
                  </div>
                  <div className="flex justify-between items-center bg-white/5 border border-white/10 rounded-xl px-4 py-3">
                    <span className="text-sm text-amber-100/70 font-semibold">Verification</span>
                    <span className="font-bold text-green-400 text-sm">Email OTP</span>
                  </div>
                </div>

                {showOTP && (
                  <div className="mb-5">
                    <label className="block text-sm font-semibold text-amber-100/80 mb-2">Enter OTP to Confirm</label>
                    <input
                      type="text"
                      required
                      placeholder="6-digit code"
                      className="w-full px-4 py-3.5 rounded-xl border border-white/15 bg-white/10 text-white placeholder-amber-100/40 focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none transition font-bold tracking-widest text-center text-lg"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      maxLength="6"
                    />
                  </div>
                )}

                <button
                  onClick={handleBooking}
                  disabled={isSoldOut || bookingLoading || (showOTP && !otp)}
                  className={`w-full py-4 px-6 rounded-xl font-extrabold text-lg transition-all ${
                    isSoldOut || (successMsg && !showOTP)
                      ? 'bg-white/10 text-white/40 cursor-not-allowed'
                      : 'bg-gradient-to-r from-amber-400 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-stone-900 shadow-xl shadow-amber-500/25 hover:-translate-y-0.5'
                  }`}
                >
                  {bookingLoading ? 'Processing...' : (
                    showOTP ? 'Verify OTP & Confirm' : (
                      successMsg && !showOTP ? 'Request Sent ✓' : (
                        isSoldOut ? 'Sold Out' : 'Confirm Registration'
                      )
                    )
                  )}
                </button>
                {error && <p className="text-red-400 mt-4 text-center font-medium bg-red-500/10 border border-red-500/20 p-3 rounded-lg">{error}</p>}
                {successMsg && <p className="text-green-400 mt-4 text-center font-medium bg-green-500/10 border border-green-500/20 p-3 rounded-lg">{successMsg}</p>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetail;
