# VenueFlow

VenueFlow is a full-stack event booking platform built with the MERN stack. Users can browse events, register an account, verify it through email OTP, and book tickets — also confirmed with an OTP step. Admins get a separate dashboard to create/manage events and approve bookings.

I built this to practice putting together a complete auth flow (JWT + email OTP) alongside a real booking system with seat tracking, instead of just another CRUD todo app.

## Features

- User registration and login with JWT-based auth
- Email OTP verification on signup (via Nodemailer)
- OTP-verified event booking flow — you request an OTP, confirm it, and your booking is created as `pending`
- Admin approval step that confirms a booking and decrements available seats
- Event browsing with search by title
- User dashboard to view/cancel your own bookings
- Admin dashboard to create, edit, delete events and manage bookings
- Booking confirmation email sent once admin approves

## Tech Stack

**Frontend**
- React 18 + Vite
- React Router
- Tailwind CSS
- Axios

**Backend**
- Node.js + Express 5
- MongoDB with Mongoose
- JWT for auth
- bcryptjs for password hashing
- Nodemailer for OTP and booking emails

## Project Structure

```
VenueFlow-Project/
├── client/               # React frontend (Vite)
│   └── src/
│       ├── components/   # Navbar, etc.
│       ├── context/      # AuthContext
│       ├── pages/        # Home, EventDetail, Login, Register,
│       │                 # UserDashboard, AdminDashboard, Payment pages
│       └── utils/        # axios instance
└── server/               # Express backend
    ├── src/
    │   ├── config/       # MongoDB connection
    │   ├── controllers/  # auth, events, bookings
    │   ├── middleware/   # JWT auth + admin guard
    │   ├── models/       # User, Event, Booking, OTP
    │   ├── routes/
    │   └── utils/        # email sending
    └── seed.js           # seeds demo users + events
```

## Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- A MongoDB database (local or Atlas)
- An SMTP account for sending emails (Gmail app password works fine for testing)

### 1. Clone the repo
```bash
git clone https://github.com/TusharNagpal-1/VenueFlow-Project.git
cd VenueFlow-Project
```

### 2. Set up the backend
```bash
cd server
npm install
```

Create a `.env` file in `server/` based on `.env.example`:
```
PORT=5000
MONGO_URI=your_mongodb_connection_string
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
JWT_SECRET=your_jwt_secret_key
```

Run the server:
```bash
npm run dev
```

Optionally seed the database with demo users and events:
```bash
npm run seed
```

### 3. Set up the frontend
```bash
cd ../client
npm install
npm run dev
```

The client runs on Vite's default port (usually `http://localhost:5173`) and the API on `http://localhost:5000`.

## Demo Accounts

If you run the seed script, these accounts are available:

| Role  | Email                  | Password      |
|-------|-------------------------|----------------|
| Admin | admin@venueflow.com     | password123    |
| User  | user@venueflow.com      | password123    |

## API Overview

**Auth**
- `POST /api/auth/register` — create account, sends OTP
- `POST /api/auth/login` — login (blocked until verified)
- `POST /api/auth/verify-otp` — verify account with OTP

**Events**
- `GET /api/events` — list events (supports `?search=`)
- `GET /api/events/:id` — event details
- `POST /api/events` — create event (admin only)
- `PUT /api/events/:id` — update event (admin only)
- `DELETE /api/events/:id` — delete event (admin only)

**Bookings**
- `POST /api/bookings/send-otp` — request booking OTP
- `POST /api/bookings` — create booking with OTP
- `GET /api/bookings/my` — get current user's bookings (or all, if admin)
- `PUT /api/bookings/:id/confirm` — confirm booking (admin only)
- `DELETE /api/bookings/:id` — cancel booking


## 🚀 Future Enhancements

- 💳 Integrate a production-ready payment gateway (Stripe or Razorpay).
- 🔔 Add real-time booking notifications using Socket.IO.
- 🎟️ Generate QR code-based tickets for event check-in.
- 📊 Build an advanced analytics dashboard for organizers.
- ⚡ Improve performance with Redis caching and rate limiting.
- 🐳 Add Docker support and CI/CD for streamlined deployment.
 
## 📄 License

This project is licensed under the **MIT License**.

You are free to use, modify, and distribute this project in accordance with the terms of the MIT License.


