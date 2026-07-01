import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/axios';
import { Link, useNavigate } from 'react-router-dom';
import { HiTicket, HiX } from 'react-icons/hi';

const UserDashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchBookings();
  }, [user, navigate]);

  const fetchBookings = async () => {
    try {
      const { data } = await api.get('/events/my-bookings');
      setBookings(data);
    } catch (error) {
      console.error('Error fetching bookings', error);
    } finally {
      setLoading(false);
    }
  };

  const cancelBooking = async (id) => {
    if (window.confirm('Are you sure you want to cancel this booking request?')) {
      try {
        await api.delete(`/events/cancel/${id}`);
        fetchBookings();
      } catch (error) {
        alert(error.response?.data?.message || 'Error cancelling booking');
      }
    }
  };

  if (loading) return <div className="text-center py-20 text-xl font-semibold text-amber-800">Loading dashboard...</div>;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-gradient-to-r from-amber-900 to-amber-800 text-white rounded-2xl shadow-sm p-6 sm:p-8 mb-8 flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-4 sm:gap-6">
        <div className="w-20 h-20 bg-amber-200 text-amber-900 rounded-full flex items-center justify-center text-3xl font-bold uppercase tracking-widest shrink-0">
          {user?.name?.charAt(0) || '?'}
        </div>
        <div className="flex flex-col items-center sm:items-start">
          <h1 className="text-2xl sm:text-3xl font-extrabold mb-2">Welcome, {user?.name}!</h1>
          <p className="text-amber-200 flex items-center justify-center sm:justify-start gap-2">
            <span className="w-2 h-2 rounded-full bg-green-400"></span> User Dashboard
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-amber-900 flex items-center gap-2 sm:gap-3">
          <HiTicket className="text-amber-700" /> My Bookings
        </h2>
      </div>

      {bookings.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-amber-100">
          <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <HiTicket className="text-amber-300 text-3xl" />
          </div>
          <p className="text-xl text-stone-500 mb-6 mt-4 font-medium">You haven't booked any events yet.</p>
          <Link to="/" className="inline-block bg-amber-900 hover:bg-amber-800 text-white font-bold py-3 px-8 rounded-lg transition shadow-md">
            Browse Events
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bookings.map((booking) => (
            <div key={booking._id} className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition border border-amber-100 flex flex-col">
              <div className="p-6 border-b border-amber-50 flex-grow">
                {booking.eventId ? (
                  <>
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-lg font-bold text-stone-900 leading-tight">{booking.eventId.title}</h3>
                      <div className="flex flex-col gap-1 items-end">
                        <span className={`px-2 py-1 text-[10px] font-black rounded uppercase tracking-wider ${
                          booking.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                          booking.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                          'bg-amber-100 text-amber-700'
                        }`}>
                          {booking.status}
                        </span>
                        {booking.status !== 'cancelled' && (
                          <span className={`px-2 py-1 text-[10px] font-black rounded uppercase tracking-wider ${
                            booking.paymentStatus === 'paid' ? 'bg-blue-100 text-blue-700' : 'bg-stone-100 text-stone-700'
                          }`}>
                            {booking.paymentStatus.replace('_', ' ')}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-sm text-stone-500 mb-4 space-y-1">
                      <p><strong className="text-stone-700">Date:</strong> {new Date(booking.eventId.date).toLocaleDateString()}</p>
                      <p><strong className="text-stone-700">Amount:</strong> {booking.amount === 0 ? 'Free' : `$${booking.amount}`}</p>
                      <p><strong className="text-stone-700">Booked:</strong> {new Date(booking.createdAt).toLocaleDateString()}</p>
                    </div>
                  </>
                ) : (
                  <p className="text-red-500 italic">Event details unavailable</p>
                )}
              </div>
              <div className="p-4 bg-amber-50 flex justify-between items-center shrink-0">
                {booking.eventId && booking.status !== 'cancelled' ? (
                  <>
                    <Link to={`/events/${booking.eventId._id}`} className="text-amber-900 font-semibold text-sm hover:underline">View Event</Link>
                    <button
                      onClick={() => cancelBooking(booking._id)}
                      className="text-red-500 font-semibold text-sm hover:text-red-700 transition flex items-center gap-1"
                    >
                      <HiX /> Cancel
                    </button>
                  </>
                ) : (
                  <div className="w-full text-center text-sm text-stone-500 italic">Booking Cancelled</div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserDashboard;
