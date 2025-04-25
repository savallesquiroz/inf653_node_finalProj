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

// Add the homepage route for "/"
app.get('/', (req, res) => {
    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Final Project</title>
          <style>
            /* Remove margins and ensure full height */
            html, body {
              margin: 0;
              padding: 0;
              height: 100%;
            }
            /* Center the content both vertically and horizontally */
            body {
              display: flex;
              justify-content: center;
              align-items: center;
              background-color: #f0f0f0; /* Optional: a light background */
              font-family: Arial, sans-serif;
            }
            /* Style the heading */
            h1 {
              font-size: 5rem;   /* Adjust size as needed */
              color: #333;       /* Choose your desired color */
            }
          </style>
        </head>
        <body>
          <h1>Final Project</h1>
        </body>
      </html>
    `);
  });
  

// Routes for the API
app.use('/states', statesRoutes);

// MongoDB connection function
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.DATABASE_URI); // Deprecated options removed since they're now defaults
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
