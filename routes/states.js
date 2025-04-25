const express = require('express');
const router = express.Router();
const StateModel = require('../models/States');
const statesData = require('../models/statesData.json');

// Helper: get a state object from static data by code (case-insensitive)
const getState = code =>
  statesData.find(s => s.code.toUpperCase() === code.toUpperCase());

// Helper: returns a merged state object for fun fact responses
async function getMergedState(stateCode) {
  const state = getState(stateCode);
  const record = await StateModel.findOne({ stateCode: state.code.toUpperCase() });
  return {
    state: state.state,
    code: state.code,
    capital: state.capital_city,
    funfacts: record && record.funfacts ? record.funfacts : []
  };
}

// Middleware: validate :state for all routes with that param
router.use('/:state', (req, res, next) => {
  if (!getState(req.params.state)) {
    return res.status(400).json({ message: "Invalid state abbreviation parameter" });
  }
  next();
});

// GET /states/ - all states, optionally filtered by contig
router.get('/', async (req, res) => {
  let data = statesData.slice();
  if (req.query.contig) {
    const c = req.query.contig.toLowerCase();
    if (c === 'true') {
      data = data.filter(s => s.code !== 'AK' && s.code !== 'HI');
    } else if (c === 'false') {
      data = data.filter(s => s.code === 'AK' || s.code === 'HI');
    }
  }
  const dbRecords = await StateModel.find();
  const lookup = {};
  dbRecords.forEach(rec => {
    lookup[rec.stateCode.toUpperCase()] = rec.funfacts;
  });
  const merged = data.map(s => {
    const obj = { ...s };
    if (lookup[s.code.toUpperCase()]) obj.funfacts = lookup[s.code.toUpperCase()];
    return obj;
  });
  res.json(merged);
});

// GET /states/:state/capital
router.get('/:state/capital', (req, res) => {
  const s = getState(req.params.state);
  res.json({ state: s.state, capital: s.capital_city });
});

// GET /states/:state/admission
router.get('/:state/admission', (req, res) => {
  const s = getState(req.params.state);
  res.json({ state: s.state, admitted: s.admission_date });
});

// GET /states/:state/nickname
router.get('/:state/nickname', (req, res) => {
  const s = getState(req.params.state);
  res.json({ state: s.state, nickname: s.nickname });
});

// GET /states/:state/population
router.get('/:state/population', (req, res) => {
  const s = getState(req.params.state);
  const population = Number(s.population).toLocaleString('en-US');
  res.json({ state: s.state, population });
});

// GET /states/:state/funfact - random fun fact or 404
router.get('/:state/funfact', async (req, res) => {
  const s = getState(req.params.state);
  const rec = await StateModel.findOne({ stateCode: s.code.toUpperCase() });
  if (!rec || !rec.funfacts || rec.funfacts.length === 0) {
    return res.status(404).json({ message: `No Fun Facts found for ${s.state}` });
  }
  const idx = Math.floor(Math.random() * rec.funfacts.length);
  res.json({ funfact: rec.funfacts[idx] });
});

// POST /states/:state/funfact - add fun facts
router.post('/:state/funfact', async (req, res) => {
  const s = getState(req.params.state);
  const funfacts = req.body.funfacts;
  if (!funfacts) {
    return res.status(400).json({ message: "State fun facts value required" });
  }
  if (!Array.isArray(funfacts)) {
    return res.status(400).json({ message: "State fun facts value must be an array" });
  }
  let rec = await StateModel.findOne({ stateCode: s.code.toUpperCase() });
  if (rec) {
    rec.funfacts.push(...funfacts);
  } else {
    rec = new StateModel({ stateCode: s.code.toUpperCase(), funfacts });
  }
  await rec.save();
  const merged = await getMergedState(s.code);
  res.json(merged);
});

// PATCH /states/:state/funfact - update fun fact by 1-based index
router.patch('/:state/funfact', async (req, res) => {
  const s = getState(req.params.state);
  const { index, funfact } = req.body;
  if (index === undefined) {
    return res.status(400).json({ message: "State fun fact index value required" });
  }
  if (!funfact || typeof funfact !== 'string') {
    return res.status(400).json({ message: "State fun fact value required" });
  }
  const rec = await StateModel.findOne({ stateCode: s.code.toUpperCase() });
  if (!rec || !rec.funfacts || rec.funfacts.length === 0) {
    return res.status(404).json({ message: `No Fun Facts found for ${s.state}` });
  }
  const zeroIdx = index - 1;
  if (zeroIdx < 0 || zeroIdx >= rec.funfacts.length) {
    return res.status(404).json({ message: `No Fun Fact found at that index for ${s.state}` });
  }
  rec.funfacts[zeroIdx] = funfact;
  await rec.save();
  const merged = await getMergedState(s.code);
  res.json(merged);
});

// DELETE /states/:state/funfact - delete fun fact by 1-based index
router.delete('/:state/funfact', async (req, res) => {
  const s = getState(req.params.state);
  const { index } = req.body;
  if (index === undefined) {
    return res.status(400).json({ message: "State fun fact index value required" });
  }
  const rec = await StateModel.findOne({ stateCode: s.code.toUpperCase() });
  if (!rec || !rec.funfacts || rec.funfacts.length === 0) {
    return res.status(404).json({ message: `No Fun Facts found for ${s.state}` });
  }
  const zeroIdx = index - 1;
  if (zeroIdx < 0 || zeroIdx >= rec.funfacts.length) {
    return res.status(404).json({ message: `No Fun Fact found at that index for ${s.state}` });
  }
  rec.funfacts.splice(zeroIdx, 1);
  await rec.save();
  const merged = await getMergedState(s.code);
  res.json(merged);
});

// Generic GET /states/:state - all data + funfacts
router.get('/:state', async (req, res) => {
  const s = getState(req.params.state);
  const rec = await StateModel.findOne({ stateCode: s.code.toUpperCase() });
  const merged = { ...s };
  if (rec && rec.funfacts && rec.funfacts.length > 0) {
    merged.funfacts = rec.funfacts;
  }
  res.json(merged);
});

module.exports = router;
