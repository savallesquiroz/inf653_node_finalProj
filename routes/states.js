const express = require('express');
const State = require('../models/States');                // Mongoose Model
const statesData = require('../models/statesData.json');    // Static states data
const verifyStates = require('../middleware/verifyStates'); // Middleware

const router = express.Router();

// GET /states/ - Return all state data
router.get('/', async (req, res) => {
  const { contig } = req.query;
  let filteredStates = statesData;

  if (contig === 'true') {
    filteredStates = statesData.filter(state => state.code !== 'AK' && state.code !== 'HI');
  } else if (contig === 'false') {
    filteredStates = statesData.filter(state => state.code === 'AK' || state.code === 'HI');
  }

  // Attach fun facts from MongoDB (if any)
  for (const state of filteredStates) {
    const stateDoc = await State.findOne({ stateCode: state.code }).exec();
    if (stateDoc) {
      state.funfacts = stateDoc.funfacts;
    }
  }
  res.json(filteredStates);
});

// --- Specific routes with extra path segments ---
// GET /states/:state/funfact - Return a random fun fact for a specific state
router.get('/:state/funfact', verifyStates, async (req, res) => {
  const stateCode = req.stateCode;
  const stateDoc = await State.findOne({ stateCode }).exec();

  if (!stateDoc || stateDoc.funfacts.length === 0) {
    return res.json({ message: `No fun facts found for ${stateCode}` });
  }

  const randomIndex = Math.floor(Math.random() * stateDoc.funfacts.length);
  const randomFunFact = stateDoc.funfacts[randomIndex];
  res.json({ funfact: randomFunFact });
});

// GET /states/:state/capital - Return state capital
router.get('/:state/capital', verifyStates, (req, res) => {
  const stateCode = req.stateCode;
  const stateData = statesData.find(state => state.code === stateCode);
  res.json({
    state: stateData.state,
    capital: stateData.capital_city
  });
});

// GET /states/:state/nickname - Return state nickname
router.get('/:state/nickname', verifyStates, (req, res) => {
  const stateCode = req.stateCode;
  const stateData = statesData.find(state => state.code === stateCode);
  res.json({
    state: stateData.state,
    nickname: stateData.nickname
  });
});

// GET /states/:state/population - Return state population
router.get('/:state/population', verifyStates, (req, res) => {
  const stateCode = req.stateCode;
  const stateData = statesData.find(state => state.code === stateCode);
  res.json({
    state: stateData.state,
    population: stateData.population
  });
});

// GET /states/:state/admission - Return state admission date
router.get('/:state/admission', verifyStates, (req, res) => {
  const stateCode = req.stateCode;
  const stateData = statesData.find(state => state.code === stateCode);
  res.json({
    state: stateData.state,
    admitted: stateData.admission_date
  });
});

// --- Generic route ---
// GET /states/:state - Return all data for a specific state
router.get('/:state', verifyStates, async (req, res) => {
  const stateCode = req.stateCode;
  const stateData = statesData.find(state => state.code === stateCode);
  const stateDoc = await State.findOne({ stateCode }).exec();
  if (stateDoc) {
    stateData.funfacts = stateDoc.funfacts;
  }
  res.json(stateData);
});

// --- Fun facts modification routes ---
// POST /states/:state/funfact - Add fun facts for a specific state
router.post('/:state/funfact', verifyStates, async (req, res) => {
  const stateCode = req.stateCode;
  const { funfacts } = req.body;
  if (!funfacts || !Array.isArray(funfacts)) {
    return res.status(400).json({ message: "State fun facts must be an array." });
  }
  try {
    let stateDoc = await State.findOne({ stateCode }).exec();
    if (!stateDoc) {
      stateDoc = await State.create({ stateCode, funfacts });
    } else {
      stateDoc.funfacts.push(...funfacts);
      await stateDoc.save();
    }
    res.status(201).json(stateDoc);
  } catch (error) {
    res.status(500).json({ message: "Failed to add fun facts.", error });
  }
});

// PATCH /states/:state/funfact - Update a fun fact by its index
router.patch('/:state/funfact', verifyStates, async (req, res) => {
  const stateCode = req.stateCode;
  const { index, funfact } = req.body;
  if (!index || !funfact) {
    return res.status(400).json({ message: "State fun fact index and funfact are required." });
  }
  try {
    const stateDoc = await State.findOne({ stateCode }).exec();
    if (!stateDoc || stateDoc.funfacts.length < index || index < 1) {
      return res.status(400).json({ message: "No fun fact found at that index." });
    }
    stateDoc.funfacts[index - 1] = funfact; // Adjust because index is 1-based
    await stateDoc.save();
    res.json(stateDoc);
  } catch (error) {
    res.status(500).json({ message: "Failed to update fun fact.", error });
  }
});

// DELETE /states/:state/funfact - Delete a fun fact by its index
router.delete('/:state/funfact', verifyStates, async (req, res) => {
  const stateCode = req.stateCode;
  const { index } = req.body;
  if (!index) {
    return res.status(400).json({ message: "State fun fact index is required." });
  }
  try {
    const stateDoc = await State.findOne({ stateCode }).exec();
    if (!stateDoc || stateDoc.funfacts.length < index || index < 1) {
      return res.status(400).json({ message: "No fun fact found at that index." });
    }
    stateDoc.funfacts.splice(index - 1, 1); // Adjust index
    await stateDoc.save();
    res.json(stateDoc);
  } catch (error) {
    res.status(500).json({ message: "Failed to delete fun fact.", error });
  }
});

module.exports = router;
