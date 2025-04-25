require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const statesRoutes = require('./routes/states');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// GET / - Root endpoint returns an HTML document.
app.get('/', (req, res) => {
  res.send(`<!DOCTYPE html>
<html>
  <head>
    <title>Final Project</title>
    <style>
      html, body { margin: 0; padding: 0; }
      body {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100vh;
        font-family: Arial, sans-serif;
        background-color: #f0f0f0;
      }
      h1 { font-size: 4rem; color: #333; }
    </style>
  </head>
  <body>
    <h1>Final Project</h1>
  </body>
</html>`);
});

// Mount the states router under /states.
app.use('/states', statesRoutes);

// Catch-all GET for unknown endpoints: returns a 404 HTML document.
app.use((req, res, next) => {
  if (req.method === 'GET') {
    res.status(404).send(`<!DOCTYPE html>
<html>
  <head>
    <title>404 Not Found</title>
    <style>
      html, body {
        margin: 0; padding: 0;
        height: 100vh;
        display: flex;
        justify-content: center;
        align-items: center;
        font-family: Arial, sans-serif;
        background-color: #f0f0f0;
      }
      h1 { font-size: 4rem; color: #333; }
    </style>
  </head>
  <body>
    <h1>404 Not Found</h1>
  </body>
</html>`);
  } else {
    next();
  }
});

// Connect to MongoDB.
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.DATABASE_URI);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    process.exit(1);
  }
};

const PORT = process.env.PORT || 3000;
connectDB().then(() => {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});
