// routes/states.js
const express = require('express');
const router = express.Router();
const State = require('../models/States'); // Mongoose model for fun facts
const statesData = require('../models/statesData.json'); // Static state data

// Helper function to look up a state by its code (case-insensitive)
const getState = (stateCode) => {
  return statesData.find((s) => s.code.toUpperCase() === stateCode.toUpperCase());
};

// Middleware: Validate state abbreviation for endpoints that include :state
// (If the state doesn’t exist in our static file, send an error.)
router.use('/:state', (req, res, next) => {
  const stateCode = req.params.state;
  if (!getState(stateCode)) {
    return res.status(400).json({ "message": "Invalid state abbreviation parameter" });
  }
  next();
});

// GET /states/ - Return all states, merging fun facts from the database (if any)
router.get('/', async (req, res) => {
  try {
    // Get all DB records for fun facts
    const dbRecords = await State.find();
    const funfactsLookup = {};
    dbRecords.forEach(record => {
      funfactsLookup[record.stateCode.toUpperCase()] = record.funfacts;
    });
    // Merge fun facts into the static data
    const mergedStates = statesData.map(state => {
      const stateObj = { ...state };
      const ff = funfactsLookup[state.code.toUpperCase()];
      if (ff) {
        stateObj.funfacts = ff;
      }
      return stateObj;
    });
    res.json(mergedStates);
  } catch (error) {
    res.status(500).json({ "message": error.message });
  }
});

// GET /states/:state - Return the state object merged with fun facts (if any)
router.get('/:state', async (req, res) => {
  const stateCode = req.params.state.toUpperCase();
  const state = getState(stateCode);
  // This middleware already ensured state exists.
  // Lookup fun facts record (if any)
  const record = await State.findOne({ stateCode: stateCode });
  const stateObj = { ...state };
  if (record && record.funfacts && record.funfacts.length > 0) {
    stateObj.funfacts = record.funfacts;
  }
  res.json(stateObj);
});

// GET /states/:state/capital - Return the capital information
router.get('/:state/capital', (req, res) => {
  const stateCode = req.params.state.toUpperCase();
  const state = getState(stateCode);
  res.json({ "state": state.state, "capital": state.capital });
});

// GET /states/:state/nickname - Return the nickname
router.get('/:state/nickname', (req, res) => {
  const state = getState(req.params.state);
  res.json({ "state": state.state, "nickname": state.nickname });
});

// GET /states/:state/population - Return the population as a string with commas
router.get('/:state/population', (req, res) => {
  const state = getState(req.params.state);
  // Convert population to a number and then to a string with commas.
  // (Assuming population is stored as a number.)
  const populationNumber = Number(state.population);
  const formattedPopulation = populationNumber.toLocaleString('en-US');
  res.json({ "state": state.state, "population": formattedPopulation });
});

// GET /states/:state/admission - Return the admission date
router.get('/:state/admission', (req, res) => {
  const state = getState(req.params.state);
  res.json({ "state": state.state, "admission": state.admission });
});

// GET /states/:state/funfact - Return a random fun fact for the state
router.get('/:state/funfact', async (req, res) => {
  const stateCode = req.params.state.toUpperCase();
  const state = getState(stateCode);
  const record = await State.findOne({ stateCode: stateCode });
  if (!record || !record.funfacts || record.funfacts.length === 0) {
    return res.status(404).json({ "message": `No Fun Facts found for ${state.state}` });
  }
  // Return a random fun fact from the array.
  const randomIndex = Math.floor(Math.random() * record.funfacts.length);
  res.json({ "funfact": record.funfacts[randomIndex] });
});

// POST /states/:state/funfact - Add an array of fun facts
router.post('/:state/funfact', async (req, res) => {
  const stateCode = req.params.state.toUpperCase();
  const state = getState(stateCode);
  const funfacts = req.body.funfacts;
  if (!funfacts) {
    return res.status(400).json({ "message": "State fun facts value required" });
  }
  if (!Array.isArray(funfacts)) {
    return res.status(400).json({ "message": "State fun facts value must be an array" });
  }
  // Find or create record
  let record = await State.findOne({ stateCode: stateCode });
  if (record) {
    record.funfacts.push(...funfacts);
  } else {
    record = new State({ stateCode: stateCode, funfacts: funfacts });
  }
  await record.save();
  res.json({ "state": state.state, "funfacts": record.funfacts });
});

// PATCH /states/:state/funfact - Update a specific fun fact
router.patch('/:state/funfact', async (req, res) => {
  const stateCode = req.params.state.toUpperCase();
  const state = getState(stateCode);
  const record = await State.findOne({ stateCode: stateCode });
  if (!record || !record.funfacts || record.funfacts.length === 0) {
    return res.status(404).json({ "message": `No Fun Facts found for ${state.state}` });
  }
  const { index, funfact } = req.body;
  if (index === undefined) {
    return res.status(400).json({ "message": "State fun fact index value required" });
  }
  if (!funfact || typeof funfact !== 'string') {
    return res.status(400).json({ "message": "State fun fact value required" });
  }
  if (index < 0 || index >= record.funfacts.length) {
    return res.status(404).json({ "message": `No Fun Fact found at that index for ${state.state}` });
  }
  record.funfacts[index] = funfact;
  await record.save();
  res.json({ "state": state.state, "funfacts": record.funfacts });
});

// DELETE /states/:state/funfact - Delete a specific fun fact
router.delete('/:state/funfact', async (req, res) => {
  const stateCode = req.params.state.toUpperCase();
  const state = getState(stateCode);
  const record = await State.findOne({ stateCode: stateCode });
  if (!record || !record.funfacts || record.funfacts.length === 0) {
    return res.status(404).json({ "message": `No Fun Facts found for ${state.state}` });
  }
  const { index } = req.body;
  if (index === undefined) {
    return res.status(400).json({ "message": "State fun fact index value required" });
  }
  if (index < 0 || index >= record.funfacts.length) {
    return res.status(404).json({ "message": `No Fun Fact found at that index for ${state.state}` });
  }
  // Remove the fun fact at the specified index
  record.funfacts.splice(index, 1);
  await record.save();
  res.json({ "state": state.state, "funfacts": record.funfacts });
});

module.exports = router;
