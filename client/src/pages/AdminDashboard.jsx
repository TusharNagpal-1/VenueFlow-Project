import React, { useState, useEffect, useContext, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/axios';
import { useNavigate } from 'react-router-dom';
import { HiPlus, HiTrash, HiCheck, HiX, HiCash, HiUserGroup, HiClock, HiCheckCircle, HiExclamationCircle, HiOutlineX } from 'react-icons/hi';

const inputCls = "w-full border border-stone-200 px-4 py-3 rounded-xl bg-stone-50/50 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition";
const labelCls = "block text-sm font-bold text-stone-700 mb-2";
const formatPaymentStatus = (status) => String(status || 'not_paid').replace('_', ' ');

const AdminDashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('bookings');
  const [showNotifications, setShowNotifications] = useState(false);

  const [showEventForm, setShowEventForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '', description: '', date: '', location: '', category: '', totalSeats: '', ticketPrice: '', image: ''
  });
  const [submitLoading, setSubmitLoading] = useState(false);

  const [notice, setNotice] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const noticeTimer = useRef(null);

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/login');
      return;
    }
    fetchData();
  }, [user, navigate]);

  const showNotice = (message, type = 'success') => {
    clearTimeout(noticeTimer.current);
    setNotice({ message, type });
    noticeTimer.current = setTimeout(() => setNotice(null), 4000);
  };

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
    setSubmitLoading(true);
    try {
      await api.post('/events', {
        ...formData,
        totalSeats: Number(formData.totalSeats),
        ticketPrice: Number(formData.ticketPrice)
      });
      setShowEventForm(false);
      setFormData({ title: '', description: '', date: '', location: '', category: '', totalSeats: '', ticketPrice: '', image: '' });
      await fetchData();
      showNotice('Event created and published successfully!', 'success');
    } catch (error) {
      showNotice(error.response?.data?.message || 'Error creating event', 'error');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDeleteEvent = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await api.delete(`/events/${deleteTarget._id}`);
      setEvents(events.filter((ev) => ev._id !== deleteTarget._id));
      setDeleteTarget(null);
      showNotice(`Event "${deleteTarget.title}" deleted successfully.`, 'success');
    } catch (error) {
      setDeleteTarget(null);
      showNotice(error.response?.data?.message || 'Error deleting event', 'error');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleConfirmBooking = async (id, paymentStatus) => {
    try {
      await api.put(`/events/confirm/${id}`, { paymentStatus });
      await fetchData();
      showNotice('Booking confirmed successfully!', 'success');
    } catch (error) {
      showNotice(error.response?.data?.message || 'Error confirming booking', 'error');
    }
  };

  const handleCancelBooking = async (id) => {
    if (window.confirm("Cancel this user's booking request?")) {
      try {
        await api.delete(`/events/cancel/${id}`);
        await fetchData();
        showNotice('Booking request cancelled.', 'success');
      } catch (error) {
        showNotice(error.response?.data?.message || 'Error cancelling booking', 'error');
      }
    }
  };
  const stats = React.useMemo(() => {
    const totalRevenue = bookings
      .filter(b => b.paymentStatus === 'paid' && b.status === 'confirmed')
      .reduce((sum, b) => sum + b.amount, 0);
    const paidClients = new Set(
      bookings.filter(b => b.paymentStatus === 'paid' && b.status === 'confirmed').map(b => b.userId?._id)
    ).size;
    const pendingRequests = bookings.filter(b => b.status === 'pending').length;
    return { totalRevenue, paidClients, pendingRequests };
  }, [bookings]);

  const notifications = React.useMemo(() => {
    const list = [];

    if (stats.pendingRequests > 0) {
      list.push({
        id: 'pending-requests',
        title: 'Pending booking requests',
        detail: `${stats.pendingRequests} booking request${stats.pendingRequests > 1 ? 's are' : ' is'} waiting for your review.`,
        time: 'Now',
        unread: true,
      });
    }

    const confirmedCount = bookings.filter((b) => b.status === 'confirmed').length;
    if (confirmedCount > 0) {
      list.push({
        id: 'confirmed-bookings',
        title: 'Confirmed bookings',
        detail: `${confirmedCount} booking${confirmedCount > 1 ? 's are' : ' is'} live and ready for check-in.`,
        time: 'Today',
        unread: false,
      });
    }

    const upcomingEvents = events.filter((event) => new Date(event.date) > new Date()).slice(0, 1);
    if (upcomingEvents.length > 0) {
      list.push({
        id: `upcoming-${upcomingEvents[0]._id}`,
        title: 'Upcoming event',
        detail: `${upcomingEvents[0].title} is scheduled for ${new Date(upcomingEvents[0].date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}.`,
        time: 'Today',
        unread: false,
      });
    }

    if (!list.length) {
      list.push({
        id: 'all-clear',
        title: 'All clear',
        detail: 'No new booking activity right now. Everything is running smoothly.',
        time: 'Updated',
        unread: false,
      });
    }

    return list.slice(0, 4);
  }, [bookings, events, stats.pendingRequests]);

  if (loading) return <div className="text-center py-20 text-xl font-semibold text-amber-800">Loading admin panel...</div>;

  return (
    <div className="max-w-7xl mx-auto">
      {/* Toast / Notice */}
      {notice && (
        <div className={`fixed top-24 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl text-sm font-bold animate-fade-up ${
          notice.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
        }`}>
          {notice.type === 'success' ? <HiCheckCircle className="text-xl" /> : <HiExclamationCircle className="text-xl" />}
          {notice.message}
          <button onClick={() => setNotice(null)} className="ml-2 opacity-70 hover:opacity-100">
            <HiOutlineX />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-stone-900 to-stone-950 text-white shadow-2xl p-8 md:p-10 mb-8">
        <div className="absolute -right-16 -top-16 w-56 h-56 bg-amber-500/10 rounded-full"></div>
        <div className="absolute right-24 -bottom-20 w-64 h-64 bg-amber-400/5 rounded-full"></div>
        <div className="relative flex flex-col md:flex-row justify-between items-center gap-6 text-center md:text-left">
          <div>
            <span className="inline-block bg-amber-400/15 text-amber-300 text-[10px] font-black uppercase tracking-[0.25em] px-4 py-1.5 rounded-full border border-amber-400/20 mb-3">
              Control Center
            </span>
            <h1 className="text-3xl md:text-4xl font-extrabold mb-2">Admin Dashboard</h1>
            <p className="text-amber-100/60 font-medium">Manage events and confirm bookings.</p>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto justify-center md:justify-end">
            <div className="relative">
              <button
                onClick={() => setShowNotifications((open) => !open)}
                className="relative flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/5 text-lg text-amber-200 transition hover:bg-white/10"
              >
                <HiClock className="text-xl" />
                <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-amber-400 border border-stone-950"></span>
              </button>

              {showNotifications && (
                <div className="absolute right-0 top-full mt-3 w-80 rounded-2xl border border-white/10 bg-stone-950/95 p-3 shadow-2xl shadow-black/30">
                  <div className="flex items-center justify-between px-2 pb-2 border-b border-white/10 mb-2">
                    <div className="text-sm font-bold text-white">Notifications</div>
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-300">
                      {notifications.filter((item) => item.unread).length} new
                    </span>
                  </div>

                  <div className="space-y-2">
                    {notifications.map((item) => (
                      <div
                        key={item.id}
                        className={`rounded-xl border px-3 py-2.5 ${item.unread ? 'border-amber-400/30 bg-amber-500/10' : 'border-white/10 bg-white/5'}`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="text-sm font-bold text-white">{item.title}</div>
                            <div className="text-xs text-stone-300 mt-1">{item.detail}</div>
                          </div>
                          {item.unread && <span className="mt-1 h-2.5 w-2.5 rounded-full bg-amber-400" />}
                        </div>
                        <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-stone-400 mt-2">{item.time}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => setShowEventForm(!showEventForm)}
              className="group w-full md:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-amber-400 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-stone-900 font-extrabold py-3.5 px-7 rounded-full transition-all shadow-xl shadow-amber-500/25 hover:-translate-y-0.5"
            >
              <HiPlus className="text-xl group-hover:rotate-90 transition-transform" /> {showEventForm ? 'Close Form' : 'Create Event'}
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="group bg-white p-6 rounded-3xl shadow-soft border border-amber-100/60 flex items-center justify-between hover:-translate-y-1 transition-all">
          <div>
            <p className="text-stone-500 text-xs font-bold uppercase tracking-wider mb-1">Total Revenue</p>
            <h3 className="text-3xl font-black text-stone-900">${stats.totalRevenue}</h3>
          </div>
          <div className="w-14 h-14 bg-gradient-to-br from-green-400 to-green-600 text-white rounded-2xl flex items-center justify-center text-2xl shadow-lg shadow-green-500/25 group-hover:scale-110 transition-transform">
            <HiCash />
          </div>
        </div>
        <div className="group bg-white p-6 rounded-3xl shadow-soft border border-amber-100/60 flex items-center justify-between hover:-translate-y-1 transition-all">
          <div>
            <p className="text-stone-500 text-xs font-bold uppercase tracking-wider mb-1">Paid Clients</p>
            <h3 className="text-3xl font-black text-stone-900">{stats.paidClients}</h3>
          </div>
          <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-blue-600 text-white rounded-2xl flex items-center justify-center text-2xl shadow-lg shadow-blue-500/25 group-hover:scale-110 transition-transform">
            <HiUserGroup />
          </div>
        </div>
        <div className="group bg-white p-6 rounded-3xl shadow-soft border border-amber-100/60 flex items-center justify-between hover:-translate-y-1 transition-all">
          <div>
            <p className="text-stone-500 text-xs font-bold uppercase tracking-wider mb-1">Pending Requests</p>
            <h3 className="text-3xl font-black text-stone-900">{stats.pendingRequests}</h3>
          </div>
          <div className="w-14 h-14 bg-gradient-to-br from-amber-400 to-amber-600 text-stone-900 rounded-2xl flex items-center justify-center text-2xl shadow-lg shadow-amber-500/25 group-hover:scale-110 transition-transform">
            <HiClock />
          </div>
        </div>
      </div>

      {/* Create Event Form */}
      {showEventForm && (
        <div className="bg-white p-8 rounded-3xl shadow-soft border border-amber-100/60 mb-10 animate-fade-up">
          <h2 className="text-2xl font-extrabold mb-1 text-stone-900">Create New Event</h2>
          <p className="text-stone-500 text-sm mb-6">Fill in the details to publish a new event to the platform.</p>
          <form onSubmit={handleCreateEvent} className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className={labelCls}>Event Title</label>
              <input required type="text" placeholder="e.g. Neon Nights EDM Festival" className={inputCls} value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
            </div>
            <div>
              <label className={labelCls}>Category</label>
              <select className={inputCls} value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}>
                <option value="">Select a category...</option>
                {['Technology', 'Music', 'Business', 'Art', 'Party', 'Conference', 'Wedding', 'Festival', 'Sports', 'Food', 'Workshop'].map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>Event Date</label>
              <input required type="date" className={inputCls} value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} />
            </div>
            <div>
              <label className={labelCls}>Location</label>
              <input required type="text" placeholder="e.g. Grand Arena, New York" className={inputCls} value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} />
            </div>
            <div>
              <label className={labelCls}>Total Seats</label>
              <input required type="number" min="1" placeholder="e.g. 500" className={inputCls} value={formData.totalSeats} onChange={e => setFormData({ ...formData, totalSeats: e.target.value })} />
            </div>
            <div>
              <label className={labelCls}>Ticket Price ($)</label>
              <input required type="number" min="0" placeholder="0 = free" className={inputCls} value={formData.ticketPrice} onChange={e => setFormData({ ...formData, ticketPrice: e.target.value })} />
            </div>
            <div className="md:col-span-2">
              <label className={labelCls}>Description</label>
              <textarea placeholder="Describe your event..." className={`${inputCls} w-full`} rows="3" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
            </div>
            <div className="md:col-span-2">
              <label className={labelCls}>Image URL (optional)</label>
              <input type="url" placeholder="https://images.unsplash.com/..." className={`${inputCls} w-full`} value={formData.image} onChange={e => setFormData({ ...formData, image: e.target.value })} />
              {formData.image && (
                <div className="mt-3">
                  <p className="text-xs font-bold text-stone-500 mb-2">Preview:</p>
                  <img src={formData.image} alt="Event preview" className="h-40 w-full max-w-md object-cover rounded-xl border border-stone-200" onError={(e) => { e.target.style.opacity = '0.3'; }} />
                </div>
              )}
            </div>
            <div className="md:col-span-2">
              <button type="submit" disabled={submitLoading} className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-900 font-extrabold py-4 rounded-xl transition-all shadow-lg shadow-amber-500/25 hover:-translate-y-0.5 disabled:opacity-60 disabled:translate-y-0">
                {submitLoading ? 'Publishing...' : 'Publish Event'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="flex gap-2 bg-white p-1.5 rounded-2xl border border-amber-100/60 w-fit">
          <button
            onClick={() => setActiveTab('bookings')}
            className={`px-6 py-2.5 rounded-xl font-extrabold text-sm transition-all ${
              activeTab === 'bookings' ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-stone-900 shadow-md shadow-amber-500/25' : 'text-stone-500 hover:text-stone-700'
            }`}
          >
            Bookings ({bookings.length})
          </button>
          <button
            onClick={() => setActiveTab('events')}
            className={`px-6 py-2.5 rounded-xl font-extrabold text-sm transition-all ${
              activeTab === 'events' ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-stone-900 shadow-md shadow-amber-500/25' : 'text-stone-500 hover:text-stone-700'
            }`}
          >
            Events ({events.length})
          </button>
        </div>
        {activeTab === 'events' && (
          <button
            onClick={() => setShowEventForm(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-900 font-extrabold px-5 py-2.5 rounded-full transition-all shadow-lg shadow-amber-500/25 hover:-translate-y-0.5"
          >
            <HiPlus /> Add Event
          </button>
        )}
      </div>

      {/* Bookings Tab */}
      {activeTab === 'bookings' && (
        <div className="bg-white rounded-3xl shadow-soft border border-amber-100/60 overflow-hidden">
          {bookings.length === 0 ? (
            <p className="p-10 text-center text-stone-500 font-medium">No bookings yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-amber-50/80 text-stone-500 uppercase text-xs tracking-wider">
                  <tr>
                    <th className="p-5 text-left font-black">User</th>
                    <th className="p-5 text-left font-black">Event</th>
                    <th className="p-5 text-left font-black">Status</th>
                    <th className="p-5 text-left font-black">Payment</th>
                    <th className="p-5 text-left font-black">Amount</th>
                    <th className="p-5 text-left font-black">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-amber-50">
                  {bookings.map((booking) => (
                    <tr key={booking._id} className="hover:bg-amber-50/40 transition">
                      <td className="p-5 font-bold text-stone-800">{booking.userId?.username || 'Unknown'}</td>
                      <td className="p-5 text-stone-600 font-medium">{booking.eventId?.title || 'Deleted'}</td>
                      <td className="p-5">
                        <span className={`px-3 py-1 text-[10px] font-black rounded-full uppercase tracking-wider ${
                          booking.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                          booking.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                          'bg-amber-100 text-amber-700'
                        }`}>
                          {booking.status}
                        </span>
                      </td>
                      <td className="p-5">
                        <span className={`px-3 py-1 text-[10px] font-black rounded-full uppercase tracking-wider ${
                          booking.paymentStatus === 'paid' ? 'bg-blue-100 text-blue-700' : 'bg-stone-100 text-stone-600'
                        }`}>
                          {formatPaymentStatus(booking.paymentStatus)}
                        </span>
                      </td>
                      <td className="p-5 font-extrabold text-stone-800">${booking.amount}</td>
                      <td className="p-5">
                        <div className="flex gap-2">
                          {booking.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleConfirmBooking(booking._id, 'paid')}
                                className="bg-green-100 text-green-700 px-3.5 py-2 rounded-xl text-xs font-extrabold hover:bg-green-200 transition flex items-center gap-1.5"
                              >
                                <HiCheck /> Confirm
                              </button>
                              <button
                                onClick={() => handleCancelBooking(booking._id)}
                                className="bg-red-100 text-red-600 px-3.5 py-2 rounded-xl text-xs font-extrabold hover:bg-red-200 transition flex items-center gap-1.5"
                              >
                                <HiX /> Reject
                              </button>
                            </>
                          )}
                          {booking.status === 'confirmed' && (
                            <span className="text-xs text-green-600 font-extrabold">Confirmed ✓</span>
                          )}
                          {booking.status === 'cancelled' && (
                            <span className="text-xs text-red-500 font-extrabold">Cancelled</span>
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

      {/* Events Tab */}
      {activeTab === 'events' && (
        <div className="bg-white rounded-3xl shadow-soft border border-amber-100/60 overflow-hidden">
          {events.length === 0 ? (
            <div className="p-14 text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-amber-100 to-amber-200 rounded-full flex items-center justify-center mx-auto mb-6">
                <HiPlus className="text-amber-500 text-4xl" />
              </div>
              <p className="text-xl text-stone-600 mb-2 font-extrabold">No events yet</p>
              <p className="text-stone-500 mb-8 font-medium">Create your first event to start selling tickets.</p>
              <button
                onClick={() => setShowEventForm(true)}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-900 font-extrabold py-3.5 px-8 rounded-full transition-all shadow-lg shadow-amber-500/25 hover:-translate-y-0.5"
              >
                <HiPlus /> Create Event
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-amber-50/80 text-stone-500 uppercase text-xs tracking-wider">
                  <tr>
                    <th className="p-5 text-left font-black">Event</th>
                    <th className="p-5 text-left font-black">Date</th>
                    <th className="p-5 text-left font-black">Location</th>
                    <th className="p-5 text-left font-black">Seats</th>
                    <th className="p-5 text-left font-black">Price</th>
                    <th className="p-5 text-left font-black">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-amber-50">
                  {events.map((event) => (
                    <tr key={event._id} className="hover:bg-amber-50/40 transition">
                      <td className="p-5">
                        <div className="flex items-center gap-3">
                          {event.image && (
                            <img src={event.image} alt="" className="w-12 h-12 rounded-xl object-cover border border-stone-100 shrink-0" />
                          )}
                          <span className="font-bold text-stone-800">{event.title}</span>
                        </div>
                      </td>
                      <td className="p-5 text-stone-600 font-medium">{new Date(event.date).toLocaleDateString()}</td>
                      <td className="p-5 text-stone-600 font-medium">{event.location}</td>
                      <td className="p-5">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-extrabold ${
                          event.availableSeats / event.totalSeats < 0.25 ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                          {event.availableSeats}/{event.totalSeats}
                        </span>
                      </td>
                      <td className="p-5 font-extrabold text-stone-800">{event.ticketPrice === 0 ? <span className="text-green-600">FREE</span> : `$${event.ticketPrice}`}</td>
                      <td className="p-5">
                        <button
                          onClick={() => setDeleteTarget(event)}
                          className="bg-red-100 text-red-600 px-3.5 py-2 rounded-xl text-xs font-extrabold hover:bg-red-200 transition flex items-center gap-1.5"
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

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-sm" onClick={() => setDeleteTarget(null)}>
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 animate-fade-up" onClick={(e) => e.stopPropagation()}>
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-5">
              <HiTrash className="text-3xl" />
            </div>
            <h3 className="text-2xl font-extrabold text-stone-900 text-center mb-3">Delete Event?</h3>
            <p className="text-stone-500 text-center font-medium mb-2">
              You are about to delete <strong className="text-stone-800">"{deleteTarget.title}"</strong>.
            </p>
            <p className="text-xs text-red-500 text-center font-bold bg-red-50 border border-red-100 p-3 rounded-xl mb-6">
              This will also remove all bookings for this event. This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={deleteLoading}
                className="flex-1 bg-stone-100 hover:bg-stone-200 text-stone-700 font-extrabold py-3.5 rounded-xl transition disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteEvent}
                disabled={deleteLoading}
                className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-400 hover:to-red-500 text-white font-extrabold py-3.5 rounded-xl transition shadow-lg shadow-red-500/25 disabled:opacity-60"
              >
                {deleteLoading ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
