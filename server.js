require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const verifyStates = require('./middleware/verifyStates');
const statesRoutes = require('./routes/states');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/states', statesRoutes);

// MongoDB connection function
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.DATABASE_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('Connected to MongoDB');
    } catch (error) {
        console.error('Failed to connect to MongoDB:', error);
        process.exit(1);
    }
};

// Start server and connect to MongoDB
const PORT = process.env.PORT || 3000;
connectDB().then(() => {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});
