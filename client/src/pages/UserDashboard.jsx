import React, { useState, useEffect, useContext, useMemo } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/axios';
import {
  HiSparkles, HiCalendar, HiTicket, HiArrowRight, HiClock, HiLocationMarker,
  HiDownload, HiCheckCircle, HiStar, HiX, HiTrendingUp, HiFire, HiBadgeCheck,
  HiExclamation,
} from 'react-icons/hi';
import CountUp from '../components/CountUp';
import Reveal from '../components/Reveal';
import BookingChart from '../components/BookingChart';

const FALLBACK_IMG = 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?q=80&w=1200&auto=format&fit=crop';

const getEventImage = (ev) => ev?.image || FALLBACK_IMG;
const getInitials = (name) =>
  (name || '?').split(' ').filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase() || '?';

const fmtDate = (d) => new Date(d).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
const fmtShortDate = (d) => new Date(d).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
const fmtTime = (d) => new Date(d).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
const bookingCode = (id) => `#${String(id).slice(-8).toUpperCase()}`;

const getCountdown = (dateStr) => {
  const evt = new Date(dateStr);
  const diff = evt - new Date();
  if (diff <= 0) return 'Started';
  const days = Math.floor(diff / 86400000);
  const time = evt.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
  if (days === 0) return `Today at ${time}`;
  if (days === 1) return `Tomorrow at ${time}`;
  if (days < 7) return `In ${days} days`;
  return `Starts in ${days} days`;
};

const buildChartData = (bookings) => {
  const months = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({ label: d.toLocaleString('en', { month: 'short' }), key: `${d.getFullYear()}-${d.getMonth()}`, value: 0 });
  }
  bookings.forEach((b) => {
    const d = new Date(b.createdAt);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    const m = months.find((x) => x.key === key);
    if (m) m.value += 1;
  });
  return months;
};

const StatusBadge = ({ status }) => {
  const styles = {
    confirmed: 'bg-green-100 text-green-700',
    pending: 'bg-amber-100 text-amber-700',
    cancelled: 'bg-red-100 text-red-700',
  };
  return (
    <span className={`px-2.5 py-1 text-[10px] font-black rounded-full uppercase tracking-wider ${styles[status] || 'bg-stone-100 text-stone-600'}`}>
      {status}
    </span>
  );
};

const PaymentBadge = ({ status }) => {
  const paid = status === 'paid';
  return (
    <span className={`px-2.5 py-1 text-[10px] font-black rounded-full uppercase tracking-wider ${paid ? 'bg-blue-100 text-blue-700' : 'bg-stone-100 text-stone-500'}`}>
      {paid ? 'Paid' : 'Unpaid'}
    </span>
  );
};

const SectionHeader = ({ eyebrow, title, sub, icon, action }) => (
  <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6">
    <div>
      <span className="text-[11px] font-black uppercase tracking-[0.22em] text-amber-600">{eyebrow}</span>
      <h2 className="text-2xl md:text-3xl font-extrabold text-stone-900 mt-1 flex items-center gap-3">
        {icon && <span className="text-amber-600">{icon}</span>}
        {title}
      </h2>
      {sub && <p className="text-stone-500 text-sm mt-1.5">{sub}</p>}
    </div>
    {action}
  </div>
);

const UserDashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const { hash } = useLocation();

  const [bookings, setBookings] = useState([]);
  const [allEvents, setAllEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchData();
  }, [user, navigate]);

  useEffect(() => {
    if (hash === '#bookings' && bookings.length > 0) {
      setTimeout(() => document.getElementById('bookings')?.scrollIntoView({ behavior: 'smooth' }), 100);
    }
  }, [hash, bookings.length]);

  const fetchData = async () => {
    setError('');
    try {
      const [bookingsRes, eventsRes] = await Promise.all([
        api.get('/events/my-bookings'),
        api.get('/events'),
      ]);
      setBookings(bookingsRes.data);
      setAllEvents(eventsRes.data);
    } catch (error) {
      console.error('Error fetching dashboard data', error);
      setError("We couldn't load your dashboard right now. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const cancelBooking = async (id) => {
    if (window.confirm('Are you sure you want to cancel this booking request?')) {
      try {
        await api.delete(`/events/cancel/${id}`);
        fetchData();
      } catch (error) {
        alert(error.response?.data?.message || 'Error cancelling booking');
      }
    }
  };

  const downloadTicket = (booking) => {
    const ev = booking.eventId;
    const lines = [
      '=============================',
      '   VENUEFLOW · EVENT TICKET',
      '=============================',
      `Booking ID : ${booking._id}`,
      `Ticket No. : ${bookingCode(booking._id)}`,
      '',
      `Event      : ${ev?.title || 'N/A'}`,
      `Category   : ${ev?.category || 'General'}`,
      `Date       : ${ev ? fmtDate(ev.date) : 'N/A'}`,
      `Time       : ${ev ? fmtTime(ev.date) : 'N/A'}`,
      `Venue      : ${ev?.location || 'N/A'}`,
      `Booked By  : ${user?.name || user?.username || 'N/A'}`,
      '',
      `Amount     : ${booking.amount === 0 ? 'FREE' : `$${booking.amount}`}`,
      `Status     : ${booking.status.toUpperCase()} / ${(booking.paymentStatus || 'not_paid').replace('_', ' ').toUpperCase()}`,
      '',
      'Present this ticket at the venue entrance.',
      'Thank you for choosing VenueFlow!',
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `venueflow-ticket-${bookingCode(booking._id).slice(1)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const stats = useMemo(() => {
    const now = new Date();
    const total = bookings.length;
    const confirmed = bookings.filter((b) => b.status === 'confirmed').length;
    const pending = bookings.filter((b) => b.status === 'pending').length;
    const upcomingList = bookings
      .filter((b) => b.eventId && b.status !== 'cancelled' && new Date(b.eventId.date) > now)
      .sort((a, b) => new Date(a.eventId.date) - new Date(b.eventId.date));
    const thisMonth = bookings.filter((b) => {
      const d = new Date(b.createdAt);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).length;
    return { total, confirmed, pending, upcomingList, thisMonth };
  }, [bookings]);

  const upcoming = stats.upcomingList;
  const nextEvent = upcoming[0];
  const confirmedCount = stats.confirmed;
  const pendingCount = stats.pending;

  const chartData = useMemo(() => buildChartData(bookings), [bookings]);

  const recommended = useMemo(() => {
    const bookedCategory = {};
    const bookedIds = new Set();
    bookings.forEach((b) => {
      if (b.eventId?._id) bookedIds.add(String(b.eventId._id));
      if (b.eventId?.category) bookedCategory[b.eventId.category] = (bookedCategory[b.eventId.category] || 0) + 1;
    });
    const future = allEvents.filter((e) => new Date(e.date) > new Date());
    let list = future
      .filter((e) => !bookedIds.has(String(e._id)))
      .map((e) => ({ ...e, score: bookedCategory[e.category] || 0 }))
      .sort((a, b) => b.score - a.score || new Date(a.date) - new Date(b.date));
    if (list.length === 0) {
      list = [...future].sort((a, b) => new Date(a.date) - new Date(b.date));
    }
    return list.slice(0, 4);
  }, [allEvents, bookings]);

  const statCards = [
    {
      label: 'Total Bookings',
      value: stats.total,
      icon: <HiTicket />,
      iconCls: 'from-amber-400 to-amber-600 text-stone-900 shadow-amber-500/25',
      indicator: stats.thisMonth > 0 ? `+${stats.thisMonth} this month` : 'No new this month',
      dot: 'bg-amber-500',
      trend: stats.thisMonth > 0 ? 'up' : 'flat',
    },
    {
      label: 'Confirmed',
      value: confirmedCount,
      icon: <HiCheckCircle />,
      iconCls: 'from-green-400 to-green-600 text-white shadow-green-500/25',
      indicator: stats.total > 0 ? `${Math.round((confirmedCount / stats.total) * 100)}% of bookings` : 'No bookings yet',
      dot: 'bg-green-500',
      trend: 'up',
    },
    {
      label: 'Pending',
      value: pendingCount,
      icon: <HiClock />,
      iconCls: 'from-amber-400 to-orange-500 text-white shadow-orange-500/25',
      indicator: pendingCount > 0 ? 'Needs attention' : 'All caught up',
      dot: 'bg-orange-500',
      trend: pendingCount > 0 ? 'flat' : 'down',
    },
    {
      label: 'Upcoming',
      value: upcoming.length,
      icon: <HiCalendar />,
      iconCls: 'from-blue-400 to-indigo-500 text-white shadow-blue-500/25',
      indicator: nextEvent ? getCountdown(nextEvent.eventId.date) : 'No upcoming events',
      dot: 'bg-blue-500',
      trend: upcoming.length > 0 ? 'up' : 'flat',
    },
  ];

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="rounded-3xl bg-gradient-to-r from-stone-200 via-amber-100 to-stone-200 bg-[length:400px_100%] animate-shimmer h-52"></div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="bg-white rounded-2xl p-6 border border-amber-100/60 animate-shimmer bg-[length:400px_100%] h-28"></div>
          ))}
        </div>
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-3xl p-8 border border-amber-100/60 animate-shimmer bg-[length:400px_100%] h-72"></div>
          <div className="bg-white rounded-3xl p-8 border border-amber-100/60 animate-shimmer bg-[length:400px_100%] h-72"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto pb-10 space-y-14">
      {/* ============ HERO ============ */}
      <Reveal>
        <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-stone-900 via-stone-950 to-stone-900 text-white shadow-2xl">
          <div className="absolute -top-24 -right-16 w-72 h-72 bg-amber-500/20 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-32 -left-16 w-80 h-80 bg-orange-600/15 rounded-full blur-3xl"></div>
          <div className="absolute top-10 right-1/4 w-2 h-2 rounded-full bg-amber-400/70 animate-float"></div>
          <div className="absolute top-24 right-8 w-1.5 h-1.5 rounded-full bg-amber-300/50 animate-float" style={{ animationDelay: '1.2s' }}></div>
          <div className="absolute bottom-16 left-1/3 w-2 h-2 rounded-full bg-amber-400/50 animate-float" style={{ animationDelay: '2s' }}></div>

          <div className="relative p-8 md:p-12 flex flex-col md:flex-row md:items-center gap-8">
            <div className="flex-1">
              <span className="inline-flex items-center gap-2 bg-white/5 border border-white/10 text-amber-300 text-[10px] font-black uppercase tracking-[0.22em] px-4 py-1.5 rounded-full mb-6">
                <HiBadgeCheck className="text-amber-400 text-sm" /> Member Dashboard
              </span>
              <div className="flex items-center gap-4 mb-5">
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-stone-900 flex items-center justify-center text-2xl md:text-3xl font-black shadow-xl shadow-amber-500/30">
                  {getInitials(user?.name || user?.username)}
                </div>
                <div>
                  <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight">
                    Welcome back, {user?.name || user?.username}!
                  </h1>
                  <p className="text-amber-100/60 mt-1.5 font-medium flex items-center gap-2">
                    <HiSparkles className="text-amber-400" /> Here's what's happening with your events.
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-3 mt-6">
                <Link
                  to="/"
                  className="group inline-flex items-center gap-2 bg-gradient-to-r from-amber-400 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-stone-900 font-extrabold py-3.5 px-7 rounded-full transition-all shadow-xl shadow-amber-500/25 hover:-translate-y-0.5"
                >
                  Explore Events <HiArrowRight className="group-hover:translate-x-1 transition-transform" />
                </Link>
                <a
                  href="#bookings"
                  className="inline-flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/15 text-amber-100 font-bold py-3.5 px-7 rounded-full transition-all hover:-translate-y-0.5"
                >
                  <HiTicket className="text-amber-400" /> View My Bookings
                </a>
              </div>
            </div>

            {nextEvent && (
              <div className="md:w-72 shrink-0">
                <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-white/10">
                  <img src={getEventImage(nextEvent.eventId)} alt="" className="w-full h-44 object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-950/90 via-stone-950/30 to-transparent"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-5">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-300 mb-1.5">Next Up</p>
                    <p className="font-extrabold text-white leading-tight mb-1">{nextEvent.eventId.title}</p>
                    <p className="text-amber-100/70 text-xs font-semibold flex items-center gap-1.5">
                      <HiClock className="text-amber-400" /> {getCountdown(nextEvent.eventId.date)}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </Reveal>

      {/* ============ ERROR BANNER ============ */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="font-medium flex items-center gap-2">
            <HiExclamation className="text-xl" /> {error}
          </p>
          <button
            onClick={fetchData}
            className="bg-red-600 hover:bg-red-500 text-white font-bold px-5 py-2.5 rounded-full transition shrink-0"
          >
            Retry
          </button>
        </div>
      )}

      {/* ============ STATS ============ */}
      <section>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {statCards.map((card, i) => (
            <Reveal key={card.label} delay={i * 80} className="h-full">
              <div className="group bg-white rounded-3xl p-5 md:p-6 shadow-soft border border-amber-100/60 hover:-translate-y-1.5 hover:shadow-xl transition-all duration-300 h-full">
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br flex items-center justify-center text-xl shadow-lg group-hover:scale-110 group-hover:-rotate-3 transition-transform ${card.iconCls}`}>
                    {card.icon}
                  </div>
                  <span className={`text-[10px] font-black px-2 py-1 rounded-full flex items-center gap-1 ${card.trend === 'up' ? 'bg-green-50 text-green-600' : 'bg-stone-50 text-stone-500'}`}>
                    {card.trend === 'up' && <HiTrendingUp />}
                    {card.trend === 'down' && <HiTrendingUp className="rotate-180" />}
                    {card.trend === 'flat' && <span className="w-1.5 h-1.5 rounded-full bg-current"></span>}
                  </span>
                </div>
                <div className="text-4xl font-black text-stone-900 tracking-tight">
                  <CountUp value={card.value} />
                </div>
                <p className="text-xs font-bold text-stone-500 uppercase tracking-wider mt-1">{card.label}</p>
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-amber-50">
                  <span className={`w-1.5 h-1.5 rounded-full ${card.dot}`}></span>
                  <p className="text-[11px] font-semibold text-stone-400">{card.indicator}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ============ ANALYTICS + UPCOMING ============ */}
      <section>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Reveal className="lg:col-span-2">
            <div className="bg-white rounded-3xl shadow-soft border border-amber-100/60 p-6 md:p-8 h-full">
              <SectionHeader
                eyebrow="Analytics"
                title="Booking Activity"
                sub="Your bookings over the last 6 months"
                icon={<HiTrendingUp />}
              />
              <BookingChart data={chartData} />
            </div>
          </Reveal>

          <Reveal delay={120}>
            <div className="bg-white rounded-3xl shadow-soft border border-amber-100/60 p-6 md:p-8 h-full flex flex-col">
              <SectionHeader eyebrow="Coming Soon" title="Upcoming Events" icon={<HiCalendar />} />
              {upcoming.length === 0 ? (
                <div className="flex flex-col items-center justify-center flex-grow text-center py-10">
                  <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center mb-4 text-2xl">🗓️</div>
                  <p className="text-stone-600 font-bold">No upcoming events</p>
                  <p className="text-stone-400 text-sm mt-1 mb-5">Book a spot to see it here.</p>
                  <Link to="/" className="inline-flex items-center gap-2 bg-amber-900 hover:bg-amber-800 text-white font-bold px-5 py-2.5 rounded-full transition text-sm">
                    Browse Events
                  </Link>
                </div>
              ) : (
                <div className="space-y-4 overflow-y-auto max-h-[360px] pr-1">
                  {upcoming.map((b) => (
                    <div key={b._id} className="group flex gap-4 bg-stone-50/70 border border-amber-50 rounded-2xl p-3 hover:border-amber-300 hover:bg-amber-50/50 transition-all">
                      <div className="relative w-24 h-24 rounded-xl overflow-hidden shrink-0">
                        <img src={getEventImage(b.eventId)} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <StatusBadge status={b.status} />
                        </div>
                        <h3 className="font-extrabold text-stone-900 text-sm truncate">{b.eventId.title}</h3>
                        <p className="text-xs text-stone-500 font-semibold mt-1 flex items-center gap-1.5">
                          <HiCalendar className="text-amber-500" /> {fmtShortDate(b.eventId.date)} · {fmtTime(b.eventId.date)}
                        </p>
                        <p className="text-xs text-stone-400 font-medium flex items-center gap-1.5 mt-0.5">
                          <HiLocationMarker className="text-amber-500" /> {b.eventId.location}
                        </p>
                        <p className="text-[11px] font-black text-amber-700 mt-2">{getCountdown(b.eventId.date)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ============ MY BOOKINGS ============ */}
      <section id="bookings" className="scroll-mt-24">
        <Reveal>
          <SectionHeader
            eyebrow="Your Tickets"
            title="My Bookings"
            sub="Track, download, and manage every booking you've made"
            icon={<HiTicket />}
            action={bookings.length > 0 && (
              <span className="text-sm font-bold text-stone-500">{bookings.length} booking{bookings.length === 1 ? '' : 's'}</span>
            )}
          />
        </Reveal>

        {bookings.length === 0 ? (
          <Reveal>
            <div className="relative overflow-hidden bg-white rounded-3xl shadow-soft border border-amber-100/60 p-12 md:p-16 text-center">
              <div className="absolute -top-16 -right-16 w-56 h-56 bg-amber-100/60 rounded-full blur-2xl"></div>
              <div className="relative">
                <div className="w-24 h-24 bg-gradient-to-br from-amber-100 to-amber-200 rounded-full flex items-center justify-center mx-auto mb-6 animate-float">
                  <HiTicket className="text-amber-500 text-4xl" />
                </div>
                <h3 className="text-2xl font-extrabold text-stone-900 mb-2">No bookings yet</h3>
                <p className="text-stone-500 font-medium mb-8 max-w-sm mx-auto">
                  Discover exciting events and book your first experience today!
                </p>
                <Link
                  to="/"
                  className="group inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-900 font-extrabold py-4 px-10 rounded-full transition-all shadow-lg shadow-amber-500/25 hover:-translate-y-0.5"
                >
                  Explore Events <HiArrowRight className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </Reveal>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {bookings.map((booking, i) => (
              <Reveal key={booking._id} delay={(i % 3) * 90} className="h-full">
                <div className="group bg-white rounded-3xl overflow-hidden shadow-soft hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 border border-amber-100/60 flex flex-col h-full">
                  <div className="relative h-44 overflow-hidden">
                    <img
                      src={getEventImage(booking.eventId)}
                      alt={booking.eventId?.title || 'Event'}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-stone-950/70 via-transparent to-transparent"></div>
                    <div className="absolute top-4 left-4 bg-stone-950/70 backdrop-blur-sm text-amber-200 text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-full">
                      {booking.eventId?.category || 'Event'}
                    </div>
                    <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm font-black shadow-lg">
                      {booking.amount === 0 ? <span className="text-green-600">FREE</span> : <span className="text-amber-800">${booking.amount}</span>}
                    </div>
                    <div className="absolute bottom-3 left-4 right-4 flex flex-wrap items-center gap-2">
                      <StatusBadge status={booking.status} />
                      {booking.status !== 'cancelled' && <PaymentBadge status={booking.paymentStatus} />}
                      <span className="ml-auto text-[10px] font-black text-white/90 bg-stone-950/50 px-2.5 py-1 rounded-full backdrop-blur-sm">
                        {bookingCode(booking._id)}
                      </span>
                    </div>
                  </div>

                  <div className="p-6 flex-grow flex flex-col">
                    {booking.eventId ? (
                      <>
                        <h3 className="text-lg font-extrabold text-stone-900 mb-4 leading-tight group-hover:text-amber-700 transition-colors">
                          {booking.eventId.title}
                        </h3>
                        <div className="text-sm space-y-2.5 mb-5">
                          <p className="flex items-center gap-2.5 text-stone-600 font-medium">
                            <HiCalendar className="text-amber-500 shrink-0" /> {fmtDate(booking.eventId.date)}
                          </p>
                          <p className="flex items-center gap-2.5 text-stone-600 font-medium">
                            <HiClock className="text-amber-500 shrink-0" /> {fmtTime(booking.eventId.date)}
                          </p>
                          <p className="flex items-center gap-2.5 text-stone-600 font-medium">
                            <HiLocationMarker className="text-amber-500 shrink-0" /> {booking.eventId.location}
                          </p>
                          <p className="flex items-center gap-2.5 text-stone-500 text-xs font-semibold">
                            <HiTicket className="text-stone-400 shrink-0" /> Booked on {new Date(booking.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </>
                    ) : (
                      <p className="text-red-500 italic font-medium mb-5">Event details unavailable</p>
                    )}

                    <div className="mt-auto flex flex-wrap items-center gap-2 pt-4 border-t border-amber-50">
                      {booking.eventId && (
                        <Link
                          to={`/events/${booking.eventId._id}`}
                          className="flex-1 inline-flex items-center justify-center gap-1.5 bg-stone-900 hover:bg-stone-800 text-white font-bold text-sm py-2.5 rounded-xl transition-all"
                        >
                          View Details <HiArrowRight className="text-xs" />
                        </Link>
                      )}
                      {booking.status !== 'cancelled' && (
                        <>
                          <button
                            onClick={() => downloadTicket(booking)}
                            className="flex-1 inline-flex items-center justify-center gap-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold text-sm py-2.5 rounded-xl transition-all"
                          >
                            <HiDownload /> Ticket
                          </button>
                          <button
                            onClick={() => cancelBooking(booking._id)}
                            title="Cancel booking"
                            className="w-10 h-10 inline-flex items-center justify-center bg-red-50 hover:bg-red-100 text-red-500 rounded-xl transition-all"
                          >
                            <HiX />
                          </button>
                        </>
                      )}
                      {booking.status === 'cancelled' && (
                        <span className="flex-1 text-center text-xs font-bold text-stone-400 italic">Booking cancelled</span>
                      )}
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        )}
      </section>

      {/* ============ TIMELINE + RECOMMENDED ============ */}
      <section>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Timeline */}
          <Reveal className="lg:col-span-2">
            <div className="bg-white rounded-3xl shadow-soft border border-amber-100/60 p-6 md:p-8 h-full">
              <SectionHeader eyebrow="Schedule" title="Your Event Schedule" icon={<HiCalendar />} />
              {upcoming.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center mb-4 text-2xl">🧭</div>
                  <p className="text-stone-600 font-bold">Nothing scheduled yet</p>
                  <p className="text-stone-400 text-sm mt-1">Your event timeline will appear once you book.</p>
                </div>
              ) : (
                <div className="relative pl-6">
                  <div className="absolute left-[7px] top-2 bottom-2 w-0.5 bg-gradient-to-b from-amber-400 via-amber-300 to-transparent rounded-full"></div>
                  <div className="space-y-6">
                    {upcoming.map((b) => {
                      const d = new Date(b.eventId.date);
                      return (
                        <div key={b._id} className="relative">
                          <span className={`absolute -left-6 top-1 w-3.5 h-3.5 rounded-full ring-4 ${b.status === 'confirmed' ? 'bg-green-500 ring-green-100' : 'bg-amber-400 ring-amber-100'}`}></span>
                          <div className="flex items-center gap-3 mb-1">
                            <div className="bg-stone-900 text-white rounded-xl px-3 py-1.5 text-center min-w-[64px]">
                              <div className="text-[10px] font-black uppercase tracking-wider opacity-60">{d.toLocaleString('en', { month: 'short' })}</div>
                              <div className="text-lg font-black leading-none">{d.getDate()}</div>
                            </div>
                            <StatusBadge status={b.status} />
                          </div>
                          <h3 className="font-extrabold text-stone-900 mt-2">{b.eventId.title}</h3>
                          <p className="text-sm text-stone-500 font-semibold flex items-center gap-1.5 mt-1">
                            <HiClock className="text-amber-500" /> {fmtTime(b.eventId.date)}
                            <span className="text-stone-300">·</span>
                            <HiLocationMarker className="text-amber-500" /> {b.eventId.location}
                          </p>
                          <p className="text-xs font-black text-amber-700 mt-1.5">{getCountdown(b.eventId.date)}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </Reveal>

          {/* Recommended */}
          <Reveal delay={120} className="lg:col-span-3">
            <div className="bg-white rounded-3xl shadow-soft border border-amber-100/60 p-6 md:p-8 h-full">
              <SectionHeader
                eyebrow="Handpicked For You"
                title="Recommended For You"
                sub="Based on the events you love"
                icon={<HiStar />}
                action={
                  <Link to="/" className="text-sm font-bold text-amber-700 hover:underline inline-flex items-center gap-1">
                    View all <HiArrowRight className="text-xs" />
                  </Link>
                }
              />
              {recommended.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center mb-4 text-2xl">✨</div>
                  <p className="text-stone-600 font-bold">No recommendations right now</p>
                  <p className="text-stone-400 text-sm mt-1">Check back soon for new events.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
                  {recommended.map((ev) => (
                    <div key={ev._id} className="group bg-stone-50/60 border border-amber-50 rounded-2xl overflow-hidden hover:border-amber-300 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col">
                      <div className="relative h-32 overflow-hidden">
                        <img src={getEventImage(ev)} alt={ev.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        <div className="absolute inset-0 bg-gradient-to-t from-stone-950/60 to-transparent"></div>
                        <span className="absolute top-3 left-3 bg-stone-950/70 backdrop-blur-sm text-amber-200 text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full">
                          {ev.category || 'General'}
                        </span>
                        <span className="absolute bottom-3 right-3 bg-white/95 px-2.5 py-1 rounded-full text-xs font-black">
                          {ev.ticketPrice === 0 ? <span className="text-green-600">FREE</span> : <span className="text-amber-800">${ev.ticketPrice}</span>}
                        </span>
                      </div>
                      <div className="p-4 flex-grow flex flex-col">
                        <h3 className="font-extrabold text-stone-900 text-sm leading-snug mb-2">{ev.title}</h3>
                        <p className="text-xs text-stone-500 font-semibold flex items-center gap-1.5 mb-1">
                          <HiCalendar className="text-amber-500" /> {fmtShortDate(ev.date)} · {fmtTime(ev.date)}
                        </p>
                        <p className="text-xs text-stone-400 font-medium flex items-center gap-1.5 mb-4">
                          <HiLocationMarker className="text-amber-500" /> <span className="truncate">{ev.location}</span>
                        </p>
                        <div className="mt-auto">
                          <Link
                            to={`/events/${ev._id}`}
                            className="flex items-center justify-center gap-1.5 w-full bg-stone-900 hover:bg-gradient-to-r hover:from-amber-500 hover:to-amber-600 hover:text-stone-900 text-white font-bold text-sm py-2.5 rounded-xl transition-all"
                          >
                            Book Now <HiFire className="text-xs" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
};

export default UserDashboard;
