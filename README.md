# Final Project: US States API

## Overview

This project is a Node.js API built with Express and MongoDB that provides detailed information about US states. The application uses a static JSON file for state data and integrates fun facts stored in a MongoDB database. Users can retrieve state details, add fun facts, update them, and remove them using various API endpoints. All endpoints properly handle error cases, enforce case-insensitive state codes, and use 1-indexed values for fun fact modifications.

## Features

- **Root Endpoint:**  
  Displays an HTML page with the title "Final Project".

- **States Information:**  
  - Returns data for all 50 US states merged with any stored fun facts.
  - Supports filtering by contiguous states using the query parameter `contig` (e.g., `contig=true` returns 48 states, excluding AK and HI; `contig=false` returns just non‑contiguous states – AK & HI).

- **Individual State Endpoints:**  
  - Retrieve a state's full data.
  - Get specific properties like capital, nickname, population (formatted with commas), and admission date (returned as `admitted`).

- **Fun Facts Endpoints:**  
  - **GET:** Retrieve a random fun fact.
  - **POST:** Add new fun facts (via an array) without overwriting pre‑existing facts.
  - **PATCH:** Update a fun fact by specifying a 1‑indexed position and the new fun fact text.
  - **DELETE:** Remove a fun fact by specifying the 1‑indexed position.

- **Error Handling:**  
  - Invalid state codes return an error message.
  - Missing or invalid request data results in informative error responses.

## Technologies Used

- Node.js
- Express
- MongoDB (Mongoose)
- CORS
- JSON (for static state data)

## Installation

1. **Clone the Repository**

   ```bash
   git clone <repository_url>
   cd <repository_folder>
