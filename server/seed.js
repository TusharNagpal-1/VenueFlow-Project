const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('./src/models/Usermodel');
const Event = require('./src/models/Eventmodel');
const Booking = require('./src/models/Bookingmodel');

dotenv.config();

const users = [
  { username: 'Admin User', email: 'admin@venueflow.com', password: 'password123', role: 'admin', isVerified: true },
  { username: 'Demo User', email: 'user@venueflow.com', password: 'password123', role: 'user', isVerified: true },
  { username: 'Alice Smith', email: 'alice@venueflow.com', password: 'password123', role: 'user', isVerified: true },
  { username: 'Bob Johnson', email: 'bob@venueflow.com', password: 'password123', role: 'user', isVerified: true },
  { username: 'Charlie Dave', email: 'charlie@venueflow.com', password: 'password123', role: 'user', isVerified: true },
  { username: 'Diana Prince', email: 'diana@venueflow.com', password: 'password123', role: 'user', isVerified: true },
  { username: 'Ethan Hunt', email: 'ethan@venueflow.com', password: 'password123', role: 'user', isVerified: true },
  { username: 'Fiona Gallagher', email: 'fiona@venueflow.com', password: 'password123', role: 'user', isVerified: true },
  { username: 'George Miller', email: 'george@venueflow.com', password: 'password123', role: 'user', isVerified: true },
  { username: 'Hannah Montana', email: 'hannah@venueflow.com', password: 'password123', role: 'user', isVerified: true },
];

const events = [
  {
    title: 'React & Node.js Developer Retreat',
    description: 'Join us for a 3-day deep dive into modern full-stack web development. Perfect for developers looking to take their skills to the next level.',
    date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
    location: 'Silicon Valley Innovation Center, CA',
    category: 'Technology',
    totalSeats: 200,
    ticketPrice: 0,
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=800',
  },
  {
    title: 'Neon Nights EDM Festival',
    description: 'Experience an unforgettable night of EDM, techno, and dazzling light shows with top DJs from around the globe.',
    date: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
    location: 'Grand Arena, New York',
    category: 'Music',
    totalSeats: 500,
    ticketPrice: 1500,
    image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=80&w=800',
  },
  {
    title: 'Global Leaders Business Summit',
    description: 'A premium gathering of CEOs, founders, and investors discussing the future of global commerce and AI integration.',
    date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
    location: 'The Ritz-Carlton, London',
    category: 'Business',
    totalSeats: 150,
    ticketPrice: 5000,
    image: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&q=80&w=800',
  },
  {
    title: 'Modern Art Expo 2024',
    description: 'Discover breathtaking contemporary and modern arts from underground and trending artists this season.',
    date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    location: 'Downtown Art Museum',
    category: 'Art',
    totalSeats: 300,
    ticketPrice: 200,
    image: 'https://images.unsplash.com/photo-1536924940846-227afb31e2a5?auto=format&fit=crop&q=80&w=800',
  },
  {
    title: 'Startup Pitch & Investor Mixer',
    description: 'Watch 25 startups pitch for seed funding. Great networking for entrepreneurs and angel investors.',
    date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    location: 'Convention Center, Miami',
    category: 'Business',
    totalSeats: 250,
    ticketPrice: 100,
    image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=800',
  },
  {
    title: 'Cloud Computing Architecture Seminar',
    description: 'A purely technical breakdown of scalable cloud solutions, multi-region routing, and serverless compute.',
    date: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000),
    location: 'Tech Hub, Seattle',
    category: 'Technology',
    totalSeats: 100,
    ticketPrice: 600,
    image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=800',
  },
];

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected');

    await User.deleteMany();
    await Event.deleteMany();
    await Booking.deleteMany();
    console.log('Cleared existing data');

    const salt = await bcrypt.genSalt(10);
    const hashedUsers = users.map(u => ({
      ...u,
      password: bcrypt.hashSync(u.password, salt),
    }));

    const createdUsers = await User.insertMany(hashedUsers);
    const adminUser = createdUsers.find(u => u.role === 'admin');
    const normalUsers = createdUsers.filter(u => u.role === 'user');
    console.log(`Created ${createdUsers.length} users`);

    const eventsWithAdmin = events.map(e => ({
      ...e,
      availableSeats: e.totalSeats,
      createdBy: adminUser._id,
    }));

    const createdEvents = await Event.insertMany(eventsWithAdmin);
    console.log(`Created ${createdEvents.length} events`);

    const bookingsData = [];
    for (const event of createdEvents) {
      const randomCount = Math.floor(Math.random() * 4) + 3;
      const shuffledUsers = [...normalUsers].sort(() => 0.5 - Math.random());
      const selectedUsers = shuffledUsers.slice(0, randomCount);

      for (const user of selectedUsers) {
        const statuses = ['pending', 'confirmed', 'cancelled'];
        const status = statuses[Math.floor(Math.random() * statuses.length)];

        let paymentStatus = 'not_paid';
        if (status === 'confirmed' && event.ticketPrice > 0) {
          paymentStatus = Math.random() > 0.1 ? 'paid' : 'not_paid';
        } else if (event.ticketPrice === 0) {
          paymentStatus = 'paid';
        }

        bookingsData.push({
          userId: user._id,
          eventId: event._id,
          status,
          paymentStatus,
          amount: event.ticketPrice,
        });

        if (status === 'confirmed') {
          event.availableSeats -= 1;
          await event.save();
        }
      }
    }

    await Booking.insertMany(bookingsData);
    console.log(`Inserted ${bookingsData.length} bookings`);

    console.log('\nDatabase seeded successfully!');
    console.log('-------------------------------------------');
    console.log('Admin Email: admin@venueflow.com');
    console.log('User Email:  user@venueflow.com');
    console.log('Password for all users: password123');
    console.log('-------------------------------------------\n');

    process.exit();
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedDatabase();
