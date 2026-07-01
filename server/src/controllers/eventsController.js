const Event = require('../models/Eventmodel.js');

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
        if (!title || !date || !location || ticketPrice === undefined || !totalSeats) {
            return res.status(400).json({ message: 'Please provide all required fields' });
        }
        const event = await Event.create({
            title,
            description,
            category,
            image,
            date,
            location,
            ticketPrice,
            totalSeats,
            availableSeats: totalSeats,
            createdBy: req.user.id,
        });
        res.status(201).json(event);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

exports.updateEvent = async (req, res) => {
    try {
        const event = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!event) return res.status(404).json({ message: 'Event not found' });
        res.json(event);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

exports.deleteEvent = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) return res.status(404).json({ message: 'Event not found' });
        await Event.findByIdAndDelete(req.params.id);
        res.json({ message: 'Event deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};
