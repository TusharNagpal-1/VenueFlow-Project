import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/axios';
import { FaCalendarAlt, FaMapMarkerAlt, FaSearch } from 'react-icons/fa';
import { HiSparkles, HiLightningBolt, HiShieldCheck } from 'react-icons/hi';

const Home = () => {
  const [events, setEvents] = useState([]);
  const [search, setSearch] = useState('');
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

  return (
    <div className="flex flex-col min-h-screen">
      <div className="relative bg-gradient-to-br from-amber-800 via-amber-900 to-stone-900 text-white rounded-3xl overflow-hidden mb-12 shadow-2xl">
        <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?q=80&w=3000&auto=format&fit=crop')] bg-cover bg-center"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-amber-900 via-amber-900/70 to-transparent"></div>
        <div className="relative p-10 md:p-20 text-center flex flex-col items-center z-10">
          <span className="bg-amber-400/20 text-amber-200 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase mb-6 border border-amber-400/30">
            Discover & Book
          </span>
          <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight tracking-tight drop-shadow-lg">
            Your Stage Awaits.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-amber-500">Book Venues</span> Instantly
          </h1>
          <p className="text-amber-100/80 text-lg md:text-xl mb-10 max-w-2xl mx-auto font-light leading-relaxed">
            From intimate gigs to grand conferences — find the perfect venue, book your event, and make it unforgettable.
          </p>
          <div className="w-full max-w-2xl mx-auto relative flex items-center shadow-2xl group">
            <FaSearch className="absolute left-6 text-amber-400 text-xl group-focus-within:text-amber-300 transition-colors" />
            <input
              type="text"
              placeholder="Search events by title..."
              className="w-full pl-16 pr-6 py-5 rounded-full text-lg text-stone-900 bg-white/95 backdrop-blur-sm border-2 border-transparent focus:border-amber-400 focus:outline-none transition-all placeholder-stone-400 font-medium"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16 px-4">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-amber-100 flex flex-col items-center text-center hover:-translate-y-1 transition duration-300">
          <div className="w-16 h-16 bg-amber-900 text-amber-100 rounded-2xl flex items-center justify-center text-2xl mb-6 shadow-md shadow-amber-200/50">
            <HiLightningBolt />
          </div>
          <h3 className="text-xl font-bold text-stone-800 mb-3">Lightning Fast</h3>
          <p className="text-stone-500 text-sm leading-relaxed">Book your spot in seconds with our streamlined OTP-verified checkout process.</p>
        </div>
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-amber-100 flex flex-col items-center text-center hover:-translate-y-1 transition duration-300">
          <div className="w-16 h-16 bg-amber-900 text-amber-100 rounded-2xl flex items-center justify-center text-2xl mb-6 shadow-md shadow-amber-200/50">
            <HiSparkles />
          </div>
          <h3 className="text-xl font-bold text-stone-800 mb-3">Curated Events</h3>
          <p className="text-stone-500 text-sm leading-relaxed">Hand-picked venues and events, all in one place with real-time seat availability.</p>
        </div>
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-amber-100 flex flex-col items-center text-center hover:-translate-y-1 transition duration-300">
          <div className="w-16 h-16 bg-amber-900 text-amber-100 rounded-2xl flex items-center justify-center text-2xl mb-6 shadow-md shadow-amber-200/50">
            <HiShieldCheck />
          </div>
          <h3 className="text-xl font-bold text-stone-800 mb-3">Secure & Verified</h3>
          <p className="text-stone-500 text-sm leading-relaxed">Every booking is protected by email OTP verification and admin confirmation.</p>
        </div>
      </div>

      <div className="flex items-center justify-between mb-8 px-2 border-b border-amber-200 pb-4">
        <h2 className="text-3xl font-extrabold text-amber-900">Upcoming Events</h2>
        <div className="text-stone-500 font-medium">{events.length} results</div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-xl font-semibold text-amber-800">Loading events...</div>
      ) : events.length === 0 ? (
        <div className="text-center py-20 text-xl text-stone-500">No events found matching your search.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {events.map(event => (
            <div key={event._id} className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition flex flex-col border border-amber-100">
              <div className="h-48 bg-gradient-to-br from-amber-700 to-amber-900 overflow-hidden relative flex items-center justify-center">
                {event.image ? (
                  <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-amber-200 font-black text-4xl uppercase tracking-widest">
                    {event.category || 'Event'}
                  </span>
                )}
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-bold shadow-sm">
                  {event.ticketPrice === 0 ? (
                    <span className="text-green-600">FREE</span>
                  ) : (
                    <span className="text-amber-900">${event.ticketPrice}</span>
                  )}
                </div>
              </div>
              <div className="p-6 flex-grow flex flex-col">
                <div className="text-xs font-bold text-amber-700 uppercase tracking-wider mb-2">{event.category}</div>
                <h2 className="text-xl font-bold text-stone-800 mb-3">{event.title}</h2>
                <div className="flex flex-col gap-2 mb-4 text-stone-600 text-sm">
                  <div className="flex items-center gap-2">
                    <FaCalendarAlt className="text-amber-500" />
                    <span>{new Date(event.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FaMapMarkerAlt className="text-amber-500" />
                    <span>{event.location}</span>
                  </div>
                </div>
                <div className="mt-auto">
                  <div className="w-full bg-amber-100 rounded-full h-2 mb-2">
                    <div className="bg-amber-600 h-2 rounded-full" style={{ width: `${(event.availableSeats / event.totalSeats) * 100}%` }}></div>
                  </div>
                  <p className="text-xs text-stone-500 mb-4">{event.availableSeats} of {event.totalSeats} seats remaining</p>
                  <Link to={`/events/${event._id}`} className="block w-full text-center bg-amber-900 hover:bg-amber-800 text-amber-100 font-semibold py-2 rounded-lg transition">
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <footer className="mt-auto pt-16 pb-8 border-t border-amber-200 text-center">
        <div className="flex justify-center items-center gap-2 mb-4">
          <HiSparkles className="text-amber-600 text-2xl" />
          <span className="text-xl font-bold text-amber-900">VenueFlow</span>
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
