const ClockEntry = require('../models/clockEntryModel');

exports.getWorkerTimeEntries = async (req, res) => {
  try {
    const timeEntries = await ClockEntry.findByWorkerId(req.params.workerId, req.query);
    res.status(200).json(timeEntries);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching time entries', error: error.message });
  }
};
