const statesData = require('../models/statesData.json');

const verifyStates = (req, res, next) => {
  const stateCode = req.params.state?.toUpperCase();
  const validStateCodes = statesData.map(state => state.code);
  if (!validStateCodes.includes(stateCode)) {
    return res.status(400).json({ error: 'Invalid state abbreviation' });
  }
  req.stateCode = stateCode;
  next();
};

module.exports = verifyStates;
