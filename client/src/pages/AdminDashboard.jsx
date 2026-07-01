import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/axios';
import { useNavigate } from 'react-router-dom';
import { HiPlus, HiTrash, HiCheck, HiX } from 'react-icons/hi';

const AdminDashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('bookings');

  const [showEventForm, setShowEventForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '', description: '', date: '', location: '', category: '', totalSeats: '', ticketPrice: '', image: ''
  });

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/login');
      return;
    }
    fetchData();
  }, [user, navigate]);

  const fetchData = async () => {
    try {
      const [eventsRes, bookingsRes] = await Promise.all([
        api.get('/events'),
        api.get('/events/my-bookings')
      ]);
      setEvents(eventsRes.data);
      setBookings(bookingsRes.data);
    } catch (error) {
      console.error('Error fetching admin data', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    try {
      await api.post('/events', {
        ...formData,
        totalSeats: Number(formData.totalSeats),
        ticketPrice: Number(formData.ticketPrice)
      });
      setShowEventForm(false);
      setFormData({ title: '', description: '', date: '', location: '', category: '', totalSeats: '', ticketPrice: '', image: '' });
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || 'Error creating event');
    }
  };

  const handleDeleteEvent = async (id) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        await api.delete(`/events/${id}`);
        fetchData();
      } catch (error) {
        alert('Error deleting event');
      }
    }
  };

  const handleConfirmBooking = async (id, paymentStatus) => {
    try {
      await api.put(`/events/confirm/${id}`, { paymentStatus });
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || 'Error confirming booking');
    }
  };

  const handleCancelBooking = async (id) => {
    if (window.confirm("Cancel this user's booking request?")) {
      try {
        await api.delete(`/events/cancel/${id}`);
        fetchData();
      } catch (error) {
        alert(error.response?.data?.message || 'Error cancelling booking');
      }
    }
  };

  if (loading) return <div className="text-center py-20 text-xl font-semibold text-amber-800">Loading admin panel...</div>;

  const totalRevenue = bookings
    .filter(b => b.paymentStatus === 'paid' && b.status === 'confirmed')
    .reduce((sum, b) => sum + b.amount, 0);
  const paidClients = new Set(
    bookings.filter(b => b.paymentStatus === 'paid' && b.status === 'confirmed').map(b => b.userId?._id)
  ).size;
  const pendingRequests = bookings.filter(b => b.status === 'pending').length;

  return (
    <div className="max-w-7xl mx-auto">
      <div className="bg-gradient-to-r from-amber-900 to-stone-900 text-white rounded-2xl p-6 sm:p-8 mb-8 shadow-lg flex flex-col md:flex-row justify-between items-center gap-6 text-center md:text-left">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold mb-2">Admin Dashboard</h1>
          <p className="text-amber-200">Manage events and confirm bookings.</p>
        </div>
        <button
          onClick={() => setShowEventForm(!showEventForm)}
          className="w-full md:w-auto bg-amber-400 text-amber-900 font-bold py-3 px-6 rounded-lg hover:bg-amber-300 transition shadow-md flex items-center justify-center gap-2"
        >
          <HiPlus /> {showEventForm ? 'Cancel' : 'Create Event'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-amber-100 flex items-center justify-between">
          <div>
            <p className="text-stone-500 text-sm font-bold uppercase tracking-wider mb-1">Total Revenue</p>
            <h3 className="text-3xl font-black text-green-600">${totalRevenue}</h3>
          </div>
          <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xl font-bold">$</div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-amber-100 flex items-center justify-between">
          <div>
            <p className="text-stone-500 text-sm font-bold uppercase tracking-wider mb-1">Paid Clients</p>
            <h3 className="text-3xl font-black text-blue-600">{paidClients}</h3>
          </div>
          <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xl font-bold">
            <HiCheck />
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-amber-100 flex items-center justify-between">
          <div>
            <p className="text-stone-500 text-sm font-bold uppercase tracking-wider mb-1">Pending Requests</p>
            <h3 className="text-3xl font-black text-amber-600">{pendingRequests}</h3>
          </div>
          <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center text-xl font-bold">
            <HiPlus />
          </div>
        </div>
      </div>

      {showEventForm && (
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-amber-100 mb-8">
          <h2 className="text-2xl font-bold mb-6 text-amber-900">Create New Event</h2>
          <form onSubmit={handleCreateEvent} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <input required type="text" placeholder="Event Title" className="border border-stone-200 px-4 py-3 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none transition" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
            <input required type="text" placeholder="Category (e.g., Tech, Music)" className="border border-stone-200 px-4 py-3 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none transition" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} />
            <input required type="date" className="border border-stone-200 px-4 py-3 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none transition" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} />
            <input required type="text" placeholder="Location" className="border border-stone-200 px-4 py-3 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none transition" value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} />
            <input required type="number" placeholder="Total Seats" className="border border-stone-200 px-4 py-3 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none transition" value={formData.totalSeats} onChange={e => setFormData({ ...formData, totalSeats: e.target.value })} />
            <input required type="number" placeholder="Ticket Price ($)" className="border border-stone-200 px-4 py-3 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none transition" value={formData.ticketPrice} onChange={e => setFormData({ ...formData, ticketPrice: e.target.value })} />
            <div className="md:col-span-2">
              <textarea placeholder="Description (optional)" className="w-full border border-stone-200 px-4 py-3 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none transition" rows="3" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
            </div>
            <div className="md:col-span-2">
              <input type="text" placeholder="Image URL (optional)" className="w-full border border-stone-200 px-4 py-3 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none transition" value={formData.image} onChange={e => setFormData({ ...formData, image: e.target.value })} />
            </div>
            <div className="md:col-span-2">
              <button type="submit" className="w-full bg-amber-900 text-white font-bold py-3 rounded-lg hover:bg-amber-800 transition shadow-md">
                Publish Event
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="flex gap-4 mb-6 border-b border-amber-200">
        <button
          onClick={() => setActiveTab('bookings')}
          className={`pb-3 px-4 font-bold text-sm uppercase tracking-wider transition ${
            activeTab === 'bookings' ? 'text-amber-900 border-b-2 border-amber-900' : 'text-stone-500 hover:text-stone-700'
          }`}
        >
          Bookings ({bookings.length})
        </button>
        <button
          onClick={() => setActiveTab('events')}
          className={`pb-3 px-4 font-bold text-sm uppercase tracking-wider transition ${
            activeTab === 'events' ? 'text-amber-900 border-b-2 border-amber-900' : 'text-stone-500 hover:text-stone-700'
          }`}
        >
          Events ({events.length})
        </button>
      </div>

      {activeTab === 'bookings' && (
        <div className="bg-white rounded-xl shadow-sm border border-amber-100 overflow-hidden">
          {bookings.length === 0 ? (
            <p className="p-8 text-center text-stone-500">No bookings yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-amber-50 text-stone-700 uppercase text-xs tracking-wider">
                  <tr>
                    <th className="p-4 text-left">User</th>
                    <th className="p-4 text-left">Event</th>
                    <th className="p-4 text-left">Status</th>
                    <th className="p-4 text-left">Payment</th>
                    <th className="p-4 text-left">Amount</th>
                    <th className="p-4 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-amber-100">
                  {bookings.map((booking) => (
                    <tr key={booking._id} className="hover:bg-amber-50/50 transition">
                      <td className="p-4 font-medium text-stone-800">{booking.userId?.username || 'Unknown'}</td>
                      <td className="p-4 text-stone-600">{booking.eventId?.title || 'Deleted'}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 text-[10px] font-black rounded uppercase tracking-wider ${
                          booking.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                          booking.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                          'bg-amber-100 text-amber-700'
                        }`}>
                          {booking.status}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 text-[10px] font-black rounded uppercase tracking-wider ${
                          booking.paymentStatus === 'paid' ? 'bg-blue-100 text-blue-700' : 'bg-stone-100 text-stone-600'
                        }`}>
                          {booking.paymentStatus.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="p-4 font-semibold text-stone-800">${booking.amount}</td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          {booking.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleConfirmBooking(booking._id, 'paid')}
                                className="bg-green-100 text-green-700 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-green-200 transition flex items-center gap-1"
                              >
                                <HiCheck /> Confirm
                              </button>
                              <button
                                onClick={() => handleCancelBooking(booking._id)}
                                className="bg-red-100 text-red-600 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-red-200 transition flex items-center gap-1"
                              >
                                <HiX /> Reject
                              </button>
                            </>
                          )}
                          {booking.status === 'confirmed' && (
                            <span className="text-xs text-green-600 font-semibold">Confirmed</span>
                          )}
                          {booking.status === 'cancelled' && (
                            <span className="text-xs text-red-500 font-semibold">Cancelled</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'events' && (
        <div className="bg-white rounded-xl shadow-sm border border-amber-100 overflow-hidden">
          {events.length === 0 ? (
            <p className="p-8 text-center text-stone-500">No events created yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-amber-50 text-stone-700 uppercase text-xs tracking-wider">
                  <tr>
                    <th className="p-4 text-left">Title</th>
                    <th className="p-4 text-left">Date</th>
                    <th className="p-4 text-left">Location</th>
                    <th className="p-4 text-left">Seats</th>
                    <th className="p-4 text-left">Price</th>
                    <th className="p-4 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-amber-100">
                  {events.map((event) => (
                    <tr key={event._id} className="hover:bg-amber-50/50 transition">
                      <td className="p-4 font-medium text-stone-800">{event.title}</td>
                      <td className="p-4 text-stone-600">{new Date(event.date).toLocaleDateString()}</td>
                      <td className="p-4 text-stone-600">{event.location}</td>
                      <td className="p-4 text-stone-600">{event.availableSeats}/{event.totalSeats}</td>
                      <td className="p-4 font-semibold text-stone-800">${event.ticketPrice}</td>
                      <td className="p-4">
                        <button
                          onClick={() => handleDeleteEvent(event._id)}
                          className="bg-red-100 text-red-600 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-red-200 transition flex items-center gap-1"
                        >
                          <HiTrash /> Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
