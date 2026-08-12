import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/axios';
import { FaCalendarAlt, FaMapMarkerAlt, FaSearch } from 'react-icons/fa';
import { HiSparkles, HiLightningBolt, HiShieldCheck, HiArrowRight } from 'react-icons/hi';

const CATEGORY_IMAGES = {
  tech: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=1600&auto=format&fit=crop',
  music: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?q=80&w=1600&auto=format&fit=crop',
  concert: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?q=80&w=1600&auto=format&fit=crop',
  conference: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?q=80&w=1600&auto=format&fit=crop',
  wedding: 'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1600&auto=format&fit=crop',
  party: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=1600&auto=format&fit=crop',
  festival: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?q=80&w=1600&auto=format&fit=crop',
  workshop: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?q=80&w=1600&auto=format&fit=crop',
  sports: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?q=80&w=1600&auto=format&fit=crop',
  food: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=1600&auto=format&fit=crop',
};

const getEventImage = (event) => {
  if (event.image) return event.image;
  const key = (event.category || '').toLowerCase();
  for (const [cat, url] of Object.entries(CATEGORY_IMAGES)) {
    if (key.includes(cat)) return url;
  }
  return 'https://images.unsplash.com/photo-1522158637959-30385a09d0da?q=80&w=1600&auto=format&fit=crop';
};

const Home = () => {
  const [events, setEvents] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchEvents();
    }, 400);
    return () => clearTimeout(timeoutId);
  }, [search]);

  const fetchEvents = async () => {
    try {
      const { data } = await api.get(`/events?search=${search}`);
      setEvents(data);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredEvents =
    category === 'All'
      ? events
      : events.filter((e) => (e.category || '').toLowerCase().includes(category.toLowerCase()));

  const categories = [...new Set(events.map((e) => e.category).filter(Boolean))];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero */}
      <section className="relative isolate overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=2500&auto=format&fit=crop"
            alt="Concert crowd"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-stone-950/80 via-stone-900/70 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-amber-900/40 to-transparent mix-blend-multiply"></div>
        </div>

        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32 text-center">
          <span className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 text-amber-200 px-5 py-2 rounded-full text-xs font-bold tracking-[0.2em] uppercase mb-8 animate-fade-up">
            <HiSparkles className="text-amber-400" /> Discover · Book · Celebrate
          </span>

          <h1 className="text-5xl md:text-7xl font-extrabold leading-[1.05] tracking-tight text-white mb-6 animate-fade-up" style={{ animationDelay: '0.1s' }}>
            Where Moments
            <br />
            <span className="font-display italic text-gradient-light">Become</span> Memories
          </h1>

          <p className="text-amber-100/85 text-lg md:text-xl max-w-2xl mx-auto mb-10 font-light leading-relaxed animate-fade-up" style={{ animationDelay: '0.2s' }}>
            From intimate gigs to grand galas — discover stunning venues, book your event in seconds, and let the good times roll.
          </p>

          <div className="max-w-2xl mx-auto flex flex-col sm:flex-row gap-4 items-stretch animate-fade-up" style={{ animationDelay: '0.3s' }}>
            <div className="relative flex-1 flex items-center shadow-2xl shadow-stone-950/40">
              <FaSearch className="absolute left-6 text-amber-500 text-xl" />
              <input
                type="text"
                placeholder="Search events by title..."
                className="w-full pl-16 pr-6 py-5 rounded-full sm:rounded-r-none text-lg text-stone-900 bg-white focus:outline-none placeholder-stone-400 font-medium ring-4 ring-transparent focus:ring-amber-400/40 transition-all"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Link
              to="/register"
              className="group flex items-center justify-center gap-2 bg-gradient-to-r from-amber-400 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-stone-900 font-extrabold px-8 py-5 rounded-full sm:rounded-l-none transition-all shadow-xl shadow-amber-500/30 hover:-translate-y-0.5"
            >
              Start Booking <HiArrowRight className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="mt-12 flex justify-center gap-8 md:gap-14 text-center animate-fade-up" style={{ animationDelay: '0.4s' }}>
            {[
              { value: '500+', label: 'Live Events' },
              { value: '10k+', label: 'Happy Guests' },
              { value: '4.9★', label: 'Avg. Rating' },
            ].map((s) => (
              <div key={s.label}>
                <div className="text-2xl md:text-3xl font-extrabold text-white">{s.value}</div>
                <div className="text-xs md:text-sm text-amber-100/70 mt-1 font-semibold uppercase tracking-wider">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#faf8f4] to-transparent"></div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 -mt-4 mb-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: <HiLightningBolt />, title: 'Lightning Fast', desc: 'Book your spot in seconds with streamlined OTP-verified checkout.' },
            { icon: <HiSparkles />, title: 'Curated Events', desc: 'Hand-picked venues with real-time seat availability, all in one place.' },
            { icon: <HiShieldCheck />, title: 'Secure & Verified', desc: 'Every booking protected by email OTP verification and admin approval.' },
          ].map((f) => (
            <div
              key={f.title}
              className="group bg-white p-8 rounded-3xl shadow-soft border border-amber-100/70 flex flex-col items-center text-center hover:-translate-y-2 hover:shadow-glow transition-all duration-300"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-amber-600 text-stone-900 rounded-2xl flex items-center justify-center text-2xl mb-6 shadow-lg shadow-amber-500/25 group-hover:scale-110 group-hover:-rotate-6 transition-transform">
                {f.icon}
              </div>
              <h3 className="text-xl font-extrabold text-stone-900 mb-3">{f.title}</h3>
              <p className="text-stone-500 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Events */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-8 gap-4">
          <div>
            <span className="text-xs font-black uppercase tracking-[0.25em] text-amber-600">Explore</span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-stone-900 mt-1">
              Upcoming <span className="font-display italic text-gradient-amber">Events</span>
            </h2>
          </div>
          <div className="flex items-center gap-2 text-stone-500 font-semibold bg-white rounded-full px-4 py-2 border border-amber-100 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            {filteredEvents.length} {filteredEvents.length === 1 ? 'result' : 'results'}
          </div>
        </div>

        {/* Category chips */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-6 scrollbar-hide">
          {['All', ...categories].map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all ${
                category === c
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-stone-900 shadow-lg shadow-amber-500/30'
                  : 'bg-white text-stone-600 border border-amber-100 hover:border-amber-400 hover:text-amber-700'
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-white rounded-3xl overflow-hidden shadow-sm animate-shimmer border border-amber-50">
                <div className="h-52 bg-gradient-to-r from-amber-100 via-stone-100 to-amber-100 bg-[length:400px_100%]"></div>
                <div className="p-6 space-y-3">
                  <div className="h-3 bg-amber-100 rounded-full w-1/3"></div>
                  <div className="h-5 bg-stone-200 rounded-full w-2/3"></div>
                  <div className="h-3 bg-stone-100 rounded-full w-full"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-white rounded-full shadow-soft flex items-center justify-center mx-auto mb-6 text-4xl">🎫</div>
            <p className="text-xl text-stone-500 font-medium">No events found matching your search.</p>
            <button
              onClick={() => { setSearch(''); setCategory('All'); }}
              className="mt-6 inline-block bg-amber-900 hover:bg-amber-800 text-white font-bold py-3 px-8 rounded-full transition shadow-md"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredEvents.map((event) => (
              <div
                key={event._id}
                className="group bg-white rounded-3xl overflow-hidden shadow-soft hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 flex flex-col border border-amber-100/60"
              >
                <div className="relative h-52 overflow-hidden">
                  <img
                    src={getEventImage(event)}
                    alt={event.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-950/50 via-transparent to-transparent"></div>
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm font-extrabold shadow-lg">
                    {event.ticketPrice === 0 ? (
                      <span className="text-green-600">FREE</span>
                    ) : (
                      <span className="text-amber-800">${event.ticketPrice}</span>
                    )}
                  </div>
                  <span className="absolute top-4 left-4 bg-stone-950/70 backdrop-blur-sm text-amber-200 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider">
                    {event.category || 'Event'}
                  </span>
                </div>
                <div className="p-6 flex-grow flex flex-col">
                  <h2 className="text-xl font-extrabold text-stone-900 mb-3 group-hover:text-amber-700 transition-colors">
                    {event.title}
                  </h2>
                  <div className="flex flex-col gap-2 mb-5 text-stone-600 text-sm">
                    <div className="flex items-center gap-2.5">
                      <span className="w-8 h-8 bg-amber-100 text-amber-700 rounded-lg flex items-center justify-center shrink-0">
                        <FaCalendarAlt className="text-sm" />
                      </span>
                      <span className="font-medium">{new Date(event.date).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <span className="w-8 h-8 bg-amber-100 text-amber-700 rounded-lg flex items-center justify-center shrink-0">
                        <FaMapMarkerAlt className="text-sm" />
                      </span>
                      <span className="font-medium">{event.location}</span>
                    </div>
                  </div>
                  <div className="mt-auto">
                    <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                      <span className="text-stone-500">{event.availableSeats} seats left</span>
                      <span className="text-amber-700">{Math.round((event.availableSeats / event.totalSeats) * 100)}% open</span>
                    </div>
                    <div className="w-full bg-amber-100/80 rounded-full h-2 mb-5 overflow-hidden">
                      <div
                        className={`h-2 rounded-full transition-all ${event.availableSeats / event.totalSeats < 0.25 ? 'bg-red-500' : 'bg-gradient-to-r from-amber-400 to-amber-600'}`}
                        style={{ width: `${(event.availableSeats / event.totalSeats) * 100}%` }}
                      ></div>
                    </div>
                    <Link
                      to={`/events/${event._id}`}
                      className="group/btn flex items-center justify-center gap-2 w-full bg-stone-900 hover:bg-gradient-to-r hover:from-amber-500 hover:to-amber-600 text-white font-bold py-3 rounded-xl transition-all hover:shadow-lg hover:shadow-amber-500/25"
                    >
                      View Details <HiArrowRight className="group-hover/btn:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* CTA banner */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 mt-16 mb-4">
        <div className="relative rounded-3xl overflow-hidden shadow-2xl">
          <img
            src="https://images.unsplash.com/photo-1519167758481-83f550bb49b3?q=80&w=2400&auto=format&fit=crop"
            alt="Elegant event venue"
            className="w-full h-72 object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-stone-950/90 via-stone-950/60 to-transparent"></div>
          <div className="absolute inset-0 flex flex-col justify-center px-8 md:px-16">
            <h3 className="text-3xl md:text-4xl font-extrabold text-white mb-4 max-w-xl">
              Ready to host your <span className="font-display italic text-gradient-light">perfect</span> event?
            </h3>
            <p className="text-amber-100/80 max-w-md mb-6 font-light">Join thousands of organizers booking unforgettable experiences on VenueFlow.</p>
            <Link
              to="/register"
              className="self-start bg-gradient-to-r from-amber-400 to-amber-600 text-stone-900 font-extrabold px-8 py-3.5 rounded-full hover:from-amber-300 hover:to-amber-500 transition-all shadow-xl shadow-amber-500/30 hover:-translate-y-0.5"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto pt-16 pb-8 border-t border-amber-100 text-center">
        <div className="flex justify-center items-center gap-2 mb-4">
          <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 text-stone-900 flex items-center justify-center">
            <HiSparkles />
          </span>
          <span className="text-xl font-extrabold text-stone-900">
            Venue<span className="text-gradient-amber">Flow</span>
          </span>
        </div>
        <p className="text-stone-500 text-sm mb-6 max-w-md mx-auto">
          The simplest way to discover, book, and manage event venues. Let's make memories together.
        </p>
        <div className="text-xs text-stone-400 font-medium uppercase tracking-wider">
          &copy; {new Date().getFullYear()} VenueFlow. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default Home;
