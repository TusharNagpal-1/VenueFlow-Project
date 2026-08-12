import React, { useState, useEffect, useContext, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/axios';
import {
  HiSearch,
  HiBell,
  HiSparkles,
  HiTicket,
  HiCalendar,
  HiLocationMarker,
  HiArrowRight,
  HiClock,
  HiCheckCircle,
  HiStar,
  HiChevronRight,
  HiBadgeCheck,
  HiTrendingUp,
  HiUserCircle,
  HiLogout,
  HiMenu,
  HiX,
  HiHeart,
  HiFilter,
  HiArrowCircleRight,
} from 'react-icons/hi';

const FALLBACK_IMG = 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?q=80&w=1200&auto=format&fit=crop';
const CATEGORY_TABS = ['All', 'Music', 'Workshops', 'Sports', 'Conferences', 'Entertainment'];

const getEventImage = (event) => event?.image || FALLBACK_IMG;
const getInitials = (name) =>
  (name || '?').split(' ').filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase() || '?';

const formatDate = (date) =>
  new Date(date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });

const formatFullDate = (date) =>
  new Date(date).toLocaleDateString(undefined, { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' });

const formatTime = (date) =>
  new Date(date).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });

const formatPrice = (value) => (Number(value) === 0 ? 'Free' : `$${value}`);
const bookingCode = (id) => `#${String(id).slice(-8).toUpperCase()}`;

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
};

const getCountdown = (dateStr) => {
  const target = new Date(dateStr);
  const diff = target - new Date();
  if (diff <= 0) return 'Started';
  const days = Math.floor(diff / 86400000);
  const time = target.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
  if (days === 0) return `Today at ${time}`;
  if (days === 1) return `Tomorrow at ${time}`;
  return `In ${days} days`;
};

const UserDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [bookings, setBookings] = useState([]);
  const [allEvents, setAllEvents] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchData();
  }, [user, navigate]);

  const fetchData = async () => {
    setError('');
    try {
      const [bookingsRes, eventsRes] = await Promise.all([
        api.get('/events/my-bookings'),
        api.get('/events'),
      ]);
      setBookings(bookingsRes.data || []);
      setAllEvents(eventsRes.data || []);
    } catch (error) {
      console.error('Error fetching dashboard data', error);
      setError("We couldn't load your dashboard right now. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const primaryEvent = useMemo(() => {
    if (bookings.length > 0) {
      const upcoming = [...bookings]
        .filter((booking) => booking.eventId && booking.status !== 'cancelled')
        .sort((a, b) => new Date(a.eventId.date) - new Date(b.eventId.date));
      if (upcoming[0]?.eventId) return upcoming[0].eventId;
    }
    return allEvents.find((event) => new Date(event.date) > new Date()) || allEvents[0];
  }, [allEvents, bookings]);

  const upcomingBooking = useMemo(() => {
    if (!bookings.length) return null;
    return [...bookings]
      .filter((booking) => booking.eventId && booking.status !== 'cancelled')
      .sort((a, b) => new Date(a.eventId.date) - new Date(b.eventId.date))[0];
  }, [bookings]);

  const stats = useMemo(() => {
    const total = bookings.length;
    const confirmed = bookings.filter((booking) => booking.status === 'confirmed').length;
    const upcoming = bookings.filter(
      (booking) => booking.eventId && booking.status !== 'cancelled' && new Date(booking.eventId.date) > new Date()
    ).length;
    const completed = bookings.filter((booking) => booking.status === 'confirmed' && booking.eventId && new Date(booking.eventId.date) < new Date()).length;
    return { total, confirmed, upcoming, completed };
  }, [bookings]);

  const filteredEvents = useMemo(() => {
    const query = searchTerm.toLowerCase();
    return allEvents.filter((event) => {
      const matchesCategory = activeCategory === 'All' || event.category === activeCategory;
      const matchesText = !query || `${event.title} ${event.location} ${event.category}`.toLowerCase().includes(query);
      return matchesCategory && matchesText;
    });
  }, [activeCategory, allEvents, searchTerm]);

  const recommendations = useMemo(() => {
    const bookedIds = new Set(bookings.map((booking) => String(booking.eventId?._id)).filter(Boolean));
    const futureEvents = allEvents.filter((event) => new Date(event.date) > new Date() && !bookedIds.has(String(event._id)));
    return futureEvents.slice(0, 4);
  }, [allEvents, bookings]);

  const notifications = useMemo(() => {
    const list = [];

    if (upcomingBooking?.eventId) {
      list.push({
        id: 'upcoming-event',
        title: 'Upcoming event',
        detail: `${upcomingBooking.eventId.title} starts ${getCountdown(upcomingBooking.eventId.date)}.`,
        time: 'Now',
        unread: true,
      });
    }

    const confirmed = bookings.filter((booking) => booking.status === 'confirmed').slice(0, 2);
    confirmed.forEach((booking) => {
      if (booking.eventId?.title) {
        list.push({
          id: `confirmed-${booking._id}`,
          title: 'Booking confirmed',
          detail: `Your ticket for ${booking.eventId.title} is confirmed.`,
          time: 'Today',
          unread: true,
        });
      }
    });

    if (bookings.filter((booking) => booking.status === 'pending').length > 0) {
      list.push({
        id: 'pending-booking',
        title: 'Pending review',
        detail: 'One of your booking requests is still awaiting confirmation.',
        time: 'Updated',
        unread: true,
      });
    }

    if (!list.length) {
      list.push({
        id: 'discover-events',
        title: 'Discover events',
        detail: 'Explore new experiences and reserve your next unforgettable night.',
        time: 'Now',
        unread: true,
      });
    }

    return list.slice(0, 4);
  }, [bookings, upcomingBooking]);

  const statusLabel = (status) => {
    if (!status) return 'pending';
    return status;
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto pb-12">
        <div className="animate-pulse space-y-8">
          <div className="h-80 rounded-[32px] bg-stone-200"></div>
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="h-36 rounded-3xl bg-stone-200"></div>
            ))}
          </div>
          <div className="h-80 rounded-[32px] bg-stone-200"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto pb-12">
      <nav className="sticky top-4 z-30 mb-8">
        <div className="backdrop-blur-xl bg-stone-950/80 border border-white/10 shadow-[0_18px_45px_rgba(0,0,0,0.25)] rounded-full px-4 py-3 flex items-center justify-between gap-3 text-white">
          <Link to="/" className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 text-stone-900 flex items-center justify-center font-black shadow-lg shadow-amber-500/30">
              <HiSparkles className="text-lg" />
            </div>
            <div className="font-black tracking-tight text-lg hidden sm:block">
              Venue<span className="text-amber-400">Flow</span>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-stone-200">
            <Link to="/" className="hover:text-amber-300 transition-colors">Explore Events</Link>
            <Link to="#bookings" className="hover:text-amber-300 transition-colors">My Bookings</Link>
            <Link to="/dashboard" className="hover:text-amber-300 transition-colors">Dashboard</Link>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition">
              <HiSearch className="text-lg text-amber-200" />
            </button>
            <div className="relative">
              <button
                onClick={() => setNotificationsOpen((open) => !open)}
                className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition relative"
              >
                <HiBell className="text-lg text-amber-200" />
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-400 border border-stone-950"></span>
              </button>

              {notificationsOpen && (
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

            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-2 py-1.5 hover:bg-white/10 transition"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-stone-900 font-black flex items-center justify-center text-xs">
                  {getInitials(user?.name || user?.username)}
                </div>
                <span className="hidden sm:block text-sm font-semibold text-stone-100">{user?.name || user?.username}</span>
                <HiChevronRight className={`hidden sm:block text-sm transition ${menuOpen ? 'rotate-90' : ''}`} />
              </button>

              {menuOpen && (
                <div className="absolute right-0 top-full mt-3 w-56 rounded-2xl border border-white/10 bg-stone-950/95 p-2 shadow-2xl shadow-black/30">
                  <div className="px-3 py-2 border-b border-white/10 mb-2">
                    <div className="text-sm font-bold text-white">{user?.name || user?.username}</div>
                    <div className="text-xs text-stone-400">{user?.email}</div>
                  </div>
                  <Link to="/dashboard" className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-stone-200 hover:bg-white/5">
                    <HiUserCircle className="text-lg text-amber-400" /> Dashboard
                  </Link>
                  <Link to="#bookings" className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-stone-200 hover:bg-white/5">
                    <HiTicket className="text-lg text-amber-400" /> My Bookings
                  </Link>
                  <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-red-300 hover:bg-red-500/10">
                    <HiLogout className="text-lg" /> Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {error && (
        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-red-700 flex items-center justify-between">
          <span>{error}</span>
          <button onClick={fetchData} className="font-bold underline">Retry</button>
        </div>
      )}

      <section className="mb-10">
        <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-6">
          <div className="relative overflow-hidden rounded-[30px] bg-gradient-to-br from-stone-950 via-stone-900 to-[#1d140d] px-6 py-7 md:px-8 md:py-10 text-white shadow-[0_30px_60px_rgba(0,0,0,0.2)]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(251,146,60,0.30),transparent_35%),radial-gradient(circle_at_bottom_left,_rgba(251,191,36,0.12),transparent_30%)]" />
            <div className="relative z-10 max-w-xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.25em] text-amber-200">
                <HiBadgeCheck className="text-sm" /> VenueFlow Member
              </div>
              <h1 className="mt-6 text-4xl md:text-5xl font-black leading-none tracking-[-0.04em]">
                {getGreeting()}, {user?.name || user?.username}
              </h1>
              <p className="mt-4 text-base md:text-lg text-stone-300 max-w-lg">
                Discover experiences worth remembering.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link to="/" className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-400 to-amber-600 px-6 py-3.5 rounded-full text-sm font-black text-stone-900 shadow-lg shadow-amber-500/25 hover:-translate-y-0.5 transition">
                  Explore Events <HiArrowRight />
                </Link>
                <Link to="#bookings" className="inline-flex items-center gap-2 border border-white/15 bg-white/5 px-6 py-3.5 rounded-full text-sm font-bold text-white hover:bg-white/10 transition">
                  View My Bookings
                </Link>
              </div>

              <div className="mt-8 flex items-center gap-6 text-sm text-stone-300">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400"></div>
                  3 upcoming plans
                </div>
                <div className="flex items-center gap-2">
                  <HiStar className="text-amber-400" /> Curated just for you
                </div>
              </div>
            </div>
          </div>

          <div className="relative group overflow-hidden rounded-[30px] border border-amber-100 bg-white shadow-[0_20px_40px_rgba(0,0,0,0.06)]">
            <img src={getEventImage(primaryEvent)} alt={primaryEvent?.title || 'Featured event'} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/40 to-transparent" />
            <div className="absolute top-5 left-5 inline-flex items-center gap-2 rounded-full bg-amber-400/90 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.22em] text-stone-900">
              <HiSparkles className="text-xs" /> Featured
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
              <div className="text-[10px] font-black uppercase tracking-[0.25em] text-amber-200 mb-3">Featured Event</div>
              <h2 className="text-2xl md:text-3xl font-black tracking-[-0.04em] mb-3">{primaryEvent?.title || 'Select an event'}</h2>
              <div className="space-y-2 text-sm text-stone-200">
                <div className="flex items-center gap-2"><HiCalendar className="text-amber-300" /> {primaryEvent ? formatFullDate(primaryEvent.date) : 'No event selected'}</div>
                <div className="flex items-center gap-2"><HiLocationMarker className="text-amber-300" /> {primaryEvent?.location || 'Location pending'}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mb-10 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          { label: 'Total Bookings', value: stats.total, icon: <HiTicket />, tone: 'amber', detail: 'Across all events' },
          { label: 'Confirmed', value: stats.confirmed, icon: <HiCheckCircle />, tone: 'emerald', detail: 'Ready to attend' },
          { label: 'Upcoming', value: stats.upcoming, icon: <HiCalendar />, tone: 'sky', detail: 'In your plan' },
          { label: 'Completed', value: stats.completed, icon: <HiTrendingUp />, tone: 'violet', detail: 'Past experiences' },
        ].map((card, index) => (
          <div key={card.label} className="group rounded-[26px] border border-stone-200 bg-white p-5 shadow-[0_12px_28px_rgba(15,23,42,0.04)] hover:-translate-y-1 transition">
            <div className="flex items-center justify-between">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl ${
                card.tone === 'amber' ? 'bg-amber-100 text-amber-700' :
                card.tone === 'emerald' ? 'bg-emerald-100 text-emerald-700' :
                card.tone === 'sky' ? 'bg-sky-100 text-sky-700' : 'bg-violet-100 text-violet-700'
              }`}>
                {card.icon}
              </div>
              <div className="text-emerald-500 text-[10px] font-black uppercase tracking-[0.2em]">+{index + 1}</div>
            </div>
            <div className="mt-5 text-3xl font-black tracking-[-0.04em] text-stone-900">{card.value}</div>
            <div className="mt-1 text-xs font-black uppercase tracking-[0.2em] text-stone-500">{card.label}</div>
            <div className="mt-4 h-1.5 w-full rounded-full bg-stone-100 overflow-hidden">
              <div className={`h-full rounded-full ${card.tone === 'amber' ? 'bg-amber-500' : card.tone === 'emerald' ? 'bg-emerald-500' : card.tone === 'sky' ? 'bg-sky-500' : 'bg-violet-500'}`} style={{ width: `${Math.min((card.value / Math.max(stats.total || 1, 1)) * 100 || 12, 100)}%` }} />
            </div>
            <div className="mt-3 text-xs text-stone-500">{card.detail}</div>
          </div>
        ))}
      </section>

      <section className="mb-10 rounded-[30px] border border-stone-200 bg-white p-5 md:p-6 shadow-[0_15px_35px_rgba(15,23,42,0.04)]">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between mb-6">
          <div>
            <div className="text-[11px] font-black uppercase tracking-[0.24em] text-amber-600">Discover</div>
            <h2 className="mt-2 text-3xl font-black tracking-[-0.04em] text-stone-900">Discover your next experience</h2>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative min-w-[200px] flex-1">
              <HiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search events"
                className="w-full rounded-full border border-stone-200 bg-stone-50 pl-11 pr-4 py-2.5 text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
              />
            </div>
            <button className="inline-flex items-center gap-2 rounded-full border border-stone-200 bg-stone-50 px-4 py-2.5 text-sm font-bold text-stone-700 hover:bg-stone-100">
              <HiFilter /> Filter
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {CATEGORY_TABS.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`rounded-full px-4 py-2 text-sm font-bold transition ${
                activeCategory === category ? 'bg-stone-900 text-white shadow-lg shadow-stone-900/10' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filteredEvents.length === 0 ? (
            <div className="md:col-span-2 xl:col-span-3 rounded-[26px] border border-dashed border-stone-300 bg-stone-50 p-12 text-center">
              <div className="text-5xl mb-4">🎟️</div>
              <h3 className="text-2xl font-black text-stone-900">No events match your search.</h3>
              <p className="mt-2 text-stone-500">Try another keyword or switch category.</p>
            </div>
          ) : (
            filteredEvents.map((event, index) => (
              <div key={event._id} className={`group relative overflow-hidden rounded-[26px] border border-stone-200 bg-stone-50 shadow-[0_12px_28px_rgba(15,23,42,0.04)] ${index % 3 === 0 ? 'xl:col-span-1' : ''}`}>
                <div className="relative h-64 overflow-hidden">
                  <img src={getEventImage(event)} alt={event.title} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-stone-950/15 to-transparent" />
                  <div className="absolute left-4 top-4 rounded-full border border-white/20 bg-black/30 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.2em] text-amber-200 backdrop-blur-sm">
                    {event.category || 'General'}
                  </div>
                  <div className="absolute right-4 top-4 rounded-full bg-white/90 px-2.5 py-1 text-xs font-black text-stone-900">
                    {formatPrice(event.ticketPrice)}
                  </div>
                </div>
                <div className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-xs font-bold text-stone-500">{formatDate(event.date)}</div>
                    <span className="text-xs font-bold text-emerald-600">{event.availableSeats || 0} left</span>
                  </div>
                  <h3 className="text-xl font-black tracking-[-0.03em] text-stone-900 leading-tight">{event.title}</h3>
                  <div className="mt-3 space-y-2 text-sm text-stone-600">
                    <div className="flex items-center gap-2"><HiCalendar className="text-amber-500" /> {formatFullDate(event.date)}</div>
                    <div className="flex items-center gap-2"><HiLocationMarker className="text-amber-500" /> {event.location}</div>
                  </div>
                  <div className="mt-5 flex items-center justify-between gap-3">
                    <div className="text-sm font-bold text-stone-900">{formatPrice(event.ticketPrice)}</div>
                    <Link to={`/events/${event._id}`} className="inline-flex items-center gap-2 rounded-full bg-stone-900 px-4 py-2.5 text-sm text-white font-bold hover:bg-stone-800 transition">
                      View Details <HiArrowRight className="text-xs" />
                    </Link>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      <section className="mb-10 grid lg:grid-cols-[0.9fr_1.1fr] gap-6">
        <div className="rounded-[30px] border border-stone-200 bg-white p-5 md:p-6 shadow-[0_15px_35px_rgba(15,23,42,0.04)]">
          <div className="text-[11px] font-black uppercase tracking-[0.24em] text-amber-600">Next Up</div>
          {upcomingBooking?.eventId ? (
            <>
              <div className="mt-5 overflow-hidden rounded-[24px] border border-stone-200">
                <img src={getEventImage(upcomingBooking.eventId)} alt={upcomingBooking.eventId.title} className="h-56 w-full object-cover" />
              </div>
              <div className="mt-5">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-2xl font-black tracking-[-0.04em] text-stone-900">{upcomingBooking.eventId.title}</h3>
                  <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-emerald-700">
                    {statusLabel(upcomingBooking.status)}
                  </span>
                </div>
                <div className="mt-4 space-y-2 text-sm text-stone-600">
                  <div className="flex items-center gap-2"><HiCalendar className="text-amber-500" /> {formatFullDate(upcomingBooking.eventId.date)}</div>
                  <div className="flex items-center gap-2"><HiClock className="text-amber-500" /> {formatTime(upcomingBooking.eventId.date)}</div>
                  <div className="flex items-center gap-2"><HiLocationMarker className="text-amber-500" /> {upcomingBooking.eventId.location}</div>
                </div>
                <div className="mt-5 flex items-center justify-between rounded-2xl bg-stone-50 px-4 py-3">
                  <div>
                    <div className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-500">Booking ID</div>
                    <div className="mt-1 text-sm font-black text-stone-900">{bookingCode(upcomingBooking._id)}</div>
                  </div>
                  <Link to={`/events/${upcomingBooking.eventId._id}`} className="inline-flex items-center gap-2 rounded-full bg-stone-900 px-4 py-2.5 text-sm font-bold text-white hover:bg-stone-800 transition">
                    View Booking <HiArrowRight className="text-xs" />
                  </Link>
                </div>
              </div>
            </>
          ) : (
            <div className="mt-6 rounded-[26px] border border-dashed border-stone-300 bg-stone-50 p-8 text-center">
              <div className="text-5xl mb-4">🎉</div>
              <h3 className="text-xl font-black text-stone-900">Your next experience is waiting.</h3>
              <p className="mt-2 text-stone-500">Start exploring curated events and reserve your next great night out.</p>
              <Link to="/" className="mt-5 inline-flex items-center gap-2 rounded-full bg-amber-500 px-5 py-3 text-sm font-black text-stone-900">Explore Events <HiArrowRight /></Link>
            </div>
          )}
        </div>

        <div id="bookings" className="rounded-[30px] border border-stone-200 bg-white p-5 md:p-6 shadow-[0_15px_35px_rgba(15,23,42,0.04)]">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <div className="text-[11px] font-black uppercase tracking-[0.24em] text-amber-600">Activity</div>
              <h2 className="mt-2 text-3xl font-black tracking-[-0.04em] text-stone-900">Recent booking activity</h2>
            </div>
            <Link to="#bookings" className="text-sm font-bold text-amber-700">See all</Link>
          </div>

          {bookings.length === 0 ? (
            <div className="rounded-[24px] border border-dashed border-stone-300 bg-stone-50 p-8 text-center">
              <div className="text-5xl mb-4">✨</div>
              <h3 className="text-xl font-black text-stone-900">Your next experience is waiting.</h3>
              <p className="mt-2 text-stone-500">Book an event to build your activity timeline.</p>
            </div>
          ) : (
            <div className="space-y-5">
              {bookings.slice(0, 4).map((booking, index) => (
                <div key={booking._id} className="relative pl-7">
                  {index !== bookings.slice(0, 4).length - 1 && <div className="absolute left-[8px] top-8 bottom-[-18px] w-px bg-stone-200"></div>}
                  <div className={`absolute left-0 top-2 w-4 h-4 rounded-full ${booking.status === 'confirmed' ? 'bg-emerald-500' : booking.status === 'cancelled' ? 'bg-red-400' : 'bg-amber-400'} ring-4 ring-white shadow-md`}></div>
                  <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4">
                    <div className="flex items-center justify-between gap-3 mb-2">
                      <div className="font-bold text-stone-900">{booking.eventId?.title || 'Event'}</div>
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-500">{statusLabel(booking.status)}</span>
                    </div>
                    <div className="text-sm text-stone-600">
                      {booking.status === 'confirmed' ? 'Booking confirmed and ready for check-in.' : booking.status === 'cancelled' ? 'Booking cancelled.' : 'Awaiting confirmation from the venue.'}
                    </div>
                    <div className="mt-3 text-xs text-stone-500 flex items-center justify-between">
                      <span>{bookingCode(booking._id)}</span>
                      <span>{new Date(booking.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="mb-10 rounded-[30px] border border-stone-200 bg-white p-5 md:p-6 shadow-[0_15px_35px_rgba(15,23,42,0.04)]">
        <div className="flex items-end justify-between gap-3 mb-6">
          <div>
            <div className="text-[11px] font-black uppercase tracking-[0.24em] text-amber-600">Recommended</div>
            <h2 className="mt-2 text-3xl font-black tracking-[-0.04em] text-stone-900">You might also like</h2>
          </div>
          <Link to="/" className="inline-flex items-center gap-2 text-sm font-bold text-amber-700">Browse more <HiArrowRight className="text-xs" /></Link>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {recommendations.length === 0 ? (
            <div className="xl:col-span-4 rounded-[24px] border border-dashed border-stone-300 bg-stone-50 p-8 text-center">
              <div className="text-5xl mb-4">🎪</div>
              <h3 className="text-xl font-black text-stone-900">More events are coming soon.</h3>
            </div>
          ) : (
            recommendations.map((event) => (
              <div key={event._id} className="group overflow-hidden rounded-[24px] border border-stone-200 bg-stone-50 hover:shadow-xl transition">
                <div className="relative h-52 overflow-hidden">
                  <img src={getEventImage(event)} alt={event.title} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-950/70 via-stone-950/15 to-transparent" />
                  <div className="absolute left-3 top-3 rounded-full bg-black/30 px-2 py-1 text-[9px] font-black uppercase tracking-[0.2em] text-amber-200 backdrop-blur-sm">
                    {event.category || 'General'}
                  </div>
                  <div className="absolute right-3 top-3 rounded-full bg-white/90 px-2 py-1 text-[10px] font-black text-stone-900">
                    {formatPrice(event.ticketPrice)}
                  </div>
                </div>
                <div className="p-4">
                  <div className="mb-2 text-xs font-bold text-stone-500">{formatDate(event.date)}</div>
                  <h3 className="text-lg font-black tracking-[-0.03em] text-stone-900 leading-tight">{event.title}</h3>
                  <div className="mt-3 flex items-center gap-2 text-sm text-stone-600"><HiLocationMarker className="text-amber-500" /> {event.location}</div>
                  <Link to={`/events/${event._id}`} className="mt-4 inline-flex items-center gap-2 rounded-full bg-stone-900 px-4 py-2.5 text-sm font-bold text-white hover:bg-stone-800 transition">
                    Book now <HiArrowCircleRight className="text-sm" />
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {!bookings.length && (
        <section className="mb-10 overflow-hidden rounded-[32px] border border-amber-100 bg-gradient-to-br from-[#fffaf0] via-white to-[#fff6e8] p-8 shadow-[0_20px_50px_rgba(120,87,17,0.08)]">
          <div className="grid lg:grid-cols-[1fr_0.8fr] items-center gap-8">
            <div>
              <div className="text-[11px] font-black uppercase tracking-[0.24em] text-amber-600">Your next chapter</div>
              <h2 className="mt-3 text-4xl font-black tracking-[-0.05em] text-stone-900">Your next experience is waiting.</h2>
              <p className="mt-3 max-w-md text-stone-600">Explore unforgettable live events, intimate sessions, and standout venues designed around your taste.</p>
              <Link to="/" className="mt-6 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-400 to-amber-600 px-6 py-3.5 text-sm font-black text-stone-900 shadow-lg shadow-amber-500/25">
                Explore Events <HiArrowRight />
              </Link>
            </div>
            <div className="relative h-72 rounded-[28px] bg-gradient-to-br from-stone-900 via-stone-800 to-[#27160d] overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(251,191,36,0.25),transparent_35%)]" />
              <div className="absolute bottom-6 left-6 right-6 rounded-[22px] border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                <div className="flex items-center justify-between text-white">
                  <div>
                    <div className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-200">Live</div>
                    <div className="mt-2 text-2xl font-black">Night Market</div>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-stone-900">
                    <HiSparkles className="text-xl" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      <footer className="mt-12 rounded-[30px] border border-stone-200 bg-stone-950 text-stone-200 p-6 md:p-8">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr_0.8fr_0.8fr_1.2fr]">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 text-stone-900 flex items-center justify-center font-black">
                <HiSparkles className="text-lg" />
              </div>
              <div className="text-xl font-black tracking-tight">Venue<span className="text-amber-400">Flow</span></div>
            </div>
            <p className="text-sm text-stone-400 max-w-xs">Discover, book, and experience the moments that shape your city.</p>
          </div>

          <div>
            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-amber-300 mb-4">About</h3>
            <ul className="space-y-2 text-sm text-stone-400">
              <li>Our story</li>
              <li>Partners</li>
              <li>Press</li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-amber-300 mb-4">Explore</h3>
            <ul className="space-y-2 text-sm text-stone-400">
              <li>Events</li>
              <li>Venues</li>
              <li>Collections</li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-amber-300 mb-4">Help</h3>
            <ul className="space-y-2 text-sm text-stone-400">
              <li>Support</li>
              <li>Contact</li>
              <li>Privacy</li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-amber-300 mb-4">Follow</h3>
            <div className="flex items-center gap-3 text-xl text-stone-300">
              <div className="w-10 h-10 rounded-full border border-white/10 bg-white/5 flex items-center justify-center"><HiHeart /></div>
              <div className="w-10 h-10 rounded-full border border-white/10 bg-white/5 flex items-center justify-center"><HiSparkles /></div>
              <div className="w-10 h-10 rounded-full border border-white/10 bg-white/5 flex items-center justify-center"><HiBell /></div>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-white/10 pt-5 text-sm text-stone-500 flex items-center justify-between gap-3 flex-col sm:flex-row">
          <span>© 2026 VenueFlow. All rights reserved.</span>
          <span className="text-stone-400">Discover → Book → Experience</span>
        </div>
      </footer>
    </div>
  );
};

export default UserDashboard;
