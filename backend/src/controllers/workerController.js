//v5 06/03/25 13:38 copilot gpt
const ClockEntry = require('../models/clockEntryModel');
const PayRate = require('../models/payRateModel');

exports.getWorkerTimeEntries = async (req, res) => {
  try {
    const timeEntries = await ClockEntry.findByWorkerId(req.params.workerId, req.query);
    res.status(200).json(timeEntries);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching time entries', error: error.message });
  }
};

exports.getWorkerStatuses = async (req, res) => {
  try {
    const statuses = await ClockEntry.getCurrentStatuses();
    res.status(200).json(statuses);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching worker statuses', error: error.message });
  }
};

exports.getWorkerPayRates = async (req, res) => {
  try {
    const rates = await PayRate.findByWorkerId(req.params.workerId);
    res.status(200).json(rates);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching pay rates', error: error.message });
  }
};
