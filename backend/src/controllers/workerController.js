//v3
const ClockEntry = require('../models/clockEntryModel');

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
exports.createWorker = (req, res) => {
  res.json({ message: 'Worker created (placeholder)' });
};

exports.getAllWorkers = (req, res) => {
  res.json([
    { id: 1, name: 'Worker One' },
    { id: 2, name: 'Worker Two' }
  ]);
};

exports.getWorkerStatuses = (req, res) => {
  res.json([{ id: 1, status: 'active' }, { id: 2, status: 'inactive' }]);
};

exports.getWorkerById = (req, res) => {
  res.json({ id: req.params.workerId, name: 'Worker Placeholder' });
};

exports.updateWorker = (req, res) => {
  res.json({ message: `Worker ${req.params.workerId} updated (placeholder)` });
};

exports.addPayRate = (req, res) => {
  res.json({ message: `Added pay rate for worker ${req.params.workerId}` });
};

exports.getPayRatesForWorker = (req, res) => {
  res.json([{ workerId: req.params.workerId, payRate: 30 }]);
};

exports.getWorkerTimeEntries = (req, res) => {
  res.json([{ entryId: 1, hours: 8, date: '2024-01-01' }]);
};
