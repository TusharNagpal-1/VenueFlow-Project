import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/axios';
import { AuthContext } from '../context/AuthContext';
import { FaCalendarAlt, FaMapMarkerAlt, FaChair, FaMoneyBillWave } from 'react-icons/fa';
import { HiTicket } from 'react-icons/hi';

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

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden mt-8">
      {event.image ? (
        <img src={event.image} alt={event.title} className="w-full h-80 object-cover" />
      ) : (
        <div className="w-full h-64 bg-gradient-to-r from-amber-800 to-amber-900 flex items-center justify-center text-amber-200/50 text-6xl font-black uppercase tracking-widest">
          {event.category || 'Event'}
        </div>
      )}

      <div className="p-8 md:p-12">
        <div className="flex flex-col md:flex-row justify-between items-start mb-8 gap-6">
          <div className="flex-1">
            <div className="inline-block bg-amber-100 text-amber-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide mb-3">
              {event.category}
            </div>
            <h1 className="text-4xl font-extrabold text-stone-900 mb-4">{event.title}</h1>
            <p className="text-stone-600 text-lg leading-relaxed mb-6">{event.description}</p>
          </div>

          <div className="bg-amber-50 p-6 rounded-xl border border-amber-100 min-w-[300px] w-full md:w-auto shrink-0 shadow-sm">
            <h3 className="text-xl font-bold text-amber-900 mb-6 flex items-center gap-2">
              <HiTicket className="text-amber-600" /> Booking Details
            </h3>

            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-4 text-stone-600">
                <div className="w-10 h-10 rounded-full bg-amber-200 flex items-center justify-center text-amber-900 shrink-0">
                  <FaMoneyBillWave />
                </div>
                <div>
                  <p className="text-sm font-semibold text-stone-400 uppercase">Ticket Price</p>
                  <p className="font-bold text-stone-800 text-lg">
                    {event.ticketPrice === 0 ? <span className="text-green-600">Free</span> : `$${event.ticketPrice}`}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 text-stone-600">
                <div className="w-10 h-10 rounded-full bg-amber-200 flex items-center justify-center text-amber-900 shrink-0">
                  <FaChair />
                </div>
                <div>
                  <p className="text-sm font-semibold text-stone-400 uppercase">Availability</p>
                  <p className="font-bold text-stone-800">
                    <span className={event.availableSeats < 10 ? 'text-amber-600' : ''}>{event.availableSeats}</span> / {event.totalSeats}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 text-stone-600">
                <div className="w-10 h-10 rounded-full bg-amber-200 flex items-center justify-center text-amber-900 shrink-0">
                  <FaCalendarAlt />
                </div>
                <div>
                  <p className="text-sm font-semibold text-stone-400 uppercase">Date</p>
                  <p className="font-bold text-stone-800">{new Date(event.date).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 text-stone-600">
                <div className="w-10 h-10 rounded-full bg-amber-200 flex items-center justify-center text-amber-900 shrink-0">
                  <FaMapMarkerAlt />
                </div>
                <div>
                  <p className="text-sm font-semibold text-stone-400 uppercase">Location</p>
                  <p className="font-bold text-stone-800">{event.location}</p>
                </div>
              </div>
            </div>

            {showOTP && (
              <div className="mb-4">
                <label className="block text-sm font-semibold text-stone-700 mb-2">Enter OTP to Confirm</label>
                <input
                  type="text"
                  required
                  placeholder="6-digit code"
                  className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-amber-500 transition shadow-sm font-bold tracking-widest text-center text-lg"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  maxLength="6"
                />
              </div>
            )}

            <button
              onClick={handleBooking}
              disabled={isSoldOut || bookingLoading || (showOTP && !otp)}
              className={`w-full py-4 px-6 rounded-xl font-bold text-lg transition shadow-lg ${
                isSoldOut || (successMsg && !showOTP)
                  ? 'bg-stone-300 text-stone-500 cursor-not-allowed'
                  : 'bg-amber-900 hover:bg-amber-800 text-amber-100 hover:shadow-xl hover:-translate-y-1'
              }`}
            >
              {bookingLoading ? 'Processing...' : (
                showOTP ? 'Verify OTP & Confirm' : (
                  successMsg && !showOTP ? 'Request Sent' : (
                    isSoldOut ? 'Sold Out' : 'Confirm Registration'
                  )
                )
              )}
            </button>
            {error && <p className="text-red-500 mt-4 text-center font-medium bg-red-50 p-2 rounded">{error}</p>}
            {successMsg && <p className="text-green-600 mt-4 text-center font-medium bg-green-50 p-2 rounded">{successMsg}</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetail;
