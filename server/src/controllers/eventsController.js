const Event = require('../models/Eventmodel.js');
const Booking = require('../models/Bookingmodel.js');
const mongoose = require('mongoose');

const isValidId = (id) => mongoose.isValidObjectId(id);

exports.getEvents = async (req, res) => {
    try {
        const { search } = req.query;
        let filter = {};
        if (search) {
            filter.title = { $regex: search, $options: 'i' };
        }
        const events = await Event.find(filter).populate('createdBy', 'username').sort({ createdAt: -1 });
        res.json(events);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

exports.getEventById = async (req, res) => {
    try {
        if (!isValidId(req.params.id)) {
            return res.status(400).json({ message: 'Invalid event id' });
        }
        const event = await Event.findById(req.params.id).populate('createdBy', 'username');
        if (!event) return res.status(404).json({ message: 'Event not found' });
        res.json(event);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

exports.createEvent = async (req, res) => {
    try {
        const { title, description, category, image, date, location, ticketPrice, totalSeats } = req.body;
        if (!title || !date || !location || ticketPrice === undefined || totalSeats === undefined) {
            return res.status(400).json({ message: 'Please provide all required fields' });
        }
        if (Number(totalSeats) <= 0) {
            return res.status(400).json({ message: 'Total seats must be greater than 0' });
        }
        if (Number(ticketPrice) < 0) {
            return res.status(400).json({ message: 'Ticket price cannot be negative' });
        }
        if (new Date(date) <= new Date()) {
            return res.status(400).json({ message: 'Event date must be in the future' });
        }
        const event = await Event.create({
            title,
            description,
            category,
            image,
            date,
            location,
            ticketPrice: Number(ticketPrice),
            totalSeats: Number(totalSeats),
            availableSeats: Number(totalSeats),
            createdBy: req.user.id,
        });
        res.status(201).json(event);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

exports.updateEvent = async (req, res) => {
    try {
        if (!isValidId(req.params.id)) {
            return res.status(400).json({ message: 'Invalid event id' });
        }

        const event = await Event.findById(req.params.id);
        if (!event) return res.status(404).json({ message: 'Event not found' });

        const updates = { ...req.body };

        if (updates.totalSeats !== undefined) {
            const totalSeats = Number(updates.totalSeats);
            if (totalSeats <= 0) {
                return res.status(400).json({ message: 'Total seats must be greater than 0' });
            }
            const booked = event.totalSeats - event.availableSeats;
            if (totalSeats < booked) {
                return res.status(400).json({ message: `Total seats cannot be less than ${booked} already-booked seats` });
            }
            updates.availableSeats = totalSeats - booked;
            updates.totalSeats = totalSeats;
        }

        if (updates.ticketPrice !== undefined) {
            updates.ticketPrice = Number(updates.ticketPrice);
            if (updates.ticketPrice < 0) {
                return res.status(400).json({ message: 'Ticket price cannot be negative' });
            }
        }

        if (updates.date !== undefined && new Date(updates.date) <= new Date()) {
            return res.status(400).json({ message: 'Event date must be in the future' });
        }

        const updated = await Event.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
        res.json(updated);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

exports.deleteEvent = async (req, res) => {
    try {
        if (!isValidId(req.params.id)) {
            return res.status(400).json({ message: 'Invalid event id' });
        }
        const event = await Event.findById(req.params.id);
        if (!event) return res.status(404).json({ message: 'Event not found' });
        await Event.findByIdAndDelete(req.params.id);
        await Booking.deleteMany({ eventId: req.params.id });
        res.json({ message: 'Event deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};
