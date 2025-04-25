require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const statesRoutes = require('./routes/states'); // Make sure this file exists and exports your router

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Homepage route for "/"
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Final Project</title>
        <style>
          html, body {
            margin: 0;
            padding: 0;
            height: 100%;
          }
          body {
            display: flex;
            justify-content: center;
            align-items: center;
            background-color: #f0f0f0;
            font-family: Arial, sans-serif;
          }
          h1 {
            font-size: 5rem;
            color: #333;
          }
        </style>
      </head>
      <body>
        <h1>Final Project</h1>
      </body>
    </html>
  `);
});

// Mount API routes under "/states"
app.use('/states', statesRoutes);

// Catch-all middleware for GET requests that weren't handled above.
// This avoids using a route string like "*" that causes issues with path-to-regexp.
app.use((req, res, next) => {
  if (req.method === 'GET') {
    res.status(404).send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>404 Not Found</title>
          <style>
            html, body {
              margin: 0;
              padding: 0;
              height: 100%;
              display: flex;
              justify-content: center;
              align-items: center;
              font-family: Arial, sans-serif;
            }
            h1 {
              font-size: 5rem;
              color: #333;
            }
          </style>
        </head>
        <body>
          <h1>404 Not Found</h1>
        </body>
      </html>
    `);
  } else {
    next();
  }
});

// MongoDB connection function
const connectDB = async () => {
  try {
    // The deprecated options are omitted since MongoDB Node.js Driver 4+ uses the recommended defaults.
    await mongoose.connect(process.env.DATABASE_URI);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    process.exit(1);
  }
};

const PORT = process.env.PORT || 3000;

// Connect to MongoDB and start the server
connectDB().then(() => {
  app.listen(PORT, () =>
    console.log(`Server running on port ${PORT}`)
  );
});
